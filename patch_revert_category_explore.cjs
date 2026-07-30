const fs = require('fs');
let code = fs.readFileSync('src/components/CategoryExplorePage.tsx', 'utf8');

const regex = /const getSubcategories = \(catId: string\) => \{\n\s*switch \(catId\) \{[\s\S]*?default:\n\s*return \[\];\n\s*\}\n\s*\};/;

const replacement = `  const getSubcategories = (catId: string) => {
    switch (catId) {
      case 'cakes':
        return storeConfig?.cakeSubcategories || [];
      case 'gifts':
      case 'combos':
        return storeConfig?.giftSubcategories || [];
      case 'dewali':
        return storeConfig?.dewaliSubcategories || [];
      case 'rakhi':
        return storeConfig?.rakhiSubcategories || [];
      case 'photo_to_art':
        return storeConfig?.photoToArtSubcategories || [];
      case 'hand_crafts':
        return storeConfig?.handCraftSubcategories || [];
      case 'new_year':
        return storeConfig?.newYearSubcategories || [];
      default:
        return [];
    }
  };`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/CategoryExplorePage.tsx', code);
console.log("Reverted CategoryExplorePage subcategories to normal.");
