Bhai, apni je screenshot ta diyechen ote clear dekha jacche je PhonePe er payment page e upor-e `PGTESTPAYUAT86` lekha asche. Er mane holo Netlify theke production er mode ta thik bhabe apply hoche na, ba `PHONEPE_ENV` variable ta Netlify theke read hote parche na, jar jonne o automatic test/sandbox mode-e chole jacche.

**Ami code-e ekta choto fix kore diyechi:**
Ekhon theke Netlify jodi `PHONEPE_ENV=production` thik bhabe read nao korte pare, kintu apni Netlify dashboard e ashol `PHONEPE_MERCHANT_ID` set kore thaken (jar nam e 'PGTEST' nei), tahole ei code ta nijey thekei dhore nebe je apni production e achen, aar live payment e niye jabe.

**Apnake ekhon ki korte hobe?**
1. Ami ei update ta kore diyechi `netlify/functions/api.js` file er moddhe.
2. Apni just ekbar file gulo (ekhon je zip download korben theke) extract kore GitHub-e notun update gulo upload kore din (jemon age korlen).
3. Ebar Netlify te build hoye gelei, jokhon checkout korben tokhon aar `PGTESTPAYUAT86` dekhabe na, apnar ashol live PhonePe Payment page khule jabe. (Ekdom ashol merchant nam dekhabe upore).

**Mone Rakhben:** Netlify er dashboard e **Site configuration > Environment variables** e giye apnar ashol `PHONEPE_MERCHANT_ID` aar `PHONEPE_SALT_KEY` jeno thik thik bhabe add kora thake setao ekbar check kore neben, noyto kintu kaaj korbena.
