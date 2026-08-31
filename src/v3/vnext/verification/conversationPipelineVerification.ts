/**
 * vNext Conversation Pipeline Verification — STEP 5C-4.
 */

import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  runVNextConversationPipeline,
} from "../conversation/conversationPipeline.js";
import type {
  ConversationSession,
} from "../conversation/conversationSession.js";
import {
  createMockResponseGateway,
} from "../gpt/responseGateway.js";

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
      const clarification = await runVNextConversationPipeline({
        question: "상대방과 궁합은 어떤가요?",
        input: {
          request: buildVerificationRequest("상대방과 궁합은 어떤가요?"),
          gateway,
        },
      });

      const originalQuestion =
        clarification.session.contextMetadata.originalQuestion;

      const result = await runVNextConversationPipeline({
        session: clarification.session,
        question: "유시입니다",
        input: {
          request: buildVerificationRequest("유시입니다"),
          gateway,
        },
      });

      return {
        passed:
          clarification.response.source === "clarification"
          && clarification.response.apiCallCount === 0
          && clarification.session.contextMetadata.awaitingClarification
          && result.followUpType === "clarificationAnswer"
          && originalQuestion !== null
          && result.session.contextMetadata.originalQuestion === originalQuestion
          && !result.session.contextMetadata.awaitingClarification
          && result.session.turns.length === 2,
        details: [
          `clarificationSource=${clarification.response.source}`,
          `followUpType=${result.followUpType}`,
          `originalQuestion=${result.session.contextMetadata.originalQuestion}`,
          `awaitingClarification=${result.session.contextMetadata.awaitingClarification}`,
          `executedStages=${result.executionMetadata.executedStages.join(",")}`,
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
