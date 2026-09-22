/**
 * Multi-turn Live Answer Semantic Gate — probe index.
 *
 * production conversation path (initial → follow-up) 검증용.
 * 질문 문자열은 conversation pipeline verification과 동일 계열을 사용한다.
 *
 * verification-only. production / FSV1 / Gold / A–M harness를 변경하지 않는다.
 */

import type {
  FollowUpQuestionType,
} from "../conversation/followUpQuestionResolver.js";

export const VNEXT_LIVE_MULTI_TURN_ANSWER_SEMANTIC_GATE_PROBE_IDS = [
  "P1",
  "P2",
  "P3",
  "P4",
] as const;

export type VNextLiveMultiTurnAnswerSemanticGateProbeId =
  typeof VNEXT_LIVE_MULTI_TURN_ANSWER_SEMANTIC_GATE_PROBE_IDS[number];

export type VNextLiveMultiTurnAnswerSemanticGateExpectedFollowUpType =
  | FollowUpQuestionType
  | "initial";

export type VNextLiveMultiTurnAnswerSemanticGateProbeKind =
  | "continuation"
  | "newQuestion"
  | "clarificationAnswer"
  | "timeRefinement";

export type VNextLiveMultiTurnAnswerSemanticGateProbe = {
  id: VNextLiveMultiTurnAnswerSemanticGateProbeId;
  kind: VNextLiveMultiTurnAnswerSemanticGateProbeKind;
  initialQuestion: string;
  followUpQuestion: string;
  expectedFollowUpType: FollowUpQuestionType;
  /**
   * clarificationAnswer 등 환경에 따라 분류가 흔들릴 수 있는 probe.
   * true이면 classification instability를 semantic failure로 오판하지 않는다.
   */
  allowClassificationInstability: boolean;
  notes: string;
};

/**
 * 최소 4 probes. initial → follow-up 동일 session 순서.
 */
export const VNEXT_LIVE_MULTI_TURN_ANSWER_SEMANTIC_GATE_PROBES:
  readonly VNextLiveMultiTurnAnswerSemanticGateProbe[] = [
    {
      id: "P1",
      kind: "continuation",
      initialQuestion: "10월 금전운은?",
      followUpQuestion: "조금 더 자세히 말해줘",
      expectedFollowUpType: "continuation",
      allowClassificationInstability: false,
      notes:
        "previous assessment reuse. follow-up answer는 initial locked "
        + "decision / direction / risks와 의미적으로 동일해야 한다. "
        + "unsupported detail 생성 금지.",
    },
    {
      id: "P2",
      kind: "newQuestion",
      initialQuestion: "10월 금전운은?",
      followUpQuestion: "그러면 이직은 어때?",
      expectedFollowUpType: "newQuestion",
      allowClassificationInstability: false,
      notes:
        "새 질문에 대한 새 analysis. follow-up RC만 ground truth. "
        + "이전 금전 결론을 이직 판단에 이식하지 않는다.",
    },
    {
      id: "P3",
      kind: "clarificationAnswer",
      initialQuestion: "상대방과 궁합은 어떤가요?",
      followUpQuestion: "유시입니다",
      expectedFollowUpType: "clarificationAnswer",
      allowClassificationInstability: true,
      notes:
        "clarification 턴 자체는 GPT semantic gate 대상이 아니다. "
        + "merge 이후 consulting answer turn이 있으면 그 turn만 평가한다. "
        + "분류가 안정적이지 않으면 classification instability로 기록한다.",
    },
    {
      id: "P4",
      kind: "timeRefinement",
      initialQuestion: "10월 금전운은?",
      followUpQuestion: "그러면 10월 중순은?",
      expectedFollowUpType: "timeRefinement",
      allowClassificationInstability: false,
      notes:
        "새 turn ResponseContext가 ground truth. "
        + "동일 월 timeRefinement(예: 10월→10월 중순)에서는 "
        + "timePeriodKey가 유지될 수 있다. "
        + "partial + humanState reuse + assessment/timeState refresh "
        + "경로를 따르며 initial 월 전체 판정을 그대로 고착시키지 않는다. "
        + "월 identity 변경(예: 10월→11월) key 검증은 "
        + "conversationPipelineVerification에 맡긴다.",
    },
  ];

export function getVNextLiveMultiTurnAnswerSemanticGateProbe(
  id: VNextLiveMultiTurnAnswerSemanticGateProbeId,
): VNextLiveMultiTurnAnswerSemanticGateProbe {
  const match = VNEXT_LIVE_MULTI_TURN_ANSWER_SEMANTIC_GATE_PROBES.find(
    (item) => item.id === id,
  );

  if (!match) {
    throw new Error(`Multi-turn semantic gate probe not found: ${id}`);
  }

  return match;
}
