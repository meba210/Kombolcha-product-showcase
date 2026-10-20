/**
 * Run once to create the settlement table:
 *   node create_settlement_table.js
 */
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function run() {
  console.log('Creating settlement table if it does not exist...');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`settlement\` (
      \`settlement_id\`      INT          NOT NULL AUTO_INCREMENT,
      \`order_id\`           INT          NOT NULL,
      \`factory_id\`         INT          NULL,
      \`gross_amount\`       DOUBLE       NOT NULL,
      \`commission_rate\`    DOUBLE       NOT NULL DEFAULT 0.10,
      \`commission_amount\`  DOUBLE       NOT NULL,
      \`net_amount\`         DOUBLE       NOT NULL,
      \`settlement_status\`  VARCHAR(191) NOT NULL DEFAULT 'PENDING',
      \`created_at\`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`settlement_id\`),
      INDEX \`settlement_order_id_idx\`   (\`order_id\`),
      INDEX \`settlement_factory_id_idx\` (\`factory_id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  console.log('✓ settlement table ready');

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`settlement\`
        ADD CONSTRAINT \`settlement_order_id_fkey\`
        FOREIGN KEY (\`order_id\`) REFERENCES \`order\`(\`order_id\`)
        ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('✓ FK settlement → order added');
  } catch (e) {
    console.log('  FK settlement → order already exists (OK)');
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`settlement\`
        ADD CONSTRAINT \`settlement_factory_id_fkey\`
        FOREIGN KEY (\`factory_id\`) REFERENCES \`factory\`(\`factory_id\`)
        ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('✓ FK settlement → factory added');
  } catch (e) {
    console.log('  FK settlement → factory already exists (OK)');
  }

  await prisma.$disconnect();
  console.log('\nDone! The settlement table is ready.');
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
