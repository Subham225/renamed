const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<SidebarMenuDrawer[\s\S]*?onSelectCategory=\{\(id\) => \{[\s\S]*?\}\}\s*\/>/m, `<SidebarMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleTabChange}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenTrack={() => setIsTrackOpen(true)}
        onOpenCustomer={() => setIsCustomerOpen(true)}
        onSelectCategory={(id) => {
          setCategorySource('nav');
          setSelectedCategory(id);
          setSearchQuery("");
          setActiveTab("home");
          setSelectedProduct(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />`);
fs.writeFileSync('src/App.tsx', code);
