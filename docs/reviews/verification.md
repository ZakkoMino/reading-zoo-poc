# Ověření změn – 11. 9. 2026

- `node --test tests/*.test.cjs`: **32 passed, 0 failed, 0 cancelled, 0 skipped**.
- `node scripts/validate-animals-50.mjs`: prošlo bez chyb a varování; 82 položek a existující ilustrace.
- `node scripts/find-fill-conflicts.mjs`: 13 směrových konfliktů v dodané slovní zásobě způsobilých úloh. Výsledkem opravy je jasný vzor, nikoli tvrzení, že český jazyk nemá další alternativy.
- `node scripts/generate-voice.mjs --dry-run`: 1 727 textů, žádné nahrávky vygenerované tímto během.
- `git diff --check`: prošlo při běžném nastavení Git pro tento Windows checkout.

## Ruční prohlížečový průchod

Desktopový prohlížeč s šířkou 390 px, nikoli Android zařízení:

1. Volba „První slova“, start dostupný nad výběrem úrovní.
2. První úloha „Přečti“ zobrazila slovo „sám“; po potvrzení přešla do stavu přehrávání a následně na další úkol. To ověřuje řídicí tok, nikoli pedagogickou kvalitu slyšeného hlasu.
3. Doplňování zobrazilo vzor „nos“ a masku `n_s`. Volba `o` pokračovala na úkol 3 se slovem „zem“.
4. Návrat domů zobrazil „Pokračovat v lekci“.
5. Po reloadu, zavření původní karty a otevření nové karty se pokračování vrátilo na **úkol 3 z 8, „zem“**, nikoli na začátek.

Nedostupný hlas, chyba klipu, rodičovský fallback, kvóta úložiště a HTTP 503 byly ověřeny simulovanými regresními testy, ne na fyzickém telefonu. Kompletní Android/offline/audio akceptace zůstává před vydáním nutná.
