/**
 * Frozen Set v1 — Question Authoring (verification-only).
 *
 * Scope (this step):
 * - Frozen Set v1 dedicated QUESTION_AUTHORED contract
 * - Thin authored(slot, question) helper
 * - Smoke 5 + Batch 0 (9) + Batch 1–9 (14 each) + Batch 10 (13) = 153 authored
 * - Batch 10 omits general (softMax 10 already filled); not full softMax ceiling of 222
 * - Batch 11 (7) cherry-picked E/F/G slots → 160 (P2 Freeze hard-completion floor)
 *
 * Out of scope:
 * - Full 222 question authoring
 * - Gold / Reader / Freeze / Novelty / Leakage
 * - Blind Holdout v1 / P11-4 question string reuse
 * - Production consulting / Decision Engine paths
 */

import type { NovelHoldoutSeedSlotSpec } from "./novelHoldoutAllocationSchema.js";
import type {
  NovelHoldoutFamily,
  NovelHoldoutNoveltyTier,
  NovelHoldoutTaxonomy,
} from "./novelHoldoutContract.js";
import { NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS } from "./novelHoldoutFrozenSetV1SeedSlots.js";

export const NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTION_STAGE =
  "QUESTION_AUTHORED" as const;

export type NovelHoldoutFrozenSetV1QuestionStage =
  typeof NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTION_STAGE;

/**
 * Question-only Frozen Set v1 row.
 * Gold / Reader / Freeze fields are intentionally absent.
 */
export type NovelHoldoutFrozenSetV1AuthoredQuestion = {
  slotId: string;
  question: string;
  family: NovelHoldoutFamily;
  taxonomyPrimary: NovelHoldoutTaxonomy;
  noveltyTier: readonly NovelHoldoutNoveltyTier[];
  stage: NovelHoldoutFrozenSetV1QuestionStage;
  slot: NovelHoldoutSeedSlotSpec;
};

function requireSeedSlot(slotId: string): NovelHoldoutSeedSlotSpec {
  const slot = NOVEL_HOLDOUT_FROZEN_SET_V1_SEED_SLOTS.find(
    (item) => item.slotId === slotId,
  );
  if (!slot) {
    throw new Error(
      `Frozen Set v1 smoke authoring: unknown seed slotId=${slotId}`,
    );
  }
  return slot;
}

/**
 * Thin QUESTION_AUTHORED helper.
 * Metadata is taken from the seed slot; empty questions are rejected.
 */
function authored(
  slot: NovelHoldoutSeedSlotSpec,
  question: string,
): NovelHoldoutFrozenSetV1AuthoredQuestion {
  const trimmed = question.trim();
  if (trimmed.length === 0) {
    throw new Error(
      `Frozen Set v1 authored question must be non-empty (slotId=${slot.slotId})`,
    );
  }

  return {
    slotId: slot.slotId,
    question: trimmed,
    family: slot.family,
    taxonomyPrimary: slot.taxonomyPrimary,
    noveltyTier: slot.noveltyTier,
    stage: NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTION_STAGE,
    slot,
  };
}

/**
 * Frozen Set v1 authored questions (smoke + Batch 0–11).
 * Full softMax-ceiling authoring is deferred to a later step.
 */
export const NOVEL_HOLDOUT_FROZEN_SET_V1_QUESTIONS:
  readonly NovelHoldoutFrozenSetV1AuthoredQuestion[] = [
    // business-start / A / lexical — start-possibility paraphrase
    authored(
      requireSeedSlot("fsv1-biz-start-A-001"),
      "온라인으로만 팔던 물건을 처음 오프라인 점포로 내놓는 시작이, 지금 흐름상 가능한지 보고 싶어요",
    ),
    // job-changeJob / B / lexical — change-job with concrete workplace target
    authored(
      requireSeedSlot("fsv1-job-changeJob-B-001"),
      "병원 야간직에서 낮 근무 사무직으로 자리를 옮기는 선택이 맞을지 고민돼요",
    ),
    // realEstate-buy / D / syntactic — buy vs hold-rent boundary
    authored(
      requireSeedSlot("fsv1-re-buy-D-001"),
      "전세로 버티는 것과 집을 마련하는 것 사이에서, 매수로 기울어도 될지 경계가 흐려요",
    ),
    // money-invest / C / syntactic — invest possibility via open-form ask
    authored(
      requireSeedSlot("fsv1-money-invest-C-001"),
      "적금만 쌓아두다 일부를 시장에 태워 투자하는 쪽이 흐름에 맞는지, 왜 그렇게 볼 수 있는지 알고 싶어요",
    ),
    // relationship / E / combinational — uncommon phrasing, possibility axis
    authored(
      requireSeedSlot("fsv1-relationship-E-001"),
      "인연의 결이 이어질지 서서히 흐려질지 윤곽이 흐려요. 이 관계의 가능성을 어느 쪽으로 보고 판단하면 좋을까요?",
    ),

    // ── Question Authoring Batch 0 (9) — prefer F/G absent from smoke ──
    // business-continue / F / combinational — keep running + delivery mix
    authored(
      requireSeedSlot("fsv1-biz-continue-F-001"),
      "지금 운영 중인 매장을 유지하면서, 배달 비중만 높여 버티는 쪽이 흐름에 맞을까요?",
    ),
    // business-stop / G / combinational — stop vs temporary close blur
    authored(
      requireSeedSlot("fsv1-biz-stop-G-001"),
      "매출이 빠져서 손을 뗄지 잠깐만 쉴지 경계가 안 보여요. 지금은 어느 쪽의 문제로 보고 판단하면 좋을까요?",
    ),
    // business-buy / F / combinational — acquire + keep existing patronage
    authored(
      requireSeedSlot("fsv1-biz-buy-F-001"),
      "기존 직원과 거래처가 남아 있는 인쇄소를 넘겨받으면서, 영업 방식만 손봐 이어가도 될지 망설여져요",
    ),
    // job-leaveJob / G / combinational — leave vs temporary absence blur
    authored(
      requireSeedSlot("fsv1-job-leaveJob-G-001"),
      "직장에서 완전히 발을 뺄지 잠시만 비울지 선이 흐려요. 지금은 어떤 방향으로 판단하는 게 맞을까요?",
    ),
    // realEstate-continue / F / combinational — hold + partial short-term rent
    authored(
      requireSeedSlot("fsv1-re-continue-F-001"),
      "지금 가진 집을 유지하면서, 방 하나만 단기 임대로 돌리는 쪽이 맞을까요?",
    ),
    // realEstate-sell / G / combinational — full sale vs share cleanup blur
    authored(
      requireSeedSlot("fsv1-re-sell-G-001"),
      "공동명의 지분 정리와 집 통째 매도가 한 덩어리로 겹쳐 보여요. 지금 시점에서 매도 여부를 어느 쪽으로 보면 좋을지 알고 싶어요",
    ),
    // money-manageMoney / F / combinational — split accounts + auto bill order
    authored(
      requireSeedSlot("fsv1-money-manageMoney-F-001"),
      "월급을 통장별로 나눠 관리하면서, 고정비 자동이체 순서도 같이 짜는 방식이 맞을지 궁금해요",
    ),
    // lifeDirection / G / combinational — major redirect vs temporary wobble
    authored(
      requireSeedSlot("fsv1-lifeDirection-G-001"),
      "진로를 크게 틀어야 하는 시점인지 일시적인 흔들림인지 헷갈려요. 지금은 방향 확인으로 보고 판단해도 될까요?",
    ),
    // general / F / combinational — overall flow + near-term priority order
    authored(
      requireSeedSlot("fsv1-general-F-001"),
      "전반적인 흐름을 먼저 짚으면서, 가까운 선택들의 우선순위도 함께 잡아봐도 될까요?",
    ),

    // ── Question Authoring Batch 1 (14) — next unauthored A/lexical per family ──
    // business-start / A / lexical — start-possibility paraphrase
    authored(
      requireSeedSlot("fsv1-biz-start-A-002"),
      "집 근처에서 작은 베이커리를 새로 열어보는 일이, 지금 시점에 가능한 선택인지 알고 싶어요",
    ),
    // business-continue / A / lexical — keep-running paraphrase
    authored(
      requireSeedSlot("fsv1-biz-continue-A-001"),
      "3년째 돌리는 동네 문구점을 당분간 그대로 가져가도 될지, 유지 판단으로 봐주시면 좋겠어요",
    ),
    // business-stop / A / lexical — wind-down paraphrase
    authored(
      requireSeedSlot("fsv1-biz-stop-A-001"),
      "야간 포장마차 영업을 여기서 정리하는 쪽이 맞는지, 종료 쪽으로 판단이 필요해요",
    ),
    // business-buy / A / lexical — acquire-existing paraphrase
    authored(
      requireSeedSlot("fsv1-biz-buy-A-001"),
      "이사 가는 동네의 세탁소를 통째로 사들이는 게 지금 가능한지 궁금해요",
    ),
    // job-changeJob / A / lexical — workplace-switch paraphrase
    authored(
      requireSeedSlot("fsv1-job-changeJob-A-001"),
      "물류회사 사무직 제안이 와서, 지금 다니는 제조 공장 자리를 두고 이직하는 게 이 시점에 가능한지 판단받고 싶어요",
    ),
    // job-leaveJob / A / lexical — exit-employer paraphrase
    authored(
      requireSeedSlot("fsv1-job-leaveJob-A-001"),
      "다니던 콜센터를 그만두고 나오는 판단이 지금 맞는지 알고 싶어요",
    ),
    // realEstate-buy / A / lexical — purchase paraphrase
    authored(
      requireSeedSlot("fsv1-re-buy-A-001"),
      "아이 학군 때문에 아파트를 새로 장만하는 게 가능한지 보고 싶어요",
    ),
    // realEstate-continue / A / lexical — hold-as-is paraphrase
    authored(
      requireSeedSlot("fsv1-re-continue-A-001"),
      "지금 살고 있는 빌라를 팔지 않고 그대로 들고 가는 쪽이 맞을지 고민이에요",
    ),
    // realEstate-sell / A / lexical — dispose paraphrase
    authored(
      requireSeedSlot("fsv1-re-sell-A-001"),
      "부모님 집 한 채를 시장에 내놓는 선택이 지금 괜찮은지 보고 싶어요",
    ),
    // money-invest / A / lexical — put-money-to-work paraphrase
    authored(
      requireSeedSlot("fsv1-money-invest-A-001"),
      "퇴직금 일부를 펀드에 넣는 쪽이 가능한 선택인지 알고 싶어요",
    ),
    // money-manageMoney / A / lexical — cash-routing method paraphrase
    authored(
      requireSeedSlot("fsv1-money-manageMoney-A-001"),
      "카드값과 생활비를 주간 단위로 나눠 쓰는 관리 방식이 맞는지 봐주시면 좋겠어요",
    ),
    // lifeDirection / A / lexical — confirm-direction paraphrase
    authored(
      requireSeedSlot("fsv1-lifeDirection-A-001"),
      "지금 잡고 있는 삶의 큰 방향이 그대로여도 되는지 확인하고 싶어요",
    ),
    // relationship / A / lexical — relationship-possibility paraphrase
    authored(
      requireSeedSlot("fsv1-relationship-A-001"),
      "소개로 만난 사람과 인연을 이어갈 여지가 있는지 보고 싶어요",
    ),
    // general / A / lexical — overall-judgement paraphrase
    authored(
      requireSeedSlot("fsv1-general-A-001"),
      "요즘 전반적인 기운이 어떤지, 큰 판단 축만 먼저 짚어주시면 좋겠어요",
    ),

    // ── Question Authoring Batch 2 (14) — next unauthored A/lexical per family ──
    // business-start / A / lexical — start-possibility paraphrase (judgment-first)
    authored(
      requireSeedSlot("fsv1-biz-start-A-003"),
      "단골이 조금씩 늘어난 수제 액세서리를, 작은 작업실 차리면서 본업으로 키워가도 될지 고민이에요",
    ),
    // business-continue / A / lexical — keep-running paraphrase (direction check)
    authored(
      requireSeedSlot("fsv1-biz-continue-A-002"),
      "작년 봄에 연 베이커리 매장이 손님이 들쭉날쭉한데, 이 상태로 계속 돌리는 쪽이 맞을까요?",
    ),
    // business-stop / A / lexical — wind-down paraphrase (termination review)
    authored(
      requireSeedSlot("fsv1-biz-stop-A-002"),
      "임대료가 오른 지하 옷가게를 이번 시즌까지만 하고 접어도 될지 마음이 무거워요",
    ),
    // business-buy / A / lexical — acquire-existing paraphrase (execute check)
    authored(
      requireSeedSlot("fsv1-biz-buy-A-002"),
      "운영자가 은퇴하면서 내놓은 카페를 인수해 이어가는 게 지금 맞는 선택인지 궁금해요",
    ),
    // job-changeJob / A / lexical — workplace-switch paraphrase (direction)
    authored(
      requireSeedSlot("fsv1-job-changeJob-A-002"),
      "병원에서 간호조무사로 다니는데, 제약 영업직으로 자리를 옮기는 게 맞을지 고민이에요",
    ),
    // job-leaveJob / A / lexical — exit-employer paraphrase (timing)
    authored(
      requireSeedSlot("fsv1-job-leaveJob-A-002"),
      "야근이 잦아진 회계팀 자리를 정리하고 회사 밖으로 나오는 쪽이 맞을지 마음이 무거워요",
    ),
    // realEstate-buy / A / lexical — purchase paraphrase (priority)
    authored(
      requireSeedSlot("fsv1-re-buy-A-002"),
      "부모님과 같이 살던 원룸을 나와, 신혼집으로 작은 빌라를 사는 게 맞을지 보고 싶어요",
    ),
    // realEstate-continue / A / lexical — hold-as-is paraphrase (open continue)
    authored(
      requireSeedSlot("fsv1-re-continue-A-002"),
      "월세로 세를 주고 있는 다가구 한 채를 당분간 보유한 채로 가져가는 편이 맞을까요?",
    ),
    // realEstate-sell / A / lexical — dispose paraphrase (judgment)
    authored(
      requireSeedSlot("fsv1-re-sell-A-002"),
      "아이 독립 후 비어 있는 옛집을 정리해서 팔아도 될지 흔들려요",
    ),
    // money-invest / A / lexical — put-money-to-work paraphrase (review)
    authored(
      requireSeedSlot("fsv1-money-invest-A-002"),
      "여윳돈을 굴려 넣는 쪽을 지금 실행해도 될지, 투자로 가도 되는 흐름인지 검토하고 싶어요",
    ),
    // money-manageMoney / A / lexical — cash-routing method paraphrase (method-first)
    authored(
      requireSeedSlot("fsv1-money-manageMoney-A-002"),
      "보너스를 비상금 통장에 모아 두고 생활비는 월급 통장만 쓰는 관리가 지금 상황에 맞는지 궁금해요",
    ),
    // lifeDirection / A / lexical — confirm-direction paraphrase (open criteria)
    authored(
      requireSeedSlot("fsv1-lifeDirection-A-002"),
      "지방 근무를 이어가며 잡고 있는 삶의 궤도가 이대로여도 될지 다시 보게 됐어요",
    ),
    // relationship / A / lexical — relationship-possibility paraphrase (possibility-first)
    authored(
      requireSeedSlot("fsv1-relationship-A-002"),
      "동호회에서 자주 마주치는 사람과 따로 연락을 이어가도 되는지 마음이 흔들려요",
    ),
    // general / A / lexical — overall-judgement paraphrase (priority ask)
    authored(
      requireSeedSlot("fsv1-general-A-002"),
      "가족 일정이랑 일, 돈이 한꺼번에 몰린 요즘이 전반적으로 무난한 흐름인지 봐주시면 좋겠어요",
    ),

    // ── Question Authoring Batch 3 (14) — next unauthored A/lexical per family ──
    // business-start / A / lexical — start-possibility paraphrase
    authored(
      requireSeedSlot("fsv1-biz-start-A-004"),
      "주말에만 하던 수제청 판매를 평일에도 좁은 키오스크로 처음 내보는 시작이, 지금 흐름에서 가능한지 보고 싶어요",
    ),
    // business-continue / A / lexical — keep-running paraphrase
    authored(
      requireSeedSlot("fsv1-biz-continue-A-003"),
      "단골이 줄어든 동네 세탁소를 당분간 접지 않고 그대로 굴려도 될지, 유지 쪽으로 봐주시면 좋겠어요",
    ),
    // business-stop / A / lexical — wind-down paraphrase
    authored(
      requireSeedSlot("fsv1-biz-stop-A-003"),
      "새벽 배송만 하던 반찬가게를 이번 달로 문을 닫는 선택이 맞는지, 종료 판단이 필요해요",
    ),
    // business-buy / A / lexical — acquire-existing paraphrase
    authored(
      requireSeedSlot("fsv1-biz-buy-A-003"),
      "권리금을 물고 직원도 그대로 받는 조건으로 분식집을 인수해도 될지 판단받고 싶어요",
    ),
    // job-changeJob / A / lexical — workplace-switch paraphrase
    authored(
      requireSeedSlot("fsv1-job-changeJob-A-003"),
      "시내 카페 알바를 접고 물류센터 주간직으로 자리를 옮기는 게 이 시점에 맞는지 판단받고 싶어요",
    ),
    // job-leaveJob / A / lexical — exit-employer paraphrase
    authored(
      requireSeedSlot("fsv1-job-leaveJob-A-003"),
      "육아로 야간 교대를 버티기 어려워진 병원 자리를 퇴사해도 될지 고민이에요",
    ),
    // realEstate-buy / A / lexical — purchase paraphrase
    authored(
      requireSeedSlot("fsv1-re-buy-A-003"),
      "출퇴근이 먼 원룸을 나와 역세권 소형 오피스텔을 장만하는 게 가능한지 보고 싶어요",
    ),
    // realEstate-continue / A / lexical — hold-as-is paraphrase
    authored(
      requireSeedSlot("fsv1-re-continue-A-003"),
      "세입자가 나간 뒤 비어 있는 상가를, 당장 처분하지 않고 공실 상태로 지켜보는 선택이 맞을지 궁금해요",
    ),
    // realEstate-sell / A / lexical — dispose paraphrase
    authored(
      requireSeedSlot("fsv1-re-sell-A-003"),
      "관리비만 계속 나가는 공실 투자용 빌라를 처분해서 현금을 마련해도 될지 확신이 안 서요",
    ),
    // money-invest / A / lexical — put-money-to-work paraphrase
    authored(
      requireSeedSlot("fsv1-money-invest-A-003"),
      "부모님께 받은 축의금으로 주식형 펀드를 사도 될지 봐주시면 좋겠어요",
    ),
    // money-manageMoney / A / lexical — cash-routing method paraphrase
    authored(
      requireSeedSlot("fsv1-money-manageMoney-A-003"),
      "용돈을 현금으로만 쓰고 공과금은 별도 통장에서 빼는 관리 방식이 맞는지 봐주시면 좋겠어요",
    ),
    // lifeDirection / A / lexical — confirm-direction paraphrase
    authored(
      requireSeedSlot("fsv1-lifeDirection-A-003"),
      "야간 공부를 이어가며 잡고 있는 삶의 큰 줄기가 이대로여도 되는지 확인하고 싶어요",
    ),
    // relationship / A / lexical — relationship-possibility paraphrase
    authored(
      requireSeedSlot("fsv1-relationship-A-003"),
      "직장 동료와 퇴근 후 따로 만나 보는 인연을 이어갈 여지가 있는지 보고 싶어요",
    ),
    // general / A / lexical — overall-judgement paraphrase
    authored(
      requireSeedSlot("fsv1-general-A-003"),
      "이사 준비와 건강 검진이 겹친 요즘이 전반적으로 어떤 흐름인지, 큰 축만 짚어주시면 좋겠어요",
    ),

    // ── Question Authoring Batch 4 (14) — next unauthored slot per family ──
    // business-start / A / lexical — start-possibility paraphrase
    authored(
      requireSeedSlot("fsv1-biz-start-A-005"),
      "펫미용 자격증을 딴 뒤 작은 샵을 차려 손님을 받기 시작하는 게, 지금 시점에 실행해도 되는 선택인지 마음이 안 놓여요",
    ),
    // business-continue / A / lexical — keep-running paraphrase
    authored(
      requireSeedSlot("fsv1-biz-continue-A-004"),
      "야간 영업만으로 버티는 노래방을 당분간 닫지 않고 유지하는 판단이 맞을까요?",
    ),
    // business-stop / A / lexical — wind-down paraphrase
    authored(
      requireSeedSlot("fsv1-biz-stop-A-004"),
      "부품 수급이 막힌 휴대폰 수리점을 이번 분기에 완전히 그만두는 게 맞을지 무거워요",
    ),
    // business-buy / A / lexical — acquire-existing paraphrase
    authored(
      requireSeedSlot("fsv1-biz-buy-A-004"),
      "재고와 집기가 남은 중고서점을 매입해 자리를 이어가도 될지 마음이 흔들려요",
    ),
    // job-changeJob / A / lexical — workplace-switch paraphrase
    authored(
      requireSeedSlot("fsv1-job-changeJob-A-004"),
      "초등학교 기간제 교사 자리를 두고, 기업 교육 강사로 소속을 바꾸는 게 이 시점에 맞는지 고민이에요",
    ),
    // job-leaveJob / A / lexical — exit-employer paraphrase
    authored(
      requireSeedSlot("fsv1-job-leaveJob-A-004"),
      "실적 압박이 커진 보험 설계사 자리를 놓고 나와도 될지 확신이 안 서요",
    ),
    // realEstate-buy / A / lexical — purchase paraphrase
    authored(
      requireSeedSlot("fsv1-re-buy-A-004"),
      "부모님 병원 통원 때문에 근처 소형 아파트를 매수하는 선택이 지금 가능한지 흔들려요",
    ),
    // realEstate-continue / A / lexical — hold-as-is paraphrase
    authored(
      requireSeedSlot("fsv1-re-continue-A-004"),
      "상속받은 임야를 당장 개발하거나 팔지 않고 그대로 지켜보는 쪽이 맞을지 궁금해요",
    ),
    // realEstate-sell / A / lexical — dispose paraphrase
    authored(
      requireSeedSlot("fsv1-re-sell-A-004"),
      "도심 주차장을 매각해 목돈을 만드는 쪽이 지금 흐름에 맞을지 마음이 안 놓여요",
    ),
    // money-invest / A / lexical — put-money-to-work paraphrase
    authored(
      requireSeedSlot("fsv1-money-invest-A-004"),
      "연말 성과급을 ETF에 넣는 선택이 지금 가능한지 확신이 안 서요",
    ),
    // money-manageMoney / A / lexical — cash-routing method paraphrase
    authored(
      requireSeedSlot("fsv1-money-manageMoney-A-004"),
      "월급을 봉투별로 쪼개 쓰고 남는 금액만 저축하는 방식이 지금 맞을까요?",
    ),
    // lifeDirection / B / lexical — direction target variation (domestic settle vs overseas train)
    authored(
      requireSeedSlot("fsv1-lifeDirection-B-001"),
      "지금 직장에 뿌리를 내릴지, 해외 연수로 판을 바꿀지 인생 방향이 갈려서 어느 쪽으로 잡아야 할지 고민이에요",
    ),
    // relationship / B / lexical — relationship target variation (neighbor → romantic stage)
    authored(
      requireSeedSlot("fsv1-relationship-B-001"),
      "이웃으로만 지내던 사이가 연애로 번질 수 있는 관계인지, 친구에 머무는 편이 나은지 선택의 여지가 궁금해요",
    ),
    // general / B / lexical — situational target variation (overall flow amid life rhythm drift)
    authored(
      requireSeedSlot("fsv1-general-B-001"),
      "생활 리듬이 자꾸 어긋나는 요즘이, 큰 기운 면에서는 막힌 시기인지 풀리는 중인지 전반적으로 알고 싶어요",
    ),

    // ── Question Authoring Batch 5 (14) — next unauthored slot per family ──
    // business-start / A / lexical — start-possibility paraphrase
    authored(
      requireSeedSlot("fsv1-biz-start-A-006"),
      "중고 카메라 수리만 받던 취미를 사업자 등록해 본업으로 처음 펼치는 시작이, 지금 흐름에서 가능한지 보고 싶어요",
    ),
    // business-continue / B / lexical — keep-running target variation (shared studio → solo hold)
    authored(
      requireSeedSlot("fsv1-biz-continue-B-001"),
      "공동 작업실 월세를 나눠 쓰던 도예 공방을, 혼자 남아서라도 당분간 접지 않고 유지하는 판단이 맞을까요?",
    ),
    // business-stop / B / lexical — wind-down target variation (unattended laundry)
    authored(
      requireSeedSlot("fsv1-biz-stop-B-001"),
      "건물주 요청으로 계약이 끝나는 무인 빨래방을 이번 달로 완전히 접는 쪽이 맞을지 무거워요",
    ),
    // business-buy / B / lexical — acquire target variation (neighborhood gym)
    authored(
      requireSeedSlot("fsv1-biz-buy-B-001"),
      "기존 회원과 기구가 남아 있는 동네 헬스장을 인수해 이어가도 될지 망설여져요",
    ),
    // job-changeJob / A / lexical — workplace-switch paraphrase
    authored(
      requireSeedSlot("fsv1-job-changeJob-A-005"),
      "편의점 야간 알바를 접고 택배 상하차 정규직으로 자리를 옮기는 게 이 시점에 가능한지 판단받고 싶어요",
    ),
    // job-leaveJob / B / lexical — exit target variation (regular → freelance-only)
    authored(
      requireSeedSlot("fsv1-job-leaveJob-B-001"),
      "디자인팀 정규직을 놓고 프리랜서로만 나가는 선택이 지금 맞는지 확신이 안 서요",
    ),
    // realEstate-buy / B / lexical — purchase target variation (rural settle house)
    authored(
      requireSeedSlot("fsv1-re-buy-B-001"),
      "귀촌 준비로 시골 작은 주택을 매수하는 선택이 지금 가능한지 흔들려요",
    ),
    // realEstate-continue / B / lexical — hold target variation (vacant home during overseas work)
    authored(
      requireSeedSlot("fsv1-re-continue-B-001"),
      "해외 근무 동안 비워 둔 국내 아파트를 당장 팔지 않고 그대로 들고 가는 편이 맞을까요?",
    ),
    // realEstate-sell / B / lexical — dispose target variation (idle mountain pension)
    authored(
      requireSeedSlot("fsv1-re-sell-B-001"),
      "운영이 멈춘 산골 펜션을 매각해 정리하는 쪽이 지금 흐름에 맞을지 마음이 안 놓여요",
    ),
    // money-invest / B / lexical — invest target variation (physical gold allocation)
    authored(
      requireSeedSlot("fsv1-money-invest-B-001"),
      "월급 일부를 금 현물에 나눠 넣는 투자가 지금 가능한 선택인지 알고 싶어요",
    ),
    // money-manageMoney / B / lexical — cash-routing target variation (joint household card)
    authored(
      requireSeedSlot("fsv1-money-manageMoney-B-001"),
      "부부 카드를 하나로 합치고 생활비만 공동 통장에서 빼는 관리 방식이 맞는지 봐주시면 좋겠어요",
    ),
    // lifeDirection / B / lexical — direction target variation (caregiving weight vs career rebuild)
    authored(
      requireSeedSlot("fsv1-lifeDirection-B-002"),
      "부모님 돌봄에 무게를 둘지, 커리어를 다시 키울지 인생 방향이 갈려서 어느 쪽으로 잡아야 할지 고민이에요",
    ),
    // relationship / B / lexical — relationship target variation (ex reconnect → romance vs friend)
    authored(
      requireSeedSlot("fsv1-relationship-B-002"),
      "예전에 헤어진 사람과 다시 연락이 닿아, 연인으로 이어갈 여지가 있는지 친구로만 둘지 선택의 여지가 궁금해요",
    ),
    // general / C / syntactic — overall-judgement via open-form ask
    authored(
      requireSeedSlot("fsv1-general-C-001"),
      "이사와 이직 이야기가 한꺼번에 도는 요즘이 전반적으로 어떤 흐름인지, 왜 그렇게 보이는지 근거부터 듣고 싶어요",
    ),

    // ── Question Authoring Batch 6 (14) — next unauthored slot per family ──
    // business-start / B / lexical — start target variation (weekend sauce → food truck)
    authored(
      requireSeedSlot("fsv1-biz-start-B-001"),
      "주말 장터에서만 팔던 수제 소스를, 푸드트럭으로 처음 영업을 시작하는 게 지금 흐름에서 가능한지 보고 싶어요",
    ),
    // business-continue / B / lexical — keep-running target variation (shared-kitchen lunchbox)
    authored(
      requireSeedSlot("fsv1-biz-continue-B-002"),
      "공유 주방에서 돌리던 도시락 판매를, 당분간 접지 않고 유지하는 판단이 맞을까요?",
    ),
    // business-stop / B / lexical — wind-down target variation (beach sand playroom)
    authored(
      requireSeedSlot("fsv1-biz-stop-B-002"),
      "관광객이 끊긴 해변 모래놀이방을 이번 시즌으로 완전히 접는 쪽이 맞을지 무거워요",
    ),
    // business-buy / B / lexical — acquire target variation (self-service car wash)
    authored(
      requireSeedSlot("fsv1-biz-buy-B-002"),
      "기계와 회원권이 남아 있는 셀프 세차장을 인수해 이어가도 될지 망설여져요",
    ),
    // job-changeJob / B / lexical — workplace-switch target variation (hotel → airline ground)
    authored(
      requireSeedSlot("fsv1-job-changeJob-B-002"),
      "호텔 프론트 자리를 두고, 항공사 지상직으로 소속을 바꾸는 게 이 시점에 맞는지 고민이에요",
    ),
    // job-leaveJob / B / lexical — exit target variation (school admin contract end)
    authored(
      requireSeedSlot("fsv1-job-leaveJob-B-002"),
      "학교 행정실 계약을 갱신하지 않고 나오는 선택이 지금 맞는지 확신이 안 서요",
    ),
    // realEstate-buy / B / lexical — purchase target variation (suburban garden plot)
    authored(
      requireSeedSlot("fsv1-re-buy-B-002"),
      "주말 텃밭용으로 근교 작은 토지를 매수하는 선택이 지금 가능한지 흔들려요",
    ),
    // realEstate-continue / B / lexical — hold target variation (joint condo during divorce)
    authored(
      requireSeedSlot("fsv1-re-continue-B-002"),
      "이혼 소송이 길어지는 동안 공동명의 아파트를 당장 팔지 않고 그대로 들고 가는 편이 맞을까요?",
    ),
    // realEstate-sell / B / lexical — dispose target variation (idle coastal cottage)
    authored(
      requireSeedSlot("fsv1-re-sell-B-002"),
      "쓰이지 않는 해안가 별장을 매각해 정리하는 쪽이 지금 흐름에 맞을지 마음이 안 놓여요",
    ),
    // money-invest / B / lexical — invest target variation (corporate bond allocation)
    authored(
      requireSeedSlot("fsv1-money-invest-B-002"),
      "여윳돈을 회사채에 나눠 넣는 투자가 지금 가능한 선택인지 알고 싶어요",
    ),
    // money-manageMoney / B / lexical — cash-routing target variation (kids tuition silo)
    authored(
      requireSeedSlot("fsv1-money-manageMoney-B-002"),
      "아이 학원비를 별도 통장으로 떼어 두고 생활비 통장과 섞지 않는 관리 방식이 맞는지 봐주시면 좋겠어요",
    ),
    // lifeDirection / C / syntactic — confirm-direction via open-form ask
    authored(
      requireSeedSlot("fsv1-lifeDirection-C-001"),
      "지금 붙잡고 있는 삶의 궤도가 흔들리지 않는 축인지, 왜 그렇게 보이는지 근거부터 듣고 싶어요",
    ),
    // relationship / C / syntactic — relationship-possibility via open-form ask
    authored(
      requireSeedSlot("fsv1-relationship-C-001"),
      "같은 학원에서 자주 마주치는 보호자와의 인연이 관계로 번질 여지가 있는지, 왜 그렇게 보이는지 근거부터 듣고 싶어요",
    ),
    // general / D / syntactic — overall judgement vs domain-narrowing boundary
    authored(
      requireSeedSlot("fsv1-general-D-001"),
      "직장·돈 문제로 좁혀 묻기보다, 요즘이 전반적으로 어떤 흐름인지부터 봐야 할지 경계가 흐려요",
    ),

    // ── Question Authoring Batch 7 (14) — next unauthored slot per family ──
    // business-start / B / lexical — start target variation (home bike repair → paid workshop)
    authored(
      requireSeedSlot("fsv1-biz-start-B-002"),
      "집에서만 고치던 자전거를, 골목 작업실을 얻어 처음 유료 수리를 시작하는 게 지금 흐름에서 가능한지 보고 싶어요",
    ),
    // business-continue / B / lexical — keep-running target variation (weekend record shop)
    authored(
      requireSeedSlot("fsv1-biz-continue-B-003"),
      "주말에만 여는 중고 레코드샵을, 당분간 접지 않고 유지하는 판단이 맞을까요?",
    ),
    // business-stop / B / lexical — wind-down target variation (indoor climbing gym)
    authored(
      requireSeedSlot("fsv1-biz-stop-B-003"),
      "예약이 끊긴 실내 클라이밍장을 이번 분기로 완전히 접는 쪽이 맞을지 무거워요",
    ),
    // business-buy / C / syntactic — acquire via open-form ask
    authored(
      requireSeedSlot("fsv1-biz-buy-C-001"),
      "단골 장부와 암실 장비가 남은 사진관을 인수해 이어가도 될지, 왜 그렇게 보이는지 근거부터 듣고 싶어요",
    ),
    // job-changeJob / B / lexical — workplace-switch target variation (museum → gallery admin)
    authored(
      requireSeedSlot("fsv1-job-changeJob-B-003"),
      "박물관 도슨트 자리를 두고, 미술관 행정직으로 소속을 바꾸는 게 이 시점에 맞는지 고민이에요",
    ),
    // job-leaveJob / B / lexical — exit target variation (broadcast assistant contract end)
    authored(
      requireSeedSlot("fsv1-job-leaveJob-B-003"),
      "방송국 조연출 계약을 연장하지 않고 나오는 선택이 지금 맞는지 확신이 안 서요",
    ),
    // realEstate-buy / B / lexical — purchase target variation (second-home hanok)
    authored(
      requireSeedSlot("fsv1-re-buy-B-003"),
      "세컨드하우스로 쓸 작은 한옥을 매수하는 선택이 지금 가능한지 흔들려요",
    ),
    // realEstate-continue / C / syntactic — hold via open-form ask
    authored(
      requireSeedSlot("fsv1-re-continue-C-001"),
      "재개발 지정만 기다리는 동안 낡은 다가구를 당장 팔지 않고 들고 가는 편이 맞는지, 왜 그렇게 보이는지 근거부터 듣고 싶어요",
    ),
    // realEstate-sell / C / syntactic — dispose via open-form ask
    authored(
      requireSeedSlot("fsv1-re-sell-C-001"),
      "관리가 버거운 전원주택을 매각해 정리하는 쪽이 맞는지, 왜 그렇게 보이는지 근거부터 듣고 싶어요",
    ),
    // money-invest / B / lexical — invest target variation (foreign sovereign bonds)
    authored(
      requireSeedSlot("fsv1-money-invest-B-003"),
      "여윳돈을 해외 국채에 나눠 넣는 투자가 지금 가능한 선택인지 알고 싶어요",
    ),
    // money-manageMoney / C / syntactic — cash-routing via open-form ask
    authored(
      requireSeedSlot("fsv1-money-manageMoney-C-001"),
      "고정비를 먼저 이체하고 남은 금액만 쓰는 관리 방식이 맞는지, 왜 그렇게 보이는지 근거부터 듣고 싶어요",
    ),
    // lifeDirection / D / syntactic — confirm-direction vs job-switch boundary
    authored(
      requireSeedSlot("fsv1-lifeDirection-D-001"),
      "이직으로 판을 바꿀지 삶의 큰 방향을 그대로 둘지 사이에서, 방향 확인으로 기울어도 될지 경계가 흐려요",
    ),
    // relationship / D / syntactic — relationship-possibility vs business-partner boundary
    authored(
      requireSeedSlot("fsv1-relationship-D-001"),
      "동업자로만 남을지 연인으로 번질지 사이에서, 관계 가능성으로 기울어도 될지 경계가 흐려요",
    ),
    // general / D / syntactic — overall judgement vs single-domain narrowing boundary
    authored(
      requireSeedSlot("fsv1-general-D-002"),
      "연애나 이직 한 가지로 바로 결론 내기보다, 지금 시기를 종합적으로 먼저 읽어야 할지 경계가 흐려요",
    ),

    // ── Question Authoring Batch 8 (14) — next unauthored slot per family ──
    // business-start / B / lexical — start target variation (hobby leather → paid atelier)
    authored(
      requireSeedSlot("fsv1-biz-start-B-003"),
      "취미로만 만들던 가죽 소품을, 동네 공방을 얻어 처음 판매로 내놓는 시작이 이 시점에 가능한지 흔들려요",
    ),
    // business-continue / C / syntactic — keep-running via open-form ask
    authored(
      requireSeedSlot("fsv1-biz-continue-C-001"),
      "골목 헌책방 운영을 접지 않고 당분간 유지해도 될지, 어떤 근거로 그렇게 읽히는지부터 짚어주시면 좋겠어요",
    ),
    // business-stop / C / syntactic — wind-down via open-form ask
    authored(
      requireSeedSlot("fsv1-biz-stop-C-001"),
      "손님 발길이 끊긴 만화카페를 이번 달로 완전히 접는 쪽이 맞을지, 왜 그쪽으로 읽히는지부터 설명해 주시면 좋겠어요",
    ),
    // business-buy / C / syntactic — acquire via open-form ask
    authored(
      requireSeedSlot("fsv1-biz-buy-C-002"),
      "설비와 거래처가 남은 세탁소를 인수해 이어가도 될지, 왜 그 취득이 가능한 선택으로 보이는지부터 듣고 싶어요",
    ),
    // job-changeJob / C / syntactic — workplace-switch via open-form ask
    authored(
      requireSeedSlot("fsv1-job-changeJob-C-001"),
      "물류센터 야간직을 두고 낮 근무 콜센터로 소속을 바꾸는 게 맞는지, 왜 그 이동이 흐름에 맞는다고 보이는지부터 알고 싶어요",
    ),
    // job-leaveJob / C / syntactic — exit via open-form ask
    authored(
      requireSeedSlot("fsv1-job-leaveJob-C-001"),
      "연구소 계약직을 연장하지 않고 나오는 선택이 지금 맞는지—퇴사로 봐도 될지 근거만 먼저 듣고 싶어요",
    ),
    // realEstate-buy / C / syntactic — purchase via open-form ask
    authored(
      requireSeedSlot("fsv1-re-buy-C-001"),
      "부모님 근처 소형 아파트를 매수하는 선택이 지금 가능한지, 왜 그쪽으로 읽히는지부터 설명해 주시면 좋겠어요",
    ),
    // realEstate-continue / C / syntactic — hold via open-form ask
    authored(
      requireSeedSlot("fsv1-re-continue-C-002"),
      "상속 분할이 끝나기 전 시골 땅을 당장 팔지 않고 들고 가는 편이 맞을까요, 아니면 다른 축으로 먼저 봐야 할까요?",
    ),
    // realEstate-sell / C / syntactic — dispose via open-form ask
    authored(
      requireSeedSlot("fsv1-re-sell-C-002"),
      "빈집으로 남은 다가구를 매각해 정리하는 쪽이 맞는지 단정하기 어려워, 처분으로 읽히는 이유부터 듣고 싶어요",
    ),
    // money-invest / C / syntactic — invest via open-form ask
    authored(
      requireSeedSlot("fsv1-money-invest-C-002"),
      "여윳돈을 리츠에 나눠 넣는 투자가 지금 가능한지, 그렇게 볼 수 있는 이유만 먼저 짚어주시면 좋겠어요",
    ),
    // money-manageMoney / C / syntactic — cash-routing via open-form ask
    authored(
      requireSeedSlot("fsv1-money-manageMoney-C-002"),
      "비상금을 단기 예금에만 모아 두고 소비 통장과 섞지 않는 관리가 맞는지, 왜 그 방식이 맞다고 읽히는지부터 듣고 싶어요",
    ),
    // lifeDirection / D / syntactic — confirm-direction vs home-buy boundary
    authored(
      requireSeedSlot("fsv1-lifeDirection-D-002"),
      "집 마련에 올인할지 삶의 큰 궤도를 먼저 잡을지 사이에서, 방향 확인 쪽으로 읽어도 되는지 선이 안 보여요",
    ),
    // relationship / D / syntactic — relationship-possibility vs coworker-only boundary
    authored(
      requireSeedSlot("fsv1-relationship-D-002"),
      "같은 팀 동료로만 둘지 연인으로 번질지 사이에서, 관계 쪽 가능성으로 읽어도 되는지 경계가 안 보여요",
    ),
    // general / E / combinational — uncommon loanword phrasing for overall judgement
    authored(
      requireSeedSlot("fsv1-general-E-001"),
      "지금 시기를 전체 컨텍스트로 먼저 리딩해야 할지, 라이프 페이즈의 메타 판단으로 잡아도 될지 윤곽이 흐려요",
    ),

    // ── Question Authoring Batch 9 (14) — next unauthored slot per family ──
    // business-start / C / syntactic — start via open-form ask
    authored(
      requireSeedSlot("fsv1-biz-start-C-001"),
      "주문 제작만 받던 수제 캔들을 작은 쇼룸을 얻어 처음 매장으로 여는 시작이 가능한지—가능으로 보는 이유를 먼저 듣고 싶어요",
    ),
    // business-continue / C / syntactic — keep-running via open-form ask
    authored(
      requireSeedSlot("fsv1-biz-continue-C-002"),
      "겨울만 바쁘던 중고 스키 대여점을 비수기에도 접지 않고 유지해도 될지, 왜 유지로 보는지 판단 순서부터 알려주세요",
    ),
    // business-stop / C / syntactic — wind-down via open-form ask
    authored(
      requireSeedSlot("fsv1-biz-stop-C-002"),
      "주말 심야만 버티던 보드게임카페를 이번 분기 안에 접는 편이 나을까요—종료로 보는 근거부터 듣고 싶어요",
    ),
    // business-buy / D / syntactic — acquire vs keep-running boundary
    authored(
      requireSeedSlot("fsv1-biz-buy-D-001"),
      "지금 돌리는 포장 공방을 키울지, 옆 골목 공방을 통째로 사들여 이어갈지 사이에서 취득 쪽으로 기울어도 되는지 경계가 흐려 고민이에요",
    ),
    // job-changeJob / C / syntactic — workplace-switch via open-form ask
    authored(
      requireSeedSlot("fsv1-job-changeJob-C-002"),
      "도서관 열람실 직원에서 출판사 교정 보조로 옮기는 이직이 맞는지 고민인데, 그 이동이 가능한 선택으로 보이는 근거부터 설명해 주시면 좋겠어요",
    ),
    // job-leaveJob / C / syntactic — exit via open-form ask
    authored(
      requireSeedSlot("fsv1-job-leaveJob-C-002"),
      "세무사무소 정규직을 놓고 밖으로 나오는 선택이 지금 맞는지, 왜 퇴사로 봐도 되는지부터 근거를 듣고 싶어요",
    ),
    // realEstate-buy / C / syntactic — purchase via open-form ask
    authored(
      requireSeedSlot("fsv1-re-buy-C-002"),
      "역 앞 도시형 생활주택을 분양받아 내 집으로 들이는 매수가 지금 가능한 선택인지 고민인데, 그렇게 보는 근거만 먼저 듣고 싶어요",
    ),
    // realEstate-continue / D / syntactic — hold vs sell boundary
    authored(
      requireSeedSlot("fsv1-re-continue-D-001"),
      "재계약 협상이 길어지는 동안 월세 상가를 당장 처분하지 않고 들고 갈지, 매각으로 볼지 사이에서 보유 쪽으로 기울어도 되는지 고민이에요",
    ),
    // realEstate-sell / D / syntactic — dispose vs hold boundary
    authored(
      requireSeedSlot("fsv1-re-sell-D-001"),
      "관리비만 나가는 옥상 광고 부지를 매각할지 당분간 들고 갈지 사이에서, 처분 쪽으로 읽어도 되는지 망설여져요",
    ),
    // money-invest / D / syntactic — invest vs cash-hold boundary
    authored(
      requireSeedSlot("fsv1-money-invest-D-001"),
      "여윳돈을 인덱스 펀드에 넣을지 예·적금에만 묶어 둘지 사이에서, 투자 쪽으로 기울어도 되는지 고민이에요",
    ),
    // money-manageMoney / D / syntactic — cash-routing vs invest boundary
    authored(
      requireSeedSlot("fsv1-money-manageMoney-D-001"),
      "생활비를 주 단위 예산으로만 막을지, 남는 돈을 시장에 태울지 사이에서 현금 관리 방식으로 기울어도 되는지 고민이에요",
    ),
    // lifeDirection / D / combinational — confirm-direction vs partnership-offer boundary
    authored(
      requireSeedSlot("fsv1-lifeDirection-D-003"),
      "새 일을 벌이는 제안에 응할지 지금 삶의 축을 먼저 확인할지 갈리는데, 방향 확인으로 읽어도 되는 경계인지 고민이에요",
    ),
    // relationship / D / combinational — relationship-possibility vs trade-acquaintance boundary
    authored(
      requireSeedSlot("fsv1-relationship-D-003"),
      "공동주문 단톡에서만 알던 사이를 연인으로 볼지 거래 지인으로만 둘지 갈리는데, 관계 가능성으로 읽어도 되는지 고민이에요",
    ),
    // general / G / combinational — overall judgement vs immediate action-pick design limit
    authored(
      requireSeedSlot("fsv1-general-G-001"),
      "요즘 전반 흐름을 묻는 건지, 당장 손대야 할 선택을 하나로 찍어달라는 건지 질문 자체가 한 축으로 안 모여요",
    ),

    // ── Question Authoring Batch 10 (13) — next unauthored slot per remaining family ──
    // general omitted: softMax=10 already authored; no new general slot
    // business-start / C / syntactic — start via open-form ask
    authored(
      requireSeedSlot("fsv1-biz-start-C-002"),
      "주말마다 팔던 수제 도장을 골목 작업실로 처음 내놓는 시작이 가능한지, 왜 가능으로 보이는지 이유 순서만 먼저 듣고 싶어요",
    ),
    // business-continue / D / syntactic — keep-running vs wind-down boundary
    authored(
      requireSeedSlot("fsv1-biz-continue-D-001"),
      "밤늦게만 손님 오던 무인 사진관을 당분간 유지할지 이번 달에 접을지 선이 갈리는데, 유지 쪽으로 봐도 되는지 고민이에요",
    ),
    // business-stop / D / syntactic — wind-down vs keep-running boundary
    authored(
      requireSeedSlot("fsv1-biz-stop-D-001"),
      "단골만 겨우 오는 골목 수선 공방을 이번 분기로 접을지 좀 더 버틸지 헷갈리는데, 종료로 읽어도 되는 쪽인지 고민이에요",
    ),
    // business-buy / D / syntactic — acquire vs scale-own boundary
    authored(
      requireSeedSlot("fsv1-biz-buy-D-002"),
      "지금 돌리는 무인 아이스크림 가게를 키울지, 옆 블록 가게를 통째로 넘겨받을지 갈리는데—취득으로 봐도 되는지 선이 흐려요",
    ),
    // job-changeJob / D / syntactic — workplace-switch vs exit boundary
    authored(
      requireSeedSlot("fsv1-job-changeJob-D-001"),
      "지금 다니는 콜센터를 두고 다른 회사 주간직으로 옮길지, 아예 일을 놓고 쉴지 갈리는데, 이직 쪽으로 봐도 되는지 망설여져요",
    ),
    // job-leaveJob / D / syntactic — exit vs workplace-switch boundary
    authored(
      requireSeedSlot("fsv1-job-leaveJob-D-001"),
      "연구소 계약을 연장하지 않고 나올지, 다른 랩으로 소속만 바꿀지 갈리는데—퇴사로 읽어도 되는지 망설여져요",
    ),
    // realEstate-buy / D / syntactic — purchase vs keep-renting boundary
    authored(
      requireSeedSlot("fsv1-re-buy-D-002"),
      "월세 원룸에 남을지, 근처 소형 오피스텔을 사서 옮길지 갈리는데, 매수로 기울어도 되는 경계인지 망설여져요",
    ),
    // realEstate-continue / D / syntactic — hold vs dispose boundary
    authored(
      requireSeedSlot("fsv1-re-continue-D-002"),
      "공동명의 상가를 당분간 처분하지 않고 지켜볼지, 매각으로 정리할지 갈리는데 보유로 봐도 되는지 망설여져요",
    ),
    // realEstate-sell / D / syntactic — dispose vs hold boundary
    authored(
      requireSeedSlot("fsv1-re-sell-D-002"),
      "쓰이지 않는 근교 창고 건물을 매각할지 공실로 두고 갈지 갈리는데, 처분 쪽으로 읽어도 되는지 고민이에요",
    ),
    // money-invest / D / syntactic — invest vs cash-hold boundary
    authored(
      requireSeedSlot("fsv1-money-invest-D-002"),
      "성과급을 단기 예금에만 묶어 둘지 ETF에 나눠 넣을지 갈리는데, 투자로 기울어도 되는 경계인지 확신이 안 서요",
    ),
    // money-manageMoney / D / syntactic — cash-routing vs invest boundary
    authored(
      requireSeedSlot("fsv1-money-manageMoney-D-002"),
      "보너스를 비상금 통장에만 모아 둘지 시장에 태울지 갈리는데, 현금 관리 방식으로 읽어도 되는지 망설여져요",
    ),
    // lifeDirection / E / combinational — uncommon vocabulary for confirm-direction
    authored(
      requireSeedSlot("fsv1-lifeDirection-E-001"),
      "지금 잡고 있는 라이프 벡터를 리밸런싱할지, 커리어 패러다임을 그대로 홀딩할지—방향 확인의 메타 프레임으로 봐도 될지 윤곽이 흐려요",
    ),
    // relationship / F / combinational — possibility primary + pacing secondary
    authored(
      requireSeedSlot("fsv1-relationship-F-001"),
      "소개팅으로 만난 사람과 연애 가능성을 보면서, 주말 약속 빈도만 먼저 조절해 보는 쪽이 나을까요?",
    ),

    // ── Question Authoring Batch 11 (7) — cherry-picked E/F/G toward 160 floor ──
    // business-start / E / combinational — uncommon vocabulary for start-possibility
    authored(
      requireSeedSlot("fsv1-biz-start-E-001"),
      "취미로만 돌리던 수제 향초를 다크키친형 공유주방으로 첫 런칭하는 창업이 지금 가능한지 고민이에요—비즈니스 이니시에이션 프레임으로 봐도 될지 확신이 없어요",
    ),
    // job-changeJob / E / combinational — uncommon vocabulary for workplace-switch
    authored(
      requireSeedSlot("fsv1-job-changeJob-E-001"),
      "시립도서관 서고 자리에서 ESG 컨설팅 주니어로 커리어 스위치를 거는 이직이 지금 가능한지—잡 모빌리티 프레임으로 봐도 될까요?",
    ),
    // business-stop / F / combinational — wind-down primary + inventory clear-out secondary
    authored(
      requireSeedSlot("fsv1-biz-stop-F-001"),
      "손님 발길이 끊긴 골목 문구 가게를 이번 분기로 접으면서, 남은 재고만 온라인으로 소진하고 문을 닫는 폐업이 맞을지 망설여져요",
    ),
    // realEstate-buy / G / combinational — auction-bid vs negotiated-purchase design limit
    authored(
      requireSeedSlot("fsv1-re-buy-G-001"),
      "경매로 낙찰받아 들이는 것과 일반 매매로 계약하는 게 한 덩어리로 겹쳐 보여요. 지금 시점에서 매수 여부를 어느 축으로 보면 나을까요?",
    ),
    // money-invest / E / combinational — uncommon vocabulary for invest-possibility
    authored(
      requireSeedSlot("fsv1-money-invest-E-001"),
      "비상금 일부로 테마형 액티브 펀드에 캐피탈을 태우는 인베스트가 지금 고잉인지 망설여져요—마켓 익스포저 프레임으로 봐도 될지 확신이 없어요",
    ),
    // lifeDirection / F / combinational — confirm-direction primary + city-anchor secondary
    authored(
      requireSeedSlot("fsv1-lifeDirection-F-001"),
      "지금 삶의 큰 방향을 확인하면서, 거주지와 직장을 같은 도시로 묶을지 여부만 먼저 정리해 보는 쪽이 나을까요?",
    ),
    // relationship / G / combinational — dating-possibility vs acquaintance-distance design limit
    authored(
      requireSeedSlot("fsv1-relationship-G-001"),
      "등산 모임에서만 보던 사이가 연애로 번질지 편한 지인으로만 둘지—관계 가능성과 거리 두기가 한 축으로 안 모여서 망설여져요",
    ),
  ];
