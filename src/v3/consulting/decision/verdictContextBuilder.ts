import type {
    ActionReadiness,
    ContextAlignment,
    DecisionConfidence,
    DecisionEngineInput,
  } from "./decisionTypes";
  
  export type VerdictContext = {
    alignment: ContextAlignment;
    readiness: ActionReadiness;
    confidence: DecisionConfidence;
  
    primaryLifeDriver:
      DecisionEngineInput["humanContext"]["identity"]["profile"]["lifeDriver"]["primary"]["driver"];
  
    lifeDriverConfidence:
      DecisionEngineInput["humanContext"]["identity"]["profile"]["lifeDriver"]["primary"]["confidence"];
  
    primarySurvivalStyle:
      DecisionEngineInput["humanContext"]["identity"]["profile"]["survivalStyle"]["primary"]["style"];
  
    survivalStyleConfidence:
      DecisionEngineInput["humanContext"]["identity"]["profile"]["survivalStyle"]["primary"]["confidence"];
  
    currentPhase:
      DecisionEngineInput["humanContext"]["currentPhase"]["phase"];
  
    topic: DecisionEngineInput["question"]["topic"];
    intent: DecisionEngineInput["question"]["intent"];
    motive: DecisionEngineInput["question"]["motive"];
  
    decisionTarget:
      DecisionEngineInput["question"]["decisionTarget"];
  
    urgency:
      DecisionEngineInput["question"]["urgency"];
  };
  
  export type VerdictContextBuilderInput = {
    decisionInput: DecisionEngineInput;
    alignment: ContextAlignment;
    readiness: ActionReadiness;
    confidence: DecisionConfidence;
  };
  
  export function buildVerdictContext(
    input: VerdictContextBuilderInput,
  ): VerdictContext {
    const { decisionInput } = input;
  
    const primaryLifeDriver =
      decisionInput.humanContext.identity.profile.lifeDriver.primary;
  
    const primarySurvivalStyle =
      decisionInput.humanContext.identity.profile.survivalStyle.primary;
  
    return {
      alignment: input.alignment,
      readiness: input.readiness,
      confidence: input.confidence,
  
      primaryLifeDriver: primaryLifeDriver.driver,
      lifeDriverConfidence: primaryLifeDriver.confidence,
  
      primarySurvivalStyle: primarySurvivalStyle.style,
      survivalStyleConfidence: primarySurvivalStyle.confidence,
  
      currentPhase:
        decisionInput.humanContext.currentPhase.phase,
  
      topic: decisionInput.question.topic,
      intent: decisionInput.question.intent,
      motive: decisionInput.question.motive,
      decisionTarget:
        decisionInput.question.decisionTarget,
      urgency: decisionInput.question.urgency,
    };
  }