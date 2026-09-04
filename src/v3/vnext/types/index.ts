/**
 * vNext 공통 Type 계약 — barrel export.
 */

export type {
  HumanStateDomain,
  VNextEvidenceItem,
  VNextEvidence,
  HumanStateSummary,
  HumanStateIdentity,
  HumanStateLifePhase,
  HumanState,
} from "./humanState.js";

export type {
  TimeGranularity,
  LuckFlowSnapshot,
  TimePeriodRef,
  TimeSegment,
  TimeSegmentRef,
  JieQiBoundary,
  TimeState,
} from "./timeState.js";

export type {
  ChangeSignalType,
  ChangeDirection,
  ChangeSignalStrength,
  AnalysisSourceType,
  ChangeSignalSource,
  ChangeSignal,
} from "./changeSignal.js";

export type {
  QuestionDomain,
  QuestionMeaningIntent,
  QuestionTimeFocus,
  QuestionObject,
  MissingContextItem,
  QuestionMeaning,
} from "./questionMeaning.js";

export type {
  ConsultingScenarioType,
  ConsultingScenario,
} from "./consultingScenario.js";

export type {
  AssessmentConfidence,
  AssessmentPossibility,
  AssessmentDirection,
  AssessmentCondition,
  AssessmentRisk,
  ChangeIntensity,
  TimeDifference,
  Assessment,
} from "./assessment.js";

export type {
  AnswerMode,
  QuestionAnswerBlock,
  QuestionAnswerBlueprint,
  AptitudeRecommendationBlock,
  GeneralFlowBlock,
  ActionDecisionBlock,
  RelationshipAssessmentBlock,
  PossibilityCheckBlock,
  InterpretationBlock,
  TimingAssessmentBlock,
  ScenarioAnswerBlock,
  ScenarioAnswerBlueprint,
  ReportAnswerSection,
  ReportAnswerBlueprint,
  AnswerBlueprint,
} from "./answerBlueprint.js";

export type {
  HumanInput,
  TargetPeriodRequest,
  AnalysisRequest,
} from "./analysisRequest.js";

export type {
  PipelineStageStatus,
  PipelineStageResult,
  AnalysisResult,
} from "./analysisResult.js";

export type {
  QuestionSpecificMaterialSelection,
} from "../adapters/questionSpecificMaterialAdapter.js";

export type {
  ResponseBlockContext,
  ResponseContext,
  ResponseActionType,
  ResponseAction,
  ResponsePipelineResult,
} from "../response/responseContext.js";

export type {
  ConversationStyle,
  PromptBudgetLevel,
  PromptStrategy,
  PromptSection,
  ResponsePrompt,
} from "./responsePrompt.js";

export type {
  ResponseGenerationStatus,
  ResponseGenerationUsage,
  ResponseGenerationError,
  ResponseGenerationOptions,
  ResponseGenerationResult,
  NaturalConsultingResponseSource,
  NaturalConsultingResponse,
  ResponseGatewayCallRecord,
} from "../gpt/responseGatewayTypes.js";

export type {
  ResponseStreamChunk,
  ResponseStreamHandler,
  ResponseStreamingOptions,
} from "../gpt/responseStreamingTypes.js";

export type {
  ResponseValidationIssue,
  ResponseValidationResult,
  ResponseValidatorInput,
} from "../gpt/responseValidator.js";
