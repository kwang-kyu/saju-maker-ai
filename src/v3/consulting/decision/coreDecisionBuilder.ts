import type {
  DecisionVerdict,
} from "./decisionTypes";

import type {
  DecisionTarget,
  QuestionIntent,
} from "../question/questionReader";

export type CoreDecisionContext = {
  originalQuestion: string;
  intent: QuestionIntent;
  decisionTarget: DecisionTarget;
};

function buildLegacyCoreDecision(
  verdict: DecisionVerdict,
  decisionQuestion: string,
): string {
  const verdictText: Record<
    DecisionVerdict,
    string
  > = {
    recommended:
      "진행하는 것이 맞다.",

    conditionallyRecommended:
      "조건을 갖춘 뒤 진행하는 것이 맞다.",

    wait:
      "지금은 바로 결정하지 말고 기다리는 것이 맞다.",

    notRecommended:
      "현재는 진행하지 않는 것이 맞다.",

    insufficientEvidence:
      "현재 정보만으로는 결정을 확정할 수 없다.",

    interpreted:
      "요청한 기간의 운 흐름을 해석한다.",
  };

  return `${decisionQuestion}: ${verdictText[verdict]}`;
}

function buildPossibilityAnswer(
  verdict: DecisionVerdict,
): string {
  switch (verdict) {
    case "recommended":
      return "가능성이 열려 있는 쪽으로 판단한다.";

    case "conditionallyRecommended":
      return "가능성은 있지만 필요한 조건이 함께 충족되어야 하는 흐름으로 판단한다.";

    case "wait":
      return "가능성이 완전히 닫힌 것은 아니지만 지금 시점에서 바로 성사된다고 보기는 어렵다.";

    case "notRecommended":
      return "현재 흐름에서는 실현 가능성을 높게 보기 어렵다.";

    case "insufficientEvidence":
      return "현재 확인된 정보만으로는 실현 가능성을 확정하기 어렵다.";

    case "interpreted":
      return "요청한 기간의 흐름을 중심으로 가능성을 해석한다.";
  }
}

function buildPredictionAnswer(
  verdict: DecisionVerdict,
  decisionTarget: DecisionTarget,
): string {
  if (decisionTarget === "start") {
    switch (verdict) {
      case "recommended":
        return "지금 시작하는 방향은 맞고, 질문한 결과로 이어질 가능성도 있는 쪽으로 판단한다.";

      case "conditionallyRecommended":
        return "지금 시작하는 방향 자체는 가능하지만, 질문한 결과로 이어지려면 필요한 조건과 변수의 영향을 함께 봐야 한다.";

      case "wait":
        return "시작 가능성이 닫힌 것은 아니지만 지금 바로 시작해 질문한 결과까지 이어질 흐름으로 보기는 어렵다.";

      case "notRecommended":
        return "현재는 시작하는 방향도, 질문한 결과로 이어질 가능성도 높게 보기 어렵다.";

      case "insufficientEvidence":
        return "현재 근거만으로 지금 시작했을 때 질문한 결과로 이어질지를 확정하기 어렵다.";

      case "interpreted":
        return "현재 운 흐름에서 시작과 이후 결과가 어떻게 이어지는지를 해석한다.";
    }
  }

  if (decisionTarget === "partner") {
    switch (verdict) {
      case "recommended":
        return "이 사람과 함께하는 방향은 긍정적이며, 질문한 관계의 결과로 이어질 가능성도 있는 쪽으로 판단한다.";

      case "conditionallyRecommended":
        return "이 사람과 함께할 여지는 있지만, 관계가 질문한 결과로 이어지려면 확인해야 할 조건과 변수가 있다.";

      case "wait":
        return "관계 가능성이 닫힌 것은 아니지만 지금 바로 함께할 관계로 확정하기에는 흐름을 더 지켜볼 필요가 있다.";

      case "notRecommended":
        return "현재 흐름에서는 이 사람과 함께하는 방향을 긍정적으로 확정하기 어렵다.";

      case "insufficientEvidence":
        return "현재 근거만으로 이 사람과의 관계가 앞으로 어떻게 이어질지 확정하기 어렵다.";

      case "interpreted":
        return "현재 운 흐름에서 이 관계가 어떻게 이어지는지를 해석한다.";
    }
  }

  switch (verdict) {
    case "recommended":
      return "앞으로의 흐름은 질문한 결과로 이어질 가능성이 있는 쪽으로 판단한다.";

    case "conditionallyRecommended":
      return "질문한 결과로 이어질 여지는 있지만 조건과 변수의 영향을 함께 받는 흐름으로 판단한다.";

    case "wait":
      return "질문한 가능성이 완전히 닫힌 것은 아니지만 당장 결과가 현실화되기보다는 시기가 늦어지거나 흐름이 더 이어져야 하는 쪽으로 판단한다.";

    case "notRecommended":
      return "현재 흐름만 보면 질문한 결과로 이어질 가능성을 높게 보기 어렵다.";

    case "insufficientEvidence":
      return "현재 근거만으로 앞으로의 결과를 확정하기 어렵다.";

    case "interpreted":
      return "요청한 기간에 나타나는 흐름을 중심으로 앞으로의 가능성을 해석한다.";
  }
}

function buildTimingAnswer(
  verdict: DecisionVerdict,
): string {
  switch (verdict) {
    case "recommended":
      return "현재 시기는 질문한 일을 움직여 볼 수 있는 시기로 판단한다.";

    case "conditionallyRecommended":
      return "현재 시기를 활용할 수는 있지만 필요한 조건을 먼저 확인해야 한다.";

    case "wait":
      return "현재는 바로 움직이는 시기보다 조금 더 흐름을 지켜보는 쪽이 맞다.";

    case "notRecommended":
      return "현재 시기는 질문한 일을 추진하기에 유리한 때로 보기 어렵다.";

    case "insufficientEvidence":
      return "현재 정보만으로 적절한 시기를 확정하기 어렵다.";

    case "interpreted":
      return "요청한 기간의 운 흐름을 중심으로 시기를 해석한다.";
  }
}

function buildSelectionAnswer(
  verdict: DecisionVerdict,
): string {
  switch (verdict) {
    case "recommended":
      return "현재 판단에서는 질문한 선택을 받아들이는 쪽에 무게가 실린다.";

    case "conditionallyRecommended":
      return "선택할 수는 있지만 조건을 확인한 뒤 결정하는 쪽이 맞다.";

    case "wait":
      return "지금 바로 하나를 확정하기보다 선택을 조금 더 보류하는 쪽이 맞다.";

    case "notRecommended":
      return "현재 판단에서는 질문한 선택을 그대로 택하지 않는 쪽에 무게가 실린다.";

    case "insufficientEvidence":
      return "현재 정보만으로 어느 선택이 더 적합한지 확정하기 어렵다.";

    case "interpreted":
      return "선택에 영향을 주는 현재 흐름을 해석한다.";
  }
}

function buildActionAnswer(
  verdict: DecisionVerdict,
): string {
  switch (verdict) {
    case "recommended":
      return "현재 판단에서는 진행하는 쪽이 맞다.";

    case "conditionallyRecommended":
      return "진행할 수는 있지만 필요한 조건을 갖춘 뒤 움직이는 쪽이 맞다.";

    case "wait":
      return "지금 바로 실행하기보다는 시기를 늦추는 쪽이 맞다.";

    case "notRecommended":
      return "현재 조건에서는 진행하지 않는 쪽이 맞다.";

    case "insufficientEvidence":
      return "현재 정보만으로 진행 여부를 확정하기 어렵다.";

    case "interpreted":
      return "현재 운 흐름을 중심으로 해석한다.";
  }
}

function buildContextualCoreDecision(
  verdict: DecisionVerdict,
  context: CoreDecisionContext,
): string {
  const originalQuestion =
    context.originalQuestion.trim();

  if (originalQuestion.length === 0) {
    throw new Error(
      "Core decision context requires a non-empty original question.",
    );
  }

  switch (context.intent) {
    case "possibility":
      return buildPossibilityAnswer(verdict);

    case "prediction":
      return buildPredictionAnswer(
        verdict,
        context.decisionTarget,
      );

    case "timing":
      return buildTimingAnswer(verdict);

    case "comparison":
    case "selection":
      return buildSelectionAnswer(verdict);

    case "reason":
    case "method":
    case "risk":
    case "continuation":
    case "termination":
    case "generalJudgement":
      return buildActionAnswer(verdict);
  }
}

export function buildCoreDecision(
  verdict: DecisionVerdict,
  decisionQuestion: string,
  context?: CoreDecisionContext,
): string {
  if (!context) {
    return buildLegacyCoreDecision(
      verdict,
      decisionQuestion,
    );
  }

  return buildContextualCoreDecision(
    verdict,
    context,
  );
}
