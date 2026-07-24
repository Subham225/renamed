const fs = require('fs');
let code = fs.readFileSync('src/components/CategoryDetailPage.tsx', 'utf8');
code = code.replace(
  '      });\n    }\n        } else {\n      list.sort((a, b) => {\n        if (!randomOrderMap.has(a.id)) randomOrderMap.set(a.id, Math.random());\n        if (!randomOrderMap.has(b.id)) randomOrderMap.set(b.id, Math.random());\n        return randomOrderMap.get(a.id)! - randomOrderMap.get(b.id)!;\n      });\n    }',
  '      });\n    } else {\n      list.sort((a, b) => {\n        if (!randomOrderMap.has(a.id)) randomOrderMap.set(a.id, Math.random());\n        if (!randomOrderMap.has(b.id)) randomOrderMap.set(b.id, Math.random());\n        return randomOrderMap.get(a.id)! - randomOrderMap.get(b.id)!;\n      });\n    }'
);
fs.writeFileSync('src/components/CategoryDetailPage.tsx', code);
