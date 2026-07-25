import React, { useState } from 'react';
import { StoreConfig, DeliveryZone, DeliveryTimeSlot } from '../types';
import { Plus, Trash2, Save, MapPin, Clock } from 'lucide-react';

interface DeliveryConfigEditorProps {
  localConfig: StoreConfig | null;
  onUpdateStoreConfig: (config: StoreConfig) => void;
}

export default function DeliveryConfigEditor({ localConfig, onUpdateStoreConfig }: DeliveryConfigEditorProps) {
  const [zones, setZones] = useState<DeliveryZone[]>(localConfig?.deliveryZones || []);
  const [timeSlots, setTimeSlots] = useState<DeliveryTimeSlot[]>(localConfig?.deliveryTimeSlots || []);

  if (!localConfig) return null;

  const saveConfig = () => {
    onUpdateStoreConfig({
      ...localConfig,
      deliveryZones: zones,
      deliveryTimeSlots: timeSlots,
    });
    alert('Delivery configuration saved successfully!');
  };

  const addZone = () => {
    setZones([...zones, { id: 'zone_' + Date.now(), name: 'New Zone', pincodes: '', basePrice: 0, allowExpress: false }]);
  };

  const updateZone = (index: number, updates: Partial<DeliveryZone>) => {
    const newZones = [...zones];
    newZones[index] = { ...newZones[index], ...updates };
    setZones(newZones);
  };

  const removeZone = (index: number) => {
    const newZones = [...zones];
    newZones.splice(index, 1);
    setZones(newZones);
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { id: 'ts_' + Date.now(), label: 'New Time Slot', surcharge: 0, type: 'fixed' }]);
  };

  const updateTimeSlot = (index: number, updates: Partial<DeliveryTimeSlot>) => {
    const newSlots = [...timeSlots];
    newSlots[index] = { ...newSlots[index], ...updates };
    setTimeSlots(newSlots);
  };

  const removeTimeSlot = (index: number) => {
    const newSlots = [...timeSlots];
    newSlots.splice(index, 1);
    setTimeSlots(newSlots);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-slate-900/10">
        <div className="relative z-10 space-y-1.5 p-1">
          <span className="text-[9px] bg-indigo-600 font-extrabold px-2 py-0.5 rounded tracking-widest block w-fit">
            DELIVERY ENGINE
          </span>
          <h3 className="text-sm font-black text-white uppercase tracking-tight">
            Delivery Zones & Pricing
          </h3>
          <p className="text-[10.5px] text-slate-350 leading-relaxed font-semibold">
            Manage your delivery areas, pincodes, base charges, and time slot surcharges.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-500" />
            Delivery Zones (Pincodes & Base Prices)
          </h4>
          <button onClick={addZone} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg hover:bg-indigo-100 flex items-center gap-1.5">
            <Plus className="w-3 h-3" /> Add Zone
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4">Use * for default pincodes (all other areas).</p>
        
        <div className="space-y-3">
          {zones.map((zone, idx) => (
            <div key={zone.id} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl items-start">
              <div className="col-span-12 md:col-span-3">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Zone Name</label>
                <input
                  type="text"
                  value={zone.name}
                  onChange={e => updateZone(idx, { name: e.target.value })}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Pincodes (comma separated)</label>
                <input
                  type="text"
                  value={zone.pincodes}
                  onChange={e => updateZone(idx, { pincodes: e.target.value })}
                  placeholder="e.g. 721301, 721302 or *"
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-12 md:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Base Price (₹)</label>
                <input
                  type="number"
                  value={zone.basePrice}
                  onChange={e => updateZone(idx, { basePrice: Number(e.target.value) })}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-12 md:col-span-2 flex items-center h-full pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={zone.allowExpress}
                    onChange={e => updateZone(idx, { allowExpress: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] font-black text-slate-700 uppercase">Allow Express</span>
                </label>
              </div>
              <div className="col-span-12 md:col-span-1 flex items-center justify-end h-full pt-4">
                <button onClick={() => removeZone(idx)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Time Slots & Surcharges
          </h4>
          <button onClick={addTimeSlot} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg hover:bg-indigo-100 flex items-center gap-1.5">
            <Plus className="w-3 h-3" /> Add Time Slot
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4">Surcharge is added on top of the zone's base price.</p>

        <div className="space-y-3">
          {timeSlots.map((ts, idx) => (
            <div key={ts.id} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl items-start">
              <div className="col-span-12 md:col-span-5">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Time Slot Label</label>
                <input
                  type="text"
                  value={ts.label}
                  onChange={e => updateTimeSlot(idx, { label: e.target.value })}
                  placeholder="e.g. 10am-11am"
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Type</label>
                <select
                  value={ts.type}
                  onChange={e => updateTimeSlot(idx, { type: e.target.value as any })}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="standard">Standard</option>
                  <option value="fixed">Fixed Time</option>
                  <option value="midnight">Midnight</option>
                  <option value="express">Express</option>
                </select>
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Surcharge (₹)</label>
                <input
                  type="number"
                  value={ts.surcharge}
                  onChange={e => updateTimeSlot(idx, { surcharge: Number(e.target.value) })}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-12 md:col-span-1 flex items-center justify-end h-full pt-4">
                <button onClick={() => removeTimeSlot(idx)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={saveConfig}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all"
        >
          <Save className="w-4 h-4" /> Save Delivery Settings
        </button>
      </div>
    </div>
  );
}
