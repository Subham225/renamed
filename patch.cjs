const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const handleSelectCategoryFromGrid = \([\s\S]*?\}\s*;/m, `const handleSelectCategoryFromGrid = (catId: CategoryID | null, source: 'top' | 'grid' | 'nav' = 'grid') => {
    setHasInteracted(true);
    setCategorySource(source);
    setSelectedCategory(catId);
    setSearchQuery(""); // reset search to prioritize category browsing
    setSelectedProduct(null); // Return to home grid when category is clicked
    setActiveTab("home");
    // Teleport direct to front screen top for clean next page transition
    window.scrollTo({ top: 0, behavior: "instant" });
  };`);
fs.writeFileSync('src/App.tsx', code);
