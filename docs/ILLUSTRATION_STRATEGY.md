# Strategie ilustrací – Čtecí ZOO

## Rozhodnutí: vlastní programaticky generované SVG

Prototyp záměrně nepoužívá fotografie, komerční icon-sety ani cizí
vektorové sady. Všechny ilustrace jsou původní SVG vytvořené
skriptem `scripts/generate-animals-assets.mjs`.

### Proč tato cesta?

| Kritérium | Fotografie | Cizí vektor. sada | Generované SVG (zvoleno) |
|---|---|---|---|
| Právní čistota | Riziko licence | Závisí na licenci | ✅ 100 % vlastní |
| Konzistence stylu | ❌ Mix zdrojů | ✅ Sada | ✅ Jednotný kod. klíč |
| Přizpůsobitelnost | ❌ Pevná | ❌ Omezená | ✅ Plná (kód) |
| Čas implementace | ❌ Sourcing | ❌ Integrace | ✅ Minuty |
| Vhodnost pro děti | ❓ | ✅ | ✅ Pastelový, kulatý styl |

### Vizuální klíč

Všechna zvířata sdílejí tyto vlastnosti:
- **viewBox `0 0 200 200`** – čtvercový výřez, škáluje se čistě.
- **Kulaté pastelové pozadí** – barevný kruh `r="95"` bez tahu.
- **Geometrické tvary** – `circle`, `ellipse`, `polygon`, `path`; žádné
  fotografie, žádné externě odkazované fonty ani bitmapy.
- **Jednoduché obličeje** – dvě bílé oči s tmavou duhovkou, malý úsměv.
- **Rozlišovací prvky** – každé zvíře má alespoň 2–3 jedinečné atributy
  (hříva lva, chobot slona, parohy jelena, spirálová ulita šneka…).

### Omezení MVP ilustrací

1. **Nejsou to profesionální kresby.** Tvary jsou jednoduché geometrie;
   anatomická přesnost není cílem.
2. **Bez animací.** SVG jsou statická; pohyb by si vyžádal CSS/SMIL vrstvu.
3. **Barevná paleta není dosud sjednocená přes design system** – každé
   zvíře používá vlastní sadu odstínů.
4. **Nejsou optimalizována (SVGO)**. Soubory lze výrazně zmenšit.

### Jak nahradit profesionální grafikou

1. Zachovejte jmennou konvenci: `assets/animals-illustrated/<id>.svg`.
2. Zachovejte `viewBox="0 0 200 200"` a `self-contained` SVG
   (bez externích odkazů).
3. Aktualizujte `data/content/animals_50_seed.json` – pole `imagePath`
   budou stále správná.
4. Spusťte `node scripts/validate-animals-50.mjs` k ověření.

Aplikace nevyžaduje žádné jiné změny – obrázky jsou odkazovány
výhradně přes `imagePath` z JSON manifestu.

## Současný stav (2026-05-18)

- **50 SVG ilustrací** – pokrývá plný seed list zvířat.
- **Manifest** `data/content/animals_50_seed.json` – obsahuje metadata,
  věty a fakta v češtině.
- **Preview** `animals-preview.html` – grid s filtrováním podle
  kategorie a úrovně čtení.

## Doporučený další krok

Objednat nebo vytvořit profesionální vektorovou sadu (min. 50 zvířat,
čtvercový formát, dětský ilustrační styl, CC-BY nebo vlastní) a
nahradit soubory v `assets/animals-illustrated/`. Validační skript
okamžitě ověří kompatibilitu nové sady.
