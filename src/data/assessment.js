export const LANGUAGES = {
  en: {
    code: "en",
    short: "EN",
    name: "English"
  },
  es: {
    code: "es",
    short: "ES",
    name: "Español"
  }
};

export const UNKNOWN_ANSWER = "unknown";

export const PHONE_COUNTRY_OPTIONS = [
  { id: "af", countryCode: "AF", dialCode: "+93" },
  { id: "al", countryCode: "AL", dialCode: "+355" },
  { id: "dz", countryCode: "DZ", dialCode: "+213" },
  { id: "as", countryCode: "AS", dialCode: "+1-684" },
  { id: "ad", countryCode: "AD", dialCode: "+376" },
  { id: "ao", countryCode: "AO", dialCode: "+244" },
  { id: "ai", countryCode: "AI", dialCode: "+1-264" },
  { id: "ag", countryCode: "AG", dialCode: "+1-268" },
  { id: "ar", countryCode: "AR", dialCode: "+54" },
  { id: "am", countryCode: "AM", dialCode: "+374" },
  { id: "aw", countryCode: "AW", dialCode: "+297" },
  { id: "au", countryCode: "AU", dialCode: "+61" },
  { id: "at", countryCode: "AT", dialCode: "+43" },
  { id: "az", countryCode: "AZ", dialCode: "+994" },
  { id: "bs", countryCode: "BS", dialCode: "+1-242" },
  { id: "bh", countryCode: "BH", dialCode: "+973" },
  { id: "bd", countryCode: "BD", dialCode: "+880" },
  { id: "bb", countryCode: "BB", dialCode: "+1-246" },
  { id: "by", countryCode: "BY", dialCode: "+375" },
  { id: "be", countryCode: "BE", dialCode: "+32" },
  { id: "bz", countryCode: "BZ", dialCode: "+501" },
  { id: "bj", countryCode: "BJ", dialCode: "+229" },
  { id: "bm", countryCode: "BM", dialCode: "+1-441" },
  { id: "bt", countryCode: "BT", dialCode: "+975" },
  { id: "bo", countryCode: "BO", dialCode: "+591" },
  { id: "ba", countryCode: "BA", dialCode: "+387" },
  { id: "bw", countryCode: "BW", dialCode: "+267" },
  { id: "br", countryCode: "BR", dialCode: "+55" },
  { id: "io", countryCode: "IO", dialCode: "+246" },
  { id: "vg", countryCode: "VG", dialCode: "+1-284" },
  { id: "bn", countryCode: "BN", dialCode: "+673" },
  { id: "bg", countryCode: "BG", dialCode: "+359" },
  { id: "bf", countryCode: "BF", dialCode: "+226" },
  { id: "bi", countryCode: "BI", dialCode: "+257" },
  { id: "kh", countryCode: "KH", dialCode: "+855" },
  { id: "cm", countryCode: "CM", dialCode: "+237" },
  { id: "ca", countryCode: "CA", dialCode: "+1", phonePlaceholder: "(416) 123-4567", minDigits: 10 },
  { id: "cv", countryCode: "CV", dialCode: "+238" },
  { id: "bq", countryCode: "BQ", dialCode: "+599" },
  { id: "ky", countryCode: "KY", dialCode: "+1-345" },
  { id: "cf", countryCode: "CF", dialCode: "+236" },
  { id: "td", countryCode: "TD", dialCode: "+235" },
  { id: "cl", countryCode: "CL", dialCode: "+56" },
  { id: "cn", countryCode: "CN", dialCode: "+86" },
  { id: "cx", countryCode: "CX", dialCode: "+61" },
  { id: "cc", countryCode: "CC", dialCode: "+61" },
  { id: "co", countryCode: "CO", dialCode: "+57", phonePlaceholder: "300 123 4567", minDigits: 10 },
  { id: "km", countryCode: "KM", dialCode: "+269" },
  { id: "cg", countryCode: "CG", dialCode: "+242" },
  { id: "cd", countryCode: "CD", dialCode: "+243" },
  { id: "ck", countryCode: "CK", dialCode: "+682" },
  { id: "cr", countryCode: "CR", dialCode: "+506" },
  { id: "ci", countryCode: "CI", dialCode: "+225" },
  { id: "hr", countryCode: "HR", dialCode: "+385" },
  { id: "cu", countryCode: "CU", dialCode: "+53" },
  { id: "cw", countryCode: "CW", dialCode: "+599" },
  { id: "cy", countryCode: "CY", dialCode: "+357" },
  { id: "cz", countryCode: "CZ", dialCode: "+420" },
  { id: "dk", countryCode: "DK", dialCode: "+45" },
  { id: "dj", countryCode: "DJ", dialCode: "+253" },
  { id: "dm", countryCode: "DM", dialCode: "+1-767" },
  { id: "do", countryCode: "DO", dialCode: "+1-809" },
  { id: "ec", countryCode: "EC", dialCode: "+593" },
  { id: "eg", countryCode: "EG", dialCode: "+20" },
  { id: "sv", countryCode: "SV", dialCode: "+503" },
  { id: "gq", countryCode: "GQ", dialCode: "+240" },
  { id: "er", countryCode: "ER", dialCode: "+291" },
  { id: "ee", countryCode: "EE", dialCode: "+372" },
  { id: "sz", countryCode: "SZ", dialCode: "+268" },
  { id: "et", countryCode: "ET", dialCode: "+251" },
  { id: "fk", countryCode: "FK", dialCode: "+500" },
  { id: "fo", countryCode: "FO", dialCode: "+298" },
  { id: "fj", countryCode: "FJ", dialCode: "+679" },
  { id: "fi", countryCode: "FI", dialCode: "+358" },
  { id: "fr", countryCode: "FR", dialCode: "+33" },
  { id: "gf", countryCode: "GF", dialCode: "+594" },
  { id: "pf", countryCode: "PF", dialCode: "+689" },
  { id: "ga", countryCode: "GA", dialCode: "+241" },
  { id: "gm", countryCode: "GM", dialCode: "+220" },
  { id: "ge", countryCode: "GE", dialCode: "+995" },
  { id: "de", countryCode: "DE", dialCode: "+49" },
  { id: "gh", countryCode: "GH", dialCode: "+233" },
  { id: "gi", countryCode: "GI", dialCode: "+350" },
  { id: "gr", countryCode: "GR", dialCode: "+30" },
  { id: "gl", countryCode: "GL", dialCode: "+299" },
  { id: "gd", countryCode: "GD", dialCode: "+1-473" },
  { id: "gp", countryCode: "GP", dialCode: "+590" },
  { id: "gu", countryCode: "GU", dialCode: "+1-671" },
  { id: "gt", countryCode: "GT", dialCode: "+502" },
  { id: "gg", countryCode: "GG", dialCode: "+44-1481" },
  { id: "gn", countryCode: "GN", dialCode: "+224" },
  { id: "gw", countryCode: "GW", dialCode: "+245" },
  { id: "gy", countryCode: "GY", dialCode: "+592" },
  { id: "ht", countryCode: "HT", dialCode: "+509" },
  { id: "hn", countryCode: "HN", dialCode: "+504" },
  { id: "hk", countryCode: "HK", dialCode: "+852" },
  { id: "hu", countryCode: "HU", dialCode: "+36" },
  { id: "is", countryCode: "IS", dialCode: "+354" },
  { id: "in", countryCode: "IN", dialCode: "+91" },
  { id: "id", countryCode: "ID", dialCode: "+62" },
  { id: "ir", countryCode: "IR", dialCode: "+98" },
  { id: "iq", countryCode: "IQ", dialCode: "+964" },
  { id: "ie", countryCode: "IE", dialCode: "+353" },
  { id: "im", countryCode: "IM", dialCode: "+44-1624" },
  { id: "il", countryCode: "IL", dialCode: "+972" },
  { id: "it", countryCode: "IT", dialCode: "+39" },
  { id: "jm", countryCode: "JM", dialCode: "+1-876" },
  { id: "jp", countryCode: "JP", dialCode: "+81" },
  { id: "je", countryCode: "JE", dialCode: "+44-1534" },
  { id: "jo", countryCode: "JO", dialCode: "+962" },
  { id: "kz", countryCode: "KZ", dialCode: "+7" },
  { id: "ke", countryCode: "KE", dialCode: "+254" },
  { id: "ki", countryCode: "KI", dialCode: "+686" },
  { id: "xk", countryCode: "XK", dialCode: "+383" },
  { id: "kw", countryCode: "KW", dialCode: "+965" },
  { id: "kg", countryCode: "KG", dialCode: "+996" },
  { id: "la", countryCode: "LA", dialCode: "+856" },
  { id: "lv", countryCode: "LV", dialCode: "+371" },
  { id: "lb", countryCode: "LB", dialCode: "+961" },
  { id: "ls", countryCode: "LS", dialCode: "+266" },
  { id: "lr", countryCode: "LR", dialCode: "+231" },
  { id: "ly", countryCode: "LY", dialCode: "+218" },
  { id: "li", countryCode: "LI", dialCode: "+423" },
  { id: "lt", countryCode: "LT", dialCode: "+370" },
  { id: "lu", countryCode: "LU", dialCode: "+352" },
  { id: "mo", countryCode: "MO", dialCode: "+853" },
  { id: "mg", countryCode: "MG", dialCode: "+261" },
  { id: "mw", countryCode: "MW", dialCode: "+265" },
  { id: "my", countryCode: "MY", dialCode: "+60" },
  { id: "mv", countryCode: "MV", dialCode: "+960" },
  { id: "ml", countryCode: "ML", dialCode: "+223" },
  { id: "mt", countryCode: "MT", dialCode: "+356" },
  { id: "mh", countryCode: "MH", dialCode: "+692" },
  { id: "mq", countryCode: "MQ", dialCode: "+596" },
  { id: "mr", countryCode: "MR", dialCode: "+222" },
  { id: "mu", countryCode: "MU", dialCode: "+230" },
  { id: "yt", countryCode: "YT", dialCode: "+262" },
  { id: "mx", countryCode: "MX", dialCode: "+52", phonePlaceholder: "55 1234 5678", minDigits: 10 },
  { id: "fm", countryCode: "FM", dialCode: "+691" },
  { id: "md", countryCode: "MD", dialCode: "+373" },
  { id: "mc", countryCode: "MC", dialCode: "+377" },
  { id: "mn", countryCode: "MN", dialCode: "+976" },
  { id: "me", countryCode: "ME", dialCode: "+382" },
  { id: "ms", countryCode: "MS", dialCode: "+1-664" },
  { id: "ma", countryCode: "MA", dialCode: "+212" },
  { id: "mz", countryCode: "MZ", dialCode: "+258" },
  { id: "mm", countryCode: "MM", dialCode: "+95" },
  { id: "na", countryCode: "NA", dialCode: "+264" },
  { id: "nr", countryCode: "NR", dialCode: "+674" },
  { id: "np", countryCode: "NP", dialCode: "+977" },
  { id: "nl", countryCode: "NL", dialCode: "+31" },
  { id: "nc", countryCode: "NC", dialCode: "+687" },
  { id: "nz", countryCode: "NZ", dialCode: "+64" },
  { id: "ni", countryCode: "NI", dialCode: "+505" },
  { id: "ne", countryCode: "NE", dialCode: "+227" },
  { id: "ng", countryCode: "NG", dialCode: "+234" },
  { id: "nu", countryCode: "NU", dialCode: "+683" },
  { id: "nf", countryCode: "NF", dialCode: "+672" },
  { id: "kp", countryCode: "KP", dialCode: "+850" },
  { id: "mk", countryCode: "MK", dialCode: "+389" },
  { id: "mp", countryCode: "MP", dialCode: "+1-670" },
  { id: "no", countryCode: "NO", dialCode: "+47" },
  { id: "om", countryCode: "OM", dialCode: "+968" },
  { id: "pk", countryCode: "PK", dialCode: "+92" },
  { id: "pw", countryCode: "PW", dialCode: "+680" },
  { id: "ps", countryCode: "PS", dialCode: "+970" },
  { id: "pa", countryCode: "PA", dialCode: "+507" },
  { id: "pg", countryCode: "PG", dialCode: "+675" },
  { id: "py", countryCode: "PY", dialCode: "+595" },
  { id: "pe", countryCode: "PE", dialCode: "+51" },
  { id: "ph", countryCode: "PH", dialCode: "+63", phonePlaceholder: "999 123 4567", minDigits: 10, maxDigits: 10, localPrefixes: ["9"] },
  { id: "pl", countryCode: "PL", dialCode: "+48" },
  { id: "pt", countryCode: "PT", dialCode: "+351" },
  { id: "pr", countryCode: "PR", dialCode: "+1-787" },
  { id: "qa", countryCode: "QA", dialCode: "+974" },
  { id: "re", countryCode: "RE", dialCode: "+262" },
  { id: "ro", countryCode: "RO", dialCode: "+40" },
  { id: "ru", countryCode: "RU", dialCode: "+7" },
  { id: "rw", countryCode: "RW", dialCode: "+250" },
  { id: "bl", countryCode: "BL", dialCode: "+590" },
  { id: "sh", countryCode: "SH", dialCode: "+290" },
  { id: "kn", countryCode: "KN", dialCode: "+1-869" },
  { id: "lc", countryCode: "LC", dialCode: "+1-758" },
  { id: "mf", countryCode: "MF", dialCode: "+590" },
  { id: "pm", countryCode: "PM", dialCode: "+508" },
  { id: "vc", countryCode: "VC", dialCode: "+1-784" },
  { id: "ws", countryCode: "WS", dialCode: "+685" },
  { id: "sm", countryCode: "SM", dialCode: "+378" },
  { id: "st", countryCode: "ST", dialCode: "+239" },
  { id: "sa", countryCode: "SA", dialCode: "+966" },
  { id: "sn", countryCode: "SN", dialCode: "+221" },
  { id: "rs", countryCode: "RS", dialCode: "+381" },
  { id: "sc", countryCode: "SC", dialCode: "+248" },
  { id: "sl", countryCode: "SL", dialCode: "+232" },
  { id: "sg", countryCode: "SG", dialCode: "+65" },
  { id: "sx", countryCode: "SX", dialCode: "+1-721" },
  { id: "sk", countryCode: "SK", dialCode: "+421" },
  { id: "si", countryCode: "SI", dialCode: "+386" },
  { id: "sb", countryCode: "SB", dialCode: "+677" },
  { id: "so", countryCode: "SO", dialCode: "+252" },
  { id: "za", countryCode: "ZA", dialCode: "+27" },
  { id: "kr", countryCode: "KR", dialCode: "+82" },
  { id: "ss", countryCode: "SS", dialCode: "+211" },
  { id: "es", countryCode: "ES", dialCode: "+34", phonePlaceholder: "612 345 678", minDigits: 9 },
  { id: "lk", countryCode: "LK", dialCode: "+94" },
  { id: "sd", countryCode: "SD", dialCode: "+249" },
  { id: "sr", countryCode: "SR", dialCode: "+597" },
  { id: "sj", countryCode: "SJ", dialCode: "+47" },
  { id: "se", countryCode: "SE", dialCode: "+46" },
  { id: "ch", countryCode: "CH", dialCode: "+41" },
  { id: "sy", countryCode: "SY", dialCode: "+963" },
  { id: "tw", countryCode: "TW", dialCode: "+886" },
  { id: "tj", countryCode: "TJ", dialCode: "+992" },
  { id: "tz", countryCode: "TZ", dialCode: "+255" },
  { id: "th", countryCode: "TH", dialCode: "+66" },
  { id: "tl", countryCode: "TL", dialCode: "+670" },
  { id: "tg", countryCode: "TG", dialCode: "+228" },
  { id: "tk", countryCode: "TK", dialCode: "+690" },
  { id: "to", countryCode: "TO", dialCode: "+676" },
  { id: "tt", countryCode: "TT", dialCode: "+1-868" },
  { id: "tn", countryCode: "TN", dialCode: "+216" },
  { id: "tr", countryCode: "TR", dialCode: "+90" },
  { id: "tm", countryCode: "TM", dialCode: "+993" },
  { id: "tc", countryCode: "TC", dialCode: "+1-649" },
  { id: "tv", countryCode: "TV", dialCode: "+688" },
  { id: "vi", countryCode: "VI", dialCode: "+1-340" },
  { id: "ug", countryCode: "UG", dialCode: "+256" },
  { id: "ua", countryCode: "UA", dialCode: "+380" },
  { id: "ae", countryCode: "AE", dialCode: "+971" },
  { id: "gb", countryCode: "GB", dialCode: "+44" },
  { id: "us", countryCode: "US", dialCode: "+1", phonePlaceholder: "(555) 123-4567", minDigits: 10 },
  { id: "uy", countryCode: "UY", dialCode: "+598" },
  { id: "uz", countryCode: "UZ", dialCode: "+998" },
  { id: "vu", countryCode: "VU", dialCode: "+678" },
  { id: "va", countryCode: "VA", dialCode: "+39-06" },
  { id: "ve", countryCode: "VE", dialCode: "+58" },
  { id: "vn", countryCode: "VN", dialCode: "+84" },
  { id: "wf", countryCode: "WF", dialCode: "+681" },
  { id: "eh", countryCode: "EH", dialCode: "+212" },
  { id: "ye", countryCode: "YE", dialCode: "+967" },
  { id: "zm", countryCode: "ZM", dialCode: "+260" },
  { id: "zw", countryCode: "ZW", dialCode: "+263" }
];

export const PILLARS = [
  {
    id: "vision",
    labels: {
      en: "Family Vision, Values & Purpose",
      es: "Visión, Valores y Propósito Familiar"
    },
    shortLabels: {
      en: "Vision",
      es: "Visión"
    },
    descriptions: {
      en: "Shared direction, purpose, and values that shape decisions.",
      es: "Dirección, propósito y valores compartidos que orientan las decisiones."
    }
  },
  {
    id: "constitution",
    labels: {
      en: "Family Constitution / Protocol",
      es: "Constitución / Protocolo Familiar"
    },
    shortLabels: {
      en: "Protocol",
      es: "Protocolo"
    },
    descriptions: {
      en: "Agreed rules for how the family relates to the business.",
      es: "Reglas acordadas sobre cómo la familia se relaciona con la empresa."
    }
  },
  {
    id: "family-governance",
    labels: {
      en: "Family Decision-Making Forums",
      es: "Espacios de Decisión Familiar"
    },
    shortLabels: {
      en: "Family forums",
      es: "Espacios familiares"
    },
    descriptions: {
      en: "Spaces for family dialogue, decisions, and follow-up.",
      es: "Espacios para conversar, decidir y dar seguimiento a temas familiares."
    }
  },
  {
    id: "ownership",
    labels: {
      en: "Ownership Decisions",
      es: "Decisiones de Propiedad"
    },
    shortLabels: {
      en: "Ownership",
      es: "Propiedad"
    },
    descriptions: {
      en: "Rights, responsibilities, information, and shareholder continuity.",
      es: "Derechos, responsabilidades, información y continuidad accionarial."
    }
  },
  {
    id: "board",
    labels: {
      en: "Board Roles & Decisions",
      es: "Roles y Decisiones del Consejo"
    },
    shortLabels: {
      en: "Board",
      es: "Consejo"
    },
    descriptions: {
      en: "Formal oversight of strategy, risk, leadership, and decisions.",
      es: "Supervisión formal de estrategia, riesgos, liderazgo y acuerdos."
    }
  },
  {
    id: "management",
    labels: {
      en: "Management Roles & Structure",
      es: "Roles de Gestión y Estructura"
    },
    shortLabels: {
      en: "Management",
      es: "Gestión"
    },
    descriptions: {
      en: "Clear roles, authority, performance, and succession practices.",
      es: "Roles claros, autoridad, desempeño y prácticas de sucesión."
    }
  },
  {
    id: "next-generation",
    labels: {
      en: "Next Generation Development",
      es: "Desarrollo de la Siguiente Generación"
    },
    shortLabels: {
      en: "Next gen",
      es: "Siguiente gen."
    },
    descriptions: {
      en: "Preparation of future owners, leaders, and stewards.",
      es: "Preparación de futuros propietarios, líderes y custodios del legado."
    }
  },
  {
    id: "harmony",
    labels: {
      en: "Family Harmony, Conflict & Legacy",
      es: "Armonía Familiar, Conflicto y Legado"
    },
    shortLabels: {
      en: "Harmony",
      es: "Armonía"
    },
    descriptions: {
      en: "Trust, difficult conversations, shared story, and long-term legacy.",
      es: "Confianza, conversaciones difíciles, historia compartida y legado."
    }
  }
];

const fullEn = {
  vision: [
    "Our family has clearly defined values that guide business decisions.",
    "We share a long-term vision for the future of the family business.",
    "There is clarity about the purpose of the business beyond generating profits.",
    "Family values are reflected in how decisions are made.",
    "The family has discussed its long-term intent for the business.",
    "We agree on what should remain constant as the business evolves."
  ],
  constitution: [
    "We have clear and documented family rules.",
    "Rules were agreed on collaboratively.",
    "There are policies for entry and exit of family members.",
    "There are clear criteria for leadership roles.",
    "The family protocol is reviewed periodically.",
    "Family rules are accessible and understood by relevant family members."
  ],
  "family-governance": [
    "There is an active Family Council.",
    "Meetings have agendas and follow-up.",
    "There is multigenerational representation.",
    "Family and business topics are clearly separated.",
    "Decisions are documented.",
    "Family meetings create enough space for listening and participation."
  ],
  ownership: [
    "Shareholders receive clear and timely information.",
    "There are rules for share transfers.",
    "Formal shareholder meetings are held.",
    "Shareholder rights and responsibilities are clear.",
    "There is an orderly liquidity mechanism.",
    "Owners have a shared view of dividends, reinvestment, and growth expectations."
  ],
  board: [
    "There is a formal Board of Directors.",
    "The board includes independent directors.",
    "The board evaluates the CEO regularly.",
    "Risk and long-term strategy are reviewed.",
    "Board resolutions are followed up.",
    "The board has clear boundaries between oversight and management."
  ],
  management: [
    "Roles are assigned based on merit.",
    "There are job descriptions and KPIs.",
    "There is a clear plan for leadership succession.",
    "The family respects management authority.",
    "Management is comparable to non-family firms.",
    "Performance conversations are handled with clear criteria rather than family status."
  ],
  "next-generation": [
    "The next generation receives structured development.",
    "External experience is encouraged before joining.",
    "Next generation members participate in strategic discussions.",
    "There are mentoring programs.",
    "There is clarity about their future role as owners or leaders.",
    "Next generation members understand the responsibilities that come with ownership.",
    "There are learning spaces where the next generation can ask questions safely."
  ],
  harmony: [
    "Conflicts are managed constructively.",
    "We can openly discuss difficult topics.",
    "There is trust among family members.",
    "The family legacy and story are shared.",
    "The family has reflected on the kind of legacy it wants to leave.",
    "There are agreed ways to address disagreements before they become personal.",
    "The family actively protects relationships while making business decisions."
  ]
};

const fullEs = {
  vision: [
    "Nuestra familia tiene valores claramente definidos que guían las decisiones del negocio.",
    "Compartimos una visión de largo plazo sobre el futuro de la empresa familiar.",
    "Existe claridad sobre el propósito de la empresa más allá de generar utilidades.",
    "Los valores familiares se reflejan en la forma en que se toman decisiones.",
    "La familia ha discutido su intención de largo plazo con el negocio.",
    "Estamos de acuerdo sobre aquello que debe permanecer constante mientras la empresa evoluciona."
  ],
  constitution: [
    "Contamos con reglas familiares claras y documentadas.",
    "Las reglas fueron acordadas de forma participativa.",
    "Existen políticas de entrada y salida de familiares.",
    "Hay criterios claros para ocupar posiciones de liderazgo.",
    "El protocolo familiar se revisa periódicamente.",
    "Las reglas familiares son accesibles y comprendidas por los familiares relevantes."
  ],
  "family-governance": [
    "Existe un Consejo de Familia activo.",
    "Las reuniones tienen agenda y seguimiento.",
    "Hay representación multigeneracional.",
    "Los temas familiares y empresariales están claramente separados.",
    "Las decisiones se documentan.",
    "Las reuniones familiares crean espacio suficiente para escuchar y participar."
  ],
  ownership: [
    "Los accionistas reciben información clara y oportuna.",
    "Existen reglas sobre transferencia de acciones.",
    "Se celebran asambleas formales de accionistas.",
    "Están claros los derechos y responsabilidades del accionista.",
    "Existe un mecanismo de liquidez ordenado.",
    "Los propietarios comparten una visión sobre dividendos, reinversión y expectativas de crecimiento."
  ],
  board: [
    "Existe un Consejo de Administración formal.",
    "El consejo incluye consejeros independientes.",
    "El consejo evalúa al CEO periódicamente.",
    "Se revisan riesgos y estrategia de largo plazo.",
    "Se da seguimiento a los acuerdos del consejo.",
    "El consejo tiene límites claros entre supervisión y gestión."
  ],
  management: [
    "Los roles se asignan con base en mérito.",
    "Existen descripciones de puesto y KPIs.",
    "Hay un plan claro para la sucesión del liderazgo.",
    "La familia respeta la autoridad de la dirección.",
    "La gestión es comparable a empresas no familiares.",
    "Las conversaciones de desempeño se manejan con criterios claros y no por estatus familiar."
  ],
  "next-generation": [
    "La siguiente generación recibe formación estructurada.",
    "Se fomenta experiencia externa antes de integrarse.",
    "Los miembros de la siguiente generación participan en conversaciones estratégicas.",
    "Existen programas de mentoría.",
    "Hay claridad sobre su futuro rol como propietarios o líderes.",
    "La siguiente generación entiende las responsabilidades que acompañan a la propiedad.",
    "Existen espacios de aprendizaje donde la siguiente generación puede hacer preguntas con confianza."
  ],
  harmony: [
    "Los conflictos se gestionan de forma constructiva.",
    "Podemos hablar de temas difíciles abiertamente.",
    "Existe confianza entre los miembros de la familia.",
    "El legado y la historia familiar se comparten.",
    "La familia ha reflexionado sobre el tipo de legado que quiere dejar.",
    "Existen formas acordadas para abordar desacuerdos antes de que se vuelvan personales.",
    "La familia cuida activamente las relaciones mientras toma decisiones empresariales."
  ]
};

const makeFullQuestions = (language, source) =>
  PILLARS.flatMap((pillar) =>
    source[pillar.id].map((text, index) => ({
      id: `${language}-full-${pillar.id}-${index + 1}`,
      mode: "full",
      pillarId: pillar.id,
      number: index + 1,
      text
    }))
  );

export const FULL_QUESTIONS = {
  en: makeFullQuestions("en", fullEn),
  es: makeFullQuestions("es", fullEs)
};

export const STAGES = [
  {
    id: "foundational",
    min: 0,
    max: 25,
    level: {
      en: "Level 1",
      es: "Nivel 1"
    },
    labels: {
      en: "Foundational",
      es: "Fundacional"
    },
    descriptions: {
      en: "How the family makes decisions is mostly informal and depends on key individuals. Many rules remain understood rather than shared.",
      es: "La forma en que la familia toma decisiones es principalmente informal y depende de personas clave. Muchas reglas se sobreentienden en lugar de compartirse."
    },
    reflections: {
      en: "This result shows a family business where trust, habit, and individual leadership still carry many decisions. That is common when relationships are close. This is a useful moment to name what should stay informal and what now needs to be clear to everyone.",
      es: "Este resultado muestra una empresa familiar donde la confianza, la costumbre y el liderazgo individual todavía sostienen muchas decisiones. Es algo común cuando las relaciones son cercanas. Este es un buen momento para definir qué puede seguir siendo informal y qué necesita quedar claro para todos."
    },
    whatCanDo: {
      en: [
        "Clarify shared values and purpose",
        "Create regular family discussion spaces",
        "Begin documenting basic rules"
      ],
      es: [
        "Clarificar valores y propósito compartido",
        "Crear espacios regulares de conversación familiar",
        "Empezar a documentar reglas básicas"
      ]
    }
  },
  {
    id: "emerging",
    min: 26,
    max: 50,
    level: {
      en: "Level 2",
      es: "Nivel 2"
    },
    labels: {
      en: "Emerging",
      es: "En Desarrollo"
    },
    descriptions: {
      en: "Early structures exist, but implementation is inconsistent. The family recognizes the need for more clarity and structure.",
      es: "Existen estructuras iniciales, pero se aplican de manera inconsistente. La familia reconoce que necesita mayor claridad y estructura."
    },
    reflections: {
      en: "This result suggests that the family has already begun to create structure, even if some practices still depend on timing, personalities, or informal agreements. The opportunity now is to make those early agreements easier to understand, repeat, and sustain across generations.",
      es: "Este resultado sugiere que la familia ya empezó a crear estructura, aunque algunas prácticas todavía dependen del momento, de las personas o de acuerdos informales. La oportunidad ahora es hacer que esos acuerdos iniciales sean más fáciles de entender, repetir y sostener entre generaciones."
    },
    whatCanDo: {
      en: [
        "Formalize existing rules",
        "Clarify roles and expectations",
        "Begin structured succession discussions"
      ],
      es: [
        "Formalizar reglas ya existentes",
        "Clarificar roles y expectativas",
        "Iniciar conversaciones estructuradas de sucesión"
      ]
    }
  },
  {
    id: "established",
    min: 51,
    max: 75,
    level: {
      en: "Level 3",
      es: "Nivel 3"
    },
    labels: {
      en: "Established",
      es: "Consolidado"
    },
    descriptions: {
      en: "Roles and decision-making practices are clearly defined and used consistently. Family members, owners, and business leaders share a clearer understanding of how to work together.",
      es: "Los roles y las formas de tomar decisiones están claramente definidos y se usan de manera consistente. Familiares, propietarios y líderes del negocio comparten una idea más clara de cómo trabajar juntos."
    },
    reflections: {
      en: "This result reflects a family business with important ways of working already in place. The next conversation is less about starting from zero and more about making those practices work well when decisions involve more people or carry greater consequences.",
      es: "Este resultado refleja una empresa familiar con formas importantes de trabajar ya establecidas. La siguiente conversación no consiste en empezar desde cero, sino en hacer que esas prácticas funcionen bien cuando las decisiones involucran a más personas o tienen mayores consecuencias."
    },
    whatCanDo: {
      en: [
        "Strengthen how decision-making groups work",
        "Bring clearer roles and structure to management",
        "Prepare concrete generational transitions"
      ],
      es: [
        "Fortalecer cómo trabajan los grupos que toman decisiones",
        "Dar mayor claridad y estructura a los roles de gestión",
        "Preparar transiciones generacionales concretas"
      ]
    }
  },
  {
    id: "advanced",
    min: 76,
    max: 100,
    level: {
      en: "Level 4",
      es: "Nivel 4"
    },
    labels: {
      en: "Advanced",
      es: "Avanzado"
    },
    descriptions: {
      en: "The family and the business have clear, dependable ways of working that support continuity and generational transitions.",
      es: "La familia y la empresa tienen formas claras y confiables de trabajar que apoyan la continuidad y las transiciones generacionales."
    },
    reflections: {
      en: "This result suggests that the family has strong practices for continuity and shared decisions. The work now is to keep those practices useful and connected to the family's purpose as the business, ownership group, and next generation evolve.",
      es: "Este resultado sugiere que la familia tiene prácticas sólidas para la continuidad y las decisiones compartidas. El trabajo ahora es mantenerlas útiles y conectadas con el propósito familiar mientras evolucionan la empresa, la propiedad y la siguiente generación."
    },
    whatCanDo: {
      en: [
        "Keep decision-making practices useful over time",
        "Protect cohesion and legacy",
        "Review structures as the family or strategy evolves"
      ],
      es: [
        "Mantener útiles las formas de tomar decisiones a lo largo del tiempo",
        "Cuidar cohesión y legado",
        "Revisar estructuras ante cambios familiares o estratégicos"
      ]
    }
  }
];

export const SUPPORT_MESSAGE = {
  en: "Gilbert helps families turn a self-assessment into better conversations, clearer decisions, and practical next steps.",
  es: "Gilbert ayuda a las familias a convertir la autoevaluación en mejores conversaciones, decisiones más claras y siguientes pasos prácticos."
};

export const COPY = {
  en: {
    appName: "Family Enterprise Self-Assessment",
    brandName: "Gilbert Devlyn",
    brandLine: "Family Enterprise Advisory",
    sideQuote:
      "Strong families build businesses. Clear agreements help sustain them.",
    nav: {
      home: "Home",
      about: "About",
      services: "Services",
      assessment: "Self-Assessment"
    },
    booking: {
      startAssessment: "Start the Self-Assessment",
      takeAssessment: "Take the Self-Assessment",
      getGovernanceScore: "See Where Things Stand",
      bookStrategyCall: "Request a Follow-up",
      modalLabel: "Follow-up Request",
      modalTitle: "Request a Follow-up with Gilbert Devlyn",
      modalIntro:
        "Choose a time to speak with Gilbert about what your result is showing and where his guidance could help the family move from insight to action.",
      modalIntroByCategory: {
        low:
          "Your result points to areas where more clarity and structure may be helpful. Gilbert can help identify what should be addressed first, who needs to be involved, and how to start without creating unnecessary tension.",
        mid:
          "Your result shows useful foundations with room to make roles and decisions clearer. Gilbert can help identify the few changes that would make the biggest practical difference.",
        high:
          "Your result suggests strong ways of working. Gilbert can help test continuity, succession, and whether owners share the same expectations as the family evolves."
      },
      categoryLabel: "Category",
      categoryNames: {
        low: "Low",
        mid: "Mid",
        high: "High"
      },
      flaggedLabel: "Focus areas",
      schedulerTitle: "Follow-up with Gilbert Devlyn",
      close: "Close booking modal",
      scoreCtas: {
        low: "Request Gilbert to contact me",
        mid: "Request Gilbert to contact me",
        high: "Request Gilbert to contact me"
      }
    },
    home: {
      title: "Gilbert Devlyn Family Enterprise Advisory",
      subtitle:
        "Helping business families make important decisions about ownership, succession and next-generation roles before misunderstandings become conflict.",
      body:
        "Gilbert Devlyn brings lived experience as a family member, owner, executive, and board participant inside a multigenerational enterprise. He helps families name the conversations that are being avoided, organize who needs to be involved, and move toward agreements that can hold under pressure.",
      gilbertTitle: "Who is Gilbert?",
      gilbertBody:
        "Gilbert Devlyn brings firsthand experience from within a leading third generation family business group. As a family member, owner, and board member, he has been directly involved in decisions that shape continuity across generations.",
      video: {
        label: "Gilbert video",
        title: "Reserved for Gilbert's message",
        body:
          "This space is reserved for Gilbert's own short homepage video. Until the final clip is ready, the page uses this as a visual placeholder rather than showing a third-party video.",
        duration: "45 sec video",
        embedUrl: ""
      },
      primaryCta: "Learn about Gilbert",
      heroCta: "Start a conversation",
      secondaryCta: "Begin the Self-Assessment",
      valueTitle: "Why the advisory matters",
      valueBody:
        "Family business decisions carry more than operational weight. They affect trust, continuity, ownership, and future roles. Gilbert gives families a neutral space to separate the issues, get on the same page about priorities, and turn sensitive conversations into workable agreements.",
      businessTitle: "Separate. Structure. Sustain.",
      businessBody:
        "The work sits at the intersection of ownership, leadership, board decisions, and family relationships. The goal is not more theory. It is a clearer path for decisions the family actually has to make.",
      frameworkIntro:
        "A neutral space to untangle family, ownership, and business — then turn conversations into agreements that last.",
      helpingTitle: "Families usually reach out when",
      helpingIntro:
        "Things often work well for years. Then a transition, a disagreement or an important decision exposes questions the family has never needed to answer before.",
      helpingItems: [
        "A founder or senior generation wants continuity but the family has not agreed on what comes next",
        "The next generation wants to participate but roles, expectations, or timing are unclear",
        "Shareholders need clearer rights, responsibilities, information flow, and decision rules",
        "A board, family council, or ownership group needs a better way to handle sensitive topics"
      ],
      challengeTitle: "The real work is not only how decisions are made. It is the conversation behind it.",
      challengeIntro:
        "Ownership, succession, board roles, family councils, employment expectations, wealth, and next-generation participation each carry emotion and business consequences. Gilbert helps families separate the issues, decide who belongs in the room, and move from tension to agreements.",
      challengeItems: [
        {
          title: "Ownership",
          body:
            "Clarify rights, responsibilities, information flow, and how owners make decisions together."
        },
        {
          title: "Succession",
          body:
            "Move from general concern to practical conversations about readiness, timing, criteria, and trust."
        },
        {
          title: "How decisions are made",
          body:
            "Clarify the roles of the family, owners, board and management so everyone understands who decides what."
        },
        {
          title: "Next-generation roles",
          body:
            "Create a responsible path for learning, participation, voice, and future leadership."
        },
        {
          title: "Family decision-making",
          body:
            "Agree on who should be involved, how disagreements will be handled and how decisions will continue moving forward."
        },
        {
          title: "Sensitive conversations",
          body:
            "Bring difficult topics into a structured setting before silence turns into mistrust."
        }
      ],
      evidence: {
        label: "Why this matters",
        title: "Things can work well for years, until an important decision becomes harder than expected.",
        intro:
          "It is common for roles, expectations and ways of making decisions to remain informal. The difficulty usually appears when the family grows, leadership changes or people have different ideas about what should happen next.",
        stats: [
          {
            title: "Decisions become harder",
            label:
              "A decision that used to feel simple now involves more people, more expectations and more consequences."
          },
          {
            title: "Roles remain unspoken",
            label:
              "Family members may be working from different assumptions about responsibility, ownership or the future."
          },
          {
            title: "Conversations get postponed",
            label:
              "Important topics are often delayed because no one is sure how to begin without creating tension."
          }
        ],
        comparisonHeaders: {
          informal: "Informal family-business pattern",
          advisory: "With a clearer way of working"
        },
        comparisons: [
          {
            theme: "Succession",
            informal:
              "Succession is recognized as critical, but planning often stays behind daily business pressure.",
            informalShort: "Planning stays behind daily pressure, even though it's seen as critical.",
            advisory:
              "Leadership transition becomes a recurring agenda: readiness, role criteria, timing, and ownership expectations are made visible.",
            advisoryShort: "Readiness, criteria, and timing become a recurring agenda item."
          },
          {
            theme: "Shared understanding",
            informal:
              "Values and purpose may be understood by senior leaders but remain unwritten or weakly communicated across generations.",
            informalShort: "Values are understood by leaders but rarely written down.",
            advisory:
              "The family documents shared principles, who decides what, and communication rhythms so shared understanding is not dependent on memory or hierarchy.",
            advisoryShort: "Shared principles and who decides what are documented for everyone."
          },
          {
            theme: "Conflict",
            informal:
              "Disagreement is handled personally, late, or through informal authority, which can turn normal tension into distrust.",
            informalShort: "Disagreement is handled late, personally, or by informal authority.",
            advisory:
              "Families define how dissent is raised, who decides, and how sensitive topics move forward without exposing individual responses.",
            advisoryShort: "The family agrees how disagreement is raised and who decides."
          },
          {
            theme: "Decision speed",
            informal:
              "Organizational, leadership, and decision-making challenges can slow down agility even when the business has strong market instincts.",
            informalShort: "Family issues blend into daily operations and slow decisions down.",
            advisory:
              "Clear roles help the family separate ownership, board, executive, and next-generation conversations.",
            advisoryShort: "Clear roles separate ownership, board, and family conversations."
          }
        ],
        sources: [
          {
            label: "PwC 11th Global Family Business Survey, 2023",
            url:
              "https://www.pwc.com/gx/en/services/family-business/family-business-survey/building-family-member-trust.html"
          },
          {
            label: "Deloitte Private succession planning survey, 2026",
            url:
              "https://www.deloitte.com/us/en/about/press-room/deloitte-private-survey-reveals-family-businesses-are-facing-a-succession-paradox.html"
          },
          {
            label: "PwC US Family Business Survey, 2025",
            url:
              "https://www.pwc.com/us/en/services/audit-assurance/private-company-services/library/family-business-survey.html"
          },
          {
            label: "EY and University of St.Gallen Global 500 Family Business Index, 2025",
            url:
              "https://www.ey.com/en_ro/newsroom/2025/03/largest-500-family-businesses-amount-to-world-s-third-largest-ec"
          },
          {
            label: "KPMG Global Family Business Report, 2025",
            url:
              "https://kpmg.com/kpmg-us/content/dam/kpmg/pdf/2025/global-family-business-report-executive-summary-new.pdf"
          },
          {
            label: "KPMG and STEP Global Family Business Report, 2024",
            url: "https://hub.kpmg.de/en/global-family-business-report"
          },
          {
            label: "STEP Project Global Consortium family business reports",
            url: "https://www.spgcfb.org/en/reports"
          },
          {
            label: "Family Enterprise Foundation research hub",
            url:
              "https://familyenterprisefoundation.org/resources/knowledge-hub/research-and-newsroom/categories/research/"
          },
          {
            label: "IMD Global Family Business Center research and insights",
            url: "https://www.imd.org/centers/gfbc/imd-family-business-center/"
          },
          {
            label: "Family Firm Institute resources and research",
            url: "https://www.ffi.org/"
          },
          {
            label: "Columbia Business School Global Family Enterprise Program",
            url: "https://business.columbia.edu/globalfamilyenterprise"
          },
          {
            label: "Cornell Smith Family Business Initiative",
            url: "https://business.cornell.edu/centers/smith/"
          }
        ]
      },
      note:
        "The self-assessment is a starting point for better conversations, not a judgment of the family or the business.",
      approachTitle: "How Gilbert works with families",
      approachSubtitle:
        "Every engagement begins by understanding how the family actually works today.",
      approachBlocks: [
        {
          title: "Structure before solutions",
          body:
            "Most questions about how a family works together are conversations waiting to happen. The work begins by naming what is already present and giving it enough structure to move forward."
        },
        {
          title: "Grounded neutrality",
          body:
            "Neutrality grounded in lived experience as a family member, owner, and board member."
        },
        {
          title: "Clarity built for your context",
          body:
            "No one-size-fits-all model - the work starts with each family's reality."
        },
        {
          title: "Follow-through that sustains decisions",
          body:
            "Clear roles, responsibilities, and rhythms so decisions endure."
        }
      ],
      toolTitle: "The Self-Assessment provides a practical starting point for a more useful conversation.",
      toolParagraphs: [
        "It helps a family see where roles, expectations, decisions, and succession conversations may need more structure.",
        "When used at the right moment, it gives Gilbert and the family a shared language for the first advisory conversation."
      ],
      toolCta: "See how the Self-Assessment works",
      ctaTitle: "Ready to make the next decision clearer?",
      ctaBody:
        "When roles, expectations or important decisions remain unclear, the right conversation can create a practical way forward.",
      ctaButton: "Start a conversation",
      ctaNote: "The self-assessment is available when the family is ready for a structured first read."
    },
    services: {
      label: "Services",
      title: "The right support depends on the decision your family needs to make.",
      intro:
        "Some families need help with one important decision. Others need ongoing support as roles, ownership or leadership change.",
      promiseTitle: "Support shaped around the decision in front of the family",
      promiseBody:
        "Families rarely need more complexity. They need the right people in the right conversation, with enough structure to make a decision and move forward. Gilbert starts by understanding how the family works today and which conversation has become difficult to have.",
      previewLabel: "How Gilbert Helps",
      previewTitle: "Four ways to work with Gilbert",
      previewBody:
        "Support can take the form of a focused project, board guidance, executive coaching, or a private 1:1 conversation depending on what the family needs to decide.",
      previewCta: "Explore services",
      forLabel: "Who it is for",
      helpsLabel: "What Gilbert helps with",
      outcomeLabel: "Likely outcome",
      items: [
        {
          title: "Consulting projects",
          summary:
            "Focused projects that help families clarify how decisions are made, prepare for succession and agree on ownership roles and expectations.",
          forWhom:
            "Families, ownership groups, family councils, or leadership teams facing a specific transition, unresolved topic, or area that has not been clearly defined yet.",
          helpsWith:
            "Clarifying the issue, deciding who needs to be involved, preparing and facilitating the right conversations, and turning agreements into practical next steps.",
          outcome:
            "A clearer decision path, documented agreements or priorities, and an agreed way to continue the work after the project."
        },
        {
          title: "Board Service & Governance Advisory",
          previewSummary: "Support to create or strengthen a board, clarify how it works, or contribute directly as an independent board or committee member.",
          summary:
            "Support for family enterprises creating a board, strengthening an existing board, or seeking an independent contribution at board or committee level.",
          forWhom:
            "Family-owned businesses creating a board for the first time, established family enterprises strengthening how the board works, and organisations seeking an independent non-executive board or committee member.",
          helpsWith:
            "Clarifying the board’s purpose, responsibilities and ways of working; agreeing on who decides what; identifying the right mix of family and independent directors; and contributing directly as a non-executive board or committee member when appropriate.",
          outcome:
            "A more effective board with clearer responsibilities, stronger decision-making and an independent perspective that understands both the business and the family context."
        },
        {
          title: "Executive coaching",
          summary:
            "Coaching for leaders navigating changing responsibilities, family expectations and important business decisions.",
          forWhom:
            "Family executives, non-family executives, successors, or senior leaders who need to lead with clarity while navigating family dynamics.",
          helpsWith:
            "Thinking through difficult decisions, preparing for sensitive conversations, clarifying responsibilities and turning tension into clearer choices.",
          outcome:
            "A leader who can act with more clarity, communicate with more discipline, and handle family-business pressure without avoiding the hard conversation."
        },
        {
          title: "1:1 Advisory",
          summary:
            "A private space for owners, next-generation members, founders, or family leaders to think through a difficult role, decision or conversation.",
          forWhom:
            "Individuals navigating a sensitive family-business role or preparing for a conversation that affects ownership, succession, leadership, or family trust.",
          helpsWith:
            "Thinking through the situation, separating personal and business concerns, preparing the conversation, and deciding what should happen next.",
          outcome:
            "A clearer personal position, a more considered next move, and a better chance that the conversation happens with structure instead of impulse."
        }
      ],
      ctaTitle: "Start with the decision that needs attention now.",
      ctaBody:
        "Some families begin with the self-assessment. Others begin with a conversation about a specific transition, role or decision.",
      diagnosticCta: "Start a conversation",
      aboutCta: "Begin the Self-Assessment"
    },
    about: {
      label: "About Gilbert",
      title: "Experience from inside the family business, helping other families move forward with clarity.",
      bio: [
        "Gilbert Devlyn comes from a multigenerational family business and has worked where family, ownership, and business decisions overlap: a cousin consortium, a board, a family council, shareholders, executives, and several groups responsible for different decisions.",
        "Across that system, different generations, perspectives, and life stages coexist: founders, siblings, cousins, and next-generation members looking to step in and take a role. Each brings valid expectations, but not always the same timeline or view of the future.",
        "As a family member, owner, executive, and board participant, he experienced what it takes to work in that environment, where tensions are real, expectations are often unspoken, and progress depends on how conversations are handled.",
        "He chaired the Family Council and the NextGen Committee, and spent over 12 years working inside the family business, most recently as Human Capital Director. Working across family, ownership, and leadership roles, he learned how to separate overlapping issues, make difficult conversations more productive and help families reach decisions that move things forward.",
        "Gilbert combines direct experience in a multigenerational family business with an understanding of the questions facing next-generation family members as they prepare to participate, lead or take on ownership responsibilities. This allows Gilbert to work across generations with credibility and help turn differences in perspective into practical progress.",
        "Today, he works with other business families facing similar dynamics, helping them make sense of what is already happening, bring the right conversations to the surface, and move forward with clarity."
      ],
      quickFacts: [
        {
          value: "12+",
          label: "years inside family enterprise"
        },
        {
          value: "Four Perspectives",
          label: "family member • owner • executive • board participant"
        },
        {
          value: "Prepared Across Disciplines",
          label: "FAMILY BUSINESS · FAMILY WEALTH · COACHING · BOARD GOVERNANCE"
        }
      ],
      video: {
        label: "",
        title: "A deeper introduction",
        body:
          "This space is prepared for a longer video where Gilbert can explain his background, lived experience, and how he works with business families before any self-assessment is introduced.",
        duration: "2 min video",
        embedUrl: ""
      },
      contextLabel: "Why lived experience matters",
      contextTitle: "He understands the family business from more than one perspective",
      contextBody:
        "Most families already know how to run the business. The harder part is agreeing on ownership, roles, expectations and the conversations that shape the future. Those questions are normal, but postponing them can make later decisions much harder.",
      contextItems: [
        {
          title: "Credibility across generations",
          body:
            "Gilbert can relate to senior generations protecting continuity and to next-generation members trying to find a responsible role."
        },
        {
          title: "Practical, not theoretical",
          body:
            "He knows the difference between formal structures that exist on paper and ways of working that families actually trust and use."
        },
        {
          title: "A structured space for difficult conversations",
          body:
            "He helps families slow the conversation down, separate the issues, and keep sensitive topics specific enough to move forward."
        },
        {
          title: "Trust and discretion from the outset",
          body:
            "He handles sensitive conversations with care and makes expectations about privacy clear from the beginning."
        }
      ],
      educationTitle: "Education & Certifications",
      educationItems: [
        "International MBA (IMBA), University of Denver, with a focus on Family Business Consulting",
        "Bachelor's degrees in Management and Marketing",
        "Certificate in Family Business Advising — Family Firm Institute",
        "Certificate in Family Wealth Advising — Family Firm Institute",
        "Certified Professional Coach — iPEC",
        "Board Director Diploma — IMD"
      ],
      focusTitle: "Areas of Focus",
      focusItems: [
        "Helping family councils hold productive conversations",
        "Bringing clearer roles and ways of working to the family",
        "Passing ownership and responsibility to the next generation",
        "Preparing next-generation family members for future roles",
        "Clarifying the board's role and how decisions are made",
        "Coaching for difficult conversations",
        "Coaching and mentorship for next-generation members stepping into ownership and leadership roles"
      ],
      testimonialsTitle: "Discreet by design",
      testimonialsSubtitle:
        "Much of this work involves private family conversations and sensitive ownership decisions. Client relationships are handled discreetly, and references are shared directly when appropriate.",
      situationsTitle: "Where this work helps",
      situations: [
        "A family deciding how next-generation members will step into ownership and leadership.",
        "Siblings aligning after a founder transition",
        "Shareholders clarifying roles, rights, and expectations",
        "Family councils that exist but are not being fully used",
        "A board or leadership group trying to separate family concerns from business decisions",
        "Important decisions that feel stuck because the conversation has not happened"
      ],
      toolTitle: "The Self-Assessment is one simple place to begin",
      toolIntro:
        "A short self-assessment can give the family and Gilbert a shared starting point before the first conversation.",
      toolSteps: [
        {
          title: "Complete the Self-Assessment",
          body:
            "About 10 minutes, on your own, at your own pace. You can pause and pick up exactly where you left off."
        },
        {
          title: "Receive your individual report",
          body:
            "A summary of your results, organized by topic, showing your strongest areas and where more clarity may help."
        },
        {
          title: "Decide whether you would like a follow-up conversation",
          body:
            "If you choose, Gilbert can contact you to review the results and discuss possible next steps. There is no obligation."
        }
      ],
      toolReceiveBody:
        "You will receive a written summary of your own results and a private link to invite other family members. Each person receives their own results; Gilbert receives the combined view to help compare perspectives.",
      toolCta: "Start the Self-Assessment"
    },
    cookieConsent: {
      title: "We value your privacy",
      body:
        "This site uses cookies to save self-assessment progress and keep comparison links working.",
      privacyLink: "Read the Privacy Policy",
      accept: "Accept cookies",
      reject: "Reject"
    },
    privacyPolicy: {
      label: "Privacy",
      title: "Privacy Policy",
      updated: "Last updated: June 16, 2026",
      close: "Close",
      intro: [
        "Gilbert Devlyn Advisory",
        "This Privacy Policy explains how the website, self-assessment, comparison links, and related communications collect, use, store, and share information. For privacy questions, contact info@gilbertdevlyn.com."
      ],
      sections: [
        {
          title: "1. Who We Are",
          body: [
            "This Privacy Policy explains how Gilbert Devlyn Advisory (\"we,\" \"us,\" or \"our\") collects, uses, stores, and shares information when a visitor uses gilbertdevlyn.com, completes the Family Enterprise Self-Assessment, requests follow-up, or communicates with us.",
            "Legal entity: Gilbert Devlyn Advisory.",
            "Business address: Available upon request.",
            "Contact email: info@gilbertdevlyn.com."
          ]
        },
        {
          title: "2. Scope of This Policy",
          body:
            "This policy applies to the website, self-assessment experience, contact requests, comparison links, and related communications. It does not apply to third-party websites or services that we do not control."
        },
        {
          title: "3. Information We Collect",
          body:
            "We collect information you provide directly, information generated by your use of the self-assessment, and limited technical information needed to operate the website.",
          table: {
            headers: ["Category", "Examples", "Purpose"],
            rows: [
              [
                "Contact and profile information",
                "Name, email address, phone number, country, relationship to the family business, generation, and role details.",
                "To connect your result to you, provide follow-up, understand context, and support comparison features."
              ],
              [
                "Assessment responses and results",
                "Question responses, unknown responses, score per topic, overall result, summary of where things stand, and report outputs.",
                "To generate your self-assessment result, help identify priority areas, and support advisory conversations."
              ],
              [
                "Comparison and invitation information",
                "Group or invite identifiers, invitee email address, participant role/generation labels, and comparison status.",
                "To allow multiple family members to compare perspectives without showing individual question-by-question responses."
              ],
              [
                "Follow-up information",
                "Contact-request status, booking status, and messages or notes you choose to share.",
                "To respond to your request and coordinate advisory conversations."
              ],
              [
                "Technical and cookie information",
                "Cookie consent status, saved assessment draft, latest result, browser storage records, and basic server logs if enabled.",
                "To remember progress, keep the assessment usable, and maintain website security and reliability."
              ]
            ]
          }
        },
        {
          title: "4. How We Collect Information",
          body: [
            "Directly from you when you complete the profile intake, answer assessment questions, request follow-up, or submit an invitation.",
            "Automatically through cookies and browser storage used to save progress, remember consent, and connect results to the comparison flow.",
            "Through service providers we use or may use to host the website, store assessment results, manage email, send notifications, operate Airtable or similar databases, and schedule follow-up conversations."
          ]
        },
        {
          title: "5. How We Use Information",
          body: [
            "Provide and improve the Family Enterprise Self-Assessment.",
            "Generate results, dimension scores, comparison views, and downloadable reports.",
            "Respond to follow-up requests and coordinate advisory conversations.",
            "Send assessment-related communications, invitations, reminders, or completion summaries if email automation is enabled.",
            "Maintain records needed for operations, client intake, service improvement, security, and legal compliance.",
            "Understand aggregate, non-identifying patterns in how families use the assessment."
          ]
        },
        {
          title: "6. Cookies and Browser Storage",
          body: [
            "The website uses cookies and browser storage to keep the assessment functional. For example, the current implementation stores cookie consent, saved assessment drafts, latest results, and comparison group information in the browser. If you clear cookies or browser storage, your saved progress or local result may be lost.",
            "We may later add analytics, email, CRM, or scheduling tools. If those tools introduce additional cookies or tracking technologies, this policy and the cookie notice should be updated before launch."
          ]
        },
        {
          title: "7. How We Share Information",
          body: [
            "We do not sell personal information. We share information only as needed to operate the website, provide requested services, and comply with law.",
            "With service providers, such as hosting providers, email providers, Airtable or database tools, scheduling tools, PDF/report tools, analytics providers, and technical contractors.",
            "When you save and request your report, your profile, answers and results are automatically shared with Gilbert Devlyn or authorized team members for advisory preparation. Requesting contact is optional and separate from sharing your results.",
            "Invited family participants receive their own individual results. Gilbert receives the combined comparison to support advisory conversations; other participants do not receive your individual answers.",
            "With legal, regulatory, or security parties if required to comply with law, protect rights, prevent fraud, or respond to lawful requests."
          ]
        },
        {
          title: "8. Data Retention",
          body: [
            "We keep personal information only as long as reasonably necessary for the purposes described in this policy, unless a longer retention period is required or permitted by law. Assessment records may be retained for follow-up, advisory preparation, internal operations, and recordkeeping. Draft records stored in your browser remain until you clear them or they are replaced.",
            "Assessment records, email events, and contact requests are retained only as long as reasonably needed for advisory follow-up, operations, security, and legal compliance, then deleted or anonymized when no longer needed."
          ]
        },
        {
          title: "9. Security",
          body: [
            "We use reasonable administrative, technical, and organizational measures intended to protect personal information. No website, storage system, or transmission method is completely secure, so we cannot guarantee absolute security.",
            "Operational recommendation: limit access to assessment records to people who need it, use strong passwords and two-factor authentication, avoid sharing raw credentials, and delete information that is no longer needed."
          ]
        },
        {
          title: "10. International Visitors and Data Transfers",
          body:
            "Visitors may access the website from different countries, including Mexico and the United States. Personal information may be processed in the country where our service providers operate. By using the website, you understand that your information may be transferred to and processed in jurisdictions that may have different privacy laws than your location."
        },
        {
          title: "11. Your Choices and Rights",
          body: [
            "Depending on where you live, you may have rights to request access, correction, deletion, restriction, portability, or objection to certain processing of your personal information. You may also ask us not to contact you for follow-up communications.",
            "To make a request, contact info@gilbertdevlyn.com. We may need to verify your identity before fulfilling a request. Some requests may be limited by legal, security, operational, or recordkeeping requirements."
          ]
        },
        {
          title: "12. California Privacy Notice",
          body:
            "If the business is subject to the California Consumer Privacy Act (CCPA/CPRA), California residents may have rights to know, delete, correct, opt out of sale or sharing, limit certain sensitive personal information uses, and not be discriminated against for exercising privacy rights. This draft assumes the website does not sell personal information or share it for cross-context behavioral advertising. Counsel should confirm whether CCPA/CPRA applies based on revenue, volume of California records, and data-sharing practices."
        },
        {
          title: "13. Children",
          body:
            "The website and self-assessment are intended for adults and business-family participants. They are not directed to children under 13, and we do not knowingly collect personal information from children under 13."
        },
        {
          title: "14. Changes to This Policy",
          body:
            "We may update this Privacy Policy from time to time. If we make material changes, we will update the \"Last updated\" date and provide additional notice where appropriate."
        },
        {
          title: "15. Contact Us",
          body: [
            "For privacy questions or requests, contact:",
            "Gilbert Devlyn Advisory",
            "Email: info@gilbertdevlyn.com",
            "Address: Available upon request"
          ]
        }
      ]
    },
    resumeAssessment: {
      label: "Saved assessment",
      title: "Continue your assessment?",
      body:
        "We found a saved assessment in this browser. You can continue where you left off or start again with a clean form.",
      answeredLabel: "Answered",
      currentLabel: "Current question",
      updatedLabel: "Last saved",
      continueCta: "Continue Self-Assessment",
      startOverCta: "Start over"
    },
    assessmentIntro: {
      title: "Start with a simple Self-Assessment",
      body:
        "In about 10 minutes, explore eight practical areas that shape how your family makes decisions and works together.",
      startingPointNote:
        "This is a starting point for conversation. It is not a prescribed action plan or a judgment of the family or the business.",
      introBadge: "Simple starting point",
      languageNote: "Available in EN and ES",
      journeyLabel: "What happens next",
      journey: [
        {
          title: "Build a shared starting point",
          body:
            "Your answers give Gilbert useful context before the first conversation, so the discussion can focus on the areas that matter most and where support may add value."
        },
        {
          title: "Answer without pressure",
          body:
            "Questions separate what exists from what has not been communicated, so uncertainty is not treated as failure."
        },
        {
          title: "See the answers in a simple visual map",
          body:
            "Review clear summary points and the conversations that may need attention first."
        }
      ],
      resultSignalsLabel: "You leave with",
      resultSignals: [
        "A clear picture of where things stand today",
        "The conversations that may need attention first",
        "A private link to invite family members and compare perspectives"
      ],
      notAuditTitle: "A simple, private starting point",
      gilbertContextTitle: "Why Gilbert starts here",
      gilbertContextBody:
        "The self-assessment helps families see what is already working, what feels unclear and which conversation may need to happen first.",
      coverageLabel: "8 practical areas",
      coverageTitle: "A shared map for the conversations families often avoid",
      coverageBody:
        "Each topic reflects how family, ownership, and business decisions overlap - highlighting where more clarity may be needed.",
      outcomesLabel: "What you receive",
      outcomesTitle: "A practical starting point",
      outcomes: [
        {
          title: "A clearer picture",
          body:
            "A clearer picture of how your family works together today."
        },
        {
          title: "A shared way to talk",
          body:
            "Use clear, neutral language to discuss what is working, what feels unclear, and what matters most."
        },
        {
          title: "Next-step guidance",
          body:
            "Clear next steps to move the conversation forward."
        }
      ],
      conversationTitle: "Begin with the Self-Assessment",
      conversationBody:
        "A complete view for family meetings, ownership conversations, and advisory discussions.",
      conversationCta: "Start the Self-Assessment",
    },
    intro:
      "A guided self-assessment for family-owned businesses to understand clarity across eight practical areas that shape how the family makes decisions and works together.",
    notAudit:
      "When you save and request your report, your profile, answers and results are automatically shared with Gilbert to prepare for a useful conversation. Requesting contact is optional and separate from sharing your results. Your answers are not published or shared with other family members.",
    preAssessmentPrivacy: {
      title: "Before you begin",
      body:
        "When you save and request your report, your profile, answers and results are automatically shared with Gilbert to prepare for a useful conversation. Requesting contact is optional and separate from sharing your results. Your answers are not published or shared with other family members. If you invite others, each person receives their own results, and Gilbert receives the combined view. You can pause at any time; your progress is saved in this browser.",
      primaryCta: "I understand - begin",
      secondaryCta: "Read the privacy policy"
    },
    chooseMode: "Choose a mode",
    language: "Language",
    modes: {
      full: {
        title: "Complete the Self-Assessment",
        description: "Answer 50 questions across eight practical areas. It takes about 10 minutes and gives your family a useful starting point.",
        meta: "50 questions · ~10 minutes · Map + summary result"
      }
    },
    intake: {
      eyebrow: "Respondent profile",
      title: "Tell us about yourself",
      body: "Your role helps Gilbert read the results in the right context.",
      privacyReassurance:
        "When you save and request your report, your profile, answers and results are automatically shared with Gilbert to prepare for a useful conversation. Requesting contact is optional and separate from sharing your results. Your answers are not published or shared with other family members.",
      modeSectionLabel: "Before the Self-Assessment",
      formLabel: "Before the questions",
      formTitle: "Help us read your result in context",
      formNote: "This profile stays connected to your result and prepares the comparison flow.",
      contextTitle: "Why this comes first",
      contextBody:
        "A person's role, generation, and access to information shape what they can see. This context makes the self-assessment easier to interpret.",
      nextTitle: "What happens next",
      nextSteps: [
        "Complete this short profile",
        "Answer the self-assessment across the eight practical areas",
        "Receive a result showing strengths, areas for clarity, and suggested next steps"
      ],
      includesTitle: "Your result includes",
      includes: [
        "A clear picture of where things stand today",
        "Topic-by-topic scores",
        "Summary report request",
        "Comparison-ready structure"
      ],
      privacyTitle: "Profile use",
      privacyNote:
        "Comparison views identify people by role, not by individual question-by-question responses.",
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "you@example.com",
      phone: "Phone number",
      phoneCountry: "Phone country code",
      phonePlaceholder: "Phone number",
      relationship: "Relationship with the family business",
      relationshipPlaceholder: "Select relationship",
      relationshipOther: "Please specify",
      relationshipOtherPlaceholder: "Describe your relationship",
      generation: "Which generation do you belong to?",
      generationPlaceholder: "Select generation",
      country: "Country",
      countrySearchPlaceholder: "Search country",
      countryNoResults: "No countries found",
      required: "Required",
      requiredNote: "Complete all fields to continue.",
      privacyAgreement: "By continuing, you agree to our",
      privacyLink: "Privacy Policy",
      invalidEmail: "Enter a valid email address.",
      invalidPhone: "Enter a valid phone number.",
      completeMessage: "Complete the profile details to continue.",
      continue: "Continue to questions",
      phoneCountryOptions: PHONE_COUNTRY_OPTIONS,
      relationshipOptions: [
        { id: "founder", label: "Founder" },
        { id: "family-working", label: "Family member who works in the business" },
        { id: "family-not-working", label: "Family member who does not work in the business" },
        { id: "shareholder-non-family", label: "Shareholder (non-family)" },
        { id: "spouse-partner", label: "Spouse or partner of a family member" },
        { id: "other", label: "Other" }
      ],
      generationOptions: [
        { id: "first", label: "First generation (founder)" },
        { id: "second", label: "Second generation" },
        { id: "third-plus", label: "Third generation or later" }
      ],
      countryOptions: [
        { id: "mexico", label: "Mexico" },
        { id: "united-states", label: "United States" },
        { id: "canada", label: "Canada" },
        { id: "colombia", label: "Colombia" },
        { id: "spain", label: "Spain" },
        { id: "other", label: "Other" }
      ]
    },
    start: "Start",
    back: "Back",
    next: "Next",
    finish: "See result",
    questionOf: "Question",
    of: "of",
    pillar: "Topic",
    scorePrompt: "How true is this for your family today?",
    scale: [
      "Not true for us",
      "Rarely true",
      "Sometimes true",
      "Often true",
      "Mostly true",
      "Very true for us"
    ],
    scaleNote:
      "Tip: You can press 0-5 on your keyboard to choose an answer, then press Enter or Space to continue. Choose Not sure / I don't know when you do not have enough visibility. It will not count against the score.",
    scaleAnchors: [
      "Not true for us",
      "Rarely true",
      "Sometimes true",
      "Often true",
      "Mostly true",
      "Very true for us"
    ],
    unknownOption: {
      label: "Not sure / I don't know",
      body: "This does not count in the numeric score."
    },
    transparencyInsight: {
      label: "Transparency signal",
      title: "Several areas were marked as Not sure",
      body:
        "This often indicates that information is not fully shared across the family, or that roles and expectations are not clearly defined. It is a signal about clarity and visibility, not a judgment of the family.",
      countLabel: "Unknown responses",
      pillarLabel: "Most affected pillars"
    },
    loadingTitle: "Preparing your result",
    loadingBody: "Your responses are being organized across the eight practical areas.",
    overallScore: "Overall score",
    maturityStage: "Where things stand today",
    pillarScores: "Topic view",
    noScore: "Not scored",
    whatCanDo: "What the family can do",
    consultantSupport: "How Gilbert can help",
    reflection: "Result",
    downloadPdf: "Request summary report",
    retake: "Start again",
    viewFull: "View topic summary",
    fullCtas: [
      "Explore these topics further",
      "Discuss next steps with Gilbert",
      "Request summary report"
    ],
    comparison: {
      inviteTitle: "Invite another family member",
      inviteBody:
        "Enter their email and we will send a private invitation so they can complete the self-assessment and compare perspectives.",
      invitePrivacyNote:
        "Only pillar-level differences are compared. Individual answers are not shared question by question.",
      inviteEmail: "Family member email",
      inviteEmailPlaceholder: "family@example.com",
      generateInvite: "Send invitation email",
      sendingInvite: "Sending invitation...",
      copyInvite: "Copy email invitation",
      copied: "Link copied",
      inviteReady: "Invitation email ready",
      inviteSent: "Invitation sent",
      inviteSentBody: "We sent the private group link to {email}.",
      inviteSentModalTitle: "Invitation email sent",
      inviteSentModalBody:
        "We sent the private group link to {email}. They can open the email and complete the self-assessment from the same comparison group.",
      inviteSentModalDone: "Done, save assessment",
      inviteNote:
        "The invited person will receive the private group link by email.",
      inviteEmailRequired: "Enter an email address before sending the invitation.",
      inviteSendError: "We could not send the invitation. Please try again.",
      participantCount: "Completed perspectives",
      maxNote: "Up to 3 people can be compared in this version.",
      inviteLimit: "This comparison group already has 3 completed perspectives.",
      viewComparison: "View group comparison",
      saveBeforeComparison:
        "Save this result by requesting your summary report before viewing the group comparison.",
      waitingTitle: "Waiting for another perspective",
      waitingBody:
        "The comparison will open automatically once a second person completes the assessment through this link.",
      pageLabel: "Group comparison",
      title: "Compare family perspectives",
      intro:
        "This view keeps the comparison simple: pillar scores, main gaps, convergence areas, and transparency signals by role.",
      privacyNote: "Privacy: people are identified by role and generation, not by name.",
      backToResult: "Back to individual result",
      participants: "Perspectives",
      overall: "Overall",
      pillarComparison: "Pillar comparison",
      convergenceTitle: "Areas of convergence",
      convergenceBody: "Pillars where perspectives are broadly aligned.",
      noConvergence: "No clear convergence yet.",
      divergenceTitle: "Areas of divergence",
      divergenceBody: "Pillars with a score gap above 20 points.",
      noDivergence: "No major score gaps above 20 points.",
      transparencyTitle: "Transparency gaps",
      transparencyBody:
        "Pillars where one perspective has limited information while another sees the practice more clearly.",
      noTransparency: "No major transparency gap appeared.",
      groupCallCta: "Contact Gilbert about this comparison",
      scoreGap: "Gap",
      unknownResponses: "Unknown"
    },
    footerRights: "© 2026 Gilbert Devlyn Advisory. All rights reserved.",
    contactEmail: "info@gilbertdevlyn.com"
  },
  es: {
    appName: "Autoevaluación para Empresas Familiares",
    brandName: "Gilbert Devlyn",
    brandLine: "Asesoría para empresas familiares",
    sideQuote:
      "Las familias fuertes construyen empresas. Los acuerdos claros ayudan a sostenerlas.",
    nav: {
      home: "Inicio",
      about: "Acerca de",
      services: "Servicios",
      assessment: "Autoevaluación"
    },
    booking: {
      startAssessment: "Iniciar la autoevaluación",
      takeAssessment: "Realizar la autoevaluación",
      getGovernanceScore: "Ver dónde están las cosas hoy",
      bookStrategyCall: "Solicitar seguimiento",
      modalLabel: "Solicitud de seguimiento",
      modalTitle: "Solicita seguimiento con Gilbert Devlyn",
      modalIntro:
        "Comparte tu resultado y datos de contacto para que Gilbert pueda buscarte personalmente.",
      modalIntroByCategory: {
        low:
          "Tu resultado señala áreas donde mayor claridad y estructura pueden ayudar. Gilbert puede ayudar a definir qué atender primero, quién debe participar y cómo empezar sin crear tensión innecesaria.",
        mid:
          "Tu resultado muestra bases útiles y oportunidades para aclarar roles y decisiones. Gilbert puede ayudar a identificar los pocos cambios que harían mayor diferencia práctica.",
        high:
          "Tu resultado muestra formas sólidas de trabajar. Gilbert puede ayudar a revisar la continuidad, la sucesión y si los propietarios comparten las mismas expectativas mientras la familia evoluciona."
      },
      categoryLabel: "Categoría",
      categoryNames: {
        low: "Baja",
        mid: "Media",
        high: "Alta"
      },
      flaggedLabel: "Áreas de enfoque",
      schedulerTitle: "Seguimiento con Gilbert Devlyn",
      close: "Cerrar",
      scoreCtas: {
        low: "Solicitar que Gilbert me contacte",
        mid: "Solicitar que Gilbert me contacte",
        high: "Solicitar que Gilbert me contacte"
      }
    },
    home: {
      title: "Gilbert Devlyn Asesoría para Empresas Familiares",
      subtitle:
        "Ayudando a familias empresarias a tomar decisiones importantes sobre propiedad, sucesión y roles de la siguiente generación antes de que los malentendidos se conviertan en conflicto.",
      body:
        "Gilbert Devlyn aporta experiencia vivida como miembro de familia, propietario, ejecutivo y consejero dentro de una empresa multigeneracional. Ayuda a las familias a nombrar las conversaciones que se están evitando, ordenar quiénes deben participar y avanzar hacia acuerdos que resistan la presión.",
      gilbertTitle: "¿Quién es Gilbert?",
      gilbertBody:
        "Gilbert Devlyn aporta experiencia directa desde dentro de un grupo empresarial familiar de tercera generación. Como miembro de familia, propietario y consejero, ha participado directamente en decisiones que dan forma a la continuidad entre generaciones.",
      video: {
        label: "Video de Gilbert",
        title: "Reservado para el mensaje de Gilbert",
        body:
          "Este espacio queda reservado para el video breve de Gilbert en la página de inicio. Hasta que el clip final esté listo, se mantiene como marcador visual en lugar de mostrar un video de terceros.",
        duration: "Video de 45 seg",
        embedUrl: ""
      },
      primaryCta: "Conocer a Gilbert",
      heroCta: "Iniciar una conversación",
      secondaryCta: "Comenzar la autoevaluación",
      valueTitle: "Por qué importa la asesoría",
      valueBody:
        "Las decisiones de una empresa familiar pesan más que lo operativo. Afectan la confianza, la continuidad, la propiedad y los roles futuros. Gilbert ofrece un espacio neutral para separar los temas, ponerse de acuerdo sobre las prioridades y convertir conversaciones sensibles en acuerdos posibles.",
      businessTitle: "Separar. Ordenar. Sostener.",
      frameworkIntro:
        "Un espacio neutral para separar familia, propiedad y empresa — y convertir las conversaciones en acuerdos que perduran.",
      businessBody:
        "El trabajo vive en el cruce entre propiedad, liderazgo, decisiones del consejo y relaciones familiares. El objetivo no es más teoría, sino un camino más claro para las decisiones que la familia realmente necesita tomar.",
      helpingTitle: "Las familias suelen buscar apoyo cuando",
      helpingIntro:
        "Las cosas suelen funcionar bien durante años. Después, una transición, un desacuerdo o una decisión importante revela preguntas que la familia nunca había necesitado responder.",
      helpingItems: [
        "Un fundador o generación senior quiere continuidad, pero la familia no ha acordado qué sigue",
        "La siguiente generación quiere participar, pero los roles, expectativas o tiempos no están claros",
        "Los accionistas necesitan mayor claridad sobre derechos, responsabilidades, información y reglas de decisión",
        "Un consejo, consejo de familia o grupo de propietarios necesita una mejor forma de tratar temas sensibles"
      ],
      challengeTitle: "El trabajo real no es solo cómo se toman las decisiones. Es la conversación que hay detrás.",
      challengeIntro:
        "Propiedad, sucesión, roles de consejo, consejos de familia, expectativas laborales, patrimonio y participación de la siguiente generación cargan emociones y consecuencias empresariales. Gilbert ayuda a separar los temas, definir quién debe estar en la conversación y pasar de tensión a acuerdos.",
      challengeItems: [
        {
          title: "Propiedad",
          body:
            "Aclarar derechos, responsabilidades, flujo de información y cómo los propietarios toman decisiones juntos."
        },
        {
          title: "Sucesión",
          body:
            "Pasar de una preocupación general a conversaciones prácticas sobre preparación, tiempos, criterios y confianza."
        },
        {
          title: "Cómo se toman las decisiones",
          body:
            "Aclarar los roles de la familia, los propietarios, el consejo y la dirección para que todos entiendan quién decide qué."
        },
        {
          title: "Roles de siguiente generación",
          body:
            "Crear un camino responsable para aprendizaje, participación, voz y liderazgo futuro."
        },
        {
          title: "Decisión familiar",
          body:
            "Acordar quién debe participar, cómo se manejarán los desacuerdos y cómo seguirán avanzando las decisiones."
        },
        {
          title: "Conversaciones sensibles",
          body:
            "Llevar temas difíciles a un espacio estructurado antes de que el silencio se convierta en desconfianza."
        }
      ],
      evidence: {
        label: "Por qué importa",
        title: "Las cosas pueden funcionar bien durante años, hasta que una decisión importante se vuelve más difícil de lo esperado.",
        intro:
          "Es común que los roles, las expectativas y las formas de tomar decisiones permanezcan informales. La dificultad suele aparecer cuando la familia crece, cambia el liderazgo o surgen ideas distintas sobre lo que debería ocurrir después.",
        stats: [
          {
            title: "Las decisiones se vuelven más difíciles",
            label:
              "Una decisión que antes parecía sencilla ahora involucra a más personas, más expectativas y más consecuencias."
          },
          {
            title: "Los roles siguen sin hablarse",
            label:
              "Los familiares pueden estar actuando desde ideas distintas sobre la responsabilidad, la propiedad o el futuro."
          },
          {
            title: "Las conversaciones se posponen",
            label:
              "Los temas importantes suelen retrasarse porque nadie sabe cómo empezar sin crear tensión."
          }
        ],
        comparisonHeaders: {
          informal: "Patrón informal en la empresa familiar",
          advisory: "Con una forma más clara de trabajar"
        },
        comparisons: [
          {
            theme: "Sucesión",
            informal:
              "La sucesión se reconoce como crítica, pero la planeación suele quedarse detrás de la presión del día a día.",
            informalShort: "La planeación queda detrás de la urgencia diaria, aunque se sabe crítica.",
            advisory:
              "La transición de liderazgo entra en una agenda recurrente: preparación, criterios de rol, tiempos y expectativas de propiedad se vuelven visibles.",
            advisoryShort: "Preparación, criterios y tiempos se vuelven agenda recurrente."
          },
          {
            theme: "Entendimiento compartido",
            informal:
              "Los valores y el propósito pueden estar claros para líderes senior, pero no siempre están escritos o comunicados entre generaciones.",
            informalShort: "Los líderes entienden los valores, pero rara vez quedan por escrito.",
            advisory:
              "La familia documenta principios compartidos, quién decide qué y ritmos de comunicación para que el entendimiento no dependa de la memoria o la jerarquía.",
            advisoryShort: "Los principios compartidos y quién decide qué quedan claros para todos."
          },
          {
            theme: "Conflicto",
            informal:
              "El desacuerdo se maneja de forma personal, tardía o mediante autoridad informal, convirtiendo tensión normal en desconfianza.",
            informalShort: "El desacuerdo se maneja tarde, en lo personal o por autoridad informal.",
            advisory:
              "La familia define cómo se plantea el desacuerdo, quién decide y cómo avanzan los temas sensibles sin exponer respuestas individuales.",
            advisoryShort: "La familia acuerda cómo plantear el desacuerdo y quién decide."
          },
          {
            theme: "Velocidad de decisión",
            informal:
              "Los retos organizacionales, de liderazgo y decisión pueden frenar la agilidad aunque el negocio tenga buenos instintos de mercado.",
            informalShort: "Los temas familiares se mezclan con la operación y frenan decisiones.",
            advisory:
              "Roles claros ayudan a separar conversaciones de propiedad, consejo, equipo ejecutivo y siguiente generación.",
            advisoryShort: "Roles claros separan propiedad, consejo y conversaciones familiares."
          }
        ],
        sources: [
          {
            label: "PwC 11th Global Family Business Survey, 2023",
            url:
              "https://www.pwc.com/gx/en/services/family-business/family-business-survey/building-family-member-trust.html"
          },
          {
            label: "Deloitte Private succession planning survey, 2026",
            url:
              "https://www.deloitte.com/us/en/about/press-room/deloitte-private-survey-reveals-family-businesses-are-facing-a-succession-paradox.html"
          },
          {
            label: "PwC US Family Business Survey, 2025",
            url:
              "https://www.pwc.com/us/en/services/audit-assurance/private-company-services/library/family-business-survey.html"
          },
          {
            label: "EY and University of St.Gallen Global 500 Family Business Index, 2025",
            url:
              "https://www.ey.com/en_ro/newsroom/2025/03/largest-500-family-businesses-amount-to-world-s-third-largest-ec"
          },
          {
            label: "KPMG Global Family Business Report, 2025",
            url:
              "https://kpmg.com/kpmg-us/content/dam/kpmg/pdf/2025/global-family-business-report-executive-summary-new.pdf"
          },
          {
            label: "KPMG y STEP Global Family Business Report, 2024",
            url: "https://hub.kpmg.de/en/global-family-business-report"
          },
          {
            label: "Reportes del STEP Project Global Consortium",
            url: "https://www.spgcfb.org/en/reports"
          },
          {
            label: "Family Enterprise Foundation research hub",
            url:
              "https://familyenterprisefoundation.org/resources/knowledge-hub/research-and-newsroom/categories/research/"
          },
          {
            label: "IMD Global Family Business Center research and insights",
            url: "https://www.imd.org/centers/gfbc/imd-family-business-center/"
          },
          {
            label: "Family Firm Institute recursos e investigación",
            url: "https://www.ffi.org/"
          },
          {
            label: "Columbia Business School Global Family Enterprise Program",
            url: "https://business.columbia.edu/globalfamilyenterprise"
          },
          {
            label: "Cornell Smith Family Business Initiative",
            url: "https://business.cornell.edu/centers/smith/"
          }
        ]
      },
      note:
        "La autoevaluación es un punto de partida para mejores conversaciones, no un juicio sobre la familia o la empresa.",
      approachTitle: "Cómo trabaja Gilbert con las familias",
      approachSubtitle:
        "Todo acompañamiento empieza por entender cómo funciona la familia hoy.",
      approachBlocks: [
        {
          title: "Estructura antes que soluciones",
          body:
            "La mayoría de las preguntas sobre cómo trabaja una familia son conversaciones pendientes. Gilbert ayuda a nombrar lo que ya ocurre y a darle suficiente estructura para avanzar sin dañar las relaciones."
        },
        {
          title: "Neutralidad vivida",
          body:
            "Ha estado del otro lado de la mesa como familiar, propietario, ejecutivo y consejero. Esa experiencia hace que su neutralidad sea práctica, no distante, especialmente en temas de sucesión, propiedad y roles familiares."
        },
        {
          title: "Claridad que se ajusta a la familia",
          body:
            "No existe un único modelo que funcione para todas las familias. El trabajo empieza desde la realidad de cada familia, no desde una plantilla genérica."
        },
        {
          title: "Seguimiento con cuidado",
          body:
            "Después de la reunión, el trabajo continúa con pasos concretos: acuerdos claros, responsables definidos y un ritmo familiar protegido para que las decisiones sobrevivan más allá de una buena conversación."
        }
      ],
      toolTitle: "La autoevaluación ofrece un punto de partida práctico para una conversación más útil.",
      toolParagraphs: [
        "Ayuda a ver dónde los roles, expectativas, decisiones y conversaciones de sucesión pueden necesitar más estructura.",
        "Usado en el momento correcto, le da a Gilbert y a la familia un lenguaje compartido para la primera conversación de asesoría."
      ],
      toolCta: "Ver cómo funciona la autoevaluación",
      ctaTitle: "¿Listos para aclarar la siguiente decisión?",
      ctaBody:
        "Cuando los roles, las expectativas o las decisiones importantes siguen sin estar claros, la conversación adecuada puede abrir un camino práctico para avanzar.",
      ctaButton: "Iniciar una conversación",
      ctaNote: "Comienza por la decisión, el rol o la transición que necesita atención ahora."
    },
    services: {
      label: "Servicios",
      title: "El apoyo adecuado depende de la decisión que tu familia necesita tomar.",
      intro:
        "Algunas familias necesitan ayuda con una decisión importante. Otras necesitan apoyo continuo mientras cambian los roles, la propiedad o el liderazgo.",
      promiseTitle: "Apoyo diseñado alrededor de la decisión que la familia tiene enfrente",
      promiseBody:
        "Las familias rara vez necesitan más complejidad. Necesitan a las personas adecuadas en la conversación correcta, con suficiente estructura para tomar una decisión y avanzar. Gilbert comienza por entender cómo trabaja la familia hoy y qué conversación se ha vuelto difícil de tener.",
      previewLabel: "Cómo ayuda Gilbert",
      previewTitle: "Cuatro formas de trabajar con Gilbert",
      previewBody:
        "El apoyo puede tomar la forma de un proyecto concreto, orientación para el consejo, coaching ejecutivo o una conversación privada 1:1, según lo que la familia necesite decidir.",
      previewCta: "Explorar servicios",
      forLabel: "Para quién es",
      helpsLabel: "En qué ayuda Gilbert",
      outcomeLabel: "Resultado probable",
      items: [
        {
          title: "Proyectos de consultoría",
          summary:
            "Proyectos concretos que ayudan a las familias a aclarar cómo se toman las decisiones, prepararse para la sucesión y acordar roles y expectativas sobre la propiedad.",
          forWhom:
            "Familias, grupos de propietarios, consejos de familia o equipos de liderazgo frente a una transición, un tema no resuelto o un área que todavía no está claramente definida.",
          helpsWith:
            "Aclarar el tema, decidir quién debe participar, preparar y facilitar las conversaciones adecuadas y convertir los acuerdos en siguientes pasos prácticos.",
          outcome:
            "Un camino de decisión más claro, acuerdos o prioridades documentadas y una forma acordada de continuar el trabajo después del proyecto."
        },
        {
          title: "Participación en Consejos y Asesoría de Gobierno",
          previewSummary: "Apoyo para crear o fortalecer un consejo, aclarar cómo trabaja o participar directamente como miembro independiente del consejo o de un comité.",
          summary:
            "Apoyo a empresas familiares que crean un consejo, fortalecen uno existente o buscan una contribución independiente en el consejo o sus comités.",
          forWhom:
            "Empresas familiares que crean un consejo por primera vez, empresas familiares establecidas que fortalecen su funcionamiento y organizaciones que buscan un consejero no ejecutivo independiente o un miembro independiente de comité.",
          helpsWith:
            "Aclarar el propósito, las responsabilidades y las formas de trabajo del consejo; acordar quién decide qué; identificar la combinación adecuada de consejeros familiares e independientes; y participar directamente como consejero no ejecutivo o miembro de comité cuando corresponda.",
          outcome:
            "Un consejo más eficaz, con responsabilidades más claras, mejores decisiones y una perspectiva independiente que entiende tanto el negocio como el contexto familiar."
        },
        {
          title: "Coaching ejecutivo",
          summary:
            "Coaching para líderes que afrontan cambios en sus responsabilidades, expectativas familiares y decisiones empresariales importantes.",
          forWhom:
            "Ejecutivos familiares, ejecutivos no familiares, sucesores o líderes senior que necesitan liderar con claridad mientras navegan dinámica familiar.",
          helpsWith:
            "Reflexionar sobre decisiones difíciles, preparar conversaciones sensibles, aclarar responsabilidades y convertir la tensión en opciones más claras.",
          outcome:
            "Un líder que actúa con más claridad, comunica con más disciplina y maneja la presión familiar-empresarial sin evitar la conversación difícil."
        },
        {
          title: "Asesoría 1:1",
          summary:
            "Asesoría privada para propietarios, miembros de la siguiente generación, fundadores o líderes familiares que necesitan espacio para pensar una decisión, un rol o una conversación difícil.",
          forWhom:
            "Personas que desempeñan un rol sensible dentro de la empresa familiar o se preparan para una conversación que afecta propiedad, sucesión, liderazgo o confianza familiar.",
          helpsWith:
            "Pensar la situación, separar preocupaciones personales y empresariales, preparar la conversación y decidir qué debe pasar después.",
          outcome:
            "Una posición personal más clara, un siguiente movimiento más cuidado y mayor posibilidad de que la conversación ocurra con estructura, no por impulso."
        }
      ],
      ctaTitle: "Empieza con la decisión que necesita atención ahora.",
      ctaBody:
        "Algunas familias empiezan con la autoevaluación. Otras empiezan con una conversación sobre una transición, un rol o una decisión específica.",
      diagnosticCta: "Iniciar una conversación",
      aboutCta: "Comenzar la autoevaluación"
    },
    about: {
      label: "Acerca de Gilbert",
      title: "Experiencia desde dentro de la empresa familiar, ayudando a otras familias a avanzar con claridad.",
      bio: [
        "Gilbert Devlyn creció en una de las familias empresarias más grandes de México. Como miembro, propietario, ejecutivo y consejero de Grupo Devlyn, vivió de primera mano lo que significa gestionar la relación entre familia y empresa: las tensiones, las decisiones difíciles y la responsabilidad de proteger un legado que trasciende generaciones.",
        "Fue Presidente del Consejo de Familia y del Consejo NextGen de la Familia Devlyn, y pasó más de 12 años trabajando dentro del grupo, más recientemente como Chief Human Capital Officer. Desde roles familiares, de propiedad, liderazgo y consejo, aprendió a separar temas que se cruzan, hacer más productivas las conversaciones difíciles y ayudar a las familias a tomar decisiones que les permitan avanzar.",
        "Gilbert combina experiencia directa en una empresa familiar multigeneracional con una comprensión de las preguntas que enfrentan los miembros de la siguiente generación al prepararse para participar, liderar o asumir responsabilidades de propiedad. Esto le permite trabajar entre generaciones con credibilidad y ayudar a convertir las diferencias de perspectiva en avances prácticos.",
        "Hoy guía a otras familias empresarias en momentos de transición, ayudándolas a entender lo que ya está pasando, traer las conversaciones correctas a la superficie y avanzar con claridad. Gilbert no es un consultor que solo estudió el tema; lo vivió y decidió acompañar a otros en el mismo camino."
      ],
      quickFacts: [
        {
          value: "12+",
          label: "años dentro de empresa familiar"
        },
        {
          value: "Cuatro perspectivas",
          label: "familiar • propietario • ejecutivo • consejero"
        },
        {
          value: "Preparado en diversas disciplinas",
          label: "EMPRESA FAMILIAR · PATRIMONIO FAMILIAR · COACHING · GOBIERNO DEL CONSEJO"
        }
      ],
      video: {
        label: "",
        title: "Una introducción más profunda",
        body:
          "Este espacio queda preparado para un video más largo donde Gilbert pueda explicar su historia, experiencia vivida y forma de trabajar con familias empresarias antes de presentar la autoevaluación.",
        duration: "Video de 2 min",
        embedUrl: ""
      },
      contextLabel: "Por qué importa la experiencia vivida",
      contextTitle: "Entiende la empresa familiar desde más de una perspectiva",
      contextBody:
        "La mayoría de las familias ya sabe cómo operar el negocio. Lo más difícil es acordar la propiedad, los roles, las expectativas y las conversaciones que darán forma al futuro. Esas preguntas son normales, pero posponerlas puede hacer que las decisiones posteriores sean mucho más difíciles.",
      contextItems: [
        {
          title: "Credibilidad entre generaciones",
          body:
            "Gilbert puede entender a generaciones senior que protegen la continuidad y a miembros de la siguiente generación que buscan un rol responsable."
        },
        {
          title: "Práctico, no teórico",
          body:
            "Conoce la diferencia entre las estructuras formales que existen en papel y las formas de trabajar que la familia realmente usa y en las que confía."
        },
        {
          title: "Un espacio estructurado para conversaciones difíciles",
          body:
            "Ayuda a bajar la velocidad de la conversación, separar los temas y mantener asuntos sensibles lo suficientemente concretos para avanzar."
        },
        {
          title: "Confianza y discreción desde el inicio",
          body:
            "Maneja las conversaciones sensibles con cuidado y aclara las expectativas sobre privacidad desde el principio."
        }
      ],
      educationTitle: "Educación y Certificaciones",
      educationItems: [
        "International MBA (IMBA), University of Denver, con enfoque en consultoría para empresas familiares",
        "Licenciaturas en Administración y Mercadotecnia",
        "Certificate in Family Business Advising — Family Firm Institute",
        "Certificate in Family Wealth Advising — Family Firm Institute",
        "Certified Professional Coach — iPEC",
        "Board Director Diploma — IMD"
      ],
      focusTitle: "Áreas de Enfoque",
      focusItems: [
        "Ayudar a los consejos de familia a sostener conversaciones productivas",
        "Dar roles y formas de trabajo más claras a la familia",
        "Pasar la propiedad y la responsabilidad a la siguiente generación",
        "Preparar a los miembros de la siguiente generación para sus futuros roles",
        "Aclarar el rol del consejo y cómo se toman las decisiones",
        "Coaching para conversaciones difíciles",
        "Coaching y mentoría para miembros de la siguiente generación que asumen roles de propiedad y liderazgo"
      ],
      testimonialsTitle: "Discreto por diseño",
      testimonialsSubtitle:
        "Gran parte de este trabajo involucra conversaciones familiares privadas y decisiones sensibles sobre la propiedad. Las relaciones con clientes se manejan con discreción y las referencias se comparten directamente cuando corresponde.",
      situationsTitle: "Dónde ayuda este trabajo",
      situations: [
        "Una familia decidiendo cómo los miembros de la siguiente generación asumirán roles de propiedad y liderazgo.",
        "Hermanos alineándose después de una transición del fundador",
        "Accionistas aclarando roles, derechos y expectativas",
        "Consejos de familia que existen pero no se aprovechan plenamente",
        "Un consejo o equipo de liderazgo intentando separar preocupaciones familiares de decisiones empresariales",
        "Decisiones importantes que se sienten estancadas porque la conversación no ha ocurrido"
      ],
      toolTitle: "La autoevaluación es una forma sencilla de comenzar",
      toolIntro:
        "Una autoevaluación breve puede dar a la familia y a Gilbert un punto de partida compartido antes de la primera conversación.",
      toolSteps: [
        {
          title: "Completa la autoevaluación",
          body:
            "Unos 10 minutos, a tu propio ritmo. Puedes pausar y continuar exactamente donde te quedaste."
        },
        {
          title: "Recibe tu reporte individual",
          body:
            "Un resumen de tus resultados, organizado por tema, con tus áreas más sólidas y en cuáles conviene buscar más claridad."
        },
        {
          title: "Decide si quieres una conversación de seguimiento",
          body:
            "Si lo eliges, Gilbert puede contactarte para revisar los resultados y conversar sobre posibles siguientes pasos. No hay ninguna obligación."
        }
      ],
      toolReceiveBody:
        "Recibirás un resumen escrito de tus propios resultados y un enlace privado para invitar a otros familiares. Cada persona recibe sus propios resultados; Gilbert recibe la vista combinada para ayudar a comparar perspectivas.",
      toolCta: "Iniciar la autoevaluación"
    },
    cookieConsent: {
      title: "Valoramos tu privacidad",
      body:
        "Este sitio usa cookies para guardar tu avance en la autoevaluación y mantener activas las ligas de comparación.",
      privacyLink: "Leer la Política de Privacidad",
      accept: "Aceptar cookies",
      reject: "Rechazar"
    },
    privacyPolicy: {
      label: "Privacidad",
      title: "Política de Privacidad",
      updated: "Última actualización: 16 de junio de 2026",
      close: "Cerrar",
      intro: [
        "Gilbert Devlyn Advisory",
        "Esta Política de Privacidad explica cómo el sitio web, la autoevaluación, las ligas de comparación y las comunicaciones relacionadas recopilan, usan, almacenan y comparten información. Para preguntas de privacidad, escribe a info@gilbertdevlyn.com."
      ],
      sections: [
        {
          title: "1. Quiénes somos",
          body: [
            "Esta Política de Privacidad explica cómo Gilbert Devlyn Advisory (\"nosotros\") recopila, usa, almacena y comparte información cuando una persona usa gilbertdevlyn.com, completa la Autoevaluación de Empresa Familiar, solicita seguimiento o se comunica con nosotros.",
            "Entidad legal: Gilbert Devlyn Advisory.",
            "Dirección comercial: Disponible bajo solicitud.",
            "Email de contacto: info@gilbertdevlyn.com."
          ]
        },
        {
          title: "2. Alcance de esta política",
          body:
            "Esta política aplica al sitio web, la experiencia de autoevaluación, las solicitudes de contacto, los enlaces de comparación y las comunicaciones relacionadas. No aplica a sitios web o servicios de terceros que no controlamos."
        },
        {
          title: "3. Información que recopilamos",
          body:
            "Recopilamos información que proporcionas directamente, información generada por tu uso de la autoevaluación e información técnica limitada necesaria para operar el sitio web.",
          table: {
            headers: ["Categoría", "Ejemplos", "Propósito"],
            rows: [
              [
                "Información de contacto y perfil",
                "Nombre, email, teléfono, país, relación con la empresa familiar, generación y detalles del rol.",
                "Conectar tu resultado contigo, dar seguimiento, entender el contexto y apoyar las funciones de comparación."
              ],
              [
                "Respuestas y resultados",
                "Respuestas a preguntas, respuestas sin información, puntaje por tema, resultado general, resumen de dónde están las cosas hoy y reportes.",
                "Generar tu resultado, identificar áreas prioritarias y apoyar conversaciones de asesoría."
              ],
              [
                "Información de comparación e invitación",
                "Identificadores de grupo o invitación, email de invitado, etiquetas de rol/generación y estado de comparación.",
                "Permitir que varios miembros de la familia comparen perspectivas sin mostrar respuestas individuales pregunta por pregunta."
              ],
              [
                "Información de seguimiento",
                "Estado de solicitud de contacto, estado de reserva y mensajes o notas que decidas compartir.",
                "Responder tu solicitud y coordinar conversaciones de asesoría."
              ],
              [
                "Información técnica y de cookies",
                "Consentimiento de cookies, borrador guardado, último resultado, registros de almacenamiento del navegador y logs básicos del servidor si están habilitados.",
                "Recordar el avance, mantener usable la evaluación y sostener la seguridad y confiabilidad del sitio."
              ]
            ]
          }
        },
        {
          title: "4. Cómo recopilamos información",
          body: [
            "Directamente de ti cuando completas el perfil, respondes preguntas, solicitas seguimiento o envías una invitación.",
            "Automáticamente mediante cookies y almacenamiento del navegador usados para guardar avance, recordar consentimiento y conectar resultados con el flujo de comparación.",
            "A través de proveedores de servicio que usamos o podríamos usar para alojar el sitio, almacenar resultados, administrar email, enviar notificaciones, operar Airtable o bases similares y programar conversaciones de seguimiento."
          ]
        },
        {
          title: "5. Cómo usamos la información",
          body: [
            "Proporcionar y mejorar la Autoevaluación de Empresa Familiar.",
            "Generar resultados, puntajes por dimensión, vistas de comparación y reportes descargables.",
            "Responder solicitudes de seguimiento y coordinar conversaciones de asesoría.",
            "Enviar comunicaciones relacionadas con la evaluación, invitaciones, recordatorios o resúmenes si la automatización de email está habilitada.",
            "Mantener registros necesarios para operación, intake de clientes, mejora del servicio, seguridad y cumplimiento legal.",
            "Entender patrones agregados y no identificables sobre cómo las familias usan la evaluación."
          ]
        },
        {
          title: "6. Cookies y almacenamiento del navegador",
          body: [
            "El sitio usa cookies y almacenamiento del navegador para mantener funcional la evaluación. Por ejemplo, la implementación actual guarda consentimiento de cookies, borradores de evaluación, últimos resultados e información de grupo de comparación en el navegador. Si borras cookies o almacenamiento del navegador, tu avance o resultado local podría perderse.",
            "Más adelante podríamos agregar analítica, email, CRM o herramientas de agenda. Si esas herramientas incorporan cookies o tecnologías de seguimiento adicionales, esta política y el aviso de cookies deben actualizarse antes del lanzamiento."
          ]
        },
        {
          title: "7. Cómo compartimos información",
          body: [
            "No vendemos información personal. Compartimos información solo cuando es necesario para operar el sitio, prestar los servicios solicitados y cumplir con la ley.",
            "Con proveedores de servicio, como hosting, email, Airtable o herramientas de base de datos, agenda, generación de reportes/PDF, analítica y contratistas técnicos.",
            "Al guardar y solicitar tu reporte, tu perfil, respuestas y resultados se comparten automáticamente con Gilbert Devlyn o miembros autorizados del equipo para preparar el trabajo de asesoría. Solicitar contacto es opcional e independiente de compartir tus resultados.",
            "Los familiares invitados reciben sus propios resultados individuales. Gilbert recibe la comparación combinada para apoyar las conversaciones de asesoría; los demás participantes no reciben tus respuestas individuales.",
            "Con partes legales, regulatorias o de seguridad si se requiere para cumplir la ley, proteger derechos, prevenir fraude o responder solicitudes legales."
          ]
        },
        {
          title: "8. Retención de datos",
          body: [
            "Conservamos información personal solo durante el tiempo razonablemente necesario para los fines descritos en esta política, salvo que la ley requiera o permita un periodo mayor. Los registros de evaluación pueden conservarse para seguimiento, preparación de asesoría, operación interna y registro. Los borradores guardados en tu navegador permanecen hasta que los borres o sean reemplazados.",
            "Los registros de evaluación, eventos de email y solicitudes de contacto se conservan solo durante el tiempo razonablemente necesario para seguimiento de asesoría, operación, seguridad y cumplimiento legal; después se eliminan o anonimizan cuando ya no sean necesarios."
          ]
        },
        {
          title: "9. Seguridad",
          body: [
            "Usamos medidas administrativas, técnicas y organizacionales razonables para proteger la información personal. Ningún sitio web, sistema de almacenamiento o método de transmisión es completamente seguro, por lo que no podemos garantizar seguridad absoluta.",
            "Recomendación operativa: limitar acceso a registros de evaluación a quienes lo necesiten, usar contraseñas fuertes y autenticación de dos factores, evitar compartir credenciales sin protección y eliminar información que ya no sea necesaria."
          ]
        },
        {
          title: "10. Visitantes internacionales y transferencias de datos",
          body:
            "Personas de distintos países, incluyendo México y Estados Unidos, pueden acceder al sitio. La información personal puede procesarse en el país donde operen nuestros proveedores. Al usar el sitio, entiendes que tu información puede transferirse y procesarse en jurisdicciones con leyes de privacidad diferentes a las de tu ubicación."
        },
        {
          title: "11. Tus opciones y derechos",
          body: [
            "Dependiendo de dónde vivas, puedes tener derechos para solicitar acceso, corrección, eliminación, restricción, portabilidad u oposición a ciertos tratamientos de tu información personal. También puedes pedirnos que no te contactemos para comunicaciones de seguimiento.",
            "Para hacer una solicitud, escribe a info@gilbertdevlyn.com. Es posible que necesitemos verificar tu identidad antes de atender la solicitud. Algunas solicitudes pueden estar limitadas por requisitos legales, de seguridad, operación o registro."
          ]
        },
        {
          title: "12. Aviso de privacidad de California",
          body:
            "Si el negocio está sujeto a la California Consumer Privacy Act (CCPA/CPRA), residentes de California pueden tener derechos a conocer, eliminar, corregir, optar por no vender o compartir información, limitar ciertos usos de información sensible y no ser discriminados por ejercer derechos de privacidad. Este borrador asume que el sitio no vende información personal ni la comparte para publicidad conductual entre contextos. Asesoría legal debe confirmar si CCPA/CPRA aplica según ingresos, volumen de registros de California y prácticas de datos."
        },
        {
          title: "13. Menores",
          body:
            "El sitio y la autoevaluación están dirigidos a adultos y participantes de familias empresarias. No están dirigidos a menores de 13 años y no recopilamos intencionalmente información personal de menores de 13 años."
        },
        {
          title: "14. Cambios a esta política",
          body:
            "Podemos actualizar esta Política de Privacidad ocasionalmente. Si hacemos cambios materiales, actualizaremos la fecha de \"Última actualización\" y proporcionaremos aviso adicional cuando corresponda."
        },
        {
          title: "15. Contáctanos",
          body: [
            "Para preguntas o solicitudes de privacidad, contacta a:",
            "Gilbert Devlyn Advisory",
            "Email: info@gilbertdevlyn.com",
            "Dirección: Disponible bajo solicitud"
          ]
        }
      ]
    },
    resumeAssessment: {
      label: "Autoevaluación guardada",
      title: "¿Continuar tu autoevaluación?",
      body:
        "Encontramos una autoevaluación guardada en este navegador. Puedes continuar donde te quedaste o empezar de nuevo con un formulario limpio.",
      answeredLabel: "Respondidas",
      currentLabel: "Pregunta actual",
      updatedLabel: "Último guardado",
      continueCta: "Continuar la autoevaluación",
      startOverCta: "Empezar de nuevo"
    },
    assessmentIntro: {
      title: "Empieza con una autoevaluación sencilla",
      body:
        "En alrededor de 10 minutos, observa qué tan claramente toma decisiones y trabaja junta tu familia en ocho áreas prácticas.",
      startingPointNote:
        "Este es un punto de partida para la conversación. No es un plan de acción prescrito ni un juicio sobre la familia o la empresa.",
      introBadge: "Punto de partida sencillo",
      languageNote: "Disponible en EN y ES",
      journeyLabel: "Qué ocurre después",
      journey: [
        {
          title: "Construye un punto de partida compartido",
          body:
            "Tus respuestas le dan a Gilbert un contexto útil antes de la primera conversación, para que puedan centrarse en las áreas más importantes y donde el apoyo puede aportar valor."
        },
        {
          title: "Responde sin presión",
          body:
            "Las preguntas separan lo que existe de lo que no se ha comunicado, para que la incertidumbre no se trate como falla."
        },
        {
          title: "Mira las respuestas en un mapa visual sencillo",
          body:
            "Revisa un resumen claro y las conversaciones que pueden necesitar atención primero."
        }
      ],
      resultSignalsLabel: "Recibes",
      resultSignals: [
        "Una imagen clara de dónde están las cosas hoy",
        "Las conversaciones que pueden necesitar atención primero",
        "Un enlace privado para invitar a familiares y comparar perspectivas"
      ],
      notAuditTitle: "Un punto de partida sencillo y privado",
      gilbertContextTitle: "Por qué Gilbert empieza aquí",
      gilbertContextBody:
        "La autoevaluación ayuda a las familias a ver qué ya funciona, qué no está claro y qué conversación puede necesitar ocurrir primero.",
      coverageLabel: "8 áreas prácticas",
      coverageTitle: "Un mapa compartido para conversaciones que suelen ser difíciles de iniciar",
      coverageBody:
        "La autoevaluación observa la relación entre familia, propiedad y empresa. El objetivo no es producir un veredicto; es ayudar a la familia a ver qué conversaciones necesitan mayor claridad.",
      outcomesLabel: "Qué recibes",
      outcomesTitle: "Un punto de partida práctico",
      outcomes: [
        {
          title: "Una imagen más clara",
          body:
            "Observa cómo trabaja junta la familia hoy en visión, roles, propiedad, consejo, sucesión y legado."
        },
        {
          title: "Una forma compartida de hablar",
          body:
            "Usa un lenguaje claro y neutral para conversar sobre lo que funciona, lo que no está claro y lo que más importa."
        },
        {
          title: "Guía de siguientes pasos",
          body:
            "Recibe áreas sugeridas de enfoque y siguientes pasos prácticos para la conversación familiar."
        }
      ],
      conversationTitle: "Comienza con la autoevaluación",
      conversationBody:
        "Una vista útil para reuniones familiares, conversaciones de propiedad y discusiones de siguientes pasos.",
      conversationCta: "Iniciar la autoevaluación",
    },
    intro:
      "Una autoevaluación guiada para comprender ocho áreas prácticas que influyen en cómo la familia toma decisiones y trabaja junta.",
    notAudit:
      "Al guardar y solicitar tu reporte, tu perfil, respuestas y resultados se comparten automáticamente con Gilbert para preparar una conversación útil. Solicitar contacto es opcional e independiente de compartir tus resultados. Tus respuestas no se publican ni se comparten con otros familiares.",
    preAssessmentPrivacy: {
      title: "Antes de empezar",
      body:
        "Al guardar y solicitar tu reporte, tu perfil, respuestas y resultados se comparten automáticamente con Gilbert para preparar una conversación útil. Solicitar contacto es opcional e independiente de compartir tus resultados. Tus respuestas no se publican ni se comparten con otros familiares. Si invitas a otras personas, cada quien recibe sus propios resultados y Gilbert recibe la vista combinada. Puedes pausar en cualquier momento; tu avance se guarda en este navegador.",
      primaryCta: "Entendido, empezar",
      secondaryCta: "Leer la política de privacidad"
    },
    chooseMode: "Elige una modalidad",
    language: "Idioma",
    modes: {
      full: {
        title: "Completa la autoevaluación",
        description: "Responde 50 preguntas en ocho áreas prácticas. Toma alrededor de 10 minutos y le da a la familia un punto de partida útil.",
        meta: "50 preguntas · ~10 minutos · Mapa + resultado resumen"
      }
    },
    intake: {
      eyebrow: "Perfil del participante",
      title: "Cuéntanos sobre ti",
      body: "Tu rol ayuda a Gilbert a leer los resultados en el contexto correcto.",
      privacyReassurance:
        "Al guardar y solicitar tu reporte, tu perfil, respuestas y resultados se comparten automáticamente con Gilbert para preparar una conversación útil. Solicitar contacto es opcional e independiente de compartir tus resultados. Tus respuestas no se publican ni se comparten con otros familiares.",
      modeSectionLabel: "Antes de la autoevaluación",
      formLabel: "Antes de las preguntas",
      formTitle: "Ayúdanos a leer tu resultado en contexto",
      formNote: "Este perfil queda conectado a tu resultado y prepara el flujo de comparación.",
      contextTitle: "Por qué esto va primero",
      contextBody:
        "El rol, la generación y el acceso a información influyen en lo que cada persona puede ver. Este contexto hace que la autoevaluación sea más fácil de interpretar.",
      nextTitle: "Qué sigue",
      nextSteps: [
        "Completa este perfil breve",
        "Responde la autoevaluación en las ocho áreas prácticas",
        "Recibe un resultado con fortalezas, áreas de claridad y siguientes pasos sugeridos"
      ],
      includesTitle: "Tu resultado incluye",
      includes: [
        "Una imagen clara de dónde están las cosas hoy",
        "Puntajes por tema",
        "Solicitud de reporte resumen",
        "Estructura lista para comparación"
      ],
      privacyTitle: "Uso del perfil",
      privacyNote:
        "Las comparaciones identifican a las personas por rol, no por sus respuestas individuales pregunta por pregunta.",
      name: "Nombre",
      namePlaceholder: "Tu nombre",
      email: "Email",
      emailPlaceholder: "tu@correo.com",
      phone: "Teléfono",
      phoneCountry: "Código de país",
      phonePlaceholder: "Número de teléfono",
      relationship: "Relación con la empresa familiar",
      relationshipPlaceholder: "Selecciona una relación",
      relationshipOther: "Por favor especifica",
      relationshipOtherPlaceholder: "Describe tu relación",
      generation: "¿A qué generación perteneces?",
      generationPlaceholder: "Selecciona generación",
      country: "País",
      countrySearchPlaceholder: "Buscar país",
      countryNoResults: "No se encontraron países",
      required: "Requerido",
      requiredNote: "Completa todos los campos para continuar.",
      privacyAgreement: "Al continuar, aceptas nuestra",
      privacyLink: "Política de Privacidad",
      invalidEmail: "Ingresa un email válido.",
      invalidPhone: "Ingresa un teléfono válido.",
      completeMessage: "Completa los datos requeridos del perfil para continuar.",
      continue: "Continuar a las preguntas",
      phoneCountryOptions: PHONE_COUNTRY_OPTIONS,
      relationshipOptions: [
        { id: "founder", label: "Fundador" },
        { id: "family-working", label: "Familiar que trabaja en la empresa" },
        { id: "family-not-working", label: "Familiar que no trabaja en la empresa" },
        { id: "shareholder-non-family", label: "Accionista (no familiar)" },
        { id: "spouse-partner", label: "Cónyuge o pareja de un familiar" },
        { id: "other", label: "Otro" }
      ],
      generationOptions: [
        { id: "first", label: "Primera generación (fundador)" },
        { id: "second", label: "Segunda generación" },
        { id: "third-plus", label: "Tercera generación o posterior" }
      ],
      countryOptions: [
        { id: "mexico", label: "México" },
        { id: "united-states", label: "Estados Unidos" },
        { id: "canada", label: "Canadá" },
        { id: "colombia", label: "Colombia" },
        { id: "spain", label: "España" },
        { id: "other", label: "Otro" }
      ]
    },
    start: "Comenzar",
    back: "Atrás",
    next: "Siguiente",
    finish: "Ver resultado",
    questionOf: "Pregunta",
    of: "de",
    pillar: "Tema",
    scorePrompt: "¿Qué tan cierto es esto para tu familia hoy?",
    scale: [
      "No es cierto para nosotros",
      "Rara vez es cierto",
      "A veces es cierto",
      "Frecuentemente es cierto",
      "Mayormente es cierto",
      "Es muy cierto para nosotros"
    ],
    scaleNote:
      "Consejo: Puedes presionar 0-5 en tu teclado para elegir una respuesta y luego presionar Enter o Espacio para continuar. Elige No estoy seguro / No sé cuando no tengas suficiente visibilidad. No contará contra el puntaje.",
    scaleAnchors: [
      "No es cierto para nosotros",
      "Rara vez es cierto",
      "A veces es cierto",
      "Frecuentemente es cierto",
      "Mayormente es cierto",
      "Es muy cierto para nosotros"
    ],
    unknownOption: {
      label: "No lo sé",
      body: "No tengo suficiente información para responder."
    },
    transparencyInsight: {
      label: "Señal de transparencia",
      title: "Parte de la información puede no estar llegando a todos",
      body:
        "Varias respuestas fueron marcadas como no conocidas. Eso no reduce el puntaje, pero sí señala áreas donde la información sobre roles o decisiones puede no ser visible para todos los familiares.",
      countLabel: "Respuestas sin información",
      pillarLabel: "Pilares más afectados"
    },
    loadingTitle: "Preparando tu resultado",
    loadingBody: "Tus respuestas se están organizando en las ocho áreas prácticas.",
    overallScore: "Puntaje general",
    maturityStage: "Dónde están las cosas hoy",
    pillarScores: "Vista por tema",
    noScore: "Sin puntaje",
    whatCanDo: "Qué puede hacer la familia",
    consultantSupport: "Cómo puede ayudar Gilbert",
    reflection: "Resultado",
    downloadPdf: "Solicitar reporte resumen",
    retake: "Comenzar de nuevo",
    viewFull: "Ver resumen por tema",
    fullCtas: [
      "Profundizar en estos temas",
      "Hablar siguientes pasos con Gilbert",
      "Solicitar reporte resumen"
    ],
    comparison: {
      inviteTitle: "Invitar a otro familiar",
      inviteBody:
        "Ingresa su email y enviaremos una invitación privada para que complete la autoevaluación y comparen perspectivas.",
      invitePrivacyNote:
        "Solo se comparan diferencias por pilar. Las respuestas individuales no se comparten pregunta por pregunta.",
      inviteEmail: "Email del familiar",
      inviteEmailPlaceholder: "familiar@correo.com",
      generateInvite: "Enviar invitación por email",
      sendingInvite: "Enviando invitación...",
      copyInvite: "Copiar invitación",
      copied: "Liga copiada",
      inviteReady: "Email de invitación listo",
      inviteSent: "Invitación enviada",
      inviteSentBody: "Enviamos la liga privada de grupo a {email}.",
      inviteSentModalTitle: "Invitación enviada por email",
      inviteSentModalBody:
        "Enviamos la liga privada de grupo a {email}. Esa persona puede abrir el email y completar la autoevaluación dentro del mismo grupo de comparación.",
      inviteSentModalDone: "Listo, guardar autoevaluación",
      inviteNote:
        "La persona invitada recibirá la liga privada de grupo por email.",
      inviteEmailRequired: "Ingresa un email antes de enviar la invitación.",
      inviteSendError: "No pudimos enviar la invitación. Intenta de nuevo.",
      participantCount: "Perspectivas completadas",
      maxNote: "Hasta 3 personas pueden compararse en esta versión.",
      inviteLimit: "Este grupo ya tiene 3 perspectivas completadas.",
      viewComparison: "Ver comparación del grupo",
      saveBeforeComparison:
        "Guarda este resultado solicitando tu reporte resumen antes de ver la comparación del grupo.",
      waitingTitle: "Esperando otra perspectiva",
      waitingBody:
        "La comparación se abrirá automáticamente cuando una segunda persona complete la autoevaluación desde esta liga.",
      pageLabel: "Comparación grupal",
      title: "Comparar perspectivas familiares",
      intro:
        "Esta vista mantiene la comparación sencilla: puntajes por pilar, brechas principales, áreas de convergencia y señales de transparencia por rol.",
      privacyNote: "Privacidad: las personas se identifican por rol y generación, no por nombre.",
      backToResult: "Volver al resultado individual",
      participants: "Perspectivas",
      overall: "General",
      pillarComparison: "Comparación por pilar",
      convergenceTitle: "Áreas de convergencia",
      convergenceBody: "Pilares donde las perspectivas están ampliamente alineadas.",
      noConvergence: "Todavía no hay convergencia clara.",
      divergenceTitle: "Áreas de divergencia",
      divergenceBody: "Pilares con una diferencia mayor a 20 puntos.",
      noDivergence: "No hay diferencias mayores a 20 puntos.",
      transparencyTitle: "Brechas de transparencia",
      transparencyBody:
        "Pilares donde una perspectiva tiene información limitada mientras otra ve la práctica con mayor claridad.",
      noTransparency: "No apareció una brecha importante de transparencia.",
      groupCallCta: "Contactar a Gilbert sobre esta comparación",
      scoreGap: "Brecha",
      unknownResponses: "Sin información"
    },
    footerRights: "© 2026 Gilbert Devlyn Advisory. Todos los derechos reservados.",
    contactEmail: "info@gilbertdevlyn.com"
  }
};
