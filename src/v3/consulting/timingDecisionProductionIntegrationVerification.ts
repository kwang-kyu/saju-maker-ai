import {
    buildInitialConsultingExecution,
  } from "./initialConsultingExecutionBuilder";
  import {
    createSourceRequest,
  } from "./initialConsultingSessionBuilderVerification";
  import {
    runConsultingTurn,
  } from "./consultingRunner";
  
  export type TimingDecisionProductionIntegrationVerificationResult = {
    checks:
      Readonly<
        Record<
          string,
          boolean
        >
      >;
  
    passed:
      boolean;
  };
  
  const TIMING_CONDITION_KEYS =
    new Set([
      "timingFlowSupportive",
      "timingFlowTension",
      "timingFlowMixed",
      "timingFlowIndeterminate",
    ]);
  
  export function verifyTimingDecisionProductionIntegration():
    TimingDecisionProductionIntegrationVerificationResult {
    /*
     * 실제 v3 초기 실행 경로를 사용한다.
     *
     * 여기서 만들어진 동일한 사람의
     * SajuFacts / Reader Evidence /
     * Human Context / Life Context를
     * 세 종류의 질문에 공통으로 사용한다.
     */
    const sourceRequest =
      createSourceRequest();
  
    const initialExecution =
      buildInitialConsultingExecution(
        sourceRequest,
      );
  
    const humanDestinyPipeline =
      initialExecution
        .humanDestinyPipeline;
  
    const baseConsultingInput = {
      sajuFacts:
        humanDestinyPipeline
          .sajuFactsPipeline,
  
      readerEvidence:
        humanDestinyPipeline
          .evidenceBundle,
  
      humanContext:
        humanDestinyPipeline
          .humanContext,
  
      lifeContext:
        initialExecution
          .lifeContext,
    };
  
    /*
     * A.
     * 일반 의사결정 질문.
     *
     * 시기 분석을 강제로 요구해서는 안 된다.
     */
    const nonTimingTurn =
      runConsultingTurn({
        ...baseConsultingInput,
  
        question:
          "통닭집을 개업해도 될까요?",
      });
  
    /*
     * B.
     * 의사결정 + 명확한 시기 질문.
     *
     * 이 질문은 lifeFlow 해석 질문으로
     * 바뀌면 안 된다.
     *
     * business/start 의미를 유지한 상태에서
     * decisionTiming 목적의 실제 기간운만
     * Decision Engine에 공급되어야 한다.
     */
    const timingDecisionTurn =
      runConsultingTurn({
        ...baseConsultingInput,
  
        question:
          "내년에 사업을 시작해도 될까요?",
      });
  
    /*
     * C.
     * 순수 운 흐름 질문.
     *
     * 기존 lifeFlowInterpretation 경로가
     * decisionTiming 추가 때문에 깨지지 않았는지
     * 함께 검증한다.
     */
    const pureLifeFlowTurn =
      runConsultingTurn({
        ...baseConsultingInput,
  
        question:
          "내년 운세는 어떨까요?",
      });
  
    const timingConditions =
      timingDecisionTurn
        .decisionResult
        .conditions
        .filter(
          (condition) =>
            TIMING_CONDITION_KEYS.has(
              condition.key,
            ),
        );
  
    const missingTimingConditions =
      timingDecisionTurn
        .decisionResult
        .conditions
        .filter(
          (condition) =>
            condition.key
            === "completeTimingEvidence",
        );
  
    const checks = {
      /*
       * 일반 의사결정 질문은
       * Timing 분석을 강제로 타지 않는다.
       */
      nonTimingDecisionDoesNotRequireTiming:
        nonTimingTurn
          .questionContext
          .requirements
          .timingAnalysisRequired
        === false,
  
      /*
       * 시기 의사결정 질문은
       * QuestionContext 단계에서 Timing 요구가 잡힌다.
       */
      timingDecisionRequiresTimingAnalysis:
        timingDecisionTurn
          .questionContext
          .requirements
          .timingAnalysisRequired
        === true,
  
      /*
       * Timing 질문이라고 해서
       * business 질문이 lifeFlow 질문으로
       * 변질되면 안 된다.
       */
      timingDecisionPreservesBusinessTopic:
        timingDecisionTurn
          .questionReaderResult
          .topic
        === "business",
  
      timingDecisionPreservesStartTarget:
        timingDecisionTurn
          .questionReaderResult
          .decisionTarget
        === "start",
  
      /*
       * 의사결정 Timing 질문은
       * 순수 운세 해석 모드가 아니다.
       */
      timingDecisionDoesNotBecomePureLifeFlow:
        timingDecisionTurn
          .questionContext
          .requirements
          .lifeFlowInterpretationAnalysisRequired
        === false,
  
      /*
       * 실제 생산 경로에서 기간운이 생성되지 않았다면
       * TimingAssessment는 missing이 되고
       * completeTimingEvidence가 생긴다.
       *
       * 따라서 이 조건이 없다는 것은
       * ConsultingRunner → decisionTiming →
       * TargetPeriodLuckFlow →
       * TimingAssessment 연결이 완료됐다는 뜻이다.
       */
      productionRunnerProvidesRealTimingEvidence:
        missingTimingConditions.length
        === 0,
  
      /*
       * 실제 LifeFlow 해석 결과가
       * Timing Condition으로 변환되었는지 확인한다.
       */
      timingConditionIsProduced:
        timingConditions.length
        > 0,
  
      exactlyOneTimingConditionIsProduced:
        timingConditions.length
        === 1,
  
      /*
       * 과거의 timingType 고정 문구가 아니라
       * 실제 Flow 결과 기반 key를 사용해야 한다.
       */
      timingConditionUsesFlowAssessment:
        timingConditions.every(
          (condition) =>
            TIMING_CONDITION_KEYS.has(
              condition.key,
            ),
        ),
  
      timingConditionHasRealDescription:
        timingConditions.every(
          (condition) =>
            condition.description
              .trim()
              .length
            > 0,
        ),
  
      /*
       * supportive라면 satisfied=true,
       * tension/mixed/indeterminate라면 false라는
       * 현재 Timing Condition 계약을 확인한다.
       *
       * 특정 사주의 방향을 테스트가 강제로 정하지 않는다.
       */
      timingConditionSatisfactionMatchesDirection:
        timingConditions.every(
          (condition) => {
            if (
              condition.key
              === "timingFlowSupportive"
            ) {
              return condition.satisfied
                === true;
            }
  
            return condition.satisfied
              === false;
          },
        ),
  
      /*
       * 기존 pure lifeFlow 질문은
       * 여전히 lifeFlowInterpretation으로 라우팅되어야 한다.
       */
      pureLifeFlowRoutingIsPreserved:
        pureLifeFlowTurn
          .questionContext
          .requirements
          .lifeFlowInterpretationAnalysisRequired
        === true,
  
      pureLifeFlowDoesNotBecomeDecisionTiming:
        pureLifeFlowTurn
          .questionContext
          .requirements
          .timingAnalysisRequired
        === false,
  
      pureLifeFlowAssessmentStillExists:
        pureLifeFlowTurn
          .decisionResult
          .lifeFlowInterpretationAssessment
        != null,
  
      /*
       * 세 질문 모두 동일한 사람 자료를 사용한다.
       * 질문마다 다른 사주 fixture를 만들어 결과를
       * 맞추는 테스트가 아님을 보장한다.
       */
      sameHumanContextIsUsedAcrossRoutes:
        nonTimingTurn
          .groundingContext
          .humanIdentity
        === timingDecisionTurn
          .groundingContext
          .humanIdentity
        && timingDecisionTurn
          .groundingContext
          .humanIdentity
        === pureLifeFlowTurn
          .groundingContext
          .humanIdentity,
  
      /*
       * Timing 의사결정 결과도
       * 최종 Prompt까지 정상 전달되어야 한다.
       */
      timingDecisionReachesPrompt:
        timingDecisionTurn
          .prompt
          .userPrompt
          .includes(
            timingDecisionTurn
              .decisionResult
              .coreDecision,
          ),
  
      timingOriginalQuestionIsPreserved:
        timingDecisionTurn
          .prompt
          .userPrompt
          .includes(
            timingDecisionTurn
              .questionReaderResult
              .originalQuestion,
          ),
    };
  
    return {
      checks,
  
      passed:
        Object.values(
          checks,
        ).every(Boolean),
    };
  }