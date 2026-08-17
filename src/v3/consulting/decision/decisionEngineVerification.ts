import type { HumanDestinyContext } from "../../types/humanDestinyContext";
import type { HumanLifeContext } from "../../types/humanLifeContext";
import { readQuestion } from "../question/questionReader";
import { buildQuestionContext } from "../question/questionContextBuilder";
import { runDecisionEngine } from "./decisionEngine";
import type {
  ActionReadiness,
  DecisionCondition,
  DecisionEngineInput,
  DecisionResult,
} from "./decisionTypes";
import { buildDecisionConditions } from "./conditionBuilder";
import type { LifeContextAssessment } from "./lifeContextAssessment";
import type { CompatibilityAssessment } from "./compatibilityAssessment";
import {
  buildCounterpartSajuCalculation,
} from "./counterpartSajuCalculationBuilder";
import type { TimingAssessment } from "./timingAssessment";
function buildNeutralTimingAssessment():
  TimingAssessment {
  return {
    analysisRequired:
      false,

    timingType:
      "unknown",

    evidenceLevel:
      "notRequired",

    assessmentScope:
      "none",

    targetScope:
      null,

    targetStartDate:
      null,

    targetEndDate:
      null,

    targetYear:
      null,

    targetMonth:
      null,

    targetDay:
      null,

    hasCurrentDaeun:
      false,

    hasTargetSeun:
      false,

    hasYearSegments:
      false,

    hasWolun:
      false,

    hasIlun:
      false,

    flowInterpretationAvailable:
      false,

    flowDirection:
      "notAssessed",

    overallTheme:
      null,

    supportiveSignals:
      [],

    tensionSignals:
      [],

    cautions:
      [],

    limitations:
      [],

    evidenceKeys:
      [],

    evidenceComplete:
      true,
  };
}
const VERIFIED_COUNTERPART_SAJU =
  buildCounterpartSajuCalculation({
    birthDate:
      "1967-04-10",

    calendarType:
      "solar",

    gender:
      "male",
  });

export type DecisionEngineVerificationResult = {
  question: string;

  growthResult: DecisionResult;
  recoveryResult: DecisionResult;

  verdictChanged: boolean;
  readinessChanged: boolean;
  alignmentChanged: boolean;

  passed: boolean;
};

export type RepeatedPatternVerificationResult = {
  question: string;

  stableGrowthResult: DecisionResult;
  earlyCollapseResult: DecisionResult;

  conditionsChanged: boolean;
  risksChanged: boolean;
  prohibitedDirectionChanged: boolean;
  verdictChanged: boolean;

  passed: boolean;
};
/**
 * Decision Engine 반복 패턴 민감도 검증
 *
 * 동일한 사람, 동일한 질문, 동일한 현재 국면을 유지하고
 * Repeated Pattern만 변경하여
 * 조건·위험·금지 방향이 실제로 달라지는지 확인한다.
 *
 * 이 단계에서는 Repeated Pattern이 Verdict를 변경하는 것을
 * 필수 통과 조건으로 요구하지 않는다.
 */
export function verifyDecisionEngineRepeatedPatternSensitivity(
  baseContext: HumanDestinyContext,
  lifeContext: HumanLifeContext,
  questionText = "지금 사업을 시작해도 될까요?",
): RepeatedPatternVerificationResult {
  const stableGrowthContext: HumanDestinyContext = {
    ...baseContext,
    identity: {
      ...baseContext.identity,
      profile: {
        ...baseContext.identity.profile,
        repeatedPattern: {
          ...baseContext.identity.profile.repeatedPattern,
          primary: {
            ...baseContext.identity.profile.repeatedPattern.primary,
            pattern: "slowGrowthStable",
            confidence: "high",
          },
          secondary: null,
          repeatedBehaviors: [
            "작게 시작하여 점진적으로 성장한다.",
          ],
          strengths: [
            "지속력이 강하다.",
          ],
          risks: [
            "결정이 늦어질 수 있다.",
          ],
        },
      },
    },
  };

  const earlyCollapseContext: HumanDestinyContext = {
    ...baseContext,
    identity: {
      ...baseContext.identity,
      profile: {
        ...baseContext.identity.profile,
        repeatedPattern: {
          ...baseContext.identity.profile.repeatedPattern,
          primary: {
            ...baseContext.identity.profile.repeatedPattern.primary,
            pattern: "earlySuccessCollapse",
            confidence: "high",
          },
          secondary: null,
          repeatedBehaviors: [
            "성과가 생기면 확장을 서두른다.",
          ],
          strengths: [
            "실행력이 빠르다.",
          ],
          risks: [
            "과도한 확장이 반복될 수 있다.",
            "재무 관리가 흔들릴 수 있다.",
          ],
        },
      },
    },
  };

  const stableGrowthQuestion = readQuestion(
    stableGrowthContext,
    questionText,
  );

  const earlyCollapseQuestion = readQuestion(
    earlyCollapseContext,
    questionText,
  );

  const stableGrowthQuestionContext =
    buildQuestionContext(
      stableGrowthQuestion,
  );

  const earlyCollapseQuestionContext =
    buildQuestionContext(
      earlyCollapseQuestion,
  );

  const stableGrowthResult = runDecisionEngine({
    humanContext: stableGrowthContext,
    lifeContext,
    question: stableGrowthQuestion,
    questionContext: stableGrowthQuestionContext,
  });

  const earlyCollapseResult = runDecisionEngine({
    humanContext: earlyCollapseContext,
    lifeContext,
    question: earlyCollapseQuestion,
    questionContext: earlyCollapseQuestionContext,
  });

  const conditionsChanged =
    JSON.stringify(stableGrowthResult.conditions) !==
    JSON.stringify(earlyCollapseResult.conditions);

  const risksChanged =
    JSON.stringify(stableGrowthResult.risks) !==
    JSON.stringify(earlyCollapseResult.risks);

  const prohibitedDirectionChanged =
    stableGrowthResult.prohibitedDirection !==
    earlyCollapseResult.prohibitedDirection;

  const verdictChanged =
    stableGrowthResult.verdict !==
    earlyCollapseResult.verdict;

  const passed =
    conditionsChanged &&
    risksChanged &&
    prohibitedDirectionChanged;

  return {
    question: questionText,

    stableGrowthResult,
    earlyCollapseResult,

    conditionsChanged,
    risksChanged,
    prohibitedDirectionChanged,
    verdictChanged,

    passed,
  };
}
/**
 * Decision Engine 국면 민감도 검증
 *
 * 동일한 사람과 동일한 질문을 유지한 채
 * 현재 인생 국면만 growth와 recovery로 바꾸어
 * 엔진 판단이 실제로 달라지는지 확인한다.
 *
 * 이 함수는 새로운 사주 판단을 만들지 않는다.
 * Decision Engine이 Human Life Phase를 실제 판단 근거로
 * 사용하고 있는지만 검증한다.
 */
export function verifyDecisionEnginePhaseSensitivity(
  baseContext: HumanDestinyContext,
  lifeContext: HumanLifeContext,
  questionText = "지금 사업을 시작해도 될까요?",
): DecisionEngineVerificationResult {
  const growthContext: HumanDestinyContext = {
    ...baseContext,
    currentPhase: {
      ...baseContext.currentPhase,
      phase: "growth",
      title: "성장 국면",
      description:
        "현재는 활동 범위를 넓히고 새로운 기회를 실행으로 연결해야 하는 국면이다.",
    },


  };

  const recoveryContext: HumanDestinyContext = {
    ...baseContext,
    currentPhase: {
      ...baseContext.currentPhase,
      phase: "recovery",
      title: "회복 국면",
      description:
        "현재는 새로운 확장보다 손실을 줄이고 기반을 회복하는 것이 먼저인 국면이다.",
    },
  };

  const growthQuestion = readQuestion(
    growthContext,
    questionText,
  );

  const recoveryQuestion = readQuestion(
    recoveryContext,
    questionText,
  );

  const growthQuestionContext =
    buildQuestionContext(
      growthQuestion,
    );

  const recoveryQuestionContext =
    buildQuestionContext(
      recoveryQuestion,
    );

  const growthResult = runDecisionEngine({
    humanContext: growthContext,
    lifeContext,
    question: growthQuestion,
    questionContext: growthQuestionContext,
  });

  const recoveryResult = runDecisionEngine({
    humanContext: recoveryContext,
    lifeContext,
    question: recoveryQuestion,
    questionContext: recoveryQuestionContext,
  });

  const verdictChanged =
    growthResult.verdict !== recoveryResult.verdict;

  const readinessChanged =
    growthResult.actionReadiness !==
    recoveryResult.actionReadiness;

  const alignmentChanged =
    growthResult.contextAlignment !==
    recoveryResult.contextAlignment;

  const passed =
    growthResult.contextAlignment === "stronglyAligned" &&
    recoveryResult.contextAlignment ===
      "stronglyConflicted" &&
    growthResult.verdict !== "notRecommended" &&
    recoveryResult.verdict === "notRecommended" &&
    readinessChanged;

  return {
    question: questionText,

    growthResult,
    recoveryResult,

    verdictChanged,
    readinessChanged,
    alignmentChanged,

    passed,
  };
}

export type LifeDriverVerificationResult = {
  question: string;

  achievementResult: DecisionResult;
  stabilityResult: DecisionResult;

  alignmentStayedSame: boolean;
  readinessStayedSame: boolean;
  verdictChanged: boolean;

  passed: boolean;
};

/**
 * Decision Engine Life Driver 민감도 검증
 *
 * 동일한 질문과 동일한 현재 국면을 유지하고
 * Primary Life Driver만 achievement와 stability로 변경하여
 * Verdict가 실제로 달라지는지 확인한다.
 *
 * Context Alignment와 Action Readiness는 동일해야 하며,
 * Verdict 변화는 Life Driver 규칙에서만 발생해야 한다.
 */
export function verifyDecisionEngineLifeDriverSensitivity(
  baseContext: HumanDestinyContext,
  lifeContext: HumanLifeContext,
  questionText = "지금 사업을 시작해도 될까요?",
): LifeDriverVerificationResult {
  const growthContext: HumanDestinyContext = {
    ...baseContext,
    currentPhase: {
      ...baseContext.currentPhase,
      phase: "growth",
      title: "성장 국면",
      description:
        "현재는 활동 범위를 넓히고 새로운 기회를 실행으로 연결해야 하는 국면이다.",
    },
  };

  const achievementContext: HumanDestinyContext = {
    ...growthContext,
    identity: {
      ...growthContext.identity,
      profile: {
        ...growthContext.identity.profile,
        lifeDriver: {
          ...growthContext.identity.profile.lifeDriver,
          primary: {
            ...growthContext.identity.profile.lifeDriver.primary,
            driver: "achievement",
            confidence: "high",
          },
        },
      },
    },
  };

  const stabilityContext: HumanDestinyContext = {
    ...growthContext,
    identity: {
      ...growthContext.identity,
      profile: {
        ...growthContext.identity.profile,
        lifeDriver: {
          ...growthContext.identity.profile.lifeDriver,
          primary: {
            ...growthContext.identity.profile.lifeDriver.primary,
            driver: "stability",
            confidence: "high",
          },
        },
      },
    },
  };

  const achievementQuestion = readQuestion(
    achievementContext,
    questionText,
  );

  const stabilityQuestion = readQuestion(
    stabilityContext,
    questionText,
  );
  const achievementQuestionContext =
  buildQuestionContext(
    achievementQuestion,
  );

const stabilityQuestionContext =
  buildQuestionContext(
    stabilityQuestion,
  );
  const achievementResult = runDecisionEngine({
    humanContext: achievementContext,
    lifeContext,
    question: achievementQuestion,
    questionContext: achievementQuestionContext,
  });

  const stabilityResult = runDecisionEngine({
    humanContext: stabilityContext,
    lifeContext,
    question: stabilityQuestion,
    questionContext: stabilityQuestionContext,
  });

  const alignmentStayedSame =
    achievementResult.contextAlignment ===
    stabilityResult.contextAlignment;

  const readinessStayedSame =
    achievementResult.actionReadiness ===
    stabilityResult.actionReadiness;

  const verdictChanged =
    achievementResult.verdict !==
    stabilityResult.verdict;

  const passed =
    alignmentStayedSame &&
    readinessStayedSame &&
    verdictChanged &&
    achievementResult.verdict ===
      "conditionallyRecommended" &&
    stabilityResult.verdict === "wait";

  return {
    question: questionText,

    achievementResult,
    stabilityResult,

    alignmentStayedSame,
    readinessStayedSame,
    verdictChanged,

    passed,
  };
}

export type SurvivalStyleVerificationResult = {
  question: string;

  pushResult: DecisionResult;
  stabilityResult: DecisionResult;

  alignmentStayedSame: boolean;
  readinessStayedSame: boolean;
  verdictChanged: boolean;

  passed: boolean;
};

/**
 * Decision Engine Survival Style 민감도 검증
 *
 * 동일한 질문, 동일한 현재 국면,
 * 동일한 Life Driver를 유지하고
 * Primary Survival Style만 push와 stability로 변경하여
 * Verdict가 실제로 달라지는지 확인한다.
 *
 * Context Alignment와 Action Readiness는 동일해야 하며,
 * Verdict 변화는 Survival Style 규칙에서만 발생해야 한다.
 */
export function verifyDecisionEngineSurvivalStyleSensitivity(
  baseContext: HumanDestinyContext,
  lifeContext: HumanLifeContext,
  questionText = "지금 사업을 시작해도 될까요?",
): SurvivalStyleVerificationResult {
  const growthContext: HumanDestinyContext = {
    ...baseContext,
    currentPhase: {
      ...baseContext.currentPhase,
      phase: "growth",
      title: "성장 국면",
      description:
        "현재는 활동 범위를 넓히고 새로운 기회를 실행으로 연결해야 하는 국면이다.",
    },
    identity: {
      ...baseContext.identity,
      profile: {
        ...baseContext.identity.profile,
        lifeDriver: {
          ...baseContext.identity.profile.lifeDriver,
          primary: {
            ...baseContext.identity.profile.lifeDriver.primary,
            driver: "relationship",
            confidence: "high",
          },
        },
      },
    },
  };

  const pushContext: HumanDestinyContext = {
    ...growthContext,
    identity: {
      ...growthContext.identity,
      profile: {
        ...growthContext.identity.profile,
        survivalStyle: {
          ...growthContext.identity.profile.survivalStyle,
          primary: {
            ...growthContext.identity.profile.survivalStyle.primary,
            style: "push",
            confidence: "high",
          },
        },
      },
    },
  };

  const stabilityContext: HumanDestinyContext = {
    ...growthContext,
    identity: {
      ...growthContext.identity,
      profile: {
        ...growthContext.identity.profile,
        survivalStyle: {
          ...growthContext.identity.profile.survivalStyle,
          primary: {
            ...growthContext.identity.profile.survivalStyle.primary,
            style: "stability",
            confidence: "high",
          },
        },
      },
    },
  };

  const pushQuestion = readQuestion(
    pushContext,
    questionText,
  );

  const stabilityQuestion = readQuestion(
    stabilityContext,
    questionText,
  );

  const pushQuestionContext =
  buildQuestionContext(
    pushQuestion,
  );

const stabilityQuestionContext =
  buildQuestionContext(
    stabilityQuestion,
  );

  const pushResult = runDecisionEngine({
    humanContext: pushContext,
    lifeContext,
    question: pushQuestion,
    questionContext: pushQuestionContext,
  });

  const stabilityResult = runDecisionEngine({
    humanContext: stabilityContext,
    lifeContext,
    question: stabilityQuestion,
    questionContext: stabilityQuestionContext,
  });

  const alignmentStayedSame =
    pushResult.contextAlignment ===
    stabilityResult.contextAlignment;

  const readinessStayedSame =
    pushResult.actionReadiness ===
    stabilityResult.actionReadiness;

  const verdictChanged =
    pushResult.verdict !==
    stabilityResult.verdict;

  const passed =
    alignmentStayedSame &&
    readinessStayedSame &&
    verdictChanged &&
    pushResult.verdict === "recommended" &&
    stabilityResult.verdict ===
      "conditionallyRecommended";

  return {
    question: questionText,

    pushResult,
    stabilityResult,

    alignmentStayedSame,
    readinessStayedSame,
    verdictChanged,

    passed,
  };
}
export type RepeatedPatternVerdictVerificationResult = {
  question: string;

  opportunityMissResult: DecisionResult;
  earlyCollapseResult: DecisionResult;

  alignmentStayedSame: boolean;
  readinessStayedSame: boolean;
  verdictChanged: boolean;

  passed: boolean;
};

/**
 * Decision Engine Repeated Pattern Verdict 민감도 검증
 *
 * 동일한 질문, 동일한 현재 국면,
 * 동일한 Life Driver와 Survival Style을 유지하고
 * Primary Repeated Pattern만 변경하여
 * Verdict가 실제로 달라지는지 확인한다.
 *
 * Context Alignment와 Action Readiness는 동일해야 하며,
 * Verdict 변화는 Repeated Pattern 규칙에서만 발생해야 한다.
 */
export function verifyDecisionEngineRepeatedPatternVerdictSensitivity(
  baseContext: HumanDestinyContext,
  lifeContext: HumanLifeContext,
  questionText = "지금 사업을 시작해도 될까요?",
): RepeatedPatternVerdictVerificationResult {
  const growthContext: HumanDestinyContext = {
    ...baseContext,
    currentPhase: {
      ...baseContext.currentPhase,
      phase: "growth",
      title: "성장 국면",
      description:
        "현재는 활동 범위를 넓히고 새로운 기회를 실행으로 연결해야 하는 국면이다.",
    },
    identity: {
      ...baseContext.identity,
      profile: {
        ...baseContext.identity.profile,
        lifeDriver: {
          ...baseContext.identity.profile.lifeDriver,
          primary: {
            ...baseContext.identity.profile.lifeDriver.primary,
            driver: "relationship",
            confidence: "high",
          },
        },
        survivalStyle: {
          ...baseContext.identity.profile.survivalStyle,
          primary: {
            ...baseContext.identity.profile.survivalStyle.primary,
            style: "relationship",
            confidence: "high",
          },
        },
      },
    },
  };

  const opportunityMissContext: HumanDestinyContext = {
    ...growthContext,
    identity: {
      ...growthContext.identity,
      profile: {
        ...growthContext.identity.profile,
        repeatedPattern: {
          ...growthContext.identity.profile.repeatedPattern,
          primary: {
            ...growthContext.identity.profile.repeatedPattern.primary,
            pattern: "opportunityMiss",
            confidence: "high",
          },
          secondary: null,
          repeatedBehaviors: [
            "충분히 검토한 뒤에도 실행 결정을 계속 미룬다.",
          ],
          strengths: [
            "결정 전에 위험을 신중하게 살핀다.",
          ],
          risks: [
            "검토가 길어져 실행 기회를 놓칠 수 있다.",
          ],
        },
      },
    },
  };

  const earlyCollapseContext: HumanDestinyContext = {
    ...growthContext,
    identity: {
      ...growthContext.identity,
      profile: {
        ...growthContext.identity.profile,
        repeatedPattern: {
          ...growthContext.identity.profile.repeatedPattern,
          primary: {
            ...growthContext.identity.profile.repeatedPattern.primary,
            pattern: "earlySuccessCollapse",
            confidence: "high",
          },
          secondary: null,
          repeatedBehaviors: [
            "초기 성과가 생기면 검증 전에 확장을 서두른다.",
          ],
          strengths: [
            "기회를 빠르게 실행으로 옮긴다.",
          ],
          risks: [
            "초기 성과를 장기 안정성으로 오인할 수 있다.",
            "확장 이후 비용과 책임을 감당하지 못할 수 있다.",
          ],
        },
      },
    },
  };

  const opportunityMissQuestion = readQuestion(
    opportunityMissContext,
    questionText,
  );

  const earlyCollapseQuestion = readQuestion(
    earlyCollapseContext,
    questionText,
  );
  const opportunityMissQuestionContext =
  buildQuestionContext(
    opportunityMissQuestion,
  );

const earlyCollapseQuestionContext =
  buildQuestionContext(
    earlyCollapseQuestion,
  );
  const opportunityMissResult = runDecisionEngine({
    humanContext: opportunityMissContext,
    lifeContext,
    question: opportunityMissQuestion,
    questionContext: opportunityMissQuestionContext,
  });

  const earlyCollapseResult = runDecisionEngine({
    humanContext: earlyCollapseContext,
    lifeContext,
    question: earlyCollapseQuestion,
    questionContext: earlyCollapseQuestionContext,

  });

  const alignmentStayedSame =
    opportunityMissResult.contextAlignment ===
    earlyCollapseResult.contextAlignment;

  const readinessStayedSame =
    opportunityMissResult.actionReadiness ===
    earlyCollapseResult.actionReadiness;

  const verdictChanged =
    opportunityMissResult.verdict !==
    earlyCollapseResult.verdict;

  const passed =
    alignmentStayedSame &&
    readinessStayedSame &&
    verdictChanged &&
    opportunityMissResult.verdict ===
      "recommended" &&
    earlyCollapseResult.verdict ===
      "conditionallyRecommended";

  return {
    question: questionText,

    opportunityMissResult,
    earlyCollapseResult,

    alignmentStayedSame,
    readinessStayedSame,
    verdictChanged,

    passed,
  };
}

export type TimingVerificationResult = {
  question: string;

  executionResult: DecisionResult;
  waitingResult: DecisionResult;
  bestTimingResult: DecisionResult;

  executionVsWaitingChanged: boolean;
  waitingVsBestChanged: boolean;
  executionVsBestChanged: boolean;

  executionConditionDetected: boolean;
  waitingConditionDetected: boolean;
  bestTimingConditionDetected: boolean;

  passed: boolean;
};

export type ReadinessConditionVerificationResult = {
  readyConditions: DecisionCondition[];
  readyWithConditionsConditions: DecisionCondition[];
  preparationRequiredConditions: DecisionCondition[];
  delayRequiredConditions: DecisionCondition[];
  stopRequiredConditions: DecisionCondition[];
  unknownConditions: DecisionCondition[];

  readyHasNoReadinessCondition: boolean;
  readyWithConditionsDetected: boolean;
  preparationRequiredDetected: boolean;
  delayRequiredDetected: boolean;
  stopRequiredDetected: boolean;
  unknownDetected: boolean;

  passed: boolean;
};

export type LifeContextConditionVerificationResult = {
  lowConditions: DecisionCondition[];
  financialPressureConditions: DecisionCondition[];
  familyResponsibilityConditions: DecisionCondition[];
  transitionDifficultyConditions: DecisionCondition[];
  expansionRiskConditions: DecisionCondition[];
  executionConstraintConditions: DecisionCondition[];

  lowHasNoLifeContextCondition: boolean;

  financialPressureDetected: boolean;
  familyResponsibilityDetected: boolean;
  transitionDifficultyDetected: boolean;
  expansionRiskDetected: boolean;
  executionConstraintDetected: boolean;

  passed: boolean;
};

export type CompatibilityConditionVerificationResult = {
  notRequiredConditions: DecisionCondition[];
  missingCounterpartConditions: DecisionCondition[];
  missingBirthDataConditions: DecisionCondition[];
  sufficientDataConditions: DecisionCondition[];

  notRequiredHasNoCompatibilityCondition: boolean;
  missingCounterpartDetected: boolean;
  missingCounterpartStopsFurtherCondition: boolean;
  missingBirthDataDetected: boolean;
  sufficientDataHasNoCompatibilityCondition: boolean;

  passed: boolean;
};

/**
 * Condition Builder Action Readiness 민감도 검증
 *
 * 동일한 DecisionEngineInput과 Assessment를 유지하고
 * ActionReadiness만 변경하여
 * 각 상태에 맞는 실행 조건이 생성되는지 확인한다.
 *
 * Verdict, Alignment, Assessment를 다시 판단하지 않고
 * Condition Builder의 조건 생성 책임만 검증한다.
 */
export function verifyReadinessConditionSensitivity(
  decisionInput: DecisionEngineInput,
): ReadinessConditionVerificationResult {
  const neutralLifeAssessment: LifeContextAssessment = {
    executionConstraint: "low",
    familyResponsibility: "low",
    financialPressure: "low",
    transitionDifficulty: "low",
    expansionRisk: "low",
  };

  const neutralCompatibilityAssessment: CompatibilityAssessment = {
    analysisRequired: false,
    counterpartExists: false,
    counterpartRelation: "unknown",
    identityProvided: false,
    birthDataProvided: false,
    counterpartSaju:
    null,

  zodiacProvided:
    false,

  zodiacAssessment:
    null,
    evidenceLevel: "notRequired",
    analysisScope: "none",
    counterpartReadingRequired: false,
    additionalCounterpartDataRequired: false,
  };

  const neutralTimingAssessment =
  buildNeutralTimingAssessment();

  const buildConditions = (
    readiness: ActionReadiness,
  ): DecisionCondition[] => {
    return buildDecisionConditions({
      decisionInput,
      readiness,
      alignmentReason:
        "현재 국면과 질문 방향의 충돌을 먼저 해소해야 한다.",
      lifeAssessment: neutralLifeAssessment,
      compatibilityAssessment:
        neutralCompatibilityAssessment,
      timingAssessment: neutralTimingAssessment,
    });
  };

  const readyConditions =
    buildConditions("ready");

  const readyWithConditionsConditions =
    buildConditions("readyWithConditions");

  const preparationRequiredConditions =
    buildConditions("preparationRequired");

  const delayRequiredConditions =
    buildConditions("delayRequired");

  const stopRequiredConditions =
    buildConditions("stopRequired");

  const unknownConditions =
    buildConditions("unknown");

  const readinessConditionKeys =
    new Set<DecisionCondition["key"]>([
      "confirmExecutionConditions",
      "completePreparation",
      "resolveContextConflict",
      "stopCurrentDirection",
      "clarifyDecisionTarget",
    ]);

  const readyHasNoReadinessCondition =
    !readyConditions.some((condition) =>
      readinessConditionKeys.has(condition.key),
    );

  const readyWithConditionsDetected =
    readyWithConditionsConditions.some(
      (condition) =>
        condition.key ===
        "confirmExecutionConditions",
    );

  const preparationRequiredDetected =
    preparationRequiredConditions.some(
      (condition) =>
        condition.key === "completePreparation",
    );

  const delayRequiredDetected =
    delayRequiredConditions.some(
      (condition) =>
        condition.key === "resolveContextConflict",
    );

  const stopRequiredDetected =
    stopRequiredConditions.some(
      (condition) =>
        condition.key === "stopCurrentDirection",
    );

  const unknownDetected =
    unknownConditions.some(
      (condition) =>
        condition.key === "clarifyDecisionTarget",
    );

  const passed =
    readyHasNoReadinessCondition &&
    readyWithConditionsDetected &&
    preparationRequiredDetected &&
    delayRequiredDetected &&
    stopRequiredDetected &&
    unknownDetected;

  return {
    readyConditions,
    readyWithConditionsConditions,
    preparationRequiredConditions,
    delayRequiredConditions,
    stopRequiredConditions,
    unknownConditions,

    readyHasNoReadinessCondition,
    readyWithConditionsDetected,
    preparationRequiredDetected,
    delayRequiredDetected,
    stopRequiredDetected,
    unknownDetected,

    passed,
  };
}

/**
 * Condition Builder Life Context 민감도 검증
 *
 * 동일한 DecisionEngineInput과 다른 Assessment를 유지하고
 * LifeContextAssessment만 변경하여
 * 각 고위험 상태에 맞는 조건이 생성되는지 확인한다.
 *
 * low 상태에서는 Life Context 조건이 생성되지 않아야 하며,
 * 각 high 상태에서는 대응하는 고유 조건이 생성되어야 한다.
 */
export function verifyLifeContextConditionSensitivity(
  decisionInput: DecisionEngineInput,
): LifeContextConditionVerificationResult {
  const neutralCompatibilityAssessment: CompatibilityAssessment = {
    analysisRequired: false,
    counterpartExists: false,
    counterpartRelation: "unknown",
    identityProvided: false,
    birthDataProvided: false,
    counterpartSaju:
    null,

  zodiacProvided:
    false,

  zodiacAssessment:
    null,
    evidenceLevel: "notRequired",
    analysisScope: "none",
    counterpartReadingRequired: false,
    additionalCounterpartDataRequired: false,
  };

  const neutralTimingAssessment =
  buildNeutralTimingAssessment();

  const buildConditions = (
    lifeAssessment: LifeContextAssessment,
  ): DecisionCondition[] => {
    return buildDecisionConditions({
      decisionInput,
      readiness: "ready",
      alignmentReason:
        "현재 국면과 질문 방향의 충돌을 먼저 해소해야 한다.",
      lifeAssessment,
      compatibilityAssessment:
        neutralCompatibilityAssessment,
      timingAssessment: neutralTimingAssessment,
    });
  };

  const lowAssessment: LifeContextAssessment = {
    executionConstraint: "low",
    familyResponsibility: "low",
    financialPressure: "low",
    transitionDifficulty: "low",
    expansionRisk: "low",
  };

  const financialPressureAssessment: LifeContextAssessment = {
    ...lowAssessment,
    financialPressure: "high",
  };

  const familyResponsibilityAssessment: LifeContextAssessment = {
    ...lowAssessment,
    familyResponsibility: "high",
  };

  const transitionDifficultyAssessment: LifeContextAssessment = {
    ...lowAssessment,
    transitionDifficulty: "high",
  };

  const expansionRiskAssessment: LifeContextAssessment = {
    ...lowAssessment,
    expansionRisk: "high",
  };

  const executionConstraintAssessment: LifeContextAssessment = {
    ...lowAssessment,
    executionConstraint: "high",
  };

  const lowConditions =
    buildConditions(lowAssessment);

  const financialPressureConditions =
    buildConditions(
      financialPressureAssessment,
    );

  const familyResponsibilityConditions =
    buildConditions(
      familyResponsibilityAssessment,
    );

  const transitionDifficultyConditions =
    buildConditions(
      transitionDifficultyAssessment,
    );

  const expansionRiskConditions =
    buildConditions(
      expansionRiskAssessment,
    );

  const executionConstraintConditions =
    buildConditions(
      executionConstraintAssessment,
    );

  const lifeContextConditionKeys =
    new Set<DecisionCondition["key"]>([
      "protectExistingCashFlow",
      "protectFamilyResponsibility",
      "useGradualTransition",
      "limitExpansionScale",
      "secureExecutionCapacity",
    ]);

  const lowHasNoLifeContextCondition =
    !lowConditions.some((condition) =>
      lifeContextConditionKeys.has(condition.key),
    );

  const financialPressureDetected =
    financialPressureConditions.some(
      (condition) =>
        condition.key ===
        "protectExistingCashFlow",
    );

  const familyResponsibilityDetected =
    familyResponsibilityConditions.some(
      (condition) =>
        condition.key ===
        "protectFamilyResponsibility",
    );

  const transitionDifficultyDetected =
    transitionDifficultyConditions.some(
      (condition) =>
        condition.key ===
        "useGradualTransition",
    );

  const expansionRiskDetected =
    expansionRiskConditions.some(
      (condition) =>
        condition.key === "limitExpansionScale",
    );

  const executionConstraintDetected =
    executionConstraintConditions.some(
      (condition) =>
        condition.key ===
        "secureExecutionCapacity",
    );

  const passed =
    lowHasNoLifeContextCondition &&
    financialPressureDetected &&
    familyResponsibilityDetected &&
    transitionDifficultyDetected &&
    expansionRiskDetected &&
    executionConstraintDetected;

  return {
    lowConditions,
    financialPressureConditions,
    familyResponsibilityConditions,
    transitionDifficultyConditions,
    expansionRiskConditions,
    executionConstraintConditions,

    lowHasNoLifeContextCondition,

    financialPressureDetected,
    familyResponsibilityDetected,
    transitionDifficultyDetected,
    expansionRiskDetected,
    executionConstraintDetected,

    passed,
  };
}

/**
 * Condition Builder Compatibility 민감도 검증
 *
 * 동일한 DecisionEngineInput과 다른 Assessment를 유지하고
 * CompatibilityAssessment만 변경하여
 * 상대방 정보 수준에 맞는 조건이 생성되는지 확인한다.
 *
 * 분석이 필요하지 않거나 출생정보가 충분한 경우에는
 * Compatibility 고유 조건이 생성되지 않아야 한다.
 */
export function verifyCompatibilityConditionSensitivity(
  decisionInput: DecisionEngineInput,
): CompatibilityConditionVerificationResult {
  const neutralLifeAssessment: LifeContextAssessment = {
    executionConstraint: "low",
    familyResponsibility: "low",
    financialPressure: "low",
    transitionDifficulty: "low",
    expansionRisk: "low",
  };

  const neutralTimingAssessment =
  buildNeutralTimingAssessment();

  const buildConditions = (
    compatibilityAssessment: CompatibilityAssessment,
  ): DecisionCondition[] => {
    return buildDecisionConditions({
      decisionInput,
      readiness: "ready",
      alignmentReason:
        "현재 국면과 질문 방향의 충돌을 먼저 해소해야 한다.",
      lifeAssessment: neutralLifeAssessment,
      compatibilityAssessment,
      timingAssessment: neutralTimingAssessment,
    });
  };

  const notRequiredAssessment: CompatibilityAssessment = {
    analysisRequired: false,
    counterpartExists: false,
    counterpartRelation: "unknown",
    identityProvided: false,
    birthDataProvided: false,
    counterpartSaju:
    null,

  zodiacProvided:
    false,

  zodiacAssessment:
    null,
    evidenceLevel: "notRequired",
    analysisScope: "none",
    counterpartReadingRequired: false,
    additionalCounterpartDataRequired: false,
  };

  const missingCounterpartAssessment: CompatibilityAssessment = {
    analysisRequired: true,
    counterpartExists: false,
    counterpartRelation: "unknown",
    identityProvided: false,
    birthDataProvided: false,
    counterpartSaju:
    null,

  zodiacProvided:
    false,

  zodiacAssessment:
    null,
    evidenceLevel: "insufficient",
    analysisScope: "selfPatternOnly",
    counterpartReadingRequired: true,
    additionalCounterpartDataRequired: true,
  };

  const missingBirthDataAssessment: CompatibilityAssessment = {
    analysisRequired: true,
    counterpartExists: true,
    counterpartRelation: "friend",
    identityProvided: true,
    birthDataProvided: false,
    counterpartSaju:
    null,

  zodiacProvided:
    false,

  zodiacAssessment:
    null,
    evidenceLevel: "partial",
    analysisScope: "counterpartIdentity",
    counterpartReadingRequired: true,
    additionalCounterpartDataRequired: true,
  };

  const sufficientDataAssessment: CompatibilityAssessment = {
    analysisRequired: true,
    counterpartExists: true,
    counterpartRelation: "friend",
    identityProvided: true,
    birthDataProvided: true,
    counterpartSaju:
    VERIFIED_COUNTERPART_SAJU,

  zodiacProvided:
    false,

  zodiacAssessment:
    null,
    evidenceLevel: "sufficient",
    analysisScope: "fullCompatibility",
    counterpartReadingRequired: true,
    additionalCounterpartDataRequired: false,
  };

  const notRequiredConditions =
    buildConditions(notRequiredAssessment);

  const missingCounterpartConditions =
    buildConditions(missingCounterpartAssessment);

  const missingBirthDataConditions =
    buildConditions(missingBirthDataAssessment);

  const sufficientDataConditions =
    buildConditions(sufficientDataAssessment);

  const compatibilityConditionKeys =
    new Set<DecisionCondition["key"]>([
      "identifyCompatibilityCounterpart",
      "provideCounterpartBirthData",
    ]);

  const notRequiredHasNoCompatibilityCondition =
    !notRequiredConditions.some((condition) =>
      compatibilityConditionKeys.has(condition.key),
    );

  const missingCounterpartDetected =
    missingCounterpartConditions.some(
      (condition) =>
        condition.key ===
        "identifyCompatibilityCounterpart",
    );

  const missingCounterpartStopsFurtherCondition =
    !missingCounterpartConditions.some(
      (condition) =>
        condition.key ===
        "provideCounterpartBirthData",
    );

  const missingBirthDataDetected =
    missingBirthDataConditions.some(
      (condition) =>
        condition.key ===
        "provideCounterpartBirthData",
    );

  const sufficientDataHasNoCompatibilityCondition =
    !sufficientDataConditions.some((condition) =>
      compatibilityConditionKeys.has(condition.key),
    );

  const passed =
    notRequiredHasNoCompatibilityCondition &&
    missingCounterpartDetected &&
    missingCounterpartStopsFurtherCondition &&
    missingBirthDataDetected &&
    sufficientDataHasNoCompatibilityCondition;

  return {
    notRequiredConditions,
    missingCounterpartConditions,
    missingBirthDataConditions,
    sufficientDataConditions,

    notRequiredHasNoCompatibilityCondition,
    missingCounterpartDetected,
    missingCounterpartStopsFurtherCondition,
    missingBirthDataDetected,
    sufficientDataHasNoCompatibilityCondition,

    passed,
  };
}

/**
 * Decision Engine Timing Condition 민감도 검증
 *
 * 동일한 사람, 동일한 Life Context,
 * 동일한 질문 해석 결과를 유지하고
 * QuestionContext의 timingType만 변경하여
 * TimingAssessment가 서로 다른 조건을 생성하는지 확인한다.
 *
 * executionTiming, waitingTiming, bestTiming은
 * 각각 고유한 조건을 생성해야 한다.
 */
export function verifyDecisionEngineTimingSensitivity(
  baseContext: HumanDestinyContext,
  lifeContext: HumanLifeContext,
  questionText = "사업을 언제 시작하는 것이 좋을까요?",
): TimingVerificationResult {
  const question = readQuestion(
    baseContext,
    questionText,
  );

  const baseQuestionContext =
    buildQuestionContext(question);

  const executionQuestionContext = {
    ...baseQuestionContext,
    timingType: "executionTiming" as const,
    requirements: {
      ...baseQuestionContext.requirements,
      timingAnalysisRequired: true,
    },
  };

  const waitingQuestionContext = {
    ...baseQuestionContext,
    timingType: "waitingTiming" as const,
    requirements: {
      ...baseQuestionContext.requirements,
      timingAnalysisRequired: true,
    },
  };

  const bestTimingQuestionContext = {
    ...baseQuestionContext,
    timingType: "bestTiming" as const,
    requirements: {
      ...baseQuestionContext.requirements,
      timingAnalysisRequired: true,
    },
  };

  const executionResult = runDecisionEngine({
    humanContext: baseContext,
    lifeContext,
    question,
    questionContext:
      executionQuestionContext,
  });

  const waitingResult = runDecisionEngine({
    humanContext: baseContext,
    lifeContext,
    question,
    questionContext:
      waitingQuestionContext,
  });

  const bestTimingResult = runDecisionEngine({
    humanContext: baseContext,
    lifeContext,
    question,
    questionContext:
      bestTimingQuestionContext,
  });

  const executionVsWaitingChanged =
    JSON.stringify(executionResult.conditions) !==
    JSON.stringify(waitingResult.conditions);

  const waitingVsBestChanged =
    JSON.stringify(waitingResult.conditions) !==
    JSON.stringify(bestTimingResult.conditions);

  const executionVsBestChanged =
    JSON.stringify(executionResult.conditions) !==
    JSON.stringify(bestTimingResult.conditions);

  const executionConditionDetected =
    executionResult.conditions.some(
      (condition) =>
        condition.key ===
        "verifyImmediateExecutionReadiness",
    );

  const waitingConditionDetected =
    waitingResult.conditions.some(
      (condition) =>
        condition.key ===
        "defineWaitingCondition",
    );

  const bestTimingConditionDetected =
    bestTimingResult.conditions.some(
      (condition) =>
        condition.key ===
        "identifyActionTimingWindow",
    );

  const passed =
    executionVsWaitingChanged &&
    waitingVsBestChanged &&
    executionVsBestChanged &&
    executionConditionDetected &&
    waitingConditionDetected &&
    bestTimingConditionDetected;

  return {
    question: questionText,

    executionResult,
    waitingResult,
    bestTimingResult,

    executionVsWaitingChanged,
    waitingVsBestChanged,
    executionVsBestChanged,

    executionConditionDetected,
    waitingConditionDetected,
    bestTimingConditionDetected,

    passed,
  };
}
