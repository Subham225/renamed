import { CartItem } from '../types';

// Safe helper to resolve backend API URL depending on current environment (localhost/Cloud Run vs Netlify)
const getBackendUrl = (path: string): string => {
  const env = (import.meta as any).env || {};
  if (env.VITE_BACKEND_API_URL) {
    const base = env.VITE_BACKEND_API_URL.endsWith('/') ? env.VITE_BACKEND_API_URL.slice(0, -1) : env.VITE_BACKEND_API_URL;
    return `${base}${path}`;
  }
  // Default to relative paths for all hosts. This allows the backend and frontend to connect seamlessly
  // out-of-the-box regardless of whether they are self-hosted, on AI Studio, Netlify, Railway, Render, etc.
  return path;
};

// Helper to check if an email was already sent in this browser session
export function isEmailAlreadySent(orderId: string): boolean {
  try {
    return localStorage.getItem(`rocx_email_sent_for_${orderId}`) === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Send order notification email securely using the backend Express or Netlify SMTP core service.
 */
export async function sendOrderEmailNotification(order: {
  id: string;
  items: { name: string; quantity: number; options?: string; productImage?: string; photoUrl?: string }[];
  recipientName: string;
  recipientPhone: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  streetAddress: string;
  landmark?: string;
  pincode?: string;
  city?: string;
  paymentMode: string;
  total: number;
  date: string;
  status: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Notification Service] Dispatching order email for #${order.id}...`);
    const response = await fetch(getBackendUrl('/api/send-email'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ order })
    });

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    if (!response.ok || !contentType.includes("application/json")) {
      console.error(`[Notification Service] Error dispatching email: ${text}`);
      let parsedErr = 'Server Error';
      try {
        const json = JSON.parse(text);
        parsedErr = json.error || parsedErr;
      } catch (err) {
        // use status code or text snippet
        if (text.includes('Static HTML') || text.includes('<!DOCTYPE') || response.status === 404) {
          parsedErr = `Backend endpoint /api/send-email not found (Status ${response.status}). If deployed, verify Netlify functions configurations or environment keys.`;
        } else {
          parsedErr = text.slice(0, 150) || `HTTP error ${response.status}`;
        }
      }
      return { success: false, error: parsedErr };
    }

    const result = JSON.parse(text);
    if (result && result.success) {
      console.log(`[Notification Service] SMTP dispatch succeeded for ROCX order ${order.id}`);
      try {
        localStorage.setItem(`rocx_email_sent_for_${order.id}`, 'true');
      } catch (e) {
        console.warn("Storage write failed in email notification helper:", e);
      }
      return { success: true };
    } else {
      return { success: false, error: result.error || 'Server rejected SMTP delivery' };
    }
  } catch (err: any) {
    console.error("[Notification Service] SMTP serverless call aborted:", err);
    return { success: false, error: `SMTP Dispatch failed. ${err.message || 'Network unreachable'}` };
  }
}

/**
 * Send login OTP using Fast2SMS BulkV2 API via secure server backend proxy.
 * Includes direct browser-to-Fast2SMS fallback for static hosting platforms (Netlify/Vercel).
 */
export async function sendFast2SMSOTP(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
  let backendError = '';

  // Try Express backend server proxy first
  try {
    const response = await fetch(getBackendUrl('/api/send-otp'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone, otp })
    });

    const text = await response.text();
    let result: any = {};
    try {
      result = JSON.parse(text);
    } catch (jsonErr) {
      console.warn("SMS OTP Proxy returned HTML on static host (Netlify/Vercel). Transitioning to browser direct fallback.");
      throw new Error('STATIC_HOST_NO_BACKEND');
    }

    if (response.ok && result.success) {
      console.log(`Fast2SMS SMS OTP proxied successfully to backend for: ${phone}`);
      return { success: true };
    } else {
      console.error("Backend Fast2SMS OTP Proxy responded with failure:", result);
      backendError = result.error || "SERVER_PROXY_FAILURE";
    }
  } catch (err: any) {
    console.warn("Express backend SMS proxy failed or unreachable. Trying direct browser dispatch fallback...", err);
    backendError = err.message || 'NET_ERROR';
  }

  // --- CLIENT-SIDE DIRECT FALLBACK HANDSHAKE ---
  // Ideal for Zip download deployment on static clouds (Netlify, Vercel, GH Pages)
  try {
    // Read key from client environment
    // @ts-ignore
    let apiKey = (import.meta.env.VITE_FAST2SMS_API_KEY || '').trim();
    if (!apiKey) {
      // Hardcoded fallback for default convenience
      apiKey = 'gF1kuBFGNPefmjPFJ7DVb7ALslFZLcNSCLkfYALnYgRhKUYQEOFCl6qZZ72u';
    }

    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length > 10) {
      formattedPhone = formattedPhone.slice(-10);
    }

    console.log(`[Fast2SMS Direct Fallback] Dispatching code ${otp} directly to ${formattedPhone}...`);
    let clientResult: any = null;

    // DIRECT ROUTE A: POST 'otp' Route (best for bypassing TRAI DLT locks)
    try {
      const apiResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variables_values: otp,
          route: 'otp',
          numbers: formattedPhone
        })
      });
      clientResult = await apiResponse.json();
      console.log("[Fast2SMS Direct Route A Response]:", clientResult);
    } catch (routeErr: any) {
      console.warn('[Fast2SMS Direct Route A Failed]', routeErr);
    }

    // DIRECT ROUTE B: GET 'otp' Route fallback
    if (!clientResult || clientResult.return !== true) {
      try {
        const getUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=otp&variables_values=${encodeURIComponent(otp)}&numbers=${encodeURIComponent(formattedPhone)}`;
        const getResponse = await fetch(getUrl, { method: 'GET' });
        clientResult = await getResponse.json();
        console.log("[Fast2SMS Direct Route B Response]:", clientResult);
      } catch (routeErr) {
        console.warn('[Fast2SMS Direct Route B Failed]', routeErr);
      }
    }

    // DIRECT ROUTE C: POST 'q' (Quick) Route with message string
    if (!clientResult || clientResult.return !== true) {
      try {
        const apiResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Your ROCX OTP is ${otp}. Please do not share it with anyone.`,
            language: 'english',
            route: 'q',
            numbers: formattedPhone
          })
        });
        clientResult = await apiResponse.json();
        console.log("[Fast2SMS Direct Route C Response]:", clientResult);
      } catch (routeErr) {
        console.warn('[Fast2SMS Direct Route C Failed]', routeErr);
      }
    }

    // DIRECT ROUTE D: GET 'q' (Quick) Route fallback
    if (!clientResult || clientResult.return !== true) {
      try {
        const msgUrl = encodeURIComponent(`Your ROCX OTP is ${otp}. Please do not share it with anyone.`);
        const getUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=q&message=${msgUrl}&language=english&flash=0&numbers=${encodeURIComponent(formattedPhone)}`;
        const getResponse = await fetch(getUrl, { method: 'GET' });
        clientResult = await getResponse.json();
        console.log("[Fast2SMS Direct Route D Response]:", clientResult);
      } catch (routeErr) {
        console.warn('[Fast2SMS Direct Route D Failed]', routeErr);
      }
    }

    if (clientResult && clientResult.return === true) {
      console.log("[Fast2SMS] Direct dispatch succeeded! Real wallet balance deducted.");
      return { success: true };
    } else {
      let failMsg = 'Fast2SMS returned failure across all routing paths';
      if (clientResult) {
        if (Array.isArray(clientResult.message)) {
          failMsg = clientResult.message.join(', ');
        } else if (typeof clientResult.message === 'string') {
          failMsg = clientResult.message;
        } else if (clientResult.return === false) {
          failMsg = 'Status is false. This can mean: API key invalid, inactive route permissions, or empty wallet balance on Fast2SMS account.';
        }
      }
      return { success: false, error: `${failMsg} (Backend Error: ${backendError})` };
    }
  } catch (clientErr: any) {
    console.error("[Fast2SMS Fallback Exception]:", clientErr);
    return { success: false, error: clientErr.message || backendError };
  }
}





