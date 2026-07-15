import type {
    DecisionVerdict,
  } from "./decisionTypes";
  
  export function buildCoreDecision(
    verdict: DecisionVerdict,
    decisionQuestion: string,
  ): string {
    const verdictText: Record<
      DecisionVerdict,
      string
    > = {
      recommended: "진행하는 것이 맞다.",
      conditionallyRecommended:
        "조건을 갖춘 뒤 진행하는 것이 맞다.",
      wait:
        "지금은 바로 결정하지 말고 기다리는 것이 맞다.",
      notRecommended:
        "현재는 진행하지 않는 것이 맞다.",
      insufficientEvidence:
        "현재 정보만으로는 결정을 확정할 수 없다.",
    };
  
    return `${decisionQuestion}: ${verdictText[verdict]}`;
  }