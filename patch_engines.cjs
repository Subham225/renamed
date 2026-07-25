const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.engines = { node: ">=22.12.0" };
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
