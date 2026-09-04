import {
  buildClarificationResponse,
  buildConsultingFallback,
  buildDirectResponse,
} from "../gpt/responseFallbackBuilder.js";
import {
  buildVNextConsultingRequestFromBirthProfile,
} from "../entry/vNextBirthInputAdapter.js";
import {
  analyzeVNextConsultingRequest,
} from "../ui/vNextConsultingPipeline.js";
import {
  runResponsePipeline,
} from "../response/responseActionResolver.js";
import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";
import {
  runPromptPipelineCase,
} from "./promptVerificationFixture.js";
import type {
  ResponseAction,
  ResponseContext,
} from "../response/responseContext.js";

export type ResponseFallbackVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type ResponseFallbackVerificationResult = {
  passed: boolean;
  cases: ResponseFallbackVerificationCase[];
};

function assertNoNewJudgment(text: string): boolean {
  const forbidden = [
    "반드시 성공",
    "100% 확실",
    "새로운 사주 계산",
    "일간 辛",
  ];

  return !forbidden.some((item) => text.includes(item));
}

const INTERNAL_ENUM_LEAK_PATTERNS = [
  "possibility:",
  "direction:",
  "confidence:",
  "changeIntensity:",
  "conditionallyFavorable",
  "proceed",
] as const;

function assertNoBareReaderLabel(text: string): boolean {
  if (/(?:^|\s)(?:안정형|독립형|성취형|돌파형)\s+(?:안정형|독립형|성취형|돌파형)/.test(text)) {
    return false;
  }

  if (/(?:^|\s)(?:안정형|독립형|성취형|돌파형)(?:$|[.!?](?:\s|$))/.test(text)) {
    return false;
  }

  return true;
}

const ACTION_DECISION_FORBIDDEN_PATTERNS = [
  "묻고 있다",
  "숨은 동기",
  "질문에서 실제로 결정하려는 것은",
  "현재 인생 국면은",
  "강하게 맞는다",
  "서로 강하게 맞는다",
  "일간",
  "월령",
  "생조",
  "오행",
  "토 기운",
  "목 기운",
  "화 기운",
  "금 기운",
  "수 기운",
  "안정형",
  "독립형",
] as const;

const BIRTH_PROFILE_ACTION_DECISION_FORBIDDEN_REGEX = [
  /(?:목|화|토|금|수)\s*기운/,
] as const;

const BIRTH_PROFILE_FALLBACK_FIXTURE: VNextBirthProfile = {
  displayName: "천운",
  gender: "female",
  year: 1990,
  month: 5,
  day: 10,
  birthTimeBranch: "yu",
  calendarType: "solar",
};

function assertNoActionDecisionInternalLeak(text: string): boolean {
  if (ACTION_DECISION_FORBIDDEN_PATTERNS.some((item) =>
    text.includes(item),
  )) {
    return false;
  }

  return !BIRTH_PROFILE_ACTION_DECISION_FORBIDDEN_REGEX.some((pattern) =>
    pattern.test(text),
  );
}

function buildBirthProfileActionDecisionFallback(
  question: string,
): string | null {
  const request = buildVNextConsultingRequestFromBirthProfile(
    BIRTH_PROFILE_FALLBACK_FIXTURE,
    question,
    "2026-09-01",
  );
  const analysis = analyzeVNextConsultingRequest(request);
  const pipeline = runResponsePipeline({
    analysisResult: analysis.analysisResult,
    originalQuestion: question,
    answerMode: "question",
  });

  if (!pipeline.context) {
    return null;
  }

  return buildConsultingFallback(pipeline.context);
}

function assertNoRepeatedPhaseDescription(text: string): boolean {
  const matches = text.match(/확장(?:기| 국면)|성장 국면/g) ?? [];

  return matches.length <= 1;
}

function assertBlockOrder(
  text: string,
  markers: readonly string[],
): boolean {
  let lastIndex = -1;

  for (const marker of markers) {
    if (!marker) {
      continue;
    }

    const index = text.indexOf(marker);

    if (index === -1) {
      continue;
    }

    if (index < lastIndex) {
      return false;
    }

    lastIndex = index;
  }

  return true;
}

function assertNoInternalEnumLeak(text: string): boolean {
  return !INTERNAL_ENUM_LEAK_PATTERNS.some((item) => text.includes(item));
}

function containsKorean(text: string): boolean {
  return /[\uAC00-\uD7A3]/.test(text);
}

function assertNoAwkwardPhaseLabelPrefix(text: string): boolean {
  const awkwardPatterns = [
    /(?:^|[.!?]\s*)확장기\s+/,
    /(?:^|[.!?]\s*)준비기\s+/,
    /(?:^|[.!?]\s*)전환기\s+/,
    /(?:^|[.!?]\s*)수확기\s+/,
    /(?:^|[.!?]\s*)안정기\s+/,
    /(?:^|[.!?]\s*)도전기\s+/,
    /(?:^|[.!?]\s*)회복기\s+/,
    /(?:^|[.!?]\s*)재정비기\s+/,
    /(?:^|[.!?]\s*)(?:성장|확장|정체|전환|회복|준비)\s*국면\s+(?!현재)/,
  ] as const;

  return !awkwardPatterns.some((pattern) => pattern.test(text));
}

function buildPhaseLabelNormalizationFixture(): ResponseContext {
  return {
    originalQuestion: "사업을 시작하려고 하는데 어떨까요",
    answerMode: "question",
    scenario: "actionDecision",
    blueprint: {
      mode: "question",
      blocks: ["directAnswer"],
    },
    blocks: [{
      id: "directAnswer",
      relevantFacts: [],
      relevantSignals: [],
      relevantEvidence: [{
        key: "currentPhase",
        description:
          "확장기 기존의 기반을 넓히고 활동 범위와 영향력을 키워야 하는 국면입니다.",
        sourceKey: "lifePhase",
      }],
      emphasis: [],
    }],
  };
}

function buildInternalEnumLeakFixture(): ResponseContext {
  return {
    originalQuestion: "이 일을 진행해도 될까요?",
    answerMode: "question",
    scenario: "actionDecision",
    blueprint: {
      mode: "question",
      blocks: ["directAnswer", "risk"],
    },
    blocks: [{
      id: "directAnswer",
      relevantFacts: [{
        possibility: "conditionallyFavorable",
        direction: "proceed",
        confidence: "high",
        changeIntensity: "moderate",
      }],
      relevantSignals: [],
      relevantEvidence: [],
      emphasis: ["opportunity", "pressure", "risk"],
    }, {
      id: "risk",
      relevantFacts: [{
        key: "financial-burden",
        description: "재정적 부담이 증가할 수 있는 흐름이 확인됩니다.",
        severity: "moderate",
      }],
      relevantSignals: [{
        type: "risk",
        direction: "increase",
        strength: "moderate",
        timeSegment: {
          start: "2026-01",
          end: "2026-03",
          label: "Q1",
          granularity: "month",
        },
        summary: "재정적 부담이 증가할 수 있는 흐름이 확인됩니다.",
        evidence: { items: [] },
        source: {
          type: "saju",
          engineKey: "test",
        },
      }],
      relevantEvidence: [{
        key: "combined-1",
        description: "조건을 충족하면 추진 가능성이 열려 있습니다.",
        sourceKey: "assessment",
      }],
      emphasis: ["risk"],
    }],
  };
}

export function verifyResponseFallback(): ResponseFallbackVerificationResult {
  const cases: ResponseFallbackVerificationCase[] = [];

  const moneyFlow = runPromptPipelineCase(
    "10월 금전운이 있을까요?",
    { includeLuckFlow: true },
  );

  if (moneyFlow.context) {
    const fallback = buildConsultingFallback(moneyFlow.context);
    cases.push({
      id: "case-1-october-money-fallback",
      passed: fallback.includes("10월")
        && fallback.includes("시기별")
        && assertNoNewJudgment(fallback),
      details: [
        `length=${fallback.length}`,
        `containsPeriod=${fallback.includes("10월")}`,
      ],
    });
  } else {
    cases.push({
      id: "case-1-october-money-fallback",
      passed: false,
      details: ["context unavailable"],
    });
  }

  const clarificationPipeline = runPromptPipelineCase(
    "상대방과 궁합은 어떤가요?",
  );
  const clarificationAction: ResponseAction = clarificationPipeline.action;
  const clarificationText = buildClarificationResponse(clarificationAction);

  cases.push({
    id: "case-2-clarification-response",
    passed: clarificationAction.type === "clarification"
      && clarificationText.includes("필요")
      && assertNoNewJudgment(clarificationText),
    details: [
      `action=${clarificationAction.type}`,
      `length=${clarificationText.length}`,
    ],
  });

  const directAction: ResponseAction = {
    type: "direct",
    reason: "assessment is insufficient and blueprint is unavailable",
    context: null,
  };
  const directText = buildDirectResponse(directAction);

  cases.push({
    id: "case-3-direct-response",
    passed: directText.length > 0 && assertNoNewJudgment(directText),
    details: [`length=${directText.length}`],
  });

  const career = runPromptPipelineCase("나에게 맞는 직업은 무엇인가요?");

  if (career.context) {
    const careerFallback = buildConsultingFallback(career.context);
    cases.push({
      id: "case-4-career-fallback",
      passed: careerFallback.length > 0 && assertNoNewJudgment(careerFallback),
      details: [`length=${careerFallback.length}`],
    });
  } else {
    cases.push({
      id: "case-4-career-fallback",
      passed: false,
      details: ["context unavailable"],
    });
  }

  const internalLeakFixture = buildInternalEnumLeakFixture();
  const internalLeakFallback = buildConsultingFallback(internalLeakFixture);

  cases.push({
    id: "case-5-no-internal-enum-leak",
    passed: assertNoInternalEnumLeak(internalLeakFallback)
      && !internalLeakFallback.includes("opportunity")
      && !internalLeakFallback.includes("pressure")
      && internalLeakFallback.includes("재정적 부담")
      && internalLeakFallback.includes("조건을 충족하면")
      && assertNoNewJudgment(internalLeakFallback),
    details: [
      `length=${internalLeakFallback.length}`,
      `sample=${internalLeakFallback.slice(0, 120)}`,
    ],
  });

  const storeOpening = runPromptPipelineCase(
    "10월에 가게를 오픈하려고 하는데 어떨까요?",
    { includeLuckFlow: true },
  );

  if (storeOpening.context) {
    const actionDecisionFallback = buildConsultingFallback(
      storeOpening.context,
    );

    cases.push({
      id: "case-6-action-decision-store-opening-fallback",
      passed: storeOpening.context.scenario === "actionDecision"
        && assertNoInternalEnumLeak(actionDecisionFallback)
        && assertNoBareReaderLabel(actionDecisionFallback)
        && assertNoActionDecisionInternalLeak(actionDecisionFallback)
        && !actionDecisionFallback.includes("insufficient")
        && !actionDecisionFallback.includes("unknown")
        && !actionDecisionFallback.includes("timing assessment available")
        && !actionDecisionFallback.includes("opportunity increase")
        && containsKorean(actionDecisionFallback)
        && assertBlockOrder(actionDecisionFallback, [
          "현재는 새로운 기회를 실행으로 연결",
          "실제로 결정하려는 행동",
          "초기 성과가 좋을 때",
          "책임 감당력, 금전 감당력",
        ])
        && assertNoNewJudgment(actionDecisionFallback),
      details: [
        `length=${actionDecisionFallback.length}`,
        `sample=${actionDecisionFallback.slice(0, 160)}`,
      ],
    });
  } else {
    cases.push({
      id: "case-6-action-decision-store-opening-fallback",
      passed: false,
      details: ["context unavailable"],
    });
  }

  const businessStart = runPromptPipelineCase(
    "사업을 시작하려고 하는데 어떨까요",
  );

  if (businessStart.context) {
    const businessStartFallback = buildConsultingFallback(
      businessStart.context,
    );

    cases.push({
      id: "case-7-action-decision-business-start-user-facing-filter",
      passed: businessStart.context.scenario === "actionDecision"
        && assertNoActionDecisionInternalLeak(businessStartFallback)
        && assertNoBareReaderLabel(businessStartFallback)
        && assertNoRepeatedPhaseDescription(businessStartFallback)
        && !businessStartFallback.includes("성취형")
        && !businessStartFallback.includes("돌파형")
        && businessStartFallback.includes("작게 시작")
        && businessStartFallback.includes("초기 성과")
        && assertBlockOrder(businessStartFallback, [
          "현재는 새로운 기회를 실행으로 연결",
          "작게 시작",
          "초기 성과",
        ])
        && assertNoNewJudgment(businessStartFallback),
      details: [
        `length=${businessStartFallback.length}`,
        `sample=${businessStartFallback.slice(0, 160)}`,
      ],
    });
  } else {
    cases.push({
      id: "case-7-action-decision-business-start-user-facing-filter",
      passed: false,
      details: ["context unavailable"],
    });
  }

  const birthProfileFallback = buildBirthProfileActionDecisionFallback(
    "사업을 시작하려고 하는데 어떨까요",
  );

  if (birthProfileFallback) {
    cases.push({
      id: "case-8-action-decision-birth-profile-fallback",
      passed: assertNoActionDecisionInternalLeak(birthProfileFallback)
        && assertNoBareReaderLabel(birthProfileFallback)
        && assertNoInternalEnumLeak(birthProfileFallback)
        && containsKorean(birthProfileFallback)
        && birthProfileFallback.includes("넓히고")
        && birthProfileFallback.includes("영향력")
        && assertNoNewJudgment(birthProfileFallback),
      details: [
        `length=${birthProfileFallback.length}`,
        `sample=${birthProfileFallback.slice(0, 160)}`,
      ],
    });
  } else {
    cases.push({
      id: "case-8-action-decision-birth-profile-fallback",
      passed: false,
      details: ["context unavailable"],
    });
  }

  const phaseLabelFixture = buildPhaseLabelNormalizationFixture();
  const phaseLabelFallback = buildConsultingFallback(phaseLabelFixture);

  cases.push({
    id: "case-9-action-decision-phase-label-normalization",
    passed: assertNoAwkwardPhaseLabelPrefix(phaseLabelFallback)
      && assertNoActionDecisionInternalLeak(phaseLabelFallback)
      && phaseLabelFallback.includes("현재는")
      && phaseLabelFallback.includes("기존의 기반")
      && phaseLabelFallback.includes("넓히고")
      && phaseLabelFallback.includes("영향력")
      && !phaseLabelFallback.includes("확장기")
      && assertNoNewJudgment(phaseLabelFallback),
    details: [
      `length=${phaseLabelFallback.length}`,
      `sample=${phaseLabelFallback.slice(0, 160)}`,
    ],
  });

  if (birthProfileFallback) {
    cases.push({
      id: "case-10-action-decision-birth-profile-phase-label-normalization",
      passed: assertNoAwkwardPhaseLabelPrefix(birthProfileFallback)
        && birthProfileFallback.includes("현재는")
        && (birthProfileFallback.includes("기존의 기반")
          || birthProfileFallback.includes("넓히고"))
        && assertNoActionDecisionInternalLeak(birthProfileFallback)
        && assertNoNewJudgment(birthProfileFallback),
      details: [
        `length=${birthProfileFallback.length}`,
        `sample=${birthProfileFallback.slice(0, 160)}`,
      ],
    });
  } else {
    cases.push({
      id: "case-10-action-decision-birth-profile-phase-label-normalization",
      passed: false,
      details: ["context unavailable"],
    });
  }

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeResponseFallbackVerificationResult(
  result: ResponseFallbackVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
