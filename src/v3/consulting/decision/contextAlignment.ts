import type { HumanDestinyContext } from "../../types/humanDestinyContext";
import type { QuestionReaderResult } from "../question/questionReader";
import type { ContextAlignment } from "./decisionTypes";

export type ContextAlignmentResult = {
  alignment: ContextAlignment;
  reason: string;
};

/**
 * 현재는 기본 골격만 제공한다.
 *
 * 실제 정합성 판단 로직은
 * Human Destiny Context 구조가 모두 연결된 이후
 * 단계적으로 구현한다.
 */
export function analyzeContextAlignment(
  humanContext: HumanDestinyContext,
  question: QuestionReaderResult,
): ContextAlignmentResult {
  void humanContext;
  void question;

  return {
    alignment: "unknown",
    reason: "Context alignment has not been implemented yet.",
  };
}