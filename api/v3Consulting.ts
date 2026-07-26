import type {
  V3ConsultingRequest,
} from "../src/v3/consulting/v3ConsultingRequest";
import {
  runConsulting,
} from "../src/v3/consulting/consultingRunner";
import {
  buildConsultingOpenAIRequest,
} from "../src/v3/consulting/openai/consultingOpenAIAdapter";
import {
  readHumanDestinyContext,
} from "../src/v3/readers/humanDestinyContextReader";
import {
  readHumanLifeContext,
} from "../src/v3/readers/humanLifeContextReader";

export async function buildV3ConsultingRequest(
  params:
    V3ConsultingRequest,
) {
  const humanContext =
    readHumanDestinyContext({
      masterReaderInput:
        params.masterReaderInput,

      lifePhaseInput:
        params.lifePhaseInput,
    });

  if (!humanContext) {
    throw new Error(
      "Failed to build Human Destiny Context.",
    );
  }

  const lifeContext =
    readHumanLifeContext(
      params.humanLifeContextInput,
    );

  const prompt =
    runConsulting({
      humanContext,

      lifeContext,

      question:
        params.question,
    });

  return buildConsultingOpenAIRequest(
    prompt,
  );
}