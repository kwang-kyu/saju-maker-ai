import {
  verifyAuthenticatedConsultingInitialFollowUpHttpE2E,
} from "./authenticatedConsultingInitialFollowUpHttpE2EVerification";
import {
  verifyAuthenticatedInitialConsultingClarification,
} from "./authenticatedInitialConsultingClarificationVerification";
import {
  verifyAuthenticatedSupabaseConsultingSessionRepositoryFactory,
} from "./authenticatedSupabaseConsultingSessionRepositoryFactoryVerification";
import {
  verifyConsultingInitialFollowUpAnswerE2E,
} from "./consultingInitialFollowUpAnswerE2EVerification";
import {
  BUSINESS_START_REGRESSION_CASE,
} from "./decision/regression/businessStartRegressionCase";
import {
  runDecisionEngineRegression,
} from "./decision/regression/decisionEngineRegressionRunner";
import {
  verifyConsultingAnswerQuality,
} from "./explanation/consultingAnswerQualityVerification";
import {
  verifyConsultingAnswerTopicCoverage,
} from "./explanation/consultingAnswerTopicCoverageVerification";
import {
  verifyConsultingLiveAnswerSemanticGateContract,
} from "./explanation/consultingLiveAnswerSemanticGateVerification";
import {
  verifySupabaseConsultingSessionOwnerResolver,
} from "./supabaseConsultingSessionOwnerResolverVerification";
import {
  verifySupabaseConsultingSessionPersistenceGateway,
} from "./supabaseConsultingSessionPersistenceGatewayVerification";
import {
  verifySupabaseConsultingSessionRepositoryFactory,
} from "./supabaseConsultingSessionRepositoryFactoryVerification";
import {
  verifyV3ConsultingRouteIntegration,
} from "./v3ConsultingRouteIntegrationVerification";
import {
  verifyV3ConsultingSessionTurnApi,
} from "./v3ConsultingSessionTurnApiVerification";
import {
  verifyV3InitialConsultingSessionApi,
} from "./v3InitialConsultingSessionApiVerification";

export const V3_NON_API_PRODUCTION_READINESS_EXPECTED_STAGE_COUNT =
  14;

export const V3_NON_API_PRODUCTION_READINESS_STAGE_NAMES = [
  "verifyV3ConsultingRouteIntegration",
  "verifyV3InitialConsultingSessionApi",
  "verifyV3ConsultingSessionTurnApi",
  "verifyAuthenticatedConsultingInitialFollowUpHttpE2E",
  "verifyAuthenticatedInitialConsultingClarification",
  "verifyConsultingInitialFollowUpAnswerE2E",
  "verifyAuthenticatedSupabaseConsultingSessionRepositoryFactory",
  "verifySupabaseConsultingSessionOwnerResolver",
  "verifySupabaseConsultingSessionPersistenceGateway",
  "verifySupabaseConsultingSessionRepositoryFactory",
  "runDecisionEngineRegression",
  "verifyConsultingAnswerQuality",
  "verifyConsultingAnswerTopicCoverage",
  "verifyConsultingLiveAnswerSemanticGateContract",
] as const;

export type V3NonApiProductionReadinessStageName =
  typeof V3_NON_API_PRODUCTION_READINESS_STAGE_NAMES[number];

export type V3NonApiProductionReadinessStageError = {
  name: string;

  message: string;
};

export type V3NonApiProductionReadinessStageResult = {
  name: string;

  passed: boolean;

  error:
    V3NonApiProductionReadinessStageError | null;
};

export type V3NonApiProductionReadinessNegativeChecks = {
  missingStageFails: boolean;

  duplicateStageFails: boolean;

  unknownStageFails: boolean;

  failedStageFails: boolean;

  thrownStageFails: boolean;

  exactExpectedStagesPass: boolean;
};

export type V3NonApiProductionReadinessStageEvaluation = {
  expectedStageCount:
    typeof V3_NON_API_PRODUCTION_READINESS_EXPECTED_STAGE_COUNT;

  actualStageCount: number;

  stageNames:
    readonly string[];

  stages:
    readonly V3NonApiProductionReadinessStageResult[];

  allExpectedStagesExist: boolean;

  noDuplicateStages: boolean;

  noUnknownStages: boolean;

  allStagesPassed: boolean;

  passed: boolean;
};

export type V3NonApiProductionReadinessVerificationResult =
  V3NonApiProductionReadinessStageEvaluation & {
    negativeChecks:
      V3NonApiProductionReadinessNegativeChecks;

    externalCallsExpected: 0;

    limitations:
      readonly string[];
  };

type V3NonApiProductionReadinessStageRunner = {
  name:
    V3NonApiProductionReadinessStageName;

  run: () => Promise<unknown>;
};

const V3_NON_API_PRODUCTION_READINESS_LIMITATIONS = [
  "이 종합 검증은 mock/contract 기반이며 실제 OpenAI, Supabase, 배포 HTTP를 호출하지 않는다.",
  "코드만으로 외부 호출 0회를 완전히 증명하지는 않는다.",
] as const;

const UNKNOWN_NEGATIVE_CONTROL_STAGE_NAME =
  "verifyUnknownNonApiProductionReadinessStage";

const THROWN_NEGATIVE_CONTROL_ERROR: V3NonApiProductionReadinessStageError = {
  name: "Error",

  message:
    "verification threw",
};

const V3_NON_API_PRODUCTION_READINESS_STAGE_RUNNERS: readonly V3NonApiProductionReadinessStageRunner[] = [
  {
    name:
      "verifyV3ConsultingRouteIntegration",

    run:
      () =>
        verifyV3ConsultingRouteIntegration(),
  },
  {
    name:
      "verifyV3InitialConsultingSessionApi",

    run:
      () =>
        verifyV3InitialConsultingSessionApi(),
  },
  {
    name:
      "verifyV3ConsultingSessionTurnApi",

    run:
      () =>
        verifyV3ConsultingSessionTurnApi(),
  },
  {
    name:
      "verifyAuthenticatedConsultingInitialFollowUpHttpE2E",

    run:
      () =>
        verifyAuthenticatedConsultingInitialFollowUpHttpE2E(),
  },
  {
    name:
      "verifyAuthenticatedInitialConsultingClarification",

    run:
      () =>
        verifyAuthenticatedInitialConsultingClarification(),
  },
  {
    name:
      "verifyConsultingInitialFollowUpAnswerE2E",

    run:
      () =>
        verifyConsultingInitialFollowUpAnswerE2E(),
  },
  {
    name:
      "verifyAuthenticatedSupabaseConsultingSessionRepositoryFactory",

    run:
      () =>
        verifyAuthenticatedSupabaseConsultingSessionRepositoryFactory(),
  },
  {
    name:
      "verifySupabaseConsultingSessionOwnerResolver",

    run:
      () =>
        verifySupabaseConsultingSessionOwnerResolver(),
  },
  {
    name:
      "verifySupabaseConsultingSessionPersistenceGateway",

    run:
      () =>
        verifySupabaseConsultingSessionPersistenceGateway(),
  },
  {
    name:
      "verifySupabaseConsultingSessionRepositoryFactory",

    run:
      async () =>
        verifySupabaseConsultingSessionRepositoryFactory(),
  },
  {
    name:
      "runDecisionEngineRegression",

    run:
      async () =>
        runDecisionEngineRegression(
          BUSINESS_START_REGRESSION_CASE,
        ),
  },
  {
    name:
      "verifyConsultingAnswerQuality",

    run:
      async () =>
        verifyConsultingAnswerQuality(),
  },
  {
    name:
      "verifyConsultingAnswerTopicCoverage",

    run:
      async () =>
        verifyConsultingAnswerTopicCoverage(),
  },
  {
    name:
      "verifyConsultingLiveAnswerSemanticGateContract",

    run:
      async () =>
        verifyConsultingLiveAnswerSemanticGateContract(),
  },
];

export function toSafeVerificationError(
  error: unknown,
): V3NonApiProductionReadinessStageError {
  if (
    error instanceof Error
  ) {
    return {
      name:
        error.name.length > 0
          ? error.name
          : "Error",

      message:
        error.message,
    };
  }

  return {
    name:
      "Error",

    message:
      "Unknown verification error",
  };
}

function isPassedVerificationResult(
  result: unknown,
): boolean {
  if (
    typeof result !== "object"
    || result === null
    || !("passed" in result)
  ) {
    return false;
  }

  return result.passed === true;
}

function everyCheckPassed(
  checks: Record<string, boolean>,
): boolean {
  return Object
    .values(
      checks,
    )
    .every(
      (value) =>
        value === true,
    );
}

function listStageNames(
  stages: readonly V3NonApiProductionReadinessStageResult[],
): string[] {
  return stages.map(
    (stage) =>
      stage.name,
  );
}

function stageRunnerNamesMatchContract(
  runnerNames: readonly string[],
): boolean {
  return (
    runnerNames.length
    === V3_NON_API_PRODUCTION_READINESS_STAGE_NAMES.length
    && runnerNames.every(
      (name, index) =>
        name
        === V3_NON_API_PRODUCTION_READINESS_STAGE_NAMES[index],
    )
  );
}

export function evaluateNonApiProductionReadinessStages(
  stages: readonly V3NonApiProductionReadinessStageResult[],
): V3NonApiProductionReadinessStageEvaluation {
  const expectedStageNames = [
    ...V3_NON_API_PRODUCTION_READINESS_STAGE_NAMES,
  ];

  const actualStageNames =
    listStageNames(
      stages,
    );

  const actualStageCount =
    stages.length;

  const expectedNameSet =
    new Set<string>(
      expectedStageNames,
    );

  const allExpectedStagesExist =
    expectedStageNames.every(
      (name) =>
        actualStageNames.includes(
          name,
        ),
    )
    && expectedStageNames.length
    === V3_NON_API_PRODUCTION_READINESS_EXPECTED_STAGE_COUNT;

  const noDuplicateStages =
    new Set(
      actualStageNames,
    ).size
    === actualStageNames.length;

  const noUnknownStages =
    actualStageNames.every(
      (name) =>
        expectedNameSet.has(
          name,
        ),
    );

  const allStagesPassed =
    stages.length > 0
    && stages.every(
      (stage) =>
        stage.passed === true
        && stage.error === null,
    );

  const passed =
    actualStageCount
    === V3_NON_API_PRODUCTION_READINESS_EXPECTED_STAGE_COUNT
    && allExpectedStagesExist
    && noDuplicateStages
    && noUnknownStages
    && allStagesPassed;

  return {
    expectedStageCount:
      V3_NON_API_PRODUCTION_READINESS_EXPECTED_STAGE_COUNT,

    actualStageCount,

    stageNames:
      expectedStageNames,

    stages,

    allExpectedStagesExist,

    noDuplicateStages,

    noUnknownStages,

    allStagesPassed,

    passed,
  };
}

function buildPassingContractStages():
  V3NonApiProductionReadinessStageResult[] {
  return V3_NON_API_PRODUCTION_READINESS_STAGE_NAMES.map(
    (name) => ({
      name,

      passed:
        true,

      error:
        null,
    }),
  );
}

function evaluateNegativeChecks():
  V3NonApiProductionReadinessNegativeChecks {
  const exactPassingStages =
    buildPassingContractStages();

  const missingStage =
    exactPassingStages.slice(
      0,
      -1,
    );

  const duplicateStage = [
    ...exactPassingStages,
    exactPassingStages[0] as V3NonApiProductionReadinessStageResult,
  ];

  const unknownStage = [
    ...exactPassingStages,
    {
      name:
        UNKNOWN_NEGATIVE_CONTROL_STAGE_NAME,

      passed:
        true,

      error:
        null,
    },
  ];

  const failedStage =
    exactPassingStages.map(
      (stage, index) =>
        index === 0
          ? {
              ...stage,
              passed:
                false,
            }
          : stage,
    );

  const thrownStage =
    exactPassingStages.map(
      (stage, index) =>
        index === 0
          ? {
              ...stage,
              passed:
                false,
              error:
                THROWN_NEGATIVE_CONTROL_ERROR,
            }
          : stage,
    );

  return {
    missingStageFails:
      evaluateNonApiProductionReadinessStages(
        missingStage,
      ).passed === false,

    duplicateStageFails:
      evaluateNonApiProductionReadinessStages(
        duplicateStage,
      ).passed === false,

    unknownStageFails:
      evaluateNonApiProductionReadinessStages(
        unknownStage,
      ).passed === false,

    failedStageFails:
      evaluateNonApiProductionReadinessStages(
        failedStage,
      ).passed === false,

    thrownStageFails:
      evaluateNonApiProductionReadinessStages(
        thrownStage,
      ).passed === false,

    exactExpectedStagesPass:
      evaluateNonApiProductionReadinessStages(
        exactPassingStages,
      ).passed === true,
  };
}

async function runNamedStage(
  runner: V3NonApiProductionReadinessStageRunner,
): Promise<V3NonApiProductionReadinessStageResult> {
  try {
    const result =
      await runner.run();

    return {
      name:
        runner.name,

      passed:
        isPassedVerificationResult(
          result,
        ),

      error:
        null,
    };
  } catch (
    error
  ) {
    return {
      name:
        runner.name,

      passed:
        false,

      error:
        toSafeVerificationError(
          error,
        ),
    };
  }
}

async function runNonApiProductionReadinessStages():
  Promise<
    V3NonApiProductionReadinessStageResult[]
  > {
  const runnerNames =
    V3_NON_API_PRODUCTION_READINESS_STAGE_RUNNERS.map(
      (runner) =>
        runner.name,
    );

  const stages:
    V3NonApiProductionReadinessStageResult[] =
      [];

  if (
    !stageRunnerNamesMatchContract(
      runnerNames,
    )
  ) {
    stages.push(
      {
        name:
          "stageRunnerContract",

        passed:
          false,

        error: {
          name:
            "StageContractError",

          message:
            "Stage runner list does not match the expected non-API stage names.",
        },
      },
    );
  }

  for (
    const runner of V3_NON_API_PRODUCTION_READINESS_STAGE_RUNNERS
  ) {
    stages.push(
      await runNamedStage(
        runner,
      ),
    );
  }

  return stages;
}

export async function verifyV3NonApiProductionReadiness():
  Promise<
    V3NonApiProductionReadinessVerificationResult
  > {
  const stages =
    await runNonApiProductionReadinessStages();

  const evaluation =
    evaluateNonApiProductionReadinessStages(
      stages,
    );

  const negativeChecks =
    evaluateNegativeChecks();

  const passed =
    evaluation.passed
    && everyCheckPassed(
      negativeChecks,
    );

  return {
    expectedStageCount:
      evaluation.expectedStageCount,

    actualStageCount:
      evaluation.actualStageCount,

    stageNames:
      evaluation.stageNames,

    stages:
      evaluation.stages,

    allExpectedStagesExist:
      evaluation.allExpectedStagesExist,

    noDuplicateStages:
      evaluation.noDuplicateStages,

    noUnknownStages:
      evaluation.noUnknownStages,

    allStagesPassed:
      evaluation.allStagesPassed,

    negativeChecks,

    externalCallsExpected:
      0,

    passed,

    limitations:
      V3_NON_API_PRODUCTION_READINESS_LIMITATIONS,
  };
}
