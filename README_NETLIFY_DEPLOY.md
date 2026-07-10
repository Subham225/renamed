**PhonePe Network Error Fix:**
Bhai, apni AI Studio te je Network Error pacchilen PhonePe sandbox e, seta ami thik kore diyechi! Ekhon apni try kore dekhun, PhonePe payment page ekdom thik vabe khulbe test mode e. Backend server er port issue chilo, ami solve kore diyechi.

---

**Netlify Zip Upload Keno Fail Korche?**
Apni age jokhon zip upload korten, tokhon apnar project e kono "Backend (Server)" chilona. Kintu ekhon PhonePe er jonno ekta secure backend toiri kora hoyeche (`netlify/functions/api.js`). 

Ekhon theke direct AI Studio er zip Netlify te drag & drop korle Netlify seta nite parbena, karon code gulo ke age **Build / Compile** korte hobe. 

**Ebar Apnar Kache 2 to Option ache:**

**Option 1: GitHub diye kora (Shob theke Best & Easy)**
Apnar GitHub a fail korchilo karon apni GitHub web e directly file upload korchilen, jekhane 100 tar beshi file upload hoy na, ar dorkari file gulo (jemon `package.json`) upload hoyni. 
*Kivabe thik korben:*
1. Apnar computer e **GitHub Desktop** app ta download korun.
2. AI Studio theke Zip ta download kore extract korun.
3. GitHub Desktop diye puro folder ta ekbare push kore din. (Tahole kono file miss hobe na).
4. Tarpor Netlify te giye GitHub connect korun. Automatically build hoye jabe.

**Option 2: Computer e Build kore Zip upload kora (Jodi GitHub na chan)**
Jodi apni konomotei GitHub use korte na chan, tahole apnake manual build korte hobe:
1. AI Studio theke project er Zip ta download kore apnar PC te extract korun.
2. Apnar PC te `Node.js` install thakte hobe.
3. Extract kora folder e giye Terminal / Command Prompt khulun.
4. Run korun: `npm install`
5. Run korun: `npm run build:netlify`
6. Eta complete hole dekhben `READY_FOR_NETLIFY_DROP` name ekta notun folder toiri hoyeche.
7. **Sudu matro oi `READY_FOR_NETLIFY_DROP` folder ta ke drag & drop kore Netlify te upload korun.** (Puro project ta upload korben na).

Bhai ami apnar PhonePe issue 100% fix kore diyechi. Ebar apni bash e GitHub Desktop diye upload korun, dekhben magic er moto Netlify te live hoye jabe!
