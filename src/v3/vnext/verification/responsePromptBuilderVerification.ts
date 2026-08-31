import {
  buildResponsePrompt,
  buildResponsePromptFromAction,
} from "../prompt/responsePromptBuilder.js";
import {
  buildMockSeptember2026LuckFlow,
  includesAll,
  runPromptPipelineCase,
} from "./promptVerificationFixture.js";
import {
  containsFixedReportStructure,
  containsGenericMoneyTheory,
  containsMoneyFlowForbiddenRule,
  containsTechnicalFragmentRule,
  containsTimeSegmentSections,
  verifyPromptReduction,
} from "./promptReductionVerification.js";
import type {
  ResponsePrompt,
} from "../types/responsePrompt.js";

export type ResponsePromptBuilderVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
  prompt: ResponsePrompt | null;
};

export type ResponsePromptBuilderVerificationResult = {
  passed: boolean;
  cases: ResponsePromptBuilderVerificationCase[];
};

function verifyConsultingPromptCase(
  id: string,
  questionText: string,
  validate: (
    prompt: ResponsePrompt,
  ) => {
    passed: boolean;
    details: string[];
  },
  options?: Parameters<typeof runPromptPipelineCase>[1],
): ResponsePromptBuilderVerificationCase {
  const { action, context } = runPromptPipelineCase(
    questionText,
    options,
  );

  const bypassPrompt = buildResponsePromptFromAction(action);

  if (action.type !== "consulting" || !context || !bypassPrompt) {
    return {
      id,
      passed: false,
      details: [
        `action=${action.type}`,
        "expected consulting prompt",
      ],
      prompt: bypassPrompt,
    };
  }

  const prompt = buildResponsePrompt({
    responseContext: context,
    budget: "standard",
  });
  const reduction = verifyPromptReduction(prompt, context);
  const validation = validate(prompt);

  return {
    id,
    passed: reduction.passed && validation.passed,
    details: [
      `action=${action.type}`,
      `conversationStyle=${prompt.metadata.conversationStyle}`,
      ...reduction.details,
      ...validation.details,
    ],
    prompt,
  };
}

export function verifyResponsePromptBuilder(): ResponsePromptBuilderVerificationResult {
  const cases: ResponsePromptBuilderVerificationCase[] = [
    verifyConsultingPromptCase(
      "case-1-career-aptitude",
      "나에게 맞는 직업은 무엇인가요?",
      (prompt) => ({
        passed: prompt.metadata.conversationStyle === "conversational"
          && includesAll(prompt.metadata.selectedBlockIds, [
            "ability",
            "suitableRole",
          ]),
        details: [
          `selectedBlockIds=${prompt.metadata.selectedBlockIds.join(",")}`,
        ],
      }),
    ),
    verifyConsultingPromptCase(
      "case-2-october-money-flow",
      "10월 금전운이 있을까요?",
      (prompt) => ({
        passed: containsTimeSegmentSections(prompt)
          && !containsGenericMoneyTheory(prompt)
          && containsMoneyFlowForbiddenRule(prompt)
          && !containsFixedReportStructure(prompt),
        details: [
          `timeSegments=${containsTimeSegmentSections(prompt)}`,
          `genericMoneyTheory=${containsGenericMoneyTheory(prompt)}`,
          `moneyFlowForbiddenRule=${containsMoneyFlowForbiddenRule(prompt)}`,
        ],
      }),
      { includeLuckFlow: true },
    ),
    verifyConsultingPromptCase(
      "case-3-store-opening",
      "10월에 가게를 오픈하려고 하는데 어떨까요?",
      (prompt) => ({
        passed: prompt.metadata.conversationStyle === "decisionSupport"
          && includesAll(prompt.metadata.selectedBlockIds, [
            "directAnswer",
            "conditions",
            "risk",
            "timing",
          ]),
        details: [
          `selectedBlockIds=${prompt.metadata.selectedBlockIds.join(",")}`,
        ],
      }),
      { includeLuckFlow: true },
    ),
    (() => {
      const { action } = runPromptPipelineCase(
        "상대방과 궁합은 어떤가요?",
      );
      const prompt = buildResponsePromptFromAction(action);

      return {
        id: "case-4-compatibility-clarification-bypass",
        passed: action.type === "clarification" && prompt === null,
        details: [
          `action=${action.type}`,
          `promptGenerated=${prompt !== null}`,
        ],
        prompt,
      };
    })(),
    verifyConsultingPromptCase(
      "case-5-september-2026-flow",
      "2026년 9월 운세",
      (prompt) => ({
        passed: containsTimeSegmentSections(prompt)
          && containsTechnicalFragmentRule(prompt),
        details: [
          `timeSegments=${containsTimeSegmentSections(prompt)}`,
          `technicalFragmentRule=${containsTechnicalFragmentRule(prompt)}`,
        ],
      }),
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
      const questionCase = runPromptPipelineCase(questionText, {
        includeLuckFlow: true,
        answerMode: "question",
      });
      const reportCase = runPromptPipelineCase(questionText, {
        includeLuckFlow: true,
        answerMode: "report",
      });

      const questionPrompt = questionCase.context
        ? buildResponsePrompt({ responseContext: questionCase.context })
        : null;
      const reportPrompt = reportCase.context
        ? buildResponsePrompt({ responseContext: reportCase.context })
        : null;

      const checks = [
        questionPrompt !== null,
        reportPrompt !== null,
        questionPrompt!.metadata.conversationStyle === "conversational",
        reportPrompt!.metadata.conversationStyle === "analyticalReport",
        questionPrompt!.metadata.estimatedSize
          !== reportPrompt!.metadata.estimatedSize,
        questionPrompt!.userPrompt !== reportPrompt!.userPrompt,
      ];

      return {
        id: "case-6-report-mode-prompt-difference",
        passed: checks.every(Boolean),
        details: [
          `questionStyle=${questionPrompt?.metadata.conversationStyle}`,
          `reportStyle=${reportPrompt?.metadata.conversationStyle}`,
          `questionSize=${questionPrompt?.metadata.estimatedSize}`,
          `reportSize=${reportPrompt?.metadata.estimatedSize}`,
        ],
        prompt: reportPrompt,
      };
    })(),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeResponsePromptBuilderVerificationResult(
  result: ResponsePromptBuilderVerificationResult,
): string {
  return JSON.stringify(
    {
      passed: result.passed,
      cases: result.cases.map((item) => ({
        id: item.id,
        passed: item.passed,
        details: item.details,
        estimatedSize: item.prompt?.metadata.estimatedSize ?? null,
      })),
    },
    null,
    2,
  );
}
