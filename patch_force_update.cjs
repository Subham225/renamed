const fs = require('fs');
let code = fs.readFileSync('src/services/dbService.ts', 'utf8');

code = code.replace(
  /if \(!existingIds\.has\(prod\.id\)\) \{/,
  `if (!existingIds.has(prod.id) || prod.id === 'free_test_item') {`
);

// Bump version to 4
code = code.replace(/metaSnap\.data\(\)\?\.version >= 3/g, "metaSnap.data()?.version >= 4");
code = code.replace(/version: 3/g, "version: 4");
code = code.replace(/v3 update/g, "v4 update");
code = code.replace(/\(v3\)/g, "(v4)");

fs.writeFileSync('src/services/dbService.ts', code);
console.log("Patched to force update free_test_item");
