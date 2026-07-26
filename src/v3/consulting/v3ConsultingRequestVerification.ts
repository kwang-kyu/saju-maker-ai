import {
    isV3ConsultingRequest,
  } from "./v3ConsultingRequest";

  export type V3ConsultingRequestVerificationResult = {
    validRequestIsAccepted:
      boolean;

    validOptionalRealityIsAccepted:
      boolean;

    nonObjectRequestIsRejected:
      boolean;

    missingMasterReaderInputIsRejected:
      boolean;

    arrayMasterReaderInputIsRejected:
      boolean;

    missingLifePhaseInputIsRejected:
      boolean;

    missingHumanLifeContextIsRejected:
      boolean;

    missingBirthDateIsRejected:
      boolean;

    invalidBirthDateTypeIsRejected:
      boolean;

    invalidMaritalStatusIsRejected:
      boolean;

    invalidOccupationStatusIsRejected:
      boolean;

    invalidFinancialResponsibilityIsRejected:
      boolean;

    invalidChildrenTypeIsRejected:
      boolean;

    invalidBusinessTypeIsRejected:
      boolean;

    transportedReferenceDateIsRejected:
      boolean;

    emptyQuestionIsRejected:
      boolean;

    whitespaceQuestionIsRejected:
      boolean;

    passed:
      boolean;
  };

  function createValidRequest() {
    return {
      masterReaderInput: {},

      lifePhaseInput: {},

      humanLifeContextInput: {
        birthDate:
          "1984-03-15",

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

  export function verifyV3ConsultingRequest():
    V3ConsultingRequestVerificationResult {
    const validRequest =
      createValidRequest();

    const validRequestIsAccepted =
      isV3ConsultingRequest(
        validRequest,
      );

    const validOptionalRealityIsAccepted =
      isV3ConsultingRequest({
        masterReaderInput: {},

        lifePhaseInput: {},

        humanLifeContextInput: {
          birthDate: null,
        },

        question:
          "현재 이직해도 될까요?",
      });

    const nonObjectRequestIsRejected =
      !isV3ConsultingRequest(
        null,
      );

    const missingMasterReaderInputIsRejected =
      !isV3ConsultingRequest({
        lifePhaseInput:
          validRequest.lifePhaseInput,

        humanLifeContextInput:
          validRequest.humanLifeContextInput,

        question:
          validRequest.question,
      });

    const arrayMasterReaderInputIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        masterReaderInput: [],
      });

    const missingLifePhaseInputIsRejected =
      !isV3ConsultingRequest({
        masterReaderInput:
          validRequest.masterReaderInput,

        humanLifeContextInput:
          validRequest.humanLifeContextInput,

        question:
          validRequest.question,
      });

    const missingHumanLifeContextIsRejected =
      !isV3ConsultingRequest({
        masterReaderInput:
          validRequest.masterReaderInput,

        lifePhaseInput:
          validRequest.lifePhaseInput,

        question:
          validRequest.question,
      });

    const missingBirthDateIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        humanLifeContextInput: {
          maritalStatus:
            "married",
        },
      });

    const invalidBirthDateTypeIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        humanLifeContextInput: {
          ...validRequest
            .humanLifeContextInput,

          birthDate: 19840315,
        },
      });

    const invalidMaritalStatusIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        humanLifeContextInput: {
          ...validRequest
            .humanLifeContextInput,

          maritalStatus:
            "invalid",
        },
      });

    const invalidOccupationStatusIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        humanLifeContextInput: {
          ...validRequest
            .humanLifeContextInput,

          occupationStatus:
            "invalid",
        },
      });

    const invalidFinancialResponsibilityIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        humanLifeContextInput: {
          ...validRequest
            .humanLifeContextInput,

          financialResponsibility:
            "invalid",
        },
      });

    const invalidChildrenTypeIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        humanLifeContextInput: {
          ...validRequest
            .humanLifeContextInput,

          hasChildren:
            "yes",
        },
      });

    const invalidBusinessTypeIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        humanLifeContextInput: {
          ...validRequest
            .humanLifeContextInput,

          hasActiveBusiness:
            1,
        },
      });

    const transportedReferenceDateIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        humanLifeContextInput: {
          ...validRequest
            .humanLifeContextInput,

          referenceDate:
            "2026-07-26",
        },
      });

    const emptyQuestionIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        question: "",
      });

    const whitespaceQuestionIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        question: "   ",
      });

    return {
      validRequestIsAccepted,

      validOptionalRealityIsAccepted,

      nonObjectRequestIsRejected,

      missingMasterReaderInputIsRejected,

      arrayMasterReaderInputIsRejected,

      missingLifePhaseInputIsRejected,

      missingHumanLifeContextIsRejected,

      missingBirthDateIsRejected,

      invalidBirthDateTypeIsRejected,

      invalidMaritalStatusIsRejected,

      invalidOccupationStatusIsRejected,

      invalidFinancialResponsibilityIsRejected,

      invalidChildrenTypeIsRejected,

      invalidBusinessTypeIsRejected,

      transportedReferenceDateIsRejected,

      emptyQuestionIsRejected,

      whitespaceQuestionIsRejected,

      passed:
        validRequestIsAccepted
        && validOptionalRealityIsAccepted
        && nonObjectRequestIsRejected
        && missingMasterReaderInputIsRejected
        && arrayMasterReaderInputIsRejected
        && missingLifePhaseInputIsRejected
        && missingHumanLifeContextIsRejected
        && missingBirthDateIsRejected
        && invalidBirthDateTypeIsRejected
        && invalidMaritalStatusIsRejected
        && invalidOccupationStatusIsRejected
        && invalidFinancialResponsibilityIsRejected
        && invalidChildrenTypeIsRejected
        && invalidBusinessTypeIsRejected
        && transportedReferenceDateIsRejected
        && emptyQuestionIsRejected
        && whitespaceQuestionIsRejected,
    };
  }