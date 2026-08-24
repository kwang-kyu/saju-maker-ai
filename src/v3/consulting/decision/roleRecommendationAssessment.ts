import type {
  LifeDriverType,
} from "../../masterReader/types/lifeDriver.js";
import type {
  RepeatedPatternType,
} from "../../masterReader/types/repeatedPattern.js";
import type {
  SurvivalStyleType,
} from "../../masterReader/types/survivalStyle.js";
import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext.js";

export type RoleRecommendationCandidate = {
  key:
    string;

  title:
    string;

  archetype:
    string;

  characterDescription:
    string;

  whyItFits:
    string;

  performanceStyle:
    string;

  strongScenes:
    string;

  dramaticTension:
    string;

  evidenceKeys:
    string[];
};

export type RoleRecommendationAssessment = {
  available:
    boolean;

  recommendationType:
    "personalityArchetype";

  primaryRole:
    RoleRecommendationCandidate;

  candidates:
    [
      RoleRecommendationCandidate,
      RoleRecommendationCandidate,
      RoleRecommendationCandidate,
    ];

  performanceStrengths:
    string[];

  cautionPatterns:
    string[];

  avoidedRolePatterns:
    string[];

  limitations:
    string[];

  sourceLocked:
    true;
};

type ConfidenceLevel =
  | "low"
  | "medium"
  | "high";

type CareerSignal =
  | "leadershipFit-strong"
  | "leadershipFit-moderate"
  | "roleOrientation-strong"
  | "roleOrientation-moderate"
  | "workStyle-strong"
  | "workStyle-moderate"
  | "organizationFit-strong"
  | "organizationFit-moderate"
  | "independenceFit-strong"
  | "independenceFit-moderate"
  | "careerContinuity-strong"
  | "careerContinuity-moderate"
  | "performanceConversion-strong"
  | "performanceConversion-moderate"
  | "career-primaryRole";

type RoleSeed = {
  key:
    string;

  title:
    string;

  archetype:
    string;

  desireLine:
    string;

  presenceLine:
    string;

  compatibleDrivers:
    readonly LifeDriverType[];

  compatibleStyles:
    readonly SurvivalStyleType[];

  compatiblePatterns:
    readonly RepeatedPatternType[];

  compatibleCareerSignals:
    readonly CareerSignal[];

  tensionDrivers?:
    readonly LifeDriverType[];

  tensionStyles?:
    readonly SurvivalStyleType[];

  tensionPatterns?:
    readonly RepeatedPatternType[];
};

type StylePerformanceSeed = {
  performanceStyle:
    string;

  crisisScene:
    string;

  expressionLine:
    string;
};

type PatternNarrativeSeed = {
  narrativeArc:
    string;

  strongScene:
    string;

  tensionLine:
    string;
};

type EvidenceAxis =
  | "lifeDriver"
  | "survivalStyle"
  | "repeatedPattern"
  | "career";

type ScoreContribution = {
  evidenceKey:
    string;

  whyFragment:
    string;

  points:
    number;

  evidenceAxis?:
    EvidenceAxis;

  styleKey?:
    SurvivalStyleType;

  patternKey?:
    RepeatedPatternType;

  tensionText?:
    string;
};

type ScoredRoleSeed = {
  seed:
    RoleSeed;

  totalScore:
    number;

  contributions:
    ScoreContribution[];

  performanceStyleKey:
    SurvivalStyleType;

  narrativePatternKey:
    RepeatedPatternType;

  tensionLines:
    string[];
};

const CONFIDENCE_WEIGHT:
  Record<
    ConfidenceLevel,
    number
  > = {
  low:
    1,

  medium:
    2,

  high:
    3,
};

const PRIMARY_DRIVER_WEIGHT =
  5;

const SECONDARY_DRIVER_WEIGHT =
  2;

const SUPPRESSED_DRIVER_WEIGHT =
  1;

const CONFLICTING_DRIVER_PENALTY =
  2;

const PRIMARY_STYLE_WEIGHT =
  3;

const SECONDARY_STYLE_WEIGHT =
  1.5;

const CONFLICTING_STYLE_PENALTY =
  1.5;

const PRIMARY_PATTERN_WEIGHT =
  3;

const SECONDARY_PATTERN_WEIGHT =
  1.5;

const CONFLICTING_PATTERN_PENALTY =
  1.5;

const CAREER_STRONG_WEIGHT =
  2.5;

const CAREER_MODERATE_WEIGHT =
  1;

const PRIMARY_DRIVER_ARCHETYPE_BONUS =
  2;

const LIFE_DRIVER_CONFLICT_AVOIDANCE:
  Partial<
    Record<
      LifeDriverType,
      string
    >
  > = {
  freedom:
    "규칙과 책임 없이 즉흥만 반복하는 코믹형 인물",

  relationship:
    "감정만으로 관계를 풀어내는 순수 로맨스형 조력자",
};

const REPEATED_PATTERN_CONFLICT_AVOIDANCE:
  Partial<
    Record<
      RepeatedPatternType,
      string
    >
  > = {
  earlySuccessCollapse:
    "초반 한 번의 성공만으로 모든 갈등이 풀리는 단순 승리형 주인공",
};

const ROLE_CATALOG:
  readonly RoleSeed[] = [
    {
      key:
        "driven-leader",

      title:
        "냉철한 조직 리더",

      archetype:
        "목표를 향해 판을 재정비하는 책임자",

      desireLine:
        "성과와 완수를 향해 조직과 상황을 직접 정리하려 한다",

      presenceLine:
        "무대 위에서도 결정과 책임의 무게가 먼저 느껴지는 인물",

      compatibleDrivers:
        [
          "achievement",
          "leadership",
        ],

      compatibleStyles:
        [
          "push",
          "endurance",
          "opportunity",
        ],

      compatiblePatterns:
        [
          "slowGrowthStable",
          "earlySuccessCollapse",
          "responsibilityOverload",
        ],

      compatibleCareerSignals:
        [
          "leadershipFit-strong",
          "leadershipFit-moderate",
          "roleOrientation-strong",
          "career-primaryRole",
        ],

      tensionDrivers:
        [
          "freedom",
          "relationship",
        ],
    },

    {
      key:
        "resource-strategist",

      title:
        "자원을 읽는 전략가",

      archetype:
        "기회와 손익의 흐름을 계산하는 실리형 인물",

      desireLine:
        "이익과 안정을 동시에 확보하려는 계산이 먼저 드러난다",

      presenceLine:
        "대사보다 눈빛과 판단 타이밍으로 상황을 지배하는 인물",

      compatibleDrivers:
        [
          "wealth",
          "stability",
        ],

      compatibleStyles:
        [
          "analysis",
          "stability",
          "opportunity",
        ],

      compatiblePatterns:
        [
          "wealthLeak",
          "slowGrowthStable",
          "distributedAdaptation",
        ],

      compatibleCareerSignals:
        [
          "workStyle-strong",
          "workStyle-moderate",
          "roleOrientation-moderate",
        ],

      tensionDrivers:
        [
          "freedom",
          "creation",
        ],
    },

    {
      key:
        "truth-seeker",

      title:
        "진실을 파고드는 분석가",

      archetype:
        "원리와 단서를 추적하는 탐구형 인물",

      desireLine:
        "표면이 아니라 구조와 이유를 밝히려 한다",

      presenceLine:
        "침묵과 관찰로 긴장을 쌓아 올리는 인물",

      compatibleDrivers:
        [
          "knowledge",
          "creation",
        ],

      compatibleStyles:
        [
          "analysis",
          "learning",
          "independent",
        ],

      compatiblePatterns:
        [
          "lateBloom",
          "slowGrowthStable",
          "distributedAdaptation",
        ],

      compatibleCareerSignals:
        [
          "workStyle-strong",
          "workStyle-moderate",
          "roleOrientation-moderate",
        ],

      tensionDrivers:
        [
          "leadership",
        ],

      tensionStyles:
        [
          "push",
        ],
    },

    {
      key:
        "vision-builder",

      title:
        "새 판을 여는 창조자",

      archetype:
        "기존 틀을 바꾸는 상상력형 인물",

      desireLine:
        "남들이 보지 못한 방식으로 장면을 바꾸려 한다",

      presenceLine:
        "예상 밖의 선택으로 분위기를 전환하는 인물",

      compatibleDrivers:
        [
          "creation",
          "freedom",
          "knowledge",
        ],

      compatibleStyles:
        [
          "independent",
          "opportunity",
          "learning",
        ],

      compatiblePatterns:
        [
          "restartCycle",
          "distributedAdaptation",
          "lateBloom",
        ],

      compatibleCareerSignals:
        [
          "independenceFit-strong",
          "independenceFit-moderate",
          "roleOrientation-moderate",
        ],

      tensionDrivers:
        [
          "stability",
        ],
    },

    {
      key:
        "commanding-figure",

      title:
        "사람을 모으는 지휘자",

      archetype:
        "방향과 명분을 세우는 권위형 인물",

      desireLine:
        "혼란 속에서 기준과 질서를 세우려 한다",

      presenceLine:
        "등장만으로도 판의 중심이 이동하는 인물",

      compatibleDrivers:
        [
          "leadership",
          "achievement",
        ],

      compatibleStyles:
        [
          "push",
          "stability",
          "endurance",
        ],

      compatiblePatterns:
        [
          "responsibilityOverload",
          "earlySuccessCollapse",
          "slowGrowthStable",
        ],

      compatibleCareerSignals:
        [
          "leadershipFit-strong",
          "leadershipFit-moderate",
          "organizationFit-strong",
          "career-primaryRole",
        ],

      tensionDrivers:
        [
          "freedom",
        ],

      tensionStyles:
        [
          "independent",
        ],
    },

    {
      key:
        "bond-weaver",

      title:
        "관계를 잇는 중재자",

      archetype:
        "신뢰와 감정선을 연결하는 조율형 인물",

      desireLine:
        "갈등보다 연결과 이해를 우선하려 한다",

      presenceLine:
        "타인의 마음을 읽으며 장면의 온도를 바꾸는 인물",

      compatibleDrivers:
        [
          "relationship",
          "stability",
        ],

      compatibleStyles:
        [
          "relationship",
          "learning",
          "stability",
        ],

      compatiblePatterns:
        [
          "relationshipLoss",
          "distributedAdaptation",
          "slowGrowthStable",
        ],

      compatibleCareerSignals:
        [
          "organizationFit-moderate",
          "roleOrientation-moderate",
        ],

      tensionStyles:
        [
          "independent",
          "push",
        ],
    },

    {
      key:
        "rule-breaker",

      title:
        "틀을 깨는 자유인",

      archetype:
        "관습과 압력에 맞서는 독립형 인물",

      desireLine:
        "남의 기준보다 자기 길을 고수하려 한다",

      presenceLine:
        "규칙을 거스르는 선택으로 서사를 흔드는 인물",

      compatibleDrivers:
        [
          "freedom",
          "creation",
          "relationship",
        ],

      compatibleStyles:
        [
          "independent",
          "opportunity",
          "push",
          "relationship",
        ],

      compatiblePatterns:
        [
          "restartCycle",
          "opportunityMiss",
          "earlySuccessCollapse",
          "relationshipLoss",
        ],

      compatibleCareerSignals:
        [
          "independenceFit-strong",
          "independenceFit-moderate",
        ],

      tensionDrivers:
        [
          "stability",
          "leadership",
        ],
    },

    {
      key:
        "steadfast-guardian",

      title:
        "질서를 지키는 수호자",

      archetype:
        "무너지지 않는 기준을 지키는 안정형 인물",

      desireLine:
        "변화 속에서도 핵심 원칙을 지키려 한다",

      presenceLine:
        "흔들리는 장면에서도 중심을 잃지 않는 인물",

      compatibleDrivers:
        [
          "stability",
          "relationship",
          "wealth",
        ],

      compatibleStyles:
        [
          "stability",
          "endurance",
          "relationship",
        ],

      compatiblePatterns:
        [
          "slowGrowthStable",
          "responsibilityOverload",
          "lateBloom",
          "relationshipLoss",
        ],

      compatibleCareerSignals:
        [
          "organizationFit-strong",
          "careerContinuity-strong",
          "careerContinuity-moderate",
        ],

      tensionDrivers:
        [
          "freedom",
        ],

      tensionStyles:
        [
          "opportunity",
        ],
    },

    {
      key:
        "crisis-resolver",

      title:
        "무너진 판을 다시 세우는 위기 해결사",

      archetype:
        "붕괴 직후 현장을 정리하는 복구형 인물",

      desireLine:
        "망가진 구조를 다시 작동하게 만들려 한다",

      presenceLine:
        "혼란 속에서도 실무적 판단으로 길을 연 인물",

      compatibleDrivers:
        [
          "achievement",
          "leadership",
          "stability",
        ],

      compatibleStyles:
        [
          "push",
          "endurance",
          "opportunity",
        ],

      compatiblePatterns:
        [
          "restartCycle",
          "earlySuccessCollapse",
          "responsibilityOverload",
          "slowGrowthStable",
        ],

      compatibleCareerSignals:
        [
          "leadershipFit-moderate",
          "workStyle-strong",
          "performanceConversion-strong",
        ],

      tensionDrivers:
        [
          "relationship",
          "freedom",
        ],
    },

    {
      key:
        "veteran-mentor",

      title:
        "끝까지 책임지는 베테랑 선배",

      archetype:
        "겉은 무뚝뚝하지만 후배와 조직을 지키는 숙련형 인물",

      desireLine:
        "자신보다 판과 사람의 지속을 우선하려 한다",

      presenceLine:
        "큰 말 없이도 신뢰를 모으는 묵직한 존재",

      compatibleDrivers:
        [
          "leadership",
          "stability",
          "achievement",
          "relationship",
        ],

      compatibleStyles:
        [
          "endurance",
          "stability",
          "learning",
          "relationship",
        ],

      compatiblePatterns:
        [
          "slowGrowthStable",
          "lateBloom",
          "responsibilityOverload",
          "relationshipLoss",
        ],

      compatibleCareerSignals:
        [
          "careerContinuity-strong",
          "organizationFit-moderate",
          "leadershipFit-moderate",
        ],

      tensionDrivers:
        [
          "freedom",
        ],

      tensionStyles:
        [
          "push",
        ],
    },

    {
      key:
        "principled-antagonist",

      title:
        "원칙과 명분이 강한 권력형 악역",

      archetype:
        "스스로의 기준을 믿고 판을 움직이는 대립형 인물",

      desireLine:
        "자신의 논리와 질서를 관철하려 한다",

      presenceLine:
        "카리스마와 압박으로 장면의 공기를 바꾸는 인물",

      compatibleDrivers:
        [
          "leadership",
          "knowledge",
          "stability",
          "achievement",
        ],

      compatibleStyles:
        [
          "analysis",
          "stability",
          "push",
        ],

      compatiblePatterns:
        [
          "responsibilityOverload",
          "earlySuccessCollapse",
          "wealthLeak",
        ],

      compatibleCareerSignals:
        [
          "leadershipFit-strong",
          "roleOrientation-strong",
        ],

      tensionDrivers:
        [
          "relationship",
          "freedom",
        ],
    },

    {
      key:
        "quiet-strategist",

      title:
        "뒤에서 판을 읽는 숨은 설계자",

      archetype:
        "전면에 서지 않고 흐름을 조율하는 배후형 인물",

      desireLine:
        "드러나는 성과보다 구조의 승리를 노린다",

      presenceLine:
        "적은 대사로도 상황 전체를 움직이는 인물",

      compatibleDrivers:
        [
          "knowledge",
          "wealth",
          "stability",
        ],

      compatibleStyles:
        [
          "analysis",
          "stability",
          "independent",
        ],

      compatiblePatterns:
        [
          "lateBloom",
          "slowGrowthStable",
          "distributedAdaptation",
          "wealthLeak",
        ],

      compatibleCareerSignals:
        [
          "workStyle-strong",
          "workStyle-moderate",
          "roleOrientation-moderate",
        ],

      tensionDrivers:
        [
          "leadership",
        ],

      tensionStyles:
        [
          "push",
        ],
    },
  ];

const DRIVER_NATIVE_ROLE_KEY:
  Record<
    LifeDriverType,
    string
  > = {
  achievement:
    "driven-leader",

  wealth:
    "resource-strategist",

  knowledge:
    "truth-seeker",

  creation:
    "vision-builder",

  leadership:
    "commanding-figure",

  relationship:
    "bond-weaver",

  freedom:
    "rule-breaker",

  stability:
    "steadfast-guardian",
};

const STYLE_PERFORMANCE_SEEDS:
  Record<
    SurvivalStyleType,
    StylePerformanceSeed
  > = {
  push: {
    performanceStyle:
      "압박이 오면 망설임 없이 몸과 목소리를 앞세워 돌파한다",

    crisisScene:
      "위기 직전의 침묵 뒤, 짧고 단호한 대사로 판을 뒤집는 장면",

    expressionLine:
      "표정은 절제하지만 움직임과 시선이 빠르게 방향을 바꾼다",
  },

  analysis: {
    performanceStyle:
      "감정을 드러내기보다 관찰과 계산의 리듬으로 긴장을 만든다",

    crisisScene:
      "단서를 하나씩 짚으며 상대의 허점을 드러내는 대면 장면",

    expressionLine:
      "눈빛과 호흡의 간격으로 심리전을 이끈다",
  },

  relationship: {
    performanceStyle:
      "대사 속에 관계의 온도와 거리를 섬세하게 실어 전달한다",

    crisisScene:
      "갈등 직전, 상대의 마음을 건드리는 짧은 한마디로 분위기를 바꾸는 장면",

    expressionLine:
      "목소리 톤과 시선 처리로 감정선을 조율한다",
  },

  independent: {
    performanceStyle:
      "혼자서도 장면의 중심을 유지하며 결정적 순간을 스스로 만든다",

    crisisScene:
      "주변의 기대와 다른 선택을 혼자 내려 판을 갈라 놓는 장면",

    expressionLine:
      "군중 속에서도 고립된 듯한 존재감으로 연기한다",
  },

  stability: {
    performanceStyle:
      "큰 동작 없이도 무게 있는 자세와 낮은 톤으로 장면을 고정한다",

    crisisScene:
      "모두가 흔들릴 때 유일하게 흔들리지 않는 대사로 균형을 잡는 장면",

    expressionLine:
      "작은 제스처와 낮은 목소리로 신뢰를 쌓는다",
  },

  opportunity: {
    performanceStyle:
      "상황 변화에 빠르게 적응하며 리듬과 표정을 순간적으로 바꾼다",

    crisisScene:
      "예상치 못한 변수가 등장했을 때 즉석에서 판을 재구성하는 장면",

    expressionLine:
      "리액션과 전환 속도로 생동감을 만든다",
  },

  learning: {
    performanceStyle:
      "초반의 망설임에서 후반의 단단함으로 감정 변화를 드러낸다",

    crisisScene:
      "실수나 좌절 이후 스스로 기준을 세우며 다시 일어서는 장면",

    expressionLine:
      "성장이 보이는 호흡과 표정 변화로 인물의 깊이를 만든다",
  },

  endurance: {
    performanceStyle:
      "오래 견디는 호흡과 절제된 감정으로 인물의 무게를 쌓는다",

    crisisScene:
      "끝까지 버티며 상대를 무너뜨리지 않고 자신의 길을 증명하는 장면",

    expressionLine:
      "크게 흔들리지 않는 몸짓 속에 누적된 감정을 담는다",
  },
};

const PATTERN_NARRATIVE_SEEDS:
  Record<
    RepeatedPatternType,
    PatternNarrativeSeed
  > = {
  earlySuccessCollapse: {
    narrativeArc:
      "초반의 빛나는 성과 뒤 균열이 드러나며 재정비하는 서사",

    strongScene:
      "성공 직후의 자만과 붕괴 사이를 오가는 대립 장면",

    tensionLine:
      "빠른 성취와 그 이면의 공허가 동시에 보이는 인물",
  },

  slowGrowthStable: {
    narrativeArc:
      "작게 시작해 경험을 쌓으며 후반에 진짜 무게를 얻는 성장 서사",

    strongScene:
      "무너진 판을 다시 세우거나 오래 쌓은 신뢰가 결정적 한 방으로 드러나는 장면",

    tensionLine:
      "겉은 무뚝뚝하지만 시간이 지날수록 깊어지는 인물",
  },

  relationshipLoss: {
    narrativeArc:
      "관계의 상실과 재연결 사이를 오가는 감정 서사",

    strongScene:
      "믿었던 사람과의 갈등, 혹은 다시 마주하는 침묵의 장면",

    tensionLine:
      "연결을 원하지만 상처 때문에 거리를 두는 인물",
  },

  wealthLeak: {
    narrativeArc:
      "얻은 것을 지키지 못하거나 새로 잃을까 두려워하는 서사",

    strongScene:
      "자원과 신뢰가 동시에 흔들리는 선택의 기로",

    tensionLine:
      "겉으로는 여유로워 보이지만 내부에 긴장을 품은 인물",
  },

  restartCycle: {
    narrativeArc:
      "무너진 뒤 다시 시작하며 기준을 재정립하는 재기 서사",

    strongScene:
      "과거를 끊고 새 출발을 선언하는 결단 장면",

    tensionLine:
      "실패의 그림자와 새로운 의지가 공존하는 인물",
  },

  responsibilityOverload: {
    narrativeArc:
      "책임이 쌓여 한계에 다다르는 압박 서사",

    strongScene:
      "모두의 기대를 떠안은 채 혼자 버티거나 한계를 인정하는 장면",

    tensionLine:
      "책임감이 강점이자 무거운 짐이 되는 인물",
  },

  lateBloom: {
    narrativeArc:
      "늦게 빛나지만 그만큼 깊은 성취를 이루는 서사",

    strongScene:
      "오랜 준비 끝에 실력이 처음으로 인정받는 결정적 장면",

    tensionLine:
      "인정받기 전까지의 인내와 후반의 폭발적 존재감",
  },

  opportunityMiss: {
    narrativeArc:
      "기회를 놓치거나 다시 잡으려 애쓰는 서사",

    strongScene:
      "결정적 순간의 망설임과 그 뒤를 쫓는 장면",

    tensionLine:
      "능력은 있지만 타이밍과 선택 사이에서 흔들리는 인물",
  },

  distributedAdaptation: {
    narrativeArc:
      "여러 역할을 오가며 상황에 맞게 자신을 바꾸는 적응 서사",

    strongScene:
      "한 장면에서 다른 얼굴을 보여 주며 판을 흔드는 변신 장면",

    tensionLine:
      "다면적이지만 어느 모습이 진짜인지 궁금해지는 인물",
  },
};

const CAREER_AREA_SIGNALS:
  readonly {
    area:
      | "leadershipFit"
      | "roleOrientation"
      | "workStyle"
      | "organizationFit"
      | "independenceFit"
      | "careerContinuity"
      | "performanceConversion";

    evidenceKey:
      string;
  }[] = [
    {
      area:
        "leadershipFit",

      evidenceKey:
        "career-leadershipFit",
    },

    {
      area:
        "roleOrientation",

      evidenceKey:
        "career-roleOrientation",
    },

    {
      area:
        "workStyle",

      evidenceKey:
        "career-workStyle",
    },

    {
      area:
        "organizationFit",

      evidenceKey:
        "career-organizationFit",
    },

    {
      area:
        "independenceFit",

      evidenceKey:
        "career-independenceFit",
    },

    {
      area:
        "careerContinuity",

      evidenceKey:
        "career-careerContinuity",
    },

    {
      area:
        "performanceConversion",

      evidenceKey:
        "career-performanceConversion",
    },
  ];

function classifyEvidenceAxis(
  evidenceKey:
    string,
):
  | EvidenceAxis
  | null {
  if (
    evidenceKey
      .startsWith(
        "lifeDriver-",
      )
  ) {
    return "lifeDriver";
  }

  if (
    evidenceKey
      .startsWith(
        "survivalStyle-",
      )
  ) {
    return "survivalStyle";
  }

  if (
    evidenceKey
      .startsWith(
        "repeatedPattern-",
      )
  ) {
    return "repeatedPattern";
  }

  if (
    evidenceKey
      .startsWith(
        "career-",
      )
  ) {
    return "career";
  }

  return null;
}

function withEvidenceAxis(
  contribution:
    ScoreContribution,
): ScoreContribution {
  return {
    ...contribution,

    evidenceAxis:
      contribution.evidenceAxis
      ?? classifyEvidenceAxis(
        contribution.evidenceKey,
      )
      ?? undefined,
  };
}

function addContribution(
  contributions:
    ScoreContribution[],
  contribution:
    ScoreContribution,
): void {
  contributions.push(
    withEvidenceAxis(
      contribution,
    ),
  );
}

function collectPositiveEvidenceAxes(
  contributions:
    ScoreContribution[],
): Set<
  EvidenceAxis
> {
  const axes =
    new Set<
      EvidenceAxis
    >();

  for (
    const contribution of contributions
  ) {
    if (
      contribution.points
      <= 0
    ) {
      continue;
    }

    const axis =
      contribution.evidenceAxis
      ?? classifyEvidenceAxis(
        contribution.evidenceKey,
      );

    if (
      axis
    ) {
      axes.add(
        axis,
      );
    }
  }

  return axes;
}

function countPositiveEvidenceAxes(
  contributions:
    ScoreContribution[],
): number {
  return collectPositiveEvidenceAxes(
    contributions,
  ).size;
}

function hasNonLifeDriverPositiveEvidenceAxis(
  contributions:
    ScoreContribution[],
): boolean {
  for (
    const axis of collectPositiveEvidenceAxes(
      contributions,
    )
  ) {
    if (
      axis
      !== "lifeDriver"
    ) {
      return true;
    }
  }

  return false;
}

function shouldExcludeLowConfidenceDriverOnlyCandidate(
  scored:
    ScoredRoleSeed,
  profile:
    HumanDestinyContext["identity"]["profile"],
): boolean {
  if (
    profile
      .lifeDriver
      .primary
      .confidence
    !== "low"
  ) {
    return false;
  }

  return !hasNonLifeDriverPositiveEvidenceAxis(
    scored.contributions,
  );
}

function scoreDriverMatch(
  seed:
    RoleSeed,
  driver:
    LifeDriverType,
  confidence:
    ConfidenceLevel,
  weight:
    number,
  evidenceKey:
    string,
  whyFragment:
    string,
  contributions:
    ScoreContribution[],
): number {
  if (
    !seed
      .compatibleDrivers
      .includes(
        driver,
      )
  ) {
    return 0;
  }

  const points =
    CONFIDENCE_WEIGHT[
      confidence
    ]
    * weight;

  addContribution(
    contributions,
    {
      evidenceKey,
      whyFragment,
      points,
    },
  );

  return points;
}

function scoreStyleMatch(
  seed:
    RoleSeed,
  style:
    SurvivalStyleType,
  confidence:
    ConfidenceLevel,
  weight:
    number,
  evidenceKey:
    string,
  whyFragment:
    string,
  contributions:
    ScoreContribution[],
): number {
  if (
    !seed
      .compatibleStyles
      .includes(
        style,
      )
  ) {
    return 0;
  }

  const points =
    CONFIDENCE_WEIGHT[
      confidence
    ]
    * weight;

  addContribution(
    contributions,
    {
      evidenceKey,
      whyFragment,
      points,
      styleKey:
        style,
    },
  );

  return points;
}

function scorePatternMatch(
  seed:
    RoleSeed,
  pattern:
    RepeatedPatternType,
  confidence:
    ConfidenceLevel,
  weight:
    number,
  evidenceKey:
    string,
  whyFragment:
    string,
  contributions:
    ScoreContribution[],
): number {
  if (
    !seed
      .compatiblePatterns
      .includes(
        pattern,
      )
  ) {
    return 0;
  }

  const points =
    CONFIDENCE_WEIGHT[
      confidence
    ]
    * weight;

  addContribution(
    contributions,
    {
      evidenceKey,
      whyFragment,
      points,
      patternKey:
        pattern,
    },
  );

  return points;
}

function applyConflictingDriver(
  seed:
    RoleSeed,
  driver:
    LifeDriverType,
  confidence:
    ConfidenceLevel,
  whyFragment:
    string,
  contributions:
    ScoreContribution[],
  tensionLines:
    string[],
): number {
  const compatible =
    seed
      .compatibleDrivers
      .includes(
        driver,
      );

  const tension =
    seed
      .tensionDrivers
      ?.includes(
        driver,
      )
    ?? false;

  if (
    !compatible
    && !tension
  ) {
    return 0;
  }

  const penalty =
    CONFIDENCE_WEIGHT[
      confidence
    ]
    * CONFLICTING_DRIVER_PENALTY;

  addContribution(
    contributions,
    {
      evidenceKey:
        `lifeDriver-conflicting-${driver}`,

      whyFragment,

      points:
        -penalty,

      tensionText:
        `${whyFragment}과(와) 이 배역의 핵심 동력이 긴장 관계에 놓인다.`,
    },
  );

  if (
    tension
    || compatible
  ) {
    tensionLines.push(
      `${whyFragment}과(와) 공존하며 판을 흔드는 이중성`,
    );
  }

  return -penalty;
}

function applyConflictingStyle(
  seed:
    RoleSeed,
  style:
    SurvivalStyleType,
  confidence:
    ConfidenceLevel,
  whyFragment:
    string,
  contributions:
    ScoreContribution[],
  tensionLines:
    string[],
): number {
  const compatible =
    seed
      .compatibleStyles
      .includes(
        style,
      );

  const tension =
    seed
      .tensionStyles
      ?.includes(
        style,
      )
    ?? false;

  if (
    !compatible
    && !tension
  ) {
    return 0;
  }

  const penalty =
    CONFIDENCE_WEIGHT[
      confidence
    ]
    * CONFLICTING_STYLE_PENALTY;

  addContribution(
    contributions,
    {
      evidenceKey:
        `survivalStyle-conflicting-${style}`,

      whyFragment,

      points:
        -penalty,

      tensionText:
        `${whyFragment} 방식과 이 배역의 연기 리듬이 충돌할 수 있다.`,
    },
  );

  tensionLines.push(
    `${whyFragment} 대응과 배역의 표현 방식이 부딪히는 장면`,
  );

  return -penalty;
}

function applyConflictingPattern(
  seed:
    RoleSeed,
  pattern:
    RepeatedPatternType,
  confidence:
    ConfidenceLevel,
  whyFragment:
    string,
  contributions:
    ScoreContribution[],
  tensionLines:
    string[],
): number {
  const compatible =
    seed
      .compatiblePatterns
      .includes(
        pattern,
      );

  const tension =
    seed
      .tensionPatterns
      ?.includes(
        pattern,
      )
    ?? false;

  if (
    !compatible
    && !tension
  ) {
    return 0;
  }

  const penalty =
    CONFIDENCE_WEIGHT[
      confidence
    ]
    * CONFLICTING_PATTERN_PENALTY;

  addContribution(
    contributions,
    {
      evidenceKey:
        `repeatedPattern-conflicting-${pattern}`,

      whyFragment,

      points:
        -penalty,

      tensionText:
        `${whyFragment} 서사와 이 배역의 갈등선이 엇갈릴 수 있다.`,
    },
  );

  tensionLines.push(
    `${whyFragment} 반복과 배역의 서사 리듬이 교차하는 긴장`,
  );

  return -penalty;
}

function scoreCareerSignals(
  seed:
    RoleSeed,
  humanContext:
    HumanDestinyContext,
  contributions:
    ScoreContribution[],
): number {
  const career =
    humanContext
      .identity
      .profile
      .career;

  let total =
    0;

  for (
    const {
      area,
      evidenceKey,
    } of CAREER_AREA_SIGNALS
  ) {
    const judgement =
      career[area];

    if (
      !judgement.level
      || (
        judgement.level
        !== "strong"
        && judgement.level
        !== "moderate"
      )
    ) {
      continue;
    }

    const signal =
      `${area}-${judgement.level}` as CareerSignal;

    if (
      !seed
        .compatibleCareerSignals
        .includes(
          signal,
        )
    ) {
      continue;
    }

    const baseWeight =
      judgement.level
      === "strong"
        ? CAREER_STRONG_WEIGHT
        : CAREER_MODERATE_WEIGHT;

    const points =
      baseWeight
      * CONFIDENCE_WEIGHT[
        judgement.confidence
      ];

    const interpretationLine =
      judgement
        .interpretation
        ?.corePattern
      ?? area;

    addContribution(
      contributions,
      {
        evidenceKey,

        whyFragment:
          interpretationLine,

        points,
      },
    );

    total +=
      points;
  }

  if (
    career
      .interpretation
      ?.primaryRole
    && seed
      .compatibleCareerSignals
      .includes(
        "career-primaryRole",
      )
  ) {
    const points =
      CAREER_MODERATE_WEIGHT
      * 2;

    addContribution(
      contributions,
      {
        evidenceKey:
          "career-primaryRole",

        whyFragment:
          career
            .interpretation
            .primaryRole,

        points,
      },
    );

    total +=
      points;
  }

  return total;
}

function pickBestStyleKey(
  contributions:
    ScoreContribution[],
  fallback:
    SurvivalStyleType,
): SurvivalStyleType {
  const styleContributions =
    contributions
      .filter(
        (
          contribution,
        ) =>
          contribution.points
          > 0
          && contribution.styleKey,
      )
      .sort(
        (
          left,
          right,
        ) =>
          right.points
          - left.points,
      );

  return styleContributions[0]
    ?.styleKey
    ?? fallback;
}

function pickBestPatternKey(
  contributions:
    ScoreContribution[],
  fallback:
    RepeatedPatternType,
): RepeatedPatternType {
  const patternContributions =
    contributions
      .filter(
        (
          contribution,
        ) =>
          contribution.points
          > 0
          && contribution.patternKey,
      )
      .sort(
        (
          left,
          right,
        ) =>
          right.points
          - left.points,
      );

  return patternContributions[0]
    ?.patternKey
    ?? fallback;
}

function scoreRoleSeed(
  seed:
    RoleSeed,
  humanContext:
    HumanDestinyContext,
): ScoredRoleSeed {
  const profile =
    humanContext
      .identity
      .profile;

  const explanation =
    humanContext
      .identity
      .explanation;

  const contributions:
    ScoreContribution[] =
      [];

  const tensionLines:
    string[] =
      [];

  let totalScore =
    0;

  totalScore +=
    scoreDriverMatch(
      seed,
      profile
        .lifeDriver
        .primary
        .driver,
      profile
        .lifeDriver
        .primary
        .confidence,
      PRIMARY_DRIVER_WEIGHT,
      `lifeDriver-${profile.lifeDriver.primary.driver}`,
      profile
        .lifeDriver
        .primary
        .interpretation
        ?.mode
      ?? explanation
        .lifeDriver
        .title,
      contributions,
    );

  if (
    profile
      .lifeDriver
      .secondary
  ) {
    totalScore +=
      scoreDriverMatch(
        seed,
        profile
          .lifeDriver
          .secondary
          .driver,
        profile
          .lifeDriver
          .secondary
          .confidence,
        SECONDARY_DRIVER_WEIGHT,
        `lifeDriver-secondary-${profile.lifeDriver.secondary.driver}`,
        profile
          .lifeDriver
          .secondary
          .interpretation
          ?.mode
        ?? explanation
          .lifeDriver
          .title,
        contributions,
      );
  }

  for (
    const suppressed of profile
      .lifeDriver
      .suppressed
  ) {
    totalScore +=
      scoreDriverMatch(
        seed,
        suppressed.driver,
        suppressed.confidence,
        SUPPRESSED_DRIVER_WEIGHT,
        `lifeDriver-suppressed-${suppressed.driver}`,
        suppressed
          .interpretation
          ?.mode
        ?? suppressed.driver,
        contributions,
      );
  }

  for (
    const conflicting of profile
      .lifeDriver
      .conflicting
  ) {
    totalScore +=
      applyConflictingDriver(
        seed,
        conflicting.driver,
        conflicting.confidence,
        conflicting
          .interpretation
          ?.mode
        ?? conflicting.driver,
        contributions,
        tensionLines,
      );
  }

  totalScore +=
    scoreStyleMatch(
      seed,
      profile
        .survivalStyle
        .primary
        .style,
      profile
        .survivalStyle
        .primary
        .confidence,
      PRIMARY_STYLE_WEIGHT,
      `survivalStyle-${profile.survivalStyle.primary.style}`,
      explanation
        .survivalStyle
        .primary
        .title,
      contributions,
    );

  if (
    profile
      .survivalStyle
      .secondary
  ) {
    totalScore +=
      scoreStyleMatch(
        seed,
        profile
          .survivalStyle
          .secondary
          .style,
        profile
          .survivalStyle
          .secondary
          .confidence,
        SECONDARY_STYLE_WEIGHT,
        `survivalStyle-secondary-${profile.survivalStyle.secondary.style}`,
        explanation
          .survivalStyle
          .secondary
          ?.title
        ?? STYLE_PERFORMANCE_SEEDS[
          profile
            .survivalStyle
            .secondary
            .style
        ].performanceStyle,
        contributions,
      );
  }

  for (
    const conflicting of profile
      .survivalStyle
      .conflicting
  ) {
    totalScore +=
      applyConflictingStyle(
        seed,
        conflicting.style,
        conflicting.confidence,
        conflicting.style,
        contributions,
        tensionLines,
      );
  }

  totalScore +=
    scorePatternMatch(
      seed,
      profile
        .repeatedPattern
        .primary
        .pattern,
      profile
        .repeatedPattern
        .primary
        .confidence,
      PRIMARY_PATTERN_WEIGHT,
      `repeatedPattern-${profile.repeatedPattern.primary.pattern}`,
      explanation
        .repeatedPattern
        .primary
        .title,
      contributions,
    );

  if (
    profile
      .repeatedPattern
      .secondary
  ) {
    totalScore +=
      scorePatternMatch(
        seed,
        profile
          .repeatedPattern
          .secondary
          .pattern,
        profile
          .repeatedPattern
          .secondary
          .confidence,
        SECONDARY_PATTERN_WEIGHT,
        `repeatedPattern-secondary-${profile.repeatedPattern.secondary.pattern}`,
        explanation
          .repeatedPattern
          .secondary
          ?.title
        ?? PATTERN_NARRATIVE_SEEDS[
          profile
            .repeatedPattern
            .secondary
            .pattern
        ].narrativeArc,
        contributions,
      );
  }

  for (
    const conflicting of profile
      .repeatedPattern
      .conflicting
  ) {
    totalScore +=
      applyConflictingPattern(
        seed,
        conflicting.pattern,
        conflicting.confidence,
        conflicting.pattern,
        contributions,
        tensionLines,
      );
  }

  totalScore +=
    scoreCareerSignals(
      seed,
      humanContext,
      contributions,
    );

  if (
    seed.key
    === DRIVER_NATIVE_ROLE_KEY[
      profile
        .lifeDriver
        .primary
        .driver
    ]
  ) {
    totalScore +=
      PRIMARY_DRIVER_ARCHETYPE_BONUS;

    addContribution(
      contributions,
      {
        evidenceKey:
          `lifeDriver-native-${profile.lifeDriver.primary.driver}`,

        whyFragment:
          seed.archetype,

        points:
          PRIMARY_DRIVER_ARCHETYPE_BONUS,
      },
    );
  }

  const performanceStyleKey =
    pickBestStyleKey(
      contributions,
      profile
        .survivalStyle
        .primary
        .style,
    );

  const narrativePatternKey =
    pickBestPatternKey(
      contributions,
      profile
        .repeatedPattern
        .primary
        .pattern,
    );

  return {
    seed,
    totalScore,
    contributions,
    performanceStyleKey,
    narrativePatternKey,
    tensionLines,
  };
}

function rankRoleSeeds(
  humanContext:
    HumanDestinyContext,
): ScoredRoleSeed[] {
  const profile =
    humanContext
      .identity
      .profile;

  const scoredRoles =
    ROLE_CATALOG
      .map(
        (
          seed,
        ) =>
          scoreRoleSeed(
            seed,
            humanContext,
          ),
      )
      .filter(
        (
          scored,
        ) => {
          const positiveContributions =
            scored
              .contributions
              .filter(
                (
                  contribution,
                ) =>
                  contribution.points
                  > 0,
              );

          const positiveEvidenceAxisCount =
            countPositiveEvidenceAxes(
              scored.contributions,
            );

          return (
            scored.totalScore
            > 0
            && positiveContributions
              .length
            > 0
            && positiveEvidenceAxisCount
            >= 2
          );
        },
      )
      .sort(
        (
          left,
          right,
        ) => {
          if (
            right.totalScore
            !== left.totalScore
          ) {
            return (
              right.totalScore
              - left.totalScore
            );
          }

          return left
            .seed
            .key
            .localeCompare(
              right
                .seed
                .key,
              "en",
            );
        },
      );

  const ranked:
    ScoredRoleSeed[] =
      [];

  for (
    const scored of scoredRoles
  ) {
    if (
      shouldExcludeLowConfidenceDriverOnlyCandidate(
        scored,
        profile,
      )
    ) {
      continue;
    }

    if (
      ranked.some(
        (
          existing,
        ) =>
          existing
            .seed
            .key
          === scored
            .seed
            .key,
      )
    ) {
      continue;
    }

    ranked.push(
      scored,
    );

    if (
      ranked.length
      >= 3
    ) {
      break;
    }
  }

  return ranked;
}

export function rankRoleRecommendationSeeds(
  humanContext:
    HumanDestinyContext,
): ScoredRoleSeed[] {
  return rankRoleSeeds(
    humanContext,
  );
}

function buildWhyItFits(
  contributions:
    ScoreContribution[],
): string {
  return contributions
    .filter(
      (
        contribution,
      ) =>
        contribution.points
        > 0,
    )
    .sort(
      (
        left,
        right,
      ) =>
        right.points
        - left.points,
    )
    .map(
      (
        contribution,
      ) =>
        contribution.whyFragment,
    )
    .filter(
      (
        fragment,
        index,
        fragments,
      ) =>
        fragments.indexOf(
          fragment,
        )
        === index,
    )
    .join(" ");
}

function buildEvidenceKeys(
  contributions:
    ScoreContribution[],
): string[] {
  return contributions
    .filter(
      (
        contribution,
      ) =>
        contribution.points
        > 0,
    )
    .sort(
      (
        left,
        right,
      ) =>
        right.points
        - left.points,
      )
    .map(
      (
        contribution,
      ) =>
        contribution.evidenceKey,
    )
    .filter(
      (
        key,
        index,
        keys,
      ) =>
        keys.indexOf(
          key,
        )
        === index,
    );
}

function composeCandidateFromScore(
  scored:
    ScoredRoleSeed,
  rankSuffix:
    string,
): RoleRecommendationCandidate {
  const styleSeed =
    STYLE_PERFORMANCE_SEEDS[
      scored.performanceStyleKey
    ];

  const patternSeed =
    PATTERN_NARRATIVE_SEEDS[
      scored.narrativePatternKey
    ];

  const positiveContributions =
    scored
      .contributions
      .filter(
        (
          contribution,
        ) =>
          contribution.points
          > 0,
      );

  const evidenceKeys =
    buildEvidenceKeys(
      scored.contributions,
    );

  const tensionFromContributions =
    scored
      .contributions
      .filter(
        (
          contribution,
        ) =>
          contribution.tensionText,
      )
      .map(
        (
          contribution,
        ) =>
          contribution.tensionText!,
      );

  const dramaticTension =
    [
      patternSeed.tensionLine,
      ...scored.tensionLines,
      ...tensionFromContributions,
    ]
      .filter(
        (
          line,
          index,
          lines,
        ) =>
          Boolean(line)
          && lines.indexOf(
            line,
          )
          === index,
      )
      .join(" ");

  return {
    key:
      `${scored.seed.key}-${rankSuffix}`,

    title:
      scored.seed.title,

    archetype:
      scored.seed.archetype,

    characterDescription:
      [
        scored.seed.presenceLine,
        scored.seed.desireLine,
        patternSeed.narrativeArc,
      ].join(" "),

    whyItFits:
      buildWhyItFits(
        positiveContributions,
      ),

    performanceStyle:
      [
        styleSeed.performanceStyle,
        styleSeed.expressionLine,
      ].join(" "),

    strongScenes:
      [
        styleSeed.crisisScene,
        patternSeed.strongScene,
      ].join(" "),

    dramaticTension,

    evidenceKeys,
  };
}

function buildCandidateSet(
  humanContext:
    HumanDestinyContext,
): [
  RoleRecommendationCandidate,
  RoleRecommendationCandidate,
  RoleRecommendationCandidate,
] {
  const ranked =
    rankRoleSeeds(
      humanContext,
    );

  if (
    ranked.length
    < 3
  ) {
    throw new Error(
      "roleRecommendationAssessment: could not derive three distinct scored role candidates.",
    );
  }

  return [
    composeCandidateFromScore(
      ranked[0],
      "primary",
    ),
    composeCandidateFromScore(
      ranked[1],
      "secondary",
    ),
    composeCandidateFromScore(
      ranked[2],
      "tertiary",
    ),
  ];
}

function buildAvoidedRolePatterns(
  humanContext:
    HumanDestinyContext,
): string[] {
  const profile =
    humanContext
      .identity
      .profile;

  const avoided:
    string[] = [];

  for (
    const caution of humanContext
      .identity
      .humanSummary
      .cautions
      .slice(
        0,
        3,
      )
  ) {
    avoided.push(
      `${caution} 성향이 과장되어 보이는 일차원적 영웅형`,
    );
  }

  for (
    const conflicting of profile
      .lifeDriver
      .conflicting
  ) {
    const mapped =
      LIFE_DRIVER_CONFLICT_AVOIDANCE[
        conflicting.driver
      ];

    if (
      mapped
    ) {
      avoided.push(
        mapped,
      );
      continue;
    }

    avoided.push(
      `${conflicting
        .interpretation
        ?.mode
      ?? conflicting.driver} 동력만으로 판을 이끄는 편향된 인물`,
    );
  }

  for (
    const conflicting of profile
      .survivalStyle
      .conflicting
  ) {
    avoided.push(
      `${conflicting.style} 방식만 반복해 깊이 없이 보이는 단면적 연기`,
    );
  }

  for (
    const conflicting of profile
      .repeatedPattern
      .conflicting
  ) {
    const mapped =
      REPEATED_PATTERN_CONFLICT_AVOIDANCE[
        conflicting.pattern
      ];

    if (
      mapped
    ) {
      avoided.push(
        mapped,
      );
      continue;
    }

    const patternSeed =
      PATTERN_NARRATIVE_SEEDS[
        conflicting.pattern
      ];

    avoided.push(
      `${patternSeed
        ?.narrativeArc
      ?? conflicting.pattern}만 반복하는 편향된 서사형 인물`,
    );
  }

  for (
    const seed of ROLE_CATALOG
  ) {
    const scored =
      scoreRoleSeed(
        seed,
        humanContext,
      );

    for (
      const contribution of scored.contributions
    ) {
      if (
        contribution.points
        < 0
        && contribution.tensionText
      ) {
        avoided.push(
          contribution.tensionText,
        );
      }
    }
  }

  return [
    ...new Set(
      avoided,
    ),
  ].slice(
    0,
    3,
  );
}

function buildLimitations(
  humanContext:
    HumanDestinyContext,
): string[] {
  const limitations:
    string[] = [];

  const profile =
    humanContext
      .identity
      .profile;

  if (
    profile
      .lifeDriver
      .primary
      .confidence
    === "low"
  ) {
    limitations.push(
      "lifeDriver 근거 신뢰도가 낮아 욕망 축만으로 대표 배역을 단정하지 않았다.",
    );
  }

  if (
    profile
      .survivalStyle
      .primary
      .confidence
    === "low"
  ) {
    limitations.push(
      "survivalStyle 근거 신뢰도가 낮아 위기 대응 연기 방식은 보조 설명으로만 반영했다.",
    );
  }

  if (
    profile
      .repeatedPattern
      .primary
      .confidence
    === "low"
  ) {
    limitations.push(
      "repeatedPattern 근거 신뢰도가 낮아 서사·갈등 해석은 제한적으로 반영했다.",
    );
  }

  if (
    profile
      .lifeDriver
      .conflicting
      .length
    > 0
  ) {
    limitations.push(
      "lifeDriver 축에 상충하는 동력이 있어 한쪽 성향만 강조하지 않았다.",
    );
  }

  if (
    profile
      .survivalStyle
      .conflicting
      .length
    > 0
  ) {
    limitations.push(
      "survivalStyle 축에 상충하는 대응 방식이 있어 연기 리듬을 단일하게 고정하지 않았다.",
    );
  }

  if (
    profile
      .repeatedPattern
      .conflicting
      .length
    > 0
  ) {
    limitations.push(
      "repeatedPattern 축에 상충하는 반복 서사가 있어 갈등선을 단일하게 고정하지 않았다.",
    );
  }

  return limitations;
}

export function assessRoleRecommendation(
  humanContext:
    HumanDestinyContext | null
    | undefined,
): RoleRecommendationAssessment {
  if (
    !humanContext
  ) {
    return {
      available:
        false,

      recommendationType:
        "personalityArchetype",

      primaryRole:
        {
          key:
            "unavailable",

          title:
            "계산 불가",

          archetype:
            "HumanDestinyContext 없음",

          characterDescription:
            "사주 성격 자료가 없어 배역 추천을 계산할 수 없다.",

          whyItFits:
            "",

          performanceStyle:
            "",

          strongScenes:
            "",

          dramaticTension:
            "",

          evidenceKeys:
            [],
        },

      candidates:
        [
          {
            key:
              "unavailable-1",

            title:
              "계산 불가",

            archetype:
              "HumanDestinyContext 없음",

            characterDescription:
              "",

            whyItFits:
              "",

            performanceStyle:
              "",

            strongScenes:
              "",

            dramaticTension:
              "",

            evidenceKeys:
              [],
          },
          {
            key:
              "unavailable-2",

            title:
              "계산 불가",

            archetype:
              "HumanDestinyContext 없음",

            characterDescription:
              "",

            whyItFits:
              "",

            performanceStyle:
              "",

            strongScenes:
              "",

            dramaticTension:
              "",

            evidenceKeys:
              [],
          },
          {
            key:
              "unavailable-3",

            title:
              "계산 불가",

            archetype:
              "HumanDestinyContext 없음",

            characterDescription:
              "",

            whyItFits:
              "",

            performanceStyle:
              "",

            strongScenes:
              "",

            dramaticTension:
              "",

            evidenceKeys:
              [],
          },
        ],

      performanceStrengths:
        [],

      cautionPatterns:
        [],

      avoidedRolePatterns:
        [],

      limitations:
        [
          "HumanDestinyContext가 없어 role recommendation을 계산할 수 없다.",
        ],

      sourceLocked:
        true,
    };
  }

  const candidates =
    buildCandidateSet(
      humanContext,
    );

  const primaryRole =
    candidates[0];

  const performanceStrengths =
    humanContext
      .identity
      .humanSummary
      .strengths
      .slice(
        0,
        3,
      );

  const cautionPatterns =
    humanContext
      .identity
      .humanSummary
      .cautions
      .slice(
        0,
        3,
      );

  return {
    available:
      true,

    recommendationType:
      "personalityArchetype",

    primaryRole,

    candidates,

    performanceStrengths,

    cautionPatterns,

    avoidedRolePatterns:
      buildAvoidedRolePatterns(
        humanContext,
      ),

    limitations:
      buildLimitations(
        humanContext,
      ),

    sourceLocked:
      true,
  };
}
