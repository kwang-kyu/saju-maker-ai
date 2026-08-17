import type {
    DecisionExplanationCondition,
    DecisionExplanationInput,
    DecisionExplanationRisk,
  } from "./decisionResultReader";
  import type {
    ReaderDecisionSource,
  } from "../decision/readerDecisionSelectionBuilder";

  export type ReaderDecisionExplanation = {
    required: boolean;

    title:
      "사람의 구조가 판단에 미친 영향";

    content: string;

    sources:
      ReaderDecisionSource[];

    conditionDescriptions:
      string[];

    riskDescriptions:
      string[];

    insufficientEvidence:
      boolean;
  };

  const READER_SOURCE_LABELS: Record<
    ReaderDecisionSource,
    string
  > = {
    capacity:
      "감당력",

    money:
      "재물 구조",

    career:
      "직업 구조",

    relationship:
      "관계 구조",

    health:
      "건강·회복 구조",

    blessing:
      "도움·기회 수용 구조",

    destiny:
      "장기 방향 구조",
  };

  const READER_SOURCES:
    ReaderDecisionSource[] = [
      "capacity",
      "money",
      "career",
      "relationship",
      "health",
      "blessing",
      "destiny",
    ];

  function isReaderDecisionSource(
    value: string,
  ): value is ReaderDecisionSource {
    return READER_SOURCES.some(
      (source) =>
        source === value,
    );
  }

  function extractSourceFromKey(
    key: string,
  ): ReaderDecisionSource | null {
    const [
      prefix,
      source,
    ] = key.split("-");

    if (
      prefix
        !== "readerDecisionCondition"
      && prefix
        !== "readerDecisionRisk"
    ) {
      return null;
    }

    if (
      !source
      || !isReaderDecisionSource(
        source,
      )
    ) {
      return null;
    }

    return source;
  }

  function isReaderCondition(
    condition:
      DecisionExplanationCondition,
  ): boolean {
    return (
      condition.key.startsWith(
        "readerDecisionCondition-",
      )
      || condition.key
        === "confirmReaderDecisionEvidence"
    );
  }

  function isReaderRisk(
    risk:
      DecisionExplanationRisk,
  ): boolean {
    return (
      risk.key.startsWith(
        "readerDecisionRisk-",
      )
      || risk.key
        === "insufficientReaderDecisionEvidence"
    );
  }

  function collectSources(
    conditions:
      DecisionExplanationCondition[],
    risks:
      DecisionExplanationRisk[],
  ): ReaderDecisionSource[] {
    const sources =
      new Set<ReaderDecisionSource>();

    for (const condition of conditions) {
      const source =
        extractSourceFromKey(
          condition.key,
        );

      if (source) {
        sources.add(source);
      }
    }

    for (const risk of risks) {
      if (
        isReaderDecisionSource(
          risk.source,
        )
      ) {
        sources.add(
          risk.source,
        );

        continue;
      }

      const source =
        extractSourceFromKey(
          risk.key,
        );

      if (source) {
        sources.add(source);
      }
    }

    return [
      ...sources,
    ];
  }

  function buildSourceDescription(
    sources:
      ReaderDecisionSource[],
  ): string {
    if (sources.length === 0) {
      return "질문 주제와 직접 관련된 사람의 구조";
    }

    return sources
      .map(
        (source) =>
          READER_SOURCE_LABELS[
            source
          ],
      )
      .join(", ");
  }

  function buildVerdictEffectDescription(
    input:
      DecisionExplanationInput,
    sourceDescription: string,
    insufficientEvidence: boolean,
  ): string {
    if (insufficientEvidence) {
      return [
        sourceDescription,
        "근거가 충분하지 않아 현재 상태만으로는 실행 가능성을 확정하지 않고, 추가 확인이 필요한 조건부 판단으로 반영했습니다.",
      ].join(" ");
    }

    switch (input.verdict) {
      case "wait":
        return [
          sourceDescription,
          "관련 판단에서 즉시 실행을 제한하는 근거가 확인되어, 현재는 바로 추진하지 않고 제한을 해소할 때까지 기다리는 판단에 반영했습니다.",
        ].join(" ");

      case "conditionallyRecommended":
        return [
          sourceDescription,
          "관련 판단에서 실행 전에 확인해야 할 제한이 확인되어, 무조건적인 진행이 아니라 조건을 갖춘 뒤 제한적으로 진행하는 판단에 반영했습니다.",
        ].join(" ");

      case "notRecommended":
        return [
          sourceDescription,
          "관련 판단에서 확인된 제한을 기존 비권장 판단을 상향하지 않고, 중단 또는 방향 재검토가 필요한 조건과 위험 근거에 반영했습니다.",
        ].join(" ");

        case "insufficientEvidence":
            return [
              sourceDescription,
              "와 질문에 직접 관련된 근거가 충분하지 않아 현재 상태만으로 결론을 확정하지 않고, 필요한 정보를 추가로 확인해야 하는 판단에 반영했습니다.",
            ].join(" ");

      case "recommended":
        return [
          sourceDescription,
          "관련 근거는 최종 판단을 임의로 상향하지 않으며, 현재 확정된 진행 판단의 조건과 위험 범위 안에서만 설명합니다.",
        ].join(" ");

      case "interpreted":
        return [
          sourceDescription,
          "관련 근거는 요청한 기간의 운 흐름 해석으로 반영했으며, 실행 여부를 대신 확정하지 않습니다.",
        ].join(" ");
    }
  }

  export function buildReaderDecisionExplanation(
    input:
      DecisionExplanationInput,
  ): ReaderDecisionExplanation {
    const readerConditions =
      input.conditions.filter(
        isReaderCondition,
      );

    const readerRisks =
      input.risks.filter(
        isReaderRisk,
      );

    const insufficientEvidence =
      readerConditions.some(
        (condition) =>
          condition.key
          === "confirmReaderDecisionEvidence",
      )
      || readerRisks.some(
        (risk) =>
          risk.key
          === "insufficientReaderDecisionEvidence",
      );

    const sources =
      collectSources(
        readerConditions,
        readerRisks,
      );

    const required =
      readerConditions.length > 0
      || readerRisks.length > 0;

    const sourceDescription =
      buildSourceDescription(
        sources,
      );

    return {
      required,

      title:
        "사람의 구조가 판단에 미친 영향",

      content:
        required
          ? buildVerdictEffectDescription(
              input,
              sourceDescription,
              insufficientEvidence,
            )
          : "",

      sources,

      conditionDescriptions:
        readerConditions.map(
          (condition) =>
            condition.description,
        ),

      riskDescriptions:
        readerRisks.map(
          (risk) =>
            risk.description,
        ),

      insufficientEvidence,
    };
  }
