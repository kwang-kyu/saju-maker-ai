import {
    runDecisionEngine,
  } from "../decisionEngine";
  import type {
    QuestionRealitySignal,
  } from "../../question/questionContext";
  import {
    buildDecisionEngineRegressionInput,
  } from "./decisionEngineRegressionFixture";

  type ExpectedWealthCondition = {
    key: string;
    requiredDescriptionFragments:
      readonly string[];
  };

  type WealthConditionRegressionFixture = {
    name: string;
    questionText: string;
    expectedSignals:
      readonly QuestionRealitySignal[];
    expectedConditions:
      readonly ExpectedWealthCondition[];
    forbiddenConditionKeys:
      readonly string[];
  };

  export type WealthConditionRegressionCaseResult = {
    name: string;
    questionText: string;
    actualSignals: QuestionRealitySignal[];
    actualConditionKeys: string[];
    actualConditionDescriptions: string[];
    checks: {
      topicIsMoney: boolean;
      expectedSignalsWereExtracted: boolean;
      expectedConditionKeysWereCreated: boolean;
      unexpectedWealthConditionsWereExcluded: boolean;
      expectedConditionDescriptionsMatched: boolean;
      forbiddenGenericDuplicatesWereExcluded: boolean;
      conditionsKeepRequirementRole: boolean;
      conditionsDoNotDescribeFailureConsequence: boolean;
      decisionUsesHumanContext: boolean;
      decisionUsesQuestionContext: boolean;
    };
    passed: boolean;
  };

  export type WealthConditionRegressionVerificationResult = {
    cases: WealthConditionRegressionCaseResult[];
    passed: boolean;
  };

  const WEALTH_CONDITION_KEYS:
  readonly string[] = [
    "protectEssentialFunds",
    "secureLiquidityBeforeInvestment",
    "limitAssetConcentration",
  ];

  const FAILURE_CONSEQUENCE_EXPRESSIONS:
  readonly string[] = [
    "발생할 수",
    "손실이 확대",
    "회수하지 못",
    "생활 기반이 훼손",
  ];

  const WEALTH_CONDITION_FIXTURES:
    readonly WealthConditionRegressionFixture[] = [
      {
        name: "essential-funds-require-protection",
        questionText:
          "퇴직금 전부를 주식에 넣어도 될까요?",
        expectedSignals: [
          "essentialFundsExposure",
        ],
        expectedConditions: [
          {
            key: "protectEssentialFunds",
            requiredDescriptionFragments: [
              "필수자금",
              "투자금과 분리",
              "투자 가능 금액",
              "손실 한도",
            ],
          },
        ],
        forbiddenConditionKeys: [],
      },
      {
        name: "liquidity-constraint-requires-exit-plan",
        questionText:
          "ETF는 중도 환매가 어렵고 자금이 묶이는데 투자해도 될까요?",
        expectedSignals: [
          "liquidityConstraint",
        ],
        expectedConditions: [
          {
            key: "secureLiquidityBeforeInvestment",
            requiredDescriptionFragments: [
              "중도 환매·매도 가능 시점",
              "예상 회수 기간",
              "비상 현금",
            ],
          },
        ],
        forbiddenConditionKeys: [],
      },
      {
        name: "asset-concentration-requires-limit",
        questionText:
          "한 종목에 집중해서 투자해도 될까요?",
        expectedSignals: [
          "assetConcentration",
        ],
        expectedConditions: [
          {
            key: "limitAssetConcentration",
            requiredDescriptionFragments: [
              "최대 투자 비중",
              "분산 기준",
            ],
          },
        ],
        forbiddenConditionKeys: [],
      },
      {
        name: "combined-wealth-reality-creates-distinct-conditions",
        questionText:
          "퇴직금 전부를 한 자산에 집중해서 투자하려는데 중도 환매가 어렵고 자금이 묶입니다. 진행해도 될까요?",
        expectedSignals: [
          "essentialFundsExposure",
          "liquidityConstraint",
          "assetConcentration",
        ],
        expectedConditions: [
          {
            key: "protectEssentialFunds",
            requiredDescriptionFragments: [
              "필수자금",
              "투자금과 분리",
              "투자 가능 금액",
              "손실 한도",
            ],
          },
          {
            key: "secureLiquidityBeforeInvestment",
            requiredDescriptionFragments: [
              "중도 환매·매도 가능 시점",
              "예상 회수 기간",
              "비상 현금",
            ],
          },
          {
            key: "limitAssetConcentration",
            requiredDescriptionFragments: [
              "최대 투자 비중",
              "분산 기준",
            ],
          },
        ],
        forbiddenConditionKeys: [
          "confirmExecutionConditions",
          "protectExistingCashFlow",
          "limitExpansionScale",
        ],
      },
      {
        name: "debt-and-living-cost-condition-remains",
        questionText:
          "생활비와 대출 부담이 있는 상황에서 여유자금 투자가 가능한가?",
        expectedSignals: [
          "debtBurden",
          "livingCostPressure",
        ],
        expectedConditions: [
          {
            key: "protectExistingCashFlow",
            requiredDescriptionFragments: [
              "생활비와 대출 상환 재원",
              "투자금과 분리",
              "손실 한도",
            ],
          },
        ],
        forbiddenConditionKeys: [
          "protectEssentialFunds",
          "secureLiquidityBeforeInvestment",
          "limitAssetConcentration",
        ],
      },
      {
        name: "retirement-funds-management-does-not-infer-condition",
        questionText:
          "퇴직금을 어떻게 운용하면 좋을까요?",
        expectedSignals: [],
        expectedConditions: [],
        forbiddenConditionKeys: [
          "protectEssentialFunds",
        ],
      },
      {
        name: "bond-investment-without-reality-has-no-wealth-condition",
        questionText:
          "채권에 투자해도 될까요?",
        expectedSignals: [],
        expectedConditions: [],
        forbiddenConditionKeys: [
          "protectEssentialFunds",
          "secureLiquidityBeforeInvestment",
          "limitAssetConcentration",
        ],
      },
    ];

  function hasSameValues(
    actual: readonly string[],
    expected: readonly string[],
  ): boolean {
    return actual.length === expected.length
      && actual.every(
        (value) => expected.includes(value),
      );
  }

  function verifyWealthCondition(
    fixture: WealthConditionRegressionFixture,
  ): WealthConditionRegressionCaseResult {
    const input =
      buildDecisionEngineRegressionInput({
        questionText: fixture.questionText,
        lifeContext: {
          maritalStatus: "single",
          hasChildren: false,
          occupationStatus: "unemployed",
          hasActiveBusiness: false,
          financialResponsibility: "low",
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

    const actualConditionKeys =
      result.conditions.map(
        (condition) =>
          condition.key,
      );

    const actualConditionDescriptions =
      result.conditions.map(
        (condition) =>
          condition.description,
      );

    const expectedConditionKeys =
      fixture.expectedConditions.map(
        (condition) =>
          condition.key,
      );

      const expectedWealthConditionKeys =
  expectedConditionKeys.filter(
    (key) =>
      WEALTH_CONDITION_KEYS.includes(key),
  );

    const actualWealthConditionKeys =
      actualConditionKeys.filter(
        (key) =>
            WEALTH_CONDITION_KEYS.includes(key)
      );

    const expectedConditions =
      fixture.expectedConditions.map(
        (expectedCondition) => ({
          expectedCondition,
          actualCondition:
            result.conditions.find(
              (condition) =>
                condition.key
                === expectedCondition.key,
            ),
        }),
      );

    const checks = {
      topicIsMoney:
        input.question.topic === "money",

      expectedSignalsWereExtracted:
        hasSameValues(
          actualSignals,
          fixture.expectedSignals,
        ),

      expectedConditionKeysWereCreated:
        expectedConditionKeys.every(
          (key) =>
            actualConditionKeys.includes(key),
        ),

        unexpectedWealthConditionsWereExcluded:
        hasSameValues(
          actualWealthConditionKeys,
          expectedWealthConditionKeys,
        ),

      expectedConditionDescriptionsMatched:
        expectedConditions.every(
          ({
            expectedCondition,
            actualCondition,
          }) =>
            actualCondition !== undefined
            && expectedCondition
              .requiredDescriptionFragments
              .every(
                (fragment) =>
                  actualCondition
                    .description
                    .includes(fragment),
              ),
        ),

      forbiddenGenericDuplicatesWereExcluded:
        fixture.forbiddenConditionKeys.every(
          (key) =>
            !actualConditionKeys.includes(key),
        ),

      conditionsKeepRequirementRole:
        expectedConditions.every(
          ({ actualCondition }) =>
            actualCondition?.required === true
            && actualCondition.satisfied === false,
        ),

      conditionsDoNotDescribeFailureConsequence:
        expectedConditions.every(
          ({ actualCondition }) =>
            actualCondition !== undefined
            && FAILURE_CONSEQUENCE_EXPRESSIONS
              .every(
                (expression) =>
                  !actualCondition
                    .description
                    .includes(expression),
              ),
        ),

      decisionUsesHumanContext:
        result.humanContextUsed,

      decisionUsesQuestionContext:
        result.questionContextUsed,
    };

    return {
      name: fixture.name,
      questionText: fixture.questionText,
      actualSignals,
      actualConditionKeys,
      actualConditionDescriptions,
      checks,
      passed:
        Object.values(checks).every(Boolean),
    };
  }

  export function verifyWealthConditionRegression():
    WealthConditionRegressionVerificationResult {
    const cases =
      WEALTH_CONDITION_FIXTURES.map(
        verifyWealthCondition,
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