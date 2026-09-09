/**
 * Semantic Axis Reuse Verification.
 *
 * 질문 원문 문자열이 아니라 구조화된 semantic axis를 기준으로
 * conversation reuse 허용/차단 invariant를 검증한다.
 * private identity 함수를 직접 호출하지 않으며, 실제 pipeline 결과만 관찰한다.
 */

import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  readQuestion,
} from "../../consulting/question/questionReader.js";
import {
  buildHumanDestinyContextPipeline,
} from "../../builders/humanDestinyContextPipelineBuilder.js";
import {
  adaptQuestionMeaning,
} from "../adapters/questionMeaningAdapter.js";
import {
  routeScenario,
} from "../routing/scenarioRouter.js";
import {
  runVNextConversationPipeline,
  type ConversationReusedFlags,
  type VNextConversationPipelineResult,
} from "../conversation/conversationPipeline.js";
import type {
  ConversationSession,
} from "../conversation/conversationSession.js";
import {
  createMockResponseGateway,
} from "../gpt/responseGateway.js";

export type SemanticAxisInvariant =
  | "A_SAME_AXIS"
  | "B_TIME_DIFFERENCE"
  | "C_COUNTERPART_DIFFERENCE"
  | "D_MEANING_DIFFERENCE"
  | "E_SCENARIO_DIFFERENCE"
  | "F_SURFACE_STRING_INDEPENDENCE"
  | "G_CONDITION_ADDITION"

export type SemanticAxisCaseStatus =
  | "PASS"
  | "FAIL"
  | "NOT_COVERED";

export type SemanticAxisSnapshot = {
  meaning: {
    domain: string | null;
    intent: string | null;
    objectLabel: string | null;
  };
  time: {
    timeGranularity: string | null;
    timePeriodKey: string | null;
  };
  scenario: {
    scenarioType: string | null;
  };
  counterpart: {
    birthDate: string | null;
    calendarType: string | null;
    gender: string | null;
    birthTime: string | null;
  };
};

export type SemanticAxisDiffEntry = {
  axis: string;
  previous: string | null;
  current: string | null;
};

export type SemanticAxisSourceTurnIds = {
  assessment: string | null;
  timeState: string | null;
  questionMeaning: string | null;
  humanState: string | null;
};

export type SemanticAxisReuseVerificationCase = {
  id: string;
  invariant: SemanticAxisInvariant;
  status: SemanticAxisCaseStatus;
  passed: boolean;
  previousAxis: SemanticAxisSnapshot | null;
  currentAxis: SemanticAxisSnapshot | null;
  axisDiff: SemanticAxisDiffEntry[];
  reused: ConversationReusedFlags | null;
  executedStages: string[];
  previousSourceTurnIds: SemanticAxisSourceTurnIds | null;
  currentSourceTurnIds: SemanticAxisSourceTurnIds | null;
  followUpType: string | null;
  details: string[];
  notCoveredReason?: string;
};

export type SemanticAxisReuseVerificationResult = {
  passed: boolean;
  cases: SemanticAxisReuseVerificationCase[];
};

function buildVerificationRequest(
  question: string,
): V3ConsultingRequest {
  return {
    sajuInput: {
      name: "김천운",
      birthDate: "1984-03-15",
      birthTime: "14:30",
      gender: "male",
      calendarType: "solar",
      referenceDate: "2026-10-01",
      luckStartMethod: "minuteBased",
    },
    humanLifeContextInput: {
      maritalStatus: "married",
      hasChildren: true,
      occupationStatus: "employed",
      hasActiveBusiness: false,
      financialResponsibility: "high",
    },
    question,
  };
}

function buildVerificationHumanContext() {
  return buildHumanDestinyContextPipeline({
    name: "김천운",
    birthDate: "1984-03-15",
    birthTime: "14:30",
    gender: "male",
    calendarType: "solar",
    referenceDate: "2026-10-01",
    luckStartMethod: "minuteBased",
  }).humanContext;
}

/**
 * Reader + Adapter + ScenarioRouter 결과에서 semantic axis를 관찰한다.
 * (private pipeline identity 함수는 사용하지 않는다.)
 */
function observeAxesFromReaderAdapter(
  question: string,
): SemanticAxisSnapshot {
  const humanContext = buildVerificationHumanContext();
  const readerResult = readQuestion(humanContext, question);
  const meaning = adaptQuestionMeaning(readerResult);
  const scenario = routeScenario(meaning);
  const counterpart = readerResult.counterpartFacts;

  return {
    meaning: {
      domain: meaning.domain,
      intent: meaning.intent,
      objectLabel: meaning.object?.label ?? null,
    },
    time: {
      timeGranularity: null,
      timePeriodKey: null,
    },
    scenario: {
      scenarioType: scenario.type,
    },
    counterpart: {
      birthDate: counterpart.birthDate,
      calendarType: counterpart.calendarType,
      gender: counterpart.gender,
      birthTime: counterpart.birthTime,
    },
  };
}

/**
 * Pipeline session 캐시/메타데이터에서 semantic axis를 관찰한다.
 */
function observeAxesFromSession(
  session: ConversationSession,
): SemanticAxisSnapshot {
  const meaning = session.analysisCache.questionMeaning?.value;
  const timeEntry = session.analysisCache.timeState;
  const scenario = session.analysisCache.scenario?.value;
  const counterpart = session.contextMetadata.counterpartFacts;

  return {
    meaning: {
      domain: meaning?.domain ?? null,
      intent: meaning?.intent ?? null,
      objectLabel: meaning?.object?.label ?? null,
    },
    time: {
      timeGranularity:
        timeEntry?.reuseMetadata.timeGranularity
        ?? timeEntry?.value.targetPeriod.granularity
        ?? null,
      timePeriodKey:
        timeEntry?.reuseMetadata.timePeriodKey
        ?? timeEntry?.value.targetPeriod.label
        ?? timeEntry?.value.targetPeriod.start
        ?? null,
    },
    scenario: {
      scenarioType:
        scenario?.type
        ?? session.contextMetadata.activeScenarioType
        ?? null,
    },
    counterpart: {
      birthDate: counterpart?.birthDate ?? null,
      calendarType: counterpart?.calendarType ?? null,
      gender: counterpart?.gender ?? null,
      birthTime: counterpart?.birthTime ?? null,
    },
  };
}

function observeSourceTurnIds(
  session: ConversationSession,
): SemanticAxisSourceTurnIds {
  return {
    assessment: session.analysisCache.assessment?.sourceTurnId ?? null,
    timeState: session.analysisCache.timeState?.sourceTurnId ?? null,
    questionMeaning:
      session.analysisCache.questionMeaning?.sourceTurnId ?? null,
    humanState: session.analysisCache.humanState?.sourceTurnId ?? null,
  };
}

function diffAxes(
  previous: SemanticAxisSnapshot,
  current: SemanticAxisSnapshot,
): SemanticAxisDiffEntry[] {
  const pairs: Array<{
    axis: string;
    previous: string | null;
    current: string | null;
  }> = [
    {
      axis: "meaning.domain",
      previous: previous.meaning.domain,
      current: current.meaning.domain,
    },
    {
      axis: "meaning.intent",
      previous: previous.meaning.intent,
      current: current.meaning.intent,
    },
    {
      axis: "meaning.object.label",
      previous: previous.meaning.objectLabel,
      current: current.meaning.objectLabel,
    },
    {
      axis: "time.timeGranularity",
      previous: previous.time.timeGranularity,
      current: current.time.timeGranularity,
    },
    {
      axis: "time.timePeriodKey",
      previous: previous.time.timePeriodKey,
      current: current.time.timePeriodKey,
    },
    {
      axis: "scenario.scenarioType",
      previous: previous.scenario.scenarioType,
      current: current.scenario.scenarioType,
    },
    {
      axis: "counterpart.birthDate",
      previous: previous.counterpart.birthDate,
      current: current.counterpart.birthDate,
    },
    {
      axis: "counterpart.calendarType",
      previous: previous.counterpart.calendarType,
      current: current.counterpart.calendarType,
    },
    {
      axis: "counterpart.gender",
      previous: previous.counterpart.gender,
      current: current.counterpart.gender,
    },
    {
      axis: "counterpart.birthTime",
      previous: previous.counterpart.birthTime,
      current: current.counterpart.birthTime,
    },
  ];

  return pairs.filter((entry) => entry.previous !== entry.current);
}

function meaningAxesEqual(
  left: SemanticAxisSnapshot,
  right: SemanticAxisSnapshot,
): boolean {
  return left.meaning.domain === right.meaning.domain
    && left.meaning.intent === right.meaning.intent
    && left.meaning.objectLabel === right.meaning.objectLabel;
}

function timeAxesEqual(
  left: SemanticAxisSnapshot,
  right: SemanticAxisSnapshot,
): boolean {
  return left.time.timeGranularity === right.time.timeGranularity
    && left.time.timePeriodKey === right.time.timePeriodKey;
}

function scenarioAxesEqual(
  left: SemanticAxisSnapshot,
  right: SemanticAxisSnapshot,
): boolean {
  return left.scenario.scenarioType === right.scenario.scenarioType;
}

function counterpartIdentifiable(
  axis: SemanticAxisSnapshot,
): boolean {
  return Boolean(
    axis.counterpart.birthDate
    && axis.counterpart.calendarType
    && axis.counterpart.gender,
  );
}

function counterpartIdentityDiffers(
  previous: SemanticAxisSnapshot,
  current: SemanticAxisSnapshot,
): boolean {
  if (!counterpartIdentifiable(previous) || !counterpartIdentifiable(current)) {
    return false;
  }

  const birthDateDiffers =
    previous.counterpart.birthDate !== current.counterpart.birthDate;
  const calendarTypeDiffers =
    previous.counterpart.calendarType !== current.counterpart.calendarType;
  const genderDiffers =
    previous.counterpart.gender !== current.counterpart.gender;

  const bothHaveBirthTime =
    Boolean(previous.counterpart.birthTime)
    && Boolean(current.counterpart.birthTime);
  const birthTimeDiffers = bothHaveBirthTime
    && previous.counterpart.birthTime !== current.counterpart.birthTime;

  return birthDateDiffers
    || calendarTypeDiffers
    || genderDiffers
    || Boolean(birthTimeDiffers);
}

function buildCase(params: {
  id: string;
  invariant: SemanticAxisInvariant;
  status: SemanticAxisCaseStatus;
  previousAxis: SemanticAxisSnapshot | null;
  currentAxis: SemanticAxisSnapshot | null;
  axisDiff: SemanticAxisDiffEntry[];
  result: VNextConversationPipelineResult | null;
  previousSourceTurnIds: SemanticAxisSourceTurnIds | null;
  currentSourceTurnIds: SemanticAxisSourceTurnIds | null;
  details: string[];
  notCoveredReason?: string;
}): SemanticAxisReuseVerificationCase {
  return {
    id: params.id,
    invariant: params.invariant,
    status: params.status,
    passed: params.status === "PASS",
    previousAxis: params.previousAxis,
    currentAxis: params.currentAxis,
    axisDiff: params.axisDiff,
    reused: params.result?.executionMetadata.reused ?? null,
    executedStages: params.result?.executionMetadata.executedStages ?? [],
    previousSourceTurnIds: params.previousSourceTurnIds,
    currentSourceTurnIds: params.currentSourceTurnIds,
    followUpType: params.result?.followUpType ?? null,
    details: params.details,
    ...(params.notCoveredReason
      ? { notCoveredReason: params.notCoveredReason }
      : {}),
  };
}

async function runTurn(
  question: string,
  gateway: ReturnType<typeof createMockResponseGateway>,
  session?: ConversationSession,
): Promise<VNextConversationPipelineResult> {
  return runVNextConversationPipeline({
    ...(session ? { session } : {}),
    question,
    input: {
      request: buildVerificationRequest(question),
      gateway,
    },
  });
}

/**
 * A. SAME AXIS — 구조화된 axis가 유지된 follow-up에서
 * assessment/timeState 재사용이 허용되는지 확인한다.
 */
async function verifySameAxis(
  gateway: ReturnType<typeof createMockResponseGateway>,
): Promise<SemanticAxisReuseVerificationCase> {
  const firstQuestion = "10월 금전운이 있을까요?";
  const secondQuestion = "조금 더 자세히 말해줘";

  const first = await runTurn(firstQuestion, gateway);
  const previousAxis = observeAxesFromSession(first.session);
  const previousSourceTurnIds = observeSourceTurnIds(first.session);
  const readerAxis = observeAxesFromReaderAdapter(firstQuestion);

  const second = await runTurn(secondQuestion, gateway, first.session);
  const currentAxis = observeAxesFromSession(second.session);
  const currentSourceTurnIds = observeSourceTurnIds(second.session);
  const axisDiff = diffAxes(previousAxis, currentAxis);

  const meaningUnchanged = meaningAxesEqual(previousAxis, currentAxis);
  const timeUnchanged = timeAxesEqual(previousAxis, currentAxis);
  const scenarioUnchanged = scenarioAxesEqual(previousAxis, currentAxis);

  const details = [
    `followUpType=${second.followUpType}`,
    `readerDomain=${readerAxis.meaning.domain}`,
    `readerIntent=${readerAxis.meaning.intent}`,
    `readerScenario=${readerAxis.scenario.scenarioType}`,
    `meaningUnchanged=${meaningUnchanged}`,
    `timeUnchanged=${timeUnchanged}`,
    `scenarioUnchanged=${scenarioUnchanged}`,
    `reusedAssessment=${second.executionMetadata.reused.assessment}`,
    `reusedTimeState=${second.executionMetadata.reused.timeState}`,
    `reusedHumanState=${second.executionMetadata.reused.humanState}`,
    `executedStages=${second.executionMetadata.executedStages.join(",")}`,
    `axisDiffCount=${axisDiff.length}`,
  ];

  if (!previousAxis.meaning.domain || !previousAxis.scenario.scenarioType) {
    return buildCase({
      id: "invariant-A-same-axis",
      invariant: "A_SAME_AXIS",
      status: "NOT_COVERED",
      previousAxis,
      currentAxis,
      axisDiff,
      result: second,
      previousSourceTurnIds,
      currentSourceTurnIds,
      details,
      notCoveredReason:
        "초기 turn에서 meaning/scenario axis를 pipeline 결과로 관찰하지 못함",
    });
  }

  if (!meaningUnchanged || !scenarioUnchanged) {
    return buildCase({
      id: "invariant-A-same-axis",
      invariant: "A_SAME_AXIS",
      status: "NOT_COVERED",
      previousAxis,
      currentAxis,
      axisDiff,
      result: second,
      previousSourceTurnIds,
      currentSourceTurnIds,
      details,
      notCoveredReason:
        "follow-up 후 session semantic axis가 달라져 SAME AXIS 전제 미성립",
    });
  }

  const reuseAllowed =
    second.followUpType === "continuation"
    && second.executionMetadata.reused.assessment
    && second.executionMetadata.reused.timeState
    && (
      second.executionMetadata.executedStages.includes("pipeline:cacheOnly")
      || second.executionMetadata.executedStages.includes("assessment:reused")
    );

  return buildCase({
    id: "invariant-A-same-axis",
    invariant: "A_SAME_AXIS",
    status: reuseAllowed ? "PASS" : "FAIL",
    previousAxis,
    currentAxis,
    axisDiff,
    result: second,
    previousSourceTurnIds,
    currentSourceTurnIds,
    details,
  });
}

/**
 * B. TIME DIFFERENCE — timePeriodKey만 달라진 경우
 * timeState/assessment 재실행 및 sourceTurnId 갱신을 확인한다.
 */
async function verifyTimeDifference(
  gateway: ReturnType<typeof createMockResponseGateway>,
): Promise<SemanticAxisReuseVerificationCase> {
  const firstQuestion = "10월에 사업을 시작해도 될까요?";
  const secondQuestion = "11월에는 어떨까요?";

  const first = await runTurn(firstQuestion, gateway);
  const previousAxis = observeAxesFromSession(first.session);
  const previousSourceTurnIds = observeSourceTurnIds(first.session);

  const second = await runTurn(secondQuestion, gateway, first.session);
  const currentAxis = observeAxesFromSession(second.session);
  const currentSourceTurnIds = observeSourceTurnIds(second.session);
  const axisDiff = diffAxes(previousAxis, currentAxis);

  const timePeriodChanged =
    previousAxis.time.timePeriodKey !== null
    && currentAxis.time.timePeriodKey !== null
    && previousAxis.time.timePeriodKey !== currentAxis.time.timePeriodKey;

  const details = [
    `followUpType=${second.followUpType}`,
    `previousTimePeriodKey=${previousAxis.time.timePeriodKey ?? "none"}`,
    `currentTimePeriodKey=${currentAxis.time.timePeriodKey ?? "none"}`,
    `timePeriodChanged=${timePeriodChanged}`,
    `reusedAssessment=${second.executionMetadata.reused.assessment}`,
    `reusedTimeState=${second.executionMetadata.reused.timeState}`,
    `executedStages=${second.executionMetadata.executedStages.join(",")}`,
    `previousAssessmentSourceTurnId=${previousSourceTurnIds.assessment ?? "none"}`,
    `currentAssessmentSourceTurnId=${currentSourceTurnIds.assessment ?? "none"}`,
    `currentTurnId=${second.turn.turnId}`,
  ];

  if (!timePeriodChanged) {
    return buildCase({
      id: "invariant-B-time-difference",
      invariant: "B_TIME_DIFFERENCE",
      status: "NOT_COVERED",
      previousAxis,
      currentAxis,
      axisDiff,
      result: second,
      previousSourceTurnIds,
      currentSourceTurnIds,
      details,
      notCoveredReason:
        "pipeline 결과에서 timePeriodKey 변경을 관찰하지 못함",
    });
  }

  const assessmentReexecuted =
    second.executionMetadata.reused.assessment === false
    && second.executionMetadata.executedStages.includes("assessment:executed")
    && currentSourceTurnIds.assessment === second.turn.turnId
    && previousSourceTurnIds.assessment !== null
    && previousSourceTurnIds.assessment !== currentSourceTurnIds.assessment;

  const timeStateReexecuted =
    second.executionMetadata.reused.timeState === false
    && (
      second.executionMetadata.executedStages.includes("timeState:executed")
      || currentSourceTurnIds.timeState === second.turn.turnId
    );

  const passed = assessmentReexecuted
    && timeStateReexecuted
    && !second.executionMetadata.executedStages.includes("pipeline:cacheOnly");

  return buildCase({
    id: "invariant-B-time-difference",
    invariant: "B_TIME_DIFFERENCE",
    status: passed ? "PASS" : "FAIL",
    previousAxis,
    currentAxis,
    axisDiff,
    result: second,
    previousSourceTurnIds,
    currentSourceTurnIds,
    details,
  });
}

/**
 * C. COUNTERPART DIFFERENCE — counterpart identity만 달라진 경우
 * humanState 유지 가능 범위와 assessment 재실행을 확인한다.
 */
async function verifyCounterpartDifference(
  gateway: ReturnType<typeof createMockResponseGateway>,
): Promise<SemanticAxisReuseVerificationCase> {
  const firstQuestion =
    "이 여자랑 결혼해도 돼? 상대방이 음력 1967년 4월 2일생 양띠 여성이야";
  const secondQuestion =
    "조금 더 자세히 말해줘. 상대방이 음력 1970년 5월 1일생 양띠 여성이야";

  const first = await runTurn(firstQuestion, gateway);
  const previousAxis = observeAxesFromSession(first.session);
  const previousSourceTurnIds = observeSourceTurnIds(first.session);
  const previousReaderAxis = observeAxesFromReaderAdapter(firstQuestion);

  const second = await runTurn(secondQuestion, gateway, first.session);
  const currentAxis = observeAxesFromSession(second.session);
  const currentSourceTurnIds = observeSourceTurnIds(second.session);
  const currentReaderAxis = observeAxesFromReaderAdapter(secondQuestion);
  const axisDiff = diffAxes(previousAxis, currentAxis);

  const counterpartChanged = counterpartIdentityDiffers(
    previousReaderAxis,
    currentReaderAxis,
  )
    || counterpartIdentityDiffers(previousAxis, currentAxis);

  const details = [
    `followUpType=${second.followUpType}`,
    `previousBirthDate=${previousAxis.counterpart.birthDate ?? previousReaderAxis.counterpart.birthDate ?? "none"}`,
    `currentBirthDate=${currentAxis.counterpart.birthDate ?? currentReaderAxis.counterpart.birthDate ?? "none"}`,
    `counterpartChanged=${counterpartChanged}`,
    `reusedHumanState=${second.executionMetadata.reused.humanState}`,
    `reusedAssessment=${second.executionMetadata.reused.assessment}`,
    `reusePlanReuseAssessment=${second.reusePlan?.reuseAssessment ?? false}`,
    `executedStages=${second.executionMetadata.executedStages.join(",")}`,
    `previousAssessmentSourceTurnId=${previousSourceTurnIds.assessment ?? "none"}`,
    `currentAssessmentSourceTurnId=${currentSourceTurnIds.assessment ?? "none"}`,
    `currentTurnId=${second.turn.turnId}`,
  ];

  if (!counterpartChanged) {
    return buildCase({
      id: "invariant-C-counterpart-difference",
      invariant: "C_COUNTERPART_DIFFERENCE",
      status: "NOT_COVERED",
      previousAxis,
      currentAxis,
      axisDiff,
      result: second,
      previousSourceTurnIds,
      currentSourceTurnIds,
      details,
      notCoveredReason:
        "Reader/session 결과에서 counterpart identity 변경을 관찰하지 못함",
    });
  }

  if (!first.session.analysisCache.assessment) {
    return buildCase({
      id: "invariant-C-counterpart-difference",
      invariant: "C_COUNTERPART_DIFFERENCE",
      status: "NOT_COVERED",
      previousAxis,
      currentAxis,
      axisDiff,
      result: second,
      previousSourceTurnIds,
      currentSourceTurnIds,
      details,
      notCoveredReason: "초기 turn assessment가 없어 counterpart invalidate를 검증할 수 없음",
    });
  }

  const assessmentReexecuted =
    second.executionMetadata.reused.assessment === false
    && second.executionMetadata.executedStages.includes("assessment:executed")
    && currentSourceTurnIds.assessment === second.turn.turnId
    && previousSourceTurnIds.assessment !== null
    && previousSourceTurnIds.assessment !== currentSourceTurnIds.assessment;

  // 현재 production은 counterpart mismatch 시 time/assessment만 차단하고
  // humanState reuse plan은 유지한다. 가능한 범위에서만 관찰한다.
  const humanStatePreservedWhenPossible =
    second.executionMetadata.reused.humanState === true
    || !first.session.analysisCache.humanState;

  const passed = assessmentReexecuted
    && humanStatePreservedWhenPossible
    && !second.executionMetadata.executedStages.includes("pipeline:cacheOnly");

  return buildCase({
    id: "invariant-C-counterpart-difference",
    invariant: "C_COUNTERPART_DIFFERENCE",
    status: passed ? "PASS" : "FAIL",
    previousAxis,
    currentAxis,
    axisDiff,
    result: second,
    previousSourceTurnIds,
    currentSourceTurnIds,
    details,
  });
}

/**
 * D. MEANING DIFFERENCE — domain/intent/object 중 실제 변경 시
 * assessment 재사용 차단을 확인한다.
 */
async function verifyMeaningDifference(
  gateway: ReturnType<typeof createMockResponseGateway>,
): Promise<SemanticAxisReuseVerificationCase> {
  const firstQuestion = "10월 금전운이 있을까요?";
  const secondQuestion = "나에게 맞는 직업은 무엇인가요?";

  const first = await runTurn(firstQuestion, gateway);
  const previousAxis = observeAxesFromSession(first.session);
  const previousSourceTurnIds = observeSourceTurnIds(first.session);
  const previousReaderAxis = observeAxesFromReaderAdapter(firstQuestion);

  const second = await runTurn(secondQuestion, gateway, first.session);
  const currentAxis = observeAxesFromSession(second.session);
  const currentSourceTurnIds = observeSourceTurnIds(second.session);
  const currentReaderAxis = observeAxesFromReaderAdapter(secondQuestion);
  const axisDiff = diffAxes(previousAxis, currentAxis);

  const readerMeaningChanged = !meaningAxesEqual(
    previousReaderAxis,
    currentReaderAxis,
  );
  const sessionMeaningChanged = !meaningAxesEqual(
    previousAxis,
    currentAxis,
  );
  const meaningChanged = readerMeaningChanged || sessionMeaningChanged;

  const details = [
    `followUpType=${second.followUpType}`,
    `previousDomain=${previousAxis.meaning.domain ?? "none"}`,
    `currentDomain=${currentAxis.meaning.domain ?? "none"}`,
    `readerPreviousDomain=${previousReaderAxis.meaning.domain}`,
    `readerCurrentDomain=${currentReaderAxis.meaning.domain}`,
    `meaningChanged=${meaningChanged}`,
    `reusedAssessment=${second.executionMetadata.reused.assessment}`,
    `executedStages=${second.executionMetadata.executedStages.join(",")}`,
    `previousAssessmentSourceTurnId=${previousSourceTurnIds.assessment ?? "none"}`,
    `currentAssessmentSourceTurnId=${currentSourceTurnIds.assessment ?? "none"}`,
  ];

  if (!meaningChanged) {
    return buildCase({
      id: "invariant-D-meaning-difference",
      invariant: "D_MEANING_DIFFERENCE",
      status: "NOT_COVERED",
      previousAxis,
      currentAxis,
      axisDiff,
      result: second,
      previousSourceTurnIds,
      currentSourceTurnIds,
      details,
      notCoveredReason:
        "Reader/Adapter/Pipeline 결과에서 meaning axis 변경을 관찰하지 못함",
    });
  }

  const assessmentNotReused =
    second.executionMetadata.reused.assessment === false
    && !second.executionMetadata.executedStages.includes("pipeline:cacheOnly");

  return buildCase({
    id: "invariant-D-meaning-difference",
    invariant: "D_MEANING_DIFFERENCE",
    status: assessmentNotReused ? "PASS" : "FAIL",
    previousAxis,
    currentAxis,
    axisDiff,
    result: second,
    previousSourceTurnIds,
    currentSourceTurnIds,
    details,
  });
}

/**
 * E. SCENARIO DIFFERENCE — scenarioType 변경 시
 * assessment/관련 결과 재사용 차단을 확인한다.
 */
async function verifyScenarioDifference(
  gateway: ReturnType<typeof createMockResponseGateway>,
): Promise<SemanticAxisReuseVerificationCase> {
  const firstQuestion = "10월 금전운이 있을까요?";
  const secondQuestion = "10월에 사업을 시작해도 될까요?";

  const first = await runTurn(firstQuestion, gateway);
  const previousAxis = observeAxesFromSession(first.session);
  const previousSourceTurnIds = observeSourceTurnIds(first.session);
  const previousReaderAxis = observeAxesFromReaderAdapter(firstQuestion);

  const second = await runTurn(secondQuestion, gateway, first.session);
  const currentAxis = observeAxesFromSession(second.session);
  const currentSourceTurnIds = observeSourceTurnIds(second.session);
  const currentReaderAxis = observeAxesFromReaderAdapter(secondQuestion);
  const axisDiff = diffAxes(previousAxis, currentAxis);

  const readerScenarioChanged =
    previousReaderAxis.scenario.scenarioType
    !== currentReaderAxis.scenario.scenarioType;
  const sessionScenarioChanged =
    previousAxis.scenario.scenarioType !== null
    && currentAxis.scenario.scenarioType !== null
    && previousAxis.scenario.scenarioType !== currentAxis.scenario.scenarioType;
  const scenarioChanged = readerScenarioChanged || sessionScenarioChanged;

  const details = [
    `followUpType=${second.followUpType}`,
    `previousScenario=${previousAxis.scenario.scenarioType ?? "none"}`,
    `currentScenario=${currentAxis.scenario.scenarioType ?? "none"}`,
    `readerPreviousScenario=${previousReaderAxis.scenario.scenarioType}`,
    `readerCurrentScenario=${currentReaderAxis.scenario.scenarioType}`,
    `scenarioChanged=${scenarioChanged}`,
    `reusedAssessment=${second.executionMetadata.reused.assessment}`,
    `executedStages=${second.executionMetadata.executedStages.join(",")}`,
    `note=scenario 변경 시 domain 등 다른 axis도 함께 바뀔 수 있음 — 관찰된 scenarioType 차이만 전제로 사용`,
  ];

  if (!scenarioChanged) {
    return buildCase({
      id: "invariant-E-scenario-difference",
      invariant: "E_SCENARIO_DIFFERENCE",
      status: "NOT_COVERED",
      previousAxis,
      currentAxis,
      axisDiff,
      result: second,
      previousSourceTurnIds,
      currentSourceTurnIds,
      details,
      notCoveredReason:
        "Reader/Adapter/Pipeline 결과에서 scenarioType 변경을 관찰하지 못함",
    });
  }

  const assessmentNotReused =
    second.executionMetadata.reused.assessment === false
    && !second.executionMetadata.executedStages.includes("pipeline:cacheOnly");

  return buildCase({
    id: "invariant-E-scenario-difference",
    invariant: "E_SCENARIO_DIFFERENCE",
    status: assessmentNotReused ? "PASS" : "FAIL",
    previousAxis,
    currentAxis,
    axisDiff,
    result: second,
    previousSourceTurnIds,
    currentSourceTurnIds,
    details,
  });
}

/**
 * F. SURFACE STRING INDEPENDENCE —
 * 자연어 표현이 달라도 구조화된 axis가 같으면
 * 문자열 차이 자체가 reuse를 막지 않는지 확인한다.
 */
async function verifySurfaceStringIndependence(
  gateway: ReturnType<typeof createMockResponseGateway>,
): Promise<SemanticAxisReuseVerificationCase> {
  const surfaces: readonly [string, string] = [
    "사업을 시작해도 될까요?",
    "창업을 해도 괜찮을까요?",
  ];
  const firstQuestion = surfaces[0];
  const secondQuestion = surfaces[1];
  const surfaceDiffers = surfaces[0] !== surfaces[1];

  const previousReaderAxis = observeAxesFromReaderAdapter(firstQuestion);
  const currentReaderAxis = observeAxesFromReaderAdapter(secondQuestion);

  const first = await runTurn(firstQuestion, gateway);
  const previousAxis = observeAxesFromSession(first.session);
  const previousSourceTurnIds = observeSourceTurnIds(first.session);

  const second = await runTurn(secondQuestion, gateway, first.session);
  const currentAxis = observeAxesFromSession(second.session);
  const currentSourceTurnIds = observeSourceTurnIds(second.session);
  const axisDiff = diffAxes(previousAxis, currentAxis);

  // F: objectLabel(표면 표현) 제외 — domain/intent만 동일하면 same meaning
  const readerMeaningSame =
    previousReaderAxis.meaning.domain === currentReaderAxis.meaning.domain
    && previousReaderAxis.meaning.intent === currentReaderAxis.meaning.intent;
  const readerScenarioSame = scenarioAxesEqual(
    previousReaderAxis,
    currentReaderAxis,
  );
  const sessionCoreSame =
    meaningAxesEqual(previousAxis, currentAxis)
    && scenarioAxesEqual(previousAxis, currentAxis);

  const details = [
    `followUpType=${second.followUpType}`,
    `surfaceDiffers=${surfaceDiffers}`,
    `readerMeaningSame=${readerMeaningSame}`,
    `readerScenarioSame=${readerScenarioSame}`,
    `sessionCoreSame=${sessionCoreSame}`,
    `readerPreviousDomain=${previousReaderAxis.meaning.domain}`,
    `readerCurrentDomain=${currentReaderAxis.meaning.domain}`,
    `readerPreviousIntent=${previousReaderAxis.meaning.intent}`,
    `readerCurrentIntent=${currentReaderAxis.meaning.intent}`,
    `reusedAssessment=${second.executionMetadata.reused.assessment}`,
    `reusedTimeState=${second.executionMetadata.reused.timeState}`,
    `executedStages=${second.executionMetadata.executedStages.join(",")}`,
    `note=질문 원문은 identity key로 쓰지 않고, surface 차이 존재 여부만 기록`,
  ];

  if (!surfaceDiffers) {
    return buildCase({
      id: "invariant-F-surface-string-independence",
      invariant: "F_SURFACE_STRING_INDEPENDENCE",
      status: "NOT_COVERED",
      previousAxis,
      currentAxis,
      axisDiff,
      result: second,
      previousSourceTurnIds,
      currentSourceTurnIds,
      details,
      notCoveredReason: "surface 문자열이 달라지지 않아 독립성 검증 불가",
    });
  }

  if (!readerMeaningSame || !readerScenarioSame) {
    return buildCase({
      id: "invariant-F-surface-string-independence",
      invariant: "F_SURFACE_STRING_INDEPENDENCE",
      status: "NOT_COVERED",
      previousAxis,
      currentAxis,
      axisDiff,
      result: second,
      previousSourceTurnIds,
      currentSourceTurnIds,
      details,
      notCoveredReason:
        "Reader/Adapter 기준 structured meaning/scenario axis가 동일하지 않아 "
        + "surface independence 전제 미성립",
    });
  }

  // 동일 structured axis인데 문자열만 다른 경우,
  // 현재 production이 continuation 등으로 재사용을 허용하는지 관찰한다.
  // newQuestion으로 분류되면 followUp 정책상 재사용이 막히므로
  // "문자열 자체가 원인"이라고 단정하지 않고 NOT_COVERED로 남긴다.
  if (second.followUpType === "newQuestion") {
    return buildCase({
      id: "invariant-F-surface-string-independence",
      invariant: "F_SURFACE_STRING_INDEPENDENCE",
      status: "NOT_COVERED",
      previousAxis,
      currentAxis,
      axisDiff,
      result: second,
      previousSourceTurnIds,
      currentSourceTurnIds,
      details,
      notCoveredReason:
        "동일 structured axis지만 followUpType=newQuestion이라 "
        + "문자열 독립성만 분리 관찰할 수 없음 (followUp 정책과 결합)",
    });
  }

  const reuseNotBlockedBySurface =
    second.executionMetadata.reused.assessment === true
    || second.executionMetadata.reused.timeState === true
    || second.executionMetadata.executedStages.includes("pipeline:cacheOnly")
    || second.executionMetadata.executedStages.includes("assessment:reused");

  return buildCase({
    id: "invariant-F-surface-string-independence",
    invariant: "F_SURFACE_STRING_INDEPENDENCE",
    status: reuseNotBlockedBySurface ? "PASS" : "FAIL",
    previousAxis,
    currentAxis,
    axisDiff,
    result: second,
    previousSourceTurnIds,
    currentSourceTurnIds,
    details,
  });
}
/**
 * G. CONDITION ADDITION — 같은 기본 질문에 구체 조건이 추가되면
 * 기존 assessment를 그대로 재사용하지 않는지 확인한다.
 */
async function verifyConditionAddition(
  gateway: ReturnType<typeof createMockResponseGateway>,
): Promise<SemanticAxisReuseVerificationCase> {
  const firstQuestion = "10월에 사업을 시작해도 될까요?";
  const secondQuestion = "10월에 카페를 시작해도 될까요?";

  const first = await runTurn(firstQuestion, gateway);
  const previousAxis = observeAxesFromSession(first.session);
  const previousSourceTurnIds = observeSourceTurnIds(first.session);
  const previousReaderAxis = observeAxesFromReaderAdapter(firstQuestion);

  const second = await runTurn(secondQuestion, gateway, first.session);
  const currentAxis = observeAxesFromSession(second.session);
  const currentSourceTurnIds = observeSourceTurnIds(second.session);
  const currentReaderAxis = observeAxesFromReaderAdapter(secondQuestion);

  const axisDiff = diffAxes(previousAxis, currentAxis);
  const conditionChanged =
    previousReaderAxis.meaning.objectLabel !==
    currentReaderAxis.meaning.objectLabel;

  const assessmentNotReused =
    second.executionMetadata.reused.assessment === false ||
    second.executionMetadata.executedStages.includes("assessment:executed");

  const details = [
    `firstQuestion=${firstQuestion}`,
    `secondQuestion=${secondQuestion}`,
    `readerPreviousDomain=${previousReaderAxis.meaning.domain}`,
    `readerCurrentDomain=${currentReaderAxis.meaning.domain}`,
    `readerPreviousIntent=${previousReaderAxis.meaning.intent}`,
    `readerCurrentIntent=${currentReaderAxis.meaning.intent}`,
    `readerPreviousObject=${previousReaderAxis.meaning.objectLabel ?? "null"}`,
    `readerCurrentObject=${currentReaderAxis.meaning.objectLabel ?? "null"}`,
    `conditionChanged=${conditionChanged}`,
    `reusedAssessment=${second.executionMetadata.reused.assessment}`,
    `executedStages=${second.executionMetadata.executedStages.join(",")}`,
  ];

  return buildCase({
    id: "invariant-G-condition-addition",
    invariant: "G_CONDITION_ADDITION",
    status: conditionChanged && assessmentNotReused ? "PASS" : "FAIL",
    previousAxis,
    currentAxis,
    axisDiff,
    result: second,
    previousSourceTurnIds,
    currentSourceTurnIds,
    details,
  });
}
export async function verifySemanticAxisReuse(): Promise<
  SemanticAxisReuseVerificationResult
> {
  const gateway = createMockResponseGateway();

  const cases = await Promise.all([
    verifySameAxis(gateway),
    verifyTimeDifference(gateway),
    verifyCounterpartDifference(gateway),
    verifyMeaningDifference(gateway),
    verifyScenarioDifference(gateway),
    verifySurfaceStringIndependence(gateway),
    verifyConditionAddition(gateway),
  ]);

  return {
    // NOT_COVERED는 커버리지 공백이며 suite 실패로 취급하지 않는다.
    passed: cases.every((item) => item.status !== "FAIL"),
    cases,
  };
}

export function serializeSemanticAxisReuseVerificationResult(
  result: SemanticAxisReuseVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
