const fs = require('fs');
const path = require('path');

// Kullanıcının package.json dosyasının yolu
const userPackageJsonPath = path.join(process.cwd(), 'package.json');

// Kullanıcının package.json dosyasını oku
let userPackageJson;
try {
  userPackageJson = require(userPackageJsonPath);
} catch (error) {
  console.error('package.json dosyası bulunamadı veya okunamadı.');
  process.exit(1);
}

// create-integrator script'ini ekle
if (!userPackageJson.scripts) {
  userPackageJson.scripts = {};
}

if (!userPackageJson.scripts['create-integrator']) {
  userPackageJson.scripts['create-integrator'] = 'node node_modules/api-form-integrator/scripts/create-integrator.js';
  console.log('create-integrator script\'i package.json dosyasına eklendi.');
} else {
  console.log('create-integrator script\'i zaten package.json dosyasında mevcut.');
}

// Güncellenmiş package.json dosyasını kaydet
fs.writeFileSync(userPackageJsonPath, JSON.stringify(userPackageJson, null, 2));