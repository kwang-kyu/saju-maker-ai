/**
 * NaturalConsultingResponse → UI 표시용 메시지 변환.
 *
 * UI는 source를 판단 기준으로 사용하지 않는다.
 */

import type {
  NaturalConsultingResponse,
} from "../gpt/responseGatewayTypes.js";
import type {
  ResponseActionType,
} from "../response/responseContext.js";
import {
  mapResponseSourceToMessageSource,
  type VNextConsultingMessage,
  type VNextConsultingTurn,
} from "./vNextConsultingState.js";

function createMessageId(
  prefix: string,
): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function mapUserQuestionToMessage(
  question: string,
): VNextConsultingMessage {
  return {
    id: createMessageId("user"),
    role: "user",
    text: question,
    source: "engine",
    createdAt: new Date().toISOString(),
    status: "complete",
  };
}

export function mapNaturalResponseToMessage(
  response: NaturalConsultingResponse,
): VNextConsultingMessage {
  return {
    id: createMessageId("assistant"),
    role: "assistant",
    text: response.text,
    source: mapResponseSourceToMessageSource(response.source),
    createdAt: new Date().toISOString(),
    status: "complete",
  };
}

export function buildConsultingTurn(
  question: string,
  actionType: ResponseActionType,
  response: NaturalConsultingResponse,
  turnId?: string,
): VNextConsultingTurn {
  return {
    id: turnId ?? createMessageId("turn"),
    question,
    actionType,
    response,
    messages: [
      mapUserQuestionToMessage(question),
      mapNaturalResponseToMessage(response),
    ],
    latencyMs: response.latencyMs,
  };
}
