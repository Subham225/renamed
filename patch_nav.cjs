const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<CategoryNav[\s\S]*?onSelectCategory=\{\(id\) => \{[\s\S]*?\}\}\s*\/>/m, `<CategoryNav
                categories={visibleCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={(id) => {
                  setCategorySource('nav');
                  setSelectedCategory(id);
                  setSearchQuery("");
                }}
              />`);
fs.writeFileSync('src/App.tsx', code);
