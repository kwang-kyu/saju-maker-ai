import {
  readCapacity,
} from "../../../masterReader/readers/capacityReader";
import {
  readCareer,
} from "../../../masterReader/readers/careerReader";
import {
  readHealth,
} from "../../../masterReader/readers/healthReader";
import {
  readBlessing,
} from "../../../masterReader/readers/blessingReader";
import {
  readDestiny,
} from "../../../masterReader/readers/destinyReader";
import {
  readMoney,
} from "../../../masterReader/readers/moneyReader";
import {
  readRelationship,
} from "../../../masterReader/readers/relationshipReader";
import {
  buildMasterHumanSummary,
} from "../../../masterReader/readers/masterHumanSummaryBuilder";
import {
  buildMasterProfileExplanation,
} from "../../../masterReader/readers/masterProfileExplanationBuilder";
import type {
  MasterProfile,
} from "../../../masterReader/types/masterProfile";
import type {
  HumanDestinyContext,
} from "../../../types/humanDestinyContext";
import type {
  HumanLifeContext,
} from "../../../types/humanLifeContext";
import type {
  SajuStructureFact,
} from "../../../types/sajuFacts";
import {
  buildQuestionContext,
} from "../../question/questionContextBuilder";
import {
  readQuestion,
} from "../../question/questionReader";
import type {
  DecisionEngineInput,
} from "../decisionTypes";

const BUSINESS_START_QUESTION =
  "지금 통닭집을 시작해도 될까요?";

const REGRESSION_STRUCTURE_FACTS: SajuStructureFact[] = [
  {
    category: "dayMasterStrength",
    description:
      "자기 통제력과 실행력이 강해 책임을 맡고 외부 압력을 견디는 힘이 확인된다.",
    strength: "strong",
    confidence: "strong",
    conditions: [
      "책임 범위와 의사결정권이 명확할 것",
      "확장 규모를 단계적으로 검증할 것",
    ],
    exceptions: [
      "고정비와 부채가 감당 범위를 넘어서는 경우",
    ],
    signal: {
      kind: "dayMasterStrength",
      type: "strong",
      score: 6,
      supportScore: 8,
      opposingScore: 2,
      monthCommandScore: 3,
      rootingScore: 3,
    },
  },
  {
    category: "rooting",
    description:
      "내부 기반과 버팀력이 확인되어 책임과 위험을 장기간 유지할 수 있다.",
    strength: "strong",
    confidence: "strong",
    conditions: [
      "손실 한도를 사전에 정할 것",
      "운영 결과를 정기적으로 점검할 것",
    ],
    exceptions: [
      "검증되지 않은 사업에 자원을 과도하게 집중하는 경우",
    ],
    signal: {
      kind: "rooting",
      rootingCount: 2,
      totalBranches: 4,
      rooted: true,
    },
  },
  {
    category: "tenGodStrength",
    description:
      "재물과 자원을 분산하여 관리하고 반복 수익을 축적하는 힘이 확인된다.",
    strength: "strong",
    confidence: "strong",
    conditions: [
      "현금흐름을 사업자금과 생활자금으로 분리할 것",
      "반복 매출이 확인된 범위 안에서 확장할 것",
    ],
    exceptions: [
      "초기 성과만 보고 투자 규모를 급격히 키우는 경우",
    ],
    signal: {
      kind: "tenGodDominance",
      dominantTenGod: "정재",
      dominantCount: 3,
      totalCount: 8,
      counts: {
        비견: 1,
        겁재: 1,
        식신: 1,
        상관: 1,
        정재: 3,
        정관: 1,
      },
      distributed: true,
    },
  },
  {
    category: "structure",
    description:
      "규칙과 역할 체계를 이해하며 조직 운영과 책임 조율을 수행할 수 있다.",
    strength: "medium",
    confidence: "strong",
    conditions: [
      "역할과 권한을 문서로 명확히 할 것",
      "업무 책임자를 구분할 것",
    ],
    exceptions: [
      "한 사람이 모든 운영 책임을 독점하는 경우",
    ],
    signal: {
      kind: "tenGodDominance",
      dominantTenGod: "정관",
      dominantCount: 3,
      totalCount: 8,
      counts: {
        비견: 1,
        식신: 1,
        정재: 2,
        정관: 3,
        정인: 1,
      },
      distributed: true,
    },
  },
  {
    category: "monthCommand",
    description:
      "환경적 지원과 내부 기반이 연결되어 시간을 두고 점진적으로 성과를 축적할 수 있다.",
    strength: "strong",
    confidence: "strong",
    conditions: [
      "단기 성과보다 운영 지속성을 우선할 것",
      "단계별 검증 기간을 확보할 것",
    ],
    exceptions: [
      "검증 기간을 생략하고 즉시 대규모로 확장하는 경우",
    ],
    signal: {
      kind: "monthCommand",
      season: "spring",
      supported: true,
      dayMasterElement: "wood",
    },
  },
];

function buildRegressionMasterProfile(): MasterProfile {
  const capacity = readCapacity(
    REGRESSION_STRUCTURE_FACTS,
  );

  const money = readMoney(
    REGRESSION_STRUCTURE_FACTS,
  );
  const career = readCareer(
    REGRESSION_STRUCTURE_FACTS,
  );
  const relationship =
  readRelationship(
    REGRESSION_STRUCTURE_FACTS,
  );
  const health =
  readHealth(
    REGRESSION_STRUCTURE_FACTS,
  );
  const blessing =
  readBlessing(
    REGRESSION_STRUCTURE_FACTS,
  );

  const destiny =
  readDestiny(
    REGRESSION_STRUCTURE_FACTS,
  );

  return {
    lifeDriver: {
      primary: {
        driver: "achievement",

        interpretation: {
          mode: "목표 성취형",
          operatingStyle:
            "명확한 목표를 세운 뒤 직접 실행하며 결과를 확인한다.",
          strengthExpression:
            "실행 목표와 책임 범위가 명확할수록 추진력이 살아난다.",
          riskPattern:
            "초기 성과를 확인하기 전에 규모를 키우면 부담이 커질 수 있다.",
          suitableConditions: [
            "의사결정권이 명확한 환경",
            "성과를 단계별로 검증할 수 있는 구조",
            "책임과 보상의 연결이 분명한 역할",
          ],
        },

        evidence: [
          {
            source: "strength",
            description:
              "자기 힘으로 목표를 실행하려는 동력이 확인된다.",
            weight: 3,
          },
          {
            source: "rooting",
            description:
              "결정을 지속할 수 있는 기본적인 버팀력이 확인된다.",
            weight: 2,
          },
        ],

        counterEvidence: [
          {
            source: "interaction",
            description:
              "성과가 빠르게 나타날 때 확장을 서두를 가능성이 있다.",
            weight: 1,
          },
        ],

        confidence: "high",

        exceptionConditions: [
          "고정비와 부채 부담이 감당 범위를 넘는 경우",
        ],
      },

      secondary: null,
      suppressed: [],
      conflicting: [],
    },

    survivalStyle: {
      primary: {
        style: "push",

        evidence: [
          {
            source: "dayMasterStrength",
            description:
              "압박이 생겼을 때 직접 행동하며 돌파하려는 경향이 확인된다.",
            weight: 3,
          },
          {
            source: "rooting",
            description:
              "문제가 생겨도 쉽게 포기하지 않는 지속력이 확인된다.",
            weight: 2,
          },
        ],

        counterEvidence: [
          {
            source: "interaction",
            description:
              "속도를 높일수록 검토가 부족해질 가능성이 있다.",
            weight: 1,
          },
        ],

        confidence: "high",

        exceptionConditions: [
          "현금흐름이 불안정하고 손실 한도가 정해지지 않은 경우",
        ],
      },

      secondary: null,

      crisisBehavior: [
        "문제가 생기면 직접 해결책을 실행하려 한다.",
        "결정이 내려지면 속도를 높여 상황을 돌파하려 한다.",
      ],

      recoveryMethods: [
        "목표를 작은 실행 단위로 나눈다.",
        "매출과 비용을 짧은 주기로 확인한다.",
      ],

      prohibitedActions: [
        "검증되지 않은 상태에서 고정비를 크게 늘리는 행동",
        "손실 한도 없이 추가 자금을 투입하는 행동",
      ],

      suppressed: [],
      conflicting: [],
    },

    repeatedPattern: {
      primary: {
        pattern: "slowGrowthStable",

        evidence: [
          {
            source: "rooting",
            description:
              "작게 시작하여 경험을 축적할수록 안정성이 높아진다.",
            weight: 3,
          },
          {
            source: "fiveElementFlow",
            description:
              "성과가 단계적으로 연결될 때 지속력이 살아난다.",
            weight: 2,
          },
        ],

        counterEvidence: [
          {
            source: "interaction",
            description:
              "초기 반응이 좋으면 계획보다 빠르게 확장할 가능성이 있다.",
            weight: 1,
          },
        ],

        confidence: "high",

        exceptionConditions: [
          "초기 성과만 보고 운영 규모를 급격히 확대하는 경우",
        ],
      },

      secondary: null,

      repeatedBehaviors: [
        "작게 시작한 뒤 운영 경험을 쌓으며 규모를 늘린다.",
        "반복 수익이 확인될 때 다음 단계로 이동한다.",
      ],

      strengths: [
        "운영 경험이 누적될수록 판단 안정성이 높아진다.",
        "단계적 성장 방식에서 지속력이 살아난다.",
      ],

      risks: [
        "초기 성과가 좋을 때 확장을 서두를 수 있다.",
        "실행에 집중하면서 재무 점검을 뒤로 미룰 수 있다.",
      ],

      suppressed: [],
      conflicting: [],
    },

    capacity,

    money,

    career,

    relationship,

    health,

    blessing,

    destiny,
  };
}

function buildRegressionHumanContext(): HumanDestinyContext {
  const profile = buildRegressionMasterProfile();

  const explanation =
    buildMasterProfileExplanation(profile);

  const humanSummary =
    buildMasterHumanSummary({
      profile,
      explanation,
    });

  return {
    identity: {
      profile,
      explanation,
      humanSummary,
    },

    currentPhase: {
      phase: "growth",
      title: "성장 국면",
      description:
        "현재는 새로운 기회를 실행으로 연결하되, 검증된 범위 안에서 단계적으로 확장해야 하는 국면이다.",
      focusAreas: [
        "소규모 실행",
        "고객 반응 검증",
        "반복 매출 확인",
      ],
      avoidAreas: [
        "과도한 초기 투자",
        "높은 고정비",
        "검증 전 확장",
      ],
    },
  };
}

function buildRegressionLifeContext(): HumanLifeContext {
  return {
    age: 42,
    ageGroup: "forties",

    maritalStatus: "married",
    hasChildren: true,

    occupationStatus: "employed",
    hasActiveBusiness: false,

    financialResponsibility: "high",
  };
}

export function buildDecisionEngineRegressionInput(): DecisionEngineInput {
  const humanContext =
    buildRegressionHumanContext();

  const lifeContext =
    buildRegressionLifeContext();

  const question = readQuestion(
    humanContext,
    BUSINESS_START_QUESTION,
  );

  const questionContext =
    buildQuestionContext(
      question,
    );

  return {
    humanContext,
    lifeContext,
    question,
    questionContext,
  };
}