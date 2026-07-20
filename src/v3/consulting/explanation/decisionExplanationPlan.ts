import type { DecisionExplanationInput } from "./decisionResultReader";
import {
  buildReaderDecisionExplanation,
} from "./readerDecisionExplanationBuilder";
export type ExplanationStep =
  | "directAnswer"
  | "humanContext"
  | "alignment"
  | "readerDecisionEffect"
  | "evidence"
  | "conditions"
  | "risks"
  | "recommendedDirection"
  | "prohibitedDirection"
  | "finalDecision";

export type ExplanationBlock = {
  step: ExplanationStep;
  title: string;
  required: boolean;
  content: string;
};

export type DecisionExplanationPlan = {
  verdict: DecisionExplanationInput["verdict"];
  confidence: DecisionExplanationInput["confidence"];

  blocks: ExplanationBlock[];

  engineDecisionLocked: true;
  gptMayRejudge: false;
};

/**
 * Decision Explanation Plan
 *
 * Decision Engine의 판단을
 * GPT가 어떤 순서로 설명해야 하는지만 정의한다.
 *
 * 새로운 판단을 생성하지 않는다.
 * verdict를 수정하지 않는다.
 * 근거를 변경하지 않는다.
 */
export function buildDecisionExplanationPlan(
  input: DecisionExplanationInput,
): DecisionExplanationPlan {
  const readerDecisionExplanation =
  buildReaderDecisionExplanation(
    input,
  );
  const blocks: ExplanationBlock[] = [
    {
      step: "directAnswer",
      title: "결론",
      required: true,
      content: input.directAnswer,
    },
    {
      step: "humanContext",
      title: "현재 사람의 상태",
      required: true,
      content: input.reason,
    },
    {
      step: "alignment",
      title: "현재 국면과 질문의 정합성",
      required: true,
      content: `${input.contextAlignment} / ${input.actionReadiness}`,
    },
    {
      step:
        "readerDecisionEffect",

      title:
        readerDecisionExplanation
          .title,

      required:
        readerDecisionExplanation
          .required,

      content:
        readerDecisionExplanation
          .content,
    },
    {
      step: "evidence",
      title: "판단 근거",
      required: true,
      content: input.evidence
        .map((e) => e.description)
        .join("\n"),
    },
    {
      step: "conditions",
      title: "필수 조건",
      required: input.conditions.length > 0,
      content: input.conditions
        .map((c) => c.description)
        .join("\n"),
    },
    {
      step: "risks",
      title: "주의할 위험",
      required: input.risks.length > 0,
      content: input.risks
        .map((r) => r.description)
        .join("\n"),
    },
    {
      step: "recommendedDirection",
      title: "권장 방향",
      required: true,
      content: input.recommendedDirection,
    },
    {
      step: "prohibitedDirection",
      title: "피해야 할 방향",
      required: true,
      content: input.prohibitedDirection,
    },
    {
      step: "finalDecision",
      title: "최종 판단",
      required: true,
      content: input.finalDecisionSentence,
    },
  ];

  return {
    verdict: input.verdict,
    confidence: input.confidence,

    blocks,

    engineDecisionLocked: true,
    gptMayRejudge: false,
  };
}