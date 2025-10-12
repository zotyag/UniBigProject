# Követelmény Specifikáció


## 1. Jelenlegi helyzet


## 2. Vágyálom rendszer


## 3. Jelenlegi üzleti folyamatok

A jelenlegi üzleti folyamat elsősorban a hagyományos önéletrajz‑készítésre épül, amely sok időt, kézi munkát és előzetes tapasztalatot igényel. A legtöbb álláskereső különböző sablonokat tölt le az internetről, majd szövegszerkesztőben manuálisan szerkeszti saját adatait. Ez a folyamat nemcsak időigényes, hanem sok esetben sablonos eredményhez vezet. Emellett a felhasználók gyakran bizonytalanok abban, hogy hogyan fogalmazzanak meg szakmai tapasztalatukat vagy milyen formátumban mutassák be képességeiket, ezért a végeredmény gyakran nem tükrözi megfelelően a jelentkező kompetenciáit.

A munkáltatók oldaláról nézve a beérkező önéletrajzok minősége és struktúrája nagyon eltérő, ami megnehezíti az összehasonlítást és a kiválasztási folyamatot. A digitális környezetben egyre inkább igény van automatizált, jól strukturált dokumentumokra, azonban a jelenlegi megoldások nem kínálnak személyre szabott, mégis professzionális eredményt minden felhasználónak.

### Fő fájdalompontok

- A következetes testreszabás jelentős időterhet ró, mert minden pályázathoz külön kiemelést és átrendezést igényel a tartalom.

- Az ATS-ek érzékenyek a formázásra és kulcsszavakra. Táblázatok, oszlopok vagy nem szabványos elemek ronthatják a feldolgozhatóságot.

- Bizonytalanság a fájlformátumok között: egyes források DOCX-et, mások jól felépített, szöveg-alapú PDF-et kérnek.

- Több önéletrajzverzió fenntartása külön célpozíciókra nehezen követhető fájlkezelést és verziókezelési problémákat eredményez.​



## 4. Igényelt üzleti folyamatok


## 5. A rendszerre vonatkozó szabályok

### Kötelező jogszabályok EU

EU GDPR Általános Adatvédelmi Rendelet: személyes adatok jogalapja, átláthatóság, érintetti jogok, adatminimalizálás, megőrzés, adatbiztonság, adattovábbítás; külön figyelem a toborzási kontextusra és az érintetti jogok önkiszolgáló érvényesítésére.

EDPB Útmutatók a jogos érdeken alapuló adatkezelésről és kapcsolódó gyakorlati értelmezések, amelyek a toborzási folyamatoknál tipikus jogalap részleteit tisztázzák.

Foglalkoztatási és toborzási adatkezelésre vonatkozó hatósági iránymutatások (pl. ICO Employment practices: recruitment and selection), amelyek konkrét elvárásokat fogalmaznak meg jelölti adatok kezelésére.

### Iparági megfelelés és toborzási ajánlások

GDPR‑kompatibilis toborzási gyakorlatok: adatkezelési tájékoztatók, megőrzési idők, törlési/hozzáférési kérelem folyamatai, adatfeldolgozói szerződések a beszállítókkal.

ATS‑kompatibilitási elvek: géppel olvasható CV‑struktúra, kulcsszó‑illesztés, táblázatok és összetett grafikai elemek kerülése a megbízható parse érdekében.

Exportformátumok követelményei: DOCX vagy szöveg‑alapú PDF előnyben a HR‑rendszerek feldolgozhatósága érdekében, a képként beágyazott szöveg kerülésével.

### Információbiztonsági és adatvédelmi szabványok

ISO/IEC 27001 – Információbiztonság Irányítási Rendszer (ISMS): az elvárt kontrollok és kockázatkezelés keretrendszere felhőalapú, személyes adatot kezelő webes szolgáltatásokhoz.

ISO/IEC 27002 – Biztonsági intézkedések gyakorlati kódexe: hozzáférés‑szabályozás, naplózás, titkosítás és beszállítói kockázatkezelés támogatása.

ISO/IEC 27701 – Adatvédelem kiterjesztés az ISMS‑re: GDPR‑összhang erősítése a privacy irányítási rendszer formalizálásával.

### Mesterséges intelligencia (AI) – felelős használat

Profilozás és automatizált döntéshozatal átláthatósági kötelezettségei a jelölti adatkezelésben. AI‑javaslatoknál világos tájékoztatás és emberi felülbírálhatóság biztosítása.

Adatvédelmi hatásvizsgálat (DPIA) szükségességének vizsgálata, ha az AI‑funkciók a jelölteket lényegesen érinthetik vagy nagy kockázat merül fel.

### Adatkezelési műszaki‑szervezési elvárások

Biztonságos fejlesztés és üzemeltetés: titkosítás átvitel és tárolás közben, naplózás, hozzáférés‑kezelés, sebezhetőség‑kezelés, beszállítói DPA‑k.

Megőrzési és törlési politika: időzített törlés, önkiszolgáló export/törlés a felhasználói fiókban, dokumentált megőrzési idők a CV‑k és metaadatok esetén.

    Megjegyzés: a fenti elemek közül a GDPR és az ahhoz kapcsolódó hatósági útmutatók kötelezőek az EU/EEA területén. Az ATS‑kompatibilitás iparági elvárás, amely jelentősen javítja a CV‑k feldolgozhatóságát és a kiválasztási esélyeket. az ISO‑szabványok és WCAG erősen ajánlottak a biztonság, minőség és hozzáférhetőség bizonyítható szintjének eléréséhez.
​


## 6. Követelménylista


## 7. Fogalomszótár

* ATS (Applicant Tracking System): Jelentkezőkövető rendszer, amely a beérkező önéletrajzokat fogadja, indexeli, kulcsszavak alapján szűri és rangsorolja a HR folyamatban.

* ATS‑kompatibilitás: Az a tulajdonság, hogy a CV géppel jól feldolgozható. Egyszerű szerkezet, szabványos címsorok, táblázatok és képek kerülése, szövegként mentett tartalom.

* Verziókezelés: Az önéletrajz több változatának karbantartása különböző célpozíciókra, visszakereshető előzményekkel és egyértelmű elnevezéssel.

* GDPR (Általános Adatvédelmi Rendelet): Uniós rendelet, amely a személyes adatok kezelésének jogalapját, elveit, érintetti jogokat és a megfelelés követelményeit határozza meg.

* DPIA (Adatvédelmi hatásvizsgálat): Kockázatértékelés magas kockázatú adatkezelések előtt (pl. kiterjedt profilozás), a kockázatcsökkentő intézkedések meghatározására.

* EDPB‑útmutató: Az Európai Adatvédelmi Testület iránymutatása, amely a GDPR értelmezéséhez és gyakorlati alkalmazásához segítséget ad.

* ICO Employment Practices: A brit felügyelet toborzási és kiválasztási adatkezelési iránymutatásai, best practice referenciaként.

* WCAG: Webes akadálymentességi irányelvek a hozzáférhető felhasználói felület és űrlapok megvalósításához

* DPA (Data Processing Agreement): Adatfeldolgozói szerződés, amely az adatkezelő–adatfeldolgozó viszony jogi és biztonsági feltételeit rögzíti.

