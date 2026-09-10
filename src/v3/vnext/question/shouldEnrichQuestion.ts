/**
 * Reader 결과만으로 Interpreter enrichment 후보 여부를 결정하는 pure helper.
 * conversationPipeline 연결·Interpreter 호출은 상위 레이어 책임이다.
 */

import type {
  QuestionReaderResult,
} from "../../consulting/question/questionReader.js";

/**
 * topic fallback이 쓰였고 object가 unspecified인 경우만 enrichment 후보로 본다.
 * deictic / undefined / topic fallback 미사용은 모두 false.
 */
export function shouldEnrichQuestion(
  reader: Pick<
    QuestionReaderResult,
    "objectReferent" | "readerMatchDiagnostics"
  >,
): boolean {
  if (reader.readerMatchDiagnostics?.usedFallback.topic !== true) {
    return false;
  }

  if (reader.objectReferent === "deictic") {
    return false;
  }

  if (reader.objectReferent === "unspecified") {
    return true;
  }

  // objectReferent가 undefined인 경우 — 안전한 기본값
  return false;
}
