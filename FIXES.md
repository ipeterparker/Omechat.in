# Omechat – bug fixes (Nov 2026)

Fake "Active" count, "I Agree" box aur saare ads (Adsterra) **jaise the waise hi hain** – unhe touch nahi kiya.

## Server (omechat-server/server.js)
1. **CRITICAL – site freeze (ReDoS):** banned-word regex me quantifier ke andar quantifier tha. Ek 34-character message
   (`tel` + `eeee…` + `x`) server ko 7 second hang karta tha, thoda lamba message hamesha ke liye – poori site (sab users) band.
   Ab worst case ~1 ms. Naya regex purane jaisa hi detect karta hai (35 test cases same result).
2. Message/edit ab regex se pehle 500 (reply 120) characters pe kaat diye jaate hain (pehle 200 KB tak scan hota tha).
3. `null` / number / string payload se handler crash ho jaata tha aur user "Looking for someone..." me atak jaata tha. Ab safe.
4. Start bahut tez dabane par server chup-chaap ignore karta tha (user hamesha searching me). Ab `slow-down` bhejta hai.
5. `signal` me sirf offer/answer/ice pass hota hai. `country` sirf 2 letters (A-Z).

## Text chat (message-panel.tsx)
6. Page chhodne par queue/chat se bahar nahi nikalta tha (stranger ghost se match ho jaata) – ab `stop` bhejta hai.
7. Offline hone par message "sent" dikhta tha par kabhi pahunchta nahi tha – ab text box me rukta hai.
8. Multi-line text paste karte hi bina Enter dabaye send ho jaata tha – ab nahi.
9. "Chat server is not connected" aur "too fast" wale notice start screen par dikhte hi nahi the – ab dikhte hain.
10. Stop dabane ke time match aa jaaye to ghost chat ban jaati thi – ab ignore + server ko dobara stop.

## Video chat (video-room.tsx)
11. Camera/mic allow kiye bina Start dabane par stranger ko black screen dikhti thi – ab pehle permission maangta hai.
12. Camera flip fail hone par camera band reh jaata tha – ab purane camera pe wapas.
13. Permission prompt + Start ek saath hone par camera stream leak (light on rehti thi) – fix.
14. Idle me Report dabane par "Report sent" dikhake search shuru ho jaati thi – ab sirf chat ke dauran.
15. Offline message, page chhodne par stop, toast timer overlap, late `matched` – same fixes as text chat.

## Baaki
16. **Age check:** US time zones me 17 saal ke user ko 18 maana jaata tha (date UTC me parse hoti thi); 31 Feb jaisi date bhi chalti thi.
17. Google sign-in: khaali/failed response se broken identity ban sakti thi (aur `name.trim()` crash) – fix. Avatar empty name pe crash – fix.
18. `/api/country`: "T1"/"XX" jaise fake codes ab country nahi maane jaate.
19. Menu me "Report a problem / Contact" ab hamesha dikhta hai (Guidelines page wahi bolta hai, pehle env var ke bina gayab tha).
20. Menu aur theme picker Escape se band hote hain. Light mode me gender buttons ke borders dikhte hain.
21. Privacy page me ads, device-ID aur "other people see" ki jaankari joda (code ye sab pehle se karta tha).
22. `public/omechat-html/` hataya: purana prototype, `chat.html` ke broken links, Google me duplicate page.
23. `.gitignore` me `*.tsbuildinfo` joda.

## Maine jaan-boojhkar nahi badla (aapko pata hona chahiye)
- **Ads iframe:** `ads.tsx` ke iframes sandbox nahi hain, isliye ad script page ka localStorage padh sakti hai (Google profile wagairah).
  `sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"` lagane se risk kam hota hai, par Adsterra ke live
  server ke bina main test nahi kar sakta ki ads tab bhi dikhenge ya nahi – isliye ads ko haath nahi lagaya.
- **Google login sirf browser me check hota hai.** Server `google: true` aur age/gender pe bharosa karta hai, to koi
  jaanbujhkar socket se direct video join kar sakta hai. Pakka fix: server pe Google token verify karna.
- **TURN server:** `NEXT_PUBLIC_TURN_URL/USER/PASS` set karein, warna kuch networks par video connect nahi hoga.
- **Unused packages:** `three`, `@react-three/*`, `@base-ui/react`, `cn`, `class-variance-authority` kahin use nahi hote.
  `pnpm remove ...` se hata sakte hain (lockfile update ke saath).
- `next.config.mjs` me `ignoreBuildErrors: true` hai – TypeScript errors build me chhup jaate hain.

---

# Round 2 (27 Nov 2026) – text chat + home page

Jaise the waise chhode: fake "Active" count, mobile home ka real count, "I Agree" box, ads, poora Video Chat.

## Text chat
1. **Privacy:** video ke liye Google login kiya ho to bhi text chat ab hamesha anonymous (pehle naam/photo/age/gender stranger ko dikhte the).
2. Server so raha ho / connect ho raha ho to ab "Connecting to the server…" dikhta hai (pehle spinner atka rehta tha).
3. Connect hote hi `join` do baar jaata tha (naya match turant "Stranger left") – ab ek hi baar.
4. Chat khatam hone ke 30 sec baad bina bataye nayi search shuru ho jaati thi (chat mit jaati thi) – hataya. Ab sirf Start dabane par.
5. Typing dots atak jaate the (server rate-limit `typing:false` gira deta tha) – ab "typing" sirf ek baar jaata hai, aur 6 sec baad dots apne aap hat jaate hain.
6. Desktop par message select/copy nahi hota tha – ab hota hai. Right-click par Reply / Edit / Copy menu (phone par pehle jaisa swipe + long-press).
7. Har notice ke peeche "You can press Start…" lagta tha (searching me bhi) – ab sirf jab chat sach me khatam ho. "Away too long" ka galat message theek kiya.
8. Country guess ab sirf time zone se (browser language se "US" ban jaata tha).

## Server (omechat-server/server.js)
9. WebSocket ab sirf `ALLOWED_ORIGINS` wali sites se (pehle CORS sirf polling pe lagta tha). **Agar kisi aur URL se test karo (jaise vercel.app) to Render me `ALLOWED_ORIGINS` me jodo.**
10. Jo user tab band karke chala gaya uska chat 2 minute baad band hota hai aur dusre ko "Stranger disconnected" milta hai (pehle hamesha ke liye ghost room).
11. Word filter false positives: "paid advice", "paid add", "paid advance" ab block nahi hote ("paid ad/ads/advertising/service/promo" pehle jaise block).

## Home page / site
12. Jhoothe claims hataye: "Encrypted & Moderated", "24/7 Moderated", "120+ Countries", "no trace", "moderators around the clock". About page: Google video ke liye zaroori hai, yeh likha.
13. Privacy page: video me stranger ko IP dikh sakta hai – likha. Guidelines/Privacy/Terms me meta description joda.
14. Menu: focus andar jaata hai, Tab menu ke andar rehta hai, band hone par button pe wapas.
15. Security headers (Permissions-Policy, X-Frame-Options, nosniff). Sitemap me fixed date. Manifest colors light theme jaise.
16. `.gitignore` me `.env`; `tsconfig.tsbuildinfo` hataya.

## Jaanbujhkar nahi badla
- Ban 7-strangers rule aur per-device block (aapka design). IP-based ban nahi lagaya, kyunki ek hi mobile network ke bahut log ek IP share karte hain.
- `package.json` ke unused packages: lockfile ke saath mismatch hoke Vercel build fail ho sakta hai. Hatane ho to Termux me `pnpm remove three @react-three/fiber @react-three/drei @types/three @base-ui/react cn class-variance-authority` chalao aur lockfile bhi commit karo.
- `ignoreBuildErrors: true` – abhi build chalakar check nahi kar sakta, isliye nahi badla.
- socket.io: server (`omechat-server/package.json`) me `socket.io`, site me `socket.io-client` pehle se listed hain, kuch alag install nahi karna. Render har deploy par `npm install` khud chalata hai.

---

# Round 3 – Ads (components/ads.tsx)

Ads wahin dikhte hain jahan pehle dikhte the (home phone banner, home laptop banner, home native, chat start screen). Adsterra keys/URLs same.

1. **Security:** ads ab sandboxed iframe me chalte hain – ad script aapke localStorage (Google login, profile, device ID) ko nahi padh sakti, aur khud se page ko redirect nahi kar sakti. Ad dikhna, new tab me khulna aur tap par advertiser kholna allowed hai.
2. **Native ad** pehle seedhe page me chalta tha (poori site tak access). Ab wo bhi iframe me hai, aur height ad ke hisaab se apne aap set hoti hai.
3. **Ads gayab na hon – safety net:** har ad page andar se bataata hai ki ad sach me draw hua ya nahi. Agar sandbox me 8 sec tak kuch draw nahi hua (kuch ad scripts sandbox me nahi chalti), to wahi ad purane tareeke (bina sandbox) se dobara load hota hai.
4. Agar ad blocker / no-fill ki wajah se native ad khaali raha to khaali dabba nahi chhodta (height 0).
5. Ad ke links jinka apna target nahi hota ab new tab me khulte hain (pehle chhote ad box ke andar hi khul jaate).
6. Sab kuch band karke purana tareeka chahiye to `components/ads.tsx` me `SANDBOX_ADS = false` kar do.

---

# Round 4 – baaki bugs (27 Nov 2026)

Jaise the waise chhode: fake "Active" count aur "I Agree" box.

1. **Server freeze (ReDoS) – bacha hua hissa:** `server.js` ke "service" pattern me `s*` aur `[a-z]*` overlap karte the; ek 500-character message server ko ~0.5 sec rok deta tha (20 msg/10 sec se poori site freeze). Ab ~1-5 ms. 2 lakh random strings pe purane aur naye regex ka result same.
2. Safety page se "reviewed by our moderators" hataya (report abhi email/log se dekhi jaati hai).
3. **Video typing dots atakte the:** ab "typing" ek baar (aur 3 sec me dobara) jaata hai, har key par nahi; 6 sec baad dots apne aap hat jaate hain. Text chat me bhi 3-sec resend joda (lamba type karne par dots jaldi na hatein).
4. **Theme menu ka "Change" button** text chat se hataya (wo Google login hata deta tha aur kuch badalta nahi tha).
5. **Video: mic na ho / block ho** to ab sirf camera se chalta hai (message dikhta hai "No microphone found"); pehle poora video chat nahi chalta tha.
6. Friends ab naam + photo se alag pehchane jaate hain (same naam ke 2 friends overwrite nahi hote).
7. Video friend-request banner ka timer saaf hota hai (nayi request ka banner jaldi gayab nahi hota).
8. Chat page ka `color-scheme` theme ke hisaab se (White = light, baaki = dark): profile setup ke date box ka calendar icon White theme me bhi dikhta hai.
9. Google photo `<img>` pe `referrerPolicy="no-referrer"`.
10. OG image: "No signup for text chat" (video ko Google sign-in chahiye).

## Jaanbujhkar nahi badla
- **Google login ka server-side verify:** isme Google token roz expire hota hai (1 ghanta) aur abhi site token save nahi karti, isliye galat karne par sab video users bahar ho sakte the. Alag se, dhyan se karna hai.
- `ignoreBuildErrors: true` – yahan build chalakar check nahi kar sakta, isliye nahi badla.
- Unused packages (`three`, `@react-three/*` ...) – lockfile mismatch se Vercel build fail ho sakta hai, isliye nahi hataye.

---

# Round 5 – baaki bugs + Beauty hataya (27 Nov 2026)

Jaise the waise chhode: fake "Active" count aur "I Agree" box.

1. **Video se Beauty filter hataya** (wo sirf aapki apni screen par dikhta tha). "Video quality: Auto" ka nakli label bhi hataya.
2. **Sign out:** ab login, profile aur friends teeno device se hatte hain. Profile me email bhi save hota hai, to doosre Google account ko puraane ka profile kabhi nahi milta.
3. **Profile page:** DOB khaali karke Save nahi hota (18+ check bypass band).
4. **Ads:** sandbox ab kabhi apne aap nahi hatta (slow net par ad script ko localStorage nahi milta). Khaali native ad chhupa rehta hai.
5. **Server origins:** `http://127.0.0.1:3000` bhi allowed. LAN IP se test karna ho to Render/Termux me `ALLOWED_ORIGINS` set karo.
6. **Skip/Next offline:** offline hote hue ab nahi chalta (pehle stranger 2 min atka rehta tha).
7. (Server na mile to 60 sec timeout wala change wapas le liya – pehle jaisa hi hai.)
8. **Video join do baar jaata tha** jab server abhi connect ho raha ho – ab ek hi baar.
9. "About me" aur "Interests" hataye (kahin use nahi hote the).
10. Home par "Free & Anonymous" ki jagah "Text chat is free & anonymous".
11. Country ke liye 150+ time zones (pehle sirf 12).
12. Friend request ka jawab ab reconnect ke baad bhi pahunchta hai.
13. Copy button http par bhi chalta hai.
14. Video: chat resume na ho paye to "Searching for a new stranger" message dikhta hai.
15. Video: ek kharab ICE candidate baaki ko nahi rokta.
