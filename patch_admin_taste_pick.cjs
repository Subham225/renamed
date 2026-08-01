const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

// 1. Add tastePickSubcategories to allPossibleSecondaryCategories
const dynamicSubsCode = `    const dynamicSubs = (storeConfig?.cakeSubcategories || []).map((sc) => ({
      id: sc.id,
      name: \`\${sc.name} (Cake Subcategory)\`,
    }));`;

const newSubsCode = `    const dynamicSubs = (storeConfig?.cakeSubcategories || []).map((sc) => ({
      id: sc.id,
      name: \`\${sc.name} (Cake Subcategory)\`,
    }));
    const tastePickSubs = (storeConfig?.tastePickSubcategories || []).map((sc) => ({
      id: sc.id,
      name: \`\${sc.name} (Taste Pick)\`,
    }));`;

code = code.replace(dynamicSubsCode, newSubsCode);

const combinedCode = `    const combined = [
      ...categories.map((c) => ({ id: c.id, name: c.name })),
      ...finalSubs,
      ...dynamicSubs.filter((ds) => !finalSubs.some((fs) => fs.id === ds.id)),
    ];`;

const newCombinedCode = `    const combined = [
      ...categories.map((c) => ({ id: c.id, name: c.name })),
      ...finalSubs,
      ...dynamicSubs.filter((ds) => !finalSubs.some((fs) => fs.id === ds.id)),
      ...tastePickSubs,
    ];`;

code = code.replace(combinedCode, newCombinedCode);

// 2. Add Taste Pick configuration UI
const cakeConfigurator = `<SubcategoryConfigurator
                      icon="🎂"
                      description="Customize name tags & backdrop banners for the 4 cake columns"
                      configKey="cakeSubcategories"`;

const tastePickConfigurator = `<SubcategoryConfigurator
                      icon="😋"
                      title="Your Taste Pick Flavors"
                      description="Customize flavors for the 'Your Taste Pick' section in Cakes (Chocolate, Vanilla, etc.)"
                      configKey="tastePickSubcategories"
                      defaultIds={["taste_chocolate", "taste_vanilla", "taste_strawberry", "taste_butterscotch", "taste_blackforest", "taste_redvelvet", "taste_pineapple", "taste_fruit"]}
                      defaultNames={["Chocolate", "Vanilla", "Strawberry", "Butterscotch", "Black Forest", "Red Velvet", "Pineapple", "Fruit Cake"]}
                      defaultTags={["Rich & Dark", "Classic Delight", "Berry Love", "Crunchy & Sweet", "Cherry & Cream", "Lush & Soft", "Tropical", "Fresh & Healthy"]}
                      defaultImages={[
                        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1586788224331-947f68671caf?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1517593674696-6e3e1572c4ce?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1599818815187-578500249870?auto=format&fit=crop&w=400&q=80"
                      ]}
                      localConfig={localConfig}
                      setLocalConfig={setLocalConfig}
                    />
                    
                    <SubcategoryConfigurator
                      icon="🎂"
                      description="Customize name tags & backdrop banners for the 4 cake columns"
                      configKey="cakeSubcategories"`;

code = code.replace(cakeConfigurator, tastePickConfigurator);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log('Patched AdminPanel.tsx successfully.');
