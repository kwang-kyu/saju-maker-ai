import type {
    QuestionTopic,
  } from "../question/questionReader";
  import {
    buildDecisionEngineRegressionInput,
  } from "./regression/decisionEngineRegressionFixture";
  import {
    buildReaderDecisionEvidence,
  } from "./readerDecisionEvidenceBuilder";
  import type {
    DecisionEngineInput,
    DecisionEvidence,
    DecisionEvidenceSource,
  } from "./decisionTypes";
  
  type ReaderEvidenceSource = Extract<
    DecisionEvidenceSource,
    | "capacity"
    | "money"
    | "career"
    | "relationship"
    | "health"
    | "blessing"
    | "destiny"
  >;
  
  type ReaderDecisionEvidenceVerificationCase = {
    name: string;
  
    topic: QuestionTopic;
  
    expectedSources:
      ReaderEvidenceSource[];
  };
  
  export type ReaderDecisionEvidenceVerificationResult = {
    cases: Array<{
      name: string;
  
      topic: QuestionTopic;
  
      actualSources:
        ReaderEvidenceSource[];
  
      expectedSources:
        ReaderEvidenceSource[];
  
      checks: {
        sourcesMatched: boolean;
  
        evidenceExists: boolean;
  
        descriptionsExist: boolean;
  
        keysAreUnique: boolean;
  
        keysMatchSources: boolean;
  
        summariesExist: boolean;
      };
  
      passed: boolean;
    }>;
  
    passed: boolean;
  };
  
  const VERIFICATION_CASES:
    ReaderDecisionEvidenceVerificationCase[] = [
      {
        name:
          "business-reader-selection",
  
        topic:
          "business",
  
        expectedSources: [
          "capacity",
          "money",
          "career",
          "relationship",
          "destiny",
        ],
      },
  
      {
        name:
          "health-reader-selection",
  
        topic:
          "health",
  
        expectedSources: [
          "health",
          "capacity",
        ],
      },
  
      {
        name:
          "love-reader-selection",
  
        topic:
          "love",
  
        expectedSources: [
          "relationship",
          "blessing",
          "destiny",
        ],
      },
  
      {
        name:
          "life-direction-reader-selection",
  
        topic:
          "lifeDirection",
  
        expectedSources: [
          "destiny",
          "career",
          "capacity",
          "blessing",
        ],
      },
    ];
  
  function isReaderEvidenceSource(
    source: DecisionEvidenceSource,
  ): source is ReaderEvidenceSource {
    switch (source) {
      case "capacity":
      case "money":
      case "career":
      case "relationship":
      case "health":
      case "blessing":
      case "destiny":
        return true;
  
      default:
        return false;
    }
  }
  
  function buildVerificationInput(
    topic: QuestionTopic,
  ): DecisionEngineInput {
    const input =
      buildDecisionEngineRegressionInput();
  
    return {
      ...input,
  
      question: {
        ...input.question,
  
        topic,
      },
    };
  }
  
  function collectSources(
    evidence: DecisionEvidence[],
  ): ReaderEvidenceSource[] {
    const sources:
      ReaderEvidenceSource[] = [];
  
    const seen =
      new Set<ReaderEvidenceSource>();
  
    for (const item of evidence) {
      if (
        !isReaderEvidenceSource(
          item.source,
        )
        || seen.has(item.source)
      ) {
        continue;
      }
  
      seen.add(item.source);
      sources.push(item.source);
    }
  
    return sources;
  }
  
  function arraysMatch(
    actual: ReaderEvidenceSource[],
    expected: ReaderEvidenceSource[],
  ): boolean {
    return (
      actual.length
        === expected.length
      && actual.every(
        (
          source,
          index,
        ) =>
          source
            === expected[index],
      )
    );
  }
  
  function hasUniqueKeys(
    evidence: DecisionEvidence[],
  ): boolean {
    const keys =
      evidence.map(
        (item) =>
          item.key,
      );
  
    return (
      new Set(keys).size
        === keys.length
    );
  }
  
  function keysMatchSources(
    evidence: DecisionEvidence[],
  ): boolean {
    return evidence.every(
      (item) =>
        item.key.startsWith(
          `${item.source}-`,
        ),
    );
  }
  
  function summariesExist(
    evidence: DecisionEvidence[],
    sources: ReaderEvidenceSource[],
  ): boolean {
    return sources.every(
      (source) =>
        evidence.some(
          (item) =>
            item.source === source
            && item.key
              === `${source}-summary`
            && item.description
              .trim()
              .length > 0,
        ),
    );
  }
  
  function verifyCase(
    verificationCase:
      ReaderDecisionEvidenceVerificationCase,
  ): ReaderDecisionEvidenceVerificationResult["cases"][number] {
    const input =
      buildVerificationInput(
        verificationCase.topic,
      );
  
    const evidence =
      buildReaderDecisionEvidence(
        input,
      );
  
    const actualSources =
      collectSources(
        evidence,
      );
  
    const checks = {
      sourcesMatched:
        arraysMatch(
          actualSources,
          verificationCase
            .expectedSources,
        ),
  
      evidenceExists:
        evidence.length > 0,
  
      descriptionsExist:
        evidence.every(
          (item) =>
            item.description
              .trim()
              .length > 0,
        ),
  
      keysAreUnique:
        hasUniqueKeys(
          evidence,
        ),
  
      keysMatchSources:
        keysMatchSources(
          evidence,
        ),
  
      summariesExist:
        summariesExist(
          evidence,
          actualSources,
        ),
    };
  
    return {
      name:
        verificationCase.name,
  
      topic:
        verificationCase.topic,
  
      actualSources,
  
      expectedSources:
        verificationCase
          .expectedSources,
  
      checks,
  
      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
  
  export function verifyReaderDecisionEvidence():
    ReaderDecisionEvidenceVerificationResult {
    const cases =
      VERIFICATION_CASES.map(
        verifyCase,
      );
  
    return {
      cases,
  
      passed:
        cases.every(
          (verificationCase) =>
            verificationCase.passed,
        ),
    };
  }