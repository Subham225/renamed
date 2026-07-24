const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('const [appRandomOrderMap]')) {
  code = code.replace(
    'const [searchQuery, setSearchQuery] = useState("");',
    'const [searchQuery, setSearchQuery] = useState("");\n  const [appRandomOrderMap] = useState(() => new Map<string, number>());'
  );
  
  code = code.replace(
    'return true;\n    });\n  }, [selectedCategory, searchQuery, productsCatalog]);',
    `return true;\n    });\n\n    if (!searchQuery.trim()) {\n      list.sort((a, b) => {\n        if (!appRandomOrderMap.has(a.id)) appRandomOrderMap.set(a.id, Math.random());\n        if (!appRandomOrderMap.has(b.id)) appRandomOrderMap.set(b.id, Math.random());\n        return appRandomOrderMap.get(a.id)! - appRandomOrderMap.get(b.id)!;\n      });\n    }\n    return list;\n  }, [selectedCategory, searchQuery, productsCatalog, appRandomOrderMap]);`
  );
  
  // Also we need to change the filteredProducts declaration to use "let list = visibleProductsCatalog.filter..."
  code = code.replace(
    'return visibleProductsCatalog.filter((prod) => {',
    'let list = visibleProductsCatalog.filter((prod) => {'
  );

  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx");
} else {
  console.log("Already patched.");
}
