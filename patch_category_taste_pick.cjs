const fs = require('fs');
let code = fs.readFileSync('src/components/CategoryDetailPage.tsx', 'utf8');

const tastePickJSX = `
      {categoryId === 'cakes' && (
        <div className="max-w-7xl mx-auto px-4 py-10 w-full border-t border-slate-100">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Taste Pick</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Delicious Selections</p>
            </div>
          </div>
          <div className="overflow-x-auto pb-6 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-4 min-w-max">
               {processedProducts.filter(p => p.rating && p.rating >= 4.8).slice(0, 8).map(prod => (
                 <div key={prod.id} className="w-[140px] sm:w-[160px] flex-none group">
                   <div 
                     className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer border border-slate-100 transition-all duration-300 h-full flex flex-col"
                     onClick={() => onSelectProduct?.(prod)}
                   >
                     <div className="relative aspect-square w-full overflow-hidden bg-slate-50 shrink-0">
                       <img
                         src={prod.image}
                         alt={prod.name}
                         className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                         referrerPolicy="no-referrer"
                         onError={(e) => {
                           e.target.src = "/logo.png";
                         }}
                       />
                       {prod.originalPrice && prod.price < prod.originalPrice && (
                         <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md uppercase shadow-sm">
                           {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF
                         </span>
                       )}
                     </div>
                     <div className="p-3 text-center flex flex-col justify-between flex-1">
                       <h4 className="font-extrabold text-[11px] text-slate-800 line-clamp-2 leading-tight group-hover:text-pink-600 transition-colors">
                         {prod.name}
                       </h4>
                       <div className="mt-2 flex items-center justify-center gap-1.5">
                         <span className="text-[13px] font-black text-pink-600">₹{prod.price}</span>
                         {prod.originalPrice && (
                           <span className="text-[10px] font-bold text-slate-400 line-through">₹{prod.originalPrice}</span>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Products Section Header & Filters */}`;

code = code.replace(
  /\{\/\* Products Section Header & Filters \*\/\}/,
  tastePickJSX
);

fs.writeFileSync('src/components/CategoryDetailPage.tsx', code);
console.log("Patched CategoryDetailPage.tsx for Your Taste Pick");
