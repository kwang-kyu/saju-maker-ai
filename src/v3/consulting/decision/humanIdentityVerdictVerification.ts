import type {
    HumanDestinyContext,
  } from "../../types/humanDestinyContext.js";
  
  import type {
    HumanLifeContext,
  } from "../../types/humanLifeContext.js";
  
  import {
    readQuestion,
  } from "../question/questionReader.js";
  
  import {
    buildQuestionContext,
  } from "../question/questionContextBuilder.js";
  
  import {
    runDecisionEngine,
  } from "./decisionEngine.js";
  
  import type {
    DecisionResult,
  } from "./decisionTypes.js";
  
  export type HumanIdentityVerdictVerificationResult = {
    question: string;
  
    actionIdentityResult: DecisionResult;
    cautionIdentityResult: DecisionResult;
  
    lifeDriverChanged: boolean;
    survivalStyleChanged: boolean;
    repeatedPatternChanged: boolean;
  
    alignmentStayedSame: boolean;
    readinessStayedSame: boolean;
    verdictChanged: boolean;
  
    passed: boolean;
  };
  
  /**
   * Decision Engine Human Identity 통합 민감도 검증
   *
   * 동일한 현재 국면과 동일한 질문을 유지한 상태에서
   * Human Identity의 세 축인
   * Life Driver, Survival Style, Repeated Pattern을 변경하여
   * 최종 Verdict가 실제로 달라지는지 확인한다.
   *
   * Context Alignment와 Action Readiness는 동일해야 하며,
   * Verdict 변화는 Human Identity 조합에서 발생해야 한다.
   */
  export function verifyHumanIdentityVerdictSensitivity(
    baseContext: HumanDestinyContext,
    lifeContext: HumanLifeContext,
    questionText = "지금 사업을 시작해도 될까요?",
  ): HumanIdentityVerdictVerificationResult {
    const growthContext: HumanDestinyContext = {
      ...baseContext,
      currentPhase: {
        ...baseContext.currentPhase,
        phase: "growth",
        title: "성장 국면",
        description:
          "현재는 활동 범위를 넓히고 새로운 기회를 실행으로 연결해야 하는 국면이다.",
      },
    };
  
    const actionIdentityContext: HumanDestinyContext = {
      ...growthContext,
      identity: {
        ...growthContext.identity,
        profile: {
          ...growthContext.identity.profile,
  
          lifeDriver: {
            ...growthContext.identity.profile.lifeDriver,
            primary: {
              ...growthContext.identity.profile.lifeDriver.primary,
              driver: "achievement",
              confidence: "high",
            },
          },
  
          survivalStyle: {
            ...growthContext.identity.profile.survivalStyle,
            primary: {
              ...growthContext.identity.profile.survivalStyle.primary,
              style: "push",
              confidence: "high",
            },
          },
  
          repeatedPattern: {
            ...growthContext.identity.profile.repeatedPattern,
            primary: {
              ...growthContext.identity.profile.repeatedPattern.primary,
              pattern: "opportunityMiss",
              confidence: "high",
            },
            secondary: null,
            repeatedBehaviors: [
              "충분히 검토한 이후에도 실행 결정을 미루는 경향이 반복된다.",
            ],
            strengths: [
              "실행 전에 위험과 조건을 신중하게 살핀다.",
            ],
            risks: [
              "판단을 오래 미루면 적절한 실행 시기를 놓칠 수 있다.",
            ],
          },
        },
      },
    };
  
    const cautionIdentityContext: HumanDestinyContext = {
      ...growthContext,
      identity: {
        ...growthContext.identity,
        profile: {
          ...growthContext.identity.profile,
  
          lifeDriver: {
            ...growthContext.identity.profile.lifeDriver,
            primary: {
              ...growthContext.identity.profile.lifeDriver.primary,
              driver: "stability",
              confidence: "high",
            },
          },
  
          survivalStyle: {
            ...growthContext.identity.profile.survivalStyle,
            primary: {
              ...growthContext.identity.profile.survivalStyle.primary,
              style: "stability",
              confidence: "high",
            },
          },
  
          repeatedPattern: {
            ...growthContext.identity.profile.repeatedPattern,
            primary: {
              ...growthContext.identity.profile.repeatedPattern.primary,
              pattern: "earlySuccessCollapse",
              confidence: "high",
            },
            secondary: null,
            repeatedBehaviors: [
              "초기 성과가 생기면 장기 검증 전에 확장을 서두른다.",
            ],
            strengths: [
              "기회를 빠르게 실행하고 초기 성과를 만드는 힘이 있다.",
            ],
            risks: [
              "초기 성과를 장기적인 안정성으로 오인할 수 있다.",
              "확장 이후 비용과 책임이 감당 범위를 넘을 수 있다.",
            ],
          },
        },
      },
    };
  
    const actionIdentityQuestion = readQuestion(
      actionIdentityContext,
      questionText,
    );
  
    const cautionIdentityQuestion = readQuestion(
      cautionIdentityContext,
      questionText,
    );

    const actionIdentityQuestionContext =
    buildQuestionContext(
      actionIdentityQuestion,
    );

  const cautionIdentityQuestionContext =
    buildQuestionContext(
      cautionIdentityQuestion,
    );
  
    const actionIdentityResult = runDecisionEngine({
      humanContext: actionIdentityContext,
      lifeContext,
      question: actionIdentityQuestion,
      questionContext: actionIdentityQuestionContext,
    });
  
    const cautionIdentityResult = runDecisionEngine({
      humanContext: cautionIdentityContext,
      lifeContext,
      question: cautionIdentityQuestion,
      questionContext: cautionIdentityQuestionContext,
    });
  
    const lifeDriverChanged =
      actionIdentityContext.identity.profile.lifeDriver.primary
        .driver !==
      cautionIdentityContext.identity.profile.lifeDriver.primary
        .driver;
  
    const survivalStyleChanged =
      actionIdentityContext.identity.profile.survivalStyle.primary
        .style !==
      cautionIdentityContext.identity.profile.survivalStyle.primary
        .style;
  
    const repeatedPatternChanged =
      actionIdentityContext.identity.profile.repeatedPattern.primary
        .pattern !==
      cautionIdentityContext.identity.profile.repeatedPattern.primary
        .pattern;
  
    const alignmentStayedSame =
      actionIdentityResult.contextAlignment ===
      cautionIdentityResult.contextAlignment;
  
    const readinessStayedSame =
      actionIdentityResult.actionReadiness ===
      cautionIdentityResult.actionReadiness;
  
    const verdictChanged =
      actionIdentityResult.verdict !==
      cautionIdentityResult.verdict;
  
    const passed =
      lifeDriverChanged &&
      survivalStyleChanged &&
      repeatedPatternChanged &&
      alignmentStayedSame &&
      readinessStayedSame &&
      verdictChanged &&
      actionIdentityResult.verdict === "recommended" &&
      cautionIdentityResult.verdict === "wait";
  
    return {
      question: questionText,
  
      actionIdentityResult,
      cautionIdentityResult,
  
      lifeDriverChanged,
      survivalStyleChanged,
      repeatedPatternChanged,
  
      alignmentStayedSame,
      readinessStayedSame,
      verdictChanged,
  
      passed,
    };
  }