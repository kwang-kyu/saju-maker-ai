import type {
    DecisionResult,
  } from "../decisionTypes";

  export const BUSINESS_START_EXPECTED_RESULT:
    DecisionResult = {
    verdict: "wait",
    confidence: "high",

    contextAlignment: "stronglyAligned",
    actionReadiness: "readyWithConditions",

    decisionTarget: "start",
    topic: "business",
    intent: "prediction",

    coreDecision:
    "시작 가능성이 닫힌 것은 아니지만 지금 바로 시작해 질문한 결과까지 이어질 흐름으로 보기는 어렵다.",

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
          source: "capacity",
          key: "capacity-summary",
          description:
            "책임 감당력, 금전 감당력, 조직 감당력, 관계 감당력, 위험 감당력, 시간 지속력에서 비교적 넓은 감당 범위가 확인됩니다.",
          weight: 4,
        },
        {
          source: "capacity",
          key: "capacity-evidence-1",
          description:
            "자기 통제력과 실행력이 강해 책임을 맡고 외부 압력을 견디는 힘이 확인된다.",
          weight: 3,
        },
        {
          source: "capacity",
          key: "capacity-evidence-2",
          description:
            "내부 기반과 버팀력이 확인되어 책임과 위험을 장기간 유지할 수 있다.",
          weight: 3,
        },
        {
          source: "capacity",
          key: "capacity-evidence-3",
          description:
            "재물과 자원을 분산하여 관리하고 반복 수익을 축적하는 힘이 확인된다.",
          weight: 3,
        },
        {
          source: "capacity",
          key: "capacity-evidence-4",
          description:
            "규칙과 역할 체계를 이해하며 조직 운영과 책임 조율을 수행할 수 있다.",
          weight: 3,
        },
        {
          source: "capacity",
          key: "capacity-evidence-5",
          description:
            "환경적 지원과 내부 기반이 연결되어 시간을 두고 점진적으로 성과를 축적할 수 있다.",
          weight: 3,
        },
        {
          source: "money",
          key: "money-summary",
          description:
            "한 번의 큰 성과보다 반복 수익을 유지하고 이를 보유 자산으로 전환하면서 재물 규모를 키우는 구조이다. 재물 생성력, 반복 수익력, 재물 보존력, 자산 전환력, 현금흐름 관리력, 부채 감당력, 손실 회복력에서 강한 구조적 기반이 확인됩니다. 변동 대응력은 조건과 관리 방식에 따라 작동 범위가 달라질 수 있습니다.",
          weight: 4,
        },
        {
          source: "career",
          key: "career-summary",
          description:
            "한 분야의 지식과 경험을 장기간 축적하여 대체하기 어려운 전문영역으로 성장하는 구조이다. 현실 성과·영업·자원 운영을 통해 결과를 만드는 역할에서 중심 강점이 살아난다. 직업 역할 방향, 업무 수행 방식, 전문성 성장력, 리더 역할 적합성, 성과 전환력, 경력 지속력에서 강한 직업 기반이 확인됩니다. 조직 적합성은 역할과 환경에 따라 발현 범위가 달라질 수 있습니다. 독립 업무 적합성은 현재 근거만으로 수준을 확정하지 않습니다.",
          weight: 4,
        },
        {
          source: "relationship",
          key: "relationship-summary",
          description:
            "역할과 책임을 나누며 협력하고 가까운 관계에서는 생활과 장기 목표를 함께 유지하는 구조이다. 관계 확장력, 친밀 관계 유지력, 관계 경계 유지력, 신뢰 회복력, 동업·협업 적합성, 배우자 관계 결속력에서 강한 관계 기반이 확인됩니다. 갈등 조정력은 관계의 성격과 신뢰 수준에 따라 발현 범위가 달라질 수 있습니다. 감정 교류력에서는 관계 확대보다 역할·책임·경계의 조정이 중요합니다.",
          weight: 4,
        },
        {
          source: "destiny",
          key: "destiny-summary",
          description:
            "변화를 단절로 만들지 않고 기존 경험과 성과를 다음 기반에 연결하며 성장하는 구조이다. 이는 운명을 선고하거나 현재의 행동과 시기를 결정하는 판단이 아니라, 타고난 강점·반복 과제·선택·성장·기여가 장기적으로 연결되는 구조를 설명한 것입니다.",
          weight: 4,
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
        key: "completeTimingEvidence",
        description:
          "시기 판단은 필요하지만 대상 기간과 해당 기간의 운 근거가 완성되지 않아 실행 시기를 확정할 수 없다.",
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
      "현재 충돌 요소를 정리하고 준비가 완료될 때까지 판단을 유보한다.",

    prohibitedDirection:
      "불안과 조급함만으로 결정을 밀어붙이지 않는다.",

      finalDecisionSentence:
      "시작 가능성이 닫힌 것은 아니지만 지금 바로 시작해 질문한 결과까지 이어질 흐름으로 보기는 어렵다. 현재 충돌 요소를 정리하고 준비가 완료될 때까지 판단을 유보한다.",

    humanContextUsed: true,
    questionContextUsed: true,

    timingAssessment: {
      analysisRequired: true,
      timingType: "executionTiming",
      evidenceLevel: "missing",
      assessmentScope: "timingEvaluation",

      targetScope: null,
      targetStartDate: null,
      targetEndDate: null,
      targetYear: null,
      targetMonth: null,
      targetDay: null,

      hasCurrentDaeun: false,
      hasTargetSeun: false,
      hasYearSegments: false,
      hasWolun: false,
      hasIlun: false,

      flowInterpretationAvailable: false,
      flowDirection: "indeterminate",
      overallTheme: null,

      supportiveSignals: [],
      tensionSignals: [],
      cautions: [],
      limitations: [
        "대상 기간이 확인되지 않았다.",
      ],
      evidenceKeys: [],
      evidenceComplete: false,

      timingSearch: {
        required: false,
        available: false,
        searchedFromDate: null,
        searchedToDate: null,
        candidateWindows: [],
        recommendedWindows: [],
        cautionWindows: [],
        limitations: [],
      },
    },
  };
