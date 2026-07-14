import { runConsulting } from "../src/v3/consulting/consultingRunner";
import { buildConsultingOpenAIRequest } from "../src/v3/consulting/openai/consultingOpenAIAdapter";
import { readHumanDestinyContext } from "../src/v3/readers/humanDestinyContextReader";
import { readHumanLifeContext } from "../src/v3/readers/humanLifeContextReader";

export async function buildV3ConsultingRequest(params: {
  masterReaderInput:
    Parameters<
      typeof readHumanDestinyContext
    >[0]["masterReaderInput"];

  lifePhaseInput:
    Parameters<
      typeof readHumanDestinyContext
    >[0]["lifePhaseInput"];

  humanLifeContextInput:
    Parameters<typeof readHumanLifeContext>[0];

  question: string;
}) {
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
      question: params.question,
    });

  return buildConsultingOpenAIRequest(
    prompt,
  );
}