# Český hlas: testování a cesta k offline vydání

Stav 11. 9. 2026: aplikace obsahuje generátor, nikoli hotové hlasové nahrávky. V tomto PR nebyla provedena placená syntéza, stažení modelu ani poslechová certifikace hlasu.

## Pro rodiče při testování Androidu

1. V nastavení telefonu vyhledejte „Převod textu na řeč“ (obvykle Usnadnění).
2. Zvolte dostupný modul, český jazyk a přiměřenou rychlost.
3. V jeho nastavení otevřete instalaci hlasových dat a stáhněte češtinu, pokud ji nabízí.
4. Přehrajte systémovou ukázku; pak v aplikaci dokončete úkol „Přečti“ a ověřte následný poslech.
5. Totéž zkuste v režimu letadlo. Dostupnost systémové češtiny neznamená automaticky funkční offline hlas v konkrétním prohlížeči/WebView.

Názvy nabídek a nabídka hlasů závisí na výrobci a enginu. Podkladem je [oficiální návod Androidu](https://support.google.com/accessibility/android/answer/6006983?hl=en). Nejde o záruku podpory všech telefonů. Při neúspěchu se úkol čtení neposune potichu dál: nabídne opakování poslechu a výslovné potvrzení, že vzor přečetl rodič.

## Doporučení pro veřejné vydání

Distribuovat předem vyrobené české klipy společně s aplikací. Android TTS ponechat jako záložní možnost. Dítě pak nepotřebuje vlastní instalaci hlasu, mikrofon, cloudovou syntézu ani účet. Slova se generují při přípravě vydání, nikoli během používání dítětem.

Piper je kandidát pro technický pilot, ne automatické schválení kvality nebo komerční licence. Aktuální engine [OHF-Voice/Piper](https://github.com/OHF-Voice/piper1-gpl) uvádí GPL-3.0. Licence enginu, modelu, zdrojových nahrávek a práva k výstupům se musí posoudit odděleně. [MODEL_CARD českého hlasu Jirka medium](https://huggingface.co/rhasspy/piper-voices/blob/main/cs/cs_CZ/jirka/medium/MODEL_CARD) uvádí dataset CC0, 22 050 Hz a jeden hlas. To samo o sobě nenahrazuje licenční kontrolu celého balíku. [Dokumentace hlasů](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md) výslovně odkazuje na individuální modelové licence.

## Reprodukovatelný postup pro vývojáře

V izolovaném Python prostředí nainstalovat Piper, uložit verzi balíku, modelu, konfigurace a jejich SHA-256 do release evidence. Použít `python3` dostupný pro generátor; na Windows ověřit, že nejde o nefunkční Microsoft Store alias. Příkazy níže jsou postup k provedení, nikoli tvrzení, že zde syntéza proběhla.

```sh
python3 -m pip install piper-tts
python3 -m piper.download_voices cs_CZ-jirka-medium --data-dir voices
node scripts/generate-voice.mjs --dry-run
node scripts/generate-voice.mjs --limit 20 --out voice-smoke --format wav
```

Stažení hlasů a volba datového adresáře odpovídají [oficiálnímu Piper CLI](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/CLI.md). Nejprve vybrat reprezentativní pilot: písmena a hlásky, CH, délky samohlásek, měkké souhlásky, slabiky, krátká slova a dlouhé věty. `--limit 20` je pouze technický smoke test, nikoli tento kvalitativní vzorek.

Po schválení pilotu českým pedagogem/rodilým mluvčím:

```sh
# MP3 vyžaduje ffmpeg na PATH. Bez něj použít explicitně --format wav.
node scripts/generate-voice.mjs --out voice-release-candidate --format mp3
```

Zkontrolovat úplnost a všechny klipy poslechnout. Teprve schválený kandidátní adresář publikovat jako `assets/voice/`, zvýšit verzi workeru a ověřit offline start na zařízení. Model ani engine se nemusí balit do aplikace, pokud se distribuují pouze schválené audio soubory; tuto distribuční variantu stále musí pokrýt licenční kontrola.

Generátor nyní zahrnuje i jednotlivé věty příběhů. `--dry-run` při této změně evidoval 1 727 unikátních textů. Velikost a kvalita budou známé až po skutečné syntéze. Změna hlasu vyžaduje nový kandidátní adresář nebo `--force`; inkrementální generátor používá názvy podle textu, nikoli podle hlasu.

`--stub` vytváří pípnutí, nikoli češtinu. Nikdy je nevydávat. Omezené a stub běhy vyžadují oddělený výstup, aby nepřepsaly produkční manifest. Po změně jakékoliv mluvené šablony aktualizovat sběr textů.

## Výstupní kontrola před Play

- Žádné chybějící soubory z manifestu; žádné stub klipy; žádný chybějící povinný text.
- Pedagogicky vhodná výslovnost: hláska versus název písmene, délky, slabikování, CH. TTS nesmí být jediným rozhodčím kvality.
- Klipy bez ořezu začátku/konce, nepříjemné hlasitosti a nekonzistentního tempa.
- Kontrola na slabším telefonu i tabletu, po násilném ukončení a v letadle; zároveň restart po aktualizaci.
- U čtení nejprve vlastní pokus dítěte, poté vzor. Timeout nebo chyba nikdy nepředstírá úspěšné přehrání.
- Systémový fallback může záviset na síti enginu; netvrdit „všechna data vždy offline“, dokud není ověřen produkční audio balík a distribuční obal.
