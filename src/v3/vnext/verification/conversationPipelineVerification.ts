/**
 * vNext Conversation Pipeline Verification — STEP 5C-4.
 */

import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  resolveLifeFlowTarget,
} from "../../consulting/question/lifeFlowTargetResolver.js";
import {
  runVNextConversationPipeline,
} from "../conversation/conversationPipeline.js";
import type {
  ConversationSession,
} from "../conversation/conversationSession.js";
import {
  resolveFollowUpQuestionType,
} from "../conversation/followUpQuestionResolver.js";
import {
  buildHumanDestinyContextPipeline,
} from "../../builders/humanDestinyContextPipelineBuilder.js";
import {
  createMockResponseGateway,
} from "../gpt/responseGateway.js";
import {
  readQuestion,
} from "../../consulting/question/questionReader.js";

export type ConversationPipelineVerificationCase = {
  id: string;
  passed: boolean;
  details: string[];
};

export type ConversationPipelineVerificationResult = {
  passed: boolean;
  cases: ConversationPipelineVerificationCase[];
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

async function runCase(
  id: string,
  run: () => Promise<{
    passed: boolean;
    details: string[];
  }>,
): Promise<ConversationPipelineVerificationCase> {
  const result = await run();

  return {
    id,
    passed: result.passed,
    details: result.details,
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

function buildEmptyContextMetadata() {
  const now = new Date().toISOString();

  return {
    lastCompletedTurnId: null,
    awaitingClarification: false,
    pendingMissingContextKeys: [],
    originalQuestion: null,
    activeScenarioType: null,
    totalGptApiCallCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function hasCacheEntries(
  session: ConversationSession,
): boolean {
  return Boolean(
    session.analysisCache.humanState
    || session.analysisCache.timeState
    || session.analysisCache.assessment
    || session.analysisCache.questionMeaning
    || session.analysisCache.scenario,
  );
}

export async function verifyConversationPipeline(): Promise<ConversationPipelineVerificationResult> {
  const gateway = createMockResponseGateway();

  const cases = await Promise.all([
    runCase("case-1-initial-question", async () => {
      const result = await runVNextConversationPipeline({
        question: "10월 금전운은?",
        input: {
          request: buildVerificationRequest("10월 금전운은?"),
          gateway,
        },
      });

      return {
        passed:
          result.session.turns.length === 1
          && result.turn.turnId.length > 0
          && hasCacheEntries(result.session)
          && result.response.text.length > 0
          && result.followUpType === "initial",
        details: [
          `turns=${result.session.turns.length}`,
          `followUpType=${result.followUpType}`,
          `cacheHumanState=${Boolean(result.session.analysisCache.humanState)}`,
          `cacheTimeState=${Boolean(result.session.analysisCache.timeState)}`,
          `responseSource=${result.response.source}`,
          `apiCallCount=${result.response.apiCallCount}`,
        ],
      };
    }),

    runCase("case-2-continuation", async () => {
      const first = await runVNextConversationPipeline({
        question: "10월 금전운은?",
        input: {
          request: buildVerificationRequest("10월 금전운은?"),
          gateway,
        },
      });

      const result = await runVNextConversationPipeline({
        session: first.session,
        question: "조금 더 자세히 말해줘",
        input: {
          request: buildVerificationRequest("조금 더 자세히 말해줘"),
          gateway,
        },
      });

      return {
        passed:
          result.followUpType === "continuation"
          && result.executionMetadata.reused.humanState
          && result.executionMetadata.executedStages.includes("pipeline:cacheOnly")
          && result.executionMetadata.executedStages.includes("humanState:reused")
          && result.session.turns.length === 2
          && result.response.apiCallCount === 1,
        details: [
          `followUpType=${result.followUpType}`,
          `reusedHumanState=${result.executionMetadata.reused.humanState}`,
          `executedStages=${result.executionMetadata.executedStages.join(",")}`,
          `apiCallCount=${result.response.apiCallCount}`,
        ],
      };
    }),

    runCase("case-3-time-refinement", async () => {
      const first = await runVNextConversationPipeline({
        question: "10월 금전운은?",
        input: {
          request: buildVerificationRequest("10월 금전운은?"),
          gateway,
        },
      });

      const result = await runVNextConversationPipeline({
        session: first.session,
        question: "그러면 10월 중순은?",
        input: {
          request: buildVerificationRequest("그러면 10월 중순은?"),
          gateway,
        },
      });

      return {
        passed:
          result.followUpType === "timeRefinement"
          && result.executionMetadata.reused.humanState
          && result.executionMetadata.executedStages.includes("pipeline:partial")
          && !result.executionMetadata.executedStages.includes("pipeline:full")
          && result.session.turns.length === 2,
        details: [
          `followUpType=${result.followUpType}`,
          `reusedHumanState=${result.executionMetadata.reused.humanState}`,
          `reusedTimeState=${result.executionMetadata.reused.timeState}`,
          `executedStages=${result.executionMetadata.executedStages.join(",")}`,
        ],
      };
    }),

    runCase("case-4-clarification-answer", async () => {
      const q1 = "상대방과 궁합은 어떤가요?";
      const q2 = "유시입니다";
      const q3 = "1988년 5월 10일";

      const first = await runVNextConversationPipeline({
        question: q1,
        input: {
          request: buildVerificationRequest(q1),
          gateway,
        },
      });

      const originalQuestion = first.session.contextMetadata.originalQuestion;
      const firstPending =
        first.session.contextMetadata.pendingMissingContextKeys;

      const second = await runVNextConversationPipeline({
        session: first.session,
        question: q2,
        input: {
          request: buildVerificationRequest(q2),
          gateway,
        },
      });

      const secondPending =
        second.session.contextMetadata.pendingMissingContextKeys;

      const third = await runVNextConversationPipeline({
        session: second.session,
        question: q3,
        input: {
          request: buildVerificationRequest(q3),
          gateway,
        },
      });

      const thirdPending =
        third.session.contextMetadata.pendingMissingContextKeys;

      return {
        passed:
          // Q1: start clarification for counterpart birth date
          first.response.source === "clarification"
          && first.response.apiCallCount === 0
          && first.session.contextMetadata.awaitingClarification
          && firstPending.includes("counterpartBirthDate")
          && originalQuestion === q1
          // Q2: partial clarificationAnswer keeps awaiting state
          && second.followUpType === "clarificationAnswer"
          && second.response.source === "clarification"
          && second.response.apiCallCount === 0
          && second.session.contextMetadata.awaitingClarification
          && secondPending.includes("counterpartBirthDate")
          && second.session.contextMetadata.originalQuestion === originalQuestion
          // Q3: complete clarification, keep original compatibility path
          && third.followUpType === "clarificationAnswer"
          && third.session.contextMetadata.originalQuestion === originalQuestion
          && !third.session.contextMetadata.awaitingClarification
          && thirdPending.length === 0
          && third.response.source !== "clarification"
          && third.turn.questionMeaning?.domain === "compatibility"
          && third.session.turns.length === 3,
        details: [
          `q1Source=${first.response.source}`,
          `q1Awaiting=${first.session.contextMetadata.awaitingClarification}`,
          `q1Pending=${firstPending.join(",") || "none"}`,
          `q2FollowUpType=${second.followUpType}`,
          `q2Source=${second.response.source}`,
          `q2ApiCallCount=${second.response.apiCallCount}`,
          `q2Awaiting=${second.session.contextMetadata.awaitingClarification}`,
          `q2Pending=${secondPending.join(",") || "none"}`,
          `q3FollowUpType=${third.followUpType}`,
          `q3Source=${third.response.source}`,
          `q3Awaiting=${third.session.contextMetadata.awaitingClarification}`,
          `q3Pending=${thirdPending.join(",") || "none"}`,
          `q3Domain=${third.turn.questionMeaning?.domain ?? "none"}`,
          `originalQuestion=${third.session.contextMetadata.originalQuestion}`,
          `turns=${third.session.turns.length}`,
        ],
      };
    }),

    runCase("case-5-new-question", async () => {
      const first = await runVNextConversationPipeline({
        question: "10월 금전운은?",
        input: {
          request: buildVerificationRequest("10월 금전운은?"),
          gateway,
        },
      });

      const result = await runVNextConversationPipeline({
        session: first.session,
        question: "다른 사람과 궁합은?",
        input: {
          request: buildVerificationRequest("다른 사람과 궁합은?"),
          gateway,
        },
      });

      return {
        passed:
          result.followUpType === "newQuestion"
          && result.session.turns.length === 2
          && result.turn.questionMeaning !== null
          && result.turn.scenario !== null
          && result.session.contextMetadata.totalGptApiCallCount
            >= result.response.apiCallCount,
        details: [
          `followUpType=${result.followUpType}`,
          `turns=${result.session.turns.length}`,
          `questionDomain=${result.turn.questionMeaning?.domain ?? "none"}`,
          `scenarioType=${result.turn.scenario?.type ?? "none"}`,
          `totalGptApiCallCount=${result.session.contextMetadata.totalGptApiCallCount}`,
        ],
      };
    }),

    runCase("case-6-non-reusable-cache", async () => {
      const first = await runVNextConversationPipeline({
        question: "10월 금전운은?",
        input: {
          request: buildVerificationRequest("10월 금전운은?"),
          gateway,
        },
      });

      const tamperedSession: ConversationSession = {
        ...first.session,
        analysisCache: {
          ...first.session.analysisCache,
          humanState: first.session.analysisCache.humanState
            ? {
                ...first.session.analysisCache.humanState,
                reuseMetadata: {
                  ...first.session.analysisCache.humanState.reuseMetadata,
                  reusable: false,
                },
              }
            : undefined,
        },
      };

      const result = await runVNextConversationPipeline({
        session: tamperedSession,
        question: "조금 더 자세히 말해줘",
        input: {
          request: buildVerificationRequest("조금 더 자세히 말해줘"),
          gateway,
        },
      });

      return {
        passed:
          result.followUpType === "continuation"
          && !result.executionMetadata.reused.humanState
          && !result.executionMetadata.executedStages.includes("pipeline:cacheOnly")
          && result.executionMetadata.executedStages.includes("humanState:executed"),
        details: [
          `followUpType=${result.followUpType}`,
          `reusedHumanState=${result.executionMetadata.reused.humanState}`,
          `executedStages=${result.executionMetadata.executedStages.join(",")}`,
        ],
      };
    }),

    runCase("case-7-decision-frame-follow-up", async () => {
      const humanContext = buildVerificationHumanContext();
      const contextMetadata = buildEmptyContextMetadata();
      const investQuestion = "지금 투자하면 어떨까요?";
      const amountQuestion = "그럼 얼마정도가 적당할까요?";
      const trustQuestion = "그 사람 믿어도 돼?";

      const turn1 = {
        turnId: "turn-invest",
        question: investQuestion,
        questionMeaning: null,
        scenario: null,
        responseAction: null,
        response: {
          text: "mock",
          source: "direct" as const,
          validated: true,
          apiCallCount: 0,
          latencyMs: 0,
        },
        createdAt: new Date().toISOString(),
      };

      const amountResolution = resolveFollowUpQuestionType({
        newQuestion: amountQuestion,
        previousTurn: turn1,
        contextMetadata,
        humanContext,
      });

      const turn2 = {
        ...turn1,
        turnId: "turn-amount",
        question: amountQuestion,
      };

      const trustResolution = resolveFollowUpQuestionType({
        newQuestion: trustQuestion,
        previousTurn: turn2,
        contextMetadata,
        humanContext,
      });

      return {
        passed:
          amountResolution.type === "scenarioRefinement"
          && trustResolution.type === "newQuestion",
        details: [
          `amountFollowUpType=${amountResolution.type}`,
          `amountReason=${amountResolution.reason}`,
          `trustFollowUpType=${trustResolution.type}`,
          `trustReason=${trustResolution.reason}`,
        ],
      };
    }),

    runCase("case-8-counterpart-facts-reuse", async () => {
      const marriageQuestion = "이 여자랑 결혼해도 돼?";
      const counterpartQuestion =
        "상대방이 음력 1967년 4월 2일생 양띠 여성이야";
      const compatibilityQuestion = "난 궁합이 맞는지 알고싶어";

      const first = await runVNextConversationPipeline({
        question: marriageQuestion,
        input: {
          request: buildVerificationRequest(marriageQuestion),
          gateway,
        },
      });

      const second = await runVNextConversationPipeline({
        session: first.session,
        question: counterpartQuestion,
        input: {
          request: buildVerificationRequest(counterpartQuestion),
          gateway,
        },
      });

      const facts = second.session.contextMetadata.counterpartFacts;

      const third = await runVNextConversationPipeline({
        session: second.session,
        question: compatibilityQuestion,
        input: {
          request: buildVerificationRequest(compatibilityQuestion),
          gateway,
        },
      });

      return {
        passed:
          facts?.birthDate === "1967-04-02"
          && facts?.calendarType === "lunar"
          && facts?.gender === "female"
          && facts?.zodiac === "양띠"
          && third.response.source !== "clarification"
          && !third.session.contextMetadata.awaitingClarification
          && third.session.contextMetadata.pendingMissingContextKeys.length === 0,
        details: [
          `birthDate=${facts?.birthDate ?? "none"}`,
          `calendarType=${facts?.calendarType ?? "none"}`,
          `gender=${facts?.gender ?? "none"}`,
          `zodiac=${facts?.zodiac ?? "none"}`,
          `responseSource=${third.response.source}`,
          `awaitingClarification=${third.session.contextMetadata.awaitingClarification}`,
          `pendingMissingContextKeys=${third.session.contextMetadata.pendingMissingContextKeys.join(",") || "none"}`,
        ],
      };
    }),

    runCase("case-9-year-refinement-identity", async () => {
      const firstQuestion = "올해의 운세알려줘";
      const secondQuestion = "내년도 운세알려줘";

      const first = await runVNextConversationPipeline({
        question: firstQuestion,
        input: {
          request: buildVerificationRequest(firstQuestion),
          gateway,
        },
      });

      const referenceDateIso = "2026-10-01";
      const previousLifeFlowTarget = resolveLifeFlowTarget(
        firstQuestion,
        referenceDateIso,
      );
      const currentLifeFlowTarget = resolveLifeFlowTarget(
        secondQuestion,
        referenceDateIso,
      );
      const previousDerivedPeriodKey =
        previousLifeFlowTarget.targetYear !== null
          ? String(previousLifeFlowTarget.targetYear)
          : previousLifeFlowTarget.startDate;
      const currentDerivedPeriodKey =
        currentLifeFlowTarget.targetYear !== null
          ? String(currentLifeFlowTarget.targetYear)
          : currentLifeFlowTarget.startDate;

      const previousTimePeriodKey =
        first.session.analysisCache.timeState?.reuseMetadata.timePeriodKey
        ?? first.session.analysisCache.timeState?.value.targetPeriod.label
        ?? first.session.analysisCache.timeState?.value.targetPeriod.start
        ?? null;
      const previousAssessmentSourceTurnId =
        first.session.analysisCache.assessment?.sourceTurnId ?? null;
      const previousQuestionMeaningSourceTurnId =
        first.session.analysisCache.questionMeaning?.sourceTurnId ?? null;

      const result = await runVNextConversationPipeline({
        session: first.session,
        question: secondQuestion,
        input: {
          request: buildVerificationRequest(secondQuestion),
          gateway,
        },
      });

      const currentTimePeriodKey =
        result.session.analysisCache.timeState?.reuseMetadata.timePeriodKey
        ?? result.session.analysisCache.timeState?.value.targetPeriod.label
        ?? result.session.analysisCache.timeState?.value.targetPeriod.start
        ?? null;
      const currentAssessmentSourceTurnId =
        result.session.analysisCache.assessment?.sourceTurnId ?? null;
      const currentQuestionMeaningSourceTurnId =
        result.session.analysisCache.questionMeaning?.sourceTurnId ?? null;

      // year 운세 질문에서는 timeState 캐시가 비어 있을 수 있으므로,
      // 캐시 키가 둘 다 있을 때만 cache period 차이를 강제한다.
      const cachedTimePeriodKeysDifferWhenAvailable =
        previousTimePeriodKey === null
        || currentTimePeriodKey === null
        || previousTimePeriodKey !== currentTimePeriodKey;

      return {
        passed:
          result.followUpType !== "continuation"
          && !result.executionMetadata.executedStages.includes("pipeline:cacheOnly")
          && !result.executionMetadata.reused.timeState
          && !result.executionMetadata.reused.assessment
          && result.executionMetadata.executedStages.includes("timeState:executed")
          && result.executionMetadata.executedStages.includes("assessment:executed")
          && (
            result.executionMetadata.executedStages.includes("pipeline:partial")
            || result.executionMetadata.executedStages.includes("pipeline:full")
          )
          && result.reusePlan?.requiresNewQuestionAnalysis === true
          && result.reusePlan?.reuseTimeState === false
          && result.reusePlan?.reuseAssessment === false
          && previousDerivedPeriodKey !== currentDerivedPeriodKey
          && cachedTimePeriodKeysDifferWhenAvailable
          && result.turn.question === secondQuestion
          && currentAssessmentSourceTurnId === result.turn.turnId
          && previousAssessmentSourceTurnId !== null
          && previousAssessmentSourceTurnId !== currentAssessmentSourceTurnId
          && currentQuestionMeaningSourceTurnId === result.turn.turnId
          && previousQuestionMeaningSourceTurnId !== null
          && previousQuestionMeaningSourceTurnId !== currentQuestionMeaningSourceTurnId
          && result.session.turns.length === 2,
        details: [
          `followUpType=${result.followUpType}`,
          `reusedTimeState=${result.executionMetadata.reused.timeState}`,
          `reusedAssessment=${result.executionMetadata.reused.assessment}`,
          `executedStages=${result.executionMetadata.executedStages.join(",")}`,
          `previousDerivedPeriodKey=${previousDerivedPeriodKey}`,
          `currentDerivedPeriodKey=${currentDerivedPeriodKey}`,
          `previousTimePeriodKey=${previousTimePeriodKey ?? "none"}`,
          `currentTimePeriodKey=${currentTimePeriodKey ?? "none"}`,
          `turnQuestion=${result.turn.question}`,
          `previousAssessmentSourceTurnId=${previousAssessmentSourceTurnId ?? "none"}`,
          `assessmentSourceTurnId=${currentAssessmentSourceTurnId ?? "none"}`,
          `previousQuestionMeaningSourceTurnId=${previousQuestionMeaningSourceTurnId ?? "none"}`,
          `questionMeaningSourceTurnId=${currentQuestionMeaningSourceTurnId ?? "none"}`,
          `requiresNewQuestionAnalysis=${result.reusePlan?.requiresNewQuestionAnalysis ?? false}`,
        ],
      };
    }),

    runCase("case-10-month-refinement-identity", async () => {
      const firstQuestion = "10월에 사업을 시작해도 될까요?";
      const secondQuestion = "11월에는 어떨까요?";

      const first = await runVNextConversationPipeline({
        question: firstQuestion,
        input: {
          request: buildVerificationRequest(firstQuestion),
          gateway,
        },
      });

      const previousTimePeriodKey =
        first.session.analysisCache.timeState?.reuseMetadata.timePeriodKey
        ?? first.session.analysisCache.timeState?.value.targetPeriod.label
        ?? first.session.analysisCache.timeState?.value.targetPeriod.start
        ?? null;
      const previousAssessmentSourceTurnId =
        first.session.analysisCache.assessment?.sourceTurnId ?? null;

      const result = await runVNextConversationPipeline({
        session: first.session,
        question: secondQuestion,
        input: {
          request: buildVerificationRequest(secondQuestion),
          gateway,
        },
      });

      const currentTimePeriodKey =
        result.session.analysisCache.timeState?.reuseMetadata.timePeriodKey
        ?? result.session.analysisCache.timeState?.value.targetPeriod.label
        ?? result.session.analysisCache.timeState?.value.targetPeriod.start
        ?? null;
      const currentTimeStateLabel =
        result.session.analysisCache.timeState?.value.targetPeriod.label
        ?? null;
      const currentTimeStateStart =
        result.session.analysisCache.timeState?.value.targetPeriod.start
        ?? null;
      const currentAssessmentSourceTurnId =
        result.session.analysisCache.assessment?.sourceTurnId ?? null;
      const currentTimeStateSourceTurnId =
        result.session.analysisCache.timeState?.sourceTurnId ?? null;

      const novemberPeriodPreserved =
        (
          currentTimePeriodKey !== null
          && /(?:^|-)11(?:$|-)/.test(currentTimePeriodKey)
        )
        || (
          currentTimeStateLabel !== null
          && /(?:^|-)11(?:$|-)/.test(currentTimeStateLabel)
        )
        || (
          currentTimeStateStart !== null
          && /-11-/.test(currentTimeStateStart)
        );

      return {
        passed:
          result.followUpType === "timeRefinement"
          && result.executionMetadata.reused.timeState === false
          && result.executionMetadata.executedStages.includes("assessment:executed")
          && !result.executionMetadata.reused.assessment
          && !result.executionMetadata.executedStages.includes("pipeline:cacheOnly")
          && previousTimePeriodKey !== null
          && currentTimePeriodKey !== null
          && previousTimePeriodKey !== currentTimePeriodKey
          && novemberPeriodPreserved
          && currentTimeStateSourceTurnId === result.turn.turnId
          && currentAssessmentSourceTurnId === result.turn.turnId
          && previousAssessmentSourceTurnId !== currentAssessmentSourceTurnId
          && result.turn.question === secondQuestion
          && result.session.turns.length === 2,
        details: [
          `followUpType=${result.followUpType}`,
          `reusedTimeState=${result.executionMetadata.reused.timeState}`,
          `reusedAssessment=${result.executionMetadata.reused.assessment}`,
          `executedStages=${result.executionMetadata.executedStages.join(",")}`,
          `previousTimePeriodKey=${previousTimePeriodKey ?? "none"}`,
          `currentTimePeriodKey=${currentTimePeriodKey ?? "none"}`,
          `currentTimeStateLabel=${currentTimeStateLabel ?? "none"}`,
          `currentTimeStateStart=${currentTimeStateStart ?? "none"}`,
          `novemberPeriodPreserved=${novemberPeriodPreserved}`,
          `assessmentSourceTurnId=${currentAssessmentSourceTurnId ?? "none"}`,
          `previousAssessmentSourceTurnId=${previousAssessmentSourceTurnId ?? "none"}`,
        ],
      };
    }),

    runCase("case-11-counterpart-identity-mismatch", async () => {
      const firstQuestion =
        "이 여자랑 결혼해도 돼? 상대방이 음력 1967년 4월 2일생 양띠 여성이야";
      const secondQuestion =
        "조금 더 자세히 말해줘. 상대방이 음력 1970년 5월 1일생 양띠 여성이야";

      const first = await runVNextConversationPipeline({
        question: firstQuestion,
        input: {
          request: buildVerificationRequest(firstQuestion),
          gateway,
        },
      });

      const previousCounterpartFacts =
        first.session.contextMetadata.counterpartFacts;
      const previousAssessmentSourceTurnId =
        first.session.analysisCache.assessment?.sourceTurnId ?? null;

      const result = await runVNextConversationPipeline({
        session: first.session,
        question: secondQuestion,
        input: {
          request: buildVerificationRequest(secondQuestion),
          gateway,
        },
      });

      const currentCounterpartFacts = readQuestion(
        buildVerificationHumanContext(),
        secondQuestion,
      ).counterpartFacts;

      const previousIdentifiable =
        Boolean(previousCounterpartFacts?.birthDate)
        && Boolean(previousCounterpartFacts?.calendarType)
        && Boolean(previousCounterpartFacts?.gender);
      const currentIdentifiable =
        Boolean(currentCounterpartFacts.birthDate)
        && Boolean(currentCounterpartFacts.calendarType)
        && Boolean(currentCounterpartFacts.gender);
      const counterpartIdentityMismatch =
        previousIdentifiable
        && currentIdentifiable
        && (
          previousCounterpartFacts?.birthDate
            !== currentCounterpartFacts.birthDate
          || previousCounterpartFacts?.calendarType
            !== currentCounterpartFacts.calendarType
          || previousCounterpartFacts?.gender
            !== currentCounterpartFacts.gender
        );

      const currentAssessmentSourceTurnId =
        result.session.analysisCache.assessment?.sourceTurnId ?? null;

      return {
        passed:
          previousIdentifiable
          && Boolean(first.session.analysisCache.assessment)
          && first.executionMetadata.executedStages.includes("timeState:executed")
          && first.executionMetadata.executedStages.includes("assessment:executed")
          && previousCounterpartFacts?.birthDate === "1967-04-02"
          && currentCounterpartFacts.birthDate === "1970-05-01"
          && counterpartIdentityMismatch === true
          && result.followUpType === "continuation"
          && result.reusePlan?.reuseAssessment === true
          && result.executionMetadata.reused.timeState === false
          && result.executionMetadata.reused.assessment === false
          && result.executionMetadata.executedStages.includes("assessment:executed")
          && !result.executionMetadata.executedStages.includes("pipeline:cacheOnly")
          && (
            result.executionMetadata.executedStages.includes("pipeline:partial")
            || result.executionMetadata.executedStages.includes("pipeline:full")
          )
          && previousAssessmentSourceTurnId !== null
          && currentAssessmentSourceTurnId === result.turn.turnId
          && previousAssessmentSourceTurnId !== currentAssessmentSourceTurnId
          && result.session.turns.length === 2,
        details: [
          `previousBirthDate=${previousCounterpartFacts?.birthDate ?? "none"}`,
          `currentBirthDate=${currentCounterpartFacts.birthDate ?? "none"}`,
          `counterpartIdentityMismatch=${counterpartIdentityMismatch}`,
          `followUpType=${result.followUpType}`,
          `reusePlanReuseAssessment=${result.reusePlan?.reuseAssessment ?? false}`,
          `reusedTimeState=${result.executionMetadata.reused.timeState}`,
          `reusedAssessment=${result.executionMetadata.reused.assessment}`,
          `executedStages=${result.executionMetadata.executedStages.join(",")}`,
          `previousAssessmentSourceTurnId=${previousAssessmentSourceTurnId ?? "none"}`,
          `assessmentSourceTurnId=${currentAssessmentSourceTurnId ?? "none"}`,
        ],
      };
    }),
  ]);

  return {
    passed: cases.every((item) => item.passed),
    cases,
  };
}

export function serializeConversationPipelineVerificationResult(
  result: ConversationPipelineVerificationResult,
): string {
  return JSON.stringify(result, null, 2);
}
