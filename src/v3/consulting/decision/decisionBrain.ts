import type { HumanDestinyContext } from "../../types/humanDestinyContext";
import type { QuestionReaderResult } from "../question/questionReader";

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
  void humanContext;
  void question;

  return {
    thinkingOrder: [
      {
        step: "humanIdentity",
        priority: 1,
        reason: "사람의 본질을 가장 먼저 이해한다.",
      },
      {
        step: "lifePhase",
        priority: 2,
        reason: "현재 인생 국면을 먼저 판단한다.",
      },
      {
        step: "lifeDriver",
        priority: 3,
        reason: "삶을 움직이는 핵심 동력을 확인한다.",
      },
      {
        step: "survivalStyle",
        priority: 4,
        reason: "생존 방식과 대응 성향을 확인한다.",
      },
      {
        step: "repeatedPattern",
        priority: 5,
        reason: "반복되는 성공과 실패 패턴을 확인한다.",
      },
      {
        step: "question",
        priority: 6,
        reason: "질문을 현재 사람의 맥락 안에서 해석한다.",
      },
      {
        step: "decision",
        priority: 7,
        reason: "모든 정보를 종합하여 최종 판단한다.",
      },
    ],
  };
}