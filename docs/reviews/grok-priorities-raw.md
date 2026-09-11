# Surový výstup Grok CLI — nepovažovat všechny hypotézy za potvrzené

Vyhodnocení a opravy viz [souhrn revize](../GROK_REVIEW_2026-09-11.md).

**Reading Zoo — nezávislé review před Google Play.** Vycházím jen z vlastníkových rozhodnutí a potvrzených bugů. Níže odděluji fakt od doporučení.

## Intent (fakt)
Žádné ASR, nahrávání, školní známky ani tvrzení o hodnocení čtení. Rodič nejdřív pomáhá; dítě čte poctivě a teprve pak slyší správné slovo/větu. Všech 8 úrovní odemčených **jen pro TEST**; do produkce ne. Budoucí odemykání: start podle volby rodiče (písmena vs. slova), **ne** zkouška 8/8.

## P0 — blokuje veřejný Play

**1. Service worker** (fakt: maže cizí cache originu, vrací 503 místo cache)
- Cache jen s prefixem a verzí aplikace; nikdy `caches.keys()` + delete vše.
- Při offlinu servírovat cache, ne 503.
- **AC:** jiná cache na stejném originu přežije update; opakovaný offline start otevře shell z cache; regresní test na jména cache.

**2. Persistovaný stav** (fakt: nevalidní localStorage → NaN)
- Verzované schema, validace před čtením, záloha, rodičovské hlášení chyby, bezpečné defaulty.
- **AC:** poškozený/částečný JSON nespustí NaN ani tichý wipe; dítě vidí poslední platný stav nebo jasnou obnovu; migrace `vN → vN+1` bez ztráty praxe.

**3. Závody a opuštěné async** (fakt: lesson po navigaci/resetu mutuje stav; rychlé kliky v match mění výsledek)
- Zrušení vázané na **instanci lekce** (token), ne na globální abort. Lock jen na akci, uvolnění v `finally` + timeout. Pending odměna atomicky a idempotentně.
- **AC:** odchod/reset po in-flight lesson nezmění progress; dvojklik v match = jeden výsledek; odměna se neudělí dvakrát ani se neztratí po reloadu; Home/Zpět nikdy nezamrzne.

**4. Příběh: čtení ≠ odměna** (fakt: první chyba označí read a natrvalo zruší first-success)
- Oddělené flagy. `read`/`practiced` = bylo otevřeno. First-success jen odměna, **nikdy** zámek dalšího obsahu.
- **AC:** špatně napoprvé, správně napodruhé → praxe uložená, first-success odměna podle pravidla, další obsah přístupný.

**5. Audio CS** (fakt: chybí bundled hlasy; pouhá přítomnost Web Speech tvrdí češtinu; timeout řeže přehrávání)
- Čeština jen při `lang` `cs*`. Jinak retry + „přečte rodič“, bez předstírání TTS. Idle timeout nesmí krátit přehrávání. Žádný mikrofon.
- **AC:** bez CS hlasu žádný „česky umím“; rodičovský fallback vždy; timeout během play audio nedokončí; žádné `MIC` v manifestu/Play.

**6. Žádné assessment UI** (intent)
- Pryč accuracy/mastery ze všech ploch. Jen praxe.
- **AC:** v UI, uložišti i textech Play žádné skóre/mastery/známka; metriky praxe se nejmenují jako hodnocení.

**7. Test vs. produkce** (intent)
- 8/8 unlock jen za build flagem, default v Play **zamčeno**.
- **AC:** production build neotevře všechny úrovně; test build ano; budoucí lock není 8/8 exam.

**8. Ambiguous `l_s`** (fakt: bere jen `les`, platné i `los`)
- **Doporučení, ne fakt o kódu:** trvalý hint s cílovým slovem mění úlohu na opisování a oslabuje „dítě čte, pak slyší vzor“. Lepší: přijmout všechny platné tvary **nebo** hint zapínat rodič (audio/rodič čte). Pokud hint musí být kvůli offlinu bez audia, jen tehdy a s viditelným vzorem, ať není skrytá jediná správná odpověď.
- **AC:** `los` i `les` u `l_s` projdou, **nebo** je cíl jednoznačný i bez zvuku; úloha nespoléhá na skrytý jediný klíč.

## P1 — do prvního veřejného vydání

- **Kontrast:** tmavý text na oranžové/tyrkysové. **AC:** WCAG na primárních CTA, desktop i úzký viewport.
- **Checkpoint lekce** do verzovaného stavu. **AC:** kill během lekce obnoví stejný krok, ne nulu a ne duplicitní odměnu.
- **CI** na P0 závody: špatný JSON, dvojklik, unmount, SW prefix, CS voice detection, story flagy. **AC:** tyto testy v CI červeně blokují merge.
- **Návod** na offline generování hlasů; placené generování ne. **AC:** dokument pro rodiče/vývoj, appka bez něj funguje (rodič čte).

## P2 — po Play
- Postupné odemykání: rodič volí start písmena vs. slova, ne exam.
- Bundled CS hlasy, až bude zdroj bez placeného pipeline.

## Past na navržené opravy (doporučení)
| Oprava | Riziko |
|---|---|
| Hint = cílové slovo | Dítě kopíruje, nečte; rozchází se s intentem. |
| Přísná validace stavu | Wipe progressu; notice musí být pro rodiče, ne strašit dítě. |
| Globální cancel | Uřízne audio/odměnu další obrazovky. Token instance, ne route globálně. |
| Interaction lock | Lock bez `finally` = mrtvá UI. Zámek jen na submit. |
| `read` jako gate | První chyba = trest. Gate jen praxe, ne first-success. |
| Přejmenovat accuracy na practice | Stejná metrika, jiný label = skryté assessment. |
| `speechSynthesis` truthy | Neznamená CS. |
| Jeden timeout na lekci i audio | Řeže vzor, který má dítě slyšet. |
| SW `skipWaiting` uprostřed lekce | Přeruší play/checkpoint. |
| Unlock 8/8 v kódu „zatím“ | Odejde na Play. |

**Mimo rozsah (záměrně):** ASR, nahrávání, známky, tvrzení o diagnostice čtení, placené hlasy.

**Neověřeno ze zdroje:** aktuální kód, TWA/Play listing, velikost assetů, další obrazovky. To nejsou nálezy.

P0 drží data, odměny, češtinu, SW a pedagogický kontrakt. Bez nich Play neuvolňovat. Hint u `l_s` je jediná navržená oprava, která může intent porušit — nejdřív disambiguace odpovědí, hint jen jako rodičovský/offline fallback.

REVIEW COMPLETE
