import type { Locale } from "./i18n";

/**
 * Page copy and interface strings, carried over from the earlier site and
 * extended for the new scroll story. Items marked PLACEHOLDER in README are
 * invented and must be replaced before launch.
 */

export type ApiaryPin = { name: string; region: string; honey: string; harvest: string };

const en = {
  meta: {
    siteName: "High Growth Honey",
    description:
      "Single-origin raw honey from small Indian apiaries, bottled unheated and unfiltered since 1992. Sold through Amazon and Flipkart.",
  },
  nav: {
    honeys: "Honeys",
    story: "Story",
    sourcing: "Sourcing",
    contact: "Bulk enquiry",
    home: "High Growth Honey, home",
    menu: "Menu",
    close: "Close",
    primary: "Primary",
    skip: "Skip to content",
    switchTo: "Read this page in",
    buy: "Buy on Amazon",
  },
  hero: {
    eyebrow: "Raw & unheated · since 1992",
    titleA: "Straight from",
    titleB: "the hive",
    lede: "Single-origin raw honey from small Indian apiaries, bottled unheated and unfiltered. Sold through Amazon and Flipkart.",
    primary: "See the honeys",
    secondary: "Our story",
    trust: "33 years of migratory beekeeping",
    cards: [
      { tab: "Purity", caption: "Nothing added,\nnothing taken away", stat: "100%" },
      { tab: "Heritage", caption: "Migratory beekeepers\nsince 1992", stat: "33+ yrs" },
    ],
    scroll: "Scroll",
  },
  lid: {
    eyebrow: "Read the lid",
    heading: "Every jar is sealed with four promises",
    items: [
      { mark: "1992", title: "Est. 1992", body: "Started with forty hives beside the mustard fields of Bharatpur. The same families still supply us." },
      { mark: "RAW", title: "100% raw & unheated", body: "Never heated past hive temperature, so the enzymes and aroma you pay for are still in the jar." },
      { mark: "NABL", title: "NABL lab tested", body: "Every batch is checked for sugar syrup, moisture, HMF and heavy metals before it is jarred." },
      { mark: "HIVE", title: "Direct from apiaries", body: "No traders in between. Each label names the floral source, harvest window and apiary." },
    ],
  },
  varieties: {
    eyebrow: "The collection",
    heading: "Six honeys, each from one bloom",
    body: "We do not blend harvests across regions or months. Every jar carries the floral source, harvest window and apiary location on its label.",
    view: "View this honey",
    all: "See all honeys",
  },
  claims: {
    eyebrow: "Why raw matters",
    heading: "What we leave out is the point",
    items: [
      {
        banner: "Never heated",
        title: "Never heated past hive temperature",
        body: "Commercial honey is pasteurised at 65°C to stop crystallisation. Heat destroys diastase, invertase and natural aroma compounds. We strain cold and let nature set the pace.",
      },
      {
        banner: "Pollen kept in",
        title: "400 micron coarse mesh",
        body: "Ultra-filtration removes pollen grains to disguise where honey came from. We use a single coarse stainless mesh to catch comb bits while leaving pollen intact.",
      },
      {
        banner: "Lab certified",
        title: "Every batch lab certified",
        body: "We test C4 sugar adulteration, moisture content, HMF levels and heavy metals at NABL-accredited facilities before any batch goes into jars.",
      },
    ],
  },
  sourcing: {
    eyebrow: "Sourcing",
    heading: "Four apiary regions",
    body: "Our migratory beekeepers follow seasonal blooms across northern and eastern India, moving hives to match natural flower cycles.",
    harvest: "Harvest",
    pins: [
      { name: "Bharatpur Apiary", region: "Rajasthan", honey: "Mustard Honey", harvest: "Jan-Feb" },
      { name: "Anantnag Apiary", region: "Kashmir", honey: "White Acacia Honey", harvest: "May-Jun" },
      { name: "Muzaffarpur Apiary", region: "Bihar", honey: "Litchi Blossom Honey", harvest: "Mar-Apr" },
      { name: "Sundarbans Reserve", region: "West Bengal", honey: "Wild Forest Honey", harvest: "Apr-May" },
    ] as ApiaryPin[],
  },
  story: {
    eyebrow: "Our story",
    heading: "Thirty-three years of migratory beekeeping",
    body: "High Growth Honey began in 1992 with forty hives in Bharatpur. Today our network of migratory beekeepers moves with flower seasons across five states, preserving traditional extraction methods.",
    cta: "Read the full story",
  },
  trust: [
    { value: "33+", label: "Years in beekeeping" },
    { value: "100%", label: "Raw & unheated" },
    { value: "NABL", label: "Lab certified" },
    { value: "0", label: "Added sugars or syrup" },
  ],
  finale: {
    heading: "Find a jar near you",
    body: "We do not sell from this site. Every jar ships through Amazon or Flipkart, straight from our warehouse.",
  },
  banners: {
    marketplace: "On Amazon & Flipkart",
    since: "Since 1992",
    raw: "100% raw",
    tested: "Lab tested",
    bulk: "Bulk & export",
  },
  common: {
    from: "from",
    off: "off",
    outOfStock: "out of stock",
    optional: "optional",
    readMore: "Read more",
  },
  catalogue: {
    title: "The honeys",
    intro:
      "One floral source per jar, each from a named apiary. We do not sell from this site. Every jar goes out through Amazon or Flipkart.",
    honeyType: "Honey type",
    all: "All",
    countPattern: "{shown} of {total} honeys",
    noMatch: "Nothing matches that filter.",
  },
  marketplace: {
    amazon: "Buy on Amazon",
    flipkart: "Buy on Flipkart",
    amazonHint: ", opens amazon.in in a new tab",
    flipkartHint: ", opens flipkart.com in a new tab",
    noOrdersHere: "We do not take orders here. Both links open the marketplace listing in a new tab.",
  },
  product: {
    breadcrumb: "The honeys",
    about: "About this honey",
    questions: "Questions",
    particulars: "The particulars",
    honeyType: "Honey type",
    floralSource: "Floral source",
    harvestSeason: "Harvest season",
    tastingNotes: "Tasting notes",
    texture: "Texture over time",
    nutrition: "Nutrition, per 100 g",
    storage: "Storage",
    chooseSize: "Choose a jar size",
    inStock: "In stock at the marketplaces.",
    outOfStockNow: "This size is currently out of stock.",
    drag: "Drag to turn the jar",
    more: "More honeys",
  },
  about: {
    eyebrow: "Our story",
    heading: "Beekeeping since 1992",
    body: "High Growth Honey was founded in Bharatpur, Rajasthan, to bring unadulterated, single-origin honey directly from hives to Indian homes. Over three decades, we have built a trusted network of migratory beekeepers who prioritise bee welfare and honey purity.",
    sections: [
      {
        heading: "Migratory beekeeping",
        body: "Unlike stationary farms, our beekeepers move hives seasonally to follow natural floral flows. This gives our honey distinct single-flower flavour profiles without artificial flavouring.",
      },
      {
        heading: "Cold straining",
        body: "Honey is harvested and gravity-strained through a 400-micron mesh. It is never micro-filtered or heated above natural hive temperature (~35°C), preserving natural enzymes and pollen.",
      },
      {
        heading: "Quality testing",
        body: "Every harvest batch undergoes NABL-accredited laboratory testing for C3/C4 sugars, moisture percentage, HMF parameters and antibiotic residues.",
      },
    ],
    timelineHeading: "Thirty-three years, in order",
    timeline: [
      { year: "1992", title: "Founded in Bharatpur", body: "Started with 40 boxes during the mustard bloom season in Rajasthan." },
      { year: "2004", title: "Kashmir migration route", body: "Established seasonal migration routes into the Tral and Anantnag valleys for robinia acacia honey." },
      { year: "2015", title: "Quality lab partnership", body: "Mandated full NABL batch testing for all retail honey releases." },
      { year: "2023", title: "Marketplace launch", body: "Partnered with major Indian marketplaces to deliver single-origin jars directly across India." },
    ],
    teamHeading: "Our beekeeping team",
    team: [
      { role: "Founder & Chief Beekeeper", bio: "Over 30 years guiding migratory hive routes and maintaining traditional cold extraction standards." },
      { role: "Quality & Compliance Head", bio: "Oversees sample testing protocols and NABL certification for every harvested batch." },
    ],
    nameToBeAdded: "Name to be added",
  },
  contact: {
    eyebrow: "Contact",
    heading: "Bulk, distribution & export enquiries",
    body: "We supply single-origin raw honey in bulk pails, glass jars for retail stockists, and export consignments. Fill in your requirements below.",
    name: "Your name",
    company: "Company",
    phone: "Phone",
    email: "Email",
    city: "City",
    purpose: "What is this about",
    message: "Message",
    messagePlaceholder: "Quantities, jar sizes, where you are stocking, timelines.",
    submit: "Send enquiry",
    reachDirectly: "Or reach us directly",
    purposes: [
      { value: "retail", label: "Retail, a jar or two" },
      { value: "bulk", label: "Bulk order" },
      { value: "distributorship", label: "Distributorship" },
      { value: "export", label: "Export" },
    ],
    errors: {
      name: "Tell us your name.",
      phone: "A phone number we can reach you on.",
      phoneFormat: "Digits, spaces and + only.",
      email: "That email does not look right.",
      city: "Which city are you in?",
      message: "A sentence or two about what you need.",
      check: "Check the highlighted fields.",
    },
    thanks: "Thank you. We reply within two working days.",
  },
  faq: {
    heading: "Common questions",
    items: [
      {
        question: "Why does raw honey crystallise?",
        answer:
          "Crystallisation is a natural property of raw, unheated honey. Glucose separates from water and forms fine crystals. Place the jar in warm water (under 40°C) to reliquefy.",
      },
      {
        question: "How do I order High Growth Honey?",
        answer:
          "We sell our retail jars exclusively through Amazon India and Flipkart. Use the marketplace links on any product page.",
      },
      {
        question: "Is this honey tested for sugar syrup adulteration?",
        answer:
          "Yes, every batch undergoes C4/C3 carbon isotope testing at NABL-accredited laboratories to verify 100% pure bee origin.",
      },
    ],
  },
  footer: {
    blurb: "High Growth Honey. Single-origin raw honey from migratory Indian apiaries.",
    reachUs: "Reach us",
    explore: "Explore",
    phone: "+91 98765 43210",
    email: "enquiry@highgrowthhoney.com",
    address: { label: "Headquarters & lab", lines: ["12 Beehive Enclave, NH-21", "Bharatpur, Rajasthan 321001"] },
    social: [
      { label: "Instagram", href: "https://instagram.com/" },
      { label: "Facebook", href: "https://facebook.com/" },
      { label: "LinkedIn", href: "https://linkedin.com/" },
    ],
    licence: "FSSAI licence",
    fssai: "10000000000000",
    rights: "High Growth Honey. Raw honey, sold through Amazon and Flipkart.",
    credit: "Bee model: “Honey Bee” by Tony's Classics, CC BY 4.0",
  },
  notFound: {
    title: "That page is not here",
    body: "The link may be old, or a honey may have sold out.",
    seeHoneys: "See the honeys",
    home: "Home",
  },
};

export type Copy = typeof en;

const hi: Copy = {
  meta: {
    siteName: "हाई ग्रोथ हनी",
    description:
      "भारतीय मधुवाटिकाओं से एकल-स्रोत कच्चा शहद, 1992 से बिना गर्म किए और बिना छाने बरनियों में बंद। अमेज़ॉन और फ्लिपकार्ट पर उपलब्ध।",
  },
  nav: {
    honeys: "शहद",
    story: "हमारी कहानी",
    sourcing: "कहाँ से आता है",
    contact: "थोक पूछताछ",
    home: "हाई ग्रोथ हनी, मुखपृष्ठ",
    menu: "मेन्यू",
    close: "बंद करें",
    primary: "मुख्य",
    skip: "सीधे सामग्री पर जाएँ",
    switchTo: "यह पृष्ठ पढ़ें",
    buy: "अमेज़ॉन पर खरीदें",
  },
  hero: {
    eyebrow: "कच्चा व बिना गर्म किया · 1992 से",
    titleA: "सीधे छत्ते",
    titleB: "से आपके घर",
    lede: "भारतीय मधुवाटिकाओं से एकल-स्रोत कच्चा शहद, बिना गर्म किए और बिना छाने बरनियों में बंद। अमेज़ॉन और फ्लिपकार्ट पर उपलब्ध।",
    primary: "शहद देखें",
    secondary: "हमारी कहानी",
    trust: "33 साल का मौसमी मधुमक्खी पालन",
    cards: [
      { tab: "शुद्धता", caption: "कुछ मिलाया नहीं,\nकुछ निकाला नहीं", stat: "100%" },
      { tab: "विरासत", caption: "1992 से मौसमी\nमधुमक्खी पालक", stat: "33+ साल" },
    ],
    scroll: "नीचे देखें",
  },
  lid: {
    eyebrow: "ढक्कन पढ़िए",
    heading: "हर बरनी चार वादों के साथ बंद होती है",
    items: [
      { mark: "1992", title: "स्थापना 1992", body: "भरतपुर के सरसों के खेतों के पास चालीस छत्तों से शुरुआत। वही परिवार आज भी हमें शहद देते हैं।" },
      { mark: "RAW", title: "100% कच्चा व बिना गर्म किया", body: "छत्ते के तापमान से अधिक कभी गर्म नहीं किया, इसलिए एंजाइम और सुगंध बरनी में बने रहते हैं।" },
      { mark: "NABL", title: "NABL लैब से जाँचा", body: "बरनी में भरने से पहले हर बैच की चीनी की चाशनी, नमी, HMF और भारी धातुओं के लिए जाँच होती है।" },
      { mark: "HIVE", title: "सीधे मधुवाटिका से", body: "बीच में कोई व्यापारी नहीं। हर लेबल पर फूल का स्रोत, कटाई का समय और मधुवाटिका दर्ज है।" },
    ],
  },
  varieties: {
    eyebrow: "हमारा संग्रह",
    heading: "छह प्रकार के शहद, हर एक एक ही फूल से",
    body: "हम अलग-अलग क्षेत्रों या महीनों की फसल को मिलाते नहीं हैं। हर बरनी के लेबल पर फूल का नाम, कटाई का समय और स्थान दर्ज होता है।",
    view: "यह शहद देखें",
    all: "सभी शहद देखें",
  },
  claims: {
    eyebrow: "कच्चा शहद क्यों ज़रूरी है",
    heading: "हम जो नहीं करते, वही असली बात है",
    items: [
      {
        banner: "कभी गर्म नहीं",
        title: "छत्ते के तापमान से अधिक गर्म नहीं किया जाता",
        body: "व्यावसायिक शहद को 65°C पर पाश्चुरीकृत किया जाता है। गर्मी से प्राकृतिक एंजाइम और सुगंध नष्ट हो जाती है। हम ठंडे तापमान में ही छानते हैं।",
      },
      {
        banner: "पराग सुरक्षित",
        title: "400 माइक्रोन मोटा जाल",
        body: "अति-छनाई परागकणों को हटा देती है। हम छत्ते के टुकड़े रोकने के लिए मोटे स्टेनलेस जाल का उपयोग करते हैं, जिससे पराग सुरक्षित रहता है।",
      },
      {
        banner: "लैब प्रमाणित",
        title: "हर बैच लैब से प्रमाणित",
        body: "बरनियों में भरने से पहले NABL-मान्यता प्राप्त प्रयोगशालाओं में चीनी की मिलावट, नमी, HMF और भारी धातुओं की जाँच की जाती है।",
      },
    ],
  },
  sourcing: {
    eyebrow: "कहाँ से आता है",
    heading: "चार मधुवाटिका क्षेत्र",
    body: "हमारे मौसमी मधुमक्खी पालक उत्तर और पूर्वी भारत में फूलों के मौसम के अनुसार छत्तों को एक स्थान से दूसरे स्थान ले जाते हैं।",
    harvest: "कटाई",
    pins: [
      { name: "भरतपुर मधुवाटिका", region: "राजस्थान", honey: "सरसों का शहद", harvest: "जनवरी-फरवरी" },
      { name: "अनंतनाग मधुवाटिका", region: "कश्मीर", honey: "सफ़ेद अकासिया शहद", harvest: "मई-जून" },
      { name: "मुज़फ़्फ़रपुर मधुवाटिका", region: "बिहार", honey: "लीची का शहद", harvest: "मार्च-अप्रैल" },
      { name: "सुंदरबन रिज़र्व", region: "पश्चिम बंगाल", honey: "जंगली वन शहद", harvest: "अप्रैल-मई" },
    ],
  },
  story: {
    eyebrow: "हमारी कहानी",
    heading: "तैंतीस साल का मधुमक्खी पालन",
    body: "हाई ग्रोथ हनी की शुरुआत 1992 में भरतपुर में 40 छत्तों से हुई थी। आज हमारा नेटवर्क पाँच राज्यों में फूलों के मौसम के साथ चलता है और पारंपरिक तरीकों से शुद्ध शहद निकालता है।",
    cta: "पूरी कहानी पढ़ें",
  },
  trust: [
    { value: "33+", label: "साल का अनुभव" },
    { value: "100%", label: "कच्चा व प्राकृतिक" },
    { value: "NABL", label: "लैब प्रमाणित" },
    { value: "0", label: "ऊपर से मिलाई चीनी" },
  ],
  finale: {
    heading: "अपनी बरनी पाइए",
    body: "हम इस साइट पर बिक्री नहीं करते। हर बरनी अमेज़ॉन या फ्लिपकार्ट से, सीधे हमारे गोदाम से भेजी जाती है।",
  },
  banners: {
    marketplace: "अमेज़ॉन व फ्लिपकार्ट पर",
    since: "1992 से",
    raw: "100% कच्चा",
    tested: "लैब से जाँचा",
    bulk: "थोक व निर्यात",
  },
  common: {
    from: "शुरुआत",
    off: "छूट",
    outOfStock: "स्टॉक में नहीं",
    optional: "वैकल्पिक",
    readMore: "और पढ़ें",
  },
  catalogue: {
    title: "हमारे शहद",
    intro:
      "हर बरनी में एक ही फूल का शहद, और हर बरनी किसी एक नामित मधुवाटिका से। हम इस साइट पर बिक्री नहीं करते। हर बरनी अमेज़ॉन या फ्लिपकार्ट से जाती है।",
    honeyType: "शहद का प्रकार",
    all: "सभी",
    countPattern: "{total} में से {shown} शहद",
    noMatch: "इस छँटाई से कुछ नहीं मिला।",
  },
  marketplace: {
    amazon: "अमेज़ॉन पर खरीदें",
    flipkart: "फ्लिपकार्ट पर खरीदें",
    amazonHint: ", amazon.in नए टैब में खुलेगा",
    flipkartHint: ", flipkart.com नए टैब में खुलेगा",
    noOrdersHere: "हम यहाँ ऑर्डर नहीं लेते। दोनों लिंक मार्केटप्लेस की लिस्टिंग नए टैब में खोलते हैं।",
  },
  product: {
    breadcrumb: "हमारे शहद",
    about: "इस शहद के बारे में",
    questions: "अक्सर पूछे जाने वाले प्रश्न",
    particulars: "ब्यौरा",
    honeyType: "शहद का प्रकार",
    floralSource: "फूल का स्रोत",
    harvestSeason: "कटाई का मौसम",
    tastingNotes: "स्वाद",
    texture: "समय के साथ बनावट",
    nutrition: "पोषण, प्रति 100 ग्राम",
    storage: "रखरखाव",
    chooseSize: "बरनी का आकार चुनें",
    inStock: "मार्केटप्लेस पर उपलब्ध है।",
    outOfStockNow: "यह आकार इस समय स्टॉक में नहीं है।",
    drag: "बरनी घुमाने के लिए खींचें",
    more: "और शहद",
  },
  about: {
    eyebrow: "हमारी कहानी",
    heading: "1992 से मधुमक्खी पालन",
    body: "हाई ग्रोथ हनी की स्थापना राजस्थान के भरतपुर में हुई थी ताकि भारतीय घरों तक छत्तों से सीधे शुद्ध, एकल-स्रोत शहद पहुँचाया जा सके। तीन दशकों में हमने मौसमी मधुमक्खी पालकों का एक भरोसेमंद नेटवर्क बनाया है जो मधुमक्खियों की भलाई और शहद की शुद्धता को सबसे ऊपर रखते हैं।",
    sections: [
      {
        heading: "मौसमी मधुमक्खी पालन",
        body: "हमारे मधुमक्खी पालक मौसमी फूलों के अनुसार छत्तों का स्थान बदलते हैं। इससे हर शहद को किसी एक फूल का प्राकृतिक स्वाद मिलता है, बिना किसी कृत्रिम स्वाद के।",
      },
      {
        heading: "ठंडी छनाई",
        body: "शहद को 400-माइक्रोन जाली से गुरुत्वाकर्षण द्वारा छाना जाता है। इसे कभी सूक्ष्म-छनाई नहीं किया जाता और न ही छत्ते के प्राकृतिक तापमान (~35°C) से अधिक गर्म किया जाता है।",
      },
      {
        heading: "गुणवत्ता जाँच",
        body: "हर फसल की NABL-मान्यता प्राप्त प्रयोगशालाओं में C3/C4 शर्करा, नमी, HMF और एंटीबायोटिक अवशेषों के लिए जाँच होती है।",
      },
    ],
    timelineHeading: "तैंतीस साल, क्रम से",
    timeline: [
      { year: "1992", title: "भरतपुर में शुरुआत", body: "राजस्थान में सरसों के मौसम में 40 बक्सों के साथ शुरुआत।" },
      { year: "2004", title: "कश्मीर मार्ग", body: "अकासिया शहद के लिए त्राल और अनंतनाग घाटियों में प्रवासन मार्ग बनाए।" },
      { year: "2015", title: "लैब साझेदारी", body: "सभी रिटेल शहद के लिए पूर्ण NABL बैच परीक्षण अनिवार्य किया।" },
      { year: "2023", title: "मार्केटप्लेस पर शुरुआत", body: "पूरे भारत में सीधे बरनियाँ पहुँचाने के लिए प्रमुख मार्केटप्लेस के साथ भागीदारी।" },
    ],
    teamHeading: "हमारी मधुमक्खी पालन टीम",
    team: [
      { role: "संस्थापक और मुख्य मधुमक्खी पालक", bio: "30 से अधिक वर्षों से छत्तों के प्रवासन मार्ग और पारंपरिक ठंडी निकासी के मानकों की देखरेख।" },
      { role: "गुणवत्ता प्रमुख", bio: "हर फसल के नमूनों की जाँच और NABL प्रमाणन की देखरेख।" },
    ],
    nameToBeAdded: "नाम जोड़ा जाना है",
  },
  contact: {
    eyebrow: "संपर्क",
    heading: "थोक, वितरण और निर्यात पूछताछ",
    body: "हम थोक पीपों, रिटेल विक्रेताओं के लिए काँच की बरनियों और निर्यात के लिए शहद उपलब्ध कराते हैं। अपनी आवश्यकताएँ नीचे भरें।",
    name: "आपका नाम",
    company: "कंपनी",
    phone: "फ़ोन",
    email: "ईमेल",
    city: "शहर",
    purpose: "किस बारे में",
    message: "संदेश",
    messagePlaceholder: "मात्रा, बरनी का आकार, आप कहाँ रख रहे हैं, कब तक चाहिए।",
    submit: "पूछताछ भेजें",
    reachDirectly: "या सीधे संपर्क करें",
    purposes: [
      { value: "retail", label: "खुदरा, एक या दो बरनी" },
      { value: "bulk", label: "थोक ऑर्डर" },
      { value: "distributorship", label: "वितरण अधिकार" },
      { value: "export", label: "निर्यात" },
    ],
    errors: {
      name: "अपना नाम बताइए।",
      phone: "एक फ़ोन नंबर जिस पर हम आपसे बात कर सकें।",
      phoneFormat: "केवल अंक, स्पेस और + चलेंगे।",
      email: "यह ईमेल सही नहीं लग रहा।",
      city: "आप किस शहर में हैं?",
      message: "एक-दो वाक्य में बताइए कि आपको क्या चाहिए।",
      check: "चिह्नित खाने जाँच लें।",
    },
    thanks: "धन्यवाद। हम दो कार्यदिवसों में उत्तर देते हैं।",
  },
  faq: {
    heading: "अक्सर पूछे जाने वाले प्रश्न",
    items: [
      {
        question: "कच्चा शहद जम क्यों जाता है?",
        answer:
          "जमना कच्चे शहद का प्राकृतिक गुण है। ग्लूकोज़ पानी से अलग होकर बारीक दाने बनाता है। गुनगुने पानी (40°C से कम) में बरनी रखने से यह फिर पिघल जाता है।",
      },
      {
        question: "हाई ग्रोथ हनी का ऑर्डर कैसे करें?",
        answer: "हम अपनी बरनियाँ केवल अमेज़ॉन इंडिया और फ्लिपकार्ट के ज़रिए बेचते हैं। किसी भी उत्पाद पृष्ठ पर दिए गए लिंक का उपयोग करें।",
      },
      {
        question: "क्या इस शहद की चीनी की चाशनी की मिलावट के लिए जाँच होती है?",
        answer: "हाँ, 100% शुद्धता सत्यापित करने के लिए हर बैच का NABL प्रयोगशालाओं में C4/C3 कार्बन आइसोटोप परीक्षण होता है।",
      },
    ],
  },
  footer: {
    blurb: "हाई ग्रोथ हनी। भारतीय मधुवाटिकाओं से प्राप्त एकल-स्रोत कच्चा शहद।",
    reachUs: "हमसे संपर्क",
    explore: "देखें",
    phone: "+91 98765 43210",
    email: "enquiry@highgrowthhoney.com",
    address: { label: "मुख्यालय और प्रयोगशाला", lines: ["12 बीहाइव एन्क्लेव, NH-21", "भरतपुर, राजस्थान 321001"] },
    social: [
      { label: "इंस्टाग्राम", href: "https://instagram.com/" },
      { label: "फ़ेसबुक", href: "https://facebook.com/" },
      { label: "लिंक्डइन", href: "https://linkedin.com/" },
    ],
    licence: "एफ़एसएसएआई लाइसेंस",
    fssai: "10000000000000",
    rights: "हाई ग्रोथ हनी। कच्चा शहद, अमेज़ॉन और फ्लिपकार्ट के ज़रिए।",
    credit: "बी मॉडल: “Honey Bee”, Tony's Classics, CC BY 4.0",
  },
  notFound: {
    title: "यह पृष्ठ यहाँ नहीं है",
    body: "लिंक पुराना हो सकता है, या कोई शहद बिक गया हो।",
    seeHoneys: "शहद देखें",
    home: "मुखपृष्ठ",
  },
};

const COPY: Record<Locale, Copy> = { en, hi };

export function t(lang: Locale): Copy {
  return COPY[lang];
}
