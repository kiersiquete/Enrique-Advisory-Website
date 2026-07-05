import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AsYouType,
  parsePhoneNumberFromString,
  validatePhoneNumberLength
} from "libphonenumber-js/min";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CircleHelp,
  ClipboardCheck,
  Compass,
  Handshake,
  Landmark,
  Linkedin,
  Mail,
  Menu,
  Play,
  RefreshCcw,
  Scale,
  Search,
  Send,
  ShieldCheck,
  X,
  UsersRound
} from "lucide-react";
import {
  COPY,
  FULL_QUESTIONS,
  LANGUAGES,
  PHONE_COUNTRY_OPTIONS,
  PILLARS,
  SUPPORT_MESSAGE,
  UNKNOWN_ANSWER
} from "./data/assessment.js";
import { calculateResults, roundedScore } from "./utils/results.js";

const RadarPanel = lazy(() => import("./components/RadarPanel.jsx"));

const STORAGE_KEY = "family-business-maturity-latest";
const GROUP_STORAGE_KEY = "family-business-maturity-groups";
const ASSESSMENT_DRAFT_STORAGE_KEY = "family-business-maturity-draft";
const COOKIE_CONSENT_KEY = "gilbert_devlyn_cookie_consent";
const MAX_GROUP_PARTICIPANTS = 3;
const MIN_COMPARISON_PARTICIPANTS = 2;
const PHONE_COUNTRY_LOOKUP = new Map(PHONE_COUNTRY_OPTIONS.map((option) => [option.id, option]));
const COMPARISON_COLORS = [
  { line: "#1C3D2E", soft: "rgba(28, 61, 46, 0.1)" },
  { line: "#C4713A", soft: "rgba(196, 113, 58, 0.12)" },
  { line: "#2E7C73", soft: "rgba(46, 124, 115, 0.12)" }
];
const SCREEN_ROUTES = {
  home: "/",
  about: "/about",
  services: "/services",
  "assessment-home": "/diagnostic"
};
const ROUTE_SCREENS = new Map(Object.entries(SCREEN_ROUTES).map(([screen, path]) => [path, screen]));

function routeScreenFromLocation() {
  if (typeof window === "undefined") return "home";
  return ROUTE_SCREENS.get(window.location.pathname) ?? "home";
}

function publicScreenPath(screenName) {
  return SCREEN_ROUTES[screenName] ?? null;
}

function updateBrowserRoute(screenName, mode = "push", search = "") {
  if (typeof window === "undefined") return;
  const path = publicScreenPath(screenName);
  if (!path) return;
  const nextUrl = `${path}${search}`;
  if (nextUrl === `${window.location.pathname}${window.location.search}`) return;
  window.history[mode === "replace" ? "replaceState" : "pushState"]({}, "", nextUrl);
}

function buildDiagnosticSearch(groupId, language, view = "") {
  const params = new URLSearchParams();
  if (groupId) params.set("group", groupId);
  if (language) params.set("lang", language);
  if (view) params.set("view", view);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function useViewportMatch(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia(query);
    const updateMatch = () => setMatches(mediaQuery.matches);

    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);
    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, [query]);

  return matches;
}

const RESULT_DETAIL_COPY = {
  en: {
    implementationGapTitle: "The implementation gap",
    implementationGapBody:
      "After the self-assessment, most families can see the problem and even agree on the solution. The harder part is execution: who leads the work, how decisions are financed, how much time the family can commit, and how to keep momentum when sensitive conversations appear. Gilbert's role is to help convert insight into a sequence of conversations, agreements, and practical governance work.",
    topicSummaryLabel: "Topic map",
    topicSummaryTitle: "Results by topic",
    topicSummaryIntro:
      "A short read of each dimension. Use it to see where the family appears clear, where structure may help, and what to discuss first.",
    howToReadTitle: "How to read your result",
    howToReadItems: [
      "This is a conversation map, not a grade or verdict.",
      "Lower scores point to topics that may need clearer agreements.",
      "Unknown answers are useful signals about what may not be visible yet."
    ],
    priorityAreas: "Priority areas",
    loadingChart: "Loading chart...",
    strongestAreas: "Relative strengths",
    noPriority: "No urgent low-score pillar appeared. The next step is refinement and continuity.",
    transparencyTitle: "Transparency signal",
    unknownResponses: "Unknown responses",
    scoreBands: {
      priority: {
        label: "Priority",
        summary: "This pillar likely needs clearer structure or an explicit family conversation."
      },
      focus: {
        label: "Focus area",
        summary: "Some practices appear present, but consistency or visibility may be uneven."
      },
      established: {
        label: "Established",
        summary: "There is a useful foundation; the next work is strengthening performance."
      },
      strength: {
        label: "Relative strength",
        summary: "This pillar is comparatively strong and should be maintained as the family evolves."
      },
      noScore: {
        label: "Not scored",
        summary: "There was not enough scored information to interpret this pillar."
      }
    }
  },
  es: {
    implementationGapTitle: "La brecha de ejecución",
    implementationGapBody:
      "Después de la autoevaluación, muchas familias pueden ver el problema e incluso estar de acuerdo con la solución. Lo difícil es ejecutar: quién lidera el trabajo, cómo se financian las decisiones, cuánto tiempo puede dedicar la familia y cómo sostener el avance cuando aparecen conversaciones sensibles. El rol de Gilbert es ayudar a convertir la autoevaluación en una secuencia de conversaciones, acuerdos y trabajo práctico de gobierno.",
    topicSummaryLabel: "Mapa de temas",
    topicSummaryTitle: "Resultados por tema",
    topicSummaryIntro:
      "Una lectura breve de cada dimensión. Úsala para ver dónde hay claridad, dónde puede ayudar la estructura y qué conviene conversar primero.",
    howToReadTitle: "Cómo leer tu resultado",
    howToReadItems: [
      "Este es un mapa de conversación, no una calificación ni un veredicto.",
      "Los puntajes más bajos señalan temas que pueden necesitar acuerdos más claros.",
      "Las respuestas sin información también muestran qué puede no estar visible todavía."
    ],
    priorityAreas: "Áreas prioritarias",
    loadingChart: "Cargando gráfica...",
    strongestAreas: "Fortalezas relativas",
    noPriority: "No apareció un pilar con urgencia baja. El siguiente paso es refinamiento y continuidad.",
    transparencyTitle: "Señal de transparencia",
    unknownResponses: "Respuestas sin información",
    scoreBands: {
      priority: {
        label: "Prioridad",
        summary: "Este pilar probablemente necesita mayor estructura o una conversación familiar explícita."
      },
      focus: {
        label: "Área de enfoque",
        summary: "Algunas prácticas parecen existir, pero la consistencia o visibilidad puede ser irregular."
      },
      established: {
        label: "Consolidado",
        summary: "Hay una base útil; el siguiente trabajo es fortalecer el desempeño."
      },
      strength: {
        label: "Fortaleza relativa",
        summary: "Este pilar es comparativamente fuerte y debe mantenerse mientras la familia evoluciona."
      },
      noScore: {
        label: "Sin puntaje",
        summary: "No hubo suficiente información con puntaje para interpretar este pilar."
      }
    }
  }
};

const PILLAR_GUIDANCE = {
  en: {
    vision: {
      familyActions: [
        "Name the shared purpose and the few values that should guide ownership decisions.",
        "Translate those values into decision criteria for growth, reinvestment, and family roles."
      ],
      executionRisk:
        "Purpose statements often stay aspirational unless they are tied to real decisions and reviewed with the family.",
      gilbertHelp:
        "Gilbert can facilitate the conversation so different generations turn values into usable decision principles."
    },
    constitution: {
      familyActions: [
        "Identify which family-business rules are already assumed but not written.",
        "Prioritize the rules that affect employment, ownership, information access, and conflict handling."
      ],
      executionRisk:
        "Protocols can become documents that nobody uses if the family skips the hard alignment conversations.",
      gilbertHelp:
        "Gilbert can help separate sensitive issues, sequence decisions, and turn a protocol into a living agreement."
    },
    "family-governance": {
      familyActions: [
        "Clarify the purpose, membership, and authority of family forums.",
        "Set a simple meeting rhythm with agendas, follow-up owners, and decision records."
      ],
      executionRisk:
        "Family councils lose credibility when meetings become updates without decisions or decisions without follow-up.",
      gilbertHelp:
        "Gilbert can design the forum and facilitate the first conversations until the family has a workable rhythm."
    },
    ownership: {
      familyActions: [
        "Clarify owner rights, responsibilities, information flow, and dividend expectations.",
        "Create an owner communication rhythm before tension appears around liquidity or control."
      ],
      executionRisk:
        "Ownership alignment can stall when financial expectations are discussed informally or too late.",
      gilbertHelp:
        "Gilbert can help owners separate emotional concerns from economic decisions and define a practical owner agenda."
    },
    board: {
      familyActions: [
        "Define what belongs with the board, management, ownership, and family forums.",
        "Review whether the board has the information, independence, and cadence needed for real oversight."
      ],
      executionRisk:
        "Boards can look formal while still avoiding succession, risk, or performance conversations.",
      gilbertHelp:
        "Gilbert can help clarify board roles and improve the connection between governance, strategy, and family context."
    },
    management: {
      familyActions: [
        "Clarify roles, authority, performance expectations, and succession paths for family and non-family executives.",
        "Separate family membership from management accountability."
      ],
      executionRisk:
        "Professionalization gets difficult when role clarity touches family identity, compensation, or legacy expectations.",
      gilbertHelp:
        "Gilbert can help frame professionalization as continuity work rather than a judgment on family members."
    },
    "next-generation": {
      familyActions: [
        "Create a learning pathway for future owners before asking them to take formal roles.",
        "Define participation rules, mentorship, and expectations for joining the business or governance spaces."
      ],
      executionRisk:
        "Next generation work often fails when younger members are either excluded or invited before they are prepared.",
      gilbertHelp:
        "Gilbert can help design a paced NextGen pathway that builds capability, trust, and responsible participation."
    },
    harmony: {
      familyActions: [
        "Name the conversations that are being avoided and decide where they should be held.",
        "Agree on a conflict escalation path before tension becomes a family crisis."
      ],
      executionRisk:
        "Families can agree on structures but avoid the emotional conversations that make those structures work.",
      gilbertHelp:
        "Gilbert can create a neutral setting where sensitive topics are discussed with structure and respect."
    }
  },
  es: {
    vision: {
      familyActions: [
        "Nombrar el propósito compartido y los pocos valores que deben orientar las decisiones de propiedad.",
        "Traducir esos valores en criterios para crecimiento, reinversión y roles familiares."
      ],
      executionRisk:
        "Las declaraciones de propósito suelen quedarse en aspiración si no se conectan con decisiones reales y revisión familiar.",
      gilbertHelp:
        "Gilbert puede facilitar la conversación para que distintas generaciones conviertan valores en principios útiles de decisión."
    },
    constitution: {
      familyActions: [
        "Identificar qué reglas familia-empresa ya se asumen pero no están escritas.",
        "Priorizar reglas sobre empleo familiar, propiedad, acceso a información y manejo de conflictos."
      ],
      executionRisk:
        "Los protocolos pueden convertirse en documentos que nadie usa si la familia evita las conversaciones difíciles.",
      gilbertHelp:
        "Gilbert puede ayudar a separar temas sensibles, ordenar decisiones y convertir el protocolo en un acuerdo vivo."
    },
    "family-governance": {
      familyActions: [
        "Aclarar propósito, miembros y autoridad de los espacios familiares.",
        "Definir un ritmo simple de reuniones con agenda, responsables de seguimiento y registro de acuerdos."
      ],
      executionRisk:
        "Los consejos familiares pierden credibilidad cuando las reuniones son actualizaciones sin decisiones o decisiones sin seguimiento.",
      gilbertHelp:
        "Gilbert puede diseñar el foro y facilitar las primeras conversaciones hasta que la familia tenga un ritmo funcional."
    },
    ownership: {
      familyActions: [
        "Aclarar derechos, responsabilidades, flujo de información y expectativas de dividendos.",
        "Crear un ritmo de comunicación entre propietarios antes de que aparezca tensión por liquidez o control."
      ],
      executionRisk:
        "La alineación de propietarios se atora cuando las expectativas financieras se conversan informalmente o demasiado tarde.",
      gilbertHelp:
        "Gilbert puede ayudar a separar preocupaciones emocionales de decisiones económicas y definir una agenda práctica de propietarios."
    },
    board: {
      familyActions: [
        "Definir qué corresponde al consejo, a la dirección, a la propiedad y a los foros familiares.",
        "Revisar si el consejo tiene información, independencia y cadencia suficientes para supervisar de verdad."
      ],
      executionRisk:
        "Un consejo puede verse formal y aun así evitar conversaciones de sucesión, riesgo o desempeño.",
      gilbertHelp:
        "Gilbert puede ayudar a aclarar roles del consejo y conectar gobierno, estrategia y contexto familiar."
    },
    management: {
      familyActions: [
        "Aclarar roles, autoridad, expectativas de desempeño y rutas de sucesión para ejecutivos familiares y no familiares.",
        "Separar pertenencia familiar de rendición de cuentas en la gestión."
      ],
      executionRisk:
        "La profesionalización se vuelve difícil cuando la claridad de roles toca identidad familiar, compensación o legado.",
      gilbertHelp:
        "Gilbert puede enmarcar la profesionalización como trabajo de continuidad, no como juicio sobre miembros de la familia."
    },
    "next-generation": {
      familyActions: [
        "Crear una ruta de aprendizaje para futuros propietarios antes de pedirles roles formales.",
        "Definir reglas de participación, mentoría y expectativas para entrar al negocio o a espacios de gobierno."
      ],
      executionRisk:
        "El trabajo NextGen falla cuando los jóvenes son excluidos o invitados antes de estar preparados.",
      gilbertHelp:
        "Gilbert puede diseñar una ruta gradual NextGen que construya capacidad, confianza y participación responsable."
    },
    harmony: {
      familyActions: [
        "Nombrar las conversaciones que se están evitando y decidir dónde deben ocurrir.",
        "Acordar una ruta de escalamiento de conflictos antes de que la tensión se vuelva crisis familiar."
      ],
      executionRisk:
        "Las familias pueden acordar estructuras pero evitar las conversaciones emocionales que hacen funcionar esas estructuras.",
      gilbertHelp:
        "Gilbert puede crear un espacio neutral donde temas sensibles se conversen con estructura y respeto."
    }
  }
};

function isAssessmentAnswered(value) {
  return Number.isFinite(value) || value === UNKNOWN_ANSWER;
}

function phoneDigits(value) {
  return value.replace(/\D/g, "");
}

function maxPhoneDigitsForCountry(countryOption) {
  if (countryOption?.maxDigits) return countryOption.maxDigits;

  const countryCode = countryOption?.countryCode;
  if (!countryCode) return 14;

  for (let length = 1; length <= 18; length += 1) {
    const candidate = "9".repeat(length);
    if (validatePhoneNumberLength(candidate, countryCode) === "TOO_LONG") {
      return length - 1;
    }
  }

  return 14;
}

function trimPhoneNumberToCountryLimit(countryOption, value) {
  const maxDigits = maxPhoneDigitsForCountry(countryOption);
  const dialDigits = phoneDigits(countryOption?.dialCode ?? "");
  let digits = phoneDigits(value);

  if (dialDigits && digits.length > maxDigits && digits.startsWith(dialDigits)) {
    digits = digits.slice(dialDigits.length);
  }

  return digits.slice(0, maxDigits);
}

function isPhoneNumberValid(countryOption, value) {
  const trimmedValue = value.trim();
  const digits = phoneDigits(trimmedValue);
  const minDigits = countryOption?.minDigits ?? 7;
  const maxDigits = maxPhoneDigitsForCountry(countryOption);
  const dialDigits = phoneDigits(countryOption?.dialCode ?? "");
  const countryCode = countryOption?.countryCode;

  if (dialDigits && digits.startsWith(dialDigits) && digits.length > minDigits) return false;

  if (countryCode) {
    try {
      const phoneNumber = parsePhoneNumberFromString(trimmedValue, countryCode);
      if (phoneNumber) return phoneNumber.country === countryCode && phoneNumber.isValid();
    } catch {
      // Fall through to the local digit checks for unsupported country metadata.
    }
  }

  if (digits.length < minDigits || digits.length > maxDigits) return false;

  if (countryOption?.localPrefixes?.length) {
    return countryOption.localPrefixes.some((prefix) => digits.startsWith(prefix));
  }

  return true;
}

function normalizeSearchText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function buildCountryOptions(phoneCountryOptions, language) {
  const displayNames =
    typeof Intl !== "undefined" && Intl.DisplayNames
      ? new Intl.DisplayNames([language], { type: "region" })
      : null;

  return phoneCountryOptions
    .map((option) => ({
      id: option.id,
      countryCode: option.countryCode,
      label: displayNames?.of(option.countryCode) ?? option.countryCode
    }))
    .sort((a, b) => a.label.localeCompare(b.label, language));
}

function countryFlagSrc(countryCode = "") {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}

function getCookieConsent() {
  if (typeof document === "undefined") return null;

  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (stored) return stored;

  return (
    document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${COOKIE_CONSENT_KEY}=`))
      ?.split("=")[1] ?? null
  );
}

function setCookieConsent(value) {
  localStorage.setItem(COOKIE_CONSENT_KEY, value);
  document.cookie = `${COOKIE_CONSENT_KEY}=${value}; Max-Age=31536000; Path=/; SameSite=Lax`;
}

function CountryFlag({ countryCode, className = "" }) {
  return (
    <span
      className={`relative inline-flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-forest/10 bg-parchment text-[8px] font-bold uppercase leading-none text-current ${className}`}
      aria-hidden="true"
    >
      <span>{countryCode}</span>
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src={countryFlagSrc(countryCode)}
        srcSet={`${countryFlagSrc(countryCode)} 1x, https://flagcdn.com/w80/${countryCode.toLowerCase()}.png 2x`}
        alt=""
        loading="lazy"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    </span>
  );
}

function CountrySearchSelect({
  value,
  options,
  onChange,
  invalid,
  searchPlaceholder,
  emptyMessage
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const selectedOption = options.find((option) => option.id === value) ?? options[0];
  const filteredOptions = options.filter((option) =>
    normalizeSearchText(option.label).includes(normalizeSearchText(query))
  );

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
  }, [open]);

  function openMenu() {
    setQuery("");
    setOpen((current) => !current);
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-forest/16 bg-white px-4 text-left text-base text-ink transition hover:bg-parchment/45 focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid}
        onClick={openMenu}
      >
        <span className="flex min-w-0 items-center gap-3">
          {selectedOption?.countryCode && (
            <CountryFlag countryCode={selectedOption.countryCode} />
          )}
          <span className="truncate">{selectedOption?.label}</span>
        </span>
        <span
          aria-hidden="true"
          className={`mt-0.5 h-0 w-0 shrink-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-forest/70 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-lg border border-forest/14 bg-white shadow-soft">
          <div className="sticky top-0 border-b border-forest/10 bg-white p-2">
            <div className="flex min-h-11 items-center gap-2 rounded-md border border-forest/14 bg-parchment/45 px-3 focus-within:border-copper focus-within:ring-2 focus-within:ring-copper/15">
              <Search aria-hidden="true" size={16} className="shrink-0 text-forest/56" />
              <input
                ref={searchRef}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-forest outline-none placeholder:text-forest/42"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto py-1" role="listbox">
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const active = option.id === value;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`flex min-h-11 w-full items-center gap-3 px-4 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-forest text-white"
                        : "text-forest hover:bg-parchment"
                    }`}
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                  >
                    <CountryFlag countryCode={option.countryCode} />
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  </button>
                );
              })
            ) : (
              <p className="px-4 py-5 text-sm font-semibold text-muted">{emptyMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatPhoneNumber(countryId, value, countryOption = PHONE_COUNTRY_LOOKUP.get(countryId)) {
  const digits = trimPhoneNumberToCountryLimit(countryOption, value);
  const countryCode = countryOption?.countryCode;

  if (countryCode) {
    try {
      return new AsYouType(countryCode).input(digits);
    } catch {
      // Fall through to simple grouping for unsupported country metadata.
    }
  }

  return digits.replace(/(.{1,4})/g, "$1 ").trim();
}

function loadLatestResult() {
  try {
    const result = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!result) return null;

    const params =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const routeGroupId = params?.get("group")?.trim();

    if (routeGroupId || params?.has("mock-results") || params?.has("mock-comparison")) {
      return result;
    }

    const {
      groupId,
      participantId,
      inviteEmail,
      inviteLink,
      groupParticipantCount,
      ...standaloneResult
    } = result;

    return standaloneResult;
  } catch {
    return null;
  }
}

function loadAssessmentDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(ASSESSMENT_DRAFT_STORAGE_KEY));
    if (!draft?.mode || !draft?.language) return null;

    const params =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const routeGroupId = params?.get("group")?.trim();

    if (!routeGroupId && draft.pendingGroupId) {
      return { ...draft, pendingGroupId: null };
    }

    return draft;
  } catch {
    return null;
  }
}

function saveAssessmentDraft(draft) {
  localStorage.setItem(ASSESSMENT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

function clearAssessmentDraft() {
  localStorage.removeItem(ASSESSMENT_DRAFT_STORAGE_KEY);
}

function loadGroups() {
  try {
    return JSON.parse(localStorage.getItem(GROUP_STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveGroups(groups) {
  localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify(groups));
}

function createGroupId() {
  const random =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return random.toUpperCase();
}

function createParticipantId() {
  return `participant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getInviteUrl(groupId, language) {
  const url = new URL("/diagnostic", window.location.origin);
  url.searchParams.set("group", groupId);
  url.searchParams.set("lang", language);
  return url.toString();
}

function getRelationshipLabel(roleId, language) {
  const options = COPY[language]?.intake?.relationshipOptions ?? COPY.en.intake.relationshipOptions;
  return options.find((option) => option.id === roleId)?.label ?? "";
}

function getGenerationLabel(generationId, language) {
  const options = COPY[language]?.intake?.generationOptions ?? COPY.en.intake.generationOptions;
  return options.find((option) => option.id === generationId)?.label ?? "";
}

function getParticipantRoleLabel(participant, language, index = 0) {
  const role = getRelationshipLabel(participant.role, language);
  const generation = getGenerationLabel(participant.generation, language);
  const fallback =
    language === "es" ? `Participante ${index + 1}` : `Participant ${index + 1}`;

  if (role && generation) return `${role} · ${generation}`;
  return role || generation || fallback;
}

function getParticipantRoleParts(participant, language, index = 0) {
  const role = getRelationshipLabel(participant.role, language);
  const generation = getGenerationLabel(participant.generation, language);
  const fallback =
    language === "es" ? `Participante ${index + 1}` : `Participant ${index + 1}`;

  return {
    primary: role || generation || fallback,
    secondary: role && generation ? generation : ""
  };
}

function createParticipantSummary(resultPackage, participantId = createParticipantId()) {
  const profile = resultPackage.profile ?? {};
  const result = resultPackage.result;

  return {
    id: participantId,
    language: resultPackage.language,
    role: profile.relationship,
    generation: profile.generation,
    country: profile.country,
    completedAt: resultPackage.createdAt ?? new Date().toISOString(),
    answers: resultPackage.answers ?? {},
    result: {
      overall: result.overall,
      stageId: result.stage.id,
      pillarScores: result.pillarScores,
      transparency: result.transparency
    }
  };
}

function saveStoredGroup(group) {
  if (!group?.id) return null;
  const groups = loadGroups();
  groups[group.id] = {
    ...(groups[group.id] ?? {}),
    ...group,
    participants: group.participants ?? groups[group.id]?.participants ?? [],
    invitations: group.invitations ?? groups[group.id]?.invitations ?? []
  };
  saveGroups(groups);
  return groups[group.id];
}

function createMockResultPackage(language = "en") {
  const questions = FULL_QUESTIONS[language] ?? FULL_QUESTIONS.en;
  const mockScores = [4, 3, 3, 2, 4, 3, 4, 2, 3, 4];
  const answers = Object.fromEntries(
    questions.map((question, index) => [
      question.id,
      index % 11 === 0 ? UNKNOWN_ANSWER : mockScores[index % mockScores.length]
    ])
  );
  const result = calculateResults(questions, answers);

  return {
    mode: "full",
    language,
    profile: {
      name: language === "es" ? "Miembro familiar demo" : "Demo Family Member",
      email: "demo@example.com",
      phoneCountry: "mx",
      phoneCountryLabel: "MX",
      phoneDialCode: "+52",
      phoneNumber: "55 1234 5678",
      phoneDigits: "5512345678",
      phoneInternational: "+52 55 1234 5678",
      relationship: "founder",
      relationshipLabel: language === "es" ? "Fundador/a" : "Founder",
      relationshipOther: "",
      generation: "first",
      generationLabel: language === "es" ? "Primera generación" : "First generation",
      country: "mx",
      countryLabel: language === "es" ? "México" : "Mexico"
    },
    answers,
    result,
    createdAt: new Date().toISOString(),
    isMock: true
  };
}

function createMockComparisonGroup(language = "en", participantCount = 2, scenario = "default") {
  const questions = FULL_QUESTIONS[language] ?? FULL_QUESTIONS.en;
  const groupId = scenario === "empty-states" ? "DEMO-EMPTY" : "DEMO-COMPARE";
  const firstAnswers = Object.fromEntries(
    questions.map((question, index) => [
      question.id,
      index % 13 === 0 ? UNKNOWN_ANSWER : [4, 4, 3, 3, 5, 4, 3, 4][index % 8]
    ])
  );
  const secondAnswers = Object.fromEntries(
    questions.map((question, index) => [
      question.id,
      index % 9 === 0 ? UNKNOWN_ANSWER : [2, 3, 2, 4, 3, 2, 5, 3][index % 8]
    ])
  );
  const thirdAnswers = Object.fromEntries(
    questions.map((question, index) => [
      question.id,
      index % 11 === 0 ? UNKNOWN_ANSWER : [3, 4, 3, 5, 4, 3, 4, 5][index % 8]
    ])
  );
  if (scenario === "empty-states") {
    questions.forEach((question) => {
      firstAnswers[question.id] = 5;
      secondAnswers[question.id] = 1;
      thirdAnswers[question.id] = 3;
    });
  } else {
    const demoAlignedPillars = new Set(["constitution", "ownership", "management", "harmony"]);
    questions.forEach((question, index) => {
      if (!demoAlignedPillars.has(question.pillarId)) return;

      const alignedValue = [4, 4, 3, 4, 4, 3][index % 6];
      firstAnswers[question.id] = alignedValue;
      secondAnswers[question.id] = alignedValue;
      thirdAnswers[question.id] = alignedValue;
    });
    questions.forEach((question) => {
      if (question.pillarId !== "management") return;

      thirdAnswers[question.id] = 2;
    });
  }
  const base = createMockResultPackage(language);
  const firstPackage = {
    ...base,
    groupId,
    participantId: "demo-founder",
    profile: {
      ...base.profile,
      name: language === "es" ? "Fundador demo" : "Demo Founder",
      email: "founder@example.com",
      relationship: "founder",
      generation: "first"
    },
    answers: firstAnswers,
    result: calculateResults(questions, firstAnswers)
  };
  const secondPackage = {
    ...base,
    groupId,
    participantId: "demo-nextgen",
    profile: {
      ...base.profile,
      name: language === "es" ? "NextGen demo" : "Demo NextGen",
      email: "nextgen@example.com",
      relationship: "family-working",
      generation: "third-plus"
    },
    answers: secondAnswers,
    result: calculateResults(questions, secondAnswers)
  };
  const thirdPackage = {
    ...base,
    groupId,
    participantId: "demo-owner",
    profile: {
      ...base.profile,
      name: language === "es" ? "Propietario demo" : "Demo Owner",
      email: "owner@example.com",
      relationship: "family-working",
      generation: "second"
    },
    answers: thirdAnswers,
    result: calculateResults(questions, thirdAnswers)
  };

  const first = createParticipantSummary(firstPackage, firstPackage.participantId);
  const second = createParticipantSummary(secondPackage, secondPackage.participantId);
  const third = createParticipantSummary(thirdPackage, thirdPackage.participantId);
  const participants = participantCount >= 3 ? [first, second, third] : [first, second];

  return {
    latestResult: firstPackage,
    group: {
      id: groupId,
      maxParticipants: MAX_GROUP_PARTICIPANTS,
      createdAt: new Date().toISOString(),
      invitations: [{ email: secondPackage.profile.email, createdAt: new Date().toISOString() }],
      participants
    }
  };
}

function loadMockComparisonDemo(language, participantCount = 2, scenario = "default") {
  const demo = createMockComparisonGroup(language, participantCount, scenario);
  saveStoredGroup(demo.group);
  return demo;
}

function getMockScenario(params) {
  return params.get("scenario") === "empty-states" ? "empty-states" : "default";
}

function getMockParticipantCount(params, key) {
  const directValue = params.get(key);
  const participantValue = params.get("participants");
  return directValue === "3" || participantValue === "3" ? 3 : 2;
}

export default function App() {
  const [language, setLanguage] = useState("en");
  const [screen, setScreen] = useState(routeScreenFromLocation);
  const [activeMode, setActiveMode] = useState(null);
  const [latestResult, setLatestResult] = useState(loadLatestResult);
  const [pendingGroupId, setPendingGroupId] = useState(null);
  const [activeComparisonGroup, setActiveComparisonGroup] = useState(null);
  const [assessmentDraft, setAssessmentDraft] = useState(loadAssessmentDraft);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [groupRefresh, setGroupRefresh] = useState(0);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [inviteShareContext, setInviteShareContext] = useState(null);

  const copy = COPY[language];
  const isMockDemoRoute =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("mock-comparison");
  const isMockResultRoute =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("mock-results");

  useEffect(() => {
    function handlePopState() {
      const nextScreen = routeScreenFromLocation();
      setActiveMode(null);
      setPendingGroupId(null);
      setActiveComparisonGroup(null);
      setScreen(nextScreen);
      if (nextScreen === "home" && loadAssessmentDraft()) {
        setAssessmentDraft(loadAssessmentDraft());
        setShowResumePrompt(true);
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("mock-comparison")) {
      const mockLanguage = params.get("lang") === "es" ? "es" : "en";
      const mockParticipantCount = getMockParticipantCount(params, "mock-comparison");
      const demo = loadMockComparisonDemo(mockLanguage, mockParticipantCount, getMockScenario(params));
      setCookieConsent("accepted");
      setLanguage(mockLanguage);
      setActiveMode("full");
      setLatestResult(demo.latestResult);
      setActiveComparisonGroup(demo.group);
      setScreen("comparison");
      return;
    }

    if (!params.has("mock-results")) return;

    const mockLanguage = params.get("lang") === "es" ? "es" : "en";
    const mockParticipantCount = getMockParticipantCount(params, "with-comparison");
    const demo = params.has("with-comparison")
      ? loadMockComparisonDemo(mockLanguage, mockParticipantCount, getMockScenario(params))
      : null;
    const mockPackage = demo?.latestResult ?? createMockResultPackage(mockLanguage);
    setCookieConsent("accepted");
    setLanguage(mockLanguage);
    setActiveMode("full");
    setLatestResult(mockPackage);
    if (demo) {
      setActiveComparisonGroup(demo.group);
      setGroupRefresh((value) => value + 1);
    }
    setScreen("results");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("mock-results") || params.has("mock-comparison")) return;

    const groupId = params.get("group")?.trim();
    if (!groupId) return;

    if (window.location.pathname !== SCREEN_ROUTES["assessment-home"]) {
      window.history.replaceState({}, "", `${SCREEN_ROUTES["assessment-home"]}${window.location.search}`);
    }

    const linkLanguage = params.get("lang") === "es" ? "es" : "en";

    if (params.get("view") === "invite") {
      setLanguage(linkLanguage);
      setInviteShareContext({
        groupId,
        name: params.get("name")?.trim() || ""
      });
      setScreen("invite-share");
      return;
    }

    setLanguage(linkLanguage);
    setPendingGroupId(groupId);
    setActiveMode("full");
    setActiveComparisonGroup(null);
    setScreen("assessment-home");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") !== "admin-comparison") return;

    const token = params.get("data");
    if (!token) return;

    setScreen("loading");
    fetch(`/api/comparison?data=${encodeURIComponent(token)}`)
      .then((response) => response.json().catch(() => ({})))
      .then((data) => {
        if (data?.group) {
          setLanguage(data.language === "es" ? "es" : "en");
          setActiveComparisonGroup(data.group);
          setScreen("comparison");
        } else {
          setScreen("home");
        }
      })
      .catch(() => setScreen("home"));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("mock-results") || params.has("mock-comparison") || params.has("group")) return;

    const draft = loadAssessmentDraft();
    if (!draft) return;

    setAssessmentDraft(draft);
    setLanguage(draft.language === "es" ? "es" : "en");
    setShowResumePrompt(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (latestResult) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(latestResult));
    }
  }, [latestResult]);

  function startMode(mode) {
    const groupIdForRun = pendingGroupId;
    const diagnosticSearch = groupIdForRun ? buildDiagnosticSearch(groupIdForRun, language) : "";
    clearAssessmentDraft();
    setAssessmentDraft(null);
    setShowResumePrompt(false);
    setPendingGroupId(groupIdForRun ?? null);
    setActiveComparisonGroup(null);
    setActiveMode(mode);
    setScreen("assessment");
    updateBrowserRoute("assessment-home", "push", diagnosticSearch);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigate(screenName) {
    setActiveMode(null);
    setPendingGroupId(null);
    setActiveComparisonGroup(null);
    setScreen(screenName);
    updateBrowserRoute(screenName);
    if (screenName === "home" && loadAssessmentDraft()) {
      setAssessmentDraft(loadAssessmentDraft());
      setShowResumePrompt(true);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleComplete(answers, profile) {
    const mode = activeMode;
    const questions = FULL_QUESTIONS[language];
    const validQuestionIds = new Set(questions.map((question) => question.id));
    const cleanAnswers = Object.fromEntries(
      Object.entries(answers).filter(([questionId]) => validQuestionIds.has(questionId))
    );

    clearAssessmentDraft();
    setAssessmentDraft(null);
    setShowResumePrompt(false);
    setScreen("loading");

    window.setTimeout(() => {
      const result = calculateResults(questions, cleanAnswers);
      const resultPackage = {
        mode,
        language,
        profile,
        answers: cleanAnswers,
        result,
        createdAt: new Date().toISOString(),
        groupId: pendingGroupId ?? createGroupId(),
        participantId: createParticipantId()
      };

      setLatestResult(resultPackage);
      setPendingGroupId(null);
      setScreen("results");
    }, 850);
  }

  function restart() {
    clearAssessmentDraft();
    setAssessmentDraft(null);
    setShowResumePrompt(false);
    setPendingGroupId(null);
    setActiveComparisonGroup(null);
    setActiveMode(null);
    setScreen("assessment-home");
    updateBrowserRoute("assessment-home");
  }

  function handleDraftChange(draft) {
    setAssessmentDraft(draft);
  }

  function resumeAssessmentDraft() {
    const draft = assessmentDraft ?? loadAssessmentDraft();
    if (!draft) return;
    const draftLanguage = draft.language === "es" ? "es" : "en";
    const draftGroupId = draft.pendingGroupId ?? null;
    const diagnosticSearch = draftGroupId ? buildDiagnosticSearch(draftGroupId, draftLanguage) : "";

    setLanguage(draftLanguage);
    setActiveComparisonGroup(null);
    setPendingGroupId(draftGroupId);
    setActiveMode(draft.mode ?? "full");
    setAssessmentDraft(draft);
    setShowResumePrompt(false);
    setScreen("assessment");
    updateBrowserRoute("assessment-home", "push", diagnosticSearch);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startOverFromDraft() {
    clearAssessmentDraft();
    setAssessmentDraft(null);
    setShowResumePrompt(false);
    setPendingGroupId(null);
    setActiveComparisonGroup(null);
  }

  function startAssessment() {
    startMode("full");
  }

  async function submitFinalResult(resultPackage) {
    const response = await persistResult(resultPackage);
    setLatestResult(resultPackage);
    return response;
  }

  return (
    <main className="page-grain flex min-h-[100dvh] w-full max-w-none flex-col overflow-x-hidden bg-parchment text-ink">
      {screen !== "loading" && (
        <SiteHeader
          copy={copy}
          language={language}
          setLanguage={setLanguage}
          activeScreen={screen}
          onNavigate={navigate}
        />
      )}

      {screen === "home" && (
        <HomePage
          copy={copy}
          language={language}
          onNavigate={navigate}
          onStartAssessment={startAssessment}
        />
      )}

      {screen === "about" && (
        <AboutPage
          copy={copy}
          language={language}
          onNavigate={navigate}
        />
      )}

      {screen === "services" && (
        <ServicesPage
          copy={copy}
          onNavigate={navigate}
        />
      )}

      {screen === "assessment-home" && (
        <AssessmentLanding
          copy={copy}
          language={language}
          onStart={startMode}
        />
      )}

      {screen === "assessment" && (
        <AssessmentFlow
          copy={copy}
          language={language}
          mode={activeMode}
          pendingGroupId={pendingGroupId}
          initialDraft={assessmentDraft}
          onDraftChange={handleDraftChange}
          onBack={() => navigate("assessment-home")}
          onComplete={handleComplete}
          privacyPolicyOpen={privacyPolicyOpen}
          onOpenPrivacyPolicy={() => setPrivacyPolicyOpen(true)}
        />
      )}

      {screen === "loading" && <LoadingScreen copy={copy} />}

      {screen === "results" && latestResult && (
        <ResultsScreen
          copy={copy}
          language={language}
          resultPackage={latestResult}
          onRetake={restart}
          onSubmitFinal={submitFinalResult}
        />
      )}

      {screen === "comparison" && activeComparisonGroup && (
        <ComparisonScreen
          copy={copy}
          language={language}
          group={activeComparisonGroup}
          onBackToResult={() => setScreen(latestResult ? "results" : "assessment-home")}
        />
      )}

      {screen === "invite-share" && inviteShareContext && (
        <CompareInvitePage
          copy={copy}
          language={language}
          groupId={inviteShareContext.groupId}
          inviterName={inviteShareContext.name}
          onNavigateHome={() => navigate("home")}
        />
      )}

      {["home", "about", "services", "assessment-home", "results", "comparison", "invite-share"].includes(
        screen
      ) && (
        <SiteFooter
          copy={copy}
          language={language}
          onNavigate={navigate}
        />
      )}

      {!isMockDemoRoute && !isMockResultRoute && (
        <CookieConsentBanner
          copy={copy.cookieConsent}
          onOpenPrivacyPolicy={() => setPrivacyPolicyOpen(true)}
        />
      )}

      {privacyPolicyOpen && (
        <PrivacyPolicyModal
          copy={copy.privacyPolicy}
          onClose={() => setPrivacyPolicyOpen(false)}
        />
      )}

      {screen === "home" && showResumePrompt && assessmentDraft && (
        <ResumeAssessmentPrompt
          copy={copy.resumeAssessment}
          draft={assessmentDraft}
          language={language}
          onContinue={resumeAssessmentDraft}
          onStartOver={startOverFromDraft}
        />
      )}
    </main>
  );
}

function SiteHeader({
  copy,
  language,
  setLanguage,
  activeScreen,
  onNavigate
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [
    { id: "home", label: copy.nav.home },
    { id: "about", label: copy.nav.about },
    { id: "services", label: copy.nav.services },
    { id: "assessment-home", label: copy.nav.assessment, secondary: true }
  ];

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeScreen, language]);

  function isNavActive(item) {
    return (
      activeScreen === item.id ||
      (item.id === "assessment-home" &&
        ["assessment", "results", "comparison", "followup", "invite-share"].includes(activeScreen))
    );
  }

  function goTo(itemId) {
    setMobileMenuOpen(false);
    onNavigate(itemId);
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-parchment/88 backdrop-blur-xl transition-shadow duration-300 ${
        scrolled ? "border-forest/12 shadow-nav" : "border-forest/8"
      }`}
    >
      <div className="mx-auto grid min-h-0 w-full max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-3 sm:px-8 sm:py-4 lg:min-h-20 lg:grid-cols-[1fr_auto_1fr] lg:gap-3">
        <button
          type="button"
          className="group col-start-1 row-start-1 min-w-0 text-left"
          onClick={() => onNavigate("home")}
        >
          <span>
            <span className="block font-display text-xl font-semibold leading-tight tracking-tight text-forest">
              {copy.brandName}
            </span>
            <span className="block text-sm font-medium text-ink/62">{copy.brandLine}</span>
          </span>
        </button>

        <nav
          className="col-start-2 row-start-1 hidden w-auto min-w-0 flex-wrap justify-self-center lg:flex"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => {
            const active = isNavActive(item);
            return (
              <button
                key={item.id}
                type="button"
                className={`min-h-10 min-w-0 rounded-md px-2 text-sm font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-copper/40 sm:px-4 ${
                  active
                    ? "bg-forest text-white shadow-line"
                    : item.secondary
                      ? "text-forest/68 hover:bg-white/70 hover:text-forest"
                      : "text-forest hover:bg-white/80 hover:text-forest"
                }`}
                aria-current={active ? "page" : undefined}
                onClick={() => goTo(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="col-start-2 row-start-1 flex items-center gap-2 justify-self-end lg:col-start-3">
          <LanguageToggle
            language={language}
            setLanguage={setLanguage}
            disabled={activeScreen === "assessment"}
          />
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-forest/12 bg-white text-forest shadow-line transition duration-200 hover:border-copper hover:text-copper lg:hidden"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            {mobileMenuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav
            className="col-span-2 col-start-1 row-start-2 grid w-full gap-2 rounded-lg border border-forest/10 bg-white/86 p-2 shadow-line lg:hidden"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => {
              const active = isNavActive(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`min-h-11 min-w-0 rounded-md px-3 text-sm font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-copper/40 ${
                    active
                      ? "bg-forest text-white shadow-line"
                      : item.secondary
                        ? "text-forest/68 hover:bg-parchment hover:text-forest"
                        : "text-forest hover:bg-parchment hover:text-forest"
                  }`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => goTo(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}

function CookieConsentBanner({ copy, onOpenPrivacyPolicy }) {
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState(null);

  useEffect(() => {
    setChoice(getCookieConsent());
    setReady(true);
  }, []);

  if (!ready || choice === "accepted" || !copy || typeof document === "undefined") return null;

  function acceptCookies() {
    setCookieConsent("accepted");
    setChoice("accepted");
  }

  return createPortal(
    <section className="pointer-events-none fixed inset-x-0 bottom-0 z-[9980] px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="pointer-events-auto mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-lg border border-forest/12 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-forest">{copy.title}</p>
          <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">{copy.body}</p>
          <button
            type="button"
            className="mt-1 inline-flex text-xs font-bold text-forest underline decoration-forest/30 underline-offset-4 transition hover:text-copper sm:text-sm"
            onClick={onOpenPrivacyPolicy}
          >
            {copy.privacyLink}
          </button>
        </div>
        <div className="flex shrink-0">
          <button
            type="button"
            className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-forest px-4 text-sm font-bold text-white transition duration-200 hover:bg-forest-2 sm:w-auto"
            onClick={acceptCookies}
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </section>,
    document.body
  );
}

function PrivacyPolicyModal({ copy, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!copy || typeof document === "undefined") return null;

  return createPortal(
    <section
      className="fixed inset-0 z-[9995] flex items-center justify-center bg-forest/48 px-4 py-6 backdrop-blur-sm sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
    >
      <div className="flex max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-forest/12 bg-white shadow-soft">
        <div className="flex items-start justify-between gap-4 border-b border-forest/10 p-5 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">
              {copy.label}
            </p>
            <h2
              id="privacy-policy-title"
              className="mt-2 font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl"
            >
              {copy.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{copy.updated}</p>
          </div>
          <button
            type="button"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-forest/12 bg-white text-forest transition hover:border-copper hover:text-copper"
            onClick={onClose}
            aria-label={copy.close}
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6">
          <div className="space-y-4 text-sm leading-7 text-ink/76 sm:text-base">
            {copy.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-7 space-y-7">
            {copy.sections.map((section) => (
              <section key={section.title}>
                <h3 className="font-display text-xl font-semibold leading-tight text-forest sm:text-2xl">
                  {section.title}
                </h3>
                <div className="mt-3 space-y-3 text-sm leading-7 text-muted sm:text-base">
                  {(Array.isArray(section.body) ? section.body : [section.body]).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.table && (
                  <div className="mt-4 overflow-hidden rounded-lg border border-forest/10">
                    <div className="grid grid-cols-3 bg-parchment/60 text-xs font-bold uppercase tracking-[0.14em] text-forest">
                      {section.table.headers.map((header) => (
                        <div key={header} className="border-r border-forest/10 p-3 last:border-r-0">
                          {header}
                        </div>
                      ))}
                    </div>
                    {section.table.rows.map((row) => (
                      <div key={row.join("-")} className="grid grid-cols-3 border-t border-forest/10 text-sm leading-6 text-muted">
                        {row.map((cell) => (
                          <div key={cell} className="border-r border-forest/10 p-3 last:border-r-0">
                            {cell}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>

        <div className="border-t border-forest/10 p-4 sm:p-5">
          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-forest px-5 text-sm font-bold text-white transition hover:bg-forest-2 sm:w-auto"
            onClick={onClose}
          >
            {copy.close}
          </button>
        </div>
      </div>
    </section>,
    document.body
  );
}

function PreAssessmentPrivacyModal({ copy, onDismiss, onReadPolicy }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onDismiss();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  if (!copy || typeof document === "undefined") return null;

  return createPortal(
    <section
      className="fixed inset-0 z-[9996] flex items-center justify-center bg-forest/48 px-4 py-6 backdrop-blur-sm sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pre-assessment-privacy-title"
    >
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-forest/12 bg-white shadow-soft">
        <div className="flex items-start gap-3 border-b border-forest/10 p-5 sm:p-6">
          <ShieldCheck aria-hidden="true" className="mt-1 shrink-0 text-forest" size={22} />
          <h2
            id="pre-assessment-privacy-title"
            className="font-display text-2xl font-semibold leading-tight text-forest sm:text-3xl"
          >
            {copy.title}
          </h2>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-sm leading-7 text-ink/76 sm:text-base">{copy.body}</p>
        </div>

        <div className="flex flex-col gap-3 border-t border-forest/10 p-4 sm:p-5">
          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-forest px-5 text-sm font-bold text-white transition hover:bg-forest-2"
            onClick={onDismiss}
          >
            {copy.primaryCta}
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-forest/18 bg-white px-5 text-sm font-bold text-forest transition hover:border-copper hover:text-copper"
            onClick={onReadPolicy}
          >
            {copy.secondaryCta}
          </button>
        </div>
      </div>
    </section>,
    document.body
  );
}

function ResumeAssessmentPrompt({ copy, draft, language, onContinue, onStartOver }) {
  if (!copy || !draft || typeof document === "undefined") return null;

  const questionCount = FULL_QUESTIONS[draft.language]?.length ?? FULL_QUESTIONS.en.length;
  const answeredCount = Object.values(draft.answers ?? {}).filter(isAssessmentAnswered).length;
  const currentQuestion = Math.min((draft.index ?? 0) + 1, questionCount);
  const savedAt = draft.updatedAt
    ? new Intl.DateTimeFormat(language, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(new Date(draft.updatedAt))
    : "";

  return createPortal(
    <section className="fixed inset-x-0 bottom-24 z-[9970] px-4 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-xl border border-forest/12 bg-white p-5 shadow-soft sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">
          {copy.label}
        </p>
        <div className="mt-3 grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <h2 className="font-display text-3xl font-semibold leading-tight text-forest">
              {copy.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{copy.body}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-forest/78">
              <span className="rounded-full bg-parchment px-3 py-1.5">
                {copy.answeredLabel}: {answeredCount} / {questionCount}
              </span>
              <span className="rounded-full bg-parchment px-3 py-1.5">
                {copy.currentLabel}: {currentQuestion} / {questionCount}
              </span>
              {savedAt && (
                <span className="rounded-full bg-parchment px-3 py-1.5">
                  {copy.updatedLabel}: {savedAt}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-forest px-5 text-sm font-bold text-white transition duration-200 hover:bg-forest-2"
              onClick={onContinue}
            >
              {copy.continueCta}
              <ArrowRight aria-hidden="true" size={17} />
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-forest/14 px-5 text-sm font-bold text-forest transition duration-200 hover:border-copper hover:text-copper"
              onClick={onStartOver}
            >
              {copy.startOverCta}
            </button>
          </div>
        </div>
      </div>
    </section>,
    document.body
  );
}

function HomePage({ copy, language, onNavigate, onStartAssessment }) {
  const heroStats = [
    {
      value: "12+",
      label: language === "es" ? "años dentro de empresa familiar" : "years inside family enterprise"
    },
    {
      value: "4 roles",
      label:
        language === "es"
          ? "familiar, propietario, ejecutivo y consejero"
          : "family member, owner, executive, board participant"
    },
    {
      value: "FFI + IMD",
      label:
        language === "es"
          ? "formación en empresa familiar, patrimonio y consejo"
          : "family business, wealth advising, and board training"
    }
  ];

  const heroLabel =
    language === "es"
      ? "Asesoría para empresas familiares"
      : "Family Enterprise Advisory";
  const finalCta = getHomeFinalCtaCopy(language);
  const startConversation = () => {
    const subject =
      language === "es"
        ? "Conversación con Gilbert Devlyn"
        : "Conversation with Gilbert Devlyn";
    window.location.href = `mailto:${copy.contactEmail}?subject=${encodeURIComponent(subject)}`;
  };

  return (
    <section className="w-full">
      <section className="relative overflow-hidden border-b border-forest/10 bg-cream">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 px-4 py-8 sm:px-8 sm:py-14 lg:min-h-[calc(100dvh-80px)] lg:grid-cols-[minmax(0,0.92fr)_minmax(460px,0.78fr)] lg:items-center lg:px-12 xl:px-8">
          <div className="min-w-0 max-w-4xl">
            <div className="fade-up inline-flex max-w-full items-center gap-2 rounded-full border border-forest/12 bg-white/72 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-forest shadow-line sm:gap-3 sm:px-4 sm:text-xs sm:tracking-[0.18em]">
              <span className="h-1.5 w-1.5 rounded-full bg-copper status-breathe" />
              {heroLabel}
            </div>
            <h1
              className="fade-up mt-5 max-w-full break-words font-display text-[2.25rem] font-semibold leading-[1.06] tracking-tight text-forest sm:mt-6 sm:text-6xl xl:text-7xl"
              style={{ "--index": 1 }}
            >
              {copy.home.title}
            </h1>
            <p
              className="fade-up mt-5 max-w-full text-[1.02rem] leading-7 text-ink/76 sm:mt-6 sm:max-w-3xl sm:text-lg sm:leading-9"
              style={{ "--index": 2 }}
            >
              {copy.home.subtitle}
            </p>
            <div
              className="fade-up mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row"
              style={{ "--index": 4 }}
            >
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-forest px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-forest-2 active:translate-y-px active:scale-[0.99]"
                onClick={startConversation}
              >
                {copy.home.heroCta}
                <ArrowRight aria-hidden="true" size={18} />
              </button>
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-forest/24 px-5 text-sm font-bold text-forest transition duration-200 hover:-translate-y-0.5 hover:border-forest/40 active:translate-y-px active:scale-[0.99]"
                onClick={() => onNavigate("about")}
              >
                {copy.home.primaryCta}
                <ArrowRight aria-hidden="true" size={18} />
              </button>
            </div>
            <div
              className="fade-up mt-7 grid max-w-3xl grid-cols-1 gap-2 sm:mt-10 sm:grid-cols-3 sm:gap-3"
              style={{ "--index": 5 }}
            >
              {heroStats.map((item) => (
                <HeroStat key={item.label} value={item.value} label={item.label} />
              ))}
            </div>
          </div>

          <AdvisorPortrait
            copy={copy}
            language={language}
          />
        </div>
      </section>

      <VideoPlaceholderSection video={copy.home.video} language={language} />

      <HomeProblemSection copy={copy} language={language} />

      <HomeFamilyDimensionSection copy={copy} />

      <HomeHowGilbertWorksSection copy={copy} language={language} />

      <HomeAssessmentEntrySection copy={copy} language={language} />

      <section className="px-5 pb-16 pt-16 sm:px-8 sm:pt-20 lg:px-12 xl:px-8">
        <div className="mx-auto max-w-[1400px] overflow-hidden rounded-lg bg-forest text-white shadow-soft lg:grid lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {finalCta.title}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/76 sm:text-lg">
              {finalCta.body}
            </p>
            <p className="mt-4 text-sm font-semibold text-white/58">{finalCta.note}</p>
            <button
              type="button"
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#F1C84C] px-4 text-xs font-bold text-forest transition duration-200 hover:-translate-y-0.5 hover:bg-[#E6B93E] active:translate-y-px active:scale-[0.99] sm:w-auto sm:px-5 sm:text-sm"
              onClick={startConversation}
            >
              {finalCta.primary}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
            <button
              type="button"
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-white/24 px-4 text-xs font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#C9B2DE] hover:text-[#C9B2DE] active:translate-y-px active:scale-[0.99] sm:ml-3 sm:mt-8 sm:w-auto sm:px-5 sm:text-sm"
              onClick={onStartAssessment}
            >
              {finalCta.secondary}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>
          <div className="relative hidden min-h-full overflow-hidden lg:block">
            <img
              className="absolute inset-0 h-full w-full object-cover object-[58%_center] opacity-80"
              src="/family-governance-roundtable-gilbert-speaking.png"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/60 to-transparent" />
          </div>
        </div>
      </section>
    </section>
  );
}

function HomeProblemSection({ copy, language }) {
  const sectionLabel =
    language === "es" ? "El problema que ayuda a ordenar" : "The problem Gilbert helps solve";
  const mapLabel = language === "es" ? "Mapa de temas" : "Issue map";
  const icons = [Landmark, CalendarDays, Scale, UsersRound, Compass, ShieldCheck];

  return (
    <section className="border-b border-forest/10 bg-cream px-5 py-16 sm:px-8 sm:py-20 lg:px-12 xl:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[0.36fr_0.64fr] lg:items-start">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
            {sectionLabel}
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-forest sm:text-5xl">
            {copy.home.helpingTitle}
          </h2>
          <p className="mt-5 text-base leading-8 text-ink/74 sm:text-lg sm:leading-9">
            {copy.home.challengeIntro}
          </p>
          <p className="mt-6 border-l-2 border-[#C9B2DE] pl-4 text-sm font-semibold leading-6 text-forest/76">
            {language === "es"
              ? "El punto no es agregar más gobierno. Es separar los temas correctos para que la familia pueda decidir con calma."
              : "The point is not to add more governance. It is to separate the right issues so the family can make decisions with more calm."}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-line sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">
            {mapLabel}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {copy.home.challengeItems.map((item, index) => {
              const Icon = icons[index] ?? Compass;

              return (
                <article
                  key={item.title}
                  className="grid grid-cols-[40px_1fr] gap-4 rounded-lg bg-[#F4EEE2] p-4 shadow-line"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-forest text-white">
                    <Icon aria-hidden="true" size={18} />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold leading-tight text-forest">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-ink/70">{item.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeFamilyDimensionSection({ copy }) {
  const evidence = copy.home.evidence;

  return (
    <section className="border-b border-forest/10 bg-white px-5 py-16 sm:px-8 lg:px-12 xl:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
            {evidence.label}
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-forest sm:text-5xl">
            {evidence.title}
          </h2>
          <p className="mt-5 text-base leading-8 text-ink/76 sm:text-lg">{evidence.intro}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {evidence.stats.map((stat) => (
            <div key={stat.value} className="rounded-lg border border-forest/10 bg-parchment/32 p-6">
              <p className="font-display text-5xl font-semibold text-forest">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-ink/68">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-lg border border-forest/10">
          <div className="grid grid-cols-1 gap-2 bg-forest px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white sm:grid-cols-[0.8fr_1fr_1fr] sm:gap-4 sm:px-5">
            <span className="hidden sm:block" />
            <span>{evidence.comparisonHeaders.informal}</span>
            <span>{evidence.comparisonHeaders.advisory}</span>
          </div>
          {evidence.comparisons.map((row, index) => (
            <div
              key={row.theme}
              className={`grid grid-cols-1 gap-2 p-4 sm:grid-cols-[0.8fr_1fr_1fr] sm:gap-4 sm:p-5 ${
                index % 2 === 0 ? "bg-parchment/24" : "bg-white"
              }`}
            >
              <p className="font-display text-lg font-semibold text-forest">{row.theme}</p>
              <p className="text-sm leading-6 text-ink/64">{row.informalShort}</p>
              <p className="text-sm leading-6 text-forest/82">{row.advisoryShort}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs font-medium leading-5 text-muted">{evidence.sourceNote}</p>
      </div>
    </section>
  );
}

function HomeHowGilbertWorksSection({ copy, language }) {
  const icons = [Compass, Landmark, Handshake, UsersRound];

  return (
    <section className="border-b border-forest/10 bg-cream px-5 py-16 sm:px-8 lg:px-12 xl:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-x-8 gap-y-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
        <div className="lg:col-start-1">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
            {copy.services.previewLabel}
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-forest sm:text-5xl">
            {copy.services.previewTitle}
          </h2>
        </div>

        <p className="max-w-2xl text-base leading-8 text-ink/74 sm:text-lg lg:col-start-2 lg:self-end lg:pb-2">
          {copy.home.approachSubtitle}
        </p>

        <div className="h-[300px] overflow-hidden rounded-xl shadow-soft sm:h-[360px] lg:col-start-1 lg:row-start-2 lg:h-full lg:min-h-[520px]">
          <img
            className="h-full w-full object-cover object-[78%_center]"
            src="/gilbert-advisory-wall-session-gilbert-facing-family.png"
            alt={language === "es"
              ? "Familia empresaria revisando un marco de gobierno en una sesión de asesoría"
              : "Family enterprise group reviewing a governance framework in an advisory session"}
          />
        </div>

        <div className="grid auto-rows-fr gap-4 md:grid-cols-2 lg:col-start-2 lg:row-start-2">
          {copy.services.items.map((service, index) => {
            const Icon = icons[index] ?? Compass;

            return (
              <article
                key={service.title}
                className="flex min-h-[220px] flex-col rounded-lg border border-forest/10 bg-white p-5 shadow-line transition duration-200 hover:-translate-y-1 hover:border-forest/20 hover:shadow-soft sm:p-6"
              >
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-lg bg-forest text-white">
                  <Icon aria-hidden="true" size={20} />
                </div>
                <h4 className="font-display text-2xl font-semibold leading-tight text-forest">
                  {service.title}
                </h4>
                <p className="mt-3 text-sm leading-6 text-ink/72">{service.summary}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HomeAssessmentEntrySection({ copy, language }) {
  const assessmentCopy = getHomeAssessmentCopy(language);
  const steps = getHomeAssessmentSteps(language);

  return (
    <section className="border-b border-forest/10 bg-white px-5 py-16 sm:px-8 lg:px-12 xl:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-10 rounded-lg bg-[#F4EEE2] p-6 shadow-line sm:p-8 lg:grid-cols-[0.4fr_0.6fr] lg:items-start">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
            {assessmentCopy.label}
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-forest sm:text-5xl">
            {copy.home.toolTitle}
          </h2>
        </div>
        <div className="grid gap-4">
          {copy.home.toolParagraphs.map((paragraph) => (
            <p key={paragraph} className="text-base leading-8 text-ink/74 sm:text-lg">
              {paragraph}
            </p>
          ))}
          <div className="mt-2 flex gap-3 border-l-2 border-[#C9B2DE] pl-4">
            <ShieldCheck aria-hidden="true" className="mt-1 shrink-0 text-forest" size={20} />
            <div>
              <p className="text-sm font-bold text-forest">{assessmentCopy.privacyTitle}</p>
              <p className="mt-1 text-sm leading-6 text-ink/70">{assessmentCopy.privacyBody}</p>
            </div>
          </div>
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step} className="border-l border-forest/18 pl-4">
                <span className="font-display text-2xl font-semibold leading-none text-copper/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm font-medium leading-6 text-forest/78">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function ServicesPage({ copy, onNavigate }) {
  const serviceIcons = [Compass, Landmark, Handshake, UsersRound];

  return (
    <section className="w-full">
      <section className="border-b border-forest/10 bg-[linear-gradient(135deg,#f8f3ea_0%,#F4EEE2_48%,#E9DFCC_100%)] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 xl:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.56fr_0.44fr] lg:items-end">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
              {copy.services.label}
            </p>
            <h1 className="mt-4 font-display text-[2.65rem] font-semibold leading-[1.04] tracking-tight text-forest sm:text-6xl xl:text-7xl">
              {copy.services.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-ink/74 sm:text-lg sm:leading-9">
              {copy.services.intro}
            </p>
          </div>

          <aside className="rounded-lg border border-forest/10 bg-white/76 p-6 shadow-line backdrop-blur sm:p-8">
            <h2 className="font-display text-3xl font-semibold leading-tight text-forest">
              {copy.services.promiseTitle}
            </h2>
            <p className="mt-4 text-base leading-8 text-ink/72">
              {copy.services.promiseBody}
            </p>
          </aside>
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 lg:px-12 xl:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-5 lg:grid-cols-2">
          {copy.services.items.map((service, index) => {
            const Icon = serviceIcons[index] ?? Compass;
            return (
              <ServiceDetailCard
                key={service.title}
                service={service}
                icon={Icon}
                labels={copy.services}
                index={index}
              />
            );
          })}
        </div>
      </section>

      <section className="px-5 pb-16 pt-16 sm:px-8 sm:pt-20 lg:px-12 xl:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-8 rounded-lg bg-forest px-8 py-10 text-white shadow-soft sm:px-12 sm:py-10 lg:grid-cols-[0.72fr_0.28fr] lg:items-center lg:px-14 lg:py-10">
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {copy.services.ctaTitle}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/76 sm:text-lg">
              {copy.services.ctaBody}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#F1C84C] px-5 text-sm font-bold text-forest transition duration-200 hover:-translate-y-0.5 hover:bg-[#E6B93E] active:translate-y-px active:scale-[0.99]"
              onClick={() => onNavigate("assessment-home")}
            >
              {copy.services.diagnosticCta}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/24 px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:border-copper hover:text-copper active:translate-y-px active:scale-[0.99]"
              onClick={() => onNavigate("about")}
            >
              {copy.services.aboutCta}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}

function ServiceDetailCard({ service, icon: Icon, labels, index }) {
  return (
    <article
      className="rounded-lg border border-forest/10 bg-parchment/46 p-6 shadow-line transition duration-200 hover:-translate-y-1 hover:bg-parchment/62 hover:shadow-soft sm:p-8"
      style={{ "--index": index }}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-forest text-white">
          <Icon aria-hidden="true" size={22} />
        </div>
        <span className="font-display text-5xl font-semibold leading-none text-copper/30">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h2 className="mt-6 font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl">
        {service.title}
      </h2>
      <p className="mt-4 text-base leading-8 text-ink/74">{service.summary}</p>

      <div className="mt-6 grid gap-4">
        <ServiceDetail label={labels.forLabel} body={service.forWhom} />
        <ServiceDetail label={labels.helpsLabel} body={service.helpsWith} />
        <ServiceDetail label={labels.outcomeLabel} body={service.outcome} />
      </div>
    </article>
  );
}

function ServiceDetail({ label, body }) {
  return (
    <div className="rounded-md border border-forest/10 bg-white/76 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">{label}</p>
      <p className="mt-2 text-sm leading-6 text-ink/72 sm:text-base sm:leading-7">{body}</p>
    </div>
  );
}

function VideoPlaceholderSection({ video, language }) {
  return (
    <section className="border-b border-forest/10 bg-white px-5 py-12 sm:px-8 lg:px-12 xl:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[0.5fr_0.5fr] lg:items-center">
        <div className="max-w-3xl lg:self-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
            {video.label}
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-forest sm:text-5xl">
            {video.title}
          </h2>
          <p className="mt-4 text-base leading-8 text-ink/74 sm:text-lg">
            {video.body}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-forest/10 bg-forest shadow-soft">
          <div className="relative aspect-video overflow-hidden bg-[#103F36]">
            {video.embedUrl ? (
              <iframe
                className="h-full w-full"
                src={video.embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-white">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(244,238,226,0.08)_0%,rgba(244,238,226,0)_42%),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[length:auto,72px_72px,72px_72px]" />
                <div className="absolute left-6 top-6 text-left font-display text-3xl font-semibold leading-none text-[#F4EEE2]/18 sm:text-5xl">
                  Gilbert
                  <br />
                  Devlyn
                </div>
                <div className="absolute bottom-6 right-6 h-16 w-28 border-b border-r border-[#F1C84C]/55" />
                <span className="grid h-16 w-16 place-items-center rounded-full border border-white/24 bg-white/14 text-white shadow-line backdrop-blur">
                  <Play aria-hidden="true" size={28} fill="currentColor" />
                </span>
                <span className="rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/82">
                  {video.duration}
                </span>
                <p className="max-w-sm text-sm font-medium leading-6 text-white/72">
                  {language === "es"
                    ? "Espacio reservado para el video final de Gilbert."
                    : "Reserved space for Gilbert's final video."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutVideoSection({ video, language }) {
  return (
    <section className="px-5 py-12 sm:px-8 sm:py-14 lg:px-12 lg:py-16 xl:px-8">
      <div className="mx-auto max-w-[1100px] text-center">
        <div className="mx-auto mb-7 max-w-3xl">
          {video.label ? (
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
              {video.label}
            </p>
          ) : null}
          <h1 className={`${video.label ? "mt-4 " : ""}font-display text-4xl font-semibold leading-tight tracking-tight text-forest sm:text-5xl lg:text-6xl`}>
            {video.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-ink/70 sm:text-lg">
            {video.body}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-lg border border-forest/10 bg-forest shadow-soft">
          <div className="aspect-video bg-[linear-gradient(135deg,rgba(28,61,46,0.92),rgba(28,61,46,0.72)),url('/gilbert-home.jpg')] bg-cover bg-center">
            {video.embedUrl ? (
              <iframe
                className="h-full w-full"
                src={video.embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-white">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-white/24 bg-white/14 text-white shadow-line backdrop-blur">
                  <Play aria-hidden="true" size={24} fill="currentColor" />
                </span>
                <span className="rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/82">
                  {video.duration}
                </span>
                <p className="max-w-sm text-sm font-medium leading-6 text-white/72">
                  {language === "es"
                    ? "Espacio reservado para el video final de Gilbert."
                    : "Reserved space for Gilbert's final video."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }) {
  return (
    <div className="min-w-0 rounded-lg border border-forest/10 bg-white/70 p-3 shadow-line backdrop-blur sm:p-4">
      <p className="font-display text-2xl font-semibold leading-none tracking-tight text-forest sm:text-3xl">
        {value}
      </p>
      <p className="mt-2 text-[0.62rem] font-bold uppercase leading-4 tracking-[0.11em] text-muted sm:text-xs sm:tracking-[0.14em]">{label}</p>
    </div>
  );
}

function AdvisorPortrait({ language }) {
  return (
    <aside
      className="fade-up relative min-h-[430px] w-full sm:min-h-[560px] lg:min-h-[640px]"
      style={{ "--index": 2 }}
    >
      <div className="portrait-frame absolute inset-0 overflow-hidden rounded-lg border border-forest/12 bg-forest shadow-soft">
        <img
          className="h-full w-full object-cover object-[50%_center] lg:object-[52%_center]"
          src="/gilbert-home.jpg"
          alt={language === "es" ? "Retrato de Gilbert Devlyn" : "Portrait of Gilbert Devlyn"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/84 via-forest/12 to-transparent" />
      </div>
    </aside>
  );
}

function AboutPage({ copy, language, onNavigate }) {
  return (
    <section className="w-full">
      <AboutVideoSection video={copy.about.video} language={language} />

      <section className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16 xl:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[minmax(360px,0.72fr)_minmax(0,0.95fr)] lg:items-stretch">
          <div className="flex flex-col gap-4 lg:h-full">
            <div className="portrait-frame relative h-[420px] overflow-hidden rounded-lg bg-forest shadow-soft sm:h-[520px] lg:h-[640px] xl:h-[720px]">
              <img
                className="absolute inset-0 h-full w-full object-cover object-[58%_center]"
                src="/gilbert-about.jpg"
                alt={
                  language === "es"
                    ? "Retrato profesional de Gilbert Devlyn"
                    : "Professional portrait of Gilbert Devlyn"
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/64 via-transparent to-transparent" />
            </div>
          </div>

          <div className="flex min-h-full flex-col justify-start lg:py-1">
            <h2 className="max-w-4xl font-display text-[2.65rem] font-semibold leading-[1.04] text-forest sm:text-[3.45rem] xl:text-[4rem]">
              {copy.about.title}
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {copy.about.quickFacts.map((fact) => (
                <div key={fact.label} className="rounded-lg border border-forest/10 bg-white/72 p-4 shadow-line">
                  <p className="font-display text-3xl font-semibold leading-none tracking-tight text-forest">
                    {fact.value}
                  </p>
                  <p className="mt-2 text-[0.66rem] font-bold uppercase leading-4 tracking-[0.13em] text-muted">
                    {fact.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-4">
              {copy.about.bio.map((paragraph) => (
                <p key={paragraph} className="text-base leading-7 text-ink/76 sm:text-[1.02rem] sm:leading-8">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AboutContextSection copy={copy} />

      <section className="border-y border-forest/10 bg-white px-5 py-14 sm:px-8 lg:px-12 xl:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-5 lg:grid-cols-2">
            <CredentialList title={copy.about.educationTitle} items={copy.about.educationItems} />
            <CredentialList title={copy.about.focusTitle} items={copy.about.focusItems} />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12 xl:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="max-w-3xl">
              <h2 className="font-display text-4xl font-semibold tracking-tight text-forest sm:text-5xl">
                {copy.about.testimonialsTitle}
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted">
                {copy.about.testimonialsSubtitle}
              </p>
            </div>
            <section className="rounded-lg border border-forest/10 bg-white p-6 shadow-line sm:p-8">
              <h3 className="font-display text-3xl font-semibold leading-tight text-forest">
                {copy.about.situationsTitle}
              </h3>
              <ul className="mt-5 space-y-3">
                {copy.about.situations.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-7 text-ink/74">
                    <Check className="mt-1 shrink-0 text-copper" aria-hidden="true" size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 lg:px-12 xl:px-8">
        <div className="mx-auto max-w-[1400px] rounded-lg bg-forest p-6 text-white shadow-soft sm:p-10 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
              {copy.nav.assessment}
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {copy.about.toolTitle}
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/76">{copy.about.toolIntro}</p>
          </div>
          <div className="mt-8 lg:mt-0">
            <div className="grid gap-4 sm:grid-cols-3">
              {copy.about.toolSteps.map((step, index) => (
                <div key={step.title} className="rounded-lg border border-white/16 bg-white/8 p-4">
                  <span className="font-display text-2xl font-semibold leading-none text-[#F1C84C]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-3 text-sm font-bold text-white">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{step.body}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-base leading-7 text-white/76">{copy.about.toolReceiveBody}</p>

            <div className="mt-6 flex gap-3 rounded-lg border border-white/16 bg-white/8 p-5">
              <ShieldCheck aria-hidden="true" className="mt-1 shrink-0 text-[#F1C84C]" size={22} />
              <div>
                <p className="text-sm font-bold text-white">{copy.about.toolPrivacyTitle}</p>
                <p className="mt-2 text-sm leading-6 text-white/72">{copy.about.toolPrivacyBody}</p>
              </div>
            </div>

            <button
              type="button"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#F1C84C] px-5 text-sm font-bold text-forest transition duration-200 hover:-translate-y-0.5 hover:bg-[#E6B93E] active:translate-y-px active:scale-[0.99]"
              onClick={() => onNavigate("assessment-home")}
            >
              {copy.about.toolCta}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>
        </div>
      </section>

    </section>
  );
}

function AboutContextSection({ copy }) {
  const icons = [UsersRound, Landmark, Compass, ShieldCheck];

  return (
    <section className="border-y border-forest/10 bg-parchment/46 px-5 py-14 sm:px-8 lg:px-12 xl:px-8">
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.43fr_0.57fr] lg:items-start">
        <div className="max-w-3xl lg:sticky lg:top-28">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
            {copy.about.contextLabel}
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-forest sm:text-5xl">
            {copy.about.contextTitle}
          </h2>
          <p className="mt-5 text-base leading-8 text-ink/74 sm:text-lg">
            {copy.about.contextBody}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {copy.about.contextItems.map((item, index) => {
            const Icon = icons[index] ?? Compass;

            return (
              <article
                key={item.title}
                className="rounded-lg border border-forest/10 bg-white p-5 shadow-line transition duration-200 hover:-translate-y-1 hover:border-forest/20 hover:shadow-soft sm:p-6"
              >
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-lg bg-forest text-white">
                  <Icon aria-hidden="true" size={20} />
                </div>
                <h3 className="font-display text-2xl font-semibold leading-tight text-forest">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-ink/72 sm:text-base sm:leading-7">
                  {item.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CredentialList({ title, items }) {
  return (
    <section className="rounded-lg border border-forest/10 bg-white p-6 shadow-line sm:p-8">
      <h2 className="font-display text-3xl font-semibold tracking-tight text-forest sm:text-4xl">
        {title}
      </h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-base leading-7 text-ink/74">
            <Check className="mt-1 shrink-0 text-copper" aria-hidden="true" size={18} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AssessmentLanding({ copy, language, onStart }) {
  const outcomeIcons = [Compass, ShieldCheck, CalendarDays];
  const diagnosticFacts =
    language === "es"
      ? [
          { value: "50", label: "preguntas" },
          { value: "8", label: "temas clave" },
          { value: "~10", label: "minutos" },
          { value: "0", label: "preparación" }
        ]
      : [
          { value: "50", label: "questions" },
          { value: "8", label: "key topics" },
          { value: "~10", label: "minutes" },
          { value: "0", label: "prep needed" }
        ];
  const deliverables =
    language === "es"
      ? ["Mapa visual", "Resumen claro", "Áreas de enfoque"]
      : ["Visual map", "Clear summary", "Focus areas"];

  return (
    <section className="w-full flex-1 px-4 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-8">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="grid overflow-hidden rounded-xl border border-forest/10 bg-white shadow-soft lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.58fr)]">
          <section className="relative overflow-hidden bg-forest p-6 text-white sm:p-8 lg:p-10 xl:p-12">
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:38px_38px]" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#F2A56E] sm:text-sm">
                  {copy.nav.assessment}
                </p>
                <span className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/72 sm:text-xs">
                  {copy.assessmentIntro.introBadge}
                </span>
              </div>
              <h1 className="mt-5 max-w-4xl font-display text-[2.2rem] font-semibold leading-[1.04] [text-wrap:balance] sm:text-5xl lg:text-6xl">
                {copy.assessmentIntro.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                {copy.assessmentIntro.body}
              </p>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-white/62 sm:text-base">
                {copy.assessmentIntro.startingPointNote}
              </p>

              <button
                type="button"
                className="mt-7 inline-flex min-h-[3.15rem] w-full items-center justify-center gap-3 rounded-md bg-[#F1C84C] px-5 text-base font-semibold text-forest shadow-line transition duration-200 hover:bg-[#E6B93E] active:translate-y-px lg:hidden"
                onClick={() => onStart("full")}
              >
                {copy.assessmentIntro.conversationCta}
                <ArrowRight aria-hidden="true" size={19} />
              </button>

              <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4">
                {diagnosticFacts.map((item) => (
                  <div key={item.label} className="border-l border-white/22 pl-4">
                    <span className="block font-display text-3xl font-semibold leading-none text-white sm:text-[2.6rem]">
                      {item.value}
                    </span>
                    <span className="mt-2 block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/62 sm:text-xs">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-lg border border-white/18 bg-white/8 p-4 sm:p-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] xl:items-start">
                  <div>
                    <p className="text-base font-semibold text-white">
                      {copy.assessmentIntro.notAuditTitle}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/70">
                      {copy.notAudit}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F2A56E]">
                        {copy.assessmentIntro.journeyLabel}
                      </p>
                      <div className="mt-3 grid gap-2">
                        {copy.assessmentIntro.journey.map((item, index) => (
                          <span key={item.title} className="flex items-center gap-2 text-sm font-semibold text-white/80">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/24 text-[0.68rem] text-[#F2A56E]">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            {item.title}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F2A56E]">
                        {copy.assessmentIntro.resultSignalsLabel}
                      </p>
                      <div className="mt-3 grid gap-2">
                        {copy.assessmentIntro.resultSignals.map((item) => (
                          <span
                            key={item}
                            className="flex items-center gap-2 text-sm font-semibold text-white/80"
                          >
                            <Check aria-hidden="true" size={15} className="shrink-0 text-[#F2A56E]" />
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3 rounded-lg border border-white/18 bg-white/8 p-4 sm:items-start sm:p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white/12 text-[#F2A56E]">
                  <Handshake aria-hidden="true" size={19} />
                </span>
                <span>
                  <span className="block text-base font-semibold text-white">
                    {copy.assessmentIntro.gilbertContextTitle}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-white/70">
                    {copy.assessmentIntro.gilbertContextBody}
                  </span>
                </span>
              </div>
            </div>
          </section>

          <aside className="flex flex-col justify-between gap-8 bg-[#fbf8f2] p-6 sm:p-8 lg:p-10">
            <div>
              <div className="flex items-start gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-forest text-white shadow-line">
                  <ClipboardCheck aria-hidden="true" size={24} />
                </span>
                <span>
                  <span className="block font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl">
                    {copy.modes.full.title}
                  </span>
                  <span className="mt-2 block text-base leading-7 text-ink/70">
                    {copy.modes.full.description}
                  </span>
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {deliverables.map((item) => (
                  <span
                    key={item}
                    className="flex min-h-11 items-center gap-2 rounded-md border border-forest/10 bg-white px-3 text-sm font-semibold text-forest"
                  >
                    <Check aria-hidden="true" size={16} className="shrink-0 text-copper" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-7 space-y-5">
                {copy.assessmentIntro.outcomes.map((item, index) => {
                  const Icon = outcomeIcons[index] ?? Compass;
                  return (
                    <article key={item.title} className="flex gap-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-forest/10 text-forest">
                        <Icon aria-hidden="true" size={18} />
                      </span>
                      <span>
                        <span className="block text-base font-semibold text-forest">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-muted">
                          {item.body}
                        </span>
                      </span>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-3 rounded-md bg-[#F1C84C] px-5 py-4 text-base font-semibold text-forest shadow-line transition duration-200 hover:-translate-y-0.5 hover:bg-[#E6B93E] active:translate-y-0"
                onClick={() => onStart("full")}
              >
                {copy.assessmentIntro.conversationCta}
                <ArrowRight aria-hidden="true" size={19} />
              </button>
            </div>
          </aside>
        </div>

      </div>
    </section>
  );
}

function LanguageToggle({ language, setLanguage, variant = "light", disabled = false }) {
  const dark = variant === "dark";

  return (
    <div
      className={`inline-flex rounded-full border p-1 ${
        dark ? "w-fit border-white/24 bg-white/8" : "w-fit border-forest/15 bg-white"
      } ${disabled ? "opacity-50" : ""}`}
      aria-label="Language selection"
      title={
        disabled
          ? language === "es"
            ? "Termina o reinicia la autoevaluación para cambiar de idioma"
            : "Finish or restart the self-assessment to change language"
          : undefined
      }
    >
      {Object.values(LANGUAGES).map((item) => {
        const active = item.code === language;
        return (
          <button
            key={item.code}
            type="button"
            disabled={disabled}
            className={`min-h-9 min-w-11 rounded-full px-2 text-xs font-semibold transition sm:min-h-10 sm:min-w-16 sm:px-4 sm:text-sm disabled:cursor-not-allowed ${
              active
                ? dark
                  ? "bg-white text-forest"
                  : "bg-forest text-white"
                : dark
                  ? "text-white/70 hover:text-white"
                  : "text-forest/68 hover:text-forest"
            }`}
            aria-pressed={active}
            onClick={() => {
              if (disabled) return;
              setLanguage(item.code);
            }}
          >
            {item.short}
          </button>
        );
      })}
    </div>
  );
}

function SiteFooter({ copy, language, onNavigate }) {
  const footer = getFooterContent(language);
  const socialLinks = [
    { label: "LinkedIn", href: footer.linkedinUrl, icon: Linkedin },
    { label: footer.emailLabel, href: `mailto:${copy.contactEmail}`, icon: Mail }
  ];

  return (
    <footer
      data-site-footer
      className="mt-auto border-t border-white/10 bg-forest px-5 py-10 text-white sm:px-8 sm:py-12 lg:px-12 xl:px-8"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col items-center text-center">
          <button
            type="button"
            className="group w-fit text-left"
            onClick={() => onNavigate("home")}
          >
            <span>
              <span className="block font-display text-2xl font-semibold leading-tight tracking-tight text-white">
                {copy.brandName}
              </span>
              <span className="block text-sm font-medium text-white/62">{copy.brandLine}</span>
            </span>
          </button>

          <p className="mt-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/76">
            <UsersRound aria-hidden="true" size={15} />
            {footer.trusted}
          </p>

          <div className="mt-6 flex items-center justify-center gap-4" aria-label={footer.socialLabel}>
            {socialLinks.map((link) => (
              <FooterSocialLink key={link.label} {...link} />
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-sm justify-items-center gap-10 border-t border-white/12 pt-8 text-center">
          <div className="w-full max-w-xs">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">
              {footer.credentialsLabel}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm leading-7 text-white/68">
              {footer.credentials.map((credential) => (
                <li key={credential}>
                  {credential}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/12 pt-5 text-xs leading-5 text-white/54 lg:flex-row lg:items-center lg:justify-between">
          <p>{copy.footerRights}</p>
          <p>{footer.trustLine}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterSocialLink({ icon: Icon, label, href }) {
  return (
    <a
      className="grid h-11 w-11 place-items-center rounded-full border border-white/70 bg-transparent text-white transition duration-200 hover:-translate-y-0.5 hover:border-copper hover:bg-white hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper/60"
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      aria-label={label}
    >
      <Icon aria-hidden="true" size={18} />
    </a>
  );
}

function AssessmentProfileIntake({
  copy,
  mode,
  profile,
  profileTouched,
  profileIsComplete,
  emailIsValid,
  phoneIsValid,
  relationshipRequiresDetail,
  countryOptions,
  onBack,
  onChange,
  onSubmit,
  onOpenPrivacyPolicy
}) {
  const intake = copy.intake;
  const selectedMode = copy.modes[mode] ?? copy.modes.full;
  const selectedPhoneCountry =
    intake.phoneCountryOptions.find((option) => option.id === profile.phoneCountry) ??
    intake.phoneCountryOptions[0];
  const phoneCountryMenuRef = useRef(null);
  const [phoneCountryOpen, setPhoneCountryOpen] = useState(false);
  const [phoneCountrySearch, setPhoneCountrySearch] = useState("");
  const phoneCountryLabels = useMemo(
    () => new Map(countryOptions.map((option) => [option.id, option.label])),
    [countryOptions]
  );
  const selectedPhoneCountryLabel =
    phoneCountryLabels.get(selectedPhoneCountry.id) ?? selectedPhoneCountry.countryCode;
  const filteredPhoneCountryOptions = useMemo(() => {
    const searchTerm = phoneCountrySearch.trim().toLowerCase();

    if (!searchTerm) return intake.phoneCountryOptions;

    return intake.phoneCountryOptions.filter((option) => {
      const countryName = phoneCountryLabels.get(option.id) ?? option.countryCode;
      const searchableText = `${countryName} ${option.countryCode} ${option.dialCode}`.toLowerCase();
      return searchableText.includes(searchTerm);
    });
  }, [intake.phoneCountryOptions, phoneCountryLabels, phoneCountrySearch]);
  const showProfileError = profileTouched && !profileIsComplete;
  const showEmailError = profileTouched && profile.email.trim() && !emailIsValid;
  const showPhoneError = profileTouched && profile.phoneNumber.trim() && !phoneIsValid;
  const inputClass =
    "min-h-12 w-full rounded-lg border border-forest/16 bg-white px-4 text-base text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/20";
  const labelClass = "mb-2 block text-sm font-semibold leading-5 text-forest";
  const requiredMark = (
    <span aria-hidden="true" className="ml-1 align-super text-sm font-bold leading-none text-copper">
      *
    </span>
  );

  useEffect(() => {
    if (!phoneCountryOpen) return undefined;

    function closePhoneCountryMenu(event) {
      if (!phoneCountryMenuRef.current?.contains(event.target)) {
        setPhoneCountryOpen(false);
        setPhoneCountrySearch("");
      }
    }

    document.addEventListener("mousedown", closePhoneCountryMenu);
    return () => document.removeEventListener("mousedown", closePhoneCountryMenu);
  }, [phoneCountryOpen]);

  return (
    <section className="w-full px-5 py-5 sm:px-8 lg:px-16 xl:px-24">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="flex rounded-xl bg-forest p-6 text-white shadow-soft sm:p-8 lg:min-h-[560px]">
          <div className="flex min-h-full w-full flex-col">
          <button
            type="button"
            className="mb-7 inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white/82 transition hover:bg-white/10"
            onClick={onBack}
          >
            <ArrowLeft aria-hidden="true" size={18} />
            {copy.back}
          </button>

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper">
            {intake.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {intake.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/76">{intake.body}</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/58">
            {intake.privacyReassurance}
          </p>

          <div className="mt-8 border-t border-white/14 pt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/55">
              {intake.modeSectionLabel}
            </p>
            <p className="mt-2 text-base leading-7 text-white/78">
              {selectedMode.description}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-white/72">{intake.contextTitle}</p>
            <p className="mt-2 text-sm leading-6 text-white/58">{intake.contextBody}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-lg border border-white/14 bg-white/10 p-4">
              <p className="text-sm font-semibold text-white">{intake.nextTitle}</p>
              <ol className="mt-3 space-y-3">
                {intake.nextSteps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-white/85">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-copper bg-copper text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-1">
              <p className="text-sm font-semibold text-white/72">{intake.includesTitle}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {intake.includes.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/12 px-3 py-1 text-xs font-semibold text-white/58"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          </div>
        </aside>

        <form
          className="rounded-xl border border-forest/12 bg-white p-5 shadow-soft sm:p-7 lg:p-8"
          noValidate
          onSubmit={onSubmit}
        >
          <div className="mb-6 grid gap-4 border-b border-forest/10 pb-6 md:grid-cols-[minmax(0,0.9fr)_minmax(260px,0.65fr)] md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-copper">
                {intake.formLabel}
              </p>
              <h2 className="mt-2 font-display text-[2rem] font-semibold leading-[1.08] text-forest sm:text-4xl">
                {intake.formTitle}
              </h2>
            </div>
            <p className="text-sm leading-6 text-muted">{intake.formNote}</p>
          </div>

          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            <label className="block">
              <span className={labelClass}>
                {intake.name}
                {requiredMark}
              </span>
              <input
                className={inputClass}
                value={profile.name}
                onChange={(event) => onChange("name", event.target.value)}
                placeholder={intake.namePlaceholder}
                autoComplete="name"
                required
                aria-invalid={profileTouched && !profile.name.trim()}
              />
            </label>

            <label className="block">
              <span className={labelClass}>
                {intake.email}
                {requiredMark}
              </span>
              <input
                className={inputClass}
                value={profile.email}
                onChange={(event) => onChange("email", event.target.value)}
                placeholder={intake.emailPlaceholder}
                autoComplete="email"
                inputMode="email"
                required
                aria-invalid={profileTouched && !emailIsValid}
              />
              {showEmailError && (
                <p className="mt-2 text-sm font-semibold text-[#9F3F32]">{intake.invalidEmail}</p>
              )}
            </label>

            <label className="block md:col-span-2">
              <span className={labelClass}>
                {intake.phone}
                {requiredMark}
              </span>
              <div
                className="flex min-h-12 rounded-lg border border-forest/16 bg-white transition focus-within:border-copper focus-within:ring-2 focus-within:ring-copper/20"
                aria-invalid={profileTouched && !phoneIsValid}
              >
                <div
                  ref={phoneCountryMenuRef}
                  className="relative w-[104px] shrink-0 border-r border-forest/12 sm:w-[108px]"
                >
                  <button
                    type="button"
                    className="flex h-full min-h-12 w-full items-center justify-center gap-1.5 bg-white px-2 text-forest outline-none transition hover:bg-parchment/70"
                    aria-label={`${intake.phoneCountry} ${selectedPhoneCountryLabel} ${selectedPhoneCountry.dialCode}`}
                    aria-expanded={phoneCountryOpen}
                    onClick={() => {
                      setPhoneCountryOpen((value) => {
                        if (value) {
                          setPhoneCountrySearch("");
                        }
                        return !value;
                      });
                    }}
                  >
                    <CountryFlag countryCode={selectedPhoneCountry.countryCode} />
                    <span className="text-sm font-semibold leading-none tabular-nums">
                      {selectedPhoneCountry.dialCode}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-0.5 h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-forest/70"
                    />
                  </button>

                  {phoneCountryOpen && (
                    <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-72 rounded-lg border border-forest/14 bg-white p-2 shadow-soft">
                      <label className="relative block">
                        <Search
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest/45"
                          size={15}
                        />
                        <input
                          className="min-h-9 w-full rounded-md border border-forest/14 bg-parchment/45 py-2 pl-9 pr-3 text-sm font-semibold text-forest outline-none transition placeholder:text-ink/40 focus:border-copper focus:bg-white focus:ring-2 focus:ring-copper/15"
                          value={phoneCountrySearch}
                          onChange={(event) => setPhoneCountrySearch(event.target.value)}
                          placeholder={intake.countrySearchPlaceholder}
                          autoComplete="off"
                        />
                      </label>

                      <div className="mt-2 max-h-56 overflow-y-auto pr-1">
                      {filteredPhoneCountryOptions.map((option) => {
                        const active = option.id === profile.phoneCountry;
                        const countryName = phoneCountryLabels.get(option.id) ?? option.countryCode;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            className={`flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition ${
                              active
                                ? "bg-forest text-white"
                                : "text-forest hover:bg-parchment"
                            }`}
                            aria-pressed={active}
                            aria-label={`${intake.phoneCountry} ${countryName} ${option.dialCode}`}
                            onClick={() => {
                              onChange("phoneCountry", option.id);
                              setPhoneCountryOpen(false);
                              setPhoneCountrySearch("");
                            }}
                          >
                            <CountryFlag countryCode={option.countryCode} />
                            <span className="min-w-0 flex-1 truncate">{countryName}</span>
                          </button>
                        );
                      })}
                      {filteredPhoneCountryOptions.length === 0 && (
                        <p className="px-3 py-4 text-sm font-semibold text-muted">
                          {intake.countryNoResults}
                        </p>
                      )}
                      </div>
                    </div>
                  )}
                </div>
                <input
                  className="min-w-0 flex-1 border-0 bg-white px-3 text-base text-ink outline-none placeholder:text-ink/40 sm:px-5"
                  value={profile.phoneNumber}
                  onChange={(event) => onChange("phoneNumber", event.target.value)}
                  placeholder={selectedPhoneCountry?.phonePlaceholder ?? intake.phonePlaceholder}
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  aria-invalid={profileTouched && !phoneIsValid}
                />
              </div>
              {showPhoneError && (
                <p className="mt-2 text-sm font-semibold text-[#9F3F32]">{intake.invalidPhone}</p>
              )}
            </label>

            <label className="block md:col-span-2">
              <span className={labelClass}>
                {intake.relationship}
                {requiredMark}
              </span>
              <select
                className={inputClass}
                value={profile.relationship}
                onChange={(event) => onChange("relationship", event.target.value)}
                required
                aria-invalid={profileTouched && !profile.relationship}
              >
                <option value="" disabled>
                  {intake.relationshipPlaceholder}
                </option>
                {intake.relationshipOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {relationshipRequiresDetail && (
              <label className="block md:col-span-2">
                <span className={labelClass}>
                  {intake.relationshipOther}
                  {requiredMark}
                </span>
                <input
                  className={inputClass}
                  value={profile.relationshipOther}
                  onChange={(event) => onChange("relationshipOther", event.target.value)}
                  placeholder={intake.relationshipOtherPlaceholder}
                  required
                  aria-invalid={profileTouched && !profile.relationshipOther.trim()}
                />
              </label>
            )}

            <label className="block">
              <span className={labelClass}>
                {intake.generation}
                {requiredMark}
              </span>
              <select
                className={inputClass}
                value={profile.generation}
                onChange={(event) => onChange("generation", event.target.value)}
                required
                aria-invalid={profileTouched && !profile.generation}
              >
                <option value="" disabled>
                  {intake.generationPlaceholder}
                </option>
                {intake.generationOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="block">
              <span className={labelClass}>
                {intake.country}
                {requiredMark}
              </span>
              <CountrySearchSelect
                value={profile.country}
                options={countryOptions}
                onChange={(value) => onChange("country", value)}
                invalid={profileTouched && !profile.country}
                searchPlaceholder={intake.countrySearchPlaceholder}
                emptyMessage={intake.countryNoResults}
              />
            </div>
          </div>

          <div className="mt-7 rounded-lg border border-forest/10 bg-parchment/60 p-4">
            <p className="text-sm font-semibold text-forest">{intake.privacyTitle}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{intake.privacyNote}</p>
          </div>

          <div className="mt-7 flex flex-col gap-4 border-t border-forest/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {showProfileError ? (
              <p className="text-sm font-semibold text-[#9F3F32]">{intake.completeMessage}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-ink/60">{intake.requiredNote}</p>
                <p className="text-sm leading-6 text-ink/60">
                  {intake.privacyAgreement}{" "}
                  <button
                    type="button"
                    className="font-bold text-forest underline decoration-forest/30 underline-offset-4 transition hover:text-copper"
                    onClick={onOpenPrivacyPolicy}
                  >
                    {intake.privacyLink}
                  </button>
                  .
                </p>
              </div>
            )}
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-forest px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-forest-2 active:translate-y-px active:scale-[0.99]"
            >
              {intake.continue}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function AssessmentFlow({
  copy,
  language,
  mode,
  pendingGroupId,
  initialDraft,
  onDraftChange,
  onBack,
  onComplete,
  privacyPolicyOpen,
  onOpenPrivacyPolicy
}) {
  const questions = FULL_QUESTIONS[language];
  const intake = copy.intake;
  const usableDraft = initialDraft?.mode === mode ? initialDraft : null;
  const defaultProfile = {
    name: "",
    email: "",
    phoneCountry: "mx",
    phoneNumber: "",
    relationship: "",
    relationshipOther: "",
    generation: "",
    country: "mx"
  };
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(usableDraft?.index ?? 0, 0), Math.max(questions.length - 1, 0))
  );
  const [answers, setAnswers] = useState(() => usableDraft?.answers ?? {});
  const [profileStepComplete, setProfileStepComplete] = useState(() =>
    Boolean(usableDraft?.profileStepComplete)
  );
  const [profileTouched, setProfileTouched] = useState(() =>
    Boolean(usableDraft?.profileTouched)
  );
  const [profile, setProfile] = useState(() => ({
    ...defaultProfile,
    ...(usableDraft?.profile ?? {})
  }));
  const draftStartedAtRef = useRef(usableDraft?.startedAt ?? new Date().toISOString());
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(() => !usableDraft);
  const awaitingPolicyReturnRef = useRef(false);

  function dismissPrivacyNotice() {
    setShowPrivacyNotice(false);
  }

  function readPrivacyPolicyFromNotice() {
    awaitingPolicyReturnRef.current = true;
    setShowPrivacyNotice(false);
    onOpenPrivacyPolicy();
  }

  useEffect(() => {
    if (!privacyPolicyOpen && awaitingPolicyReturnRef.current) {
      awaitingPolicyReturnRef.current = false;
      setShowPrivacyNotice(true);
    }
  }, [privacyPolicyOpen]);

  const countryOptions = useMemo(
    () => buildCountryOptions(intake.phoneCountryOptions, language),
    [intake.phoneCountryOptions, language]
  );
  const question = questions[index];
  const currentAnswer = answers[question.id];
  const pillar = PILLARS.find((item) => item.id === question.pillarId);
  const pillarIndex = PILLARS.findIndex((item) => item.id === question.pillarId) + 1;
  const answeredCount = questions.filter((item) => isAssessmentAnswered(answers[item.id])).length;
  const progress = (answeredCount / questions.length) * 100;
  const isLast = index === questions.length - 1;
  const relationshipRequiresDetail = profile.relationship === "other";
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim());
  const phoneCountryOption = intake.phoneCountryOptions.find(
    (option) => option.id === profile.phoneCountry
  );
  const phoneIsValid = isPhoneNumberValid(phoneCountryOption, profile.phoneNumber);
  const profileIsComplete = Boolean(
    profile.name.trim() &&
      emailIsValid &&
      profile.phoneCountry &&
      phoneIsValid &&
      profile.relationship &&
      (!relationshipRequiresDetail || profile.relationshipOther.trim()) &&
      profile.generation &&
      profile.country
  );

  useEffect(() => {
    if (!mode || !question) return;

    const draft = {
      version: 1,
      mode,
      language,
      pendingGroupId: pendingGroupId ?? null,
      startedAt: draftStartedAtRef.current,
      profile,
      profileTouched,
      profileStepComplete,
      answers,
      index,
      updatedAt: new Date().toISOString()
    };

    saveAssessmentDraft(draft);
    onDraftChange?.(draft);
  }, [
    answers,
    index,
    language,
    mode,
    pendingGroupId,
    profile,
    profileStepComplete,
    profileTouched,
    question
  ]);

  function updateProfile(field, value) {
    setProfile((current) => {
      const next = { ...current, [field]: value };
      if (field === "phoneCountry") {
        next.phoneNumber = formatPhoneNumber(value, current.phoneNumber);
      }
      if (field === "phoneNumber") {
        next.phoneNumber = formatPhoneNumber(current.phoneCountry, value);
      }
      if (field === "relationship" && value !== "other") {
        next.relationshipOther = "";
      }
      return next;
    });
  }

  function profileForResult() {
    const relationship = intake.relationshipOptions.find((option) => option.id === profile.relationship);
    const generation = intake.generationOptions.find((option) => option.id === profile.generation);
    const country = countryOptions.find((option) => option.id === profile.country);
    const phoneCountry = intake.phoneCountryOptions.find((option) => option.id === profile.phoneCountry);
    const phoneNumber = profile.phoneNumber.trim();

    return {
      name: profile.name.trim(),
      email: profile.email.trim(),
      phoneCountry: profile.phoneCountry,
      phoneCountryLabel: phoneCountry?.countryCode ?? "",
      phoneDialCode: phoneCountry?.dialCode ?? "",
      phoneNumber,
      phoneDigits: phoneDigits(phoneNumber),
      phoneInternational: `${phoneCountry?.dialCode ?? ""} ${phoneNumber}`.trim(),
      relationship: profile.relationship,
      relationshipLabel: relationship?.label ?? "",
      relationshipOther: profile.relationshipOther.trim(),
      generation: profile.generation,
      generationLabel: generation?.label ?? "",
      country: profile.country,
      countryLabel: country?.label ?? ""
    };
  }

  function submitProfile(event) {
    event.preventDefault();
    setProfileTouched(true);
    if (!profileIsComplete) return;
    setProfileStepComplete(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectScore(score) {
    setAnswers((current) => ({ ...current, [question.id]: score }));
  }

  useEffect(() => {
    if (!profileStepComplete) return undefined;

    function handleScoreKey(event) {
      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName));

      if (isTypingTarget || event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^[0-5]$/.test(event.key)) {
        event.preventDefault();
        selectScore(Number(event.key));
        return;
      }

      if ((event.key === "Enter" || event.key === " ") && isAssessmentAnswered(currentAnswer)) {
        event.preventDefault();
        goNext();
      }
    }

    window.addEventListener("keydown", handleScoreKey);
    return () => window.removeEventListener("keydown", handleScoreKey);
  }, [currentAnswer, profileStepComplete, question.id]);

  function goNext() {
    if (!isAssessmentAnswered(currentAnswer)) return;
    if (isLast) {
      onComplete(answers, profileForResult());
      return;
    }
    const nextQuestion = questions[index + 1];
    if (nextQuestion.pillarId !== question.pillarId) {
      setIndex((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setIndex((value) => value + 1);
  }

  if (!profileStepComplete) {
    return (
      <>
        {showPrivacyNotice && (
          <PreAssessmentPrivacyModal
            copy={copy.preAssessmentPrivacy}
            onDismiss={dismissPrivacyNotice}
            onReadPolicy={readPrivacyPolicyFromNotice}
          />
        )}
        <AssessmentProfileIntake
          copy={copy}
          mode={mode}
          profile={profile}
          profileTouched={profileTouched}
          profileIsComplete={profileIsComplete}
          emailIsValid={emailIsValid}
          phoneIsValid={phoneIsValid}
          relationshipRequiresDetail={relationshipRequiresDetail}
          countryOptions={countryOptions}
          onBack={onBack}
          onChange={updateProfile}
          onSubmit={submitProfile}
          onOpenPrivacyPolicy={onOpenPrivacyPolicy}
        />
      </>
    );
  }

  return (
    <section className="flex min-h-[calc(100dvh-80px)] w-full flex-col px-5 py-6 sm:px-8 lg:px-16 xl:px-24">
      {showPrivacyNotice && (
        <PreAssessmentPrivacyModal
          copy={copy.preAssessmentPrivacy}
          onDismiss={dismissPrivacyNotice}
          onReadPolicy={readPrivacyPolicyFromNotice}
        />
      )}
      <header className="mb-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-forest hover:bg-white"
          onClick={onBack}
        >
          <ArrowLeft aria-hidden="true" size={18} />
          {copy.back}
        </button>
          <div className="text-sm font-semibold text-muted">
            {copy.pillar} {pillarIndex} {copy.of} {PILLARS.length} —{" "}
            <span className="text-forest">{pillar.labels[language]}</span>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-4 text-sm text-muted">
            <span>
              {copy.questionOf} {index + 1} {copy.of} {questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-forest/10">
            <div
              className="h-full rounded-full bg-forest transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden rounded-xl border border-forest/12 bg-white p-5 shadow-line lg:block">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-copper">
            {copy.pillar}
          </p>
          <div className="space-y-3">
            {PILLARS.map((item) => {
              const total = questions.filter((q) => q.pillarId === item.id).length;
              const done = questions.filter(
                (q) => q.pillarId === item.id && isAssessmentAnswered(answers[q.id])
              ).length;
              const active = item.id === pillar.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-3 ${
                    active ? "border-copper bg-copper/10" : "border-transparent bg-forest/[0.03]"
                  }`}
                >
                  <p className="text-sm font-semibold leading-5 text-forest">
                    {item.labels[language]}
                  </p>
                  <div className="mt-2 flex gap-1">
                    {Array.from({ length: total }).map((_, dotIndex) => (
                      <span
                        key={dotIndex}
                        className={`h-1.5 flex-1 rounded-full ${
                          dotIndex < done ? "bg-forest" : "bg-forest/12"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="flex items-start lg:items-center">
          <article className="w-full rounded-xl border border-forest/12 bg-white p-5 shadow-soft sm:p-8 lg:p-12">
            <div className="mx-auto mb-8 max-w-4xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-copper">
                {pillar.labels[language]}
              </p>
              <p className="mx-auto mb-6 max-w-2xl text-base leading-7 text-muted">
                {pillar.descriptions[language]}
              </p>
              <h1 className="font-display text-4xl font-semibold leading-tight text-forest sm:text-5xl lg:text-6xl">
                {question.text}
              </h1>
              <p className="mt-5 text-lg text-ink/70">{copy.scorePrompt}</p>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-3 gap-2 sm:gap-3 xl:grid-cols-6">
              {copy.scaleAnchors.map((label, score) => {
                const selected = currentAnswer === score;
                return (
                  <button
                    key={score}
                    type="button"
                    className={`flex min-h-[94px] flex-col items-center justify-center rounded-xl border p-3 text-center transition duration-200 focus-visible:ring-2 focus-visible:ring-copper sm:min-h-[118px] ${
                      selected
                        ? "border-forest bg-forest text-white shadow-soft"
                        : "border-forest/14 bg-parchment/55 text-forest hover:-translate-y-0.5 hover:border-copper hover:bg-white"
                    }`}
                    aria-pressed={selected}
                    onClick={() => selectScore(score)}
                  >
                    <span className="text-3xl font-semibold leading-none">{score}</span>
                    <span
                      className={`mt-3 text-sm leading-snug ${
                        selected ? "text-white/82" : "text-ink/64"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mx-auto mt-3 max-w-5xl">
              <button
                type="button"
                className={`flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border px-4 text-center transition duration-200 focus-visible:ring-2 focus-visible:ring-copper ${
                  currentAnswer === UNKNOWN_ANSWER
                    ? "border-forest/30 bg-forest/[0.06] text-forest shadow-line"
                    : "border-forest/12 bg-[#F7F7F4] text-ink/68 hover:-translate-y-0.5 hover:border-forest/24 hover:bg-white"
                }`}
                aria-pressed={currentAnswer === UNKNOWN_ANSWER}
                onClick={() => selectScore(UNKNOWN_ANSWER)}
              >
                <CircleHelp aria-hidden="true" size={18} className="shrink-0" />
                <span className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-sm font-bold">{copy.unknownOption.label}</span>
                  <span className="text-sm leading-5 text-current/68">{copy.unknownOption.body}</span>
                </span>
              </button>
            </div>

            <div className="mt-8 grid gap-4 border-t border-forest/10 pt-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <p className="max-w-3xl text-sm leading-6 text-ink/60">{copy.scaleNote}</p>
              <div className="grid w-full grid-cols-2 gap-3 sm:w-[18rem]">
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-forest/15 bg-white px-3 text-sm font-semibold text-forest disabled:opacity-40"
                  onClick={() => setIndex((value) => Math.max(0, value - 1))}
                  disabled={index === 0}
                >
                  <ArrowLeft aria-hidden="true" size={18} />
                  {copy.back}
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-forest px-3 text-sm font-semibold text-white transition hover:bg-forest-2 disabled:cursor-not-allowed disabled:bg-forest/35"
                  onClick={goNext}
                  disabled={!isAssessmentAnswered(currentAnswer)}
                >
                  {isLast ? copy.finish : copy.next}
                  <ArrowRight aria-hidden="true" size={18} />
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function LoadingScreen({ copy }) {
  return (
    <section className="grid min-h-[100dvh] place-items-center px-5">
      <div className="max-w-lg rounded-lg border border-forest/12 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-forest/12 border-t-teal" />
        <h1 className="font-display text-4xl text-forest">{copy.loadingTitle}</h1>
        <p className="mt-4 text-lg leading-7 text-ink/68">{copy.loadingBody}</p>
      </div>
    </section>
  );
}

function ResultsScreen({
  copy,
  language,
  resultPackage,
  onRetake,
  onSubmitFinal
}) {
  const [submitPending, setSubmitPending] = useState(false);
  const [submitted, setSubmitted] = useState(
    () => Boolean(resultPackage.finalizedAt || resultPackage.reportRequest?.status === "requested")
  );
  const [contactRequested, setContactRequested] = useState(
    () => Boolean(resultPackage.reportRequest?.contactRequested)
  );
  const [resultPackageForSave, setResultPackageForSave] = useState(resultPackage);
  const { result } = resultPackageForSave;
  const stage = result.stage;
  const unknownCount = result.transparency?.unknownCount ?? 0;
  const unknownPillars = (result.transparency?.unknownByPillar ?? [])
    .filter((item) => item.unknown > 0)
    .sort((a, b) => b.unknown - a.unknown)
    .slice(0, 3)
    .map((item) => ({
      ...item,
      pillar: PILLARS.find((pillar) => pillar.id === item.id)
    }))
    .filter((item) => item.pillar);
  const detailCopy = getResultDetailCopy(language);
  const pillarBreakdowns = useMemo(
    () => buildPillarBreakdowns(result, language),
    [language, result]
  );
  const priorityBreakdowns = useMemo(
    () => getPriorityBreakdowns(pillarBreakdowns),
    [pillarBreakdowns]
  );
  const strongBreakdowns = useMemo(
    () => getStrongBreakdowns(pillarBreakdowns),
    [pillarBreakdowns]
  );
  const finalCopy = getFinalActionCopy(language);
  const [submitError, setSubmitError] = useState("");
  const submitInFlightRef = useRef(false);

  useEffect(() => {
    setResultPackageForSave(resultPackage);
  }, [resultPackage]);

  async function submitResult() {
    if (submitInFlightRef.current || submitted) return;

    setSubmitError("");
    setSubmitPending(true);
    submitInFlightRef.current = true;
    try {
      const submittedAt = new Date().toISOString();
      const advisorPillarNotes = buildPillarBreakdowns(
        resultPackageForSave.result,
        resultPackageForSave.language
      ).map((breakdown) => ({
        id: breakdown.id,
        label: breakdown.label,
        score: breakdown.score,
        rating: breakdown.band.label,
        priority: breakdown.score !== null && breakdown.score < 80,
        meaning: breakdown.whatItMeans,
        familyCanDo: breakdown.familyActions,
        whereFamiliesGetStuck: breakdown.executionRisk,
        gilbertCanHelp: breakdown.gilbertHelp
      }));
      await onSubmitFinal({
        ...resultPackageForSave,
        finalizedAt: submittedAt,
        reportRequest: {
          type: "summary",
          status: "requested",
          recipientEmail: resultPackageForSave.profile?.email || "",
          language: resultPackageForSave.language,
          contactRequested,
          detailedAnalysisRetained: true,
          advisorDetail: {
            visibility: "internal",
            note:
              "User-facing report should stay concise; use this retained detail for Gilbert/admin follow-up.",
            delivery: {
              destination: "Airtable Raw Result JSON",
              nextStep:
                "Use this internal detail to prepare Gilbert's follow-up notes or the requested summary report."
            },
            pillarNotes: advisorPillarNotes
          },
          requestedAt: submittedAt
        }
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(getSaveErrorMessage(error, finalCopy));
    } finally {
      submitInFlightRef.current = false;
      setSubmitPending(false);
    }
  }

  return (
    <section className="w-full px-5 py-8 sm:px-8 lg:px-16 xl:px-24">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-forest hover:bg-white"
          onClick={onRetake}
        >
          <ArrowLeft aria-hidden="true" size={18} />
          {copy.back}
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md border border-forest/15 bg-white px-4 text-sm font-semibold text-forest transition hover:border-copper"
          onClick={onRetake}
        >
          <RefreshCcw aria-hidden="true" size={18} />
          {copy.retake}
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.72fr)_minmax(560px,1.28fr)]">
        <section className="rounded-xl bg-forest p-6 text-white shadow-soft sm:p-8 lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper">
            {copy.overallScore}
          </p>
          <div className="mt-5 flex flex-col gap-8 sm:flex-row sm:items-center">
            <ScoreRing score={result.overall} />
            <div>
              <div className="font-display text-6xl font-semibold leading-none sm:text-8xl">
                {roundedScore(result.overall)}
                <span className="ml-2 text-2xl text-white/46 sm:text-3xl">/ 100</span>
              </div>
              <h1 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-5xl">
                {stage.level[language]} — {stage.labels[language]}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/76 sm:text-lg sm:leading-8">
                {stage.descriptions[language]}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-forest/12 bg-white p-5 shadow-line sm:p-6">
          <Suspense
            fallback={
              <div className="grid h-[420px] w-full place-items-center text-sm font-semibold text-muted sm:h-[650px]">
                {detailCopy.loadingChart}
              </div>
            }
          >
            <RadarPanel result={result} language={language} />
          </Suspense>
          <div className="mt-4 border-t border-forest/10 pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-copper">
              {detailCopy.priorityAreas}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {priorityBreakdowns.length > 0 ? (
                priorityBreakdowns.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-full bg-parchment px-3 py-1 text-sm font-semibold text-forest"
                  >
                    {item.shortLabel}: {item.score}
                  </span>
                ))
              ) : (
                <span className="text-sm leading-6 text-muted">{detailCopy.noPriority}</span>
              )}
            </div>
          </div>
        </section>
      </div>

      {unknownCount > 0 && (
        <section className="mt-6 rounded-xl border border-copper/24 bg-white p-6 shadow-line sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-copper">
                {copy.transparencyInsight.label}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl">
                {copy.transparencyInsight.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-ink/72">
                {copy.transparencyInsight.body}
              </p>
            </div>
            <div className="rounded-lg bg-parchment/70 p-4">
              <p className="text-sm font-semibold text-muted">
                {copy.transparencyInsight.countLabel}
              </p>
              <p className="mt-2 font-display text-5xl font-semibold leading-none text-forest">
                {unknownCount}
              </p>
              {unknownPillars.length > 0 && (
                <div className="mt-4 border-t border-forest/10 pt-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">
                    {copy.transparencyInsight.pillarLabel}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {unknownPillars.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 text-sm leading-5 text-ink/74"
                      >
                        <span>{item.pillar.shortLabels[language]}</span>
                        <span className="font-semibold text-forest">{item.unknown}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="mt-6 space-y-6">
        <section className="h-fit overflow-hidden rounded-xl border border-forest/12 bg-white shadow-line">
          <div className="border-b border-forest/10 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-copper">
              {copy.reflection}
            </p>
            <p className="mt-4 max-w-5xl text-lg leading-8 text-ink/74">
              {stage.reflections[language]}
            </p>
          </div>

          <div id="diagnostic-breakdown" className="border-t border-forest/10 p-6 sm:p-8">
            <div className="mb-7">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-copper">
                    {detailCopy.topicSummaryLabel}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-forest sm:text-4xl">
                    {detailCopy.topicSummaryTitle}
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-ink/64">
                  {detailCopy.topicSummaryIntro}
                </p>
              </div>
              <PillarSummaryGrid breakdowns={pillarBreakdowns} copy={copy} />
            </div>
          </div>
        </section>

        <ResultGuideCard detailCopy={detailCopy} />

        <section className="rounded-xl border border-forest/12 bg-white p-5 shadow-line sm:p-6">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display text-2xl font-semibold leading-tight text-forest">
              {finalCopy.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">{finalCopy.body}</p>

            <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-ink/74">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 rounded border-forest/30 text-forest focus:ring-forest"
                checked={contactRequested}
                onChange={(event) => setContactRequested(event.target.checked)}
                disabled={submitPending || submitted}
              />
              <span>{finalCopy.contactCheckboxLabel}</span>
            </label>

            <button
              type="button"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-md bg-copper px-4 text-left text-sm font-semibold text-white transition hover:bg-[#AA5E2E] disabled:cursor-not-allowed disabled:bg-copper/60"
              onClick={submitResult}
              disabled={submitPending || submitted}
            >
              {submitted ? finalCopy.saved : submitPending ? finalCopy.saving : finalCopy.continue}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
            {submitted && (
              <p className="mt-3 rounded-md border border-copper/20 bg-copper/10 px-3 py-2 text-sm leading-6 text-forest">
                {finalCopy.successNote}
              </p>
            )}
            {submitError && (
              <p className="mt-3 rounded-md border border-copper/25 bg-copper/10 px-3 py-2 text-sm leading-5 text-forest">
                {submitError}
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function PillarSummaryGrid({ breakdowns, copy }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      {breakdowns.map((breakdown) => {
        const scoreWidth = breakdown.score === null ? 100 : Math.max(0, Math.min(100, breakdown.score));

        return (
          <article
            key={breakdown.id}
            className="rounded-lg border border-forest/10 bg-parchment/32 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-bold leading-tight text-forest">
                  {breakdown.label}
                </h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-copper">
                  {breakdown.band.label}
                </p>
              </div>
              <span className="shrink-0 text-lg font-bold text-forest">
                {breakdown.score === null ? copy.noScore : `${breakdown.score}/100`}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-forest/8">
              <div
                className={`h-full rounded-full ${
                  breakdown.score === null ? "bg-forest/20" : pillarBarColor(breakdown.score)
                }`}
                style={{ width: `${scoreWidth}%` }}
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/68">
              {breakdown.band.summary}
            </p>
          </article>
        );
      })}
    </div>
  );
}

function ResultGuideCard({ detailCopy }) {
  return (
    <section className="rounded-xl border border-forest/12 bg-white p-5 shadow-line sm:p-6">
      <h2 className="font-display text-2xl font-semibold leading-tight text-forest">
        {detailCopy.howToReadTitle}
      </h2>
      <ul className="mt-4 space-y-3">
        {detailCopy.howToReadItems.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-ink/72">
            <Check className="mt-1 shrink-0 text-copper" aria-hidden="true" size={16} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CompareInvitePage({ copy, language, groupId, inviterName, onNavigateHome }) {
  const comparisonCopy = copy.comparison;
  const pageCopy = getCompareInviteCopy(language);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedEmail, setInvitedEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [invitePending, setInvitePending] = useState(false);
  const [groupStatus, setGroupStatus] = useState("checking");

  useEffect(() => {
    let active = true;
    const storedGroup = loadGroups()[groupId];

    if ((storedGroup?.participants?.length ?? 0) >= MAX_GROUP_PARTICIPANTS) {
      setGroupStatus("full");
      return () => {
        active = false;
      };
    }

    setGroupStatus("checking");
    fetch(`/api/group-status?group=${encodeURIComponent(groupId)}`)
      .then((response) => response.json().catch(() => ({})))
      .then((data) => {
        if (!active) return;
        const participantCount = data?.participantCount ?? storedGroup?.participants?.length ?? 0;
        setGroupStatus(participantCount >= MAX_GROUP_PARTICIPANTS ? "full" : "open");
      })
      .catch(() => {
        if (active) setGroupStatus("open");
      });

    return () => {
      active = false;
    };
  }, [groupId]);

  async function createInvite() {
    const nextInviteEmail = inviteEmail.trim();
    if (!nextInviteEmail) {
      setInviteError(comparisonCopy.inviteEmailRequired);
      return;
    }

    setInvitePending(true);
    setInviteError("");
    try {
      const inviteLink = getInviteUrl(groupId, language);
      await sendInvitationEmail({
        invitedEmail: nextInviteEmail,
        inviteLink,
        groupId,
        language,
        inviterName
      });
      setInvitedEmail(nextInviteEmail);
      setInviteEmail("");
    } catch (error) {
      setInviteError(comparisonCopy.inviteSendError);
    } finally {
      setInvitePending(false);
    }
  }

  return (
    <section className="w-full px-5 py-10 sm:px-8 lg:px-16 xl:px-24">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper">{pageCopy.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-forest sm:text-5xl">
          {pageCopy.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink/72">{pageCopy.intro}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {pageCopy.steps.map((step, index) => (
            <div key={step.title} className="rounded-xl border border-forest/12 bg-white p-5 shadow-line">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-forest font-display text-base font-semibold text-white">
                {index + 1}
              </div>
              <h3 className="mt-4 text-base font-bold leading-tight text-forest">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/68">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-forest/12 bg-white p-6 shadow-line sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">{pageCopy.diagramTitle}</p>
          <div className="mt-4 space-y-5">
            <div>
              <div className="flex items-center justify-between text-sm font-semibold text-forest">
                <span>{pageCopy.convergenceLabel}</span>
                <span className="text-xs font-normal text-ink/56">{pageCopy.convergenceExampleLabel}</span>
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="h-2.5 w-[78%] rounded-full bg-forest" />
                <div className="h-2.5 w-[82%] rounded-full bg-forest/50" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm font-semibold text-forest">
                <span>{pageCopy.divergenceLabel}</span>
                <span className="text-xs font-normal text-ink/56">{pageCopy.divergenceExampleLabel}</span>
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="h-2.5 w-[85%] rounded-full bg-copper" />
                <div className="h-2.5 w-[30%] rounded-full bg-copper/45" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-forest/12 bg-white p-6 shadow-line sm:p-7">
          <h2 className="font-display text-2xl font-semibold leading-tight text-forest">
            {groupStatus === "full" ? pageCopy.fullTitle : pageCopy.formTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            {groupStatus === "full" ? pageCopy.fullBody : pageCopy.formBody}
          </p>
          <div className="mt-4 flex gap-3 rounded-lg border border-forest/10 bg-parchment/55 p-3 text-sm leading-6 text-ink/70">
            <ShieldCheck className="mt-0.5 shrink-0 text-copper" aria-hidden="true" size={18} />
            <p>{comparisonCopy.invitePrivacyNote}</p>
          </div>

          {groupStatus === "checking" ? (
            <div className="mt-5 rounded-lg border border-forest/12 bg-parchment/45 p-4">
              <p className="text-sm font-semibold text-forest">{pageCopy.checkingGroup}</p>
            </div>
          ) : groupStatus === "full" ? (
            <div className="mt-5 rounded-lg border border-forest/12 bg-parchment/45 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-copper">
                {pageCopy.fullTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/70">{comparisonCopy.inviteLimit}</p>
              <button
                type="button"
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-forest px-4 text-sm font-semibold text-white transition hover:bg-forest-2"
                onClick={onNavigateHome}
              >
                <ArrowLeft aria-hidden="true" size={16} />
                {pageCopy.backHome}
              </button>
            </div>
          ) : invitedEmail ? (
            <div className="mt-5 rounded-lg border border-forest/12 bg-parchment/45 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-copper">
                {comparisonCopy.inviteSent}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/70">
                {comparisonCopy.inviteSentBody.replace("{email}", invitedEmail)}
              </p>
            </div>
          ) : (
            <div className="mt-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-forest">
                  {comparisonCopy.inviteEmail}
                </span>
                <input
                  className="min-h-12 w-full rounded-md border border-forest/15 bg-white px-3 text-sm text-ink outline-none transition focus:border-copper"
                  value={inviteEmail}
                  onChange={(event) => {
                    setInviteEmail(event.target.value);
                    setInviteError("");
                  }}
                  placeholder={comparisonCopy.inviteEmailPlaceholder}
                  type="email"
                  autoComplete="email"
                />
              </label>
              {inviteError && (
                <p className="mt-3 text-sm font-semibold text-copper" role="alert">
                  {inviteError}
                </p>
              )}
              <button
                type="button"
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-forest px-4 text-sm font-semibold text-white transition hover:bg-forest-2 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={createInvite}
                disabled={invitePending}
              >
                <Send aria-hidden="true" size={17} />
                {invitePending ? comparisonCopy.sendingInvite : comparisonCopy.generateInvite}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-copper"
          onClick={onNavigateHome}
        >
          <ArrowLeft aria-hidden="true" size={16} />
          {pageCopy.backHome}
        </button>
      </div>
    </section>
  );
}

function ComparisonScreen({ copy, language, group, onBackToResult }) {
  const comparisonCopy = copy.comparison;
  const visualCopy = getComparisonVisualCopy(language);
  const participants = (group.participants ?? []).slice(0, MAX_GROUP_PARTICIPANTS);
  const canCompare = participants.length >= MIN_COMPARISON_PARTICIPANTS;
  const rows = buildComparisonRows(participants, language);
  const convergence = rows.filter((row) => row.numericCount >= 2 && row.gap <= 10);
  const transparency = rows.filter((row) => row.hasTransparencyGap);
  const stats = buildComparisonStats(rows, participants);

  return (
    <section className="w-full px-5 py-8 sm:px-8 lg:px-16 xl:px-24">
      <header className="mb-6">
        <div>
          <button
            type="button"
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-forest hover:bg-white"
            onClick={onBackToResult}
          >
            <ArrowLeft aria-hidden="true" size={18} />
            {comparisonCopy.backToResult}
          </button>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-copper">
            {comparisonCopy.pageLabel}
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight text-forest sm:text-5xl">
            {comparisonCopy.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-ink/70">
            {comparisonCopy.intro}
          </p>
        </div>
      </header>

      {!canCompare ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <div className="rounded-xl border border-forest/12 bg-white p-6 shadow-line sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-copper">
              {comparisonCopy.participants}: {participants.length} / {MAX_GROUP_PARTICIPANTS}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-forest">
              {comparisonCopy.waitingTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-ink/70">
              {comparisonCopy.waitingBody}
            </p>
            <button
              type="button"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-forest px-4 text-sm font-semibold text-white transition hover:bg-forest-2"
              onClick={onBackToResult}
            >
              <ArrowLeft aria-hidden="true" size={17} />
              {comparisonCopy.backToResult}
            </button>
          </div>
          <QuickReadRail
            stats={stats}
            rows={rows}
            visualCopy={visualCopy}
          />
        </section>
      ) : (
        <>
      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div
            className={`grid items-stretch gap-4 ${
              participants.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2"
            }`}
          >
            {participants.map((participant, index) => (
              <ParticipantScoreCard
                key={participant.id}
                participant={participant}
                participantIndex={index}
                language={language}
                comparisonCopy={comparisonCopy}
                visualCopy={visualCopy}
                compact={participants.length >= 3}
              />
            ))}
          </div>
          <LargestGapSpotlight
            row={stats.biggestGap}
            language={language}
            copy={copy}
            visualCopy={visualCopy}
            comparisonCopy={comparisonCopy}
          />
        </div>
        <QuickReadRail
          stats={stats}
          rows={rows}
          visualCopy={visualCopy}
        />
      </section>

      <div className="mt-5 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-xl border border-forest/12 bg-white p-4 shadow-line sm:p-5">
          <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-end 2xl:justify-between">
            <div className="shrink-0 2xl:min-w-[190px]">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">
                {visualCopy.mapLabel}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-forest">
                {comparisonCopy.pillarComparison}
              </h2>
            </div>
            <div className="flex min-w-0 flex-wrap gap-3 text-xs font-semibold text-muted">
              {participants.map((participant, index) => {
                const color = COMPARISON_COLORS[index % COMPARISON_COLORS.length];
                return (
                  <span key={participant.id} className="inline-flex items-center gap-2">
                    <span
                      className="inline-flex h-5 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: color.line }}
                    >
                      P{index + 1}
                    </span>
                    {getParticipantRoleLabel(participant, language, index)}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {rows.map((row) => (
              <ComparisonMapRow
                key={row.id}
                row={row}
                language={language}
                copy={copy}
                visualCopy={visualCopy}
                comparisonCopy={comparisonCopy}
              />
            ))}
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
          <ComparisonInsightCard
            title={comparisonCopy.convergenceTitle}
            body={comparisonCopy.convergenceBody}
            empty={comparisonCopy.noConvergence}
            items={convergence}
            language={language}
            comparisonCopy={comparisonCopy}
          />
          <ComparisonInsightCard
            title={comparisonCopy.transparencyTitle}
            body={comparisonCopy.transparencyBody}
            empty={comparisonCopy.noTransparency}
            items={transparency}
            language={language}
            comparisonCopy={comparisonCopy}
          />
        </aside>
      </div>
      </>
      )}

    </section>
  );
}

function LargestGapSpotlight({ row, language, copy, visualCopy, comparisonCopy }) {
  if (!row) return null;

  const spotlightScores = row.scores.filter((score) => score?.participant);

  return (
    <section className="rounded-xl border border-copper/20 bg-white p-5 shadow-line">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">
            {visualCopy.largestGapLabel}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-forest">
            {visualCopy.largestGapTitle(row.shortLabel, row.gap)}
          </h2>
        </div>
        <span className="w-fit rounded-full bg-[#A64B3C]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-[#76362D]">
          {comparisonCopy.scoreGap}: {row.gap}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {spotlightScores.map((score, index) => {
          const color = COMPARISON_COLORS[index % COMPARISON_COLORS.length];
          const width = Math.max(0, Math.min(100, score.score ?? 0));

          return (
            <div key={`${row.id}-spotlight-${score.participant.id}`}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-semibold text-forest">
                  {getParticipantRoleLabel(score.participant, language, index)}
                </span>
                <span className="shrink-0 font-bold text-forest">
                  {score.score === null ? copy.noScore : `${score.score} / 100`}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-forest/8">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${width}%`, backgroundColor: color.line }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm leading-6 text-ink/68">{visualCopy.largestGapBody(row.shortLabel)}</p>
    </section>
  );
}

function ComparisonMetricCard({ icon: Icon, label, value, suffix, featured = false }) {
  return (
    <div className={`rounded-md bg-white/8 ${featured ? "p-4" : "p-3.5"}`}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.11em] text-white/62">{label}</p>
        {Icon && <Icon aria-hidden="true" size={16} className="text-copper" />}
      </div>
      <p className={`font-display font-semibold leading-none ${featured ? "text-3xl" : "text-2xl"}`}>
        {value}
        <span className="ml-1 text-sm font-bold text-white/58">{suffix}</span>
      </p>
    </div>
  );
}

function QuickReadRail({ stats, rows, visualCopy }) {
  return (
    <aside className="rounded-xl bg-forest p-4 text-white shadow-soft lg:p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">
        {visualCopy.snapshotLabel}
      </p>
      <h2 className="mt-2.5 font-display text-xl font-semibold leading-tight">
        {stats.biggestGap
          ? visualCopy.snapshotTitle(stats.biggestGap.shortLabel, stats.biggestGap.gap)
          : visualCopy.snapshotFallback}
      </h2>
      <p className="mt-2.5 text-sm leading-6 text-white/70">{visualCopy.snapshotBody}</p>
      <div className="mt-4 grid gap-2.5">
        <ComparisonMetricCard
          icon={Scale}
          label={visualCopy.averageGap}
          value={stats.averageGap}
          suffix={visualCopy.points}
          featured
        />
        <ComparisonMetricCard
          icon={Compass}
          label={visualCopy.alignedAreas}
          value={stats.alignedCount}
          suffix={visualCopy.ofTotal(rows.length)}
        />
        <ComparisonMetricCard
          icon={Search}
          label={visualCopy.priorityArea}
          value={stats.biggestGap?.shortLabel ?? "-"}
          suffix={stats.biggestGap ? ` · ${stats.biggestGap.gap} ${visualCopy.points}` : ""}
        />
      </div>
    </aside>
  );
}

function ParticipantScoreCard({
  participant,
  participantIndex,
  language,
  comparisonCopy,
  visualCopy,
  compact = false
}) {
  const color = COMPARISON_COLORS[participantIndex % COMPARISON_COLORS.length];
  const score = roundedScore(participant.result.overall);
  const roleParts = getParticipantRoleParts(participant, language, participantIndex);

  return (
    <article className="h-full overflow-hidden rounded-xl border border-forest/12 bg-white shadow-line">
      <div className="h-1.5" style={{ backgroundColor: color.line }} />
      <div
        className={`grid h-full gap-4 p-5 ${
          compact ? "sm:grid-rows-[1fr_auto]" : "sm:grid-cols-[minmax(0,1fr)_132px] sm:items-center"
        }`}
      >
        <div>
          <div className="flex items-start gap-3">
            <span
              className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: color.line }}
            />
            <div>
              <p
                className={`font-display font-semibold leading-tight text-forest ${
                  compact ? "text-xl" : "text-2xl"
                }`}
              >
                {roleParts.primary}
              </p>
              {roleParts.secondary && (
                <p className="mt-1 text-sm font-semibold leading-5 text-muted">
                  {roleParts.secondary}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className={`flex flex-col pl-6 sm:pl-0 ${compact ? "" : "sm:items-end"}`}>
          <p className="mb-1 whitespace-nowrap text-sm font-semibold text-muted">
            {visualCopy.overallScore}
          </p>
          <div
            className={`flex items-baseline justify-start gap-1 ${
              compact ? "w-full" : "w-[132px] sm:justify-end"
            }`}
          >
            <span className="font-display text-5xl font-semibold leading-none text-forest">
              {score}
            </span>
            <span className="pb-1 text-sm font-bold text-muted">/100</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function ComparisonMapRow({ row, language, copy, visualCopy, comparisonCopy }) {
  const band = getComparisonGapBand(row.gap, visualCopy);
  const unknownTotal = row.scores.reduce((total, score) => total + score.unknown, 0);

  return (
    <article className="rounded-lg border border-forest/10 bg-parchment/30 p-4">
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_112px] lg:items-center">
        <div>
          <h3 className="text-base font-bold leading-tight text-forest">{row.label}</h3>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-muted">
            {comparisonCopy.scoreGap}: {row.gap}
          </p>
          {unknownTotal > 0 && (
            <p className="mt-2 text-xs font-semibold text-copper">
              {comparisonCopy.unknownResponses}: {unknownTotal}
            </p>
          )}
        </div>
        <div className="space-y-2.5">
          {row.scores.map((score, index) => {
            const color = COMPARISON_COLORS[index % COMPARISON_COLORS.length];
            const width = Math.max(0, Math.min(100, score.score ?? 0));

            return (
              <div
                key={`${row.id}-${score.participant.id}`}
                className="grid grid-cols-[34px_minmax(0,1fr)_48px] items-center gap-3"
                title={`${getParticipantRoleLabel(score.participant, language, index)}: ${
                  score.score === null ? copy.noScore : score.score
                }`}
              >
                <span
                  className="inline-flex h-6 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: color.line }}
                >
                  P{index + 1}
                </span>
                <div className="h-2.5 overflow-hidden rounded-full bg-forest/8">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: score.score === null ? "100%" : `${width}%`,
                      backgroundColor:
                        score.score === null ? "rgba(28, 61, 46, 0.18)" : color.line
                    }}
                  />
                </div>
                <span className="text-right text-sm font-bold text-forest">
                  {score.score === null ? copy.noScore : score.score}
                </span>
              </div>
            );
          })}
          <div className="grid grid-cols-[34px_minmax(0,1fr)_48px] items-center gap-3 text-[11px] font-semibold text-muted">
            <span />
            <div className="flex justify-between">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
            <span />
          </div>
        </div>
        <div
          className={`rounded-lg border px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.1em] ${band.className}`}
        >
          {band.label}
        </div>
      </div>
    </article>
  );
}

function ComparisonInsightCard({
  title,
  body,
  empty,
  items,
  language,
  comparisonCopy,
  accent = false
}) {
  return (
    <section
      className={`rounded-xl border p-5 shadow-line ${
        accent ? "border-copper/24 bg-white" : "border-forest/12 bg-white"
      }`}
    >
      <h2 className="font-display text-2xl font-semibold leading-tight text-forest">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/68">{body}</p>
      <div className="mt-4 space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-parchment/70 px-3 py-2 text-sm"
            >
              <span className="font-semibold text-forest">{item.shortLabel}</span>
              <span className="font-bold text-copper">
                {comparisonCopy.scoreGap}: {item.gap}
              </span>
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-parchment/70 px-3 py-2 text-sm leading-6 text-muted">
            {empty}
          </p>
        )}
      </div>
    </section>
  );
}

function getComparisonVisualCopy(language) {
  if (language === "es") {
    return {
      snapshotLabel: "Lectura rápida",
      snapshotTitle: (pillar, gap) => `${pillar} muestra la mayor diferencia: ${gap} puntos`,
      snapshotFallback: "Las perspectivas ya están listas para compararse",
      snapshotBody:
        "La vista muestra dónde la familia ve lo mismo, dónde hay distancia y qué conversación conviene priorizar.",
      largestGapLabel: "Mayor diferencia",
      largestGapTitle: (pillar, gap) => `${pillar}: diferencia de ${gap} puntos`,
      largestGapBody: (pillar) =>
        `${pillar} debería ser la primera conversación porque muestra la distancia más visible entre perspectivas.`,
      overallScore: "Puntaje general",
      averageGap: "Brecha promedio",
      alignedAreas: "Áreas alineadas",
      discussionAreas: "Para conversar",
      priorityArea: "Área prioritaria",
      ofTotal: (total) => `de ${total}`,
      points: "pts",
      mapLabel: "Mapa de brechas",
      aligned: "Alineado",
      watch: "Revisar",
      discuss: "Conversar",
      scrollHint: "Desplazar dentro del recuadro"
    };
  }

  return {
    snapshotLabel: "Quick read",
    snapshotTitle: (pillar, gap) => `${pillar} has the widest difference: ${gap} points`,
    snapshotFallback: "The perspectives are ready to compare",
    snapshotBody:
      "This view shows where the family sees the same picture, where distance appears, and which conversation should come first.",
    largestGapLabel: "Largest gap",
    largestGapTitle: (pillar, gap) => `${pillar}: ${gap}-point gap`,
    largestGapBody: (pillar) =>
      `${pillar} should be the first conversation because it shows the clearest distance between perspectives.`,
    overallScore: "Overall score",
    averageGap: "Average gap",
    alignedAreas: "Aligned areas",
    discussionAreas: "Discuss first",
    priorityArea: "Priority area",
    ofTotal: (total) => `of ${total}`,
    points: "pts",
    mapLabel: "Gap map",
    aligned: "Aligned",
    watch: "Watch",
    discuss: "Discuss",
    scrollHint: "Scroll inside this tile"
  };
}

function buildComparisonStats(rows) {
  const comparableRows = rows.filter((row) => row.numericCount >= 2);
  const totalGap = comparableRows.reduce((sum, row) => sum + row.gap, 0);
  const biggestGap = comparableRows.reduce(
    (current, row) => (!current || row.gap > current.gap ? row : current),
    null
  );

  return {
    averageGap: comparableRows.length ? Math.round(totalGap / comparableRows.length) : 0,
    alignedCount: comparableRows.filter((row) => row.gap <= 10).length,
    discussionCount: comparableRows.filter((row) => row.gap > 20).length,
    biggestGap
  };
}

function getComparisonGapBand(gap, visualCopy) {
  if (gap <= 10) {
    return {
      label: visualCopy.aligned,
      className: "border-forest/15 bg-forest/8 text-forest"
    };
  }

  if (gap <= 20) {
    return {
      label: visualCopy.watch,
      className: "border-copper/20 bg-copper/10 text-[#8A4F2F]"
    };
  }

  return {
    label: visualCopy.discuss,
    className: "border-[#A64B3C]/25 bg-[#A64B3C]/10 text-[#76362D]"
  };
}

function buildComparisonRows(participants, language) {
  return PILLARS.map((pillar) => {
    const scores = participants.map((participant) => {
      const item = participant.result.pillarScores.find((score) => score.id === pillar.id);
      const hasScore = item?.score !== null && Number.isFinite(Number(item?.score));
      return {
        participant,
        score: hasScore ? roundedScore(item.score) : null,
        unknown: item?.unknown ?? 0
      };
    });
    const numericScores = scores
      .map((item) => item.score)
      .filter((score) => Number.isFinite(score));
    const gap =
      numericScores.length >= 2 ? Math.max(...numericScores) - Math.min(...numericScores) : 0;
    const hasTransparencyGap =
      scores.some((item) => item.unknown > 0) &&
      scores.some((item) => Number.isFinite(item.score) && item.score >= 65);

    return {
      id: pillar.id,
      label: pillar.labels[language],
      shortLabel: pillar.shortLabels[language],
      scores,
      numericCount: numericScores.length,
      gap,
      hasTransparencyGap
    };
  });
}

function getResultDetailCopy(language) {
  return RESULT_DETAIL_COPY[language] ?? RESULT_DETAIL_COPY.en;
}

function getHomeFinalCtaCopy(language) {
  if (language === "es") {
    return {
      title: "Empieza una conversación con Gilbert",
      body:
        "Si la familia ya sabe que necesita claridad, el siguiente paso no tiene que ser más contenido. Puede ser una conversación directa sobre lo que está pasando y cómo empezar con cuidado.",
      note:
        "La autoevaluación sigue disponible como punto de partida si la familia quiere ordenar primero sus ideas.",
      primary: "Trabajemos juntos",
      secondary: "Tomar la autoevaluación"
    };
  }

  return {
    title: "Start a conversation with Gilbert",
    body:
      "If the family already knows it needs more clarity, the next step does not have to be more content. It can be a direct conversation about what is happening and how to begin carefully.",
    note:
      "The self-assessment remains available as a starting point when the family wants to organize its thinking first.",
    primary: "Let's work together",
    secondary: "Take the self-assessment"
  };
}

function getHomeAssessmentCopy(language) {
  if (language === "es") {
    return {
      label: "Autoevaluación",
      privacyTitle: "Privado y confidencial",
      privacyBody:
        "La información sensible se maneja con cuidado. La autoevaluación ayuda a preparar una conversación, no a exponer respuestas individuales en público."
    };
  }

  return {
    label: "Self-assessment",
    privacyTitle: "Private and confidential",
    privacyBody:
      "Sensitive information is handled carefully. The self-assessment prepares a conversation, not a public review of individual answers."
  };
}

function getHomeAssessmentSteps(language) {
  if (language === "es") {
    return [
      "Guarda tu reporte individual",
      "Gilbert recibe el contexto necesario para dar seguimiento",
      "Elige si quieres que Gilbert te contacte"
    ];
  }

  return [
    "Save your individual report",
    "Gilbert receives the context needed for follow-up",
    "Choose whether you want him to contact you"
  ];
}

function getCompareInviteCopy(language) {
  if (language === "es") {
    return {
      eyebrow: "Comparar resultados",
      title: "Por qué comparar resultados genera valor",
      intro:
        "Una sola perspectiva muestra dónde está una persona. Comparar perspectivas muestra dónde la familia realmente coincide y dónde no.",
      steps: [
        {
          title: "Ya completaste tu autoevaluación",
          body: "Tus resultados están guardados y listos para comparar."
        },
        {
          title: "Invita a un familiar o colega",
          body: "Esa persona completa la misma autoevaluación de forma privada, a su propio ritmo."
        },
        {
          title: "Descubre en qué coinciden y en qué difieren",
          body: "Una vista de comparación simple muestra acuerdos y brechas por tema, no pregunta por pregunta."
        }
      ],
      diagramTitle: "Qué revela la comparación",
      convergenceLabel: "Dónde coinciden",
      convergenceExampleLabel: "Ej.: Claridad de propiedad",
      divergenceLabel: "Dónde difieren las perspectivas",
      divergenceExampleLabel: "Ej.: Preparación para la sucesión",
      formTitle: "Invita a alguien ahora",
      formBody:
        "Ingresa su email y le enviaremos una invitación privada para completar la autoevaluación.",
      checkingGroup: "Revisando el estado del grupo...",
      fullTitle: "Este grupo ya está completo",
      fullBody:
        "Este grupo de comparación ya tiene 3 perspectivas completas, así que no se puede enviar otra invitación desde esta liga.",
      backHome: "Volver al sitio"
    };
  }

  return {
    eyebrow: "Compare results",
    title: "Why comparing results creates value",
    intro:
      "A single perspective shows where one person stands. Comparing perspectives shows where the family actually agrees, and where it does not.",
    steps: [
      {
        title: "You already completed your self-assessment",
        body: "Your results are saved and ready to compare."
      },
      {
        title: "Invite a family member or colleague",
        body: "They complete the same self-assessment privately, at their own pace."
      },
      {
        title: "See where perspectives align, and where they differ",
        body: "A simple comparison view shows agreement and gaps by topic, not question by question."
      }
    ],
    diagramTitle: "What the comparison reveals",
    convergenceLabel: "Where you agree",
    convergenceExampleLabel: "e.g. Ownership clarity",
    divergenceLabel: "Where perspectives differ",
    divergenceExampleLabel: "e.g. Succession readiness",
    formTitle: "Invite someone now",
    formBody: "Enter their email and we will send a private invitation to complete the self-assessment.",
    checkingGroup: "Checking group status...",
    fullTitle: "This group is already complete",
    fullBody:
      "This comparison group already has 3 completed perspectives, so another invitation cannot be sent from this link.",
    backHome: "Back to the site"
  };
}

function getFinalActionCopy(language) {
  if (language === "es") {
    return {
      title: "Guarda tus resultados",
      body:
        "Guardaremos tus resultados y te enviaremos tu reporte por email de inmediato.",
      continue: "Guardar y enviarme mi reporte",
      saving: "Guardando...",
      saved: "Reporte guardado y enviado",
      successNote:
        "Tu reporte debería llegar a tu email en unos minutos. Si no lo recibes, no dudes en escribirnos para dar seguimiento.",
      contactCheckboxLabel:
        "Me gustaría que Gilbert me contacte para conversar sobre estos resultados.",
      error: "No se pudo guardar la autoevaluación. Revisa la configuración de Airtable en Vercel e inténtalo de nuevo.",
      apiErrors: {
        "Unable to save assessment result":
          "No se pudo guardar la autoevaluación. Revisa la configuración de Airtable en Vercel e inténtalo de nuevo."
      },
      validationErrors: {
        "Respondent email is required": "El email del participante es obligatorio.",
        "Respondent name is required": "El nombre del participante es obligatorio.",
        "Assessment answers are required": "Las respuestas de la autoevaluación son obligatorias.",
        "Assessment answers contain unknown question IDs":
          "Hubo un problema con tus respuestas. Por favor reinicia la autoevaluación sin cambiar de idioma a la mitad.",
        "Assessment answers contain invalid score values":
          "Hubo un problema con tus respuestas. Por favor reinicia la autoevaluación e inténtalo de nuevo.",
        "Assessment result score is required": "El puntaje de la autoevaluación es obligatorio.",
        "Assessment pillar scores are required": "Los puntajes por pilar son obligatorios."
      },
      close: "Cerrar"
    };
  }

  return {
    title: "Save your results",
    body: "We'll save your results and email you your report right away.",
    continue: "Save and email me my report",
    saving: "Saving...",
    saved: "Report saved and sent",
    successNote:
      "Your report should arrive in your email within a few minutes. If you do not receive it, please do not hesitate to email us so we can follow up.",
    contactCheckboxLabel: "I would like Gilbert to contact me to discuss these results.",
    error: "We could not save the assessment. Check the Airtable settings in Vercel and try again.",
    apiErrors: {
      "Unable to save assessment result":
        "We could not save the assessment. Check the Airtable settings in Vercel and try again."
    },
    validationErrors: {
      "Respondent email is required": "Respondent email is required.",
      "Respondent name is required": "Respondent name is required.",
      "Assessment answers are required": "Assessment answers are required.",
      "Assessment answers contain unknown question IDs":
        "There was a problem with your answers. Please restart the self-assessment without switching languages partway through.",
      "Assessment answers contain invalid score values":
        "There was a problem with your answers. Please restart the self-assessment and try again.",
      "Assessment result score is required": "Assessment result score is required.",
      "Assessment pillar scores are required": "Assessment pillar scores are required."
    },
    close: "Close"
  };
}

function getSaveErrorMessage(error, finalCopy) {
  const message = error instanceof Error ? error.message : "";
  if (!message) return finalCopy.error;
  return finalCopy.validationErrors?.[message] ?? finalCopy.apiErrors?.[message] ?? message;
}

function getPillarBand(item, language) {
  const detailCopy = getResultDetailCopy(language);
  const hasScore = item?.score !== null && Number.isFinite(Number(item?.score));
  if (!item || item.scored === 0 || item.lowConfidence || !hasScore) {
    return { id: "noScore", ...detailCopy.scoreBands.noScore };
  }

  const score = roundedScore(item.score);
  if (score < 40) return { id: "priority", ...detailCopy.scoreBands.priority };
  if (score < 65) return { id: "focus", ...detailCopy.scoreBands.focus };
  if (score < 80) return { id: "established", ...detailCopy.scoreBands.established };
  return { id: "strength", ...detailCopy.scoreBands.strength };
}

function getPillarProblem(pillar, item, band, language) {
  const description = pillar.descriptions[language];
  if (band.id === "noScore") {
    return language === "es"
      ? `No hubo suficiente información con puntaje para interpretar este pilar. Antes de definir una solución, la familia necesita aclarar quién tiene la información y cómo se comparte. ${description}`
      : `There was not enough scored information to interpret this pillar. Before defining a solution, the family needs to clarify who has the information and how it is shared. ${description}`;
  }
  if (band.id === "priority") {
    return language === "es"
      ? `El puntaje sugiere que este pilar puede depender demasiado de acuerdos informales. ${description} Cuando la complejidad aumenta, esa informalidad puede retrasar decisiones o crear interpretaciones distintas.`
      : `The score suggests this pillar may depend too much on informal agreements. ${description} When complexity increases, that informality can delay decisions or create competing interpretations.`;
  }
  if (band.id === "focus") {
    return language === "es"
      ? `El pilar parece existir parcialmente, pero todavía puede ser irregular o poco visible para algunos miembros. ${description} El trabajo principal es convertir prácticas aisladas en una forma común de operar.`
      : `This pillar appears to exist in part, but it may still be uneven or not visible to some members. ${description} The main work is to turn isolated practices into a shared way of operating.`;
  }
  if (band.id === "established") {
    return language === "es"
      ? `Hay una base útil en este pilar. ${description} El riesgo ya no es la ausencia de estructura, sino si esa estructura funciona cuando hay decisiones más sensibles o mayor presión.`
      : `There is a useful foundation in this pillar. ${description} The risk is no longer the absence of structure, but whether the structure performs when decisions become more sensitive or pressure increases.`;
  }
  return language === "es"
    ? `Este pilar aparece como fortaleza relativa. ${description} El reto es mantenerlo vivo, revisarlo periódicamente y asegurar que siga siendo relevante para nuevas generaciones y nuevos escenarios.`
    : `This pillar appears to be a relative strength. ${description} The challenge is to keep it alive, review it periodically, and make sure it remains relevant for new generations and new scenarios.`;
}

function buildPillarBreakdowns(result, language) {
  const guidance = PILLAR_GUIDANCE[language] ?? PILLAR_GUIDANCE.en;
  return PILLARS.map((pillar) => {
    const item = result.pillarScores.find((score) => score.id === pillar.id);
    const band = getPillarBand(item, language);
    const hasScore = item?.score !== null && Number.isFinite(Number(item?.score));
    const score = hasScore ? roundedScore(item.score) : null;
    const pillarGuidance = guidance[pillar.id] ?? PILLAR_GUIDANCE.en[pillar.id];

    return {
      id: pillar.id,
      label: pillar.labels[language],
      shortLabel: pillar.shortLabels[language],
      description: pillar.descriptions[language],
      score,
      rawScore: hasScore ? item.score : null,
      unknown: item?.unknown ?? 0,
      total: item?.total ?? 0,
      band,
      whatItMeans: getPillarProblem(pillar, item, band, language),
      familyActions: pillarGuidance.familyActions,
      executionRisk: pillarGuidance.executionRisk,
      gilbertHelp: pillarGuidance.gilbertHelp
    };
  });
}

function getPriorityBreakdowns(breakdowns) {
  return [...breakdowns]
    .filter((item) => item.score !== null && item.score < 80)
    .sort((a, b) => a.rawScore - b.rawScore)
    .slice(0, 3);
}

function getStrongBreakdowns(breakdowns) {
  return [...breakdowns]
    .filter((item) => item.score !== null)
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, 2);
}

function pillarBandClasses(bandId) {
  if (bandId === "priority") return "border-[#A64B3C]/30 bg-[#A64B3C]/8 text-[#76362D]";
  if (bandId === "focus") return "border-copper/30 bg-copper/10 text-[#8A4F2F]";
  if (bandId === "strength") return "border-forest/20 bg-forest/8 text-forest";
  if (bandId === "noScore") return "border-forest/10 bg-forest/5 text-muted";
  return "border-forest/14 bg-parchment/70 text-forest";
}

function getFooterContent(language) {
  if (language === "es") {
    return {
      trusted: "Acompañamiento confidencial para familias que navegan propiedad, sucesión y gobierno",
      credentialsLabel: "Credenciales y confianza",
      credentials: [
        "IMBA · University of Denver",
        "FFI Family Business & Wealth Advising Certificate",
        "Certified Professional Coach · iPEC",
        "Board Director Diploma · IMD"
      ],
      linkedin: "linkedin.com/in/gilbert-devlyn-advisory",
      linkedinUrl: "https://www.linkedin.com/in/gilbert-devlyn-advisory",
      socialLabel: "Canales sociales",
      emailLabel: "Email",
      trustLine: "Asesoría discreta y confidencial. Los materiales sensibles se comparten solo después de alineación."
    };
  }

  return {
    trusted: "Trusted by families navigating ownership, succession, and governance",
    credentialsLabel: "Credentials & trust",
    credentials: [
      "IMBA · University of Denver",
      "FFI Family Business & Wealth Advising Certificate",
      "Certified Professional Coach · iPEC",
      "Board Director Diploma · IMD"
    ],
    linkedin: "linkedin.com/in/gilbert-devlyn-advisory",
    linkedinUrl: "https://www.linkedin.com/in/gilbert-devlyn-advisory",
    socialLabel: "Social channels",
    emailLabel: "Email",
    trustLine:
      "Discreet, confidentiality-first advisory. Sensitive materials shared only after alignment."
  };
}

function pillarBarColor(score) {
  if (score < 40) return "bg-[#A64B3C]";
  if (score < 65) return "bg-copper";
  return "bg-forest";
}

function ScoreRing({ score }) {
  return (
    <div
      className="grid h-28 w-28 shrink-0 place-items-center rounded-full p-2 sm:h-36 sm:w-36"
      style={{
        background: `conic-gradient(#C4713A ${Math.max(0, Math.min(100, score)) * 3.6}deg, rgba(255,255,255,0.16) 0deg)`
      }}
      aria-label={`Score ${roundedScore(score)}`}
    >
      <div className="grid h-full w-full place-items-center rounded-full bg-forest">
        <span className="text-4xl font-semibold text-white sm:text-5xl">{roundedScore(score)}</span>
      </div>
    </div>
  );
}

async function persistResult(resultPackage) {
  const result = resultPackage.result ?? {};
  const response = await fetch("/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      createdAt: resultPackage.createdAt,
      mode: resultPackage.mode,
      language: resultPackage.language,
      profile: resultPackage.profile,
      answers: resultPackage.answers,
      result: resultPackage.result,
      groupId: resultPackage.groupId,
      participantId: resultPackage.participantId,
      inviteEmail: resultPackage.inviteEmail,
      inviteLink: resultPackage.inviteLink,
      groupParticipantCount: resultPackage.groupParticipantCount,
      finalizedAt: resultPackage.finalizedAt,
      reportRequest: resultPackage.reportRequest,
      overall: result.overall,
      stageId: result.stage?.id,
      pillarScores: result.pillarScores,
      transparency: result.transparency
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.persistence !== "airtable") {
    throw new Error(data.error || "Unable to save assessment result");
  }

  return data;
}

async function sendInvitationEmail(payload) {
  const response = await fetch("/api/invitations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.ok !== true) {
    throw new Error(data.error || "Unable to send invitation email");
  }

  return data.email;
}
