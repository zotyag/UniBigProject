# Rendszerterv



## 1. A rendszer célja

## 2. Üzleti folyamatok modellje

## 3. Követelmények

## 4. Funkcionális terv



## 5. Fizikai környezet

Az alkalmazás webes platformra készül, amely elsősorban desktop, de mobil eszközökön is elérhető lessz böngészőn keresztül. A modern, reszponzív felület biztosítja a zökkenőmentes felhasználói élményt minden eszközön.

**Fejlesztői eszközök:** Visual Studio Code, WebStorm

**Frontend technológiák:** React.js, HTML5, CSS3

**Backend technológiák:** Node.js, Express.js

**Adatbázis-kezelő rendszerek:** PostgreSQL, pgAdmin, MongoDB, MongoDB Compass

**Külső API-k és szolgáltatások:** Google Gemini API, jsPDF

**Cloud hosting platform:** Microsoft Azure

**Verziókezelés és DevOps:** Git és GitHub



## 6. Absztrakt domain modell

### Domain Objektumok

- User
- Profile
- CV 
- WorkExperience
- Education
- Skill
- Language
- CoverLetter
- Template
- AIRequest

### Főbb folyamatok és domain logika

#### Dokumentumgenerálás folyamat (AI-alapú):

- Felhasználói input: A User kitölti az űrlapot a frontend felületen 
- Validálás: A backend érvényesíti a bemeneti adatokat
- AI modul hívása: AIRequest entitás jön létre, a backend meghívja a Google Gemini API-t
- JSON válasz feldolgozása: Az AI strukturált JSON formátumban visszaküldi a generált tartalmat
- Az AI válasz visszaküldése a felhasználónak
- A felhasználó javíthat a generált JSON értékeken
- Mentés: CV vagy CoverLetter entitás létrehozása
- Sablon kiválasztása: A felhasználó kiválaszt egy Template-et
- PDF generálás: A frontend PDF generáló könyvtár segítségével elkészíti a dokumentumot
- Letöltés: A felhasználó letöltheti a PDF-et

#### Manuális dokumentumkészítés folyamat:

- Űrlap kitöltése: A felhasználó minden mezőt manuálisan kitölt AI segítség nélkül
- Adatok mentése: A rendszer JSON struktúrába menti az adatokat
- Sablon kiválasztása és export: Ugyanaz, mint az AI-alapú folyamatnál

#### Verziókezelés:

- Egy felhasználó több dokumentumverziót tárolhat különböző célpozíciókra
- Minden dokumentumnak egyedi azonosítója és neve van, a nevet a felhasználó adja
- A contentJSON mező rugalmas tartalomtárolást tesz lehetővé

#### Biztonság és adatvédelem a domain szintjén:

- Jelszókezelés: A passwordHash mező bcrypt algoritmussal hash-elt jelszót tárol, így a jelszó soha nem kerül plain text formában mentésre
- Munkamenet-kezelés: JWT token alapú hitelesítés biztosítja, hogy csak a bejelentkezett felhasználók férjenek hozzá saját adataikhoz
- Titkosított kommunikáció: Minden adat HTTPS protokollon keresztül kerül átvitelre
​


## 7. Architekturális terv

![Image of architectural plan](Images/architectural_plan.svg)

### Backend

- Node.js + Express REST API

- Fő modulok: Auth, Users, Documents CV és letter, Templates, PDF, AI Orchestrator, Logging, Export

- JSON a belső tartalomformátum

- AI Orchestrator külső AI API‑t hív személyre szabott CV generáláshoz, bemenet a felhasználói űrlapadat, kimenet strukturált JSON, amely a fiókhoz mentődik és szerkeszthető

- Hitelesítés JWT‑vel, jelszó hash‑elve

- Biztonság: HTTPS kötelező, AI API kulcs csak szerveren, bemeneti validáció minden végponton, OWASP best practice, titkosítás tranzitban és nyugalomban

### Adatbázis

- PostgreSQL a törzs és metaadatokra: users, sessions/tokens, document_index, templates, exports, audit_logs, consents, password_resets; a document_index sor kapcsolja a dokumentum metaadatokat a MongoDB-ben tárolt tartalomhoz

- MongoDB (dokumentum-tároló) a rugalmas tartalomra és verziózásra: documents kollekció a CV/levél teljes JSON tartalommal és szerkesztési állapotokkal, document_versions kollekció visszagörgethető változatokkal, valamint opcionális ai_jobs a bemenet/kimenet és validáció naplózására az AI-folyamatokhoz.

- Indexelés és teljesítmény: MongoDB-ben indexek userId + documentId, updatedAt és type mezőkre a tartalom-lekérésekhez és verziólistákhoz.

### Web kliens

- Reactreszponzív UI, űrlap‑vezérelt adatbevitel, élő validáció és állapotjelzések (loading, hiba) AI hívásoknál

- Funkciók: regisztráció/bejelentkezés, profiladatok, AI‑alapú és manuális CV szerkesztő, sablonválasztó, verziók listája, PDF exportok letöltése.

### AI integráció

- Backend AI Orchestrator modul felel a prompt‑összeállításért, kimenet‑validációért (JSON schema), visszatérési idempotencia‑kulcsért és hibák elegáns degradációjáért (fallback manuális módra)

- AI bemenet: személyes adatok, tapasztalat, képzettség, készségek, célpozíció

- AI kimenet: strukturált CV/levél JSON szerkeszthető mezőkkel és szerkezettel.

- Átláthatóság: AI‑használat jelzése, manuális felülbírálhatóság, export előtti előnézet

### PDF és sablonok

- Sablonmotor több stílussal, szöveg‑alapú PDF generálás képi szöveg beágyazása nélkül az ATS kompatibilitásért.

- Export szolgáltatás soros feldolgozással és várólistával, hogy elkerülje renderelési tüskék okozta erőforrás‑kimerülést.

- Export naplózás verzió és sablonazonosítóval, re‑generálhatóság biztosítása azonos tartalomból.

    ​
### API vázlat

- Auth: POST /auth/register, POST /auth/login, POST /auth/forgot, POST /auth/reset, POST /auth/refresh.

- Profile: GET/PUT /users/me.

- Documents:
    - CV: POST /cv (AI), POST /cv/manual, GET /cv/:id, PUT /cv/:id, GET /cv, POST /cv/:id/export.
    - Cover letter: POST /letters (AI), POST /letters/manual, GET/PUT /letters/:id, GET /letters, POST /letters/:id/export.

- Templates: GET /templates, GET /templates/:id (admin: POST/PUT/DELETE).

- Compliance: GET /me/consents, POST /me/consents, DELETE /me/account (törlés).

    ​

### Üzemeltetés

Architektúra Azure Virtual Machine‑en: 1–2 darab Linux alapú VM a Backend Gateway és a háttér‑workerek futtatására, PostgREST a VM‑en szolgáltatásként fut a PostgreSQL mellett, MongoDB külön VM‑en vagy ugyanazon a példányon dedikált erőforrás‑profilokkal, hálózati szegmentációval.



## 8. Adatbázis terv

## 9. Implementációs terv

## 10. Tesztterv

## 11. Telepítési terv

## 12. Karbantartási terv
