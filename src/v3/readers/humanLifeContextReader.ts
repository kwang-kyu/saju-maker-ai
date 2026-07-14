import type { HumanLifeContext } from "../types/humanLifeContext";

export type HumanLifeContextReaderInput = {
  birthDate: string | null;

  maritalStatus?: HumanLifeContext["maritalStatus"];

  hasChildren?: boolean | null;

  occupationStatus?: HumanLifeContext["occupationStatus"];

  hasActiveBusiness?: boolean | null;

  financialResponsibility?: HumanLifeContext["financialResponsibility"];

  referenceDate?: Date;
};

type ParsedBirthDate = {
  year: number;
  month: number;
  day: number;
};

function parseBirthDate(
  birthDate: string,
): ParsedBirthDate | null {
  const normalizedBirthDate = birthDate.trim();

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
    normalizedBirthDate,
  );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return {
    year,
    month,
    day,
  };
}

function resolveAge(
  birthDate: string | null,
  referenceDate: Date,
): number | null {
  if (!birthDate?.trim()) {
    return null;
  }

  const parsedBirthDate =
    parseBirthDate(birthDate);

  if (!parsedBirthDate) {
    throw new Error(
      "birthDate must use a valid YYYY-MM-DD format.",
    );
  }

  if (Number.isNaN(referenceDate.getTime())) {
    throw new Error(
      "referenceDate must be a valid Date.",
    );
  }

  const {
    year,
    month,
    day,
  } = parsedBirthDate;

  let age =
    referenceDate.getFullYear() - year;

  const currentMonth =
    referenceDate.getMonth() + 1;

  const currentDay =
    referenceDate.getDate();

  const birthdayHasPassed =
    currentMonth > month ||
    (
      currentMonth === month &&
      currentDay >= day
    );

  if (!birthdayHasPassed) {
    age -= 1;
  }

  if (age < 0) {
    throw new Error(
      "birthDate cannot be later than referenceDate.",
    );
  }

  return age;
}

function resolveAgeGroup(
  age: number | null,
): HumanLifeContext["ageGroup"] {
  if (age === null) {
    return "unknown";
  }

  if (age < 20) {
    return "teen";
  }

  if (age < 30) {
    return "twenties";
  }

  if (age < 40) {
    return "thirties";
  }

  if (age < 50) {
    return "forties";
  }

  if (age < 60) {
    return "fifties";
  }

  return "sixtiesOrOlder";
}

/**
 * 사주만으로 알 수 없는 현재 삶의 현실 정보를
 * HumanLifeContext 구조로 정규화한다.
 *
 * 이 Reader는 사주 판단이나 상담 결론을 생성하지 않는다.
 */
export function readHumanLifeContext(
  input: HumanLifeContextReaderInput,
): HumanLifeContext {
  const referenceDate =
    input.referenceDate ?? new Date();

  const age = resolveAge(
    input.birthDate,
    referenceDate,
  );

  return {
    age,
    ageGroup: resolveAgeGroup(age),

    maritalStatus:
      input.maritalStatus ?? "unknown",

    hasChildren:
      input.hasChildren ?? null,

    occupationStatus:
      input.occupationStatus ?? "unknown",

    hasActiveBusiness:
      input.hasActiveBusiness ?? null,

    financialResponsibility:
      input.financialResponsibility ?? "unknown",
  };
}