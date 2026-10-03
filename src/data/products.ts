import type { Locale } from "./i18n";

/**
 * PLACEHOLDER CATALOGUE, carried over from the earlier site.
 * Prices, SKUs and marketplace links are invented. The marketplace URLs are
 * search pages, not real listings. Hindi copy is a first translation and
 * should be reviewed by a native speaker before launch.
 */

export type Variant = { weight: number; unit: "G" | "KG"; mrp: number; price: number; inStock?: boolean };

type ProductCopy = {
  name: string;
  shortDesc: string;
  longDesc: string;
  floralSource: string;
  harvestSeason: string;
  tastingNotes: string;
  crystallisation: string;
  storage: string;
  faqs: { question: string; answer: string }[];
};

export type Product = {
  slug: string;
  type: string; // key into HONEY_TYPES
  /** Honey colour for the 3D jar. */
  color: string;
  /** Flavour colour: tints the jar label and the page accents. */
  label: string;
  badges: string[]; // keys into BADGES
  featured: boolean;
  variants: Variant[];
  copy: Record<Locale, ProductCopy>;
};

export const HONEY_TYPES: Record<string, Record<Locale, string>> = {
  "wild-forest": { en: "Wild Forest", hi: "जंगली वन" },
  acacia: { en: "Acacia", hi: "अकासिया" },
  multiflora: { en: "Multiflora", hi: "बहुपुष्पी" },
  mustard: { en: "Mustard", hi: "सरसों" },
  litchi: { en: "Litchi", hi: "लीची" },
  jamun: { en: "Jamun", hi: "जामुन" },
};

export const BADGES: Record<string, Record<Locale, string>> = {
  raw: { en: "Raw", hi: "कच्चा" },
  unfiltered: { en: "Unfiltered", hi: "बिना छना" },
  tested: { en: "Lab-tested", hi: "लैब से जाँचा" },
  single: { en: "Single origin", hi: "एकल स्रोत" },
};

export const NUTRITION: { label: Record<Locale, string>; value: string }[] = [
  { label: { en: "Energy", hi: "ऊर्जा" }, value: "304 kcal" },
  { label: { en: "Carbohydrate", hi: "कार्बोहाइड्रेट" }, value: "82.4 g" },
  { label: { en: "of which sugars", hi: "जिसमें शर्करा" }, value: "82.1 g" },
  { label: { en: "Protein", hi: "प्रोटीन" }, value: "0.3 g" },
  { label: { en: "Fat", hi: "वसा" }, value: "0 g" },
  { label: { en: "Moisture", hi: "नमी" }, value: "17.1 g" },
];

export const PRODUCTS: Product[] = [
  {
    slug: "sundarbans-wild-forest-honey",
    type: "wild-forest",
    color: "#4e2208",
    label: "#6f9a52",
    badges: ["raw", "unfiltered", "tested"],
    featured: true,
    variants: [
      { weight: 250, unit: "G", mrp: 690, price: 599 },
      { weight: 500, unit: "G", mrp: 1290, price: 1099 },
      { weight: 1, unit: "KG", mrp: 2390, price: 1999 },
    ],
    copy: {
      en: {
        name: "Sundarbans wild forest honey",
        shortDesc:
          "Squeezed from wild combs cut in the mangroves by licensed honey collectors, once a year, in April.",
        longDesc: `This is not hive honey. It comes from wild *Apis dorsata* combs hanging in the mangrove canopy, cut by **mowalis** who hold forest department permits and go in for six weeks each spring.

The flow is mostly khalisha and goran blossom, both salt-tolerant mangrove species that grow nowhere else in India. That is what gives the honey its faint saline edge, which people either love immediately or take a jar to get used to.

- Wild harvested, not from managed hives
- Strained cold through a 400 micron mesh, nothing else
- Moisture runs higher than hive honey, so keep the lid closed`,
        floralSource: "Khalisha and goran mangrove blossom",
        harvestSeason: "April to May",
        tastingNotes: "Saline finish, smoke, dried dates, a long bitter edge",
        crystallisation: "Stays runny for eight to ten months, then sets into a coarse grain.",
        storage: "Room temperature, lid closed, away from sun. Do not refrigerate.",
        faqs: [
          {
            question: "Why is this the most expensive honey you sell?",
            answer:
              "The collectors go into a tiger reserve for it, the window is six weeks long, and the total legal harvest across the whole Sundarbans is small. Price follows from that.",
          },
        ],
      },
      hi: {
        name: "सुंदरबन जंगली वन शहद",
        shortDesc:
          "मैंग्रोव में लाइसेंसधारी शहद संग्राहकों द्वारा काटे गए जंगली छत्तों से निचोड़ा गया, साल में एक बार, अप्रैल में।",
        longDesc: `यह पाले गए छत्तों का शहद नहीं है। यह मैंग्रोव की छतरी में लटके जंगली *एपिस डॉर्सेटा* छत्तों से आता है, जिन्हें वन विभाग के परमिट वाले **मौली** काटते हैं, जो हर वसंत में छह हफ़्ते के लिए जंगल में जाते हैं।

इसमें ज़्यादातर खलीशा और गोरान के फूलों का रस है। ये दोनों खारे पानी में उगने वाले मैंग्रोव पेड़ हैं जो भारत में और कहीं नहीं उगते। इन्हीं से शहद में हल्का नमकीन स्वाद आता है, जिसे लोग या तो तुरंत पसंद करते हैं या एक बरनी के बाद।

- जंगल से इकट्ठा किया गया, पाले गए छत्तों से नहीं
- 400 माइक्रोन की जाली से ठंडे में छाना गया, और कुछ नहीं
- इसमें नमी छत्ते के शहद से ज़्यादा होती है, इसलिए ढक्कन बंद रखें`,
        floralSource: "खलीशा और गोरान मैंग्रोव के फूल",
        harvestSeason: "अप्रैल से मई",
        tastingNotes: "नमकीन अंत, धुएँ की महक, सूखे खजूर, देर तक रहने वाली हल्की कड़वाहट",
        crystallisation: "आठ से दस महीने तक तरल रहता है, फिर मोटे दानों में जम जाता है।",
        storage: "कमरे के तापमान पर, ढक्कन बंद करके, धूप से दूर रखें। फ्रिज में न रखें।",
        faqs: [
          {
            question: "यह आपका सबसे महँगा शहद क्यों है?",
            answer:
              "संग्राहक इसके लिए बाघ अभयारण्य के भीतर जाते हैं, कटाई का समय केवल छह हफ़्ते का होता है, और पूरे सुंदरबन में वैध कटाई कम होती है। दाम इसी से तय होता है।",
          },
        ],
      },
    },
  },
  {
    slug: "kashmir-white-acacia-honey",
    type: "acacia",
    color: "#efcf6c",
    label: "#c9d99a",
    badges: ["raw", "unfiltered", "tested", "single"],
    featured: true,
    variants: [
      { weight: 250, unit: "G", mrp: 590, price: 499 },
      { weight: 500, unit: "G", mrp: 1090, price: 899 },
      { weight: 1, unit: "KG", mrp: 1990, price: 1649 },
      { weight: 5, unit: "KG", mrp: 8900, price: 7499, inStock: false },
    ],
    copy: {
      en: {
        name: "Kashmir white acacia honey",
        shortDesc:
          "Almost colourless, barely sweet at the front, from robinia stands above Pulwama in early summer.",
        longDesc: `Acacia honey is the one people reach for when they think they do not like honey. It is very high in fructose and very low in glucose, which makes it mild, slow to crystallise, and easy to stir into things without dominating them.

Ours comes from a single migratory route into the robinia stands above Pulwama. The hives go up in the second week of May and come down before the monsoon reaches the valley.

Because glucose is what makes honey set, this jar can sit liquid for a year or more. That is chemistry, not processing.`,
        floralSource: "Robinia pseudoacacia, white acacia",
        harvestSeason: "May to June",
        tastingNotes: "Vanilla, green apple, a clean short finish",
        crystallisation: "Rarely sets. A year or more liquid is normal and not a sign of adulteration.",
        storage: "Room temperature. Refrigeration will cloud it without harming it.",
        faqs: [
          {
            question: "Mine has not crystallised in eight months. Is it real?",
            answer:
              "Yes. Acacia is the slowest setting honey there is. If you want proof beyond our word, the batch code on the lid maps to an NMR report we will email you.",
          },
        ],
      },
      hi: {
        name: "कश्मीर सफ़ेद अकासिया शहद",
        shortDesc:
          "लगभग रंगहीन, शुरुआत में हल्का मीठा, गर्मियों की शुरुआत में पुलवामा के ऊपर रोबिनिया के पेड़ों से।",
        longDesc: `अकासिया वह शहद है जिसे वे लोग भी पसंद करते हैं जिन्हें लगता है कि उन्हें शहद पसंद नहीं। इसमें फ्रुक्टोज़ बहुत अधिक और ग्लूकोज़ बहुत कम होता है, इसलिए यह हल्का होता है, देर से जमता है, और किसी भी चीज़ में मिलाने पर उसका स्वाद नहीं दबाता।

हमारा अकासिया पुलवामा के ऊपर रोबिनिया के पेड़ों तक जाने वाले एक ही प्रवासी मार्ग से आता है। छत्ते मई के दूसरे हफ़्ते में ऊपर जाते हैं और घाटी में मानसून पहुँचने से पहले नीचे आ जाते हैं।

शहद को जमाने वाला ग्लूकोज़ ही है, इसलिए यह बरनी एक साल या उससे भी ज़्यादा तरल रह सकती है। यह रसायन है, प्रसंस्करण नहीं।`,
        floralSource: "रोबिनिया स्यूडोअकासिया, सफ़ेद अकासिया",
        harvestSeason: "मई से जून",
        tastingNotes: "वनीला, हरा सेब, साफ़ और छोटा अंत",
        crystallisation: "शायद ही कभी जमता है। एक साल या ज़्यादा तरल रहना सामान्य है, यह मिलावट का संकेत नहीं।",
        storage: "कमरे के तापमान पर। फ्रिज में रखने से यह धुँधला हो जाएगा, पर ख़राब नहीं होगा।",
        faqs: [
          {
            question: "मेरा शहद आठ महीने में भी नहीं जमा। क्या यह असली है?",
            answer:
              "हाँ। अकासिया सबसे देर से जमने वाला शहद है। अगर आपको हमारी बात से आगे सबूत चाहिए, तो ढक्कन पर लिखा बैच कोड एक NMR रिपोर्ट से जुड़ा है जो हम आपको ईमेल कर देंगे।",
          },
        ],
      },
    },
  },
  {
    slug: "nilgiri-multiflora-honey",
    type: "multiflora",
    color: "#b8651a",
    label: "#f0973a",
    badges: ["raw", "unfiltered", "tested"],
    featured: true,
    variants: [
      { weight: 250, unit: "G", mrp: 430, price: 379 },
      { weight: 500, unit: "G", mrp: 790, price: 679 },
      { weight: 1, unit: "KG", mrp: 1450, price: 1249 },
    ],
    copy: {
      en: {
        name: "Nilgiri multiflora honey",
        shortDesc:
          "One apiary above Kotagiri, one flow, many blooms. Shola forest edge, eucalyptus windbreak, tea in between.",
        longDesc: `Multiflora is often a euphemism for blended. It is not here. This is a single apiary in the Nilgiris across a single autumn flow, and what the bees found in range is what is in the jar.

At 1,900 metres that range covers shola forest edge, a eucalyptus windbreak and several hundred hectares of tea that flowers between plucking rounds. The result changes slightly year to year, which is the point of buying it.

Batch codes on the lid carry the apiary and the harvest week.`,
        floralSource: "Shola forest edge, eucalyptus, tea blossom",
        harvestSeason: "September to October",
        tastingNotes: "Malt, cooked plum, a resinous finish from the eucalyptus",
        crystallisation: "Sets softly at around four months into a spreadable cream.",
        storage: "Room temperature. Warm the jar in water under 40°C to loosen it.",
        faqs: [],
      },
      hi: {
        name: "नीलगिरि बहुपुष्पी शहद",
        shortDesc:
          "कोटागिरि के ऊपर एक मधुवाटिका, एक मौसम, कई फूल। शोला वन का किनारा, यूकेलिप्टस की बाड़, और बीच में चाय।",
        longDesc: `बहुपुष्पी अक्सर मिलाए गए शहद का दूसरा नाम होता है। यहाँ ऐसा नहीं है। यह नीलगिरि की एक ही मधुवाटिका का, शरद ऋतु के एक ही मौसम का शहद है, और मधुमक्खियों को आसपास जो मिला वही बरनी में है।

1,900 मीटर की ऊँचाई पर उस दायरे में शोला वन का किनारा, यूकेलिप्टस की बाड़ और कई सौ हेक्टेयर चाय के बाग़ आते हैं, जो तुड़ाई के बीच फूलते हैं। हर साल स्वाद थोड़ा बदलता है, और इसे ख़रीदने की यही वजह है।

ढक्कन पर लिखे बैच कोड में मधुवाटिका और कटाई का हफ़्ता दर्ज होता है।`,
        floralSource: "शोला वन का किनारा, यूकेलिप्टस, चाय के फूल",
        harvestSeason: "सितंबर से अक्टूबर",
        tastingNotes: "माल्ट, पका आलूबुखारा, यूकेलिप्टस से हल्का राल जैसा अंत",
        crystallisation: "लगभग चार महीने में धीरे से जमकर मुलायम क्रीम जैसा हो जाता है।",
        storage: "कमरे के तापमान पर। ढीला करने के लिए बरनी को 40°C से कम गर्म पानी में रखें।",
        faqs: [],
      },
    },
  },
  {
    slug: "bharatpur-mustard-blossom-honey",
    type: "mustard",
    color: "#e2b552",
    label: "#f2c418",
    badges: ["raw", "unfiltered", "tested"],
    featured: true,
    variants: [
      { weight: 250, unit: "G", mrp: 320, price: 279 },
      { weight: 500, unit: "G", mrp: 590, price: 499 },
      { weight: 1, unit: "KG", mrp: 1090, price: 899 },
      { weight: 5, unit: "KG", mrp: 4900, price: 3999 },
    ],
    copy: {
      en: {
        name: "Bharatpur mustard blossom honey",
        shortDesc:
          "The honey the company started with in 1992. Sets fast, spreads like butter, tastes of the field it came from.",
        longDesc: `Mustard is a glucose-heavy honey, so it crystallises within weeks of leaving the tank. Supermarkets hate that and heat it to stop it. We let it set, because heating is exactly what strips the enzymes people buy raw honey for.

The flow runs across the Bharatpur mustard belt through January and February. These are the same fields the business started beside in 1992 and the same three families we bought from then.

Use it on toast rather than in tea. It is at its best spread thick and cold.`,
        floralSource: "Brassica juncea, Indian mustard",
        harvestSeason: "January to February",
        tastingNotes: "Butter, hay, a peppery lift at the back",
        crystallisation: "Sets within three to six weeks. It is meant to. Spread it, do not fight it.",
        storage: "Room temperature. Warming it repeatedly will coarsen the grain.",
        faqs: [
          {
            question: "Mine went solid in a month. Is that a fault?",
            answer:
              "No, that is mustard honey behaving correctly. Honey that stays liquid through a north Indian winter has usually been heated.",
          },
        ],
      },
      hi: {
        name: "भरतपुर सरसों फूल शहद",
        shortDesc:
          "वही शहद जिससे 1992 में कंपनी शुरू हुई। जल्दी जमता है, मक्खन की तरह फैलता है, और उसी खेत का स्वाद देता है जहाँ से आया।",
        longDesc: `सरसों के शहद में ग्लूकोज़ ज़्यादा होता है, इसलिए यह टंकी से निकलने के कुछ ही हफ़्तों में जम जाता है। सुपरमार्केट को यह पसंद नहीं, इसलिए वे इसे गर्म कर देते हैं। हम इसे जमने देते हैं, क्योंकि गर्म करने से वही एंजाइम नष्ट होते हैं जिनके लिए लोग कच्चा शहद ख़रीदते हैं।

यह शहद जनवरी और फ़रवरी में भरतपुर के सरसों क्षेत्र से आता है। ये वही खेत हैं जिनके पास 1992 में कारोबार शुरू हुआ था, और वही तीन परिवार जिनसे हम तब से शहद लेते हैं।

इसे चाय में नहीं, टोस्ट पर लगाइए। यह गाढ़ा और ठंडा लगाने पर सबसे अच्छा लगता है।`,
        floralSource: "ब्रैसिका जुन्सिया, भारतीय सरसों",
        harvestSeason: "जनवरी से फ़रवरी",
        tastingNotes: "मक्खन, सूखी घास, अंत में हल्की तीखी झलक",
        crystallisation: "तीन से छह हफ़्तों में जम जाता है। ऐसा ही होना चाहिए। इसे फैलाइए, इससे लड़िए मत।",
        storage: "कमरे के तापमान पर। बार-बार गर्म करने से दाने मोटे हो जाते हैं।",
        faqs: [
          {
            question: "मेरा शहद एक महीने में ठोस हो गया। क्या यह कोई ख़राबी है?",
            answer:
              "नहीं, सरसों का शहद ऐसा ही होता है। जो शहद उत्तर भारत की सर्दी में भी तरल रहे, उसे आमतौर पर गर्म किया गया होता है।",
          },
        ],
      },
    },
  },
  {
    slug: "muzaffarpur-litchi-blossom-honey",
    type: "litchi",
    color: "#d8902c",
    label: "#ef9fb2",
    badges: ["raw", "unfiltered", "tested", "single"],
    featured: false,
    variants: [
      { weight: 250, unit: "G", mrp: 490, price: 429 },
      { weight: 500, unit: "G", mrp: 890, price: 779 },
      { weight: 1, unit: "KG", mrp: 1690, price: 1449, inStock: false },
    ],
    copy: {
      en: {
        name: "Muzaffarpur litchi blossom honey",
        shortDesc:
          "A three-week flow in the litchi orchards of north Bihar. Floral, light, and gone by June every year.",
        longDesc: `Litchi honey exists because litchi orchards need pollinators and beekeepers need a spring flow. Hives go into the orchards around Muzaffarpur in the second week of March and come out before the fruit sets.

The window is three weeks. Some years it is two. When a season is short we simply have less of it, and when it is gone the product goes out of stock rather than quietly becoming something else.

It is the honey to give someone who has only ever had the supermarket kind.`,
        floralSource: "Litchi chinensis blossom",
        harvestSeason: "March, three weeks only",
        tastingNotes: "Rose water, lychee skin, a light caramel base",
        crystallisation: "Sets fine and pale at around five months.",
        storage: "Room temperature, away from strong smells. It picks up aromas.",
        faqs: [],
      },
      hi: {
        name: "मुज़फ़्फ़रपुर लीची फूल शहद",
        shortDesc:
          "उत्तर बिहार के लीची बाग़ों में तीन हफ़्ते का मौसम। फूलों जैसा, हल्का, और हर साल जून तक ख़त्म।",
        longDesc: `लीची का शहद इसलिए है क्योंकि लीची के बाग़ों को परागण करने वालों की ज़रूरत होती है और मधुमक्खी पालकों को वसंत के फूलों की। छत्ते मार्च के दूसरे हफ़्ते में मुज़फ़्फ़रपुर के बाग़ों में जाते हैं और फल लगने से पहले बाहर आ जाते हैं।

यह समय तीन हफ़्ते का होता है, कुछ सालों में दो का। जब मौसम छोटा होता है तो हमारे पास शहद भी कम होता है, और ख़त्म होने पर यह चुपचाप कुछ और बनने के बजाय स्टॉक से बाहर हो जाता है।

यह उस व्यक्ति को देने वाला शहद है जिसने केवल सुपरमार्केट वाला शहद चखा हो।`,
        floralSource: "लीची चिनेन्सिस के फूल",
        harvestSeason: "मार्च, केवल तीन हफ़्ते",
        tastingNotes: "गुलाब जल, लीची का छिलका, हल्के कैरामल का आधार",
        crystallisation: "लगभग पाँच महीने में बारीक और हल्के रंग में जमता है।",
        storage: "कमरे के तापमान पर, तेज़ गंध वाली चीज़ों से दूर। यह गंध सोख लेता है।",
        faqs: [],
      },
    },
  },
  {
    slug: "jamun-forest-honey",
    type: "jamun",
    color: "#2c0d22",
    label: "#9a62b8",
    badges: ["raw", "unfiltered", "tested"],
    featured: false,
    variants: [
      { weight: 250, unit: "G", mrp: 520, price: 449 },
      { weight: 500, unit: "G", mrp: 970, price: 829 },
      { weight: 1, unit: "KG", mrp: 1790, price: 1549 },
    ],
    copy: {
      en: {
        name: "Jamun forest honey",
        shortDesc: "Dark, mineral and only just sweet. From jamun stands on the edge of the Vindhya forests.",
        longDesc: `Jamun honey is the darkest we jar and the least sweet. It carries a mineral, almost iron-like note that comes from the same tree that gives the fruit its astringency.

It is the honey most often asked for by people managing blood sugar, and we will say plainly what we can and cannot claim: it has a lower glycaemic index than mustard or litchi honey. It is still honey, it is still sugar, and it is not a medicine.

Harvest is a short May flow before the monsoon breaks.`,
        floralSource: "Syzygium cumini, jamun blossom",
        harvestSeason: "May",
        tastingNotes: "Molasses, iron, tamarind, a dry astringent finish",
        crystallisation: "Slow, around eight months, into a dark coarse set.",
        storage: "Room temperature. It darkens further with age, which is harmless.",
        faqs: [
          {
            question: "Is jamun honey safe for someone with diabetes?",
            answer:
              "It has a lower glycaemic index than most honeys, but it is still sugar. Ask a doctor rather than a honey company.",
          },
        ],
      },
      hi: {
        name: "जामुन वन शहद",
        shortDesc: "गहरा, खनिज जैसा और बस हल्का मीठा। विंध्य के जंगलों के किनारे जामुन के पेड़ों से।",
        longDesc: `जामुन का शहद हमारा सबसे गहरे रंग का और सबसे कम मीठा शहद है। इसमें खनिज जैसा, लगभग लोहे जैसा स्वाद है, जो उसी पेड़ से आता है जो फल को उसका कसैलापन देता है।

ब्लड शुगर पर ध्यान रखने वाले लोग इसे सबसे ज़्यादा माँगते हैं, और हम साफ़ बताएँगे कि हम क्या दावा कर सकते हैं और क्या नहीं: इसका ग्लाइसेमिक इंडेक्स सरसों या लीची के शहद से कम है। फिर भी यह शहद है, यह शर्करा है, और यह दवा नहीं है।

कटाई मई में मानसून आने से पहले के छोटे मौसम में होती है।`,
        floralSource: "सिज़ीजियम क्यूमिनी, जामुन के फूल",
        harvestSeason: "मई",
        tastingNotes: "गुड़ का शीरा, लोहा, इमली, सूखा कसैला अंत",
        crystallisation: "धीरे, लगभग आठ महीने में, गहरे मोटे दानों में जमता है।",
        storage: "कमरे के तापमान पर। समय के साथ और गहरा होता है, जो हानिरहित है।",
        faqs: [
          {
            question: "क्या जामुन का शहद मधुमेह वाले व्यक्ति के लिए सुरक्षित है?",
            answer:
              "इसका ग्लाइसेमिक इंडेक्स ज़्यादातर शहद से कम है, पर यह फिर भी शर्करा है। शहद कंपनी से नहीं, डॉक्टर से पूछिए।",
          },
        ],
      },
    },
  },
];

export function marketplaceUrl(market: "amazon" | "flipkart", product: Product): string {
  const query = `High Growth ${product.copy.en.name}`;
  return market === "amazon"
    ? `https://www.amazon.in/s?k=${encodeURIComponent(query)}`
    : `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
}

export function lowestPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price));
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
