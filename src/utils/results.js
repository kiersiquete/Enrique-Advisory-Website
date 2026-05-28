import { PILLARS, STAGES, UNKNOWN_ANSWER } from "../data/assessment.js";

export function getStage(score) {
  if (score <= 25) return STAGES[0];
  if (score <= 50) return STAGES[1];
  if (score <= 75) return STAGES[2];
  return STAGES[3];
}

export function normalizeScore(value) {
  return (Number(value) / 5) * 100;
}

export function calculateResults(questions, answers) {
  const pillarScores = PILLARS.map((pillar) => {
    const pillarQuestions = questions.filter((question) => question.pillarId === pillar.id);
    const values = pillarQuestions
      .map((question) => answers[question.id])
      .filter((value) => Number.isFinite(value));
    const unknown = pillarQuestions.filter(
      (question) => answers[question.id] === UNKNOWN_ANSWER
    ).length;

    const average =
      values.length > 0
        ? values.reduce((total, value) => total + value, 0) / values.length
        : 0;

    return {
      id: pillar.id,
      score: normalizeScore(average),
      average,
      answered: values.length + unknown,
      scored: values.length,
      unknown,
      total: pillarQuestions.length
    };
  });

  const scoredPillars = pillarScores.filter((pillar) => pillar.scored > 0);
  const overall =
    scoredPillars.length > 0
      ? scoredPillars.reduce((total, pillar) => total + pillar.score, 0) / scoredPillars.length
      : 0;
  const unknownCount = questions.filter(
    (question) => answers[question.id] === UNKNOWN_ANSWER
  ).length;

  return {
    overall,
    stage: getStage(overall),
    pillarScores,
    transparency: {
      unknownCount,
      total: questions.length,
      unknownByPillar: pillarScores.map((pillar) => ({
        id: pillar.id,
        unknown: pillar.unknown,
        total: pillar.total
      }))
    }
  };
}

export function roundedScore(score) {
  return Math.round(score);
}
