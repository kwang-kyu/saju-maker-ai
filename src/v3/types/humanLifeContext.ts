/**
 * 사주가 아닌 현재 삶의 현실 정보를 구조화한 Context다.
 *
 * Human Destiny Context가 타고난 사람과 현재 운을 담는다면,
 * Human Life Context는 현재 살아가는 현실 상태를 담는다.
 */
export type HumanLifeContext = {
    age: number | null;
  
    ageGroup:
      | "teen"
      | "twenties"
      | "thirties"
      | "forties"
      | "fifties"
      | "sixtiesOrOlder"
      | "unknown";
  
    maritalStatus:
      | "single"
      | "married"
      | "divorced"
      | "widowed"
      | "unknown";
  
    hasChildren: boolean | null;
  
    occupationStatus:
      | "student"
      | "employed"
      | "selfEmployed"
      | "businessOwner"
      | "unemployed"
      | "retired"
      | "unknown";
  
    hasActiveBusiness: boolean | null;
  
    financialResponsibility:
      | "low"
      | "medium"
      | "high"
      | "unknown";
  };