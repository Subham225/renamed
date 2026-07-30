const fs = require('fs');
let code = fs.readFileSync('src/services/dbService.ts', 'utf8');

code = code.replace(
  /const unsubscribe = onSnapshot\(docRef, \(docSnap\) => \{\n\s*if \(docSnap\.exists\(\)\) \{\n\s*onUpdate\(docSnap\.data\(\) as StoreConfig\);\n\s*\} else \{/,
  `const unsubscribe = onSnapshot(docRef, async (docSnap) => {
    if (docSnap.exists()) {
      const currentData = docSnap.data() as StoreConfig;
      let needsUpdate = false;
      if (!currentData.flowerSubcategories) { currentData.flowerSubcategories = DEFAULT_STORE_CONFIG.flowerSubcategories; needsUpdate = true; }
      if (!currentData.anniversarySubcategories) { currentData.anniversarySubcategories = DEFAULT_STORE_CONFIG.anniversarySubcategories; needsUpdate = true; }
      if (!currentData.chocolateSubcategories) { currentData.chocolateSubcategories = DEFAULT_STORE_CONFIG.chocolateSubcategories; needsUpdate = true; }
      if (!currentData.plantSubcategories) { currentData.plantSubcategories = DEFAULT_STORE_CONFIG.plantSubcategories; needsUpdate = true; }
      if (!currentData.personalizedSubcategories) { currentData.personalizedSubcategories = DEFAULT_STORE_CONFIG.personalizedSubcategories; needsUpdate = true; }
      
      if (needsUpdate) {
         await setDoc(docRef, currentData, { merge: true });
         console.log("Updated existing store config with new subcategories.");
      }
      onUpdate(currentData);
    } else {`
);

fs.writeFileSync('src/services/dbService.ts', code);
console.log("Patched store config update logic");
