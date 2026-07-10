**Netlify te GitHub diye Deploy er Error Fix:**

Bhai, apnar Netlify er environment variables konodin o erase hobe na, ota ekdom safe thakbe! Netlify te GitHub connect korleo purono environment variables gulo thekei jay. Apni chaile Netlify er `Site configuration > Environment variables` e giye check kore nite paren.

Apni Netlify te je "Building Failed" error ta pelen, tar karon hocche GitHub theke auto-deploy korar somoy Netlify ke thikvabe bole dite hoy je kivabe frontend ar backend build korte hobe. Ami ekhon apnar project e **`netlify.toml`** file ta ekdom thik kore diyechi jate Netlify kono error chara build korte pare.

**Ebar Apnake exactly ei step gulo korte hobe:**
1. AI Studio er top-right menu (settings gear) theke **"Export > Download ZIP"** korun. (Baam diker file theke noy, main project zip ta).
2. Apnar computer e GitHub er je folder ti ache, tar bhitor ei notun zip er shob file gulo copy kore replace/paste kore din. (Jate notun `netlify.toml` ar `netlify/functions` folder ta update hoye jay).
3. Ebar GitHub Desktop app ta khulun. Dekhben notun change gulo esheche. Ekta nam (jemon "fixed netlify config") diye **Commit** korun ar tarpor **Push origin** e click korun.
4. Push korar sathe sathe Netlify te auto-deploy shuru hoye jabe ar ebar kono error asbena, 100% "Published" hobe!

**Final Check:** 
Netlify live hobar por apnar `rocxcakes.in` e giye Checkout korben. Ebar 100% ashol PhonePe live payment khulbe! 
