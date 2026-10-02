/**
 * STEP 3-B problems 1·2 — zodiac Gate + dual-zodiac preservation.
 * Minimal contract checks only; existing suites left unchanged.
 */

import {
  assessConsultingClarificationNeed,
} from "../../consulting/consultingClarificationNeedAssessment.js";
import type {
  DecisionResult,
} from "../../consulting/decision/decisionTypes.js";
import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  buildQuestionContext,
} from "../../consulting/question/questionContextBuilder.js";
import {
  readQuestion,
} from "../../consulting/question/questionReader.js";
import type {
  QuestionContext,
} from "../../consulting/question/questionContext.js";
import {
  adaptQuestionMeaning,
} from "../adapters/questionMeaningAdapter.js";

export type Step3BZodiacGateVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type Step3BZodiacGateVerificationResult = {
  passed: boolean;
  cases: Step3BZodiacGateVerificationCase[];
};

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

function verifyCase1ZodiacOnlyNoBirthGate(): Step3BZodiacGateVerificationCase {
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

  const checks = [
    question.analysisScope === "zodiac",
    clarification.blockingNeeds.length === 0,
    !requiredKeys.includes("counterpartBirthDate"),
    !requiredKeys.includes("counterpartCalendarType"),
    !requiredKeys.includes("counterpartGender"),
  ];

  return {
    id: "case-1-zodiac-only-no-birth-gate",
    passed: checks.every(Boolean),
    details: [
      `analysisScope=${question.analysisScope}`,
      `clarificationNeeds=${clarification.blockingNeeds.map((need) => need.key).join(",") || "none"}`,
      `requiredMissing=${requiredKeys.join(",") || "none"}`,
    ],
  };
}

function verifyCase2DualZodiacCompact(): Step3BZodiacGateVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "호랑이띠·닭띠 띠궁합은 어떨까요?",
  });
  const question = regressionInput.question;
  const evidence = question.counterpartFacts.evidence;

  const checks = [
    question.analysisScope === "zodiac",
    evidence.includes("호랑이띠"),
    evidence.includes("닭띠"),
    question.counterpartFacts.zodiac === "호랑이띠",
  ];

  return {
    id: "case-2-dual-zodiac-compact",
    passed: checks.every(Boolean),
    details: [
      `analysisScope=${question.analysisScope}`,
      `zodiac=${question.counterpartFacts.zodiac ?? "none"}`,
      `evidence=${evidence.join(",")}`,
    ],
  };
}

function verifyCase3DualZodiacCForm(): Step3BZodiacGateVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "호랑이띠 남성과 닭띠 여성의 궁합이 어떨까요?",
  });
  const question = regressionInput.question;
  const evidence = question.counterpartFacts.evidence;

  const checks = [
    question.analysisScope === "zodiac",
    evidence.includes("호랑이띠"),
    evidence.includes("닭띠"),
    question.counterpartFacts.zodiac === "호랑이띠",
  ];

  return {
    id: "case-3-dual-zodiac-c-form",
    passed: checks.every(Boolean),
    details: [
      `analysisScope=${question.analysisScope}`,
      `zodiac=${question.counterpartFacts.zodiac ?? "none"}`,
      `evidence=${evidence.join(",")}`,
    ],
  };
}

function verifyCase4GeneralCompatibilityBirthRequired(): Step3BZodiacGateVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "지금 사귀는 사람과 궁합은 어떨까요?",
  });
  const question = regressionInput.question;
  const meaning = adaptQuestionMeaning(question);
  const requiredKeys = requiredMissingKeys(meaning.missingContext);

  const checks = [
    question.analysisMode === "compatibility",
    question.analysisScope === "general",
    requiredKeys.includes("counterpartBirthDate"),
    requiredKeys.includes("counterpartCalendarType"),
    requiredKeys.includes("counterpartGender"),
  ];

  return {
    id: "case-4-general-compatibility-birth-required",
    passed: checks.every(Boolean),
    details: [
      `analysisMode=${question.analysisMode}`,
      `analysisScope=${question.analysisScope}`,
      `requiredMissing=${requiredKeys.join(",") || "none"}`,
    ],
  };
}

function verifyCase5DecisionNoCompatibilityGate(): Step3BZodiacGateVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText: "이 사람과 같이 일해도 될까요?",
  });
  const question = regressionInput.question;
  const meaning = adaptQuestionMeaning(question);
  const requiredKeys = requiredMissingKeys(meaning.missingContext);

  const checks = [
    question.analysisMode === "decision",
    !requiredKeys.includes("counterpartBirthDate"),
    !requiredKeys.includes("counterpartCalendarType"),
    !requiredKeys.includes("counterpartGender"),
    !requiredKeys.includes("counterpartZodiac"),
  ];

  return {
    id: "case-5-decision-no-compatibility-gate",
    passed: checks.every(Boolean),
    details: [
      `analysisMode=${question.analysisMode}`,
      `analysisScope=${question.analysisScope}`,
      `requiredMissing=${requiredKeys.join(",") || "none"}`,
    ],
  };
}

function verifyCase6YearOnlyNotBirthDate(): Step3BZodiacGateVerificationCase {
  const humanContext = buildDecisionEngineRegressionInput().humanContext;
  const question = readQuestion(humanContext, "1970년 음력");

  const checks = [
    question.counterpartFacts.birthDate === null,
  ];

  return {
    id: "case-6-year-only-not-birth-date",
    passed: checks.every(Boolean),
    details: [
      `birthDate=${question.counterpartFacts.birthDate ?? "null"}`,
      `calendarType=${question.counterpartFacts.calendarType ?? "null"}`,
      `evidence=${question.counterpartFacts.evidence.join(",") || "none"}`,
    ],
  };
}

export function verifyStep3BZodiacGate(): Step3BZodiacGateVerificationResult {
  const cases = [
    verifyCase1ZodiacOnlyNoBirthGate(),
    verifyCase2DualZodiacCompact(),
    verifyCase3DualZodiacCForm(),
    verifyCase4GeneralCompatibilityBirthRequired(),
    verifyCase5DecisionNoCompatibilityGate(),
    verifyCase6YearOnlyNotBirthDate(),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}
