import type {
  V3ConsultingRequest,
} from "../consulting/v3ConsultingRequest";

export type {
  V3ConsultingRequest,
} from "../consulting/v3ConsultingRequest";

type V3ConsultingSuccessResponse = {
  success: true;

  answer: string;
};

type V3ConsultingErrorResponse = {
  success: false;

  message: string;
};

type V3ConsultingResponse =
  | V3ConsultingSuccessResponse
  | V3ConsultingErrorResponse;

function isV3ConsultingResponse(
  value: unknown,
): value is V3ConsultingResponse {
  if (
    typeof value !== "object"
    || value === null
    || !("success" in value)
    || typeof value.success !== "boolean"
  ) {
    return false;
  }

  if (value.success) {
    return (
      "answer" in value
      && typeof value.answer === "string"
    );
  }

  return (
    "message" in value
    && typeof value.message === "string"
  );
}

export async function requestV3Consulting(
  input:
    V3ConsultingRequest,
): Promise<string> {
  const response =
    await fetch(
      "/api/v3ConsultingRoute",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            input,
          ),
      },
    );

  let responseBody:
    unknown;

  try {
    responseBody =
      await response.json();
  } catch {
    throw new Error(
      "천운문 v3 상담 서버의 응답을 읽을 수 없습니다.",
    );
  }

  if (
    !isV3ConsultingResponse(
      responseBody,
    )
  ) {
    throw new Error(
      "천운문 v3 상담 서버의 응답 형식이 올바르지 않습니다.",
    );
  }

  if (responseBody.success === false) {
    throw new Error(
      responseBody.message,
    );
  }

  if (!response.ok) {
    throw new Error(
      "천운문 v3 상담 요청에 실패했습니다.",
    );
  }

  const answer =
    responseBody.answer.trim();

  if (!answer) {
    throw new Error(
      "천운문 v3 상담 결과가 비어 있습니다.",
    );
  }

  return answer;
}