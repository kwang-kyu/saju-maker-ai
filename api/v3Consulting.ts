import type {
  V3ConsultingRequest,
} from "../src/v3/consulting/v3ConsultingRequest";

import {
  buildHumanDestinyContextPipeline,
} from "../src/v3/builders/humanDestinyContextPipelineBuilder";

import {
  runConsulting,
} from "../src/v3/consulting/consultingRunner";

import {
  buildConsultingOpenAIRequest,
} from "../src/v3/consulting/openai/consultingOpenAIAdapter";

import {
  readHumanLifeContext,
} from "../src/v3/readers/humanLifeContextReader";

function buildReferenceDate(
  referenceDateIso: string,
): Date {
  const [
    year,
    month,
    day,
  ] = referenceDateIso
    .split("-")
    .map(Number);

  const referenceDate =
    new Date(
      year,
      month - 1,
      day,
    );

  if (
    Number.isNaN(referenceDate.getTime())
    || referenceDate.getFullYear()
      !== year
    || referenceDate.getMonth() + 1
      !== month
    || referenceDate.getDate()
      !== day
  ) {
    throw new Error(
      "referenceDate must use a valid YYYY-MM-DD format.",
    );
  }

  return referenceDate;
}

/**
 * 원천 생년월일시에서 사람을 먼저 읽은 뒤
 * 질문 판단과 GPT 설명 요청을 생성한다.
 *
 * 처리 순서:
 * Calculator
 * → Fact
 * → Evidence
 * → Master Reader
 * → Human Destiny Context
 * → Human Life Context
 * → Question Reader
 * → Decision Engine
 * → Explanation
 * → GPT Request
 */
export async function buildV3ConsultingRequest(
  params:
    V3ConsultingRequest,
) {
  const humanDestinyPipeline =
    buildHumanDestinyContextPipeline(
      params.sajuInput,
    );

  const humanContext =
    humanDestinyPipeline.humanContext;

  const lifeContext =
    readHumanLifeContext({
      ...params.humanLifeContextInput,

      birthDate:
        humanDestinyPipeline
          .sajuFactsPipeline
          .calculatedSaju
          .solarDateIso,

      referenceDate:
        buildReferenceDate(
          params.sajuInput
            .referenceDate,
        ),
    });

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
