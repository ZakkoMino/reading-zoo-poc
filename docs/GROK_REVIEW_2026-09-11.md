# Nezávislá revize Grok CLI a její vypořádání

Proběhly dva dokončené běhy s vypnutými nástroji, webovým hledáním a subagenty. Grok dostal pouze relevantní veřejný kontext této aplikace, nikoli přístup k celému pracovnímu prostředí. Výstupy končí `REVIEW COMPLETE`; nejde jen o průběžné hlášení. Grok sám neprovedl změny ani Android test.

## 1. Prioritizace podle upřesněného zadání

Session: `01a08cfd-b18b-75c0-8fd4-df5ba861e889`. [Úplná odpověď](reviews/grok-priorities-raw.md).

Přijato: oddělit procvičování od tvrzení o schopnosti číst; nejprve řešit ukládání, rušení úloh, idempotenci odměn, skutečnou dostupnost češtiny a worker; explicitně označit testovací režim. Přehled školní úspěšnosti nebyl pouze přejmenován: nové počty rostou po dokončení úkolu bez ohledu na správnost. Staré skóre se pro zachování uživatelských dat nemaže, ale nepoužívá.

Výhrada k doplňování je oprávněná didaktická připomínka: viditelný vzor umožňuje opis. Proto úloha výslovně říká „podle vzoru“ a je oddělena od samostatného čtení s následným poslechem. Bez úplného slovníku a jazykové analýzy by automatické přijímání „všech českých slov“ nebylo spolehlivější. Např. `l_s` samotné není jednoznačné.

Neimplementováno jako součást této opravy: úplné zrušení herních podmínek pro otevírání příběhů. Rodičovská volba startu a produkční postup jsou naplánované samostatně. Žádné známkování ani zkouška 8/8 nebudou základem produkčního postupu.

## 2. Kontrola změněného kódu

Session: `01a08f27-316a-7d70-b06c-2a7c12d1859a`. Grok obdržel plné tehdejší moduly `state.js`, `lifecycle.js` a `speech.js`; nikoli celý renderer nebo prohlížečový běh. [Úplná odpověď](reviews/grok-code-raw.md).

| Připomínka | Nezávislé ověření a rozhodnutí |
|---|---|
| Bonus se spotřebuje bez hvězdy | Není chyba: bonus je záměrná oslava, pokud je ZOO na maximu. Vrací se do výsledkové obrazovky. Přidán test, který udrží pět hvězd a spotřebuje bonus jednou. |
| `cancel()` přeruší nový zvuk v `then` | Vyvráceno pro daný kód: Promise callback běží v microtasku až po synchronním `stop()`. Přidán test pořadí `stop` → callback. Token se zneplatní před rušením; to chrání starou obrazovku. |
| Uvolnění Audio zdroje přes `load()` | Přijato jako robustnější úklid zdroje po `pause()` a odstranění `src`. Tvrzení o konkrétním chování Androidu zůstává neověřené. |
| Po `synth.cancel()` vždy odložit nové `speak()` | Nepřijato jako univerzální ověřený fix. V prohlížečovém testu následný poslech fungoval; zařízení se mohou lišit. Zůstává `resume`, čekání na end/error, neúspěšný watchdog a rodičovský fallback. Skutečné Android testy jsou P0. |
| Závod s načtením hlasového manifestu | Přijato: síťový request má timeout/abort a boot čeká na jeho dokončení před prvním renderem. Nedostupný manifest neblokuje aplikaci neomezeně. |
| Chybí oznámení chyby načtení | Grok neviděl `app.js`, kde už se při bootu volá `notifyStorage()`. Doplněna konkrétní zpráva pro novější schéma; zápis zůstává blokovaný. Reset v UI vyžaduje explicitní potvrzení. |
| Checkpoint drží živou referenci | Přijato: checkpoint a nabídka odměn ukládají kopii, přidán test změny původního objektu. |
| Příběhová hvězda může být NaN | Na normální cestě tomu předchází validace/backfill a limit. Přesto nahrazeno explicitním výpočtem přes `starsOf` a `Math.min`. |
| Potvrzení odměny při selhání zápisu | Aplikace nevrátí prázdnou rozbitou obrazovku; změna zůstává v paměti a je výrazně oznámeno, že se neukládá. Atomický je snapshot odměna + spotřebovaný claim, nikoli několik zápisů. Nejde o záruku trvalosti při nedostupném úložišti. |

Neověřené předpoklady Groku o UI hodnocení byly ověřeny proti rendereru a testem přehledu rodiče. UI už neukazuje accuracy/mastery. Otevřené technické a produktové práce nejsou vydávány za hotové; viz [prioritizovaný výstup](REVIEW_FOLLOWUP_2026-09-11.md).

## Co tato revize neprokazuje

Nejde o penetrační test, právní stanovisko, pedagogickou certifikaci ani schválení Google Play. Grok četl vybrané moduly, nikoli běžící Android aplikaci. Po zapracování relevantních připomínek následují vlastní regresní testy; netvrdíme, že Grok znovu schválil každou poslední změnu.
