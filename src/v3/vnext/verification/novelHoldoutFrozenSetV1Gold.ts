/**
 * Frozen Set v1 — Gold Authoring (verification-only).
 *
 * Stage 6 (this file):
 * - FSV1-dedicated GoldRow / GOLD_SEALED stage / revision marker
 * - Reuses NovelHoldoutBlindGoldSnapshot (no new Gold snapshot type)
 * - GOLD_BY_SLOT_ID keyed by fsv1-* slotId
 * - Exactly 160 authored Gold (153 + Batch 11's 7 cherry-picked E/F/G)
 * - Batch 11 reaches P2 Freeze hard-completion floor (160); authoringComplete when every question slot is GOLD_SEALED
 *
 * Out of scope (later steps):
 * - Freeze / Reader / Selection / Novelty / Leakage
 * - Production consulting / Decision Engine paths
 */

import type { NovelHoldoutSeedSlotSpec } from "./novelHoldoutAllocationSchema.js";
import type { NovelHoldoutBlindGoldSnapshot } from "./novelHoldoutBlindGoldProtocol.js";
import type {
  NovelHoldoutAmbiguityLabel,
  NovelHoldoutFamily,
  NovelHoldoutGoldConfidence,
  NovelHoldoutMatchPolicy,
  NovelHoldoutNoveltyTier,
  NovelHoldoutTaxonomy,
} from "./novelHoldoutContract.js";
import {
  NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS,
  type NovelHoldoutFrozenSetV1AuthoredQuestion,
} from "./novelHoldoutFrozenSetV1Questions.js";

export const NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_STAGE = "GOLD_SEALED" as const;

export type NovelHoldoutFrozenSetV1GoldStage =
  typeof NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_STAGE;

/**
 * Unsealed holdout revision marker for Frozen Set v1 Gold.
 * Freeze / Novelty / Leakage gates run in later steps.
 */
export const NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_REVISION =
  "frozen-set-v1-gold-sealed-unfrozen" as const;

/**
 * FSV1 Gold row — slot metadata + sealed Blind Gold snapshot.
 * Does not embed BlindHoldoutV1AuthoredQuestion.
 * Questions remain in novelHoldoutFrozenSetV1Questions.ts.
 */
export type NovelHoldoutFrozenSetV1GoldRow = {
  slotId: string;
  question: string;
  family: NovelHoldoutFamily;
  taxonomyPrimary: NovelHoldoutTaxonomy;
  noveltyTier: readonly NovelHoldoutNoveltyTier[];
  stage: NovelHoldoutFrozenSetV1GoldStage;
  slot: NovelHoldoutSeedSlotSpec;
  gold: NovelHoldoutBlindGoldSnapshot;
};

type GoldOnly = NovelHoldoutBlindGoldSnapshot;

const ALLOWED_MATCH_POLICIES = new Set<NovelHoldoutMatchPolicy>([
  "semantic_core",
  "timing_sensitive",
  "ambiguous",
  "design_limit",
  "composite",
]);

const ALLOWED_GOLD_CONFIDENCE = new Set<NovelHoldoutGoldConfidence>([
  "high",
  "medium",
  "low",
]);

const ALLOWED_AMBIGUITY_LABELS = new Set<NovelHoldoutAmbiguityLabel>([
  "AMBIGUOUS",
  "DESIGN_LIMIT",
]);

const FORBIDDEN_GOLD_PAYLOAD_KEYS = [
  "verdict",
  "direction",
  "conditions",
  "risks",
  "evidence",
  "explanation",
  "readerActual",
  "actual",
  "gptResponse",
  "responseText",
  "openai",
] as const;

const FORBIDDEN_QUESTION_GOLD_KEYS = [
  "gold",
  "expectedTopic",
  "expectedIntent",
  "expectedDecisionTarget",
  "matchPolicy",
  "goldConfidence",
  "goldRationale",
] as const;

function sealed(
  questionRow: NovelHoldoutFrozenSetV1AuthoredQuestion,
  gold: GoldOnly,
): NovelHoldoutFrozenSetV1GoldRow {
  return {
    slotId: questionRow.slotId,
    question: questionRow.question,
    family: questionRow.family,
    taxonomyPrimary: questionRow.taxonomyPrimary,
    noveltyTier: questionRow.noveltyTier,
    stage: NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD_STAGE,
    slot: questionRow.slot,
    gold,
  };
}

/**
 * Independent Gold keyed by FSV1 slotId (`fsv1-*`).
 * Stage 10: Stage 2–9's 112 + Batch 8's 14 (126 total, authoring complete for current ceiling step).
 */
const GOLD_BY_SLOT_ID: Readonly<Record<string, GoldOnly>> = {
  // ── business-start (first unauthored) ───────────────────────────────
  "fsv1-biz-start-A-001": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "start",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "온라인만 팔던 물건을 처음 오프라인 점포로 내놓는 ‘시작’이 지금 가능한지를 묻는다.",
  },

  // ── business-continue (first unauthored) ────────────────────────────
  "fsv1-biz-continue-F-001": {
    expectedTopic: "business",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "composite",
    goldConfidence: "medium",
    goldRationale:
      "주축은 지금 운영 중인 매장을 유지하는 지속이고, 배달 비중을 높여 버티는 운영 조정은 부차 조건이다.",
    compositeNote:
      "primary=business continue; secondary=delivery-mix adjustment; scalar DT only",
  },

  // ── business-stop (first unauthored) ────────────────────────────────
  "fsv1-biz-stop-G-001": {
    expectedTopic: "business",
    expectedIntent: "termination",
    expectedDecisionTarget: "stop",
    expectedAnalysisMode: "decision",
    matchPolicy: "ambiguous",
    goldConfidence: "low",
    goldRationale:
      "손을 떼는 종료와 잠깐만 쉬는 일시 정지가 한 문장에서 갈려, 어느 쪽 문제로 볼지부터 열려 있다.",
    ambiguityLabel: "AMBIGUOUS",
  },

  // ── business-buy (first unauthored) ─────────────────────────────────
  "fsv1-biz-buy-F-001": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "composite",
    goldConfidence: "medium",
    goldRationale:
      "주축은 인쇄소를 넘겨받는 취득이고, 영업 방식만 손봐 이어간다는 운영 유지는 부차 조건이다.",
    compositeNote:
      "primary=business buy/acquire; secondary=keep existing patronage/ops; scalar DT only",
    boundaryAgainst: "business-continue",
  },

  // ── job-changeJob (first unauthored) ────────────────────────────────
  "fsv1-job-changeJob-B-001": {
    expectedTopic: "job",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "changeJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "병원 야간직에서 낮 근무 사무직으로 자리를 옮기는 직장 이동이 맞는지 평가를 묻는다.",
  },

  // ── job-leaveJob (first unauthored) ─────────────────────────────────
  "fsv1-job-leaveJob-G-001": {
    expectedTopic: "job",
    expectedIntent: "termination",
    expectedDecisionTarget: "leaveJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "ambiguous",
    goldConfidence: "low",
    goldRationale:
      "직장에서 완전히 발을 빼는 이탈과 잠시만 비우는 휴직성 부재가 한 선으로 흐려져 있다.",
    ambiguityLabel: "AMBIGUOUS",
  },

  // ── realEstate-buy (first unauthored) ───────────────────────────────
  "fsv1-re-buy-D-001": {
    expectedTopic: "realEstate",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "전세로 버티는 쪽과 대비해, 집을 마련하는 매수로 기울어도 되는지를 묻는다.",
    boundaryAgainst: "realEstate-continue",
  },

  // ── realEstate-continue (first unauthored) ──────────────────────────
  "fsv1-re-continue-F-001": {
    expectedTopic: "realEstate",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "composite",
    goldConfidence: "medium",
    goldRationale:
      "주축은 지금 가진 집을 유지하는 보유 지속이고, 방 하나만 단기 임대로 돌리는 활용은 부차 조건이다.",
    compositeNote:
      "primary=realEstate continue/hold; secondary=partial short-term rent; scalar DT only",
  },

  // ── realEstate-sell (first unauthored) ──────────────────────────────
  "fsv1-re-sell-G-001": {
    expectedTopic: "realEstate",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "sell",
    expectedAnalysisMode: "decision",
    matchPolicy: "ambiguous",
    goldConfidence: "low",
    goldRationale:
      "공동명의 지분 정리와 집 통째 매도가 겹쳐 보여, 매도 여부를 어느 쪽으로 볼지 경계가 열려 있다.",
    ambiguityLabel: "AMBIGUOUS",
  },

  // ── money-invest (first unauthored) ─────────────────────────────────
  "fsv1-money-invest-C-001": {
    expectedTopic: "money",
    expectedIntent: "possibility",
    expectedDecisionTarget: "invest",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "적금만 쌓아두다 일부를 시장에 태우는 투자 쪽이 흐름에 맞는지, 보는 기준을 열어 묻는다.",
  },

  // ── money-manageMoney (first unauthored) ────────────────────────────
  "fsv1-money-manageMoney-F-001": {
    expectedTopic: "money",
    expectedIntent: "method",
    expectedDecisionTarget: "manageMoney",
    expectedAnalysisMode: "decision",
    matchPolicy: "composite",
    goldConfidence: "medium",
    goldRationale:
      "주축은 월급을 통장별로 나눠 관리하는 운용 방식이고, 고정비 자동이체 순서 짜기는 같은 관리 축의 부차 조건이다.",
    compositeNote:
      "primary=money manageMoney; secondary=auto-bill order; scalar DT only",
  },

  // ── lifeDirection (first unauthored) ────────────────────────────────
  "fsv1-lifeDirection-G-001": {
    expectedTopic: "lifeDirection",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "confirmDirection",
    expectedAnalysisMode: "decision",
    matchPolicy: "ambiguous",
    goldConfidence: "low",
    goldRationale:
      "진로를 크게 틀어야 하는지 일시적 흔들림인지 갈리면서, 방향 확인으로 보고 판단해도 되는지 묻는다.",
    ambiguityLabel: "AMBIGUOUS",
  },

  // ── relationship (first unauthored) ─────────────────────────────────
  "fsv1-relationship-E-001": {
    expectedTopic: "relationship",
    expectedIntent: "possibility",
    expectedDecisionTarget: "partner",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "인연이 이어질지 흐려질지 윤곽이 흐린 가운데, 이 관계의 가능성을 어느 쪽으로 보고 판단할지 묻는다.",
  },

  // ── general (first unauthored) ──────────────────────────────────────
  "fsv1-general-F-001": {
    expectedTopic: "general",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "none",
    expectedAnalysisMode: "interpretation",
    matchPolicy: "composite",
    goldConfidence: "medium",
    goldRationale:
      "주축은 전반적인 흐름을 먼저 짚는 종합 판단이고, 가까운 선택들의 우선순위는 같은 질문 안의 부차 축이다.",
    compositeNote:
      "primary=general overall judgement; secondary=near-term priority order; scalar DT none",
  },

  // ── Stage 3: next unauthored slot per family (14) ───────────────────
  // business-start
  "fsv1-biz-start-A-002": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "start",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "집 근처 작은 베이커리를 새로 여는 창업 시작이, 지금 시점에 가능한 선택인지를 묻는다.",
  },

  // business-continue
  "fsv1-biz-continue-A-001": {
    expectedTopic: "business",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "3년째 운영 중인 동네 문구점을 당분간 그대로 가져가는 유지·지속 판단인지를 묻는다.",
  },

  // business-stop
  "fsv1-biz-stop-A-001": {
    expectedTopic: "business",
    expectedIntent: "termination",
    expectedDecisionTarget: "stop",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "야간 포장마차 영업을 여기서 정리·종료하는 쪽이 맞는지, 종료 축으로 판단을 묻는다.",
  },

  // business-buy
  "fsv1-biz-buy-A-001": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "이사 가는 동네 세탁소를 통째로 사들이는 사업체 취득이 지금 가능한지를 묻는다.",
  },

  // job-changeJob
  "fsv1-job-changeJob-A-001": {
    expectedTopic: "job",
    expectedIntent: "possibility",
    expectedDecisionTarget: "changeJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "제조 공장 자리를 두고 물류회사 사무직으로 이직하는 직장 이동이 이 시점에 가능한지를 묻는다.",
  },

  // job-leaveJob
  "fsv1-job-leaveJob-A-001": {
    expectedTopic: "job",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "leaveJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "다니던 콜센터를 그만두고 나오는 퇴사·이탈 판단이 지금 맞는지 평가를 묻는다.",
  },

  // realEstate-buy
  "fsv1-re-buy-A-001": {
    expectedTopic: "realEstate",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "아이 학군을 이유로 아파트를 새로 장만하는 매수가 가능한지를 묻는다.",
  },

  // realEstate-continue
  "fsv1-re-continue-A-001": {
    expectedTopic: "realEstate",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "지금 사는 빌라를 팔지 않고 그대로 보유·유지하는 쪽이 맞는지 지속 판단을 묻는다.",
    boundaryAgainst: "realEstate-sell",
  },

  // realEstate-sell
  "fsv1-re-sell-A-001": {
    expectedTopic: "realEstate",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "sell",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "부모님 집 한 채를 시장에 내놓는 매도 선택이 지금 괜찮은지 평가를 묻는다.",
  },

  // money-invest
  "fsv1-money-invest-A-001": {
    expectedTopic: "money",
    expectedIntent: "possibility",
    expectedDecisionTarget: "invest",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "퇴직금 일부를 펀드에 넣는 투자 투입이 가능한 선택인지를 묻는다.",
  },

  // money-manageMoney
  "fsv1-money-manageMoney-A-001": {
    expectedTopic: "money",
    expectedIntent: "method",
    expectedDecisionTarget: "manageMoney",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "카드값과 생활비를 주간 단위로 나눠 쓰는 현금 운용·관리 방식이 맞는지 묻는다.",
  },

  // lifeDirection
  "fsv1-lifeDirection-A-001": {
    expectedTopic: "lifeDirection",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "confirmDirection",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "지금 잡고 있는 삶의 큰 방향이 그대로여도 되는지, 방향 확인·평가를 묻는다.",
  },

  // relationship
  "fsv1-relationship-A-001": {
    expectedTopic: "relationship",
    expectedIntent: "possibility",
    expectedDecisionTarget: "partner",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "소개로 만난 사람과 인연을 이어갈 여지가 있는지, 관계 가능성을 묻는다.",
  },

  // general
  "fsv1-general-A-001": {
    expectedTopic: "general",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "none",
    expectedAnalysisMode: "interpretation",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "요즘 전반적인 기운이 어떤지, 큰 판단 축만 먼저 짚는 종합 해석을 묻는다.",
  },

  // ── Stage 4: next unauthored slot per family (14) ───────────────────
  // business-start
  "fsv1-biz-start-A-003": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "start",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "부업으로 키우던 수제 액세서리를 작은 작업실을 차려 본업으로 올리는, 사업 시작·확장의 가능 여부를 묻는다.",
  },

  // business-continue
  "fsv1-biz-continue-A-002": {
    expectedTopic: "business",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "손님이 들쭉날쭉한 베이커리라도 현재 운영 상태를 그대로 이어갈지, 유지·지속 축으로 판단을 묻는다.",
  },

  // business-stop
  "fsv1-biz-stop-A-002": {
    expectedTopic: "business",
    expectedIntent: "termination",
    expectedDecisionTarget: "stop",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "임대료가 오른 지하 옷가게를 이번 시즌 뒤 접는 쪽, 즉 영업 종료로 볼지 판단을 묻는다.",
  },

  // business-buy
  "fsv1-biz-buy-A-002": {
    expectedTopic: "business",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "은퇴 매물로 나온 카페를 인수하는 취득 선택이 지금 맞는지 평가를 묻는다.",
    boundaryAgainst: "business-continue",
  },

  // job-changeJob
  "fsv1-job-changeJob-A-002": {
    expectedTopic: "job",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "changeJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "간호조무사 자리에서 제약 영업직으로 옮기는 직장 이동이 맞는지 평가를 묻는다.",
  },

  // job-leaveJob
  "fsv1-job-leaveJob-A-002": {
    expectedTopic: "job",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "leaveJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "야근이 잦아진 회계팀에서 나와 회사 밖으로 이탈하는 퇴사 판단이 맞는지 평가를 묻는다.",
  },

  // realEstate-buy
  "fsv1-re-buy-A-002": {
    expectedTopic: "realEstate",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "원룸을 나와 신혼집용 작은 빌라를 마련하는 매수가 맞는지 평가를 묻는다.",
  },

  // realEstate-continue
  "fsv1-re-continue-A-002": {
    expectedTopic: "realEstate",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "월세로 세를 주고 있는 다가구를 당분간 팔지 않고 보유·유지하는 쪽이 맞는지 지속 판단을 묻는다.",
    boundaryAgainst: "realEstate-sell",
  },

  // realEstate-sell
  "fsv1-re-sell-A-002": {
    expectedTopic: "realEstate",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "sell",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "아이 독립 후 비어 있는 옛집을 정리해 매도해도 될지, 처분 축으로 평가를 묻는다.",
  },

  // money-invest
  "fsv1-money-invest-A-002": {
    expectedTopic: "money",
    expectedIntent: "possibility",
    expectedDecisionTarget: "invest",
    expectedTimingType: "executionTiming",
    expectedAnalysisMode: "decision",
    matchPolicy: "timing_sensitive",
    goldConfidence: "medium",
    goldRationale:
      "여윳돈을 굴려 넣는 투자를 ‘지금 실행’해도 되는지, 실행 시점과 투자 가능 여부를 함께 묻는다.",
  },

  // money-manageMoney
  "fsv1-money-manageMoney-A-002": {
    expectedTopic: "money",
    expectedIntent: "method",
    expectedDecisionTarget: "manageMoney",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "보너스는 비상금 통장에, 생활비는 월급 통장만 쓰는 현금 분리·운용 방식이 맞는지 묻는다.",
  },

  // lifeDirection
  "fsv1-lifeDirection-A-002": {
    expectedTopic: "lifeDirection",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "confirmDirection",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "지방 근무를 이어가며 잡은 삶의 궤도가 이대로여도 되는지, 방향 확인·평가를 묻는다.",
  },

  // relationship
  "fsv1-relationship-A-002": {
    expectedTopic: "relationship",
    expectedIntent: "possibility",
    expectedDecisionTarget: "partner",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "동호회에서 자주 보는 사람과 따로 연락을 이어갈 관계 가능성이 있는지 묻는다.",
  },

  // general
  "fsv1-general-A-002": {
    expectedTopic: "general",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "none",
    expectedAnalysisMode: "interpretation",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "가족·일·돈이 한꺼번에 몰린 요즘이 전반적으로 무난한 흐름인지, 종합 해석을 묻는다.",
  },

  // ── Stage 5: next unauthored slot per family (14) ───────────────────
  // business-start
  "fsv1-biz-start-A-004": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "start",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "주말 수제청 판매를 평일 키오스크로 처음 펼치는 ‘시작’이 지금 흐름에서 가능한지를 묻는다.",
  },

  // business-continue
  "fsv1-biz-continue-A-003": {
    expectedTopic: "business",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "단골이 준 동네 세탁소를 접지 않고 당분간 그대로 굴릴지, 유지·지속 축으로 판단을 묻는다.",
    boundaryAgainst: "business-stop",
  },

  // business-stop
  "fsv1-biz-stop-A-003": {
    expectedTopic: "business",
    expectedIntent: "termination",
    expectedDecisionTarget: "stop",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "새벽 배송 반찬가게를 이번 달로 문을 닫는 쪽, 즉 영업 종료로 볼지 판단을 묻는다.",
  },

  // business-buy
  "fsv1-biz-buy-A-003": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "권리금·직원 승계 조건으로 분식집을 인수하는 취득이 가능한지 판단을 묻는다.",
    boundaryAgainst: "business-continue",
  },

  // job-changeJob
  "fsv1-job-changeJob-A-003": {
    expectedTopic: "job",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "changeJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "카페 알바를 접고 물류센터 주간직으로 자리를 옮기는 직장 이동이 맞는지 평가를 묻는다.",
  },

  // job-leaveJob
  "fsv1-job-leaveJob-A-003": {
    expectedTopic: "job",
    expectedIntent: "possibility",
    expectedDecisionTarget: "leaveJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "육아로 야간 교대를 버티기 어려워진 병원 자리를 퇴사해도 될지, 이탈 가능 여부를 묻는다.",
  },

  // realEstate-buy
  "fsv1-re-buy-A-003": {
    expectedTopic: "realEstate",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "먼 원룸을 나와 역세권 소형 오피스텔을 장만하는 매수가 가능한지 묻는다.",
  },

  // realEstate-continue
  "fsv1-re-continue-A-003": {
    expectedTopic: "realEstate",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "세입자 이탈 후 빈 상가를 당장 처분하지 않고 공실로 지켜볼지, 보유·유지 축으로 묻는다.",
    boundaryAgainst: "realEstate-sell",
  },

  // realEstate-sell
  "fsv1-re-sell-A-003": {
    expectedTopic: "realEstate",
    expectedIntent: "possibility",
    expectedDecisionTarget: "sell",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "관리비만 나가는 공실 투자 빌라를 처분해 현금을 마련해도 될지, 매도 가능 여부를 묻는다.",
  },

  // money-invest
  "fsv1-money-invest-A-003": {
    expectedTopic: "money",
    expectedIntent: "possibility",
    expectedDecisionTarget: "invest",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "축의금으로 주식형 펀드를 사도 될지, 투자·매수 가능 여부를 묻는다.",
  },

  // money-manageMoney
  "fsv1-money-manageMoney-A-003": {
    expectedTopic: "money",
    expectedIntent: "method",
    expectedDecisionTarget: "manageMoney",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "용돈은 현금, 공과금은 별도 통장으로 빼는 현금 분리·운용 방식이 맞는지 묻는다.",
  },

  // lifeDirection
  "fsv1-lifeDirection-A-003": {
    expectedTopic: "lifeDirection",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "confirmDirection",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "야간 공부를 이어가며 잡은 삶의 큰 줄기가 이대로여도 되는지, 방향 확인·평가를 묻는다.",
  },

  // relationship
  "fsv1-relationship-A-003": {
    expectedTopic: "relationship",
    expectedIntent: "possibility",
    expectedDecisionTarget: "partner",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "직장 동료와 퇴근 후 따로 만나 보는 인연을 이어갈 여지가 있는지, 관계 가능성을 묻는다.",
  },

  // general
  "fsv1-general-A-003": {
    expectedTopic: "general",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "none",
    expectedAnalysisMode: "interpretation",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "이사 준비와 건강 검진이 겹친 요즘의 전반 흐름을, 큰 축만 짚는 종합 해석으로 묻는다.",
  },

  // ── Stage 6: remaining unauthored slots (14) ────────────────────────
  // business-start
  "fsv1-biz-start-A-005": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "start",
    expectedTimingType: "executionTiming",
    expectedAnalysisMode: "decision",
    matchPolicy: "timing_sensitive",
    goldConfidence: "medium",
    goldRationale:
      "펫미용 자격 뒤 작은 샵을 차려 손님을 받기 시작하는 ‘시작’을, 지금 시점에 실행해도 되는지와 함께 묻는다.",
  },

  // business-continue
  "fsv1-biz-continue-A-004": {
    expectedTopic: "business",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "야간 영업만으로 버티는 노래방을 당분간 닫지 않고 유지할지, 지속·유지 축으로 판단을 묻는다.",
    boundaryAgainst: "business-stop",
  },

  // business-stop
  "fsv1-biz-stop-A-004": {
    expectedTopic: "business",
    expectedIntent: "termination",
    expectedDecisionTarget: "stop",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "부품 수급이 막힌 휴대폰 수리점을 이번 분기에 완전히 그만둘지, 영업 종료 축으로 판단을 묻는다.",
  },

  // business-buy
  "fsv1-biz-buy-A-004": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "재고·집기가 남은 중고서점을 매입해 자리를 이어가도 될지, 취득 가능 여부를 묻는다.",
    boundaryAgainst: "business-continue",
  },

  // job-changeJob
  "fsv1-job-changeJob-A-004": {
    expectedTopic: "job",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "changeJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "초등학교 기간제 교사에서 기업 교육 강사로 소속을 바꾸는 직장 이동이 이 시점에 맞는지 평가를 묻는다.",
  },

  // job-leaveJob
  "fsv1-job-leaveJob-A-004": {
    expectedTopic: "job",
    expectedIntent: "possibility",
    expectedDecisionTarget: "leaveJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "실적 압박이 커진 보험 설계사 자리를 놓고 나와도 될지, 퇴사·이탈 가능 여부를 묻는다.",
  },

  // realEstate-buy
  "fsv1-re-buy-A-004": {
    expectedTopic: "realEstate",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "부모님 병원 통원 때문에 근처 소형 아파트를 매수하는 선택이 지금 가능한지 묻는다.",
  },

  // realEstate-continue
  "fsv1-re-continue-A-004": {
    expectedTopic: "realEstate",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "상속받은 임야를 당장 개발하거나 팔지 않고 그대로 지켜볼지, 보유·유지 축으로 묻는다.",
    boundaryAgainst: "realEstate-sell",
  },

  // realEstate-sell
  "fsv1-re-sell-A-004": {
    expectedTopic: "realEstate",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "sell",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "도심 주차장을 매각해 목돈을 만드는 쪽이 지금 흐름에 맞을지, 처분 축으로 평가를 묻는다.",
  },

  // money-invest
  "fsv1-money-invest-A-004": {
    expectedTopic: "money",
    expectedIntent: "possibility",
    expectedDecisionTarget: "invest",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "연말 성과급을 ETF에 넣는 선택이 지금 가능한지, 투자·매수 가능 여부를 묻는다.",
  },

  // money-manageMoney
  "fsv1-money-manageMoney-A-004": {
    expectedTopic: "money",
    expectedIntent: "method",
    expectedDecisionTarget: "manageMoney",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "월급을 봉투별로 쪼개 쓰고 남는 금액만 저축하는 현금 분리·운용 방식이 맞는지 묻는다.",
  },

  // lifeDirection (B-tier — not an A-tier paraphrase clone)
  "fsv1-lifeDirection-B-001": {
    expectedTopic: "lifeDirection",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "confirmDirection",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "직장에 뿌리를 내릴지 해외 연수로 판을 바꿀지, 갈린 인생 방향을 어느 쪽으로 잡을지 확인을 묻는다.",
  },

  // relationship (B-tier — romance vs friendship fork)
  "fsv1-relationship-B-001": {
    expectedTopic: "relationship",
    expectedIntent: "possibility",
    expectedDecisionTarget: "partner",
    expectedAnalysisMode: "decision",
    matchPolicy: "ambiguous",
    goldConfidence: "medium",
    goldRationale:
      "이웃에서 연애로 번질 가능성과 친구에 머무는 편이 나은지가 한 문장에서 갈려, 어느 관계 축으로 볼지부터 열려 있다.",
    ambiguityLabel: "AMBIGUOUS",
  },

  // general (B-tier — blocked vs opening overall read)
  "fsv1-general-B-001": {
    expectedTopic: "general",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "none",
    expectedAnalysisMode: "interpretation",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "생활 리듬이 어긋나는 요즘이 큰 기운 면에서 막힌 시기인지 풀리는 중인지, 전반 흐름 해석을 묻는다.",
  },

  // ── Stage 7: next unauthored slot per family (14) ───────────────────
  // business-start
  "fsv1-biz-start-A-006": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "start",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "중고 카메라 수리 취미를 사업자 등록해 본업으로 처음 펼치는 ‘시작’이 지금 흐름에서 가능한지를 묻는다.",
  },

  // business-continue (B-tier — solo hold of shared pottery studio)
  "fsv1-biz-continue-B-001": {
    expectedTopic: "business",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "공동 작업실 도예 공방을 혼자 남아서라도 당분간 접지 않고 유지할지, 지속·유지 축으로 판단을 묻는다.",
    boundaryAgainst: "business-stop",
  },

  // business-stop (B-tier — unattended laundry wind-down)
  "fsv1-biz-stop-B-001": {
    expectedTopic: "business",
    expectedIntent: "termination",
    expectedDecisionTarget: "stop",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "계약이 끝나는 무인 빨래방을 이번 달로 완전히 접을지, 영업 종료 축으로 판단을 묻는다.",
  },

  // business-buy (B-tier — neighborhood gym acquire)
  "fsv1-biz-buy-B-001": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "회원·기구가 남은 동네 헬스장을 인수해 이어가도 될지, 취득 가능 여부를 묻는다.",
    boundaryAgainst: "business-continue",
  },

  // job-changeJob
  "fsv1-job-changeJob-A-005": {
    expectedTopic: "job",
    expectedIntent: "possibility",
    expectedDecisionTarget: "changeJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "편의점 야간 알바에서 택배 상하차 정규직으로 자리를 옮기는 직장 이동이 이 시점에 가능한지 묻는다.",
  },

  // job-leaveJob (B-tier — regular desk exit into freelance-only)
  "fsv1-job-leaveJob-B-001": {
    expectedTopic: "job",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "leaveJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "디자인팀 정규직을 놓고 프리랜서로만 나가는 이탈이 지금 맞는지, 퇴사 축으로 평가를 묻는다.",
  },

  // realEstate-buy (B-tier — rural settle purchase)
  "fsv1-re-buy-B-001": {
    expectedTopic: "realEstate",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "귀촌 준비로 시골 작은 주택을 매수하는 선택이 지금 가능한지 묻는다.",
  },

  // realEstate-continue (B-tier — hold vacant home during overseas work)
  "fsv1-re-continue-B-001": {
    expectedTopic: "realEstate",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "해외 근무 중 비워 둔 국내 아파트를 당장 팔지 않고 그대로 들고 갈지, 보유·유지 축으로 묻는다.",
    boundaryAgainst: "realEstate-sell",
  },

  // realEstate-sell (B-tier — idle mountain pension dispose)
  "fsv1-re-sell-B-001": {
    expectedTopic: "realEstate",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "sell",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "운영이 멈춘 산골 펜션을 매각해 정리하는 쪽이 지금 흐름에 맞을지, 처분 축으로 평가를 묻는다.",
  },

  // money-invest (B-tier — physical gold allocation)
  "fsv1-money-invest-B-001": {
    expectedTopic: "money",
    expectedIntent: "possibility",
    expectedDecisionTarget: "invest",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "월급 일부를 금 현물에 나눠 넣는 투자가 지금 가능한 선택인지 묻는다.",
  },

  // money-manageMoney (B-tier — joint household card routing)
  "fsv1-money-manageMoney-B-001": {
    expectedTopic: "money",
    expectedIntent: "method",
    expectedDecisionTarget: "manageMoney",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "부부 카드를 하나로 합치고 생활비만 공동 통장에서 빼는 현금·카드 운용 방식이 맞는지 묻는다.",
  },

  // lifeDirection (B-tier — caregiving weight vs career rebuild)
  "fsv1-lifeDirection-B-002": {
    expectedTopic: "lifeDirection",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "confirmDirection",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "부모님 돌봄에 무게를 둘지 커리어를 다시 키울지, 갈린 인생 방향을 어느 쪽으로 잡을지 확인을 묻는다.",
  },

  // relationship (B-tier — ex reconnect romance vs friend fork)
  "fsv1-relationship-B-002": {
    expectedTopic: "relationship",
    expectedIntent: "possibility",
    expectedDecisionTarget: "partner",
    expectedAnalysisMode: "decision",
    matchPolicy: "ambiguous",
    goldConfidence: "medium",
    goldRationale:
      "헤어진 사람과 다시 연락이 닿아 연인으로 이어갈 가능성과 친구로만 둘지가 한 문장에서 갈려, 어느 관계 축으로 볼지부터 열려 있다.",
    ambiguityLabel: "AMBIGUOUS",
  },

  // general (C-tier — open-form overall flow ask)
  "fsv1-general-C-001": {
    expectedTopic: "general",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "none",
    expectedAnalysisMode: "interpretation",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "이사·이직 이야기가 겹친 요즘의 전반 흐름을, 왜 그렇게 보이는지 근거부터 듣는 종합 해석으로 묻는다.",
  },

  // ── Stage 8: next unauthored slot per family (14) ───────────────────
  // business-start (B-tier — weekend sauce → food truck start)
  "fsv1-biz-start-B-001": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "start",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "주말 장터 수제 소스를 푸드트럭으로 처음 영업을 시작하는 ‘시작’이 지금 흐름에서 가능한지를 묻는다.",
  },

  // business-continue (B-tier — shared-kitchen lunchbox hold)
  "fsv1-biz-continue-B-002": {
    expectedTopic: "business",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "공유 주방 도시락 판매를 당분간 접지 않고 유지할지, 지속·유지 축으로 판단을 묻는다.",
    boundaryAgainst: "business-stop",
  },

  // business-stop (B-tier — beach sand playroom wind-down)
  "fsv1-biz-stop-B-002": {
    expectedTopic: "business",
    expectedIntent: "termination",
    expectedDecisionTarget: "stop",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "관광객이 끊긴 해변 모래놀이방을 이번 시즌으로 완전히 접을지, 영업 종료 축으로 판단을 묻는다.",
  },

  // business-buy (B-tier — self-service car wash acquire)
  "fsv1-biz-buy-B-002": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "기계·회원권이 남은 셀프 세차장을 인수해 이어가도 될지, 취득 가능 여부를 묻는다.",
    boundaryAgainst: "business-continue",
  },

  // job-changeJob (B-tier — hotel front → airline ground)
  "fsv1-job-changeJob-B-002": {
    expectedTopic: "job",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "changeJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "호텔 프론트에서 항공사 지상직으로 소속을 바꾸는 직장 이동이 이 시점에 맞는지 평가를 묻는다.",
  },

  // job-leaveJob (B-tier — school admin contract exit)
  "fsv1-job-leaveJob-B-002": {
    expectedTopic: "job",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "leaveJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "학교 행정실 계약을 갱신하지 않고 나오는 이탈이 지금 맞는지, 퇴사 축으로 평가를 묻는다.",
  },

  // realEstate-buy (B-tier — suburban garden plot purchase)
  "fsv1-re-buy-B-002": {
    expectedTopic: "realEstate",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "주말 텃밭용 근교 작은 토지를 매수하는 선택이 지금 가능한지 묻는다.",
  },

  // realEstate-continue (B-tier — joint condo hold during divorce)
  "fsv1-re-continue-B-002": {
    expectedTopic: "realEstate",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "이혼 소송 중 공동명의 아파트를 당장 팔지 않고 그대로 들고 갈지, 보유·유지 축으로 묻는다.",
    boundaryAgainst: "realEstate-sell",
  },

  // realEstate-sell (B-tier — idle coastal cottage dispose)
  "fsv1-re-sell-B-002": {
    expectedTopic: "realEstate",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "sell",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "쓰이지 않는 해안가 별장을 매각해 정리하는 쪽이 지금 흐름에 맞을지, 처분 축으로 평가를 묻는다.",
  },

  // money-invest (B-tier — corporate bond allocation)
  "fsv1-money-invest-B-002": {
    expectedTopic: "money",
    expectedIntent: "possibility",
    expectedDecisionTarget: "invest",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "여윳돈을 회사채에 나눠 넣는 투자가 지금 가능한 선택인지 묻는다.",
  },

  // money-manageMoney (B-tier — kids tuition silo routing)
  "fsv1-money-manageMoney-B-002": {
    expectedTopic: "money",
    expectedIntent: "method",
    expectedDecisionTarget: "manageMoney",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "아이 학원비를 별도 통장으로 떼어 두고 생활비와 섞지 않는 현금 운용 방식이 맞는지 묻는다.",
  },

  // lifeDirection (C-tier — open-form confirm-direction ask)
  "fsv1-lifeDirection-C-001": {
    expectedTopic: "lifeDirection",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "confirmDirection",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "지금 붙잡고 있는 삶의 궤도가 흔들리지 않는 축인지, 왜 그렇게 보이는지 근거부터 듣는 방향 확인으로 묻는다.",
  },

  // relationship (C-tier — open-form relationship-possibility ask)
  "fsv1-relationship-C-001": {
    expectedTopic: "relationship",
    expectedIntent: "possibility",
    expectedDecisionTarget: "partner",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "같은 학원에서 마주치는 보호자와의 인연이 관계로 번질 여지가 있는지, 왜 그렇게 보이는지 근거부터 듣는 관계 가능성으로 묻는다.",
  },

  // general (D-tier — overall vs domain-narrowing boundary)
  "fsv1-general-D-001": {
    expectedTopic: "general",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "none",
    expectedAnalysisMode: "interpretation",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "직장·돈 문제로 좁히기보다 요즘 전반 흐름을 먼저 봐야 할지, 종합 해석 축으로 경계를 묻는다.",
    boundaryAgainst: "lifeDirection",
  },

  // ── Stage 9: next unauthored slot per family (14) ───────────────────
  // business-start (B-tier — home bike repair → paid workshop start)
  "fsv1-biz-start-B-002": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "start",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "집에서만 고치던 자전거를 골목 작업실에서 유료 수리로 처음 영업을 시작하는 ‘시작’이 지금 흐름에서 가능한지를 묻는다.",
  },

  // business-continue (B-tier — weekend record shop hold)
  "fsv1-biz-continue-B-003": {
    expectedTopic: "business",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "주말 중고 레코드샵을 당분간 접지 않고 유지할지, 지속·유지 축으로 판단을 묻는다.",
    boundaryAgainst: "business-stop",
  },

  // business-stop (B-tier — indoor climbing gym wind-down)
  "fsv1-biz-stop-B-003": {
    expectedTopic: "business",
    expectedIntent: "termination",
    expectedDecisionTarget: "stop",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "예약이 끊긴 실내 클라이밍장을 이번 분기로 완전히 접을지, 영업 종료 축으로 판단을 묻는다.",
  },

  // business-buy (C-tier — open-form acquire ask)
  "fsv1-biz-buy-C-001": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "단골·암실 장비가 남은 사진관을 인수해 이어가도 될지, 왜 그렇게 보이는지 근거부터 듣는 취득 가능성으로 묻는다.",
    boundaryAgainst: "business-continue",
  },

  // job-changeJob (B-tier — museum docent → gallery admin)
  "fsv1-job-changeJob-B-003": {
    expectedTopic: "job",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "changeJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "박물관 도슨트에서 미술관 행정직으로 소속을 바꾸는 직장 이동이 이 시점에 맞는지 평가를 묻는다.",
  },

  // job-leaveJob (B-tier — broadcast assistant contract exit)
  "fsv1-job-leaveJob-B-003": {
    expectedTopic: "job",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "leaveJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "방송국 조연출 계약을 연장하지 않고 나오는 이탈이 지금 맞는지, 퇴사 축으로 평가를 묻는다.",
  },

  // realEstate-buy (B-tier — second-home hanok purchase)
  "fsv1-re-buy-B-003": {
    expectedTopic: "realEstate",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "세컨드하우스로 쓸 작은 한옥을 매수하는 선택이 지금 가능한지 묻는다.",
  },

  // realEstate-continue (C-tier — open-form hold ask)
  "fsv1-re-continue-C-001": {
    expectedTopic: "realEstate",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "재개발 지정만 기다리는 동안 낡은 다가구를 당장 팔지 않고 들고 갈지, 왜 그렇게 보이는지 근거부터 듣는 보유·유지로 묻는다.",
    boundaryAgainst: "realEstate-sell",
  },

  // realEstate-sell (C-tier — open-form dispose ask)
  "fsv1-re-sell-C-001": {
    expectedTopic: "realEstate",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "sell",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "관리가 버거운 전원주택을 매각해 정리하는 쪽이 맞는지, 왜 그렇게 보이는지 근거부터 듣는 처분 평가로 묻는다.",
  },

  // money-invest (B-tier — foreign sovereign bond allocation)
  "fsv1-money-invest-B-003": {
    expectedTopic: "money",
    expectedIntent: "possibility",
    expectedDecisionTarget: "invest",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "여윳돈을 해외 국채에 나눠 넣는 투자가 지금 가능한 선택인지 묻는다.",
  },

  // money-manageMoney (C-tier — open-form cash-routing ask)
  "fsv1-money-manageMoney-C-001": {
    expectedTopic: "money",
    expectedIntent: "method",
    expectedDecisionTarget: "manageMoney",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "고정비를 먼저 이체하고 남은 금액만 쓰는 관리 방식이 맞는지, 왜 그렇게 보이는지 근거부터 듣는 현금 운용으로 묻는다.",
  },

  // lifeDirection (D-tier — confirm-direction vs job-switch boundary)
  "fsv1-lifeDirection-D-001": {
    expectedTopic: "lifeDirection",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "confirmDirection",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "이직으로 판을 바꿀지와 대비해, 삶의 큰 방향을 그대로 두는 방향 확인으로 기울어도 되는지를 묻는다.",
    boundaryAgainst: "job-changeJob",
  },

  // relationship (D-tier — relationship-possibility vs business-partner boundary)
  "fsv1-relationship-D-001": {
    expectedTopic: "relationship",
    expectedIntent: "possibility",
    expectedDecisionTarget: "partner",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "동업자로만 남는 쪽과 대비해, 연인으로 번지는 관계 가능성으로 기울어도 되는지를 묻는다.",
    boundaryAgainst: "business-continue",
  },

  // general (D-tier — overall vs single-domain narrowing boundary)
  "fsv1-general-D-002": {
    expectedTopic: "general",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "none",
    expectedAnalysisMode: "interpretation",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "연애·이직 한 가지로 바로 결론 내기보다 지금 시기를 종합적으로 먼저 읽어야 할지, 종합 해석 축으로 경계를 묻는다.",
    boundaryAgainst: "relationship",
  },

  // ── Stage 10: next unauthored slot per family (14) ──────────────────
  // business-start (B-tier — hobby leather → paid atelier start)
  "fsv1-biz-start-B-003": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "start",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "취미 가죽 소품을 동네 공방에서 처음 판매로 내놓는 ‘시작’이 이 시점에 가능한지를 묻는다.",
  },

  // business-continue (C-tier — open-form hold ask)
  "fsv1-biz-continue-C-001": {
    expectedTopic: "business",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "골목 헌책방 운영을 접지 않고 당분간 유지해도 될지, 근거부터 듣는 지속·유지 축으로 묻는다.",
    boundaryAgainst: "business-stop",
  },

  // business-stop (C-tier — open-form wind-down ask)
  "fsv1-biz-stop-C-001": {
    expectedTopic: "business",
    expectedIntent: "termination",
    expectedDecisionTarget: "stop",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "손님 발길이 끊긴 만화카페를 이번 달로 완전히 접을지, 왜 그쪽으로 읽히는지부터 듣는 영업 종료 축으로 묻는다.",
  },

  // business-buy (C-tier — open-form acquire ask)
  "fsv1-biz-buy-C-002": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "설비·거래처가 남은 세탁소를 인수해 이어가도 될지, 왜 그 취득이 가능해 보이는지부터 듣는 취득 가능성으로 묻는다.",
    boundaryAgainst: "business-continue",
  },

  // job-changeJob (C-tier — open-form workplace-switch ask)
  "fsv1-job-changeJob-C-001": {
    expectedTopic: "job",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "changeJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "물류센터 야간직에서 낮 근무 콜센터로 소속을 바꾸는 직장 이동이 맞는지, 왜 그 이동이 맞다고 보이는지부터 듣는 평가로 묻는다.",
  },

  // job-leaveJob (C-tier — open-form exit ask)
  "fsv1-job-leaveJob-C-001": {
    expectedTopic: "job",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "leaveJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "연구소 계약직을 연장하지 않고 나오는 이탈이 지금 맞는지, 퇴사 축으로 근거부터 듣는 평가로 묻는다.",
  },

  // realEstate-buy (C-tier — open-form purchase ask)
  "fsv1-re-buy-C-001": {
    expectedTopic: "realEstate",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "부모님 근처 소형 아파트를 매수하는 선택이 지금 가능한지, 왜 그쪽으로 읽히는지부터 듣는 매수 가능성으로 묻는다.",
  },

  // realEstate-continue (C-tier — open-form hold ask)
  "fsv1-re-continue-C-002": {
    expectedTopic: "realEstate",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "상속 분할이 끝나기 전 시골 땅을 당장 팔지 않고 들고 갈지, 다른 축과 대비해 보유·유지로 묻는다.",
    boundaryAgainst: "realEstate-sell",
  },

  // realEstate-sell (C-tier — open-form dispose ask)
  "fsv1-re-sell-C-002": {
    expectedTopic: "realEstate",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "sell",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "빈집으로 남은 다가구를 매각해 정리하는 쪽이 맞는지, 처분으로 읽히는 이유부터 듣는 평가로 묻는다.",
  },

  // money-invest (C-tier — open-form invest ask)
  "fsv1-money-invest-C-002": {
    expectedTopic: "money",
    expectedIntent: "possibility",
    expectedDecisionTarget: "invest",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "여윳돈을 리츠에 나눠 넣는 투자가 지금 가능한지, 그렇게 볼 수 있는 이유부터 듣는 투자 가능성으로 묻는다.",
  },

  // money-manageMoney (C-tier — open-form cash-routing ask)
  "fsv1-money-manageMoney-C-002": {
    expectedTopic: "money",
    expectedIntent: "method",
    expectedDecisionTarget: "manageMoney",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "비상금을 단기 예금에만 모아 두고 소비 통장과 섞지 않는 관리가 맞는지, 왜 그 방식이 맞다고 읽히는지부터 듣는 현금 운용으로 묻는다.",
  },

  // lifeDirection (D-tier — confirm-direction vs home-buy boundary)
  "fsv1-lifeDirection-D-002": {
    expectedTopic: "lifeDirection",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "confirmDirection",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "집 마련에 올인하는 쪽과 대비해, 삶의 큰 궤도를 먼저 잡는 방향 확인으로 읽어도 되는지를 묻는다.",
    boundaryAgainst: "realEstate-buy",
  },

  // relationship (D-tier — relationship-possibility vs coworker-only boundary)
  "fsv1-relationship-D-002": {
    expectedTopic: "relationship",
    expectedIntent: "possibility",
    expectedDecisionTarget: "partner",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "같은 팀 동료로만 두는 쪽과 대비해, 연인으로 번지는 관계 가능성으로 읽어도 되는지를 묻는다.",
    boundaryAgainst: "job-changeJob",
  },

  // general (E-tier — uncommon loanword phrasing for overall judgement)
  "fsv1-general-E-001": {
    expectedTopic: "general",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "none",
    expectedAnalysisMode: "interpretation",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "전체 컨텍스트·라이프 페이즈·메타 판단 같은 외래 어휘로, 지금 시기의 전반 흐름을 종합 해석으로 묻는다.",
  },

  // ── Batch 9: next unauthored slot per family (14) ───────────────────
  // business-start (C-tier — open-form start ask)
  "fsv1-biz-start-C-001": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "start",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "주문 제작만 받던 수제 캔들을 쇼룸 매장으로 처음 여는 시작이 가능한지, 가능으로 보는 이유부터 듣는 창업 가능성으로 묻는다.",
  },

  // business-continue (C-tier — open-form keep-running ask)
  "fsv1-biz-continue-C-002": {
    expectedTopic: "business",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "비수기에도 중고 스키 대여점을 접지 않고 유지해도 될지, 왜 유지로 보는지 순서부터 듣는 지속·유지 축으로 묻는다.",
    boundaryAgainst: "business-stop",
  },

  // business-stop (C-tier — open-form wind-down ask)
  "fsv1-biz-stop-C-002": {
    expectedTopic: "business",
    expectedIntent: "termination",
    expectedDecisionTarget: "stop",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "주말 심야만 버티던 보드게임카페를 이번 분기 안에 접는 편이 나은지, 종료로 보는 근거부터 듣는 영업 종료 축으로 묻는다.",
  },

  // business-buy (D-tier — acquire vs keep-running boundary)
  "fsv1-biz-buy-D-001": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "지금 돌리는 포장 공방을 키우는 쪽과 대비해, 옆 골목 공방을 통째로 사들여 이어가는 취득으로 기울어도 되는지를 묻는다.",
    boundaryAgainst: "business-continue",
  },

  // job-changeJob (C-tier — open-form workplace-switch ask)
  "fsv1-job-changeJob-C-002": {
    expectedTopic: "job",
    expectedIntent: "evaluation",
    expectedDecisionTarget: "changeJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "도서관 열람실 직원에서 출판사 교정 보조로 옮기는 이직이 맞는지, 그 이동이 가능해 보이는 근거부터 듣는 평가로 묻는다.",
  },

  // job-leaveJob (C-tier — open-form exit ask)
  "fsv1-job-leaveJob-C-002": {
    expectedTopic: "job",
    expectedIntent: "termination",
    expectedDecisionTarget: "leaveJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "세무사무소 정규직을 놓고 밖으로 나오는 선택이 맞는지, 왜 퇴사로 봐도 되는지 근거부터 듣는 이탈 축으로 묻는다.",
  },

  // realEstate-buy (C-tier — open-form purchase ask)
  "fsv1-re-buy-C-002": {
    expectedTopic: "realEstate",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "역 앞 도시형 생활주택을 분양받아 내 집으로 들이는 매수가 가능한지 고민인데, 그렇게 보는 근거부터 듣는 매수 가능성으로 묻는다.",
  },

  // realEstate-continue (D-tier — hold vs sell boundary)
  "fsv1-re-continue-D-001": {
    expectedTopic: "realEstate",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "재계약이 길어지는 동안 월세 상가를 매각으로 볼지와 대비해, 당장 처분하지 않고 보유하는 쪽으로 기울어도 되는지를 묻는다.",
    boundaryAgainst: "realEstate-sell",
  },

  // realEstate-sell (D-tier — dispose vs hold boundary)
  "fsv1-re-sell-D-001": {
    expectedTopic: "realEstate",
    expectedIntent: "possibility",
    expectedDecisionTarget: "sell",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "관리비만 나가는 옥상 광고 부지를 당분간 들고 가는 쪽과 대비해, 매각·처분 쪽으로 읽어도 되는지를 묻는다.",
    boundaryAgainst: "realEstate-continue",
  },

  // money-invest (D-tier — invest vs cash-hold boundary)
  "fsv1-money-invest-D-001": {
    expectedTopic: "money",
    expectedIntent: "possibility",
    expectedDecisionTarget: "invest",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "여윳돈을 예·적금에만 묶어 두는 쪽과 대비해, 인덱스 펀드에 넣는 투자로 기울어도 되는지를 묻는다.",
    boundaryAgainst: "money-manageMoney",
  },

  // money-manageMoney (D-tier — cash-routing vs invest boundary)
  "fsv1-money-manageMoney-D-001": {
    expectedTopic: "money",
    expectedIntent: "method",
    expectedDecisionTarget: "manageMoney",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "남는 돈을 시장에 태우는 쪽과 대비해, 생활비를 주 단위 예산·현금 관리로 막는 방식으로 기울어도 되는지를 묻는다.",
    boundaryAgainst: "money-invest",
  },

  // lifeDirection (D-tier — confirm-direction vs new-work-offer boundary)
  "fsv1-lifeDirection-D-003": {
    expectedTopic: "lifeDirection",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "confirmDirection",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "새 일을 벌이는 제안에 응하는 쪽과 대비해, 지금 삶의 축을 먼저 확인하는 방향 확인으로 읽어도 되는지를 묻는다.",
    boundaryAgainst: "business-start",
  },

  // relationship (D-tier — relationship-possibility vs trade-acquaintance boundary)
  "fsv1-relationship-D-003": {
    expectedTopic: "relationship",
    expectedIntent: "possibility",
    expectedDecisionTarget: "partner",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "공동주문 단톡의 거래 지인으로만 두는 쪽과 대비해, 연인으로 번지는 관계 가능성으로 읽어도 되는지를 묻는다.",
    boundaryAgainst: "business-buy",
  },

  // general (G-tier — overall judgement vs immediate action-pick design limit)
  "fsv1-general-G-001": {
    expectedTopic: "general",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "none",
    expectedAnalysisMode: "interpretation",
    matchPolicy: "design_limit",
    goldConfidence: "low",
    goldRationale:
      "요즘 전반 흐름을 묻는 종합 해석과 당장 손댈 선택을 하나로 찍어달라는 요청이 한 축으로 안 모여, scalar DT로 안정 표현이 어렵다.",
    ambiguityLabel: "DESIGN_LIMIT",
    compositeNote:
      "design limit: overall generalJudgement vs immediate single-action pick; scalar DT none unstable",
  },

  // ── Batch 10: next unauthored slot per remaining family (13; general omitted) ──
  // business-start (C-tier — open-form start ask)
  "fsv1-biz-start-C-002": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "start",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "high",
    goldRationale:
      "주말마다 팔던 수제 도장을 골목 작업실로 처음 내놓는 시작이 가능한지, 왜 가능으로 보이는지 이유부터 듣는 창업 가능성으로 묻는다.",
  },

  // business-continue (D-tier — keep-running vs wind-down boundary)
  "fsv1-biz-continue-D-001": {
    expectedTopic: "business",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "이번 달에 접는 쪽과 대비해, 밤늦게만 손님 오던 무인 사진관을 당분간 유지하는 쪽으로 봐도 되는지를 묻는다.",
    boundaryAgainst: "business-stop",
  },

  // business-stop (D-tier — wind-down vs keep-running boundary)
  "fsv1-biz-stop-D-001": {
    expectedTopic: "business",
    expectedIntent: "termination",
    expectedDecisionTarget: "stop",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "좀 더 버티는 쪽과 대비해, 단골만 겨우 오는 골목 수선 공방을 이번 분기로 접는 종료로 읽어도 되는지를 묻는다.",
    boundaryAgainst: "business-continue",
  },

  // business-buy (D-tier — acquire vs scale-own boundary)
  "fsv1-biz-buy-D-002": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "지금 돌리는 무인 아이스크림 가게를 키우는 쪽과 대비해, 옆 블록 가게를 통째로 넘겨받는 취득으로 봐도 되는지를 묻는다.",
    boundaryAgainst: "business-continue",
  },

  // job-changeJob (D-tier — workplace-switch vs exit boundary)
  "fsv1-job-changeJob-D-001": {
    expectedTopic: "job",
    expectedIntent: "possibility",
    expectedDecisionTarget: "changeJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "아예 일을 놓고 쉬는 쪽과 대비해, 콜센터를 두고 다른 회사 주간직으로 옮기는 이직으로 봐도 되는지를 묻는다.",
    boundaryAgainst: "job-leaveJob",
  },

  // job-leaveJob (D-tier — exit vs workplace-switch boundary)
  "fsv1-job-leaveJob-D-001": {
    expectedTopic: "job",
    expectedIntent: "termination",
    expectedDecisionTarget: "leaveJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "다른 랩으로 소속만 바꾸는 쪽과 대비해, 연구소 계약을 연장하지 않고 나오는 퇴사로 읽어도 되는지를 묻는다.",
    boundaryAgainst: "job-changeJob",
  },

  // realEstate-buy (D-tier — purchase vs keep-renting boundary)
  "fsv1-re-buy-D-002": {
    expectedTopic: "realEstate",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "월세 원룸에 남는 쪽과 대비해, 근처 소형 오피스텔을 사서 옮기는 매수로 기울어도 되는지를 묻는다.",
    boundaryAgainst: "realEstate-continue",
  },

  // realEstate-continue (D-tier — hold vs dispose boundary)
  "fsv1-re-continue-D-002": {
    expectedTopic: "realEstate",
    expectedIntent: "continuation",
    expectedDecisionTarget: "continue",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "매각으로 정리하는 쪽과 대비해, 공동명의 상가를 당분간 처분하지 않고 보유로 봐도 되는지를 묻는다.",
    boundaryAgainst: "realEstate-sell",
  },

  // realEstate-sell (D-tier — dispose vs hold boundary)
  "fsv1-re-sell-D-002": {
    expectedTopic: "realEstate",
    expectedIntent: "possibility",
    expectedDecisionTarget: "sell",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "공실로 두고 가는 쪽과 대비해, 쓰이지 않는 근교 창고 건물을 매각·처분 쪽으로 읽어도 되는지를 묻는다.",
    boundaryAgainst: "realEstate-continue",
  },

  // money-invest (D-tier — invest vs cash-hold boundary)
  "fsv1-money-invest-D-002": {
    expectedTopic: "money",
    expectedIntent: "possibility",
    expectedDecisionTarget: "invest",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "성과급을 단기 예금에만 묶어 두는 쪽과 대비해, ETF에 나눠 넣는 투자로 기울어도 되는지를 묻는다.",
    boundaryAgainst: "money-manageMoney",
  },

  // money-manageMoney (D-tier — cash-routing vs invest boundary)
  "fsv1-money-manageMoney-D-002": {
    expectedTopic: "money",
    expectedIntent: "method",
    expectedDecisionTarget: "manageMoney",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "보너스를 시장에 태우는 쪽과 대비해, 비상금 통장에만 모아 두는 현금 관리 방식으로 읽어도 되는지를 묻는다.",
    boundaryAgainst: "money-invest",
  },

  // lifeDirection (E-tier — uncommon vocabulary for confirm-direction)
  "fsv1-lifeDirection-E-001": {
    expectedTopic: "lifeDirection",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "confirmDirection",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "라이프 벡터·리밸런싱·패러다임·메타 프레임 같은 외래 어휘로, 지금 삶의 축을 방향 확인으로 봐도 되는지를 묻는다.",
  },

  // relationship (F-tier — possibility primary + pacing secondary)
  "fsv1-relationship-F-001": {
    expectedTopic: "relationship",
    expectedIntent: "possibility",
    expectedDecisionTarget: "partner",
    expectedAnalysisMode: "decision",
    matchPolicy: "composite",
    goldConfidence: "medium",
    goldRationale:
      "주축은 소개팅으로 만난 사람과의 연애 가능성이고, 주말 약속 빈도만 먼저 조절하는 페이스 조정은 부차 조건이다.",
    compositeNote:
      "primary=relationship possibility/partner; secondary=weekend-meeting frequency pacing; scalar DT partner",
  },

  // ── Batch 11: cherry-picked E/F/G toward 160 floor (7) ──
  // business-start (E-tier — uncommon vocabulary for start-possibility)
  "fsv1-biz-start-E-001": {
    expectedTopic: "business",
    expectedIntent: "possibility",
    expectedDecisionTarget: "start",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "다크키친형 공유주방 런칭·비즈니스 이니시에이션 같은 외래 어휘로도, 취미 향초를 첫 창업으로 내놓는 시작이 지금 가능한지가 핵심이다.",
  },

  // job-changeJob (E-tier — uncommon vocabulary for workplace-switch)
  "fsv1-job-changeJob-E-001": {
    expectedTopic: "job",
    expectedIntent: "possibility",
    expectedDecisionTarget: "changeJob",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "ESG·잡 모빌리티 어휘가 섞여도, 도서관 서고에서 컨설팅 주니어로 옮기는 직장 이동이 지금 가능한지를 묻는다.",
  },

  // business-stop (F-tier — wind-down primary + inventory clear-out secondary)
  "fsv1-biz-stop-F-001": {
    expectedTopic: "business",
    expectedIntent: "termination",
    expectedDecisionTarget: "stop",
    expectedAnalysisMode: "decision",
    matchPolicy: "composite",
    goldConfidence: "medium",
    goldRationale:
      "주축은 골목 문구 가게를 이번 분기로 접는 폐업이고, 남은 재고를 온라인으로 소진하는 처리는 종료를 돕는 부차 조건이다.",
    compositeNote:
      "primary=business stop/wind-down; secondary=online inventory clear-out; scalar DT stop",
    boundaryAgainst: "business-continue",
  },

  // realEstate-buy (G-tier — auction-bid vs negotiated-purchase design limit)
  "fsv1-re-buy-G-001": {
    expectedTopic: "realEstate",
    expectedIntent: "possibility",
    expectedDecisionTarget: "buy",
    expectedAnalysisMode: "decision",
    matchPolicy: "design_limit",
    goldConfidence: "low",
    goldRationale:
      "경매 낙찰로 들이는 경로와 일반 매매 계약이 한 덩어리로 겹쳐, 매수 여부를 어느 취득 축으로 고정할지부터 설계 한계다.",
    ambiguityLabel: "DESIGN_LIMIT",
    compositeNote:
      "design limit: auction-bid acquisition vs negotiated purchase; scalar buy DT unstable across channels",
  },

  // money-invest (E-tier — uncommon vocabulary for invest-possibility)
  "fsv1-money-invest-E-001": {
    expectedTopic: "money",
    expectedIntent: "possibility",
    expectedDecisionTarget: "invest",
    expectedAnalysisMode: "decision",
    matchPolicy: "semantic_core",
    goldConfidence: "medium",
    goldRationale:
      "캐피탈·익스포저·인베스트 같은 외래 어휘로, 비상금 일부를 테마형 액티브 펀드에 태우는 투자가 지금 가능한지를 묻는다.",
  },

  // lifeDirection (F-tier — confirm-direction primary + city-anchor secondary)
  "fsv1-lifeDirection-F-001": {
    expectedTopic: "lifeDirection",
    expectedIntent: "generalJudgement",
    expectedDecisionTarget: "confirmDirection",
    expectedAnalysisMode: "decision",
    matchPolicy: "composite",
    goldConfidence: "medium",
    goldRationale:
      "주축은 지금 삶의 큰 방향을 확인하는 것이고, 거주지와 직장을 같은 도시로 묶을지 정리하는 것은 그 안의 부차 앵커다.",
    compositeNote:
      "primary=lifeDirection confirmDirection; secondary=city co-location of home/work; scalar DT confirmDirection",
  },

  // relationship (G-tier — dating-possibility vs acquaintance-distance design limit)
  "fsv1-relationship-G-001": {
    expectedTopic: "relationship",
    expectedIntent: "possibility",
    expectedDecisionTarget: "none",
    expectedAnalysisMode: "decision",
    matchPolicy: "design_limit",
    goldConfidence: "low",
    goldRationale:
      "등산 모임 사이가 연애로 번질지 편한 지인 거리로만 둘지가 한 축으로 안 모여, 관계 가능성을 scalar DT로 고정하기 어렵다.",
    ambiguityLabel: "DESIGN_LIMIT",
    compositeNote:
      "design limit: dating-possibility vs acquaintance-distance; scalar DT none unstable",
  },
};

/**
 * Build GOLD_SEALED rows only for slots that already have authored Gold.
 * Missing Gold is allowed while authoring is incomplete.
 * Extra Gold keys (not in questions) are reported by self-check, not sealed here.
 */
export function buildNovelHoldoutFrozenSetV1GoldRows(
  questions: readonly NovelHoldoutFrozenSetV1AuthoredQuestion[] =
    NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS,
  goldBySlotId: Readonly<Record<string, GoldOnly>> = GOLD_BY_SLOT_ID,
): readonly NovelHoldoutFrozenSetV1GoldRow[] {
  const rows: NovelHoldoutFrozenSetV1GoldRow[] = [];
  for (const questionRow of questions) {
    const gold = goldBySlotId[questionRow.slotId];
    if (!gold) continue;
    rows.push(sealed(questionRow, gold));
  }
  return rows;
}

export const NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD:
  readonly NovelHoldoutFrozenSetV1GoldRow[] =
    buildNovelHoldoutFrozenSetV1GoldRows();

export type NovelHoldoutFrozenSetV1GoldSelfCheck = {
  ok: boolean;
  /**
   * True only when every question has exactly one Gold and there are no extras.
   * Remains false until all authored question slots have Gold.
   */
  authoringComplete: boolean;
  total: number;
  questionCount: number;
  authoredGoldMapSize: number;
  missingGoldSlotIds: readonly string[];
  extraGoldSlotIds: readonly string[];
  duplicateSlotIds: readonly string[];
  missingGoldFields: readonly string[];
  invalidEnumSlotIds: readonly string[];
  questionMismatchSlotIds: readonly string[];
  metadataMismatchSlotIds: readonly string[];
  forbiddenPayloadSlotIds: readonly string[];
  questionFileGoldLeaks: readonly string[];
  readerCallTraces: readonly string[];
  violations: readonly string[];
};

/**
 * Static self-check for Frozen Set v1 Gold authoring invariants.
 * Does not call QuestionReader / DecisionEngine / GPT.
 * Does not hard-assert that all softMax-ceiling Gold values are authored.
 */
export function selfCheckNovelHoldoutFrozenSetV1Gold(
  goldRows: readonly NovelHoldoutFrozenSetV1GoldRow[] =
    NOVEL_HOLDOUT_FROZEN_SET_V1_GOLD,
  questions: readonly NovelHoldoutFrozenSetV1AuthoredQuestion[] =
    NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS,
  goldBySlotId: Readonly<Record<string, GoldOnly>> = GOLD_BY_SLOT_ID,
): NovelHoldoutFrozenSetV1GoldSelfCheck {
  const violations: string[] = [];
  const slotSeen = new Set<string>();
  const duplicateSlotIds: string[] = [];
  const missingGoldFields: string[] = [];
  const invalidEnumSlotIds: string[] = [];
  const questionMismatchSlotIds: string[] = [];
  const metadataMismatchSlotIds: string[] = [];
  const forbiddenPayloadSlotIds: string[] = [];
  const questionFileGoldLeaks: string[] = [];
  const readerCallTraces: string[] = [];

  const questionBySlot = new Map(
    questions.map((q) => [q.slotId, q] as const),
  );
  const goldMapKeys = Object.keys(goldBySlotId);

  const missingGoldSlotIds = questions
    .filter((q) => goldBySlotId[q.slotId] == null)
    .map((q) => q.slotId);

  const extraGoldSlotIds = goldMapKeys.filter(
    (slotId) => !questionBySlot.has(slotId),
  );

  for (const q of questions) {
    if (!q.slotId.startsWith("fsv1-")) {
      violations.push(`${q.slotId}: FSV1 slotId must start with fsv1-`);
    }
    const blob = q as unknown as Record<string, unknown>;
    for (const key of FORBIDDEN_QUESTION_GOLD_KEYS) {
      if (Object.prototype.hasOwnProperty.call(blob, key)) {
        questionFileGoldLeaks.push(`${q.slotId}:${key}`);
      }
    }
  }

  for (const row of goldRows) {
    if (slotSeen.has(row.slotId)) {
      duplicateSlotIds.push(row.slotId);
    } else {
      slotSeen.add(row.slotId);
    }

    if (!row.slotId.startsWith("fsv1-")) {
      violations.push(`${row.slotId}: FSV1 gold slotId must start with fsv1-`);
    }

    if (row.stage !== "GOLD_SEALED") {
      violations.push(`${row.slotId}: stage must be GOLD_SEALED`);
    }

    const g = row.gold;
    if (!g.expectedTopic || !g.expectedIntent || !g.expectedDecisionTarget) {
      missingGoldFields.push(`${row.slotId}: topic/intent/DT`);
    }
    if (!g.matchPolicy) missingGoldFields.push(`${row.slotId}: matchPolicy`);
    if (!g.goldConfidence) {
      missingGoldFields.push(`${row.slotId}: goldConfidence`);
    }
    if (!g.goldRationale || g.goldRationale.trim().length === 0) {
      missingGoldFields.push(`${row.slotId}: goldRationale`);
    }

    if (g.matchPolicy && !ALLOWED_MATCH_POLICIES.has(g.matchPolicy)) {
      invalidEnumSlotIds.push(`${row.slotId}: matchPolicy`);
    }
    if (g.goldConfidence && !ALLOWED_GOLD_CONFIDENCE.has(g.goldConfidence)) {
      invalidEnumSlotIds.push(`${row.slotId}: goldConfidence`);
    }
    if (
      g.ambiguityLabel != null
      && !ALLOWED_AMBIGUITY_LABELS.has(g.ambiguityLabel)
    ) {
      invalidEnumSlotIds.push(`${row.slotId}: ambiguityLabel`);
    }

    if (
      g.ambiguityLabel
      && g.matchPolicy !== "ambiguous"
      && g.matchPolicy !== "design_limit"
    ) {
      violations.push(
        `${row.slotId}: ambiguityLabel requires ambiguous/design_limit matchPolicy`,
      );
    }
    if (
      !g.ambiguityLabel
      && (g.matchPolicy === "ambiguous" || g.matchPolicy === "design_limit")
    ) {
      violations.push(
        `${row.slotId}: matchPolicy ${g.matchPolicy} requires ambiguityLabel`,
      );
    }
    if (g.matchPolicy === "composite") {
      if (!g.compositeNote || g.compositeNote.trim().length === 0) {
        missingGoldFields.push(`${row.slotId}: compositeNote`);
      }
    }
    if (g.matchPolicy === "design_limit" && g.ambiguityLabel !== "DESIGN_LIMIT") {
      violations.push(`${row.slotId}: design_limit requires DESIGN_LIMIT label`);
    }

    const q = questionBySlot.get(row.slotId);
    if (!q) {
      questionMismatchSlotIds.push(row.slotId);
    } else {
      if (q.question !== row.question) {
        questionMismatchSlotIds.push(row.slotId);
      }
      if (
        q.family !== row.family
        || q.taxonomyPrimary !== row.taxonomyPrimary
        || q.slot !== row.slot
        || q.noveltyTier.length !== row.noveltyTier.length
        || q.noveltyTier.some((tier, i) => tier !== row.noveltyTier[i])
      ) {
        metadataMismatchSlotIds.push(row.slotId);
      }
    }

    const goldBlob = JSON.stringify(g);
    const rowBlob = JSON.stringify(row);
    for (const key of FORBIDDEN_GOLD_PAYLOAD_KEYS) {
      if (
        Object.prototype.hasOwnProperty.call(g as object, key)
        || new RegExp(`"${key}"\\s*:`).test(goldBlob)
      ) {
        forbiddenPayloadSlotIds.push(`${row.slotId}:${key}`);
      }
    }
    if (
      /readQuestion|QuestionReader|DecisionEngine|reader_runtime_observation|gptResponse|openai/i
        .test(rowBlob)
    ) {
      readerCallTraces.push(row.slotId);
    }
  }

  // Sealed rows must be 1:1 with authored map ∩ questions (no orphan sealed rows).
  if (goldRows.length !== goldMapKeys.length - extraGoldSlotIds.length) {
    violations.push(
      `sealed gold row count ${goldRows.length} != authored-in-questions map size ${
        goldMapKeys.length - extraGoldSlotIds.length
      }`,
    );
  }

  if (extraGoldSlotIds.length > 0) {
    violations.push(`extra Gold slotIds: ${extraGoldSlotIds.join(",")}`);
  }
  if (duplicateSlotIds.length > 0) {
    violations.push(`duplicate slotIds: ${duplicateSlotIds.join(",")}`);
  }
  if (missingGoldFields.length > 0) {
    violations.push(`missing gold fields: ${missingGoldFields.join(" | ")}`);
  }
  if (invalidEnumSlotIds.length > 0) {
    violations.push(`invalid enums: ${invalidEnumSlotIds.join(",")}`);
  }
  if (questionMismatchSlotIds.length > 0) {
    violations.push(
      `question mismatch: ${questionMismatchSlotIds.join(",")}`,
    );
  }
  if (metadataMismatchSlotIds.length > 0) {
    violations.push(
      `metadata mismatch: ${metadataMismatchSlotIds.join(",")}`,
    );
  }
  if (forbiddenPayloadSlotIds.length > 0) {
    violations.push(
      `forbidden gold payload: ${forbiddenPayloadSlotIds.join(",")}`,
    );
  }
  if (questionFileGoldLeaks.length > 0) {
    violations.push(
      `gold leaked into questions: ${questionFileGoldLeaks.join(",")}`,
    );
  }
  if (readerCallTraces.length > 0) {
    violations.push(`reader/gpt traces: ${readerCallTraces.join(",")}`);
  }

  const authoringComplete =
    missingGoldSlotIds.length === 0
    && extraGoldSlotIds.length === 0
    && questions.length > 0
    && goldRows.length === questions.length;

  // Incomplete authoring is expected until all 70 are sealed — missing Gold
  // is reported, but does not fail ok by itself.
  return {
    ok: violations.length === 0,
    authoringComplete,
    total: goldRows.length,
    questionCount: questions.length,
    authoredGoldMapSize: goldMapKeys.length,
    missingGoldSlotIds,
    extraGoldSlotIds,
    duplicateSlotIds,
    missingGoldFields,
    invalidEnumSlotIds,
    questionMismatchSlotIds,
    metadataMismatchSlotIds,
    forbiddenPayloadSlotIds,
    questionFileGoldLeaks,
    readerCallTraces,
    violations,
  };
}
