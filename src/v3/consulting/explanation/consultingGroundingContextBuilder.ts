import type {
  ConsultingInput,
} from "../consultingInput.js";
import type {
  CounterpartCalendarType,
  CounterpartSajuCalculationPrecision,
} from "../decision/counterpartSajuCalculationBuilder.js";

export type ConsultingGroundingCounterpartSource = {
  precision:
    CounterpartSajuCalculationPrecision;

  birthDate:
    string;

  birthTime:
    string | null;

  calendarType:
    CounterpartCalendarType;

  gender:
    string;
};

export type ConsultingGroundingContext = {
  sourceLocked:
    true;

  originalQuestion:
    string;

  sajuFacts:
    NonNullable<
      ConsultingInput["sajuFacts"]
    >["facts"] | null;

  counterpartSource:
    ConsultingGroundingCounterpartSource | null;

  currentLuckPhase:
    ConsultingInput["humanContext"]["currentPhase"];

  currentLifeReality:
    ConsultingInput["lifeContext"];
};

function buildCounterpartSource(
  counterpartSaju:
    NonNullable<
      ConsultingInput["counterpartSaju"]
    >,
): ConsultingGroundingCounterpartSource {
  return {
    precision:
      counterpartSaju.precision,

    birthDate:
      counterpartSaju
        .source
        .birthDate,

    birthTime:
      counterpartSaju
        .source
        .birthTime,

    calendarType:
      counterpartSaju
        .source
        .calendarType,

    gender:
      counterpartSaju
        .source
        .gender,
  };
}

/**
 * 질문에 답할 때 사용할 사람 단위 최소 사실 확인 자료를 구성한다.
 *
 * 특정 질문이나 키워드별 문장을 만들지 않는다.
 * 이미 계산된 최소 원국 사실, 현재 대운·세운 국면,
 * 현실 정보, 상대의 확인된 source만 전달한다.
 *
 * humanIdentity.profile / explanation / humanSummary와
 * readerEvidence.masterReaderInput / lifePhaseInput은
 * Grounding에 넣지 않는다.
 * 전 영역 Master Reader 설명은 DecisionResult → Explanation
 * → Payload 경로의 선택된 근거로만 전달한다.
 *
 * 상대방 출생정보는 확인된 source와 precision만 전달한다.
 * dateOnly 계산의 내부 기준시각 영향을 받은 calculated 결과,
 * ganZhi, dayMaster, 오행 분포는 Grounding Context에 넣지 않는다.
 * 계산된 궁합 정보는 DecisionEvidence → Explanation → Prompt 경로로만 전달한다.
 *
 * Grounding은 판단을 만들지 않는다.
 * verdict, finalDecision, conditions, risks, direction,
 * QuestionContext, explanationFocus, explanationOrder를 넣지 않는다.
 *
 * GPT는 이 자료를 질문에 맞게 해석할 수 있지만
 * 계산 결과나 Reader 사실을 변경하거나 새로 만들 수 없다.
 *
 * 기존 단위 검증처럼 계산 자료가 전달되지 않은 경우에는
 * 해당 자료를 null로 명시하며 추측하거나 새로 생성하지 않는다.
 */
export function buildConsultingGroundingContext(
  input:
    ConsultingInput,
): ConsultingGroundingContext {
  const originalQuestion =
    input.question.trim();

  if (
    originalQuestion.length
    === 0
  ) {
    throw new Error(
      "Consulting grounding context requires a non-empty question.",
    );
  }

  return {
    sourceLocked:
      true,

    originalQuestion,

    sajuFacts:
      input.sajuFacts?.facts
      ?? null,

    counterpartSource:
      input.counterpartSaju
        ? buildCounterpartSource(
            input.counterpartSaju,
          )
        : null,

    currentLuckPhase:
      input.humanContext
        .currentPhase,

    currentLifeReality:
      input.lifeContext,
  };
}
