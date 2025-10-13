# Követelmény Specifikáció

## 1. Jelenlegi helyzet

## 2. Vágyálom rendszer

A rendszer célja, hogy egy modern, reszponzív és felhasználóbarát webalkalmazást biztosítson a felhasználók számára, mely lehetővé teszi önéletrajzok és motivációs levelek létrehozását, valamint letöltését AI által generált és manuális (AI nélkül) módon.

A cél, hogy a felhasználó minimális erőfeszítéssel, akár pár kattintással professzionális dokumentumokat készíthessen, miközben teljesen kontrollt tart a tartalom felett.
Az AI a felhasználó által megadott adatokból strukturált JSON-alapú dokumentumot generál, amelyből többféle sablon alapján készíthető PDF formátumú CV.

A motivációs levél generálása hasonló módon történik: a felhasználó megad néhány alapinformációt (pl. célzott pozíció, cég neve, tapasztalatok), és az AI ennek megfelelően személyre szabott levelet készít.

## 3. Jelenlegi üzleti folyamatok

## 4. Igényelt üzleti folyamatok

A rendszer működésének fő üzleti folyamatai az alábbi lépések köré szerveződnek:

### Regisztráció és bejelentkezés

A felhasználó egy egyszerű űrlapon regisztrál a platformra, megadva e-mail címét, felhasználónevét és jelszavát.
A jelszó titkosítva kerül tárolásra.
Sikeres regisztráció után a felhasználó be tud jelentkezni a rendszerbe, ahol CV-t és motivációs levelet tud létrehozni.
A felhasználó jelszóemlékeztetőt kérhet e-mailben, ha bejelentkezés során elfelejtené a jelszavát.

### CV készítés (AI segítségével)

A felhasználó egy űrlapon megadja alapadatait (név, elérhetőség, tapasztalat, képzettség, nyelvismeret, stb.)
A megadott adatok a backendre kerülnek, ahol az AI-t meghívó modul JSON formátumban kap választ.
Az AI által generált adatstruktúra a felhasználó fiókjához mentésre kerül, és abból egy PDF dokumentum készíthető.

### CV készítés manuálisan

A felhasználó teljes mértékben saját maga is összeállíthatja az önéletrajzát egy interaktív űrlapon keresztül.
Az adatok a rendszerben ugyanúgy JSON formátumban kerülnek tárolásra, mint az AI-generált dokumentumok, így azok is bármikor PDF-fé konvertálhatók.

### Motivációs levél generálása (AI segítségével)

A felhasználó megadja az alapvető paramétereket (cég neve, pozíció, rövid leírás, tapasztalatok), majd az AI ezek alapján létrehoz egy személyre szabott motivációs levelet.
A generált szöveg szerkeszthető és PDF-be exportálható.

### Motivációs levél manuális készítése

A felhasználó manuálisan is létrehozhat motivációs levelet a platformon belül, amely később exportálható PDF formátumban.

## 5. A rendszerre vonatkozó szabályok

## 6. Követelménylista

## 7. Fogalomszótár
