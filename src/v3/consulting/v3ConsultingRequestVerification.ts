import {
    isV3ConsultingRequest,
  } from "./v3ConsultingRequest";

  export type V3ConsultingRequestVerificationResult = {
    validSolarRequestIsAccepted:
      boolean;

    validLunarRequestIsAccepted:
      boolean;

    validOptionalRealityIsAccepted:
      boolean;

    nonObjectRequestIsRejected:
      boolean;

    missingSajuInputIsRejected:
      boolean;

    arraySajuInputIsRejected:
      boolean;

    missingHumanLifeContextIsRejected:
      boolean;

    missingQuestionIsRejected:
      boolean;

    transportedMasterReaderInputIsRejected:
      boolean;

    transportedLifePhaseInputIsRejected:
      boolean;

    unknownRootFieldIsRejected:
      boolean;

    missingNameIsRejected:
      boolean;

    emptyNameIsRejected:
      boolean;

    missingBirthDateIsRejected:
      boolean;

    invalidSolarBirthDateIsRejected:
      boolean;

    invalidLunarBirthDateIsRejected:
      boolean;

    futureSolarBirthDateIsRejected:
      boolean;

    invalidBirthTimeIsRejected:
      boolean;

    invalidGenderIsRejected:
      boolean;

    invalidCalendarTypeIsRejected:
      boolean;

    invalidReferenceDateIsRejected:
      boolean;

    invalidLuckStartMethodIsRejected:
      boolean;

    calculatedSajuResultInjectionIsRejected:
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

    transportedBirthDateIsRejected:
      boolean;

    transportedReferenceDateIsRejected:
      boolean;

    unknownHumanContextFieldIsRejected:
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

  export function verifyV3ConsultingRequest():
    V3ConsultingRequestVerificationResult {
    const validRequest =
      createValidRequest();

    const validSolarRequestIsAccepted =
      isV3ConsultingRequest(
        validRequest,
      );

    const validLunarRequestIsAccepted =
      isV3ConsultingRequest({
        ...validRequest,

        sajuInput: {
          ...validRequest.sajuInput,

          birthDate:
            "1984-02-13",

          calendarType:
            "lunar",
        },
      });

    const validOptionalRealityIsAccepted =
      isV3ConsultingRequest({
        sajuInput: {
          name:
            "이천운",

          birthDate:
            "1991-11-08",

          birthTime:
            "09:05:30",

          gender:
            "female",

          calendarType:
            "solar",

          referenceDate:
            "2026-07-26",

          luckStartMethod:
            "minuteBased",
        },

        humanLifeContextInput: {},

        question:
          "현재 이직해도 될까요?",
      });

    const nonObjectRequestIsRejected =
      !isV3ConsultingRequest(
        null,
      );

    const missingSajuInputIsRejected =
      !isV3ConsultingRequest({
        humanLifeContextInput:
          validRequest.humanLifeContextInput,

        question:
          validRequest.question,
      });

    const arraySajuInputIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        sajuInput: [],
      });

    const missingHumanLifeContextIsRejected =
      !isV3ConsultingRequest({
        sajuInput:
          validRequest.sajuInput,

        question:
          validRequest.question,
      });

    const missingQuestionIsRejected =
      !isV3ConsultingRequest({
        sajuInput:
          validRequest.sajuInput,

        humanLifeContextInput:
          validRequest.humanLifeContextInput,
      });

    const transportedMasterReaderInputIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        masterReaderInput: {},
      });

    const transportedLifePhaseInputIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        lifePhaseInput: {},
      });

    const unknownRootFieldIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        unknown:
          "외부 주입 금지",
      });

    const missingNameIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        sajuInput: {
          birthDate:
            validRequest.sajuInput.birthDate,

          birthTime:
            validRequest.sajuInput.birthTime,

          gender:
            validRequest.sajuInput.gender,

          calendarType:
            validRequest.sajuInput.calendarType,

          referenceDate:
            validRequest.sajuInput.referenceDate,

          luckStartMethod:
            validRequest.sajuInput.luckStartMethod,
        },
      });

    const emptyNameIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        sajuInput: {
          ...validRequest.sajuInput,

          name: "   ",
        },
      });

    const missingBirthDateIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        sajuInput: {
          name:
            validRequest.sajuInput.name,

          birthTime:
            validRequest.sajuInput.birthTime,

          gender:
            validRequest.sajuInput.gender,

          calendarType:
            validRequest.sajuInput.calendarType,

          referenceDate:
            validRequest.sajuInput.referenceDate,

          luckStartMethod:
            validRequest.sajuInput.luckStartMethod,
        },
      });

    const invalidSolarBirthDateIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        sajuInput: {
          ...validRequest.sajuInput,

          birthDate:
            "1984-02-30",
        },
      });

    const invalidLunarBirthDateIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        sajuInput: {
          ...validRequest.sajuInput,

          birthDate:
            "1984-13-01",

          calendarType:
            "lunar",
        },
      });

    const futureSolarBirthDateIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        sajuInput: {
          ...validRequest.sajuInput,

          birthDate:
            "2026-07-27",

          referenceDate:
            "2026-07-26",
        },
      });

    const invalidBirthTimeIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        sajuInput: {
          ...validRequest.sajuInput,

          birthTime:
            "24:00",
        },
      });

    const invalidGenderIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        sajuInput: {
          ...validRequest.sajuInput,

          gender:
            "unknown",
        },
      });

    const invalidCalendarTypeIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        sajuInput: {
          ...validRequest.sajuInput,

          calendarType:
            "gregorian",
        },
      });

    const invalidReferenceDateIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        sajuInput: {
          ...validRequest.sajuInput,

          referenceDate:
            "2026-02-30",
        },
      });

    const invalidLuckStartMethodIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        sajuInput: {
          ...validRequest.sajuInput,

          luckStartMethod:
            "fixed",
        },
      });

    const calculatedSajuResultInjectionIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        sajuInput: {
          ...validRequest.sajuInput,

          sajuFacts: {},
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

    const transportedBirthDateIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        humanLifeContextInput: {
          ...validRequest
            .humanLifeContextInput,

          birthDate:
            "1984-03-15",
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

    const unknownHumanContextFieldIsRejected =
      !isV3ConsultingRequest({
        ...validRequest,

        humanLifeContextInput: {
          ...validRequest
            .humanLifeContextInput,

          debtAmount:
            100000000,
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
      validSolarRequestIsAccepted,

      validLunarRequestIsAccepted,

      validOptionalRealityIsAccepted,

      nonObjectRequestIsRejected,

      missingSajuInputIsRejected,

      arraySajuInputIsRejected,

      missingHumanLifeContextIsRejected,

      missingQuestionIsRejected,

      transportedMasterReaderInputIsRejected,

      transportedLifePhaseInputIsRejected,

      unknownRootFieldIsRejected,

      missingNameIsRejected,

      emptyNameIsRejected,

      missingBirthDateIsRejected,

      invalidSolarBirthDateIsRejected,

      invalidLunarBirthDateIsRejected,

      futureSolarBirthDateIsRejected,

      invalidBirthTimeIsRejected,

      invalidGenderIsRejected,

      invalidCalendarTypeIsRejected,

      invalidReferenceDateIsRejected,

      invalidLuckStartMethodIsRejected,

      calculatedSajuResultInjectionIsRejected,

      invalidMaritalStatusIsRejected,

      invalidOccupationStatusIsRejected,

      invalidFinancialResponsibilityIsRejected,

      invalidChildrenTypeIsRejected,

      invalidBusinessTypeIsRejected,

      transportedBirthDateIsRejected,

      transportedReferenceDateIsRejected,

      unknownHumanContextFieldIsRejected,

      emptyQuestionIsRejected,

      whitespaceQuestionIsRejected,

      passed:
        validSolarRequestIsAccepted
        && validLunarRequestIsAccepted
        && validOptionalRealityIsAccepted
        && nonObjectRequestIsRejected
        && missingSajuInputIsRejected
        && arraySajuInputIsRejected
        && missingHumanLifeContextIsRejected
        && missingQuestionIsRejected
        && transportedMasterReaderInputIsRejected
        && transportedLifePhaseInputIsRejected
        && unknownRootFieldIsRejected
        && missingNameIsRejected
        && emptyNameIsRejected
        && missingBirthDateIsRejected
        && invalidSolarBirthDateIsRejected
        && invalidLunarBirthDateIsRejected
        && futureSolarBirthDateIsRejected
        && invalidBirthTimeIsRejected
        && invalidGenderIsRejected
        && invalidCalendarTypeIsRejected
        && invalidReferenceDateIsRejected
        && invalidLuckStartMethodIsRejected
        && calculatedSajuResultInjectionIsRejected
        && invalidMaritalStatusIsRejected
        && invalidOccupationStatusIsRejected
        && invalidFinancialResponsibilityIsRejected
        && invalidChildrenTypeIsRejected
        && invalidBusinessTypeIsRejected
        && transportedBirthDateIsRejected
        && transportedReferenceDateIsRejected
        && unknownHumanContextFieldIsRejected
        && emptyQuestionIsRejected
        && whitespaceQuestionIsRejected,
    };
  }
