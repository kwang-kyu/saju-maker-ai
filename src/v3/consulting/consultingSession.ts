import type {
    SajuFactsPipelineResult,
  } from "../builders/sajuFactsPipelineBuilder";
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
  export type ConsultingConfirmedFact = {
    key: string;
  
    description: string;
  
    sourceTurnId: string;
  
    confirmedAt: string;
  };
  
  /**
   * insufficientEvidence 판정 이후
   * 사용자에게 구체적으로 확인해야 하는 정보다.
   *
   * 일반적인 장문 답변으로 끝내지 않고,
   * 실제로 부족한 현실 정보와 질문을 보존한다.
   */
  export type ConsultingClarificationRequest = {
    decisionTurnId: string;
  
    missingInformation:
      [string, ...string[]];
  
    questions:
      [string, ...string[]];
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
  
    question:
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