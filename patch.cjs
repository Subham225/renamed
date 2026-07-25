const fs = require('fs');
let code = fs.readFileSync('src/components/CategoryDetailPage.tsx', 'utf8');

if (!code.includes('const [randomOrderMap]')) {
  code = code.replace(
    'const [searchQuery, setSearchQuery] = useState("");',
    'const [searchQuery, setSearchQuery] = useState("");\n  const [randomOrderMap] = useState(() => new Map<string, number>());'
  );
  
  code = code.replace(
    'return list;\n  }, [products, categoryId, searchQuery, sortBy]);',
    `    } else {\n      list.sort((a, b) => {\n        if (!randomOrderMap.has(a.id)) randomOrderMap.set(a.id, Math.random());\n        if (!randomOrderMap.has(b.id)) randomOrderMap.set(b.id, Math.random());\n        return randomOrderMap.get(a.id)! - randomOrderMap.get(b.id)!;\n      });\n    }\n\n    return list;\n  }, [products, categoryId, searchQuery, sortBy, randomOrderMap]);`
  );
  fs.writeFileSync('src/components/CategoryDetailPage.tsx', code);
  console.log("Patched CategoryDetailPage.tsx");
} else {
  console.log("Already patched CategoryDetailPage.tsx");
}

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes('const [appRandomOrderMap]')) {
  appCode = appCode.replace(
    'const [searchQuery, setSearchQuery] = useState("");',
    'const [searchQuery, setSearchQuery] = useState("");\n  const [appRandomOrderMap] = useState(() => new Map<string, number>());'
  );
  
  appCode = appCode.replace(
    'return true;\n    });\n  }, [selectedCategory, searchQuery, productsCatalog]);',
    `return true;\n    });\n\n    if (!searchQuery.trim()) {\n      list.sort((a, b) => {\n        if (!appRandomOrderMap.has(a.id)) appRandomOrderMap.set(a.id, Math.random());\n        if (!appRandomOrderMap.has(b.id)) appRandomOrderMap.set(b.id, Math.random());\n        return appRandomOrderMap.get(a.id)! - appRandomOrderMap.get(b.id)!;\n      });\n    }\n    return list;\n  }, [selectedCategory, searchQuery, productsCatalog, appRandomOrderMap]);`
  );
  
  appCode = appCode.replace(
    'return visibleProductsCatalog.filter((prod) => {',
    'let list = visibleProductsCatalog.filter((prod) => {'
  );

  fs.writeFileSync('src/App.tsx', appCode);
  console.log("Patched App.tsx");
} else {
  console.log("Already patched App.tsx");
}
