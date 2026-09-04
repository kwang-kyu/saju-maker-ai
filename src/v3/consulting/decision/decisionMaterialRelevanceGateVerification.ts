import {
  buildDecisionEngineRegressionInput,
} from "./regression/decisionEngineRegressionFixture.js";

import {
  analyzeContextAlignment,
} from "./contextAlignment.js";

import {
  buildDecisionBrain,
} from "./decisionBrain.js";

import {
  assessCompatibility,
} from "./compatibilityAssessment.js";

import {
  assessDecisionReality,
} from "./decisionRealityAssessment.js";

import {
  assessReaderDecision,
} from "./readerDecisionAssessment.js";

import {
  assessTiming,
} from "./timingAssessment.js";

import {
  buildReaderAwareDecisionConditions,
} from "./conditionBuilder.js";

import {
  buildDecisionEvidence,
} from "./evidenceBuilder.js";

import {
  buildReaderAwareDecisionRisks,
} from "./riskBuilder.js";

import {
  resolveActionReadiness,
} from "./decisionResolver.js";

import {
  runDecisionEngine,
} from "./decisionEngine.js";

import {
  applyDecisionMaterialRelevanceGate,
  resolveDecisionMaterialRelevanceContext,
} from "./decisionMaterialRelevanceGate.js";

import type {
  ActionReadiness,
  DecisionCondition,
  DecisionEngineInput,
  DecisionEvidence,
  DecisionResult,
  DecisionRisk,
} from "./decisionTypes.js";

import type {
  QuestionContext,
} from "../question/questionContext.js";

import {
  buildQuestionContext,
} from "../question/questionContextBuilder.js";

import {
  readQuestion,
  type QuestionReaderResult,
} from "../question/questionReader.js";

import {
  readDecisionResult,
  type DecisionExplanationEvidence,
  type DecisionExplanationInput,
} from "../explanation/decisionResultReader.js";

import {
  filterRelevantConditions,
  filterRelevantEvidence,
  filterRelevantRisks,
} from "../explanation/decisionExplanationMaterialRelevance.js";

/**
 * decisionExplanationMaterialRelevanceVerification.ts 와
 * 동일한 대표 relevance fixture 질문 목록.
 */
const RELEVANCE_CASE_FIXTURES = [
  {
    name: "A_businessStart",
    questionText:
      "통닭집 창업을 해도 될까요?",
  },
  {
    name: "F_businessTiming",
    questionText:
      "지금 통닭집을 시작하면 성공할까요?",
  },
  {
    name: "G_businessFieldFit",
    questionText:
      "어떤 사업 분야가 나에게 맞을까요?",
  },
  {
    name: "B_moneyRecovery",
    questionText:
      "이번에 빌려준 돈을 받을 수 있을까요?",
  },
  {
    name: "C_continuation",
    questionText:
      "남자친구와 계속 만나야 할까요?",
  },
  {
    name: "D_lifeFlowYear",
    questionText:
      "올해 총운을 봐주세요",
  },
  {
    name: "D_lifeFlowMonth",
    questionText:
      "2026년 12월 운세는 어떨까요?",
  },
  {
    name: "E_compatibility",
    questionText:
      "우리 둘의 궁합은 어떤가요?",
  },
] as const;

export type DecisionMaterialRelevanceGateCaseName =
  typeof RELEVANCE_CASE_FIXTURES[number]["name"];

type PreGateMaterials = {
  evidence:
    DecisionEvidence[];

  conditions:
    DecisionCondition[];

  risks:
    DecisionRisk[];

  actionReadiness:
    ActionReadiness;
};

type MaterialKeySequence = {
  evidenceKeys:
    readonly string[];

  evidenceSources:
    readonly string[];

  conditionKeys:
    readonly string[];

  riskKeys:
    readonly string[];
};

export type DecisionMaterialRelevanceGateCaseResult = {
  name:
    DecisionMaterialRelevanceGateCaseName;

  questionText:
    string;

  focus:
    string;

  raw:
    MaterialKeySequence;

  gate:
    MaterialKeySequence;

  expectedFromExplanationFilter:
    MaterialKeySequence;

  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

export type DecisionMaterialRelevanceGateVerificationResult = {
  cases:
    DecisionMaterialRelevanceGateCaseResult[];

  passed:
    boolean;
};

function areSequencesEqual(
  left:
    readonly string[],
  right:
    readonly string[],
): boolean {
  if (
    left.length
    !== right.length
  ) {
    return false;
  }

  return left.every(
    (
      value,
      index,
    ) =>
      value
      === right[index],
  );
}

function extractMaterialKeySequence(
  evidence:
    readonly DecisionEvidence[],
  conditions:
    readonly DecisionCondition[],
  risks:
    readonly DecisionRisk[],
): MaterialKeySequence {
  return {
    evidenceKeys:
      evidence.map(
        (item) =>
          item.key,
      ),

    evidenceSources:
      evidence.map(
        (item) =>
          item.source,
      ),

    conditionKeys:
      conditions.map(
        (item) =>
          item.key,
      ),

    riskKeys:
      risks.map(
        (item) =>
          item.key,
      ),
  };
}

function buildMinimalDecisionResultForMapping(
  materials:
    PreGateMaterials,
  question:
    QuestionReaderResult,
): DecisionResult {
  return {
    verdict:
      "wait",

    confidence:
      "medium",

    contextAlignment:
      "unknown",

    actionReadiness:
      materials.actionReadiness,

    decisionTarget:
      question.decisionTarget,

    topic:
      question.topic,

    intent:
      question.intent,

    conclusionNature:
      question.conclusionNature,

    coreDecision:
      "",

    decisionReason:
      "",

    evidence:
      materials.evidence,

    conditions:
      materials.conditions,

    risks:
      materials.risks,

    conflict: {
      exists:
        false,

      description:
        "",

      humanContextSide:
        "",

      questionSide:
        "",
    },

    recommendedDirection:
      "",

    prohibitedDirection:
      "",

    finalDecisionSentence:
      "",

    humanContextUsed:
      true,

    questionContextUsed:
      true,
  };
}

function mapPreGateToExplanationMaterials(
  materials:
    PreGateMaterials,
  question:
    QuestionReaderResult,
): Pick<
  DecisionExplanationInput,
  | "evidence"
  | "conditions"
  | "risks"
> {
  return readDecisionResult(
    buildMinimalDecisionResultForMapping(
      materials,
      question,
    ),
  );
}

function deriveExpectedDecisionEvidence(
  preGateEvidence:
    readonly DecisionEvidence[],
  explanationEvidence:
    readonly DecisionExplanationEvidence[],
  filteredExplanationEvidence:
    readonly DecisionExplanationEvidence[],
): DecisionEvidence[] {
  const filteredSet =
    new Set(
      filteredExplanationEvidence,
    );

  return preGateEvidence.filter(
    (
      _item,
      index,
    ) =>
      filteredSet.has(
        explanationEvidence[index],
      ),
  );
}

function deriveExpectedDecisionItems<
  TItem extends { key: string },
  TExplanation extends { key: string },
>(
  preGateItems:
    readonly TItem[],
  explanationItems:
    readonly TExplanation[],
  filteredExplanationItems:
    readonly TExplanation[],
): TItem[] {
  const filteredSet =
    new Set(
      filteredExplanationItems,
    );

  return preGateItems.filter(
    (
      _item,
      index,
    ) =>
      filteredSet.has(
        explanationItems[index],
      ),
  );
}

function buildMainPathPreGateMaterials(
  input:
    DecisionEngineInput,
): PreGateMaterials {
  const brain =
    buildDecisionBrain(
      input.humanContext,
      input.question,
    );

  const alignmentResult =
    analyzeContextAlignment(
      input.humanContext,
      input.question,
    );

  const lifeAssessment =
    assessDecisionReality(
      input.lifeContext,
      input.questionContext.reality,
    );

  const actionReadiness =
    resolveActionReadiness(
      alignmentResult.alignment,
      input.question.urgency,
      lifeAssessment,
    );

  const compatibilityAssessment =
    assessCompatibility(
      input.questionContext,
      input.selfYearGanZhi,
      input.counterpartSaju,
      input.selfSajuFacts,
    );

  const timingAssessment =
    assessTiming({
      questionContext:
        input.questionContext,

      humanContext:
        input.humanContext,

      selfSajuFacts:
        input.selfSajuFacts
        ?? null,

      lifeFlowTarget:
        input.lifeFlowTarget,

      targetPeriodLuckFlow:
        input.targetPeriodLuckFlow,
    });

  const readerDecisionAssessment =
    assessReaderDecision(
      input,
    );

  const evidence =
    buildDecisionEvidence(
      input,
      brain,
      lifeAssessment,
      compatibilityAssessment,
    );

  const conditions =
    buildReaderAwareDecisionConditions({
      decisionInput:
        input,

      readiness:
        actionReadiness,

      alignmentReason:
        alignmentResult.reason,

      lifeAssessment,

      compatibilityAssessment,

      timingAssessment,

      readerAssessment:
        readerDecisionAssessment,
    });

  const risks =
    buildReaderAwareDecisionRisks({
      decisionInput:
        input,

      alignment:
        alignmentResult.alignment,

      urgency:
        input.question.urgency,

      lifeAssessment,

      compatibilityAssessment,

      readerAssessment:
        readerDecisionAssessment,
    });

  return {
    evidence,
    conditions,
    risks,
    actionReadiness,
  };
}

function buildPreGateMaterials(
  input:
    DecisionEngineInput,
): PreGateMaterials {
  if (
    input
      .questionContext
      .requirements
      .roleRecommendationAnalysisRequired
    || input
      .questionContext
      .requirements
      .lifeFlowInterpretationAnalysisRequired
  ) {
    const decisionResult =
      runDecisionEngine(
        input,
      );

    return {
      evidence:
        decisionResult.evidence,

      conditions:
        decisionResult.conditions,

      risks:
        decisionResult.risks,

      actionReadiness:
        decisionResult.actionReadiness,
    };
  }

  return buildMainPathPreGateMaterials(
    input,
  );
}

function buildExpectedFromExplanationFilter(
  materials:
    PreGateMaterials,
  question:
    QuestionReaderResult,
  questionContext:
    QuestionContext,
  originalQuestion:
    string,
): MaterialKeySequence {
  const context =
    resolveDecisionMaterialRelevanceContext({
      actionReadiness:
        materials.actionReadiness,

      decisionTarget:
        question.decisionTarget,

      intent:
        question.intent,

      topic:
        question.topic,

      originalQuestion,

      questionContext,
    });

  const explanationMaterials =
    mapPreGateToExplanationMaterials(
      materials,
      question,
    );

  const filteredEvidence =
    filterRelevantEvidence(
      explanationMaterials.evidence,
      context,
    );

  const filteredConditions =
    filterRelevantConditions(
      explanationMaterials.conditions,
      context,
    );

  const filteredRisks =
    filterRelevantRisks(
      explanationMaterials.risks,
      context,
    );

  const expectedEvidence =
    deriveExpectedDecisionEvidence(
      materials.evidence,
      explanationMaterials.evidence,
      filteredEvidence,
    );

  const expectedConditions =
    deriveExpectedDecisionItems(
      materials.conditions,
      explanationMaterials.conditions,
      filteredConditions,
    );

  const expectedRisks =
    deriveExpectedDecisionItems(
      materials.risks,
      explanationMaterials.risks,
      filteredRisks,
    );

  return extractMaterialKeySequence(
    expectedEvidence,
    expectedConditions,
    expectedRisks,
  );
}

function buildCaseChecks(
  raw:
    MaterialKeySequence,
  gate:
    MaterialKeySequence,
  expected:
    MaterialKeySequence,
): Record<
  string,
  boolean
> {
  return {
    evidenceLengthMatchesExpected:
      gate.evidenceKeys.length
      === expected.evidenceKeys.length,

    conditionLengthMatchesExpected:
      gate.conditionKeys.length
      === expected.conditionKeys.length,

    riskLengthMatchesExpected:
      gate.riskKeys.length
      === expected.riskKeys.length,

    evidenceKeySequenceMatchesExpected:
      areSequencesEqual(
        gate.evidenceKeys,
        expected.evidenceKeys,
      ),

    evidenceSourceSequenceMatchesExpected:
      areSequencesEqual(
        gate.evidenceSources,
        expected.evidenceSources,
      ),

    conditionKeySequenceMatchesExpected:
      areSequencesEqual(
        gate.conditionKeys,
        expected.conditionKeys,
      ),

    riskKeySequenceMatchesExpected:
      areSequencesEqual(
        gate.riskKeys,
        expected.riskKeys,
      ),

    gateEvidenceIsSubsetOfRaw:
      gate.evidenceKeys.every(
        (key) =>
          raw.evidenceKeys.includes(
            key,
          ),
      ),

    gateConditionsAreSubsetOfRaw:
      gate.conditionKeys.every(
        (key) =>
          raw.conditionKeys.includes(
            key,
          ),
      ),

    gateRisksAreSubsetOfRaw:
      gate.riskKeys.every(
        (key) =>
          raw.riskKeys.includes(
            key,
          ),
      ),

    filteringOccurredOnAtLeastOneMaterialType:
      gate.evidenceKeys.length
      < raw.evidenceKeys.length
      || gate.conditionKeys.length
      < raw.conditionKeys.length
      || gate.riskKeys.length
      < raw.riskKeys.length
      || (
        raw.evidenceKeys.length
        === 0
        && raw.conditionKeys.length
        === 0
        && raw.riskKeys.length
        === 0
      ),
  };
}

function buildCaseResult(
  fixture:
    typeof RELEVANCE_CASE_FIXTURES[number],
): DecisionMaterialRelevanceGateCaseResult {
  const regressionInput =
    buildDecisionEngineRegressionInput({
      questionText:
        fixture.questionText,
    });

  const question =
    readQuestion(
      regressionInput.humanContext,
      fixture.questionText,
    );

  const questionContext =
    buildQuestionContext(
      question,
    );

  const engineInput: DecisionEngineInput = {
    ...regressionInput,
    question,
    questionContext,
  };

  const preGateMaterials =
    buildPreGateMaterials(
      engineInput,
    );

  const relevanceContext =
    resolveDecisionMaterialRelevanceContext({
      actionReadiness:
        preGateMaterials.actionReadiness,

      decisionTarget:
        question.decisionTarget,

      intent:
        question.intent,

      topic:
        question.topic,

      originalQuestion:
        fixture.questionText,

      questionContext,
    });

  const gateResult =
    applyDecisionMaterialRelevanceGate({
      evidence:
        preGateMaterials.evidence,

      conditions:
        preGateMaterials.conditions,

      risks:
        preGateMaterials.risks,

      actionReadiness:
        preGateMaterials.actionReadiness,

      decisionTarget:
        question.decisionTarget,

      intent:
        question.intent,

      topic:
        question.topic,

      originalQuestion:
        fixture.questionText,

      questionContext,
    });

  const raw =
    extractMaterialKeySequence(
      preGateMaterials.evidence,
      preGateMaterials.conditions,
      preGateMaterials.risks,
    );

  const gate =
    extractMaterialKeySequence(
      gateResult.evidence,
      gateResult.conditions,
      gateResult.risks,
    );

  const expectedFromExplanationFilter =
    buildExpectedFromExplanationFilter(
      preGateMaterials,
      question,
      questionContext,
      fixture.questionText,
    );

  const checks =
    buildCaseChecks(
      raw,
      gate,
      expectedFromExplanationFilter,
    );

  return {
    name:
      fixture.name,

    questionText:
      fixture.questionText,

    focus:
      relevanceContext.focus,

    raw,
    gate,
    expectedFromExplanationFilter,
    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

/**
 * Engine Relevance Gate output이
 * 기존 Explanation relevance filter output과
 * 동일한지 검증한다.
 *
 * Expected는 항상 production filterRelevant* 호출 결과에서 생성한다.
 */
export function verifyDecisionMaterialRelevanceGate():
  DecisionMaterialRelevanceGateVerificationResult {
  const cases =
    RELEVANCE_CASE_FIXTURES.map(
      buildCaseResult,
    );

  return {
    cases,

    passed:
      cases.every(
        (caseResult) =>
          caseResult.passed,
      ),
  };
}
