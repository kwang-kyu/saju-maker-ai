import type { BasicSajuResult } from "../../types/basic";

export type SajuProfile = {
  dayMaster: string;
  strongestElement: string;
  weakestElement: string;

  businessScore: number;
  moneyScore: number;
  loveScore: number;
  healthScore: number;

  expansionScore: number;
  stabilityScore: number;
  investmentScore: number;
  partnershipScore: number;
  leadershipScore: number;
  cashFlowScore: number;
};

function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}

export function buildSajuProfile(
  basic: BasicSajuResult
): SajuProfile {

  let business = 50;
  let money = 50;
  let love = 50;
  let health = 50;

  let expansion = 50;
  let stability = 50;
  let investment = 50;
  let partnership = 50;
  let leadership = 50;
  let cashFlow = 50;

  switch (basic.strongestElement) {

    case "목":
      business += 10;
      expansion += 20;
      leadership += 10;
      break;

    case "화":
      love += 15;
      leadership += 20;
      partnership += 10;
      break;

    case "토":
      health += 10;
      stability += 20;
      cashFlow += 10;
      break;

    case "금":
      money += 15;
      investment += 20;
      break;

    case "수":
      money += 10;
      business += 10;
      investment += 10;
      break;
  }

  switch (basic.weakestElement) {

    case "목":
      expansion -= 15;
      break;

    case "화":
      partnership -= 15;
      break;

    case "토":
      stability -= 15;
      break;

    case "금":
      cashFlow -= 15;
      break;

    case "수":
      investment -= 15;
      break;
  }

  return {

    dayMaster: basic.dayMaster,

    strongestElement: basic.strongestElement,

    weakestElement: basic.weakestElement,

    businessScore: clamp(business),

    moneyScore: clamp(money),

    loveScore: clamp(love),

    healthScore: clamp(health),

    expansionScore: clamp(expansion),

    stabilityScore: clamp(stability),

    investmentScore: clamp(investment),

    partnershipScore: clamp(partnership),

    leadershipScore: clamp(leadership),

    cashFlowScore: clamp(cashFlow),

  };

}