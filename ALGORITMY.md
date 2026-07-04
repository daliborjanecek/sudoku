# Algoritmy — jak Sudoku funguje uvnitř

Tento dokument podrobně popisuje algoritmy použité ve widgetu, hlavně
v `src/generator.ts` (generátor a solver) a část detekce konfliktů v
`src/SudokuGame.ts`. Vše v generátoru jsou **čisté funkce bez DOM**, takže se
dají samostatně testovat.

Obsah:

1. [Reprezentace dat a indexování](#1-reprezentace-dat-a-indexování)
2. [Bitové masky — klíčová optimalizace](#2-bitové-masky--klíčová-optimalizace)
3. [Generování plné mřížky (`fillGrid`)](#3-generování-plné-mřížky-fillgrid)
4. [Solver s heuristikou MRV (`fillFromConstraints`)](#4-solver-s-heuristikou-mrv-fillfromconstraints)
5. [Počítání řešení a test unikátnosti (`countSolutions`)](#5-počítání-řešení-a-test-unikátnosti-countsolutions)
6. [Kontrola konfliktů v zadání (`hasInitialConflict`)](#6-kontrola-konfliktů-v-zadání-hasinitialconflict)
7. [Generování hádanky podle obtížnosti (`generate`)](#7-generování-hádanky-podle-obtížnosti-generate)
8. [Validace řešení (`isValidSolution`)](#8-validace-řešení-isvalidsolution)
9. [Detekce konfliktů v UI (`computeConflicts`)](#9-detekce-konfliktů-v-ui-computeconflicts)
10. [Časová složitost a praktický výkon](#10-časová-složitost-a-praktický-výkon)

---

## 1. Reprezentace dat a indexování

Mřížka 9×9 má 81 buněk. Používají se dvě reprezentace:

- **Navenek** (výstup, persistence): **81znakový řetězec**, kde každý znak je
  číslice `1`–`9` a tečka `.` znamená prázdnou buňku. Čte se po řádcích
  (řádek 0, pak řádek 1, …).
- **Uvnitř výpočtů**: `Int8Array(81)`, kde `0` = prázdná buňka a `1`–`9` =
  číslice. Typované pole je rychlé a šetří paměť.

Převody zajišťují `stringToGrid` a `gridToString`.

Pozici buňky `i` (0–80) převedeme na souřadnice jednoduchou aritmetikou:

```
řádek  (row) = ⌊ i / 9 ⌋
sloupec (col) = i mod 9
index buňky  = row * 9 + col
```

Index bloku 3×3 (0–8), do kterého buňka patří:

```
boxOf(row, col) = ⌊ row / 3 ⌋ * 3 + ⌊ col / 3 ⌋
```

Tahle čísla (řádek, sloupec, blok) jsou tři „jednotky" (units), ve kterých se
v sudoku žádná číslice nesmí opakovat.

---

## 2. Bitové masky — klíčová optimalizace

Naivní kontrola „smím sem dát číslici X?" prochází celý řádek, sloupec a blok
(funkce `canPlace`, použitá při počátečním plnění a validaci). To je
srozumitelné, ale pomalé, když se volá milionkrát.

Solver proto sleduje pro každou jednotku **bitovou masku obsazených číslic**:

- `rows[9]`, `cols[9]`, `boxes[9]` — každé je 16bitové celé číslo.
- Pro číslici `v` reprezentuje bit `1 << v`. Číslice 1 → bit 1, …, číslice 9 →
  bit 9 (bit 0 se nepoužívá).
- Konstanta `ALL_DIGITS = 0b1111111110` má nastavené bity 1–9.

Pro buňku na `(row, col)` v bloku `b` pak **množinu povolených číslic**
spočítáme jedinou operací:

```
avail = ALL_DIGITS & ~(rows[row] | cols[col] | boxes[b])
```

`rows[row] | cols[col] | boxes[b]` je sjednocení všech čísel, která už buňku
„blokují". Negace a průnik s `ALL_DIGITS` dá bity číslic, které ještě jdou
použít. Nad touto maskou pracujeme bitovými triky:

- **Počet kandidátů**: `popcount(avail)` (počet jedničkových bitů). Používá
  Kernighanův trik `n &= n - 1`, který v každém kroku zhasne nejnižší
  nastavený bit.
- **Iterace přes kandidáty**: `bit = m & -m` izoluje nejnižší nastavený bit;
  `m ^= bit` ho odebere. Tím projdeme kandidáty jeden po druhém.
- **Číslo z bitu**: `v = 31 - Math.clz32(bit)` (pozice nejvyšší jedničky;
  protože je jediná, je to přímo hodnota číslice).

Vkládání/rušení číslice při backtrackingu je pak konstantní:

```
rows[r] |= bit;  cols[c] |= bit;  boxes[b] |= bit;   // vlož
rows[r] ^= bit;  cols[c] ^= bit;  boxes[b] ^= bit;   // vrať (undo)
```

Masku inicializuje `buildMasks` jedním průchodem mřížky.

---

## 3. Generování plné mřížky (`fillGrid`)

Než vznikne hádanka, je potřeba kompletně vyplněná validní mřížka. Dělá to
**backtracking s náhodným pořadím kandidátů**:

1. Najdi první prázdnou buňku. Pokud žádná není, mřížka je hotová → `true`.
2. Vyrob seznam číslic `[1..9]` a **náhodně ho zamíchej** (Fisher–Yates,
   funkce `shuffle`).
3. Pro každou číslici v tomto náhodném pořadí: pokud ji sem `canPlace`
   dovolí, vlož ji a **rekurzivně** pokračuj na další buňku.
4. Když se podřešení nezdaří, číslici vrať zpět (`= 0`) a zkus další.

Náhodné míchání kandidátů zajišťuje, že pokaždé vznikne **jiná** plná mřížka —
jinak by backtracking vždy generoval tutéž. Protože každá částečně vyplněná
validní mřížka jde dokončit, první větev obvykle projde téměř bez vracení a
generování je velmi rychlé.

---

## 4. Solver s heuristikou MRV (`fillFromConstraints`)

Solver doplní zadanou (částečně vyplněnou) mřížku do úplného řešení. Také
backtracking, ale s důležitou heuristikou **MRV — Minimum Remaining Values**
(„nejvíc omezená buňka první"):

1. Z bitových masek spočítej pro **každou** prázdnou buňku počet kandidátů
   `popcount(avail)`.
2. Vyber buňku s **nejmenším** počtem kandidátů.
   - Pokud má některá buňka **0 kandidátů**, je to slepá ulička → okamžitě se
     vracíme (větev nemá řešení).
   - Pokud najdeš buňku s **1 kandidátem**, hledání ukonči hned — lepší už to
     nebude (`if (cnt === 1) break`).
3. Do vybrané buňky zkoušej její kandidáty (přes bitové triky), po každém
   vložení rekurzivně řeš zbytek, při neúspěchu udělej undo.

**Proč MRV?** Naivní solver, který bere „první prázdnou buňku", se na řídkých
mřížkách (málo zadaných čísel) zacyklí do obrovského prohledávacího stromu.
MRV vybírá buňky, kde je nejméně možností, takže se větvení drží malé a slepé
uličky se odhalí brzy. V praxi to znamená zrychlení o několik řádů — sudoku se
řeší v jednotkách milisekund.

`solve(puzzle)` je tenká obálka: převede řetězec na mřížku, zkontroluje
počáteční konflikty (viz níže) a zavolá `fillFromConstraints`. Vrátí
81znakové řešení, nebo `null`, pokud řešení neexistuje.

---

## 5. Počítání řešení a test unikátnosti (`countSolutions`)

Korektní sudoku musí mít **právě jedno** řešení. K tomu slouží varianta
solveru, která místo zastavení u prvního řešení **počítá řešení** — ale
s chytrým **předčasným ukončením**:

- `countSolutions(grid, limit)` prochází stejným MRV backtrackingem jako
  solver, ale když dojde k úplnému vyplnění, zvýší počítadlo a **pokračuje
  v hledání dalších** řešení.
- Jakmile počet dosáhne `limit`, hledání se utne (`if (count >= limit) return`).

Pro test unikátnosti stačí `limit = 2`: nezajímá nás, kolik přesně řešení
existuje, jen jestli je víc než jedno. Proto:

```
hasUniqueSolution(puzzle)  ⇔  countSolutions(grid, 2) === 1
```

Díky early-exitu je test levný — jakmile se najde druhé řešení, hned končíme.

---

## 6. Kontrola konfliktů v zadání (`hasInitialConflict`)

Backtrackovací solver kontroluje jen **nově** vkládané číslice. Pokud už
samotné zadání obsahuje duplicitu (např. dvě pětky v jednom řádku), solver to
nepozná a může se zacyklit do velmi dlouhého prohledávání.

`hasInitialConflict` proto jedním průchodem ověří, že **žádná** předvyplněná
číslice neporušuje pravidla: pomocí bitových masek pro každou zadanou buňku
zkontroluje, jestli její bit už v řádku / sloupci / bloku není. Pokud ano,
vrátí `true`.

Volá se na začátku `solve` i `hasUniqueSolution` — neplatné zadání tak rychle
a korektně vrátí „bez řešení" / „není unikátní" místo zbytečného hledání.
(Tahle kontrola byla i příčinou jednoho dřívějšího zaseknutí testů: bez ní
solver na záměrně nevalidním vstupu běžel prakticky donekonečna.)

---

## 7. Generování hádanky podle obtížnosti (`generate`)

Vlastní tvorba zadání spojuje předchozí kroky:

1. **Plná mřížka.** `fillGrid` vytvoří kompletní validní řešení; uloží se jako
   `solution`.
2. **Cílový počet prázdných buněk.** Z obtížnosti se vezme rozsah (tabulka
   níže) a v něm se **náhodně** zvolí konkrétní cíl `targetEmpty`.
3. **Odebírání v náhodném pořadí.** Indexy 0–80 se zamíchají (Fisher–Yates).
   Postupně se zkouší buňky vyprázdnit:
   - Buňku dočasně vynuluj.
   - Spusť `countSolutions(…, 2)`. Pokud má mřížka **stále právě jedno**
     řešení, odebrání ponech a zvyš počítadlo odebraných.
   - Pokud by tím vzniklo víc řešení, číslici **vrať zpět** a pokračuj další
     buňkou.
4. **Konec.** Skončí se po dosažení `targetEmpty`, nebo až se vyčerpá pořadí
   buněk. Když cíle nejde dosáhnout při zachování unikátnosti, generátor
   skončí dřív s méně prázdnými buňkami — a to je v pořádku.

Výsledkem je `{ puzzle, solution }`, oba jako 81znakové řetězce. **Každé
vygenerované zadání má z konstrukce právě jedno řešení**, protože odebrání,
které by unikátnost porušilo, se nikdy nepřijme.

### Mapování obtížnosti na počet prázdných buněk

| Obtížnost | Prázdných buněk |
| --------- | --------------- |
| 1         | 30–35           |
| 2         | 36–41           |
| 3         | 42–46           |
| 4         | 47–51           |
| 5         | 52–56           |

Hodnota atributu `difficulty` se nejdřív „ořízne" do rozsahu 1–5
(`clampDifficulty`): nevalidní nebo chybějící hodnota → 3, desetinná část se
zahodí, čísla mimo rozsah se přimknou k 1, resp. 5.

---

## 8. Validace řešení (`isValidSolution`)

Pomocná funkce ověří, že řetězec je **úplné a validní** řešení 9×9:

- má přesně 81 znaků,
- každá buňka obsahuje číslici 1–9,
- žádná číslice neporušuje pravidla. Trik: buňku dočasně vynuluje a zeptá se
  `canPlace`, jestli by ji tam šlo (znovu) položit — pokud ne, je tam
  duplicita.

Používá se hlavně v testech (kontrola, že generovaná `solution` je opravdu
validní).

---

## 9. Detekce konfliktů v UI (`computeConflicts`)

Tohle je „živá" kontrola během hraní (v `SudokuGame.ts`), nezávislá na řešení —
porovnává se **jen aktuální stav desky** (zadané číslice + ty od hráče), ne se
správným řešením.

Postup pro každou z 27 jednotek (9 řádků, 9 sloupců, 9 bloků):

1. Posbírej indexy buněk dané jednotky.
2. Seskup je podle vyplněné číslice (prázdné se ignorují).
3. Pokud se některá číslice vyskytuje **víckrát**, označ **všechny** buňky té
   jednotky jako konfliktní.

Tím se červeně zvýrazní **celý** řádek / sloupec / blok, kde kolize nastala —
a může jich být víc najednou (jedna číslice umí být v konfliktu zároveň
v řádku i v bloku). Zvýraznění je „živé": výpočet běží při každém tahu, takže
zmizí ve chvíli, kdy hráč konflikt odstraní.

Dohrání hry se pozná jednoduše — když se aktuální deska rovná řetězci
`solution`.

---

## 10. Časová složitost a praktický výkon

Řešení sudoku je v obecnosti NP-úplný problém, takže teoretická horní mez je
exponenciální. V praxi je ale díky kombinaci

- **bitových masek** (konstantní výpočet kandidátů a undo),
- **MRV heuristiky** (malé větvení, brzká detekce slepých uliček) a
- **early-exitu** při počítání řešení (limit 2)

generování i řešení velmi rychlé — řádově **jednotky milisekund** na zadání,
napříč všemi obtížnostmi. Nejdražší část je opakovaný test unikátnosti při
odebírání buněk v `generate` (až ~81 volání `countSolutions`), ale i ten je
díky výše uvedenému zanedbatelný.

Generátor je **nedeterministický** (používá `Math.random` v `shuffle` a při
volbě cílového počtu prázdných buněk), takže pokaždé vznikne jiné zadání.
Solver i kontrolní funkce jsou naopak **deterministické**.
