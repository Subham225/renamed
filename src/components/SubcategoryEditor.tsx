import React from "react";
import { StoreConfig, StoreConfigItem } from "../types";

interface SubcategoryEditorProps {
  title: string;
  icon: string;
  description: string;
  configKey: keyof StoreConfig;
  defaultIds: string[];
  defaultNames: string[];
  defaultTags: string[];
  defaultImages: string[];
  localConfig: StoreConfig;
  setLocalConfig: (config: StoreConfig) => void;
  accentColor?: "pink" | "teal" | "indigo" | "blue" | "emerald" | "rose";
}

export default function SubcategoryEditor({
  title,
  icon,
  description,
  configKey,
  defaultIds,
  defaultNames,
  defaultTags,
  defaultImages,
  localConfig,
  setLocalConfig,
  accentColor = "pink",
}: SubcategoryEditorProps) {
  const list = [...((localConfig[configKey] as StoreConfigItem[]) || [])];

  const colorClasses = {
    pink: {
      text: "text-pink-700",
      bg: "bg-pink-50",
      border: "border-pink-100",
      bgHover: "hover:bg-pink-100",
      btnBg: "bg-pink-50",
      btnHover: "hover:file:bg-pink-100",
      fileText: "file:text-pink-700",
      fileBg: "file:bg-pink-50",
    },
    teal: {
      text: "text-teal-700",
      bg: "bg-teal-50",
      border: "border-teal-100",
      bgHover: "hover:bg-teal-100",
      btnBg: "bg-teal-50",
      btnHover: "hover:file:bg-teal-100",
      fileText: "file:text-teal-700",
      fileBg: "file:bg-teal-50",
    },
    indigo: {
      text: "text-indigo-700",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      bgHover: "hover:bg-indigo-100",
      btnBg: "bg-indigo-50",
      btnHover: "hover:file:bg-indigo-100",
      fileText: "file:text-indigo-700",
      fileBg: "file:bg-indigo-50",
    },
    blue: {
      text: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-100",
      bgHover: "hover:bg-blue-100",
      btnBg: "bg-blue-50",
      btnHover: "hover:file:bg-blue-100",
      fileText: "file:text-blue-700",
      fileBg: "file:bg-blue-50",
    },
    emerald: {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      bgHover: "hover:bg-emerald-100",
      btnBg: "bg-emerald-50",
      btnHover: "hover:file:bg-emerald-100",
      fileText: "file:text-emerald-700",
      fileBg: "file:bg-emerald-50",
    },
    rose: {
      text: "text-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-100",
      bgHover: "hover:bg-rose-100",
      btnBg: "bg-rose-50",
      btnHover: "hover:file:bg-rose-100",
      fileText: "file:text-rose-700",
      fileBg: "file:bg-rose-50",
    },
  };

  const colors = colorClasses[accentColor];

  const updateItem = (index: number, updates: Partial<StoreConfigItem>) => {
    const nextList = [...list];
    
    // Fill in default values if the item is being edited for the first time
    if (!nextList[index]) {
      nextList[index] = {
        id: defaultIds[index],
        name: defaultNames[index],
        image: defaultImages[index] || "",
        tag: defaultTags[index]
      };
    }
    
    nextList[index] = { ...nextList[index], ...updates };
    setLocalConfig({ ...localConfig, [configKey]: nextList });
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-150 space-y-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
        <span className="text-lg">{icon}</span>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800">
            {title}
          </h4>
          <span className="text-[9px] text-slate-400 font-bold">
            {description}
          </span>
        </div>
      </div>
      <div className="space-y-4 max-h-[365px] overflow-y-auto pr-1">
        {[0, 1, 2, 3].map((index) => {
          const item = list[index] || {
            id: defaultIds[index],
            name: defaultNames[index],
            image: "",
            tag: defaultTags[index],
          };
          return (
            <div
              key={index}
              className="p-3 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-slate-100/50 pb-1.5 mb-1 bg-white/70 p-1 px-2 rounded-lg">
                <span className={`text-[9.5px] ${colors.text} font-black uppercase tracking-wider font-mono`}>
                  Card #{index + 1}
                </span>
                <span className={`text-[8px] ${colors.bg} ${colors.text} font-black px-1.5 py-0.5 rounded tracking-wide font-mono`}>
                  ID: {item.id}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-bold block">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    placeholder={defaultNames[index]}
                    onChange={(e) => updateItem(index, { name: e.target.value })}
                    className="w-full text-xs font-semibold p-2 bg-white border border-slate-150 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 font-bold block">
                    Sub-badge Label
                  </label>
                  <input
                    type="text"
                    value={item.tag}
                    placeholder={defaultTags[index]}
                    onChange={(e) => updateItem(index, { tag: e.target.value })}
                    className="w-full text-xs font-semibold p-2 bg-white border border-slate-150 rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-bold block">
                  Card visual image backdrop source
                </label>
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} border border-slate-100 overflow-hidden shrink-0`}>
                    <img
                      src={
                        item.image ||
                        defaultImages[index] ||
                        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80"
                      }
                      className="w-full h-full object-cover"
                      alt="Sub category preview"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={item.image}
                      placeholder="https://images.unsplash.com/..."
                      onChange={(e) => updateItem(index, { image: e.target.value })}
                      className="w-full text-[9px] font-mono p-1.5 bg-white border border-slate-155 rounded-md"
                    />
                    <div className="pt-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (
                            e.target.files &&
                            e.target.files[0]
                          ) {
                            const file = e.target.files[0];
                            try {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const base64 = event.target?.result as string;
                                updateItem(index, { image: base64 });
                              };
                              reader.readAsDataURL(file);
                            } catch (err) {
                              console.error(
                                "Subcategory image compression failed:",
                                err
                              );
                              alert("Failed to process image. Try a smaller file.");
                            }
                          }
                        }}
                        className={`w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[9px] file:font-extrabold file:uppercase ${colors.fileBg} ${colors.fileText} ${colors.btnHover} cursor-pointer`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
