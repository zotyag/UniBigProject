# Funkcionális Specifikáció

## 1. Jelenlegi helyzet

Több oldal is létezik amin különböző önéletrajz sablonok, valamint motivációs levél sablonok szerepelnek. Azonban ezek az oldalak nem adják meg azt a pluszt , hogy a mesterséges intelligencia segítségével a felhasználó hatékonyabban és rövidebb idő alatt, írja meg ezeket a dokumentumokat.

Ezen problémát szeretné ez az oldal kiküszöbölni , még pedig úgy hogy minden szükséges adat megadásával, a mesterséges inteligencia készít egy személyre szabott önéletrajzot vagy motivációs levelet. Ezen felül azoknak is biztosít lehetőséget, akik a megszokott rendszert kedvelték ,és manuálisan szeretnék megírni ezeket a dokumentumokat.

## 2. Vágyálom rendszer

A rendszer célja egy olyan modern és felhasználóbarát webes platform megvalósítása, amely segíti a felhasználókat az álláspályázati dokumentumaik - elsősorban az önéletrajz és a motivációs levél - gyors, pontos és esztétikus elkészítésében.
A rendszer célközönsége azok a pályakezdők, diákok és szakemberek, akik professzionális megjelenésű pályázati anyagokat szeretnének készíteni anélkül, hogy grafikai vagy szövegezési tapasztalattal rendelkeznének.

A webalkalmazás a mesterséges intelligencia segítségével képes önéletrajzot és motivációs levelet generálni a felhasználó által megadott adatok és célpozíció alapján, továbbá lehetőséget biztosít manuális szerkesztésre és egyéni testreszabásra is.
A cél, hogy a felhasználó a teljes álláspályázati anyagát egyetlen felületen hozhassa létre és PDF formátumban exportálhassa.

A vágyálom rendszer főbb jellemzői:

* **Felhasználói fiók kezelés:** A rendszer támogatja a regisztrációt, bejelentkezést és jelszó-visszaállítást. A felhasználó adatai biztonságosan, titkosítva tárolódnak.
* **AI-alapú dokumentumgenerálás:** A mesterséges intelligencia képes a felhasználó által megadott információkból önéletrajzot vagy motivációs levelet létrehozni, strukturált adatformátumban (JSON), amely bármelyik sablonban megjeleníthető.
* **Manuális szerkesztés:** A felhasználó saját maga is létrehozhat vagy módosíthat dokumentumokat az interaktív űrlapok segítségével, akár AI-tól függetlenül is.
* **PDF exportálás:** Az elkészült dokumentumok PDF formátumban letölthetők, sablonstílus szerint formázva.
* **Biztonság és adatvédelem:** A rendszer minden kommunikációt titkosított csatornán keresztül végez, és csak a felhasználó által megadott adatokkal dolgozik.

## 3. Jelenlegi üzleti folyamatok

## 4. Igényelt üzleti folyamatok

A rendszer által támogatott üzleti folyamatok célja, hogy a felhasználók számára teljes körűen lefedjék az önéletrajz és motivációs levél létrehozásának, kezelésének és exportálásának lépéseit.

### Felhasználói regisztráció és bejelentkezés

A rendszerben minden felhasználónak saját fiókja van, amelyhez az általa készített dokumentumok kapcsolódnak.

A regisztráció során a felhasználó megadja a következő adatokat:

* felhasználónév
* e-mail cím
* jelszó

A regisztráció után az adatok az adatbázisban biztonságosan, hash-elve kerülnek tárolásra.
A felhasználó ezután bejelentkezhet a rendszerbe, ahol az azonosítás JWT token alapú hitelesítéssel történik.
A rendszer lehetőséget biztosít a jelszó visszaállítására is, e-mailben küldött hivatkozás segítségével.

### AI alapú önéletrajz-generálás

A felhasználó kitölt egy online űrlapot, amelyben megadja személyes adatait, tanulmányait, szakmai tapasztalatait, készségeit és nyelvismeretét.
A kitöltött űrlap adatait a backend továbbítja egy külső AI API-nak (pl. OpenAI), amely az adatok alapján strukturált formában, JSON objektumként visszaküldi a generált önéletrajz tartalmát.

A felhasználó ezután megtekintheti az AI által javasolt önéletrajzot, szükség esetén módosíthatja a mezőket, majd választhat a rendszerben elérhető sablonok közül.
A kiválasztott sablon alapján a backend elkészíti a  dokumentumot, amelyet a felhasználó PDF formátumban letölthet.

### Manuális önéletrajz készítés

A rendszer lehetőséget biztosít arra is, hogy a felhasználó az önéletrajzát manuálisan, mesterséges intelligencia segítsége nélkül készítse el.
Ehhez egy űrlap áll rendelkezésre, amely ugyanazokat az adatmezőket tartalmazza, mint az AI-generálás folyamata, azonban minden mezőt a felhasználó tölt ki.

### AI alapú motivációs levél generálás

A motivációs levél létrehozása hasonló módon történik, mint az önéletrajz generálása.
A felhasználó megadja az alapvető információkat (pl. pozíció, cég neve, releváns tapasztalatok, személyes célok), majd az AI API ezek alapján elkészíti a személyre szabott motivációs levelet.
A generált szöveg szerkeszthető és PDF-be exportálható.

### Manuális motivációs levél készítés

Az AI-funkciót nem igénylő felhasználók számára a rendszer manuális motivációs levél-készítést is biztosít.
A felhasználó egy szövegszerkesztőhöz hasonló felületen írhatja meg saját motivációs levelét, amelyet letölthet PDF formátumban.

### Jelszó visszaállítás

A felhasználó elfelejtett jelszava esetén a rendszer egy jelszóvisszaállító e-mailt küld a megadott címre, amely tartalmaz egy egyszer használatos linket.
A link segítségével a felhasználó új jelszót adhat meg.
A folyamat során minden adat biztonságosan, titkosított módon kerül kezelésre.

## 5. Követelménylista

### 1. Felhasználókezelés

#### 1.1. Regisztráció

* 1.1.1 A rendszernek lehetővé kell tennie új felhasználók regisztrációját.
* 1.1.2 A regisztráció során felhasználónév, jelszó és e-mail cím megadása kötelező.
* 1.1.3 A rendszer ellenőrizze, hogy a felhasználónév és az e-mail cím egyedi.
* 1.1.4 A jelszót biztonságosan, hash-elve kell tárolni.

#### 1.2. Bejelentkezés

* 1.2.1 A felhasználó be tud jelentkezni érvényes adatokkal.
* 1.2.2 Hibás adatok esetén a rendszer hibaüzenetet ad.
* 1.2.3 A rendszer kezelje a munkameneteket (JWT token vagy session segítségével).

#### 1.3. Jelszó-visszaállítás

* 1.3.1 A felhasználó kérhet jelszó-emlékeztetőt vagy új jelszót az e-mail címe megadásával.
* 1.3.2 A rendszer biztonságos, ideiglenes jelszó-visszaállítási linket küld az e-mail címre.
* 1.3.3 A visszaállítási link csak korlátozott ideig legyen érvényes.

### 2. Önéletrajz (CV) kezelése

#### 2.1 AI alapú CV generálás

* 2.1.1 A rendszernek lehetővé kell tennie a felhasználónak adatai megadását űrlapon keresztül.
* 2.1.2 A rendszer az adatokat elküldi egy AI API-nak (pl. OpenAI API).
* 2.1.3 Az AI válasza JSON formátumban érkezik vissza.
* 2.1.4 A JSON struktúra alapján a rendszer képes PDF-et generálni különböző sablonok szerint.
* 2.1.5 A felhasználó választhat előre definiált sablonok közül.
* 2.1.6 A generált CV-t a felhasználó megtekintheti és szerkesztheti.

#### 2.2. Manuális CV készítés

* 2.2.1 A felhasználó létrehozhat új önéletrajzot manuálisan, AI segítség nélkül.
* 2.2.2 A CV adatait űrlapon keresztül adja meg.
* 2.2.3 A manuálisan megadott adatok JSON formátumban kerülnek mentésre.
* 2.2.4 A felhasználó a CV-t PDF formátumban le tudja tölteni.

### 3. Motivációs levél kezelése

#### 3.1. AI alapú levél generálás

* 3.1.1 A rendszer lehetővé teszi a motivációs levél generálását az AI segítségével.
* 3.1.2 A felhasználó megadhatja a pozíciót, vállalat nevét és egyéb releváns adatokat.
* 3.1.3 Az AI a megadott adatok alapján szöveges motivációs levelet generál.
* 3.1.4 A generált levél szerkeszthető
* 3.1.5 A motivációs levelet PDF formátumban le lehet tölteni.

#### 3.2. Manuális levél készítés

* 3.2.1 A felhasználó képes saját maga motivációs levelet írni űrlapon keresztül.
* 3.2.2 A manuálisan megadott szöveg szerkeszthető
* 3.2.3 A felhasználó a levelet PDF formátumban exportálhatja.

### 4. Biztonság és adatvédelem

#### 4.1 Adatbiztonság

* 4.1.1 A jelszavakat hash-elve kell tárolni.
* 4.1.2 Az AI API kulcsokat csak a szerveroldalon szabad tárolni.
* 4.1.3 Az adatátvitel HTTPS protokollon keresztül történjen.

### 5. Felhasználói felület és élmény

#### 5.1 Általános követelmények

* 5.1.1 Az alkalmazás reszponzív és mobilbarát legyen.
* 5.1.2 A felhasználói felület legyen letisztult és áttekinthető.
* 5.1.3 Az AI hívások ideje alatt betöltés-jelző (loading indicator) jelenjen meg.
* 5.1.4 Minden művelet után visszajelzést kell adni (siker, hiba stb.).

#### 5.2 Felhasználói navigáció

* 5.2.1 A főmenüből elérhetők: Új CV generálás, Profil.
* 5.2.2 A navigáció dinamikusan történik, oldalfrissítés nélkül (SPA).
* 5.2.3 Hibás útvonal esetén 404-es oldal jelenjen meg.

## 6. Használati esetek

## 7. Megfeleltetés, hogyan fedik le a használati esetek a követelményeket

Vegyük ezeket sorba:

* Felhasználókezelés: A felhasználók képesek regisztrálni az oldalra felhasználónév, email és jelszó segítségével. Ezek segítségével betud lépni, viszont ha esetleg a jelszót elfelejti a megadott email címre kap egy jelszó-visszaálitási linket.

* Önéletrajz (CV) kezelése: A felhasználó adatait megadva, AI segítségével kapni fog egy CV-t ami képes szerkezteni később. A felhasználó AI segítség nélkül is készíthet CV-t adatai meg adásával.

* Motivációs levél kezelése: A felhasználó megadja az adatokat a munkáról, ahova szeretné ezt motivációs levelet felhasználni.Ezeket az AI értelmezi, majd generál egy motivációs levelet hozzá, amit a felhasználó letölthet PDF formátumban. A felhasználó ezt manuálisan is elkészítheti, majd letöltheti PDF formában

* Biztonság és adatvédelem: Az admin a jelszavakat biztonságosan eltárolja, amihez csak ő férhet hozzá.Ezen felül AI API-t is eltárolja a szerveroldalon.

* Felhasználói felület és élmény: A felhasználók letisztult reszponzív felületet kapnak , amelynek főoldaláról elérhetik a különböző funkciókat. Az adminak biztositani kell hogy az AI műveletei alatt betöltés jelző, legyen illetve választ kapjon a felhasználó a müvelet sikeresége vagy hibája felől.

## 8. Fogalomszótár
