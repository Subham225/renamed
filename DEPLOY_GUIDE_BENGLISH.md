# ROCX CAKES & GIFTS - SELF-HOSTING DEPLOYMENT GUIDE (BENGLISH)

Bhai, tor Google AI Studio-te server background-e automatic background process-e dynamic port override manage kore, tai database, OTP, r email perfect dispatch hoy. 
Kintu, jokhon zip download kore Netlify-te direct host korbi, tokhon standard Node.js Express server (`server.ts`) static server-e kaaj kore na. Ekhon tor email fail hobe na, ami er unique system automatic solve kore diyechi!

Ami tor project-e **Netlify Serverless Functions** setup kore diyechi. Ebar Netlify-te upload korle tor Gmail direct dynamic process-e perfect secure runtime-e dispatch hobe.

---

## ⚡ QUESTION: Order direct same device-er Admin Panel-e show hoy, kintu onno device-e keno dekhay na?
### 🟥 Karon (Why this happens):
Jokhoni tui ekta order korish, tor code order-tike offline backup optimization-er jonye temporary browser-er local memory-te (`localStorage`) instant save kore container dynamic screen update kore dey. Tar sathe sathe block-ta Firebase Firestore secure cloud database-e write korar try kore.

* **Same Device-e keno show hocche:** Order set korar sathe sathe local storage standard data layout update kore state key store update korche, tai same device visual flow success dekhay.
* **Other Device-e keno show hocchena:** Firebase Firestore Cloud database server connection properly active na thakay back-end sync call error payload pathaye dynamic upload save fail kore. Fole visual state database connect na hoye onno laptop/phone order list empty-i theke jay!

---

## 🛠️ SOLVE KORAR UPAY (Step-by-Step guide to get Firebase credentials):

Toke tor dynamic secure realtime sync control pack active korar jonye tor **Google Firebase Account** settings active korte hobe:

### Step 1: Firebase Project and Database Active Korun
1. Google search korun: **Firebase Console** (ba click [firebase.google.com](https://console.firebase.google.com)).
2. Log in using your email account and click **"Create a Project"** (name standard like: `RocxCakesDatabase`).
3. **Database setup (CRITICAL):** Project loading screen complete hole:
   * Left Menu block-e **Build** (or Product Categories) > click **Firestore Database**.
   * Click **"Create Database"** screen button.
   * Option aashbe, select **"Start in Test Mode"** (ba security rules rule checking panel database-e rules manually check koro: `allow read, write: if true;` code edit setup e add koro). Click **Enable / Next**.

### Step 2: Authentication setup (Email/Google login integration)
1. Firebase Left Menu-te **Build** panel check kore click on **Authentication**.
2. **Sign-in method** tab key value open korun, select **Email/Password** or **Google** options r click **Enable**.

### Step 3: API Key, Project ID, App ID key dynamic fetch koro:
1. Firebase console active setting tab-e (Top Left next to Project Overview gear icon) click click **Project settings**.
2. Bottom-e scrolling down dynamic check screen checking block-e **"Your apps"** dynamic config active dekhba.
3. Jodi kono application dynamic link na code e thake, click on the **Web code icon ( `</>` )**.
4. Enter dynamic app nick-name (e.g. `RocxWebClient`) and click **Register app**.
5. Screen block-e instant ekti config code load hobe code panel dynamic check correct syntax representation:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_EXCLUSIVE_API_KEY",
     authDomain: "yourproject-xxx.firebaseapp.com",
     projectId: "yourproject-xxx",
     storageBucket: "yourproject-xxx.firebasestorage.app",
     messagingSenderId: "502160...",
     appId: "1:502160...:web:..."
   };
   ```

---

## 🚀 SOLUTION A: Netlify-te Deploy Korar Easy Steps (Recommended)
Netlify serverless mode backend run korte automatic setup code generate kore diyechi (using `/netlify/functions/api.ts` r `netlify.toml`).

Ebar tor manually kichui korte hobe na, shudhu nicher details follow korbi:
1. **Zip Code Upload:** Github sync ba zip code Netlify drag & drop dashboard-e upload korun.
2. **Settings configuration (Environment variables on Netlify Dashboard):**
   * Netlify **Site Settings** > **Environment variables** tab-e jaan.
   * Add key values with:
     * **`VITE_FIREBASE_API_KEY`** = `YOUR_EXCLUSIVE_API_KEY` *(Step 3 copy)*
     * **`VITE_FIREBASE_AUTH_DOMAIN`** = `yourproject-xxx.firebaseapp.com`
     * **`VITE_FIREBASE_PROJECT_ID`** = `yourproject-xxx`
     * **`VITE_FIREBASE_STORAGE_BUCKET`** = `yourproject-xxx.firebasestorage.app`
     * **`VITE_FIREBASE_MESSAGING_SENDER_ID`** = `502160...`
     * **`VITE_FIREBASE_APP_ID`** = `1:502160...:web:...`
     * `GMAIL_USER` = `subhamdiscord09@gmail.com`
     * `GMAIL_APP_PASS` = `fmsw aoun gpgg vkol`
     * `VITE_FAST2SMS_API_KEY` = `gF1kuBFGNPefmjPFJ7DVb7ALslFZLcNSCLkfYALnYgRhKUYQEOFCl6qZZ72u`

Netlify absolute automatic routing config (`netlify.toml` layout redirects config) dynamic browser requests handle kore secure lambda email call successfully deliver kore debe, r Firebase credentials setup hole automatic device connection and real-time syncing solid load hobe constant!

---

## ⚡ SOLUTION B: Direct Full-Stack Platform-e Deploy (Render/Railway)
Tui jodi standard server setup-e run korte chao jekhane static background normal node background command run korbi, tokhon eta follow korun:

1. **Build Command**: `npm install && npm run build`
2. **Start Command**: `npm run start` (or `node dist/server.cjs`)
3. **Environment variables settings check:**
   * Same as Solution A setup. (GMAIL_USER, GMAIL_APP_PASS, layout-r correct Firebase key configuration add static credentials settings variables mapping load korba).

---

## 🔐 Configuration Keys Summary in .env (Local development optimization):
```env
# Notification
GMAIL_USER=subhamdiscord09@gmail.com
GMAIL_APP_PASS=fmswaoungpggvkol
VITE_FAST2SMS_API_KEY=gF1kuBFGNPefmjPFJ7DVb7ALslFZLcNSCLkfYALnYgRhKUYQEOFCl6qZZ72u

# Firebase Database
VITE_FIREBASE_API_KEY=your_exclusive_firebase_api_key_from_dashboard
VITE_FIREBASE_AUTH_DOMAIN=yourproject-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yourproject-xxx
VITE_FIREBASE_STORAGE_BUCKET=yourproject-xxx.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Bas, ebar Netlify-te deploy korlei flawlessly dynamic notifications dispatch hobe self-hosted domains-e Gmail active thakbe direct multidevice database syncing live complete support checking running load setup running active!

