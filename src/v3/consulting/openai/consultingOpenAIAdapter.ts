import type { ConsultingPrompt } from "../explanation/consultingPromptBuilder.js";

export type ConsultingOpenAIRequest = {
  model: string;

  systemPrompt: string;

  userPrompt: string;
};

export function buildConsultingOpenAIRequest(
  prompt: ConsultingPrompt,
): ConsultingOpenAIRequest {
  return {
    model: "gpt-5.5",

    systemPrompt: prompt.systemPrompt,

    userPrompt: prompt.userPrompt,
  };
}