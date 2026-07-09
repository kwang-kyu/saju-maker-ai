import type { BasicSajuResult } from "../../types/basic";
import { getYongsinSet } from "../../../data/yongsinService";

export type SajuProfile = {
  dayMaster: string;
  yearTenGod: string;
  monthTenGod: string;
  timeTenGod: string;
  strongestElement: string;
  weakestElement: string;
  yongsin: string;
  heesin: string;
  gisin: string;
  yongsinDescription: string;

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

  relationshipStyle: string;
  communicationStyle: string;
  decisionStyle: string;
  familyOrientation: string;
  financialOrientation: string;
  emotionalStyle: string;
  riskFactors: string[];
  growthFactors: string[];
};

function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}

function isElement(value: string, element: "wood" | "fire" | "earth" | "metal" | "water") {
  const map = {
    wood: "\uBAA9",
    fire: "\uD654",
    earth: "\uD1A0",
    metal: "\uAE08",
    water: "\uC218",
  };

  return value === map[element] || value.includes(map[element]);
}

function hasTenGod(value: string, keyword: string) {
  return value.includes(keyword);
}

export function buildSajuProfile(basic: BasicSajuResult): SajuProfile {
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

  const strong = basic.strongestElement;
  const weak = basic.weakestElement;

  if (isElement(strong, "wood")) {
    business += 10;
    expansion += 20;
    leadership += 10;
  }

  if (isElement(strong, "fire")) {
    love += 15;
    leadership += 20;
    partnership += 10;
  }

  if (isElement(strong, "earth")) {
    health += 10;
    stability += 20;
    cashFlow += 10;
  }

  if (isElement(strong, "metal")) {
    money += 15;
    investment += 20;
  }

  if (isElement(strong, "water")) {
    money += 10;
    business += 10;
    investment += 10;
  }

  if (isElement(weak, "wood")) expansion -= 15;
  if (isElement(weak, "fire")) partnership -= 15;
  if (isElement(weak, "earth")) stability -= 15;
  if (isElement(weak, "metal")) cashFlow -= 15;
  if (isElement(weak, "water")) investment -= 15;

  const tenGodText = `${basic.yearTenGod} ${basic.monthTenGod} ${basic.timeTenGod}`;

  if (hasTenGod(tenGodText, "\uBE44\uACAC") || hasTenGod(tenGodText, "\uAC81\uC7AC")) {
    leadership += 10;
    partnership -= 5;
  }

  if (hasTenGod(tenGodText, "\uC2DD\uC2E0") || hasTenGod(tenGodText, "\uC0C1\uAD00")) {
    expansion += 10;
    love += 5;
  }

  if (hasTenGod(tenGodText, "\uC815\uC7AC") || hasTenGod(tenGodText, "\uD3B8\uC7AC")) {
    money += 10;
    cashFlow += 10;
  }

  if (hasTenGod(tenGodText, "\uC815\uAD00") || hasTenGod(tenGodText, "\uD3B8\uAD00")) {
    stability += 10;
    business += 5;
  }

  if (hasTenGod(tenGodText, "\uC815\uC778") || hasTenGod(tenGodText, "\uD3B8\uC778")) {
    investment += 5;
    health += 5;
  }

  const yongsinSet = getYongsinSet(basic.weakestElement, basic.strongestElement);

  const safeExpansion = clamp(expansion);
  const safeStability = clamp(stability);
  const safeInvestment = clamp(investment);
  const safePartnership = clamp(partnership);
  const safeLeadership = clamp(leadership);
  const safeCashFlow = clamp(cashFlow);
  const safeLove = clamp(love);

  const relationshipStyle =
    safeLeadership >= 65
      ? "\uC8FC\uB3C4\uD615"
      : safePartnership >= 65
        ? "\uD611\uB825\uD615"
        : "\uC2E0\uC911\uD615";

  const communicationStyle =
    safePartnership >= 65
      ? "\uB300\uD654\uC870\uC728\uD615"
      : safeLeadership >= 65
        ? "\uC9C1\uC124\uC8FC\uB3C4\uD615"
        : "\uAD00\uCC30\uD615";

  const decisionStyle =
    safeExpansion >= 65
      ? "\uD655\uC7A5\uACB0\uC815\uD615"
      : safeStability >= 65
        ? "\uC548\uC815\uACB0\uC815\uD615"
        : "\uAC80\uD1A0\uD615";

  const familyOrientation =
    safeStability >= 65
      ? "\uC0DD\uD65C\uC548\uC815\uD615"
      : safePartnership >= 65
        ? "\uAD00\uACC4\uC870\uC728\uD615"
        : "\uB3C5\uB9BD\uC874\uC911\uD615";

  const financialOrientation =
    safeCashFlow >= 65
      ? "\uD604\uAE08\uD750\uB984\uD615"
      : safeInvestment >= 65
        ? "\uD22C\uC790\uD310\uB2E8\uD615"
        : "\uADE0\uD615\uAD00\uB9AC\uD615";

  const emotionalStyle =
    safeLove >= 65
      ? "\uD45C\uD604\uD615"
      : safePartnership >= 65
        ? "\uBC30\uB824\uD615"
        : "\uC2E0\uC911\uD615";

  const riskFactors = [
    ...(safeExpansion < 45 ? ["\uD655\uC7A5\uC131 \uBD80\uC871"] : []),
    ...(safeStability < 45 ? ["\uC0DD\uD65C \uC548\uC815\uC131 \uBD80\uC871"] : []),
    ...(safeCashFlow < 45 ? ["\uD604\uAE08\uD750\uB984 \uAD00\uB9AC \uC57D\uC810"] : []),
    ...(safePartnership < 45 ? ["\uD611\uB825\uC131 \uBD80\uC871"] : []),
    ...(safeInvestment < 45 ? ["\uD22C\uC790 \uD310\uB2E8 \uC57D\uC810"] : []),
  ];

  const growthFactors = [
    ...(safeExpansion >= 65 ? ["\uCD94\uC9C4\uB825"] : []),
    ...(safeStability >= 65 ? ["\uC548\uC815\uC131"] : []),
    ...(safeCashFlow >= 65 ? ["\uD604\uAE08\uD750\uB984 \uAD00\uB9AC"] : []),
    ...(safePartnership >= 65 ? ["\uD611\uB825\uC131"] : []),
    ...(safeLeadership >= 65 ? ["\uB9AC\uB354\uC2ED"] : []),
  ];

  return {
    dayMaster: basic.dayMaster,
    yearTenGod: basic.yearTenGod,
    monthTenGod: basic.monthTenGod,
    timeTenGod: basic.timeTenGod,

    strongestElement: basic.strongestElement,
    weakestElement: basic.weakestElement,

    yongsin: yongsinSet.yongsin,
    heesin: yongsinSet.heesin,
    gisin: yongsinSet.gisin,
    yongsinDescription: yongsinSet.yongsinDescription,

    businessScore: clamp(business),
    moneyScore: clamp(money),
    loveScore: safeLove,
    healthScore: clamp(health),

    expansionScore: safeExpansion,
    stabilityScore: safeStability,
    investmentScore: safeInvestment,
    partnershipScore: safePartnership,
    leadershipScore: safeLeadership,
    cashFlowScore: safeCashFlow,

    relationshipStyle,
    communicationStyle,
    decisionStyle,
    familyOrientation,
    financialOrientation,
    emotionalStyle,
    riskFactors,
    growthFactors,
  };
}