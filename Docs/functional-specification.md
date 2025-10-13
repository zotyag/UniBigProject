# Funkcionális Specifikáció

## 1. Jelenlegi helyzet

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

## 6. Használati esetek

## 7. Megfeleltetés, hogyan fedik le a használati esetek a követelményeket

## 8. Fogalomszótár
