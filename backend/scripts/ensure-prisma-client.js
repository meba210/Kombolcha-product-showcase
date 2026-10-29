const fs = require('fs');
const path = require('path');

const prismaClientDir = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
if (!fs.existsSync(prismaClientDir)) {
  process.exit(0);
}

for (const file of fs.readdirSync(prismaClientDir)) {
  if (file.endsWith('.tmp')) {
    const fullPath = path.join(prismaClientDir, file);
    try {
      fs.unlinkSync(fullPath);
    } catch {}
  }
}
