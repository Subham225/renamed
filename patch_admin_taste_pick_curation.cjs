const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

const tabMenuRegex = /<button\s+onClick=\{\(\) => setActiveTab\("cakes_curation"\)\}.*?<\/button>/s;
const tabMenuMatch = code.match(tabMenuRegex);

if (tabMenuMatch) {
  const newTabButton = `
              <button
                onClick={() => setActiveTab("taste_pick_curation")}
                className={\`py-3.5 px-4 flex items-center gap-1.5 border-b-2 shrink-0 transition-all cursor-pointer \${
                  activeTab === "taste_pick_curation"
                    ? "border-pink-600 text-pink-600"
                    : "border-transparent text-slate-500"
                }\`}
              >
                <span>😋 Taste Pick</span>
              </button>`;
  code = code.replace(tabMenuMatch[0], newTabButton + '\n' + tabMenuMatch[0]);
}

const cakesCurationTabRegex = /\{activeTab === "cakes_curation" && \((.*?)\)\}/s;
const cakesCurationMatch = code.match(cakesCurationTabRegex);

if (cakesCurationMatch) {
  const tastePickTabContent = `
              {activeTab === "taste_pick_curation" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm text-left">
                    <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-tight mb-4">
                      <span>😋</span> Taste Pick Curation
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 font-semibold">Select which flavor section each cake belongs to in the "Your Taste Pick" area.</p>
                    <div className="relative mb-6">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-500"
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase();
                          const items = document.querySelectorAll(".taste-pick-curation-item");
                          items.forEach((item) => {
                            const title = item.getAttribute("data-name")?.toLowerCase() || "";
                            if (title.includes(val)) {
                              (item as HTMLElement).style.display = "flex";
                            } else {
                              (item as HTMLElement).style.display = "none";
                            }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {products.map((prod) => {
                        return (
                          <div
                            key={prod.id}
                            data-name={prod.name}
                            className="taste-pick-curation-item flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl flex-wrap gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-[150px]">
                              <img src={prod.image} className="w-12 h-12 object-cover rounded-xl" alt={prod.name} />
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1 max-w-[150px]">{prod.name}</h4>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">{prod.category}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {tastePickSubs.map((flavor) => {
                                const isAssigned = prod.categories?.includes(flavor.id) || prod.category === flavor.id;
                                return (
                                  <button
                                    key={flavor.id}
                                    onClick={() => {
                                      const cats = prod.categories ? [...prod.categories] : [];
                                      if (isAssigned) {
                                        const idx = cats.indexOf(flavor.id);
                                        if (idx > -1) cats.splice(idx, 1);
                                      } else {
                                        if (!cats.includes(flavor.id)) cats.push(flavor.id);
                                      }
                                      onUpdateProduct({ ...prod, categories: cats });
                                    }}
                                    className={\`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-colors border \${isAssigned ? "bg-pink-500 text-white border-pink-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}\`}
                                  >
                                    {isAssigned ? \`✓ \${flavor.name.replace(' (Taste Pick)', '')}\` : \`+ \${flavor.name.replace(' (Taste Pick)', '')}\`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
`;
  code = code.replace(cakesCurationMatch[0], tastePickTabContent + '\n' + cakesCurationMatch[0]);
}

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log("Patched successfully");
