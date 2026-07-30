const fs = require('fs');
let code = fs.readFileSync('src/components/CategoryExplorePage.tsx', 'utf8');

code = code.replace(
  /case 'gifts':\n      case 'combos':\n        return storeConfig\?\.giftSubcategories \|\| \[\];/,
  `case 'flowers':
        return storeConfig?.flowerSubcategories || [];
      case 'plants':
        return storeConfig?.plantSubcategories || [];
      case 'chocolates':
        return storeConfig?.chocolateSubcategories || [];
      case 'anniversary':
        return storeConfig?.anniversarySubcategories || [];
      case 'personalized_gifts':
        return storeConfig?.personalizedSubcategories || [];
      case 'gifts':
      case 'combos':
        return storeConfig?.giftSubcategories || [];`
);

fs.writeFileSync('src/components/CategoryExplorePage.tsx', code);
console.log("Patched CategoryExplorePage.tsx");
