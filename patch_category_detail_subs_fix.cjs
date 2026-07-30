const fs = require('fs');
let code = fs.readFileSync('src/components/CategoryDetailPage.tsx', 'utf8');

const regex = /const getSubcategories = \(catId: string\) => \{\n\s*switch \(catId\) \{[\s\S]*?default: return \[\];\n\s*\}\n\s*\};/;

const replacement = `  const getSubcategories = (catId: string) => {
    switch (catId) {
      case 'cakes': return storeConfig?.cakeSubcategories || [];
      case 'flowers': return storeConfig?.flowerSubcategories || [];
      case 'plants': return storeConfig?.plantSubcategories || [];
      case 'chocolates': return storeConfig?.chocolateSubcategories || [];
      case 'anniversary': return storeConfig?.anniversarySubcategories || [];
      case 'personalized_gifts': return storeConfig?.personalizedSubcategories || [];
      case 'gifts':
      case 'combos': return storeConfig?.giftSubcategories || [];
      case 'dewali': return storeConfig?.dewaliSubcategories || [];
      case 'rakhi': return storeConfig?.rakhiSubcategories || [];
      case 'photo_to_art': return storeConfig?.photoToArtSubcategories || [];
      case 'hand_crafts': return storeConfig?.handCraftSubcategories || [];
      case 'new_year': return storeConfig?.newYearSubcategories || [];
      default: return [];
    }
  };`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/CategoryDetailPage.tsx', code);
console.log("Patched CategoryDetailPage.tsx subcategories FIXED");
