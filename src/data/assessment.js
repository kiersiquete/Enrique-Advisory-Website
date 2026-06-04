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
  { id: "ph", countryCode: "PH", dialCode: "+63" },
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
      en: "Family Governance Bodies",
      es: "Órganos de Gobierno Familiar"
    },
    shortLabels: {
      en: "Family bodies",
      es: "Órganos familiares"
    },
    descriptions: {
      en: "Spaces for family dialogue, decisions, and follow-up.",
      es: "Espacios para conversar, decidir y dar seguimiento a temas familiares."
    }
  },
  {
    id: "ownership",
    labels: {
      en: "Ownership Governance",
      es: "Gobierno de la Propiedad"
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
      en: "Business Governance (Board)",
      es: "Gobierno Empresarial (Consejo)"
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
      en: "Management & Professionalization",
      es: "Gestión y Profesionalización"
    },
    shortLabels: {
      en: "Management",
      es: "Gestión"
    },
    descriptions: {
      en: "Professional roles, authority, performance, and succession practices.",
      es: "Roles profesionales, autoridad, desempeño y prácticas de sucesión."
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
    "There is alignment on what should remain constant as the business evolves."
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
    "Family governance meetings create enough space for listening and participation."
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
    "There is a formal CEO succession plan.",
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
    "Existe alineación sobre aquello que debe permanecer constante mientras la empresa evoluciona."
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
    "Las reuniones de gobierno familiar crean espacio suficiente para escuchar y participar."
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
    "Hay un plan formal de sucesión del CEO.",
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
      en: "Governance is mostly informal and dependent on key individuals. Rules live more in people than in shared structures.",
      es: "La gobernanza es principalmente informal y depende de personas clave. Las reglas viven más en las personas que en estructuras compartidas."
    },
    reflections: {
      en: "This result points to a family business where trust, habit, and individual leadership may still carry much of the governance work. That can feel natural, especially when relationships are close, but it also makes this a useful moment to name what the family wants to preserve and begin giving it shared form.",
      es: "Este resultado sugiere una empresa familiar donde la confianza, la costumbre y el liderazgo individual todavía sostienen buena parte de la gobernanza. Eso puede sentirse natural, especialmente cuando las relaciones son cercanas, pero también abre un momento valioso para nombrar lo que la familia quiere preservar y empezar a darle forma compartida."
    },
    whatCanDo: {
      en: [
        "Clarify shared values and purpose",
        "Create formal family discussion spaces",
        "Begin documenting basic rules"
      ],
      es: [
        "Clarificar valores y propósito compartido",
        "Crear espacios formales de conversación familiar",
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
      en: "Governance is formalized and works consistently. There is stronger alignment between family, ownership, and business.",
      es: "La gobernanza está formalizada y funciona de manera consistente. Hay mayor alineación entre familia, propiedad y empresa."
    },
    reflections: {
      en: "This result reflects a family business with important governance foundations already in place. The next conversation is less about creating structure from zero and more about strengthening how those structures perform when decisions become more complex.",
      es: "Este resultado refleja una empresa familiar con bases importantes de gobernanza ya instaladas. La siguiente conversación no consiste tanto en crear estructura desde cero, sino en fortalecer cómo funcionan esas estructuras cuando las decisiones se vuelven más complejas."
    },
    whatCanDo: {
      en: [
        "Strengthen governance body performance",
        "Deepen professionalization",
        "Prepare concrete generational transitions"
      ],
      es: [
        "Fortalecer el desempeño de los órganos de gobierno",
        "Profundizar la profesionalización",
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
      es: "Institucionalizado / Avanzado"
    },
    descriptions: {
      en: "The family and the business operate as a solid institution, prepared for long-term continuity and generational transitions.",
      es: "La familia y la empresa operan como una institución sólida, preparada para la continuidad de largo plazo y las transiciones generacionales."
    },
    reflections: {
      en: "This result suggests a mature governance system with strong continuity practices. The work now is to keep the system alive, relevant, and connected to the family's purpose as the business, ownership group, and next generation continue to evolve.",
      es: "Este resultado sugiere un sistema de gobernanza maduro, con prácticas sólidas de continuidad. El trabajo ahora es mantener el sistema vivo, relevante y conectado con el propósito de la familia a medida que evolucionan la empresa, la propiedad y la siguiente generación."
    },
    whatCanDo: {
      en: [
        "Optimize governance for long-term continuity",
        "Protect cohesion and legacy",
        "Review structures as the family or strategy evolves"
      ],
      es: [
        "Optimizar gobernanza para el largo plazo",
        "Cuidar cohesión y legado",
        "Revisar estructuras ante cambios familiares o estratégicos"
      ]
    }
  }
];

export const SUPPORT_MESSAGE = {
  en: "Gilbert helps families turn a diagnosis into structured conversations, clearer decisions, and practical governance work that can actually be executed.",
  es: "Gilbert ayuda a las familias a convertir el diagnóstico en conversaciones estructuradas, decisiones más claras y trabajo práctico de gobierno que realmente pueda ejecutarse."
};

export const COPY = {
  en: {
    appName: "Family Business Maturity Tool",
    brandName: "Gilbert Devlyn",
    brandLine: "Family business advisory",
    sideQuote:
      "Strong families build businesses. Aligned families sustain them.",
    nav: {
      home: "Home",
      about: "About",
      assessment: "Assessment"
    },
    booking: {
      startAssessment: "Start Assessment",
      takeAssessment: "Take the Assessment",
      getGovernanceScore: "Get Your Governance Score",
      bookStrategyCall: "Request a Follow-up",
      modalLabel: "Follow-up Request",
      modalTitle: "Request a Follow-up with Gilbert Devlyn",
      modalIntro:
        "Choose a time to speak with Gilbert about what your result is showing and where his guidance could help the family move from insight to action.",
      modalIntroByCategory: {
        low:
          "Your result points to areas where more clarity and structure may be helpful. Gilbert can help identify what should be addressed first, who needs to be involved, and how to start without creating unnecessary tension.",
        mid:
          "Your result shows useful foundations with room to strengthen the system. Gilbert can help prioritize the few governance moves that would make the biggest practical difference.",
        high:
          "Your result suggests strong governance foundations. Gilbert can help pressure-test continuity, succession, and owner alignment so the system stays useful as the family evolves."
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
      },
      contactRequested: "Request sent"
    },
    home: {
      title: "Clarity for the decisions that shape your family business",
      subtitle:
        "A structured reflection tool to align ownership, leadership, and continuity before tensions become decisions.",
      body:
        "Built from best practices around the world and lived experience inside a multigenerational family business, this tool helps surface what is often left unsaid so families can move forward with clarity and structure.",
      gilbertTitle: "Who is Gilbert?",
      gilbertBody:
        "Gilbert Devlyn brings firsthand experience from within a leading third generation family business group. As a family member, owner, and board member, he has been directly involved in decisions that shape continuity across generations.",
      primaryCta: "Start the conversation",
      secondaryCta: "About Gilbert",
      valueTitle: "Why the advisory matters",
      valueBody:
        "Family business decisions carry more than operational weight: they affect trust, continuity, ownership, and future roles. Gilbert gives families a neutral space to name what is hard to say, align around priorities, and turn sensitive conversations into workable agreements.",
      businessTitle: "What his consultancy focuses on",
      businessBody:
        "Gilbert works with families at the intersection of ownership, leadership, and family dynamics, helping move from implicit tensions to clear agreements.",
      helpingTitle: "Who this is for",
      helpingItems: [
        "Founders and senior generations thinking about continuity",
        "Next-generation members preparing for future roles",
        "Family shareholders seeking clarity on roles and responsibilities",
        "Boards navigating the intersection of family and business"
      ],
      evidence: {
        label: "Research-backed value",
        title: "What structured advisory helps change",
        intro:
          "The value is not more meetings. It is turning informal family assumptions into explicit decisions, communication rhythms, succession paths, and rules for disagreement before pressure forces the conversation.",
        sourceNote:
          "Benchmarks below are drawn from public PwC, Deloitte, and EY / University of St.Gallen family-business research. They are industry indicators, not private Gilbert Devlyn client results.",
        stats: [
          {
            value: "$8.8T",
            label:
              "annual revenue generated by the world's 500 largest family businesses"
          },
          {
            value: "23%",
            label:
              "of surveyed family businesses are actively implementing CEO succession plans"
          },
          {
            value: "19%",
            label:
              "of surveyed family businesses have a formal conflict-resolution mechanism"
          }
        ],
        comparisonHeaders: {
          informal: "Informal family-business pattern",
          advisory: "With structured advisory discipline"
        },
        comparisons: [
          {
            theme: "Succession",
            informal:
              "Succession is recognized as critical, but planning often stays behind daily business pressure.",
            advisory:
              "Leadership transition becomes a recurring agenda: readiness, role criteria, timing, and ownership expectations are made visible."
          },
          {
            theme: "Family alignment",
            informal:
              "Values and purpose may be understood by senior leaders but remain unwritten or weakly communicated across generations.",
            advisory:
              "The family documents shared principles, decision rights, and communication cadences so alignment is not dependent on memory or hierarchy."
          },
          {
            theme: "Conflict",
            informal:
              "Disagreement is handled personally, late, or through informal authority, which can turn normal tension into distrust.",
            advisory:
              "Families define how dissent is raised, who decides, and how sensitive topics move forward without exposing individual responses."
          },
          {
            theme: "Decision speed",
            informal:
              "Organizational, leadership, and decision-making challenges can slow down agility even when the business has strong market instincts.",
            advisory:
              "Clear governance roles help the family separate ownership, board, executive, and next-generation conversations."
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
        "The tool is a starting point for reflection, not a judgment of the family or the business.",
      approachTitle: "How Gilbert works with families",
      approachSubtitle:
        "Every engagement begins with structured reflection - not advice, but better questions.",
      approachBlocks: [
        {
          title: "Structure before solutions",
          body:
            "Most governance challenges are conversations waiting to happen. The work begins by naming what is already present and giving it structure."
        },
        {
          title: "Grounded neutrality",
          body:
            "Neutrality grounded in lived experience as a family member, owner, and board member."
        },
        {
          title: "Governance built for your context",
          body:
            "No one-size-fits-all model - structures are built around each family's reality."
        },
        {
          title: "Follow-through that sustains decisions",
          body:
            "Clear roles, responsibilities, and rhythms so decisions endure."
        }
      ],
      toolTitle: "Why this tool exists",
      toolParagraphs: [
        "Most business families don't know where to start - before structures, they need a shared understanding.",
        "Not a scorecard or verdict - a structured map to start aligned conversations.",
        "Free to use and available in English and Spanish."
      ],
      toolCta: "Start the assessment",
      ctaTitle: "Start the conversation today",
      ctaBody:
        "Create a shared language to talk about governance, continuity, and roles - without judgment or pressure.",
      ctaButton: "Check your family enterprise governance score",
      ctaNote: "Available in English and Español. Takes 5–10 minutes."
    },
    about: {
      label: "About Gilbert",
      title: "Helping families have the conversations that shape what comes next",
      bio: [
        "Gilbert Devlyn comes from a multigenerational family business and has worked within the complexity that comes with it: a cousin consortium, a board, a family council, shareholders, and multiple decision-making spaces that do not always align.",
        "Across that system, different generations, perspectives, and life stages coexist: founders, siblings, cousins, and next-generation members looking to step in and take a role. Each brings valid expectations, but not always the same timeline or view of the future.",
        "As a family member, owner, and board participant, he experienced what it takes to operate in that environment, where tensions are real, alignment is often implicit, and progress depends on how conversations are handled.",
        "He chaired the Family Council and the NextGen Committee, and spent over 12 years working inside the family business, most recently as Human Capital Director. Working across family, ownership, and leadership roles, he learned how to navigate complexity, make conflict more productive, and turn it into decisions that move things forward.",
        "At under 40, he sits close enough to the next generation to understand their perspective and their drive to step in, while also having built experience within the system they are entering. This allows him to work across generations with credibility, helping turn tension into progress rather than friction.",
        "Today, he works with other business families facing similar dynamics, helping them make sense of what is already happening, bring the right conversations to the surface, and move forward with clarity."
      ],
      heroCta: "Start assessment",
      educationTitle: "Education & Certifications",
      educationItems: [
        "International MBA (IMBA), University of Denver — Focus in Family Business Consulting",
        "Bachelor's degrees in Management and Marketing",
        "Certificate in Family Business Advising — Family Firm Institute",
        "Certificate in Family Wealth Advising — Family Firm Institute",
        "Certified Professional Coach — iPEC",
        "Board Director Diploma — IMD"
      ],
      focusTitle: "Areas of Focus",
      focusItems: [
        "Family governance and council facilitation",
        "Structuring and professionalizing the family system",
        "Ownership transition and succession",
        "Next-generation development and readiness",
        "Board advisory and role clarity",
        "Coaching for difficult conversations",
        "Coaching and mentorship for next-generation members stepping into ownership and leadership roles"
      ],
      testimonialsTitle: "Discreet by design",
      testimonialsSubtitle:
        "Most of the work happens in moments that are not meant to be public: family conversations, ownership decisions, and transitions that require trust and confidentiality. For that reason, client relationships are handled privately and references are shared directly, when appropriate.",
      situationsTitle: "Where this work helps",
      situations: [
        "A family preparing how next-generation members step into ownership and leadership",
        "Siblings aligning after a founder transition",
        "Shareholders clarifying roles, rights, and expectations",
        "Family councils that exist but are not being fully used",
        "Important decisions that feel stuck because the conversation hasn't happened"
      ],
      toolTitle: "Why this tool matters",
      toolBody:
        "This tool is grounded in best practices in family business governance, drawing on frameworks developed by organizations such as the Family Firm Institute (FFI) and leading academic research in multigenerational enterprise.",
      toolBodySecond:
        "At its core, it reflects a simple reality: most business families don't know where to start. Before protocols, boards, or formal structures, families need a shared understanding of where they are.",
      toolBodyThird:
        "This is not a scorecard. It doesn't compare families or produce a verdict. Instead, it provides a structured way to map conversations across key governance areas - so dialogue can begin from alignment rather than assumptions.",
      toolBodyFourth:
        "I didn't create this tool, but I believe strongly in its value as a way to help families start conversations that are often difficult to have. When used thoughtfully, it becomes a practical starting point for clarity and progress.",
      toolCta: "Start the assessment"
    },
    cookieConsent: {
      title: "Cookies are required to use the diagnostic",
      body:
        "This assessment uses cookies to keep your progress, connect your result to the comparison flow, and support result capture. Please accept cookies before starting or continuing the assessment.",
      accept: "Accept cookies",
      reject: "Reject"
    },
    resumeAssessment: {
      label: "Saved diagnostic",
      title: "Continue your assessment?",
      body:
        "We found a saved assessment in this browser. You can continue where you left off or start again with a clean form.",
      answeredLabel: "Answered",
      currentLabel: "Current question",
      updatedLabel: "Last saved",
      continueCta: "Continue assessment",
      startOverCta: "Start over"
    },
    assessmentIntro: {
      title: "Choose how you want to start the conversation",
      body:
        "Begin with a complete reflection across all eight governance dimensions, ideal for family meetings and an in-depth understanding of your enterprising family.",
      introBadge: "Private, role-aware, bilingual",
      languageNote: "Available in EN and ES",
      journeyLabel: "What happens next",
      journey: [
        {
          title: "Start with context",
          body:
            "The profile screen captures whether the respondent is a founder, active family member, spouse, or shareholder."
        },
        {
          title: "Reflect without pressure",
          body:
            "Questions separate what exists from what has not been communicated, so uncertainty is not treated as failure."
        },
        {
          title: "Turn answers into a map",
          body:
            "The result highlights maturity, priority pillars, transparency signals, and a private invite link for comparison."
        }
      ],
      resultSignalsLabel: "You leave with",
      resultSignals: [
        "Maturity stage",
        "Priority pillars",
        "Comparison link"
      ],
      notAuditTitle: "Built for sensitive rooms",
      coverageLabel: "Eight governance pillars",
      coverageTitle: "A shared map for the conversations families often avoid",
      coverageBody:
        "Each dimension reflects how family, ownership, and business intersect - highlighting where alignment is needed.",
      outcomesLabel: "What you receive",
      outcomesTitle: "A practical starting point",
      outcomes: [
        {
          title: "A clearer picture",
          body:
            "A clearer picture of how your family experiences governance today."
        },
        {
          title: "Language for alignment",
          body:
            "A shared language to discuss what is unclear and what matters most."
        },
        {
          title: "Next-step guidance",
          body:
            "Clear next steps to move the conversation forward."
        }
      ],
      conversationTitle: "Begin with the assessment",
      conversationBody:
        "A complete view for family meetings, ownership conversations, and advisory discussions.",
      conversationCta: "Start the assessment",
    },
    intro:
      "A guided self-reflection for family-owned businesses to understand governance maturity across eight pillars.",
    notAudit:
      "This is a reflection tool, not an audit, test, or ranking. The result is meant to support better conversations.",
    chooseMode: "Choose a mode",
    language: "Language",
    modes: {
      full: {
        title: "Complete Assessment",
        description: "Complete reflection across all eight governance dimensions - ideal for family meetings and an in-depth understanding of your enterprising family. (10 mins)",
        meta: "50 questions · ~10 minutes · Radar chart + full result"
      }
    },
    intake: {
      eyebrow: "Respondent profile",
      title: "Tell us about yourself",
      body:
        "The same answer can mean something different depending on whether it comes from a founder, family member, spouse, or shareholder.",
      formLabel: "Before the questions",
      formTitle: "Help us read your result in context",
      formNote: "This profile stays connected to your result and prepares the comparison flow.",
      contextTitle: "Why this comes first",
      contextBody:
        "Family governance is shaped by role, generation, and access to information. This context makes the diagnostic more useful.",
      nextTitle: "What happens next",
      nextSteps: [
        "Complete this short profile",
        "Answer the diagnostic across the governance pillars",
        "Receive a result with priorities, transparency signals, and next steps"
      ],
      includesTitle: "Your result includes",
      includes: [
        "Overall maturity stage",
        "Pillar-by-pillar scores",
        "Detailed PDF report",
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
    finish: "See reflection",
    questionOf: "Question",
    of: "of",
    pillar: "Pillar",
    scorePrompt: "How true is this for your family today?",
    scale: [
      "Not true for us",
      "Rarely true",
      "Sometimes true",
      "Often true",
      "Mostly true",
      "Very true for us"
    ],
    scaleNote: "Choose Not sure / I don't know when you do not have enough visibility. It will not count against the score.",
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
        "This often indicates that information is not fully shared across the family, or that roles and expectations are not clearly defined. It is a signal about clarity and visibility, not low maturity.",
      countLabel: "Unknown responses",
      pillarLabel: "Most affected pillars"
    },
    completedPillar: "Completed",
    nextPillar: "Next pillar",
    continueToNextPillar: "Continue to Next Pillar",
    loadingTitle: "Preparing your reflection",
    loadingBody: "Your responses are being organized across the eight pillars.",
    overallScore: "Overall score",
    maturityStage: "Maturity stage",
    pillarScores: "Pillar view",
    noScore: "Not scored",
    whatCanDo: "What the family can do",
    consultantSupport: "How Gilbert can help",
    reflection: "Reflection",
    downloadPdf: "Download detailed PDF report",
    retake: "Start again",
    viewFull: "View Full Diagnosis",
    fullCtas: [
      "Explore these topics further",
      "Discuss next steps with Gilbert",
      "Download detailed PDF report"
    ],
    comparison: {
      inviteTitle: "Invite another family member",
      inviteBody:
        "Create a private group link so another person can complete the diagnostic and compare perspectives.",
      inviteEmail: "Family member email",
      inviteEmailPlaceholder: "family@example.com",
      generateInvite: "Generate invite link",
      copyInvite: "Copy invite link",
      copied: "Link copied",
      inviteReady: "Invitation link ready",
      inviteNote:
        "Email sending will be connected later. For now, share this link directly for the demo.",
      participantCount: "Completed perspectives",
      maxNote: "Up to 3 people can be compared in this version.",
      inviteLimit: "This comparison group already has 3 completed perspectives.",
      viewComparison: "View group comparison",
      waitingTitle: "Waiting for another perspective",
      waitingBody:
        "The comparison will open automatically once a second person completes the assessment through this link.",
      pageLabel: "Group comparison",
      title: "Compare family governance perspectives",
      intro:
        "This view compares pillar scores by role. It does not show another person's individual question-by-question answers.",
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
    contactEmail: "partner@gilbertdevlyn.com"
  },
  es: {
    appName: "Herramienta de Madurez para Empresas Familiares",
    brandName: "Gilbert Devlyn",
    brandLine: "Asesoría para empresas familiares",
    sideQuote:
      "Las familias fuertes construyen empresas. Las familias alineadas las sostienen.",
    nav: {
      home: "Inicio",
      about: "Acerca de",
      assessment: "Diagnóstico"
    },
    booking: {
      startAssessment: "Iniciar Diagnóstico",
      takeAssessment: "Tomar el Diagnóstico",
      getGovernanceScore: "Obtener Puntaje de Gobierno",
      bookStrategyCall: "Solicitar seguimiento",
      modalLabel: "Solicitud de seguimiento",
      modalTitle: "Solicita seguimiento con Gilbert Devlyn",
      modalIntro:
        "Comparte tu resultado y datos de contacto para que Gilbert pueda buscarte personalmente.",
      modalIntroByCategory: {
        low:
          "Tu resultado señala áreas donde mayor claridad y estructura pueden ayudar. Gilbert puede ayudar a definir qué atender primero, quién debe participar y cómo empezar sin crear tensión innecesaria.",
        mid:
          "Tu resultado muestra bases útiles con espacio para fortalecer el sistema. Gilbert puede ayudar a priorizar los pocos movimientos de gobierno que harían mayor diferencia práctica.",
        high:
          "Tu resultado sugiere bases sólidas de gobierno. Gilbert puede ayudar a poner a prueba continuidad, sucesión y alineación de propietarios para que el sistema siga siendo útil mientras la familia evoluciona."
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
      },
      contactRequested: "Solicitud enviada"
    },
    home: {
      title: "Reflexión guiada sobre gobierno para empresas familiares",
      subtitle:
        "Gilbert Devlyn trabaja con familias empresarias en el punto donde se cruzan propiedad, liderazgo y relaciones familiares. Desde su propia experiencia dentro de Grupo Devlyn, esta herramienta ayuda a abrir una conversación más clara sobre continuidad, roles, decisiones y estructuras para proteger el legado familiar.",
      primaryCta: "Iniciar Tu Diagnóstico",
      secondaryCta: "Conocer a Gilbert",
      valueTitle: "Por qué importa la asesoría",
      valueBody:
        "Las decisiones de una empresa familiar tienen más peso que lo operativo: afectan la confianza, la continuidad, la propiedad y los roles futuros. La asesoría ofrece un espacio neutral para nombrar lo difícil, alinear prioridades y convertir conversaciones sensibles en acuerdos posibles.",
      businessTitle: "Qué hace la asesoría",
      businessBody:
        "Hoy guía a otras familias empresarias en la profesionalización de lo más importante: la familia misma. Su trabajo combina coaching profesional, consultoría en gobierno familiar y asesoría de consejo para familias en transición, especialmente cuando las decisiones siguen siendo informales, las tensiones se sienten pero no se nombran, o los modelos tradicionales de consultoría se perciben distantes.",
      helpingTitle: "A quién ayuda",
      helpingItems: [
        "Fundadores y generaciones senior que reflexionan sobre continuidad",
        "Miembros de la siguiente generación que se preparan para futuros roles",
        "Accionistas familiares que necesitan mayor claridad sobre derechos, responsabilidades y comunicación",
        "Consejos y equipos directivos que gestionan el cruce entre familia y empresa"
      ],
      evidence: {
        label: "Valor respaldado por investigación",
        title: "Qué ayuda a cambiar una asesoría estructurada",
        intro:
          "El valor no está en tener más juntas. Está en convertir supuestos familiares informales en decisiones explícitas, ritmos de comunicación, rutas de sucesión y reglas para tratar desacuerdos antes de que la presión obligue a conversar.",
        sourceNote:
          "Los datos son referencias públicas de investigaciones de PwC, Deloitte y EY / University of St.Gallen sobre empresas familiares. Son indicadores de industria, no resultados privados de clientes de Gilbert Devlyn.",
        stats: [
          {
            value: "$8.8T",
            label:
              "en ingresos anuales generados por las 500 empresas familiares más grandes del mundo"
          },
          {
            value: "23%",
            label:
              "de empresas familiares encuestadas implementan activamente planes de sucesión de CEO"
          },
          {
            value: "19%",
            label:
              "de empresas familiares encuestadas tienen un mecanismo formal para resolver conflictos"
          }
        ],
        comparisonHeaders: {
          informal: "Patrón informal en la empresa familiar",
          advisory: "Con disciplina de asesoría estructurada"
        },
        comparisons: [
          {
            theme: "Sucesión",
            informal:
              "La sucesión se reconoce como crítica, pero la planeación suele quedarse detrás de la presión del día a día.",
            advisory:
              "La transición de liderazgo entra en una agenda recurrente: preparación, criterios de rol, tiempos y expectativas de propiedad se vuelven visibles."
          },
          {
            theme: "Alineación familiar",
            informal:
              "Los valores y el propósito pueden estar claros para líderes senior, pero no siempre están escritos o comunicados entre generaciones.",
            advisory:
              "La familia documenta principios compartidos, derechos de decisión y ritmos de comunicación para que la alineación no dependa de memoria o jerarquía."
          },
          {
            theme: "Conflicto",
            informal:
              "El desacuerdo se maneja de forma personal, tardía o mediante autoridad informal, convirtiendo tensión normal en desconfianza.",
            advisory:
              "La familia define cómo se plantea el desacuerdo, quién decide y cómo avanzan los temas sensibles sin exponer respuestas individuales."
          },
          {
            theme: "Velocidad de decisión",
            informal:
              "Los retos organizacionales, de liderazgo y decisión pueden frenar la agilidad aunque el negocio tenga buenos instintos de mercado.",
            advisory:
              "Roles claros de gobierno ayudan a separar conversaciones de propiedad, consejo, equipo ejecutivo y siguiente generación."
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
        "La herramienta es un punto de partida para reflexionar, no un juicio sobre la familia o la empresa.",
      approachTitle: "Cómo trabaja Gilbert con las familias",
      approachSubtitle:
        "Todo acompañamiento empieza con una reflexión estructurada — no con consejos, sino con mejores preguntas.",
      approachBlocks: [
        {
          title: "Estructura antes que soluciones",
          body:
            "La mayoría de los desafíos de una empresa familiar son conversaciones pendientes. Gilbert ayuda a las familias a nombrar lo que ya ocurre debajo de la superficie y a darle suficiente estructura para avanzar sin dañar las relaciones."
        },
        {
          title: "Neutralidad vivida",
          body:
            "Ha estado del otro lado de la mesa como familiar, propietario, ejecutivo y consejero. Esa experiencia hace que su neutralidad sea práctica, no distante, especialmente en temas de sucesión, propiedad y roles familiares."
        },
        {
          title: "Gobernanza que se ajusta a la familia",
          body:
            "No existe un único modelo de gobierno que funcione para todas las familias. Gilbert combina coaching, gobierno familiar y asesoría de consejo para construir desde la realidad de cada familia, no desde una plantilla genérica."
        },
        {
          title: "Seguimiento con cuidado",
          body:
            "Después de la reunión, el trabajo continúa con pasos concretos: acuerdos claros, responsables definidos y un ritmo familiar protegido para que las decisiones sobrevivan más allá de una buena conversación."
        }
      ],
      ctaTitle: "Empieza tu reflexión hoy",
      ctaBody:
        "La Herramienta de Madurez para Empresas Familiares le da a tu familia un lenguaje compartido para hablar de gobierno, continuidad y roles — sin juicios, rankings ni presión.",
      ctaButton: "Revisar Tu Puntaje de Gobierno",
      ctaNote: "Disponible en English y Español. Toma de 5 a 10 minutos."
    },
    about: {
      label: "Acerca de Gilbert",
      title: "Ayudando a las familias a tener las conversaciones que definen lo que sigue",
      bio: [
        "Gilbert Devlyn creció en una de las familias empresarias más grandes de México. Como miembro, propietario y consejero de Grupo Devlyn, vivió de primera mano lo que significa gestionar la relación entre familia y empresa: las tensiones, las decisiones difíciles y la responsabilidad de proteger un legado que trasciende generaciones.",
        "Fue Presidente del Consejo de Familia y del Consejo NextGen de la Familia Devlyn, y Chief Human Capital Officer del grupo de 2019 a 2025. Hoy guía a otras familias empresarias en momentos de transición, cuando las decisiones siguen siendo informales, las tensiones se sienten pero no siempre se expresan y los modelos tradicionales de consultoría pueden sentirse demasiado corporativos.",
        "Su enfoque combina coaching profesional, consultoría en gobierno familiar y asesoría de consejo, siempre desde la experiencia directa de haber estado del otro lado de la mesa. Gilbert no es un consultor que solo estudió el tema; lo vivió y decidió acompañar a otros en el mismo camino."
      ],
      heroCta: "Iniciar diagnóstico",
      educationTitle: "Educación y Certificaciones",
      educationItems: [
        "IMBA in Family Business Consulting — University of Denver",
        "Certificate in Family Business Advising — Family Firm Institute",
        "Certificate in Family Wealth Advising — Family Firm Institute",
        "Certified Professional Coach — iPEC",
        "Board Director Diploma — IMD Global Board Center"
      ],
      focusTitle: "Áreas de Enfoque",
      focusItems: [
        "Gobierno familiar y facilitación de consejos de familia",
        "Profesionalización del sistema familiar",
        "Transición de propiedad y planeación de sucesión",
        "Desarrollo y preparación de la siguiente generación",
        "Asesoría de consejo y claridad de roles familia-empresa",
        "Coaching para conversaciones difíciles y armonía familiar"
      ],
      testimonialsTitle: "Lo que dicen las familias",
      testimonialsSubtitle:
        "Estas reflexiones provienen de familias que han trabajado con Gilbert en distintas etapas de su camino de gobierno.",
      toolTitle: "Por qué Gilbert creó esta herramienta",
      toolBody:
        "La Herramienta de Madurez para Empresas Familiares surgió de una observación recurrente: muchas familias no saben por dónde empezar. Antes de un protocolo, antes de un consejo, antes de cualquier estructura de gobierno — las familias necesitan una imagen compartida de dónde están.",
      toolBodySecond:
        "Esta herramienta no es un scorecard. No compara familias ni produce un veredicto. Le da a la familia un mapa — en ocho pilares de gobierno — para que las conversaciones sobre qué mejorar partan de un entendimiento común y no de supuestos en competencia.",
      toolBodyThird:
        "La herramienta es gratuita y está disponible en English y Español.",
      toolCta: "Iniciar diagnóstico"
    },
    cookieConsent: {
      title: "Las cookies son necesarias para usar el diagnóstico",
      body:
        "Este diagnóstico usa cookies para guardar tu avance, conectar tu resultado con el flujo de comparación y apoyar la captura de resultados. Acepta las cookies antes de iniciar o continuar el diagnóstico.",
      accept: "Aceptar cookies",
      reject: "Rechazar"
    },
    resumeAssessment: {
      label: "Diagnóstico guardado",
      title: "¿Continuar tu diagnóstico?",
      body:
        "Encontramos un diagnóstico guardado en este navegador. Puedes continuar donde te quedaste o empezar de nuevo con un formulario limpio.",
      answeredLabel: "Respondidas",
      currentLabel: "Pregunta actual",
      updatedLabel: "Último guardado",
      continueCta: "Continuar diagnóstico",
      startOverCta: "Empezar de nuevo"
    },
    assessmentIntro: {
      title: "Inicia el diagnóstico de gobierno familiar",
      body:
        "En unos 10 minutos, mapea cómo vive la familia el gobierno en propiedad, liderazgo, sucesión, consejo y legado.",
      introBadge: "Privado, sensible al rol, bilingüe",
      languageNote: "Disponible en EN y ES",
      journeyLabel: "Qué ocurre después",
      journey: [
        {
          title: "Comienza con contexto",
          body:
            "La pantalla de perfil identifica si responde un fundador, familiar activo, cónyuge o accionista."
        },
        {
          title: "Reflexiona sin presión",
          body:
            "Las preguntas separan lo que existe de lo que no se ha comunicado, para que la incertidumbre no se trate como falla."
        },
        {
          title: "Convierte respuestas en mapa",
          body:
            "El resultado muestra madurez, pilares prioritarios, señales de transparencia y un enlace privado para comparar."
        }
      ],
      resultSignalsLabel: "Recibes",
      resultSignals: [
        "Etapa de madurez",
        "Pilares prioritarios",
        "Enlace de comparación"
      ],
      notAuditTitle: "Diseñado para conversaciones sensibles",
      coverageLabel: "Ocho pilares de gobierno",
      coverageTitle: "Un mapa compartido para conversaciones que suelen ser difíciles de iniciar",
      coverageBody:
        "El diagnóstico observa la relación entre familia, propiedad y empresa. El objetivo no es producir un veredicto; es ayudar a la familia a ver qué conversaciones necesitan mayor claridad.",
      outcomesLabel: "Qué recibes",
      outcomesTitle: "Un punto de partida práctico",
      outcomes: [
        {
          title: "Una imagen más clara",
          body:
            "Observa cómo la familia vive hoy el gobierno en visión, roles, propiedad, consejo, sucesión y legado."
        },
        {
          title: "Lenguaje para alinear",
          body:
            "Usa el resultado como un lenguaje neutral para conversar sobre lo que funciona, lo que no está claro y dónde puede ayudar la estructura."
        },
        {
          title: "Guía de siguientes pasos",
          body:
            "Recibe una etapa de madurez, áreas sugeridas de enfoque y siguientes pasos prácticos para la conversación familiar."
        }
      ],
      conversationTitle: "Comienza con el diagnóstico completo",
      conversationBody:
        "El diagnóstico completo ofrece la vista más útil para una reunión familiar, conversación de propiedad o discusión con un asesor.",
      conversationCta: "Iniciar diagnóstico completo",
    },
    intro:
      "Una autorreflexión guiada para que familias empresarias comprendan su madurez de gobierno en ocho pilares.",
    notAudit:
      "Esta es una herramienta de reflexión, no una auditoría, examen ni ranking. El resultado busca apoyar mejores conversaciones.",
    chooseMode: "Elige una modalidad",
    language: "Idioma",
    modes: {
      full: {
        title: "Diagnóstico Completo",
        description: "Una reflexión guiada y detallada en los ocho pilares.",
        meta: "50 preguntas · ~10 minutos · Radar + resultado completo"
      }
    },
    intake: {
      eyebrow: "Perfil del participante",
      title: "Cuéntanos sobre ti",
      body:
        "La misma respuesta puede significar algo distinto si viene de un fundador, familiar, cónyuge o accionista.",
      formLabel: "Antes de las preguntas",
      formTitle: "Ayúdanos a leer tu resultado en contexto",
      formNote: "Este perfil queda conectado a tu resultado y prepara el flujo de comparación.",
      contextTitle: "Por qué esto va primero",
      contextBody:
        "El gobierno familiar depende del rol, la generación y el acceso a información. Este contexto hace más útil el diagnóstico.",
      nextTitle: "Qué sigue",
      nextSteps: [
        "Completa este perfil breve",
        "Responde el diagnóstico por pilares de gobierno",
        "Recibe un resultado con prioridades, señales de transparencia y siguientes pasos"
      ],
      includesTitle: "Tu resultado incluye",
      includes: [
        "Etapa general de madurez",
        "Puntajes por pilar",
        "Reporte PDF detallado",
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
    finish: "Ver reflexión",
    questionOf: "Pregunta",
    of: "de",
    pillar: "Pilar",
    scorePrompt: "¿En qué medida está presente hoy?",
    scale: [
      "No está presente",
      "Muy limitado",
      "Ocasional",
      "Parcialmente presente",
      "Mayormente presente",
      "Presente de forma consistente"
    ],
    scaleNote: "0 = Para nada | 3 = Parcialmente | 5 = Completamente instalado",
    scaleAnchors: [
      "Para nada",
      "Muy limitado",
      "Primeras señales",
      "Parcialmente",
      "Mayormente instalado",
      "Completamente instalado"
    ],
    unknownOption: {
      label: "No lo sé",
      body: "No tengo suficiente información para responder."
    },
    transparencyInsight: {
      label: "Señal de transparencia",
      title: "Parte de la información puede no estar llegando a todos",
      body:
        "Varias respuestas fueron marcadas como no conocidas. Eso no reduce el puntaje, pero sí señala áreas donde la información de gobierno puede no ser visible para todos los familiares o stakeholders.",
      countLabel: "Respuestas sin información",
      pillarLabel: "Pilares más afectados"
    },
    completedPillar: "Completado",
    nextPillar: "Siguiente pilar",
    continueToNextPillar: "Continuar al Siguiente Pilar",
    loadingTitle: "Preparando tu reflexión",
    loadingBody: "Tus respuestas se están organizando en los ocho pilares.",
    overallScore: "Puntaje general",
    maturityStage: "Etapa de madurez",
    pillarScores: "Vista por pilar",
    noScore: "Sin puntaje",
    whatCanDo: "Qué puede hacer la familia",
    consultantSupport: "Cómo puede ayudar Gilbert",
    reflection: "Reflexión",
    downloadPdf: "Descargar reporte PDF detallado",
    retake: "Comenzar de nuevo",
    viewFull: "Ver diagnóstico completo",
    fullCtas: [
      "Profundizar en estos temas",
      "Hablar siguientes pasos con Gilbert",
      "Descargar reporte PDF detallado"
    ],
    comparison: {
      inviteTitle: "Invitar a otro familiar",
      inviteBody:
        "Crea una liga privada de grupo para que otra persona complete el diagnóstico y comparen perspectivas.",
      inviteEmail: "Email del familiar",
      inviteEmailPlaceholder: "familiar@correo.com",
      generateInvite: "Generar liga de invitación",
      copyInvite: "Copiar liga",
      copied: "Liga copiada",
      inviteReady: "Liga de invitación lista",
      inviteNote:
        "El envío por email se conectará después. Por ahora, comparte esta liga directamente para el demo.",
      participantCount: "Perspectivas completadas",
      maxNote: "Hasta 3 personas pueden compararse en esta versión.",
      inviteLimit: "Este grupo ya tiene 3 perspectivas completadas.",
      viewComparison: "Ver comparación del grupo",
      waitingTitle: "Esperando otra perspectiva",
      waitingBody:
        "La comparación se abrirá automáticamente cuando una segunda persona complete el diagnóstico desde esta liga.",
      pageLabel: "Comparación grupal",
      title: "Comparar perspectivas de gobierno familiar",
      intro:
        "Esta vista compara puntajes por pilar y rol. No muestra las respuestas individuales pregunta por pregunta de otra persona.",
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
    contactEmail: "partner@gilbertdevlyn.com"
  }
};
