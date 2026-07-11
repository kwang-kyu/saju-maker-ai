import type { DecisionEngineInput, DecisionResult } from "./decisionTypes";

/**
 * Decision Engine
 *
 * 역할
 * - Human Destiny Context와 Question Reader 결과를 함께 해석한다.
 * - 실제 판단은 여기서 수행한다.
 * - GPT는 이 결과를 설명만 한다.
 */
export function runDecisionEngine(
  input: DecisionEngineInput,
): DecisionResult {
  void input;

  throw new Error("Decision Engine is not implemented yet.");
}