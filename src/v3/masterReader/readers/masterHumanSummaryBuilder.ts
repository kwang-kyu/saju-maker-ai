import type { MasterReaderResult } from "../types/masterReaderResult";

export type MasterHumanSummary = {
  title: string;

  summary: string;

  coreIdentity: string;

  strengths: string[];

  cautions: string[];

  evidence: string[];
};

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function buildMasterHumanSummary(
    result: Pick<
      MasterReaderResult,
      "profile" | "explanation"
    >,
  ): MasterHumanSummary {
  const { explanation } = result;

  const lifeDriver = explanation.lifeDriver;
  const survivalStyle = explanation.survivalStyle;
  const repeatedPattern = explanation.repeatedPattern;

  const coreIdentity = [
    `${lifeDriver.title}을 삶의 중심 동력으로 삼고`,
    `${survivalStyle.primary.title} 방식으로 현실의 압박을 견디며`,
    `${repeatedPattern.primary.title} 흐름을 반복하기 쉬운 사람입니다.`,
  ].join(" ");

  const summary = [
    `이 사람은 ${lifeDriver.title}을 이루기 위해 움직입니다.`,
    `위기나 압박이 커지면 ${survivalStyle.primary.title} 방식으로 자신을 지키려 합니다.`,
    `이 생존 방식이 반복되면서 삶에서는 ${repeatedPattern.primary.title} 패턴이 나타나기 쉽습니다.`,
    `따라서 이 사람의 운명은 추구하는 목표, 위기에 대응하는 방식, 반복되는 삶의 결과를 함께 보아야 정확히 읽을 수 있습니다.`,
  ].join(" ");

  return {
    title: explanation.title,

    summary,

    coreIdentity,

    strengths: unique([
      ...lifeDriver.strengths,
      ...repeatedPattern.strengths,
      ...survivalStyle.recoveryMethods,
    ]),

    cautions: unique([
      ...lifeDriver.cautions,
      ...repeatedPattern.risks,
      ...survivalStyle.prohibitedActions,
    ]),

    evidence: unique([
      ...lifeDriver.evidence,
      ...survivalStyle.primary.evidence,
      ...repeatedPattern.primary.evidence,
    ]),
  };
}