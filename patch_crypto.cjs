const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = "import crypto from 'crypto';\n" + code;
code = code.replace(/const crypto = require\('crypto'\);\n/g, '');

fs.writeFileSync('server.ts', code);
