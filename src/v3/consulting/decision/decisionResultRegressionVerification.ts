import type {
    DecisionResult,
  } from "./decisionTypes";
  
  export type DecisionResultRegressionComparison = {
    verdictMatched: boolean;
    confidenceMatched: boolean;
  
    contextAlignmentMatched: boolean;
    actionReadinessMatched: boolean;
  
    decisionTargetMatched: boolean;
    topicMatched: boolean;
    intentMatched: boolean;
  
    coreDecisionMatched: boolean;
    decisionReasonMatched: boolean;
  
    evidenceMatched: boolean;
    conditionsMatched: boolean;
    risksMatched: boolean;
  
    conflictMatched: boolean;
  
    recommendedDirectionMatched: boolean;
    prohibitedDirectionMatched: boolean;
  
    finalDecisionSentenceMatched: boolean;
  
    humanContextUsedMatched: boolean;
    questionContextUsedMatched: boolean;
  
    passed: boolean;
  };
  
  function areValuesEqual(
    actual: unknown,
    expected: unknown,
  ): boolean {
    return (
      JSON.stringify(actual) ===
      JSON.stringify(expected)
    );
  }
  
  /**
   * Builder 분리나 내부 구조 변경 이후에도
   * DecisionResult의 최종 판단이 그대로 유지되는지 검증한다.
   *
   * 이 함수는 새로운 판단을 생성하지 않는다.
   * 실제 엔진 결과와 사전에 확정된 기대 결과를
   * 필드별로 비교만 한다.
   */
  export function compareDecisionResultRegression(
    actual: DecisionResult,
    expected: DecisionResult,
  ): DecisionResultRegressionComparison {
    const verdictMatched =
      actual.verdict === expected.verdict;
  
    const confidenceMatched =
      actual.confidence === expected.confidence;
  
    const contextAlignmentMatched =
      actual.contextAlignment ===
      expected.contextAlignment;
  
    const actionReadinessMatched =
      actual.actionReadiness ===
      expected.actionReadiness;
  
    const decisionTargetMatched =
      actual.decisionTarget ===
      expected.decisionTarget;
  
    const topicMatched =
      actual.topic === expected.topic;
  
    const intentMatched =
      actual.intent === expected.intent;
  
    const coreDecisionMatched =
      actual.coreDecision === expected.coreDecision;
  
    const decisionReasonMatched =
      actual.decisionReason === expected.decisionReason;
  
    const evidenceMatched = areValuesEqual(
      actual.evidence,
      expected.evidence,
    );
  
    const conditionsMatched = areValuesEqual(
      actual.conditions,
      expected.conditions,
    );
  
    const risksMatched = areValuesEqual(
      actual.risks,
      expected.risks,
    );
  
    const conflictMatched = areValuesEqual(
      actual.conflict,
      expected.conflict,
    );
  
    const recommendedDirectionMatched =
      actual.recommendedDirection ===
      expected.recommendedDirection;
  
    const prohibitedDirectionMatched =
      actual.prohibitedDirection ===
      expected.prohibitedDirection;
  
    const finalDecisionSentenceMatched =
      actual.finalDecisionSentence ===
      expected.finalDecisionSentence;
  
    const humanContextUsedMatched =
      actual.humanContextUsed ===
      expected.humanContextUsed;
  
    const questionContextUsedMatched =
      actual.questionContextUsed ===
      expected.questionContextUsed;
  
    const passed =
      verdictMatched &&
      confidenceMatched &&
      contextAlignmentMatched &&
      actionReadinessMatched &&
      decisionTargetMatched &&
      topicMatched &&
      intentMatched &&
      coreDecisionMatched &&
      decisionReasonMatched &&
      evidenceMatched &&
      conditionsMatched &&
      risksMatched &&
      conflictMatched &&
      recommendedDirectionMatched &&
      prohibitedDirectionMatched &&
      finalDecisionSentenceMatched &&
      humanContextUsedMatched &&
      questionContextUsedMatched;
  
    return {
      verdictMatched,
      confidenceMatched,
  
      contextAlignmentMatched,
      actionReadinessMatched,
  
      decisionTargetMatched,
      topicMatched,
      intentMatched,
  
      coreDecisionMatched,
      decisionReasonMatched,
  
      evidenceMatched,
      conditionsMatched,
      risksMatched,
  
      conflictMatched,
  
      recommendedDirectionMatched,
      prohibitedDirectionMatched,
  
      finalDecisionSentenceMatched,
  
      humanContextUsedMatched,
      questionContextUsedMatched,
  
      passed,
    };
  }