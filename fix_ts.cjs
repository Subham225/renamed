const fs = require('fs');

function fixRedeclaration(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /const rawTotalStr = String\(order\.total\)\.replace\(\/\[\^0-9\.\]\/g, ''\);\s*const totalAmountFloat = parseFloat\(rawTotalStr\) \|\| 0;\s*const totalAmountPaise = Math\.round\(totalAmountFloat \* 100\);/g,
    function(match, offset, string) {
      if (offset > string.indexOf('TEST_MODE')) {
        return '';
      }
      return match;
    }
  );
  fs.writeFileSync(file, code);
}

fixRedeclaration('server.ts');
fixRedeclaration('netlify/functions/api.js');
console.log("Fixed redeclaration");
