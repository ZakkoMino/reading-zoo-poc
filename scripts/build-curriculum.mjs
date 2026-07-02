#!/usr/bin/env node
// scripts/build-curriculum.mjs
//
// Builds the runtime curriculum from the approved content batches
// (docs/content-batches/batch-B/C/D) — the word lists, animal sentence
// variants and mini stories are embedded here as the machine-readable
// source of truth; the markdown batches are the review artifacts.
//
// Outputs:
//   data/content/curriculum_v2.json  — 8 levels with items
//   data/content/stories_25.json     — mini stories (level 8)
//
// Reads: data/content/animals_50_seed.json   (V1 sentences, animal ids)
//        data/content/vocabulary_200_seed.json (thematic sentences w/ categories)
//
// Usage: node scripts/build-curriculum.mjs

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

/* ---------- level 1: letters (teaching order) + animals for "find" ----------
 * Decision 2026-06-12: no diacritics on level 1 — long vowels (Á, É…) and
 * háček letters (Č, Š, Ž, Ř, Ď, Ť, Ň, Ě) are NOT introduced here; children
 * meet them later inside words (levels 3–5). CH stays (digraph, no mark). */
const LETTERS = [
  'A', 'M', 'L', 'E', 'S', 'O', 'P', 'U', 'I',
  'T', 'J', 'D', 'K', 'N', 'V', 'Z', 'H', 'C', 'B',
  'R', 'CH', 'F', 'G', 'Y'
];
const LETTER_ANIMALS = {
  M: ['mys', 'medved', 'motyl'],
  L: ['lev', 'liska', 'labut'],
  S: ['sova', 'slepice', 'slon'],
  O: ['ovce', 'opice', 'orel', 'osel'],
  P: ['pes', 'prase', 'pav', 'panda'],
  T: ['tygr', 'tucnak', 'tulen'],
  J: ['jelen', 'jezek', 'jezevec'],
  D: ['delfin'],
  K: ['kocka', 'kun', 'koza', 'kralik'],
  N: ['nosorozec', 'netopyr'],
  V: ['vlk', 'vcela', 'vydra'],
  Z: ['zebra'],
  H: ['had', 'husa', 'hroch', 'holub'],
  C: ['cvrcek'],
  B: ['beran', 'bobr', 'brouk', 'bizon'],
  R: ['ryba'],
  CH: ['chobotnice'],
  G: ['gorila']
};

/* ---------- level 2: open syllables (no soft ti/di/ni) ---------- */
const SYLLABLES = (
  'ma me mi mo mu la le li lo lu sa se si so su pa pe pi po pu ' +
  'ta te to tu ty ja je jo ju da de do du dy ka ke ko ku ky ' +
  'na ne no nu ny va ve vi vo vu za ze zo zu ha he ho hu ra re ro ru'
).split(' ');

/* ---------- levels 3–5: word lists (batch B, approved) ---------- */
const WORDS_L3 = (
  'máma táta děda bába teta syn žena muž já ty my ' +
  'oko ucho nos pusa ruka noha zub ret kost tělo pata ' +
  'dům byt stůl okno koš pec vana lampa deka mísa nůž klíč pokoj ' +
  'med sýr čaj mák maso rýže káva oběd sůl kaše ' +
  'les pole hora nebe voda lípa dub mech seno zem sad růže ' +
  'míč kolo auto pero dort mapa váza bota ' +
  'pes kos lev kůň los páv sova žába koza husa kuře ryba myš osel lama had orel ovce koala vosa ' +
  'den noc rok léto zima jaro ráno dnes sen jih ' +
  'jí pije spí sedí leze nese vidí dává volá mává malý bílý sám rád'
).split(' ');

const WORDS_L4 = (
  'maminka tatínek babička dědeček sestra kamarád kamarádka holka kluci miminko soused rodina ' +
  'škola aktovka penál tužka guma kniha sešit tabule učitel lavice papír barva nůžky pastelka ' +
  'postel polička koberec kuchyně ručník hrnek lžíce vidlička pohovka záclona budík zvonek mýdlo taška ' +
  'rohlík houska banán hruška mrkev salám polévka koláč buchta čokoláda bonbón jogurt palačinka okurka rajče cibule ' +
  'louka kytka kopec potok rybník jezero zahrada ovoce šiška kaštan malina borůvka houba koruna podzim duha písek kámen ' +
  'autobus tramvaj letadlo lodička kolečko silnice garáž motorka ' +
  'liška zebra kočka kráva králík kachna slepice opice delfín želva žirafa gorila panda bizon holub jelen jezevec mýval klokan krocan kanec beruška housenka moucha pavouk bobr vydra tygr šnek kohout hroch motýl ' +
  'modrá žlutá zelená růžová hodný veselý smutný rychlý pomalý vysoký malinký čistý ' +
  'skáče plave zpívá maluje počítá pomáhá uklízí nakupuje jezdí létá houpá staví ' +
  'pohádka písnička narozeniny dáreček koloběžka houpačka pískoviště kamínek sluníčko panenka kostka balon čepice deštník'
).split(' ');

const WORDS_L5 = (
  'řeka řepa řízek peří moře talíř polštář dveře tři čtyři hřib hřeben hřiště pepř kouř ' +
  'medvěd město měsíc těsto dítě pěna věž pět devět květ hvězda sněhulák běhá věta ' +
  'loď labuť tuleň kuchyň síť chuť píseň báseň koně štěně káně ' +
  'strom vlak sklo mrak sníh vítr kluk krk prst srdce slunce zmrzlina knedlík drak brána vrána tráva dvůr štika skála smrk vrabec krab kapr hrad zvon vlajka švestka broskev mléko chléb vrata ' +
  'nosorožec chobotnice ještěrka plameňák lenochod orangutan velbloud krokodýl netopýr mravenec velryba tučňák papoušek křeček leopard žralok cvrček štír včela čmelák veverka sýkorka datel ' +
  'jedna dvě šest sedm osm deset sto středa čtvrtek pátek neděle týden'
).split(' ');

/* ---------- batch C: V2 (animal last, for match) + V3 (long) ---------- */
const SENTENCES = {
  pes:        ['Na dvoře štěká pes.',            'Pes hlídá dům a vrtí ocasem.'],
  kocka:      ['Na okně přede kočka.',           'Kočka pije mléko z misky.'],
  lev:        ['V savaně řve lev.',              'Lev má velkou chlupatou hřívu.'],
  sova:       ['V noci houká sova.',             'Sova vidí ve tmě každou myš.'],
  liska:      ['Lesem běží chytrá liška.',       'Liška má rezavý huňatý ocas.'],
  zebra:      ['V savaně běhá zebra.',           'Zebra má černé a bílé pruhy.'],
  kos:        ['Na stromě zpívá kos.',           'Kos hledá v trávě žížaly.'],
  krava:      ['Na louce se pase kráva.',        'Kráva nám dává čerstvé mléko.'],
  kun:        ['Po poli cválá kůň.',             'Kůň skáče přes vysokou ohradu.'],
  zaba:       ['U rybníka skáče žába.',          'Žába chytá mouchy dlouhým jazykem.'],
  slon:       ['V zoo troubí slon.',             'Slon nabírá vodu dlouhým chobotem.'],
  medved:     ['V lese bručí medvěd.',           'Medvěd si pochutnává na sladkém medu.'],
  had:        ['V trávě syčí had.',              'Had se plazí tiše mezi kameny.'],
  beran:      ['Na pastvě trká beran.',          'Beran má velké zatočené rohy.'],
  orel:       ['Vysoko na nebi krouží orel.',    'Orel vidí kořist z velké výšky.'],
  vlk:        ['V noci vyje vlk.',               'Vlk žije v lese se smečkou.'],
  hroch:      ['V řece se koupe hroch.',         'Hroch vydrží dlouho pod vodou.'],
  jelen:      ['Na pasece stojí jelen.',         'Jelen nosí na hlavě velké parohy.'],
  papousek:   ['Na větvi mluví papoušek.',       'Papoušek opakuje slova po lidech.'],
  prase:      ['V blátě se válí prase.',         'Prase rádo ryje rypákem v zemi.'],
  ovce:       ['Na louce bečí ovce.',            'Ovce nám dává teplou vlnu.'],
  koza:       ['Na dvorku mečí koza.',           'Koza okusuje listí z keře.'],
  kohout:     ['Na plotě kokrhá kohout.',        'Kohout ráno budí celý dvůr.'],
  slepice:    ['Na dvoře zobe slepice.',         'Slepice snáší každý den vejce.'],
  kachna:     ['Na rybníku káchá kachna.',       'Kachna plave a potápí se.'],
  husa:       ['U potoka kejhá husa.',           'Husa natahuje dlouhý bílý krk.'],
  kralik:     ['Mrkev chroupe malý králík.',     'Králík má dlouhé uši a hopká.'],
  mys:        ['Ve spíži piští myš.',            'Myš si hledá kousek sýra.'],
  krysa:      ['Ve sklepě běhá krysa.',          'Krysa má dlouhý holý ocásek.'],
  tygr:       ['Džunglí se plíží tygr.',         'Tygr má kožich plný pruhů.'],
  opice:      ['Na stromě dovádí opice.',        'Opice se houpe na větvi.'],
  zirafa:     ['Nad stromy kouká žirafa.',       'Žirafa dosáhne na nejvyšší listy.'],
  velbloud:   ['Pouští kráčí velbloud.',         'Velbloud vydrží dlouho bez vody.'],
  tucnak:     ['Na ledu stojí tučňák.',          'Tučňák plave rychle jako ryba.'],
  tulen:      ['Na skále leží tuleň.',           'Tuleň loví ryby ve studeném moři.'],
  delfin:     ['Nad vlnami skáče delfín.',       'Delfín si rád hraje s lidmi.'],
  velryba:    ['V oceánu zpívá velryba.',        'Velryba je největší zvíře světa.'],
  zelva:      ['Po písku leze želva.',           'Želva nosí domeček na zádech.'],
  ryba:       ['V potoce plave ryba.',           'Ryba dýchá pod vodou žábrami.'],
  kapr:       ['V rybníku žije kapr.',           'Kapr má velké lesklé šupiny.'],
  krokodyl:   ['V řece číhá krokodýl.',          'Krokodýl má silný dlouhý ocas.'],
  vcela:      ['Na květu bzučí včela.',          'Včela nosí sladký med do úlu.'],
  mravenec:   ['Po cestě spěchá mravenec.',      'Mravenec staví velké mraveniště.'],
  motyl:      ['Nad loukou poletuje motýl.',     'Motýl má křídla plná barev.'],
  moucha:     ['Po stole leze moucha.',          'Moucha bzučí kolem našich uší.'],
  pavouk:     ['V koutě tká pavouk.',            'Pavouk plete jemnou pavučinu.'],
  snek:       ['Po listu leze šnek.',            'Šnek nosí ulitu na zádech.'],
  jezek:      ['V listí funí ježek.',            'Ježek se stočí do klubíčka.'],
  bobr:       ['U řeky staví bobr.',             'Bobr kácí stromy ostrými zuby.'],
  vydra:      ['V potoce loví vydra.',           'Vydra plave hbitě pod vodou.'],
  klokan:     ['Travou skáče velký klokan.',     'Klokan nosí mládě v kapse.'],
  panda:      ['V bambusu sedí panda.',          'Panda jí bambus celý den.'],
  koala:      ['Na stromě dřímá koala.',         'Koala spí skoro celý den.'],
  lenochod:   ['Na větvi visí lenochod.',        'Lenochod dělá všechno hodně pomalu.'],
  gorila:     ['Pralesem kráčí gorila.',         'Gorila si staví hnízdo z listí.'],
  orangutan:  ['Po liánách šplhá orangutan.',    'Orangutan má dlouhé silné ruce.'],
  nosorozec:  ['Savanou duní nosorožec.',        'Nosorožec nosí na nose roh.'],
  lama:       ['Horskou stezkou jde lama.',      'Lama nosí náklad přes hory.'],
  leopard:    ['Na stromě odpočívá leopard.',    'Leopard ukrývá kořist na stromě.'],
  myval:      ['U vody se myje mýval.',          'Mýval vypadá jako malý loupežník.'],
  jezevec:    ['Do nory leze jezevec.',          'Jezevec spí celý den v noře.'],
  netopyr:    ['Nocí poletuje netopýr.',         'Netopýr spí hlavou dolů v jeskyni.'],
  kanec:      ['V lese ryje divoký kanec.',      'Kanec hledá žaludy pod dubem.'],
  osel:       ['Na statku hýká osel.',           'Osel nese pytle na zádech.'],
  los:        ['Bažinou kráčí velký los.',       'Los má parohy jako lopaty.'],
  krecek:     ['V kolečku běhá křeček.',         'Křeček si plní tváře zrním.'],
  bizon:      ['Na pláni se pase bizon.',        'Bizon má hustou hnědou srst.'],
  krocan:     ['Po dvoře hudruje krocan.',       'Krocan roztahuje ocas jako vějíř.'],
  holub:      ['Na střeše vrká holub.',          'Holub vždy najde cestu domů.'],
  labut:      ['Po hladině pluje labuť.',        'Labuť ohýbá dlouhý bílý krk.'],
  plamenak:   ['Na jedné noze stojí plameňák.',  'Plameňák stojí rád na jedné noze.'],
  pav:        ['Na zámku se chlubí páv.',        'Páv roztahuje ocas plný ok.'],
  kure:       ['Za slepicí běží kuře.',          'Kuře se vyklubalo z vejce.'],
  zralok:     ['Hlubinou pluje žralok.',         'Žralok má tři řady zubů.'],
  chobotnice: ['Mezi korály se skrývá chobotnice.', 'Chobotnice má osm dlouhých chapadel.'],
  krab:       ['Po pláži cupitá krab.',          'Krab se brání velkými klepety.'],
  jesterka:   ['Na kameni se sluní ještěrka.',   'Ještěrka umí odhodit svůj ocásek.'],
  beruska:    ['Na dlani sedí beruška.',         'Beruška má sedm černých teček.'],
  brouk:      ['Pod kůrou bydlí brouk.',         'Brouk schovává křídla pod krovky.'],
  housenka:   ['Po listu se plazí housenka.',    'Z housenky bude krásný motýl.'],
  cvrcek:     ['Na louce cvrká cvrček.',         'Cvrček cvrká celé léto.'],
  stir:       ['Pod kamenem číhá štír.',         'Štír zvedá ocas se žihadlem.']
};

/* ---------- batch D: mini stories ---------- */
const STORIES = [
  ['pes', 'Pes hlídá', ['Pes hlídá celý dům.', 'V noci slyší šramot.', 'Hlasitě zaštěká.', 'A zloděj rychle uteče.']],
  ['kocka', 'Kočka a klubíčko', ['Kočka našla klubíčko vlny.', 'Hrála si s ním celé ráno.', 'Vlna se celá zamotala.', 'Kočka usnula v klubíčku.']],
  ['liska', 'Liška a kos', ['Liška měla velký hlad.', 'Šla tiše tmavým lesem.', 'Kos ji uviděl a zapískal.', 'Všechna zvířata se schovala.']],
  ['jezek', 'Ježek a jablko', ['Ježek našel velké jablko.', 'Chtěl ho donést domů.', 'Jablko mu spadlo na bodliny.', 'A tak ho odnesl celé.']],
  ['sova', 'Moudrá sova', ['Zvířata se v noci bála.', 'Sova houkala ze stromu.', 'Já všechno vidím, řekla.', 'A zvířata klidně spala.']],
  ['zaba', 'Žába a moucha', ['Žába seděla u rybníka.', 'Kolem letěla velká moucha.', 'Žába vymrštila dlouhý jazyk.', 'A moucha byla pryč.']],
  ['medved', 'Medvěd a med', ['Medvěd hledal sladký med.', 'Vylezl na vysoký strom.', 'Včely se moc zlobily.', 'Medvěd utekl až k řece.']],
  ['mys', 'Myš a sýr', ['Myš ucítila voňavý sýr.', 'Tiše běžela přes kuchyň.', 'Kousek sýra si odnesla.', 'Doma se rozdělila s mláďaty.']],
  ['slon', 'Slon se koupe', ['Slonovi bylo velké horko.', 'Šel k široké řece.', 'Chobotem se celý postříkal.', 'A pak vesele troubil.']],
  ['zirafa', 'Žirafa pomáhá', ['Opice nedosáhla na banán.', 'Žirafa natáhla dlouhý krk.', 'Banán utrhla a podala.', 'Opice se radostí roztančila.']],
  ['opice', 'Opice a zrcadlo', ['Opice našla malé zrcadlo.', 'Uviděla v něm jinou opici.', 'Dělala na ni grimasy.', 'Pak se tomu sama smála.']],
  ['tucnak', 'Tučňák a led', ['Tučňák stál na ledu.', 'Led mu klouzal pod nohama.', 'Spadl na bříško a jel.', 'Klouzání ho moc bavilo.']],
  ['delfin', 'Delfín a loď', ['Delfín plaval u lodi.', 'Děti na něj mávaly.', 'Vyskočil vysoko nad vlny.', 'Děti křičely radostí.']],
  ['zelva', 'Pomalá želva', ['Želva šla na louku.', 'Cesta trvala celý den.', 'Nikam nespěchám, řekla si.', 'Domeček nese pořád s sebou.']],
  ['krokodyl', 'Krokodýl a zuby', ['Krokodýl má mnoho zubů.', 'Ráno si je čistí.', 'Pomáhá mu malý ptáček.', 'Krokodýl mu nikdy neublíží.']],
  ['panda', 'Panda a bambus', ['Panda snědla celý bambus.', 'Bříško měla úplně kulaté.', 'Lehla si do trávy.', 'A spokojeně usnula.']],
  ['klokan', 'Klokan závodí', ['Klokan skákal přes louku.', 'Závodil se svým stínem.', 'Skočil daleko přes potok.', 'Vyhrál a zamával ocasem.']],
  ['koala', 'Ospalá koala', ['Koala spala na stromě.', 'Probudila ji malá moucha.', 'Snědla pár lístků.', 'A zase klidně usnula.']],
  ['beruska', 'Beruška a tečky', ['Beruška počítala své tečky.', 'Jedna, dvě, tři, čtyři.', 'Sedm teček, radovala se.', 'Pak odletěla na květinu.']],
  ['snek', 'Šnek na výletě', ['Šnek se vydal na výlet.', 'Lezl pomalu po listu.', 'Večer dolezl na konec.', 'Domeček měl pořád s sebou.']],
  ['kun', 'Kůň a ohrada', ['Kůň cválal po louce.', 'Před ním stála ohrada.', 'Rozběhl se a skočil.', 'Letěl vzduchem jako pták.']],
  ['kure', 'Ztracené kuře', ['Kuře se ztratilo mámě.', 'Pípalo na celý dvůr.', 'Slepice ho rychle našla.', 'Schovala ho pod křídlo.']],
  ['vlk', 'Vlk a měsíc', ['Vlk seděl na kopci.', 'Na nebi svítil měsíc.', 'Vlk dlouze zavyl.', 'Z lesa mu odpověděla smečka.']],
  ['kralik', 'Králík a mrkev', ['Králík našel velkou mrkev.', 'Byla větší než on.', 'Tahal ji celé odpoledne.', 'Večer ji snědli všichni společně.']],
  ['lev', 'Lev má svátek', ['Lev měl velký svátek.', 'Přišla zvířata z celé savany.', 'Zpívala mu a tančila.', 'Lev spokojeně předl jako kočka.']]
];

/* ---------- build ---------- */
function main() {
  const animalsDoc = read('data/content/animals_50_seed.json');
  const vocab = read('data/content/vocabulary_200_seed.json');

  const byId = new Map(animalsDoc.animals.map((a) => [a.id, a]));
  const nameToId = new Map(animalsDoc.animals.map((a) => [a.name.toLowerCase(), a.id]));

  // sanity: every sentence/story id must exist
  for (const id of Object.keys(SENTENCES)) {
    if (!byId.has(id)) throw new Error(`SENTENCES: neznámé zvíře "${id}"`);
  }
  for (const [id] of STORIES) {
    if (!byId.has(id)) throw new Error(`STORIES: neznámé zvíře "${id}"`);
  }
  const missing = animalsDoc.animals.filter((a) => !SENTENCES[a.id]);
  if (missing.length) throw new Error('Chybí věty pro: ' + missing.map((a) => a.id).join(', '));

  const wordItem = (text) => {
    const item = { text };
    const aid = nameToId.get(text);
    if (aid) item.animalId = aid;
    return item;
  };

  // thematic sentences from the old vocab keep working (incl. theme categories)
  const thematic = vocab.entries.filter((e) => e.level === 'L7_sentences');
  const themShort = [];
  const themLong = [];
  for (const e of thematic) {
    const item = { text: e.text };
    if (e.category) item.category = e.category;
    (e.text.trim().split(/\s+/).length <= 3 ? themShort : themLong).push(item);
  }

  const sentencesShort = animalsDoc.animals.map((a) => ({
    text: a.sentence, matchText: SENTENCES[a.id][0], animalId: a.id
  }));
  const sentencesLong = animalsDoc.animals.map((a) => ({
    text: SENTENCES[a.id][1], matchText: SENTENCES[a.id][0], animalId: a.id
  }));

  // A thematic sentence can duplicate an animal sentence (e.g. "Pes štěká.").
  // Keep one item per text: the animal variant wins (it carries animalId +
  // matchText) and inherits the thematic category so theme filters still see it.
  const dedupeByText = (items) => {
    const byText = new Map();
    for (const item of items) {
      const existing = byText.get(item.text);
      if (!existing) { byText.set(item.text, item); continue; }
      if (!existing.category && item.category) existing.category = item.category;
    }
    return [...byText.values()];
  };

  const curriculum = {
    schema: 'reading-zoo.curriculum.v2',
    version: '2.0.0',
    language: 'cs-CZ',
    levels: [
      {
        id: 'letters', label: 'Lovec písmen', badge: '🔤', kind: 'letter',
        hint: 'Písmena – poznávej, čti a obtahuj.',
        items: LETTERS.map((ch) => {
          const item = { text: ch };
          const ids = LETTER_ANIMALS[ch];
          if (ids) item.animalIds = ids;
          return item;
        })
      },
      {
        id: 'syllables', label: 'Slabikové mládě', badge: '🧩', kind: 'syllable',
        hint: 'Krátké slabiky pro první čtení.',
        items: SYLLABLES.map((t) => ({ text: t }))
      },
      {
        id: 'words1', label: 'První slova', badge: '🐾', kind: 'word',
        hint: 'Krátká slova bez záludností.',
        items: WORDS_L3.map(wordItem)
      },
      {
        id: 'words2', label: 'Velká slova', badge: '📖', kind: 'word',
        hint: 'Delší slova o dvou a třech slabikách.',
        items: WORDS_L4.map(wordItem)
      },
      {
        id: 'words3', label: 'Záludná slova', badge: '🧗', kind: 'word',
        hint: 'Shluky souhlásek a háčky: ř, ě, ď, ť, ň.',
        items: WORDS_L5.map(wordItem)
      },
      {
        id: 'sentences1', label: 'Krátké věty', badge: '✏️', kind: 'sentence',
        hint: 'Věty o dvou a třech slovech.',
        items: dedupeByText([...sentencesShort, ...themShort])
      },
      {
        id: 'sentences2', label: 'Dlouhé věty', badge: '📜', kind: 'sentence',
        hint: 'Věty o čtyřech až šesti slovech.',
        items: dedupeByText([...sentencesLong, ...themLong])
      },
      {
        id: 'stories', label: 'Čtenář příběhů', badge: '👑', kind: 'story',
        hint: 'Mini příběhy se zvířaty z tvé ZOO.',
        items: []
      }
    ]
  };

  const stories = {
    schema: 'reading-zoo.stories.v1',
    version: '1.0.0',
    language: 'cs-CZ',
    count: STORIES.length,
    stories: STORIES.map(([animalId, title, sentences]) => ({
      id: `story-${animalId}`, animalId, title, sentences
    }))
  };

  writeFileSync(join(ROOT, 'data/content/curriculum_v2.json'), JSON.stringify(curriculum, null, 2) + '\n');
  writeFileSync(join(ROOT, 'data/content/stories_25.json'), JSON.stringify(stories, null, 2) + '\n');

  const counts = curriculum.levels.map((l) => `${l.id}:${l.items.length}`).join('  ');
  const total = curriculum.levels.reduce((n, l) => n + l.items.length, 0);
  console.log(`📚 curriculum_v2.json — ${counts}`);
  console.log(`   celkem položek: ${total} + ${stories.count} příběhů`);
}

main();
