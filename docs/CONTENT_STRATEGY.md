# Čtecí ZOO – obsahová strategie

## Aktuální rozhodnutí

Produktový základ zatím necháváme beze změny. Další práce se soustředí hlavně na **obsah**.

Aktuální směr:

- úrovně obtížnosti zůstávají podle navržené struktury,
- bez vstupního testu,
- pestré lekce,
- ZOO jako hlavní odměnová smyčka,
- nyní rozšiřujeme slovní zásobu směrem k MVP.

---

## Slovní zásoba pro MVP

Cíl: připravit přibližně **200 slov z českého jazyka**.

V projektu je první seed:

```text
data/content/vocabulary_200_seed.json
data/content/vocabulary_200_seed.csv
```

Obsahuje přesně 200 položek rozdělených do skupin:

| Skupina | Počet | Účel |
|---|---:|---|
| Krátká jednoduchá slova | 35 | první čtení, krátká konkrétní slova |
| Jednoduchá běžná slova | 35 | domov, škola, jídlo, okolí dítěte |
| Zvířata | 50 | hlavní propojení se ZOO odměnami |
| Příroda | 30 | tematické lekce a krátké věty |
| Domov, rodina a škola | 25 | každodenní slovní zásoba dítěte |
| Děje a vlastnosti | 25 | tvorba vět, čtení jednoduchých dějů |

Celkem: **200 slov**.

---

## Důležitá poznámka

Tento seznam je **obsahový seed**, ne finální pedagogická sada.

Před produkcí je potřeba ho zkontrolovat podle:

- věku dítěte,
- čitelnosti slova,
- délky slova,
- výskytu diakritiky,
- shluků souhlásek,
- vhodnosti pro první čtení,
- možnosti vytvořit jasný obrázek nebo větu,
- frekvence v dětském jazyce.

Například slova jako `čmelák`, `mravenec`, `velbloud`, `počítač` jsou dobrá pro obsah, ale nepatří do úplného začátku.

---

## Doporučená pedagogická struktura

Pro další zpracování bych slovní zásobu přeřadil do jemnějších úrovní:

1. **Velmi jednoduchá slova**  
   2–4 písmena, konkrétní význam, minimum těžkých shluků.

2. **Otevřené slabiky a jednoduchá stavba**  
   slova jako máma, táta, voda, kolo.

3. **Krátká zvířata a konkrétní věci**  
   pes, kos, lev, had, dům, míč.

4. **Delší běžná slova**  
   kočka, liška, škola, kniha, slunce.

5. **Slova s diakritikou a delší stavbou**  
   žába, čáp, medvěd, tučňák, počítač.

6. **Věty se známými slovy**  
   Pes běží. Kočka spí. Sova houká.

7. **Krátké texty / mini příběhy**  
   pouze pozdější fáze.

---

## Zvířata jako obsahová osa

Zvířata jsou klíčová, protože propojují:

- čtení,
- odměnu,
- poznávání světa,
- vizuální motivaci.

V seedu je 50 zvířecích slov. Pro MVP doporučuji pracovat s cca 40–60 zvířaty.

Každé zvíře by mělo mít:

- název,
- kategorii/biom,
- obrázek,
- jednoduchý fakt,
- jednoduchou větu,
- volitelně zvuk výslovnosti.

Příklad:

```text
LIŠKA
Kategorie: lesní zvířata
Věta: Liška běží.
Fakt: Liška má rezavou srst.
```

---

## Další obsahový krok

Navržený další krok:

1. Vzít `vocabulary_200_seed.csv`.
2. Ručně označit:
   - vhodné pro úplný začátek,
   - vhodné pro střední úroveň,
   - vhodné až později.
3. U zvířat doplnit:
   - kategorii,
   - jednoduchou větu,
   - jednoduchý fakt,
   - požadovaný typ obrázku.
4. Z toho vygenerovat produkčnější `content.json` pro aplikaci.

---

## Co zatím neřešíme

Podle aktuálního rozhodnutí teď zatím neřešíme:

- technický přepis do PWA,
- účty,
- synchronizaci,
- monetizaci,
- App Store / Google Play,
- pokročilou analytiku,
- platební model.

Tyto body se otevřou později.
