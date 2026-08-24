import type { HumanDestinyContext } from "../../types/humanDestinyContext.js";

export type BrainSnapshot = {
  identity: string;
  currentPhase: string;
  lifeDriver: string;
  survivalStyle: string;
  repeatedPattern: string;

  summary: string;
};

/**
 * Brain Snapshot
 *
 * Human Destiny Context를
 * Decision Brain이 바로 사용할 수 있는
 * 현재 사람의 핵심 상태로 요약한다.
 *
 * 여기서는 새로운 판단을 만들지 않는다.
 * Human Destiny Context의 정보를 정리만 한다.
 */
export function buildBrainSnapshot(
  humanContext: HumanDestinyContext,
): BrainSnapshot {
  const { identity, currentPhase } = humanContext;

  const lifeDriver =
    identity.explanation.lifeDriver.title;

  const survivalStyle =
    identity.explanation.survivalStyle.primary.title;

  const repeatedPattern =
    identity.explanation.repeatedPattern.primary.title;

  const identityText =
    identity.humanSummary.coreIdentity ||
    identity.explanation.identitySummary;

  const currentPhaseText = [
    currentPhase.title,
    currentPhase.description,
  ]
    .filter(Boolean)
    .join(" ");

  const summary = [
    identity.humanSummary.summary,
    `현재 인생 국면은 ${currentPhase.title}입니다.`,
    currentPhase.description,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    identity: identityText,
    currentPhase: currentPhaseText,
    lifeDriver,
    survivalStyle,
    repeatedPattern,
    summary,
  };
}