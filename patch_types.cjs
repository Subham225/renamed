const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  /cakeSubcategories: StoreConfigItem\[\];/,
  `cakeSubcategories: StoreConfigItem[];
  flowerSubcategories?: StoreConfigItem[];
  plantSubcategories?: StoreConfigItem[];
  chocolateSubcategories?: StoreConfigItem[];
  anniversarySubcategories?: StoreConfigItem[];
  personalizedSubcategories?: StoreConfigItem[];`
);

fs.writeFileSync('src/types.ts', code);
console.log("Patched types.ts");
