const fs = require('fs');
let lines = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8').split('\n');
let newLines = [];
let i = 0;
while (i < lines.length) {
  if (lines[i].includes('{step === "checkout_payment" && (') && lines[i+1].includes('<button') && lines[i+2].includes('onClick={handleOrderSubmit}')) {
    newLines.push(lines[i]); // {step === "checkout_payment" && (
    newLines.push('                  <div className="flex flex-col w-full gap-2">');
    i++;
    while(!lines[i].includes(')}')) {
      newLines.push(lines[i]);
      i++;
    }
    newLines.push('                  </div>');
    newLines.push(lines[i]); // )}
    i++;
  } else {
    newLines.push(lines[i]);
    i++;
  }
}
fs.writeFileSync('src/components/CartDrawer.tsx', newLines.join('\n'));
