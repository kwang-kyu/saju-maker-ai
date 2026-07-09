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

  earlyLifeFlow: string;
  middleLifeFlow: string;
  matureLifeFlow: string;
  lateLifeFlow: string;
  currentLifeStage: string;
  currentLifeFocus: string;
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
  const safeBusiness = clamp(business);
  const safeMoney = clamp(money);
  const safeHealth = clamp(health);

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

  const earlyLifeFlow = safeExpansion >= 60 ? "\uCD08\uB144\uC5D0\uB294 \uC131\uC7A5\uACFC \uACBD\uD5D8\uC744 \uD1B5\uD574 \uBC29\uD5A5\uC744 \uC7A1\uC544\uAC00\uB294 \uD750\uB984\uC785\uB2C8\uB2E4." : "\uCD08\uB144\uC5D0\uB294 \uC11C\uB450\uB974\uAE30\uBCF4\uB2E4 \uAE30\uCD08\uB97C \uB2E4\uC9C0\uB294 \uD750\uB984\uC785\uB2C8\uB2E4.";
  const middleLifeFlow = safeBusiness >= 60 || safeMoney >= 60 ? "\uC911\uB144\uC5D0\uB294 \uC9C1\uC5C5, \uC0AC\uC5C5, \uC7AC\uBB3C \uAD6C\uC870\uB97C \uBCF8\uACA9\uC801\uC73C\uB85C \uB9CC\uB4E4\uC5B4\uAC00\uB294 \uD750\uB984\uC785\uB2C8\uB2E4." : "\uC911\uB144\uC5D0\uB294 \uBB34\uB9AC\uD55C \uD655\uC7A5\uBCF4\uB2E4 \uC548\uC815\uACFC \uAD00\uACC4 \uC815\uBE44\uAC00 \uC911\uC694\uD569\uB2C8\uB2E4.";
  const matureLifeFlow = safeStability >= 60 ? "\uC7A5\uB144\uC5D0\uB294 \uC548\uC815, \uCC45\uC784, \uC790\uC0B0 \uAD00\uB9AC\uAC00 \uC911\uC2EC\uC774 \uB418\uB294 \uD750\uB984\uC785\uB2C8\uB2E4." : "\uC7A5\uB144\uC5D0\uB294 \uAE30\uC874 \uBC29\uC2DD\uC744 \uC815\uBE44\uD558\uACE0 \uC0DD\uD65C \uAD6C\uC870\uB97C \uC7AC\uC815\uB9BD\uD574\uC57C \uD569\uB2C8\uB2E4.";
  const lateLifeFlow = safeCashFlow >= 60 || safeHealth >= 60 ? "\uB9D0\uB144\uC5D0\uB294 \uD604\uAE08\uD750\uB984, \uAC74\uAC15, \uC0DD\uD65C \uC548\uC815\uC774 \uD575\uC2EC\uC774 \uB418\uB294 \uD750\uB984\uC785\uB2C8\uB2E4." : "\uB9D0\uB144\uC5D0\uB294 \uBB34\uB9AC\uD55C \uBCC0\uD654\uBCF4\uB2E4 \uC548\uC815\uC801\uC778 \uC0DD\uD65C \uB9AC\uB4EC\uC744 \uC720\uC9C0\uD558\uB294 \uAC83\uC774 \uC911\uC694\uD569\uB2C8\uB2E4.";

  const currentLifeStage = "\uC5F0\uB839\uC815\uBCF4 \uBBF8\uC801\uC6A9";
  const currentLifeFocus = safeMoney >= safeBusiness && safeMoney >= safeLove ? "\uC7AC\uBB3C\uAD6C\uC870" : safeBusiness >= safeLove ? "\uC9C1\uC5C5\u00B7\uC0AC\uC5C5\uAD6C\uC870" : "\uAD00\uACC4\u00B7\uAC10\uC815\uAD6C\uC870";

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

    businessScore: safeBusiness,
    moneyScore: safeMoney,
    loveScore: safeLove,
    healthScore: safeHealth,

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

    earlyLifeFlow,
    middleLifeFlow,
    matureLifeFlow,
    lateLifeFlow,
    currentLifeStage,
    currentLifeFocus,
  };
}