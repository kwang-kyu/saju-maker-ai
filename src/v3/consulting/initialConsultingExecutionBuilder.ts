import {
    buildHumanDestinyContextPipeline,
    type HumanDestinyContextPipelineResult,
  } from "../builders/humanDestinyContextPipelineBuilder";
  import {
    readHumanLifeContext,
  } from "../readers/humanLifeContextReader";
  
  import {
    runConsultingTurn,
    type ConsultingTurnRunResult,
  } from "./consultingRunner";
  import type {
    V3ConsultingRequest,
  } from "./v3ConsultingRequest";
  
  export type InitialConsultingExecutionResult = {
    humanDestinyPipeline:
      HumanDestinyContextPipelineResult;
  
    lifeContext:
      ReturnType<typeof readHumanLifeContext>;
  
    turnResult:
      ConsultingTurnRunResult;
  };
  
  function buildReferenceDate(
    referenceDateIso:
      string,
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
      Number.isNaN(
        referenceDate.getTime(),
      )
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
   * 최초 상담 요청을 천운문 v3의 전체 판단 경로로 실행한다.
   *
   * 출생 원천정보를 최초 한 번 계산하고,
   * Calculator → Fact → Evidence → Reader → Context를 거쳐
   * 질문을 Question Reader부터 Explanation까지 처리한다.
   *
   * GPT 요청이나 GPT 답변은 만들지 않으며,
   * 엔진이 생성한 구조화 결과를 그대로 반환한다.
   */
  export function buildInitialConsultingExecution(
    request:
      V3ConsultingRequest,
  ): InitialConsultingExecutionResult {
    const humanDestinyPipeline =
      buildHumanDestinyContextPipeline(
        request.sajuInput,
      );
  
    const lifeContext =
      readHumanLifeContext({
        ...request
          .humanLifeContextInput,
  
        birthDate:
          humanDestinyPipeline
            .sajuFactsPipeline
            .calculatedSaju
            .solarDateIso,
  
        referenceDate:
          buildReferenceDate(
            request
              .sajuInput
              .referenceDate,
          ),
      });
  
    const turnResult =
      runConsultingTurn({
        humanContext:
          humanDestinyPipeline
            .humanContext,
  
        lifeContext,
  
        question:
          request.question,
      });
  
    return {
      humanDestinyPipeline,
  
      lifeContext,
  
      turnResult,
    };
  }