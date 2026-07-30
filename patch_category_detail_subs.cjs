const fs = require('fs');
let code = fs.readFileSync('src/components/CategoryDetailPage.tsx', 'utf8');

code = code.replace(
  /case 'personalized_gifts': return storeConfig\?\.giftSubcategories \|\| \[\];/,
  `case 'flowers': return storeConfig?.flowerSubcategories || [];
      case 'plants': return storeConfig?.plantSubcategories || [];
      case 'chocolates': return storeConfig?.chocolateSubcategories || [];
      case 'anniversary': return storeConfig?.anniversarySubcategories || [];
      case 'personalized_gifts': return storeConfig?.personalizedSubcategories || [];
      case 'combos':`
);

fs.writeFileSync('src/components/CategoryDetailPage.tsx', code);
console.log("Patched CategoryDetailPage.tsx subcategories");
