/**
 * P10-4/P10-7 Strong Anchor equivalence verification.
 *
 * P10-3 Strong Anchor 14개:
 * - canonical expected vs Reader actual / paraphrase 수렴 (inherit)
 *
 * P10-5/P10-6 variation policy (전체 37 cell 관측):
 * - target: canonical actual primaryAxis 동일 → SAME_MEANING inherit 후보
 * - timing: timingType/analysisMode-only + primary semantic axes
 *   (topic|intent|decisionTarget) 유지 → timing-only inherit 후보
 *   (axes 중 하나라도 달라지면 SEPARATE_CONTRACT)
 * - composite: canonical 의미 비상속, expectedOverride 비자동 gold, actionRelations 관측만
 *
 * - Production Reader / Decision Engine / Adapter / fixture expected 불변
 * - DecisionResult verdict를 oracle로 쓰지 않는다
 * - expectedOverride는 variation-specific contract 후보일 뿐 자동 gold가 아니다
 * - READER_GAP/FIXTURE_GAP 자동 단정 금지; mismatch는 숨기지 않는다
 */

import {
  buildDecisionEngineRegressionInput,
} from "../../consulting/decision/regression/decisionEngineRegressionFixture.js";
import {
  QUESTION_MEANING_CELLS,
} from "../../consulting/questionMeaningRegressionFixtures.js";
import type {
  QuestionMeaningCell,
  QuestionMeaningExpectation,
  QuestionMeaningVariation,
} from "../../consulting/questionMeaningRegressionFixtures.js";
import {
  readQuestion,
} from "../../consulting/question/questionReader.js";
import type {
  ActionRelationKind,
  DecisionTarget,
  QuestionActionRelation,
  QuestionAnalysisMode,
  QuestionIntent,
  QuestionReaderResult,
  QuestionTimingType,
  QuestionTopic,
} from "../../consulting/question/questionReader.js";
import {
  isPrimaryAxisBoundaryVariation,
} from "./readerEquivalenceVerification.js";

/**
 * P10-3 READ-ONLY 결과의 Strong Anchor cell id.
 * production 상수 복제가 아니라 verification-scope allowlist다.
 */
export const P10_3_STRONG_ANCHOR_CELL_IDS = [
  "business-continuation",
  "business-partner-compatibility",
  "business-fit-recommendation",
  "money-invest-risk",
  "realEstate-sell-termination",
  "realEstate-continue-hold",
  "realEstate-asset-selection",
  "relationship-separate-termination",
  "marriage-marry-possibility",
  "health-checkup-possibility",
  "legal-sue-possibility",
  "lifeFlow-overall-possibility",
  "general-luck-existence",
  "general-self-interpretation",
] as const;

export type StrongAnchorCellId =
  (typeof P10_3_STRONG_ANCHOR_CELL_IDS)[number];

export type StrongAnchorEquivalenceStatus =
  | "PASS"
  | "FAIL"
  | "NOT_COVERED"
  | "SEPARATE_CONTRACT";

export type StrongAnchorCaseKind =
  | "anchor_canonical"
  | "anchor_paraphrase"
  | "target_variation"
  | "timing_variation"
  | "composite_variation"
  | "separate_contract"
  | "not_covered_variation"
  | "composite_action_relations";

export type AnchorSemanticContract = {
  topic: QuestionTopic;
  intent: QuestionIntent;
  decisionTarget: DecisionTarget;
  timingType?: QuestionTimingType;
  analysisMode?: QuestionAnalysisMode;
};

export type AnchorSemanticActual = {
  topic: QuestionTopic;
  intent: QuestionIntent;
  decisionTarget: DecisionTarget;
  timingType: QuestionTimingType;
  analysisMode: QuestionAnalysisMode;
};

export type ActionRelationObservation = {
  kind: ActionRelationKind;
  participants: readonly DecisionTarget[];
};

export type StrongAnchorEquivalenceCase = {
  id: string;
  kind: StrongAnchorCaseKind;
  status: StrongAnchorEquivalenceStatus;
  passed: boolean;
  cellId: string;
  question: string;
  variationKind:
    | "canonical"
    | QuestionMeaningVariation["variationKind"];
  expected: AnchorSemanticContract | null;
  actual: AnchorSemanticActual | null;
  /**
   * 최소 contract(topic|intent|decisionTarget) mismatch.
   * 이 필드만 PASS/FAIL을 결정한다.
   */
  mismatchedFields: readonly string[];
  /**
   * optional contract(timingType|analysisMode) mismatch.
   * FAIL을 숨기지 않도록 결과에 명시하되,
   * Strong Anchor primary equivalence PASS 조건에는 넣지 않는다.
   */
  optionalMismatchedFields: readonly string[];
  exclusionReason: string | null;
  actionRelations: readonly ActionRelationObservation[] | null;
  details: readonly string[];
};

export type StrongAnchorEquivalenceVerificationResult = {
  step: "P10-4";
  passed: boolean;
  anchorClassification: {
    strong: readonly string[];
    conditional: readonly string[];
    unsafe: readonly string[];
  };
  metrics: {
    anchorCount: number;
    paraphraseCount: number;
    passCount: number;
    failCount: number;
    notCoveredCount: number;
    separateContractCount: number;
    failureRate: number;
    mismatchedFieldSummary: Readonly<Record<string, number>>;
    optionalMismatchedFieldSummary: Readonly<Record<string, number>>;
    semanticFamilyCoverage: readonly string[];
  };
  actionRelationsSummary: {
    compositeChecked: number;
    passCount: number;
    failCount: number;
    notCoveredCount: number;
  };
  cases: readonly StrongAnchorEquivalenceCase[];
};

const VALID_ACTION_RELATION_KINDS: ReadonlySet<ActionRelationKind> = new Set([
  "sequential",
  "concurrent",
  "exclusive_alt",
]);

function toContract(
  expected: QuestionMeaningExpectation,
): AnchorSemanticContract {
  return {
    topic: expected.topic,
    intent: expected.intent,
    decisionTarget: expected.decisionTarget,
    ...(expected.timingType !== undefined
      ? { timingType: expected.timingType }
      : {}),
    ...(expected.analysisMode !== undefined
      ? { analysisMode: expected.analysisMode }
      : {}),
  };
}

function toActual(
  readerResult: QuestionReaderResult,
): AnchorSemanticActual {
  return {
    topic: readerResult.topic,
    intent: readerResult.intent,
    decisionTarget: readerResult.decisionTarget,
    timingType: readerResult.timingType,
    analysisMode: readerResult.analysisMode,
  };
}

function primaryAxisKey(
  value: Pick<AnchorSemanticActual, "topic" | "intent" | "decisionTarget">,
): string {
  return `${value.topic}|${value.intent}|${value.decisionTarget}`;
}

/**
 * expectedOverride가 timingType/analysisMode만 바꾸는지.
 * primaryAxis(topic|intent|decisionTarget) 변경이면 timing-only가 아니다.
 */
function isTimingOnlyOverride(
  override: QuestionMeaningVariation["expectedOverride"],
): boolean {
  if (!override) {
    return true;
  }

  return Object.keys(override).every(
    (key) => key === "timingType" || key === "analysisMode",
  );
}

function collectPrimaryMismatchedFields(
  expected: AnchorSemanticContract,
  actual: AnchorSemanticActual,
): string[] {
  const mismatched: string[] = [];

  if (actual.topic !== expected.topic) {
    mismatched.push("topic");
  }

  if (actual.intent !== expected.intent) {
    mismatched.push("intent");
  }

  if (actual.decisionTarget !== expected.decisionTarget) {
    mismatched.push("decisionTarget");
  }

  return mismatched;
}

function collectOptionalMismatchedFields(
  expected: AnchorSemanticContract,
  actual: AnchorSemanticActual,
): string[] {
  const mismatched: string[] = [];

  if (
    expected.timingType !== undefined
    && actual.timingType !== expected.timingType
  ) {
    mismatched.push("timingType");
  }

  if (
    expected.analysisMode !== undefined
    && actual.analysisMode !== expected.analysisMode
  ) {
    mismatched.push("analysisMode");
  }

  return mismatched;
}

function readActionRelations(
  readerResult: QuestionReaderResult,
): QuestionActionRelation[] {
  return readerResult.readerMatchDiagnostics?.actionRelations ?? [];
}

function toActionRelationObservations(
  relations: readonly QuestionActionRelation[],
): ActionRelationObservation[] {
  return relations.map((relation) => ({
    kind: relation.kind,
    participants: [...relation.participants],
  }));
}

function evaluateActionRelations(
  relations: readonly QuestionActionRelation[],
): {
  status: StrongAnchorEquivalenceStatus;
  mismatchedFields: string[];
  details: string[];
} {
  if (relations.length === 0) {
    return {
      status: "NOT_COVERED",
      mismatchedFields: [],
      details: [
        "optional actionRelations gold 미선언; Reader 관측도 비어 SEPARATE가 아닌 NOT_COVERED",
      ],
    };
  }

  const mismatchedFields: string[] = [];
  const details: string[] = [];

  for (const [index, relation] of relations.entries()) {
    if (!VALID_ACTION_RELATION_KINDS.has(relation.kind)) {
      mismatchedFields.push("actionRelations.kind");
      details.push(
        `relation[${index}].kind=${String(relation.kind)} is invalid`,
      );
    }

    if (
      !Array.isArray(relation.participants)
      || relation.participants.length === 0
    ) {
      mismatchedFields.push("actionRelations.participants");
      details.push(
        `relation[${index}].participants missing or empty`,
      );
    }

    details.push(
      `relation[${index}]=kind:${relation.kind};participants:${
        relation.participants.join("|") || "none"
      }`,
    );
  }

  return {
    status: mismatchedFields.length === 0 ? "PASS" : "FAIL",
    mismatchedFields: Array.from(new Set(mismatchedFields)),
    details,
  };
}

function buildCase(params: {
  id: string;
  kind: StrongAnchorCaseKind;
  status: StrongAnchorEquivalenceStatus;
  cellId: string;
  question: string;
  variationKind:
    | "canonical"
    | QuestionMeaningVariation["variationKind"];
  expected: AnchorSemanticContract | null;
  actual: AnchorSemanticActual | null;
  mismatchedFields: readonly string[];
  optionalMismatchedFields?: readonly string[];
  exclusionReason?: string | null;
  actionRelations?: readonly ActionRelationObservation[] | null;
  details: readonly string[];
}): StrongAnchorEquivalenceCase {
  return {
    id: params.id,
    kind: params.kind,
    status: params.status,
    passed: params.status === "PASS",
    cellId: params.cellId,
    question: params.question,
    variationKind: params.variationKind,
    expected: params.expected,
    actual: params.actual,
    mismatchedFields: params.mismatchedFields,
    optionalMismatchedFields: params.optionalMismatchedFields ?? [],
    exclusionReason: params.exclusionReason ?? null,
    actionRelations: params.actionRelations ?? null,
    details: params.details,
  };
}

function collectStrongAnchorCells(
  cells: readonly QuestionMeaningCell[],
): QuestionMeaningCell[] {
  const selected: QuestionMeaningCell[] = [];

  for (const cellId of P10_3_STRONG_ANCHOR_CELL_IDS) {
    const cell = cells.find((item) => item.id === cellId);
    if (cell) {
      selected.push(cell);
    }
  }

  return selected;
}

function evaluateContractCase(params: {
  id: string;
  kind:
    | "anchor_canonical"
    | "anchor_paraphrase"
    | "target_variation"
    | "timing_variation";
  cell: QuestionMeaningCell;
  question: string;
  variationKind:
    | "canonical"
    | QuestionMeaningVariation["variationKind"];
  contract: AnchorSemanticContract;
  humanContext: ReturnType<
    typeof buildDecisionEngineRegressionInput
  >["humanContext"];
  policyNote?: string;
}): StrongAnchorEquivalenceCase {
  const readerResult = readQuestion(params.humanContext, params.question);
  const actual = toActual(readerResult);
  const mismatchedFields = collectPrimaryMismatchedFields(
    params.contract,
    actual,
  );
  const optionalMismatchedFields = collectOptionalMismatchedFields(
    params.contract,
    actual,
  );
  const status: StrongAnchorEquivalenceStatus =
    mismatchedFields.length === 0 ? "PASS" : "FAIL";

  return buildCase({
    id: params.id,
    kind: params.kind,
    status,
    cellId: params.cell.id,
    question: params.question,
    variationKind: params.variationKind,
    expected: params.contract,
    actual,
    mismatchedFields,
    optionalMismatchedFields,
    details: [
      `cellId=${params.cell.id}`,
      `primaryAxis=${params.cell.primaryAxis}`,
      `distinctMeaningGroup=${params.cell.distinctMeaningGroup}`,
      `expected=${params.contract.topic}|${params.contract.intent}|${params.contract.decisionTarget}`,
      `actual=${actual.topic}|${actual.intent}|${actual.decisionTarget}`,
      `mismatchedFields=${mismatchedFields.join(",") || "none"}`,
      `optionalMismatchedFields=${
        optionalMismatchedFields.join(",") || "none"
      }`,
      ...(params.policyNote ? [`policyNote=${params.policyNote}`] : []),
    ],
  });
}

function collectParaphraseCases(
  cell: QuestionMeaningCell,
  contract: AnchorSemanticContract,
  humanContext: ReturnType<
    typeof buildDecisionEngineRegressionInput
  >["humanContext"],
): StrongAnchorEquivalenceCase[] {
  return cell.paraphrases.map((variation) =>
    evaluateContractCase({
      id: `p10-4-${cell.id}__${variation.idSuffix}`,
      kind: "anchor_paraphrase",
      cell,
      question: variation.question,
      variationKind: "paraphrase",
      contract,
      humanContext,
    }),
  );
}

/**
 * P10-5/P10-6 policy: target / timing / composite를 전체 cell에서 관측.
 * expectedOverride는 자동 gold가 아니다.
 */
function collectPolicyVariationCases(
  cell: QuestionMeaningCell,
  contract: AnchorSemanticContract,
  canonicalActual: AnchorSemanticActual,
  humanContext: ReturnType<
    typeof buildDecisionEngineRegressionInput
  >["humanContext"],
): StrongAnchorEquivalenceCase[] {
  const cases: StrongAnchorEquivalenceCase[] = [];

  for (const variation of cell.targetVariants) {
    cases.push(
      evaluateTargetVariationCase(
        cell,
        variation,
        contract,
        canonicalActual,
        humanContext,
      ),
    );
  }

  for (const variation of cell.timingVariants) {
    cases.push(
      evaluateTimingVariationCase(
        cell,
        variation,
        contract,
        canonicalActual,
        humanContext,
      ),
    );
  }

  for (const variation of cell.compositeVariants) {
    cases.push(
      evaluateCompositeVariationCase(
        cell,
        variation,
        contract,
        humanContext,
      ),
    );
    cases.push(
      buildCompositeActionRelationCase(
        cell,
        variation,
        humanContext,
        "composite policy — actionRelations는 관측만 하고 equivalence PASS gold로 쓰지 않음",
      ),
    );
  }

  return cases;
}

function evaluateTargetVariationCase(
  cell: QuestionMeaningCell,
  variation: QuestionMeaningVariation,
  contract: AnchorSemanticContract,
  canonicalActual: AnchorSemanticActual,
  humanContext: ReturnType<
    typeof buildDecisionEngineRegressionInput
  >["humanContext"],
): StrongAnchorEquivalenceCase {
  const readerResult = readQuestion(humanContext, variation.question);
  const actual = toActual(readerResult);
  const samePrimaryAxis =
    primaryAxisKey(actual) === primaryAxisKey(canonicalActual);

  // SAME_MEANING inherit 후보: Anchor expected를 gold로 평가.
  // expectedOverride는 있더라도 자동 gold로 쓰지 않는다.
  if (samePrimaryAxis) {
    return evaluateContractCase({
      id: `p10-4-${cell.id}__${variation.idSuffix}`,
      kind: "target_variation",
      cell,
      question: variation.question,
      variationKind: "target",
      contract,
      humanContext,
      policyNote:
        "SAME_MEANING_INHERIT_CANDIDATE: variation actual primaryAxis"
        + " == canonical actual; Anchor expected inherit"
        + (variation.expectedOverride
          ? "; expectedOverride present but not used as gold"
          : ""),
    });
  }

  // primaryAxis 불일치: READER_GAP/FIXTURE_GAP 자동 단정 금지.
  // mismatch는 노출하고 SEPARATE_CONTRACT / FAIL 후보로 분류.
  const mismatchedFields = collectPrimaryMismatchedFields(contract, actual);
  const optionalMismatchedFields = collectOptionalMismatchedFields(
    contract,
    actual,
  );
  const boundary = isPrimaryAxisBoundaryVariation(cell, variation);

  return buildCase({
    id: `p10-4-${cell.id}__${variation.idSuffix}`,
    kind: "target_variation",
    status: "SEPARATE_CONTRACT",
    cellId: cell.id,
    question: variation.question,
    variationKind: "target",
    expected: contract,
    actual,
    mismatchedFields,
    optionalMismatchedFields,
    exclusionReason:
      "SEPARATE_CONTRACT: target primaryAxis ≠ canonical actual — "
      + "FAIL 후보로 노출하되 READER_GAP/FIXTURE_GAP 자동 단정 금지"
      + (variation.expectedOverride
        ? "; expectedOverride는 자동 gold 아님"
        : "")
      + (boundary ? "; primaryAxis boundary variation 후보" : ""),
    details: [
      `cellId=${cell.id}`,
      `variationKind=target`,
      `policyClass=TARGET_AXIS_MISMATCH`,
      `canonicalActual=${primaryAxisKey(canonicalActual)}`,
      `variationActual=${primaryAxisKey(actual)}`,
      `anchorExpected=${primaryAxisKey(contract)}`,
      `mismatchedFields=${mismatchedFields.join(",") || "none"}`,
      `optionalMismatchedFields=${
        optionalMismatchedFields.join(",") || "none"
      }`,
      `hasExpectedOverride=${Boolean(variation.expectedOverride)}`,
      `primaryAxisBoundary=${boundary}`,
      "note=expectedOverride not treated as automatic gold",
    ],
  });
}

function evaluateTimingVariationCase(
  cell: QuestionMeaningCell,
  variation: QuestionMeaningVariation,
  contract: AnchorSemanticContract,
  canonicalActual: AnchorSemanticActual,
  humanContext: ReturnType<
    typeof buildDecisionEngineRegressionInput
  >["humanContext"],
): StrongAnchorEquivalenceCase {
  const readerResult = readQuestion(humanContext, variation.question);
  const actual = toActual(readerResult);
  const timingOnlyOverride = isTimingOnlyOverride(variation.expectedOverride);
  const intentPreserved = actual.intent === canonicalActual.intent;
  const topicPreserved = actual.topic === canonicalActual.topic;
  const decisionTargetPreserved =
    actual.decisionTarget === canonicalActual.decisionTarget;
  const primarySemanticAxesPreserved =
    intentPreserved && topicPreserved && decisionTargetPreserved;

  // timing-only inherit 후보:
  // override가 timingType/analysisMode만 바꾸고,
  // Reader actual primary semantic axes가 canonical actual과 동일할 때만.
  // 단순 paraphrase PASS로 위장하지 않도록 policyNote를 남긴다.
  if (timingOnlyOverride && primarySemanticAxesPreserved) {
    return evaluateContractCase({
      id: `p10-4-${cell.id}__${variation.idSuffix}`,
      kind: "timing_variation",
      cell,
      question: variation.question,
      variationKind: "timing",
      contract,
      humanContext,
      policyNote:
        "TIMING_ONLY_INHERIT_CANDIDATE: expectedOverride timingType/analysisMode-only"
        + " (or absent) and actual primary semantic axes"
        + " (topic|intent|decisionTarget) == canonical actual;"
        + " primary Anchor expected inherit — not a plain paraphrase PASS",
    });
  }

  // intent/topic/decisionTarget 변화 또는 primary override → SEPARATE_CONTRACT
  const mismatchedFields = collectPrimaryMismatchedFields(contract, actual);
  const optionalMismatchedFields = collectOptionalMismatchedFields(
    contract,
    actual,
  );
  const separateReason = !timingOnlyOverride
    ? "expectedOverride changes primaryAxis fields"
    : !intentPreserved
      ? "actual.intent ≠ canonical actual.intent"
      : !topicPreserved
        ? "actual.topic ≠ canonical actual.topic"
        : "actual.decisionTarget ≠ canonical actual.decisionTarget";

  return buildCase({
    id: `p10-4-${cell.id}__${variation.idSuffix}`,
    kind: "timing_variation",
    status: "SEPARATE_CONTRACT",
    cellId: cell.id,
    question: variation.question,
    variationKind: "timing",
    expected: contract,
    actual,
    mismatchedFields,
    optionalMismatchedFields,
    exclusionReason:
      "SEPARATE_CONTRACT: timing variation is not timing-only inherit — "
      + separateReason,
    details: [
      `cellId=${cell.id}`,
      `variationKind=timing`,
      `policyClass=TIMING_SEPARATE_CONTRACT`,
      `timingOnlyOverride=${timingOnlyOverride}`,
      `primarySemanticAxesPreserved=${primarySemanticAxesPreserved}`,
      `canonicalIntent=${canonicalActual.intent}`,
      `variationIntent=${actual.intent}`,
      `canonicalTopic=${canonicalActual.topic}`,
      `variationTopic=${actual.topic}`,
      `canonicalDecisionTarget=${canonicalActual.decisionTarget}`,
      `variationDecisionTarget=${actual.decisionTarget}`,
      `canonicalActual=${primaryAxisKey(canonicalActual)}`,
      `variationActual=${primaryAxisKey(actual)}`,
      `mismatchedFields=${mismatchedFields.join(",") || "none"}`,
      `optionalMismatchedFields=${
        optionalMismatchedFields.join(",") || "none"
      }`,
      `overrideKeys=${
        variation.expectedOverride
          ? Object.keys(variation.expectedOverride).join(",")
          : "none"
      }`,
      "note=timing variation not disguised as simple PASS;"
      + " optional timingType/analysisMode mismatch does not affect Strong Gate",
    ],
  });
}

function evaluateCompositeVariationCase(
  cell: QuestionMeaningCell,
  variation: QuestionMeaningVariation,
  contract: AnchorSemanticContract,
  humanContext: ReturnType<
    typeof buildDecisionEngineRegressionInput
  >["humanContext"],
): StrongAnchorEquivalenceCase {
  const readerResult = readQuestion(humanContext, variation.question);
  const actual = toActual(readerResult);
  const mismatchedFields = collectPrimaryMismatchedFields(contract, actual);
  const optionalMismatchedFields = collectOptionalMismatchedFields(
    contract,
    actual,
  );

  // composite: canonical 의미 비상속, expectedOverride 비자동 gold.
  // mismatch는 숨기지 않고 SEPARATE_CONTRACT로 노출한다.
  return buildCase({
    id: `p10-4-${cell.id}__${variation.idSuffix}`,
    kind: "composite_variation",
    status: "SEPARATE_CONTRACT",
    cellId: cell.id,
    question: variation.question,
    variationKind: "composite",
    expected: contract,
    actual,
    mismatchedFields,
    optionalMismatchedFields,
    exclusionReason:
      "SEPARATE_CONTRACT: composite — canonical meaning not inherited; "
      + "expectedOverride is not automatic gold",
    details: [
      `cellId=${cell.id}`,
      `variationKind=composite`,
      `policyClass=COMPOSITE_NO_INHERIT`,
      `anchorExpected=${primaryAxisKey(contract)}`,
      `variationActual=${primaryAxisKey(actual)}`,
      `mismatchedFields=${mismatchedFields.join(",") || "none"}`,
      `optionalMismatchedFields=${
        optionalMismatchedFields.join(",") || "none"
      }`,
      `hasExpectedOverride=${Boolean(variation.expectedOverride)}`,
      `overrideKeys=${
        variation.expectedOverride
          ? Object.keys(variation.expectedOverride).join(",")
          : "none"
      }`,
      "note=actionRelations observed separately; relation gold not forced",
    ],
  });
}

function buildCompositeActionRelationCase(
  cell: QuestionMeaningCell,
  variation: QuestionMeaningVariation,
  humanContext: ReturnType<
    typeof buildDecisionEngineRegressionInput
  >["humanContext"],
  note?: string,
): StrongAnchorEquivalenceCase {
  const readerResult = readQuestion(humanContext, variation.question);
  const relations = readActionRelations(readerResult);
  const evaluation = evaluateActionRelations(relations);

  return buildCase({
    id: `p10-4-${cell.id}__${variation.idSuffix}__actionRelations`,
    kind: "composite_action_relations",
    status: evaluation.status,
    cellId: cell.id,
    question: variation.question,
    variationKind: "composite",
    expected: null,
    actual: toActual(readerResult),
    mismatchedFields: evaluation.mismatchedFields,
    exclusionReason:
      evaluation.status === "NOT_COVERED"
        ? evaluation.details[0] ?? "NOT_COVERED: actionRelations 미관측"
        : null,
    actionRelations: toActionRelationObservations(relations),
    details: [
      `cellId=${cell.id}`,
      `variationKind=composite`,
      `optionalAssertion=kind+participants only`,
      ...(note ? [`note=${note}`] : []),
      ...evaluation.details,
    ],
  });
}

/**
 * Strong Anchor canonical + paraphrase semantic contract 수렴 검증.
 * P10-7: 전체 cell의 target/timing/composite variation policy 관측 포함.
 */
export function verifyStrongAnchorEquivalence(
  cells: readonly QuestionMeaningCell[] = QUESTION_MEANING_CELLS,
): StrongAnchorEquivalenceVerificationResult {
  const humanContext = buildDecisionEngineRegressionInput().humanContext;
  const strongCells = collectStrongAnchorCells(cells);
  const cases: StrongAnchorEquivalenceCase[] = [];

  for (const cell of strongCells) {
    const contract = toContract(cell.expected);

    cases.push(
      evaluateContractCase({
        id: `p10-4-${cell.id}__canonical`,
        kind: "anchor_canonical",
        cell,
        question: cell.canonicalQuestion,
        variationKind: "canonical",
        contract,
        humanContext,
      }),
    );

    cases.push(
      ...collectParaphraseCases(cell, contract, humanContext),
    );
  }

  // P10-5/P10-6: target/timing/composite는 전체 37 cell에서 관측한다.
  // paraphrase inherit 범위(Strong 14)와 분리한다.
  for (const cell of cells) {
    const contract = toContract(cell.expected);
    const canonicalActual = toActual(
      readQuestion(humanContext, cell.canonicalQuestion),
    );

    cases.push(
      ...collectPolicyVariationCases(
        cell,
        contract,
        canonicalActual,
        humanContext,
      ),
    );
  }

  const missingStrongIds = P10_3_STRONG_ANCHOR_CELL_IDS.filter(
    (cellId) => !cells.some((cell) => cell.id === cellId),
  );

  for (const cellId of missingStrongIds) {
    cases.push(buildCase({
      id: `p10-4-${cellId}__missing`,
      kind: "not_covered_variation",
      status: "NOT_COVERED",
      cellId,
      question: "",
      variationKind: "canonical",
      expected: null,
      actual: null,
      mismatchedFields: [],
      exclusionReason:
        "NOT_COVERED: P10-3 Strong Anchor id가 QUESTION_MEANING_CELLS에 없음",
      details: [`cellId=${cellId}`],
    }));
  }

  const passCount = cases.filter((item) => item.status === "PASS").length;
  const failCount = cases.filter((item) => item.status === "FAIL").length;
  const notCoveredCount = cases.filter(
    (item) => item.status === "NOT_COVERED",
  ).length;
  const separateContractCount = cases.filter(
    (item) => item.status === "SEPARATE_CONTRACT",
  ).length;
  const judgedCount = passCount + failCount;
  const failureRate = judgedCount === 0 ? 0 : failCount / judgedCount;

  const mismatchedFieldSummary: Record<string, number> = {};
  const optionalMismatchedFieldSummary: Record<string, number> = {};
  for (const item of cases) {
    if (item.status === "FAIL") {
      for (const field of item.mismatchedFields) {
        mismatchedFieldSummary[field] =
          (mismatchedFieldSummary[field] ?? 0) + 1;
      }
    }

    for (const field of item.optionalMismatchedFields) {
      optionalMismatchedFieldSummary[field] =
        (optionalMismatchedFieldSummary[field] ?? 0) + 1;
    }
  }

  const paraphraseCount = cases.filter(
    (item) => item.kind === "anchor_paraphrase",
  ).length;

  const actionRelationCases = cases.filter(
    (item) => item.kind === "composite_action_relations",
  );

  const semanticFamilyCoverage = Array.from(
    new Set(
      strongCells.map((cell) => cell.distinctMeaningGroup),
    ),
  ).sort();

  // Gate는 Strong Anchor canonical + paraphrase FAIL만 본다.
  // target/timing/composite FAIL 후보는 관측·보고하되 P10-4 Strong 결과를 깨지 않는다.
  const strongGateFailCount = cases.filter(
    (item) =>
      (item.kind === "anchor_canonical" || item.kind === "anchor_paraphrase")
      && item.status === "FAIL",
  ).length;

  return {
    step: "P10-4",
    passed: strongGateFailCount === 0,
    anchorClassification: {
      // 이번 runner는 P10-3 Strong 14개만 대상. Conditional/Unsafe는 범위 밖.
      strong: [...P10_3_STRONG_ANCHOR_CELL_IDS],
      conditional: [],
      unsafe: [],
    },
    metrics: {
      anchorCount: strongCells.length,
      paraphraseCount,
      passCount,
      failCount,
      notCoveredCount,
      separateContractCount,
      failureRate,
      mismatchedFieldSummary,
      optionalMismatchedFieldSummary,
      semanticFamilyCoverage,
    },
    actionRelationsSummary: {
      compositeChecked: actionRelationCases.length,
      passCount: actionRelationCases.filter(
        (item) => item.status === "PASS",
      ).length,
      failCount: actionRelationCases.filter(
        (item) => item.status === "FAIL",
      ).length,
      notCoveredCount: actionRelationCases.filter(
        (item) => item.status === "NOT_COVERED",
      ).length,
    },
    cases,
  };
}

export function serializeStrongAnchorEquivalenceVerificationResult(
  result: StrongAnchorEquivalenceVerificationResult,
): string {
  return JSON.stringify(
    {
      step: result.step,
      passed: result.passed,
      anchorClassification: result.anchorClassification,
      metrics: result.metrics,
      actionRelationsSummary: result.actionRelationsSummary,
      failures: result.cases
        .filter((item) => item.status === "FAIL")
        .map((item) => ({
          cell: item.cellId,
          question: item.question,
          expected: item.expected,
          actual: item.actual,
          field: item.mismatchedFields,
          optionalField: item.optionalMismatchedFields,
          kind: item.kind,
          details: item.details,
        })),
      optionalMismatches: result.cases
        .filter((item) => item.optionalMismatchedFields.length > 0)
        .map((item) => ({
          cell: item.cellId,
          question: item.question,
          expected: item.expected,
          actual: item.actual,
          optionalField: item.optionalMismatchedFields,
          status: item.status,
          kind: item.kind,
        })),
      separateContracts: result.cases
        .filter((item) => item.status === "SEPARATE_CONTRACT")
        .map((item) => ({
          cell: item.cellId,
          question: item.question,
          exclusionReason: item.exclusionReason,
        })),
      notCovered: result.cases
        .filter((item) => item.status === "NOT_COVERED")
        .map((item) => ({
          cell: item.cellId,
          question: item.question,
          kind: item.kind,
          exclusionReason: item.exclusionReason,
        })),
      cases: result.cases,
    },
    null,
    2,
  );
}
