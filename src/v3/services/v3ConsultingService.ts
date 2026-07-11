import type { HumanLifePhaseReaderInput } from "../masterReader/types/humanLifePhaseEvidence";
import type { MasterReaderInput } from "../masterReader/types/masterReaderInput";

export type V3ConsultingRequest = {
  masterReaderInput: MasterReaderInput;
  lifePhaseInput: HumanLifePhaseReaderInput;
  question: string;
};

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

export async function requestV3Consulting(
  input: V3ConsultingRequest,
): Promise<string> {
  const response = await fetch("/api/v3ConsultingRoute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  let result: V3ConsultingResponse;

  try {
    result = (await response.json()) as V3ConsultingResponse;
  } catch {
    throw new Error(
      "천운문 v3 상담 서버의 응답을 읽을 수 없습니다.",
    );
  }

  if (!response.ok || !result.success) {
    const message =
      "message" in result
        ? result.message
        : "천운문 v3 상담 요청에 실패했습니다.";

    throw new Error(message);
  }

  const answer = result.answer.trim();

  if (!answer) {
    throw new Error(
      "천운문 v3 상담 결과가 비어 있습니다.",
    );
  }

  return answer;
}