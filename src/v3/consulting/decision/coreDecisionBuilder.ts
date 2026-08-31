import type {
  DecisionVerdict,
} from "./decisionTypes.js";

import type {
  ConclusionNature,
  DecisionTarget,
  QuestionAnalysisMode,
  QuestionIntent,
} from "../question/questionReader.js";
import type {
  CareerRecommendationSource,
} from "./careerRecommendationSourceBuilder.js";
import type {
  WarningConclusionSource,
} from "./warningConclusionSourceBuilder.js";
import type {
  ExistenceConclusionSource,
} from "./existenceConclusionSourceBuilder.js";
import type {
  PredictionConclusionSource,
} from "./predictionConclusionSourceBuilder.js";
import {
  extractFirstClause,
} from "./existenceConclusionSourceBuilder.js";

export type CoreDecisionContext = {
  originalQuestion: string;
  intent: QuestionIntent;
  decisionTarget: DecisionTarget;
  analysisMode?: QuestionAnalysisMode;
  conclusionNature?: ConclusionNature;
  careerRecommendation?:
    CareerRecommendationSource;

  warningConclusion?:
    WarningConclusionSource;

  existenceConclusion?:
    ExistenceConclusionSource;

  predictionConclusion?:
    PredictionConclusionSource;
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

function buildPredictionFallbackAnswer(
  topicLabel?:
    string,
): string {
  if (
    topicLabel
    && topicLabel
      !== "질문"
    && topicLabel
      !== "general"
  ) {
    return `현재 확인된 근거만으로 앞으로의 ${topicLabel} 흐름을 단정하기는 어렵다.`;
  }

  return "현재 확인된 근거만으로 앞으로의 흐름을 단정하기는 어렵다.";
}

function buildPredictionFlowPhrase(
  verdict:
    DecisionVerdict,
): string {
  switch (verdict) {
    case "recommended":
      return "이어질 가능성을 볼 수 있다";

    case "conditionallyRecommended":
      return "조건에 따라 방향과 시기가 달라질 수 있다";

    case "wait":
      return "가까운 시점에 뚜렷하게 드러나기보다는 시기 지연이나 추가 변화를 거칠 가능성이 있다";

    case "notRecommended":
      return "질문한 방향으로 이어질 가능성을 높게 보기 어렵다";

    case "insufficientEvidence":
      return "흐름의 방향을 단정하기는 어렵다";

    case "interpreted":
      return "요청한 기간의 운 흐름을 중심으로 전개 방향을 해석할 수 있다";
  }
}

function pickPredictionEvidencePhrase(
  source:
    PredictionConclusionSource,
): string | null {
  const [
    primaryStructure,
  ] =
    source
      .primaryStructureDescriptions;

  const [
    strongSupport,
  ] =
    source
      .strongSupportDescriptions;

  if (
    primaryStructure
  ) {
    return extractFirstClause(
      primaryStructure,
    );
  }

  if (
    strongSupport
  ) {
    return strongSupport
      .replace(
        /\.$/,
        "",
      )
      .trim();
  }

  return null;
}

function buildPredictionAnswerFromSource(
  source:
    PredictionConclusionSource
    | undefined,
  verdict:
    DecisionVerdict,
  decisionTarget:
    DecisionTarget,
): string {
  if (
    !source
  ) {
    return buildPredictionAnswer(
      verdict,
      decisionTarget,
    );
  }

  const topicLabel =
    source
      .topicLabel;

  if (
    !source
      .hasSpecificTopicEvidence
  ) {
    if (
      verdict
        === "insufficientEvidence"
      || source
        .supportLevel
      === "insufficient"
      || source
        .supportLevel
      === "none"
    ) {
      return buildPredictionFallbackAnswer(
        topicLabel,
      );
    }

    if (
      source
        .constraintLevel
      !== "none"
      && source
        .constraintLevel
      !== "insufficient"
    ) {
      const [
        condition,
      ] =
        source
          .conditionDescriptions;

      const [
        limitation,
      ] =
        source
          .limitationDescriptions;

      if (
        condition
      ) {
        return `${topicLabel} 관련 흐름은 일부 확인되지만, ${condition}에 따라 앞으로의 전개가 달라질 수 있다.`;
      }

      if (
        limitation
      ) {
        return `${topicLabel} 관련 일부 흐름은 확인되지만, ${limitation} 등에 따라 앞으로의 전개가 달라질 수 있다.`;
      }
    }

    return buildPredictionFallbackAnswer(
      topicLabel,
    );
  }

  const evidencePhrase =
    pickPredictionEvidencePhrase(
      source,
    );

  const [
    limitation,
  ] =
    source
      .limitationDescriptions;

  const [
    condition,
  ] =
    source
      .conditionDescriptions;

  if (
    source
      .supportLevel
    === "strong"
    && source
      .constraintLevel
    === "none"
    && evidencePhrase
  ) {
    if (
      verdict
        === "recommended"
      || verdict
        === "conditionallyRecommended"
    ) {
      return `현재 확인된 근거에서는 ${evidencePhrase}. ${topicLabel}의 앞으로의 흐름은 현재 조건이 유지되는 범위에서 ${buildPredictionFlowPhrase(verdict)}.`;
    }

    if (
      verdict
        === "wait"
    ) {
      return `현재 확인된 근거에서는 ${evidencePhrase}. ${topicLabel}의 앞으로의 흐름은 ${buildPredictionFlowPhrase(verdict)}.`;
    }

    if (
      verdict
        === "notRecommended"
    ) {
      return `현재 확인된 근거에서는 ${evidencePhrase}. ${topicLabel}의 앞으로의 흐름은 ${buildPredictionFlowPhrase(verdict)}.`;
    }

    return `현재 확인된 근거에서는 ${evidencePhrase}. ${topicLabel}의 앞으로의 흐름을 단정하기는 어렵다.`;
  }

  if (
    source
      .constraintLevel
    !== "none"
    && source
      .constraintLevel
    !== "insufficient"
  ) {
    if (
      condition
      && evidencePhrase
    ) {
      return `현재 확인된 근거에서는 ${evidencePhrase}. ${condition}에 따라 ${topicLabel}의 앞으로의 흐름이 달라질 수 있다.`;
    }

    if (
      limitation
    ) {
      return `${topicLabel} 관련 일부 흐름은 확인되지만, ${limitation} 등에 따라 앞으로의 전개가 달라질 수 있다.`;
    }

    return `${topicLabel} 관련 흐름은 확인되지만, 다른 조건과 함께 해석해야 하므로 앞으로의 전개를 단정하기는 어렵다.`;
  }

  if (
    source
      .supportLevel
    === "moderate"
  ) {
    if (
      limitation
    ) {
      return `${topicLabel} 관련 일부 근거는 확인되지만, ${limitation} 등과 함께 해석해야 하므로 앞으로의 흐름을 단정하기는 어렵다.`;
    }

    return buildPredictionFallbackAnswer(
      topicLabel,
    );
  }

  return buildPredictionFallbackAnswer(
    topicLabel,
  );
}

function buildPredictionAnswer(
  verdict: DecisionVerdict,
  decisionTarget: DecisionTarget,
): string {
  if (decisionTarget === "start") {
    switch (verdict) {
      case "recommended":
        return "질문한 결과로 이어질 가능성이 열려 있으며, 현재 흐름도 그 방향으로 전개될 여지가 있는 쪽으로 판단한다.";

      case "conditionallyRecommended":
        return "질문한 결과로 이어질 여지는 있으나, 조건과 변수에 따라 흐름의 방향과 성사 시점이 달라질 수 있다.";

      case "wait":
        return "질문한 결과의 가능성이 완전히 닫힌 것은 아니지만, 현재 흐름만으로는 가까운 시점에 현실화되기 어렵고 시기 지연이나 추가 변화를 거칠 가능성이 있다.";

      case "notRecommended":
        return "현재 흐름만 보면 질문한 결과로 이어질 가능성을 높게 보기 어렵다.";

      case "insufficientEvidence":
        return "현재 확보된 근거만으로 앞으로의 결과와 흐름의 방향을 확정하기 어렵다.";

      case "interpreted":
        return "요청한 기간의 운 흐름을 중심으로 질문한 결과의 가능성과 전개 방향을 해석한다.";
    }
  }

  if (decisionTarget === "partner") {
    switch (verdict) {
      case "recommended":
        return "이 사람과의 관계 흐름은 질문한 결과로 이어질 가능성이 있는 쪽으로 판단한다.";

      case "conditionallyRecommended":
        return "이 사람과의 관계에서 질문한 결과로 이어질 여지는 있으나, 확인해야 할 조건과 변수에 따라 전개 방향이 달라질 수 있다.";

      case "wait":
        return "관계 흐름상 질문한 결과의 가능성이 완전히 닫힌 것은 아니지만, 지금 시점에서 바로 그 결과로 이어질 흐름으로 보기는 어렵다.";

      case "notRecommended":
        return "현재 관계 흐름만 보면 질문한 결과로 이어질 가능성을 높게 보기 어렵다.";

      case "insufficientEvidence":
        return "현재 확보된 근거만으로 이 관계가 앞으로 어떤 결과로 이어질지 확정하기 어렵다.";

      case "interpreted":
        return "현재 운 흐름을 중심으로 이 관계가 앞으로 어떻게 전개될지 해석한다.";
    }
  }

  switch (verdict) {
    case "recommended":
      return "앞으로의 흐름은 질문한 결과로 이어질 가능성이 있는 쪽으로 판단한다.";

    case "conditionallyRecommended":
      return "질문한 결과로 이어질 여지는 있지만, 조건과 변수에 따라 흐름의 방향과 성사 시점이 달라질 수 있다.";

    case "wait":
      return "질문한 가능성이 완전히 닫힌 것은 아니지만, 당장 결과가 현실화되기보다는 시기가 늦어지거나 흐름이 더 이어져야 하는 쪽으로 판단한다.";

    case "notRecommended":
      return "현재 흐름만 보면 질문한 결과로 이어질 가능성을 높게 보기 어렵다.";

    case "insufficientEvidence":
      return "현재 확보된 근거만으로 앞으로의 결과와 흐름의 방향을 확정하기 어렵다.";

    case "interpreted":
      return "요청한 기간에 나타나는 흐름을 중심으로 앞으로의 가능성과 전개 방향을 해석한다.";
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

function buildExistenceFallbackAnswer(
  topicLabel?:
    string,
): string {
  if (
    topicLabel
  ) {
    return `현재 정보만으로 관련 ${topicLabel}운·구조의 존재 여부를 확정하기 어렵다.`;
  }

  return "현재 정보만으로 관련 운이나 구조의 존재 여부를 확정하기 어렵다.";
}

function buildExistenceAnswerFromSource(
  source:
    ExistenceConclusionSource
    | undefined,
  verdict:
    DecisionVerdict,
): string {
  if (
    !source
    || !source
      .hasSpecificTopicEvidence
  ) {
    if (
      verdict
        === "insufficientEvidence"
    ) {
      return buildExistenceFallbackAnswer(
        source
          ?.topicLabel,
      );
    }

    return buildExistenceAnswer(
      verdict,
    );
  }

  const topicLabel =
    source
      .topicLabel;

  const [
    primaryStructure,
  ] =
    source
      .primaryStructureDescriptions;

  const [
    strongSupport,
  ] =
    source
      .strongSupportDescriptions;

  const [
    limitation,
  ] =
    source
      .limitationDescriptions;

  const [
    condition,
  ] =
    source
      .conditionDescriptions;

  if (
    source
      .supportLevel
    === "strong"
    && source
      .constraintLevel
    === "none"
  ) {
    if (
      primaryStructure
    ) {
      const structurePhrase =
        extractFirstClause(
          primaryStructure,
        );

      const structureMention =
        structurePhrase
          .includes(
            "구조",
          )
        || structurePhrase
          .length
        <= 60;

      if (
        structureMention
      ) {
        return `현재 확인된 근거에서는 ${structurePhrase}${structurePhrase.endsWith("구조") ? "가" : " 같은 구조가"} 확인되어, 관련 ${topicLabel}운·구조의 신호가 있는 쪽으로 본다.`;
      }
    }

    if (
      strongSupport
    ) {
      const supportPhrase =
        strongSupport
          .replace(
            /\.$/,
            "",
          )
          .trim();

      return `현재 확인된 근거에서는 ${supportPhrase} 등의 신호가 확인되어, 관련 ${topicLabel}운·구조가 작동할 여지가 있는 쪽으로 본다.`;
    }

    return `관련 ${topicLabel}운·구조를 뒷받침하는 근거가 확인된다.`;
  }

  if (
    source
      .constraintLevel
    !== "none"
    && source
      .constraintLevel
    !== "insufficient"
  ) {
    if (
      condition
      && primaryStructure
    ) {
      const structurePhrase =
        extractFirstClause(
          primaryStructure,
        );

      return `관련 ${topicLabel}운·구조를 뒷받침하는 ${structurePhrase}${structurePhrase.endsWith("구조") ? "가" : " 같은 근거가"} 확인되지만, ${condition} 조건에 따라 작동 범위가 달라질 수 있다.`;
    }

    if (
      limitation
    ) {
      return `일부 ${topicLabel}운·구조 관련 근거는 확인되지만, ${limitation} 등 약한 부분도 함께 있어 존재 여부를 단정하기는 어렵다.`;
    }

    return `관련 ${topicLabel}운·구조의 신호는 있으나 다른 조건과 함께 해석해야 한다.`;
  }

  if (
    source
      .supportLevel
    === "moderate"
  ) {
    if (
      limitation
    ) {
      return `일부 ${topicLabel}운·구조 관련 근거는 확인되지만, ${limitation} 등과 함께 해석해야 하므로 존재 여부를 단정하기는 어렵다.`;
    }

    return `관련 ${topicLabel}운·구조와 연결되는 일부 근거는 확인되지만, 현재 정보만으로 존재 여부를 확정하기는 어렵다.`;
  }

  return buildExistenceFallbackAnswer(
    topicLabel,
  );
}

function buildExistenceAnswer(
  verdict: DecisionVerdict,
): string {
  switch (verdict) {
    case "recommended":
      return "관련 운이나 구조의 신호가 확인되는 쪽으로 판단한다.";

    case "conditionallyRecommended":
      return "관련 신호는 있으나 조건과 맥락을 함께 확인해야 한다.";

    case "wait":
      return "당장 뚜렷한 신호로 보기 어렵지만 완전히 없는 흐름은 아니다.";

    case "notRecommended":
      return "현재 확인되는 범위에서는 관련 운이나 구조의 신호가 약한 쪽으로 판단한다.";

    case "insufficientEvidence":
      return "현재 정보만으로 관련 운이나 구조의 존재 여부를 확정하기 어렵다.";

    case "interpreted":
      return "관련 운이나 구조의 존재 여부를 중심으로 해석한다.";
  }
}

function buildReasonInterpretationAnswer(
  verdict: DecisionVerdict,
): string {
  switch (verdict) {
    case "recommended":
      return "질문한 현상은 현재 사주 구조와 반복되는 패턴이 함께 작용하는 흐름으로 해석된다.";

    case "conditionallyRecommended":
      return "질문한 현상은 단일 원인보다 구조적 특성과 조건이 맞물려 나타나는 흐름으로 해석된다.";

    case "wait":
      return "질문한 현상은 현재 국면과 맞지 않는 선택이 반복되면서 드러나는 경향으로 해석된다.";

    case "notRecommended":
      return "질문한 현상은 현재 구조와 충돌하는 요소가 누적되며 나타나는 흐름으로 해석된다.";

    case "insufficientEvidence":
      return "현재 확인된 근거만으로 질문한 현상의 원인을 단정하기 어렵다.";

    case "interpreted":
      return "질문한 현상을 사주 구조와 운 흐름 관점에서 해석한다.";
  }
}

function buildTraitInterpretationAnswer(
  verdict: DecisionVerdict,
): string {
  switch (verdict) {
    case "recommended":
      return "현재 사주 구조를 기준으로 보면 질문한 성향·특징은 뚜렷한 패턴으로 확인된다.";

    case "conditionallyRecommended":
      return "질문한 성향·특징은 여러 구조 요소가 함께 작용하는 패턴으로 확인되며, 맥락에 따라 다르게 드러날 수 있다.";

    case "wait":
      return "질문한 성향·특징은 현재 국면에서는 한쪽으로만 드러나기 쉬우며, 상황에 따라 다르게 나타날 수 있다.";

    case "notRecommended":
      return "현재 구조에서는 질문한 성향·특징이 한쪽으로 치우치기 쉬운 패턴으로 확인된다.";

    case "insufficientEvidence":
      return "현재 확인된 근거만으로 질문한 성향·특징을 단정하기 어렵다.";

    case "interpreted":
      return "질문한 성향·특징을 사주 구조 관점에서 해석한다.";
  }
}

function buildInterpretationAnswer(
  verdict: DecisionVerdict,
  intent: QuestionIntent,
): string {
  if (intent === "reason") {
    return buildReasonInterpretationAnswer(
      verdict,
    );
  }

  return buildTraitInterpretationAnswer(
    verdict,
  );
}

function buildWarningAnswer(
  source:
    WarningConclusionSource
    | undefined,
  verdict:
    DecisionVerdict,
): string {
  if (
    !source
    || !source
      .hasSpecificRiskEvidence
  ) {
    if (
      verdict
        === "insufficientEvidence"
    ) {
      return "현재 확보된 근거만으로 특정 위험을 단정하기보다, 확인된 위험 신호와 발생 조건을 구분해서 보는 것이 필요하다.";
    }

    return "현재 확인된 범위에서는 뚜렷한 위험 신호가 제한적이므로, 반복되는 부담 패턴과 조건 변화를 함께 지켜볼 필요가 있다.";
  }

  const [
    primaryRisk,
    secondaryRisk,
  ] =
    source
      .primaryRiskDescriptions;

  const [
    escalationCondition,
  ] =
    source
      .escalationConditionDescriptions;

  if (
    source
      .hasRepeatedPatternRisk
    && secondaryRisk
  ) {
    return `현재 확인된 근거에서는 ${primaryRisk}, ${secondaryRisk} 같은 반복 패턴이 겹칠 때 부담과 위험이 커질 가능성을 특히 경계할 필요가 있다.`;
  }

  if (
    primaryRisk
    && escalationCondition
  ) {
    return `현재 흐름에서는 ${primaryRisk}보다 ${escalationCondition} 상황에서 위험이 커질 수 있는 점을 특히 주의할 필요가 있다.`;
  }

  if (
    secondaryRisk
  ) {
    return `현재 확인된 근거에서는 ${primaryRisk}과(와) ${secondaryRisk}을(를) 특히 조심해야 할 요소로 본다.`;
  }

  return `현재 확인된 근거에서는 ${primaryRisk}을(를) 특히 주의할 필요가 있다.`;
}

function buildRecommendationAnswer(
  source:
    CareerRecommendationSource
    | undefined,
): string {
  if (
    !source
    || !source
      .hasSpecificRoleEvidence
  ) {
    return "현재 확보된 근거 범위에서는 특정 역할 하나를 단정하기보다, 강점이 나타나는 역할 조건을 중심으로 보는 것이 적합하다.";
  }

  const parts: string[] = [
    "현재 사주 구조를 기준으로 보면,",
    source
      .primaryRoleDirection!,
  ];

  if (
    source
      .workStyleDirection
    && source
      .workStyleDirection
    !== source
      .primaryRoleDirection
  ) {
    parts.push(
      `업무 방식은 ${source.workStyleDirection}`,
    );
  }

  let sentence =
    parts.join(" ");

  if (
    !sentence.endsWith(
      ".",
    )
  ) {
    sentence += ".";
  }

  if (
    source
      .lessSuitableDirection
  ) {
    sentence += ` 반면 ${source.lessSuitableDirection}`;

    if (
      !sentence.endsWith(
        ".",
      )
    ) {
      sentence += ".";
    }
  }

  return sentence;
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

  if (
    context.conclusionNature
      === "interpretation"
  ) {
    return buildInterpretationAnswer(
      verdict,
      context.intent,
    );
  }

  if (
    context.conclusionNature
      === "recommendation"
  ) {
    return buildRecommendationAnswer(
      context
        .careerRecommendation,
    );
  }

  if (
    context.conclusionNature
      === "warning"
  ) {
    return buildWarningAnswer(
      context
        .warningConclusion,
      verdict,
    );
  }

  if (
    context.conclusionNature
      === "existence"
  ) {
    return buildExistenceAnswerFromSource(
      context
        .existenceConclusion,
      verdict,
    );
  }

  if (
    context.conclusionNature
      === "prediction"
  ) {
    return buildPredictionAnswerFromSource(
      context
        .predictionConclusion,
      verdict,
      context.decisionTarget,
    );
  }

  if (
    context.analysisMode === "compatibility"
    && verdict === "wait"
  ) {
    return "관계를 지금 바로 확정하기보다는 두 사람 사이의 충돌과 부담 요소를 더 살펴본 뒤 판단하는 것이 좋다.";
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

    case "existence":
      return buildExistenceAnswer(verdict);

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
