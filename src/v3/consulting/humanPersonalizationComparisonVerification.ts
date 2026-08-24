import {
    buildV3ConsultingRequest,
  } from "../../../api/v3Consulting.js";

  import {
    buildHumanDestinyContextPipeline,
  } from "../builders/humanDestinyContextPipelineBuilder.js";

  import type {
    V3ConsultingRequest,
  } from "./v3ConsultingRequest.js";

  export type HumanPersonalizationComparisonVerificationResult = {
    actual: {
      sameName:
        boolean;

      sameGender:
        boolean;

      sameLifeContext:
        boolean;

      sameQuestion:
        boolean;

      firstCalculatedSolarDate:
        string;

      secondCalculatedSolarDate:
        string;

      sajuFactsAreDifferent:
        boolean;

      readerEvidenceIsDifferent:
        boolean;

      masterProfilesAreDifferent:
        boolean;

      humanSummariesAreDifferent:
        boolean;

      identityExplanationsAreDifferent:
        boolean;

      currentPhasesAreDifferent:
        boolean;

      systemPromptsAreEqual:
        boolean;

      userPromptsAreDifferent:
        boolean;

      firstIdentityIsDelivered:
        boolean;

      secondIdentityIsDelivered:
        boolean;
    };

    diagnostics: {
      firstIdentitySummary:
        string;

      secondIdentitySummary:
        string;

      firstLifeDriver:
        string;

      secondLifeDriver:
        string;

      firstRepeatedPattern:
        string;

      secondRepeatedPattern:
        string;

      firstCurrentPhase:
        string;

      secondCurrentPhase:
        string;
    };

    passed:
      boolean;
  };

  function createSharedLifeContext():
    V3ConsultingRequest["humanLifeContextInput"] {
    return {
      maritalStatus:
        "married",

      hasChildren:
        true,

      occupationStatus:
        "selfEmployed",

      hasActiveBusiness:
        true,

      financialResponsibility:
        "high",
    };
  }

  function createFirstRequest():
    V3ConsultingRequest {
    return {
      sajuInput: {
        name:
          "개인화 비교 대상",

        birthDate:
          "1984-03-15",

        birthTime:
          "14:30",

        gender:
          "male",

        calendarType:
          "solar",

        referenceDate:
          "2026-07-27",

        luckStartMethod:
          "minuteBased",
      },

      humanLifeContextInput:
        createSharedLifeContext(),

      question:
        "새로운 사업으로 유통업을 시작하려는데 어떨까요?",
    };
  }

  function createSecondRequest():
    V3ConsultingRequest {
    return {
      sajuInput: {
        name:
          "개인화 비교 대상",

        birthDate:
          "1975-07-10",

        birthTime:
          "16:02",

        gender:
          "male",

        calendarType:
          "lunar",

        referenceDate:
          "2026-07-27",

        luckStartMethod:
          "minuteBased",
      },

      humanLifeContextInput:
        createSharedLifeContext(),

      question:
        "새로운 사업으로 유통업을 시작하려는데 어떨까요?",
    };
  }

  function valuesAreDifferent(
    first:
      unknown,
    second:
      unknown,
  ): boolean {
    return (
      JSON.stringify(first)
      !== JSON.stringify(second)
    );
  }

  export async function verifyHumanPersonalizationComparison():
    Promise<
      HumanPersonalizationComparisonVerificationResult
    > {
    const firstSourceRequest =
      createFirstRequest();

    const secondSourceRequest =
      createSecondRequest();

    const firstPipeline =
      buildHumanDestinyContextPipeline(
        firstSourceRequest.sajuInput,
      );

    const secondPipeline =
      buildHumanDestinyContextPipeline(
        secondSourceRequest.sajuInput,
      );

    const [
      firstOpenAIRequest,
      secondOpenAIRequest,
    ] =
      await Promise.all([
        buildV3ConsultingRequest(
          firstSourceRequest,
        ),

        buildV3ConsultingRequest(
          secondSourceRequest,
        ),
      ]);

    const firstIdentity =
      firstPipeline
        .humanContext
        .identity;

    const secondIdentity =
      secondPipeline
        .humanContext
        .identity;

    const firstIdentitySummary =
      firstIdentity
        .explanation
        .identitySummary;

    const secondIdentitySummary =
      secondIdentity
        .explanation
        .identitySummary;

        const firstDeliveredIdentity =
        firstIdentity
          .humanSummary
          .coreIdentity
        || firstIdentitySummary;

      const secondDeliveredIdentity =
        secondIdentity
          .humanSummary
          .coreIdentity
        || secondIdentitySummary;

    const actual = {
      sameName:
        firstSourceRequest.sajuInput.name
        === secondSourceRequest.sajuInput.name,

      sameGender:
        firstSourceRequest.sajuInput.gender
        === secondSourceRequest.sajuInput.gender,

      sameLifeContext:
        JSON.stringify(
          firstSourceRequest
            .humanLifeContextInput,
        )
        === JSON.stringify(
          secondSourceRequest
            .humanLifeContextInput,
        ),

      sameQuestion:
        firstSourceRequest.question
        === secondSourceRequest.question,

      firstCalculatedSolarDate:
        firstPipeline
          .sajuFactsPipeline
          .calculatedSaju
          .solarDateIso,

      secondCalculatedSolarDate:
        secondPipeline
          .sajuFactsPipeline
          .calculatedSaju
          .solarDateIso,

      sajuFactsAreDifferent:
        valuesAreDifferent(
          firstPipeline
            .sajuFactsPipeline
            .facts,
          secondPipeline
            .sajuFactsPipeline
            .facts,
        ),

      readerEvidenceIsDifferent:
        valuesAreDifferent(
          firstPipeline
            .evidenceBundle
            .masterReaderInput,
          secondPipeline
            .evidenceBundle
            .masterReaderInput,
        ),

      masterProfilesAreDifferent:
        valuesAreDifferent(
          firstIdentity.profile,
          secondIdentity.profile,
        ),

      humanSummariesAreDifferent:
        valuesAreDifferent(
          firstIdentity.humanSummary,
          secondIdentity.humanSummary,
        ),

      identityExplanationsAreDifferent:
        firstIdentitySummary
        !== secondIdentitySummary,

      currentPhasesAreDifferent:
        valuesAreDifferent(
          firstPipeline
            .humanContext
            .currentPhase,
          secondPipeline
            .humanContext
            .currentPhase,
        ),

      systemPromptsAreEqual:
        firstOpenAIRequest.systemPrompt
        === secondOpenAIRequest.systemPrompt,

      userPromptsAreDifferent:
        firstOpenAIRequest.userPrompt
        !== secondOpenAIRequest.userPrompt,

        firstIdentityIsDelivered:
        firstOpenAIRequest
          .userPrompt
          .includes(
            firstDeliveredIdentity,
          ),

      secondIdentityIsDelivered:
        secondOpenAIRequest
          .userPrompt
          .includes(
            secondDeliveredIdentity,
          ),
    };

    const checks = {
      sameName:
        actual.sameName,

      sameGender:
        actual.sameGender,

      sameLifeContext:
        actual.sameLifeContext,

      sameQuestion:
        actual.sameQuestion,

      calculatedDatesAreExpected:
        actual.firstCalculatedSolarDate
          === "1984-03-15"
        && actual.secondCalculatedSolarDate
          === "1975-08-16",

      sajuFactsAreDifferent:
        actual.sajuFactsAreDifferent,

      readerEvidenceIsDifferent:
        actual.readerEvidenceIsDifferent,

      masterProfilesAreDifferent:
        actual.masterProfilesAreDifferent,

      humanSummariesAreDifferent:
        actual.humanSummariesAreDifferent,

      identityExplanationsAreDifferent:
        actual.identityExplanationsAreDifferent,

      systemPromptsAreEqual:
        actual.systemPromptsAreEqual,

      userPromptsAreDifferent:
        actual.userPromptsAreDifferent,

      firstIdentityIsDelivered:
        actual.firstIdentityIsDelivered,

      secondIdentityIsDelivered:
        actual.secondIdentityIsDelivered,
    };

    return {
      actual,

      diagnostics: {
        firstIdentitySummary,

        secondIdentitySummary,

        firstLifeDriver:
          firstIdentity
            .profile
            .lifeDriver
            .primary
            .driver,

        secondLifeDriver:
          secondIdentity
            .profile
            .lifeDriver
            .primary
            .driver,

        firstRepeatedPattern:
          firstIdentity
            .profile
            .repeatedPattern
            .primary
            .pattern,

        secondRepeatedPattern:
          secondIdentity
            .profile
            .repeatedPattern
            .primary
            .pattern,

        firstCurrentPhase:
          firstPipeline
            .humanContext
            .currentPhase
            .phase,

        secondCurrentPhase:
          secondPipeline
            .humanContext
            .currentPhase
            .phase,
      },

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }