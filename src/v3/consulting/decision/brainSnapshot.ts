import type { HumanDestinyContext } from "../../types/humanDestinyContext";

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
 * 여기서는 절대 새로운 판단을 만들지 않는다.
 * Human Destiny Context의 정보를 그대로 정리만 한다.
 */
export function buildBrainSnapshot(
    humanContext: HumanDestinyContext,
  ): BrainSnapshot {
    void humanContext;
  
    return {
      identity: "",
      currentPhase: "",
      lifeDriver: "",
      survivalStyle: "",
      repeatedPattern: "",
      summary: "",
    };
  }