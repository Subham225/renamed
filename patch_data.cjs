const fs = require('fs');

let code = fs.readFileSync('src/data.ts', 'utf8');

// Check if free item is already there
if (!code.includes('free_test_item')) {
  const newProduct = `  {
    id: 'free_test_item',
    name: 'Free Test Purchase Item',
    price: 0,
    originalPrice: 100,
    category: 'cakes',
    image: GENERATED_IMAGES.cake,
    images: [],
    description: 'This is a test product for testing the purchase flow without any real payment.',
    rating: 5.0,
    reviewsCount: 1,
    features: ['Test Purchase', 'No Delivery Fee'],
  },
`;
  code = code.replace(/export const PRODUCTS: Product\[\] = \[/, 'export const PRODUCTS: Product[] = [\n' + newProduct);
  fs.writeFileSync('src/data.ts', code);
  console.log("Added free test item to products");
} else {
  console.log("free test item already exists in products");
  
  // ensure price is 0
  code = code.replace(/id: 'free_test_item',[\s\S]*?price: 1,/, "id: 'free_test_item',\n    name: 'Free Test Purchase Item',\n    price: 0,");
  fs.writeFileSync('src/data.ts', code);
}
