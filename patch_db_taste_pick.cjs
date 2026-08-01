const fs = require('fs');
let code = fs.readFileSync('src/services/dbService.ts', 'utf-8');

const targetStr = `  cakeSubcategories: [`;
const replacementStr = `  tastePickSubcategories: [
    {
      id: "taste_chocolate",
      name: "Chocolate",
      tag: "Rich & Dark",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "taste_vanilla",
      name: "Vanilla",
      tag: "Classic Delight",
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "taste_strawberry",
      name: "Strawberry",
      tag: "Berry Love",
      image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "taste_butterscotch",
      name: "Butterscotch",
      tag: "Crunchy & Sweet",
      image: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "taste_blackforest",
      name: "Black Forest",
      tag: "Cherry & Cream",
      image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "taste_redvelvet",
      name: "Red Velvet",
      tag: "Lush & Soft",
      image: "https://images.unsplash.com/photo-1586788224331-947f68671caf?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "taste_pineapple",
      name: "Pineapple",
      tag: "Tropical",
      image: "https://images.unsplash.com/photo-1517593674696-6e3e1572c4ce?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "taste_fruit",
      name: "Fruit Cake",
      tag: "Fresh & Healthy",
      image: "https://images.unsplash.com/photo-1599818815187-578500249870?auto=format&fit=crop&w=400&q=80",
    },
  ],
  cakeSubcategories: [`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/services/dbService.ts', code);
  console.log('Patched dbService.ts successfully.');
} else {
  console.log('Target string not found!');
}
