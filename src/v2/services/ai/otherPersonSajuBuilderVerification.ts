import {
    extractQuestionEntities,
  } from "./questionEntityExtractor";
  
  import {
    buildOtherPersonSaju,
  } from "./otherPersonSajuBuilder";
  
  export type OtherPersonSajuBuilderVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;
  
    actual: {
      extractedBirthTime:
        string | undefined;
  
      buildStatus:
        ReturnType<
          typeof buildOtherPersonSaju
        >["status"];
  
      inputBirthTime:
        string | undefined;
  
      calculatedName:
        string | undefined;
  
      calculatedDayMaster:
        string | undefined;
  
      calculatedTimeTenGod:
        string | undefined;
    };
  
    passed:
      boolean;
  };
  
  export function verifyOtherPersonSajuBuilder():
    OtherPersonSajuBuilderVerificationResult {
    const question =
      "상대방은 1980년 5월 10일 오후 3시 30분 출생 여성입니다.";
  
    const entities =
      extractQuestionEntities(
        question,
      );
  
    const otherPerson =
      entities.persons.find(
        (person) =>
          person.role !== "self",
      );
  
    const result =
      buildOtherPersonSaju(
        entities,
      );
  
    const checks = {
      otherPersonIsDetected:
        entities.hasOtherPerson
        === true,
  
      birthDateIsExtracted:
        otherPerson?.birthInfo.year
          === 1980
        && otherPerson?.birthInfo.month
          === 5
        && otherPerson?.birthInfo.day
          === 10,
  
      genderIsExtracted:
        otherPerson?.birthInfo.gender
        === "female",
  
      afternoonThreeThirtyBecomesShin:
        otherPerson?.birthInfo.birthTime
        === "신시",
  
      builderReceivesShin:
        result.input?.birthTime
        === "신시",
  
      builderCalculatesSaju:
        result.status
        === "calculated",
  
      calculatedResultExists:
        result.basic
        !== undefined,
  
      calculatedNameExists:
        Boolean(
          result.basic?.name,
        ),
  
      calculatedDayMasterExists:
        Boolean(
          result.basic?.dayMaster,
        ),
  
      calculatedTimeTenGodExists:
        Boolean(
          result.basic?.timeTenGod,
        ),
    };
  
    return {
      checks,
  
      actual: {
        extractedBirthTime:
          otherPerson
            ?.birthInfo
            .birthTime,
  
        buildStatus:
          result.status,
  
        inputBirthTime:
          result.input
            ?.birthTime,
  
        calculatedName:
          result.basic
            ?.name,
  
        calculatedDayMaster:
          result.basic
            ?.dayMaster,
  
        calculatedTimeTenGod:
          result.basic
            ?.timeTenGod,
      },
  
      passed:
        Object.values(
          checks,
        ).every(
          Boolean,
        ),
    };
  }