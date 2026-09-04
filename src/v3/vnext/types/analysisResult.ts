/**
 * vNext Analysis Result 계약.
 *
 * 파이프라인 각 단계 결과를 optional 또는 명확한 상태 타입으로 표현하여
 * 질문에 필요 없는 엔진이 무조건 실행되지 않도록 한다.
 */

import type {
  HumanState,
} from "./humanState.js";
import type {
  TimeState,
} from "./timeState.js";
import type {
  ChangeSignal,
} from "./changeSignal.js";
import type {
  QuestionMeaning,
} from "./questionMeaning.js";
import type {
  ConsultingScenario,
} from "./consultingScenario.js";
import type {
  Assessment,
} from "./assessment.js";
import type {
  AnswerBlueprint,
} from "./answerBlueprint.js";
import type {
  QuestionSpecificMaterialSelection,
} from "../adapters/questionSpecificMaterialAdapter.js";

/** 파이프라인 단계 실행 상태 */
export type PipelineStageStatus =
  | "pending"
  | "skipped"
  | "ready"
  | "failed";

export type PipelineStageResult<T> =
  | {
      status: "pending";
    }
  | {
      status: "skipped";
      reason: string;
    }
  | {
      status: "ready";
      value: T;
    }
  | {
      status: "failed";
      reason: string;
    };

/**
 * vNext Analysis Result.
 *
 * 각 필드는 optional이며, 제공될 때 PipelineStageResult로 상태를 명시한다.
 */
export type AnalysisResult = {
  humanState?: PipelineStageResult<HumanState>;
  timeState?: PipelineStageResult<TimeState>;
  changeSignals?: PipelineStageResult<ChangeSignal[]>;
  questionMeaning?: PipelineStageResult<QuestionMeaning>;
  consultingScenario?: PipelineStageResult<ConsultingScenario>;
  assessment?: PipelineStageResult<Assessment>;
  questionSpecificMaterials?: PipelineStageResult<
    QuestionSpecificMaterialSelection
  >;
  answerBlueprint?: PipelineStageResult<AnswerBlueprint>;
};
