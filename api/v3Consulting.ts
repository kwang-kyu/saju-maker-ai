import { readHumanDestinyContext } from "../src/v3/readers/humanDestinyContextReader";
import { runConsulting } from "../src/v3/consulting/consultingRunner";
import { buildConsultingOpenAIRequest } from "../src/v3/consulting/openai/consultingOpenAIAdapter";

export async function buildV3ConsultingRequest(params: {
  masterReaderInput: Parameters<typeof readHumanDestinyContext>[0]["masterReaderInput"];
  lifePhaseInput: Parameters<typeof readHumanDestinyContext>[0]["lifePhaseInput"];
  question: string;
}) {
  const context = readHumanDestinyContext({
    masterReaderInput: params.masterReaderInput,
    lifePhaseInput: params.lifePhaseInput,
  });

  if (!context) {
    throw new Error("Failed to build Human Destiny Context.");
  }

  const prompt = runConsulting(
    context,
    params.question,
  );

  return buildConsultingOpenAIRequest(prompt);
}