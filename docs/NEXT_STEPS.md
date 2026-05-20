# Čtecí ZOO – návrh dalších kroků

## Doporučený směr

Prototyp už dobře ukazuje hlavní smyčku:

> výběr úrovně → pestrá lekce → adaptivní opakování → zvíře do ZOO.

Další práce by se měla soustředit na ověření s dítětem, doplnění obsahu a rozhodnutí, jestli z toho má vzniknout webová aplikace, mobilní aplikace, nebo obojí.

---

## 1. Krátké uživatelské testování

Nejdřív doporučuji otestovat prototyp s 1–3 dětmi.

Sledovat:

- rozumí dítě bez vysvětlování, co má dělat?
- baví ho ZOO odměna?
- je skládání slov po předčtení srozumitelné?
- není lekce moc dlouhá?
- kde se dítě zasekne?
- kliká náhodně, nebo opravdu čte?
- pozná zvířata z obrázků?

Výstupem by měl být krátký seznam úprav UX před dalším vývojem.

---

## 2. Upravit pedagogickou progresi

Současné úrovně jsou funkční pro prototyp, ale produkční verze potřebuje přesnější strukturu.

Doporučené rozdělení:

1. písmena,
2. otevřené slabiky,
3. krátká jednoduchá slova,
4. delší slova,
5. slova se shluky souhlásek,
6. krátké věty,
7. krátké texty.

Je vhodné připravit slovník podle obtížnosti, frekvence a čitelnosti pro děti.

---

## 3. Rozšířit obsah

Pro další verzi bych připravil:

- 80–120 slov,
- 40–60 zvířat,
- 4–6 kategorií zvířat:
  - domácí,
  - lesní,
  - safari,
  - vodní,
  - ptáci,
  - hmyz / drobná zvířata,
- jednoduché věty k většině zvířat,
- krátké fakty o zvířatech ve velmi jednoduché češtině.

Příklad:

```text
SOVA
Sova vidí dobře v noci.
```

```text
ŽÁBA
Žába skáče a žije u vody.
```

---

## 4. Vyřešit finální ilustrace

Toto je klíčové.

Prototypové SVG obrázky stačí pro ověření mechaniky, ale produkční verze potřebuje kvalitní jednotnou grafiku.

Možnosti:

### Varianta A – profesionální ilustrátor

Nejlepší výsledek. Vhodné pro produkční aplikaci.

Výhody:

- jednotný styl,
- jasně poznatelná zvířata,
- vlastní identita produktu.

Nevýhody:

- vyšší cena,
- delší příprava.

### Varianta B – kvalitní licencovaná sada

Rychlejší a levnější, ale je nutné hlídat licenci a konzistenci.

### Varianta C – AI ilustrace + ruční kontrola

Použitelné pro prototypy, ale rizikové pro produkci.

Nutné hlídat:

- nekonzistentní styl,
- anatomické chyby,
- divné detaily,
- práva/licence podle použitého nástroje.

Doporučení: pro skutečný produkt jít cestou A nebo kvalitně kurátorované B.

---

## 5. Vylepšit adaptivní algoritmus

Současný model 0–5 stačí pro prototyp.

Další verze může přidat:

- oddělené skóre podle typu úkolu:
  - čtení,
  - skládání,
  - doplňování,
  - porozumění obrázku,
- plánované opakování po čase,
- detekci příliš těžké lekce,
- automatické doporučení přechodu na další úroveň,
- rodičovské doporučení: „Procvičte ještě krátká slova.“

---

## 6. Rozhodnout technický směr

Současný prototyp je statický HTML/CSS/JS.

Pro produkční vývoj jsou realistické tři cesty:

### A. Webová aplikace / PWA

Doporučené pro rychlý start.

Výhody:

- funguje na tabletu i počítači,
- jednodušší vývoj,
- možnost instalace jako PWA,
- jednodušší sdílení prototypu.

### B. Mobilní aplikace

Vhodné, pokud je cílem App Store / Google Play.

Výhody:

- lepší dětský fullscreen zážitek,
- lepší práce se zvukem,
- rodiče jsou na dětské appky v mobilech zvyklí.

Nevýhody:

- náročnější release proces,
- potřeba řešit platformní pravidla pro děti.

### C. Hybridní cesta

Například React/Vue/Svelte + Capacitor.

Dobrá volba, pokud chceš jeden kód pro web i mobil.

Doporučení pro další krok: **nejdřív PWA**, po ověření konceptu případně zabalit do mobilní aplikace.

---

## 7. Doplnit rodičovský režim

Rodičovský panel by měl ukazovat:

- kolik lekcí dítě dokončilo,
- jaká slova umí,
- která slova se pletou,
- jaká úroveň je doporučená,
- návrh dalšího procvičení.

Důležité: rodičovský panel nemá dítě stresovat ani srovnávat s ostatními.

---

## 8. Doplnit zvuk

Web Speech API stačí pro prototyp, ale produkčně je lepší připravit kvalitní nahrávky.

Doporučení:

- profesionální český hlas,
- nahrát názvy zvířat,
- nahrát krátké věty,
- zachovat jednotný tón: klidný, přátelský, ne infantilní.

---

## 9. Připravit MVP backlog

### MVP 1 – ověřit jádro

- PWA verze,
- 3–4 úrovně,
- cca 100 slov,
- cca 40 zvířat,
- profesionální nebo aspoň konzistentní ilustrace,
- základní rodičovský panel,
- ukládání lokálně.

### MVP 2 – lepší učení

- přesnější adaptivita,
- více typů úkolů,
- obtahování písmen,
- krátké příběhy se získanými zvířaty,
- týdenní souhrn pro rodiče.

### MVP 3 – produkční appka

- účty / synchronizace,
- více profilů dětí,
- offline režim,
- mobilní balení,
- placený obsah / předplatné, pokud bude cílem komerční produkt.

---

## Nejbližší konkrétní kroky

1. Otestovat současný prototyp s dítětem.
2. Sepsat pozorování: co baví, co mate, co je moc těžké.
3. Upravit UX podle testu.
4. Připravit větší slovník a seznam zvířat.
5. Rozhodnout grafický styl zvířat.
6. Přepsat prototyp do udržitelného stacku pro PWA.
7. Přidat základní analytiku pouze lokálně / privacy-friendly.
8. Připravit první skutečné MVP.

---

## Doporučení

Nepřidávat zatím moc funkcí. Nejdůležitější je ověřit, že dítě opravdu baví smyčka:

> přečtu / složím / doplním → získám zvíře → chci další zvíře.

Pokud tato smyčka funguje, má produkt dobrý základ.
