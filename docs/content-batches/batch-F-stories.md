# Dávka F – příběhy pro všech 82 zvířat + otázky na porozumění

**K revizi.** Každé zvíře má nově krátký příběh (4 věty, odemyká se
vlastnictvím zvířete) a původních 25 zvířat navíc delší příběh
(8 vět, odemyká se za 3 ★). Na konci každého příběhu je otázka na
porozumění se třemi obrázkovými odpověďmi — správná odpověď přidá
zvířeti hvězdu (jen při prvním přečtení).

Strojově čitelný zdroj: `scripts/content-stories.mjs`
(→ `data/content/stories.json` přes `node scripts/build-curriculum.mjs`).
Tento soubor je generovaný přehled pro revizi.

## Krátké příběhy (úroveň 1 — za vlastnictví zvířete)

| Zvíře | Název | Věty | Otázka | Správně | Špatně |
|---|---|---|---|---|---|
| Pes | Pes hlídá | Pes hlídá celý dům. V noci slyší šramot. Hlasitě zaštěká. A zloděj rychle uteče. | Kdo v noci utekl? | 🦹 zloděj | 🐱 kočka · 🐭 myš |
| Kočka | Kočka a klubíčko | Kočka našla klubíčko vlny. Hrála si s ním celé ráno. Vlna se celá zamotala. Kočka usnula v klubíčku. | S čím si kočka hrála? | 🧶 s klubíčkem | 🎈 s balónkem · ⚽ s míčem |
| Liška | Liška a kos | Liška měla velký hlad. Šla tiše tmavým lesem. Kos ji uviděl a zapískal. Všechna zvířata se schovala. | Kdo lišku prozradil? | 🐦 kos | 🦉 sova · 🐿️ veverka |
| Ježek | Ježek a jablko | Ježek našel velké jablko. Chtěl ho donést domů. Jablko mu spadlo na bodliny. A tak ho odnesl celé. | Co ježek našel? | 🍎 jablko | 🌰 kaštan · 🍄 houbu |
| Sova | Moudrá sova | Zvířata se v noci bála. Sova houkala ze stromu. Já všechno vidím, řekla. A zvířata klidně spala. | Kdy sova houkala? | 🌙 v noci | 🌅 ráno · ☀️ v poledne |
| Žába | Žába a moucha | Žába seděla u rybníka. Kolem letěla velká moucha. Žába vymrštila dlouhý jazyk. A moucha byla pryč. | Koho žába chytila? | 🪰 mouchu | 🐝 včelu · 🦋 motýla |
| Medvěd | Medvěd a med | Medvěd hledal sladký med. Vylezl na vysoký strom. Včely se moc zlobily. Medvěd utekl až k řece. | Co medvěd hledal? | 🍯 med | 🍎 jablko · 🐟 rybu |
| Myš | Myš a sýr | Myš ucítila voňavý sýr. Tiše běžela přes kuchyň. Kousek sýra si odnesla. Doma se rozdělila s mláďaty. | Co myš ucítila? | 🧀 sýr | 🍞 chleba · 🍰 dort |
| Slon | Slon se koupe | Slonovi bylo velké horko. Šel k široké řece. Chobotem se celý postříkal. A pak vesele troubil. | Kam šel slon? | 🏞️ k řece | 🏠 domů · ⛰️ na horu |
| Žirafa | Žirafa pomáhá | Opice nedosáhla na banán. Žirafa natáhla dlouhý krk. Banán utrhla a podala. Opice se radostí roztančila. | Co žirafa utrhla? | 🍌 banán | 🍎 jablko · 🍐 hrušku |
| Opice | Opice a zrcadlo | Opice našla malé zrcadlo. Uviděla v něm jinou opici. Dělala na ni grimasy. Pak se tomu sama smála. | Co opice našla? | 🪞 zrcadlo | 📕 knihu · 🔑 klíč |
| Tučňák | Tučňák a led | Tučňák stál na ledu. Led mu klouzal pod nohama. Spadl na bříško a jel. Klouzání ho moc bavilo. | Po čem tučňák klouzal? | 🧊 po ledu | 🛝 po skluzavce · 🌾 po trávě |
| Delfín | Delfín a loď | Delfín plaval u lodi. Děti na něj mávaly. Vyskočil vysoko nad vlny. Děti křičely radostí. | Kdo mával na delfína? | 🧒 děti | 👴 děda · 🐕 pes |
| Želva | Pomalá želva | Želva šla na louku. Cesta trvala celý den. Nikam nespěchám, řekla si. Domeček nese pořád s sebou. | Co nese želva s sebou? | 🏠 domeček | 🎒 batoh · ☂️ deštník |
| Krokodýl | Krokodýl a zuby | Krokodýl má mnoho zubů. Ráno si je čistí. Pomáhá mu malý ptáček. Krokodýl mu nikdy neublíží. | Kdo krokodýlovi čistí zuby? | 🐦 ptáček | 🐒 opice · 🐟 ryba |
| Panda | Panda a bambus | Panda snědla celý bambus. Bříško měla úplně kulaté. Lehla si do trávy. A spokojeně usnula. | Co panda snědla? | 🎋 bambus | 🥕 mrkev · 🍎 jablko |
| Klokan | Klokan závodí | Klokan skákal přes louku. Závodil se svým stínem. Skočil daleko přes potok. Vyhrál a zamával ocasem. | Přes co klokan skočil? | 🏞️ přes potok | 🧱 přes zeď · 🌳 přes strom |
| Koala | Ospalá koala | Koala spala na stromě. Probudila ji malá moucha. Snědla pár lístků. A zase klidně usnula. | Kdo koalu probudil? | 🪰 moucha | 🐦 pták · ⏰ budík |
| Beruška | Beruška a tečky | Beruška počítala své tečky. Jedna, dvě, tři, čtyři. Sedm teček, radovala se. Pak odletěla na květinu. | Kolik má beruška teček? | 7️⃣ sedm | 3️⃣ tři · 9️⃣ devět |
| Šnek | Šnek na výletě | Šnek se vydal na výlet. Lezl pomalu po listu. Večer dolezl na konec. Domeček měl pořád s sebou. | Po čem šnek lezl? | 🍃 po listu | 🪨 po kameni · 🌉 po mostě |
| Kůň | Kůň a ohrada | Kůň cválal po louce. Před ním stála ohrada. Rozběhl se a skočil. Letěl vzduchem jako pták. | Přes co kůň skočil? | 🚧 přes ohradu | 🏞️ přes potok · 🪨 přes kámen |
| Kuře | Ztracené kuře | Kuře se ztratilo mámě. Pípalo na celý dvůr. Slepice ho rychle našla. Schovala ho pod křídlo. | Kdo kuře našel? | 🐔 slepice | 🐕 pes · 🐄 kráva |
| Vlk | Vlk a měsíc | Vlk seděl na kopci. Na nebi svítil měsíc. Vlk dlouze zavyl. Z lesa mu odpověděla smečka. | Co svítilo na nebi? | 🌕 měsíc | ☀️ slunce · 🌈 duha |
| Králík | Králík a mrkev | Králík našel velkou mrkev. Byla větší než on. Tahal ji celé odpoledne. Večer ji snědli všichni společně. | Co králík našel? | 🥕 mrkev | 🥔 brambor · 🍎 jablko |
| Lev | Lev má svátek | Lev měl velký svátek. Přišla zvířata z celé savany. Zpívala mu a tančila. Lev spokojeně předl jako kočka. | Co dělala zvířata na svátku? | 💃 zpívala a tančila | 😴 spala · 🏊 plavala |
| Zebra | Zebra a koupel | Zebra běhala po savaně. Prach jí zašpinil pruhy. Skočila do vody a plavala. Pruhy zase krásně zářily. | Kam zebra skočila? | 💧 do vody | 🕳️ do jámy · 🌾 do trávy |
| Kos | Kos zpívá | Kos seděl na střeše. Zpíval veselou písničku. Lidé se zastavili a poslouchali. Kos zpíval až do večera. | Co kos dělal na střeše? | 🎵 zpíval | 😴 spal · 🍽️ jedl |
| Kráva | Kráva na louce | Kráva se pásla na louce. Snědla hodně čerstvé trávy. Večer dala plný džbán mléka. Dětem moc chutnalo. | Co dala kráva večer? | 🥛 mléko | 🥚 vejce · 🍯 med |
| Had | Had na slunci | Had se vyhříval na kameni. Pak se tiše plazil trávou. Našel svou starou kůži. Novou měl krásně lesklou. | Co had našel v trávě? | 🐍 starou kůži | 🥚 vejce · 🪨 kámen |
| Beran | Beran a vrata | Beran chtěl na louku. Vrata byla zavřená. Trkl do nich rohy. Vrata povolila a beran se pásl. | Čím beran trkl do vrat? | 🐏 rohy | 🦵 nohou · 🪶 ocasem |
| Orel | Orel letí vysoko | Orel kroužil nad horami. Viděl celé údolí. Dole běžel malý zajíc. Orel dnes jen létal a koukal. | Koho orel viděl dole? | 🐇 zajíce | 🐭 myš · 🦊 lišku |
| Hroch | Hroch v řece | Hrochovi bylo velké horko. Ponořil se do řeky. Koukala mu jen očka. Ve vodě zůstal celý den. | Kde se hroch schoval před horkem? | 🏞️ v řece | 🌳 pod stromem · 🏠 v domě |
| Jelen | Jelen v lese | Jelen stál na pasece. Na hlavě měl velké parohy. Zatroubil na celý les. Les mu odpověděl ozvěnou. | Co má jelen na hlavě? | 🦌 parohy | 🎩 klobouk · 👑 korunu |
| Papoušek | Papoušek mluví | Papoušek se učil slova. Řekl „ahoj" celé rodině. Všichni se smáli. Papoušek to opakoval celý den. | Co papoušek říkal? | 👋 ahoj | 🌙 dobrou noc · 🙏 děkuji |
| Prase | Prase a bláto | Prase našlo velkou louži. S radostí do ní skočilo. Válelo se v blátě. Večer ho máma umyla. | Do čeho prase skočilo? | 💦 do louže | 🛁 do vany · 🛏️ do postele |
| Ovce | Ovce a vlna | Ovce měla hustou vlnu. V létě jí bylo horko. Hospodář ji ostříhal. Z vlny bude teplý svetr. | Co bude z ovčí vlny? | 🧶 svetr | 👟 boty · 🎩 klobouk |
| Koza | Koza na dvorku | Koza mečela na dvorku. Chtěla čerstvé listí. Natáhla se přes plot. Okusala celý keř. | Co koza okusala? | 🌿 keř | 🌷 kytku · 🥕 mrkev |
| Kohout | Kohout budí dvůr | Ráno vyšlo sluníčko. Kohout vyletěl na plot. Hlasitě zakokrhal. Celý dvůr se probudil. | Kdy kohout kokrhá? | 🌅 ráno | 🌙 v noci · 🌆 večer |
| Slepice | Slepice a vejce | Slepice seděla v kurníku. Snesla krásné vejce. Pyšně kdákala na celý dvůr. Z vejce se vyklube kuře. | Co slepice snesla? | 🥚 vejce | 🪶 pírko · 🌰 ořech |
| Kachna | Kachna plave | Kachna plavala po rybníku. Za ní plula malá káčátka. Jedno se schovalo v rákosí. Kachna ho rychle našla. | Kdo plaval za kachnou? | 🐥 káčátka | 🐟 ryby · 🐸 žáby |
| Husa | Husa hlídá | Husa hlídala dvorek. Na dvorek přišel pošťák. Husa hlasitě kejhala. Pošťák rychle utekl. | Kdo utekl před husou? | 📬 pošťák | 🦊 liška · 🐈 kočka |
| Krysa | Chytrá krysa | Krysa bydlela ve sklepě. Našla kousek tvrdého chleba. Odnesla ho do pelíšku. Rozdělila se s mláďaty. | Co krysa našla? | 🍞 chleba | 🧀 sýr · 🍎 jablko |
| Tygr | Tygr se plíží | Tygr se plížil trávou. Byl tichý jako stín. Chtěl překvapit kamaráda. Pak si spolu hráli. | Jaký byl tygr v trávě? | 🤫 tichý | 📢 hlučný · 😴 ospalý |
| Velbloud | Velbloud na poušti | Velbloud šel přes poušť. Nesl těžký náklad. Dlouho nepil vodu. Večer došel k oáze a napil se. | Kam velbloud večer došel? | 🌴 k oáze | 🏔️ na horu · 🏖️ k moři |
| Tuleň | Tuleň a míč | Tuleň si hrál u moře. Děti mu hodily míč. Chytil ho na nos. Všichni mu tleskali. | Na co tuleň chytil míč? | 👃 na nos | 🦶 na nohu · 👂 na ucho |
| Velryba | Velryba zpívá | Velryba plavala oceánem. Zpívala dlouhou píseň. Slyšely ji ryby i delfíni. Píseň zněla celou noc. | Co velryba dělala? | 🎵 zpívala | 💤 spala · 🍽️ jedla |
| Ryba | Ryba v potoce | Ryba plavala v potoce. Šupiny se jí blýskaly. Schovala se pod kámen. Tam si spokojeně odpočívala. | Kam se ryba schovala? | 🪨 pod kámen | 🍃 pod list · 🌉 pod most |
| Kapr | Kapr v rybníce | Kapr bydlel v rybníce. Měl velké lesklé šupiny. Děti mu hodily kousek rohlíku. Kapr mlaskal u hladiny. | Co děti hodily kaprovi? | 🥖 rohlík | 🍎 jablko · 🧀 sýr |
| Včela | Včela a med | Včela létala po louce. Sbírala sladký nektar. Odnesla ho do úlu. Bude z něj voňavý med. | Co včela sbírala? | 🌸 nektar | 💧 vodu · 🍂 listí |
| Mravenec | Pilný mravenec | Mravenec nesl velkou jehličku. Byla větší než on. Kamarádi mu přišli pomoct. Donesli ji společně do mraveniště. | Kdo mravenci pomohl? | 🐜 kamarádi | 🐦 pták · 🐘 slon |
| Motýl | Motýl a květina | Motýl létal nad zahradou. Uviděl krásnou květinu. Sedl si na ni. Napil se sladké šťávy. | Na co si motýl sedl? | 🌸 na květinu | 🪨 na kámen · 🏠 na střechu |
| Moucha | Moucha a okno | Moucha bzučela u okna. Chtěla ven na sluníčko. Maminka otevřela okno. Moucha vyletěla ven. | Kam chtěla moucha letět? | ☀️ ven na sluníčko | 🛏️ do postele · 🧊 do lednice |
| Pavouk | Pavouk staví síť | Pavouk pletl pavučinu. Vlákna se třpytila rosou. Do sítě foukl vítr. Pavučina byla pevná a vydržela. | Co pavouk pletl? | 🕸️ pavučinu | 🧶 svetr · 🧺 košík |
| Bobr | Bobr staví hráz | Bobr kácel malý strom. Odnesl ho k řece. Stavěl pevnou hráz. Večer byla hráz hotová. | Co bobr stavěl? | 🌊 hráz | 🏠 dům · 🌉 most |
| Vydra | Vydra si hraje | Vydra plavala na zádech. Na bříšku měla kamínek. Rozlouskla s ním mušli. Pochutnala si na dobrotě. | Co měla vydra na bříšku? | 🪨 kamínek | ⚽ míček · 🍎 jablko |
| Lenochod | Lenochod na výletě | Lenochod visel na větvi. Rozhodl se pro výlet. Lezl celé odpoledne. Dolezl na vedlejší strom. | Kam lenochod dolezl? | 🌳 na vedlejší strom | ⛰️ na horu · 🏠 domů |
| Gorila | Gorila a hnízdo | Gorila sbírala větve a listí. Stavěla si měkké hnízdo. Vyzkoušela ho tlapou. Spokojeně v něm usnula. | Z čeho gorila stavěla hnízdo? | 🍃 z větví a listí | 🪨 z kamenů · 🧱 z cihel |
| Orangutan | Orangutan a liány | Orangutan se houpal na liáně. Přeskočil na další strom. Utrhl si zralé ovoce. Snědl ho vysoko v koruně. | Co si orangutan utrhl? | 🍊 ovoce | 🌰 ořech · 🍄 houbu |
| Nosorožec | Nosorožec a ptáček | Nosorožec se pásl v savaně. Na zádech mu seděl ptáček. Vybíral mu z kůže brouky. Byli dobří kamarádi. | Kdo seděl nosorožci na zádech? | 🐦 ptáček | 🐒 opice · 🐭 myš |
| Lama | Lama v horách | Lama stoupala do kopce. Nesla malý náklad. Nahoře se rozhlédla. Hory byly moc krásné. | Kam lama stoupala? | ⛰️ do kopce | 🏖️ k moři · 🌲 do lesa |
| Leopard | Leopard na stromě | Leopard vylezl na strom. Natáhl se na větev. Pozoroval celou savanu. Nahoře se cítil bezpečně. | Kde leopard odpočíval? | 🌳 na stromě | 🕳️ v noře · 🏖️ na písku |
| Mýval | Mýval a večeře | Mýval našel jablko. Odnesl ho k potoku. Pečlivě ho umyl. Teprve pak si pochutnal. | Co mýval udělal s jablkem? | 💦 umyl ho | 🙈 schoval ho · 🎨 namaloval ho |
| Jezevec | Jezevec a nora | Jezevec kopal novou noru. Měla mnoho chodbiček. Vystlal ji suchou trávou. Spal v ní celou zimu. | Čím jezevec vystlal noru? | 🌾 trávou | 🪶 peřím · 🍂 listím |
| Netopýr | Netopýr v noci | Večer se setmělo. Netopýr vyletěl z jeskyně. Létal tiše nad zahradou. Ráno usnul hlavou dolů. | Jak netopýr spí? | 🙃 hlavou dolů | 🛏️ v posteli · 🌿 v trávě |
| Kanec | Kanec a žaludy | Kanec ryl pod dubem. Hledal sladké žaludy. Našel jich plnou jamku. Spokojeně zamlaskal. | Co kanec hledal? | 🌰 žaludy | 🍎 jablka · 🥕 mrkev |
| Osel | Osel a odměna | Osel nesl těžké pytle. Cesta byla dlouhá. Na trhu dostal mrkev. Spokojeně zahýkal. | Co osel dostal na trhu? | 🥕 mrkev | 🍞 chleba · 🍬 bonbón |
| Los | Los u jezera | Los stál u jezera. Pil studenou vodu. Parohy měl jako lopaty. Pak tiše zmizel v lese. | Jaké má los parohy? | 🥄 jako lopaty | 🌿 jako větvičky · 📏 úplně malé |
| Křeček | Křeček a zásoby | Křeček našel zrní. Nacpal si plné tváře. Odnesl zásoby do komůrky. Tváře měl zase malé. | Kam si křeček dal zrní? | 😊 do tváří | 🎒 do batohu · 🧺 do košíku |
| Bizon | Bizon na pláni | Po pláni běželo stádo bizonů. Země duněla jako buben. Večer se stádo zastavilo. Bizoni se klidně pásli. | Jak zněla země pod bizony? | 🥁 jako buben | 🎻 jako housle · 🔔 jako zvonek |
| Krocan | Pyšný krocan | Krocan chodil po dvoře. Roztáhl ocas jako vějíř. Hudroval na slepice. Byl na sebe moc pyšný. | Jak krocan roztáhl ocas? | 🦚 jako vějíř | ☂️ jako deštník · 🥞 jako palačinku |
| Holub | Holub a vzkaz | Holub nesl malý vzkaz. Letěl přes celé město. Našel správný dům. Dostal za odměnu zrní. | Co holub nesl? | ✉️ vzkaz | 🥖 rohlík · 🔑 klíč |
| Labuť | Labuť na hladině | Labuť plula po rybníku. Byla bílá jako sníh. Ohnula dlouhý krk. Vylovila si vodní trávu. | Jaká byla labuť? | ❄️ bílá jako sníh | 🌑 černá jako noc · 🌈 barevná jako duha |
| Plameňák | Plameňák stojí | Plameňák stál ve vodě. Stál jen na jedné noze. Druhou nohu si schoval. Vydržel tak celé odpoledne. | Na kolika nohách plameňák stál? | 1️⃣ na jedné | 2️⃣ na dvou · 4️⃣ na čtyřech |
| Páv | Páv se chlubí | Páv chodil po zahradě. Roztáhl krásný ocas. Peří svítilo modře a zeleně. Všichni se přišli podívat. | Co páv roztáhl? | 🦚 ocas | 🪽 křídla · ⛺ stan |
| Žralok | Žralok a zoubky | Žralok plaval hlubinou. Usmál se na malou rybku. Měl tři řady zubů. Rybka mu zamávala ploutví. | Kolik řad zubů má žralok? | 3️⃣ tři | 1️⃣ jednu · 5️⃣ pět |
| Chobotnice | Chobotnice kouzlí | Chobotnice se schovala mezi korály. Změnila barvu na červenou. Pak zase na modrou. Rybky jí tleskaly ploutvemi. | Co chobotnice měnila? | 🎨 barvu | 👗 šaty · 🏠 domeček |
| Krab | Krab na pláži | Krab cupital po písku. Chodil pěkně bokem. Vlnka ho polechtala. Zahrabal se do písku. | Jak krab chodí? | ↔️ bokem | 🔙 pozpátku · 🦘 skáče |
| Ještěrka | Ještěrka a ocásek | Ještěrka se slunila na zídce. Kočka ji chtěla chytit. Ještěrka odhodila ocásek. Nový jí zase doroste. | Co ještěrka odhodila? | 🦎 ocásek | 👟 botu · 🎒 batoh |
| Brouk | Brouk a krovky | Brouk lezl po kůře. Schoval křídla pod krovky. Spadla na něj kapka deště. Krovky ho ochránily. | Kam brouk schoval křídla? | 🛡️ pod krovky | 🍃 pod list · 🪨 pod kámen |
| Housenka | Housenka a proměna | Housenka snědla mnoho listů. Zabalila se do kukly. Dlouho v ní spala. Probudila se jako motýl. | Kdo se probudil z kukly? | 🦋 motýl | 🐝 včela · 🐞 beruška |
| Cvrček | Cvrček muzikant | Cvrček seděl v trávě. Hrál na svoje housličky. Světlušky mu svítily. Koncert trval celou noc. | Kdo cvrčkovi svítil? | ✨ světlušky | 🌞 slunce · 🔦 baterka |
| Štír | Štír pod kamenem | Štír bydlel pod kamenem. Ve dne spal. V noci šel na procházku. Ráno se vrátil domů. | Kde štír bydlel? | 🪨 pod kamenem | 🌳 na stromě · 💧 ve vodě |

## Delší příběhy (úroveň 2 — za 3 ★)

| Zvíře | Název | Věty | Otázka | Správně | Špatně |
|---|---|---|---|---|---|
| Pes | Pes a ztracený míček | Kluk hodil psovi míček. Míček se zakutálel do křoví. Pes hledal a čichal. V křoví seděl ježek. Pes se lekl a štěkl. Ježek se stočil do klubíčka. Míček ležel hned vedle. Pes ho hrdě přinesl zpátky. | Kdo seděl v křoví? | 🦔 ježek | 🐱 kočka · 🐍 had |
| Kočka | Kočka na střeše | Kočka vylezla na střechu. Honila tam barevného motýla. Motýl uletěl vysoko. Kočka se podívala dolů. Střecha byla moc vysoká. Mňoukala na celou ulici. Táta přinesl dlouhý žebřík. Kočka mu vděčně předla. | Co táta přinesl? | 🪜 žebřík | ☂️ deštník · 🧺 košík |
| Liška | Liška a ztracené kuře | Kuře se ztratilo v lese. Bálo se a pípalo. Našla ho chytrá liška. Kuře se třáslo strachy. Liška se jen usmála. Ukázala mu cestu domů. Slepice radostí kdákala. Od té doby byli kamarádi. | Koho liška našla v lese? | 🐥 kuře | 🐭 myš · 🐸 žábu |
| Ježek | Ježek a zima | Listí padalo ze stromů. Ježek cítil, že přijde zima. Sbíral suché listí. Postavil si teplé hnízdo. Snědl poslední jablko. Stočil se do klubíčka. Spal celou dlouhou zimu. Probudilo ho až jaro. | Kdy se ježek probudil? | 🌸 na jaře | ❄️ v zimě · 🍂 na podzim |
| Sova | Sova učitelka | Zvířata chtěla umět počítat. Sova otevřela lesní školu. Učila je čísla do deseti. Veverka počítala oříšky. Medvěd počítal hrnce medu. Zajíc počítal mrkve. Všichni dostali jedničku. Sova byla pyšná učitelka. | Co počítala veverka? | 🌰 oříšky | 🍯 med · 🥕 mrkve |
| Žába | Žába a velký závod | Zvířata pořádala závod ve skákání. Přišel zajíc i kobylka. Žába se dlouho připravovala. Pak skočila obrovský skok. Přeskočila celou louži. Zajíc jen valil oči. Žába vyhrála zlatý leknín. Večer slavili u rybníka. | Co žába vyhrála? | 🌸 leknín | 🏆 pohár · 🍰 dort |
| Medvěd | Medvěd a zimní spánek | Medvěd celé léto jedl. Maliny, borůvky i med. Na podzim našel jeskyni. Vystlal ji měkkým mechem. Venku začal padat sníh. Medvěd zívl a lehl si. Spal až do jara. Na jaře měl velký hlad. | Čím medvěd vystlal jeskyni? | 🌿 mechem | 🪶 peřím · 🧣 dekou |
| Myš | Myš a velký sýr | Myška našla obrovský sýr. Byl větší než ona. Tlačila ho přes kuchyň. Sýr se ani nehnul. Zavolala pět kamarádek. Tlačily všechny společně. Sýr dojel až do díry. Hostina trvala celý týden. | Kolik kamarádek myška zavolala? | 5️⃣ pět | 2️⃣ dvě · 🔟 deset |
| Slon | Slon a malá myška | Slon si poranil nohu. V tlapě měl ostrý trn. Nikdo mu neuměl pomoct. Přišla malá myška. Vytáhla trn zoubky. Slonovi se hned ulevilo. Zatroubil myšce děkuji. Od té doby byli přátelé. | Kdo slonovi pomohl? | 🐭 myška | 🐒 opice · 🦒 žirafa |
| Žirafa | Žirafa a papírový drak | Dětem uletěl papírový drak. Zamotal se do vysokého stromu. Nikdo na něj nedosáhl. Přišla hodná žirafa. Natáhla svůj dlouhý krk. Opatrně draka vymotala. Děti tleskaly radostí. Drak zase létal po obloze. | Co se zamotalo do stromu? | 🪁 drak | 🎈 balónek · ⚽ míč |
| Opice | Opice a banánová hostina | Opice našla banánovník. Visely na něm zralé banány. Zavolala celou rodinu. Trhali banány společně. Nejmenší opička sklouzla po slupce. Všichni se vesele smáli. Slupky uklidili pod strom. Byla to nejlepší hostina. | Po čem opička sklouzla? | 🍌 po slupce | 🧊 po ledu · 🍃 po listí |
| Tučňák | Tučňák hledá čepici | Tučňákovi byla zima na hlavu. Vítr mu odnesl čepici. Hledal ji na ledu. Hledal ji i ve vodě. Čepici měl na hlavě tuleň. Omluvil se a vrátil ji. Tučňák si ji nasadil. Kamarádi šli spolu klouzat. | Kdo měl tučňákovu čepici? | 🦭 tuleň | 🐋 velryba · 🐧 jiný tučňák |
| Delfín | Delfín zachránce | Malá rybka se ztratila. Vlny byly moc velké. Rybka volala o pomoc. Připlaval rychlý delfín. Ukázal jí cestu domů. Plavali spolu mezi vlnami. Hejno rybku radostně vítalo. Delfín vesele vyskočil z vody. | Kdo rybce pomohl? | 🐬 delfín | 🦈 žralok · 🐢 želva |
| Želva | Želva a zajíc | Zajíc se chlubil rychlostí. Vyzval želvu na závod. Želva šla pomalu a stále. Zajíc si lehl a usnul. Želva ho tiše minula. Došla první do cíle. Zajíc se probudil pozdě. Pomalu a jistě vyhrává. | Kdo vyhrál závod? | 🐢 želva | 🐇 zajíc · 🦊 liška |
| Krokodýl | Krokodýl u zubaře | Krokodýla bolel zub. Bál se ho ukázat. Ptáček mu dodal odvahu. Krokodýl otevřel velkou tlamu. Ptáček zoubek vyčistil. Bolest byla hned pryč. Krokodýl slíbil čistit zuby. Každé ráno i večer. | Co krokodýla bolelo? | 🦷 zub | 👂 ucho · 🦵 noha |
| Panda | Panda a sněhulák | V horách napadl sníh. Panda viděla sníh poprvé. Válela se v závějích. Postavila velkou kouli. Pak druhou a třetí. Vznikl krásný sněhulák. Místo nosu měl bambus. Panda ho hrdě ukázala mámě. | Co měl sněhulák místo nosu? | 🎋 bambus | 🥕 mrkev · 🌰 šišku |
| Klokan | Klokan a kapsa | Klokaní máma měla kapsu. Malý klokan v ní bydlel. Jednou vyskočil ven. Zkusil první malý skok. Pak skočil přes kámen. Pak přes celý potok. Večer se vrátil k mámě. V kapse je přece nejlíp. | Kde malý klokan bydlel? | 👝 v kapse | 🛏️ v postýlce · 🕳️ v noře |
| Koala | Koala a nový strom | Koala snědla všechno listí. Strom byl úplně holý. Musela najít nový. Lezla pomalu dolů. Přešla přes celou louku. Našla krásný nový strom. Vylezla do jeho koruny. Usnula s plným bříškem. | Proč koala hledala nový strom? | 🍃 snědla všechno listí | 🌧️ pršelo · 🔥 bylo horko |
| Beruška | Beruška a deštík | Beruška letěla na louku. Najednou začalo pršet. Kapky byly veliké. Schovala se pod hřib. Pod hřibem seděl mravenec. Déšť přečkali spolu. Pak vysvitlo sluníčko. Na obloze zářila duha. | Kam se beruška schovala? | 🍄 pod hřib | 🍃 pod list · 🪨 pod kámen |
| Šnek | Šnek a jahoda | Šnek se probudil po dešti. Celá zahrada voněla. Vydal se za vůní jahod. Cesta trvala celý den. Večer k jahodě dolezl. Byla sladká a šťavnatá. Kousek nechal berušce. Spokojeně usnul v trávě. | Komu šnek nechal kousek jahody? | 🐞 berušce | 🐜 mravenci · 🐛 housence |
| Kůň | Kůň a malý jezdec | Tomík se učil jezdit. Kůň stál klidně. Tomík se vyhoupl do sedla. Kůň šel pomalým krokem. Pak zkusili rychlý klus. Tomík se držel pevně. Objeli celou louku. Kůň dostal sladkou mrkev. | Co kůň dostal za odměnu? | 🥕 mrkev | 🍬 bonbón · 🥖 rohlík |
| Kuře | Kuře se učí zobat | Kuře se učilo zobat. Máma ukázala zrníčko. Kuře kloflo vedle. Zkusilo to znovu. A zase klovlo vedle. Potřetí zrnko trefilo. Pípalo samou radostí. Máma ho pochválila. | Co se kuře učilo? | 🌾 zobat | 🏊 plavat · 🎶 zpívat |
| Vlk | Vlček se učí výt | Malý vlček se učil výt. Vyšel na vysoký kopec. Zkusil první zavytí. Znělo jako pískání. Táta vlk mu ukázal jak. Vlček to zkusil znovu. Tentokrát zavyl krásně. Celá smečka mu odpověděla. | Co se vlček učil? | 🌕 výt | 🏃 běhat · 🕳️ kopat noru |
| Králík | Králík a nová nora | Králíků bylo v noře moc. Malý králík kopal novou. Hlína létala na všechny strany. Vykopal chodbu i pokojíček. Vystlal ho suchou trávou. Pozval sourozence na návštěvu. Všem se nora líbila. Usnuli v ní jako dudci. | Co králík vykopal? | 🕳️ novou noru | 🏰 hrad · 🏊 bazén |
| Lev | Lvíče a ozvěna | Lvíče zařvalo do údolí. Něco zařvalo zpátky. Lvíče se polekalo. Uteklo rychle za mámou. Máma se jen usmála. To byla přece ozvěna. Lvíče zkusilo řvát znovu. S ozvěnou si povídalo do večera. | Kdo odpovídal lvíčeti? | 🗣️ ozvěna | 🐯 tygr · 🦜 papoušek |
