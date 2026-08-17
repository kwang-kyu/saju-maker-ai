import type {
    DecisionCondition,
    DecisionEvidence,
    DecisionResult,
    DecisionRisk,
  } from "../decision/decisionTypes";

  export type DecisionExplanationEvidence = {
    source: DecisionEvidence["source"];
    description: string;
    importance: "core" | "supporting";
  };

  export type DecisionExplanationCondition = {
    key:
      DecisionCondition["key"];

    description: string;

    required: boolean;

    satisfied: boolean;
  };

  export type DecisionExplanationRisk = {
    key:
      DecisionRisk["key"];

    source:
      DecisionRisk["source"];

    description: string;

    severity:
      DecisionRisk["severity"];
  };

  export type DecisionExplanationInput = {
    verdict: DecisionResult["verdict"];
    confidence: DecisionResult["confidence"];

    topic: DecisionResult["topic"];
    intent: DecisionResult["intent"];
    decisionTarget: DecisionResult["decisionTarget"];

    contextAlignment: DecisionResult["contextAlignment"];
    actionReadiness: DecisionResult["actionReadiness"];

    directAnswer: string;
    reason: string;

    evidence: DecisionExplanationEvidence[];
    conditions: DecisionExplanationCondition[];
    risks: DecisionExplanationRisk[];

    conflictExists: boolean;
    conflictDescription: string;

    recommendedDirection: string;
    prohibitedDirection: string;

    finalDecisionSentence: string;

    roleRecommendationAssessment?:
      DecisionResult["roleRecommendationAssessment"];

    lifeFlowInterpretationAssessment?:
      DecisionResult["lifeFlowInterpretationAssessment"];

    engineDecisionLocked: true;
    gptMayRejudge: false;
  };

  function mapEvidence(
    evidence: DecisionEvidence[],
  ): DecisionExplanationEvidence[] {
    return evidence.map((item) => ({
      source: item.source,
      description: item.description,
      importance: item.weight >= 4 ? "core" : "supporting",
    }));
  }

  function mapConditions(
    conditions: DecisionCondition[],
  ): DecisionExplanationCondition[] {
    return conditions.map(
      (condition) => ({
        key:
          condition.key,

        description:
          condition.description,

        required:
          condition.required,

        satisfied:
          condition.satisfied,
      }),
    );
  }

  function mapRisks(
    risks: DecisionRisk[],
  ): DecisionExplanationRisk[] {
    return risks.map(
      (risk) => ({
        key:
          risk.key,

        source:
          risk.source,

        description:
          risk.description,

        severity:
          risk.severity,
      }),
    );
  }

  /**
   * Decision Result Reader
   *
   * Decision Engine이 생성한 최종 판단을
   * GPT가 설명할 수 있는 구조로 정리한다.
   *
   * 이 Reader는 새로운 판단을 만들지 않는다.
   * verdict, 방향, 위험, 조건을 변경하지 않는다.
   *
   * GPT는 이 결과를 자연어로 설명할 수 있지만
   * 엔진 판단을 재해석하거나 뒤집을 수 없다.
   */
  export function readDecisionResult(
    result: DecisionResult,
  ): DecisionExplanationInput {
    return {
      verdict: result.verdict,
      confidence: result.confidence,

      topic: result.topic,
      intent: result.intent,
      decisionTarget: result.decisionTarget,

      contextAlignment: result.contextAlignment,
      actionReadiness: result.actionReadiness,

      directAnswer: result.coreDecision,
      reason: result.decisionReason,

      evidence: mapEvidence(result.evidence),
      conditions: mapConditions(result.conditions),
      risks: mapRisks(result.risks),

      conflictExists: result.conflict.exists,
      conflictDescription: result.conflict.description,

      recommendedDirection: result.recommendedDirection,
      prohibitedDirection: result.prohibitedDirection,

      finalDecisionSentence: result.finalDecisionSentence,

      roleRecommendationAssessment:
        result.roleRecommendationAssessment
        ?? null,

      lifeFlowInterpretationAssessment:
        result.lifeFlowInterpretationAssessment
        ?? null,

      engineDecisionLocked: true,
      gptMayRejudge: false,
    };
  }
