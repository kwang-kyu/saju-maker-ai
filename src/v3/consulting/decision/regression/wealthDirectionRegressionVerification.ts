import {
    runDecisionEngine,
} from "../decisionEngine";
import type {
    DecisionVerdict,
} from "../decisionTypes";
import type {
    QuestionRealitySignal,
} from "../../question/questionContext";
import {
    buildDecisionEngineRegressionInput,
} from "./decisionEngineRegressionFixture";
import {
    buildCoreDecision,
} from "../coreDecisionBuilder";

type WealthDirectionRegressionFixture = {
    name: string;
    questionText: string;
    expectedTopic:
    "money" | "realEstate";
    expectedSignals:
    readonly QuestionRealitySignal[];
    requiredRecommendedFragments:
    readonly string[];
    requiredProhibitedFragments:
    readonly string[];
    forbiddenDirectionFragments:
    readonly string[];
    expectsExistingFinancialDirection:
    boolean;
    expectsExistingExpansionDirection?:
    boolean;
};

export type WealthDirectionRegressionCaseResult = {
    name: string;
    questionText: string;
    actualTopic: string;
    actualSignals:
    QuestionRealitySignal[];
    verdict:
    DecisionVerdict;
    recommendedDirection: string;
    prohibitedDirection: string;
    checks: {
        expectedTopicWasResolved:
        boolean;
        expectedSignalsWereExtracted:
        boolean;
        recommendedDirectionIncludesReality:
        boolean;
        prohibitedDirectionIncludesReality:
        boolean;
        unexpectedWealthDirectionWasExcluded:
        boolean;
        existingFinancialDirectionWasPreserved:
        boolean;
        existingExpansionDirectionWasPreserved:
        boolean;
        recommendedAndProhibitedDirectionsDiffer:
        boolean;
        directionsDoNotRepeatConditionRequirements:
        boolean;
        directionsDoNotRepeatRiskConsequences:
        boolean;
        directionsDifferFromConditionDescriptions:
        boolean;
        directionsDifferFromRiskDescriptions:
        boolean;
        verdictRemainsEngineOwned:
        boolean;
        decisionUsesHumanContext:
        boolean;
        decisionUsesQuestionContext:
        boolean;
    };
    passed: boolean;
};

export type WealthDirectionRegressionVerificationResult = {
    cases:
    WealthDirectionRegressionCaseResult[];
    passed: boolean;
};

const WEALTH_DIRECTION_FRAGMENTS:
    readonly string[] = [
        "필수자금 보호 범위",
        "필수자금 직접 투입",
        "환금성 우선 범위",
        "회수 경로가 불분명",
        "자산별 분산 범위",
        "단일 종목·단일 자산 집중",
    ];

const CONDITION_REQUIREMENT_FRAGMENTS:
    readonly string[] = [
        "투자금과 분리하고",
        "투자 가능 금액과 손실 한도를 확정",
        "중도 환매·매도 가능 시점과 예상 회수 기간을 확인",
        "비상 현금 규모를 확보",
        "최대 투자 비중과 분산 기준을 정한 뒤",
    ];

const RISK_CONSEQUENCE_FRAGMENTS:
    readonly string[] = [
        "생활 기반에 직접 전이",
        "자금을 회수하지 못해",
        "전체 자산 손실로 확대",
        "분산되지 않은 손실 충격",
    ];

const EXISTING_FINANCIAL_RECOMMENDED_FRAGMENTS:
    readonly string[] = [
        "현재 수입 기반",
        "생활비와 비상자금",
        "재정 압박",
        "자금 보전",
        "현재 수입·고정비·부채·가용자금",
    ];

const EXISTING_FINANCIAL_PROHIBITED_FRAGMENTS:
    readonly string[] = [
        "생활자금과 실행자금",
        "재정 안전장치",
        "현재 재정 부담",
        "손실을 만회",
        "실제 현금흐름",
    ];
const EXISTING_EXPANSION_RECOMMENDED_FRAGMENTS:
    readonly string[] = [
        "현재 선택은 실행하되",
        "확장 위험을 통제",
        "현재 부담을 줄이고",
        "현재 선택의 규모",
        "필요 자금과 손실 가능 범위",
    ];

const EXISTING_EXPANSION_PROHIBITED_FRAGMENTS:
    readonly string[] = [
        "초기 검증 없이",
        "필수 조건을 갖추지 않은",
        "새로운 고정비",
        "감당 범위를 넘는",
        "확장 위험을 확인하지 않은",
    ];

const WEALTH_DIRECTION_FIXTURES:
    readonly WealthDirectionRegressionFixture[] = [
        {
            name:
                "essential-funds-create-protective-direction",
            questionText:
                "퇴직금 전부를 주식에 넣어도 될까요?",
            expectedTopic:
                "money",
            expectedSignals: [
                "essentialFundsExposure",
            ],
            requiredRecommendedFragments: [
                "필수자금 보호 범위",
            ],
            requiredProhibitedFragments: [
                "필수자금 직접 투입",
            ],
            forbiddenDirectionFragments: [
                "환금성 우선 범위",
                "자산별 분산 범위",
            ],
            expectsExistingFinancialDirection:
                false,
        },
        {
            name:
                "essential-funds-direction-applies-to-real-estate",
            questionText:
                "비상금 전부로 상가에 투자해도 될까요?",
            expectedTopic:
                "realEstate",
            expectedSignals: [
                "essentialFundsExposure",
            ],
            requiredRecommendedFragments: [
                "필수자금 보호 범위",
            ],
            requiredProhibitedFragments: [
                "필수자금 직접 투입",
            ],
            forbiddenDirectionFragments: [
                "환금성 우선 범위",
                "자산별 분산 범위",
            ],
            expectsExistingFinancialDirection:
                false,
        },
        {
            name:
                "liquidity-constraint-creates-liquid-direction",
            questionText:
                "ETF는 중도 환매가 어렵고 자금이 묶이는데 투자해도 될까요?",
            expectedTopic:
                "money",
            expectedSignals: [
                "liquidityConstraint",
            ],
            requiredRecommendedFragments: [
                "환금성 우선 범위",
            ],
            requiredProhibitedFragments: [
                "회수 경로가 불분명",
            ],
            forbiddenDirectionFragments: [
                "필수자금 보호 범위",
                "자산별 분산 범위",
            ],
            expectsExistingFinancialDirection:
                false,
        },
        {
            name:
                "asset-concentration-creates-diversified-direction",
            questionText:
                "한 종목에 집중해서 투자해도 될까요?",
            expectedTopic:
                "money",
            expectedSignals: [
                "assetConcentration",
            ],
            requiredRecommendedFragments: [
                "자산별 분산 범위",
            ],
            requiredProhibitedFragments: [
                "단일 종목·단일 자산 집중",
            ],
            forbiddenDirectionFragments: [
                "필수자금 보호 범위",
                "환금성 우선 범위",
            ],
            expectsExistingFinancialDirection:
                false,
        },
        {
            name:
                "combined-wealth-reality-keeps-all-directions",
            questionText:
                "퇴직금 전부를 한 자산에 집중해서 투자하려는데 중도 환매가 어렵고 자금이 묶입니다. 진행해도 될까요?",
            expectedTopic:
                "money",
            expectedSignals: [
                "essentialFundsExposure",
                "liquidityConstraint",
                "assetConcentration",
            ],
            requiredRecommendedFragments: [
                "필수자금 보호 범위",
                "환금성 우선 범위",
                "자산별 분산 범위",
            ],
            requiredProhibitedFragments: [
                "필수자금 직접 투입",
                "회수 경로가 불분명",
                "단일 종목·단일 자산 집중",
            ],
            forbiddenDirectionFragments: [],
            expectsExistingFinancialDirection:
                false,
        },
        {
            name:
                "debt-and-living-cost-financial-direction-remains",
            questionText:
                "생활비와 대출 부담이 있는 상황에서 여유자금 투자가 가능한가?",
            expectedTopic:
                "money",
            expectedSignals: [
                "debtBurden",
                "livingCostPressure",
            ],
            requiredRecommendedFragments: [],
            requiredProhibitedFragments: [],
            forbiddenDirectionFragments: [
                "필수자금 보호 범위",
                "필수자금 직접 투입",
                "환금성 우선 범위",
                "회수 경로가 불분명",
                "자산별 분산 범위",
                "단일 종목·단일 자산 집중",
            ],
            expectsExistingFinancialDirection:
                true,
        },
        {
            name:
                "debt-and-fixed-cost-expansion-direction-remains",
            questionText:
                "대출이 있고 보유세와 관리비 부담도 큰데 부동산에 추가 투자해도 될까요?",
            expectedTopic:
                "realEstate",
            expectedSignals: [
                "debtBurden",
                "fixedCostPressure",
            ],
            requiredRecommendedFragments: [],
            requiredProhibitedFragments: [],
            forbiddenDirectionFragments: [
                "필수자금 보호 범위",
                "필수자금 직접 투입",
                "환금성 우선 범위",
                "회수 경로가 불분명",
                "자산별 분산 범위",
                "단일 종목·단일 자산 집중",
            ],
            expectsExistingFinancialDirection:
                false,
            expectsExistingExpansionDirection:
                true,
        },
        {
            name:
                "retirement-funds-management-does-not-infer-direction",
            questionText:
                "퇴직금을 어떻게 운용하면 좋을까요?",
            expectedTopic:
                "money",
            expectedSignals: [],
            requiredRecommendedFragments: [],
            requiredProhibitedFragments: [],
            forbiddenDirectionFragments:
                WEALTH_DIRECTION_FRAGMENTS,
            expectsExistingFinancialDirection:
                false,
        },
        {
            name:
                "bond-investment-without-reality-has-no-wealth-direction",
            questionText:
                "채권에 투자해도 될까요?",
            expectedTopic:
                "money",
            expectedSignals: [],
            requiredRecommendedFragments: [],
            requiredProhibitedFragments: [],
            forbiddenDirectionFragments:
                WEALTH_DIRECTION_FRAGMENTS,
            expectsExistingFinancialDirection:
                false,
        },
        {
            name:
                "condition-risk-and-direction-keep-distinct-roles",
            questionText:
                "비상금 전부를 한 종목에 집중해서 투자하려는데 중도 환매가 어렵고 자금이 묶입니다. 투자해도 될까요?",
            expectedTopic:
                "money",
            expectedSignals: [
                "essentialFundsExposure",
                "liquidityConstraint",
                "assetConcentration",
            ],
            requiredRecommendedFragments: [
                "필수자금 보호 범위",
                "환금성 우선 범위",
                "자산별 분산 범위",
            ],
            requiredProhibitedFragments: [
                "필수자금 직접 투입",
                "회수 경로가 불분명",
                "단일 종목·단일 자산 집중",
            ],
            forbiddenDirectionFragments: [],
            expectsExistingFinancialDirection:
                false,
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

function includesEvery(
    text: string,
    fragments: readonly string[],
): boolean {
    return fragments.every(
        (fragment) =>
            text.includes(fragment),
    );
}

function includesNone(
    texts: readonly string[],
    fragments: readonly string[],
): boolean {
    return fragments.every(
        (fragment) =>
            texts.every(
                (text) =>
                    !text.includes(fragment),
            ),
    );
}

function verifyWealthDirection(
    fixture:
        WealthDirectionRegressionFixture,
): WealthDirectionRegressionCaseResult {
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

    const directionTexts = [
        result.recommendedDirection,
        result.prohibitedDirection,
    ];

    const conditionDescriptions =
        result.conditions.map(
            (condition) =>
                condition.description,
        );

    const riskDescriptions =
        result.risks.map(
            (risk) =>
                risk.description,
        );

    const existingFinancialDirectionWasPreserved =
        !fixture.expectsExistingFinancialDirection
        || (
            EXISTING_FINANCIAL_RECOMMENDED_FRAGMENTS
                .some(
                    (fragment) =>
                        result.recommendedDirection
                            .includes(fragment),
                )
            && EXISTING_FINANCIAL_PROHIBITED_FRAGMENTS
                .some(
                    (fragment) =>
                        result.prohibitedDirection
                            .includes(fragment),
                )
        );

    const existingExpansionDirectionWasPreserved =
        fixture.expectsExistingExpansionDirection
        !== true
        || (
            EXISTING_EXPANSION_RECOMMENDED_FRAGMENTS
                .some(
                    (fragment) =>
                        result.recommendedDirection
                            .includes(fragment),
                )
            && EXISTING_EXPANSION_PROHIBITED_FRAGMENTS
                .some(
                    (fragment) =>
                        result.prohibitedDirection
                            .includes(fragment),
                )
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

        recommendedDirectionIncludesReality:
            includesEvery(
                result.recommendedDirection,
                fixture
                    .requiredRecommendedFragments,
            ),

        prohibitedDirectionIncludesReality:
            includesEvery(
                result.prohibitedDirection,
                fixture
                    .requiredProhibitedFragments,
            ),

        unexpectedWealthDirectionWasExcluded:
            includesNone(
                directionTexts,
                fixture.forbiddenDirectionFragments,
            ),

        existingFinancialDirectionWasPreserved,
        existingExpansionDirectionWasPreserved,

        recommendedAndProhibitedDirectionsDiffer:
            result.recommendedDirection
            !== result.prohibitedDirection,

        directionsDoNotRepeatConditionRequirements:
            includesNone(
                directionTexts,
                CONDITION_REQUIREMENT_FRAGMENTS,
            ),

        directionsDoNotRepeatRiskConsequences:
            includesNone(
                directionTexts,
                RISK_CONSEQUENCE_FRAGMENTS,
            ),

        directionsDifferFromConditionDescriptions:
            directionTexts.every(
                (direction) =>
                    conditionDescriptions.every(
                        (description) =>
                            direction !== description,
                    ),
            ),

        directionsDifferFromRiskDescriptions:
            directionTexts.every(
                (direction) =>
                    riskDescriptions.every(
                        (description) =>
                            direction !== description,
                    ),
            ),

        verdictRemainsEngineOwned:
            result.coreDecision
            === buildCoreDecision(
                result.verdict,
                input.question
                    .decisionQuestion,
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
        verdict:
            result.verdict,
        recommendedDirection:
            result.recommendedDirection,
        prohibitedDirection:
            result.prohibitedDirection,
        checks,
        passed:
            Object.values(checks)
                .every(Boolean),
    };
}

export function verifyWealthDirectionRegression():
    WealthDirectionRegressionVerificationResult {
    const cases =
        WEALTH_DIRECTION_FIXTURES.map(
            verifyWealthDirection,
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