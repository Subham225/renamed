import React, { useState, useEffect } from 'react';
import { StoreConfig, DeliveryZone, DeliveryTimeSlot } from '../types';
import { Plus, Trash2, Save, MapPin, Clock, Check } from 'lucide-react';

interface DeliveryConfigEditorProps {
  localConfig: StoreConfig | null;
  onUpdateStoreConfig: (config: StoreConfig) => Promise<void> | void;
}

const normalizeSlots = (slots: DeliveryTimeSlot[]): DeliveryTimeSlot[] => {
  const mapped = slots.map((ts) => {
    const lower = (ts.label || '').toLowerCase();
    const isStandard = ts.type === 'standard' || lower.includes('any time') || lower.includes('standard delivery');
    if (isStandard) {
      return { ...ts, type: 'standard' as const, surcharge: 0 };
    }
    return ts;
  });
  const hasStandard = mapped.some((ts) => ts.type === 'standard');
  if (!hasStandard) {
    mapped.unshift({
      id: 'ts_standard',
      label: 'Any Time On Specified Date',
      surcharge: 0,
      type: 'standard',
    });
  }
  return mapped;
};

export default function DeliveryConfigEditor({ localConfig, onUpdateStoreConfig }: DeliveryConfigEditorProps) {
  const [zones, setZones] = useState<DeliveryZone[]>(localConfig?.deliveryZones || []);
  const [timeSlots, setTimeSlots] = useState<DeliveryTimeSlot[]>(() =>
    normalizeSlots(localConfig?.deliveryTimeSlots || [])
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!localConfig || isDirty) return;
    setZones(localConfig.deliveryZones || []);
    setTimeSlots(normalizeSlots(localConfig.deliveryTimeSlots || []));
  }, [localConfig, isDirty]);

  if (!localConfig) return null;

  const saveConfig = async () => {
    const sanitizedZones = zones.map((z) => ({
      ...z,
      pincodes: z.pincodes
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .join(', '),
      basePrice: Number(z.basePrice) || 0,
    }));
    const sanitizedSlots = normalizeSlots(timeSlots).map((ts) => ({
      ...ts,
      surcharge: ts.type === 'standard' ? 0 : Math.max(0, Number(ts.surcharge) || 0),
    }));
    setZones(sanitizedZones);
    setTimeSlots(sanitizedSlots);
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await onUpdateStoreConfig({
        ...localConfig,
        deliveryZones: sanitizedZones,
        deliveryTimeSlots: sanitizedSlots,
      });
      setIsDirty(false);
      setSaveMessage({ type: 'success', text: 'Delivery configuration saved permanently to Firebase!' });
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err?.message || 'Failed to save delivery configuration.' });
    } finally {
      setIsSaving(false);
    }
  };

  const addZone = () => {
    setIsDirty(true);
    setZones([...zones, { id: 'zone_' + Date.now(), name: 'New Zone', pincodes: '', basePrice: 0, allowExpress: false }]);
  };

  const updateZone = (index: number, updates: Partial<DeliveryZone>) => {
    setIsDirty(true);
    const newZones = [...zones];
    newZones[index] = { ...newZones[index], ...updates };
    setZones(newZones);
  };

  const removeZone = (index: number) => {
    setIsDirty(true);
    const newZones = [...zones];
    newZones.splice(index, 1);
    setZones(newZones);
  };

  const addTimeSlot = () => {
    setIsDirty(true);
    setTimeSlots([...timeSlots, { id: 'ts_' + Date.now(), label: 'New Time Slot', surcharge: 0, type: 'fixed' }]);
  };

  const updateTimeSlot = (index: number, updates: Partial<DeliveryTimeSlot>) => {
    setIsDirty(true);
    const newSlots = [...timeSlots];
    const nextSlot = { ...newSlots[index], ...updates };
    const lower = (nextSlot.label || '').toLowerCase();
    if (nextSlot.type === 'standard' || lower.includes('any time')) {
      nextSlot.type = 'standard';
      nextSlot.surcharge = 0;
    }
    newSlots[index] = nextSlot;
    setTimeSlots(newSlots);
  };

  const removeTimeSlot = (index: number) => {
    setIsDirty(true);
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
          <button type="button" onClick={addZone} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg hover:bg-indigo-100 flex items-center gap-1.5">
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
                <button type="button" onClick={() => removeZone(idx)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
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
          <button type="button" onClick={addTimeSlot} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg hover:bg-indigo-100 flex items-center gap-1.5">
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
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  Surcharge (₹)
                </label>
                <input
                  type="number"
                  value={ts.type === 'standard' ? 0 : ts.surcharge}
                  disabled={ts.type === 'standard'}
                  onChange={e => updateTimeSlot(idx, { surcharge: Number(e.target.value) })}
                  className={`w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 ${ts.type === 'standard' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                />
                {ts.type === 'standard' && (
                  <span className="text-[9px] text-emerald-700 font-bold block mt-1">
                    Fixed ₹0 (Uses Zone Base Price for all pincodes)
                  </span>
                )}
              </div>
              <div className="col-span-12 md:col-span-1 flex items-center justify-end h-full pt-4">
                <button type="button" onClick={() => removeTimeSlot(idx)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
        <div className="min-h-[24px]">
          {saveMessage && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${
                saveMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {saveMessage.type === 'success' && <Check className="w-3.5 h-3.5" />}
              {saveMessage.text}
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={isSaving}
          onClick={saveConfig}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all disabled:opacity-60 cursor-pointer"
        >
          <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Delivery Settings'}
        </button>
      </div>
    </div>
  );
}
