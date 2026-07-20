import type {
    ReaderDecisionAssessment,
  } from "./readerDecisionAssessment";
  import type {
    DecisionEngineInput,
    DecisionVerdict,
  } from "./decisionTypes";
  
  export type ReaderDecisionVerdictBuilderInput = {
    verdict: DecisionVerdict;
  
    assessment:
      ReaderDecisionAssessment;
  
    urgency:
      DecisionEngineInput["question"]["urgency"];
  };
  
  function preserveBlockingVerdict(
    verdict: DecisionVerdict,
  ): boolean {
    return (
      verdict === "notRecommended"
      || verdict === "wait"
    );
  }
  
  function downgradeRecommendation(
    verdict: DecisionVerdict,
  ): DecisionVerdict {
    if (verdict === "recommended") {
      return "conditionallyRecommended";
    }
  
    return verdict;
  }
  
  export function applyReaderDecisionVerdictEffect(
    input:
      ReaderDecisionVerdictBuilderInput,
  ): DecisionVerdict {
    const {
      verdict,
      assessment,
      urgency,
    } = input;
  
    if (
      preserveBlockingVerdict(
        verdict,
      )
    ) {
      return verdict;
    }
  
    switch (
      assessment.constraintLevel
    ) {
      case "high":
        if (urgency === "immediate") {
          return "wait";
        }
  
        return downgradeRecommendation(
          verdict,
        );
  
      case "moderate":
        return downgradeRecommendation(
          verdict,
        );
  
      case "insufficient":
        return downgradeRecommendation(
          verdict,
        );
  
      case "none":
        return verdict;
    }
  }