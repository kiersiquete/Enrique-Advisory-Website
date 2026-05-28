import { COPY, STAGES, SUPPORT_MESSAGE } from "../data/assessment.js";

export function buildFollowUpMessage({
  language = "en",
  stageId = "emerging",
  familyName = "",
  channel = "whatsapp"
}) {
  const copy = COPY[language] ?? COPY.en;
  const stage = STAGES.find((item) => item.id === stageId) ?? STAGES[1];
  const name = familyName.trim();
  const stageLabel = `${stage.level[language]} - ${stage.labels[language]}`;
  const bullets = stage.whatCanDo[language].map((item) => `- ${item}`).join("\n");

  const greeting =
    language === "es"
      ? name
        ? `Hola ${name},`
        : "Hola,"
      : name
        ? `Hello ${name},`
        : "Hello,";

  const closing =
    language === "es"
      ? "Quedo atento para conversar estos temas con calma."
      : "Happy to explore these themes together with care.";

  const message =
    `${greeting}\n\n` +
    `${copy.maturityStage}: ${stageLabel}\n\n` +
    `${copy.reflection}\n${stage.reflections[language]}\n\n` +
    `${copy.whatCanDo}\n${bullets}\n\n` +
    `${copy.consultantSupport}\n${SUPPORT_MESSAGE[language]}\n\n` +
    `${closing}`;

  if (channel === "email") {
    const subject =
      language === "es"
        ? `Reflexión de madurez familiar - ${stage.labels[language]}`
        : `Family maturity reflection - ${stage.labels[language]}`;
    return `${subject}\n\n${message}`;
  }

  return message;
}
