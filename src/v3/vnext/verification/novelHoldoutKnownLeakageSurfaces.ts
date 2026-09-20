/**
 * P11-7-1 Known-Pool Leakage Corpus (verification-only).
 *
 * Question-surface rows previously exposed to Reader / probes / P11 batches.
 * Used ONLY for Novelty/Leakage Known-pool compare.
 *
 * Forbidden in this file:
 * - Reader actual
 * - expected classification / Gold
 * - failure classification
 * - engine results
 * - Blind Gold promotion
 *
 * Does NOT import tmp/*.json at runtime.
 */

import type {
  NovelHoldoutFamily,
  NovelHoldoutKnownPoolSource,
} from "./novelHoldoutContract.js";

/**
 * Curated leakage compare-only question surface.
 * Keep fields minimal — never attach Gold / actual / expected axes as oracle.
 */
export type NovelHoldoutKnownLeakageSurface = {
  id: string;
  question: string;
  source: Extract<
    NovelHoldoutKnownPoolSource,
    | "reader_verification_leakage_compare_only"
    | "probe_leakage_compare_only"
    | "p11_exposed_leakage_compare_only"
  >;
  family?: NovelHoldoutFamily;
  /**
   * Optional reporting axis hint (not Gold expected).
   * Format topic|intent|decisionTarget when known from probe family label.
   */
  axis?: string;
};

function probe(
  id: string,
  question: string,
  family: NovelHoldoutFamily,
  axis?: string,
): NovelHoldoutKnownLeakageSurface {
  return {
    id,
    question,
    source: "probe_leakage_compare_only",
    family,
    axis,
  };
}

function readerVerification(
  id: string,
  question: string,
  family?: NovelHoldoutFamily,
): NovelHoldoutKnownLeakageSurface {
  return {
    id,
    question,
    source: "reader_verification_leakage_compare_only",
    family,
  };
}

function p11Exposed(
  id: string,
  question: string,
  family?: NovelHoldoutFamily,
): NovelHoldoutKnownLeakageSurface {
  return {
    id,
    question,
    source: "p11_exposed_leakage_compare_only",
    family,
  };
}

/**
 * A1 — business-continue colloquial / non-canonical probe surfaces.
 */
export const NOVEL_HOLDOUT_LEAKAGE_SURFACES_A1_BUSINESS_CONTINUE:
  readonly NovelHoldoutKnownLeakageSurface[] = [
    probe(
      "p11-7-1-a1-cont-001",
      "지금 장사 흐름을 끊지 않고 그대로 굴려가는 편이 맞을지 고민돼요",
      "business-continue",
      "business|continuation|continue",
    ),
    probe(
      "p11-7-1-a1-cont-002",
      "장사를 끊지 않고 이어가도 될까요?",
      "business-continue",
      "business|continuation|continue",
    ),
    probe(
      "p11-7-1-a1-cont-003",
      "가게를 끊지 않고 계속 굴려가도 될까요?",
      "business-continue",
      "business|continuation|continue",
    ),
    probe(
      "p11-7-1-a1-cont-004",
      "매장을 그대로 굴려가도 괜찮을까요?",
      "business-continue",
      "business|continuation|continue",
    ),
    probe(
      "p11-7-1-a1-cont-005",
      "자영업을 계속 굴려가도 될까요?",
      "business-continue",
      "business|continuation|continue",
    ),
    probe(
      "p11-7-1-a1-cont-006",
      "지금 하는 장사를 그대로 이어가도 될까요?",
      "business-continue",
      "business|continuation|continue",
    ),
    probe(
      "p11-7-1-a1-cont-007",
      "운영 중인 가게를 계속 굴려가도 될까요?",
      "business-continue",
      "business|continuation|continue",
    ),
    probe(
      "p11-7-1-a1-cont-008",
      "사업을 그대로 굴려가면서 투자해도 될까요?",
      "business-continue",
      "business|continuation|continue",
    ),
    probe(
      "p11-7-1-a1-cont-009",
      "장사를 계속 굴려가면서 직장을 옮겨도 될까요?",
      "business-continue",
      "business|continuation|continue",
    ),
    probe(
      "p11-7-1-a1-cont-010",
      "가게를 끊지 않고 운영하면서 매수도 해볼까요?",
      "business-continue",
      "business|continuation|continue",
    ),
  ];

/**
 * A2 — business-stop probe surfaces (Known pool previously had 0).
 */
export const NOVEL_HOLDOUT_LEAKAGE_SURFACES_A2_BUSINESS_STOP:
  readonly NovelHoldoutKnownLeakageSurface[] = [
    probe(
      "p11-7-1-a2-stop-001",
      "이 장사를 슬슬 접고 손을 떼는 쪽이 맞을지 마음이 흔들려요",
      "business-stop",
      "business|termination|stop",
    ),
    probe(
      "p11-7-1-a2-stop-002",
      "가게를 접어야 할지 고민입니다.",
      "business-stop",
      "business|termination|stop",
    ),
    probe(
      "p11-7-1-a2-stop-003",
      "장사를 이제 접는 게 나을까요?",
      "business-stop",
      "business|termination|stop",
    ),
    probe(
      "p11-7-1-a2-stop-004",
      "매장을 정리하고 사업에서 손을 떼도 될까요?",
      "business-stop",
      "business|termination|stop",
    ),
    probe(
      "p11-7-1-a2-stop-005",
      "운영하던 가게에서 손을 떼려고 합니다.",
      "business-stop",
      "business|termination|stop",
    ),
    probe(
      "p11-7-1-a2-stop-006",
      "자영업에서 손을 떼는 게 맞을까요?",
      "business-stop",
      "business|termination|stop",
    ),
    probe(
      "p11-7-1-a2-stop-007",
      "지금 하는 장사를 접을까 망설입니다.",
      "business-stop",
      "business|termination|stop",
    ),
    probe(
      "p11-7-1-a2-stop-008",
      "사업을 접고 다른 일을 시작해도 될까요?",
      "business-stop",
      "business|termination|stop",
    ),
    probe(
      "p11-7-1-a2-stop-009",
      "가게에서 손을 떼면서 투자를 해도 될까요?",
      "business-stop",
      "business|termination|stop",
    ),
    probe(
      "p11-7-1-a2-stop-010",
      "장사를 접은 뒤 직장을 옮겨도 될까요?",
      "business-stop",
      "business|termination|stop",
    ),
    probe(
      "p11-7-1-a2-stop-011",
      "사업을 접어도 될까요?",
      "business-stop",
      "business|termination|stop",
    ),
    probe(
      "p11-7-1-a2-stop-012",
      "프랜차이즈 가맹만 해지하고 운영에서 빠져도 괜찮을까요",
      "business-stop",
      "business|termination|stop",
    ),
    probe(
      "p11-7-1-a2-stop-013",
      "버틸지 정리할지 갈림길인데, 이번에는 정리하는 쪽이 맞을까요",
      "business-stop",
      "business|termination|stop",
    ),
    probe(
      "p11-7-1-a2-stop-014",
      "비즈니스를 와인드다운해도 흐름상 무리가 없을까요",
      "business-stop",
      "business|termination|stop",
    ),
  ];

/**
 * A3 — business-buy probe surfaces (Known pool previously had 0).
 */
export const NOVEL_HOLDOUT_LEAKAGE_SURFACES_A3_BUSINESS_BUY:
  readonly NovelHoldoutKnownLeakageSurface[] = [
    probe(
      "p11-7-1-a3-buy-001",
      "사업체를 인수해도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-002",
      "사업체를 매입해도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-003",
      "사업체를 구입해도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-004",
      "사업체를 사들여도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-005",
      "권리금을 주고 가게를 넘겨받아도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-006",
      "기존 가게를 넘겨받아 운영해도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-007",
      "다른 사람이 하던 사업을 인수해도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-008",
      "운영 중인 가게를 사도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-009",
      "사업체를 사도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-010",
      "회사를 인수해도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-011",
      "법인을 인수해도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-012",
      "가게를 인수해도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-013",
      "매장을 인수해도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-014",
      "식당을 인수해도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-015",
      "가게를 매입해도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-016",
      "가게를 구입해도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-017",
      "가게를 사도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-018",
      "식당을 사도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-019",
      "권리금을 내고 가게를 사도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-020",
      "가게를 넘겨받아도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-021",
      "이미 돌아가는 가게를 인수해 들이는 쪽이 나을지 망설여져요",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-022",
      "권리금 주고 매장을 넘겨받는 게 나을까요",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-023",
      "푸드트럭 사업체를 통째로 사들여도 흐름상 괜찮을까요",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-024",
      "사업체를 사서 운영해도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-025",
      "사업체를 인수해서 운영해도 될까요?",
      "business-buy",
      "business|possibility|buy",
    ),
    probe(
      "p11-7-1-a3-buy-026",
      "사업체를 인수할지 새로 시작할지 고민입니다.",
      "business-buy",
      "business|possibility|buy",
    ),
  ];

/**
 * A4 — job-changeJob colloquial / compound probe surfaces.
 */
export const NOVEL_HOLDOUT_LEAKAGE_SURFACES_A4_JOB_CHANGE:
  readonly NovelHoldoutKnownLeakageSurface[] = [
    probe(
      "p11-7-1-a4-change-001",
      "다른 조직으로 자리를 옮겨 보는 쪽이 나을지 자꾸 흔들려요",
      "job-changeJob",
      "job|possibility|changeJob",
    ),
    probe(
      "p11-7-1-a4-change-002",
      "같은 직군인데 스타트업으로 소속을 바꿔도 괜찮을까요",
      "job-changeJob",
      "job|possibility|changeJob",
    ),
    probe(
      "p11-7-1-a4-change-003",
      "자리를 옮기기 좋은 시점은 언제쯤일까요",
      "job-changeJob",
      "job|timing|changeJob",
    ),
    probe(
      "p11-7-1-a4-change-004",
      "다음 자리가 정해진 상태에서 지금 조직을 떠나는 게 이직으로 맞을까요",
      "job-changeJob",
      "job|possibility|changeJob",
    ),
    probe(
      "p11-7-1-a4-change-005",
      "소속을 바꾸면서 부업도 같이 열어볼지 함께 판단하고 싶어요",
      "job-changeJob",
      "job|possibility|changeJob",
    ),
    probe(
      "p11-7-1-a4-change-006",
      "다른 조직으로 자리를 옮겨도 될까요?",
      "job-changeJob",
      "job|possibility|changeJob",
    ),
    probe(
      "p11-7-1-a4-change-007",
      "소속을 바꿔도 될까요?",
      "job-changeJob",
      "job|possibility|changeJob",
    ),
    probe(
      "p11-7-1-a4-change-008",
      "소속을 변경해도 될까요?",
      "job-changeJob",
      "job|possibility|changeJob",
    ),
    probe(
      "p11-7-1-a4-change-009",
      "조직을 옮겨도 될까요?",
      "job-changeJob",
      "job|possibility|changeJob",
    ),
    probe(
      "p11-7-1-a4-change-010",
      "자리를 옮겨도 될까요?",
      "job-changeJob",
      "job|possibility|changeJob",
    ),
    probe(
      "p11-7-1-a4-change-011",
      "직장 소속을 바꿔도 될까요?",
      "job-changeJob",
      "job|possibility|changeJob",
    ),
    probe(
      "p11-7-1-a4-change-012",
      "직장을 갈아타도 될까요?",
      "job-changeJob",
      "job|possibility|changeJob",
    ),
    probe(
      "p11-7-1-a4-change-013",
      "다른 회사로 자리를 옮겨도 될까요?",
      "job-changeJob",
      "job|possibility|changeJob",
    ),
    probe(
      "p11-7-1-a4-change-014",
      "직군은 같은데 소속을 바꿔도 될까요?",
      "job-changeJob",
      "job|possibility|changeJob",
    ),
  ];

/**
 * A5 — job-leaveJob colloquial / compound probe surfaces.
 */
export const NOVEL_HOLDOUT_LEAKAGE_SURFACES_A5_JOB_LEAVE:
  readonly NovelHoldoutKnownLeakageSurface[] = [
    probe(
      "p11-7-1-a5-leave-001",
      "회사를 놓고 한동안 쉬는 쪽이 맞을지 마음이 무거워요",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
    probe(
      "p11-7-1-a5-leave-002",
      "다음 자리 없이 일단 관둘까 하는 생각이 자꾸 들어요",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
    probe(
      "p11-7-1-a5-leave-003",
      "회사 놓고 쉬어도 될까요?",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
    probe(
      "p11-7-1-a5-leave-004",
      "회사를 떠나 잠시 쉬어도 될까요?",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
    probe(
      "p11-7-1-a5-leave-005",
      "다음 직장 없이 회사를 관둬도 될까요?",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
    probe(
      "p11-7-1-a5-leave-006",
      "다음 자리 없이 관둘까 고민입니다.",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
    probe(
      "p11-7-1-a5-leave-007",
      "직장을 그만두고 쉬어도 될까요?",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
    probe(
      "p11-7-1-a5-leave-008",
      "퇴사하고 쉬어도 될까요?",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
    probe(
      "p11-7-1-a5-leave-009",
      "회사를 그만두고 다른 일을 찾지 않아도 될까요?",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
    probe(
      "p11-7-1-a5-leave-010",
      "놓고 쉬어도 될까요?",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
    probe(
      "p11-7-1-a5-leave-011",
      "관둘까 고민입니다.",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
    probe(
      "p11-7-1-a5-leave-012",
      "회사를 놓고 쉬어도 될까요?",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
    probe(
      "p11-7-1-a5-leave-013",
      "다음 직장 없이 그만둬도 될까요?",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
    probe(
      "p11-7-1-a5-leave-014",
      "커리어 오프보딩을 해도 흐름상 무리가 없을까요",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
    probe(
      "p11-7-1-a5-leave-015",
      "이직인지 퇴사인지도 헷갈리지만, 제안 없이 그만두는 쪽이 맞을까요",
      "job-leaveJob",
      "job|termination|leaveJob",
    ),
  ];

/**
 * questionReaderVerification decision-ish surfaces (question text only).
 */
export const NOVEL_HOLDOUT_LEAKAGE_SURFACES_READER_VERIFICATION:
  readonly NovelHoldoutKnownLeakageSurface[] = [
    readerVerification(
      "p11-7-1-qrv-001",
      "지금 사업을 계속할까요?",
      "business-continue",
    ),
    readerVerification(
      "p11-7-1-qrv-002",
      "올해 사업 시작해도 될까요?",
      "business-start",
    ),
    readerVerification(
      "p11-7-1-qrv-003",
      "언제 사업을 시작해야 하나요?",
      "business-start",
    ),
    readerVerification(
      "p11-7-1-qrv-004",
      "어떻게 사업을 해야 하나요?",
      "business-start",
    ),
    readerVerification(
      "p11-7-1-qrv-005",
      "어떤 사업이 나에게 맞나요?",
      "business-start",
    ),
    readerVerification(
      "p11-7-1-qrv-006",
      "남자에게 맞는 사업은 무엇인가요?",
      "business-start",
    ),
    readerVerification(
      "p11-7-1-qrv-007",
      "사업운이 있나요?",
      "business-start",
    ),
    readerVerification(
      "p11-7-1-qrv-008",
      "직장운이 있나요?",
      "job-changeJob",
    ),
    readerVerification(
      "p11-7-1-qrv-009",
      "올해 사업은 어떻게 될까요?",
      "business-start",
    ),
    readerVerification(
      "p11-7-1-qrv-010",
      "올해 사업운은 어떨까요?",
      "business-start",
    ),
    readerVerification(
      "p11-7-1-qrv-011",
      "앞으로 사업은 어떻게 될까요?",
      "business-start",
    ),
    readerVerification(
      "p11-7-1-qrv-012",
      "올해 직장운은 어떻게 될까요?",
      "job-changeJob",
    ),
    readerVerification(
      "p11-7-1-qrv-013",
      "회사에서 어떤 역할을 맡아야 하나요?",
      "job-changeJob",
    ),
  ];

/**
 * P11-5 accepted20 — question field only (no actual/expected/failure).
 */
export const NOVEL_HOLDOUT_LEAKAGE_SURFACES_P11_5_ACCEPTED20_QUESTIONS:
  readonly NovelHoldoutKnownLeakageSurface[] = [
    p11Exposed(
      "p11-7-1-p115-q-001",
      "자영업을 새로 꾸려볼까 망설이는 중인데, 흐름상 가능성이 있을지 걱정돼요",
      "business-start",
    ),
    p11Exposed(
      "p11-7-1-p115-q-002",
      "무인 코인세탁 가맹을 처음 들여서 운영을 열어보는 쪽이 나을까요",
      "business-start",
    ),
    p11Exposed(
      "p11-7-1-p115-q-003",
      "사이드 허슬을 본업으로 스핀업해도 흐름상 무리가 없을까요",
      "business-start",
    ),
    p11Exposed(
      "p11-7-1-p115-q-004",
      "지금 장사 흐름을 끊지 않고 그대로 굴려가는 편이 맞을지 고민돼요",
      "business-continue",
    ),
    p11Exposed(
      "p11-7-1-p115-q-005",
      "가게를 당분간 더 굴리는 게 나을까요, 아니면 다른 선택을 볼까요",
      "business-continue",
    ),
    p11Exposed(
      "p11-7-1-p115-q-006",
      "적자가 나도 문을 닫지 않고 버틸지, 아니면 정리할지 갈리는데 버틸 쪽이 맞을까요",
      "business-continue",
    ),
    p11Exposed(
      "p11-7-1-p115-q-007",
      "이 장사를 슬슬 접고 손을 떼는 쪽이 맞을지 마음이 흔들려요",
      "business-stop",
    ),
    p11Exposed(
      "p11-7-1-p115-q-008",
      "프랜차이즈 가맹만 해지하고 운영에서 빠져도 괜찮을까요",
      "business-stop",
    ),
    p11Exposed(
      "p11-7-1-p115-q-009",
      "버틸지 정리할지 갈림길인데, 이번에는 정리하는 쪽이 맞을까요",
      "business-stop",
    ),
    p11Exposed(
      "p11-7-1-p115-q-010",
      "비즈니스를 와인드다운해도 흐름상 무리가 없을까요",
      "business-stop",
    ),
    p11Exposed(
      "p11-7-1-p115-q-011",
      "이미 돌아가는 가게를 인수해 들이는 쪽이 나을지 망설여져요",
      "business-buy",
    ),
    p11Exposed(
      "p11-7-1-p115-q-012",
      "권리금 주고 매장을 넘겨받는 게 나을까요",
      "business-buy",
    ),
    p11Exposed(
      "p11-7-1-p115-q-013",
      "푸드트럭 사업체를 통째로 사들여도 흐름상 괜찮을까요",
      "business-buy",
    ),
    p11Exposed(
      "p11-7-1-p115-q-014",
      "다른 조직으로 자리를 옮겨 보는 쪽이 나을지 자꾸 흔들려요",
      "job-changeJob",
    ),
    p11Exposed(
      "p11-7-1-p115-q-015",
      "같은 직군인데 스타트업으로 소속을 바꿔도 괜찮을까요",
      "job-changeJob",
    ),
    p11Exposed(
      "p11-7-1-p115-q-016",
      "자리를 옮기기 좋은 시점은 언제쯤일까요",
      "job-changeJob",
    ),
    p11Exposed(
      "p11-7-1-p115-q-017",
      "소속을 바꾸면서 부업도 같이 열어볼지 함께 판단하고 싶어요",
      "job-changeJob",
    ),
    p11Exposed(
      "p11-7-1-p115-q-018",
      "회사를 놓고 한동안 쉬는 쪽이 맞을지 마음이 무거워요",
      "job-leaveJob",
    ),
    p11Exposed(
      "p11-7-1-p115-q-019",
      "다음 자리 없이 일단 관둘까 하는 생각이 자꾸 들어요",
      "job-leaveJob",
    ),
    p11Exposed(
      "p11-7-1-p115-q-020",
      "커리어 오프보딩을 해도 흐름상 무리가 없을까요",
      "job-leaveJob",
    ),
  ];

export const NOVEL_HOLDOUT_KNOWN_LEAKAGE_SURFACES_CURATED:
  readonly NovelHoldoutKnownLeakageSurface[] = [
    ...NOVEL_HOLDOUT_LEAKAGE_SURFACES_A1_BUSINESS_CONTINUE,
    ...NOVEL_HOLDOUT_LEAKAGE_SURFACES_A2_BUSINESS_STOP,
    ...NOVEL_HOLDOUT_LEAKAGE_SURFACES_A3_BUSINESS_BUY,
    ...NOVEL_HOLDOUT_LEAKAGE_SURFACES_A4_JOB_CHANGE,
    ...NOVEL_HOLDOUT_LEAKAGE_SURFACES_A5_JOB_LEAVE,
    ...NOVEL_HOLDOUT_LEAKAGE_SURFACES_READER_VERIFICATION,
    ...NOVEL_HOLDOUT_LEAKAGE_SURFACES_P11_5_ACCEPTED20_QUESTIONS,
  ];

export function summarizeNovelHoldoutKnownLeakageSurfaces(
  surfaces: readonly NovelHoldoutKnownLeakageSurface[] =
    NOVEL_HOLDOUT_KNOWN_LEAKAGE_SURFACES_CURATED,
): {
  total: number;
  bySource: Readonly<Record<string, number>>;
  byFamily: Readonly<Record<string, number>>;
  a1Count: number;
  a2Count: number;
  a3Count: number;
  a4Count: number;
  a5Count: number;
} {
  const bySource: Record<string, number> = {};
  const byFamily: Record<string, number> = {};

  for (const surface of surfaces) {
    bySource[surface.source] = (bySource[surface.source] ?? 0) + 1;
    const family = surface.family ?? "other";
    byFamily[family] = (byFamily[family] ?? 0) + 1;
  }

  return {
    total: surfaces.length,
    bySource,
    byFamily,
    a1Count: NOVEL_HOLDOUT_LEAKAGE_SURFACES_A1_BUSINESS_CONTINUE.length,
    a2Count: NOVEL_HOLDOUT_LEAKAGE_SURFACES_A2_BUSINESS_STOP.length,
    a3Count: NOVEL_HOLDOUT_LEAKAGE_SURFACES_A3_BUSINESS_BUY.length,
    a4Count: NOVEL_HOLDOUT_LEAKAGE_SURFACES_A4_JOB_CHANGE.length,
    a5Count: NOVEL_HOLDOUT_LEAKAGE_SURFACES_A5_JOB_LEAVE.length,
  };
}

/**
 * Runtime guard: leakage corpus rows must not smuggle Gold/actual/expected.
 */
export function assertLeakageSurfaceHasNoGoldOrActualPayload(
  surface: NovelHoldoutKnownLeakageSurface,
): { ok: boolean; violations: readonly string[] } {
  const violations: string[] = [];
  const record = surface as Record<string, unknown>;

  for (const forbidden of [
    "actual",
    "expected",
    "expectedTopic",
    "expectedIntent",
    "expectedDecisionTarget",
    "gold",
    "goldRationale",
    "failureClassification",
    "primaryFailure",
    "readerActual",
  ] as const) {
    if (forbidden in record && record[forbidden] !== undefined) {
      violations.push(`${surface.id} must not carry ${forbidden}`);
    }
  }

  return { ok: violations.length === 0, violations };
}
