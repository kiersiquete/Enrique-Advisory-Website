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
  Copy,
  Handshake,
  Landmark,
  Link,
  Linkedin,
  Mail,
  Menu,
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
const PHONE_COUNTRY_LOOKUP = new Map(PHONE_COUNTRY_OPTIONS.map((option) => [option.id, option]));
const COMPARISON_COLORS = [
  { line: "#1C3D2E", soft: "rgba(28, 61, 46, 0.1)" },
  { line: "#C4713A", soft: "rgba(196, 113, 58, 0.12)" },
  { line: "#2E7C73", soft: "rgba(46, 124, 115, 0.12)" }
];

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
    breakdownTitle: "Detailed diagnostic breakdown",
    breakdownIntro:
      "Each pillar shows what the score suggests, what the family can do next, and where execution usually becomes difficult.",
    scrollHint: "Scroll inside this report tile",
    scoreLabel: "Score",
    whatItMeans: "What it means",
    familyActions: "What the family can do",
    executionRisk: "Where families often get stuck",
    gilbertRole: "Where Gilbert can help",
    implementationGapTitle: "The implementation gap",
    implementationGapBody:
      "After the diagnosis, most families can see the problem and even agree on the solution. The harder part is execution: who leads the work, how decisions are financed, how much time the family can commit, and how to keep momentum when sensitive conversations appear. Gilbert's role is to help convert insight into a sequence of conversations, agreements, and practical governance work.",
    priorityAreas: "Priority areas",
    loadingChart: "Loading chart...",
    strongestAreas: "Relative strengths",
    noPriority: "No urgent low-score pillar appeared. The next step is refinement and continuity.",
    pdfTitle: "Family Business Maturity Diagnostic Report",
    pdfSubtitle:
      "A practical interpretation of the assessment, including priority areas, next actions, and where Gilbert can help the family execute.",
    scoreInterpretation: "Score interpretation",
    stageReflection: "Stage reflection",
    transparencyTitle: "Transparency signal",
    unknownResponses: "Unknown responses",
    topAffectedPillars: "Most affected pillars",
    problemSolutionTitle: "Problem-solution-execution cycle",
    problemSolutionSteps: [
      "Problem: the diagnostic identifies where governance, information flow, or alignment may be weak.",
      "Solution: the family can define structures, agreements, calendars, roles, or decision rights.",
      "Execution challenge: implementation usually requires time, facilitation, budget, and agreement across generations or ownership branches.",
      "Gilbert's role: help the family prioritize, facilitate the right conversations, and translate decisions into a realistic governance roadmap."
    ],
    bookingCtaTitle: "Request a conversation with Gilbert",
    bookingCtaBody:
      "Use this report as the starting point for a focused family governance conversation. Share your result and contact details so Gilbert can follow up personally.",
    bookingCtaButton: "Request follow-up",
    reportNote:
      "This report comes from a self-assessment. It is not an audit, legal opinion, or valuation. It is designed to help the family decide what to discuss next.",
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
    breakdownTitle: "Desglose detallado del diagnóstico",
    breakdownIntro:
      "Cada pilar muestra qué sugiere el puntaje, qué puede hacer la familia y dónde suele complicarse la ejecución.",
    scrollHint: "Desplázate dentro de esta tarjeta",
    scoreLabel: "Puntaje",
    whatItMeans: "Qué significa",
    familyActions: "Qué puede hacer la familia",
    executionRisk: "Dónde suelen atorarse las familias",
    gilbertRole: "Dónde puede ayudar Gilbert",
    implementationGapTitle: "La brecha de ejecución",
    implementationGapBody:
      "Después del diagnóstico, muchas familias pueden ver el problema e incluso estar de acuerdo con la solución. Lo difícil es ejecutar: quién lidera el trabajo, cómo se financian las decisiones, cuánto tiempo puede dedicar la familia y cómo sostener el avance cuando aparecen conversaciones sensibles. El rol de Gilbert es ayudar a convertir el diagnóstico en una secuencia de conversaciones, acuerdos y trabajo práctico de gobierno.",
    priorityAreas: "Áreas prioritarias",
    loadingChart: "Cargando gráfica...",
    strongestAreas: "Fortalezas relativas",
    noPriority: "No apareció un pilar con urgencia baja. El siguiente paso es refinamiento y continuidad.",
    pdfTitle: "Reporte de Diagnóstico de Madurez para Empresas Familiares",
    pdfSubtitle:
      "Una interpretación práctica del diagnóstico, con prioridades, siguientes acciones y dónde Gilbert puede ayudar a la familia a ejecutar.",
    scoreInterpretation: "Interpretación del puntaje",
    stageReflection: "Reflexión de etapa",
    transparencyTitle: "Señal de transparencia",
    unknownResponses: "Respuestas sin información",
    topAffectedPillars: "Pilares más afectados",
    problemSolutionTitle: "Ciclo problema-solución-ejecución",
    problemSolutionSteps: [
      "Problema: el diagnóstico identifica dónde puede haber debilidad en gobierno, flujo de información o alineación.",
      "Solución: la familia puede definir estructuras, acuerdos, calendarios, roles o derechos de decisión.",
      "Reto de ejecución: implementar suele requerir tiempo, facilitación, presupuesto y acuerdo entre generaciones o ramas propietarias.",
      "Rol de Gilbert: ayudar a priorizar, facilitar las conversaciones correctas y traducir decisiones en una ruta de gobierno realista."
    ],
    bookingCtaTitle: "Solicita una conversación con Gilbert",
    bookingCtaBody:
      "Usa este reporte como punto de partida para una conversación enfocada de gobierno familiar. Comparte tu resultado y datos de contacto para que Gilbert te busque personalmente.",
    bookingCtaButton: "Solicitar seguimiento",
    reportNote:
      "Este reporte viene de una autoevaluación. No es una auditoría, opinión legal ni valuación. Está diseñado para ayudar a la familia a decidir qué conversar después.",
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
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
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

function upsertResultInGroup(groupId, resultPackage, inviteEmail = "") {
  const groups = loadGroups();
  const group = groups[groupId] ?? {
    id: groupId,
    maxParticipants: MAX_GROUP_PARTICIPANTS,
    createdAt: new Date().toISOString(),
    invitations: [],
    participants: []
  };
  const participantId = resultPackage.participantId ?? createParticipantId();
  const summary = createParticipantSummary(resultPackage, participantId);
  const existingIndex = group.participants.findIndex((participant) => participant.id === participantId);

  if (existingIndex >= 0) {
    group.participants[existingIndex] = summary;
  } else if (group.participants.length < MAX_GROUP_PARTICIPANTS) {
    group.participants.push(summary);
  }

  if (inviteEmail.trim()) {
    group.invitations = [
      ...(group.invitations ?? []),
      {
        email: inviteEmail.trim(),
        createdAt: new Date().toISOString()
      }
    ].slice(-8);
  }

  groups[groupId] = group;
  saveGroups(groups);

  return { group, participantId };
}

function getStoredGroup(groupId) {
  if (!groupId) return null;
  return loadGroups()[groupId] ?? null;
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

async function fetchComparisonGroup(groupId) {
  if (!groupId) return null;
  const response = await fetch(`/api/groups?group=${encodeURIComponent(groupId)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.group) return null;
  return saveStoredGroup(data.group);
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

function createMockComparisonGroup(language = "en", participantCount = 2) {
  const questions = FULL_QUESTIONS[language] ?? FULL_QUESTIONS.en;
  const groupId = "DEMO-COMPARE";
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
  const demoAlignedPillars = new Set(["constitution", "ownership", "management", "harmony"]);
  questions.forEach((question, index) => {
    if (!demoAlignedPillars.has(question.pillarId)) return;

    const alignedValue = [4, 4, 3, 4, 4, 3][index % 6];
    firstAnswers[question.id] = alignedValue;
    secondAnswers[question.id] = alignedValue;
    thirdAnswers[question.id] = alignedValue;
  });
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

function loadMockComparisonDemo(language, participantCount = 2) {
  const demo = createMockComparisonGroup(language, participantCount);
  saveStoredGroup(demo.group);
  return demo;
}

export default function App() {
  const [language, setLanguage] = useState("en");
  const [screen, setScreen] = useState("home");
  const [activeMode, setActiveMode] = useState(null);
  const [latestResult, setLatestResult] = useState(loadLatestResult);
  const [pendingGroupId, setPendingGroupId] = useState(null);
  const [activeComparisonGroup, setActiveComparisonGroup] = useState(null);
  const [assessmentDraft, setAssessmentDraft] = useState(loadAssessmentDraft);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [groupRefresh, setGroupRefresh] = useState(0);

  const copy = COPY[language];
  const isMockDemoRoute =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("mock-comparison");
  const isMockResultRoute =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("mock-results");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("mock-comparison")) {
      const mockLanguage = params.get("lang") === "es" ? "es" : "en";
      const mockParticipantCount = params.get("participants") === "3" ? 3 : 2;
      const demo = loadMockComparisonDemo(mockLanguage, mockParticipantCount);
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
    const mockParticipantCount = params.get("participants") === "3" ? 3 : 2;
    const demo = params.has("with-comparison")
      ? loadMockComparisonDemo(mockLanguage, mockParticipantCount)
      : null;
    const mockPackage = demo?.latestResult ?? createMockResultPackage(mockLanguage);
    setCookieConsent("accepted");
    setLanguage(mockLanguage);
    setActiveMode("full");
    setLatestResult(mockPackage);
    if (demo) setGroupRefresh((value) => value + 1);
    setScreen("results");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("mock-results") || params.has("mock-comparison")) return;

    const groupId = params.get("group")?.trim();
    if (!groupId) return;

    const linkLanguage = params.get("lang") === "es" ? "es" : "en";
    const existingGroup = getStoredGroup(groupId);
    setLanguage(linkLanguage);
    setPendingGroupId(groupId);
    setActiveMode("full");

    if (existingGroup?.participants?.length >= MAX_GROUP_PARTICIPANTS) {
      setActiveComparisonGroup(existingGroup);
      setScreen("comparison");
      return;
    }

    setScreen("assessment");
    fetchComparisonGroup(groupId).then((group) => {
      if (!group?.participants?.length) return;
      setGroupRefresh((value) => value + 1);
      if (group.participants.length >= MAX_GROUP_PARTICIPANTS) {
        setActiveComparisonGroup(group);
        setScreen("comparison");
      }
    });
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
    clearAssessmentDraft();
    setAssessmentDraft(null);
    setShowResumePrompt(false);
    setPendingGroupId(null);
    setActiveComparisonGroup(null);
    setActiveMode(mode);
    setScreen("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigate(screenName) {
    setActiveMode(null);
    setPendingGroupId(null);
    setActiveComparisonGroup(null);
    setScreen(screenName);
    if (screenName === "home" && loadAssessmentDraft()) {
      setAssessmentDraft(loadAssessmentDraft());
      setShowResumePrompt(true);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleComplete(answers, profile) {
    const mode = activeMode;
    const questions = FULL_QUESTIONS[language];

    clearAssessmentDraft();
    setAssessmentDraft(null);
    setShowResumePrompt(false);
    setScreen("loading");

    window.setTimeout(() => {
      const result = calculateResults(questions, answers);
      let resultPackage = {
        mode,
        language,
        profile,
        answers,
        result,
        createdAt: new Date().toISOString(),
        groupId: pendingGroupId
      };

      if (pendingGroupId) {
        const { group, participantId } = upsertResultInGroup(pendingGroupId, resultPackage);
        resultPackage = { ...resultPackage, participantId, groupId: group.id };
        setGroupRefresh((value) => value + 1);
      }

      setLatestResult(resultPackage);
      setPendingGroupId(null);
      setScreen("results");

      void submitFinalResult({ ...resultPackage, finalizedAt: new Date().toISOString() }).catch(
        (error) => {
          console.error("Automatic assessment save failed", error);
        }
      );
    }, 850);
  }

  function restart() {
    clearAssessmentDraft();
    setAssessmentDraft(null);
    setShowResumePrompt(false);
    setActiveMode(null);
    setScreen("assessment-home");
  }

  function handleDraftChange(draft) {
    setAssessmentDraft(draft);
  }

  function resumeAssessmentDraft() {
    const draft = assessmentDraft ?? loadAssessmentDraft();
    if (!draft) return;

    setLanguage(draft.language === "es" ? "es" : "en");
    setActiveComparisonGroup(null);
    setPendingGroupId(draft.pendingGroupId ?? null);
    setActiveMode(draft.mode ?? "full");
    setAssessmentDraft(draft);
    setShowResumePrompt(false);
    setScreen("assessment");
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

  async function refreshGroupFromServer(groupId) {
    const group = await fetchComparisonGroup(groupId);
    if (group) setGroupRefresh((value) => value + 1);
    return group;
  }

  async function submitFinalResult(resultPackage) {
    const response = await persistResult(resultPackage);
    if (resultPackage.groupId) {
      await refreshGroupFromServer(resultPackage.groupId);
    }
    return response;
  }

  async function handleCreateInvite(resultPackage, inviteEmail) {
    const groupId = resultPackage.groupId ?? createGroupId();
    const withGroup = { ...resultPackage, groupId };
    const { group, participantId } = upsertResultInGroup(groupId, withGroup, inviteEmail);
    const inviteLink = getInviteUrl(group.id, language);
    const updatedResult = {
      ...withGroup,
      participantId,
      inviteEmail: inviteEmail.trim(),
      inviteLink,
      groupParticipantCount: group.participants.length
    };

    setLatestResult(updatedResult);
    setGroupRefresh((value) => value + 1);

    const savedGroup = getStoredGroup(group.id) ?? group;

    return {
      group: savedGroup,
      inviteLink
    };
  }

  async function handleViewComparison(groupId) {
    const group = (await refreshGroupFromServer(groupId)) ?? getStoredGroup(groupId);
    if (!group) return;
    setActiveComparisonGroup(group);
    setScreen("comparison");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const latestGroup =
    latestResult?.groupId && groupRefresh >= 0 ? getStoredGroup(latestResult.groupId) : null;

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
          onStartAssessment={startAssessment}
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
        />
      )}

      {screen === "loading" && <LoadingScreen copy={copy} />}

      {screen === "results" && latestResult && (
        <ResultsScreen
          copy={copy}
          language={language}
          resultPackage={latestResult}
          group={latestGroup}
          onRetake={restart}
          onSubmitFinal={submitFinalResult}
          onCreateInvite={handleCreateInvite}
          onViewComparison={handleViewComparison}
          onRefreshGroup={refreshGroupFromServer}
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

      {["home", "about", "assessment-home", "results", "comparison"].includes(screen) && (
        <SiteFooter
          copy={copy}
          language={language}
          onNavigate={navigate}
        />
      )}

      {!isMockDemoRoute && !isMockResultRoute && <CookieConsentBanner copy={copy.cookieConsent} />}

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
    { id: "assessment-home", label: copy.nav.assessment }
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
        ["assessment", "results", "comparison", "followup"].includes(activeScreen))
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
                className={`min-h-10 min-w-0 rounded-md px-2 text-sm font-semibold transition duration-200 sm:px-4 ${
                  active
                    ? "bg-forest text-white shadow-line"
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
          <LanguageToggle language={language} setLanguage={setLanguage} />
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
                  className={`min-h-11 min-w-0 rounded-md px-3 text-sm font-semibold transition duration-200 ${
                    active
                      ? "bg-forest text-white shadow-line"
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

function CookieConsentBanner({ copy }) {
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
    <section className="pointer-events-none fixed inset-x-0 bottom-0 z-[9980] px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="pointer-events-auto mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-xl border border-forest/12 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-forest">{copy.title}</p>
          <p className="mt-1 text-sm leading-6 text-muted">{copy.body}</p>
        </div>
        <div className="flex shrink-0">
          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-forest px-5 text-sm font-bold text-white transition duration-200 hover:bg-forest-2 sm:w-auto"
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
      value: "8",
      label: language === "es" ? "dimensiones familiares" : "family dimensions"
    },
    {
      value: "~10",
      label: language === "es" ? "minutos para empezar" : "minutes to begin"
    },
    {
      value: "50",
      label: language === "es" ? "preguntas simples" : "simple questions"
    }
  ];

  const heroLabel =
    language === "es"
      ? "Diagnóstico de madurez para empresa familiar"
      : "Family Enterprise Maturity Assessment";
  return (
    <section className="w-full">
      <section className="relative overflow-hidden border-b border-forest/10 bg-[linear-gradient(135deg,#f8f3ea_0%,#f4efe6_46%,#e7ddcf_100%)]">
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
            <p
              className="fade-up mt-4 max-w-full text-[0.98rem] leading-7 text-ink/68 sm:max-w-3xl sm:text-base sm:leading-8"
              style={{ "--index": 3 }}
            >
              {copy.home.body}
            </p>
            <div
              className="fade-up mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row"
              style={{ "--index": 4 }}
            >
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-forest px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-forest-2 active:translate-y-px active:scale-[0.99]"
                onClick={onStartAssessment}
              >
                {copy.home.primaryCta}
                <ArrowRight aria-hidden="true" size={18} />
              </button>
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-forest/18 bg-white/72 px-5 text-sm font-bold text-forest transition duration-200 hover:-translate-y-0.5 hover:border-copper hover:bg-white active:translate-y-px active:scale-[0.99]"
                onClick={() => onNavigate("about")}
              >
                {copy.home.secondaryCta}
              </button>
            </div>
            <div
              className="fade-up mt-7 grid max-w-3xl grid-cols-3 gap-2 sm:mt-10 sm:gap-3"
              style={{ "--index": 5 }}
            >
              {heroStats.map((item) => (
                <HeroStat key={item.label} value={item.value} label={item.label} />
              ))}
            </div>
            <p
              className="fade-up mt-6 max-w-2xl border-l-2 border-copper pl-4 text-sm font-medium leading-6 text-muted sm:mt-8 sm:text-base sm:leading-7"
              style={{ "--index": 6 }}
            >
              {copy.home.note}
            </p>
          </div>

          <AdvisorPortrait
            copy={copy}
            language={language}
          />
        </div>
      </section>

      <section className="border-b border-forest/10 bg-white px-5 py-12 sm:px-8 lg:px-12 xl:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-5 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
              {copy.nav.about}
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-forest sm:text-5xl">
              {copy.home.gilbertTitle}
            </h2>
          </div>
          <p className="text-base leading-8 text-ink/74 sm:text-lg">
            {copy.home.gilbertBody}
          </p>
        </div>
      </section>

      <section className="border-b border-forest/10 bg-white px-5 py-14 sm:px-8 lg:px-12 xl:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-5 lg:grid-cols-[1.18fr_0.82fr]">
          <InfoBlock
            icon={Compass}
            title={copy.home.valueTitle}
            body={copy.home.valueBody}
          />
          <InfoBlock
            icon={Handshake}
            title={copy.home.businessTitle}
            body={copy.home.businessBody}
          />
          <section className="grid gap-6 rounded-lg border border-forest/10 bg-parchment/62 p-6 shadow-line transition duration-200 hover:-translate-y-1 hover:shadow-soft sm:p-8 lg:col-span-2 lg:grid-cols-[0.48fr_1fr] lg:items-start">
            <div>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-forest text-white">
                <ShieldCheck aria-hidden="true" size={22} />
              </div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-forest sm:text-4xl">
                {copy.home.helpingTitle}
              </h2>
            </div>
            <ul className="grid gap-3 md:grid-cols-2">
              {copy.home.helpingItems.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-md border border-forest/8 bg-white/70 p-4 text-sm font-medium leading-6 text-ink/72 sm:text-base sm:leading-7"
                >
                  <Check className="mt-1 shrink-0 text-copper" aria-hidden="true" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <section className="border-b border-forest/10 bg-parchment/56 px-5 py-14 sm:px-8 lg:px-12 xl:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
              {copy.nav.assessment}
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
            <button
              type="button"
              className="mt-2 inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-md bg-forest px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-forest-2 active:translate-y-px active:scale-[0.99]"
              onClick={onStartAssessment}
            >
              {copy.home.toolCta}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>
        </div>
      </section>

      <AdvisoryEvidenceSection copy={copy} />

      <section className="border-b border-forest/10 bg-white px-5 py-14 sm:px-8 lg:px-12 xl:px-8">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="max-w-3xl">
            <h2 className="font-display text-4xl font-semibold tracking-tight text-forest sm:text-5xl">
              {copy.about.testimonialsTitle}
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted">
              {copy.about.testimonialsSubtitle}
            </p>
          </div>
          <section className="rounded-lg border border-forest/10 bg-parchment/62 p-6 shadow-line sm:p-8">
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
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-12 xl:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
              {copy.nav.about}
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-forest sm:text-5xl">
              {copy.home.approachTitle}
            </h2>
            <p className="mt-4 text-base leading-8 text-muted sm:text-lg">
              {copy.home.approachSubtitle}
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {copy.home.approachBlocks.map((block, index) => (
              <ApproachFeature key={block.title} block={block} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 lg:px-12 xl:px-8">
        <div className="mx-auto max-w-[1400px] overflow-hidden rounded-lg bg-forest text-white shadow-soft lg:grid lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-12">
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {copy.home.ctaTitle}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/76 sm:text-lg">
              {copy.home.ctaBody}
            </p>
            <p className="mt-4 text-sm font-semibold text-white/58">{copy.home.ctaNote}</p>
            <button
              type="button"
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-copper px-4 text-xs font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#A85F35] active:translate-y-px active:scale-[0.99] sm:w-auto sm:px-5 sm:text-sm"
              onClick={onStartAssessment}
            >
              {copy.home.ctaButton}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>
          <div className="relative hidden min-h-full overflow-hidden lg:block">
            <img
              className="absolute inset-0 h-full w-full object-cover object-[58%_center] opacity-80"
              src="/family-governance-roundtable.png"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/60 to-transparent" />
          </div>
        </div>
      </section>
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

function InfoBlock({ icon: Icon, title, body }) {
  return (
    <section className="rounded-lg border border-forest/10 bg-white p-6 shadow-line transition duration-200 hover:-translate-y-1 hover:shadow-soft sm:p-8">
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-lg bg-forest text-white">
        <Icon aria-hidden="true" size={22} />
      </div>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-forest sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-ink/72">{body}</p>
    </section>
  );
}

function AdvisoryEvidenceSection({ copy }) {
  const evidence = copy.home.evidence;

  return (
    <section className="border-b border-forest/10 bg-parchment/56 px-5 py-14 sm:px-8 lg:px-12 xl:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-lg bg-forest p-6 text-white shadow-soft sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-copper">
              {evidence.label}
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {evidence.title}
            </h2>
            <p className="mt-5 text-base leading-7 text-white/76 sm:text-lg sm:leading-8">
              {evidence.intro}
            </p>
            <div className="mt-8 divide-y divide-white/14 border-y border-white/14">
              {evidence.stats.map((stat) => (
                <div key={stat.value} className="grid gap-2 py-5 sm:grid-cols-[0.34fr_1fr] sm:items-center">
                  <p className="font-display text-4xl font-semibold leading-none text-copper sm:text-5xl">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium leading-6 text-white/72">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs font-medium leading-5 text-white/52">
              {evidence.sourceNote}
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-forest/10 bg-white shadow-line">
            <div className="hidden border-b border-forest/10 bg-white/80 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-muted md:grid md:grid-cols-[0.34fr_1fr_1fr] md:gap-5">
              <span />
              <span>{evidence.comparisonHeaders.informal}</span>
              <span>{evidence.comparisonHeaders.advisory}</span>
            </div>
            {evidence.comparisons.map((item) => (
              <article
                key={item.theme}
                className="grid gap-4 border-b border-forest/10 p-5 last:border-b-0 md:grid-cols-[0.34fr_1fr_1fr] md:gap-5 md:p-6"
              >
                <h3 className="font-display text-2xl font-semibold leading-tight text-forest">
                  {item.theme}
                </h3>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-copper md:hidden">
                    {evidence.comparisonHeaders.informal}
                  </p>
                  <p className="text-sm leading-6 text-ink/72 sm:text-base sm:leading-7">
                    {item.informal}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-copper md:hidden">
                    {evidence.comparisonHeaders.advisory}
                  </p>
                  <p className="text-sm font-medium leading-6 text-forest/82 sm:text-base sm:leading-7">
                    {item.advisory}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-forest/10 bg-white/72 p-4 shadow-line sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium leading-6 text-ink/68">
            {evidence.sourceNote}
          </p>
        </div>
      </div>
    </section>
  );
}

function ApproachFeature({ block, index }) {
  const icons = [Compass, Scale, Landmark, Handshake];
  const Icon = icons[index] ?? Compass;

  return (
    <article
      className="fade-up relative flex min-h-[310px] flex-col rounded-lg border border-forest/10 bg-white p-6 shadow-line transition duration-300 hover:-translate-y-1 hover:border-forest/24 hover:shadow-soft sm:p-7"
      style={{ "--index": index }}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-forest text-white">
          <Icon aria-hidden="true" size={22} />
        </div>
        <span className="font-display text-5xl font-semibold tracking-tight text-copper/30">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight text-forest">
        {block.title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-ink/72 sm:text-base">{block.body}</p>
    </article>
  );
}

function AboutPage({ copy, language, onNavigate, onStartAssessment }) {
  return (
    <section className="w-full">
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
            <button
              type="button"
              className="inline-flex min-h-12 w-fit max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-forest px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-forest-2 active:translate-y-px active:scale-[0.99]"
              onClick={onStartAssessment}
            >
              {copy.about.heroCta}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>

          <div className="flex min-h-full flex-col justify-start lg:py-1">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-copper">
              {copy.about.label}
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-[2.65rem] font-semibold leading-[1.04] text-forest sm:text-[3.45rem] xl:text-[4rem]">
              {copy.about.title}
            </h1>
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
          </div>
          <div className="mt-8 lg:mt-0">
            {[copy.about.toolBody, copy.about.toolBodySecond, copy.about.toolBodyThird, copy.about.toolBodyFourth].filter(Boolean).map(
              (paragraph) => (
                <p key={paragraph} className="mb-5 text-lg leading-8 text-white/76 last:mb-0">
                  {paragraph}
                </p>
              )
            )}
            <button
              type="button"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-md bg-copper px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#A85F35] active:translate-y-px active:scale-[0.99]"
              onClick={onStartAssessment}
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
          { value: "8", label: "dimensiones" },
          { value: "~10", label: "minutos" },
          { value: "0", label: "preparación" }
        ]
      : [
          { value: "50", label: "questions" },
          { value: "8", label: "dimensions" },
          { value: "~10", label: "minutes" },
          { value: "0", label: "prep needed" }
        ];
  const deliverables =
    language === "es"
      ? ["Gráfica radar", "Resultado completo", "Áreas de enfoque"]
      : ["Radar chart", "Full result", "Focus areas"];

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

              <button
                type="button"
                className="mt-7 inline-flex min-h-[3.15rem] w-full items-center justify-center gap-3 rounded-md bg-copper px-5 text-base font-semibold text-white shadow-line transition duration-200 active:translate-y-px lg:hidden"
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
                className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-3 rounded-md bg-copper px-5 py-4 text-base font-semibold text-white shadow-line transition duration-200 hover:-translate-y-0.5 hover:bg-[#AA5E2E] active:translate-y-0"
                onClick={() => onStart("full")}
              >
                {copy.assessmentIntro.conversationCta}
                <ArrowRight aria-hidden="true" size={19} />
              </button>
            </div>
          </aside>
        </div>

        <section className="mt-6 rounded-xl border border-forest/10 bg-white p-5 shadow-line sm:p-7 lg:p-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper sm:text-sm">
                {copy.assessmentIntro.coverageLabel}
              </p>
              <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight text-forest [text-wrap:balance] sm:text-5xl">
                {copy.assessmentIntro.coverageTitle}
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8 lg:justify-self-end">
              {copy.assessmentIntro.coverageBody}
            </p>
          </div>

          <div className="mt-7 grid overflow-hidden rounded-lg border border-forest/10 bg-forest/10 md:grid-cols-2 xl:grid-cols-4">
            {PILLARS.map((pillar, index) => (
              <article key={pillar.id} className="bg-white p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-sm font-semibold text-copper">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-forest/12" />
                </div>
                <h3 className="text-base font-semibold leading-6 text-forest">
                  {pillar.labels[language]}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {pillar.descriptions[language]}
                </p>
              </article>
            ))}
          </div>
        </section>

      </div>
    </section>
  );
}

function LanguageToggle({ language, setLanguage, variant = "light" }) {
  const dark = variant === "dark";

  return (
    <div
      className={`inline-flex rounded-full border p-1 ${
        dark ? "w-fit border-white/24 bg-white/8" : "w-fit border-forest/15 bg-white"
      }`}
      aria-label="Language selection"
    >
      {Object.values(LANGUAGES).map((item) => {
        const active = item.code === language;
        return (
          <button
            key={item.code}
            type="button"
            className={`min-h-9 min-w-11 rounded-full px-2 text-xs font-semibold transition sm:min-h-10 sm:min-w-16 sm:px-4 sm:text-sm ${
              active
                ? dark
                  ? "bg-white text-forest"
                  : "bg-forest text-white"
                : dark
                  ? "text-white/70 hover:text-white"
                  : "text-forest/68 hover:text-forest"
            }`}
            aria-pressed={active}
            onClick={() => setLanguage(item.code)}
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
  onSubmit
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

          <div className="mt-8 border-t border-white/14 pt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/55">
              {selectedMode.title}
            </p>
            <p className="mt-2 text-base leading-7 text-white/78">
              {selectedMode.description}
            </p>
          </div>

          <div className="mt-8 rounded-lg border border-white/18 p-4">
            <p className="text-sm font-semibold text-white">{intake.contextTitle}</p>
            <p className="mt-2 text-sm leading-6 text-white/70">{intake.contextBody}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-lg bg-white/[0.055] p-4">
              <p className="text-sm font-semibold text-white">{intake.nextTitle}</p>
              <ol className="mt-3 space-y-3">
                {intake.nextSteps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-white/70">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-copper bg-copper text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg border border-white/12 bg-white/[0.035] p-4">
              <p className="text-sm font-semibold text-white">{intake.includesTitle}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {intake.includes.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/12 px-3 py-1 text-xs font-semibold text-white/70"
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
              <p className="text-sm text-ink/60">{intake.requiredNote}</p>
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
  onComplete
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
  const [transition, setTransition] = useState(null);
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
    if (!profileStepComplete || transition) return undefined;

    function handleScoreKey(event) {
      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName));

      if (isTypingTarget || event.metaKey || event.ctrlKey || event.altKey) return;
      if (!/^[0-5]$/.test(event.key)) return;

      event.preventDefault();
      selectScore(Number(event.key));
    }

    window.addEventListener("keydown", handleScoreKey);
    return () => window.removeEventListener("keydown", handleScoreKey);
  }, [profileStepComplete, question.id, transition]);

  function goNext() {
    if (!isAssessmentAnswered(currentAnswer)) return;
    if (isLast) {
      onComplete(answers, profileForResult());
      return;
    }
    const nextQuestion = questions[index + 1];
    if (nextQuestion.pillarId !== question.pillarId) {
      const nextPillar = PILLARS.find((item) => item.id === nextQuestion.pillarId);
      setTransition({ completed: pillar, next: nextPillar, nextIndex: index + 1 });
      return;
    }
    setIndex((value) => value + 1);
  }

  function continueToNextPillar() {
    if (!transition) return;
    setIndex(transition.nextIndex);
    setTransition(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!profileStepComplete) {
    return (
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
      />
    );
  }

  if (transition) {
    return (
      <section className="grid min-h-[calc(100dvh-80px)] place-items-center px-5 py-10 sm:px-8">
        <div className="fade-up w-full max-w-2xl rounded-xl border border-forest/10 bg-white p-8 text-center shadow-soft sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
            {copy.completedPillar}
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold text-forest">
            {transition.completed.labels[language]}
          </h1>
          <div className="mx-auto my-8 h-px w-28 bg-forest/15" />
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
            {copy.nextPillar}
          </p>
          <p className="mt-3 font-display text-4xl font-semibold text-forest">
            {transition.next.labels[language]}
          </p>
          <button
            type="button"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-forest px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-forest-2 active:translate-y-px active:scale-[0.99]"
            onClick={continueToNextPillar}
          >
            {copy.continueToNextPillar}
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[calc(100dvh-80px)] w-full flex-col px-5 py-6 sm:px-8 lg:px-16 xl:px-24">
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

            <div className="mt-8 flex flex-col gap-4 border-t border-forest/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink/60">{copy.scaleNote}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-forest/15 bg-white px-4 text-sm font-semibold text-forest disabled:opacity-40"
                  onClick={() => setIndex((value) => Math.max(0, value - 1))}
                  disabled={index === 0}
                >
                  <ArrowLeft aria-hidden="true" size={18} />
                  {copy.back}
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-forest px-5 text-sm font-semibold text-white transition hover:bg-forest-2 disabled:cursor-not-allowed disabled:bg-forest/35"
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
  group,
  onRetake,
  onSubmitFinal,
  onCreateInvite,
  onViewComparison,
  onRefreshGroup
}) {
  const [invitePromptOpen, setInvitePromptOpen] = useState(false);
  const [inviteLinkModalOpen, setInviteLinkModalOpen] = useState(false);
  const [inviteLinkModalLink, setInviteLinkModalLink] = useState(
    resultPackage.groupId ? getInviteUrl(resultPackage.groupId, language) : ""
  );
  const [inviteLinkPending, setInviteLinkPending] = useState(false);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [inviteLinkError, setInviteLinkError] = useState("");
  const [submitPending, setSubmitPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const invitePanelRef = useRef(null);
  const { result } = resultPackage;
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
  const hasInvite = Boolean(resultPackage.groupId);
  const [submitError, setSubmitError] = useState("");

  async function submitResult({ allowWithoutInvite = false } = {}) {
    if (!hasInvite && !allowWithoutInvite) {
      setInvitePromptOpen(true);
      return;
    }

    setSubmitError("");
    setSubmitPending(true);
    try {
      await onSubmitFinal({ ...resultPackage, finalizedAt: new Date().toISOString() });
      setSubmitted(true);
      setInvitePromptOpen(false);
    } catch {
      setSubmitError(finalCopy.error);
    } finally {
      setSubmitPending(false);
    }
  }

  async function createInviteLinkFromModal() {
    setInviteLinkPending(true);
    setInviteLinkError("");
    try {
      const next = await onCreateInvite(resultPackage, "");
      setInviteLinkModalLink(next.inviteLink);
    } catch {
      setInviteLinkError(finalCopy.inviteLinkError);
    } finally {
      setInviteLinkPending(false);
    }
  }

  async function copyModalInviteLink() {
    if (!inviteLinkModalLink) return;
    await navigator.clipboard.writeText(inviteLinkModalLink);
    setInviteLinkCopied(true);
    window.setTimeout(() => setInviteLinkCopied(false), 1600);
  }

  async function finishAfterInviteLink() {
    setInviteLinkModalOpen(false);
    await submitResult({ allowWithoutInvite: true });
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1fr)]">
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
              <div className="grid h-[280px] w-full place-items-center text-sm font-semibold text-muted sm:h-[430px]">
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

      {unknownCount > 5 && (
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

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-xl border border-forest/12 bg-white shadow-line">
            <div className="border-b border-forest/10 p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-copper">
                {copy.reflection}
              </p>
              <p className="mt-4 max-w-5xl text-lg leading-8 text-ink/74">
                {stage.reflections[language]}
              </p>
            </div>

            <div id="diagnostic-breakdown" className="p-6 sm:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="font-display text-4xl font-semibold leading-tight text-forest">
                    {detailCopy.breakdownTitle}
                  </h2>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-ink/68">
                    {detailCopy.breakdownIntro}
                  </p>
                </div>
                <span className="w-fit text-xs font-bold uppercase tracking-[0.14em] text-muted">
                  {detailCopy.scrollHint}
                </span>
              </div>

              <div className="report-scroll mt-6 max-h-[1120px] space-y-4 overflow-y-auto pr-1 sm:pr-3 xl:max-h-[1280px]">
                {pillarBreakdowns.map((breakdown) => (
                  <PillarBreakdownCard
                    key={breakdown.id}
                    breakdown={breakdown}
                    copy={copy}
                    detailCopy={detailCopy}
                  />
                ))}
              </div>
            </div>
          </section>

        </div>

        <aside className="space-y-4 xl:sticky xl:top-28 xl:self-start">
          <section className="rounded-xl border border-forest/12 bg-parchment/80 p-6 shadow-line">
            <h2 className="font-display text-3xl font-semibold leading-tight text-forest">
              {detailCopy.implementationGapTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-ink/72">
              {detailCopy.implementationGapBody}
            </p>
          </section>

          <InviteFamilyPanel
            copy={copy}
            language={language}
            resultPackage={resultPackage}
            group={group}
            onCreateInvite={onCreateInvite}
            onViewComparison={onViewComparison}
            onRefreshGroup={onRefreshGroup}
            panelRef={invitePanelRef}
          />

          <section className="rounded-xl border border-copper/25 bg-white p-6 shadow-line">
            <h2 className="font-display text-3xl font-semibold leading-tight text-forest">
              {finalCopy.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-ink/72">
              {finalCopy.body}
            </p>
            <div className="mt-5 space-y-2">
              {priorityBreakdowns.length > 0 ? (
                priorityBreakdowns.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-parchment/70 px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-forest">{item.shortLabel}</span>
                    <span className="font-bold text-copper">{item.score}</span>
                  </div>
                ))
              ) : (
                <p className="rounded-lg bg-parchment/70 px-3 py-2 text-sm leading-6 text-muted">
                  {detailCopy.noPriority}
                </p>
              )}
            </div>
            {strongBreakdowns.length > 0 && (
              <div className="mt-4 border-t border-forest/10 pt-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  {detailCopy.strongestAreas}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {strongBreakdowns.map((item) => (
                    <span
                      key={item.id}
                      className="rounded-full bg-forest/8 px-3 py-1 text-xs font-semibold text-forest"
                    >
                      {item.shortLabel} {item.score}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-5 space-y-3">
              <button
                type="button"
                className="inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-md bg-forest px-4 text-left text-sm font-semibold text-white transition hover:bg-forest-2"
                onClick={() => {
                  document
                    .getElementById("diagnostic-breakdown")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                {copy.fullCtas[0]}
                <ArrowRight aria-hidden="true" size={18} />
              </button>
              <button
                type="button"
                className="inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-md bg-copper px-4 text-left text-sm font-semibold text-white transition hover:bg-[#AA5E2E] disabled:cursor-not-allowed disabled:bg-copper/60"
                onClick={() => setInvitePromptOpen(true)}
                disabled={submitPending || submitted}
              >
                {submitted ? finalCopy.saved : submitPending ? finalCopy.saving : finalCopy.continue}
                <ArrowRight aria-hidden="true" size={18} />
              </button>
              {submitError && (
                <p className="rounded-md border border-copper/25 bg-copper/10 px-3 py-2 text-sm leading-5 text-forest">
                  {submitError}
                </p>
              )}
            </div>
          </section>

        </aside>
      </div>
      {invitePromptOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-forest/45 px-5 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-soft sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">
                  {copy.comparison.inviteTitle}
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-forest">
                  {finalCopy.inviteTitle}
                </h2>
              </div>
              <button
                type="button"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-forest/12 text-forest hover:border-copper"
                onClick={() => setInvitePromptOpen(false)}
                aria-label={finalCopy.close}
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <p className="mt-4 text-base leading-7 text-ink/72">{finalCopy.inviteBody}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-between gap-3 rounded-md bg-forest px-4 text-left text-sm font-semibold text-white transition hover:bg-forest-2"
                onClick={() => {
                  setInvitePromptOpen(false);
                  setInviteLinkModalOpen(true);
                }}
              >
                {finalCopy.inviteFirst}
                <UsersRound aria-hidden="true" size={18} />
              </button>
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-between gap-3 rounded-md border border-forest/18 px-4 text-left text-sm font-semibold text-forest transition hover:border-copper disabled:cursor-not-allowed disabled:opacity-70"
                onClick={() => submitResult({ allowWithoutInvite: true })}
                disabled={submitPending}
              >
                {submitPending ? finalCopy.saving : finalCopy.continueAnyway}
                <ArrowRight aria-hidden="true" size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
      {inviteLinkModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-forest/45 px-5 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-soft sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">
                  {finalCopy.inviteLinkLabel}
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-forest">
                  {finalCopy.inviteLinkTitle}
                </h2>
              </div>
              <button
                type="button"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-forest/12 text-forest hover:border-copper"
                onClick={() => setInviteLinkModalOpen(false)}
                aria-label={finalCopy.close}
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <p className="mt-4 text-base leading-7 text-ink/72">{finalCopy.inviteLinkBody}</p>

            {inviteLinkModalLink ? (
              <div className="mt-5 rounded-lg border border-forest/12 bg-parchment/45 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-copper">
                  {copy.comparison.inviteReady}
                </p>
                <p className="mt-3 break-all rounded-md bg-white px-3 py-3 text-sm leading-6 text-ink/78">
                  {inviteLinkModalLink}
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-forest px-4 text-sm font-semibold text-white transition hover:bg-forest-2"
                  onClick={copyModalInviteLink}
                >
                  <Copy aria-hidden="true" size={16} />
                  {inviteLinkCopied ? copy.comparison.copied : copy.comparison.copyInvite}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="mt-5 inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-md bg-forest px-4 text-left text-sm font-semibold text-white transition hover:bg-forest-2 disabled:cursor-not-allowed disabled:bg-forest/60"
                onClick={createInviteLinkFromModal}
                disabled={inviteLinkPending}
              >
                {inviteLinkPending ? finalCopy.creatingInviteLink : finalCopy.createInviteLink}
                <Link aria-hidden="true" size={18} />
              </button>
            )}

            {inviteLinkError && (
              <p className="mt-4 rounded-md border border-copper/25 bg-copper/10 px-3 py-2 text-sm leading-5 text-forest">
                {inviteLinkError}
              </p>
            )}

            <button
              type="button"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-forest/16 bg-white px-4 text-sm font-semibold text-forest transition hover:border-copper"
              onClick={finishAfterInviteLink}
              disabled={submitPending}
            >
              {submitPending ? finalCopy.saving : finalCopy.done}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function InviteFamilyPanel({
  copy,
  language,
  resultPackage,
  group,
  onCreateInvite,
  onViewComparison,
  onRefreshGroup,
  panelRef,
  wide = false
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState(
    resultPackage.groupId ? getInviteUrl(resultPackage.groupId, language) : ""
  );
  const [linkCopied, setLinkCopied] = useState(false);
  const [invitePending, setInvitePending] = useState(false);
  const comparisonCopy = copy.comparison;
  const participantCount = group?.participants?.length ?? 1;
  const canCompare = Boolean(group?.participants?.length >= 2);
  const isFull = participantCount >= MAX_GROUP_PARTICIPANTS;

  useEffect(() => {
    if (!resultPackage.groupId || canCompare || !onRefreshGroup) return undefined;

    const refresh = () => onRefreshGroup(resultPackage.groupId);
    refresh();
    const interval = window.setInterval(refresh, 5000);
    return () => window.clearInterval(interval);
  }, [canCompare, resultPackage.groupId]);

  async function createInvite() {
    setInvitePending(true);
    try {
      const next = await onCreateInvite(resultPackage, inviteEmail);
      setInviteLink(next.inviteLink);
      setInviteEmail("");
    } finally {
      setInvitePending(false);
    }
  }

  async function copyInviteLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 1600);
  }

  return (
    <section ref={panelRef} className="rounded-xl border border-forest/12 bg-white p-5 shadow-line sm:p-6">
      <div
        className={
          wide
            ? "grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.58fr)] lg:items-start"
            : "space-y-4"
        }
      >
        <div>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-forest text-white">
              <UsersRound aria-hidden="true" size={20} />
            </span>
            <div>
              <h2 className="font-display text-2xl font-semibold leading-tight text-forest">
                {comparisonCopy.inviteTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink/70">{comparisonCopy.inviteBody}</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-parchment/70 p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-forest">{comparisonCopy.participantCount}</span>
              <span className="font-bold text-copper">
                {participantCount} / {MAX_GROUP_PARTICIPANTS}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted">{comparisonCopy.maxNote}</p>
          </div>

          {!canCompare && (
            <div className="mt-4 border-t border-forest/10 pt-4">
              <p className="text-sm font-semibold text-forest">{comparisonCopy.waitingTitle}</p>
              <p className="mt-1 text-sm leading-6 text-ink/68">{comparisonCopy.waitingBody}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {isFull ? (
            <p className="rounded-lg border border-copper/20 bg-copper/10 p-3 text-sm leading-6 text-forest">
              {comparisonCopy.inviteLimit}
            </p>
          ) : (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-forest">
                  {comparisonCopy.inviteEmail}
                </span>
                <input
                  className="min-h-11 w-full rounded-md border border-forest/15 bg-white px-3 text-sm text-ink outline-none transition focus:border-copper"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder={comparisonCopy.inviteEmailPlaceholder}
                  type="email"
                />
              </label>
              <button
                type="button"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-forest px-4 text-sm font-semibold text-white transition hover:bg-forest-2"
                onClick={createInvite}
                disabled={invitePending}
              >
                <Send aria-hidden="true" size={17} />
                {invitePending ? copy.saving : comparisonCopy.generateInvite}
              </button>
            </>
          )}

          {inviteLink && (
            <div className="rounded-lg border border-forest/12 bg-parchment/45 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-copper">
                {comparisonCopy.inviteReady}
              </p>
              <p className="mt-2 break-all text-xs leading-5 text-ink/68">{inviteLink}</p>
              <p className="mt-2 text-xs leading-5 text-muted">{comparisonCopy.inviteNote}</p>
              <button
                type="button"
                className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-forest/16 bg-white px-3 text-sm font-semibold text-forest transition hover:border-copper"
                onClick={copyInviteLink}
              >
                <Copy aria-hidden="true" size={16} />
                {linkCopied ? comparisonCopy.copied : comparisonCopy.copyInvite}
              </button>
            </div>
          )}

          {canCompare && (
            <button
              type="button"
              className="inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-md bg-copper px-4 text-sm font-semibold text-white transition hover:bg-[#AA5E2E]"
              onClick={() => onViewComparison(group.id)}
            >
              {comparisonCopy.viewComparison}
              <ArrowRight aria-hidden="true" size={17} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ComparisonScreen({ copy, language, group, onBackToResult }) {
  const comparisonCopy = copy.comparison;
  const visualCopy = getComparisonVisualCopy(language);
  const participants = (group.participants ?? []).slice(0, MAX_GROUP_PARTICIPANTS);
  const rows = buildComparisonRows(participants, language);
  const convergence = rows.filter((row) => row.numericCount >= 2 && row.gap <= 10);
  const transparency = rows.filter((row) => row.hasTransparencyGap);
  const stats = buildComparisonStats(rows, participants);
  const inputComparison = buildInputComparison(participants, language);

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
            participants={participants}
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

      <div className="mt-5 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="rounded-xl border border-forest/12 bg-white p-4 shadow-line sm:p-5">
          <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-end 2xl:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">
                {visualCopy.mapLabel}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-forest">
                {comparisonCopy.pillarComparison}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-muted">
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
          <div className="report-scroll mt-5 max-h-[526px] space-y-3 overflow-y-auto pr-1 sm:pr-3 2xl:max-h-[562px]">
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
            scrollable
            scrollMaxClassName="max-h-[132px]"
          />
          <ComparisonInsightCard
            title={comparisonCopy.transparencyTitle}
            body={comparisonCopy.transparencyBody}
            empty={comparisonCopy.noTransparency}
            items={transparency}
            language={language}
            comparisonCopy={comparisonCopy}
            scrollable
          />
        </aside>
      </div>

      <DetailedInputComparison
        participants={participants}
        language={language}
        inputComparison={inputComparison}
        visualCopy={visualCopy}
        comparisonCopy={comparisonCopy}
        copy={copy}
        transparency={transparency}
      />
    </section>
  );
}

function LargestGapSpotlight({ row, participants, language, copy, visualCopy, comparisonCopy }) {
  if (!row) return null;

  const spotlightScores = Array.from(
    { length: MAX_GROUP_PARTICIPANTS },
    (_, index) => row.scores[index] ?? null
  );

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
          if (!score) {
            return (
              <div key={`${row.id}-spotlight-empty-${index}`} aria-hidden="true">
                <div className="mb-1.5 h-5" />
                <div className="h-3 rounded-full bg-forest/[0.04]" />
              </div>
            );
          }

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

function DetailedInputComparison({
  participants,
  language,
  inputComparison,
  visualCopy,
  comparisonCopy,
  copy,
  transparency
}) {
  const narrative = buildComparisonNarrative(inputComparison, visualCopy);
  const topPillars = inputComparison.pillars
    .filter((pillar) => pillar.stats.maxGap > 0 || pillar.stats.unknownCount > 0)
    .sort((a, b) => b.stats.maxGap - a.stats.maxGap)
    .slice(0, 8);

  return (
    <section className="mt-6 rounded-xl border border-forest/12 bg-white p-4 shadow-line sm:p-5">
      <div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">
            {visualCopy.inputLabel}
          </p>
          <h2 className="mt-2 max-w-3xl font-display text-3xl font-semibold leading-tight text-forest">
            {visualCopy.inputTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/68">
            {visualCopy.inputBody}
          </p>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <InputPatternCard
            label={visualCopy.sameAnswers}
            value={inputComparison.stats.same}
            total={inputComparison.stats.comparable}
            tone="forest"
          />
          <InputPatternCard
            label={visualCopy.closeAnswers}
            value={inputComparison.stats.close}
            total={inputComparison.stats.comparable}
            tone="copper"
          />
          <InputPatternCard
            label={visualCopy.farAnswers}
            value={inputComparison.stats.far}
            total={inputComparison.stats.comparable}
            tone="red"
          />
        </div>
      </div>

      <div className="mt-5 grid items-stretch gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.55fr)]">
        <section className="flex h-full flex-col rounded-xl border border-forest/10 bg-parchment/30 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">
                {visualCopy.narrativeLabel}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-forest">
                {visualCopy.narrativeTitle}
              </h3>
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-muted">
              {visualCopy.scrollHint}
            </span>
          </div>
          <div className="report-scroll mt-4 max-h-[604px] flex-1 space-y-4 overflow-y-auto pr-1 sm:pr-3">
            {narrative.map((item) => (
              <NarrativeInsightCard key={item.id} item={item} />
            ))}
            <div className="rounded-lg border border-forest/8 bg-white p-4">
              <h4 className="text-base font-bold text-forest">{visualCopy.howToReadTitle}</h4>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-ink/70">
                {visualCopy.howToReadItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-1 shrink-0 text-copper" aria-hidden="true" size={15} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="flex h-full flex-col rounded-xl border border-copper/24 bg-copper/8 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-2xl font-semibold leading-tight text-forest">
                  {visualCopy.dimensionSummaryTitle}
                </h3>
                <p className="mt-2 text-sm leading-6 text-ink/68">
                  {visualCopy.dimensionSummaryBody}
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold uppercase tracking-[0.1em] text-muted">
                {visualCopy.scrollHint}
              </span>
            </div>
            <div className="report-scroll mt-4 max-h-[544px] flex-1 space-y-3 overflow-y-auto pr-1 sm:pr-2">
              {topPillars.map((pillar) => (
                <DimensionNarrativeRow
                  key={pillar.id}
                  pillar={pillar}
                  visualCopy={visualCopy}
                  comparisonCopy={comparisonCopy}
                />
              ))}
            </div>
          </section>
        </aside>
      </div>

      <div className="mt-5 max-w-[440px]">
        <a
          href={`mailto:${copy.contactEmail}`}
          className="inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-md bg-copper px-4 text-left text-sm font-semibold text-white transition hover:bg-[#AA5E2E]"
        >
          {comparisonCopy.groupCallCta}
          <Mail aria-hidden="true" size={18} />
        </a>
      </div>
    </section>
  );
}

function InputPatternCard({ label, value, total, tone }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  const color =
    tone === "red" ? "#A64B3C" : tone === "copper" ? "#C4713A" : "#1C3D2E";

  return (
    <div className="grid grid-cols-[58px_1fr] items-center gap-3 rounded-lg border border-forest/10 bg-white p-3 shadow-line">
      <div
        className="grid h-[58px] w-[58px] place-items-center rounded-full"
        style={{
          background: `conic-gradient(${color} ${percent * 3.6}deg, rgba(28, 61, 46, 0.1) 0deg)`
        }}
      >
        <div className="grid h-[44px] w-[44px] place-items-center rounded-full bg-white">
          <span className="text-xs font-bold text-forest">{percent}%</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-bold leading-5 text-forest">{label}</p>
        <p className="mt-1 text-xs font-semibold text-muted">
          {value} / {total}
        </p>
      </div>
    </div>
  );
}

function NarrativeInsightCard({ item }) {
  return (
    <article className="rounded-lg border border-forest/8 bg-white p-4 shadow-line">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-copper">{item.label}</p>
          <h4 className="mt-2 text-lg font-bold leading-tight text-forest">{item.title}</h4>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${item.className}`}>
          {item.badge}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink/72">{item.body}</p>
      {item.detail && <p className="mt-2 text-sm font-semibold leading-6 text-forest">{item.detail}</p>}
    </article>
  );
}

function DimensionNarrativeRow({ pillar, visualCopy, comparisonCopy }) {
  const band = getInputGapBand(pillar.stats.maxGap, visualCopy);

  return (
    <div className="rounded-lg bg-white p-3 shadow-line">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold leading-5 text-forest">{pillar.shortLabel}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-muted">
            {visualCopy.dimensionSummaryLine(
              pillar.stats.highGap,
              pillar.stats.closeGap,
              pillar.stats.unknownCount
            )}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${band.className}`}>
          {comparisonCopy.scoreGap}: {pillar.stats.maxGap}
        </span>
      </div>
    </div>
  );
}

function ComparisonInsightCard({
  title,
  body,
  empty,
  items,
  language,
  comparisonCopy,
  accent = false,
  scrollable = false,
  scrollMaxClassName = "max-h-[236px]"
}) {
  const visibleItems = scrollable ? items : items.slice(0, 5);

  return (
    <section
      className={`rounded-xl border p-5 shadow-line ${
        accent ? "border-copper/24 bg-white" : "border-forest/12 bg-white"
      }`}
    >
      <h2 className="font-display text-2xl font-semibold leading-tight text-forest">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink/68">{body}</p>
      <div
        className={`mt-4 space-y-2 ${
          scrollable ? `report-scroll ${scrollMaxClassName} overflow-y-auto pr-1` : ""
        }`}
      >
        {items.length > 0 ? (
          visibleItems.map((item) => (
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
      inputLabel: "Evidencia de respuestas",
      inputTitle: "Interpretación breve de la comparación",
      inputBody:
        "Esta lectura resume qué puede significar la distancia entre perspectivas sin convertir el resultado en una tabla larga de respuestas.",
      sameAnswers: "Misma respuesta",
      closeAnswers: "Diferencia pequeña",
      farAnswers: "Diferencia alta",
      howToReadTitle: "Cómo leerlo",
      howToReadItems: [
        "Una diferencia alta no significa que alguien esté equivocado.",
        "Puede señalar distinta información, rol o experiencia dentro del sistema familiar.",
        "Las respuestas sin información también son una señal de transparencia."
      ],
      narrativeLabel: "Lectura comparativa",
      narrativeTitle: "Qué significa esta comparación",
      scrollHint: "Desplazar dentro del recuadro",
      dimensionSummaryTitle: "Resumen por dimensión",
      dimensionSummaryBody:
        "Una lectura compacta de dónde las respuestas se acercan, se separan o muestran falta de información.",
      dimensionSummaryLine: (high, close, unknown) =>
        `${high} altas · ${close} cercanas${unknown ? ` · ${unknown} sin información` : ""}`,
      overallPatternLabel: "Patrón general",
      overallPatternTitle: "Las respuestas muestran una diferencia real de percepción",
      overallPatternBody: (far, comparable) =>
        `${far} de ${comparable} respuestas comparables tienen una diferencia alta. Esto sugiere que las personas no solo asignan puntajes distintos; pueden estar viendo momentos, responsabilidades o información diferente del mismo sistema familiar.`,
      strongestAgreementLabel: "Mayor acuerdo",
      strongestAgreementTitle: (pillar) => `Mayor alineación en ${pillar}`,
      strongestAgreementBody: (gap) =>
        `La brecha más baja en esta dimensión es de ${gap} punto(s). Puede ser un buen punto de partida porque hay más base compartida para conversar.`,
      strongestDifferenceLabel: "Mayor diferencia",
      strongestDifferenceTitle: (pillar) => `Mayor distancia en ${pillar}`,
      strongestDifferenceBody: (gap) =>
        `La brecha máxima llega a ${gap} punto(s). Conviene explorar qué información, experiencia o expectativa explica esta diferencia antes de decidir una solución.`,
      transparencyPatternLabel: "Transparencia",
      transparencyPatternTitle: "Hay señales de información desigual",
      transparencyPatternBody: (unknown) =>
        `${unknown} respuestas fueron marcadas como sin información. Eso no baja el puntaje por sí solo, pero indica que algunos temas no son igualmente visibles para todos.`,
      same: "Igual",
      close: "Cerca",
      far: "Alta diferencia"
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
    inputLabel: "Response evidence",
      inputTitle: "Short interpretation of the comparison",
      inputBody:
      "This readout explains what the distance between perspectives may mean without turning the result into a long answer-by-answer table.",
    sameAnswers: "Same answer",
    closeAnswers: "Small difference",
    farAnswers: "High difference",
    howToReadTitle: "How to read this",
      howToReadItems: [
        "A high gap does not mean one person is wrong.",
        "It may show different information, roles, or lived experience inside the family system.",
        "Unknown answers are also a transparency signal."
      ],
      narrativeLabel: "Comparison readout",
      narrativeTitle: "What this comparison suggests",
      scrollHint: "Scroll inside this tile",
      dimensionSummaryTitle: "Dimension summary",
      dimensionSummaryBody:
        "A compact read of where answers are close, where they separate, and where information may be uneven.",
      dimensionSummaryLine: (high, close, unknown) =>
        `${high} high · ${close} close${unknown ? ` · ${unknown} unknown` : ""}`,
      overallPatternLabel: "Overall pattern",
      overallPatternTitle: "The answers show a real difference in perception",
      overallPatternBody: (far, comparable) =>
        `${far} of ${comparable} comparable answers have a high difference. This suggests the participants may not just be scoring differently; they may be seeing different responsibilities, information, or moments inside the same family system.`,
      strongestAgreementLabel: "Strongest agreement",
      strongestAgreementTitle: (pillar) => `Most alignment appears in ${pillar}`,
      strongestAgreementBody: (gap) =>
        `The lowest gap in this dimension is ${gap} point(s). This can be a useful place to start because there is more shared ground for the conversation.`,
      strongestDifferenceLabel: "Strongest difference",
      strongestDifferenceTitle: (pillar) => `The widest distance appears in ${pillar}`,
      strongestDifferenceBody: (gap) =>
        `The largest answer-level gap reaches ${gap} point(s). This is worth discussing before jumping to a solution, because the difference may come from role, information access, or lived experience.`,
      transparencyPatternLabel: "Transparency",
      transparencyPatternTitle: "Some information may not be equally visible",
      transparencyPatternBody: (unknown) =>
        `${unknown} answers were marked as unknown. That does not lower the score by itself, but it does show which topics may not be equally visible to everyone.`,
    same: "Same",
    close: "Close",
    far: "High gap"
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

function buildInputComparison(participants, language) {
  const questions = FULL_QUESTIONS[language] ?? FULL_QUESTIONS.en;
  const questionItems = questions.map((question, index) => {
    const answers = participants.map((participant) => ({
      participant,
      value: participant.answers?.[question.id]
    }));
    const numericValues = answers
      .map((answer) => answer.value)
      .filter((value) => Number.isFinite(value));
    const gap =
      numericValues.length >= 2 ? Math.max(...numericValues) - Math.min(...numericValues) : 0;
    const unknownCount = answers.filter((answer) => answer.value === UNKNOWN_ANSWER).length;

    return {
      id: question.id,
      text: question.text,
      pillarId: question.pillarId,
      pillarShortLabel:
        PILLARS.find((pillar) => pillar.id === question.pillarId)?.shortLabels[language] ?? "",
      index,
      shortLabel: `Q${String(index + 1).padStart(2, "0")}`,
      answers,
      numericCount: numericValues.length,
      unknownCount,
      gap
    };
  });

  const comparable = questionItems.filter((item) => item.numericCount >= 2);
  const same = comparable.filter((item) => item.gap === 0).length;
  const close = comparable.filter((item) => item.gap > 0 && item.gap <= 1).length;
  const far = comparable.filter((item) => item.gap >= 2).length;

  return {
    stats: {
      comparable: comparable.length,
      same,
      close,
      far
    },
    questions: questionItems,
    pillars: PILLARS.map((pillar) => {
      const pillarQuestions = questionItems.filter((item) => item.pillarId === pillar.id);
      const pillarComparable = pillarQuestions.filter((item) => item.numericCount >= 2);
      const maxGap = pillarComparable.length
        ? Math.max(...pillarComparable.map((item) => item.gap))
        : 0;
      const highGap = pillarComparable.filter((item) => item.gap >= 2).length;
      const closeGap = pillarComparable.filter((item) => item.gap > 0 && item.gap <= 1).length;
      const unknownCount = pillarQuestions.reduce((total, item) => total + item.unknownCount, 0);

      return {
        id: pillar.id,
        label: pillar.labels[language],
        shortLabel: pillar.shortLabels[language],
        questions: pillarQuestions,
        stats: {
          comparable: pillarComparable.length,
          maxGap,
          highGap,
          closeGap,
          unknownCount
        }
      };
    })
  };
}

function buildComparisonNarrative(inputComparison, visualCopy) {
  const comparable = inputComparison.stats.comparable;
  const far = inputComparison.stats.far;
  const topDifference = inputComparison.pillars
    .filter((pillar) => pillar.stats.maxGap > 0)
    .sort((a, b) => b.stats.maxGap - a.stats.maxGap)[0];
  const topAgreement = inputComparison.pillars
    .filter((pillar) => pillar.stats.comparable > 0)
    .sort((a, b) => a.stats.maxGap - b.stats.maxGap)[0];
  const unknownTotal = inputComparison.questions.reduce((total, question) => total + question.unknownCount, 0);
  const items = [
    {
      id: "overall",
      label: visualCopy.overallPatternLabel,
      title: visualCopy.overallPatternTitle,
      body: visualCopy.overallPatternBody(far, comparable),
      badge: `${far} / ${comparable}`,
      className: "bg-copper/10 text-[#8A4F2F]"
    }
  ];

  if (topDifference) {
    items.push({
      id: "difference",
      label: visualCopy.strongestDifferenceLabel,
      title: visualCopy.strongestDifferenceTitle(topDifference.label),
      body: visualCopy.strongestDifferenceBody(topDifference.stats.maxGap),
      detail: topDifference.questions
        .filter((question) => question.numericCount >= 2)
        .sort((a, b) => b.gap - a.gap)[0]?.text,
      badge: `${topDifference.stats.maxGap}`,
      className: "bg-[#A64B3C]/10 text-[#76362D]"
    });
  }

  if (topAgreement) {
    items.push({
      id: "agreement",
      label: visualCopy.strongestAgreementLabel,
      title: visualCopy.strongestAgreementTitle(topAgreement.label),
      body: visualCopy.strongestAgreementBody(topAgreement.stats.maxGap),
      detail: topAgreement.questions
        .filter((question) => question.numericCount >= 2)
        .sort((a, b) => a.gap - b.gap)[0]?.text,
      badge: `${topAgreement.stats.maxGap}`,
      className: "bg-forest/8 text-forest"
    });
  }

  if (unknownTotal > 0) {
    items.push({
      id: "transparency",
      label: visualCopy.transparencyPatternLabel,
      title: visualCopy.transparencyPatternTitle,
      body: visualCopy.transparencyPatternBody(unknownTotal),
      badge: `${unknownTotal}`,
      className: "bg-copper/10 text-[#8A4F2F]"
    });
  }

  return items;
}

function getInputGapBand(gap, visualCopy) {
  if (gap === 0) {
    return {
      label: visualCopy.same,
      className: "bg-forest/8 text-forest"
    };
  }

  if (gap <= 1) {
    return {
      label: visualCopy.close,
      className: "bg-copper/10 text-[#8A4F2F]"
    };
  }

  return {
    label: visualCopy.far,
    className: "bg-[#A64B3C]/10 text-[#76362D]"
  };
}

function buildComparisonRows(participants, language) {
  return PILLARS.map((pillar) => {
    const scores = participants.map((participant) => {
      const item = participant.result.pillarScores.find((score) => score.id === pillar.id);
      return {
        participant,
        score: item?.scored > 0 ? roundedScore(item.score) : null,
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

function PillarBreakdownCard({ breakdown, copy, detailCopy }) {
  const scoreLabel =
    breakdown.score === null ? copy.noScore : `${breakdown.score} / 100`;

  return (
    <article className="rounded-lg border border-forest/10 bg-parchment/35 p-4 sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">
            {detailCopy.scoreLabel}: {scoreLabel}
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-forest">
            {breakdown.label}
          </h3>
          <p className="mt-2 text-sm leading-6 text-ink/66">{breakdown.description}</p>
        </div>
        <span
          className={`w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${pillarBandClasses(
            breakdown.band.id
          )}`}
        >
          {breakdown.band.label}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-forest">{breakdown.band.summary}</p>
          <p className="text-sm font-bold text-muted">{scoreLabel}</p>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-forest/9">
          <div
            className={`h-full rounded-full ${
              breakdown.score === null ? "bg-forest/18" : pillarBarColor(breakdown.score)
            }`}
            style={{ width: breakdown.score === null ? "100%" : `${breakdown.rawScore}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ReportBlock title={detailCopy.whatItMeans} body={breakdown.whatItMeans} />
        <ReportListBlock title={detailCopy.familyActions} items={breakdown.familyActions} />
        <ReportBlock title={detailCopy.executionRisk} body={breakdown.executionRisk} />
        <ReportBlock title={detailCopy.gilbertRole} body={breakdown.gilbertHelp} />
      </div>
    </article>
  );
}

function ReportBlock({ title, body }) {
  return (
    <div className="rounded-lg border border-forest/8 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-copper">{title}</p>
      <p className="mt-2 text-sm leading-6 text-ink/72">{body}</p>
    </div>
  );
}

function ReportListBlock({ title, items }) {
  return (
    <div className="rounded-lg border border-forest/8 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-copper">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-ink/72">
            <Check className="mt-1 shrink-0 text-copper" aria-hidden="true" size={15} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getResultDetailCopy(language) {
  return RESULT_DETAIL_COPY[language] ?? RESULT_DETAIL_COPY.en;
}

function getFinalActionCopy(language) {
  if (language === "es") {
    return {
      title: "Guardar y continuar",
      body:
        "Al continuar, guardaremos el diagnóstico y enviaremos el resumen al email que registraste. También podrás seguir explorando los temas clave en esta página.",
      continue: "Enviarme el reporte resumen",
      saving: "Guardando...",
      saved: "Diagnóstico guardado",
      inviteTitle: "Invita a otro familiar antes de continuar",
      inviteBody:
        "La comparación funciona mejor cuando otra persona de la familia completa el diagnóstico con la misma liga.",
      inviteFirst: "Invitar primero",
      continueAnyway: "Continuar sin invitar",
      inviteLinkLabel: "Crear liga de invitación",
      inviteLinkTitle: "Crea una liga para compartir",
      inviteLinkBody:
        "Por ahora, genera una liga privada y compártela manualmente con la persona que quieres invitar.",
      createInviteLink: "Crear liga de invitación",
      creatingInviteLink: "Creando liga...",
      inviteLinkError: "No se pudo crear la liga de invitación. Inténtalo de nuevo.",
      error: "No se pudo guardar el diagnóstico. Revisa la configuración de Airtable en Vercel e inténtalo de nuevo.",
      close: "Cerrar",
      done: "Listo"
    };
  }

  return {
    title: "Save and continue",
    body:
      "When you continue, we will save this assessment and send the summary report to the email you provided. You can still explore the key topics on this page.",
    continue: "Send me the summary report",
    saving: "Saving...",
    saved: "Assessment saved",
    inviteTitle: "Invite another family member before continuing",
    inviteBody:
      "The comparison is most useful when another family member completes the assessment from the same link.",
    inviteFirst: "Invite first",
    continueAnyway: "Continue without inviting",
    inviteLinkLabel: "Create invitation link",
    inviteLinkTitle: "Create a link to share",
    inviteLinkBody:
      "For now, generate a private invitation link and share it manually with the person you want to invite.",
    createInviteLink: "Create invitation link",
    creatingInviteLink: "Creating link...",
    inviteLinkError: "We could not create the invitation link. Please try again.",
    error: "We could not save the assessment. Check the Airtable settings in Vercel and try again.",
    close: "Close",
    done: "Done"
  };
}

function getPillarBand(item, language) {
  const detailCopy = getResultDetailCopy(language);
  if (!item || item.scored === 0) {
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
    const score = item?.scored > 0 ? roundedScore(item.score) : null;
    const pillarGuidance = guidance[pillar.id] ?? PILLAR_GUIDANCE.en[pillar.id];

    return {
      id: pillar.id,
      label: pillar.labels[language],
      shortLabel: pillar.shortLabels[language],
      description: pillar.descriptions[language],
      score,
      rawScore: item?.score ?? 0,
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
      overall: resultPackage.result.overall,
      stageId: resultPackage.result.stage.id,
      pillarScores: resultPackage.result.pillarScores,
      transparency: resultPackage.result.transparency
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.persistence !== "airtable") {
    throw new Error(data.error || "Unable to save assessment result");
  }

  return data;
}

async function downloadPdfSummary(resultPackage, language) {
  const { jsPDF } = await import("jspdf");
  const copy = COPY[language];
  const { result } = resultPackage;
  const detailCopy = getResultDetailCopy(language);
  const breakdowns = buildPillarBreakdowns(result, language);
  const priorityBreakdowns = getPriorityBreakdowns(breakdowns);
  const strongBreakdowns = getStrongBreakdowns(breakdowns);
  const unknownCount = result.transparency?.unknownCount ?? 0;
  const unknownPillars = (result.transparency?.unknownByPillar ?? [])
    .filter((item) => item.unknown > 0)
    .sort((a, b) => b.unknown - a.unknown)
    .slice(0, 4)
    .map((item) => ({
      ...item,
      pillar: PILLARS.find((pillar) => pillar.id === item.id)
    }))
    .filter((item) => item.pillar);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = width - margin * 2;
  const forest = [6, 53, 45];
  const copper = [196, 113, 58];
  const muted = [91, 96, 86];
  const ink = [38, 42, 38];
  const parchment = [244, 239, 230];
  let y = 54;

  const ensureSpace = (needed = 48) => {
    if (y + needed > height - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addWrapped = (
    text,
    size = 10.5,
    weight = "normal",
    color = ink,
    maxWidth = contentWidth,
    x = margin,
    lineGap = 5
  ) => {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxWidth);
    ensureSpace(lines.length * (size + lineGap));
    doc.text(lines, x, y);
    y += lines.length * (size + lineGap);
  };

  const addSectionTitle = (title, intro) => {
    ensureSpace(76);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...forest);
    doc.text(title, margin, y);
    y += 18;
    doc.setDrawColor(...copper);
    doc.setLineWidth(1.2);
    doc.line(margin, y, margin + 68, y);
    y += 18;
    if (intro) {
      addWrapped(intro, 10.5, "normal", muted);
      y += 6;
    }
  };

  const addBullet = (text, x = margin, maxWidth = contentWidth) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...ink);
    const lines = doc.splitTextToSize(text, maxWidth - 14);
    ensureSpace(lines.length * 15 + 4);
    doc.text("-", x, y);
    doc.text(lines, x + 14, y);
    y += lines.length * 15 + 4;
  };

  const addBar = (label, score, bandLabel) => {
    ensureSpace(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...forest);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);
    doc.text(score === null ? copy.noScore : `${score} / 100`, width - margin - 70, y);
    y += 9;
    doc.setFillColor(224, 231, 226);
    doc.roundedRect(margin, y, contentWidth, 6, 3, 3, "F");
    if (score !== null) {
      doc.setFillColor(score < 65 ? 196 : 28, score < 65 ? 113 : 61, score < 65 ? 58 : 46);
      doc.roundedRect(margin, y, (contentWidth * score) / 100, 6, 3, 3, "F");
    }
    y += 17;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    doc.text(bandLabel, margin, y);
    y += 11;
  };

  const addBookingCta = () => {
    const panelHeight = 128;
    ensureSpace(panelHeight + 12);
    doc.setFillColor(...forest);
    doc.roundedRect(margin, y, contentWidth, panelHeight, 10, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(detailCopy.bookingCtaTitle, margin + 24, y + 32);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(233, 229, 218);
    const bodyLines = doc.splitTextToSize(detailCopy.bookingCtaBody, contentWidth - 48);
    doc.text(bodyLines, margin + 24, y + 54);

    const buttonY = y + 92;
    doc.setFillColor(...copper);
    doc.roundedRect(margin + 24, buttonY, 172, 28, 5, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text(detailCopy.bookingCtaButton, margin + 36, buttonY + 18);

    y += panelHeight + 12;
  };

  doc.setFillColor(...forest);
  doc.rect(0, 0, width, 142, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(detailCopy.pdfTitle, margin, y);
  y += 25;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const subtitle = doc.splitTextToSize(detailCopy.pdfSubtitle, contentWidth * 0.82);
  doc.text(subtitle, margin, y);

  y = 178;
  doc.setFillColor(...parchment);
  doc.roundedRect(margin, y - 22, contentWidth, 92, 8, 8, "F");
  doc.setTextColor(...forest);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.text(`${roundedScore(result.overall)}`, margin + 22, y + 20);
  doc.setFontSize(12);
  doc.text("/ 100", margin + 76, y + 20);
  doc.setFontSize(13);
  doc.text(`${result.stage.level[language]} - ${result.stage.labels[language]}`, margin + 150, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...muted);
  const stageLines = doc.splitTextToSize(result.stage.descriptions[language], contentWidth - 172);
  doc.text(stageLines, margin + 150, y + 20);
  y += 96;

  addSectionTitle(detailCopy.stageReflection);
  addWrapped(result.stage.reflections[language], 11, "normal", ink);
  y += 14;

  addSectionTitle(detailCopy.priorityAreas);
  if (priorityBreakdowns.length > 0) {
    priorityBreakdowns.forEach((item) => {
      addBullet(`${item.label}: ${item.score} / 100 - ${item.band.summary}`);
    });
  } else {
    addWrapped(detailCopy.noPriority, 10.5, "normal", ink);
  }
  if (strongBreakdowns.length > 0) {
    y += 8;
    addWrapped(detailCopy.strongestAreas, 11, "bold", forest);
    strongBreakdowns.forEach((item) => {
      addBullet(`${item.label}: ${item.score} / 100 - ${item.band.label}`);
    });
  }
  y += 12;

  addSectionTitle(copy.pillarScores, detailCopy.breakdownIntro);
  breakdowns.forEach((item) => {
    addBar(item.label, item.score, item.band.label);
  });
  y += 12;

  addSectionTitle(detailCopy.breakdownTitle);
  breakdowns.forEach((item) => {
    ensureSpace(168);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(218, 211, 198);
    doc.roundedRect(margin, y - 8, contentWidth, 22, 5, 5, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...forest);
    doc.text(item.label, margin + 10, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text(
      item.score === null ? copy.noScore : `${item.score} / 100 - ${item.band.label}`,
      width - margin - 130,
      y + 7
    );
    y += 32;

    addWrapped(detailCopy.whatItMeans, 10, "bold", copper);
    addWrapped(item.whatItMeans, 9.5, "normal", ink);
    y += 4;

    addWrapped(detailCopy.familyActions, 10, "bold", copper);
    item.familyActions.forEach((action) => addBullet(action));
    y += 4;

    addWrapped(detailCopy.executionRisk, 10, "bold", copper);
    addWrapped(item.executionRisk, 9.5, "normal", ink);
    y += 4;

    addWrapped(detailCopy.gilbertRole, 10, "bold", copper);
    addWrapped(item.gilbertHelp, 9.5, "normal", ink);
    y += 16;
  });

  addSectionTitle(copy.whatCanDo);
  result.stage.whatCanDo[language].forEach((item) => addBullet(item));
  y += 10;

  addSectionTitle(detailCopy.problemSolutionTitle);
  detailCopy.problemSolutionSteps.forEach((item) => addBullet(item));
  y += 8;

  addSectionTitle(copy.consultantSupport);
  addWrapped(SUPPORT_MESSAGE[language], 11, "normal", ink);
  addWrapped(detailCopy.implementationGapBody, 10.5, "normal", ink);

  if (unknownCount > 0) {
    y += 12;
    addSectionTitle(detailCopy.transparencyTitle);
    addWrapped(`${detailCopy.unknownResponses}: ${unknownCount}`, 11, "bold", forest);
    if (unknownPillars.length > 0) {
      addWrapped(detailCopy.topAffectedPillars, 10, "bold", copper);
      unknownPillars.forEach((item) => {
        addBullet(`${item.pillar.labels[language]}: ${item.unknown}`);
      });
    }
  }

  y += 14;
  addWrapped(detailCopy.reportNote, 9.5, "normal", muted);
  y += 12;
  addBookingCta();

  const date = new Date().toISOString().slice(0, 10);
  doc.save(`family-business-maturity-diagnostic-report-${date}.pdf`);
}
