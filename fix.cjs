const fs = require('fs');
let code = fs.readFileSync('src/components/CategoryDetailPage.tsx', 'utf8');
code = code.replace(
  '    }\n        } else {\n      list.sort((a, b) => {',
  '    } else {\n      list.sort((a, b) => {'
);
fs.writeFileSync('src/components/CategoryDetailPage.tsx', code);
