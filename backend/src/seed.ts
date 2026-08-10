import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Categories ──────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { category_name: 'Textiles' },
      update: {},
      create: { category_name: 'Textiles', description: 'Fabric, clothing, and textile products' },
    }),
    prisma.category.upsert({
      where: { category_name: 'Steel & Metal' },
      update: {},
      create: { category_name: 'Steel & Metal', description: 'Steel bars, sheets, and metal products' },
    }),
    prisma.category.upsert({
      where: { category_name: 'Food Products' },
      update: {},
      create: { category_name: 'Food Products', description: 'Processed and packaged food items' },
    }),
    prisma.category.upsert({
      where: { category_name: 'Construction Materials' },
      update: {},
      create: { category_name: 'Construction Materials', description: 'Cement, bricks, and building materials' },
    }),
    prisma.category.upsert({
      where: { category_name: 'Chemicals' },
      update: {},
      create: { category_name: 'Chemicals', description: 'Industrial chemicals and compounds' },
    }),
  ]);

  console.log('✅ Categories created');

  // ─── Admin User ───────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@showcase.com' },
    update: {},
    create: {
      full_name: 'Platform Administrator',
      email: 'admin@showcase.com',
      password: adminPassword,
      role: 'ADMIN',
      phone_number: '+251911000001',
    },
  });
  await prisma.admin.upsert({
    where: { user_id: adminUser.user_id },
    update: {},
    create: { user_id: adminUser.user_id, permission_level: 'FULL' },
  });

  // ─── Factory Users ────────────────────────────────────────────────────────────
  const factoryPassword = await bcrypt.hash('Factory@123', 12);

  const factory1User = await prisma.user.upsert({
    where: { email: 'kombolcha.textile@factory.com' },
    update: {},
    create: {
      full_name: 'Kombolcha Textile Factory',
      email: 'kombolcha.textile@factory.com',
      password: factoryPassword,
      role: 'FACTORY',
      phone_number: '+251911000002',
    },
  });
  const factory1 = await prisma.factory.upsert({
    where: { user_id: factory1User.user_id },
    update: {},
    create: {
      user_id: factory1User.user_id,
      factory_name: 'Kombolcha Textile Factory',
      location: 'Kombolcha Industrial Zone',
      approval_status: 'APPROVED',
    },
  });

  const factory2User = await prisma.user.upsert({
    where: { email: 'ethio.steel@factory.com' },
    update: {},
    create: {
      full_name: 'Ethio Steel Works',
      email: 'ethio.steel@factory.com',
      password: factoryPassword,
      role: 'FACTORY',
      phone_number: '+251911000003',
    },
  });
  const factory2 = await prisma.factory.upsert({
    where: { user_id: factory2User.user_id },
    update: {},
    create: {
      user_id: factory2User.user_id,
      factory_name: 'Ethio Steel Works',
      location: 'Kombolcha, Amhara Region',
      approval_status: 'APPROVED',
    },
  });

  // ─── Buyer User ───────────────────────────────────────────────────────────────
  const buyerPassword = await bcrypt.hash('Buyer@123', 12);
  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      full_name: 'Abebe Kebede',
      email: 'buyer@example.com',
      password: buyerPassword,
      role: 'BUYER',
      phone_number: '+251911000004',
    },
  });
  await prisma.buyer.upsert({
    where: { user_id: buyerUser.user_id },
    update: {},
    create: { user_id: buyerUser.user_id, address: 'Addis Ababa, Ethiopia' },
  });

  console.log('✅ Users created');

  // ─── Products ─────────────────────────────────────────────────────────────────
  const products = [
    {
      factory_id: factory1.factory_id,
      category_id: categories[0].category_id,
      product_name: 'Cotton Fabric Roll',
      description: 'High-quality 100% cotton fabric, 1.5m wide, suitable for garments and home textiles.',
      price: 450.00,
      stock_quantity: 200,
    },
    {
      factory_id: factory1.factory_id,
      category_id: categories[0].category_id,
      product_name: 'Polyester Blend Fabric',
      description: 'Durable polyester-cotton blend fabric, wrinkle-resistant, ideal for uniforms.',
      price: 320.00,
      stock_quantity: 150,
    },
    {
      factory_id: factory1.factory_id,
      category_id: categories[0].category_id,
      product_name: 'Traditional Ethiopian Fabric',
      description: 'Handwoven traditional Ethiopian fabric with authentic patterns, perfect for cultural wear.',
      price: 850.00,
      stock_quantity: 80,
    },
    {
      factory_id: factory2.factory_id,
      category_id: categories[1].category_id,
      product_name: 'Steel Rebar 12mm',
      description: 'High-strength deformed steel rebar, 12mm diameter, 12m length. Grade 60.',
      price: 1200.00,
      stock_quantity: 500,
    },
    {
      factory_id: factory2.factory_id,
      category_id: categories[1].category_id,
      product_name: 'Galvanized Steel Sheet',
      description: 'Zinc-coated galvanized steel sheet, 1.2mm thickness, corrosion resistant.',
      price: 2800.00,
      stock_quantity: 120,
    },
    {
      factory_id: factory2.factory_id,
      category_id: categories[1].category_id,
      product_name: 'Angle Iron 50x50mm',
      description: 'Structural angle iron, 50x50x5mm, 6m length. Used in construction and fabrication.',
      price: 680.00,
      stock_quantity: 300,
    },
    {
      factory_id: factory1.factory_id,
      category_id: categories[3].category_id,
      product_name: 'Hollow Concrete Block',
      description: 'Standard hollow concrete block, 20x20x40cm, high compressive strength.',
      price: 25.00,
      stock_quantity: 5000,
    },
    {
      factory_id: factory2.factory_id,
      category_id: categories[3].category_id,
      product_name: 'Corrugated Iron Sheet',
      description: 'Galvanized corrugated roofing sheet, 0.4mm gauge, 3m length.',
      price: 380.00,
      stock_quantity: 800,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('✅ Products created');
  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('  Admin:   admin@showcase.com / Admin@123');
  console.log('  Factory: kombolcha.textile@factory.com / Factory@123');
  console.log('  Buyer:   buyer@example.com / Buyer@123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
