const fs = require('fs');
let code = fs.readFileSync('src/services/dbService.ts', 'utf8');

const additionalSubcategories = `  flowerSubcategories: [
    {
      id: 'flowers_with_cakes',
      name: 'Flower & Cake',
      image: 'https://images.unsplash.com/photo-1558350130-1b203405786a?auto=format&fit=crop&w=400&q=80',
      tag: 'Classic Combo'
    },
    {
      id: 'flowers_with_chocolates',
      name: 'Flower & Chocolate',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
      tag: 'Sweet Affection'
    },
    {
      id: 'bouquets',
      name: 'Bouquets',
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80',
      tag: 'Fresh Blooms'
    }
  ],
  anniversarySubcategories: [
    {
      id: 'anniversary_cakes',
      name: 'Anniversary Cakes',
      image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=400&q=80',
      tag: 'Sweet Moments'
    },
    {
      id: 'anniversary_flowers',
      name: 'Anniversary Flowers',
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80',
      tag: 'Romantic Roses'
    },
    {
      id: 'anniversary_combos',
      name: 'Anniversary Combos',
      image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80',
      tag: 'Perfect Pairs'
    }
  ],
  chocolateSubcategories: [
    {
      id: 'premium_chocolates',
      name: 'Premium Chocolates',
      image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=400&q=80',
      tag: 'Luxury Bites'
    },
    {
      id: 'chocolate_bouquets',
      name: 'Chocolate Bouquets',
      image: 'https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?auto=format&fit=crop&w=400&q=80',
      tag: 'Sweet Bouquets'
    }
  ],
  plantSubcategories: [
    {
      id: 'indoor_plants',
      name: 'Indoor Plants',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
      tag: 'Green Decor'
    },
    {
      id: 'flowering_plants',
      name: 'Flowering Plants',
      image: 'https://images.unsplash.com/photo-1463320898484-cdefebf251eb?auto=format&fit=crop&w=400&q=80',
      tag: 'Blooming Beauty'
    }
  ],
  personalizedSubcategories: [
    {
      id: 'photo_frames',
      name: 'Photo Frames',
      image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=400&q=80',
      tag: 'Cherished Memories'
    },
    {
      id: 'custom_mugs',
      name: 'Custom Mugs',
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=400&q=80',
      tag: 'Everyday Joy'
    }
  ],`;

code = code.replace(
  /aboutBgImage: 'https:\/\/images.unsplash.com\/photo-1513201099705-a9746e1e201f\?auto=format&fit=crop&w=1200&q=80',/,
  "aboutBgImage: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=80',\n" + additionalSubcategories
);

// We need to force update storeConfig.
// Let's modify ensureDefaultStoreConfig to update the config if the fields are missing.
code = code.replace(
  /if \(!configDoc\.exists\(\)\) \{([\s\S]*?)\} else \{([\s\S]*?)\}/,
  `if (!configDoc.exists()) {$1} else {
    // Merge new subcategories if missing
    const currentData = configDoc.data();
    let needsUpdate = false;
    if (!currentData.flowerSubcategories) { currentData.flowerSubcategories = DEFAULT_STORE_CONFIG.flowerSubcategories; needsUpdate = true; }
    if (!currentData.anniversarySubcategories) { currentData.anniversarySubcategories = DEFAULT_STORE_CONFIG.anniversarySubcategories; needsUpdate = true; }
    if (!currentData.chocolateSubcategories) { currentData.chocolateSubcategories = DEFAULT_STORE_CONFIG.chocolateSubcategories; needsUpdate = true; }
    if (!currentData.plantSubcategories) { currentData.plantSubcategories = DEFAULT_STORE_CONFIG.plantSubcategories; needsUpdate = true; }
    if (!currentData.personalizedSubcategories) { currentData.personalizedSubcategories = DEFAULT_STORE_CONFIG.personalizedSubcategories; needsUpdate = true; }
    
    if (needsUpdate) {
       await setDoc(configRef, currentData, { merge: true });
       console.log("Updated existing store config with new subcategories.");
    } else {
       $2
    }
  }`
);


fs.writeFileSync('src/services/dbService.ts', code);
console.log("Patched dbService for store configs");
