import type { BasicSajuResult } from "../../types/basic";
import { analyzeIntent } from "./intentAnalyzer";
import { buildAnswerPlan } from "./answerPlanner";
import { ConversationContext } from "./conversationContext";
import { runRequiredCores, type CoreRunResult } from "./coreRunner";
import {
  buildConsultingStrategy,
  type ConsultingStrategy,
} from "./consultingStrategy";
import {
  extractQuestionEntities,
  type QuestionEntityExtractionResult,
} from "./questionEntityExtractor";
import {
  buildOtherPersonSaju,
  type OtherPersonSajuBuildResult,
} from "./otherPersonSajuBuilder";
import {
  analyzeCompatibility,
} from "../compatibility/compatibilityEngine";
import type {
  CompatibilityMode,
  CompatibilityResult,
} from "../compatibility/compatibilityTypes";

export type ConsultingPipelineResult = {
  question: string;
  intent: string;
  requiredCores: string[];
  executedCores: CoreRunResult[];
  strategy: ConsultingStrategy;
  entities: QuestionEntityExtractionResult;
  otherPersonSaju: OtherPersonSajuBuildResult;
  compatibility?: CompatibilityResult;
  hasPreviousConversation: boolean;
  previousQuestion?: string;
  opening: string;
  answerFlow: string[];
  closing: string;
};

const conversationContext = new ConversationContext();

function detectCompatibilityMode(
  entities: QuestionEntityExtractionResult
): CompatibilityMode {
  const otherPerson = entities.persons.find(
    (person) => person.role !== "self"
  );

  if (!otherPerson) {
    return "general";
  }

  switch (otherPerson.role) {
    case "businessPartner":
      return "business";

    case "spouse":
      return "marriage";

    case "lover":
      return "love";

    case "family":
      return "family";

    case "employee":
      return "employee";

    default:
      return "general";
  }
}

function buildCompatibilityResult(params: {
  basic: BasicSajuResult;
  entities: QuestionEntityExtractionResult;
  otherPersonSaju: OtherPersonSajuBuildResult;
}): CompatibilityResult | undefined {
  const {
    basic,
    entities,
    otherPersonSaju,
  } = params;

  if (
    otherPersonSaju.status !== "calculated" ||
    !otherPersonSaju.basic
  ) {
    return undefined;
  }

  const mode = detectCompatibilityMode(entities);

  return analyzeCompatibility({
    selfBasic: basic,
    otherBasic: otherPersonSaju.basic,
    mode,
  });
}

export function runConsultingPipeline(
  question: string,
  basic: BasicSajuResult
): ConsultingPipelineResult {
  const entities = extractQuestionEntities(question);
  const otherPersonSaju = buildOtherPersonSaju(entities);

  const compatibility = buildCompatibilityResult({
    basic,
    entities,
    otherPersonSaju,
  });

  const intentAnalysis = analyzeIntent(question);

  const coreResult = runRequiredCores({
    basic,
    intentAnalysis,
  });

  const strategy = buildConsultingStrategy(intentAnalysis);
  const answerPlan = buildAnswerPlan(intentAnalysis);
  const lastTurn = conversationContext.getLastTurn();

  conversationContext.addTurn(
    intentAnalysis,
    answerPlan
  );

  return {
    question,
    intent: intentAnalysis.intent,
    requiredCores: intentAnalysis.requiredCores,
    executedCores: coreResult.executedCores,
    strategy,
    entities,
    otherPersonSaju,
    compatibility,
    hasPreviousConversation: Boolean(lastTurn),
    previousQuestion: lastTurn?.question,
    opening: answerPlan.opening,
    answerFlow: answerPlan.answerFlow,
    closing: answerPlan.closing,
  };
}

export function resetConsultingConversation(): void {
  conversationContext.clear();
}