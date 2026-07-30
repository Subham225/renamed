const fs = require('fs');
let code = fs.readFileSync('src/components/BottomNavBar.tsx', 'utf8');

code = code.replace(
  /onTabChange\('categories'\);\n\s*const element = document\.getElementById\('category-grid-anchor'\);\n\s*if \(element\) \{\n\s*element\.scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\);\n\s*\}/g,
  `onTabChange('categories');
            window.scrollTo({ top: 0, behavior: 'smooth' });`
);

fs.writeFileSync('src/components/BottomNavBar.tsx', code);
console.log("Patched BottomNavBar.tsx");
