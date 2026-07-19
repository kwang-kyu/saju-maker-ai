import {
  readCapacity,
} from "../../masterReader/readers/capacityReader";
import {
  readCareer,
} from "../../masterReader/readers/careerReader";
import {
  readHealth,
} from "../../masterReader/readers/healthReader";
import {
  readMoney,
} from "../../masterReader/readers/moneyReader";
import {
  readRelationship,
} from "../../masterReader/readers/relationshipReader";
import {
  buildMasterHumanSummary,
} from "../../masterReader/readers/masterHumanSummaryBuilder";
import {
  buildMasterProfileExplanation,
} from "../../masterReader/readers/masterProfileExplanationBuilder";
import type {
  MasterProfile,
} from "../../masterReader/types/masterProfile";
import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext";
import type {
  SajuStructureFact,
} from "../../types/sajuFacts";
import {
  verifyQuestionContextBuilder,
} from "./questionContextBuilderVerification";

const VERIFICATION_STRUCTURE_FACTS: SajuStructureFact[] = [
  {
    category: "dayMasterStrength",
    description:
      "자기 힘과 외부 부담이 균형을 이루어 책임과 관계를 안정적으로 유지할 수 있다.",
    strength: "strong",
    confidence: "strong",
    conditions: [
      "책임과 역할 범위가 명확할 것",
    ],
    exceptions: [
      "동시에 지나치게 많은 책임을 맡는 경우",
    ],
    signal: {
      kind: "dayMasterStrength",
      type: "balanced",
      score: 1,
      supportScore: 6,
      opposingScore: 5,
      monthCommandScore: 2,
      rootingScore: 2,
    },
  },

  {
    category: "rooting",
    description:
      "내부 기반과 버팀력이 있어 책임과 위험을 일정 기간 유지할 수 있다.",
    strength: "strong",
    confidence: "strong",
    conditions: [
      "실행 범위를 단계적으로 확장할 것",
    ],
    exceptions: [
      "감당 범위를 넘어 책임을 급격히 확대하는 경우",
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
      "재물과 역할이 한쪽으로 치우치지 않아 자원 관리와 관계 조율이 가능하다.",
    strength: "strong",
    confidence: "strong",
    conditions: [
      "역할과 자원 배분 기준을 명확히 할 것",
    ],
    exceptions: [
      "특정 관계나 자원에 지나치게 집중하는 경우",
    ],
    signal: {
      kind: "tenGodDominance",
      dominantTenGod: "정재",
      dominantCount: 2,
      totalCount: 8,
      counts: {
        비견: 1,
        겁재: 1,
        식신: 1,
        상관: 1,
        정재: 2,
        정관: 1,
        정인: 1,
      },
      distributed: true,
    },
  },

  {
    category: "monthCommand",
    description:
      "환경적 지원이 있어 시간을 두고 안정적으로 실행을 이어갈 수 있다.",
    strength: "strong",
    confidence: "strong",
    conditions: [
      "단기 성과보다 지속성을 우선할 것",
    ],
    exceptions: [
      "검증 없이 실행 속도만 높이는 경우",
    ],
    signal: {
      kind: "monthCommand",
      season: "spring",
      supported: true,
      dayMasterElement: "wood",
    },
  },
];

function buildVerificationHumanContext():
  HumanDestinyContext {
  const capacity = readCapacity(
    VERIFICATION_STRUCTURE_FACTS,
  );
  const money = readMoney(
    VERIFICATION_STRUCTURE_FACTS,
  );
  const career = readCareer(
    VERIFICATION_STRUCTURE_FACTS,
  );
  const health =
  readHealth(
    VERIFICATION_STRUCTURE_FACTS,
  );
  const relationship =
  readRelationship(
    VERIFICATION_STRUCTURE_FACTS,
  );
  const profile: MasterProfile = {
    lifeDriver: {
      primary: {
        driver: "achievement",
        interpretation: null,
        evidence: [],
        counterEvidence: [],
        confidence: "high",
        exceptionConditions: [],
      },
      secondary: null,
      suppressed: [],
      conflicting: [],
    },

    survivalStyle: {
      primary: {
        style: "push",
        evidence: [],
        counterEvidence: [],
        confidence: "high",
        exceptionConditions: [],
      },
      secondary: null,
      crisisBehavior: [],
      recoveryMethods: [],
      prohibitedActions: [],
      suppressed: [],
      conflicting: [],
    },

    repeatedPattern: {
      primary: {
        pattern: "slowGrowthStable",
        evidence: [],
        counterEvidence: [],
        confidence: "high",
        exceptionConditions: [],
      },
      secondary: null,
      repeatedBehaviors: [],
      strengths: [],
      risks: [],
      suppressed: [],
      conflicting: [],
    },

    capacity,

    money,

    career,

    relationship,

    health,
  };

  const explanation =
    buildMasterProfileExplanation(
      profile,
    );

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
        "새로운 가능성을 실행으로 연결하는 국면이다.",
      focusAreas: [],
      avoidAreas: [],
    },
  };
}

const results =
  verifyQuestionContextBuilder(
    buildVerificationHumanContext(),
  );

console.log(
  JSON.stringify(
    results,
    null,
    2,
  ),
);

if (
  results.some(
    (result) =>
      !result.passed,
  )
) {
  process.exitCode = 1;
}