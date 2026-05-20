# Čtecí ZOO – fotky zvířat a licence

## Krátká odpověď

Ano, **veřejně dostupné fotky zvířat použít možné je**, ale neplatí, že každá fotka na internetu je volně použitelná.

Pro produkt musíme rozlišovat:

- veřejně dostupné ≠ volně použitelné,
- zdarma dostupné ≠ použitelné komerčně,
- použití v prototypu ≠ bezpečné použití v produkci.

---

## Doporučený přístup pro MVP

Pro první MVP je realistické použít veřejně dostupné / licencované fotky, pokud u každé fotky uložíme:

- zdroj,
- autora,
- licenci,
- URL původu,
- datum stažení,
- informaci, zda je nutná atribuce,
- informaci, zda je povolené komerční použití,
- informaci, zda jsou povolené úpravy.

Doporučený formát evidence:

```json
{
  "animalId": "liska",
  "displayName": "Liška",
  "imageFile": "liska-001.jpg",
  "source": "Wikimedia Commons / jiný zdroj",
  "author": "...",
  "license": "CC BY-SA / CC0 / Public Domain / jiná",
  "sourceUrl": "https://...",
  "requiresAttribution": true,
  "commercialUseAllowed": true,
  "modificationsAllowed": true,
  "downloadedAt": "2026-05-18"
}
```

---

## Vhodné typy zdrojů

Bez živého právního ověření v této chvíli doporučuji uvažovat o těchto kategoriích zdrojů:

### 1. Public domain / CC0

Nejjednodušší z hlediska použití.

Výhody:

- typicky bez atribuce,
- obvykle vhodné i pro komerční použití,
- jednoduchá evidence.

Nevýhody:

- menší výběr,
- proměnlivá kvalita.

### 2. Creative Commons s atribucí

Použitelné, pokud splníme podmínky licence.

Nutné hlídat:

- zda je povolené komerční použití,
- zda je povolená úprava,
- zda je nutná atribuce,
- zda licence nevyžaduje share-alike.

### 3. Stock knihovny se svou licencí

Například knihovny typu Unsplash/Pexels/Pixabay mohou být praktické, ale je nutné číst aktuální licenci konkrétní služby.

Pozor:

- licence se může měnit,
- některé způsoby redistribuce nebo vytváření konkurenční databáze mohou být omezené,
- i když atribuce není povinná, je dobré ukládat zdroj.

---

## Fotky vs ilustrace

### Fotky

Výhody:

- dítě se učí skutečný vzhled zvířete,
- rychlejší získání obsahu,
- vhodné pro edukační část.

Nevýhody:

- různé styly, světlo, pozadí a kompozice,
- některé fotky nejsou pro malé děti dost jasné,
- ZOO může působit méně pohádkově a méně jednotně.

### Ilustrace

Výhody:

- jednotný svět aplikace,
- větší emoční vazba dítěte,
- lepší kontrola nad výrazem, barvami a čitelností.

Nevýhody:

- vyšší cena,
- delší příprava,
- méně realistické poznávání skutečného zvířete.

---

## Moje doporučení

Pro další fázi bych šel hybridně:

1. **Pro MVP použít kvalitní veřejně/licenčně dostupné fotky** zvířat.
2. Každou fotku pečlivě evidovat v manifestu.
3. Fotky sjednotit:
   - ořez na stejný poměr,
   - jasné zvíře v popředí,
   - minimálně rušivé pozadí,
   - podobná barevnost,
   - žádné drastické nebo matoucí scény.
4. Pro pozdější produkční verzi zvážit profesionální ilustrace nebo ilustrované avatary zvířat.

Dobrá kompromisní varianta:

- **v lekci používat reálnou fotku**, aby dítě poznalo zvíře,
- **v ZOO používat ilustrovanou podobu**, aby svět působil kouzelně a jednotně.

---

## Kritéria pro výběr fotky

Každá fotka by měla splňovat:

- zvíře je jasně poznatelné i pro dítě,
- zvíře je hlavní objekt fotky,
- žádné krvavé, lovecké nebo stresující scény,
- žádné výrazně rušivé pozadí,
- dostatečné rozlišení,
- ideálně horizontálně i vertikálně oříznutelná,
- přirozené barvy,
- licence dovoluje zamýšlené použití.

---

## Co je potřeba udělat dál

1. Rozhodnout, jestli pro MVP chceme:
   - fotky,
   - ilustrace,
   - hybrid.
2. Pokud fotky, připravit `asset_manifest.json`.
3. Vybrat 40–60 zvířat.
4. Ke každému najít 1–2 kandidátní fotky.
5. Zkontrolovat licence.
6. Sjednotit ořez a styl.
7. Napojit je do aplikace.

---

## Poznámka

Toto není právní stanovisko. Před veřejným/komerčním spuštěním je nutné ověřit aktuální podmínky konkrétních zdrojů a licencí.
