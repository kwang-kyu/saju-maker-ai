import type { HumanDestinyContext } from "../../types/humanDestinyContext.js";
import type { QuestionReaderResult } from "../question/questionReader.js";
import {
  buildBrainSnapshot,
  type BrainSnapshot,
} from "./brainSnapshot.js";

export type BrainStep =
  | "humanIdentity"
  | "lifePhase"
  | "lifeDriver"
  | "survivalStyle"
  | "repeatedPattern"
  | "question"
  | "decision";

export type BrainPriority = {
  step: BrainStep;
  priority: number;
  reason: string;
};

export type DecisionBrain = {
  snapshot: BrainSnapshot;

  question: {
    topic: QuestionReaderResult["topic"];
    intent: QuestionReaderResult["intent"];
    motive: QuestionReaderResult["motive"];
    decisionTarget: QuestionReaderResult["decisionTarget"];
    urgency: QuestionReaderResult["urgency"];
    asksWhat: string;
    asksWhy: string;
    decisionQuestion: string;
  };

  thinkingOrder: BrainPriority[];
};

/**
 * Digital Philosophy Master의 사고 순서
 *
 * 절대 원칙
 * --------------------------
 * 질문보다 사람을 먼저 읽는다.
 * 현재 국면을 먼저 읽는다.
 * 반복되는 인생 패턴을 먼저 확인한다.
 * 질문은 마지막에 해석한다.
 * 판단은 가장 마지막 단계에서 수행한다.
 */
export function buildDecisionBrain(
  humanContext: HumanDestinyContext,
  question: QuestionReaderResult,
): DecisionBrain {
  const snapshot = buildBrainSnapshot(humanContext);

  return {
    snapshot,

    question: {
      topic: question.topic,
      intent: question.intent,
      motive: question.motive,
      decisionTarget: question.decisionTarget,
      urgency: question.urgency,
      asksWhat: question.asksWhat,
      asksWhy: question.asksWhy,
      decisionQuestion: question.decisionQuestion,
    },

    thinkingOrder: [
      {
        step: "humanIdentity",
        priority: 1,
        reason: snapshot.identity,
      },
      {
        step: "lifePhase",
        priority: 2,
        reason: snapshot.currentPhase,
      },
      {
        step: "lifeDriver",
        priority: 3,
        reason: snapshot.lifeDriver,
      },
      {
        step: "survivalStyle",
        priority: 4,
        reason: snapshot.survivalStyle,
      },
      {
        step: "repeatedPattern",
        priority: 5,
        reason: snapshot.repeatedPattern,
      },
      {
        step: "question",
        priority: 6,
        reason: [
          question.asksWhat,
          question.asksWhy,
          `결정 대상은 '${question.decisionQuestion}'이다.`,
        ].join(" "),
      },
      {
        step: "decision",
        priority: 7,
        reason:
          "사람의 본질, 현재 국면, 삶의 동력, 생존 방식, 반복 패턴과 질문을 종합해 최종 판단한다.",
      },
    ],
  };
}