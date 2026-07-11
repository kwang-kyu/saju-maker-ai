import type { HumanDestinyContext } from "../../types/humanDestinyContext";
import type {
  DecisionTarget,
  QuestionReaderResult,
} from "../question/questionReader";
import type { ContextAlignment } from "./decisionTypes";

export type ContextAlignmentResult = {
  alignment: ContextAlignment;
  reason: string;
};

type PhaseDirection =
  | "expand"
  | "prepare"
  | "change"
  | "collect"
  | "stabilize"
  | "protect"
  | "recover"
  | "reset";

const phaseDirectionMap: Record<
  HumanDestinyContext["currentPhase"]["phase"],
  PhaseDirection
> = {
  growth: "expand",
  preparation: "prepare",
  transition: "change",
  harvest: "collect",
  stability: "stabilize",
  challenge: "protect",
  recovery: "recover",
  reset: "reset",
};

const expansionTargets: DecisionTarget[] = [
  "start",
  "invest",
  "partner",
  "move",
  "changeJob",
  "marry",
];

const maintenanceTargets: DecisionTarget[] = [
  "continue",
  "manageMoney",
  "protectHealth",
  "respondToConflict",
  "confirmDirection",
];



function includesTarget(
  targets: DecisionTarget[],
  target: DecisionTarget,
): boolean {
  return targets.includes(target);
}

function buildReason(params: {
  phaseTitle: string;
  phaseDescription: string;
  decisionQuestion: string;
  conclusion: string;
}): string {
  const {
    phaseTitle,
    phaseDescription,
    decisionQuestion,
    conclusion,
  } = params;

  return [
    `현재 인생 국면은 '${phaseTitle}'이다.`,
    phaseDescription,
    `질문에서 실제로 결정하려는 것은 '${decisionQuestion}'이다.`,
    conclusion,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Human Destiny Context와 질문 속 결정 방향을 비교한다.
 *
 * 이 함수는 질문만으로 판단하지 않는다.
 * 현재 인생 국면이 요구하는 방향을 먼저 확인한 뒤,
 * 질문 속 행동이 그 흐름과 맞는지를 판정한다.
 */
export function analyzeContextAlignment(
  humanContext: HumanDestinyContext,
  question: QuestionReaderResult,
): ContextAlignmentResult {
  const { currentPhase } = humanContext;
  const direction = phaseDirectionMap[currentPhase.phase];
  const target = question.decisionTarget;

  if (target === "none") {
    return {
      alignment: "unknown",
      reason: buildReason({
        phaseTitle: currentPhase.title,
        phaseDescription: currentPhase.description,
        decisionQuestion: question.decisionQuestion,
        conclusion:
          "질문 속에서 실제 행동 대상이 충분히 드러나지 않아 정합성을 확정할 수 없다.",
      }),
    };
  }

  if (direction === "expand") {
    if (includesTarget(expansionTargets, target)) {
      return {
        alignment: "stronglyAligned",
        reason: buildReason({
          phaseTitle: currentPhase.title,
          phaseDescription: currentPhase.description,
          decisionQuestion: question.decisionQuestion,
          conclusion:
            "현재 국면은 확장과 성장을 요구하며, 질문 속 선택도 새로운 행동과 확대를 향하고 있어 서로 강하게 맞는다.",
        }),
      };
    }

    if (includesTarget(maintenanceTargets, target)) {
      return {
        alignment: "partiallyAligned",
        reason: buildReason({
          phaseTitle: currentPhase.title,
          phaseDescription: currentPhase.description,
          decisionQuestion: question.decisionQuestion,
          conclusion:
            "현재는 성장 국면이지만 질문은 유지와 관리에 가까워, 방향은 충돌하지 않으나 확장 흐름을 충분히 사용하지 못할 수 있다.",
        }),
      };
    }

    return {
      alignment: "conflicted",
      reason: buildReason({
        phaseTitle: currentPhase.title,
        phaseDescription: currentPhase.description,
        decisionQuestion: question.decisionQuestion,
        conclusion:
          "현재 국면은 앞으로 나아가야 하지만 질문 속 선택은 축소나 중단을 향하고 있어 서로 충돌한다.",
      }),
    };
  }

  if (direction === "prepare") {
    if (target === "wait" || target === "confirmDirection") {
      return {
        alignment: "stronglyAligned",
        reason: buildReason({
          phaseTitle: currentPhase.title,
          phaseDescription: currentPhase.description,
          decisionQuestion: question.decisionQuestion,
          conclusion:
            "현재는 준비와 점검이 우선인 시기이며, 질문 속 선택도 기다리거나 방향을 확인하려는 것이므로 매우 잘 맞는다.",
        }),
      };
    }

    if (includesTarget(expansionTargets, target)) {
      return {
        alignment: "conflicted",
        reason: buildReason({
          phaseTitle: currentPhase.title,
          phaseDescription: currentPhase.description,
          decisionQuestion: question.decisionQuestion,
          conclusion:
            "현재는 기반을 먼저 갖춰야 하는 국면인데 질문은 즉시 시작하거나 확대하려는 방향이어서 속도 충돌이 발생한다.",
        }),
      };
    }

    return {
      alignment: "aligned",
      reason: buildReason({
        phaseTitle: currentPhase.title,
        phaseDescription: currentPhase.description,
        decisionQuestion: question.decisionQuestion,
        conclusion:
          "현재 국면은 준비와 정리를 요구하며, 질문 속 선택도 그 흐름을 크게 벗어나지 않는다.",
      }),
    };
  }

  if (direction === "change") {
    if (
      target === "changeJob" ||
      target === "move" ||
      target === "start" ||
      target === "stop" ||
      target === "separate"
    ) {
      return {
        alignment: "stronglyAligned",
        reason: buildReason({
          phaseTitle: currentPhase.title,
          phaseDescription: currentPhase.description,
          decisionQuestion: question.decisionQuestion,
          conclusion:
            "현재는 기존 구조를 바꾸는 전환 국면이며, 질문 역시 이동·시작·정리와 같은 변화를 요구하므로 강하게 맞는다.",
        }),
      };
    }

    if (target === "continue") {
      return {
        alignment: "conflicted",
        reason: buildReason({
          phaseTitle: currentPhase.title,
          phaseDescription: currentPhase.description,
          decisionQuestion: question.decisionQuestion,
          conclusion:
            "현재는 변화가 필요한 국면인데 질문은 기존 상태를 그대로 유지하려는 방향이어서 충돌한다.",
        }),
      };
    }

    return {
      alignment: "partiallyAligned",
      reason: buildReason({
        phaseTitle: currentPhase.title,
        phaseDescription: currentPhase.description,
        decisionQuestion: question.decisionQuestion,
        conclusion:
          "현재는 전환이 필요한 시기지만 질문의 행동 방향이 변화와 완전히 일치하지는 않는다.",
      }),
    };
  }

  if (direction === "collect" || direction === "stabilize") {
    if (
      target === "continue" ||
      target === "manageMoney" ||
      target === "sell" ||
      target === "protectHealth"
    ) {
      return {
        alignment: "aligned",
        reason: buildReason({
          phaseTitle: currentPhase.title,
          phaseDescription: currentPhase.description,
          decisionQuestion: question.decisionQuestion,
          conclusion:
            "현재는 성과를 지키고 정리하는 국면이며, 질문도 유지·관리·회수 방향이어서 서로 잘 맞는다.",
        }),
      };
    }

    if (target === "invest" || target === "partner") {
      return {
        alignment: "conflicted",
        reason: buildReason({
          phaseTitle: currentPhase.title,
          phaseDescription: currentPhase.description,
          decisionQuestion: question.decisionQuestion,
          conclusion:
            "현재는 안정과 회수가 우선인데 질문은 새로운 자금 투입이나 관계 확장을 요구하므로 충돌한다.",
        }),
      };
    }

    return {
      alignment: "partiallyAligned",
      reason: buildReason({
        phaseTitle: currentPhase.title,
        phaseDescription: currentPhase.description,
        decisionQuestion: question.decisionQuestion,
        conclusion:
          "현재는 안정과 관리가 우선이며, 질문의 선택은 일부만 그 흐름과 맞는다.",
      }),
    };
  }

  if (direction === "protect" || direction === "recover") {
    if (
      target === "wait" ||
      target === "stop" ||
      target === "manageMoney" ||
      target === "protectHealth" ||
      target === "respondToConflict"
    ) {
      return {
        alignment: "stronglyAligned",
        reason: buildReason({
          phaseTitle: currentPhase.title,
          phaseDescription: currentPhase.description,
          decisionQuestion: question.decisionQuestion,
          conclusion:
            "현재는 손실을 막고 회복해야 하는 국면이며, 질문도 보호·중단·회복 방향이어서 매우 잘 맞는다.",
        }),
      };
    }

    if (includesTarget(expansionTargets, target)) {
      return {
        alignment: "stronglyConflicted",
        reason: buildReason({
          phaseTitle: currentPhase.title,
          phaseDescription: currentPhase.description,
          decisionQuestion: question.decisionQuestion,
          conclusion:
            "현재는 보호와 회복이 먼저인데 질문은 시작·투자·확장을 요구하므로 현재 국면과 강하게 충돌한다.",
        }),
      };
    }

    return {
      alignment: "partiallyAligned",
      reason: buildReason({
        phaseTitle: currentPhase.title,
        phaseDescription: currentPhase.description,
        decisionQuestion: question.decisionQuestion,
        conclusion:
          "현재는 회복이 우선이며, 질문의 선택이 그 흐름을 완전히 따르지는 않지만 직접적인 충돌도 크지 않다.",
      }),
    };
  }

  if (direction === "reset") {
    if (
      target === "stop" ||
      target === "sell" ||
      target === "separate" ||
      target === "leaveJob" ||
      target === "confirmDirection"
    ) {
      return {
        alignment: "stronglyAligned",
        reason: buildReason({
          phaseTitle: currentPhase.title,
          phaseDescription: currentPhase.description,
          decisionQuestion: question.decisionQuestion,
          conclusion:
            "현재는 기존 구조를 정리하고 새 기준을 세워야 하는 국면이며, 질문도 정리와 재설정을 향하고 있어 강하게 맞는다.",
        }),
      };
    }

    if (target === "continue") {
      return {
        alignment: "stronglyConflicted",
        reason: buildReason({
          phaseTitle: currentPhase.title,
          phaseDescription: currentPhase.description,
          decisionQuestion: question.decisionQuestion,
          conclusion:
            "현재는 기존 방식을 끝내고 재설정해야 하지만 질문은 그대로 유지하려는 방향이어서 강하게 충돌한다.",
        }),
      };
    }

    return {
      alignment: "conflicted",
      reason: buildReason({
        phaseTitle: currentPhase.title,
        phaseDescription: currentPhase.description,
        decisionQuestion: question.decisionQuestion,
        conclusion:
          "현재는 재정비와 초기화가 우선인데 질문은 새로운 행동을 바로 결정하려고 하므로 시기상 충돌이 있다.",
      }),
    };
  }

  return {
    alignment: "unknown",
    reason: buildReason({
      phaseTitle: currentPhase.title,
      phaseDescription: currentPhase.description,
      decisionQuestion: question.decisionQuestion,
      conclusion:
        "현재 국면과 질문의 행동 방향을 연결할 충분한 기준을 찾지 못했다.",
    }),
  };
}