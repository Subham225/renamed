import { useState, useEffect } from 'react';
import { X, User, Edit2, Check, ShoppingBag, ChevronRight, Smartphone, Mail, AlertTriangle, Loader2 } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { sendFast2SMSOTP } from '../services/notificationService';

declare global {
  interface Window {
    google: any;
  }
}

// Netlify ba local testing e ID tokens safe format custom parse helper
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('[Jwt Decoder failed]:', e);
    return null;
  }
}

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLogin: (emailOrPhone: string, type: 'google' | 'phone') => void;
  onLogout: () => void;
  userEmail: string;
  userPhone: string;
  loginType: 'google' | 'phone' | null;
  orders: any[];
  onTrackOrder?: (orderId: string) => void;
}

export default function ProfileDrawer({
  isOpen,
  onClose,
  isLoggedIn,
  onLogin,
  onLogout,
  userEmail,
  userPhone,
  loginType,
  orders,
  onTrackOrder,
}: ProfileDrawerProps) {
  // Local state for profile editing (when logged in)
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(userEmail || localStorage.getItem('rocx_user_email') || '');
  const [editedPhone, setEditedPhone] = useState(userPhone || localStorage.getItem('rocx_user_phone') || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const [deviceOrderIds, setDeviceOrderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('rocx_device_order_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const lastPlaced = localStorage.getItem('rocx_last_placed_id');
    return lastPlaced ? [lastPlaced] : [];
  });

  // Authentication Interface States
  const [activeTab, setActiveTab] = useState<'google' | 'phone'>('google');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [otpStage, setOtpStage] = useState<'send' | 'verify'>('send');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');

  // Synchronize local edit states when props update
  useEffect(() => {
    setEditedName(userEmail || localStorage.getItem('rocx_user_email') || '');
    setEditedPhone(userPhone || localStorage.getItem('rocx_user_phone') || '');
  }, [userEmail, userPhone]);

  // Synchronically update device-specific order IDs when drawer opens
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('rocx_device_order_ids');
      let ids: string[] = [];
      if (saved) {
        try {
          ids = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
      const lastPlaced = localStorage.getItem('rocx_last_placed_id');
      if (lastPlaced && !ids.includes(lastPlaced)) {
        ids.push(lastPlaced);
        try {
          localStorage.setItem('rocx_device_order_ids', JSON.stringify(ids));
        } catch (e) {
          console.error(e);
        }
      }
      setDeviceOrderIds(ids);
    }
  }, [isOpen]);

  const deviceOrders = orders.filter((order) => {
    return deviceOrderIds.includes(order.id);
  });

  // Handle Google Login via Firebase (signInWithPopup) - Working out-of-the-box everywhere!
  const handleFirebaseGoogleLogin = async () => {
    setIsLoading(true);
    setAuthError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      if (result.user && result.user.email) {
        const email = result.user.email;
        const displayName = result.user.displayName || email.split('@')[0];
        
        onLogin(email, 'google');
        localStorage.setItem('rocx_user_email', email);
        localStorage.setItem('rocx_user_name', displayName);
        if (result.user.photoURL) {
          localStorage.setItem('rocx_user_avatar', result.user.photoURL);
        }

        // Prefill edit state and close drawing
        setEditedName(email);
        onClose();
      } else {
        throw new Error('Google Sign-In failed to retrieve email info from Firebase.');
      }
    } catch (err: any) {
      console.error('[Firebase Google Login failure]:', err);
      if (err?.code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup block hoyeche. Apnar browser settings e popups allow deba dorkar.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setAuthError('Firebase a ei notun Netlify domain ti add kora nei. Firebase Console -> Authentication -> Settings -> Authorized domains e giye apnar notun domain ti add korun.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        setAuthError('Sign-in process close kora hoyeche.');
      } else if (err?.code === 'auth/configuration-not-found' || err?.message?.includes('configuration-not-found') || err?.code?.includes('configuration-not-found')) {
        setAuthError('OAuth configuration settings paoya janni! Firebase Console page-e Google Sign-In template enable korlei eta theek hoye jabe. Plz follow simple steps: 1. Google Search-e firebase console e jaan -> 2. Build > Authentication select korun -> 3. "Sign-in method" tab e jaan -> 4. "Add new provider" click kore "Google" select korun -> 5. Client support @gmail select kore "Save" dynamically click korun. Bas Google Login flawlessly chalbe!');
      } else {
        setAuthError(err?.message || 'Firebase Auth Google sign-in verify korte problem hoyeche.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Mobile SMS OTP - Fast2SMS SMS dispatcher API handler
  const handleSendSMSOTP = async () => {
    const formattedPhone = phoneInput.trim().replace(/\D/g, '');
    if (!formattedPhone || formattedPhone.length !== 10) {
      setAuthError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    setAuthError('');
    setOtpSuccessMsg('');

    try {
      // Create a secure 6-digit random number code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      console.log(`[Fast2SMS OTP Dispatch Gateway] Dispatched code: ${generatedCode} to +91 ${formattedPhone}`);
      
      // Dispatch the actual OTP SMS using Fast2SMS Premium Endpoint Gateway
      const res = await sendFast2SMSOTP(formattedPhone, generatedCode);
      
      if (res.success) {
        setSentOtp(generatedCode);
        setOtpStage('verify');
        setOtpSuccessMsg(`OTP sent successfully to +91 ${formattedPhone}. It may take up to 2 minutes to arrive.`);
      } else {
        throw new Error(res.error || 'Failed SMS route validation. Please check Fast2SMS API status or balance.');
      }
    } catch (err: any) {
      console.error('[Fast2SMS dispatcher failure]:', err);
      setAuthError(err.message || 'Error occurred sending mobile verification OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile SMS OTP - verification and local login register handler
  const handleVerifyOTP = () => {
    setAuthError('');
    const enteredCode = otpInput.trim().replace(/\s/g, '');
    
    if (enteredCode.length !== 6) {
      setAuthError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (enteredCode === sentOtp) {
      // Success! OTP perfectly verified
      const namePlaceholder = `User_${phoneInput.slice(-4)}`;
      onLogin(phoneInput, 'phone');
      localStorage.setItem('rocx_user_phone', phoneInput);
      localStorage.setItem('rocx_user_name', namePlaceholder);
      
      setEditedPhone(phoneInput);
      onClose();
    } else {
      setAuthError('Incorrect OTP Code. Please double-check your SMS inbox and retry.');
    }
  };

  const handleSaveProfile = () => {
    setProfileError('');
    const nameTrimmed = editedName.trim();
    const phoneTrimmed = editedPhone.trim().replace(/\D/g, '');

    if (!nameTrimmed) {
      setProfileError("Please enter a valid Customer Name or Email.");
      return;
    }
    if (phoneTrimmed && phoneTrimmed.length < 10) {
      setProfileError("Please enter a valid 10-digit mobile number.");
      return;
    }

    onLogin(nameTrimmed, 'google');
    localStorage.setItem('rocx_user_email', nameTrimmed);
    if (phoneTrimmed) {
      localStorage.setItem('rocx_user_phone', phoneTrimmed);
      onLogin(phoneTrimmed, 'phone');
    }

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetProfile = () => {
    onLogout();
    setEditedName('');
    setEditedPhone('');
    setPhoneInput('');
    setOtpInput('');
    setSentOtp('');
    setOtpStage('send');
    setShowConfirmLogout(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between text-left">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-5 h-5 text-pink-600" />
                Celebration Account
              </h2>
              <button
                id="close-profile-btn"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-800 p-1 bg-white hover:bg-slate-100 border border-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Scroller */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="space-y-6">
                
                {isLoggedIn ? (
                  // --- VIEW A: PROFILE OF AN AUTHENTICATED USER ---
                  <>
                    {/* User Profile Bio Box */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl relative overflow-hidden shadow-lg border border-slate-800">
                      <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-10">
                        <User className="w-40 h-40" />
                      </div>
                      
                      <span className="text-[9px] bg-pink-600 text-white px-2 py-0.5 rounded font-extrabold uppercase tracking-widest">
                        Customer Profile
                      </span>

                      <h4 className="text-sm font-black mt-3 mb-1 truncate text-slate-50 font-mono tracking-wider">
                        {userEmail || localStorage.getItem('rocx_user_name') || 'Guest Customer'}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {userPhone ? `+91 ${userPhone}` : 'No phone number saved'}
                      </p>
                      
                      <button
                        onClick={() => {
                          setIsEditing(!isEditing);
                          setProfileError('');
                          setSaveSuccess(false);
                        }}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-full transition cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Editable Profile Form */}
                    {(isEditing) ? (
                      <div className="space-y-4 animate-fade-in bg-slate-50 p-5 rounded-2.5xl border border-slate-200/50 text-left">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1">
                          🔧 Update Profile Details
                        </h3>
                        {profileError && (
                          <div className="bg-red-50 text-red-950 p-2.5 rounded-xl border border-red-200 text-[10px] font-bold leading-normal flex items-start gap-1.5 animate-fade-in">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-650 shrink-0 mt-0.5" />
                            <span>{profileError}</span>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Save your standard details below to automatically pre-fill names and phone numbers on every checkout!
                        </p>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-550 font-extrabold uppercase block">Your Name / Email</label>
                            <input
                              type="text"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              placeholder="Enter your email or name"
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold tracking-normal focus:outline-none focus:ring-1 focus:ring-pink-500 shadow-2xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-550 font-extrabold uppercase block">Your Mobile phone</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-xs">+91</span>
                              <input
                                type="tel"
                                maxLength={10}
                                value={editedPhone}
                                onChange={(e) => setEditedPhone(e.target.value.replace(/\D/g, ''))}
                                /***** Ensure input is strictly numeric *****/
                                placeholder="Enter 10-digit number"
                                className="w-full pl-12 pr-4 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-pink-500"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2.5 pt-1">
                            <button
                              onClick={handleSaveProfile}
                              className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer text-center"
                            >
                              Save Details
                            </button>
                            <button
                              onClick={() => setIsEditing(false)}
                              className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      saveSuccess && (
                        <div className="bg-emerald-50 text-emerald-950 p-3 rounded-xl border border-emerald-200 text-[10.5px] font-bold leading-normal flex items-center gap-1.5 animate-fade-in">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          Profile details updated successfully! These will be auto-filled during checkout.
                        </div>
                      )
                    )}

                    {/* Celebration order registry */}
                    <div className="space-y-3">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />
                        Active & Past Celebration Registers ({deviceOrders.length})
                      </span>

                      <div className="space-y-2">
                        {deviceOrders.map((order) => (
                          <div
                            id={`profile-order-${order.id}`}
                            key={order.id}
                            onClick={() => {
                              if (onTrackOrder) {
                                onTrackOrder(order.id);
                              }
                            }}
                            className="border border-slate-200 p-3.5 rounded-2xl flex justify-between items-start hover:bg-slate-50 transition-all cursor-pointer hover:border-pink-300"
                          >
                            <div className="text-left">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-mono font-black text-slate-800">#{order.id}</span>
                                <span className="bg-rose-550/10 text-rose-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-rose-100">
                                  {order.status}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-400 block mt-1">{order.date}</span>
                              <p className="text-xs text-slate-600 font-semibold mt-1.5 truncate max-w-[200px]">
                                {order.items?.map((it: any) => `${it.name} (x${it.quantity})`).join(', ') || 'Cakes/Gifts'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-slate-900 block">₹{order.total}</span>
                              <span className="text-[9px] text-indigo-550 font-bold flex items-center justify-end mt-1">
                                Track <ChevronRight className="w-3 h-3 text-indigo-500 ml-0.5" />
                              </span>
                            </div>
                          </div>
                        ))}

                        {deviceOrders.length === 0 && (
                          <div className="py-8 text-center border border-dashed border-slate-200 rounded-2.5xl text-slate-400 text-[10px] font-medium font-mono">
                            No orders placed on this device yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  // --- VIEW B: CORE AUTHENTICATION GATEWAY (NEW EXCLUSIVE UPGRADE) ---
                  <div className="space-y-5 animate-fade-in text-left">
                    <div className="bg-pink-50/50 border border-pink-100 p-4.5 rounded-3xl flex items-start gap-3">
                      <div className="p-2.5 bg-pink-550/10 text-pink-700 rounded-2xl">
                        <User className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                          Unlock Celebration Gateway
                        </h4>
                        <p className="text-[10px] text-slate-550 leading-relaxed mt-0.5">
                          Sign in securely to track baking registers, claim premium members discounts, and pre-fill booking profiles.
                        </p>
                      </div>
                    </div>

                    {/* Authenticated Tabs Selection Toggle */}
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/40">
                      <button
                        onClick={() => {
                          setActiveTab('google');
                          setAuthError('');
                        }}
                        className={`flex-1 py-2.5 text-center text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'google' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        <Mail className="w-3.5 h-3.5 text-red-500" />
                        Google Login
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('phone');
                          setAuthError('');
                        }}
                        className={`flex-1 py-2.5 text-center text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'phone' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        <Smartphone className="w-3.5 h-3.5 text-pink-600" />
                        Mobile OTP
                      </button>
                    </div>

                    {/* Error Feedback Display */}
                    {authError && (
                      <div className="bg-red-50 text-red-950 p-3 rounded-xl border border-red-200/80 text-[10px] font-bold leading-normal flex items-start gap-1.5 animate-bounce-short">
                        <AlertTriangle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {/* Success Message Banner */}
                    {otpSuccessMsg && (
                      <div className="bg-emerald-50 text-emerald-950 p-3 rounded-xl border border-emerald-200 text-[10px] font-semibold leading-normal flex items-start gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{otpSuccessMsg}</span>
                      </div>
                    )}

                    {/* Tab 1: Google Native API Auth */}
                    {activeTab === 'google' && (
                      <div className="space-y-4 py-2 animate-fade-in">
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Apnar Google Account (Gmail) diye secure login korun. Eta Google Dynamic Sign-in use kore standard real-time login complete korbe, kono manual token setup ba Client ID update lagbe na.
                        </p>

                        {/* Beautiful Custom Google Button triggering Firebase Sign-In popup */}
                        <div className="w-full flex justify-center py-2">
                          <button
                            onClick={handleFirebaseGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow px-6 py-3 rounded-2xl text-xs font-black transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                          >
                            {isLoading ? (
                              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                            ) : (
                              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l2.85-2.22.81-.6z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z" />
                              </svg>
                            )}
                            {isLoading ? 'Securing Connection...' : 'Continue with Google'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Mobile number OTP Login (Fast2SMS) */}
                    {activeTab === 'phone' && (
                      <div className="space-y-4 py-1 animate-fade-in">
                        {otpStage === 'send' ? (
                          <>
                            <p className="text-[11px] text-slate-500 leading-normal">
                              Enter your 10-digit Indian mobile number. An authentic OTP (One-Time Password) will be sent using Fast2SMS Premium sms dispatch services, decuting billing from our corporate server wallet.
                            </p>

                            <div className="space-y-1.5">
                              <label className="text-[9px] text-slate-550 font-extrabold uppercase block">Mobile Phone Number</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-extrabold font-mono text-xs">+91</span>
                                <input
                                  type="tel"
                                  maxLength={10}
                                  value={phoneInput}
                                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                                  placeholder="Enter 10-digit mobile number"
                                  className="w-full pl-13 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-pink-500 shadow-2xs"
                                />
                              </div>
                            </div>

                            <button
                              onClick={handleSendSMSOTP}
                              disabled={isLoading}
                              className="w-full relative py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                              Send Verification OTP
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="bg-slate-50 p-4 border border-slate-200/50 rounded-2.5xl space-y-3.5">
                              <div className="flex border-b border-slate-100 pb-2.5 justify-between items-center text-xs">
                                <span className="font-mono text-slate-500">Phone: <b>+91 {phoneInput}</b></span>
                                <button
                                  onClick={() => {
                                    setOtpStage('send');
                                    setOtpInput('');
                                    setAuthError('');
                                    setOtpSuccessMsg('');
                                  }}
                                  className="text-pink-650 hover:underline font-extrabold text-[10px] uppercase tracking-tighter"
                                >
                                  Edit Number
                                </button>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[9px] text-slate-550 font-extrabold uppercase block">
                                  Enter 6-Digit OTP Code
                                </label>
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={otpInput}
                                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                  placeholder="Enter verification code"
                                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-center text-sm font-black font-mono tracking-[0.5em] focus:outline-none focus:ring-1 focus:ring-pink-500 shadow-2xs"
                                />
                              </div>

                              <button
                                onClick={handleVerifyOTP}
                                className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                Verify & Sign In
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>

            {/* Reset saved profile details information */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 text-center text-[10px]">
              {isLoggedIn ? (
                showConfirmLogout ? (
                  <div className="space-y-2 animate-fade-in block w-full">
                    <p className="text-slate-600 font-black text-[10px] font-mono tracking-wide">Are you sure you want to sign out?</p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={handleResetProfile}
                        className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-3.5 py-1.5 rounded-lg transition duration-150 cursor-pointer text-[9px] uppercase tracking-wider"
                      >
                        Yes, Logout
                      </button>
                      <button
                        onClick={() => setShowConfirmLogout(false)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-3.5 py-1.5 rounded-lg transition duration-150 cursor-pointer text-[9px] uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmLogout(true)}
                    className="text-red-500 hover:text-red-700 font-extrabold cursor-pointer transition-colors hover:underline block mx-auto text-center font-mono tracking-wider uppercase text-[10px]"
                  >
                    Clear Saved Details & Logout
                  </button>
                )
              ) : (
                <span className="text-slate-400 font-extrabold block mx-auto text-center font-mono">
                  🔐 Default Sender Details Gateway
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

