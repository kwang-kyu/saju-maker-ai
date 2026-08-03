import type {
  DecisionExplanationInput,
} from "./decisionResultReader";

import {
  buildReaderDecisionExplanation,
} from "./readerDecisionExplanationBuilder";

import {
  buildDecisionExplanationEvidence,
} from "./decisionExplanationEvidenceBuilder";

import {
  deduplicateExplanationLines,
} from "./decisionExplanationTextDeduplicator";

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
  step:
    ExplanationStep;

  title:
    string;

  required:
    boolean;

  content:
    string;
};

export type DecisionExplanationPlan = {
  originalQuestion:
    string;

  topic:
    DecisionExplanationInput["topic"];

  intent:
    DecisionExplanationInput["intent"];

  decisionTarget:
    DecisionExplanationInput["decisionTarget"];

  verdict:
    DecisionExplanationInput["verdict"];

  confidence:
    DecisionExplanationInput["confidence"];

  blocks:
    ExplanationBlock[];

  engineDecisionLocked:
    true;

  gptMayRejudge:
    false;
};

const CONTEXT_ALIGNMENT_KOREAN:
  Readonly<Record<string, string>> = {
    stronglyAligned:
      "현재 사람의 성향과 삶의 국면에 매우 잘 맞는다.",

    aligned:
      "현재 사람의 성향과 삶의 국면에 대체로 맞는다.",

    partiallyAligned:
      "일부는 맞지만 현실 조건을 보완해야 한다.",

    weaklyAligned:
      "현재 성향과 국면에 맞는 부분이 제한적이다.",

    notAligned:
      "현재 사람의 성향이나 삶의 국면과 맞지 않는다.",

    conflicting:
      "사람의 성향과 현재 현실 조건이 서로 충돌한다.",

    unknown:
      "현재 국면과의 정합성을 확정할 근거가 부족하다.",
  };

const ACTION_READINESS_KOREAN:
  Readonly<Record<string, string>> = {
    ready:
      "현재 실행을 시작할 준비가 되어 있다.",

    readyWithConditions:
      "필수 조건을 갖추면 실행할 수 있다.",

    needsPreparation:
      "실행 전에 준비와 검증이 더 필요하다.",

    notReady:
      "현재는 실행할 준비가 충분하지 않다.",

    blocked:
      "현재 조건에서는 실행을 막는 제약이 있다.",

    unknown:
      "실행 준비 상태를 확정할 정보가 부족하다.",
  };

function requireOriginalQuestion(
  question:
    string,
): string {
  const normalizedQuestion =
    question
      .trim();

  if (
    normalizedQuestion
      .length
    === 0
  ) {
    throw new Error(
      "Decision explanation requires the original question.",
    );
  }

  return normalizedQuestion;
}

function translateContextAlignment(
  contextAlignment:
    string,
): string {
  return (
    CONTEXT_ALIGNMENT_KOREAN[
      contextAlignment
    ]
    ?? "현재 사람의 성향과 삶의 국면을 기준으로 정합성을 판단했다."
  );
}

function translateActionReadiness(
  actionReadiness:
    string,
): string {
  return (
    ACTION_READINESS_KOREAN[
      actionReadiness
    ]
    ?? "제공된 조건을 기준으로 실행 준비 상태를 판단했다."
  );
}

/**
 * Decision Explanation Plan
 *
 * Decision Engine의 판단과 원문 질문을 함께 보존하고,
 * GPT가 어떤 순서로 설명해야 하는지만 정의한다.
 *
 * 새로운 판단을 생성하지 않는다.
 * verdict를 수정하지 않는다.
 * 근거를 변경하지 않는다.
 */
export function buildDecisionExplanationPlan(
  input:
    DecisionExplanationInput,
  originalQuestion:
    string,
): DecisionExplanationPlan {
  const normalizedQuestion =
    requireOriginalQuestion(
      originalQuestion,
    );

  const readerDecisionExplanation =
    buildReaderDecisionExplanation(
      input,
    );

  const evidenceContent =
    buildDecisionExplanationEvidence(
      input.evidence,
    );

  const evidenceLines =
    deduplicateExplanationLines(
      evidenceContent.split(
        /\r?\n/,
      ),
    );

  const conditionLines =
    deduplicateExplanationLines(
      input.conditions.map(
        (condition) =>
          condition.description,
      ),
      evidenceLines,
    );

  const riskLines =
    deduplicateExplanationLines(
      input.risks.map(
        (risk) =>
          risk.description,
      ),
      [
        ...evidenceLines,
        ...conditionLines,
      ],
    );

  const alignmentContent = [
    translateContextAlignment(
      input.contextAlignment,
    ),
    translateActionReadiness(
      input.actionReadiness,
    ),
  ].join(
    "\n",
  );

  const blocks:
    ExplanationBlock[] = [
      {
        step:
          "directAnswer",

        title:
          "질문에 대한 결론",

        required:
          true,

        content:
          input.directAnswer,
      },
      {
        step:
          "humanContext",

        title:
          "이 사람에게서 중요한 특성",

        required:
          true,

        content:
          input.reason,
      },
      {
        step:
          "alignment",

        title:
          "현재 국면과 질문의 관계",

        required:
          true,

        content:
          alignmentContent,
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
        step:
          "evidence",

        title:
          "이번 질문을 판단한 핵심 근거",

        required:
          evidenceLines.length
          > 0,

        content:
          evidenceLines.join(
            "\n",
          ),
      },
      {
        step:
          "conditions",

        title:
          "진행 전에 갖춰야 할 조건",

        required:
          conditionLines.length
          > 0,

        content:
          conditionLines.join(
            "\n",
          ),
      },
      {
        step:
          "risks",

        title:
          "이번 선택에서 주의할 위험",

        required:
          riskLines.length
          > 0,

        content:
          riskLines.join(
            "\n",
          ),
      },
      {
        step:
          "recommendedDirection",

        title:
          "권장하는 진행 방향",

        required:
          true,

        content:
          input.recommendedDirection,
      },
      {
        step:
          "prohibitedDirection",

        title:
          "피해야 할 진행 방식",

        required:
          true,

        content:
          input.prohibitedDirection,
      },
      {
        step:
          "finalDecision",

        title:
          "최종 판단",

        required:
          true,

        content:
          input.finalDecisionSentence,
      },
    ];

  return {
    originalQuestion:
      normalizedQuestion,

    topic:
      input.topic,

    intent:
      input.intent,

    decisionTarget:
      input.decisionTarget,

    verdict:
      input.verdict,

    confidence:
      input.confidence,

    blocks,

    engineDecisionLocked:
      true,

    gptMayRejudge:
      false,
  };
}
