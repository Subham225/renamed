**Netlify te keno Network Error hocche?**
Netlify te apni jodi shudhu `dist` folder ta drag-and-drop koren, tahole shudhu frontend ta upload hoy. Kintu PhonePe payment er jinish gulo (API) apnar backend e ache. Frontend jokhon payment korar jonno backend ke request pathacchhe, backend na thakar karone "Network Error" asche.

### Netlify te Backend + Frontend eksathe kivabe deploy korben?

Netlify te backend (serverless functions) run korate hole `dist` folder drag and drop korle hobe na, apnake GitHub er sathe connect kore korte hobe ba Netlify CLI diye korte hobe. Ami apnar code e `netlify/functions/api.ts` toiri kore diyechi, ebar nicher step gulo follow korun:

**Shob Theke Sohoz Upay (GitHub diye):**
1. Apnar ei puro project folder ta (sudhu `dist` noy, puro folder ta jekhane `package.json` ache) GitHub e ekta notun repository baniye push kore din.
2. Ebar Netlify (app.netlify.com) e login korun.
3. **"Add new site"** -> **"Import an existing project"** theke **GitHub** select korun.
4. Apnar GitHub repository ta select korun.
5. "Build settings" e automatically eshe jabe:
   - Base directory: `(faka thakbe)`
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **"Deploy Site"** e click korun.

Bas! Ebar Netlify automatically apnar frontend build korbe ebong `netlify/functions` theke backend API gulo live kore debe. 

**Note for PhonePe:**
Deploy hoye gele, Netlify er Site settings -> Environment Variables e giye ei 3 te variable must add korben (prod er jonno):
- `PHONEPE_ENV` = `production`
- `PHONEPE_MERCHANT_ID` = `M22E1O78XXTHQ` (apnar prod merchant id)
- `PHONEPE_SALT_KEY` = `504e73ba-71d3-4e00-83dd-37afb14609a0` (apnar prod salt key)
- `PHONEPE_SALT_INDEX` = `1`

*(Variable add korar por ekbar Netlify theke site ta "Rebuild" ba "Trigger deploy" korben).*
Ebar dekhte paben Payment ekdom thik thak kaj korche kono Network Error chara!
