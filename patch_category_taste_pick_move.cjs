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
            {storeConfig.tastePickSubcategories.map((sub, i) => (
              <div 
                key={sub.id || i}
                onClick={() => onSelectCategory?.(sub.id as CategoryID)}
                className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3 relative">
                  {sub.image ? (
                    <img 
                      src={sub.image} 
                      alt={sub.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Image className="w-12 h-12 opacity-50" />
                    </div>
                  )}
                  {sub.tag && (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end justify-center p-3">
                      <span className="text-[10px] font-black text-white tracking-widest uppercase text-center drop-shadow-md">
                        {sub.tag}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center px-1">
                  <h4 className="font-black text-sm text-slate-800 group-hover:text-pink-600 transition-colors line-clamp-1">
                    {sub.name}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}`;

// Remove it from current location
code = code.replace(tastePickStr, '');

// Insert it before SPECIAL CURATED SECTIONS FOR CAKES
const insertBefore = `          {/* SPECIAL CURATED SECTIONS FOR CAKES */}`;
const replacementStr = tastePickStr + '\n\n' + insertBefore;

code = code.replace(insertBefore, replacementStr);

// Change banner height
code = code.replace('h-[250px] sm:h-[350px]', 'h-[160px] sm:h-[220px]');

fs.writeFileSync('src/components/CategoryDetailPage.tsx', code);
console.log('Patched CategoryDetailPage.tsx move successfully.');
