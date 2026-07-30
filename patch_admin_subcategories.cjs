const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const additionalPanels = `
                    {/* FLOWER CARDS */}
                    <SubcategoryEditor
                      title="4 Flower Category cards"
                      icon="🌸"
                      description="Customize name tags & backdrop banners for Flower subcategories"
                      configKey="flowerSubcategories"
                      defaultIds={["flowers_with_cakes", "flowers_with_chocolates", "bouquets", "premium_flowers"]}
                      defaultNames={["Flower & Cake", "Flower & Chocolate", "Bouquets", "Premium Flowers"]}
                      defaultTags={["Classic Combo", "Sweet Affection", "Fresh Blooms", "Luxury Roses"]}
                      defaultImages={[
                        "https://images.unsplash.com/photo-1558350130-1b203405786a?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1562690868-60bbe7293e94?auto=format&fit=crop&w=400&q=80"
                      ]}
                      localConfig={localConfig}
                      setLocalConfig={setLocalConfig}
                      accentColor="rose"
                    />

                    {/* CHOCOLATE CARDS */}
                    <SubcategoryEditor
                      title="4 Chocolate Category cards"
                      icon="🍫"
                      description="Customize name tags & backdrop banners for Chocolate subcategories"
                      configKey="chocolateSubcategories"
                      defaultIds={["premium_chocolates", "chocolate_bouquets", "chocolate_hampers", "imported_chocolates"]}
                      defaultNames={["Premium Chocolates", "Chocolate Bouquets", "Hampers", "Imported"]}
                      defaultTags={["Luxury Bites", "Sweet Bouquets", "Gift Sets", "International"]}
                      defaultImages={[
                        "https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1549007953-2f2dc0b24019?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?auto=format&fit=crop&w=400&q=80"
                      ]}
                      localConfig={localConfig}
                      setLocalConfig={setLocalConfig}
                      accentColor="teal"
                    />

                    {/* ANNIVERSARY CARDS */}
                    <SubcategoryEditor
                      title="4 Anniversary Category cards"
                      icon="💍"
                      description="Customize name tags & backdrop banners for Anniversary subcategories"
                      configKey="anniversarySubcategories"
                      defaultIds={["anniversary_cakes", "anniversary_flowers", "anniversary_combos", "anniversary_gifts"]}
                      defaultNames={["Anniversary Cakes", "Anniversary Flowers", "Combos", "Gifts"]}
                      defaultTags={["Sweet Moments", "Romantic Roses", "Perfect Pairs", "Special Keepsakes"]}
                      defaultImages={[
                        "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=80"
                      ]}
                      localConfig={localConfig}
                      setLocalConfig={setLocalConfig}
                      accentColor="pink"
                    />

                    {/* PLANT CARDS */}
                    <SubcategoryEditor
                      title="4 Plant Category cards"
                      icon="🪴"
                      description="Customize name tags & backdrop banners for Plant subcategories"
                      configKey="plantSubcategories"
                      defaultIds={["indoor_plants", "flowering_plants", "succulents", "lucky_bamboo"]}
                      defaultNames={["Indoor Plants", "Flowering Plants", "Succulents", "Lucky Bamboo"]}
                      defaultTags={["Green Decor", "Blooming Beauty", "Low Maintenance", "Good Fortune"]}
                      defaultImages={[
                        "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1463320898484-cdefebf251eb?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1596547609652-9fc5d8d4285b?auto=format&fit=crop&w=400&q=80"
                      ]}
                      localConfig={localConfig}
                      setLocalConfig={setLocalConfig}
                      accentColor="emerald"
                    />

                    {/* PERSONALIZED CARDS */}
                    <SubcategoryEditor
                      title="4 Personalized Category cards"
                      icon="🖼️"
                      description="Customize name tags & backdrop banners for Personalized subcategories"
                      configKey="personalizedSubcategories"
                      defaultIds={["photo_frames", "custom_mugs", "engraved_gifts", "cushions"]}
                      defaultNames={["Photo Frames", "Custom Mugs", "Engraved Gifts", "Cushions"]}
                      defaultTags={["Cherished Memories", "Everyday Joy", "Special Touch", "Cozy Comfort"]}
                      defaultImages={[
                        "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1596484552993-8dc944aeb651?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1542668580-f08a46747209?auto=format&fit=crop&w=400&q=80"
                      ]}
                      localConfig={localConfig}
                      setLocalConfig={setLocalConfig}
                      accentColor="indigo"
                    />`;

code = code.replace(
  /(\{\/\* EIGHTH PANEL: NEW YEAR CARDS \*\/\}[\s\S]*?accentColor="blue"\n\s*\/>)/,
  `$1\n${additionalPanels}`
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log("Patched AdminPanel.tsx to include new subcategory editors.");
