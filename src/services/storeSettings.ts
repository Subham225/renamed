// Store Settings & Operating Hours (12:00 AM to 8:00 PM) with Admin Manual Override

export interface StoreSettings {
  manualClosed: boolean;
  customMessage?: string;
}

export function getStoreSettings(): StoreSettings {
  try {
    const manualClosed = localStorage.getItem('rocx_store_manual_closed') === 'true';
    const customMessage = localStorage.getItem('rocx_store_custom_message') || '';
    return { manualClosed, customMessage };
  } catch (e) {
    return { manualClosed: false };
  }
}

export function setStoreSettings(manualClosed: boolean, customMessage?: string) {
  try {
    localStorage.setItem('rocx_store_manual_closed', manualClosed ? 'true' : 'false');
    if (customMessage !== undefined) {
      localStorage.setItem('rocx_store_custom_message', customMessage);
    }
  } catch (e) {
    console.error("Error saving store settings:", e);
  }
}

export function isStoreOpenNow(): { isOpen: boolean; reason: string } {
  const settings = getStoreSettings();
  
  if (settings.manualClosed) {
    return { 
      isOpen: false, 
      reason: settings.customMessage || 'Store is temporarily closed by Admin. Online ordering and payments are paused.' 
    };
  }

  const now = new Date();
  const hours = now.getHours(); // 0 to 23
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // 12:00 AM = 0 minutes, 8:00 PM (20:00) = 20 * 60 = 1200 minutes
  const openMinutes = 0; // 12:00 AM
  const closeMinutes = 20 * 60; // 8:00 PM (20:00)

  if (totalMinutes >= openMinutes && totalMinutes < closeMinutes) {
    return { isOpen: true, reason: 'Store is open (12:00 AM - 8:00 PM).' };
  } else {
    return { 
      isOpen: false, 
      reason: 'Store is currently closed. Ordering and payments are available only between 12:00 AM and 8:00 PM.' 
    };
  }
}
