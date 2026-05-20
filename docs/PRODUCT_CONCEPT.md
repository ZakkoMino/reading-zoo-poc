# Čtecí ZOO – produktový koncept

## Cíl produktu

Čtecí ZOO je dětská aplikace pro první čtení v češtině. Dítě si na začátku zvolí úroveň, prochází krátkými pestrými lekcemi a za odměnu získává zvířata do vlastní ZOO.

Hlavní princip:

> Dítě se neučí přes nudné kartičky, ale přes krátké čtenářské mise. Čte, skládá, doplňuje a poznává zvířata.

---

## Cílová skupina

- děti cca 4–7 let,
- začínající čtenáři,
- rodiče, kteří chtějí doma krátké a pozitivní procvičování,
- dítě by mělo zvládnout lekci samo nebo s minimální pomocí rodiče.

---

## Onboarding

Na začátku není vstupní test. Je pouze jednoduchý výběr.

### Výběr úrovně

1. **Písmena a slabiky**
2. **Krátká slova**
3. **Delší slova**
4. **Krátké věty**

### Výběr délky lekce

- krátká lekce: 5 úkolů,
- střední lekce: 8 úkolů,
- delší lekce: 10 úkolů.

Doporučení rodiči:

> Je lepší začít jednodušeji. Dítě získá jistotu a aplikace ho postupně posune dál.

---

## Učicí logika

Aplikace nestojí na tlačítku „Vím“. Dítě musí se slovem aktivně pracovat různými způsoby.

Jedno slovo nebo věta se může objevit v několika typech úkolů:

- přečtení,
- spojení s obrázkem,
- složení z písmen,
- doplnění chybějícího písmene,
- u vět složení ze slov.

Cílem je, aby dítě slovo nejen poznalo, ale skutečně s ním pracovalo.

---

## Typy úkolů

### 1. Přečti slovo / větu

Dítě vidí velké slovo nebo větu a samo ji přečte.

Důležité pravidlo:

- tento úkol **nepředčítá zadání nahlas**,
- dítě má opravdu číst samo,
- po přečtení klikne na „Přečetl/a jsem“.

### 2. Spoj slovo/větu s obrázkem

Dítě vidí slovo nebo větu a vybere správné zvíře z několika obrázků.

Příklad:

- „Liška běží.“ → dítě vybere lišku.

### 3. Slož slovo z písmen

Dítě nejdříve slyší cílové slovo a potom ho skládá z rozházených písmen.

Důležité pravidlo:

- u skládání je předčítání správně,
- malé dítě často nedokáže složit slovo o více písmenech bez zvukové opory,
- úkol tedy funguje jako „poslechni → slož“.

### 4. Doplň chybějící písmeno

Dítě doplní jedno chybějící písmeno ve slově.

Příklad:

- L I _ K A → Š.

### 5. Slož větu ze slov

U úrovně „Krátké věty“ se lekce nestaví jen na čtení. Věty se také skládají ze slov.

Příklad:

- aplikace přečte „Kočka spí.“
- dítě složí: Kočka / spí.

---

## Pestrost lekce

Lekce nesmí opakovat stále stejný typ úkolu.

Pravidla:

- aplikace střídá typy úkolů,
- stejný typ by neměl jít dvakrát za sebou,
- pokud úroveň obsahuje vhodná slova/věty, lekce má obsahovat alespoň jedno skládání,
- úroveň „Krátké věty“ nesmí být pouze sekvence čtení.

---

## Adaptivní logika

Každá učicí položka má interní skóre znalosti 0–5.

Pravidla:

- správná odpověď na první pokus: +1,
- chyba: −1, minimum 0,
- položky s nízkým skóre se vrací častěji,
- položky s vysokým skóre se objevují méně často,
- po chybě aplikace ukáže jemnou nápovědu nebo správnou odpověď,
- chyba není trest, jen signál k opakování.

Cíl je držet dítě v rozumné obtížnosti: ne příliš lehké, ne frustrující.

---

## ZOO odměna

Hlavní motivační svět je vlastní ZOO.

Po dokončení lekce dítě získá zvíře. Ideálně takové, které se v lekci opravdu objevilo.

Každé zvíře má kartu:

- kvalitní obrázek,
- velký název,
- výslovnost,
- krátký fakt.

Příklad:

> **LIŠKA**  
> Liška má rezavou srst a je velmi chytrá.

ZOO není jen kosmetická odměna. Je to další učicí prostor, kde dítě opakovaně vidí názvy zvířat a může je číst.

---

## Obrázky zvířat

Kvalita obrázků je zásadní.

Produkční pravidla:

- jednotný ilustrovaný styl,
- vysoké rozlišení,
- zvíře musí být pro dítě jasně poznatelné,
- žádný mix náhodných fotek, ikon a AI stylů,
- přátelský vzhled bez strašidelných detailů,
- ideálně profesionální sada ilustrací.

Prototyp používá lokální SVG placeholdery. Ty slouží pro demonstraci mechaniky, ne jako finální produkční grafika.

---

## Aktuální stav prototypu

Prototyp obsahuje:

- statickou webovou aplikaci bez backendu,
- české UI,
- onboarding bez testu,
- 4 úrovně,
- délku lekce 5/8/10 úkolů,
- střídání úkolů,
- skládání slov a vět,
- ZOO sbírku,
- kartu zvířete,
- výslovnost přes Web Speech API,
- adaptivní skóre v `localStorage`,
- rodičovský/progres panel,
- reset pokroku.

Spuštění:

```bash
cd /Users/mcdevops/openclaw-bridge/workspace/reading-zoo-prototype
python3 -m http.server 8000
```

Potom otevřít:

```text
http://localhost:8000
```
