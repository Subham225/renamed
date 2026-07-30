const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
pkg.compilerOptions.esModuleInterop = true;
fs.writeFileSync('tsconfig.json', JSON.stringify(pkg, null, 2));
