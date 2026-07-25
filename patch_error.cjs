const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /error: \`PhonePe gateway returned HTTP \$\{response\.status\}\`/g,
  "error: `PhonePe gateway returned HTTP ${response.status}: ${textPayload}`"
);
fs.writeFileSync('server.ts', code);
