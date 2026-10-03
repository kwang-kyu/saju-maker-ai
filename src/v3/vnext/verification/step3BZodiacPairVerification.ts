/**
 * STEP 3-B Zodiac Pair — TRUE PRODUCT GAP minimal verification.
 * Covers CASE 1/2/3 pair wiring, zodiac evidence Explanation, finalDecision,
 * and A–F regression controls without new semantic/Reader/Decision layers.
 */

import {
  assessConsultingClarificationNeed,
} from "../../consulting/consultingClarificationNeedAssessment.js";
import {
  assessCompatibility,
} from "../../consulting/decision/compatibilityAssessment.js";
import {
  buildCompatibilityEvidence,
} from "../../consulting/decision/compatibilityEvidenceBuilder.js";
import {
  runDecisionEngine,
} from "../../consulting/decision/decisionEngine.js";
import type {
  DecisionResult,
} from "../../consulting/decision/decisionTypes.js";
import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  buildDecisionExplanationEvidence,
} from "../../consulting/explanation/decisionExplanationEvidenceBuilder.js";
import {
  readDecisionResult,
} from "../../consulting/explanation/decisionResultReader.js";
import {
  buildQuestionContext,
} from "../../consulting/question/questionContextBuilder.js";
import type {
  QuestionContext,
} from "../../consulting/question/questionContext.js";
import {
  adaptQuestionMeaning,
} from "../adapters/questionMeaningAdapter.js";

export type Step3BZodiacPairVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type Step3BZodiacPairVerificationResult = {
  passed: boolean;
  cases: Step3BZodiacPairVerificationCase[];
};

const SELF_YEAR_GAN_ZHI =
  "甲午";

function createDecisionResult(
  questionContext: QuestionContext,
): DecisionResult {
  return {
    verdict: "insufficientEvidence",
    confidence: "low",
    contextAlignment: "unknown",
    actionReadiness: "unknown",
    decisionTarget: questionContext.question.decisionTarget,
    topic: questionContext.question.topic,
    intent: questionContext.question.intent,
    conclusionNature: questionContext.question.conclusionNature,
    coreDecision: "현재 정보만으로는 결론을 확정하지 않는다.",
    decisionReason: "추가 확인이 필요하다.",
    evidence: [],
    conditions: [],
    risks: [],
    conflict: {
      exists: false,
      description: "충돌이 확인되지 않았다.",
      humanContextSide: "현재 삶의 국면",
      questionSide: "질문의 선택",
    },
    recommendedDirection: "확인된 조건만으로 판단한다.",
    prohibitedDirection: "부족한 정보를 추정하지 않는다.",
    finalDecisionSentence: "지금은 추가 확인이 필요하다.",
    humanContextUsed: true,
    questionContextUsed: true,
  };
}

function requiredMissingKeys(
  missingContext: ReturnType<typeof adaptQuestionMeaning>["missingContext"],
): string[] {
  return missingContext
    .filter((item) => item.required)
    .map((item) => item.key);
}

function parseZodiacEvidenceDescription(
  description: string,
): {
  selfZodiac: string | null;
  counterpartZodiac: string | null;
  relation: string | null;
  level: string | null;
} {
  try {
    const parsed = JSON.parse(description) as {
      selfZodiac?: string | null;
      counterpartZodiac?: string | null;
      relation?: string | null;
      level?: string | null;
    };

    return {
      selfZodiac: parsed.selfZodiac ?? null,
      counterpartZodiac: parsed.counterpartZodiac ?? null,
      relation: parsed.relation ?? null,
      level: parsed.level ?? null,
    };
  } catch {
    return {
      selfZodiac: null,
      counterpartZodiac: null,
      relation: null,
      level: null,
    };
  }
}

function verifyCaseASelfYearCounterpartOneToOne(): Step3BZodiacPairVerificationCase {
  const questionText =
    "나는 호랑이띠인데 닭띠와 궁합이 어떨까요?";
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText,
  });
  const question = regressionInput.question;
  const questionContext = buildQuestionContext(question, []);
  const assessment = assessCompatibility(
    questionContext,
    SELF_YEAR_GAN_ZHI,
  );
  const zodiacAssessment = assessment.zodiacAssessment;
  const decisionResult = runDecisionEngine({
    ...regressionInput,
    selfYearGanZhi: SELF_YEAR_GAN_ZHI,
  });
  const explanation = readDecisionResult(decisionResult);
  const zodiacEvidence = buildCompatibilityEvidence(
    assessment,
    question.analysisScope,
  ).find((item) => item.key.startsWith("zodiacCompatibility-"));
  const explanationEvidence = buildDecisionExplanationEvidence({
    evidence: explanation.evidence,
    topic: explanation.topic,
    readerEffectSources: [],
  });

  const checks = [
    question.analysisScope === "zodiac",
    zodiacAssessment?.available === true,
    zodiacAssessment?.selfZodiac === "말띠",
    zodiacAssessment?.counterpartZodiac === "닭띠",
    zodiacAssessment?.selfBranch === "午",
    zodiacAssessment?.counterpartBranch === "酉",
    zodiacAssessment?.calculationBasis === "yearBranchPair",
    zodiacEvidence?.weight !== undefined
    && zodiacEvidence.weight >= 4,
    explanationEvidence.includes("yearBranchPair")
    || explanationEvidence.includes("닭띠"),
    !decisionResult.finalDecisionSentence.includes(
      "책임을 나누며 협력하고",
    ),
    explanation.engineDecisionLocked === true,
    explanation.gptMayRejudge === false,
  ];

  return {
    id: "case-a-self-year-counterpart-one-to-one",
    passed: checks.every(Boolean),
    details: [
      `analysisScope=${question.analysisScope}`,
      `self=${zodiacAssessment?.selfZodiac ?? "none"}`,
      `counterpart=${zodiacAssessment?.counterpartZodiac ?? "none"}`,
      `relation=${zodiacAssessment?.relation ?? "none"}`,
      `evidenceWeight=${zodiacEvidence?.weight ?? "none"}`,
      `finalDecision=${decisionResult.finalDecisionSentence}`,
    ],
  };
}

function verifyCaseBDualZodiacCFormPair(): Step3BZodiacPairVerificationCase {
  const questionText =
    "호랑이띠 남성과 닭띠 여성의 궁합이 어떨까요?";
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText,
  });
  const question = regressionInput.question;
  const questionContext = buildQuestionContext(question, []);
  const assessment = assessCompatibility(
    questionContext,
    SELF_YEAR_GAN_ZHI,
  );
  const zodiacAssessment = assessment.zodiacAssessment;
  const decisionResult = runDecisionEngine({
    ...regressionInput,
    selfYearGanZhi: SELF_YEAR_GAN_ZHI,
  });
  const explanation = readDecisionResult(decisionResult);
  const zodiacEvidence = decisionResult.evidence.find(
    (item) => item.key.startsWith("zodiacCompatibility-"),
  );
  const parsed = zodiacEvidence
    ? parseZodiacEvidenceDescription(zodiacEvidence.description)
    : null;

  const checks = [
    question.analysisScope === "zodiac",
    question.counterpartFacts.evidence.includes("호랑이띠"),
    question.counterpartFacts.evidence.includes("닭띠"),
    zodiacAssessment?.available === true,
    zodiacAssessment?.selfZodiac === "호랑이띠",
    zodiacAssessment?.counterpartZodiac === "닭띠",
    zodiacAssessment?.selfBranch === "寅",
    zodiacAssessment?.counterpartBranch === "酉",
    zodiacAssessment?.calculationBasis === "yearBranchPair",
    parsed?.selfZodiac === "호랑이띠",
    parsed?.counterpartZodiac === "닭띠",
    zodiacEvidence?.weight !== undefined
    && zodiacEvidence.weight >= 4,
    !decisionResult.finalDecisionSentence.includes(
      "책임을 나누며 협력하고",
    ),
    explanation.engineDecisionLocked === true,
    explanation.gptMayRejudge === false,
  ];

  return {
    id: "case-b-dual-zodiac-c-form-pair",
    passed: checks.every(Boolean),
    details: [
      `analysisScope=${question.analysisScope}`,
      `self=${zodiacAssessment?.selfZodiac ?? "none"}`,
      `counterpart=${zodiacAssessment?.counterpartZodiac ?? "none"}`,
      `relation=${zodiacAssessment?.relation ?? "none"}`,
      `finalDecision=${decisionResult.finalDecisionSentence}`,
    ],
  };
}

function verifyCaseCDualZodiacCompactPair(): Step3BZodiacPairVerificationCase {
  const questionText =
    "호랑이띠·닭띠 띠궁합은 어떨까요?";
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText,
  });
  const question = regressionInput.question;
  const questionContext = buildQuestionContext(question, []);
  const assessment = assessCompatibility(
    questionContext,
    SELF_YEAR_GAN_ZHI,
  );
  const zodiacAssessment = assessment.zodiacAssessment;
  const decisionResult = runDecisionEngine({
    ...regressionInput,
    selfYearGanZhi: SELF_YEAR_GAN_ZHI,
  });
  const explanation = readDecisionResult(decisionResult);

  const checks = [
    question.analysisScope === "zodiac",
    question.counterpartFacts.evidence.includes("호랑이띠"),
    question.counterpartFacts.evidence.includes("닭띠"),
    zodiacAssessment?.available === true,
    zodiacAssessment?.selfZodiac === "호랑이띠",
    zodiacAssessment?.counterpartZodiac === "닭띠",
    zodiacAssessment?.selfBranch === "寅",
    zodiacAssessment?.counterpartBranch === "酉",
    zodiacAssessment?.calculationBasis === "yearBranchPair",
    !decisionResult.finalDecisionSentence.includes(
      "책임을 나누며 협력하고",
    ),
    explanation.engineDecisionLocked === true,
    explanation.gptMayRejudge === false,
  ];

  return {
    id: "case-c-dual-zodiac-compact-pair",
    passed: checks.every(Boolean),
    details: [
      `analysisScope=${question.analysisScope}`,
      `self=${zodiacAssessment?.selfZodiac ?? "none"}`,
      `counterpart=${zodiacAssessment?.counterpartZodiac ?? "none"}`,
      `relation=${zodiacAssessment?.relation ?? "none"}`,
      `finalDecision=${decisionResult.finalDecisionSentence}`,
    ],
  };
}

function verifyCaseDGeneralCompatibilityBirthRequired(): Step3BZodiacPairVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "지금 사귀는 사람과 궁합은 어떨까요?",
  });
  const question = regressionInput.question;
  const meaning = adaptQuestionMeaning(question);
  const requiredKeys = requiredMissingKeys(meaning.missingContext);
  const decisionResult = runDecisionEngine(regressionInput);
  const explanation = readDecisionResult(decisionResult);

  const checks = [
    question.analysisMode === "compatibility",
    question.analysisScope === "general",
    requiredKeys.includes("counterpartBirthDate"),
    requiredKeys.includes("counterpartCalendarType"),
    requiredKeys.includes("counterpartGender"),
    decisionResult.verdict === "insufficientEvidence",
    explanation.engineDecisionLocked === true,
    explanation.gptMayRejudge === false,
  ];

  return {
    id: "case-d-general-compatibility-birth-required",
    passed: checks.every(Boolean),
    details: [
      `analysisMode=${question.analysisMode}`,
      `analysisScope=${question.analysisScope}`,
      `requiredMissing=${requiredKeys.join(",") || "none"}`,
      `verdict=${decisionResult.verdict}`,
    ],
  };
}

function verifyCaseEDecisionNoCompatibilityGate(): Step3BZodiacPairVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "이 사람과 같이 일해도 될까요?",
  });
  const question = regressionInput.question;
  const meaning = adaptQuestionMeaning(question);
  const requiredKeys = requiredMissingKeys(meaning.missingContext);
  const decisionResult = runDecisionEngine(regressionInput);
  const explanation = readDecisionResult(decisionResult);

  const checks = [
    question.analysisMode === "decision",
    !requiredKeys.includes("counterpartBirthDate"),
    !requiredKeys.includes("counterpartCalendarType"),
    !requiredKeys.includes("counterpartGender"),
    !requiredKeys.includes("counterpartZodiac"),
    decisionResult.verdict !== undefined,
    explanation.engineDecisionLocked === true,
    explanation.gptMayRejudge === false,
  ];

  return {
    id: "case-e-decision-no-compatibility-gate",
    passed: checks.every(Boolean),
    details: [
      `analysisMode=${question.analysisMode}`,
      `analysisScope=${question.analysisScope}`,
      `requiredMissing=${requiredKeys.join(",") || "none"}`,
      `verdict=${decisionResult.verdict}`,
      `finalDecision=${decisionResult.finalDecisionSentence}`,
    ],
  };
}

function verifyCaseFZodiacOnlyNoBirthGate(): Step3BZodiacPairVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "양띠 여성과 띠 궁합만 봐주세요.",
  });
  const question = regressionInput.question;
  const meaning = adaptQuestionMeaning(question);
  const questionContext = buildQuestionContext(question, []);
  const clarification = assessConsultingClarificationNeed({
    decisionResult: createDecisionResult(questionContext),
    questionContext,
    clarificationFacts: [],
  });
  const requiredKeys = requiredMissingKeys(meaning.missingContext);
  const assessment = assessCompatibility(
    questionContext,
    SELF_YEAR_GAN_ZHI,
  );
  const decisionResult = runDecisionEngine({
    ...regressionInput,
    selfYearGanZhi: SELF_YEAR_GAN_ZHI,
  });
  const explanation = readDecisionResult(decisionResult);

  const checks = [
    question.analysisScope === "zodiac",
    clarification.blockingNeeds.length === 0,
    !requiredKeys.includes("counterpartBirthDate"),
    !requiredKeys.includes("counterpartCalendarType"),
    !requiredKeys.includes("counterpartGender"),
    assessment.zodiacAssessment?.available === true,
    assessment.zodiacAssessment?.selfZodiac === "말띠",
    assessment.zodiacAssessment?.counterpartZodiac === "양띠",
    explanation.engineDecisionLocked === true,
    explanation.gptMayRejudge === false,
  ];

  return {
    id: "case-f-zodiac-only-no-birth-gate",
    passed: checks.every(Boolean),
    details: [
      `analysisScope=${question.analysisScope}`,
      `clarificationNeeds=${clarification.blockingNeeds.map((need) => need.key).join(",") || "none"}`,
      `requiredMissing=${requiredKeys.join(",") || "none"}`,
      `self=${assessment.zodiacAssessment?.selfZodiac ?? "none"}`,
      `counterpart=${assessment.zodiacAssessment?.counterpartZodiac ?? "none"}`,
    ],
  };
}

function verifySurfaceOneVsTwoSeparation(): Step3BZodiacPairVerificationCase {
  const oneSurfaceInput = buildDecisionEngineRegressionInput({
    questionText: "닭띠와 궁합이 어떨까요?",
  });
  const twoSurfaceInput = buildDecisionEngineRegressionInput({
    questionText: "호랑이띠·닭띠 띠궁합은 어떨까요?",
  });

  const oneAssessment = assessCompatibility(
    buildQuestionContext(oneSurfaceInput.question, []),
    SELF_YEAR_GAN_ZHI,
  );
  const twoAssessment = assessCompatibility(
    buildQuestionContext(twoSurfaceInput.question, []),
    SELF_YEAR_GAN_ZHI,
  );

  const checks = [
    oneSurfaceInput.question.analysisScope === "zodiac",
    twoSurfaceInput.question.analysisScope === "zodiac",
    oneAssessment.zodiacAssessment?.selfZodiac === "말띠",
    oneAssessment.zodiacAssessment?.counterpartZodiac === "닭띠",
    twoAssessment.zodiacAssessment?.selfZodiac === "호랑이띠",
    twoAssessment.zodiacAssessment?.counterpartZodiac === "닭띠",
  ];

  return {
    id: "surface-one-vs-two-separation",
    passed: checks.every(Boolean),
    details: [
      `one=${oneAssessment.zodiacAssessment?.selfZodiac ?? "none"}x${oneAssessment.zodiacAssessment?.counterpartZodiac ?? "none"}`,
      `two=${twoAssessment.zodiacAssessment?.selfZodiac ?? "none"}x${twoAssessment.zodiacAssessment?.counterpartZodiac ?? "none"}`,
    ],
  };
}

export function verifyStep3BZodiacPair(): Step3BZodiacPairVerificationResult {
  const cases = [
    verifyCaseASelfYearCounterpartOneToOne(),
    verifyCaseBDualZodiacCFormPair(),
    verifyCaseCDualZodiacCompactPair(),
    verifyCaseDGeneralCompatibilityBirthRequired(),
    verifyCaseEDecisionNoCompatibilityGate(),
    verifyCaseFZodiacOnlyNoBirthGate(),
    verifySurfaceOneVsTwoSeparation(),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}
