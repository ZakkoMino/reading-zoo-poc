# Čtecí ZOO – veřejně dostupné sady ilustrací zvířat

Průzkum (červen 2026): existující velké, konzistentní a **zdarma použitelné**
sady ilustrací zvířat, kterými lze nahradit placeholder SVG – bez nutnosti
kreslit vlastní sadu. Ověřeno proti našim 50 zvířatům
(`data/content/animals_50_seed.json`).

## Shrnutí – doporučení

**Použít OpenMoji** (primárně), případně **Microsoft Fluent Emoji 3D**,
pokud chceme modernější 3D vzhled a smíříme se s PNG.

| Sada | Licence | Pokrytí 50 zvířat | Formát | Atribuce |
|---|---|---|---|---|
| **OpenMoji** | CC BY-SA 4.0 | **48/50** (chybí rys, čmelák) | SVG | 1 řádek v patičce |
| **MS Fluent Emoji** | **MIT** | 47/50 (chybí rys, srna, čmelák) | 3D = PNG, flat = SVG | jen LICENSE soubor |
| Google Noto Emoji | Apache 2.0 / OFL | 47/50 (chybí rys, srna, čmelák) | SVG + PNG | jen LICENSE soubor |
| Twemoji | CC BY 4.0 | ~47/50 | SVG | 1 řádek |
| Kenney Animal Pack Redux | CC0 | jen 30 zvířat | PNG/vektor | žádná |

Žádná emoji sada nemá **rysa** ani **čmeláka** (nejsou v Unicode).

## Proč OpenMoji

1. **Nejlepší pokrytí**: jediná sada s **doe/laní** (srna!) – má vlastní
   ne-unicode „extras“ (doe, oslík, zlatá rybka, kosatka, narval, holub,
   papoušek…), tedy prostor pro budoucí rozšiřování ZOO.
2. **Vše SVG** – sedí na současnou pipeline (`assets/animals-illustrated/*.svg`,
   `animalImg()` beze změny), snadné úpravy barev/pozadí.
3. **Jednotný dětsky přívětivý styl** (flat ilustrace s konturou),
   přes 4 000 emoji, 171+ položek ve skupině zvířata/příroda.
4. **Upravitelnost**: chybějící 2 zvířata lze dokreslit podle oficiálního
   style-guide (OpenMoji na to má návod pro přispěvatele):
   - **čmelák** = přebarvená/zakulacená včela (derivát – nutno sdílet ten
     jeden SVG pod stejnou licencí, na aplikaci se share-alike nevztahuje),
   - **rys** = vlastní kresba ve stylu (vychází z kočky/leoparda).
5. Licence CC BY-SA 4.0: komerční použití povoleno, stačí **atribuce**
   („Emoji: OpenMoji.org, CC BY-SA 4.0“) v patičce/O aplikaci.

## Proč případně Fluent Emoji (3D)

- Vizuálně nejatraktivnější („advanced“) – moderní 3D vzhled z Windows 11/Teams.
- **MIT licence** – nejjednodušší právně, bez atribuce v UI.
- Nevýhody: 3D varianta je **PNG** (hůř upravitelná, větší soubory),
  chybí navíc srna (jen jelen s parožím) a úprava 3D assetu je netriviální.

## Mapování problémových zvířat

| Naše zvíře | Emoji řešení |
|---|---|
| kos | „black bird“ 🐦‍⬛ (OpenMoji, Fluent „Blackbird“, Noto) |
| husa | „goose“ 🪿 (všude) |
| srna | OpenMoji extra **doe** (E003); Fluent/Noto nemají |
| kozel (`cap`) | doporučuji přejmenovat na **Beran** → „ram“ 🐏 (kozel a koza by jinak sdíleli 🐐) |
| koza | „goat“ 🐐 |
| ovce | „ewe“ 🐑 |
| kapr | OpenMoji extra „goldfish“ nebo „tropical fish“ 🐠 (ryba = „fish“ 🐟) |
| myš / krysa | „mouse“ 🐁 / „rat“ 🐀 (obojí existuje) |
| rys | nutno dokreslit ve stylu sady (nebo nahradit jiným zvířetem) |
| čmelák | přebarvit „honeybee“ 🐝 do čmeláčí podoby |

## Co to NENÍ

- **Freepik/Flaticon/Vecteezy** „free“ balíčky – vyžadují atribuci dle
  vlastních podmínek, omezují redistribuci, licence se mění → nevhodné.
- Volné kliparty (freesvg.org, svgsilh, Openclipart, CC0) – licenčně OK,
  ale **nekonzistentní styl** napříč 50 zvířaty → porušuje náš požadavek
  jednotné sady.
- Fotky (Wikimedia/Pixabay) – viz `ANIMAL_PHOTO_SOURCING.md`; pro herní
  svět ZOO zůstává ilustrace vhodnější.

## Postup nasazení

1. Skript `scripts/fetch-animal-art.mjs`: mapa `animalId → hexcode`,
   stažení SVG z OpenMoji GitHubu, normalizace na 200×200 s kruhovým
   pozadím (zachová současný vizuální klíč), výstup do
   `assets/animals-illustrated/`.
2. Doplnit do manifestu pole `license`, `source`, `sourceUrl` (formát už
   navržen v `ANIMAL_PHOTO_SOURCING.md`).
3. Atribuce do patičky aplikace + README.
4. Dokreslit rysa, čmeláka (a případně upravit doe) podle style-guide.
5. Rozhodnout přejmenování `cap` Kozel → Beran v seed datech.

## Evoluční fáze zvířat (mládě → nejsilnější)

Otázka: existuje veřejná sada, kde má každé zvíře **více vývojových
podob** pro hvězdičkovou evoluci?

**Krátká odpověď: ne.** Žádná volně licencovaná sada skutečných zvířat
s konzistentními růstovými fázemi v potřebném rozsahu neexistuje:

- **Emoji sady**: jediná „evoluční řada“ je kuře (vejce → kuřátko →
  slepice/kohout). Ostatní zvířata mají jednu podobu.
- **Tuxemon** (open-source hra à la Pokémon, CC BY-SA): má skutečné
  evoluční řady, ale jde o **fantasy příšerky** v pixel-artu 64×64 –
  rozbilo by to edukační vazbu na skutečná česká slova.
- **Herní packy (OpenGameArt, itch.io, Kenney)**: ojediněle mládě+dospělec
  u farmových zvířat, nikdy 3–5 fází v jednotném stylu pro 50 druhů.

### Doporučená strategie

1. **Teď (zdarma, funguje s libovolnou sadou): prezentační evoluce.**
   Stejný obrázek „roste“ s hvězdami – 1★ malé mládě, 2★ větší, 3★ plná
   velikost, 4★ stříbrný rám 🥈, 5★ zlatý rám + koruna 👑.
   *Implementováno v prototypu (`stage-1…5` v `styles.css`).*
2. **Pilot s odlišnými kresbami: rozšířit vlastní generátor.**
   `scripts/generate-animals-assets.mjs` zná části těla, takže umí
   parametrizovat fáze programově (mládě = větší hlava a oči, menší
   tělo; silák = mohutnější postava, doplňky). 50 × 5 = 250 obrázků,
   100 % vlastní, právně čisté – přesně dle `ILLUSTRATION_STRATEGY.md`.
3. **Produkce: odstupňovaná investice.** Ne každé zvíře potřebuje 5
   kreseb (ani Pokémoni se nevyvíjejí všichni). Např. 10 oblíbených
   „hrdinských“ zvířat dostane plné fáze (mládě/dospělec/šampion =
   30 zakázkových ilustrací), zbytek používá prezentační evoluci.

## Zdroje

- OpenMoji: <https://openmoji.org/> · GitHub `hfg-gmuend/openmoji` · FAQ k licenci: <https://openmoji.org/faq/>
- Fluent Emoji: <https://github.com/microsoft/fluentui-emoji> (MIT)
- Noto Emoji: <https://github.com/googlefonts/noto-emoji> (Apache 2.0 / OFL) · animované: <https://googlefonts.github.io/noto-emoji-animation/>
- Twemoji (udržovaný fork): `jdecked/twemoji` (CC BY 4.0)
- Kenney Animal Pack Redux: <https://kenney.nl/assets/animal-pack-redux> (CC0)

> Poznámka: není to právní stanovisko; před komerčním spuštěním ověřit
> aktuální znění licencí.
