import type {
    LifeDriverInterpretation,
    LifeDriverType,
  } from "../types/lifeDriver";
import type {
  LifeDriverEvidenceSource,
  LifeDriverMeaning,
} from "../types/lifeDriverInput";
import type { SajuStructureSignal } from "../../types/sajuFacts";

export type LifeDriverRule = {
  id: string;
  source: LifeDriverEvidenceSource;
  signalKind: SajuStructureSignal["kind"];
  driver: LifeDriverType;
  weight: number;
  reason: string;
  interpretation?: LifeDriverInterpretation;
  matches: (
    signal: SajuStructureSignal,
    meanings: LifeDriverMeaning[],
  ) => boolean;
};

export const LIFE_DRIVER_RULES: LifeDriverRule[] = [
  {
    id: "achievement-strong-day-master",
    source: "dayMasterStrength",
    signalKind: "dayMasterStrength",
    driver: "achievement",
    weight: 3,
    reason:
      "일간의 추진력이 강해 목표를 정하고 직접 성과를 만들어내려는 힘이 크다.",
    matches: (signal) =>
      signal.kind === "dayMasterStrength" &&
      signal.type === "strong",
  },
  {
    id: "achievement-competitive-ten-god",
    source: "tenGodStrength",
    signalKind: "tenGodDominance",
    driver: "achievement",
    weight: 2,
    reason:
      "경쟁과 돌파에 반응하는 십성 구조가 반복되어 성취 욕구가 강하게 작동한다.",
    matches: (signal) =>
      signal.kind === "tenGodDominance" &&
      signal.dominantTenGod !== null &&
      signal.dominantCount >= 2 &&
      ["겁재", "상관", "편관"].includes(
        signal.dominantTenGod,
      ),
  },
  {
    id: "wealth-dominance",
    source: "tenGodStrength",
    signalKind: "tenGodDominance",
    driver: "wealth",
    weight: 3,
    reason:
      "재성 구조가 반복되어 수익과 자산의 현실적 결과가 삶의 핵심 동력으로 작동한다.",
    matches: (signal) =>
      signal.kind === "tenGodDominance" &&
      signal.dominantTenGod !== null &&
      signal.dominantCount >= 2 &&
      ["정재", "편재"].includes(
        signal.dominantTenGod,
      ),
  },
  {
    id: "knowledge-dominance",
    source: "tenGodStrength",
    signalKind: "tenGodDominance",
    driver: "knowledge",
    weight: 3,
    reason:
      "인성 구조가 반복되어 학습과 전문성 축적을 통해 힘을 얻는다.",
    matches: (signal) =>
      signal.kind === "tenGodDominance" &&
      signal.dominantTenGod !== null &&
      signal.dominantCount >= 2 &&
      ["정인", "편인"].includes(
        signal.dominantTenGod,
      ),
  },
  {
    id: "creation-dominance",
    source: "tenGodStrength",
    signalKind: "tenGodDominance",
    driver: "creation",
    weight: 3,
    reason:
      "식상 구조가 반복되어 표현과 생산, 결과물 창출이 삶의 동력으로 작동한다.",
    matches: (signal) =>
      signal.kind === "tenGodDominance" &&
      signal.dominantTenGod !== null &&
      signal.dominantCount >= 2 &&
      ["식신", "상관"].includes(
        signal.dominantTenGod,
      ),
  },
  {
    id: "leadership-dominance",
    source: "tenGodStrength",
    signalKind: "tenGodDominance",
    driver: "leadership",
    weight: 3,
    reason:
      "관성 구조가 반복되어 책임과 통솔, 의사결정권을 맡을 때 힘이 살아난다.",
    matches: (signal) =>
      signal.kind === "tenGodDominance" &&
      signal.dominantTenGod !== null &&
      signal.dominantCount >= 2 &&
      ["정관", "편관"].includes(
        signal.dominantTenGod,
      ),
  },
  {
    id: "freedom-independent-ten-god",
    source: "tenGodStrength",
    signalKind: "tenGodDominance",
    driver: "freedom",
    weight: 3,
    reason:
      "비겁 구조가 반복되어 타인의 통제보다 자신의 판단과 방식으로 움직이려는 힘이 강하다.",
    matches: (signal) =>
      signal.kind === "tenGodDominance" &&
      signal.dominantTenGod !== null &&
      signal.dominantCount >= 2 &&
      ["비견", "겁재"].includes(
        signal.dominantTenGod,
      ),
  },
  {
    id: "freedom-strong-rooting",
    source: "rooting",
    signalKind: "rooting",
    driver: "freedom",
    weight: 2,
    reason:
      "일간이 지지에 강하게 뿌리를 두어 자기 힘으로 버티고 결정하려는 성향이 있다.",
    matches: (signal) =>
      signal.kind === "rooting" &&
      signal.rooted &&
      signal.rootingCount >= 2,
  },
  {
    id: "stability-balanced-day-master",
    source: "dayMasterStrength",
    signalKind: "dayMasterStrength",
    driver: "stability",
    weight: 3,
    reason:
      "일간의 힘이 균형을 이루어 급격한 변화보다 유지와 조절을 통해 성과를 축적한다.",
    matches: (signal) =>
      signal.kind === "dayMasterStrength" &&
      signal.type === "balanced",
  },
  {
    id: "stability-supported-month-command",
    source: "monthCommand",
    signalKind: "monthCommand",
    driver: "stability",
    weight: 2,
    reason:
      "월령이 일간을 지지하여 환경의 기반을 활용하고 안정적으로 성장하는 힘이 있다.",
    matches: (signal) =>
      signal.kind === "monthCommand" &&
      signal.supported === true,
  },
  {
    id: "stability-rooted",
    source: "rooting",
    signalKind: "rooting",
    driver: "stability",
    weight: 2,
    reason:
      "지지에 뿌리가 있어 한 분야를 오래 유지하고 경험을 축적하는 힘이 있다.",
    matches: (signal) =>
      signal.kind === "rooting" &&
      signal.rooted,
  },
  {
    id: "wealth-strong-and-rooted",    
    interpretation: {
        mode: "현실 성과 축적형",
        operatingStyle:
          "수익 가능성을 발견하면 직접 움직여 결과를 만들고, 확보한 기반을 바탕으로 재물을 반복적으로 축적한다.",
        strengthExpression:
          "현실 감각과 실행력이 함께 작동하여 돈이 되는 기회를 빠르게 알아보고 실제 수익 구조로 연결하는 힘이 강하다.",
        riskPattern:
          "자신의 실행력과 버티는 힘을 과신하면 수익 확대에 집중한 나머지 현금 흐름, 고정비, 자금 회수 시점을 놓칠 수 있다.",
        suitableConditions: [
          "본인이 수익 구조와 의사결정권을 직접 관리할 수 있는 환경",
          "단기 투기보다 반복 매출과 자산 축적이 가능한 구조",
          "수익과 비용을 수치로 확인하며 단계적으로 규모를 키우는 방식",
        ],
      },
    source: "tenGodStrength",
    signalKind: "tenGodDominance",
    driver: "wealth",
    weight: 4,
    reason:
      "재성의 현실 감각에 일간의 추진력과 뿌리가 함께 있어 돈을 벌고 유지하려는 힘이 강하게 작동한다.",
    matches: (signal, meanings) => {
      if (
        signal.kind !== "tenGodDominance" ||
        signal.dominantTenGod === null ||
        signal.dominantCount < 2 ||
        !["정재", "편재"].includes(
          signal.dominantTenGod,
        )
      ) {
        return false;
      }

      const hasStrongDayMaster =
        meanings.some(
          (meaning) =>
            meaning.signal?.kind ===
              "dayMasterStrength" &&
            meaning.signal.type === "strong",
        );

      const hasRooting =
        meanings.some(
          (meaning) =>
            meaning.signal?.kind === "rooting" &&
            meaning.signal.rooted,
        );

      return hasStrongDayMaster && hasRooting;
    },
  },
{
id: "achievement-competitive-rooted",
source: "tenGodStrength",
signalKind: "tenGodDominance",
driver: "achievement",
weight: 4,
reason:
  "강한 추진력과 경쟁 성향, 안정된 기반이 함께 작동하여 스스로 목표를 만들고 성과를 만들어내는 힘이 강하다.",
interpretation: {
  mode: "자기개척 성취형",
  operatingStyle:
    "주어진 환경보다 스스로 기회를 만들고 경쟁을 통해 자신의 영역을 넓혀가는 방식으로 성장한다.",
  strengthExpression:
    "도전과 경쟁 상황에서 실행력이 크게 살아나며 어려운 목표일수록 집중력이 높아진다.",
  riskPattern:
    "성과를 지나치게 앞세우면 주변과의 협력보다 속도를 우선하게 되어 갈등과 소진이 반복될 수 있다.",
  suitableConditions: [
    "독립적인 의사결정이 가능한 환경",
    "명확한 목표와 성과 기준이 있는 조직",
    "새로운 시장이나 프로젝트를 개척하는 역할",
  ],
},
matches: (signal, meanings) => {
  if (
    signal.kind !== "tenGodDominance" ||
    signal.dominantTenGod === null ||
    signal.dominantCount < 2 ||
    !["상관", "겁재"].includes(
      signal.dominantTenGod,
    )
  ) {
    return false;
  }

  const hasStrongDayMaster =
    meanings.some(
      (meaning) =>
        meaning.signal?.kind ===
          "dayMasterStrength" &&
        meaning.signal.type === "strong",
    );

  const hasRooting =
    meanings.some(
      (meaning) =>
        meaning.signal?.kind ===
          "rooting" &&
        meaning.signal.rooted,
    );

  return hasStrongDayMaster && hasRooting;
},
},
];



export type MatchedLifeDriverRule = {
  rule: LifeDriverRule;
  meaning: LifeDriverMeaning;
};

export function matchLifeDriverRules(
  meanings: LifeDriverMeaning[],
): MatchedLifeDriverRule[] {
  const matched: MatchedLifeDriverRule[] = [];

  for (const meaning of meanings) {
    if (!meaning.signal) {
      continue;
    }

    for (const rule of LIFE_DRIVER_RULES) {
      if (rule.source !== meaning.source) {
        continue;
      }

      if (rule.signalKind !== meaning.signal.kind) {
        continue;
      }

      if (
        !rule.matches(
          meaning.signal,
          meanings,
        )
      ) {
        continue;
      }

      matched.push({
        rule,
        meaning,
      });
    }
  }

  return matched;
}