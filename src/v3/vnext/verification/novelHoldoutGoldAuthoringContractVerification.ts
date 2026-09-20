/**
 * Novel Holdout — Gold Authoring Contract verification (verification-only).
 *
 * Synthetic mini-fixtures only.
 * Does NOT run QuestionReader / import production questionReader.
 * Does NOT mutate or re-label FSV1 Gold 160.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  classifyNovelHoldoutSelectionSurfaceRole,
  doesDecisionAxisHintForceExpectedIntent,
  goldAuthoringRecordHasSecondarySpeechActField,
  isNovelHoldoutReasonPrimaryCarveOut,
  isSelectionPrimaryFromKeywordAlone,
  isSelectionPrimaryPositiveFixtureReservedEmpty,
  matchNovelHoldoutGoldPrimaryIntentExact,
  NOVEL_HOLDOUT_DECISION_AXIS_HINT_POLICY,
  NOVEL_HOLDOUT_GOLD_AUTHORING_CONTRACT_REVISION,
  NOVEL_HOLDOUT_GOLD_AUTHORING_RECORD_ALLOWED_KEYS,
  NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY,
  NOVEL_HOLDOUT_SECONDARY_SPEECH_ACT_TYPED_FIELD_POLICY,
  NOVEL_HOLDOUT_SELECTION_PRIMARY_POSITIVE_FIXTURES,
  resolveNovelHoldoutGoldExpectedIntent,
  type NovelHoldoutGoldAuthoringPrimaryIntent,
  type NovelHoldoutGoldAuthoringRecord,
  type NovelHoldoutReasonPrimaryChecklist,
} from "./novelHoldoutGoldAuthoringContract.js";

export type NovelHoldoutGoldAuthoringContractVerificationCase = {
  id: string;
  passed: boolean;
  details: readonly string[];
};

export type NovelHoldoutGoldAuthoringContractVerificationResult = {
  step: "GOLD-AUTHORING-CONTRACT";
  contractRevision: typeof NOVEL_HOLDOUT_GOLD_AUTHORING_CONTRACT_REVISION;
  passed: boolean;
  violations: readonly string[];
  checks: Readonly<Record<string, boolean>>;
  cases: readonly NovelHoldoutGoldAuthoringContractVerificationCase[];
  readerExecuted: false;
};

function contractSourcePath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "novelHoldoutGoldAuthoringContract.ts");
}

function caseResult(
  id: string,
  passed: boolean,
  details: readonly string[],
): NovelHoldoutGoldAuthoringContractVerificationCase {
  return { id, passed, details };
}

function allReasonChecklistTrue(): NovelHoldoutReasonPrimaryChecklist {
  return {
    r1CoreIsReasonGroundNotActionFitness: true,
    r2WhyReasonEvidenceIsPrimaryInformationNeed: true,
    r3ActionDecisionTargetDoesNotBlockReasonPrimary: true,
    r4NotDeterminedByKeywordAlone: true,
  };
}

function withReasonFlagOff(
  key: keyof NovelHoldoutReasonPrimaryChecklist,
): NovelHoldoutReasonPrimaryChecklist {
  return {
    ...allReasonChecklistTrue(),
    [key]: false,
  };
}

export function verifyNovelHoldoutGoldAuthoringContract():
  NovelHoldoutGoldAuthoringContractVerificationResult {
  const cases: NovelHoldoutGoldAuthoringContractVerificationCase[] = [];
  const violations: string[] = [];

  // 1. expectedIntent is single primary SoT
  {
    const policy = NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY;
    const passed =
      policy.sot === "single_primary_speech_act"
      && policy.exactMatchCompares === "primary_intent_only";
    if (!passed) {
      violations.push("expectedIntent is not single primary SoT");
    }
    cases.push(caseResult("expected-intent-single-primary-sot", passed, [
      `sot=${policy.sot}`,
      `exactMatchCompares=${policy.exactMatchCompares}`,
    ]));
  }

  // 2. dual-surface does not auto-rewrite primary intent
  {
    const authored: NovelHoldoutGoldAuthoringPrimaryIntent = "evaluation";
    const resolved = resolveNovelHoldoutGoldExpectedIntent({
      authoredPrimaryIntent: authored,
      dualSurfaces: ["evaluation", "reason"],
    });
    const passed =
      resolved === authored
      && NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY.dualSurfaceAutoRewrite
        === false;
    if (!passed) {
      violations.push("dual-surface auto-rewrote expectedIntent");
    }
    cases.push(caseResult("dual-surface-no-auto-rewrite", passed, [
      `authored=${authored}`,
      `resolved=${resolved}`,
      `dualSurfaceAutoRewrite=${
        NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY.dualSurfaceAutoRewrite
      }`,
    ]));
  }

  // 3. decisionAxisHint does not force expectedIntent
  {
    const authored: NovelHoldoutGoldAuthoringPrimaryIntent = "possibility";
    const resolved = resolveNovelHoldoutGoldExpectedIntent({
      authoredPrimaryIntent: authored,
      decisionAxisHint: "business|reason|start",
    });
    const forces = doesDecisionAxisHintForceExpectedIntent();
    const passed =
      resolved === authored
      && forces === false
      && NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY
        .decisionAxisHintForcesExpectedIntent === false;
    if (!passed) {
      violations.push("decisionAxisHint forced expectedIntent");
    }
    cases.push(caseResult("decision-axis-hint-no-force", passed, [
      `authored=${authored}`,
      `resolved=${resolved}`,
      `forces=${forces}`,
    ]));
  }

  // 4. Exact Match uses one primary intent
  {
    const same = matchNovelHoldoutGoldPrimaryIntentExact(
      "reason",
      "reason",
    );
    const different = matchNovelHoldoutGoldPrimaryIntentExact(
      "reason",
      "evaluation",
    );
    const passed = same === true && different === false;
    if (!passed) {
      violations.push("Exact Match primary-intent compare failed");
    }
    cases.push(caseResult("exact-match-primary-only", passed, [
      `same=${same}`,
      `different=${different}`,
      `policy=${NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY.exactMatchCompares}`,
    ]));
  }

  // 5. R1–R4 all true → reason-primary true
  {
    const checklist = allReasonChecklistTrue();
    const passed = isNovelHoldoutReasonPrimaryCarveOut(checklist) === true;
    if (!passed) {
      violations.push("R1–R4 all-true did not yield reason-primary");
    }
    cases.push(caseResult("reason-primary-all-r1-r4-true", passed, [
      `result=${isNovelHoldoutReasonPrimaryCarveOut(checklist)}`,
    ]));
  }

  // 6. Any missing R1–R4 → reason-primary false
  {
    const keys: (keyof NovelHoldoutReasonPrimaryChecklist)[] = [
      "r1CoreIsReasonGroundNotActionFitness",
      "r2WhyReasonEvidenceIsPrimaryInformationNeed",
      "r3ActionDecisionTargetDoesNotBlockReasonPrimary",
      "r4NotDeterminedByKeywordAlone",
    ];
    const outcomes = keys.map((key) => ({
      key,
      result: isNovelHoldoutReasonPrimaryCarveOut(withReasonFlagOff(key)),
    }));
    const passed = outcomes.every((row) => row.result === false);
    if (!passed) {
      violations.push("reason-primary true despite missing R flag");
    }
    cases.push(caseResult("reason-primary-any-missing-false", passed, [
      ...outcomes.map((row) => `${row.key}=${row.result}`),
    ]));
  }

  // 7. "가능한 선택인지" → possibility
  {
    const role = classifyNovelHoldoutSelectionSurfaceRole(
      "지금 창업이 가능한 선택인지 궁금합니다",
    );
    const passed = role === "possibility";
    if (!passed) {
      violations.push(`가능한 선택인지 role=${role}`);
    }
    cases.push(caseResult("selection-surface-possible-choice", passed, [
      `role=${role}`,
    ]));
  }

  // 8. "가능한지 판단" → possibility
  {
    const role = classifyNovelHoldoutSelectionSurfaceRole(
      "지금 이직이 가능한지 판단하고 싶습니다",
    );
    const passed = role === "possibility";
    if (!passed) {
      violations.push(`가능한지 판단 role=${role}`);
    }
    cases.push(caseResult("selection-surface-possible-judge", passed, [
      `role=${role}`,
    ]));
  }

  // 9. "어느 쪽 문제로" → framing
  {
    const role = classifyNovelHoldoutSelectionSurfaceRole(
      "이게 어느 쪽 문제로 보아야 할까요",
    );
    const passed = role === "framing";
    if (!passed) {
      violations.push(`어느 쪽 문제로 role=${role}`);
    }
    cases.push(caseResult("selection-surface-which-side-problem", passed, [
      `role=${role}`,
    ]));
  }

  // 10. "어느 쪽으로 잡아야" → framing
  {
    const role = classifyNovelHoldoutSelectionSurfaceRole(
      "방향을 어느 쪽으로 잡아야 할까요",
    );
    const passed = role === "framing";
    if (!passed) {
      violations.push(`어느 쪽으로 잡아야 role=${role}`);
    }
    cases.push(caseResult("selection-surface-which-way-hold", passed, [
      `role=${role}`,
    ]));
  }

  // 11. selection keyword alone does not become selection-primary
  {
    const authored: NovelHoldoutGoldAuthoringPrimaryIntent = "evaluation";
    const resolved = resolveNovelHoldoutGoldExpectedIntent({
      authoredPrimaryIntent: authored,
      selectionKeywordPresent: true,
      readerKeywordHint: "선택",
    });
    const promoted = isSelectionPrimaryFromKeywordAlone({
      authoredPrimaryIntent: authored,
      selectionKeywordPresent: true,
    });
    const surfaceRole = classifyNovelHoldoutSelectionSurfaceRole(
      "선택이 고민입니다",
    );
    const passed =
      resolved === "evaluation"
      && promoted === false
      && surfaceRole === "keyword_only_non_primary";
    if (!passed) {
      violations.push("selection keyword alone promoted to selection-primary");
    }
    cases.push(caseResult("selection-keyword-alone-no-primary", passed, [
      `resolved=${resolved}`,
      `promoted=${promoted}`,
      `surfaceRole=${surfaceRole}`,
    ]));
  }

  // 12. selection-primary positive fixtures empty/reserved
  {
    const passed =
      isSelectionPrimaryPositiveFixtureReservedEmpty()
      && NOVEL_HOLDOUT_SELECTION_PRIMARY_POSITIVE_FIXTURES.length === 0;
    if (!passed) {
      violations.push("selection-primary positive fixtures not empty/reserved");
    }
    cases.push(caseResult("selection-primary-positive-reserved-empty", passed, [
      `count=${NOVEL_HOLDOUT_SELECTION_PRIMARY_POSITIVE_FIXTURES.length}`,
    ]));
  }

  // 13. secondarySpeechAct typed field absent from contract
  {
    const source = readFileSync(contractSourcePath(), "utf8");
    const sample: NovelHoldoutGoldAuthoringRecord = {
      expectedIntent: "possibility",
      decisionAxisHint: "business|possibility|start",
    };
    const hasOnSample = goldAuthoringRecordHasSecondarySpeechActField(
      sample as unknown as Record<string, unknown>,
    );
    const allowedHasSecondary =
      (NOVEL_HOLDOUT_GOLD_AUTHORING_RECORD_ALLOWED_KEYS as readonly string[])
        .includes("secondarySpeechAct");
    const typedFieldDeclared =
      /secondarySpeechAct\s*[?:]/.test(source)
      || /secondarySpeechAct\s*:/.test(source);
    const policyOk =
      NOVEL_HOLDOUT_SECONDARY_SPEECH_ACT_TYPED_FIELD_POLICY === "PROHIBITED";
    const passed =
      hasOnSample === false
      && allowedHasSecondary === false
      && typedFieldDeclared === false
      && policyOk;
    if (!passed) {
      violations.push("secondarySpeechAct typed field present in contract");
    }
    cases.push(caseResult("secondary-speech-act-field-absent", passed, [
      `hasOnSample=${hasOnSample}`,
      `allowedHasSecondary=${allowedHasSecondary}`,
      `typedFieldDeclared=${typedFieldDeclared}`,
      `policy=${NOVEL_HOLDOUT_SECONDARY_SPEECH_ACT_TYPED_FIELD_POLICY}`,
    ]));
  }

  // 14. decisionAxisHint policy is SOFT_GUIDANCE
  {
    const passed =
      NOVEL_HOLDOUT_DECISION_AXIS_HINT_POLICY === "SOFT_GUIDANCE";
    if (!passed) {
      violations.push(
        `decisionAxisHint policy=${NOVEL_HOLDOUT_DECISION_AXIS_HINT_POLICY}`,
      );
    }
    cases.push(caseResult("decision-axis-hint-soft-guidance", passed, [
      `policy=${NOVEL_HOLDOUT_DECISION_AXIS_HINT_POLICY}`,
    ]));
  }

  // Extra lock: reader keyword/priority are not Gold authoring oracles
  {
    const passed =
      NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY.readerKeywordIsOracle === false
      && NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY.readerPriorityIsOracle
        === false;
    if (!passed) {
      violations.push("reader keyword/priority marked as Gold oracle");
    }
    cases.push(caseResult("reader-not-gold-oracle", passed, [
      `readerKeywordIsOracle=${
        NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY.readerKeywordIsOracle
      }`,
      `readerPriorityIsOracle=${
        NOVEL_HOLDOUT_GOLD_PRIMARY_INTENT_POLICY.readerPriorityIsOracle
      }`,
    ]));
  }

  const checks: Record<string, boolean> = {};
  for (const item of cases) {
    checks[item.id] = item.passed;
  }

  const passed =
    cases.every((item) => item.passed) && violations.length === 0;

  return {
    step: "GOLD-AUTHORING-CONTRACT",
    contractRevision: NOVEL_HOLDOUT_GOLD_AUTHORING_CONTRACT_REVISION,
    passed,
    violations,
    checks,
    cases,
    readerExecuted: false,
  };
}

export function serializeNovelHoldoutGoldAuthoringContractVerificationResult(
  result: NovelHoldoutGoldAuthoringContractVerificationResult,
): string {
  return JSON.stringify(
    {
      step: result.step,
      contractRevision: result.contractRevision,
      passed: result.passed,
      violations: result.violations,
      checks: result.checks,
      cases: result.cases,
      readerExecuted: result.readerExecuted,
    },
    null,
    2,
  );
}
