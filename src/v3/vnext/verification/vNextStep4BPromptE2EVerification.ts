import {
  buildResponsePrompt,
  buildResponsePromptFromAction,
} from "../prompt/responsePromptBuilder.js";
import {
  applyPromptBudget,
} from "../prompt/promptBudgetController.js";
import {
  buildPromptSections,
} from "../prompt/promptSectionBuilder.js";
import {
  resolvePromptStrategy,
} from "../prompt/promptStrategyResolver.js";
import {
  buildMockSeptember2026LuckFlow,
  includesAll,
  runPromptPipelineCase,
} from "./promptVerificationFixture.js";
import {
  containsGenericMoneyTheory,
  containsMoneyFlowForbiddenRule,
  containsTimeSegmentSections,
  verifyPromptReduction,
} from "./promptReductionVerification.js";
import type {
  ResponseActionType,
} from "../response/responseContext.js";
import type {
  ConversationStyle,
  PromptBudgetLevel,
} from "../types/responsePrompt.js";

export type VNextStep4BPromptE2ECase = {
  id: string;
  questionText: string;
  passed: boolean;
  actionType: ResponseActionType | null;
  promptGenerated: boolean;
  conversationStyle: ConversationStyle | null;
  budget: PromptBudgetLevel | null;
  estimatedSize: number | null;
  details: string[];
};

export type VNextStep4BPromptE2EVerificationResult = {
  passed: boolean;
  cases: VNextStep4BPromptE2ECase[];
};

function runE2ECase(
  id: string,
  questionText: string,
  validate: (input: {
    actionType: ResponseActionType;
    promptGenerated: boolean;
    conversationStyle: ConversationStyle | null;
    selectedBlockIds: string[];
    estimatedSize: number | null;
    reductionPassed: boolean;
  }) => {
    passed: boolean;
    details: string[];
  },
  options?: Parameters<typeof runPromptPipelineCase>[1],
): VNextStep4BPromptE2ECase {
  const { action, context } = runPromptPipelineCase(
    questionText,
    options,
  );

  const prompt = buildResponsePromptFromAction(action, "standard");
  const promptGenerated = prompt !== null;

  let conversationStyle: ConversationStyle | null = null;
  let selectedBlockIds: string[] = [];
  let estimatedSize: number | null = null;
  let reductionPassed = false;

  if (prompt && context) {
    conversationStyle = prompt.metadata.conversationStyle;
    selectedBlockIds = prompt.metadata.selectedBlockIds;
    estimatedSize = prompt.metadata.estimatedSize;
    reductionPassed = verifyPromptReduction(prompt, context).passed;
  }

  const validation = validate({
    actionType: action.type,
    promptGenerated,
    conversationStyle,
    selectedBlockIds,
    estimatedSize,
    reductionPassed,
  });

  return {
    id,
    questionText,
    passed: validation.passed,
    actionType: action.type,
    promptGenerated,
    conversationStyle,
    budget: prompt?.metadata.budget ?? null,
    estimatedSize,
    details: [
      `action=${action.type}`,
      `promptGenerated=${promptGenerated}`,
      ...validation.details,
    ],
  };
}

export function verifyVNextStep4BPromptE2E(): VNextStep4BPromptE2EVerificationResult {
  const cases: VNextStep4BPromptE2ECase[] = [
    runE2ECase(
      "case-1-career-aptitude",
      "나에게 맞는 직업은 무엇인가요?",
      ({
        actionType,
        promptGenerated,
        conversationStyle,
        selectedBlockIds,
        reductionPassed,
      }) => ({
        passed: actionType === "consulting"
          && promptGenerated
          && conversationStyle === "conversational"
          && includesAll(selectedBlockIds, [
            "ability",
            "suitableRole",
            "workingEnvironment",
            "caution",
            "nextAction",
          ])
          && reductionPassed,
        details: [
          `conversationStyle=${conversationStyle}`,
          `selectedBlockIds=${selectedBlockIds.join(",")}`,
          `reductionPassed=${reductionPassed}`,
        ],
      }),
    ),
    runE2ECase(
      "case-2-october-money-flow",
      "10월 금전운이 있을까요?",
      ({
        actionType,
        promptGenerated,
        conversationStyle,
        selectedBlockIds,
        estimatedSize,
        reductionPassed,
      }) => {
        const prompt = buildResponsePromptFromAction(
          runPromptPipelineCase(
            "10월 금전운이 있을까요?",
            { includeLuckFlow: true },
          ).action,
          "standard",
        );

        return {
          passed: actionType === "consulting"
            && promptGenerated
            && conversationStyle === "conversational"
            && includesAll(selectedBlockIds, [
              "periodOverview",
              "earlyPeriod",
              "middlePeriod",
              "latePeriod",
            ])
            && reductionPassed
            && prompt !== null
            && !containsGenericMoneyTheory(prompt)
            && containsMoneyFlowForbiddenRule(prompt)
            && (estimatedSize ?? 0) > 0,
          details: [
            `conversationStyle=${conversationStyle}`,
            `estimatedSize=${estimatedSize}`,
            `moneyFlowForbiddenRule=${prompt
              ? containsMoneyFlowForbiddenRule(prompt)
              : false}`,
          ],
        };
      },
      { includeLuckFlow: true },
    ),
    runE2ECase(
      "case-3-store-opening",
      "10월에 가게를 오픈하려고 하는데 어떨까요?",
      ({
        actionType,
        promptGenerated,
        conversationStyle,
        selectedBlockIds,
        reductionPassed,
      }) => ({
        passed: actionType === "consulting"
          && promptGenerated
          && conversationStyle === "decisionSupport"
          && includesAll(selectedBlockIds, [
            "directAnswer",
            "currentDirection",
            "conditions",
            "risk",
            "scale",
            "timing",
            "nextAction",
          ])
          && reductionPassed,
        details: [
          `conversationStyle=${conversationStyle}`,
          `selectedBlockIds=${selectedBlockIds.join(",")}`,
        ],
      }),
      { includeLuckFlow: true },
    ),
    runE2ECase(
      "case-4-compatibility-clarification-bypass",
      "상대방과 궁합은 어떤가요?",
      ({ actionType, promptGenerated }) => ({
        passed: actionType === "clarification" && !promptGenerated,
        details: [
          `bypassConfirmed=${actionType === "clarification" && !promptGenerated}`,
        ],
      }),
    ),
    runE2ECase(
      "case-5-september-2026-flow",
      "2026년 9월 운세",
      ({
        actionType,
        promptGenerated,
        conversationStyle,
        reductionPassed,
      }) => {
        const { context } = runPromptPipelineCase(
          "2026년 9월 운세",
          {
            luckFlow: buildMockSeptember2026LuckFlow(),
            targetPeriod: {
              start: "2026-09-01",
              end: "2026-09-30",
              granularity: "month",
              label: "2026-09",
            },
          },
        );

        const prompt = context
          ? buildResponsePrompt({ responseContext: context })
          : null;

        return {
          passed: actionType === "consulting"
            && promptGenerated
            && conversationStyle === "conversational"
            && reductionPassed
            && prompt !== null
            && containsTimeSegmentSections(prompt),
          details: [
            `timeSegments=${prompt
              ? containsTimeSegmentSections(prompt)
              : false}`,
          ],
        };
      },
      {
        luckFlow: buildMockSeptember2026LuckFlow(),
        targetPeriod: {
          start: "2026-09-01",
          end: "2026-09-30",
          granularity: "month",
          label: "2026-09",
        },
      },
    ),
    (() => {
      const questionText = "10월 금전운이 있을까요?";
      const questionPipeline = runPromptPipelineCase(questionText, {
        includeLuckFlow: true,
        answerMode: "question",
      });
      const reportPipeline = runPromptPipelineCase(questionText, {
        includeLuckFlow: true,
        answerMode: "report",
      });

      const questionPrompt = buildResponsePromptFromAction(
        questionPipeline.action,
      );
      const reportPrompt = buildResponsePromptFromAction(
        reportPipeline.action,
      );

      const questionStrategy = questionPipeline.context
        ? resolvePromptStrategy(questionPipeline.context)
        : null;
      const reportStrategy = reportPipeline.context
        ? resolvePromptStrategy(reportPipeline.context)
        : null;

      const questionSections = questionPipeline.context && questionStrategy
        ? applyPromptBudget(
            buildPromptSections(
              questionPipeline.context,
              questionStrategy,
            ),
            "standard",
            questionStrategy,
          )
        : [];
      const reportSections = reportPipeline.context && reportStrategy
        ? applyPromptBudget(
            buildPromptSections(
              reportPipeline.context,
              reportStrategy,
            ),
            "standard",
            reportStrategy,
          )
        : [];

      const checks = [
        questionPrompt !== null,
        reportPrompt !== null,
        questionPrompt!.metadata.conversationStyle === "conversational",
        reportPrompt!.metadata.conversationStyle === "analyticalReport",
        questionPrompt!.metadata.estimatedSize
          < reportPrompt!.metadata.estimatedSize,
        questionSections.length !== reportSections.length,
      ];

      return {
        id: "case-6-report-mode-prompt-difference",
        questionText,
        passed: checks.every(Boolean),
        actionType: reportPipeline.action.type,
        promptGenerated: reportPrompt !== null,
        conversationStyle: reportPrompt?.metadata.conversationStyle ?? null,
        budget: reportPrompt?.metadata.budget ?? null,
        estimatedSize: reportPrompt?.metadata.estimatedSize ?? null,
        details: [
          `questionSize=${questionPrompt?.metadata.estimatedSize}`,
          `reportSize=${reportPrompt?.metadata.estimatedSize}`,
          `questionSections=${questionSections.length}`,
          `reportSections=${reportSections.length}`,
        ],
      };
    })(),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeVNextStep4BPromptE2EResult(
  result: VNextStep4BPromptE2EVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
