import type {
  MasterProfile,
} from "../types/masterProfile";
import {
  buildCapacityExplanation,
  type CapacityResultExplanation,
} from "./capacityExplanationBuilder";
import {
  buildLifeDriverExplanation,
  type LifeDriverExplanation,
} from "./lifeDriverExplanationBuilder";
import {
  buildMoneyExplanation,
  type MoneyResultExplanation,
} from "./moneyExplanationBuilder";
import {
  buildRepeatedPatternExplanation,
  type RepeatedPatternResultExplanation,
} from "./repeatedPatternExplanationBuilder";
import {
  buildSurvivalStyleExplanation,
  type SurvivalStyleResultExplanation,
} from "./survivalStyleExplanationBuilder";

export type MasterProfileExplanation = {
  title: string;

  identitySummary: string;

  lifeDriver: LifeDriverExplanation;

  survivalStyle:
    SurvivalStyleResultExplanation;

  repeatedPattern:
    RepeatedPatternResultExplanation;

  capacity: CapacityResultExplanation;

  money: MoneyResultExplanation;

  integratedStrengths: string[];

  integratedRisks: string[];

  coreEvidence: string[];
};

function unique(
  values: string[],
): string[] {
  return [
    ...new Set(
      values.filter(Boolean),
    ),
  ];
}

function buildIdentitySummary(params: {
  lifeDriver: LifeDriverExplanation;

  survivalStyle:
    SurvivalStyleResultExplanation;

  repeatedPattern:
    RepeatedPatternResultExplanation;

  capacity: CapacityResultExplanation;

  money: MoneyResultExplanation;
}): string {
  const {
    lifeDriver,
    survivalStyle,
    repeatedPattern,
    capacity,
    money,
  } = params;

  return [
    `이 사람은 ${lifeDriver.title}을 삶의 핵심 동력으로 삼아 움직입니다.`,

    `현실의 압박이나 위기에서는 ${survivalStyle.primary.title} 방식으로 자신을 지키고 상황을 돌파하려는 성향이 나타납니다.`,

    `이 과정이 반복되면 삶에서는 ${repeatedPattern.primary.title} 패턴이 형성될 가능성이 큽니다.`,

    capacity.summary,

    money.summary,

    `따라서 이 사람을 이해하려면 무엇을 원하는지만 볼 것이 아니라, 원하는 것을 얻기 위해 어떤 생존 방식을 사용하고 무엇을 반복하며 실제로 어느 범위까지 감당할 수 있는지, 재물을 어떤 방식으로 만들고 지키며 위험에 대응하는지를 함께 봐야 합니다.`,
  ].join(" ");
}

export function buildMasterProfileExplanation(
  profile: MasterProfile,
): MasterProfileExplanation {
  const lifeDriver =
    buildLifeDriverExplanation(
      profile.lifeDriver.primary,
    );

  const survivalStyle =
    buildSurvivalStyleExplanation(
      profile.survivalStyle,
    );

  const repeatedPattern =
    buildRepeatedPatternExplanation(
      profile.repeatedPattern,
    );

  const capacity =
    buildCapacityExplanation(
      profile.capacity,
    );

  const money =
    buildMoneyExplanation(
      profile.money,
    );

  const integratedStrengths = unique([
    ...lifeDriver.strengths,

    ...repeatedPattern.strengths,

    ...survivalStyle.recoveryMethods,

    ...capacity.strengths,

    ...money.strengths,
  ]);

  const integratedRisks = unique([
    ...lifeDriver.cautions,

    ...repeatedPattern.risks,

    ...survivalStyle.prohibitedActions,

    ...capacity.risks,

    ...money.risks,
  ]);

  const coreEvidence = unique([
    ...lifeDriver.evidence,

    ...survivalStyle.primary.evidence,

    ...repeatedPattern.primary.evidence,

    ...capacity.evidence,

    ...money.evidence,
  ]);

  return {
    title:
      `${lifeDriver.title}을 추구하며 ${survivalStyle.primary.title} 방식으로 살아가는 사람`,

    identitySummary:
      buildIdentitySummary({
        lifeDriver,

        survivalStyle,

        repeatedPattern,

        capacity,

        money,
      }),

    lifeDriver,

    survivalStyle,

    repeatedPattern,

    capacity,

    money,

    integratedStrengths,

    integratedRisks,

    coreEvidence,
  };
}