/**
 * =========================================================================
 * 🏰 SZABOLCSFOGLALÓ — NAGY MŰVELTSÉGI KÉRDÉSADATBÁZIS
 * =========================================================================
 * Klasszikus Honfoglaló stílusú kérdések a legfontosabb műveltségi területekről:
 * Történelem, Földrajz, Irodalom, Tudomány, Művészet, Sport és Popkultúra.
 * 
 * -------------------------------------------------------------------------
 * ✏️ HOGYAN ADHATSZ HOZZÁ SAJÁT KÉRDÉSEKET? (ÚTMUTATÓ)
 * -------------------------------------------------------------------------
 * Nagyon egyszerűen bővítheted a játékot a saját kérdéseiddel!
 * Keresd meg a fájlban a "SAJÁT KÉRDÉSEK" részt (vagy illeszd be a lista végére),
 * és másold le az alábbi minták egyikét:
 *
 * 1. MINTA FELELETVÁLASZTÓS KÉRDÉSHEZ:
 * {
 *   q: "Mi Magyarország fővárosa?",
 *   a: ["Budapest", "Debrecen", "Szeged", "Győr"], // 4 db válaszlehetőség
 *   correct: 0, // Mindig a helyes válasz sorszáma (0 = első elem). A játék automatikusan összekeveri!
 *   topic: "Földrajz" // Bármilyen témamegnevezés
 * },
 *
 * 2. MINTA TIPPELŐS (SZÁMOLÓS) KÉRDÉSHEZ:
 * {
 *   q: "Melyik évben volt az 1848-as forradalom és szabadságharc kitörése?",
 *   answer: 1848,   // A pontos helyes számérték
 *   min: 1800,      // Csúszka alsó határa (opcionális)
 *   max: 1900,      // Csúszka felső határa (opcionális)
 *   unit: "év",     // Mértékegység: pl. év, méter, km, darab, kg, %
 *   topic: "Történelem"
 * },
 * =========================================================================
 */

const QUESTIONS_DATABASE = {
  // =========================================================================
  // 1. FELELETVÁLASZTÓS KÉRDÉSEK (4 lehetséges válasszal)
  // =========================================================================
  choice: [
    // --- 👑 SAJÁT KÉRDÉSEID HELYE (Ide írhatsz be újakat!) ---
    {
      q: "Melyik vármegye székhelye Nyíregyháza?",
      a: ["Szabolcs-Szatmár-Bereg", "Borsod-Abaúj-Zemplén", "Hajdú-Bihar", "Békés"],
      correct: 0,
      topic: "Szabolcsi helyismeret"
    },
    {
      q: "Melyik híres magyar író és költő született Érmindszenten és tanult Nagykárolyban?",
      a: ["Ady Endre", "Móricz Zsigmond", "Kölcsey Ferenc", "Petőfi Sándor"],
      correct: 0,
      topic: "Irodalom"
    },

    // --- 🏛️ MAGYAR ÉS EGYETEMES TÖRTÉNELEM ---
    {
      q: "Melyik évben ért véget a második világháború?",
      a: ["1945", "1939", "1948", "1944"],
      correct: 0,
      topic: "Történelem"
    },
    {
      q: "Ki volt az ókori Római Birodalom legelső császára?",
      a: ["Augustus", "Julius Caesar", "Nero", "Traianus"],
      correct: 0,
      topic: "Történelem"
    },
    {
      q: "Melyik évben fedezte fel Kolumbusz Kristóf Amerikát?",
      a: ["1492", "1488", "1504", "1512"],
      correct: 0,
      topic: "Történelem"
    },
    {
      q: "Melyik híres ókori világcsoda maradt fenn mindmáig épségben Egyiptomban?",
      a: ["A gízai piramisok", "A rodoszi kolosszus", "A pharoszi világítótorony", "Szemiramisz függőkertje"],
      correct: 0,
      topic: "Történelem"
    },
    {
      q: "Melyik évben robbant ki a francia forradalom a Bastille ostromával?",
      a: ["1789", "1776", "1804", "1799"],
      correct: 0,
      topic: "Történelem"
    },
    {
      q: "Ki volt Franciaország császára, aki vereséget szenvedett a waterlooi csatában?",
      a: ["Napoléon Bonaparte", "XIV. Lajos", "XVI. Lajos", "Charles de Gaulle"],
      correct: 0,
      topic: "Történelem"
    },
    {
      q: "Melyik évben omlott le a hidegháborút lezáró híres Berlini fal?",
      a: ["1989", "1991", "1985", "1979"],
      correct: 0,
      topic: "Történelem"
    },
    {
      q: "Melyik hajó süllyedt el tragikusan 1912-ben az Atlanti-óceánon jégheggyel ütközve?",
      a: ["Titanic", "Lusitania", "Britannic", "Bismarck"],
      correct: 0,
      topic: "Történelem"
    },
    {
      q: "Ki volt a legendás hadvezér, aki megalapította a Mongol Birodalmat a 13. században?",
      a: ["Dzsingisz kán", "Kubiláj kán", "Attila", "Batu kán"],
      correct: 0,
      topic: "Történelem"
    },
    {
      q: "Melyik évben koronázták meg Szent Istvánt, Magyarország első királyát?",
      a: ["1000", "896", "1038", "1222"],
      correct: 0,
      topic: "Magyar Történelem"
    },
    {
      q: "Melyik magyar király bocsátotta ki az Aranybullát 1222-ben Fehérváron?",
      a: ["II. András", "IV. Béla", "I. Károly", "Könyves Kálmán"],
      correct: 0,
      topic: "Magyar Történelem"
    },
    {
      q: "Kit neveztek a magyar történelemben 'második honalapítónak' a tatárjárás utáni újjáépítésért?",
      a: ["IV. Béla", "Szent László", "Károly Róbert", "Zsigmond király"],
      correct: 0,
      topic: "Magyar Történelem"
    },
    {
      q: "Melyik vár védelmében aratott hősi győzelmet Dobó István várkapitány a túlerőben lévő török sereg felett?",
      a: ["Egri vár", "Szigetvár", "Nándorfehérvár", "Kőszeg"],
      correct: 0,
      topic: "Magyar Történelem"
    },
    {
      q: "Melyik évben zajlott a mohácsi csata, amely a középkori Magyar Királyság bukásához vezetett?",
      a: ["1526", "1541", "1514", "1456"],
      correct: 0,
      topic: "Magyar Történelem"
    },
    {
      q: "Ki vezette az 1703 és 1711 közötti szabadságharcot a Habsburg-uralom ellen?",
      a: ["II. Rákóczi Ferenc", "Thököly Imre", "Bocskai István", "Bethlen Gábor"],
      correct: 0,
      topic: "Magyar Történelem"
    },
    {
      q: "Melyik dátumon tört ki a pesti forradalom a Pilvax kávéházból indulva?",
      a: ["1848. március 15.", "1848. április 11.", "1849. október 6.", "1956. október 23."],
      correct: 0,
      topic: "Magyar Történelem"
    },
    {
      q: "Hány aradi vértanút végeztetett ki Haynau 1849. október 6-án?",
      a: ["13", "12", "14", "10"],
      correct: 0,
      topic: "Magyar Történelem"
    },
    {
      q: "Melyik évben jött létre az Osztrák-Magyar Monarchia a kiegyezéssel?",
      a: ["1867", "1848", "1873", "1896"],
      correct: 0,
      topic: "Magyar Történelem"
    },
    {
      q: "Melyik évben ünnepelte Magyarország a honfoglalás ezeréves millenniumát?",
      a: ["1896", "1888", "1900", "1890"],
      correct: 0,
      topic: "Magyar Történelem"
    },
    {
      q: "Melyik évszázadban zajlott a híres trójai háború a görög mitológia és mondavilág szerint?",
      a: ["Kr. e. 12. század", "Kr. e. 8. század", "Kr. e. 5. század", "Kr. u. 1. század"],
      correct: 0,
      topic: "Ókori Történelem"
    },
    {
      q: "Melyik folyó partján jött létre az ókori egyiptomi civilizáció?",
      a: ["Nílus", "Tigris", "Eufrátesz", "Jordán"],
      correct: 0,
      topic: "Ókori Történelem"
    },
    {
      q: "Ki volt az a makedón uralkodó és hadvezér, aki meghódította az akkori ismert világ nagy részét Indiáig?",
      a: ["Nagy Sándor (Alexandrosz)", "II. Philipposz", "Dáriusz", "Leonidász"],
      correct: 0,
      topic: "Ókori Történelem"
    },

    // --- 🌍 FÖLDRAJZ ÉS ORSZÁGOK ---
    {
      q: "Mi a Föld legmagasabb hegycsúcsa a tengerszint feletti magasság alapján?",
      a: ["Mount Everest (Csomolungma)", "K2", "Kilimandzsáró", "Mont Blanc"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Melyik a Föld legnagyobb kiterjedésű és legmélyebb óceánja?",
      a: ["Csendes-óceán", "Atlanti-óceán", "Indiai-óceán", "Jeges-tenger"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Mi Ausztrália hivatalos fővárosa?",
      a: ["Canberra", "Sydney", "Melbourne", "Brisbane"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Melyik a világ legkisebb területű és legkisebb népességű független országa?",
      a: ["Vatikán", "Monaco", "San Marino", "Liechtenstein"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Melyik kontinensen található a világ legnagyobb forró sivataga, a Szahara?",
      a: ["Afrika", "Ázsia", "Ausztrália", "Dél-Amerika"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Melyik a Föld legbővizűbb és leghosszabb folyója Dél-Amerikában?",
      a: ["Amazonas", "Nílus", "Mississippi", "Jangce"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Mi Izland szigetországának fővárosa?",
      a: ["Reykjavík", "Oslo", "Helsinki", "Koppenhága"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Melyik országban található a híres Fudzsi vulkán?",
      a: ["Japán", "Dél-Korea", "Kína", "Fülöp-szigetek"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Melyik a világ legmélyebb édesvizű tava, amely Szibériában található?",
      a: ["Bajkál-tó", "Viktória-tó", "Kaszpi-tenger", "Felső-tó"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Hány országgal határos közvetlenül Magyarország?",
      a: ["7", "6", "8", "5"],
      correct: 0,
      topic: "Magyar Földrajz"
    },
    {
      q: "Melyik hegycsúcs Magyarország legmagasabb pontja a Mátrában?",
      a: ["Kékes", "Galyatető", "Dobogókő", "Írott-kő"],
      correct: 0,
      topic: "Magyar Földrajz"
    },
    {
      q: "Melyik folyó szeli ketté Magyarország fővárosát, Budapestet?",
      a: ["Duna", "Tisza", "Dráva", "Ipoly"],
      correct: 0,
      topic: "Magyar Földrajz"
    },
    {
      q: "Melyik tó Közép-Európa legnagyobb édesvizű állóvize, a 'magyar tenger'?",
      a: ["Balaton", "Fertő tó", "Velencei-tó", "Bódeni-tó"],
      correct: 0,
      topic: "Magyar Földrajz"
    },
    {
      q: "Mi Kanada szövetségi fővárosa?",
      a: ["Ottawa", "Toronto", "Montréal", "Vancouver"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Melyik tengerszoros választja el Spanyolországot Marokkótól és Európát Afrikától?",
      a: ["Gibraltári-szoros", "Boszporusz", "Dardanellák", "Bering-szoros"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Melyik dél-amerikai ország a világ leghosszabb és legkeskenyebb országa a Csendes-óceán partján?",
      a: ["Chile", "Peru", "Argentína", "Kolumbia"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Melyik hegyvonulat képezi a természetes határt Európa és Ázsia között Oroszországban?",
      a: ["Urál hegység", "Kaukázus", "Alpok", "Kárpátok"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Mi Brazília hivatalos fővárosa?",
      a: ["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Melyik a világ legnépesebb szigete, amely Indonéziában található?",
      a: ["Jáva", "Madagaszkár", "Grönland", "Honshū"],
      correct: 0,
      topic: "Földrajz"
    },

    // --- 🔬 TUDOMÁNY, FIZIKA ÉS CSILLAGÁSZAT ---
    {
      q: "Melyik a Naprendszer legnagyobb bolygója?",
      a: ["Jupiter", "Szaturnusz", "Neptunusz", "Mars"],
      correct: 0,
      topic: "Csillagászat"
    },
    {
      q: "Ki alkotta meg az általános és speciális relativitáselméletet?",
      a: ["Albert Einstein", "Isaac Newton", "Niels Bohr", "Galileo Galilei"],
      correct: 0,
      topic: "Fizika"
    },
    {
      q: "Mi a kémiai vegyjele az aranynak a periódusos rendszerben?",
      a: ["Au", "Ag", "Fe", "Cu"],
      correct: 0,
      topic: "Kémia"
    },
    {
      q: "Mi a víz tudományos kémiai képlete?",
      a: ["H2O", "CO2", "NaCl", "CH4"],
      correct: 0,
      topic: "Kémia"
    },
    {
      q: "Melyik gáz alkotja a Föld légkörének legnagyobb hányadát?",
      a: ["Nitrogén", "Oxigén", "Szén-dioxid", "Argon"],
      correct: 0,
      topic: "Természettudomány"
    },
    {
      q: "Melyik bolygót nevezik a Naprendszerben 'Vörös Bolygónak' a vas-oxidban gazdag talaja miatt?",
      a: ["Mars", "Vénusz", "Merkúr", "Jupiter"],
      correct: 0,
      topic: "Csillagászat"
    },
    {
      q: "Ki találta fel a modern váltóáramú motort és rendszert?",
      a: ["Nikola Tesla", "Thomas Edison", "Alexander Graham Bell", "Guglielmo Marconi"],
      correct: 0,
      topic: "Találmányok"
    },
    {
      q: "Melyik magyar orvos fedezte fel a gyermekágyi láz okát, és nevezték 'az anyák megmentőjének'?",
      a: ["Semmelweis Ignác", "Szent-Györgyi Albert", "Eötvös Loránd", "Jedlik Ányos"],
      correct: 0,
      topic: "Tudománytörténet"
    },
    {
      q: "Ki kapott orvosi Nobel-díjat a C-vitamin szegedi paprikából való kivonásáért 1937-ben?",
      a: ["Szent-Györgyi Albert", "Békésy György", "Kresz Géza", "Hevesy György"],
      correct: 0,
      topic: "Tudománytörténet"
    },
    {
      q: "Hány kromoszómával rendelkezik egy egészséges emberi testi sejt?",
      a: ["46", "23", "48", "44"],
      correct: 0,
      topic: "Biológia"
    },
    {
      q: "Mi a Föld legközelebbi csillaga?",
      a: ["A Nap", "Proxima Centauri", "Sirius", "Polaris (Északi Sarkcsillag)"],
      correct: 0,
      topic: "Csillagászat"
    },
    {
      q: "Milyen vérsejtek felelősek az oxigén szállításáért az emberi szervezetben?",
      a: ["Vörösvértestek (eritrociták)", "Fehérvérsejtek", "Vérlemezkék", "Plazmasejtek"],
      correct: 0,
      topic: "Biológia"
    },
    {
      q: "Melyik szervünk termeli az inzulint a vércukorszint szabályozására?",
      a: ["Hasnyálmirigy", "Máj", "Lép", "Vese"],
      correct: 0,
      topic: "Orvostudomány"
    },
    {
      q: "Ki publikálta 1859-ben A fajok eredete című korszakalkotó evolúciós művet?",
      a: ["Charles Darwin", "Gregor Mendel", "Jean-Baptiste Lamarck", "Louis Pasteur"],
      correct: 0,
      topic: "Biológia"
    },
    {
      q: "Hány fokon forr a víz normál tengerszinti légköri nyomáson Celsius-skálán?",
      a: ["100 °C", "90 °C", "120 °C", "80 °C"],
      correct: 0,
      topic: "Fizika"
    },
    {
      q: "Mi a neve az anyagnak, amely a növények leveleiben zöld színű és a fotoszintézist végzi?",
      a: ["Klorofill", "Karotin", "Cellulóz", "Glükóz"],
      correct: 0,
      topic: "Biológia"
    },

    // --- 📚 IRODALOM, KÖLTÉSZET ÉS MÍTOSZOK ---
    {
      q: "Ki írta a Nemzeti dalt, amely az 1848-as forradalom jelképévé vált?",
      a: ["Petőfi Sándor", "Arany János", "Vörösmarty Mihály", "Kölcsey Ferenc"],
      correct: 0,
      topic: "Magyar Irodalom"
    },
    {
      q: "Melyik szabolcsi településen írta Kölcsey Ferenc a Himnusz kéziratát 1823. január 22-én?",
      a: ["Szatmárcseke", "Nyíregyháza", "Mátészalka", "Kisvárda"],
      correct: 0,
      topic: "Magyar Irodalom"
    },
    {
      q: "Ki a szerzője a híres Toldi-trilógiának?",
      a: ["Arany János", "Petőfi Sándor", "Jókai Mór", "Gárdonyi Géza"],
      correct: 0,
      topic: "Magyar Irodalom"
    },
    {
      q: "Melyik vár ostromát dolgozza fel Gárdonyi Géza klasszikus regénye, az Egri csillagok?",
      a: ["Egri vár", "Szigetvár", "Kőszegi vár", "Buda vára"],
      correct: 0,
      topic: "Magyar Irodalom"
    },
    {
      q: "Ki írta az Ember tragédiája című drámai költeményt?",
      a: ["Madách Imre", "Katona József", "Vörösmarty Mihály", "Babits Mihály"],
      correct: 0,
      topic: "Magyar Irodalom"
    },
    {
      q: "Melyik magyar költőnk írta A walesi bárdok című híres balladát?",
      a: ["Arany János", "Petőfi Sándor", "Ady Endre", "József Attila"],
      correct: 0,
      topic: "Magyar Irodalom"
    },
    {
      q: "Ki írta a Pál utcai fiúk című világhírű regényt?",
      a: ["Molnár Ferenc", "Móricz Zsigmond", "Kosztolányi Dezső", "Karinthy Frigyes"],
      correct: 0,
      topic: "Magyar Irodalom"
    },
    {
      q: "Melyik angol reneszánsz drámaíró műve a Rómeó és Júlia és a Hamlet?",
      a: ["William Shakespeare", "Christopher Marlowe", "John Milton", "Charles Dickens"],
      correct: 0,
      topic: "Világirodalom"
    },
    {
      q: "Ki írta a Don Quijote című regényt a búsképű lovagról és hű fegyverhordozójáról?",
      a: ["Miguel de Cervantes", "Lope de Vega", "Gabriel García Márquez", "Federico García Lorca"],
      correct: 0,
      topic: "Világirodalom"
    },
    {
      q: "Melyik ókori görög költőnek tulajdonítják az Íliász és az Odüsszeia eposzokat?",
      a: ["Homérosz", "Hésziodosz", "Szophoklész", "Euripidész"],
      correct: 0,
      topic: "Világirodalom"
    },
    {
      q: "Ki írta A Gyűrűk Ura című világhírű fantasy regényt?",
      a: ["J. R. R. Tolkien", "C. S. Lewis", "George R. R. Martin", "J. K. Rowling"],
      correct: 0,
      topic: "Irodalom"
    },
    {
      q: "Ki a szerzője a Harry Potter regénysorozatnak?",
      a: ["J. K. Rowling", "Philip Pullman", "Roald Dahl", "Suzanne Collins"],
      correct: 0,
      topic: "Irodalom"
    },
    {
      q: "Melyik magyar író műve az Ábel a rengetegben című székely regény?",
      a: ["Tamási Áron", "Wass Albert", "Nyirő József", "Sütő András"],
      correct: 0,
      topic: "Magyar Irodalom"
    },

    // --- 🎨 MŰVÉSZET, ZENE ÉS ÉPÍTÉSZET ---
    {
      q: "Ki festette a világ leghíresebb festményét, a rejtélyes mosolyú Mona Lisát?",
      a: ["Leonardo da Vinci", "Michelangelo", "Raffaello", "Sandro Botticelli"],
      correct: 0,
      topic: "Képzőművészet"
    },
    {
      q: "Ki festette a Sixtus-kápolna mennyezetfreskóját Rómában, köztük Ádám teremtését?",
      a: ["Michelangelo Buonarroti", "Leonardo da Vinci", "Donatello", "Caravaggio"],
      correct: 0,
      topic: "Képzőművészet"
    },
    {
      q: "Melyik zeneszerző komponálta az Örömódát tartalmazó 9. szimfóniát?",
      a: ["Ludwig van Beethoven", "Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Franz Schubert"],
      correct: 0,
      topic: "Klasszikus Zene"
    },
    {
      q: "Melyik osztrák zeneszerző volt a zenei csodagyerek, A varázsfuvola szerzője?",
      a: ["Wolfgang Amadeus Mozart", "Joseph Haydn", "Johannes Brahms", "Johann Strauss"],
      correct: 0,
      topic: "Klasszikus Zene"
    },
    {
      q: "Ki volt a 19. század legnagyobb magyar zongoraművésze, a Magyar rapszódiák szerzője?",
      a: ["Liszt Ferenc", "Erkel Ferenc", "Bartók Béla", "Kodály Zoltán"],
      correct: 0,
      topic: "Klasszikus Zene"
    },
    {
      q: "Melyik zeneszerzőnk szerezte a magyar Himnusz zenéjét, és a Bánk bán operát?",
      a: ["Erkel Ferenc", "Liszt Ferenc", "Egressy Béni", "Weiner Leó"],
      correct: 0,
      topic: "Klasszikus Zene"
    },
    {
      q: "Melyik híres magyar festő alkotta meg a monumentális Krisztus-trilógiát?",
      a: ["Munkácsy Mihály", "Csontváry Kosztka Tivadar", "Szinyei Merse Pál", "Rippl-Rónai József"],
      correct: 0,
      topic: "Képzőművészet"
    },
    {
      q: "Ki festette a Csillagos éj és a Napraforgók című híres posztimpresszionista festményeket?",
      a: ["Vincent van Gogh", "Claude Monet", "Paul Cézanne", "Pablo Picasso"],
      correct: 0,
      topic: "Képzőművészet"
    },
    {
      q: "Melyik spanyol festő volt a kubizmus mozgalom vezéralakja, a Guernica megalkotója?",
      a: ["Pablo Picasso", "Salvador Dalí", "Francisco Goya", "Diego Velázquez"],
      correct: 0,
      topic: "Képzőművészet"
    },
    {
      q: "Melyik városban található a világ leglátogatottabb művészeti múzeuma, a Louvre?",
      a: ["Párizs", "London", "Róma", "Madrid"],
      correct: 0,
      topic: "Művészet"
    },

    // --- ⚽ SPORT ÉS OLIMPIA ---
    {
      q: "Ki volt a legendás magyar Aranycsapat világhírű kapitánya és gólkirálya, akiről FIFA-díjat neveztek el?",
      a: ["Puskás Ferenc", "Bozsik József", "Hidegkuti Nándor", "Grosics Gyula"],
      correct: 0,
      topic: "Sport"
    },
    {
      q: "Melyik évben győzte le a magyar Aranycsapat a londoni Wembley Stadionban az angolokat 6:3-ra?",
      a: ["1953", "1954", "1952", "1956"],
      correct: 0,
      topic: "Sporttörténet"
    },
    {
      q: "Hány aranyérmet nyert a legendás magyar kardvívó, Gerevich Aladár a nyári olimpiákon?",
      a: ["7", "6", "5", "8"],
      correct: 0,
      topic: "Olimpia"
    },
    {
      q: "Melyik nemzet labdarúgó-válogatottja nyerte meg eddig a legtöbb világbajnoki címet?",
      a: ["Brazília", "Németország", "Olaszország", "Argentína"],
      correct: 0,
      topic: "Labdarúgás"
    },
    {
      q: "Hány mező található egy hivatalos sakk-táblán összesen?",
      a: ["64", "60", "72", "56"],
      correct: 0,
      topic: "Sport & Játék"
    },
    {
      q: "Milyen hosszú a hivatalos maratoni futótávolság méterben megadva?",
      a: ["42 195 méter", "40 000 méter", "45 000 méter", "42 000 méter"],
      correct: 0,
      topic: "Atlétika"
    },
    {
      q: "Hány pontot ér egy büntetődobás a kosárlabdában?",
      a: ["1", "2", "3", "0"],
      correct: 0,
      topic: "Sport"
    },
    {
      q: "Hány játékos tartózkodik egyszerre a pályán egy labdarúgó-csapatból a mérkőzés kezdetén?",
      a: ["11", "10", "12", "9"],
      correct: 0,
      topic: "Labdarúgás"
    },
    {
      q: "Ki nyerte a legtöbb aranyérmet az olimpiai úszás történetében?",
      a: ["Michael Phelps", "Mark Spitz", "Ian Thorpe", "Hosszú Katinka"],
      correct: 0,
      topic: "Úszás"
    },
    {
      q: "Hány Grand Slam egyéni tornagyőzelmet szerzett a teniszező Roger Federer pályafutása során?",
      a: ["20", "18", "22", "16"],
      correct: 0,
      topic: "Tenisz"
    },

    // --- 🎬 FILM, POPKULTÚRA ÉS SZÓRAKOZÁS ---
    {
      q: "Ki alkotta meg a klasszikus Csillagok háborúja világát és rendezte az első filmet?",
      a: ["George Lucas / Steven Spielberg", "James Cameron", "Christopher Nolan", "Martin Scorsese"],
      correct: 0,
      topic: "Filmművészet"
    },
    {
      q: "Melyik film nyerte meg a legjobb idegen nyelvű film Oscar-díját 2016-ban Nemes Jeles László rendezésében?",
      a: ["Saul fia", "Mephisto", "Testről és lélekről", "Kincsem"],
      correct: 0,
      topic: "Magyar Film"
    },
    {
      q: "Melyik népszerű brit együttes tagja volt John Lennon, Paul McCartney, George Harrison és Ringo Starr?",
      a: ["The Beatles", "The Rolling Stones", "Queen", "Led Zeppelin"],
      correct: 0,
      topic: "Zene"
    },
    {
      q: "Ki volt a legendás rockegyüttes, a Queen karizmatikus énekese?",
      a: ["Freddie Mercury", "Mick Jagger", "David Bowie", "Robert Plant"],
      correct: 0,
      topic: "Zene"
    },
    {
      q: "Melyik színész játszotta el a karibi kalóz, Jack Sparrow kapitány szerepét?",
      a: ["Johnny Depp", "Orlando Bloom", "Brad Pitt", "Keanu Reeves"],
      correct: 0,
      topic: "Filmművészet"
    },
    {
      q: "Melyik animációs stúdió készítette a Toy Story, Némó nyomában és a Szörny Rt. filmeket?",
      a: ["Pixar", "DreamWorks", "Ghibli", "Illumination"],
      correct: 0,
      topic: "Animáció"
    },

    // --- 🍲 GASZTRONÓMIA ÉS HAGYOMÁNYOK ---
    {
      q: "Melyik hungarikumnak számító magyar pálinkafajta készítéséről híres Szabolcs-Szatmár-Bereg vármegye?",
      a: ["Szatmári szilvapálinka", "Kecskeméti barackpálinka", "Gönci kajszibarack", "Békési szilva"],
      correct: 0,
      topic: "Gasztronómia"
    },
    {
      q: "Melyik fűszernövény adja a hagyományos magyar gulyás és pörkölt jellegzetes színét és ízét?",
      a: ["Fűszerpaprika", "Majoranna", "Kömény", "Koriander"],
      correct: 0,
      topic: "Gasztronómia"
    },
    {
      q: "Melyik híres magyar borvidék adja az 'aszú' borokat, a 'királyok borát'?",
      a: ["Tokaj-Hegyalja", "Villány", "Eger", "Badacsony"],
      correct: 0,
      topic: "Gasztronómia"
    },
    {
      q: "Melyik országból származik eredetileg a pizza és a lasagna?",
      a: ["Olaszország", "Görögország", "Spanyolország", "Franciaország"],
      correct: 0,
      topic: "Gasztronómia"
    },
    {
      q: "Milyen fából készítik a hagyományos magyar hordókat a borkészítéshez?",
      a: ["Tölgyfa", "Fenyőfa", "Bükkfa", "Nyárfa"],
      correct: 0,
      topic: "Hagyomány"
    },

    // --- 💡 MAGYAR TALÁLMÁNYOK ÉS TUDÓSOK ---
    {
      q: "Ki találta fel a világhírű bűvös kockát?",
      a: ["Rubik Ernő", "Bíró László", "Gábor Dénes", "Neumann János"],
      correct: 0,
      topic: "Magyar Találmányok"
    },
    {
      q: "Melyik magyar feltaláló nevéhez fűződik a modern golyóstoll megalkotása?",
      a: ["Bíró László", "Puskás Tivadar", "Jedlik Ányos", "Csonka János"],
      correct: 0,
      topic: "Magyar Találmányok"
    },
    {
      q: "Ki dolgozta ki a modern tárolt programú számítógépek elvi működési alapjait?",
      a: ["Neumann János", "Szilárd Leó", "Teller Ede", "Wigner Jenő"],
      correct: 0,
      topic: "Tudománytörténet"
    },
    {
      q: "Ki találta fel a szódavizet és az elektromos dinamó elvét Magyarországon?",
      a: ["Jedlik Ányos", "Kandó Kálmán", "Ganz Ábrahám", "Bánki Donát"],
      correct: 0,
      topic: "Magyar Találmányok"
    },
    {
      q: "Melyik magyar biokémikus kapott 2023-ban orvosi Nobel-díjat az mRNS-alapú vakcinák kifejlesztéséért?",
      a: ["Karikó Katalin", "Szent-Györgyi Albert", "Békésy György", "Hargittai István"],
      correct: 0,
      topic: "Tudomány & Nobel-díj"
    },
    {
      q: "Ki találta fel a biztonsági gyufát, amely nem robbant zajosan?",
      a: ["Irinyi János", "Körösi Csoma Sándor", "Hell Miksa", "Kitaibel Pál"],
      correct: 0,
      topic: "Magyar Találmányok"
    },
    {
      q: "Ki készítette el a Telefonhírmondót és a telefonközpont elvét?",
      a: ["Puskás Tivadar", "Bell Alexander", "Marconi Guglielmo", "Edison Thomas"],
      correct: 0,
      topic: "Magyar Találmányok"
    },

    // --- 📜 MAGYAR IRODALOM ÉS REGÉNYEK ---
    {
      q: "Ki írta a Szent Péter esernyője és A fekete város című nagysikerű regényeket?",
      a: ["Mikszáth Kálmán", "Jókai Mór", "Móricz Zsigmond", "Gárdonyi Géza"],
      correct: 0,
      topic: "Magyar Irodalom"
    },
    {
      q: "Melyik regényében örökítette meg Jókai Mór a komáromi kőszívű ember fiait?",
      a: ["A kőszívű ember fiai", "Az arany ember", "Fekete gyémántok", "Egy magyar nábob"],
      correct: 0,
      topic: "Magyar Irodalom"
    },
    {
      q: "Ki írta a Légy jó mindhalálig című megható debreceni diákregényt?",
      a: ["Móricz Zsigmond", "Kosztolányi Dezső", "Karinthy Frigyes", "Babits Mihály"],
      correct: 0,
      topic: "Magyar Irodalom"
    },
    {
      q: "Ki írta az Ómagyar Mária-siralmat, a legkorábbi fennmaradt magyar nyelvű verset?",
      a: ["Ismeretlen szerző (13. század)", "Janus Pannonius", "Balassi Bálint", "Zrínyi Miklós"],
      correct: 0,
      topic: "Magyar Irodalom"
    },
    {
      q: "Ki volt az első magyar nyelven verselő nagy reneszánsz költőnk, a katonaénekek szerzője?",
      a: ["Balassi Bálint", "Janus Pannonius", "Zrínyi Miklós", "Tinódi Lantos Sebestyén"],
      correct: 0,
      topic: "Magyar Irodalom"
    },
    {
      q: "Ki írta a Szigeti veszedelem című eposzt dédapja hősi várvédelméről?",
      a: ["Zrínyi Miklós", "Balassi Bálint", "Gyöngyösi István", "Pázmány Péter"],
      correct: 0,
      topic: "Magyar Irodalom"
    },

    // --- 🏛️ ÓKOR ÉS VILÁGTÖRTÉNELEM ---
    {
      q: "Melyik folyó átlépésekor mondta Julius Caesar: 'A kocka el van vetve'?",
      a: ["Rubicon", "Tiberis", "Pó", "Duna"],
      correct: 0,
      topic: "Ókori Történelem"
    },
    {
      q: "Ki volt az ókori Athén aranykorának leghíresebb államférfija a Kr. e. 5. században?",
      a: ["Periklész", "Szolón", "Kleiszthenész", "Szókratész"],
      correct: 0,
      topic: "Ókori Történelem"
    },
    {
      q: "Melyik évben adták ki Angliában a Magna Charta Libertatumot, a nemesi szabadságlevelet?",
      a: ["1215", "1066", "1301", "1492"],
      correct: 0,
      topic: "Középkori Történelem"
    },
    {
      q: "Ki találta fel a mozgatható betűs könyvnyomtatást Európában Mainzban?",
      a: ["Johannes Gutenberg", "William Caxton", "Albrecht Dürer", "Rotterdami Erasmus"],
      correct: 0,
      topic: "Történelem"
    },
    {
      q: "Melyik évben fogadták el az Amerikai Függetlenségi Nyilatkozatot Thomas Jefferson megfogalmazásában?",
      a: ["1776", "1789", "1804", "1765"],
      correct: 0,
      topic: "Történelem"
    },
    {
      q: "Melyik évben következett be a csernobili atomerőmű-baleset Ukrajnában?",
      a: ["1986", "1989", "1984", "1991"],
      correct: 0,
      topic: "Legújabb Kori Történelem"
    },

    // --- 🌍 FÖLDRAJZI ÉRDEKESSÉGEK ÉS REKORDOK ---
    {
      q: "Melyik a Föld legmagasabb összefüggő vízesése, amely Venezuelában zuhan alá?",
      a: ["Angel-vízesés (Salto Ángel)", "Niagara-vízesés", "Viktória-vízesés", "Iguazú-vízesés"],
      correct: 0,
      topic: "Földrajzi Rekordok"
    },
    {
      q: "Melyik a Föld legmélyebben fekvő szárazföldi területe a tengerszint alatt?",
      a: ["Holt-tenger partja", "Halál-völgy (Death Valley)", "Kaszpi-mélyföld", "Bajkál-tó feneke"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Melyik csatorna köti össze a Földközi-tengert a Vörös-tengerrel Egyiptomban?",
      a: ["Szuezi-csatorna", "Panama-csatorna", "Kieli-csatorna", "Korinthoszi-csatorna"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Melyik csatorna vágja át a közép-amerikai földhidat a Csendes- és Atlanti-óceán között?",
      a: ["Panama-csatorna", "Szuezi-csatorna", "Erie-csatorna", "Kieli-csatorna"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Mi Svájc hivatalos szövetségi székhelye, de facto fővárosa?",
      a: ["Bern", "Zürich", "Genf", "Bázel"],
      correct: 0,
      topic: "Földrajz"
    },
    {
      q: "Melyik európai ország zászlaja nem téglalap alakú, hanem négyzet?",
      a: ["Svájc és Vatikán", "Dánia", "Monaco", "Görögország"],
      correct: 0,
      topic: "Földrajz & Zászlók"
    },

    // --- 🎵 POPKULTÚRA, FILM ÉS ANIMÁCIÓ ---
    {
      q: "Melyik színész formálta meg James Bondot a legtöbb hivatalos mozifilmben?",
      a: ["Roger Moore", "Sean Connery", "Pierce Brosnan", "Daniel Craig"],
      correct: 0,
      topic: "Filmművészet"
    },
    {
      q: "Melyik magyar animációs kultuszfilm főszereplője a visszavonult szuperegér, Nick Grabowski?",
      a: ["Macskafogó", "Vuk", "Szaffi", "A Mézga család"],
      correct: 0,
      topic: "Magyar Animáció"
    },
    {
      q: "Melyik rockegyüttes szerezte a híres 'Gyöngyhajú lány' című dalt, amit a Scorpions is feldolgozott?",
      a: ["Omega", "Illés", "LGT (Locomotiv GT)", "Edda Művek"],
      correct: 0,
      topic: "Magyar Zene"
    },
    {
      q: "Ki szerezte a világhírű 'A négy évszak' hegedűversenyt a barokk korban?",
      a: ["Antonio Vivaldi", "Johann Sebastian Bach", "Georg Friedrich Händel", "Arcangelo Corelli"],
      correct: 0,
      topic: "Klasszikus Zene"
    },
    {
      q: "Hány Oscar-díjat nyert a Titanic és A Gyűrűk Ura: A király visszatér fejenként?",
      a: ["11 díjat", "9 díjat", "10 díjat", "12 díjat"],
      correct: 0,
      topic: "Filmművészet"
    },

    // --- 🤺 SPORTLEGENDÁK ---
    {
      q: "Melyik magyar kardvívó nyert három egymást követő nyári olimpián egyéni aranyérmet?",
      a: ["Szilágyi Áron", "Gerevich Aladár", "Kovács Pál", "Fuchs Jenő"],
      correct: 0,
      topic: "Sportlegendák"
    },
    {
      q: "Melyik magyar úszónő aratott történelmi győzelmet mindössze 14 évesen a szöuli olimpián 200 méter háton?",
      a: ["Egerszegi Krisztina", "Hosszú Katinka", "Kovács Ágnes", "Risztov Éva"],
      correct: 0,
      topic: "Magyar Sport"
    },
    {
      q: "Hány olimpiát nyert zsinórban a magyar férfi vízilabda-válogatott 2000 és 2008 között Kemény Dénes vezetésével?",
      a: ["3 egymást követő aranyat", "2 aranyat", "4 aranyat", "1 aranyat"],
      correct: 0,
      topic: "Magyar Sport"
    }
  ],

  // =========================================================================
  // 2. TIPPELŐS KÉRDÉSEK (Számértékek megtippelése)
  // =========================================================================
  guess: [
    {
      q: "Hány kilométer a hivatalos maratoni futótávolság kerekítve?",
      answer: 42,
      min: 10,
      max: 80,
      unit: "km",
      topic: "Sport"
    },
    {
      q: "Hány teljes hétből áll egy naptári év?",
      answer: 52,
      min: 20,
      max: 70,
      unit: "hét",
      topic: "Naptár"
    },

    // --- 👑 SAJÁT TIPPELŐS KÉRDÉSEID HELYE ---
    {
      q: "Melyik évben egyesült Pest, Buda és Óbuda Budapest néven a főváros megszületésekor?",
      answer: 1873,
      min: 1840,
      max: 1910,
      unit: "év",
      topic: "Magyar Történelem"
    },
    {
      q: "Hány méter magas a Tokaji Nagy-Kopasz hegy?",
      answer: 512,
      min: 200,
      max: 900,
      unit: "méter",
      topic: "Földrajz"
    },

    // --- 🏛️ ÉVEK ÉS TÖRTÉNELMI DÁTUMOK ---
    {
      q: "Melyik évben robbant ki a pesti forradalom és szabadságharc a márciusi ifjak vezetésével?",
      answer: 1848,
      min: 1800,
      max: 1900,
      unit: "év",
      topic: "Történelem"
    },
    {
      q: "Melyik évben verte vissza Hunyadi János a törököket a nándorfehérvári diadalban?",
      answer: 1456,
      min: 1400,
      max: 1520,
      unit: "év",
      topic: "Történelem"
    },
    {
      q: "Melyik évben kezdődött az első világháború Ferenc Ferdinánd szarajevói meggyilkolásával?",
      answer: 1914,
      min: 1900,
      max: 1930,
      unit: "év",
      topic: "Történelem"
    },
    {
      q: "Melyik évben ért véget az első világháború a fegyverszünet aláírásával?",
      answer: 1918,
      min: 1910,
      max: 1930,
      unit: "év",
      topic: "Történelem"
    },
    {
      q: "Melyik évben tört ki a magyar forradalom és szabadságharc a szovjet elnyomás ellen?",
      answer: 1956,
      min: 1940,
      max: 1970,
      unit: "év",
      topic: "Történelem"
    },
    {
      q: "Melyik évben csatlakozott Magyarország az Európai Unióhoz?",
      answer: 2004,
      min: 1990,
      max: 2020,
      unit: "év",
      topic: "Történelem"
    },
    {
      q: "Melyik évben írta Kölcsey Ferenc a magyar Himnusz költeményét Szatmárcsekén?",
      answer: 1823,
      min: 1800,
      max: 1860,
      unit: "év",
      topic: "Irodalomtörténet"
    },
    {
      q: "Melyik évben lépett Neil Armstrong az Apollo–11 küldetéssel először a Holdra?",
      answer: 1969,
      min: 1950,
      max: 1990,
      unit: "év",
      topic: "Űrkutatás"
    },
    {
      q: "Melyik évben rendezték meg az első újkori nyári olimpiai játékokat Athénban?",
      answer: 1896,
      min: 1850,
      max: 1930,
      unit: "év",
      topic: "Sporttörténet"
    },
    {
      q: "Melyik évben alapították meg az Egyesült Nemzetek Szervezetét?",
      answer: 1945,
      min: 1910,
      max: 1970,
      unit: "év",
      topic: "Történelem"
    },
    {
      q: "Melyik évben nyitotta meg kapuit az első budapesti metróvonal, a kisföldalatti?",
      answer: 1896,
      min: 1870,
      max: 1930,
      unit: "év",
      topic: "Közlekedéstörténet"
    },
    {
      q: "Melyik évben hunyt el Mátyás király Bécsben?",
      answer: 1490,
      min: 1440,
      max: 1530,
      unit: "év",
      topic: "Magyar Történelem"
    },
    {
      q: "Melyik évben adták át a Lánchidat, Budapest legelső állandó Duna-hídját?",
      answer: 1849,
      min: 1820,
      max: 1880,
      unit: "év",
      topic: "Építészettörténet"
    },

    // --- 📏 MÉRETEK, MAGASSÁGOK ÉS HOSSZÚSÁGOK ---
    {
      q: "Hány méter magas a párizsi Eiffel-torony a csúcsantennával együtt?",
      answer: 330,
      min: 150,
      max: 600,
      unit: "méter",
      topic: "Építészet"
    },
    {
      q: "Hány méter magas a Föld legmagasabb hegycsúcsa, a Mount Everest?",
      answer: 8849,
      min: 6000,
      max: 11000,
      unit: "méter",
      topic: "Földrajz"
    },
    {
      q: "Hány méter a világ legmélyebb óceáni árka, a Mariana-árok legmélyebb pontja?",
      answer: 11034,
      min: 5000,
      max: 15000,
      unit: "méter",
      topic: "Földrajz"
    },
    {
      q: "Hány kilométer hosszú megközelítőleg a Duna teljes folyása Fekete-erdőtől a Fekete-tengerig?",
      answer: 2850,
      min: 1500,
      max: 4500,
      unit: "km",
      topic: "Földrajz"
    },
    {
      q: "Hány kilométer hosszú a Tisza folyó teljes hossza forrásától a torkolatáig?",
      answer: 962,
      min: 500,
      max: 1600,
      unit: "km",
      topic: "Földrajz"
    },
    {
      q: "Hány méter magas a budapesti Országház kupolája a csúcsig mérve?",
      answer: 96,
      min: 50,
      max: 180,
      unit: "méter",
      topic: "Építészet"
    },
    {
      q: "Hány méter magas Magyarország legmagasabb pontja, a Kékes-tető?",
      answer: 1014,
      min: 700,
      max: 1500,
      unit: "méter",
      topic: "Földrajz"
    },
    {
      q: "Hány ezer kilométer a Föld egyenlítői kerülete kerekítve?",
      answer: 40,
      min: 20,
      max: 80,
      unit: "ezer km",
      topic: "Csillagászat"
    },
    {
      q: "Hány ezer kilométer a Hold átlagos távolsága a Földtől megközelítőleg?",
      answer: 384,
      min: 100,
      max: 700,
      unit: "ezer km",
      topic: "Csillagászat"
    },
    {
      q: "Hány kilométer hosszú a Balaton hossza Keszthelytől Balatonakarattyáig?",
      answer: 78,
      min: 40,
      max: 150,
      unit: "km",
      topic: "Magyar Földrajz"
    },

    // --- 🔢 TERMÉSZETI, BIOLÓGIAI ÉS TÁRGYI SZÁMOK ---
    {
      q: "Hány különálló csontból áll egy felnőtt emberi csontváz átlagosan?",
      answer: 206,
      min: 100,
      max: 350,
      unit: "csont",
      topic: "Biológia"
    },
    {
      q: "Hány állandó foga van egy felnőtt embernek a bölcsességfogakkal együtt?",
      answer: 32,
      min: 20,
      max: 45,
      unit: "fog",
      topic: "Biológia"
    },
    {
      q: "Hány billentyű található egy szabványos modern zongorán összesen?",
      answer: 88,
      min: 50,
      max: 130,
      unit: "billentyű",
      topic: "Zene"
    },
    {
      q: "Hány napból áll egy szökőév a naptárunkban?",
      answer: 366,
      min: 350,
      max: 380,
      unit: "nap",
      topic: "Naptár"
    },
    {
      q: "Hány másodpercig tart pontosan egy teljes naptári nap?",
      answer: 86400,
      min: 40000,
      max: 120000,
      unit: "másodperc",
      topic: "Matematika"
    },
    {
      q: "Hány tagállama van az Amerikai Egyesült Államoknak?",
      answer: 50,
      min: 30,
      max: 70,
      unit: "állam",
      topic: "Földrajz"
    },
    {
      q: "Hány tagállama van jelenleg az Európai Uniónak?",
      answer: 27,
      min: 15,
      max: 40,
      unit: "ország",
      topic: "Földrajz"
    },
    {
      q: "Hány vármegye alkotja Magyarország közigazgatási területét?",
      answer: 19,
      min: 10,
      max: 30,
      unit: "vármegye",
      topic: "Közigazgatás"
    },
    {
      q: "Hány hivatalos aranyérmet nyert Magyarország a nyári olimpiák történetében eddig megközelítőleg?",
      answer: 187,
      min: 100,
      max: 300,
      unit: "aranyérem",
      topic: "Olimpia"
    },
    {
      q: "Hány szíve van egy polipnak?",
      answer: 3,
      min: 1,
      max: 8,
      unit: "szív",
      topic: "Állatvilág"
    },
    {
      q: "Hány lába van egy póknak?",
      answer: 8,
      min: 4,
      max: 14,
      unit: "láb",
      topic: "Biológia"
    },
    {
      q: "Hány húrja van egy klasszikus hegedűnek?",
      answer: 4,
      min: 2,
      max: 8,
      unit: "húr",
      topic: "Zene"
    },
    {
      q: "Hány számozott szektorra van osztva egy szabványos darts-tábla céltáblája?",
      answer: 20,
      min: 10,
      max: 35,
      unit: "szám",
      topic: "Sport"
    },
    {
      q: "Hány fok a víz fagyáspontja a Celsius-skálán?",
      answer: 0,
      min: -20,
      max: 20,
      unit: "°C",
      topic: "Fizika"
    },
    {
      q: "Melyik évben találta fel Rubik Ernő a világhírű Rubik-kockát?",
      answer: 1974,
      min: 1960,
      max: 1990,
      unit: "év",
      topic: "Magyar Találmányok"
    },
    {
      q: "Melyik évben adta ki II. András magyar király az Aranybullát?",
      answer: 1222,
      min: 1150,
      max: 1300,
      unit: "év",
      topic: "Magyar Történelem"
    },
    {
      q: "Melyik évben zajlott a tragikus kimenetelű mohácsi csata?",
      answer: 1526,
      min: 1480,
      max: 1570,
      unit: "év",
      topic: "Magyar Történelem"
    },
    {
      q: "Melyik évben tört ki a II. Rákóczi Ferenc vezette kuruc szabadságharc?",
      answer: 1703,
      min: 1680,
      max: 1730,
      unit: "év",
      topic: "Magyar Történelem"
    },
    {
      q: "Melyik évben írták alá a trianoni békediktátumot a versailles-i Nagy Trianon kastélyban?",
      answer: 1920,
      min: 1910,
      max: 1935,
      unit: "év",
      topic: "Magyar Történelem"
    },
    {
      q: "Melyik évben ajánlotta fel gróf Széchenyi István egyévi jövedelmét a Magyar Tudományos Akadémia megalapítására?",
      answer: 1825,
      min: 1800,
      max: 1860,
      unit: "év",
      topic: "Magyar Történelem"
    },
    {
      q: "Hány kerülete van jelenleg Budapestnek közigazgatásilag?",
      answer: 23,
      min: 15,
      max: 35,
      unit: "kerület",
      topic: "Főváros"
    },
    {
      q: "Hány összefonódó színes karikából áll az olimpiai mozgalom szimbóluma?",
      answer: 5,
      min: 3,
      max: 9,
      unit: "karika",
      topic: "Olimpia"
    },
    {
      q: "Hány percig tart egy hivatalos felnőtt nagypályás labdarúgó-mérkőzés rendes játékideje?",
      answer: 90,
      min: 60,
      max: 120,
      unit: "perc",
      topic: "Sport"
    },
    {
      q: "Hány húrja van a klasszikus akusztikus spanyolgitárnak?",
      answer: 6,
      min: 4,
      max: 12,
      unit: "húr",
      topic: "Zene"
    },
    {
      q: "Hány játékos alkot egy jégkorongcsapatot a jégen egyszerre kapussal együtt?",
      answer: 6,
      min: 4,
      max: 11,
      unit: "játékos",
      topic: "Sport"
    },
    {
      q: "Hány méter magas a New York-i Szabadság-szobor a talapzat aljától a fáklya hegyéig?",
      answer: 93,
      min: 40,
      max: 160,
      unit: "méter",
      topic: "Építészet"
    },
    {
      q: "Hány fehér csillag díszíti az Amerikai Egyesült Államok nemzeti lobogóját?",
      answer: 50,
      min: 30,
      max: 70,
      unit: "csillag",
      topic: "Zászlók"
    },
    {
      q: "Hány nagybolygó kering a Nap körül a Naprendszerben a Plútó 2006-os átsorolása óta?",
      answer: 8,
      min: 5,
      max: 14,
      unit: "bolygó",
      topic: "Csillagászat"
    },
    {
      q: "Hány perc alatt ér el a fénysugár a Napból a Földre kerekítve?",
      answer: 8,
      min: 1,
      max: 20,
      unit: "perc",
      topic: "Csillagászat"
    },
    {
      q: "Hány ezer kilométer/másodperc a fény terjedési sebessége vákuumban kerekítve?",
      answer: 300,
      min: 100,
      max: 600,
      unit: "ezer km/s",
      topic: "Fizika"
    },
    {
      q: "Hány méter mély a Balaton legmélyebb pontja, a Tihanyi-kút medre?",
      answer: 11,
      min: 4,
      max: 30,
      unit: "méter",
      topic: "Magyar Földrajz"
    },
    {
      q: "Hány kilogrammból áll egy metrikus tonna?",
      answer: 1000,
      min: 500,
      max: 2000,
      unit: "kg",
      topic: "Mértékegységek"
    },
    {
      q: "Hány fokból áll egy teljes kör geometriai szöge?",
      answer: 360,
      min: 180,
      max: 720,
      unit: "fok",
      topic: "Geometria"
    },
    {
      q: "Hány gyalogbábu található összesen a sakktáblán egy játszma indulásakor?",
      answer: 16,
      min: 8,
      max: 32,
      unit: "gyalog",
      topic: "Sakk"
    },
    {
      q: "Hány számozott golyóból sorsolnak a klasszikus magyar ötöslottó játékon?",
      answer: 90,
      min: 45,
      max: 100,
      unit: "szám",
      topic: "Játék"
    }
  ]
};

// Böngésző környezet kompatibilitás
if (typeof window !== 'undefined') {
  window.QUESTIONS_DATABASE = QUESTIONS_DATABASE;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QUESTIONS_DATABASE;
}
