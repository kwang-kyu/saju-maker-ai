import OpenAI from "openai";

import type { ConsultingOpenAIRequest } from "./consultingOpenAIAdapter";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function requestConsultingAnswer(
  request: ConsultingOpenAIRequest,
): Promise<string> {
  const response = await client.responses.create({
    model: request.model,
    input: [
      {
        role: "system",
        content: request.systemPrompt,
      },
      {
        role: "user",
        content: request.userPrompt,
      },
    ],
  });

  return response.output_text ?? "";
}