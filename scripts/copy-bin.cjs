const fs = require('fs-extra');
const path = require('path');

async function copyBin() {
  const source = path.join(__dirname, '../bin/create-integrator.js');
  const destDir = path.join(__dirname, '../dist/cjs/bin');
  const destFile = path.join(destDir, 'create-integrator.cjs');
  
  await fs.ensureDir(destDir);
  await fs.copyFile(source, destFile);
  console.log('✅ create-integrator.cjs dosyası başarıyla oluşturuldu');
}

copyBin().catch(console.error);