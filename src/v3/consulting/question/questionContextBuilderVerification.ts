import type {
    HumanDestinyContext,
  } from "../../types/humanDestinyContext";
  import {
    buildQuestionContext,
  } from "./questionContextBuilder";
  import {
    readQuestion,
  } from "./questionReader";
  
  export type QuestionContextVerificationCase = {
    id: string;
    question: string;
  
    expected: {
      topic: ReturnType<
        typeof readQuestion
      >["topic"];
  
      decisionTarget: ReturnType<
        typeof readQuestion
      >["decisionTarget"];
  
      counterpartExists: boolean;
      compatibilityAnalysisRequired: boolean;
      timingAnalysisRequired: boolean;
      comparisonAnalysisRequired: boolean;
    };
  };
  
  export type QuestionContextVerificationResult = {
    id: string;
    question: string;
  
    actual: {
      topic: ReturnType<
        typeof readQuestion
      >["topic"];
  
      decisionTarget: ReturnType<
        typeof readQuestion
      >["decisionTarget"];
  
      counterpartExists: boolean;
      compatibilityAnalysisRequired: boolean;
      timingAnalysisRequired: boolean;
      comparisonAnalysisRequired: boolean;
    };
  
    expected:
      QuestionContextVerificationCase["expected"];
  
    passed: boolean;
  };
  
  const QUESTION_CONTEXT_VERIFICATION_CASES:
    readonly QuestionContextVerificationCase[] = [
    {
      id: "business-partner",
  
      question:
        "친구와 통닭집을 동업해도 될까요?",
  
      expected: {
        topic: "business",
        decisionTarget: "partner",
        counterpartExists: true,
        compatibilityAnalysisRequired: true,
        timingAnalysisRequired: false,
        comparisonAnalysisRequired: false,
      },
    },
    {
      id: "marriage-specific-person",
  
      question:
        "이 사람과 결혼해도 될까요?",
  
      expected: {
        topic: "marriage",
        decisionTarget: "marry",
        counterpartExists: true,
        compatibilityAnalysisRequired: true,
        timingAnalysisRequired: false,
        comparisonAnalysisRequired: false,
      },
    },
    {
      id: "job-change-timing",
  
      question:
        "올해 직장을 옮겨도 될까요?",
  
      expected: {
        topic: "job",
        decisionTarget: "changeJob",
        counterpartExists: false,
        compatibilityAnalysisRequired: false,
        timingAnalysisRequired: true,
        comparisonAnalysisRequired: false,
      },
    },
    {
      id: "investment-comparison",
  
      question:
        "아파트와 주식 둘 중 어디에 투자해야 할까요?",
  
      expected: {
        topic: "realEstate",
        decisionTarget: "invest",
        counterpartExists: false,
        compatibilityAnalysisRequired: false,
        timingAnalysisRequired: false,
        comparisonAnalysisRequired: true,
      },
    },
  ];
  
  export function verifyQuestionContextBuilder(
    humanContext: HumanDestinyContext,
  ): QuestionContextVerificationResult[] {
    return QUESTION_CONTEXT_VERIFICATION_CASES.map(
      (verificationCase) => {
        const question =
          readQuestion(
            humanContext,
            verificationCase.question,
          );
  
        const context =
          buildQuestionContext(
            question,
          );
  
        const actual = {
          topic:
            question.topic,
  
          decisionTarget:
            question.decisionTarget,
  
          counterpartExists:
            context.counterpart.exists,
  
          compatibilityAnalysisRequired:
            context.requirements
              .compatibilityAnalysisRequired,
  
          timingAnalysisRequired:
            context.requirements
              .timingAnalysisRequired,
  
          comparisonAnalysisRequired:
            context.requirements
              .comparisonAnalysisRequired,
        };
  
        return {
          id:
            verificationCase.id,
  
          question:
            verificationCase.question,
  
          actual,
  
          expected:
            verificationCase.expected,
  
          passed:
            JSON.stringify(actual) ===
            JSON.stringify(
              verificationCase.expected,
            ),
        };
      },
    );
  }