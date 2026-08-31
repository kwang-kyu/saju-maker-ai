import type {
  DecisionCondition,
  DecisionRisk,
} from "./decisionTypes.js";

export type WarningConclusionSource = {
  primaryRiskDescriptions:
    string[];

  escalationConditionDescriptions:
    string[];

  hasSpecificRiskEvidence:
    boolean;

  hasRepeatedPatternRisk:
    boolean;
};

const SEVERITY_RANK: Record<
  DecisionRisk["severity"],
  number
> = {
  high: 3,
  medium: 2,
  low: 1,
};

function normalizeText(
  value:
    string,
): string {
  return value
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function sortRisksBySeverity(
  risks:
    readonly DecisionRisk[],
): DecisionRisk[] {
  return [
    ...risks,
  ].sort(
    (
      left,
      right,
    ) =>
      SEVERITY_RANK[
        right.severity
      ]
      - SEVERITY_RANK[
        left.severity
      ],
  );
}

function isRepeatedPatternRisk(
  risk:
    DecisionRisk,
): boolean {
  return risk
    .key
    .startsWith(
      "repeatedPattern",
    );
}

function pickEscalationConditions(
  conditions:
    readonly DecisionCondition[],
): string[] {
  return conditions
    .filter(
      (
        condition,
      ) =>
        condition.required
        && !condition.satisfied,
    )
    .map(
      (
        condition,
      ) =>
        normalizeText(
          condition.description,
        ),
    )
    .filter(
      (
        description,
      ) =>
        description.length
        > 0,
    )
    .slice(
      0,
      2,
    );
}

/**
 * Decision Engine이 이미 계산한 risks·conditions에서
 * warning형 결론에 사용할 기존 근거만 추출한다.
 */
export function buildWarningConclusionSource(
  risks:
    readonly DecisionRisk[],
  conditions:
    readonly DecisionCondition[],
): WarningConclusionSource {
  const sortedRisks =
    sortRisksBySeverity(
      risks,
    );

  const repeatedPatternRisks =
    sortedRisks.filter(
      isRepeatedPatternRisk,
    );

  const prioritizedRisks =
    repeatedPatternRisks.length
      > 0
      ? repeatedPatternRisks
      : sortedRisks;

  const primaryRiskDescriptions =
    prioritizedRisks
      .map(
        (
          risk,
        ) =>
          normalizeText(
            risk.description,
          ),
      )
      .filter(
        (
          description,
        ) =>
          description.length
          > 0,
      )
      .slice(
        0,
        2,
      );

  const escalationConditionDescriptions =
    pickEscalationConditions(
      conditions,
    );

  return {
    primaryRiskDescriptions,

    escalationConditionDescriptions,

    hasSpecificRiskEvidence:
      primaryRiskDescriptions.length
      > 0,

    hasRepeatedPatternRisk:
      repeatedPatternRisks.length
      > 0,
  };
}
