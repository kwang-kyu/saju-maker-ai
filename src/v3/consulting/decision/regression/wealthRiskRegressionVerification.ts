import {
    runDecisionEngine,
  } from "../decisionEngine.js";
  import type {
    QuestionRealitySignal,
  } from "../../question/questionContext.js";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture.js";

  type ExpectedWealthRisk = {
    key: string;
    severity: "high" | "medium" | "low";
    requiredDescriptionFragments:
      readonly string[];
    relatedConditionKey:
      string | null;
  };

  type WealthRiskRegressionFixture = {
    name: string;
    questionText: string;
    expectedTopic:
      "money" | "realEstate";
    expectedSignals:
      readonly QuestionRealitySignal[];
    expectedRisks:
      readonly ExpectedWealthRisk[];
    forbiddenRiskKeys:
      readonly string[];
  };

  export type WealthRiskRegressionCaseResult = {
    name: string;
    questionText: string;
    actualTopic: string;
    actualSignals:
      QuestionRealitySignal[];
    actualRiskKeys:
      string[];
    actualRiskDescriptions:
      string[];
    checks: {
      expectedTopicWasResolved:
        boolean;
      expectedSignalsWereExtracted:
        boolean;
      expectedRiskKeysWereCreated:
        boolean;
      unexpectedWealthRisksWereExcluded:
        boolean;
      expectedRiskDescriptionsMatched:
        boolean;
      expectedRiskSeveritiesMatched:
        boolean;
      expectedRiskSourcesAreLifeContext:
        boolean;
      forbiddenGenericDuplicatesWereExcluded:
        boolean;
      risksKeepFailureConsequenceRole:
        boolean;
      risksDoNotRepeatConditionRequirements:
        boolean;
      conditionAndRiskDescriptionsDiffer:
        boolean;
      decisionUsesHumanContext:
        boolean;
      decisionUsesQuestionContext:
        boolean;
    };
    passed: boolean;
  };

  export type WealthRiskRegressionVerificationResult = {
    cases:
      WealthRiskRegressionCaseResult[];
    passed: boolean;
  };

  const WEALTH_RISK_KEYS:
  readonly string[] = [
    "essentialFundsLossExposure",
    "liquidityLockup",
    "concentratedAssetLoss",
  ];

  const CONDITION_REQUIREMENT_EXPRESSIONS:
  readonly string[] = [
    "분리해야 한다",
    "확정해야 한다",
    "확인해야 한다",
    "확보해야 한다",
    "설정해야 한다",
    "정해야 한다",
    "마련해야 한다",
  ];

  const FAILURE_CONSEQUENCE_EXPRESSIONS:
  readonly string[] = [
    "훼손될 수 있다",
    "전이될 수 있다",
    "회수하지 못",
    "어려워질 수 있다",
    "확대될 수 있다",
    "충격이 커질 수 있다",
    "흔들릴 수 있다",
  ];

  const WEALTH_RISK_FIXTURES:
  readonly WealthRiskRegressionFixture[] = [
    {
      name:
        "retirement-funds-loss-reaches-living-foundation",
      questionText:
        "퇴직금 전부를 주식에 넣어도 될까요?",
      expectedTopic:
        "money",
      expectedSignals: [
        "essentialFundsExposure",
      ],
      expectedRisks: [
        {
          key:
            "essentialFundsLossExposure",
          severity:
            "medium",
          requiredDescriptionFragments: [
            "필수 생활자금·비상자금·노후자금",
            "투자 손실",
            "생활 기반에 직접 전이",
          ],
          relatedConditionKey:
            "protectEssentialFunds",
        },
      ],
      forbiddenRiskKeys: [],
    },
    {
      name:
        "emergency-funds-real-estate-loss-reaches-living-foundation",
      questionText:
        "비상금 전부로 상가에 투자해도 될까요?",
      expectedTopic:
        "realEstate",
      expectedSignals: [
        "essentialFundsExposure",
      ],
      expectedRisks: [
        {
          key:
            "essentialFundsLossExposure",
          severity:
            "medium",
          requiredDescriptionFragments: [
            "필수 생활자금·비상자금·노후자금",
            "투자 손실",
            "생활 기반에 직접 전이",
          ],
          relatedConditionKey:
            "protectEssentialFunds",
        },
      ],
      forbiddenRiskKeys: [],
    },
    {
      name:
        "liquidity-lockup-blocks-urgent-spending",
      questionText:
        "ETF는 중도 환매가 어렵고 자금이 묶이는데 투자해도 될까요?",
      expectedTopic:
        "money",
      expectedSignals: [
        "liquidityConstraint",
      ],
      expectedRisks: [
        {
          key:
            "liquidityLockup",
          severity:
            "medium",
          requiredDescriptionFragments: [
            "필요한 시점",
            "자금을 회수하지 못",
            "긴급 지출 대응",
          ],
          relatedConditionKey:
            "secureLiquidityBeforeInvestment",
        },
      ],
      forbiddenRiskKeys: [],
    },
    {
      name:
        "concentrated-investment-expands-total-loss",
      questionText:
        "한 종목에 집중해서 투자해도 될까요?",
      expectedTopic:
        "money",
      expectedSignals: [
        "assetConcentration",
      ],
      expectedRisks: [
        {
          key:
            "concentratedAssetLoss",
          severity:
            "medium",
          requiredDescriptionFragments: [
            "단일 종목·단일 자산",
            "전체 자산 손실",
            "분산되지 않은 손실 충격",
          ],
          relatedConditionKey:
            "limitAssetConcentration",
        },
      ],
      forbiddenRiskKeys: [],
    },
    {
      name:
        "combined-wealth-reality-creates-distinct-risks",
      questionText:
        "퇴직금 전부를 한 자산에 집중해서 투자하려는데 중도 환매가 어렵고 자금이 묶입니다. 진행해도 될까요?",
      expectedTopic:
        "money",
      expectedSignals: [
        "essentialFundsExposure",
        "liquidityConstraint",
        "assetConcentration",
      ],
      expectedRisks: [
        {
          key:
            "essentialFundsLossExposure",
          severity:
            "high",
          requiredDescriptionFragments: [
            "필수 생활자금·비상자금·노후자금",
            "투자 손실",
            "생활 기반에 직접 전이",
          ],
          relatedConditionKey:
            "protectEssentialFunds",
        },
        {
          key:
            "liquidityLockup",
          severity:
            "high",
          requiredDescriptionFragments: [
            "필요한 시점",
            "자금을 회수하지 못",
            "긴급 지출 대응",
          ],
          relatedConditionKey:
            "secureLiquidityBeforeInvestment",
        },
        {
          key:
            "concentratedAssetLoss",
          severity:
            "high",
          requiredDescriptionFragments: [
            "단일 종목·단일 자산",
            "전체 자산 손실",
            "분산되지 않은 손실 충격",
          ],
          relatedConditionKey:
            "limitAssetConcentration",
        },
      ],
      forbiddenRiskKeys: [
        "lifeContextFinancialPressure",
        "lifeContextExpansionRisk",
        "lifeContextExecutionConstraint",
      ],
    },
    {
      name:
        "debt-and-living-cost-risk-remains",
      questionText:
        "생활비와 대출 부담이 있는 상황에서 여유자금 투자가 가능한가?",
      expectedTopic:
        "money",
      expectedSignals: [
        "debtBurden",
        "livingCostPressure",
      ],
      expectedRisks: [
        {
          key:
            "lifeContextFinancialPressure",
          severity:
            "high",
          requiredDescriptionFragments: [
            "생활비와 대출 상환 부담",
            "상환 일정",
            "기존 생활 기반",
          ],
          relatedConditionKey:
            "protectExistingCashFlow",
        },
      ],
      forbiddenRiskKeys: [
        "essentialFundsLossExposure",
        "liquidityLockup",
        "concentratedAssetLoss",
      ],
    },
    {
      name:
        "debt-and-fixed-cost-risk-remains",
      questionText:
        "대출이 있고 보유세와 관리비 부담도 큰데 부동산에 추가 투자해도 될까요?",
      expectedTopic:
        "realEstate",
      expectedSignals: [
        "debtBurden",
        "fixedCostPressure",
      ],
      expectedRisks: [
        {
          key:
            "lifeContextFinancialPressure",
          severity:
            "high",
          requiredDescriptionFragments: [
            "대출 상환 부담",
            "상환 일정",
            "기존 자금 기반",
          ],
          relatedConditionKey:
            "protectExistingCashFlow",
        },
      ],
      forbiddenRiskKeys: [
        "essentialFundsLossExposure",
        "liquidityLockup",
        "concentratedAssetLoss",
      ],
    },
    {
      name:
        "retirement-funds-management-does-not-infer-risk",
      questionText:
        "퇴직금을 어떻게 운용하면 좋을까요?",
      expectedTopic:
        "money",
      expectedSignals: [],
      expectedRisks: [],
      forbiddenRiskKeys: [
        "essentialFundsLossExposure",
        "liquidityLockup",
        "concentratedAssetLoss",
      ],
    },
    {
      name:
        "bond-investment-without-reality-has-no-wealth-risk",
      questionText:
        "채권에 투자해도 될까요?",
      expectedTopic:
        "money",
      expectedSignals: [],
      expectedRisks: [],
      forbiddenRiskKeys: [
        "essentialFundsLossExposure",
        "liquidityLockup",
        "concentratedAssetLoss",
      ],
    },
    {
      name:
        "condition-and-risk-keep-distinct-roles",
      questionText:
        "비상금 전부를 한 종목에 집중해서 투자하려는데 중도 환매가 어렵고 자금이 묶입니다. 투자해도 될까요?",
      expectedTopic:
        "money",
      expectedSignals: [
        "essentialFundsExposure",
        "liquidityConstraint",
        "assetConcentration",
      ],
      expectedRisks: [
        {
          key:
            "essentialFundsLossExposure",
          severity:
            "high",
          requiredDescriptionFragments: [
            "투자 손실",
            "생활 기반에 직접 전이",
          ],
          relatedConditionKey:
            "protectEssentialFunds",
        },
        {
          key:
            "liquidityLockup",
          severity:
            "high",
          requiredDescriptionFragments: [
            "자금을 회수하지 못",
            "긴급 지출 대응",
          ],
          relatedConditionKey:
            "secureLiquidityBeforeInvestment",
        },
        {
          key:
            "concentratedAssetLoss",
          severity:
            "high",
          requiredDescriptionFragments: [
            "전체 자산 손실",
            "분산되지 않은 손실 충격",
          ],
          relatedConditionKey:
            "limitAssetConcentration",
        },
      ],
      forbiddenRiskKeys: [
        "lifeContextFinancialPressure",
        "lifeContextExpansionRisk",
        "lifeContextExecutionConstraint",
      ],
    },
  ];

  function hasSameValues(
    actual: readonly string[],
    expected: readonly string[],
  ): boolean {
    return actual.length === expected.length
      && actual.every(
        (value) =>
          expected.includes(value),
      );
  }

  function verifyWealthRisk(
    fixture:
      WealthRiskRegressionFixture,
  ): WealthRiskRegressionCaseResult {
    const input =
      buildDecisionEngineRegressionInput({
        questionText:
          fixture.questionText,
        lifeContext: {
          maritalStatus:
            "single",
          hasChildren:
            false,
          occupationStatus:
            "unemployed",
          hasActiveBusiness:
            false,
          financialResponsibility:
            "low",
        },
      });

    const result =
      runDecisionEngine(input);

    const actualSignals =
      input.questionContext
        .reality
        .constraints
        .map(
          (constraint) =>
            constraint.signal,
        );

    const actualRiskKeys =
      result.risks.map(
        (risk) =>
          risk.key,
      );

    const actualRiskDescriptions =
      result.risks.map(
        (risk) =>
          risk.description,
      );

    const expectedRiskKeys =
      fixture.expectedRisks.map(
        (risk) =>
          risk.key,
      );

    const expectedWealthRiskKeys =
      expectedRiskKeys.filter(
        (key) =>
          WEALTH_RISK_KEYS.includes(key),
      );

    const actualWealthRiskKeys =
      actualRiskKeys.filter(
        (key) =>
          WEALTH_RISK_KEYS.includes(key),
      );

    const expectedRisks =
      fixture.expectedRisks.map(
        (expectedRisk) => ({
          expectedRisk,
          actualRisk:
            result.risks.find(
              (risk) =>
                risk.key
                === expectedRisk.key,
            ),
          relatedCondition:
            expectedRisk
              .relatedConditionKey
              === null
              ? undefined
              : result.conditions.find(
                (condition) =>
                  condition.key
                  === expectedRisk
                    .relatedConditionKey,
              ),
        }),
      );

    const checks = {
      expectedTopicWasResolved:
        input.question.topic
        === fixture.expectedTopic,

      expectedSignalsWereExtracted:
        hasSameValues(
          actualSignals,
          fixture.expectedSignals,
        ),

      expectedRiskKeysWereCreated:
        expectedRiskKeys.every(
          (key) =>
            actualRiskKeys.includes(key),
        ),

      unexpectedWealthRisksWereExcluded:
        hasSameValues(
          actualWealthRiskKeys,
          expectedWealthRiskKeys,
        ),

      expectedRiskDescriptionsMatched:
        expectedRisks.every(
          ({
            expectedRisk,
            actualRisk,
          }) =>
            actualRisk !== undefined
            && expectedRisk
              .requiredDescriptionFragments
              .every(
                (fragment) =>
                  actualRisk
                    .description
                    .includes(fragment),
              ),
        ),

      expectedRiskSeveritiesMatched:
        expectedRisks.every(
          ({
            expectedRisk,
            actualRisk,
          }) =>
            actualRisk?.severity
            === expectedRisk.severity,
        ),

      expectedRiskSourcesAreLifeContext:
        expectedRisks.every(
          ({ actualRisk }) =>
            actualRisk?.source
            === "lifeContext",
        ),

      forbiddenGenericDuplicatesWereExcluded:
        fixture.forbiddenRiskKeys
          .every(
            (key) =>
              !actualRiskKeys.includes(key),
          ),

      risksKeepFailureConsequenceRole:
        expectedRisks.every(
          ({ actualRisk }) =>
            actualRisk !== undefined
            && FAILURE_CONSEQUENCE_EXPRESSIONS
              .some(
                (expression) =>
                  actualRisk
                    .description
                    .includes(expression),
              ),
        ),

      risksDoNotRepeatConditionRequirements:
        expectedRisks.every(
          ({ actualRisk }) =>
            actualRisk !== undefined
            && CONDITION_REQUIREMENT_EXPRESSIONS
              .every(
                (expression) =>
                  !actualRisk
                    .description
                    .includes(expression),
              ),
        ),

      conditionAndRiskDescriptionsDiffer:
        expectedRisks.every(
          ({
            actualRisk,
            relatedCondition,
            expectedRisk,
          }) =>
            expectedRisk
              .relatedConditionKey
              === null
            || (
              actualRisk !== undefined
              && relatedCondition
                !== undefined
              && actualRisk.description
              !== relatedCondition
                .description
            ),
        ),

      decisionUsesHumanContext:
        result.humanContextUsed,

      decisionUsesQuestionContext:
        result.questionContextUsed,
    };

    return {
      name:
        fixture.name,
      questionText:
        fixture.questionText,
      actualTopic:
        input.question.topic,
      actualSignals,
      actualRiskKeys,
      actualRiskDescriptions,
      checks,
      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }

  export function verifyWealthRiskRegression():
    WealthRiskRegressionVerificationResult {
    const cases =
      WEALTH_RISK_FIXTURES.map(
        verifyWealthRisk,
      );

    return {
      cases,
      passed:
        cases.every(
          (regressionCase) =>
            regressionCase.passed,
        ),
    };
  }