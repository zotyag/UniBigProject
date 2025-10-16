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

## 8. Adatbázis terv

## 9. Implementációs terv

## 10. Tesztterv

## 11. Telepítési terv

## 12. Karbantartási terv
