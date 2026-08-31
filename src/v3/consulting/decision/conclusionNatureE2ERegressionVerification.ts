import {
  buildDecisionEngineRegressionInput,
} from "./regression/decisionEngineRegressionFixture.js";
import {
  runDecisionEngine,
} from "./decisionEngine.js";
import {
  buildCareerRecommendationSource,
} from "./careerRecommendationSourceBuilder.js";
import {
  buildWarningConclusionSource,
} from "./warningConclusionSourceBuilder.js";
import type {
  DecisionResult,
} from "./decisionTypes.js";
import type {
  ConclusionNature,
  DecisionTarget,
  QuestionAnalysisMode,
  QuestionIntent,
} from "../question/questionReader.js";

export type ConclusionNatureE2EQuestionGroup =
  | "decision"
  | "interpretation"
  | "recommendation"
  | "warning"
  | "existence"
  | "prediction";

export type ConclusionNatureE2EQuestionCase = {
  id: string;
  group: ConclusionNatureE2EQuestionGroup;
  question: string;
  expectedConclusionNature: ConclusionNature;
};

export const CONCLUSION_NATURE_E2E_QUESTIONS:
  readonly ConclusionNatureE2EQuestionCase[] = [
    {
      id: "decision_1",
      group: "decision",
      question: "지금 사업을 계속할까요?",
      expectedConclusionNature: "decision",
    },
    {
      id: "decision_2",
      group: "decision",
      question: "지금 주식에 투자해도 될까요?",
      expectedConclusionNature: "decision",
    },
    {
      id: "decision_3",
      group: "decision",
      question: "직장을 그만둘까요?",
      expectedConclusionNature: "decision",
    },
    {
      id: "decision_4",
      group: "decision",
      question: "지금 이 사람과 결혼해도 될까요?",
      expectedConclusionNature: "decision",
    },
    {
      id: "interpretation_1",
      group: "interpretation",
      question: "나는 어떤 성향인가요?",
      expectedConclusionNature: "interpretation",
    },
    {
      id: "interpretation_2",
      group: "interpretation",
      question: "내 사주의 특징은 무엇인가요?",
      expectedConclusionNature: "interpretation",
    },
    {
      id: "interpretation_3",
      group: "interpretation",
      question: "왜 일이 잘 안 풀리나요?",
      expectedConclusionNature: "interpretation",
    },
    {
      id: "interpretation_4",
      group: "interpretation",
      question: "왜 인간관계가 반복해서 힘든가요?",
      expectedConclusionNature: "interpretation",
    },
    {
      id: "recommendation_1",
      group: "recommendation",
      question: "어떤 직업이 맞나요?",
      expectedConclusionNature: "recommendation",
    },
    {
      id: "recommendation_2",
      group: "recommendation",
      question: "어떤 일이 적성에 맞나요?",
      expectedConclusionNature: "recommendation",
    },
    {
      id: "recommendation_3",
      group: "recommendation",
      question: "연극에서 어떤 역할이 맞나요?",
      expectedConclusionNature: "recommendation",
    },
    {
      id: "recommendation_4",
      group: "recommendation",
      question: "나에게 맞는 일은 무엇인가요?",
      expectedConclusionNature: "recommendation",
    },
    {
      id: "warning_1",
      group: "warning",
      question: "무엇을 조심해야 하나요?",
      expectedConclusionNature: "warning",
    },
    {
      id: "warning_2",
      group: "warning",
      question: "앞으로 주의할 점은 무엇인가요?",
      expectedConclusionNature: "warning",
    },
    {
      id: "warning_3",
      group: "warning",
      question: "어떤 위험이 있나요?",
      expectedConclusionNature: "warning",
    },
    {
      id: "warning_4",
      group: "warning",
      question: "내가 특히 조심해야 할 부분이 있나요?",
      expectedConclusionNature: "warning",
    },
    {
      id: "existence_1",
      group: "existence",
      question: "재물운이 있나요?",
      expectedConclusionNature: "existence",
    },
    {
      id: "existence_2",
      group: "existence",
      question: "사업운이 있나요?",
      expectedConclusionNature: "existence",
    },
    {
      id: "existence_3",
      group: "existence",
      question: "직장운이 있나요?",
      expectedConclusionNature: "existence",
    },
    {
      id: "existence_4",
      group: "existence",
      question: "내가 관재수가 있나요?",
      expectedConclusionNature: "existence",
    },
    {
      id: "prediction_1",
      group: "prediction",
      question: "앞으로 돈이 들어올까요?",
      expectedConclusionNature: "prediction",
    },
    {
      id: "prediction_2",
      group: "prediction",
      question: "올해 사업은 어떻게 될까요?",
      expectedConclusionNature: "prediction",
    },
    {
      id: "prediction_3",
      group: "prediction",
      question: "앞으로 연애운은 어떻게 될까요?",
      expectedConclusionNature: "prediction",
    },
    {
      id: "prediction_4",
      group: "prediction",
      question: "이 일을 하면 결과가 어떻게 될까요?",
      expectedConclusionNature: "prediction",
    },
  ];

const EXECUTION_STYLE_PATTERNS:
  readonly RegExp[] = [
    /진행(?:하는|할|하지| 여부)/,
    /보류(?:하는|한다|한다\.)/,
    /중단(?:하는|한다)/,
    /기다리(?:는|기)/,
    /실행(?:하는|하기| 여부)/,
    /바로 시작/,
    /조건을 갖춘 뒤(?: 진행| 움직)/,
    /선택을 조금 더 보류/,
    /시기를 늦추/,
    /결정을 유보/,
    /진행하지 않/,
    /결정 대상과 시기/,
    /다시 판단(?:한다|할)/,
  ];

const FALLBACK_TEMPLATING_PATTERNS:
  readonly RegExp[] = [
    /현재 정보만으로(?:는)? .*확정(?:하기|할)? 어렵/,
    /현재 확보된 근거만으로 .*확정(?:하기|할)? 어렵/,
    /현재 확인된 근거만으로 .*단정(?:하기|할)? 어렵/,
    /판단을 유보/,
    /결정을 확정할 수 없/,
  ];

export type ConclusionNatureE2ESnapshot = {
  id: string;
  group: ConclusionNatureE2EQuestionGroup;
  question: string;

  intent: QuestionIntent;
  analysisMode: QuestionAnalysisMode;
  decisionTarget: DecisionTarget;
  conclusionNature: ConclusionNature;
  expectedConclusionNature: ConclusionNature;

  verdict: DecisionResult["verdict"];

  evidenceKeys: string[];
  evidenceSources: string[];

  coreDecision: string;
  recommendedDirection: string;
  prohibitedDirection: string;
  finalDecisionSentence: string;

  finalDecisionIsExecutionStyle: boolean;
  finalDecisionIsFallbackTemplating: boolean;
  finalDecisionMatchesLegacyAssembly: boolean;
  finalDecisionUsesCoreDecisionOnly: boolean;

  roleRecommendationAssessmentUsed: boolean;
  careerRecommendationSourceUsed: boolean;
  warningConclusionSourceUsed: boolean;

  riskCount: number;
  conditionCount: number;
};

export type ConclusionNatureE2EDuplicateFinding = {
  kind:
    | "crossNatureFinalDecision"
    | "sameNatureIdenticalCoreDecision"
    | "sameNatureIdenticalFinalDecision";

  sentence: string;
  caseIds: string[];
  groups: ConclusionNatureE2EQuestionGroup[];
  conclusionNatures: ConclusionNature[];
};

export type ConclusionNatureE2EPollutionFinding = {
  caseId: string;
  group: ConclusionNatureE2EQuestionGroup;
  conclusionNature: ConclusionNature;
  issue:
    | "executionStyleInNonDecision"
    | "decisionPathInInterpretation"
    | "decisionPathInRecommendation"
    | "decisionPathInWarning"
    | "decisionPathInExistence"
    | "directionInPredictionOrExistence"
    | "conclusionNatureMismatch";

  detail: string;
  finalDecisionSentence: string;
};

export type ConclusionNatureE2ETemplatingFinding = {
  caseId: string;
  group: ConclusionNatureE2EQuestionGroup;
  pattern: string;
  finalDecisionSentence: string;
  coreDecision: string;
  sharedWithCaseIds: string[];
};

export type ConclusionNatureE2EProblemLocation =
  | "QuestionReader"
  | "ConclusionNature"
  | "SourceBuilder"
  | "CoreDecisionBuilder"
  | "DirectionJudgementBuilder"
  | "DecisionResultBuilder"
  | "Evidence";

export type ConclusionNatureE2EProblemLocationFinding = {
  caseId: string;
  locations: ConclusionNatureE2EProblemLocation[];
  reason: string;
};

export type ConclusionNatureE2ERegressionVerificationResult = {
  snapshots: ConclusionNatureE2ESnapshot[];

  summaryByGroup: Record<
    ConclusionNatureE2EQuestionGroup,
    {
      count: number;
      conclusionNatureMatches: number;
      uniqueCoreDecisions: number;
      uniqueFinalDecisions: number;
    }
  >;

  duplicateFindings:
    ConclusionNatureE2EDuplicateFinding[];

  pollutionFindings:
    ConclusionNatureE2EPollutionFinding[];

  templatingFindings:
    ConclusionNatureE2ETemplatingFinding[];

  problemLocationFindings:
    ConclusionNatureE2EProblemLocationFinding[];

  passed: boolean;
};

function isExecutionStyleSentence(
  sentence: string,
): boolean {
  return EXECUTION_STYLE_PATTERNS.some(
    (pattern) =>
      pattern.test(sentence),
  );
}

function isFallbackTemplatingSentence(
  sentence: string,
): boolean {
  return FALLBACK_TEMPLATING_PATTERNS.some(
    (pattern) =>
      pattern.test(sentence),
  );
}

function buildSnapshot(
  testCase:
    ConclusionNatureE2EQuestionCase,
): ConclusionNatureE2ESnapshot {
  const input =
    buildDecisionEngineRegressionInput({
      questionText:
        testCase.question,
    });

  const result =
    runDecisionEngine(input);

  const question =
    input.question;

  const legacyAssembly =
    [
      result.coreDecision,
      result.recommendedDirection,
    ].join(" ");

  const careerRecommendationSource =
    question.conclusionNature
    === "recommendation"
      ? buildCareerRecommendationSource(
        input.humanContext,
      )
      : null;

  const warningConclusionSource =
    question.conclusionNature
    === "warning"
      ? buildWarningConclusionSource(
        result.risks,
        result.conditions,
      )
      : null;

  const finalDecisionUsesCoreDecisionOnly =
    result.finalDecisionSentence
    === result.coreDecision;

  return {
    id: testCase.id,
    group: testCase.group,
    question: testCase.question,

    intent: question.intent,
    analysisMode: question.analysisMode,
    decisionTarget: question.decisionTarget,
    conclusionNature:
      question.conclusionNature,
    expectedConclusionNature:
      testCase.expectedConclusionNature,

    verdict: result.verdict,

    evidenceKeys:
      result.evidence.map(
        (item) =>
          item.key,
      ),
    evidenceSources: [
      ...new Set(
        result.evidence.map(
          (item) =>
            item.source,
        ),
      ),
    ],

    coreDecision:
      result.coreDecision,
    recommendedDirection:
      result.recommendedDirection,
    prohibitedDirection:
      result.prohibitedDirection,
    finalDecisionSentence:
      result.finalDecisionSentence,

    finalDecisionIsExecutionStyle:
      isExecutionStyleSentence(
        result.finalDecisionSentence,
      ),
    finalDecisionIsFallbackTemplating:
      isFallbackTemplatingSentence(
        result.finalDecisionSentence,
      ),
    finalDecisionMatchesLegacyAssembly:
      result.finalDecisionSentence
      === legacyAssembly,
    finalDecisionUsesCoreDecisionOnly,

    roleRecommendationAssessmentUsed:
      result
        .roleRecommendationAssessment
        ?.available
      === true,

    careerRecommendationSourceUsed:
      careerRecommendationSource
        ?.hasSpecificRoleEvidence
      === true,

    warningConclusionSourceUsed:
      warningConclusionSource
        ?.hasSpecificRiskEvidence
      === true,

    riskCount:
      result.risks.length,
    conditionCount:
      result.conditions.length,
  };
}

function groupBySentence(
  snapshots:
    readonly ConclusionNatureE2ESnapshot[],
  selector: (
    snapshot:
      ConclusionNatureE2ESnapshot,
  ) => string,
): Map<
  string,
  ConclusionNatureE2ESnapshot[]
> {
  const groups =
    new Map<
      string,
      ConclusionNatureE2ESnapshot[]
    >();

  for (const snapshot of snapshots) {
    const sentence =
      selector(snapshot);

    const existing =
      groups.get(sentence)
      ?? [];

    existing.push(snapshot);
    groups.set(
      sentence,
      existing,
    );
  }

  return groups;
}

function detectDuplicates(
  snapshots:
    readonly ConclusionNatureE2ESnapshot[],
): ConclusionNatureE2EDuplicateFinding[] {
  const findings:
    ConclusionNatureE2EDuplicateFinding[] = [];

  const finalGroups =
    groupBySentence(
      snapshots,
      (snapshot) =>
        snapshot.finalDecisionSentence,
    );

  for (const [
    sentence,
    cases,
  ] of finalGroups) {
    if (
      cases.length
      < 2
    ) {
      continue;
    }

    const natureSet =
      new Set(
        cases.map(
          (item) =>
            item.conclusionNature,
        ),
      );

    if (
      natureSet.size
      > 1
    ) {
      findings.push({
        kind:
          "crossNatureFinalDecision",
        sentence,
        caseIds:
          cases.map(
            (item) =>
              item.id,
          ),
        groups: [
          ...new Set(
            cases.map(
              (item) =>
                item.group,
            ),
          ),
        ],
        conclusionNatures: [
          ...natureSet,
        ],
      });
      continue;
    }

    findings.push({
      kind:
        "sameNatureIdenticalFinalDecision",
      sentence,
      caseIds:
        cases.map(
          (item) =>
            item.id,
        ),
      groups: [
        cases[0].group,
      ],
      conclusionNatures: [
        cases[0].conclusionNature,
      ],
    });
  }

  for (const group of [
    "decision",
    "interpretation",
    "recommendation",
    "warning",
    "existence",
    "prediction",
  ] as const) {
    const groupSnapshots =
      snapshots.filter(
        (item) =>
          item.group
          === group,
      );

    const coreGroups =
      groupBySentence(
        groupSnapshots,
        (snapshot) =>
          snapshot.coreDecision,
      );

    for (const [
      sentence,
      cases,
    ] of coreGroups) {
      if (
        cases.length
        < 2
      ) {
        continue;
      }

      findings.push({
        kind:
          "sameNatureIdenticalCoreDecision",
        sentence,
        caseIds:
          cases.map(
            (item) =>
              item.id,
          ),
        groups: [group],
        conclusionNatures: [
          cases[0].conclusionNature,
        ],
      });
    }
  }

  return findings;
}

function detectPollution(
  snapshots:
    readonly ConclusionNatureE2ESnapshot[],
): ConclusionNatureE2EPollutionFinding[] {
  const findings:
    ConclusionNatureE2EPollutionFinding[] = [];

  for (const snapshot of snapshots) {
    if (
      snapshot.conclusionNature
      !== snapshot.expectedConclusionNature
    ) {
      findings.push({
        caseId:
          snapshot.id,
        group:
          snapshot.group,
        conclusionNature:
          snapshot.conclusionNature,
        issue:
          "conclusionNatureMismatch",
        detail:
          `expected ${snapshot.expectedConclusionNature}, got ${snapshot.conclusionNature} (intent=${snapshot.intent})`,
        finalDecisionSentence:
          snapshot.finalDecisionSentence,
      });
    }

    if (
      snapshot.group
      !== "decision"
      && snapshot.finalDecisionIsExecutionStyle
    ) {
      findings.push({
        caseId:
          snapshot.id,
        group:
          snapshot.group,
        conclusionNature:
          snapshot.conclusionNature,
        issue:
          "executionStyleInNonDecision",
        detail:
          "non-decision nature produced execution-style finalDecisionSentence",
        finalDecisionSentence:
          snapshot.finalDecisionSentence,
      });
    }

    if (
      (
        snapshot.group
        === "existence"
        || snapshot.group
        === "prediction"
      )
      && snapshot.recommendedDirection.trim()
      !== ""
      && snapshot.recommendedDirection
      !== snapshot.prohibitedDirection
    ) {
      const hasDirectionPollution =
        /진행|보류|중단|기다|실행|유보/.test(
          snapshot.recommendedDirection,
        );

      if (
        hasDirectionPollution
      ) {
        findings.push({
          caseId:
            snapshot.id,
          group:
            snapshot.group,
          conclusionNature:
            snapshot.conclusionNature,
          issue:
            "directionInPredictionOrExistence",
          detail:
            `recommendedDirection contains direction judgement: ${snapshot.recommendedDirection}`,
          finalDecisionSentence:
            snapshot.finalDecisionSentence,
        });
      }
    }

    if (
      snapshot.group
      === "decision"
      && !snapshot.finalDecisionMatchesLegacyAssembly
    ) {
      findings.push({
        caseId:
          snapshot.id,
        group:
          snapshot.group,
        conclusionNature:
          snapshot.conclusionNature,
        issue:
          "decisionPathInInterpretation",
        detail:
          "decision question did not preserve legacy assembly (coreDecision + recommendedDirection)",
        finalDecisionSentence:
          snapshot.finalDecisionSentence,
      });
    }

    if (
      (
        snapshot.group
        === "interpretation"
        || snapshot.group
        === "recommendation"
        || snapshot.group
        === "warning"
        || snapshot.group
        === "existence"
      )
      && !snapshot.finalDecisionUsesCoreDecisionOnly
    ) {
      const issueByGroup: Record<
        Exclude<
          ConclusionNatureE2EQuestionGroup,
          "decision" | "prediction"
        >,
        ConclusionNatureE2EPollutionFinding["issue"]
      > = {
        interpretation:
          "decisionPathInInterpretation",
        recommendation:
          "decisionPathInRecommendation",
        warning:
          "decisionPathInWarning",
        existence:
          "decisionPathInExistence",
      };

      findings.push({
        caseId:
          snapshot.id,
        group:
          snapshot.group,
        conclusionNature:
          snapshot.conclusionNature,
        issue:
          issueByGroup[
            snapshot.group as keyof typeof issueByGroup
          ],
        detail:
          "finalDecisionSentence is not coreDecision-only; decision assembly path may have leaked",
        finalDecisionSentence:
          snapshot.finalDecisionSentence,
      });
    }
  }

  return findings;
}

function detectTemplating(
  snapshots:
    readonly ConclusionNatureE2ESnapshot[],
): ConclusionNatureE2ETemplatingFinding[] {
  const findings:
    ConclusionNatureE2ETemplatingFinding[] = [];

  const fallbackSnapshots =
    snapshots.filter(
      (snapshot) =>
        snapshot.finalDecisionIsFallbackTemplating,
    );

  const fallbackGroups =
    groupBySentence(
      fallbackSnapshots,
      (snapshot) =>
        snapshot.finalDecisionSentence,
    );

  for (const [
    ,
    cases,
  ] of fallbackGroups) {
    if (
      cases.length
      < 2
    ) {
      continue;
    }

    for (const snapshot of cases) {
      findings.push({
        caseId:
          snapshot.id,
        group:
          snapshot.group,
        pattern:
          "fallback templating",
        finalDecisionSentence:
          snapshot.finalDecisionSentence,
        coreDecision:
          snapshot.coreDecision,
        sharedWithCaseIds:
          cases
            .map(
              (item) =>
                item.id,
            )
            .filter(
              (id) =>
                id
                !== snapshot.id,
            ),
      });
    }
  }

  return findings;
}

function inferProblemLocations(
  snapshots:
    readonly ConclusionNatureE2ESnapshot[],
  pollutionFindings:
    readonly ConclusionNatureE2EPollutionFinding[],
  templatingFindings:
    readonly ConclusionNatureE2ETemplatingFinding[],
): ConclusionNatureE2EProblemLocationFinding[] {
  const findings:
    ConclusionNatureE2EProblemLocationFinding[] = [];

  const snapshotById =
    new Map(
      snapshots.map(
        (snapshot) =>
          [
            snapshot.id,
            snapshot,
          ] as const,
      ),
    );

  for (const pollution of pollutionFindings) {
    const snapshot =
      snapshotById.get(
        pollution.caseId,
      );

    if (
      !snapshot
    ) {
      continue;
    }

    const locations:
      ConclusionNatureE2EProblemLocation[] = [];

    if (
      pollution.issue
      === "conclusionNatureMismatch"
    ) {
      if (
        snapshot.intent
        !== snapshot.expectedConclusionNature
        && (
          snapshot.group
          === "existence"
          || snapshot.group
          === "prediction"
        )
      ) {
        locations.push(
          "QuestionReader",
        );
      } else {
        locations.push(
          "ConclusionNature",
        );
      }
    }

    if (
      pollution.issue
      === "executionStyleInNonDecision"
    ) {
      if (
        !snapshot.finalDecisionUsesCoreDecisionOnly
      ) {
        locations.push(
          "DecisionResultBuilder",
        );
      }

      locations.push(
        "CoreDecisionBuilder",
      );
    }

    if (
      pollution.issue
      === "directionInPredictionOrExistence"
    ) {
      locations.push(
        "DirectionJudgementBuilder",
      );
    }

    if (
      pollution.issue.startsWith(
        "decisionPathIn",
      )
    ) {
      locations.push(
        "DecisionResultBuilder",
      );
    }

    if (
      pollution.issue
      === "decisionPathInInterpretation"
      && snapshot.group
      === "decision"
    ) {
      locations.push(
        "DecisionResultBuilder",
      );
    }

    findings.push({
      caseId:
        pollution.caseId,
      locations: [
        ...new Set(locations),
      ],
      reason:
        pollution.detail,
    });
  }

  for (const templating of templatingFindings) {
    const snapshot =
      snapshotById.get(
        templating.caseId,
      );

    if (
      !snapshot
    ) {
      continue;
    }

    const locations:
      ConclusionNatureE2EProblemLocation[] = [
        "CoreDecisionBuilder",
      ];

    if (
      snapshot.verdict
      === "insufficientEvidence"
    ) {
      locations.push(
        "Evidence",
      );
    }

    findings.push({
      caseId:
        templating.caseId,
      locations: [
        ...new Set(locations),
      ],
      reason:
        `fallback templating shared with ${templating.sharedWithCaseIds.join(", ")}`,
    });
  }

  return findings;
}

function buildSummaryByGroup(
  snapshots:
    readonly ConclusionNatureE2ESnapshot[],
): ConclusionNatureE2ERegressionVerificationResult["summaryByGroup"] {
  const summary:
    ConclusionNatureE2ERegressionVerificationResult["summaryByGroup"] = {
      decision: {
        count: 0,
        conclusionNatureMatches: 0,
        uniqueCoreDecisions: 0,
        uniqueFinalDecisions: 0,
      },
      interpretation: {
        count: 0,
        conclusionNatureMatches: 0,
        uniqueCoreDecisions: 0,
        uniqueFinalDecisions: 0,
      },
      recommendation: {
        count: 0,
        conclusionNatureMatches: 0,
        uniqueCoreDecisions: 0,
        uniqueFinalDecisions: 0,
      },
      warning: {
        count: 0,
        conclusionNatureMatches: 0,
        uniqueCoreDecisions: 0,
        uniqueFinalDecisions: 0,
      },
      existence: {
        count: 0,
        conclusionNatureMatches: 0,
        uniqueCoreDecisions: 0,
        uniqueFinalDecisions: 0,
      },
      prediction: {
        count: 0,
        conclusionNatureMatches: 0,
        uniqueCoreDecisions: 0,
        uniqueFinalDecisions: 0,
      },
    };

  for (const group of Object.keys(
    summary,
  ) as ConclusionNatureE2EQuestionGroup[]) {
    const groupSnapshots =
      snapshots.filter(
        (item) =>
          item.group
          === group,
      );

    summary[group] = {
      count:
        groupSnapshots.length,
      conclusionNatureMatches:
        groupSnapshots.filter(
          (item) =>
            item.conclusionNature
            === item.expectedConclusionNature,
        ).length,
      uniqueCoreDecisions:
        new Set(
          groupSnapshots.map(
            (item) =>
              item.coreDecision,
          ),
        ).size,
      uniqueFinalDecisions:
        new Set(
          groupSnapshots.map(
            (item) =>
              item.finalDecisionSentence,
          ),
        ).size,
    };
  }

  return summary;
}

/**
 * ConclusionNature Stage 1~6 전체 E2E 회귀 진단.
 *
 * 판단 로직을 변경하지 않고 실제 QuestionReader + DecisionEngine 경로의
 * 출력을 수집·비교한다. passed는 진단 실행 성공 여부이며,
 * 발견된 정형화/오염 이슈는 duplicateFindings 등에 기록된다.
 */
export function verifyConclusionNatureE2ERegression():
  ConclusionNatureE2ERegressionVerificationResult {
  const snapshots =
    CONCLUSION_NATURE_E2E_QUESTIONS.map(
      buildSnapshot,
    );

  const duplicateFindings =
    detectDuplicates(
      snapshots,
    );

  const pollutionFindings =
    detectPollution(
      snapshots,
    );

  const templatingFindings =
    detectTemplating(
      snapshots,
    );

  const problemLocationFindings =
    inferProblemLocations(
      snapshots,
      pollutionFindings,
      templatingFindings,
    );

  return {
    snapshots,
    summaryByGroup:
      buildSummaryByGroup(
        snapshots,
      ),
    duplicateFindings,
    pollutionFindings,
    templatingFindings,
    problemLocationFindings,
    passed: true,
  };
}
