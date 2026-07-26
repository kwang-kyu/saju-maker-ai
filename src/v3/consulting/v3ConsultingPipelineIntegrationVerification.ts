import {
    buildV3ConsultingRequest,
  } from "../../../api/v3Consulting";

  import {
    buildHumanDestinyContextPipeline,
  } from "../builders/humanDestinyContextPipelineBuilder";

  import {
    readHumanLifeContext,
  } from "../readers/humanLifeContextReader";

  import {
    runConsulting,
  } from "./consultingRunner";

  import {
    buildConsultingOpenAIRequest,
    type ConsultingOpenAIRequest,
  } from "./openai/consultingOpenAIAdapter";

  import type {
    V3ConsultingRequest,
  } from "./v3ConsultingRequest";

  export type V3ConsultingPipelineIntegrationVerificationResult = {
    request:
      ConsultingOpenAIRequest;

    checks: {
      sourceRequestBuildsSuccessfully:
        boolean;

      solarDateIsCalculatedInternally:
        boolean;

      humanContextIsBuiltFromSajuFacts:
        boolean;

      lifeContextUsesCalculatedSolarDate:
        boolean;

      referenceDateProducesExpectedAge:
        boolean;

      questionMeaningIsDelivered:
        boolean;

      questionRealityEvidenceIsDelivered:
        boolean;

      readerEvidenceIsDelivered:
        boolean;

      decisionVerdictIsDelivered:
        boolean;

      finalDecisionIsDeliveredOnce:
        boolean;

      systemPromptLocksEngineVerdict:
        boolean;

      systemPromptForbidsNewSajuJudgement:
        boolean;

      apiRequestMatchesCanonicalPipeline:
        boolean;

      identicalInputIsDeterministic:
        boolean;
    };

    passed:
      boolean;
  };

  function countOccurrences(
    value: string,
    target: string,
  ): number {
    return value
      .split(target)
      .length - 1;
  }

  function createSourceRequest():
    V3ConsultingRequest {
    return {
      sajuInput: {
        name:
          "김천운",

        birthDate:
          "1984-03-15",

        birthTime:
          "14:30",

        gender:
          "male",

        calendarType:
          "solar",

        referenceDate:
          "2026-07-26",

        luckStartMethod:
          "minuteBased",
      },

      humanLifeContextInput: {
        maritalStatus:
          "married",

        hasChildren:
          true,

        occupationStatus:
          "employed",

        hasActiveBusiness:
          false,

        financialResponsibility:
          "high",
      },

      question:
        "대출 부담이 있는데 상가를 매수해도 될까요?",
    };
  }

  function requestsAreEqual(
    left:
      ConsultingOpenAIRequest,
    right:
      ConsultingOpenAIRequest,
  ): boolean {
    return (
      left.model === right.model
      && left.systemPrompt
        === right.systemPrompt
      && left.userPrompt
        === right.userPrompt
    );
  }

  export async function verifyV3ConsultingPipelineIntegration():
    Promise<
      V3ConsultingPipelineIntegrationVerificationResult
    > {
    const sourceRequest =
      createSourceRequest();

    const pipeline =
      buildHumanDestinyContextPipeline(
        sourceRequest.sajuInput,
      );

    const calculatedSolarDate =
      pipeline
        .sajuFactsPipeline
        .calculatedSaju
        .solarDateIso;

    const lifeContext =
      readHumanLifeContext({
        ...sourceRequest
          .humanLifeContextInput,

        birthDate:
          calculatedSolarDate,

        referenceDate:
          new Date(
            2026,
            6,
            26,
          ),
      });

    const canonicalPrompt =
      runConsulting({
        humanContext:
          pipeline.humanContext,

        lifeContext,

        question:
          sourceRequest.question,
      });

    const canonicalRequest =
      buildConsultingOpenAIRequest(
        canonicalPrompt,
      );

    const request =
      await buildV3ConsultingRequest(
        sourceRequest,
      );

    const repeatedRequest =
      await buildV3ConsultingRequest(
        sourceRequest,
      );

    const checks = {
      sourceRequestBuildsSuccessfully:
        Boolean(
          request.systemPrompt
          && request.userPrompt,
        ),

      solarDateIsCalculatedInternally:
        calculatedSolarDate
          === "1984-03-15",

      humanContextIsBuiltFromSajuFacts:
        Boolean(
          pipeline.humanContext
          && pipeline.evidenceBundle
          && pipeline.sajuFactsPipeline
            .facts,
        ),

      lifeContextUsesCalculatedSolarDate:
        lifeContext.age !== null,

      referenceDateProducesExpectedAge:
        lifeContext.age === 42
        && lifeContext.ageGroup
          === "forties",

      questionMeaningIsDelivered:
        request.userPrompt
          .includes(
            "자금이나 자산을 투입할 것인가",
          ),

      questionRealityEvidenceIsDelivered:
        request.userPrompt
          .includes(
            "대출·채무 또는 상환 부담",
          )
        && request.userPrompt
          .includes(
            "질문에서 확인된 표현: 대출",
          ),

      readerEvidenceIsDelivered:
        request.userPrompt
          .includes(
            "안정형",
          )
        && request.userPrompt
          .includes(
            "독립형",
          )
        && request.userPrompt
          .includes(
            "재물 보존력",
          ),

      decisionVerdictIsDelivered:
        request.userPrompt
          .includes(
            "판단 결과:",
          ),

      finalDecisionIsDeliveredOnce:
        countOccurrences(
          request.userPrompt,
          "최종 판단",
        ) === 1,

      systemPromptLocksEngineVerdict:
        request.systemPrompt
          .includes(
            "엔진의 verdict를 변경하지 않는다.",
          ),

      systemPromptForbidsNewSajuJudgement:
        request.systemPrompt
          .includes(
            "새로운 사주 판단을 만들지 않는다.",
          ),

      apiRequestMatchesCanonicalPipeline:
        requestsAreEqual(
          request,
          canonicalRequest,
        ),

      identicalInputIsDeterministic:
        requestsAreEqual(
          request,
          repeatedRequest,
        ),
    };

    return {
      request,

      checks,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
