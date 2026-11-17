# 🏰 Szabolcsfoglaló — 3 Fős Online Multiplayer Kvíz- és Stratégiai Játék

Autentikus, Honfoglaló stílusú területhódító és általános műveltségi társasjáték Szabolcs-Szatmár-Bereg vármegye 16 történelmi városával.

---

## 🚀 Telepítés & Futtatás Render.com-on (Ingyenesen)

A játék készen áll az 1 kattintásos élesítésre a **[Render.com](https://render.com/)** platformon:

1. **Töltsd fel a projektet GitHub-ra:**
   - Hozz létre egy új publikus vagy privát repót a GitHubon.
   - Töltsd fel bele ennek a mappának a tartalmát (a `node_modules` automatikusan figyelmen kívül van hagyva a `.gitignore` miatt).

2. **Hozz létre egy Web Service-t a Render.com-on:**
   - Lépj be a [dashboard.render.com](https://dashboard.render.com/) felületre.
   - Kattints a **New +** $\rightarrow$ **Web Service** gombra.
   - Válaszd ki a feltöltött GitHub repódat.

3. **Beállítások a Render felületén:**
   - **Name:** `szabolcsfoglalo` (vagy amit szeretnél)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** `Free`

4. **Kész! Kattints a `Deploy Web Service` gombra!**
   - A Render legenerálja az éles URL-edet (pl. `https://szabolcsfoglalo.onrender.com`).
   - Nyisd meg te és a 2 barátod akár telefonról, akár laptopról!

---

## 🎮 Hogyan Működik a 3 Fős Online Multiplayer?

1. **Szoba Létrehozása (Szobagazda):**
   - A kezdőképernyőn válaszd az **"Online 3 Fő"** módot.
   - Írd be a neved, és kattints a **"🏰 Új Szoba Létrehozása (Gazda)"** gombra.
   - Megnyílik a **Várterem (Lobby)**, ahol kapsz egy egyedi, könnyen beírható szobakódot (pl. `VAR42`) és egy közvetlen meghívó linket.
   - A **"📋 Kód másolása"** vagy **"🔗 Meghívó link másolása"** gombbal küldd el a 2 barátodnak (pl. Messengeren, Discordon, WhatsAppon).

2. **Csatlakozás a Szobához (Barátok):**
   - A barátaid rákattintanak a kapott linkre (ekkor a szobakód automatikusan beíródik), vagy beírják a kapott szobakódot a kezdőképernyőn, és megnyomják a **"Csatlakozás"** gombot.
   - A 2. csatlakozó lesz a **Zöld Vezér**, a 3. csatlakozó a **Kék Vezér**.

3. **Hadjárat Indítása:**
   - Amikor mind a 3 játékos csatlakozott, a szobagazda megnyomja a **"⚔ Hadjárat Indítása (3/3)"** gombot.
   - *(Tipp: Ha csak ketten vagytok, a gazda a "🤖 Bot hozzáadása" gombbal feltöltheti a 3. helyet egy gépi vezérrel is!)*

4. **A Játék Menete valós időben:**
   - **Bázisválasztás:** Mindenki csak a saját körében választhat bázisvárost a térképen.
   - **Honfoglalás:** A műveltségi kérdések pontosan egyszerre ugranak fel mindhárom képernyőn. Mindenki a saját telefonján/gépén válaszol vagy tippel.
   - **Csaták & Várrombolás:** A támadások animációi, a várrombolások és a pontszámok szinkronizálva jelennek meg mind a 3 játékosnál.
