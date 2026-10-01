import {
  buildResponsePromptFromAction,
} from "../prompt/responsePromptBuilder.js";
import {
  createMockResponseGateway,
  generateNaturalConsultingResponse,
} from "../gpt/responseGateway.js";
import {
  resolvePromptStrategy,
} from "../prompt/promptStrategyResolver.js";
import {
  includesAll,
  runPromptPipelineCase,
} from "./promptVerificationFixture.js";
import type {
  ResponseAction,
  ResponseActionType,
} from "../response/responseContext.js";
import type {
  NaturalConsultingResponseSource,
} from "../gpt/responseGatewayTypes.js";

export type VNextStep4CGptE2ECase = {
  id: string;
  passed: boolean;
  details: string[];
  actionType: ResponseActionType;
  apiCallCount: number;
  source: NaturalConsultingResponseSource;
  validated: boolean;
};

export type VNextStep4CGptE2EVerificationResult = {
  passed: boolean;
  cases: VNextStep4CGptE2ECase[];
};

async function runGptE2ECase(
  id: string,
  run: () => Promise<{
    passed: boolean;
    details: string[];
    actionType: ResponseActionType;
    apiCallCount: number;
    source: NaturalConsultingResponseSource;
    validated: boolean;
  }>,
): Promise<VNextStep4CGptE2ECase> {
  const result = await run();

  return {
    id,
    passed: result.passed,
    details: result.details,
    actionType: result.actionType,
    apiCallCount: result.apiCallCount,
    source: result.source,
    validated: result.validated,
  };
}

export async function verifyVNextStep4CGptE2E(): Promise<VNextStep4CGptE2EVerificationResult> {
  const cases = await Promise.all([
    runGptE2ECase("case-1-career-aptitude", async () => {
      const { action } = runPromptPipelineCase(
        "나에게 맞는 직업은 무엇인가요?",
      );
      const prompt = buildResponsePromptFromAction(action);
      const gateway = createMockResponseGateway({
        responsesByScenario: {
          aptitudeRecommendation:
            "현재 확인된 성향과 적성을 기준으로, 맞춤형 직업 방향을 설명드리겠습니다.",
        },
      });

      const response = await generateNaturalConsultingResponse({
        action,
        prompt,
        gateway,
      });

      return {
        passed: action.type === "consulting"
          && response.apiCallCount === 1
          && response.source === "gpt"
          && response.validated
          && response.text.length > 0,
        details: [
          `action=${action.type}`,
          `apiCallCount=${response.apiCallCount}`,
          `source=${response.source}`,
          `latencyMs=${response.latencyMs}`,
        ],
        actionType: action.type,
        apiCallCount: response.apiCallCount,
        source: response.source,
        validated: response.validated,
      };
    }),

    runGptE2ECase("case-2-october-money-flow", async () => {
      const { action, context } = runPromptPipelineCase(
        "10월 금전운이 있을까요?",
        { includeLuckFlow: true },
      );
      const prompt = buildResponsePromptFromAction(action);
      const gateway = createMockResponseGateway();

      const response = await generateNaturalConsultingResponse({
        action,
        prompt,
        gateway,
      });

      const blockIds = prompt?.metadata.selectedBlockIds ?? [];

      return {
        passed: action.type === "consulting"
          && response.apiCallCount === 1
          && includesAll(blockIds, [
            "periodOverview",
            "earlyPeriod",
            "middlePeriod",
            "latePeriod",
          ])
          && Boolean(
            prompt?.userPrompt.includes("초")
            || prompt?.userPrompt.includes("초순"),
          )
          && response.text.length > 0,
        details: [
          `selectedBlockIds=${blockIds.join(",")}`,
          `promptHasTimeSegments=${Boolean(prompt?.userPrompt.includes("초") || prompt?.userPrompt.includes("초순"))}`,
          `contextBlocks=${context?.blocks.length ?? 0}`,
        ],
        actionType: action.type,
        apiCallCount: response.apiCallCount,
        source: response.source,
        validated: response.validated,
      };
    }),

    runGptE2ECase("case-3-store-opening", async () => {
      const { action } = runPromptPipelineCase(
        "10월에 가게를 오픈하려고 하는데 어떨까요?",
        { includeLuckFlow: true },
      );
      const prompt = buildResponsePromptFromAction(action);
      const gateway = createMockResponseGateway({
        responsesByScenario: {
          actionDecision:
            "현재 확인된 방향을 기준으로, 조건과 위험 요소를 함께 고려해 보시는 것이 좋습니다.",
        },
      });

      const response = await generateNaturalConsultingResponse({
        action,
        prompt,
        gateway,
      });

      const blockIds = prompt?.metadata.selectedBlockIds ?? [];

      return {
        passed: action.type === "consulting"
          && response.apiCallCount === 1
          && includesAll(blockIds, [
            "directAnswer",
            "currentDirection",
            "conditions",
            "risk",
            "scale",
            "timing",
            "nextAction",
          ])
          && response.text.length > 0,
        details: [
          `selectedBlockIds=${blockIds.join(",")}`,
          `conversationStyle=${prompt?.metadata.conversationStyle}`,
        ],
        actionType: action.type,
        apiCallCount: response.apiCallCount,
        source: response.source,
        validated: response.validated,
      };
    }),

    runGptE2ECase("case-4-compatibility-clarification", async () => {
      const { action } = runPromptPipelineCase(
        "상대방과 궁합은 어떤가요?",
      );
      const prompt = buildResponsePromptFromAction(action);
      const gateway = createMockResponseGateway();

      const response = await generateNaturalConsultingResponse({
        action,
        prompt,
        gateway,
      });

      return {
        passed: action.type === "clarification"
          && response.apiCallCount === 0
          && response.source === "clarification"
          && gateway.getCallRecord().callCount === 0
          && prompt === null,
        details: [
          `action=${action.type}`,
          `gatewayCalls=${gateway.getCallRecord().callCount}`,
          `promptGenerated=${prompt !== null}`,
        ],
        actionType: action.type,
        apiCallCount: response.apiCallCount,
        source: response.source,
        validated: response.validated,
      };
    }),

    runGptE2ECase("case-5-direct-action", async () => {
      const action: ResponseAction = {
        type: "direct",
        reason: "assessment is insufficient and blueprint is unavailable",
        context: null,
      };
      const gateway = createMockResponseGateway();

      const response = await generateNaturalConsultingResponse({
        action,
        prompt: null,
        gateway,
      });

      return {
        passed: action.type === "direct"
          && response.apiCallCount === 0
          && response.source === "direct"
          && gateway.getCallRecord().callCount === 0
          && response.text.length > 0,
        details: [
          `action=${action.type}`,
          `gatewayCalls=${gateway.getCallRecord().callCount}`,
          `reason=${action.reason}`,
        ],
        actionType: action.type,
        apiCallCount: response.apiCallCount,
        source: response.source,
        validated: response.validated,
      };
    }),

    runGptE2ECase("case-6-validation-failure-fallback", async () => {
      const { action, context } = runPromptPipelineCase(
        "10월 금전운이 있을까요?",
        { includeLuckFlow: true },
      );
      const prompt = buildResponsePromptFromAction(action);

      const invalidGateway = createMockResponseGateway({
        defaultResponse: "일간 辛(金) ↔ 월운",
      });

      const response = await generateNaturalConsultingResponse({
        action,
        prompt,
        gateway: invalidGateway,
      });

      return {
        passed: action.type === "consulting"
          && response.apiCallCount === 1
          && response.source === "fallback"
          && !response.validated
          && (response.validationIssues?.length ?? 0) > 0
          && response.text.length > 0
          && context !== null,
        details: [
          `source=${response.source}`,
          `validated=${response.validated}`,
          `issues=${response.validationIssues?.join(",") ?? "none"}`,
        ],
        actionType: action.type,
        apiCallCount: response.apiCallCount,
        source: response.source,
        validated: response.validated,
      };
    }),

    runGptE2ECase("case-7-report-mode", async () => {
      const questionPipeline = runPromptPipelineCase(
        "10월 금전운이 있을까요?",
        { includeLuckFlow: true, answerMode: "question" },
      );
      const reportPipeline = runPromptPipelineCase(
        "10월 금전운이 있을까요?",
        { includeLuckFlow: true, answerMode: "report" },
      );

      const questionPrompt = buildResponsePromptFromAction(
        questionPipeline.action,
      );
      const reportPrompt = buildResponsePromptFromAction(
        reportPipeline.action,
      );

      const gateway = createMockResponseGateway();
      const questionResponse = await generateNaturalConsultingResponse({
        action: questionPipeline.action,
        prompt: questionPrompt,
        gateway: createMockResponseGateway(),
      });
      const reportResponse = await generateNaturalConsultingResponse({
        action: reportPipeline.action,
        prompt: reportPrompt,
        gateway,
      });

      const questionStrategy = questionPipeline.context
        ? resolvePromptStrategy(questionPipeline.context)
        : null;
      const reportStrategy = reportPipeline.context
        ? resolvePromptStrategy(reportPipeline.context)
        : null;

      return {
        passed: questionPipeline.action.type === "consulting"
          && reportPipeline.action.type === "consulting"
          && questionResponse.apiCallCount === 1
          && reportResponse.apiCallCount === 1
          && questionPrompt!.metadata.conversationStyle === "conversational"
          && reportPrompt!.metadata.conversationStyle === "analyticalReport"
          && questionStrategy!.conversationStyle !== reportStrategy!.conversationStyle
          && reportResponse.text.length > 0,
        details: [
          `questionStyle=${questionPrompt?.metadata.conversationStyle}`,
          `reportStyle=${reportPrompt?.metadata.conversationStyle}`,
          `questionSize=${questionPrompt?.metadata.estimatedSize}`,
          `reportSize=${reportPrompt?.metadata.estimatedSize}`,
        ],
        actionType: reportPipeline.action.type,
        apiCallCount: reportResponse.apiCallCount,
        source: reportResponse.source,
        validated: reportResponse.validated,
      };
    }),
  ]);

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep4CGptE2EResult(
  result: VNextStep4CGptE2EVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
