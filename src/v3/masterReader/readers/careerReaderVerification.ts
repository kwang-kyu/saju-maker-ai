import type {
    CareerJudgement,
    CareerResult,
  } from "../types/career";
  import type {
    SajuStructureFact,
  } from "../../types/sajuFacts";
  import {
    buildCareerExplanation,
  } from "./careerExplanationBuilder";
  import {
    readCareer,
  } from "./careerReader";
  
  export type CareerReaderVerificationCase = {
    name: string;
  
    checks: Record<string, boolean>;
  
    passed: boolean;
  };
  
  export type CareerReaderVerificationResult = {
    cases: CareerReaderVerificationCase[];
  
    passed: boolean;
  };
  
  const STRONG_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "dayMasterStrength",
        description:
          "자기 통제력과 실행력이 안정되어 책임 있는 역할과 업무를 지속적으로 수행할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "역할과 책임 범위가 명확할 것",
        ],
        exceptions: [
          "동시에 지나치게 많은 책임을 맡는 경우",
        ],
        signal: {
          kind: "dayMasterStrength",
          type: "balanced",
          score: 2,
          supportScore: 7,
          opposingScore: 5,
          monthCommandScore: 3,
          rootingScore: 3,
        },
      },
      {
        category: "rooting",
        description:
          "내부 기반과 버팀력이 있어 전문성을 축적하고 경력을 장기간 유지할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "경험과 전문성을 단계적으로 축적할 것",
        ],
        exceptions: [
          "기반 없이 역할을 급격히 확대하는 경우",
        ],
        signal: {
          kind: "rooting",
          rootingCount: 3,
          totalBranches: 4,
          rooted: true,
        },
      },
      {
        category: "tenGodStrength",
        description:
          "정관의 책임성과 조직성이 확인되어 역할 조율과 리더 업무를 안정적으로 수행할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "권한과 책임 기준이 명확할 것",
        ],
        exceptions: [
          "형식과 통제만 지나치게 강조하는 경우",
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
          "환경의 지원을 받아 조직 적응과 직업 활동을 안정적으로 이어갈 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "지속 가능한 업무 체계를 유지할 것",
        ],
        exceptions: [
          "환경 검토 없이 역할을 변경하는 경우",
        ],
        signal: {
          kind: "monthCommand",
          season: "spring",
          supported: true,
          dayMasterElement: "wood",
        },
      },
    ];
  
  const LIMITED_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "dayMasterStrength",
        description:
          "외부 책임과 업무 압력이 자기 통제력을 넘어 역할 수행과 리더 책임이 제한될 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "책임과 업무 범위를 작게 유지할 것",
        ],
        exceptions: [
          "과도한 책임과 역할을 동시에 맡는 경우",
        ],
        signal: {
          kind: "dayMasterStrength",
          type: "weak",
          score: -6,
          supportScore: 2,
          opposingScore: 8,
          monthCommandScore: 0,
          rootingScore: 0,
        },
      },
      {
        category: "rooting",
        description:
          "직업 기반과 버팀력이 부족하여 전문성 축적과 경력 지속성이 흔들릴 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "안정적인 기반을 먼저 확보할 것",
        ],
        exceptions: [
          "준비 없이 독립하거나 역할을 확대하는 경우",
        ],
        signal: {
          kind: "rooting",
          rootingCount: 0,
          totalBranches: 4,
          rooted: false,
        },
      },
      {
        category: "monthCommand",
        description:
          "환경 지원이 약하여 조직 적응과 업무 지속에 추가적인 부담이 발생할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "지원 체계와 역할 기준을 확인할 것",
        ],
        exceptions: [
          "불리한 환경에서 무리하게 버티는 경우",
        ],
        signal: {
          kind: "monthCommand",
          season: "autumn",
          supported: false,
          dayMasterElement: "wood",
        },
      },
    ];
  
  const MIXED_STRUCTURE_FACTS:
    SajuStructureFact[] = [
      {
        category: "dayMasterStrength",
        description:
          "실행력과 책임감이 있어 업무를 주도하고 성과를 만들 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "책임 범위를 명확히 할 것",
        ],
        exceptions: [
          "업무 범위를 지나치게 확대하는 경우",
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
        category: "dayMasterStrength",
        description:
          "외부 압력이 커지면 책임 수행과 업무 지속력이 약해질 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "업무 부담과 역할 수를 제한할 것",
        ],
        exceptions: [
          "과도한 책임을 동시에 맡는 경우",
        ],
        signal: {
          kind: "dayMasterStrength",
          type: "weak",
          score: -5,
          supportScore: 2,
          opposingScore: 7,
          monthCommandScore: 0,
          rootingScore: 0,
        },
      },
      {
        category: "rooting",
        description:
          "일정한 내부 기반이 있어 전문성과 경력을 유지할 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "기존 기반을 활용할 것",
        ],
        exceptions: [
          "검증 없이 새로운 역할로 이동하는 경우",
        ],
        signal: {
          kind: "rooting",
          rootingCount: 2,
          totalBranches: 4,
          rooted: true,
        },
      },
      {
        category: "rooting",
        description:
          "새로운 업무 환경에서는 기반이 약해 경력 지속성과 독립 수행이 제한될 수 있다.",
        strength: "strong",
        confidence: "strong",
        conditions: [
          "새로운 기반을 단계적으로 확보할 것",
        ],
        exceptions: [
          "기반 없이 즉시 독립하는 경우",
        ],
        signal: {
          kind: "rooting",
          rootingCount: 0,
          totalBranches: 4,
          rooted: false,
        },
      },
    ];
  
  function getJudgements(
    result: CareerResult,
  ): CareerJudgement[] {
    return [
      result.roleOrientation,
      result.workStyle,
      result.expertiseGrowth,
      result.organizationFit,
      result.independenceFit,
      result.leadershipFit,
      result.performanceConversion,
      result.careerContinuity,
    ];
  }
  
  function buildCase(
    name: string,
    checks: Record<string, boolean>,
  ): CareerReaderVerificationCase {
    return {
      name,
  
      checks,
  
      passed:
        Object.values(checks).every(Boolean),
    };
  }
  
  function verifyStrongStructure():
    CareerReaderVerificationCase {
    const result =
      readCareer(
        STRONG_STRUCTURE_FACTS,
      );
  
    const explanation =
      buildCareerExplanation(result);
  
    const judgements =
      getJudgements(result);
  
    return buildCase(
      "strong-structured-career",
      {
        allAreasExist:
          judgements.length === 8,
  
        strongAreaExists:
          judgements.some(
            (judgement) =>
              judgement.level === "strong",
          ),
  
        interpretationExists:
          result.interpretation !== null,
  
        supportingEvidenceExists:
          judgements.some(
            (judgement) =>
              judgement.evidence.length > 0,
          ),
  
        confidenceIsNotAllLow:
          judgements.some(
            (judgement) =>
              judgement.confidence
                !== "low",
          ),
  
        explanationExists:
          explanation.summary
            .trim()
            .length > 0,
  
        explanationPreservesLevels:
          explanation.roleOrientation.level
            === result.roleOrientation.level
          && explanation.workStyle.level
            === result.workStyle.level
          && explanation.expertiseGrowth.level
            === result.expertiseGrowth.level
          && explanation.organizationFit.level
            === result.organizationFit.level
          && explanation.independenceFit.level
            === result.independenceFit.level
          && explanation.leadershipFit.level
            === result.leadershipFit.level
          && explanation.performanceConversion.level
            === result.performanceConversion.level
          && explanation.careerContinuity.level
            === result.careerContinuity.level,
      },
    );
  }
  
  function verifyLimitedStructure():
    CareerReaderVerificationCase {
    const result =
      readCareer(
        LIMITED_STRUCTURE_FACTS,
      );
  
    const explanation =
      buildCareerExplanation(result);
  
    const judgements =
      getJudgements(result);
  
    const limitedJudgements =
      judgements.filter(
        (judgement) =>
          judgement.level === "limited",
      );
  
    return buildCase(
      "limited-structural-pressure",
      {
        allAreasExist:
          judgements.length === 8,
  
        limitedAreaExists:
          limitedJudgements.length > 0,
  
        limitingEvidenceExists:
          limitedJudgements.some(
            (judgement) =>
              judgement.counterEvidence
                .length > 0,
          ),
  
        limitedInterpretationExists:
          limitedJudgements.some(
            (judgement) =>
              judgement.interpretation
                !== null,
          ),
  
        explanationPreservesLimitedLevel:
          [
            explanation.roleOrientation,
            explanation.workStyle,
            explanation.expertiseGrowth,
            explanation.organizationFit,
            explanation.independenceFit,
            explanation.leadershipFit,
            explanation.performanceConversion,
            explanation.careerContinuity,
          ].some(
            (area) =>
              area.level === "limited",
          ),
  
        explanationRisksExist:
          explanation.risks.length > 0,
      },
    );
  }
  
  function verifyMixedStructure():
    CareerReaderVerificationCase {
    const result =
      readCareer(
        MIXED_STRUCTURE_FACTS,
      );
  
    const judgements =
      getJudgements(result);
  
    const conflictingJudgements =
      judgements.filter(
        (judgement) =>
          judgement.evidence.length > 0
          && judgement.counterEvidence
            .length > 0,
      );
  
    return buildCase(
      "mixed-career-structure",
      {
        allAreasExist:
          judgements.length === 8,
  
        supportingEvidenceExists:
          judgements.some(
            (judgement) =>
              judgement.evidence.length > 0,
          ),
  
        limitingEvidenceExists:
          judgements.some(
            (judgement) =>
              judgement.counterEvidence
                .length > 0,
          ),
  
        conflictExists:
          conflictingJudgements.length > 0,
  
        conflictDoesNotProduceHighConfidence:
          conflictingJudgements.some(
            (judgement) =>
              judgement.confidence
                !== "high",
          ),
  
        interpretationExists:
          result.interpretation !== null,
      },
    );
  }
  
  function verifyInsufficientStructure():
    CareerReaderVerificationCase {
    const result =
      readCareer([]);
  
    const explanation =
      buildCareerExplanation(result);
  
    const judgements =
      getJudgements(result);
  
    const explanationAreas = [
      explanation.roleOrientation,
      explanation.workStyle,
      explanation.expertiseGrowth,
      explanation.organizationFit,
      explanation.independenceFit,
      explanation.leadershipFit,
      explanation.performanceConversion,
      explanation.careerContinuity,
    ];
  
    return buildCase(
      "insufficient-career-evidence",
      {
        allAreasExist:
          judgements.length === 8,
  
        allLevelsAreNull:
          judgements.every(
            (judgement) =>
              judgement.level === null,
          ),
  
        allInterpretationsAreNull:
          judgements.every(
            (judgement) =>
              judgement.interpretation
                === null,
          ),
  
        allConfidenceIsLow:
          judgements.every(
            (judgement) =>
              judgement.confidence
                === "low",
          ),
  
        resultInterpretationIsNull:
          result.interpretation === null,
  
        explanationUsesPendingLabel:
          explanationAreas.every(
            (area) =>
              area.levelLabel
                === "판단 보류",
          ),
  
        explanationPreservesNull:
          explanationAreas.every(
            (area) =>
              area.level === null,
          ),
      },
    );
  }
  
  export function verifyCareerReader():
    CareerReaderVerificationResult {
    const cases = [
      verifyStrongStructure(),
      verifyLimitedStructure(),
      verifyMixedStructure(),
      verifyInsufficientStructure(),
    ];
  
    return {
      cases,
  
      passed:
        cases.every(
          (verificationCase) =>
            verificationCase.passed,
        ),
    };
  }