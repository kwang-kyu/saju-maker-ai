import type {
  CounterpartSajuCalculation,
} from "./counterpartSajuCalculationBuilder";
import type {
  SajuFacts,
} from "../../types/sajuFacts";
import type { HumanDestinyContext } from "../../types/humanDestinyContext";
import type { HumanLifeContext } from "../../types/humanLifeContext";
import type { QuestionReaderResult } from "../question/questionReader";
import type { QuestionContext } from "../question/questionContext";
import type {
  RoleRecommendationAssessment,
} from "./roleRecommendationAssessment";
import type {
  LifeFlowInterpretationAssessment,
} from "./lifeFlowInterpretationAssessment";
import type {
  LifeFlowTarget,
} from "../question/lifeFlowTarget";
import type {
  SajuTargetPeriodLuckFlowFact,
} from "../../types/luckFlowFact";

/**
 * Decision Engine이 내릴 수 있는 최종 판단이다.
 *
 * GPT가 이 값을 변경하거나 새로 판단해서는 안 된다.
 */
export type DecisionVerdict =
  | "recommended"
  | "conditionallyRecommended"
  | "wait"
  | "notRecommended"
  | "insufficientEvidence"
  | "interpreted";

/**
 * 판단의 확실성이다.
 *
 * confidence는 질문 분석 정확도가 아니라,
 * 현재 Human Destiny Context를 기준으로
 * 해당 결론을 얼마나 분명하게 내릴 수 있는지를 의미한다.
 */
export type DecisionConfidence = "high" | "medium" | "low";

/**
 * 사람의 현재 국면과 질문 속 선택이
 * 서로 맞는지 또는 충돌하는지를 나타낸다.
 */
export type ContextAlignment =
  | "stronglyAligned"
  | "aligned"
  | "partiallyAligned"
  | "conflicted"
  | "stronglyConflicted"
  | "unknown";

/**
 * 현재 바로 행동할 수 있는지를 나타낸다.
 */
export type ActionReadiness =
  | "ready"
  | "readyWithConditions"
  | "preparationRequired"
  | "delayRequired"
  | "stopRequired"
  | "unknown";

/**
 * 판단 근거가 어디에서 나왔는지 구분한다.
 */
export type DecisionEvidenceSource =
  | "humanIdentity"
  | "lifePhase"
  | "repeatedPattern"
  | "lifeDriver"
  | "survivalStyle"
  | "capacity"
  | "money"
  | "career"
  | "relationship"
  | "health"
  | "blessing"
  | "destiny"
  | "questionIntent"
  | "currentContext"
  | "lifeContext"
  | "compatibility"
  | "roleRecommendation";

/**
 * Decision Engine이 사용하는 개별 판단 근거다.
 */
export type DecisionEvidence = {
  source: DecisionEvidenceSource;
  key: string;
  description: string;
  weight: number;
};

/**
 * 해당 선택을 실행하기 전에 반드시 충족해야 하는 조건이다.
 */
export type DecisionCondition = {
  key: string;
  description: string;
  required: boolean;
  satisfied: boolean;
};

/**
 * 해당 선택에서 예상되는 위험 요소다.
 */
export type DecisionRisk = {
  key: string;
  description: string;
  severity: "high" | "medium" | "low";
  source: DecisionEvidenceSource;
};

/**
 * 엔진이 판단한 구체적인 실행 형태다.
 *
 * Verdict가 선택의 가능 여부를 결정한다면,
 * DecisionShape는 그 선택을 어떤 방식으로
 * 실행해야 하는지를 구조화한다.
 */
export type DecisionShape = {
  recommendationType: string;
  executionScale: string;
  executionStyle: string;
  priority: string;
  avoid: string[];
};
/**
 * 현재 국면과 질문이 충돌하는 지점이다.
 */
export type DecisionConflict = {
  exists: boolean;
  description: string;
  humanContextSide: string;
  questionSide: string;
};

/**
 * Decision Engine에 들어오는 입력이다.
 *
 * 질문만으로는 Decision Engine을 실행할 수 없다.
 * 반드시 Human Destiny Context가 먼저 존재해야 한다.
 */
export type DecisionEngineInput = {
  humanContext: HumanDestinyContext;

  lifeContext:
  HumanLifeContext;

/**
 * Calculator가 확정한 본인의 연주 간지다.
 *
 * 띠 기준 간이 궁합에서 연지를 추출할 때만 사용하며,
 * 질문이나 GPT가 새로 계산하지 않는다.
 */
selfYearGanZhi?:
  string;

/**
 * 상대방 출생정보가 정식 완료 경로를 충족했을 때
 * Calculator가 만든 상대방 원국 결과다.
 */
counterpartSaju?:
  CounterpartSajuCalculation;

/**
 * Calculator가 확정한 본인 SajuFacts다.
 *
 * fullCompatibility 근거를 만들 때 우선 사용하며,
 * 질문이나 GPT가 새로 계산하지 않는다.
 */
selfSajuFacts?:
  SajuFacts;

/**
 * Calculator가 확정한 본인 원국 결과다.
 *
 * 기존 호출부 호환을 위해 유지하며,
 * fullCompatibility는 selfSajuFacts를 우선한다.
 */
selfSajuCalculation?:
  CounterpartSajuCalculation["calculated"];

question:
  QuestionReaderResult;

  questionContext: QuestionContext;

  lifeFlowTarget?:
    LifeFlowTarget;

  targetPeriodLuckFlow?:
    SajuTargetPeriodLuckFlowFact;
};

/**
 * Decision Engine이 생성하는 최종 판단 결과다.
 *
 * 이 결과 이후 Advice Engine이 실행 전략을 만들고,
 * GPT는 이 결과를 자연어로 설명만 한다.
 */
export type DecisionResult = {
  verdict: DecisionVerdict;
  confidence: DecisionConfidence;

  contextAlignment: ContextAlignment;
  actionReadiness: ActionReadiness;

  decisionTarget: QuestionReaderResult["decisionTarget"];
  topic: QuestionReaderResult["topic"];
  intent: QuestionReaderResult["intent"];

  coreDecision: string;
  decisionReason: string;

  evidence: DecisionEvidence[];
  conditions: DecisionCondition[];
  risks: DecisionRisk[];

  conflict: DecisionConflict;

  recommendedDirection: string;
  prohibitedDirection: string;

  finalDecisionSentence: string;

  humanContextUsed: true;
  questionContextUsed: true;

  roleRecommendationAssessment?:
    RoleRecommendationAssessment | null;

  lifeFlowInterpretationAssessment?:
    LifeFlowInterpretationAssessment | null;
};
