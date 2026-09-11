# Čtecí ZOO – testovací prototyp

Česká aplikace pro krátké procvičování čtení a sbírání zvířat. Rodič pomáhá s prvním nastavením; dítě čte, potom poslouchá správný vzor. Bez školního hodnocení, mikrofonu, nahrávání a dětského účtu.

**Nejde zatím o hotovou Google Play aplikaci. Všech osm úrovní je záměrně otevřených pouze pro testování.** Produkční odemykání se startem písmena/slova zůstává další etapou; stará zkouška 8/8 byla vyřazena.

## Aktuální výstupy revize

- [Opravy podle bodů vlastníka, priority P0/P1/P2 a kritéria vydání](docs/REVIEW_FOLLOWUP_2026-09-11.md)
- [Český Android hlas a proces přípravy offline nahrávek](docs/AUDIO_OFFLINE.md)
- [Nezávislá revize přes Grok CLI a vypořádání doporučení](docs/GROK_REVIEW_2026-09-11.md)

Starší dokumenty v `docs/` zachycují vývoj konceptu. Pokud popisují mastery skóre, automatické hodnocení nebo zkoušku 8/8, je závazný výše uvedený follow-up z 11. 9. 2026.

## Spuštění a testy

Žádný framework, bundler ani npm závislosti. Moderní JavaScript, nikoli ES5. Pro plná data a worker použít HTTP server v kořeni projektu:

```sh
python3 -m http.server 8000
# otevřít http://localhost:8000
node --test tests/*.test.cjs
node scripts/validate-animals-50.mjs
node scripts/generate-voice.mjs --dry-run
```

Přímé `file://` není rovnocenný test: JSON fetch a worker mohou být nedostupné a aplikace používá omezená záložní data. [Nasazená hlavní větev](https://zakkomino.github.io/reading-zoo-poc/) se změní až po sloučení PR a úspěšném deployi.

## Co aplikace obsahuje

- 8 úrovní, 858 položek kurikula, 107 příběhů a 82 zvířat.
- Čtení s následným poslechem; spojování s obrázkem; skládání slov/vět; doplňování podle viditelného vzoru; obtahování a hledání počátečního písmene.
- Osm úkolů na lekci, pestré střídání a omezení opakování textu v sezení.
- Výběr odměny, růst zvířat od 1 do 5 hvězd, příběhy zpřístupněné přes zvířata/hvězdy.
- Rodičovský přehled historie procvičování bez procent úspěšnosti a tvrzení o zvládnutí čtení.
- Průběžný checkpoint lekce, obnovení čekající odměny, ochrana proti pozdnímu zápisu opuštěné úlohy a rychlému klikání.
- Regresní CI a testy před GitHub Pages deployem.

U úloh s volbou odpovědi zůstává místní jemná nápověda. Nevyvozuje se z ní celková čtenářská schopnost. Obtahování je aktivita, ne automatický rozbor rukopisu. Doplňování je práce s písmeny podle vzoru, nikoli hádání jediné zamýšlené varianty nejednoznačného slova.

## Zvuk a offline

Hotové hlasové klipy zatím v repozitáři nejsou. `scripts/generate-voice.mjs` je generátor a zahrnuje i věty příběhů; podrobný proces včetně licencí a poslechové kontroly popisuje [audio návod](docs/AUDIO_OFFLINE.md).

Přehrávání nejprve hledá dodaný klip, pak skutečně český systémový hlas. U čtení chyba nebo timeout nenahradí konec poslechu: dítě může poslech opakovat nebo nechat vzor přečíst rodičem. Skládání nabízí rozbalitelný vzor pro případ chybějícího zvuku.

PWA cache ukládá shell a obsah. Obrázky a budoucí klipy se přednačítají best-effort; offline funkčnost zvuku nelze slibovat bez kompletního balíku a testu konkrétního zařízení. Worker aktualizovat zvýšením `VERSION` v `sw.js`; nová verze nevnucuje aktivaci uprostřed otevřené lekce. Při lokálním vývoji po změně cachovaných souborů použít nový origin nebo vývojově odstranit worker pouze na vlastní testovací stránce.

## Data a ukládání

`reading-zoo-state` obsahuje schéma 2, nastavení, `practice`, ZOO, hvězdy, přečtené příběhy, oddělené odměny příběhů, statistiku činnosti, `lesson` a `pendingReward`. Klíč procvičení je dvojice úroveň + text, takže například „ty“ ve slabikách nesdílí počitadlo se slovem „ty“.

`reading-zoo-state-backup` uchovává předchozí snapshot; `reading-zoo-state-recovery` původní poškozenou či opravovanou hodnotu. Starší skóre a odznaky se pro kompatibilitu zachovávají, ale neřídí nové procvičování ani odemykání. Při chybě zápisu aplikace viditelně upozorní, že změny nejsou trvalé.

Záloha není nezávislá na prohlížeči. Vymazání jeho dat ji odstraní. Cloudová synchronizace, více dětských profilů a bezpečný přenos mezi zařízeními nejsou implementovány. Jedna aktuální lekce: spuštění jiné úrovně nahradí dosavadní rozpracovanou lekci.

Výběr textů mírně zvýhodňuje méně procvičované položky vahou `1 + 5 / (1 + početProcvičení)`, nikoli správnost čtení. Počet se zvýší po dokončení úkolu, i když dítě využilo nápovědu.

## Architektura

Moduly IIFE publikují `window.App`; pořadí v `index.html` je data → lifecycle → state → speech → lessons → tasks → views → app. `js/lifecycle.js` spravuje token obrazovky, časovače a rušení čekání.

Aktivní vstup je `js/app.js`. Kořenový `app.js` je starší nepoužívaný soubor a není načítán z indexu.

## Obsah a ilustrace

Manifest `data/content/animals_50_seed.json` historicky nese číslo 50, skutečně obsahuje 82 zvířat. Aktivní ilustrace jsou `assets/animals-3d/*.png`, Microsoft Fluent Emoji 3D; [licence](assets/animals-3d/LICENSE.md). Archiv `assets/animals-illustrated/` obsahuje 50 starších SVG.

Kurikum: `data/content/curriculum_v2.json`, příběhy: `data/content/stories.json`. Při obsahové opravě aktualizovat i příslušný generátor, aby ji pozdější regenerace nezrušila.

## Vydání

CI ověřuje regresní scénáře a obsah. Testy Node VM nenahrazují prohlížeč, skutečný Android/WebView, poslechovou kontrolu ani revizi dětského soukromí. Konkrétní blokery Play a doporučené pořadí jsou v [prioritizovaném výstupu](docs/REVIEW_FOLLOWUP_2026-09-11.md). Tento repozitář zatím neobsahuje produkční Android balíček.
