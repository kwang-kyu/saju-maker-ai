/**
 * H3+H6 blind-holdout action lexical contract regression.
 * H3-a: employment-form noun gate → changeJob
 * H3-b: education-entry compound → start (not confirmDirection)
 * H6: business expand/grow compound → continue (no expansion DT)
 */
import {
  readQuestion,
} from "./question/questionReader.js";
import type {
  DecisionTarget,
  QuestionMotive,
  QuestionTopic,
} from "./question/questionReader.js";
import {
  buildDecisionEngineRegressionInput,
} from "./decision/regression/decisionEngineRegressionFixture.js";

const HUMAN_CONTEXT =
  buildDecisionEngineRegressionInput().humanContext;

type ExpectedAxes = {
  topic?: QuestionTopic;
  decisionTarget: DecisionTarget;
  motive?: QuestionMotive;
};

type CaseRow = {
  id: string;
  question: string;
  expect: ExpectedAxes;
};

const H3A_POSITIVE: readonly CaseRow[] = [
  {
    id: "H3a-1",
    question: "지금 프리랜서로 전환해도 괜찮을까요?",
    expect: { topic: "job", decisionTarget: "changeJob" },
  },
  {
    id: "H3a-2",
    question: "계약직으로 전환해도 괜찮을까요?",
    expect: { topic: "job", decisionTarget: "changeJob" },
  },
  {
    id: "H3a-3",
    question: "정규직에서 프리랜서로 전환해도 괜찮을까요?",
    expect: { topic: "job", decisionTarget: "changeJob" },
  },
  {
    id: "H3a-4",
    question: "직업을 전환해도 괜찮을까요?",
    expect: { topic: "job", decisionTarget: "changeJob" },
  },
  {
    id: "H3a-5",
    question: "직종을 바꿔도 괜찮을까요?",
    expect: { topic: "job", decisionTarget: "changeJob" },
  },
  {
    id: "H3a-6",
    question: "회사를 옮겨도 괜찮을까요?",
    expect: { topic: "job", decisionTarget: "changeJob" },
  },
];

const H3A_NEGATIVE: readonly CaseRow[] = [
  {
    id: "H3a-7",
    question: "그냥 바꿔도 괜찮을까요?",
    expect: { decisionTarget: "none" },
  },
  {
    id: "H3a-8",
    question: "그냥 전환해도 괜찮을까요?",
    expect: { decisionTarget: "none" },
  },
  {
    id: "H3a-9",
    question: "인생 방향을 바꿔도 괜찮을까요?",
    expect: {
      topic: "lifeDirection",
      decisionTarget: "confirmDirection",
    },
  },
];

const H3B_POSITIVE: readonly CaseRow[] = [
  {
    id: "H3b-10",
    question: "대학원에 진학해도 괜찮을까요?",
    expect: { decisionTarget: "start" },
  },
  {
    id: "H3b-11",
    question: "대학원에 진학하는 선택을 해도 괜찮을까요?",
    expect: { decisionTarget: "start" },
  },
  {
    id: "H3b-12",
    question: "학교에 입학해도 괜찮을까요?",
    expect: { decisionTarget: "start" },
  },
];

const H3B_NEGATIVE: readonly CaseRow[] = [
  {
    id: "H3b-13",
    question: "공부를 계속해도 괜찮을까요?",
    expect: { decisionTarget: "continue" },
  },
  {
    id: "H3b-14",
    question: "학업을 계속해도 괜찮을까요?",
    expect: { decisionTarget: "continue" },
  },
];

const H6_POSITIVE: readonly CaseRow[] = [
  {
    id: "H6-15",
    question: "사업을 키워도 괜찮을까요?",
    expect: { topic: "business", decisionTarget: "continue" },
  },
  {
    id: "H6-16",
    question: "사업을 확장해도 괜찮을까요?",
    expect: { topic: "business", decisionTarget: "continue" },
  },
  {
    id: "H6-17",
    question: "사업을 늘려도 괜찮을까요?",
    expect: { topic: "business", decisionTarget: "continue" },
  },
  {
    id: "H6-18",
    question: "사업을 키워가도 괜찮을까요?",
    expect: { topic: "business", decisionTarget: "continue" },
  },
  {
    id: "H6-19",
    question: "사업을 운영해도 괜찮을까요?",
    expect: { topic: "business", decisionTarget: "continue" },
  },
];

const H6_NEGATIVE: readonly CaseRow[] = [
  {
    id: "H6-20",
    question: "그냥 키워도 괜찮을까요?",
    expect: { decisionTarget: "none" },
  },
  {
    id: "H6-21",
    question: "그냥 확장해도 괜찮을까요?",
    expect: { decisionTarget: "none" },
  },
  {
    id: "H6-22",
    question: "관계를 키워도 괜찮을까요?",
    expect: { decisionTarget: "none" },
  },
  {
    id: "H6-23",
    question: "공부를 키워도 괜찮을까요?",
    expect: { decisionTarget: "none" },
  },
];

const LEGACY_REGRESSION: readonly CaseRow[] = [
  {
    id: "legacy-start",
    question: "시작해도 괜찮을까요?",
    expect: { decisionTarget: "start" },
  },
  {
    id: "legacy-invest",
    question: "투자해도 괜찮을까요?",
    expect: { topic: "money", decisionTarget: "invest" },
  },
  {
    id: "legacy-continue",
    question: "계속해야 할까요?",
    expect: { decisionTarget: "continue" },
  },
  {
    id: "legacy-bare-change",
    question: "바꿔도 괜찮을까요?",
    expect: { decisionTarget: "none" },
  },
  {
    id: "legacy-bare-move",
    question: "옮겨도 괜찮을까요?",
    expect: { decisionTarget: "none" },
  },
  {
    id: "legacy-bare-switch",
    question: "전환해도 괜찮을까요?",
    expect: { decisionTarget: "none" },
  },
  {
    id: "legacy-biz-operate",
    question: "사업을 운영해도 괜찮을까요?",
    expect: { topic: "business", decisionTarget: "continue" },
  },
  {
    id: "legacy-life-direction",
    question: "인생 방향을 바꿔도 괜찮을까요?",
    expect: {
      topic: "lifeDirection",
      decisionTarget: "confirmDirection",
    },
  },
];

function checkCase(
  row: CaseRow,
): {
  id: string;
  question: string;
  ok: boolean;
  actual: {
    topic: string;
    intent: string;
    decisionTarget: string;
    motive: string;
  };
  expect: ExpectedAxes;
} {
  const result = readQuestion(HUMAN_CONTEXT, row.question);
  const topicOk = row.expect.topic
    ? result.topic === row.expect.topic
    : true;
  const dtOk = result.decisionTarget === row.expect.decisionTarget;
  const motiveOk = row.expect.motive
    ? result.motive === row.expect.motive
    : true;
  // H3-b: confirmDirection diversion must not win over education-entry start.
  const noConfirmDiversion =
    row.expect.decisionTarget === "start"
      ? result.decisionTarget !== "confirmDirection"
      : true;

  return {
    id: row.id,
    question: row.question,
    ok: topicOk && dtOk && motiveOk && noConfirmDiversion,
    actual: {
      topic: result.topic,
      intent: result.intent,
      decisionTarget: result.decisionTarget,
      motive: result.motive,
    },
    expect: row.expect,
  };
}

export type H3H6ContractVerificationResult = {
  passed: boolean;
  positivePass: number;
  positiveFail: number;
  negativePass: number;
  negativeFail: number;
  legacyPass: number;
  legacyFail: number;
  fails: readonly ReturnType<typeof checkCase>[];
};

export function verifyH3H6ActionLexicalContract(): H3H6ContractVerificationResult {
  const positive = [
    ...H3A_POSITIVE,
    ...H3B_POSITIVE,
    ...H6_POSITIVE,
  ].map(checkCase);
  const negative = [
    ...H3A_NEGATIVE,
    ...H3B_NEGATIVE,
    ...H6_NEGATIVE,
  ].map(checkCase);
  const legacy = LEGACY_REGRESSION.map(checkCase);

  const fails = [...positive, ...negative, ...legacy].filter((row) => !row.ok);

  return {
    passed: fails.length === 0,
    positivePass: positive.filter((row) => row.ok).length,
    positiveFail: positive.filter((row) => !row.ok).length,
    negativePass: negative.filter((row) => row.ok).length,
    negativeFail: negative.filter((row) => !row.ok).length,
    legacyPass: legacy.filter((row) => row.ok).length,
    legacyFail: legacy.filter((row) => !row.ok).length,
    fails,
  };
}
