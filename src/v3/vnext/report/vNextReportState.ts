/**
 * vNext Report UI 상태 계약.
 *
 * Question Mode ConsultingSessionState와 분리한다.
 */

import type {
  NaturalConsultingResponse,
} from "../gpt/responseGatewayTypes.js";
import type {
  ResponseStreamMetadata,
} from "../gpt/responseStreamingTypes.js";
import type {
  ReportAnswerSection,
} from "../types/answerBlueprint.js";
import type {
  ResponseActionType,
} from "../response/responseContext.js";

export type VNextReportPhase =
  | "idle"
  | "analyzing"
  | "generating"
  | "streaming"
  | "completed"
  | "error";

export type VNextReportSessionState = {
  phase: VNextReportPhase;
  sections: ReportAnswerSection[];
  activeSection: ReportAnswerSection | null;
  response: NaturalConsultingResponse | null;
  actionType: ResponseActionType | null;
  streamingText: string | null;
  errorMessage: string | null;
  streamMetadata: ResponseStreamMetadata | null;
};

export const INITIAL_VNEXT_REPORT_SESSION_STATE: VNextReportSessionState = {
  phase: "idle",
  sections: [],
  activeSection: null,
  response: null,
  actionType: null,
  streamingText: null,
  errorMessage: null,
  streamMetadata: null,
};

export function resolveReportLoadingLabel(
  phase: VNextReportPhase,
): string | null {
  if (phase === "analyzing") {
    return "사주 정보를 분석하고 있습니다.";
  }

  if (phase === "generating") {
    return "리포트를 작성하고 있습니다.";
  }

  return null;
}
