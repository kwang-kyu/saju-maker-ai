import type { HumanDestinyContext } from "../types/humanDestinyContext";
import type { HumanLifeContext } from "../types/humanLifeContext";

/**
 * v3 상담 엔진에 전달되는 최종 입력 계약이다.
 *
 * Human Destiny Context는 타고난 사람과 현재 운을 담고,
 * Human Life Context는 현재 삶의 현실 상태를 담는다.
 * 질문은 이 두 Context가 준비된 이후에 해석된다.
 */
export type ConsultingInput = {
  humanContext: HumanDestinyContext;

  lifeContext: HumanLifeContext;

  question: string;
};