import type {
  SajuFactsPipelineResult,
} from "../builders/sajuFactsPipelineBuilder.js";
import type {
  HumanDestinyContext,
} from "../types/humanDestinyContext.js";
import type {
  HumanLifeContext,
} from "../types/humanLifeContext.js";
import type {
  MasterReaderEvidenceBundle,
} from "../types/masterReaderEvidenceBundle.js";
import type {
  CounterpartSajuCalculation,
} from "./decision/counterpartSajuCalculationBuilder.js";
import type {
  QuestionReaderResult,
} from "./question/questionReader.js";

export type ConsultingClarificationFactField = {
  key:
    string;

  value:
    string;

  evidence:
    readonly string[];
};

export type ConsultingClarificationFact = {
  key:
    string;

  description:
    string;

  fields:
    readonly ConsultingClarificationFactField[];
};

/**
 * v3 상담 엔진에 전달되는 최종 입력 계약이다.
 *
 * 질문을 정해진 키워드만으로 판단하지 않고,
 * 계산된 원국·대운·세운, Master Reader 근거,
 * 사람의 고유한 성향과 현재 삶의 현실을 함께 전달한다.
 *
 * questionInterpretation은 원문 질문의 의미만 구조화한다.
 * clarificationFacts는 연속 상담에서 사용자가 직접 답하여
 * 검증·확정된 사실만 담는다.
 *
 * 두 입력 모두 사주 판단, verdict, 조건, 위험 또는
 * 미래 예측을 만들지 않는다.
 *
 * GPT와 상담 엔진은 이 자료에 없는 사주 사실을
 * 새로 만들거나 계산 결과를 변경할 수 없다.
 *
 * 기존 단위 검증처럼 계산 자료와 의미 해석 결과를
 * 직접 전달하지 않는 호출도 호환한다.
 * 실제 상담 실행 경로에서는 개인별 자료와
 * 검증된 질문 의미 해석 결과를 전달한다.
 */
export type ConsultingInput = {
  sajuFacts?:
    SajuFactsPipelineResult;

  readerEvidence?:
    MasterReaderEvidenceBundle;

  questionInterpretation?:
    QuestionReaderResult;

    clarificationFacts?:
    readonly ConsultingClarificationFact[];

  /**
   * 확인된 상대방 출생정보로 Calculator가 만든 원국 결과다.
   *
   * 출생시간이 없으면 dateOnly이며 timeGanZhi는 null이다.
   */
  counterpartSaju?:
    CounterpartSajuCalculation;

  humanContext:
    HumanDestinyContext;

  lifeContext:
    HumanLifeContext;

  question:
    string;
};
