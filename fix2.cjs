const fs = require('fs');
let code = fs.readFileSync('src/components/CategoryDetailPage.tsx', 'utf8');
code = code.replace(
  '        return 0;\n      });\n    }\n        } else {\n      list.sort((a, b) => {',
  '        return 0;\n      });\n    } else {\n      list.sort((a, b) => {'
);
fs.writeFileSync('src/components/CategoryDetailPage.tsx', code);
