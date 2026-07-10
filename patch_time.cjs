const fs = require('fs');
let code = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

code = code.replace(/const isOpenNow = currentHour >= 0 && currentHour < 20;/g, "const isOpenNow = currentHour >= 0 && currentHour <= 24;");

fs.writeFileSync('src/components/CartDrawer.tsx', code);
