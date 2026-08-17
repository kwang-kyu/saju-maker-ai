import type {
  DecisionExplanationPayload,
} from "./decisionExplanationPayload";
import type {
  ConsultingGroundingContext,
} from "./consultingGroundingContextBuilder";

export type ConsultingPrompt = {
  systemPrompt:
    string;

  userPrompt:
    string;
};

const VERDICT_KOREAN_LABELS:
  Readonly<Record<string, string>> = {
    recommended:
      "진행을 권합니다.",

    conditionallyRecommended:
      "필요한 조건을 갖춘 뒤 진행하는 편이 좋습니다.",

    wait:
      "지금은 바로 실행하기보다 준비하며 기다리는 편이 좋습니다.",

    notRecommended:
      "현재 조건에서는 진행하지 않는 편이 좋습니다.",

    stop:
      "현재 진행 중인 방향을 중단하거나 정리하는 편이 좋습니다.",

    insufficientEvidence:
      "현재 정보만으로는 결론을 확정하기 어렵습니다.",

    interpreted:
      "계산된 운 흐름을 해석했습니다.",
  };

const CONFIDENCE_KOREAN_LABELS:
  Readonly<Record<string, string>> = {
    high:
      "판단 근거가 충분합니다.",

    medium:
      "판단에 활용할 근거는 있으나 현실 조건을 함께 확인해야 합니다.",

    low:
      "현재 근거만으로 단정하기 어려우므로 추가 확인이 필요합니다.",
  };

const TOPIC_KOREAN_LABELS:
  Readonly<Record<string, string>> = {
    business:
      "사업과 창업",

    money:
      "재물과 자금 운용",

    job:
      "직업과 활동 방향",

    realEstate:
      "부동산",

    relationship:
      "인간관계",

    love:
      "연애",

    marriage:
      "결혼",

    family:
      "가족",

    health:
      "건강",

    legal:
      "법률 문제",

    lifeFlow:
      "현재 삶의 흐름",

    lifeDirection:
      "앞으로의 삶의 방향",

    general:
      "현재 질문",
  };

const INTENT_KOREAN_LABELS:
  Readonly<Record<string, string>> = {
    generalJudgement:
      "현재 선택이 적절한지 판단",

    possibility:
      "실현 가능성 판단",

    prediction:
      "앞으로의 흐름 판단",

    timing:
      "적절한 시기 판단",

    comparison:
      "두 가지 이상 대안 비교",

    selection:
      "가장 적합한 선택 판단",

    risk:
      "위험과 주의점 판단",

    reason:
      "이유와 성향 해석",

    method:
      "방법과 접근 판단",
  };

const DECISION_TARGET_KOREAN_LABELS:
  Readonly<Record<string, string>> = {
    start:
      "새로 시작할지 결정",

    continue:
      "계속 진행할지 결정",

    stop:
      "중단하거나 정리할지 결정",

    choose:
      "가장 적합한 대상을 선택",

    changeJob:
      "직장을 옮길지 결정",

    leaveJob:
      "직장을 그만둘지 결정",

    startBusiness:
      "사업을 시작할지 결정",

    sideJob:
      "부업을 시작할지 결정",

    rest:
      "잠시 쉬어갈지 결정",

    invest:
      "자금을 투자할지 결정",

    manageMoney:
      "자금을 어떻게 관리할지 결정",

    buy:
      "매입할지 결정",

    sell:
      "매도할지 결정",

    partner:
      "함께할 사람이나 동업 관계를 결정",

    marry:
      "결혼할지 결정",

    separate:
      "관계를 정리할지 결정",

    reconcile:
      "관계를 회복할지 결정",

    none:
      "질문에 포함된 선택을 판단",

    confirmDirection:
      "앞으로의 방향을 정할지 판단",
  };


function translateValue(
  value:
    string,
  labels:
    Readonly<Record<string, string>>,
  fallback:
    string,
): string {
  return (
    labels[value]
    ?? fallback
  );
}

export function buildConsultingPrompt(
  payload:
    DecisionExplanationPayload,

    groundingContext?:
    ConsultingGroundingContext,
): ConsultingPrompt {
  const verdictLabel =
    translateValue(
      payload.verdict,
      VERDICT_KOREAN_LABELS,
      "엔진이 확정한 판단을 유지합니다.",
    );

  const confidenceLabel =
    translateValue(
      payload.confidence,
      CONFIDENCE_KOREAN_LABELS,
      "제공된 근거 범위에서 판단합니다.",
    );

  const topicLabel =
    translateValue(
      payload.topic,
      TOPIC_KOREAN_LABELS,
      "현재 질문",
    );

  const intentLabel =
    translateValue(
      payload.intent,
      INTENT_KOREAN_LABELS,
      "질문의 핵심 의도를 판단",
    );

  const decisionTargetLabel =
    payload.explanationKind
    === "roleRecommendation"
      ? "성격에 맞는 역할·배역 해석"
      : payload.explanationKind
        === "lifeFlowInterpretation"
        ? "요청 기간의 운·운세 해석"
      : translateValue(
        payload.decisionTarget,
        DECISION_TARGET_KOREAN_LABELS,
        "질문에 포함된 선택을 판단",
      );

  const roleRecommendationRules =
    payload.explanationKind
    === "roleRecommendation"
      ? `
역할·배역 추천 답변 원칙

- 이 질문은 실행 여부나 시기를 묻는 결정 질문이 아니라, 사주 성격에 맞는 역할·배역을 해석하는 질문이다.
- 제공된 세 가지 배역 후보와 표현 방식만 사용한다. evidence에 없는 배역, 인물, 장르 설정을 새로 만들지 않는다.
- 첫 문단은 재미있는 한 줄 제목으로 시작하고, 바로 대표 배역을 제시한다.
- 대표 배역 1개와 추가 배역 2개를 각각 구체적인 인물상으로 설명한다.
- 각 배역마다 제공된 사주·Reader 근거를 연결한다.
- 대사·표정·움직임·강한 장면에서 어떻게 살아나는지 생생하게 쓴다.
- "잘 살리지 못할 가능성이 있는 역할 유형" 블록이 제공된 경우에만 그 내용을 설명한다.
- 회피 배역 근거가 제공되지 않으면 부적합 배역을 새로 만들거나 추측하지 않는다.
- 실존 배우나 저작권 캐릭터를 그대로 복제하지 않는다.
- "카리스마 있는 리더"처럼 근거 없는 칭찬이나 일반론으로 끝내지 않는다.
- 같은 문장 구조를 모든 사용자에게 반복하지 않는다.
- 다음 뜻의 회피형 보류 표현과 그와 같은 의미의 문장을 절대 사용하지 않는다: 당장 정하지 말고, 준비한 뒤, 조건을 갖춘 뒤, 보류, 나중에 판단, 먼저 연습하고, 지금은 특정 배역을 고르지 말라.
- 실행 준비, 자금, 시기, 기다림, 보류 조건을 추가하지 않는다.
`.trim()
      : "";

  const lifeFlowInterpretationRules =
    payload.explanationKind
    === "lifeFlowInterpretation"
      ? `
총운·기간운 해석 답변 원칙

- 이 질문은 행동 결정이나 선택지 확정을 묻는 질문이 아니라, 요청한 기간의 운 흐름을 해석하는 질문이다.
- 제공된 Evidence와 계산된 대운·세운·월운·일운 Fact만 설명한다.
- 계산되지 않은 사건, 날짜, 재물 유입, 합격, 사고, 연애 성사 등을 예측하지 않는다.
- "실제로 결정하려는 행동은 무엇인가요?"처럼 행동·선택지를 되묻지 않는다.
- "당장 결정하지 말고", "준비한 뒤", "보류", "기다려라" 같은 결정 회피 표현을 사용하지 않는다.
- 추상적 위로나 일반 운세 문구로 채우지 않는다.
- 총운·연운·월운·일운을 구분해서 설명한다.
- 연도가 명시되지 않은 월 질문에 적용된 연도가 Evidence에 있으면 답변에 명시한다.
- 절기 경계로 월주·연주가 바뀌는 경우 Evidence의 구간 설명을 반영한다.
`.trim()
      : "";

  const systemPrompt = `
당신은 천운문 상담 엔진의 판단을 사용자가 이해하기 쉬운 한국어 상담문으로 전달하는 전문 상담가이다.

판단 권한

- 엔진의 verdict를 변경하지 않는다.
- 결론, 신뢰도, 조건, 위험, 권장 방향, 금지 방향을 변경하지 않는다.
- 엔진에 없는 사주 판단이나 미래 예측을 새로 만들지 않는다.
- 제공된 근거를 과장하거나 성공과 실패를 단정하지 않는다.
- 일반적인 처세 조언을 새로운 판단 근거로 추가하지 않는다.

질문 중심 원칙

- 질문에 등장한 대상, 행동, 관계, 시기와 사용자가 실제로 알고 싶은 내용을 직접적인 표현으로 사용한다.
- 질문의 대상과 상황은 사용자의 원문에서만 가져오며 미리 정한 업종별·활동별 예문을 사용하지 않는다.
- 서로 다른 질문에 동일한 조언과 동일한 문장 구조를 반복하지 않는다.
- 사람의 전체 성향을 매번 모두 설명하지 않는다.
- 현재 질문의 판단에 실제로 영향을 준 성향과 반복 행동만 골라 설명한다.
- 질문에 없는 업종, 활동, 투자 대상 또는 상대방의 특성을 임의로 만들어내지 않는다.

개인화 원칙

- 먼저 이 사람에게서 현재 질문과 관련된 강점과 취약점을 구체적으로 설명한다.
- 그 특성이 사용자가 묻는 실제 행동에서 어떻게 나타나는지 연결한다.
- 조건과 위험은 현재 질문의 대상에 맞는 현실적인 상황으로 풀어낸다.
- 권장 방향은 무엇을 어떤 순서로 확인해야 하는지 구체적으로 작성한다.
- 금지 방향은 어떤 행동을 피해야 하는지 분명하게 작성한다.
- 누구에게나 적용되는 안정적인 기반, 작게 시작, 기준 설정, 손실 한도 같은 표현을 근거 없이 관성적으로 반복하지 않는다.
- 그런 방향이 엔진 자료에 실제로 있을 때만 현재 질문의 대상과 연결하여 구체적으로 설명한다.

표현 원칙

- 반드시 자연스러운 한국어로만 답한다.
- 영문 코드, 변수명, 내부 분류값, JSON, 내부 필드명을 노출하지 않는다.
- 내부 판단값은 사용자가 이해할 수 있는 한국어 문장으로 바꾼다.
- 샵 기호, 별표 두 개, 백틱 같은 마크다운 문법을 사용하지 않는다.
- 화면에 그대로 표시해도 자연스러운 일반 텍스트로 작성한다.
- 친근하지만 가볍지 않은 존댓말을 사용한다.
- 추상적인 운세 일반론과 상투적인 위로를 사용하지 않는다.
- 같은 뜻의 결론과 근거를 여러 번 반복하지 않는다.
- 생년월일, 출생시간, 성별 등 이미 제공된 정보를 다시 물어보지 않는다.

질문별 답변 원칙

- 질문을 미리 정해진 키워드나 사례 목록에 끼워 맞추지 않는다.
- 사용자의 원문 질문 전체를 읽고 실제로 알고 싶은 의미를 파악한다.
- 질문에 대한 직접적인 답을 첫 문단에서 제시한다.
- 성격이나 역할을 묻는 질문은 원국과 개인 Reader 근거를 그 상황에 직접 적용한다.
- 역할이나 적합성을 묻는 질문에는 제공된 원국과 Reader 근거상 실제로 가까운 역할 또는 특성을 구체적인 이유와 함께 답한다.
- 사업·이직·투자처럼 지금 실행할지를 묻는 질문은 현재 대운·세운과 현재 운의 국면을 우선하여 답한다.
- 현재 운이 질문을 돕는지, 방해하는지, 아직 때가 아닌지를 명확하게 설명한다.
- 현실 조건은 사주와 현재 운의 결론을 대체하지 않고 실행 가능성을 보완하는 자료로만 사용한다.
- 질문과 관계없는 준비사항이나 일반적인 조언을 기계적으로 나열하지 않는다.
- 제목, 문단 수, 설명 순서는 질문 성격에 맞게 자유롭게 구성한다.
- 정해진 후속 질문이나 반복되는 확인 질문을 만들지 않는다.

궁합 근거 사용 원칙

- 질문별 판단 근거에 full compatibility evidence가 있으면 해당 상대와의 궁합에 직접 답한다.
- 일반적인 동업 조언이나 관계 일반론으로 궁합 질문을 대체하지 않는다.
- evidence에 포함된 supportiveSignals와 cautionSignals 근거를 각각 설명한다.
- 상대방 출생시간이 없거나 limitations에 시주 제외가 명시되면 시주 궁합을 말하지 않는다.
- evidence에 없는 합·충·형·파·해와 오행 관계를 새로 만들지 않는다.
- 엔진 verdict와 overallLevel을 변경하거나 뒤집지 않는다.
${roleRecommendationRules ? `\n${roleRecommendationRules}` : ""}
${lifeFlowInterpretationRules ? `\n${lifeFlowInterpretationRules}` : ""}
`.trim();

  const explanationSections =
    payload.explanationOrder.map(
      (
        item,
        index,
      ) => [
        `${index + 1}. ${item.title}`,
        item.content,
      ].join("\n"),
    );

    const groundingSections =
    groundingContext
      ? [
          "개인별 사주 근거 — 원국·대운·세운·Master Reader가 확정한 자료",
          JSON.stringify(
            groundingContext,
            null,
            2,
          ),
          "",
        ]
      : [];

  const userPrompt = [
    "다음은 천운문 판단 엔진이 확정한 상담 자료입니다.",
    "원래 질문을 중심으로, 이 사람에게만 해당하는 완성된 한국어 상담문을 작성하세요.",
    "자료의 판단을 변경하지 말고 서로 다른 질문에 동일한 답변을 반복하지 마세요.",
    "",
    "사용자의 원래 질문",
    payload.originalQuestion,
    "",
    "질문의 한국어 분류",
    `상담 영역: ${topicLabel}`,
    `질문 의도: ${intentLabel}`,
    `결정할 대상: ${decisionTargetLabel}`,
    "",
    "확정된 판단",
    verdictLabel,
    "",
    "판단 근거의 충분도",
    confidenceLabel,
    "",
    ...groundingSections,
    "질문별 판단 근거",
    ...explanationSections,
    "",
    "엔진이 확정한 최종 결론",
    payload.finalDecision,
    "",
    "작성 전 최종 확인",
    "- 첫 문단이 원래 질문에 직접 답하는가?",
    "- 질문에 나온 구체적인 대상과 행동을 사용했는가?",
    "- 다른 사람이나 다른 질문에도 그대로 붙일 수 있는 상투적인 문장을 제거했는가?",
    "- 영문 내부 코드와 마크다운 기호를 제거했는가?",
  ].join("\n\n");

  return {
    systemPrompt,
    userPrompt,
  };
}
