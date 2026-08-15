import type {
    DecisionEngineInput,
    DecisionResult,
  } from "./decisionTypes";
  import type {
    RoleRecommendationAssessment,
  } from "./roleRecommendationAssessment";
  
  export type DecisionResultBuilderInput = {
    decisionInput: DecisionEngineInput;
  
    verdict: DecisionResult["verdict"];
    confidence: DecisionResult["confidence"];
    contextAlignment: DecisionResult["contextAlignment"];
    actionReadiness: DecisionResult["actionReadiness"];
  
    coreDecision: DecisionResult["coreDecision"];
    decisionReason: DecisionResult["decisionReason"];
  
    evidence: DecisionResult["evidence"];
    conditions: DecisionResult["conditions"];
    risks: DecisionResult["risks"];
  
    currentPhaseDescription: string;
  
    recommendedDirection:
      DecisionResult["recommendedDirection"];
    prohibitedDirection:
      DecisionResult["prohibitedDirection"];

    finalDecisionSentence?:
      DecisionResult["finalDecisionSentence"];

    roleRecommendationAssessment?:
      RoleRecommendationAssessment | null;
  };
  
  function hasContextConflict(
    alignment: DecisionResult["contextAlignment"],
  ): boolean {
    return (
      alignment === "conflicted" ||
      alignment === "stronglyConflicted"
    );
  }
  
  /**
   * Decision Engine에서 확정된 판단 결과를
   * 최종 DecisionResult 형식으로 조립한다.
   *
   * 이 Builder는 새로운 판단을 만들지 않는다.
   * 각 Builder와 Resolver가 이미 확정한 결과만 결합한다.
   */
  export function buildDecisionResult(
    input: DecisionResultBuilderInput,
  ): DecisionResult {
    const {
      decisionInput,
      verdict,
      confidence,
      contextAlignment,
      actionReadiness,
      coreDecision,
      decisionReason,
      evidence,
      conditions,
      risks,
      currentPhaseDescription,
      recommendedDirection,
      prohibitedDirection,
      roleRecommendationAssessment,
      finalDecisionSentence:
        inputFinalDecisionSentence,
    } = input;
  
    const conflictExists =
      hasContextConflict(contextAlignment);
  
    return {
      verdict,
      confidence,
  
      contextAlignment,
      actionReadiness,
  
      decisionTarget:
        decisionInput.question.decisionTarget,
      topic: decisionInput.question.topic,
      intent: decisionInput.question.intent,
  
      coreDecision,
      decisionReason,
  
      evidence,
      conditions,
      risks,
  
      conflict: {
        exists: conflictExists,
        description: conflictExists
          ? decisionReason
          : "현재 사람의 국면과 질문 속 선택 사이에 직접적인 충돌은 확인되지 않았다.",
        humanContextSide: currentPhaseDescription,
        questionSide:
          decisionInput.question.decisionQuestion,
      },
  
      recommendedDirection,
      prohibitedDirection,
  
      finalDecisionSentence:
        inputFinalDecisionSentence
        ?? [
          coreDecision,
          recommendedDirection,
        ].join(" "),
  
      humanContextUsed: true,
      questionContextUsed: true,

      roleRecommendationAssessment:
        roleRecommendationAssessment
        ?? null,
    };
  }