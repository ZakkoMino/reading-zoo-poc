# Revize → opravy → priority k vydání

Datum: 11. 9. 2026. Výchozí commit: `063416625d42c72933f349e9d3b958a487407986`.

Tento dokument nahrazuje dřívější doporučení zavádět hodnocení samostatného čtení a odemykat úrovně zkouškou 8/8. Závazné je upřesnění vlastníka: rodič na začátku pomáhá, dítě poctivě čte a správnost porovnává s následným poslechem. Nejde o diagnostiku, školní známky ani automatické měření schopnosti číst. Mikrofon, ASR a nahrávání nepřidáváme.

## Co se změnilo podle bodů vlastníka

| Bod | Výsledek v této větvi |
|---|---|
| 1 – čtení bez hodnocení | Rodičovský panel ukazuje počty procvičení, nikoli úspěšnost nebo „zvládnutí“. Nové procvičení se započte bez ohledu na první pokus. Výběr úloh používá četnost procvičení, ne skóre. Staré hodnoty se pouze zachovávají pro kompatibilitu; nejsou nově vydávány za čtenářské schopnosti. |
| 2 – konflikty | Doplňování má viditelný jednoznačný slovní/větný vzor a výslovně popsaný účel. `l_s` už nepředstírá, že bez kontextu existuje jediná správná odpověď. Kontrola pokrývá všechny položky kurikula. Jde nyní o práci s písmeny podle vzoru, nikoli test samostatného čtení. |
| 3 – zvuk | Rozlišení českého hlasu od pouhé existence API, fallback při chybě klipu, zrušení při navigaci, čekání na konec přehrávání. U čtení a vět příběhů chyba nabídne opakování nebo rodiče. Postup Android + offline generování je v [audio návodu](AUDIO_OFFLINE.md). Klipy zatím nebyly vyrobeny. |
| 4 – ukládání | Schéma 2, normalizace polí a čísel, záložní a obnovovací klíč, ochrana před přepsáním novějšího schématu, viditelné upozornění při selhání zápisu. |
| 5 – opuštěná lekce | Generační token obrazovky ruší časovače a čekání. Kontrola tokenu před zápisem chrání návrat/reset. Checkpoint se ukládá po každém úkolu; poslední rozpracovaný úkol se po návratu zopakuje. Čekající výběr odměny se obnoví. |
| 6 – rychlé klikání | Zámek voleb při dokončení spojování a doplňování; skládání blokuje změny během vyhodnocovací pauzy. |
| 7 – příběh | Přečtení a přidělená odměna jsou oddělené. Neúspěšný první pokus neznemožní získat hvězdu při pozdějším úspěchu. Zápis hvězdy a označení vyzvednutí je jeden snapshot. |
| 8 – odemykání | Všech osm úrovní zůstává otevřených pro testování a je to uvedeno v UI. Původní zkouška je vyřazena. Produkční postupné odemykání a počáteční volba písmena/slova jsou další samostatná etapa, nikoli hotová funkce tohoto PR. |

Další opravy: oddělené počty procvičení pro stejný text v různých úrovních; worker nemaže cizí cache a při HTTP chybě používá dostupnou zálohu; kód a kurikulum se načítají jako jedna verze; update nevynucuje aktivaci uprostřed lekce. Primární tlačítka mají tmavý text, přibyl viditelný focus a omezení animací. Začátek lekce je dostupný před dlouhým seznamem úrovní. Opraveny tři problematické formulace zvířecích faktů i jejich generátory. CI spouští regresní testy před deployem.

Read-only příkaz `node scripts/find-fill-conflicts.mjs` našel 13 směrových konfliktů v dodané slovní zásobě pro způsobilé slovní úlohy: táta/teta, syn/sen, rýže/růže, les/los, léto/létá, sedí → sedm a koně/káně. Rozdíl proti širší původní inventuře: dvoupísmenná slova se do doplňování neplánují. Nejde o úplný český slovník; jasný vzor řeší i jiné platné alternativy, které ve slovní zásobě aplikace nejsou.

### Důležitá omezení oprav

Checkpoint je pro jednu rozpracovanou lekci, ne pro více dětských profilů. Změna úrovně a spuštění jiné lekce předchozí rozpracovanou lekci nahradí. Při plném/nepřístupném úložišti zůstává aktuální pokrok jen v paměti a aplikace varuje; nezaručuje zápis proti chybě zařízení. Záloha je ve stejném prohlížeči, nikoli cloudová záloha. Vymazání dat prohlížeče odstraní i ji.

Starší `storiesRead` nerozlišovalo úspěšný a neúspěšný první pokus. Migrace proto zachovává dosavadní hvězdy a umožňuje nové jednorázové získání odměny; nelze zpětně přesně určit, která stará přečtení už hvězdu přidělila. Je to vědomý pro-dětský kompromis místo definitivně ztracené odměny.

## Prioritizace: vlastní závěr + nezávislý Grok CLI

Grok posuzoval návrh priorit nezávisle a následně dostal konkrétní změněné moduly. Podklady a vyhodnocení jsou v [Grok revizi](GROK_REVIEW_2026-09-11.md). Jeho doporučení nejsou automaticky přejímaná jako fakt: například viditelný vzor skutečně mění typ cvičení, a proto je to výslovně uvedeno, nikoli skryté. Také ponecháváme současné herní otevírání příběhů přes zvířata/hvězdy; uživatel ho nepožadoval celé přepracovat.

### P0 — před veřejným Google Play vydáním

1. **Česká didaktická a obsahová kontrola.** Pedagog projde pořadí hlásek, délky a diakritiku, slabikování a přiměřenost vět. Výstup: schválené obsahové sady pro začátečníka a dítě začínající slovy. Oprava tří faktů není úplná korektura 858 položek a 107 příběhů. Zvířecí pohádky odlišit od přírodovědných tvrzení.
2. **Spolehlivý hlas a skutečné Android testy.** Nejprve porovnat pilot hlasu s lidským čtením; potom schválit kompletní audio balík. Ověřit nízkou paměť, režim letadlo, odchod do pozadí, restart, zamčený telefon, volání a opakované lekce. Webové testy nejsou testem Android TTS/WebView.
3. **Produkční obal a distribuční minimum.** Vybrat a ověřit Android obal, podepisování a AAB, životní cyklus a trvalé úložiště. Zatím jde o PWA, ne hotovou Play aplikaci. Cílové Android API ověřit podle [aktuálního Play požadavku](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en) při balení; nezakódovávat zastaralé číslo do plánu.
4. **Dětské soukromí a Play deklarace.** Zveřejnit srozumitelnou privacy policy, určit cílový věk, vyplnit Data safety podle skutečného obalu a všech SDK. Prověřit [Families požadavky](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en). Nepřidávat reklamu ani analytiku jen kvůli „profesionalizaci“. U dotčeného osobního vývojářského účtu počítat s [uzavřeným testem a přístupem k produkci](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en).
5. **Produkční průchod a rodičovské nastavení.** Testovací přepínač není release strategie. Rodič vybere písmena/slova, dítě postupuje po krátkých lekcích a pravidelném procvičování, bez známkování. Rodič má možnost obtížnost změnit. Před vydáním přidat rodičovskou ochranu resetu, nákupů a odkazů mimo aplikaci.

### P1 — kvalita prvního vydání a konkurenceschopnost

6. **Pilot s 5–10 rodinami.** Pozorovat bez nahrávání dítěte: pochopí zadání, potřebuje rodiče u každého typu úlohy, vrací se dobrovolně? Vyhodnotit délku sezení a srozumitelnost, ne „čtenářské skóre“. Úspěch: dítě zvládne krátkou lekci, rodič rozumí smyslu následného poslechu, nikdo se nezasekne na navigaci.
7. **Více lokálních profilů a přenositelná záloha.** Vlastní ZOO pro sourozence, obnova po výměně telefonu, export/import pro rodiče. Nevyžadovat dětský cloudový účet. Řešit souběh více oken/zařízení před tvrzením o synchronizaci.
8. **Vlastní vizuální identita a zvukové vedení.** Současná jednotná sada emoji je lepší než nesourodé obrázky, ale značku neodlišuje. Nejprve vyladit čitelnost, zadání, dotykové cíle a celou lekci na malém displeji, až potom nové ilustrace a efekty.
9. **Testy a release disciplína.** Doplnit skutečné end-to-end testy na zařízení a regresi worker update/offline. CI v PR běží, avšak povinné branch-protection checks musí nastavit vlastník; tento PR nastavení repozitáře nemění. Před vydáním projít i další kontrasty a přístupnost, nikoli tvrdit plnou WCAG shodu podle dvou tlačítek.

### P2 — po ověření, že se děti rády vracejí

10. Přidávat tematické epizody a promyšlené návraty k dřívějším textům, případně balíčky obtížnosti. Počet slov sám o sobě není hlavní výhoda.
11. Monetizaci zkoušet až na ověřené hodnotě: transparentní rodičovská nabídka, bez reklamních odměn a manipulativních tlaků na dítě. Konkrétní ceny a platební model teprve ověřit.
12. Cloud/analytiku zavést jen pro jasně doloženou potřebu a s odpovídajícím souhlasem/deklaracemi. Nepřidávat mikrofon ani hodnocení čtení proti zvolenému konceptu.

**Doporučená konkurenční pozice:** klidné české čtení s rodičem, krátká samostatná praxe, spolehlivý vzor a sbírání vlastní ZOO; žádná známka, reklamní tlak nebo nutný dětský účet. To je produktová hypotéza k ověření rodinami, ne prokázaná tržní výhoda. Současný PR zvyšuje spolehlivost prototypu, ale není souhlasem k veřejnému vydání.

## Jak ověřit změny

```sh
node --test tests/*.test.cjs
node scripts/validate-animals-50.mjs
node scripts/generate-voice.mjs --dry-run
```

Automatické testy používají Node VM se syntetickým DOM, časovači a úložištěm. Ověřují implementaci, ne skutečnou kvalitu hlasu ani Android. Ruční kontrola v desktopovém prohlížeči zahrnuje mobilní šířku 390 px, samostatné čtení a následný poslech, jednoznačný vzor, navigaci a obnovu. Přesné doplněné výsledky jsou uvedeny v PR.
