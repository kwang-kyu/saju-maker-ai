import {
    runDecisionEngine,
  } from "../decision/decisionEngine.js";
  import {
    buildDecisionEngineRegressionInput,
  } from "../decision/regression/decisionEngineRegressionFixture.js";
  import {
    readDecisionResult,
    type DecisionExplanationInput,
  } from "./decisionResultReader.js";
  import {
    buildDecisionExplanationPlan,
    type DecisionExplanationPlan,
  } from "./decisionExplanationPlan.js";
  import {
    buildDecisionExplanationPayload,
    type DecisionExplanationPayload,
  } from "./decisionExplanationPayload.js";
  import {
    buildConsultingPrompt,
    type ConsultingPrompt,
  } from "./consultingPromptBuilder.js";

  export type ReaderDecisionExplanationIntegrationVerificationResult = {
    cases: Array<{
      name: string;

      plan:
        DecisionExplanationPlan;

      payload:
        DecisionExplanationPayload;

      prompt:
        ConsultingPrompt;

      checks: Record<
        string,
        boolean
      >;

      passed: boolean;
    }>;

    passed: boolean;
  };

  function buildBaseInput():
    DecisionExplanationInput {
    const result =
      runDecisionEngine(
        buildDecisionEngineRegressionInput(),
      );

    return readDecisionResult(
      result,
    );
  }

  function buildReaderLimitedInput():
    DecisionExplanationInput {
    const base =
      buildBaseInput();

    return {
      ...base,

      verdict: "wait",

      directAnswer:
        "지금은 바로 실행하지 말고 기다리는 것이 맞다.",

      conditions: [
        ...base.conditions,

        {
          key:
            "readerDecisionCondition-capacity-risk",

          description:
            "위험 감당 범위와 보완 수단을 먼저 확정해야 한다.",

          required: true,

          satisfied: false,
        },
      ],

      risks: [
        ...base.risks,

        {
          key:
            "readerDecisionRisk-capacity-risk",

          source: "capacity",

          description:
            "감당 범위를 넘는 책임을 동시에 떠안으면 실행이 중단될 수 있다.",

          severity: "high",
        },
      ],

      recommendedDirection:
        "제한 요소를 해소하고 준비가 확인될 때까지 판단을 유보한다.",

      prohibitedDirection:
        "준비되지 않은 상태에서 즉시 실행하지 않는다.",

      finalDecisionSentence:
        "지금은 바로 실행하지 말고 기다리는 것이 맞다.",
    };
  }

  function findPlanBlockIndex(
    plan: DecisionExplanationPlan,
    step:
      DecisionExplanationPlan["blocks"][number]["step"],
  ): number {
    return plan.blocks.findIndex(
      (block) =>
        block.step === step,
    );
  }

  function countOccurrences(
    value: string,
    target: string,
  ): number {
    return value
      .split(target)
      .length - 1;
  }

  function buildCase(
    name: string,
    input:
      DecisionExplanationInput,
    checksBuilder: (
      plan:
        DecisionExplanationPlan,
      payload:
        DecisionExplanationPayload,
      prompt:
        ConsultingPrompt,
    ) => Record<string, boolean>,
  ): ReaderDecisionExplanationIntegrationVerificationResult["cases"][number] {
    const plan =
    buildDecisionExplanationPlan(
      input,
      "새로운 사업을 지금 시작해도 될까요?",
    );

    const payload =
      buildDecisionExplanationPayload(
        plan,
      );

    const prompt =
      buildConsultingPrompt(
        payload,
      );

    const checks =
      checksBuilder(
        plan,
        payload,
        prompt,
      );

    return {
      name,

      plan,

      payload,

      prompt,

      checks,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }

  function verifyReaderEffectDelivery():
    ReaderDecisionExplanationIntegrationVerificationResult["cases"][number] {
    const input =
      buildReaderLimitedInput();

    return buildCase(
      "reader-effect-reaches-consulting-prompt",

      input,

      (
        plan,
        payload,
        prompt,
      ) => {
        const readerBlock =
          plan.blocks.find(
            (block) =>
              block.step
              === "readerDecisionEffect",
          );

          const evidenceBlock =
          plan.blocks.find(
            (block) =>
              block.step
              === "evidence",
          );

        const conditionsBlock =
          plan.blocks.find(
            (block) =>
              block.step
              === "conditions",
          );

        const risksBlock =
          plan.blocks.find(
            (block) =>
              block.step
              === "risks",
          );

        const alignmentIndex =
          findPlanBlockIndex(
            plan,
            "alignment",
          );

        const readerEffectIndex =
          findPlanBlockIndex(
            plan,
            "readerDecisionEffect",
          );

        const evidenceIndex =
          findPlanBlockIndex(
            plan,
            "evidence",
          );

        return {
          readerBlockExists:
            readerBlock !== undefined,

          readerBlockRequired:
            readerBlock?.required
            === true,

          readerContentExplainsCapacity:
            readerBlock?.content
              .includes(
                "감당력 관련 판단",
              )
            === true,

          readerContentExplainsWait:
            readerBlock?.content
              .includes(
                "기다리는 판단",
              )
            === true,

            readerEffectExcludesConditionDetail:
            readerBlock?.content
              .includes(
                "위험 감당 범위와 보완 수단을 먼저 확정해야 한다.",
              )
            === false,

          readerEffectExcludesRiskDetail:
            readerBlock?.content
              .includes(
                "감당 범위를 넘는 책임을 동시에 떠안으면 실행이 중단될 수 있다.",
              )
            === false,

          conditionsBlockIncludesReaderCondition:
            conditionsBlock?.content
              .includes(
                "위험 감당 범위와 보완 수단을 먼저 확정해야 한다.",
              )
            === true,

          risksBlockIncludesReaderRisk:
            risksBlock?.content
              .includes(
                "감당 범위를 넘는 책임을 동시에 떠안으면 실행이 중단될 수 있다.",
              )
            === true,

          conditionKeepsRequirementRole:
            conditionsBlock?.content
              .includes(
                "확정해야 한다.",
              )
            === true,

          riskKeepsConsequenceRole:
            risksBlock?.content
              .includes(
                "중단될 수 있다.",
              )
            === true,

          promptIncludesReaderConditionOnce:
            countOccurrences(
              prompt.userPrompt,
              "위험 감당 범위와 보완 수단을 먼저 확정해야 한다.",
            ) === 1,

          promptIncludesReaderRiskOnce:
            countOccurrences(
              prompt.userPrompt,
              "감당 범위를 넘는 책임을 동시에 떠안으면 실행이 중단될 수 있다.",
            ) === 1,

            evidenceIncludesReaderSummary:
            evidenceBlock?.content
              .includes(
                "책임 감당력",
              )
            === true,

          evidenceExcludesReaderSupportingDetail:
            evidenceBlock?.content
              .includes(
                "자기 통제력과 실행력이 강해",
              )
            === false,

          evidencePreservesRepeatedPattern:
            evidenceBlock?.content
              .includes(
                "작게 시작하여 경험을 축적할수록",
              )
            === true,

          readerBlockOrderIsCorrect:
            alignmentIndex
            < readerEffectIndex
            && readerEffectIndex
            < evidenceIndex,

          payloadIncludesReaderTitle:
            payload
              .explanationOrder
              .some(
                (item) =>
                  item.title
                  === "사람의 구조가 판단에 미친 영향",
              ),

          payloadIncludesReaderContent:
            payload
              .explanationOrder
              .some(
                (item) =>
                  item.content
                    .includes(
                      "감당력 관련 판단",
                    ),
              ),

          promptIncludesReaderTitle:
            prompt.userPrompt
              .includes(
                "사람의 구조가 판단에 미친 영향",
              ),

          promptIncludesReaderContent:
            prompt.userPrompt
              .includes(
                "감당력 관련 판단",
              ),

              payloadPreservesOriginalQuestion:
              payload.originalQuestion
              === "새로운 사업을 지금 시작해도 될까요?",

            promptIncludesOriginalQuestion:
              prompt.userPrompt
                .includes(
                  "새로운 사업을 지금 시작해도 될까요?",
                ),

            promptIncludesKoreanQuestionClassification:
              prompt.userPrompt
                .includes(
                  "상담 영역: 사업과 창업",
                )
              && prompt.userPrompt
                .includes(
                  "질문 의도:",
                )
              && prompt.userPrompt
                .includes(
                  "결정할 대상:",
                ),

            promptIncludesLockedVerdict:
              prompt.userPrompt
                .includes(
                  "지금은 바로 실행하기보다 준비하며 기다리는 편이 좋습니다.",
                ),

            promptExcludesRawVerdict:
              !prompt.userPrompt
                .includes(
                  "판단 결과: wait",
                )
              && !prompt.userPrompt
                .includes(
                  "conditionallyRecommended",
                )
              && !prompt.userPrompt
                .includes(
                  "insufficientEvidence",
                ),

            promptExcludesInternalFieldNames:
              !prompt.userPrompt
                .includes(
                  "decisionTarget",
                )
              && !prompt.userPrompt
                .includes(
                  "questionTopic",
                )
              && !prompt.userPrompt
                .includes(
                  "topic: unknown",
                ),

            payloadExcludesFinalDecisionFromOrder:
              !payload
                .explanationOrder
                .some(
                  (item) =>
                    item.title
                    === "최종 판단",
                ),

            promptIncludesFinalDecisionOnce:
              countOccurrences(
                prompt.userPrompt,
                "최종 결론",
              ) === 1,

            promptIncludesCanonicalFinalDecision:
              prompt.userPrompt
                .includes(
                  payload.finalDecision,
                ),

            systemPromptForbidsVerdictChange:
              prompt.systemPrompt
                .includes(
                  "엔진의 verdict를 변경하지 않는다.",
                ),

            systemPromptRequiresKoreanOnly:
              prompt.systemPrompt
                .includes(
                  "반드시 자연스러운 한국어로만 답한다.",
                ),

            systemPromptForbidsInternalCodeExposure:
              prompt.systemPrompt
                .includes(
                  "영문 코드, 변수명, 내부 분류값, JSON, 내부 필드명을 노출하지 않는다.",
                ),

          engineDecisionLocked:
            plan.engineDecisionLocked
            && payload.engineDecisionLocked,

          gptMayNotRejudge:
            !plan.gptMayRejudge
            && !payload.gptMayRejudge,
        };
      },
    );
  }

  function verifyNoReaderEffectIsExcluded():
    ReaderDecisionExplanationIntegrationVerificationResult["cases"][number] {
    const input =
      buildBaseInput();

    return buildCase(
      "unused-reader-effect-is-excluded",

      input,

      (
        plan,
        payload,
        prompt,
      ) => {
        const readerBlock =
          plan.blocks.find(
            (block) =>
              block.step
              === "readerDecisionEffect",
          );

        return {
          readerBlockExists:
            readerBlock !== undefined,

          readerBlockNotRequired:
            readerBlock?.required
            === false,

          readerBlockContentIsEmpty:
            readerBlock?.content
            === "",

          payloadExcludesReaderTitle:
            !payload
              .explanationOrder
              .some(
                (item) =>
                  item.title
                  === "사람의 구조가 판단에 미친 영향",
              ),

          promptExcludesReaderTitle:
            !prompt.userPrompt
              .includes(
                "사람의 구조가 판단에 미친 영향",
              ),
              payloadExcludesFinalDecisionFromOrder:
              !payload
                .explanationOrder
                .some(
                  (item) =>
                    item.title
                    === "최종 판단",
                ),

                promptIncludesFinalDecisionOnce:
                countOccurrences(
                  prompt.userPrompt,
                  "최종 결론",
                ) === 1,

          promptIncludesCanonicalFinalDecision:
              prompt.userPrompt
                .includes(
                  payload.finalDecision,
                ),
        };
      },
    );
  }

  export function verifyReaderDecisionExplanationIntegration():
    ReaderDecisionExplanationIntegrationVerificationResult {
    const cases = [
      verifyReaderEffectDelivery(),

      verifyNoReaderEffectIsExcluded(),
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
