import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Linkedin,
  Mail,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { FULL_QUESTIONS, PILLARS } from "../data/assessment.js";
import { WEBSITE_COPY } from "../data/website.js";
import "../website.css";

const pagePaths = {
  home: "/",
  about: "/about",
  services: "/services",
  "assessment-home": "/diagnostic",
};
const experienceValues = ["15+", "12+", "8+", "6+", "5+", "1"];
const credentials = [
  { logo: "ffi", name: "Family Firm Institute" },
  { logo: "imd", name: "IMD Business School" },
  { logo: "denver", name: "University of Denver" },
  { logo: "icf", name: "International Coaching Federation" },
  { logo: "ipec", name: "Institute for Professional Excellence in Coaching" },
  { logo: "denver", name: "University of Denver" },
];

function PageLink({ screen, language, onNavigate, children, ...props }) {
  const href =
    screen === "home"
      ? language === "es"
        ? "/spanish"
        : "/english"
      : `${pagePaths[screen]}?lang=${language}`;
  return (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        onNavigate(screen);
      }}
    >
      {children}
    </a>
  );
}

function Brand({ copy, language, onNavigate, light = false }) {
  return (
    <PageLink
      className="site-brand"
      screen="home"
      language={language}
      onNavigate={onNavigate}
      aria-label={copy.brandName}
    >
      <img
        src={`/brand/wordmark${light ? "-white" : ""}.webp`}
        width="632"
        height="311"
        alt="Gilbert Devlyn"
      />
      <span>{copy.brandLine}</span>
    </PageLink>
  );
}

export function SiteHeader({
  copy,
  language,
  setLanguage,
  activeScreen,
  onNavigate,
}) {
  const text = WEBSITE_COPY[language];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const headerRef = useRef(null);
  const assessmentActive = [
    "assessment",
    "assessment-home",
    "results",
    "comparison",
    "invite-share",
  ].includes(activeScreen);
  useEffect(() => {
    setMenuOpen(false);
  }, [activeScreen, language]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const onPointer = (event) => {
      if (!headerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen]);
  const navigation = (mobile = false) => (
    <nav
      id={mobile ? "mobile-navigation" : undefined}
      className={mobile ? "mobile-navigation" : "desktop-navigation"}
      aria-label={text.navigation}
    >
      {["home", "about", "services"].map((screen) => (
        <PageLink
          key={screen}
          screen={screen}
          language={language}
          onNavigate={(next) => {
            setMenuOpen(false);
            onNavigate(next);
          }}
          aria-current={activeScreen === screen ? "page" : undefined}
        >
          {copy.nav[screen]}
        </PageLink>
      ))}
      <PageLink
        className={mobile ? "site-button" : undefined}
        screen="assessment-home"
        language={language}
        aria-current={assessmentActive ? "page" : undefined}
        onNavigate={(next) => {
          setMenuOpen(false);
          onNavigate(next);
        }}
      >
        {copy.nav.assessment}
        {mobile && <ArrowRight size={16} aria-hidden="true" />}
      </PageLink>
    </nav>
  );
  return (
    <header className="website site-header" ref={headerRef}>
      <div className="site-header-inner">
        <Brand copy={copy} language={language} onNavigate={onNavigate} />
        {navigation()}
        <div className="site-header-actions">
          <div
            className="site-language"
            role="group"
            aria-label={language === "es" ? "Idioma" : "Language"}
          >
            {["en", "es"].map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={language === value}
                disabled={activeScreen === "assessment"}
                onClick={() => setLanguage(value)}
              >
                {value.toUpperCase()}
              </button>
            ))}
          </div>
          <PageLink
            screen="assessment-home"
            language={language}
            onNavigate={onNavigate}
            className={`site-button header-assessment ${assessmentActive ? "" : "site-button-teal"}`}
          >
            {text.start}
          </PageLink>
          <button
            className="site-menu-toggle"
            type="button"
            ref={menuButton}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? text.closeMenu : text.menu}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
      {menuOpen && navigation(true)}
    </header>
  );
}

function Actions({ copy, language, onNavigate, onStart, single = false }) {
  const text = WEBSITE_COPY[language];
  return (
    <div className="site-action-block">
      <div className="site-actions">
        {onStart ? (
          <button
            type="button"
            data-assessment-start
            className="site-button"
            onClick={() => onStart("full")}
          >
            {text.begin}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : (
          <PageLink
            screen="assessment-home"
            language={language}
            onNavigate={onNavigate}
            className="site-button"
          >
            {single ? text.begin : text.assess}
            <ArrowRight size={18} aria-hidden="true" />
          </PageLink>
        )}
        {!single && (
          <a
            className="site-button site-button-outline"
            href={`mailto:${copy.contactEmail}`}
          >
            {text.talk}
          </a>
        )}
      </div>
      <p className="site-confidential">
        <ShieldCheck size={14} aria-hidden="true" />
        {text.confidential}
      </p>
    </div>
  );
}

function Experience({ language, about = false }) {
  const text = WEBSITE_COPY[language];
  return (
    <section className="site-band experience-band">
      <div className="site-container">
        <p className="site-eyebrow centered">{text.experienceLabel}</p>
        <div
          className={
            about
              ? "experience-heading centered"
              : "experience-heading site-two-column"
          }
        >
          <h2>{about ? text.experienceAbout : text.experienceTitle}</h2>
          {!about && <p>{text.experienceBody}</p>}
        </div>
        <div className="experience-grid">
          {experienceValues.map((value, index) => (
            <div className="experience-stat" key={value}>
              <p className="experience-value">
                {value} {index === 5 ? text.year : text.years}
              </p>
              <p>{text.experience[index]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Credentials({ language, expanded = false }) {
  const text = WEBSITE_COPY[language];
  return (
    <section className="site-band credential-band">
      <div className="site-container">
        <p className="site-eyebrow centered">
          {expanded ? text.educationLabel : text.credentialsLabel}
        </p>
        <div
          className={`credential-grid ${expanded ? "credential-grid-expanded" : ""}`}
        >
          {(expanded ? [2, 0, 1, 3, 4, 5] : [0, 1, 2, 3]).map((index) => (
            <div className="credential" key={index}>
              <div className="credential-logo">
                <img
                  src={`/brand/${credentials[index].logo}.webp`}
                  alt=""
                  loading="lazy"
                />
              </div>
              <h3>{credentials[index].name}</h3>
              <p>{text.qualifications[index]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FocusAreas({ copy, language, about = false }) {
  const text = WEBSITE_COPY[language];
  return (
    <section
      className={`site-band focus-band ${about ? "site-blue-band" : ""}`}
    >
      <div className="site-container">
        <header className="site-section-heading centered">
          <p className="site-eyebrow">{text.focusLabel}</p>
          <h2>{about ? text.focusAbout : text.focusTitle}</h2>
          {!about && <p className="focus-intro">{text.focusIntro}</p>}
        </header>
        <div className="focus-grid">
          {copy.home.challengeItems.map((item, index) => (
            <article className="site-item focus-item" key={item.title}>
              <img
                className="focus-icon"
                src={`/brand/focus-${index + 1}.webp`}
                alt=""
                width="64"
                height="64"
                loading="lazy"
              />
              <h3>{text.focusTitles[index]}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AssessmentSteps({ language }) {
  const text = WEBSITE_COPY[language];
  return (
    <div className="assessment-steps">
      <h3>{text.how}</h3>
      <ol>
        {text.steps.map((step, index) => (
          <li key={step.title}>
            <span className="step-number" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h4>{step.title}</h4>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function HomePage({ copy, language, onNavigate }) {
  const text = WEBSITE_COPY[language];
  return (
    <div className="website">
      <section className="site-hero home-hero">
        <div className="site-container home-hero-grid">
          <div className="hero-copy">
            <p className="site-eyebrow">{text.heroLabel}</p>
            <h1>{copy.home.title}</h1>
            <p className="hero-description">{copy.home.subtitle}</p>
            <Actions copy={copy} language={language} onNavigate={onNavigate} />
          </div>
          <img
            className="home-portrait"
            src="/brand/portrait-home.webp"
            width="1000"
            height="1123"
            alt={text.portraitAlt}
            fetchPriority="high"
          />
        </div>
      </section>
      <Experience language={language} />
      <Credentials language={language} />
      <FocusAreas copy={copy} language={language} />
      <section className="site-band site-blue-band">
        <div className="site-container home-assessment-grid">
          <div>
            <p className="site-eyebrow">{text.assessmentLabel}</p>
            <h2>{text.assessmentTitle}</h2>
            <p className="section-description">{text.assessmentBody}</p>
            <AssessmentSteps language={language} />
            <Actions
              copy={copy}
              language={language}
              onNavigate={onNavigate}
              single
            />
          </div>
          <img
            className="assessment-photo"
            src="/brand/advisory-meeting-vlada-karpovich-7433856.jpg"
            alt={text.assessmentImageAlt}
            width="1125"
            height="750"
            loading="lazy"
          />
        </div>
      </section>
      <section className="site-band">
        <div className="site-container services-preview">
          <div className="services-preview-intro">
            <p className="site-eyebrow">{text.servicesLabel}</p>
            <h2>{text.servicesTitle}</h2>
            <img
              src="/family-advisory-conversation.jpg"
              alt={text.advisoryImageAlt}
              width="600"
              height="760"
              loading="lazy"
            />
          </div>
          <div>
            <p className="services-preview-description">{text.servicesIntro}</p>
            <div className="services-preview-grid">
              {copy.services.items.map((service, index) => (
                <article className="site-item" key={service.title}>
                  <h3>{text.servicePreviewTitles[index]}</h3>
                  <p>{service.previewSummary ?? service.summary}</p>
                </article>
              ))}
            </div>
            <PageLink
              screen="services"
              language={language}
              onNavigate={onNavigate}
              className="site-button site-button-outline services-link"
            >
              {text.learn}
              <ArrowRight size={17} aria-hidden="true" />
            </PageLink>
          </div>
        </div>
      </section>
    </div>
  );
}

export function AboutPage({ copy, language, onNavigate }) {
  const text = WEBSITE_COPY[language];
  return (
    <div className="website">
      <section className="site-hero about-hero">
        <div className="site-container about-hero-grid">
          <img
            className="about-portrait"
            src="/brand/portrait-about.webp"
            width="885"
            height="1300"
            alt={text.portraitAlt}
            fetchPriority="high"
          />
          <div>
            <p className="site-eyebrow">{text.aboutLabel}</p>
            <h1>{text.aboutTitle}</h1>
            <div className="about-bio">
              {text.aboutBio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="site-band">
        <div className="site-container about-context-grid">
          <div>
            <p className="site-eyebrow">{copy.about.contextLabel}</p>
            <h2>{text.aboutContextTitle}</h2>
            <p className="section-description">{copy.about.contextBody}</p>
          </div>
          <div className="about-context-items">
            {copy.about.contextItems.map((item) => (
              <article className="site-item" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Experience language={language} about />
      <Credentials language={language} expanded />
      <FocusAreas copy={copy} language={language} about />
      <section className="site-band">
        <div className="site-container site-two-column about-assessment">
          <div>
            <p className="site-eyebrow">{text.assessmentLabel}</p>
            <h2>{text.aboutAssessmentTitle}</h2>
            <p className="section-description">
              {copy.about.testimonialsSubtitle}
            </p>
            <h3>{text.situations}</h3>
            <ul className="site-check-list">
              {copy.about.situations.map((item) => (
                <li key={item}>
                  <Check size={18} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <AssessmentSteps language={language} />
            <Actions copy={copy} language={language} onNavigate={onNavigate} />
          </div>
        </div>
      </section>
    </div>
  );
}

export function ServicesPage({ copy, language, onNavigate }) {
  const text = WEBSITE_COPY[language];
  return (
    <div className="website">
      <section className="site-hero text-hero">
        <div className="site-container">
          <p className="site-eyebrow">{text.serviceHeroLabel}</p>
          <h1>{text.serviceHeroTitle}</h1>
          <p className="hero-description">{copy.services.intro}</p>
          <Actions copy={copy} language={language} onNavigate={onNavigate} />
        </div>
      </section>
      <div className="site-container service-details">
        {copy.services.items.map((service, index) => (
          <section
            className={`service-detail ${index % 2 ? "service-detail-reverse" : ""}`}
            key={service.title}
          >
            <div className="service-summary">
              <img
                src={`/brand/service-${index + 1}.webp`}
                alt=""
                width="190"
                height="150"
                loading="lazy"
              />
              <h2>{text.serviceTitles[index]}</h2>
              <p>{service.summary}</p>
            </div>
            <div className="service-facts">
              {[
                [copy.services.forLabel, service.forWhom],
                [copy.services.helpsLabel, service.helpsWith],
                [copy.services.outcomeLabel, service.outcome],
              ].map(([label, body]) => (
                <article className="site-item" key={label}>
                  <h3>{label}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className="site-band site-blue-band centered">
        <div className="site-container callout">
          <p className="site-eyebrow">{text.assessmentLabel}</p>
          <h2>{copy.services.ctaTitle}</h2>
          <p>{copy.services.ctaBody}</p>
          <Actions copy={copy} language={language} onNavigate={onNavigate} />
        </div>
      </section>
    </div>
  );
}

export function AssessmentLanding({ copy, language, onStart }) {
  const text = WEBSITE_COPY[language];
  return (
    <div className="website">
      <section className="site-hero text-hero assessment-hero">
        <div className="site-container">
          <p className="site-eyebrow">{text.landingLabel}</p>
          <h1>
            {text.landingTitleLead}
            <span>{text.landingTitle}</span>
          </h1>
          <p className="hero-description">
            {text.landingBody} <strong>{text.landingCaveat}</strong>
          </p>
          <Actions copy={copy} language={language} onStart={onStart} single />
        </div>
      </section>
      <section className="assessment-facts">
        <div className="site-container">
          {[
            [FULL_QUESTIONS[language].length, text.questionCount],
            [PILLARS.length, text.areaCount],
            ["~10", text.minutes],
          ].map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="site-band">
        <div className="site-container assessment-introduction">
          <div>
            <p className="site-eyebrow">{text.privacyLabel}</p>
            <h2>{text.privacyTitle}</h2>
            <p className="section-description">{text.privacyBody}</p>
            <p className="section-description">
              <strong>{text.privacyAssurance}</strong>
            </p>
            <h3>{text.whyTitle}</h3>
            <p>{text.whyBody}</p>
          </div>
          <div>
            <h2>{text.journeyTitle}</h2>
            <ol className="assessment-journey">
              {text.journey.map((step, index) => (
                <li className="site-item" key={step.title}>
                  <h3>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {step.title}
                  </h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
            <Actions copy={copy} language={language} onStart={onStart} single />
          </div>
        </div>
      </section>
      <section className="site-band site-blue-band">
        <div className="site-container assessment-contact">
          <div>
            <p className="site-eyebrow">{text.unsureLabel}</p>
            <h2>{text.unsureTitle}</h2>
            <p className="section-description">{text.unsureBody}</p>
          </div>
          <a
            href={`mailto:${copy.contactEmail}`}
            className="site-button site-button-outline"
          >
            {text.talk}
          </a>
        </div>
      </section>
    </div>
  );
}

export function ProfileDialog({ children, language, onClose, suspended }) {
  const dialogRef = useRef(null);
  const text = WEBSITE_COPY[language];
  function closeDialog() {
    onClose();
    requestAnimationFrame(() =>
      document
        .querySelector("[data-assessment-start]")
        ?.focus({ preventScroll: true }),
    );
  }
  useEffect(() => {
    const dialog = dialogRef.current;
    if (suspended) {
      dialog.close();
      return;
    }
    const previousFocus = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    function containTabFocus(event) {
      if (event.key !== "Tab") return;
      const focusable = [
        ...dialog.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex="0"]',
        ),
      ].filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    dialog.addEventListener("keydown", containTabFocus);
    return () => {
      dialog.removeEventListener("keydown", containTabFocus);
      dialog.close();
      document.body.style.overflow = oldOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [suspended]);
  return (
    <dialog
      className="website profile-dialog"
      ref={dialogRef}
      aria-labelledby="profile-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
    >
      <div className="profile-dialog-toolbar">
        <button
          type="button"
          className="profile-dialog-close"
          onClick={closeDialog}
          aria-label={text.close}
          title={text.close}
        >
          <X size={22} />
        </button>
      </div>
      <div className="profile-dialog-body">{children}</div>
    </dialog>
  );
}

export function SiteFooter({
  copy,
  language,
  onNavigate,
  onOpenPrivacyPolicy,
}) {
  const text = WEBSITE_COPY[language];
  return (
    <footer className="website site-footer" data-site-footer>
      <div className="site-container">
        <div className="site-footer-grid">
          <div>
            <Brand
              copy={copy}
              language={language}
              onNavigate={onNavigate}
              light
            />
            <p className="footer-tagline">{text.tagline}</p>
            <div className="footer-social">
              <a
                href={`mailto:${copy.contactEmail}`}
                aria-label="Email"
                title="Email"
              >
                <Mail size={26} />
              </a>
              <a
                href="https://www.linkedin.com/in/gilbertdevlyn/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <Linkedin size={26} />
              </a>
            </div>
          </div>
          <nav aria-label={text.navigation}>
            <h2>{text.navigation}</h2>
            {["home", "about", "services"].map((screen) => (
              <PageLink
                key={screen}
                screen={screen}
                language={language}
                onNavigate={onNavigate}
              >
                {copy.nav[screen]}
              </PageLink>
            ))}
            <a href={`mailto:${copy.contactEmail}`}>{text.contact}</a>
            <PageLink
              screen="assessment-home"
              language={language}
              onNavigate={onNavigate}
            >
              {copy.nav.assessment}
            </PageLink>
          </nav>
          <div className="footer-contact">
            <h2>{text.contact}</h2>
            <a href={`mailto:${copy.contactEmail}`}>
              <Mail size={16} aria-hidden="true" />
              {copy.contactEmail}
            </a>
            <button type="button" onClick={onOpenPrivacyPolicy}>
              {text.policy}
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{copy.footerRights}</p>
        </div>
      </div>
    </footer>
  );
}
