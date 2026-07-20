import {
    runDecisionEngine,
  } from "../decision/decisionEngine";
  import {
    buildDecisionEngineRegressionInput,
  } from "../decision/regression/decisionEngineRegressionFixture";
  import {
    readDecisionResult,
    type DecisionExplanationInput,
  } from "./decisionResultReader";
  import {
    buildDecisionExplanationPlan,
    type DecisionExplanationPlan,
  } from "./decisionExplanationPlan";
  import {
    buildDecisionExplanationPayload,
    type DecisionExplanationPayload,
  } from "./decisionExplanationPayload";
  import {
    buildConsultingPrompt,
    type ConsultingPrompt,
  } from "./consultingPromptBuilder";
  
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
  
          promptIncludesLockedVerdict:
            prompt.userPrompt
              .includes(
                "판단 결과: wait",
              ),
  
          systemPromptForbidsVerdictChange:
            prompt.systemPrompt
              .includes(
                "엔진의 verdict를 변경하지 않는다.",
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