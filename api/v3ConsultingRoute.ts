import type { VercelRequest, VercelResponse } from "@vercel/node";

import { buildV3ConsultingRequest } from "./v3Consulting";
import { requestConsultingAnswer } from "../src/v3/consulting/openai/consultingOpenAIClient";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    const request = await buildV3ConsultingRequest(req.body);

    const answer = await requestConsultingAnswer(request);

    return res.status(200).json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "v3 consulting failed.",
    });
  }
}