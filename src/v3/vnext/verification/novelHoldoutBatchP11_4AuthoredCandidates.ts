/**
 * P11-4 Blind Gold authored candidates (verification-only).
 *
 * Authoring order used for this batch:
 *   SEMANTIC SPEC → QUESTION → HUMAN GOLD → GOLD_SEALED
 *
 * Constraints honored at author time:
 * - Reader actual was NOT consulted
 * - known-pool question lists were NOT used as generation input
 * - Gold is independent of Reader output
 * - Frozen Set v1 is NOT sealed here
 *
 * Pipeline stages after this file:
 *   Novelty Gate → Leakage Gate → GATE_ACCEPTED/REJECTED
 *   → Reader validation (accepted only) → READER_VALIDATED
 */

import type {
  NovelHoldoutSeedSlotSpec,
} from "./novelHoldoutAllocationSchema.js";
import type {
  NovelHoldoutBlindGoldSnapshot,
} from "./novelHoldoutBlindGoldProtocol.js";
import type {
  NovelHoldoutRow,
} from "./novelHoldoutContract.js";

/**
 * Unsealed revision marker. Final Frozen Set v1 seal is deferred to a later step.
 */
export const P11_4_BATCH1_FROZEN_REVISION = "p11-4-batch1-unsealed";

export type NovelHoldoutBatchP11_4AuthoringStage =
  | "GOLD_SEALED";

export type NovelHoldoutBatchP11_4AuthoredCandidate = {
  /**
   * Always GOLD_SEALED in this file — gates/reader run later.
   */
  authoringStage: NovelHoldoutBatchP11_4AuthoringStage;
  /**
   * When true, candidate is an intentional weak/leakage reject probe
   * to verify Gate reject behavior. Still authored Blind; never Gold-from-Reader.
   */
  intentionalGateRejectProbe: boolean;
  slot: NovelHoldoutSeedSlotSpec;
  question: string;
  gold: NovelHoldoutBlindGoldSnapshot;
  /**
   * Row-shaped projection for reporting / freeze helpers (unsealed revision).
   */
  asRowShape: NovelHoldoutRow;
};

function rowFrom(
  slot: NovelHoldoutSeedSlotSpec,
  question: string,
  gold: NovelHoldoutBlindGoldSnapshot,
): NovelHoldoutRow {
  return {
    id: slot.slotId,
    family: slot.family,
    taxonomyPrimary: slot.taxonomyPrimary,
    taxonomySecondary: slot.taxonomySecondary,
    noveltyTier: slot.noveltyTier,
    question,
    expectedTopic: gold.expectedTopic,
    expectedIntent: gold.expectedIntent,
    expectedDecisionTarget: gold.expectedDecisionTarget,
    expectedTimingType: gold.expectedTimingType,
    expectedAnalysisMode: gold.expectedAnalysisMode,
    matchPolicy: gold.matchPolicy,
    goldConfidence: gold.goldConfidence,
    goldRationale: gold.goldRationale,
    ambiguityLabel: gold.ambiguityLabel,
    compositeNote: gold.compositeNote,
    boundaryAgainst: gold.boundaryAgainst ?? slot.boundaryAgainst,
    frozenRevision: P11_4_BATCH1_FROZEN_REVISION,
  };
}

function candidate(
  input: {
    intentionalGateRejectProbe?: boolean;
    slot: NovelHoldoutSeedSlotSpec;
    question: string;
    gold: NovelHoldoutBlindGoldSnapshot;
  },
): NovelHoldoutBatchP11_4AuthoredCandidate {
  return {
    authoringStage: "GOLD_SEALED",
    intentionalGateRejectProbe: input.intentionalGateRejectProbe ?? false,
    slot: input.slot,
    question: input.question,
    gold: input.gold,
    asRowShape: rowFrom(input.slot, input.question, input.gold),
  };
}

/**
 * First Blind Gold batch (~24 authored; includes a few intentional reject probes).
 * Core families only: business start/continue/stop/buy + job changeJob/leaveJob.
 */
export const NOVEL_HOLDOUT_BATCH_P11_4_AUTHORED_CANDIDATES:
  readonly NovelHoldoutBatchP11_4AuthoredCandidate[] = [
    // ── business-start ──────────────────────────────────────────────
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-start-A-001",
        family: "business-start",
        taxonomyPrimary: "A_SAME_MEANING_PARAPHRASE",
        noveltyTier: ["lexical", "syntactic"],
        decisionAxisHint: "business|possibility|start",
        authoringBrief:
          "Same meaning as business-start possibility, but use worry-frame "
          + "and non-canonical verbs (avoid 창업/개업/오픈 template copy).",
      },
      question:
        "자영업을 새로 꾸려볼까 망설이는 중인데, 흐름상 가능성이 있을지 걱정돼요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "possibility",
        expectedDecisionTarget: "start",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "high",
        goldRationale:
          "자영업을 새로 꾸린다 = 사업 시작 가능성 판단. 걱정 프레임이지만 핵심은 start.",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-start-B-001",
        family: "business-start",
        taxonomyPrimary: "B_TARGET_VARIATION",
        noveltyTier: ["lexical", "combinational"],
        decisionAxisHint: "business|possibility|start",
        authoringBrief:
          "Target variation: specific non-canonical shop type, start axis retained.",
      },
      question:
        "무인 코인세탁 가맹을 처음 들여서 운영을 열어보는 쪽이 나을까요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "possibility",
        expectedDecisionTarget: "start",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "high",
        goldRationale:
          "가맹을 처음 들여 운영을 연다 = 신규 사업 시작. 대상만 구체화된 B.",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-start-C-001",
        family: "business-start",
        taxonomyPrimary: "C_QUESTION_FORM_VARIATION",
        noveltyTier: ["syntactic"],
        decisionAxisHint: "business|possibility|start",
        authoringBrief:
          "Form-only: timing_when surface while semantic core remains start.",
      },
      question: "자영업을 꾸리기 시작하기 좋은 시점은 언제쯤일까요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "timing",
        expectedDecisionTarget: "start",
        expectedTimingType: "bestTiming",
        expectedAnalysisMode: "decision",
        matchPolicy: "timing_sensitive",
        goldConfidence: "high",
        goldRationale:
          "C form variation: when-question. Decision target remains start; intent is timing.",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-start-E-001",
        family: "business-start",
        taxonomyPrimary: "E_UNKNOWN_VOCABULARY",
        noveltyTier: ["lexical"],
        decisionAxisHint: "business|possibility|start",
        authoringBrief:
          "Unknown/loanword vocabulary for launching a side hustle as a business.",
      },
      question:
        "사이드 허슬을 본업으로 스핀업해도 흐름상 무리가 없을까요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "possibility",
        expectedDecisionTarget: "start",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "medium",
        goldRationale:
          "스핀업/사이드 허슬 = 사업을 본격 시작. 어휘는 낯설지만 Gold는 start.",
      },
    }),

    // ── business-continue ───────────────────────────────────────────
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-cont-A-001",
        family: "business-continue",
        taxonomyPrimary: "A_SAME_MEANING_PARAPHRASE",
        noveltyTier: ["lexical", "syntactic"],
        decisionAxisHint: "business|continuation|continue",
        authoringBrief:
          "Paraphrase of keep-operating without bare 계속/유지 template.",
      },
      question:
        "지금 장사 흐름을 끊지 않고 그대로 굴려가는 편이 맞을지 고민돼요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "continuation",
        expectedDecisionTarget: "continue",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "high",
        goldRationale:
          "끊지 않고 굴려간다 = 사업 유지/계속. continuation+continue.",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-cont-C-001",
        family: "business-continue",
        taxonomyPrimary: "C_QUESTION_FORM_VARIATION",
        noveltyTier: ["syntactic"],
        decisionAxisHint: "business|continuation|continue",
        authoringBrief: "Recommendation-better form for continue axis.",
      },
      question: "가게를 당분간 더 굴리는 게 나을까요, 아니면 다른 선택을 볼까요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "continuation",
        expectedDecisionTarget: "continue",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "medium",
        goldRationale:
          "더 굴리는 게 나을까 = continue 추천형. 대비 문구가 있어도 주축은 continue.",
        boundaryAgainst: "business|termination|stop",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-cont-D-001",
        family: "business-continue",
        taxonomyPrimary: "D_BOUNDARY_COLLISION",
        noveltyTier: ["combinational"],
        decisionAxisHint: "business|continuation|continue",
        authoringBrief:
          "Boundary vs stop: red ink but human Gold chooses hold/continue.",
        boundaryAgainst: "business|termination|stop",
      },
      question:
        "적자가 나도 문을 닫지 않고 버틸지, 아니면 정리할지 갈리는데 버틸 쪽이 맞을까요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "continuation",
        expectedDecisionTarget: "continue",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "medium",
        goldRationale:
          "닫지 않고 버틸 쪽이 맞나 = continue. stop과 충돌 경계이므로 D.",
        boundaryAgainst: "business|termination|stop",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-cont-F-001",
        family: "business-continue",
        taxonomyPrimary: "F_COMPOSITE",
        noveltyTier: ["combinational"],
        decisionAxisHint: "business|continuation|continue",
        authoringBrief:
          "Composite: keep store + expand side labor; primary = continue.",
      },
      question:
        "가게는 유지하면서 알바 인력도 늘려서 버틸 수 있을지 함께 보고 싶어요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "continuation",
        expectedDecisionTarget: "continue",
        expectedAnalysisMode: "decision",
        matchPolicy: "composite",
        goldConfidence: "medium",
        goldRationale:
          "주축은 가게 유지(continue). 인력 확장은 부차 조건.",
        compositeNote: "primary=continue store; secondary=staff expansion support",
      },
    }),

    // ── business-stop ───────────────────────────────────────────────
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-stop-A-001",
        family: "business-stop",
        taxonomyPrimary: "A_SAME_MEANING_PARAPHRASE",
        noveltyTier: ["lexical", "syntactic"],
        decisionAxisHint: "business|termination|stop",
        authoringBrief:
          "Closure paraphrase avoiding bare 폐업/그만 template.",
      },
      question:
        "이 장사를 슬슬 접고 손을 떼는 쪽이 맞을지 마음이 흔들려요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "termination",
        expectedDecisionTarget: "stop",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "high",
        goldRationale:
          "접고 손을 뗀다 = 사업 종료. termination+stop.",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-stop-B-001",
        family: "business-stop",
        taxonomyPrimary: "B_TARGET_VARIATION",
        noveltyTier: ["lexical", "combinational"],
        decisionAxisHint: "business|termination|stop",
        authoringBrief: "Target: franchise exit rather than generic store close.",
      },
      question:
        "프랜차이즈 가맹만 해지하고 운영에서 빠져도 괜찮을까요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "termination",
        expectedDecisionTarget: "stop",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "medium",
        goldRationale:
          "가맹 해지·운영 이탈 = 사업 중단/종료 축. 대상만 가맹으로 한정.",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-stop-D-001",
        family: "business-stop",
        taxonomyPrimary: "D_BOUNDARY_COLLISION",
        noveltyTier: ["combinational"],
        decisionAxisHint: "business|termination|stop",
        authoringBrief: "Boundary vs continue: choose wind-down.",
        boundaryAgainst: "business|continuation|continue",
      },
      question:
        "버틸지 정리할지 갈림길인데, 이번에는 정리하는 쪽이 맞을까요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "termination",
        expectedDecisionTarget: "stop",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "medium",
        goldRationale:
          "정리하는 쪽이 맞나 = stop. continue와 충돌 경계.",
        boundaryAgainst: "business|continuation|continue",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-stop-E-001",
        family: "business-stop",
        taxonomyPrimary: "E_UNKNOWN_VOCABULARY",
        noveltyTier: ["lexical"],
        decisionAxisHint: "business|termination|stop",
        authoringBrief: "Loanword wind-down vocabulary for stop.",
      },
      question:
        "비즈니스를 와인드다운해도 흐름상 무리가 없을까요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "termination",
        expectedDecisionTarget: "stop",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "medium",
        goldRationale:
          "와인드다운 = 사업 축소/종료. 낯선 어휘(E)지만 Gold는 stop.",
      },
    }),

    // ── business-buy ────────────────────────────────────────────────
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-buy-A-001",
        family: "business-buy",
        taxonomyPrimary: "A_SAME_MEANING_PARAPHRASE",
        noveltyTier: ["lexical", "syntactic"],
        decisionAxisHint: "business|possibility|buy",
        authoringBrief: "Acquire existing shop paraphrase (buy, not start-from-scratch).",
      },
      question:
        "이미 돌아가는 가게를 인수해 들이는 쪽이 나을지 망설여져요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "possibility",
        expectedDecisionTarget: "buy",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "high",
        goldRationale:
          "기존 가게 인수 = buy. 신규 창업(start)과 구분.",
        boundaryAgainst: "business|possibility|start",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-buy-C-001",
        family: "business-buy",
        taxonomyPrimary: "C_QUESTION_FORM_VARIATION",
        noveltyTier: ["syntactic"],
        decisionAxisHint: "business|possibility|buy",
        authoringBrief: "Recommendation form for buying a transfer shop.",
      },
      question: "권리금 주고 매장을 넘겨받는 게 나을까요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "possibility",
        expectedDecisionTarget: "buy",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "high",
        goldRationale:
          "권리금 주고 넘겨받는다 = 사업체/매장 buy.",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-biz-buy-B-001",
        family: "business-buy",
        taxonomyPrimary: "B_TARGET_VARIATION",
        noveltyTier: ["lexical"],
        decisionAxisHint: "business|possibility|buy",
        authoringBrief: "Target: food-truck business body purchase.",
      },
      question:
        "푸드트럭 사업체를 통째로 사들여도 흐름상 괜찮을까요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "possibility",
        expectedDecisionTarget: "buy",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "high",
        goldRationale:
          "사업체를 사들인다 = buy. 대상만 푸드트럭으로 한정.",
      },
    }),

    // ── job-changeJob ───────────────────────────────────────────────
    candidate({
      slot: {
        slotId: "p11-4-b1-job-change-A-001",
        family: "job-changeJob",
        taxonomyPrimary: "A_SAME_MEANING_PARAPHRASE",
        noveltyTier: ["lexical", "syntactic"],
        decisionAxisHint: "job|possibility|changeJob",
        authoringBrief:
          "Paraphrase move-to-another-employer without bare 이직 template alone.",
      },
      question:
        "다른 조직으로 자리를 옮겨 보는 쪽이 나을지 자꾸 흔들려요",
      gold: {
        expectedTopic: "job",
        expectedIntent: "possibility",
        expectedDecisionTarget: "changeJob",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "high",
        goldRationale:
          "다른 조직으로 자리 이동 = changeJob. leaveJob(퇴사만)과 구분.",
        boundaryAgainst: "job|termination|leaveJob",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-job-change-B-001",
        family: "job-changeJob",
        taxonomyPrimary: "B_TARGET_VARIATION",
        noveltyTier: ["lexical", "combinational"],
        decisionAxisHint: "job|possibility|changeJob",
        authoringBrief: "Target: same role family but startup employer switch.",
      },
      question:
        "같은 직군인데 스타트업으로 소속을 바꿔도 괜찮을까요",
      gold: {
        expectedTopic: "job",
        expectedIntent: "possibility",
        expectedDecisionTarget: "changeJob",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "high",
        goldRationale:
          "소속을 바꾼다 = changeJob. 대상만 스타트업으로 한정.",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-job-change-C-001",
        family: "job-changeJob",
        taxonomyPrimary: "C_QUESTION_FORM_VARIATION",
        noveltyTier: ["syntactic"],
        decisionAxisHint: "job|possibility|changeJob",
        authoringBrief: "Timing form for job switch.",
      },
      question: "자리를 옮기기 좋은 시점은 언제쯤일까요",
      gold: {
        expectedTopic: "job",
        expectedIntent: "timing",
        expectedDecisionTarget: "changeJob",
        expectedTimingType: "bestTiming",
        expectedAnalysisMode: "decision",
        matchPolicy: "timing_sensitive",
        goldConfidence: "medium",
        goldRationale:
          "when-form for switching seats. Intent timing; DT changeJob.",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-job-change-D-001",
        family: "job-changeJob",
        taxonomyPrimary: "D_BOUNDARY_COLLISION",
        noveltyTier: ["combinational"],
        decisionAxisHint: "job|possibility|changeJob",
        authoringBrief:
          "Boundary vs leaveJob: next role exists → changeJob preferred.",
        boundaryAgainst: "job|termination|leaveJob",
      },
      question:
        "다음 자리가 정해진 상태에서 지금 조직을 떠나는 게 이직으로 맞을까요",
      gold: {
        expectedTopic: "job",
        expectedIntent: "possibility",
        expectedDecisionTarget: "changeJob",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "high",
        goldRationale:
          "다음 자리 확정 + 조직 이탈 = changeJob. 순수 퇴사(leaveJob)와 경계.",
        boundaryAgainst: "job|termination|leaveJob",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-job-change-F-001",
        family: "job-changeJob",
        taxonomyPrimary: "F_COMPOSITE",
        noveltyTier: ["combinational"],
        decisionAxisHint: "job|possibility|changeJob",
        authoringBrief:
          "Composite: switch employer + start side work; primary = changeJob.",
      },
      question:
        "소속을 바꾸면서 부업도 같이 열어볼지 함께 판단하고 싶어요",
      gold: {
        expectedTopic: "job",
        expectedIntent: "possibility",
        expectedDecisionTarget: "changeJob",
        expectedAnalysisMode: "decision",
        matchPolicy: "composite",
        goldConfidence: "medium",
        goldRationale:
          "주축은 소속 변경(changeJob). 부업 개시는 부차.",
        compositeNote: "primary=changeJob; secondary=side-business start",
      },
    }),

    // ── job-leaveJob ────────────────────────────────────────────────
    candidate({
      slot: {
        slotId: "p11-4-b1-job-leave-A-001",
        family: "job-leaveJob",
        taxonomyPrimary: "A_SAME_MEANING_PARAPHRASE",
        noveltyTier: ["lexical", "syntactic"],
        decisionAxisHint: "job|termination|leaveJob",
        authoringBrief: "Leave employer paraphrase without bare 퇴사-only ending swap.",
      },
      question:
        "회사를 놓고 한동안 쉬는 쪽이 맞을지 마음이 무거워요",
      gold: {
        expectedTopic: "job",
        expectedIntent: "termination",
        expectedDecisionTarget: "leaveJob",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "high",
        goldRationale:
          "회사를 놓고 쉰다 = leaveJob. 다음 직장 전제가 없음.",
        boundaryAgainst: "job|possibility|changeJob",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-job-leave-C-001",
        family: "job-leaveJob",
        taxonomyPrimary: "C_QUESTION_FORM_VARIATION",
        noveltyTier: ["syntactic"],
        decisionAxisHint: "job|termination|leaveJob",
        authoringBrief: "Hesitation statement form for leaveJob.",
      },
      question: "다음 자리 없이 일단 관둘까 하는 생각이 자꾸 들어요",
      gold: {
        expectedTopic: "job",
        expectedIntent: "termination",
        expectedDecisionTarget: "leaveJob",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "high",
        goldRationale:
          "다음 자리 없이 관둔다 = leaveJob. C는 망설임 진술형.",
        boundaryAgainst: "job|possibility|changeJob",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-job-leave-D-001",
        family: "job-leaveJob",
        taxonomyPrimary: "D_BOUNDARY_COLLISION",
        noveltyTier: ["combinational"],
        decisionAxisHint: "job|termination|leaveJob",
        authoringBrief: "Boundary vs changeJob: no next offer → leaveJob.",
        boundaryAgainst: "job|possibility|changeJob",
      },
      question:
        "이직인지 퇴사인지도 헷갈리지만, 제안 없이 그만두는 쪽이 맞을까요",
      gold: {
        expectedTopic: "job",
        expectedIntent: "termination",
        expectedDecisionTarget: "leaveJob",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "medium",
        goldRationale:
          "제안 없이 그만둔다 = leaveJob. changeJob 경계 명시.",
        boundaryAgainst: "job|possibility|changeJob",
      },
    }),
    candidate({
      slot: {
        slotId: "p11-4-b1-job-leave-E-001",
        family: "job-leaveJob",
        taxonomyPrimary: "E_UNKNOWN_VOCABULARY",
        noveltyTier: ["lexical"],
        decisionAxisHint: "job|termination|leaveJob",
        authoringBrief: "Loanword offboarding vocabulary for leaveJob.",
      },
      question:
        "커리어 오프보딩을 해도 흐름상 무리가 없을까요",
      gold: {
        expectedTopic: "job",
        expectedIntent: "termination",
        expectedDecisionTarget: "leaveJob",
        expectedAnalysisMode: "decision",
        matchPolicy: "semantic_core",
        goldConfidence: "medium",
        goldRationale:
          "오프보딩 = 직장 이탈/종료. 어휘 E, Gold는 leaveJob.",
      },
    }),

    // ── optional natural G (not forced for quota) ───────────────────
    candidate({
      slot: {
        slotId: "p11-4-b1-job-g-amb-001",
        family: "job-changeJob",
        taxonomyPrimary: "G_AMBIGUOUS_DESIGN_LIMIT",
        noveltyTier: ["combinational"],
        decisionAxisHint: "job|possibility|changeJob",
        authoringBrief:
          "Naturally ambiguous: speaker cannot tell changeJob vs leaveJob.",
      },
      question:
        "회사를 떠나고 싶은데 이직인지 퇴사인지도 스스로 잘 모르겠어요",
      gold: {
        expectedTopic: "job",
        expectedIntent: "possibility",
        expectedDecisionTarget: "changeJob",
        expectedAnalysisMode: "decision",
        matchPolicy: "ambiguous",
        goldConfidence: "low",
        goldRationale:
          "인간이 축을 확정하기 어려운 자연 애매 사례. Exact Match 분모 제외 후보.",
        ambiguityLabel: "AMBIGUOUS",
        boundaryAgainst: "job|termination|leaveJob",
      },
    }),

    // ── intentional Gate reject probes (Blind authored; expect reject) ─
    candidate({
      intentionalGateRejectProbe: true,
      slot: {
        slotId: "p11-4-b1-probe-weak-ending-001",
        family: "business-start",
        taxonomyPrimary: "A_SAME_MEANING_PARAPHRASE",
        noveltyTier: ["lexical"],
        decisionAxisHint: "business|possibility|start",
        authoringBrief:
          "INTENTIONAL WEAK PROBE: ending-only style near-canonical surface.",
      },
      question: "창업해도 될까요",
      gold: {
        expectedTopic: "business",
        expectedIntent: "possibility",
        expectedDecisionTarget: "start",
        matchPolicy: "semantic_core",
        goldConfidence: "high",
        goldRationale:
          "의도적 weak probe. Gate reject 검증용 — accepted candidate로 넣지 않음.",
      },
    }),
    candidate({
      intentionalGateRejectProbe: true,
      slot: {
        slotId: "p11-4-b1-probe-weak-noun-001",
        family: "job-changeJob",
        taxonomyPrimary: "A_SAME_MEANING_PARAPHRASE",
        noveltyTier: ["lexical"],
        decisionAxisHint: "job|possibility|changeJob",
        authoringBrief:
          "INTENTIONAL WEAK PROBE: near-canonical 이직 surface.",
      },
      question: "이직해도 될까요",
      gold: {
        expectedTopic: "job",
        expectedIntent: "possibility",
        expectedDecisionTarget: "changeJob",
        matchPolicy: "semantic_core",
        goldConfidence: "high",
        goldRationale:
          "의도적 weak/leakage probe. Gate가 reject하는지 확인.",
      },
    }),
  ];

export function summarizeP11_4AuthoredBatch(
  candidates: readonly NovelHoldoutBatchP11_4AuthoredCandidate[] =
    NOVEL_HOLDOUT_BATCH_P11_4_AUTHORED_CANDIDATES,
): {
  authoredCount: number;
  intentionalProbeCount: number;
  familyDistribution: Readonly<Record<string, number>>;
  taxonomyDistribution: Readonly<Record<string, number>>;
  noveltyTierDistribution: Readonly<Record<string, number>>;
} {
  const familyDistribution: Record<string, number> = {};
  const taxonomyDistribution: Record<string, number> = {};
  const noveltyTierDistribution: Record<string, number> = {};
  let intentionalProbeCount = 0;

  for (const item of candidates) {
    familyDistribution[item.slot.family] =
      (familyDistribution[item.slot.family] ?? 0) + 1;
    taxonomyDistribution[item.slot.taxonomyPrimary] =
      (taxonomyDistribution[item.slot.taxonomyPrimary] ?? 0) + 1;
    for (const tier of item.slot.noveltyTier) {
      noveltyTierDistribution[tier] =
        (noveltyTierDistribution[tier] ?? 0) + 1;
    }
    if (item.intentionalGateRejectProbe) {
      intentionalProbeCount += 1;
    }
  }

  return {
    authoredCount: candidates.length,
    intentionalProbeCount,
    familyDistribution,
    taxonomyDistribution,
    noveltyTierDistribution,
  };
}
