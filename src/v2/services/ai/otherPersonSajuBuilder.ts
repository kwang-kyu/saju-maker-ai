import type {
    BasicSajuInput,
    BasicSajuResult,
  } from "../../types/basic";
  import { basicMapper } from "../basic/basicMapper";
  import type {
    ExtractedPerson,
    QuestionEntityExtractionResult,
  } from "./questionEntityExtractor";
  
  export type OtherPersonSajuBuildResult = {
    status: "not_found" | "incomplete" | "calculated" | "failed";
    input?: BasicSajuInput;
    basic?: BasicSajuResult;
    message: string;
  };
  
  function findOtherPerson(
    entities: QuestionEntityExtractionResult
  ): ExtractedPerson | undefined {
    return entities.persons.find(
      (person) => person.role !== "self"
    );
  }
  
  function formatBirthDate(
    year: number,
    month: number,
    day: number
  ): string {
    const monthText = String(month).padStart(2, "0");
    const dayText = String(day).padStart(2, "0");
  
    return `${year}-${monthText}-${dayText}`;
  }
  
  function convertGender(
    gender: ExtractedPerson["birthInfo"]["gender"]
  ): string {
    if (gender === "female") {
      return "여성";
    }
  
    if (gender === "male") {
      return "남성";
    }
  
    return "성별 모름";
  }
  
  function buildOtherPersonName(
    person: ExtractedPerson
  ): string {
    switch (person.role) {
      case "businessPartner":
        return "동업 상대";
  
      case "spouse":
        return "배우자";
  
      case "lover":
        return "연인 상대";
  
      case "family":
        return "가족 상대";
  
      case "employee":
        return "직원 후보";
  
      default:
        return "상대방";
    }
  }
  
  export function buildOtherPersonSaju(
    entities: QuestionEntityExtractionResult
  ): OtherPersonSajuBuildResult {
    if (!entities.hasOtherPerson) {
      return {
        status: "not_found",
        message: "질문에서 다른 인물이 확인되지 않았습니다.",
      };
    }
  
    const otherPerson = findOtherPerson(entities);
  
    if (!otherPerson) {
      return {
        status: "not_found",
        message: "상대방 정보를 찾지 못했습니다.",
      };
    }
  
    const { year, month, day, birthTime, gender } =
      otherPerson.birthInfo;
  
    if (!year || !month || !day) {
      return {
        status: "incomplete",
        message:
          "상대방의 생년월일이 완전하지 않아 사주를 계산하지 못했습니다.",
      };
    }
  
    if (!birthTime) {
      return {
        status: "incomplete",
        message:
          "상대방의 출생시간이 없어 사주를 계산하지 못했습니다.",
      };
    }
  
    const input: BasicSajuInput = {
      name: buildOtherPersonName(otherPerson),
      birthDate: formatBirthDate(year, month, day),
      birthTime,
      gender: convertGender(gender),
    };
  
    try {
      const basic = basicMapper(input);
  
      return {
        status: "calculated",
        input,
        basic,
        message: "상대방 사주 계산이 완료되었습니다.",
      };
    } catch {
      return {
        status: "failed",
        input,
        message:
          "상대방 정보를 확인했지만 사주 계산 중 오류가 발생했습니다.",
      };
    }
  }