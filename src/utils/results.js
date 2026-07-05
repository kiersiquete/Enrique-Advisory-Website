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

export function minimumScoredAnswers(total) {
  return Math.ceil(Number(total || 0) / 2);
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
    const minimumScored = minimumScoredAnswers(pillarQuestions.length);

    const average =
      values.length > 0
        ? values.reduce((total, value) => total + value, 0) / values.length
        : 0;
    const numericScore = normalizeScore(average);
    const lowConfidence =
      values.length > 0 && unknown > 0 && values.length < minimumScored;
    const includedInOverall = values.length > 0 && !lowConfidence;

    return {
      id: pillar.id,
      score: lowConfidence ? null : numericScore,
      numericScore,
      average,
      answered: values.length + unknown,
      scored: values.length,
      unknown,
      total: pillarQuestions.length,
      minimumScored,
      lowConfidence,
      includedInOverall
    };
  });

  const scoredPillars = pillarScores.filter(
    (pillar) => pillar.includedInOverall && Number.isFinite(pillar.score)
  );
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
      })),
      lowConfidenceByPillar: pillarScores
        .filter((pillar) => pillar.lowConfidence)
        .map((pillar) => ({
          id: pillar.id,
          scored: pillar.scored,
          unknown: pillar.unknown,
          total: pillar.total,
          minimumScored: pillar.minimumScored
        }))
    }
  };
}

export function roundedScore(score) {
  return Math.round(score);
}
