import type {
    DecisionResult,
  } from "../decisionTypes";
  
  export const BUSINESS_START_EXPECTED_RESULT:
    DecisionResult = {
    verdict: "conditionallyRecommended",
    confidence: "high",
  
    contextAlignment: "stronglyAligned",
    actionReadiness: "readyWithConditions",
  
    decisionTarget: "start",
    topic: "business",
    intent: "prediction",
  
    coreDecision:
      "지금 시작할 것인가: 조건을 갖춘 뒤 진행하는 것이 맞다.",
  
    decisionReason:
      "현재 인생 국면은 '성장 국면'이다. 현재는 새로운 기회를 실행으로 연결하되, 검증된 범위 안에서 단계적으로 확장해야 하는 국면이다. 질문에서 실제로 결정하려는 것은 '지금 시작할 것인가'이다. 현재 국면은 확장과 성장을 요구하며, 질문 속 선택도 새로운 행동과 확대를 향하고 있어 서로 강하게 맞는다.",
  
    evidence: [
      {
        source: "humanIdentity",
        key: "identity",
        description:
          "성취형을 삶의 중심 동력으로 삼고 돌파형 방식으로 현실의 압박을 견디며 느리지만 꾸준한 성장 흐름을 반복하기 쉬운 사람입니다.",
        weight: 5,
      },
      {
        source: "lifePhase",
        key: "currentPhase",
        description:
          "성장 국면 현재는 새로운 기회를 실행으로 연결하되, 검증된 범위 안에서 단계적으로 확장해야 하는 국면이다.",
        weight: 5,
      },
      {
        source: "lifeDriver",
        key: "lifeDriver",
        description: "성취형",
        weight: 4,
      },
      {
        source: "survivalStyle",
        key: "survivalStyle",
        description: "돌파형",
        weight: 3,
      },
      {
        source: "repeatedPattern",
        key: "repeatedPattern-primary-1",
        description:
          "작게 시작하여 경험을 축적할수록 안정성이 높아진다.",
        weight: 3,
      },
      {
        source: "repeatedPattern",
        key: "repeatedPattern-primary-2",
        description:
          "성과가 단계적으로 연결될 때 지속력이 살아난다.",
        weight: 2,
      },
      {
        source: "questionIntent",
        key: "questionIntent",
        description:
          "사업과 창업의 적합성이 앞으로 어떤 결과가 예상되는지를 묻고 있다. 질문 속에 구체적인 숨은 동기가 아직 충분히 드러나지 않았다. 지금 시작할 것인가",
        weight: 3,
      },
    ],
  
    conditions: [
      {
        key: "confirmExecutionConditions",
        description:
          "실행 전 자금, 역할, 일정과 감당 가능한 손실 범위를 명확히 해야 한다.",
        required: true,
        satisfied: false,
      },
      {
        key: "verifyImmediateExecutionReadiness",
        description:
          "지금 바로 실행하려는 질문이므로 자금, 역할, 일정과 실제 실행 준비가 갖춰졌는지 먼저 확인해야 한다.",
        required: true,
        satisfied: false,
      },
      {
        key: "useGradualGrowth",
        description:
          "작게 시작해 경험과 수익을 축적하는 점진적 실행 방식을 유지해야 한다.",
        required: true,
        satisfied: false,
      },
    ],
  
    risks: [
      {
        key: "urgentDecision",
        description:
          "결정을 서두르면 현재 사람의 반복 패턴이 다시 나타날 수 있다.",
        severity: "medium",
        source: "repeatedPattern",
      },
      {
        key: "repeatedPattern-1",
        description:
          "초기 성과가 좋을 때 확장을 서두를 수 있다.",
        severity: "high",
        source: "repeatedPattern",
      },
      {
        key: "repeatedPattern-2",
        description:
          "실행에 집중하면서 재무 점검을 뒤로 미룰 수 있다.",
        severity: "high",
        source: "repeatedPattern",
      },
    ],
  
    conflict: {
      exists: false,
      description:
        "현재 사람의 국면과 질문 속 선택 사이에 직접적인 충돌은 확인되지 않았다.",
      humanContextSide:
        "성장 국면 현재는 새로운 기회를 실행으로 연결하되, 검증된 범위 안에서 단계적으로 확장해야 하는 국면이다.",
      questionSide:
        "지금 시작할 것인가",
    },
  
    recommendedDirection:
      "필수 조건과 위험 관리 기준을 먼저 갖춘 뒤 제한적으로 진행한다.",
  
    prohibitedDirection:
      "필수 조건을 충족하지 않은 채 바로 실행하지 않는다.",
  
    finalDecisionSentence:
      "지금 시작할 것인가: 조건을 갖춘 뒤 진행하는 것이 맞다. 필수 조건과 위험 관리 기준을 먼저 갖춘 뒤 제한적으로 진행한다.",
  
    humanContextUsed: true,
    questionContextUsed: true,
  };