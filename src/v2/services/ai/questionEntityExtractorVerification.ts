import {
    extractQuestionEntities,
  } from "./questionEntityExtractor";
  
  export type QuestionEntityExtractorVerificationResult = {
    checks:
      Record<
        string,
        boolean
      >;
  
    actual: {
      directShin:
        string | undefined;
  
      afternoonThreeThirty:
        string | undefined;
  
      hhmmShin:
        string | undefined;
  
      numericShin:
        string | undefined;
  
      directIn:
        string | undefined;
  
      morningThreeThirty:
        string | undefined;
  
      midnight:
        string | undefined;
  
      noon:
        string | undefined;
  
      boundaryBeforeShin:
        string | undefined;
  
      boundaryShinStart:
        string | undefined;
  
      boundaryShinEnd:
        string | undefined;
  
      boundaryYouStart:
        string | undefined;
  
      boundaryBeforeJa:
        string | undefined;
  
      boundaryJaStart:
        string | undefined;
    };
  
    passed:
      boolean;
  };
  
  function getOtherPersonBirthTime(
    question: string,
  ): string | undefined {
    const result =
      extractQuestionEntities(
        question,
      );
  
    return result.persons.find(
      (person) =>
        person.role !== "self",
    )?.birthInfo.birthTime;
  }
  
  export function verifyQuestionEntityExtractor():
    QuestionEntityExtractorVerificationResult {
    const directShin =
      getOtherPersonBirthTime(
        "상대방은 1980년 5월 10일 신시 출생입니다.",
      );
  
    const afternoonThreeThirty =
      getOtherPersonBirthTime(
        "상대방은 1980년 5월 10일 오후 3시 30분 출생입니다.",
      );
  
    const hhmmShin =
      getOtherPersonBirthTime(
        "상대방은 1980년 5월 10일 15:30 출생입니다.",
      );
  
    const numericShin =
      getOtherPersonBirthTime(
        "상대방은 1980년 5월 10일 15시 30분 출생입니다.",
      );
  
    const directIn =
      getOtherPersonBirthTime(
        "상대방은 인시에 태어났습니다.",
      );
  
    const morningThreeThirty =
      getOtherPersonBirthTime(
        "상대방은 오전 3시 30분 출생입니다.",
      );
  
    const midnight =
      getOtherPersonBirthTime(
        "상대방은 오전 12시 출생입니다.",
      );
  
    const noon =
      getOtherPersonBirthTime(
        "상대방은 오후 12시 출생입니다.",
      );
  
    const boundaryBeforeShin =
      getOtherPersonBirthTime(
        "상대방은 14:59 출생입니다.",
      );
  
    const boundaryShinStart =
      getOtherPersonBirthTime(
        "상대방은 15:00 출생입니다.",
      );
  
    const boundaryShinEnd =
      getOtherPersonBirthTime(
        "상대방은 16:59 출생입니다.",
      );
  
    const boundaryYouStart =
      getOtherPersonBirthTime(
        "상대방은 17:00 출생입니다.",
      );
  
    const boundaryBeforeJa =
      getOtherPersonBirthTime(
        "상대방은 22:59 출생입니다.",
      );
  
    const boundaryJaStart =
      getOtherPersonBirthTime(
        "상대방은 23:00 출생입니다.",
      );
  
    const checks = {
      directShinIsPreserved:
        directShin
        === "신시",
  
      afternoonThreeThirtyBecomesShin:
        afternoonThreeThirty
        === "신시",
  
      hhmmShinBecomesShin:
        hhmmShin
        === "신시",
  
      numericShinBecomesShin:
        numericShin
        === "신시",
  
      directInIsPreserved:
        directIn
        === "인시",
  
      morningThreeThirtyBecomesIn:
        morningThreeThirty
        === "인시",
  
      midnightBecomesJa:
        midnight
        === "자시",
  
      noonBecomesO:
        noon
        === "오시",
  
      fourteenFiftyNineIsMi:
        boundaryBeforeShin
        === "미시",
  
      fifteenZeroZeroIsShin:
        boundaryShinStart
        === "신시",
  
      sixteenFiftyNineIsShin:
        boundaryShinEnd
        === "신시",
  
      seventeenZeroZeroIsYou:
        boundaryYouStart
        === "유시",
  
      twentyTwoFiftyNineIsHae:
        boundaryBeforeJa
        === "해시",
  
      twentyThreeZeroZeroIsJa:
        boundaryJaStart
        === "자시",
  
      equivalentShinInputsMatch:
        directShin
        === afternoonThreeThirty
        && afternoonThreeThirty
          === hhmmShin
        && hhmmShin
          === numericShin,
  
      equivalentInInputsMatch:
        directIn
        === morningThreeThirty,
    };
  
    return {
      checks,
  
      actual: {
        directShin,
        afternoonThreeThirty,
        hhmmShin,
        numericShin,
        directIn,
        morningThreeThirty,
        midnight,
        noon,
        boundaryBeforeShin,
        boundaryShinStart,
        boundaryShinEnd,
        boundaryYouStart,
        boundaryBeforeJa,
        boundaryJaStart,
      },
  
      passed:
        Object.values(
          checks,
        ).every(
          Boolean,
        ),
    };
  }