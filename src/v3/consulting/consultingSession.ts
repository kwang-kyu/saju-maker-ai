import type {
    SajuFactsPipelineResult,
  } from "../builders/sajuFactsPipelineBuilder";
  import type {
    MasterReaderEvidenceBundle,
  } from "../types/masterReaderEvidenceBundle";
  import type {
    HumanDestinyContext,
  } from "../types/humanDestinyContext";
  import type {
    HumanLifeContext,
  } from "../types/humanLifeContext";

  import type {
    DecisionResult,
  } from "./decision/decisionTypes";
  import type {
    QuestionContext,
  } from "./question/questionContext";
  import type {
    QuestionReaderResult,
  } from "./question/questionReader";
  import type {
    V3ConsultingSajuRequest,
    V3HumanLifeContextRequest,
  } from "./v3ConsultingRequest";

  /**
   * 연속 상담 세션의 현재 진행 상태다.
   *
   * awaitingClarification은 Decision Engine이
   * insufficientEvidence를 반환하여 구체적인 현실 정보를
   * 추가로 확인해야 하는 상태를 의미한다.
   */
  export type ConsultingSessionStatus =
    | "active"
    | "awaitingClarification"
    | "closed";

  /**
   * 세션 안에서 질문이 들어온 맥락을 구분한다.
   */
  export type ConsultingTurnKind =
    | "initial"
    | "followUp"
    | "clarification";

  /**
   * 현재 현실 정보의 변경 이력이다.
   *
   * 출생정보와 원국은 세션 동안 유지하지만,
   * 현재 현실은 사용자의 명시적인 변경이 있을 때만 갱신한다.
   */
  export type ConsultingLifeContextRevision = {
    revision: number;

    sourceInput:
      V3HumanLifeContextRequest;

    lifeContext:
      HumanLifeContext;

    updatedAt:
      string;
  };

  /**
   * 사용자와의 대화에서 명시적으로 확인된 현실 사실이다.
   *
   * Decision Evidence와 혼합하지 않으며,
   * 어떤 상담 턴에서 확인되었는지 추적한다.
   */
  export type ConsultingConfirmedField = {
    key: string;

    value: string;

    evidence: string[];
  };
  export type ConsultingConfirmedFact = {
    key: string;

    description: string;

    fields:
    ConsultingConfirmedField[];

    decisionTurnId: string;

    sourceTurnId: string;

    confirmedAt: string;
  };

    /**
   * 부족한 정보와 그 정보를 확인할 질문을
   * 하나의 항목으로 연결한다.
   */
    export type ConsultingClarificationItem = {
      key: string;

      description: string;

      question: string;
    };

    /**
     * insufficientEvidence 판정 이후
     * 사용자에게 확인해야 하는 구조화된 정보다.
     */
    export type ConsultingClarificationRequest = {
      decisionTurnId: string;

      items: [
        ConsultingClarificationItem,
        ...ConsultingClarificationItem[],
      ];
    };

  /**
   * 연속 상담의 질문 한 번과 그 처리 결과다.
   *
   * 후속 질문도 반드시 Question Reader부터 다시 실행하며,
   * GPT 답변만 저장하지 않고 엔진의 구조화된 결과를 함께 보존한다.
   */
  export type ConsultingTurn = {
    id: string;

    sequence: number;

    kind:
      ConsultingTurnKind;

    /**
 * 이번 턴에 사용자가 실제로 입력한 원문이다.
 *
 * clarification 턴에서는 추가정보 답변 조각이며,
 * 일반 follow-up 턴에서는 판단 질문과 같다.
 */
question:
string;

/**
* Decision Engine이 이 턴에서 실제로 판단한 질문이다.
*
* 기존 세션과 initial·follow-up 턴은 값이 없을 수 있으며,
* 그 경우 question을 판단 질문으로 사용한다.
*/
decisionQuestion?:
string;

lifeContextRevision:
number;

    questionReaderResult:
      QuestionReaderResult;

    questionContext:
      QuestionContext;

    decisionResult:
      DecisionResult;

    assistantAnswer:
      string;

    createdAt:
      string;
  };

  /**
   * 천운문 v3 연속 상담 세션이다.
   *
   * 사주는 최초 한 번 계산하고,
   * 원국·Facts·Master Profile·현재 국면을 세션에서 유지한다.
   *
   * 각 후속 질문은 저장된 사람 분석과 현재 현실을 사용하되,
   * Question Reader부터 Decision Engine과 Explanation까지
   * 전체 판단 경로를 다시 실행해야 한다.
   */
  export type ConsultingSession = {
    id: string;

    status:
      ConsultingSessionStatus;

    createdAt:
      string;

    updatedAt:
      string;

    sajuInput:
      V3ConsultingSajuRequest;

      sajuFacts:
    SajuFactsPipelineResult;

  readerEvidence:
    MasterReaderEvidenceBundle;

  humanContext:
    HumanDestinyContext;

    lifeContextHistory:
      [
        ConsultingLifeContextRevision,
        ...ConsultingLifeContextRevision[],
      ];

    turns:
      [
        ConsultingTurn,
        ...ConsultingTurn[],
      ];

    confirmedFacts:
      ConsultingConfirmedFact[];

    pendingClarification:
      ConsultingClarificationRequest | null;
  };
