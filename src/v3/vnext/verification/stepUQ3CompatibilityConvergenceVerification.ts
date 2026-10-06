/**
 * STEP UQ-3 Compatibility Convergence verification.
 * Reuses Step 3-B verification structure.
 * Covers open zodiac recommendation, pair, saju, general, missing info,
 * birth-gate non-trigger, and Step 3-B expected preservation.
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
import {
  verifyStep3BZodiacGate,
} from "./step3BZodiacGateVerification.js";
import {
  verifyStep3BZodiacPair,
} from "./step3BZodiacPairVerification.js";

export type StepUQ3CompatibilityConvergenceVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type StepUQ3CompatibilityConvergenceVerificationResult = {
  passed: boolean;
  cases: StepUQ3CompatibilityConvergenceVerificationCase[];
};

const SELF_YEAR_GAN_ZHI = "甲午";

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

function hasZodiacEvidence(
  evidence: readonly { key: string }[],
): boolean {
  return evidence.some((item) =>
    item.key.startsWith("zodiacCompatibility-"),
  );
}

function parseEvidenceCandidates(
  description: string,
): unknown[] | null {
  try {
    const parsed = JSON.parse(description) as {
      candidates?: unknown[];
    };
    return Array.isArray(parsed.candidates) ? parsed.candidates : null;
  } catch {
    return null;
  }
}

function verifyOpenZodiacRecommendation(
  id: string,
  questionText: string,
  options?: {
    expectNamedAnchor?: string;
    expectSelfAnchored?: boolean;
  },
): StepUQ3CompatibilityConvergenceVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText,
  });
  const question = regressionInput.question;
  const meaning = adaptQuestionMeaning(question);
  const requiredKeys = requiredMissingKeys(meaning.missingContext);
  const questionContext = buildQuestionContext(question, []);
  const assessment = assessCompatibility(
    questionContext,
    SELF_YEAR_GAN_ZHI,
  );
  const decisionResult = runDecisionEngine({
    ...regressionInput,
    selfYearGanZhi: SELF_YEAR_GAN_ZHI,
  });
  const explanation = readDecisionResult(decisionResult);
  const zodiacEvidence = decisionResult.evidence.find((item) =>
    item.key.startsWith("zodiacCompatibility-"),
  );
  const candidates = zodiacEvidence
    ? parseEvidenceCandidates(zodiacEvidence.description)
    : null;
  const firstEvidenceKey = decisionResult.evidence[0]?.key ?? "none";

  const checks = [
    question.analysisMode === "compatibility",
    question.analysisScope === "zodiac",
    !requiredKeys.includes("counterpartBirthDate"),
    !requiredKeys.includes("counterpartCalendarType"),
    !requiredKeys.includes("counterpartGender"),
    !requiredKeys.includes("counterpartZodiac"),
    assessment.analysisScope === "zodiacCompatibility",
    assessment.zodiacAssessment?.available === true,
    Array.isArray(assessment.zodiacAssessment?.candidates)
    && (assessment.zodiacAssessment?.candidates?.length ?? 0) >= 11,
    hasZodiacEvidence(decisionResult.evidence),
    hasZodiacEvidence(
      buildCompatibilityEvidence(assessment, question.analysisScope),
    ),
    Array.isArray(candidates) && candidates.length >= 11,
    firstEvidenceKey.startsWith("zodiacCompatibility-"),
    explanation.engineDecisionLocked === true,
    explanation.gptMayRejudge === false,
    options?.expectNamedAnchor
      ? assessment.zodiacAssessment?.selfZodiac
        === options.expectNamedAnchor
      : true,
    options?.expectSelfAnchored
      ? assessment.zodiacAssessment?.selfZodiac === "말띠"
      : true,
  ];

  return {
    id,
    passed: checks.every(Boolean),
    details: [
      `analysisMode=${question.analysisMode}`,
      `analysisScope=${question.analysisScope}`,
      `assessmentScope=${assessment.analysisScope}`,
      `requiredMissing=${requiredKeys.join(",") || "none"}`,
      `self=${assessment.zodiacAssessment?.selfZodiac ?? "none"}`,
      `bestCounterpart=${assessment.zodiacAssessment?.counterpartZodiac ?? "none"}`,
      `level=${assessment.zodiacAssessment?.level ?? "none"}`,
      `verdict=${decisionResult.verdict}`,
      `candidates=${assessment.zodiacAssessment?.candidates?.length ?? 0}`,
      `firstEvidence=${firstEvidenceKey}`,
      `zodiacEvidence=${zodiacEvidence?.key ?? "none"}`,
    ],
  };
}

function verifySpecifiedOpenZodiacClass(
  id: string,
  questionText: string,
): StepUQ3CompatibilityConvergenceVerificationCase {
  const base = verifyOpenZodiacRecommendation(
    id,
    questionText,
    { expectSelfAnchored: true },
  );
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText,
  });
  const question = regressionInput.question;
  const questionContext = buildQuestionContext(question, []);
  const decisionResult = runDecisionEngine({
    ...regressionInput,
    selfYearGanZhi: SELF_YEAR_GAN_ZHI,
  });

  const extra = [
    question.decisionTarget === "none",
    question.timingType === "unknown",
    question.counterpartFacts.zodiac === null,
    questionContext.counterpart.exists === false,
    !decisionResult.coreDecision.includes(
      "질문한 선택을 받아들이는",
    ),
    !decisionResult.coreDecision.includes(
      "진행하는 쪽이 맞다",
    ),
    /띠/.test(decisionResult.coreDecision),
  ];

  return {
    id,
    passed: base.passed && extra.every(Boolean),
    details: [
      ...base.details,
      `dt=${question.decisionTarget}`,
      `timingType=${question.timingType}`,
      `counterpartExists=${questionContext.counterpart.exists}`,
      `coreDecision=${decisionResult.coreDecision}`,
    ],
  };
}

function verifyPrioritySurfaceNotZodiac(
  id: string,
  questionText: string,
): StepUQ3CompatibilityConvergenceVerificationCase {
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText,
  });
  const question = regressionInput.question;

  return {
    id,
    passed: [
      question.prioritySurface === true,
      question.analysisScope === "general",
      question.analysisScope !== "zodiac",
    ].every(Boolean),
    details: [
      `analysisMode=${question.analysisMode}`,
      `analysisScope=${question.analysisScope}`,
      `prioritySurface=${question.prioritySurface === true}`,
      `dt=${question.decisionTarget}`,
      `timingType=${question.timingType}`,
    ],
  };
}

function verifyCaseGroupAOpenZodiacRecommendation():
  StepUQ3CompatibilityConvergenceVerificationCase[] {
  return [
    verifyOpenZodiacRecommendation(
      "a1-tiger-matching-female-zodiac",
      "호랑이띠와 맞는 여성의 띠는?",
      { expectNamedAnchor: "호랑이띠" },
    ),
    verifyOpenZodiacRecommendation(
      "a2-tiger-good-compat-female-zodiac",
      "호랑이띠와 궁합이 좋은 여자 띠는?",
      { expectNamedAnchor: "호랑이띠" },
    ),
    verifyOpenZodiacRecommendation(
      "a3-self-matching-zodiac-woman",
      "나와 잘 맞는 띠의 여자는?",
      { expectSelfAnchored: true },
    ),
    verifyOpenZodiacRecommendation(
      "a4-tell-good-compat-zodiac",
      "궁합이 좋은 띠를 알려주세요.",
      { expectSelfAnchored: true },
    ),
    verifyOpenZodiacRecommendation(
      "a5-which-zodiac-woman-matches",
      "어떤 띠의 여자가 나와 잘 맞나요?",
      { expectSelfAnchored: true },
    ),
  ];
}

function verifySpecifiedEightQuestions():
  StepUQ3CompatibilityConvergenceVerificationCase[] {
  return [
    verifySpecifiedOpenZodiacClass(
      "s1-eoneu-tti-jal-mat",
      "어느 띠가 저와 잘 맞나요?",
    ),
    verifySpecifiedOpenZodiacClass(
      "s2-eotteon-tti-jal-mat",
      "어떤 띠가 저와 잘 맞나요?",
    ),
    verifySpecifiedOpenZodiacClass(
      "s3-ttiro-bomyeon-eotteon-saram",
      "띠로 보면 어떤 사람이 저와 잘 맞나요?",
    ),
    verifySpecifiedOpenZodiacClass(
      "s4-jal-matneun-tti-mueot",
      "저와 잘 맞는 띠는 무엇인가요?",
    ),
    verifySpecifiedOpenZodiacClass(
      "s5-eoneu-tti-an-mat",
      "어느 띠가 저와 안 맞나요?",
    ),
    verifySpecifiedOpenZodiacClass(
      "s6-eotteon-tti-pihaeya",
      "어떤 띠를 피해야 하나요?",
    ),
    verifyPrioritySurfaceNotZodiac(
      "s7-priority-first-look",
      "가장 먼저 무엇을 봐야 하나요?",
    ),
    verifyPrioritySurfaceNotZodiac(
      "s8-priority-what-first",
      "우선 무엇부터 해야 하나요?",
    ),
  ];
}

function verifyCaseGroupBSpecificCounterpart():
  StepUQ3CompatibilityConvergenceVerificationCase[] {
  const cases: StepUQ3CompatibilityConvergenceVerificationCase[] = [];

  {
    const questionText = "나는 무슨 띠의 여자와 궁합이 맞나요?";
    const regressionInput = buildDecisionEngineRegressionInput({
      questionText,
    });
    const question = regressionInput.question;
    const meaning = adaptQuestionMeaning(question);
    const requiredKeys = requiredMissingKeys(meaning.missingContext);
    const assessment = assessCompatibility(
      buildQuestionContext(question, []),
      SELF_YEAR_GAN_ZHI,
    );
    const decisionResult = runDecisionEngine({
      ...regressionInput,
      selfYearGanZhi: SELF_YEAR_GAN_ZHI,
    });

    cases.push({
      id: "b1-self-open-which-zodiac-woman",
      passed: [
        question.analysisMode === "compatibility",
        question.analysisScope === "zodiac",
        !requiredKeys.includes("counterpartZodiac"),
        !requiredKeys.includes("counterpartBirthDate"),
        assessment.zodiacAssessment?.available === true,
        assessment.zodiacAssessment?.selfZodiac === "말띠",
        hasZodiacEvidence(decisionResult.evidence),
      ].every(Boolean),
      details: [
        `analysisMode=${question.analysisMode}`,
        `analysisScope=${question.analysisScope}`,
        `requiredMissing=${requiredKeys.join(",") || "none"}`,
        `self=${assessment.zodiacAssessment?.selfZodiac ?? "none"}`,
        `verdict=${decisionResult.verdict}`,
      ],
    });
  }

  {
    const questionText = "이 여자와 궁합이 맞나요?";
    const regressionInput = buildDecisionEngineRegressionInput({
      questionText,
    });
    const question = regressionInput.question;
    const meaning = adaptQuestionMeaning(question);
    const requiredKeys = requiredMissingKeys(meaning.missingContext);

    cases.push({
      id: "b2-this-woman-compat",
      passed: [
        question.analysisMode === "compatibility",
        question.analysisScope === "general",
        requiredKeys.includes("counterpartBirthDate"),
      ].every(Boolean),
      details: [
        `analysisMode=${question.analysisMode}`,
        `analysisScope=${question.analysisScope}`,
        `requiredMissing=${requiredKeys.join(",") || "none"}`,
      ],
    });
  }

  {
    const questionText = "이 사람과 결혼해도 궁합이 맞나요?";
    const regressionInput = buildDecisionEngineRegressionInput({
      questionText,
    });
    const question = regressionInput.question;
    const meaning = adaptQuestionMeaning(question);
    const requiredKeys = requiredMissingKeys(meaning.missingContext);

    cases.push({
      id: "b3-marry-compat",
      passed: [
        question.analysisMode === "compatibility",
        question.analysisScope === "general",
        requiredKeys.includes("counterpartBirthDate"),
      ].every(Boolean),
      details: [
        `analysisMode=${question.analysisMode}`,
        `analysisScope=${question.analysisScope}`,
        `dt=${question.decisionTarget}`,
        `requiredMissing=${requiredKeys.join(",") || "none"}`,
      ],
    });
  }

  {
    const questionText =
      "1990년 5월 1일 양력 여성인 상대와 궁합이 맞나요?";
    const regressionInput = buildDecisionEngineRegressionInput({
      questionText,
    });
    const question = regressionInput.question;
    const meaning = adaptQuestionMeaning(question);
    const requiredKeys = requiredMissingKeys(meaning.missingContext);

    cases.push({
      id: "b4-counterpart-birth-present",
      passed: [
        question.analysisMode === "compatibility",
        question.counterpartFacts.birthDate !== null,
        !requiredKeys.includes("counterpartBirthDate"),
      ].every(Boolean),
      details: [
        `analysisMode=${question.analysisMode}`,
        `analysisScope=${question.analysisScope}`,
        `birthDate=${question.counterpartFacts.birthDate ?? "none"}`,
        `requiredMissing=${requiredKeys.join(",") || "none"}`,
      ],
    });
  }

  {
    const questionText = "상대와 궁합이 맞나요?";
    const regressionInput = buildDecisionEngineRegressionInput({
      questionText,
    });
    const question = regressionInput.question;
    const meaning = adaptQuestionMeaning(question);
    const requiredKeys = requiredMissingKeys(meaning.missingContext);
    const decisionResult = runDecisionEngine(regressionInput);

    cases.push({
      id: "b5-counterpart-info-missing",
      passed: [
        question.analysisMode === "compatibility",
        question.analysisScope === "general",
        requiredKeys.includes("counterpartBirthDate"),
        decisionResult.verdict === "insufficientEvidence",
      ].every(Boolean),
      details: [
        `analysisMode=${question.analysisMode}`,
        `analysisScope=${question.analysisScope}`,
        `requiredMissing=${requiredKeys.join(",") || "none"}`,
        `verdict=${decisionResult.verdict}`,
      ],
    });
  }

  return cases;
}

function verifyCaseGroupCSajuCompatibility():
  StepUQ3CompatibilityConvergenceVerificationCase[] {
  const questions = [
    {
      id: "c1-this-woman-saju-compat",
      text: "이 여자와 사주궁합이 어떤가요?",
    },
    {
      id: "c2-our-saju-compat",
      text: "우리 둘의 사주궁합은?",
    },
    {
      id: "c3-both-saju-compat",
      text: "둘의 사주를 보고 궁합을 봐주세요.",
    },
  ];

  return questions.map(({ id, text }) => {
    const regressionInput = buildDecisionEngineRegressionInput({
      questionText: text,
    });
    const question = regressionInput.question;
    const meaning = adaptQuestionMeaning(question);
    const requiredKeys = requiredMissingKeys(meaning.missingContext);

    const checks = [
      question.analysisMode === "compatibility",
      question.analysisScope !== "zodiac",
      requiredKeys.includes("counterpartBirthDate")
      || question.analysisScope === "birthDate"
      || question.analysisScope === "fullSaju",
    ];

    return {
      id,
      passed: checks.every(Boolean),
      details: [
        `analysisMode=${question.analysisMode}`,
        `analysisScope=${question.analysisScope}`,
        `requiredMissing=${requiredKeys.join(",") || "none"}`,
      ],
    };
  });
}

function verifyCaseGroupDGeneralCompatibility():
  StepUQ3CompatibilityConvergenceVerificationCase[] {
  const questions = [
    {
      id: "d1-this-person-compat",
      text: "이 사람과 궁합이 맞나요?",
    },
    {
      id: "d2-hap-matches",
      text: "합이 맞나요?",
    },
    {
      id: "d3-matching-person",
      text: "잘 맞는 사람인가요?",
    },
  ];

  return questions.map(({ id, text }) => {
    const regressionInput = buildDecisionEngineRegressionInput({
      questionText: text,
    });
    const question = regressionInput.question;
    const meaning = adaptQuestionMeaning(question);
    const requiredKeys = requiredMissingKeys(meaning.missingContext);

    // d3 may be decision/compatibility depending on counterpart context.
    const modeOk = id === "d3-matching-person"
      ? (
        question.analysisMode === "compatibility"
        || question.analysisMode === "decision"
      )
      : question.analysisMode === "compatibility";

    return {
      id,
      passed: [
        modeOk,
        question.analysisScope === "general"
        || question.analysisScope === "birthDate",
        id === "d3-matching-person"
          ? true
          : requiredKeys.includes("counterpartBirthDate")
            || requiredKeys.includes("counterpartZodiac")
            || question.analysisMode !== "compatibility",
      ].every(Boolean),
      details: [
        `analysisMode=${question.analysisMode}`,
        `analysisScope=${question.analysisScope}`,
        `requiredMissing=${requiredKeys.join(",") || "none"}`,
      ],
    };
  });
}

function verifyCaseGroupEMissingInformation():
  StepUQ3CompatibilityConvergenceVerificationCase {
  const questionText = "그 사람과 궁합 좀 봐주세요.";
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText,
  });
  const question = regressionInput.question;
  const meaning = adaptQuestionMeaning(question);
  const requiredKeys = requiredMissingKeys(meaning.missingContext);
  const questionContext = buildQuestionContext(question, []);
  const clarification = assessConsultingClarificationNeed({
    decisionResult: createDecisionResult(questionContext),
    questionContext,
    clarificationFacts: [],
  });

  return {
    id: "e1-pair-missing-counterpart",
    passed: [
      question.analysisMode === "compatibility",
      requiredKeys.includes("counterpartBirthDate"),
      clarification.blockingNeeds.length > 0
      || requiredKeys.length > 0,
    ].every(Boolean),
    details: [
      `analysisMode=${question.analysisMode}`,
      `analysisScope=${question.analysisScope}`,
      `requiredMissing=${requiredKeys.join(",") || "none"}`,
      `clarificationNeeds=${clarification.blockingNeeds.map((need) => need.key).join(",") || "none"}`,
    ],
  };
}

function verifyCaseGroupFZodiacBirthGateNonTrigger():
  StepUQ3CompatibilityConvergenceVerificationCase[] {
  const questions = [
    {
      id: "f1-zodiac-only",
      text: "띠궁합만 봐주세요.",
    },
    {
      id: "f2-tiger-rooster-pair",
      text: "호랑이띠·닭띠 띠궁합은?",
    },
    {
      id: "f3-good-zodiac",
      text: "궁합 좋은 띠는?",
    },
  ];

  return questions.map(({ id, text }) => {
    const regressionInput = buildDecisionEngineRegressionInput({
      questionText: text,
    });
    const question = regressionInput.question;
    const meaning = adaptQuestionMeaning(question);
    const requiredKeys = requiredMissingKeys(meaning.missingContext);
    const questionContext = buildQuestionContext(question, []);
    const clarification = assessConsultingClarificationNeed({
      decisionResult: createDecisionResult(questionContext),
      questionContext,
      clarificationFacts: [],
    });

    const openOrPairZodiac =
      question.analysisScope === "zodiac"
      || /띠/.test(text);

    return {
      id,
      passed: [
        openOrPairZodiac,
        !requiredKeys.includes("counterpartBirthDate"),
        !requiredKeys.includes("counterpartCalendarType"),
        !requiredKeys.includes("counterpartGender"),
        clarification.blockingNeeds.every(
          (need) => need.key !== "counterpartBirthDate",
        ),
      ].every(Boolean),
      details: [
        `analysisMode=${question.analysisMode}`,
        `analysisScope=${question.analysisScope}`,
        `requiredMissing=${requiredKeys.join(",") || "none"}`,
        `clarificationNeeds=${clarification.blockingNeeds.map((need) => need.key).join(",") || "none"}`,
      ],
    };
  });
}

function verifyCaseGroupGStep3BRegression():
  StepUQ3CompatibilityConvergenceVerificationCase[] {
  const gate = verifyStep3BZodiacGate();
  const pair = verifyStep3BZodiacPair();

  return [
    {
      id: "g1-step3b-gate-all",
      passed: gate.passed,
      details: gate.cases.map(
        (item) => `${item.id}:${item.passed ? "pass" : "fail"}`,
      ),
    },
    {
      id: "g2-step3b-pair-all",
      passed: pair.passed,
      details: pair.cases.map(
        (item) => `${item.id}:${item.passed ? "pass" : "fail"}`,
      ),
    },
  ];
}

function verifySelfFitRegression():
  StepUQ3CompatibilityConvergenceVerificationCase {
  const questionText = "개인택시사업은 나와 맞는 것입니까?";
  const regressionInput = buildDecisionEngineRegressionInput({
    questionText,
  });
  const question = regressionInput.question;

  return {
    id: "r1-self-fit-not-compatibility",
    passed: [
      question.analysisMode !== "compatibility",
      question.analysisScope === "general",
    ].every(Boolean),
    details: [
      `analysisMode=${question.analysisMode}`,
      `analysisScope=${question.analysisScope}`,
      `intent=${question.intent}`,
    ],
  };
}

function verifyExistingPairAnchorNotBroken():
  StepUQ3CompatibilityConvergenceVerificationCase[] {
  const sheep = buildDecisionEngineRegressionInput({
    questionText: "양띠 여성과 띠 궁합만 봐주세요",
  });
  const sheepContext = buildQuestionContext(sheep.question, []);
  const sheepAssessment = assessCompatibility(
    sheepContext,
    SELF_YEAR_GAN_ZHI,
  );
  const sheepDecision = runDecisionEngine({
    ...sheep,
    selfYearGanZhi: SELF_YEAR_GAN_ZHI,
  });

  const pair = buildDecisionEngineRegressionInput({
    questionText: "호랑이띠·닭띠 띠궁합은 어떨까요?",
  });
  const pairContext = buildQuestionContext(pair.question, []);
  const pairAssessment = assessCompatibility(
    pairContext,
    SELF_YEAR_GAN_ZHI,
  );
  const pairDecision = runDecisionEngine({
    ...pair,
    selfYearGanZhi: SELF_YEAR_GAN_ZHI,
  });

  return [
    {
      id: "p1-sheep-female-pair-preserved",
      passed: [
        sheep.question.analysisMode === "compatibility",
        sheep.question.analysisScope === "zodiac",
        sheepAssessment.zodiacAssessment?.available === true,
        sheepAssessment.zodiacAssessment?.selfZodiac === "말띠",
        sheepAssessment.zodiacAssessment?.counterpartZodiac === "양띠",
        !sheepAssessment.zodiacAssessment?.candidates,
        hasZodiacEvidence(sheepDecision.evidence),
        sheepDecision.evidence[0]?.key.startsWith("zodiacCompatibility-")
        === true,
      ].every(Boolean),
      details: [
        `self=${sheepAssessment.zodiacAssessment?.selfZodiac ?? "none"}`,
        `counterpart=${sheepAssessment.zodiacAssessment?.counterpartZodiac ?? "none"}`,
        `candidates=${sheepAssessment.zodiacAssessment?.candidates?.length ?? 0}`,
        `firstEvidence=${sheepDecision.evidence[0]?.key ?? "none"}`,
      ],
    },
    {
      id: "p2-tiger-rooster-pair-preserved",
      passed: [
        pair.question.analysisMode === "compatibility",
        pair.question.analysisScope === "zodiac",
        pairAssessment.zodiacAssessment?.available === true,
        pairAssessment.zodiacAssessment?.selfZodiac === "호랑이띠",
        pairAssessment.zodiacAssessment?.counterpartZodiac === "닭띠",
        !pairAssessment.zodiacAssessment?.candidates,
        hasZodiacEvidence(pairDecision.evidence),
        pairDecision.evidence[0]?.key.startsWith("zodiacCompatibility-")
        === true,
      ].every(Boolean),
      details: [
        `self=${pairAssessment.zodiacAssessment?.selfZodiac ?? "none"}`,
        `counterpart=${pairAssessment.zodiacAssessment?.counterpartZodiac ?? "none"}`,
        `candidates=${pairAssessment.zodiacAssessment?.candidates?.length ?? 0}`,
        `firstEvidence=${pairDecision.evidence[0]?.key ?? "none"}`,
      ],
    },
  ];
}

export function verifyStepUQ3CompatibilityConvergence():
  StepUQ3CompatibilityConvergenceVerificationResult {
  const cases = [
    ...verifyCaseGroupAOpenZodiacRecommendation(),
    ...verifySpecifiedEightQuestions(),
    ...verifyCaseGroupBSpecificCounterpart(),
    ...verifyCaseGroupCSajuCompatibility(),
    ...verifyCaseGroupDGeneralCompatibility(),
    verifyCaseGroupEMissingInformation(),
    ...verifyCaseGroupFZodiacBirthGateNonTrigger(),
    ...verifyCaseGroupGStep3BRegression(),
    verifySelfFitRegression(),
    ...verifyExistingPairAnchorNotBroken(),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}
