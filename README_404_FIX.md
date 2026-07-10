Bhai, **Error 404** ashar ektai karon: PhonePe er ashol (live) server apnar Merchant ID ta khuje pacche na.

Er pichone 2 to karon hote pare:

**Karon 1: Apni Test (Sandbox) mode chalate chaichen, kintu Netlify te 'production' set kora ache.**
Jodi apni just test korar jonne fake payment korte chan, tahole Netlify te `Site configuration > Environment variables` e giye `PHONEPE_ENV`, `PHONEPE_MERCHANT_ID`, ar `PHONEPE_SALT_KEY` ei variable gulo **Delete** kore din. (Tahole o automatic PGTESTPAYUAT86 test id niye kaj korbe).

**Karon 2: Apni ashol Live Payment (Production) nite chaichen, kintu details bhul ache.**
Jodi apni ashol takay payment nite chan, tahole Netlify te apnar ashol `PHONEPE_MERCHANT_ID` ar `PHONEPE_SALT_KEY` add korte hobe.
- Apnar PhonePe Business Dashboard e log in korun.
- Oখান theke apnar ashol Merchant ID ar Salt Key copy kore Netlify te boshan.
- **Dhyan rakhben:** Onek somoy PhonePe te account korlei sathe sathe live API chalu hoy na, oder support theke active korate hoy. Jodi active na thake, tokhono 404 error asbe.

**Ekhon ki korben?**
Jodi apni just test korte chan, Netlify theke PhonePe er variable gulo delete kore abar deploy korun, kaaj hoye jabe.
Aar jodi ashol payment chaichen, tahole ekbar confirm korun je PhonePe theke apnar account er Live API keys enable koreche kina. (PhonePe business dashboard e thake).
