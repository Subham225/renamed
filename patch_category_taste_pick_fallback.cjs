const fs = require('fs');
let code = fs.readFileSync('src/components/CategoryDetailPage.tsx', 'utf-8');

const tastePickStr = `      {categoryId === 'cakes' && isMainCategory && storeConfig?.tastePickSubcategories && storeConfig.tastePickSubcategories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-10 w-full border-t border-slate-100">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Taste Pick</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Delicious Selections</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {storeConfig.tastePickSubcategories.map((sub, i) => (`;

const fallbackData = `
  const tastePickSubcategories = storeConfig?.tastePickSubcategories?.length 
    ? storeConfig.tastePickSubcategories 
    : [
        { id: "taste_chocolate", name: "Chocolate", tag: "Rich & Dark", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80" },
        { id: "taste_vanilla", name: "Vanilla", tag: "Classic Delight", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80" },
        { id: "taste_strawberry", name: "Strawberry", tag: "Berry Love", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80" },
        { id: "taste_butterscotch", name: "Butterscotch", tag: "Crunchy & Sweet", image: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=400&q=80" },
        { id: "taste_blackforest", name: "Black Forest", tag: "Cherry & Cream", image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=400&q=80" },
        { id: "taste_redvelvet", name: "Red Velvet", tag: "Lush & Soft", image: "https://images.unsplash.com/photo-1586788224331-947f68671caf?auto=format&fit=crop&w=400&q=80" },
        { id: "taste_pineapple", name: "Pineapple", tag: "Tropical", image: "https://images.unsplash.com/photo-1517593674696-6e3e1572c4ce?auto=format&fit=crop&w=400&q=80" },
        { id: "taste_fruit", name: "Fruit Cake", tag: "Fresh & Healthy", image: "https://images.unsplash.com/photo-1599818815187-578500249870?auto=format&fit=crop&w=400&q=80" }
      ];
`;

const replacementStr = `      {categoryId === 'cakes' && isMainCategory && (
        <div className="max-w-7xl mx-auto px-4 py-10 w-full border-t border-slate-100">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Taste Pick</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Delicious Selections</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tastePickSubcategories.map((sub, i) => (`;

if (code.includes(tastePickStr)) {
  code = code.replace(tastePickStr, replacementStr);
  
  // Insert fallbackData before the return statement of CategoryDetailPage
  const returnStr = `  return (
    <div className="min-h-screen bg-white">`;
  code = code.replace(returnStr, fallbackData + '\n' + returnStr);

  fs.writeFileSync('src/components/CategoryDetailPage.tsx', code);
  console.log('Patched CategoryDetailPage.tsx fallback successfully.');
} else {
  console.log('Target string not found!');
}
