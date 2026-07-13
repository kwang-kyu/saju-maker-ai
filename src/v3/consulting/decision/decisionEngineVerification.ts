import type { HumanDestinyContext } from "../../types/humanDestinyContext";
import { readQuestion } from "../question/questionReader";
import { runDecisionEngine } from "./decisionEngine";
import type { DecisionResult } from "./decisionTypes";

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

  const stableGrowthResult = runDecisionEngine({
    humanContext: stableGrowthContext,
    question: stableGrowthQuestion,
  });

  const earlyCollapseResult = runDecisionEngine({
    humanContext: earlyCollapseContext,
    question: earlyCollapseQuestion,
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

  const growthResult = runDecisionEngine({
    humanContext: growthContext,
    question: growthQuestion,
  });

  const recoveryResult = runDecisionEngine({
    humanContext: recoveryContext,
    question: recoveryQuestion,
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

  const achievementResult = runDecisionEngine({
    humanContext: achievementContext,
    question: achievementQuestion,
  });

  const stabilityResult = runDecisionEngine({
    humanContext: stabilityContext,
    question: stabilityQuestion,
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

  const pushResult = runDecisionEngine({
    humanContext: pushContext,
    question: pushQuestion,
  });

  const stabilityResult = runDecisionEngine({
    humanContext: stabilityContext,
    question: stabilityQuestion,
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

  const opportunityMissResult = runDecisionEngine({
    humanContext: opportunityMissContext,
    question: opportunityMissQuestion,
  });

  const earlyCollapseResult = runDecisionEngine({
    humanContext: earlyCollapseContext,
    question: earlyCollapseQuestion,
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