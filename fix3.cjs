const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('const [appRandomOrderMap] = useState')) {
  code = code.replace(
    'const [searchQuery, setSearchQuery] = useState<string>("");',
    'const [searchQuery, setSearchQuery] = useState<string>("");\n  const [appRandomOrderMap] = useState(() => new Map<string, number>());'
  );
  fs.writeFileSync('src/App.tsx', code);
}
