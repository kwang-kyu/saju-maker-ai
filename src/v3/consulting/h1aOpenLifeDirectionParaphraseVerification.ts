/**
 * H1-a: open life-direction paraphrase contract.
 * Path-commitment evidence + bare directional choose → confirmDirection,
 * without weakening real binary / business / lifeFlow / H1-b contracts.
 */
import {
  readQuestion,
} from "./question/questionReader.js";
import type {
  DecisionTarget,
  QuestionAnalysisMode,
  QuestionIntentOrLegacy,
  QuestionTopic,
} from "./question/questionReader.js";
import {
  buildDecisionEngineRegressionInput,
} from "./decision/regression/decisionEngineRegressionFixture.js";
import {
  adaptQuestionMeaning,
} from "../vnext/adapters/questionMeaningAdapter.js";
import {
  routeScenario,
} from "../vnext/routing/scenarioRouter.js";

const HUMAN_CONTEXT =
  buildDecisionEngineRegressionInput().humanContext;

type ExpectedAxes = {
  topic: QuestionTopic;
  intent: QuestionIntentOrLegacy;
  analysisMode?: QuestionAnalysisMode;
  decisionTarget: DecisionTarget;
  domain?: string;
  openLifeDirectionRoute?: boolean;
  prioritySurface?: boolean;
};

type CaseRow = {
  id: string;
  question: string;
  expect: ExpectedAxes;
};

const H1A_POSITIVE: readonly CaseRow[] = [
  {
    id: "H1a-1",
    question: "앞으로 제 삶을 어느 쪽에 더 무게를 두는 게 좋을까요?",
    expect: {
      topic: "lifeDirection",
      intent: "selection",
      analysisMode: "selection",
      decisionTarget: "confirmDirection",
      domain: "life",
      openLifeDirectionRoute: true,
    },
  },
];

const OPEN_LIFE_DIRECTION_REGRESSION: readonly CaseRow[] = [
  {
    id: "open-1",
    question: "어떤 방향으로 가야 할까요?",
    expect: {
      topic: "lifeDirection",
      intent: "selection",
      analysisMode: "selection",
      decisionTarget: "confirmDirection",
      domain: "life",
      openLifeDirectionRoute: true,
    },
  },
  {
    id: "open-2",
    question: "제 삶을 어떻게 살아야 할까요?",
    expect: {
      topic: "lifeDirection",
      intent: "evaluation",
      analysisMode: "decision",
      decisionTarget: "confirmDirection",
      domain: "life",
      openLifeDirectionRoute: true,
    },
  },
  {
    id: "open-A",
    question: "앞으로 어떻게 살아야 할까요?",
    expect: {
      topic: "lifeDirection",
      intent: "evaluation",
      analysisMode: "decision",
      decisionTarget: "confirmDirection",
      domain: "life",
      openLifeDirectionRoute: true,
    },
  },
  {
    id: "open-C",
    question: "제 인생의 방향은 어떻게 잡아야 하나요?",
    expect: {
      topic: "lifeDirection",
      intent: "evaluation",
      analysisMode: "decision",
      decisionTarget: "confirmDirection",
      domain: "life",
      openLifeDirectionRoute: true,
    },
  },
  {
    id: "open-C2",
    question: "제 인생의 방향을 어떻게 잡아야 할까요?",
    expect: {
      topic: "lifeDirection",
      intent: "evaluation",
      analysisMode: "decision",
      decisionTarget: "confirmDirection",
      domain: "life",
      openLifeDirectionRoute: true,
    },
  },
  {
    id: "path-1",
    question: "인생의 중심을 어디에 두는 게 좋을까요?",
    expect: {
      topic: "lifeDirection",
      intent: "selection",
      analysisMode: "selection",
      decisionTarget: "confirmDirection",
      domain: "life",
      openLifeDirectionRoute: true,
    },
  },
  {
    id: "path-2",
    question: "삶의 방향을 어느 쪽으로 잡는 게 좋을까요?",
    expect: {
      topic: "lifeDirection",
      intent: "selection",
      analysisMode: "selection",
      decisionTarget: "confirmDirection",
      domain: "life",
      openLifeDirectionRoute: true,
    },
  },
  {
    id: "open-D",
    question: "무엇을 선택해야 할까요?",
    expect: {
      topic: "lifeDirection",
      intent: "selection",
      analysisMode: "selection",
      decisionTarget: "confirmDirection",
      domain: "life",
      openLifeDirectionRoute: true,
    },
  },
];

const BINARY_PROTECTION: readonly CaseRow[] = [
  {
    id: "bin-1",
    question: "직장생활을 계속할까요, 이직할까요?",
    expect: {
      topic: "job",
      intent: "evaluation",
      decisionTarget: "changeJob",
    },
  },
  {
    id: "bin-2",
    question: "안정과 도전 중 어느 쪽이 좋을까요?",
    expect: {
      topic: "general",
      intent: "selection",
      analysisMode: "selection",
      decisionTarget: "choose",
    },
  },
  {
    id: "bin-3",
    question: "사업을 어느 쪽으로 확장하는 게 좋을까요?",
    expect: {
      topic: "business",
      intent: "selection",
      analysisMode: "selection",
      decisionTarget: "choose",
      domain: "business",
    },
  },
  {
    id: "bin-4",
    question: "사업을 어느 쪽으로 시작하는 게 좋을까요?",
    expect: {
      topic: "business",
      intent: "selection",
      analysisMode: "selection",
      decisionTarget: "choose",
      domain: "business",
    },
  },
];

const LIFEFLOW_PROTECTION: readonly CaseRow[] = [
  {
    id: "flow-1",
    question: "앞으로 어떻게 될까요?",
    expect: {
      topic: "lifeFlow",
      intent: "prediction",
      decisionTarget: "none",
      domain: "life",
    },
  },
  {
    id: "flow-2",
    question: "앞으로 제 인생이 어떻게 전개될까요?",
    expect: {
      topic: "lifeFlow",
      intent: "prediction",
      analysisMode: "interpretation",
      decisionTarget: "none",
      domain: "life",
    },
  },
];

const H1B_PROTECTION: readonly CaseRow[] = [
  {
    id: "H1b-1",
    question: "지금 제 인생에서 중심을 어디에 두는 선택이 맞을까요?",
    expect: {
      topic: "lifeDirection",
      intent: "selection",
      analysisMode: "selection",
      decisionTarget: "confirmDirection",
      domain: "life",
      openLifeDirectionRoute: true,
    },
  },
];

const GENERAL_PROTECTION: readonly CaseRow[] = [
  {
    id: "gen-1",
    question: "요즘 뭘 해야 할지 잘 모르겠습니다.",
    expect: {
      topic: "general",
      intent: "evaluation",
      decisionTarget: "none",
      domain: "general",
    },
  },
  {
    id: "gen-E",
    question: "앞으로 무엇을 해야 할까요?",
    expect: {
      topic: "general",
      intent: "evaluation",
      decisionTarget: "none",
      domain: "general",
      openLifeDirectionRoute: false,
    },
  },
  {
    id: "gen-E4",
    question: "지금 무엇을 해야 할까요?",
    expect: {
      topic: "general",
      intent: "evaluation",
      decisionTarget: "none",
      domain: "general",
      openLifeDirectionRoute: false,
    },
  },
  {
    id: "gen-bare-next-action",
    question: "무엇을 해야 할까요?",
    expect: {
      topic: "general",
      intent: "evaluation",
      decisionTarget: "none",
      domain: "general",
      openLifeDirectionRoute: false,
    },
  },
  {
    id: "gen-F-priority",
    question: "가장 먼저 무엇을 해야 하나요?",
    expect: {
      topic: "general",
      intent: "evaluation",
      decisionTarget: "none",
      domain: "general",
      openLifeDirectionRoute: false,
      prioritySurface: true,
    },
  },
];

function isOpenLifeDirectionRoute(
  askedObject: string,
  intent: string,
  analysisMode: string,
  actionNature: string,
): boolean {
  // Mirrors scenarioRouter isOpenLifeDirectionConfirmSelection.
  return (
    askedObject === "lifeDirection"
    && actionNature === "confirmDirection"
    && intent !== "prediction"
    && intent !== "timing"
    && (
      analysisMode === "selection"
      || analysisMode === "decision"
    )
  );
}

function checkCase(
  row: CaseRow,
): {
  id: string;
  question: string;
  ok: boolean;
  actual: {
    topic: string;
    intent: string;
    analysisMode: string;
    decisionTarget: string;
    domain: string;
    openLifeDirectionRoute: boolean;
    prioritySurface: boolean;
    scenarioType: string;
  };
  expect: ExpectedAxes;
} {
  const result = readQuestion(HUMAN_CONTEXT, row.question);
  const meaning = adaptQuestionMeaning(result);
  const scenario = routeScenario(meaning);
  const openLifeDirectionRoute = isOpenLifeDirectionRoute(
    meaning.askedObject,
    meaning.intent,
    meaning.analysisMode,
    meaning.actionNature,
  );

  const topicOk = result.topic === row.expect.topic;
  const intentOk = result.intent === row.expect.intent;
  const analysisModeOk = row.expect.analysisMode
    ? result.analysisMode === row.expect.analysisMode
    : true;
  const dtOk = result.decisionTarget === row.expect.decisionTarget;
  const domainOk = row.expect.domain
    ? meaning.domain === row.expect.domain
    : true;
  const routeOk = row.expect.openLifeDirectionRoute === undefined
    ? true
    : openLifeDirectionRoute === row.expect.openLifeDirectionRoute;
  const prioritySurfaceOk = row.expect.prioritySurface === undefined
    ? true
    : result.prioritySurface === row.expect.prioritySurface;
  // business "어느 쪽" must not become lifeDirection
  const noLifeDirectionBleed =
    row.expect.topic === "business"
      ? result.topic !== "lifeDirection"
      : true;

  return {
    id: row.id,
    question: row.question,
    ok:
      topicOk
      && intentOk
      && analysisModeOk
      && dtOk
      && domainOk
      && routeOk
      && prioritySurfaceOk
      && noLifeDirectionBleed,
    actual: {
      topic: result.topic,
      intent: result.intent,
      analysisMode: result.analysisMode,
      decisionTarget: result.decisionTarget,
      domain: meaning.domain,
      openLifeDirectionRoute,
      prioritySurface: result.prioritySurface === true,
      scenarioType: scenario.type,
    },
    expect: row.expect,
  };
}

export type H1aOpenLifeDirectionParaphraseVerificationResult = {
  passed: boolean;
  positivePass: number;
  positiveFail: number;
  regressionPass: number;
  regressionFail: number;
  protectionPass: number;
  protectionFail: number;
  fails: readonly ReturnType<typeof checkCase>[];
};

export function verifyH1aOpenLifeDirectionParaphrase():
  H1aOpenLifeDirectionParaphraseVerificationResult
{
  const positive = H1A_POSITIVE.map(checkCase);
  const regression = OPEN_LIFE_DIRECTION_REGRESSION.map(checkCase);
  const protection = [
    ...BINARY_PROTECTION,
    ...LIFEFLOW_PROTECTION,
    ...H1B_PROTECTION,
    ...GENERAL_PROTECTION,
  ].map(checkCase);

  const fails = [...positive, ...regression, ...protection].filter(
    (row) => !row.ok,
  );

  return {
    passed: fails.length === 0,
    positivePass: positive.filter((row) => row.ok).length,
    positiveFail: positive.filter((row) => !row.ok).length,
    regressionPass: regression.filter((row) => row.ok).length,
    regressionFail: regression.filter((row) => !row.ok).length,
    protectionPass: protection.filter((row) => row.ok).length,
    protectionFail: protection.filter((row) => !row.ok).length,
    fails,
  };
}
