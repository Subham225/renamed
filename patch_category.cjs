const fs = require('fs');

let code = fs.readFileSync('src/data.ts', 'utf8');
code = code.replace(/category: 'anniversary'/g, "category: 'cakes'"); // revert

// specifically target free test item
code = code.replace(
  /id: 'free_test_item',\s*name: 'Free Test Purchase Item',\s*price: 0,(?:.*?\n)?\s*originalPrice: 100,\s*category: 'cakes',/g,
  "id: 'free_test_item',\n    name: 'Free Test Purchase Item',\n    price: 0,\n    originalPrice: 100,\n    category: 'anniversary',"
);

fs.writeFileSync('src/data.ts', code);
console.log("Patched category");
