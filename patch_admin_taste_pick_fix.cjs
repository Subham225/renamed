const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

const targetStr = `                              {tastePickSubs.map((flavor) => {`;
const replacementStr = `                              {(storeConfig?.tastePickSubcategories || []).map((flavor) => {`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/AdminPanel.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Target string not found!");
}
