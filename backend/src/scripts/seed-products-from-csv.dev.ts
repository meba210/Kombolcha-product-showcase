import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { readFile } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();
const defaultCsv = path.resolve(
  __dirname,
  '../../../ai-service/data/kombolcha_factories_products_500.csv'
);
const csvPath = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? defaultCsv;

type CsvRow = Record<string, string>;
type Summary = {
  factoriesCreated: number;
  factoriesReused: number;
  categoriesCreated: number;
  categoriesReused: number;
  productsImported: number;
  skippedRecords: number;
  errors: number;
};

const summary: Summary = {
  factoriesCreated: 0,
  factoriesReused: 0,
  categoriesCreated: 0,
  categoriesReused: 0,
  productsImported: 0,
  skippedRecords: 0,
  errors: 0,
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const input = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field.length === 0) {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error('CSV contains an unterminated quoted field.');
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim() !== '')) rows.push(row);
  }
  return rows;
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
}

function toRecords(text: string): CsvRow[] {
  const rows = parseCsv(text);
  const headers = rows.shift()?.map((header) => header.trim());
  if (!headers?.length) throw new Error('CSV has no header row.');
  if (new Set(headers).size !== headers.length) throw new Error('CSV contains duplicate column names.');

  const required = [
    'factory_name', 'location', 'category_name', 'product_name', 'description',
    'price_etb', 'currency', 'stock_quantity', 'availability',
  ];
  const missing = required.filter((column) => !headers.includes(column));
  if (missing.length) throw new Error(`CSV is missing required columns: ${missing.join(', ')}`);

  return rows.map((values, index) => {
    if (values.length !== headers.length) {
      throw new Error(`CSV row ${index + 2} has ${values.length} values; expected ${headers.length}.`);
    }
    return Object.fromEntries(headers.map((header, column) => [header, values[column].trim()]));
  });
}

function validateRow(row: CsvRow, line: number): string | null {
  const requiredFields = ['factory_name', 'location', 'category_name', 'product_name', 'description'];
  const missing = requiredFields.filter((field) => !row[field]?.trim());
  if (missing.length) return `missing required value(s): ${missing.join(', ')}`;

  if (normalize(row.currency) !== 'etb') return `unsupported or missing currency "${row.currency}"`;
  if (!row.price_etb.trim()) return 'missing price_etb';
  const price = Number(row.price_etb);
  if (!Number.isFinite(price) || price < 0) return `invalid price_etb "${row.price_etb}"`;
  if (!row.stock_quantity.trim()) return 'missing stock_quantity';
  const stock = Number(row.stock_quantity);
  if (!Number.isInteger(stock) || stock < 0) return `invalid stock_quantity "${row.stock_quantity}"`;

  const availability = normalize(row.availability);
  if (!availability) return 'missing availability';
  if (!['in stock', 'available'].includes(availability)) {
    return `unsupported availability "${row.availability}"`;
  }
  if (stock === 0) return 'availability says in stock but stock_quantity is zero';
  if (!line) return 'invalid CSV line';
  return null;
}

function devEmail(factoryName: string): string {
  const slug = normalize(factoryName)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'factory';
  return `csv-seed-${slug}@development.invalid`;
}

async function ensureFactory(
  tx: Prisma.TransactionClient,
  row: CsvRow
): Promise<{ id: number; created: boolean }> {
  const existing = await tx.factory.findMany({ select: { factory_id: true, factory_name: true } });
  const match = existing.find((factory) => normalize(factory.factory_name) === normalize(row.factory_name));
  if (match) return { id: match.factory_id, created: false };

  const email = devEmail(row.factory_name);
  const account = await tx.user.findUnique({ where: { email } });
  if (account) {
    throw new Error(`Cannot create factory "${row.factory_name}": its development account email is already in use.`);
  }

  const password = await bcrypt.hash(randomBytes(32).toString('hex'), 12);
  const user = await tx.user.create({
    data: { full_name: row.factory_name, email, password, role: 'FACTORY' },
  });
  const factory = await tx.factory.create({
    data: { user_id: user.user_id, factory_name: row.factory_name, location: row.location },
  });
  return { id: factory.factory_id, created: true };
}

async function ensureCategory(
  tx: Prisma.TransactionClient,
  categoryName: string
): Promise<{ id: number; created: boolean }> {
  const existing = await tx.category.findMany({ select: { category_id: true, category_name: true } });
  const match = existing.find((category) => normalize(category.category_name) === normalize(categoryName));
  if (match) return { id: match.category_id, created: false };
  const category = await tx.category.create({ data: { category_name: categoryName } });
  return { id: category.category_id, created: true };
}

async function importRows(rows: CsvRow[]): Promise<void> {
  const seenProducts = new Set<string>();
  const countedFactories = new Set<number>();
  const countedCategories = new Set<number>();
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const line = index + 2;
    const validationError = validateRow(row, line);
    if (validationError) {
      summary.skippedRecords += 1;
      console.warn(`[skip] CSV row ${line}: ${validationError}`);
      continue;
    }

    const duplicateKey = [normalize(row.factory_name), normalize(row.category_name), normalize(row.product_name)].join('|');
    if (seenProducts.has(duplicateKey)) {
      summary.skippedRecords += 1;
      console.warn(`[skip] CSV row ${line}: duplicate product in CSV (${row.product_name}).`);
      continue;
    }
    seenProducts.add(duplicateKey);

    try {
      const created = await prisma.$transaction(async (tx) => {
        const factory = await ensureFactory(tx, row);
        const category = await ensureCategory(tx, row.category_name);
        const products = await tx.product.findMany({
          where: { factory_id: factory.id, category_id: category.id },
          select: { product_name: true },
        });
        if (products.some((product) => normalize(product.product_name) === normalize(row.product_name))) {
          return {
            duplicate: true,
            factoryCreated: factory.created,
            factoryId: factory.id,
            categoryCreated: category.created,
            categoryId: category.id,
          };
        }

        await tx.product.create({
          data: {
            factory_id: factory.id,
            category_id: category.id,
            product_name: row.product_name,
            description: row.description,
            price: Number(row.price_etb),
            stock_quantity: Number(row.stock_quantity),
            availability_status: 'AVAILABLE',
          },
        });
        return {
          duplicate: false,
          factoryCreated: factory.created,
          factoryId: factory.id,
          categoryCreated: category.created,
          categoryId: category.id,
        };
      });

      if (!countedFactories.has(created.factoryId)) {
        countedFactories.add(created.factoryId);
        if (created.factoryCreated) summary.factoriesCreated += 1;
        else summary.factoriesReused += 1;
      }
      if (!countedCategories.has(created.categoryId)) {
        countedCategories.add(created.categoryId);
        if (created.categoryCreated) summary.categoriesCreated += 1;
        else summary.categoriesReused += 1;
      }
      if (created.duplicate) {
        summary.skippedRecords += 1;
        console.info(`[skip] CSV row ${line}: product already exists (${row.product_name}).`);
        continue;
      }
      summary.productsImported += 1;
    } catch (error) {
      summary.errors += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[error] CSV row ${line} (${row.product_name}): ${message}`);
    }
  }
}

async function main(): Promise<void> {
  console.info(`Reading CSV: ${csvPath}`);
  const rows = toRecords(await readFile(csvPath, 'utf8'));
  console.info(`Found ${rows.length} data rows.`);
  await importRows(rows);
  console.info('\nCSV import summary');
  console.info(`Factories created: ${summary.factoriesCreated}`);
  console.info(`Factories reused: ${summary.factoriesReused}`);
  console.info(`Categories created: ${summary.categoriesCreated}`);
  console.info(`Categories reused: ${summary.categoriesReused}`);
  console.info(`Products imported: ${summary.productsImported}`);
  console.info(`Skipped records: ${summary.skippedRecords}`);
  console.info(`Errors: ${summary.errors}`);
  if (summary.errors > 0) process.exitCode = 1;
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`CSV import failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
