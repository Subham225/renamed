const fs = require('fs');

let code = fs.readFileSync('src/services/dbService.ts', 'utf8');

code = code.replace(/metaSnap\.data\(\)\?\.version >= 2/g, "metaSnap.data()?.version >= 3");
code = code.replace(/version: 2/g, "version: 3");
code = code.replace(/v2 update/g, "v3 update");
code = code.replace(/\(v2\)/g, "(v3)");

fs.writeFileSync('src/services/dbService.ts', code);
console.log("Patched dbService version");
