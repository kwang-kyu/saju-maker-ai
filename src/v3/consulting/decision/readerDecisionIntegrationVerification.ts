import {
    runDecisionEngine,
  } from "./decisionEngine";
  import {
    buildDecisionEngineRegressionInput,
  } from "./regression/decisionEngineRegressionFixture";
  import type {
    DecisionEngineInput,
    DecisionResult,
  } from "./decisionTypes";
  
  export type ReaderDecisionIntegrationVerificationResult = {
    cases: Array<{
      name: string;
  
      actualResult:
        DecisionResult;
  
      checks: Record<
        string,
        boolean
      >;
  
      passed: boolean;
    }>;
  
    passed: boolean;
  };
  
  function buildHighConstraintInput():
    DecisionEngineInput {
    const input =
      buildDecisionEngineRegressionInput();
  
    const identity =
      input.humanContext.identity;
  
    const profile =
      identity.profile;
  
    const capacity =
      profile.capacity;
  
    return {
      ...input,
  
      question: {
        ...input.question,
  
        topic: "business",
  
        urgency: "immediate",
      },
  
      humanContext: {
        ...input.humanContext,
  
        identity: {
          ...identity,
  
          profile: {
            ...profile,
  
            capacity: {
              ...capacity,
  
              risk: {
                ...capacity.risk,
  
                level: "limited",
  
                confidence: "high",
  
                evidence: [],
  
                counterEvidence:
                capacity
                  .risk
                  .evidence
                  .map(
                    (evidence) => ({
                      ...evidence,

                      description:
                        "검증되지 않은 사업에 자원을 과도하게 집중하면 위험 부담을 안정적으로 유지하기 어렵다.",
                    }),
                  ),
              },
  
              time: {
                ...capacity.time,
  
                level: "limited",
  
                confidence: "high",
  
                evidence: [],
  
                counterEvidence:
                capacity
                  .time
                  .evidence
                  .map(
                    (evidence) => ({
                      ...evidence,

                      description:
                        "검증 기간 없이 즉시 규모를 확대하면 장기간 실행을 유지하기 어렵다.",
                    }),
                  ),
              },
            },
          },
        },
      },
    };
  }
  
  function hasCondition(
    result: DecisionResult,
    key: string,
  ): boolean {
    return result.conditions.some(
      (condition) =>
        condition.key === key
        && condition.required
        && !condition.satisfied,
    );
  }
  
  function hasRisk(
    result: DecisionResult,
    key: string,
    severity:
      DecisionResult["risks"][number]["severity"],
    source:
      DecisionResult["risks"][number]["source"],
  ): boolean {
    return result.risks.some(
      (risk) =>
        risk.key === key
        && risk.severity === severity
        && risk.source === source,
    );
  }
  
  function verifyHighConstraintIntegration():
    ReaderDecisionIntegrationVerificationResult["cases"][number] {
    const actualResult =
      runDecisionEngine(
        buildHighConstraintInput(),
      );
  
    const checks = {
      verdictChangedToWait:
        actualResult.verdict
        === "wait",
  
      capacityRiskConditionIncluded:
        hasCondition(
          actualResult,
          "readerDecisionCondition-capacity-risk",
        ),
  
      capacityTimeConditionIncluded:
        hasCondition(
          actualResult,
          "readerDecisionCondition-capacity-time",
        ),
  
      capacityRiskIncluded:
        hasRisk(
          actualResult,
          "readerDecisionRisk-capacity-risk",
          "high",
          "capacity",
        ),
  
      capacityTimeRiskIncluded:
        hasRisk(
          actualResult,
          "readerDecisionRisk-capacity-time",
          "high",
          "capacity",
        ),
  
      coreDecisionUsesWait:
        actualResult
          .coreDecision
          .includes(
            "기다",
          ),
  
      prohibitedDirectionExists:
        actualResult
          .prohibitedDirection
          .trim()
          .length > 0,
  
      finalSentenceUsesWaitDecision:
        actualResult
          .finalDecisionSentence
          .includes(
            actualResult.coreDecision,
          ),
  
      humanContextUsed:
        actualResult
          .humanContextUsed,
  
      questionContextUsed:
        actualResult
          .questionContextUsed,
    };
  
    return {
      name:
        "high-reader-constraint-affects-decision-result",
  
      actualResult,
  
      checks,
  
      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }
  
  export function verifyReaderDecisionIntegration():
    ReaderDecisionIntegrationVerificationResult {
    const cases = [
      verifyHighConstraintIntegration(),
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