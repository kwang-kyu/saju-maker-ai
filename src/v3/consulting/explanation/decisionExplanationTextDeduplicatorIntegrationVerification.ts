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
  export type DecisionExplanationTextDeduplicatorIntegrationVerificationResult = {
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
  };
  function normalizeLine(
    value: string,
  ): string {
    return value
      .trim()
      .replace(/\s+/g, " ");
  }
  function getBlockContent(
    plan: DecisionExplanationPlan,
    step:
      DecisionExplanationPlan["blocks"][number]["step"],
  ): string {
    return (
      plan.blocks.find(
        (block) =>
          block.step === step,
      )?.content
      ?? ""
    );
  }

  function countNormalizedLines(
    content: string,
    target: string,
  ): number {
    const normalizedTarget =
      normalizeLine(target);

    return content
      .split(/\r?\n/)
      .map(normalizeLine)
      .filter(
        (line) =>
          line === normalizedTarget,
      )
      .length;
  }

  function countOccurrences(
    value: string,
    target: string,
  ): number {
    return value
      .split(target)
      .length - 1;
  }

  function buildIntegrationInput():
    DecisionExplanationInput {
    const result =
      runDecisionEngine(
        buildDecisionEngineRegressionInput(),
      );

    const base =
      readDecisionResult(
        result,
      );

    const evidenceDescription =
      base.evidence[0].description;

    const conditionDescription =
      "개인의 자금 규모와 현재 책임 범위를 확인한 뒤 실행 범위를 확정해야 한다.";

    const similarRiskDescription =
      "현재 책임 범위를 넘겨 실행하면 자금 운용과 일상 유지가 동시에 흔들릴 수 있다.";

    return {
      ...base,

      evidence: [
        ...base.evidence,

        {
          ...base.evidence[0],

          description:
            `  ${evidenceDescription}  `,
        },
      ],

      conditions: [
        ...base.conditions,

        {
          key:
            "explanation-dedup-evidence-condition",

          description:
            evidenceDescription,

          required: true,

          satisfied: false,
        },

        {
          key:
            "explanation-dedup-condition-original",

          description:
            conditionDescription,

          required: true,

          satisfied: false,
        },

        {
          key:
            "explanation-dedup-condition-whitespace",

          description:
            "  개인의  자금 규모와 현재 책임 범위를 확인한 뒤 실행 범위를 확정해야 한다.  ",

          required: true,

          satisfied: false,
        },
      ],

      risks: [
        ...base.risks,

        {
          key:
            "explanation-dedup-condition-risk",

          source:
            base.risks[0].source,

          description:
            conditionDescription,

          severity: "high",
        },

        {
          key:
            "explanation-dedup-similar-risk",

          source:
            base.risks[0].source,

          description:
            similarRiskDescription,

          severity: "high",
        },
      ],
    };
  }

  export function verifyDecisionExplanationTextDeduplicatorIntegration():
    DecisionExplanationTextDeduplicatorIntegrationVerificationResult {
    const input =
      buildIntegrationInput();

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

    const evidenceContent =
      getBlockContent(
        plan,
        "evidence",
      );

    const conditionsContent =
      getBlockContent(
        plan,
        "conditions",
      );

    const risksContent =
      getBlockContent(
        plan,
        "risks",
      );

    const evidenceDescription =
      input.evidence[0].description;

    const conditionDescription =
      "개인의 자금 규모와 현재 책임 범위를 확인한 뒤 실행 범위를 확정해야 한다.";

    const similarRiskDescription =
      "현재 책임 범위를 넘겨 실행하면 자금 운용과 일상 유지가 동시에 흔들릴 수 있다.";

    const checks = {
      evidenceDuplicateRemoved:
        countNormalizedLines(
          evidenceContent,
          evidenceDescription,
        ) === 1,

      evidenceSentenceExcludedFromConditions:
        countNormalizedLines(
          conditionsContent,
          evidenceDescription,
        ) === 0,

      conditionWhitespaceDuplicateRemoved:
        countNormalizedLines(
          conditionsContent,
          conditionDescription,
        ) === 1,

      conditionSentenceExcludedFromRisks:
        countNormalizedLines(
          risksContent,
          conditionDescription,
        ) === 0,

      similarButDifferentRiskPreserved:
        countNormalizedLines(
          risksContent,
          similarRiskDescription,
        ) === 1,

      conditionsBlockRemainsRequired:
        plan.blocks.find(
          (block) =>
            block.step === "conditions",
        )?.required
        === true,

      risksBlockRemainsRequired:
        plan.blocks.find(
          (block) =>
            block.step === "risks",
        )?.required
        === true,

      payloadIncludesConditionOnce:
        payload.explanationOrder.filter(
          (item) =>
            item.title === "필수 조건",
        )
          .reduce(
            (count, item) =>
              count
              + countNormalizedLines(
                item.content,
                conditionDescription,
              ),
            0,
          )
        === 1,

      payloadIncludesSimilarRiskOnce:
        payload.explanationOrder.filter(
          (item) =>
            item.title === "주의할 위험",
        )
          .reduce(
            (count, item) =>
              count
              + countNormalizedLines(
                item.content,
                similarRiskDescription,
              ),
            0,
          )
        === 1,

      promptIncludesConditionOnce:
        countOccurrences(
          prompt.userPrompt,
          conditionDescription,
        ) === 1,

      promptIncludesSimilarRiskOnce:
        countOccurrences(
          prompt.userPrompt,
          similarRiskDescription,
        ) === 1,

      engineDecisionRemainsLocked:
        plan.engineDecisionLocked
        === true,

      gptMayNotRejudge:
        plan.gptMayRejudge
        === false,
    };

    return {
      plan,

      payload,

      prompt,

      checks,

      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }