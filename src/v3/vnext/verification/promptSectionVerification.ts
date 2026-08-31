import {
  buildPromptSections,
  renderPromptSections,
} from "../prompt/promptSectionBuilder.js";
import {
  resolvePromptStrategy,
} from "../prompt/promptStrategyResolver.js";
import {
  runPromptPipelineCase,
  buildMockSeptember2026LuckFlow,
} from "./promptVerificationFixture.js";

export type PromptSectionVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
  sectionTitles: string[];
  estimatedSize: number;
};

export type PromptSectionVerificationResult = {
  passed: boolean;
  cases: PromptSectionVerificationCase[];
};

function verifySections(
  id: string,
  questionText: string,
  validate: (rendered: string, sectionTitles: string[]) => boolean,
  options?: Parameters<typeof runPromptPipelineCase>[1],
): PromptSectionVerificationCase {
  const { context } = runPromptPipelineCase(questionText, options);

  if (!context) {
    return {
      id,
      passed: false,
      details: ["context missing"],
      sectionTitles: [],
      estimatedSize: 0,
    };
  }

  const strategy = resolvePromptStrategy(context);
  const sections = buildPromptSections(context, strategy);
  const rendered = renderPromptSections(sections);
  const sectionTitles = sections.map((section) => section.title);

  const checks = [
    rendered.includes("[질문]") || rendered.includes("[질문]\n"),
    rendered.includes("[답변 목적]"),
    rendered.includes("[설명 규칙]"),
    !rendered.includes("relevantFacts"),
    !rendered.includes("relevantSignals"),
    validate(rendered, sectionTitles),
  ];

  return {
    id,
    passed: checks.every(Boolean),
    details: [
      `sectionTitles=${sectionTitles.join(",")}`,
      `estimatedSize=${rendered.length}`,
    ],
    sectionTitles,
    estimatedSize: rendered.length,
  };
}

export function verifyPromptSections(): PromptSectionVerificationResult {
  const cases: PromptSectionVerificationCase[] = [
    verifySections(
      "case-1-career-aptitude",
      "나에게 맞는 직업은 무엇인가요?",
      (_rendered, titles) =>
        titles.includes("역량")
        && titles.includes("적합 역할")
        && !titles.includes("초순"),
    ),
    verifySections(
      "case-2-october-money-flow",
      "10월 금전운이 있을까요?",
      (rendered, titles) =>
        titles.includes("초순")
        && titles.includes("중순")
        && titles.includes("말")
        && rendered.includes("기간 개요"),
      { includeLuckFlow: true },
    ),
    verifySections(
      "case-3-store-opening",
      "10월에 가게를 오픈하려고 하는데 어떨까요?",
      (_rendered, titles) =>
        titles.includes("핵심 답변")
        && titles.includes("조건")
        && titles.includes("위험")
        && titles.includes("시기"),
      { includeLuckFlow: true },
    ),
    verifySections(
      "case-5-september-2026-flow",
      "2026년 9월 운세",
      (rendered, titles) =>
        titles.includes("초순")
        && titles.includes("중순")
        && titles.includes("말")
        && !rendered.includes("{"),
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
    verifySections(
      "case-6-report-mode-sections",
      "10월 금전운이 있을까요?",
      (_rendered, titles) =>
        titles.includes("사주 상태")
        && titles.includes("시간 상태")
        && titles.includes("확정된 변화"),
      {
        includeLuckFlow: true,
        answerMode: "report",
      },
    ),
  ];

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializePromptSectionVerificationResult(
  result: PromptSectionVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
