import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import {
  buildV3ConsultingRequest,
} from "./v3Consulting";
import {
  isV3ConsultingRequest,
} from "../src/v3/consulting/v3ConsultingRequest";
import {
  requestConsultingAnswer,
} from "../src/v3/consulting/openai/consultingOpenAIClient";

export default async function handler(
  req:
    VercelRequest,

  res:
    VercelResponse,
) {
  if (req.method !== "POST") {
    res.setHeader(
      "Allow",
      "POST",
    );

    return res.status(405).json({
      success: false,

      message:
        "천운문 v3 상담은 POST 요청만 허용합니다.",
    });
  }

  if (
    !isV3ConsultingRequest(
      req.body,
    )
  ) {
    return res.status(400).json({
      success: false,

      message:
        "천운문 v3 상담 요청 정보가 올바르지 않습니다.",
    });
  }

  try {
    const request =
      await buildV3ConsultingRequest(
        req.body,
      );

    const answer =
      await requestConsultingAnswer(
        request,
      );

    const normalizedAnswer =
      answer.trim();

    if (!normalizedAnswer) {
      throw new Error(
        "OpenAI consulting answer is empty.",
      );
    }

    return res.status(200).json({
      success: true,

      answer:
        normalizedAnswer,
    });
  } catch (error) {
    console.error(
      "v3 consulting failed:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "천운문 v3 상담 처리 중 오류가 발생했습니다.",
    });
  }
}