# Development CSV product import

This is a separate, create-only importer. It uses the existing Prisma schema and the CSV at `ai-service/data/kombolcha_factories_products_500.csv` by default. It does not change the existing `prisma:seed` command.

From the `backend` directory, run:

```powershell
npm run seed:products:csv:dev
```

To use another CSV file:

```powershell
npm run seed:products:csv:dev -- "C:\path\to\products.csv"
```

The backend `.env` must contain a `DATABASE_URL` for the intended development database, and the database schema must already be migrated. The script does not run migrations. It uses the project's Prisma 6 client and its existing TypeScript and `bcryptjs` dependencies.

Factories are matched by normalized factory name and categories by normalized category name, ignoring case and repeated whitespace. Missing categories are created. The Prisma schema requires each factory to have a user, but the CSV contains no account details; therefore, a new factory receives a factory-role development account with a random password and an email under the reserved `.invalid` domain. The password is not printed or saved elsewhere. New factories keep the schema's default `PENDING` approval status. Existing factory/category records are reused without edits.

Products are matched by factory, category, and normalized product name. Existing products and repeated rows are skipped without updates. New products use the CSV's `description`, `price_etb`, `stock_quantity`, and `availability` values. Only ETB and the CSV's `In Stock` / `Available` statuses are accepted; these map to the existing `AVAILABLE` status. Missing or invalid required data, zero stock paired with “In Stock”, unsupported currencies/statuses, and duplicate rows are skipped. Row level database errors are logged and included in the summary. No existing records are deleted or overwritten.

The provided CSV's `data_source_note` describes its price, stock, and rating values as modeled estimates. The importer does not import the rating or other fields absent from the Prisma product model; the supplied price and stock values are imported as-is. Review the source data before choosing a database.

The final summary reports distinct factories and categories created/reused, products imported, skipped records, and errors. Any row errors cause a nonzero exit code; skipped rows are reported but do not fail the command.
