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

      analysisMode?: ReturnType<
      typeof readQuestion
    >["analysisMode"];

    analysisScope?: ReturnType<
      typeof readQuestion
    >["analysisScope"];

    counterpartFacts?: ReturnType<
      typeof readQuestion
    >["counterpartFacts"];

      counterpartExists: boolean;
      compatibilityAnalysisRequired: boolean;
      timingAnalysisRequired: boolean;
      comparisonAnalysisRequired: boolean;
      roleRecommendationAnalysisRequired?: boolean;
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

      analysisMode?: ReturnType<
      typeof readQuestion
    >["analysisMode"];

    analysisScope?: ReturnType<
      typeof readQuestion
    >["analysisScope"];

    counterpartFacts?: ReturnType<
      typeof readQuestion
    >["counterpartFacts"];

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

    {
        id: "real-estate-partner-investment",

        question:
          "친구와 상가를 공동 투자해도 될까요?",

        expected: {
          topic: "realEstate",
          decisionTarget: "invest",
          counterpartExists: true,
          compatibilityAnalysisRequired: false,
          timingAnalysisRequired: false,
          comparisonAnalysisRequired: false,
        },
      },
      {
        id: "spouse-business-partner",

        question:
          "배우자와 같이 사업해도 될까요?",

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
        id: "remarriage-specific-person",

        question:
          "이 사람과 재혼해도 될까요?",

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
        id: "divorce-decision",

        question:
          "배우자와 이혼하는 것이 맞을까요?",

        expected: {
          topic: "marriage",
          decisionTarget: "separate",
          counterpartExists: true,
          compatibilityAnalysisRequired: false,
          timingAnalysisRequired: false,
          comparisonAnalysisRequired: false,
        },
      },
      {
        id:
          "chicken-shop-opening",

        question:
          "통닭집을 개업해도 될까요?",

        expected: {
          topic:
            "business",

          decisionTarget:
            "start",

          counterpartExists:
            false,

          compatibilityAnalysisRequired:
            false,

          timingAnalysisRequired:
            false,

          comparisonAnalysisRequired:
            false,
        },
      },
      {
        id:
          "theater-role-selection",

        question:
          "연극을 한다면 어떤 역할이 좋을까요?",

        expected: {
          topic:
            "job",

          decisionTarget:
            "none",

          analysisMode:
            "interpretation",

          counterpartExists:
            false,

          compatibilityAnalysisRequired:
            false,

          timingAnalysisRequired:
            false,

          comparisonAnalysisRequired:
            false,

          roleRecommendationAnalysisRequired:
            true,
        },
      },
      {
        id:
          "youtube-production-partner",

        question:
          "유튜브 영상 제작을 이 사람과 같이 해도 맞을까요?",

        expected: {
          topic:
            "job",

          decisionTarget:
            "partner",

          counterpartExists:
            true,

          compatibilityAnalysisRequired:
            true,

          timingAnalysisRequired:
            false,

          comparisonAnalysisRequired:
            false,
        },
      },
      {
        id:
          "business-partner-evaluation-with-birth-date",

          question:
          "1967년 4월 10일 양띠 여성과 동업은 어떨까요?",

        expected: {
          topic:
            "business",

          decisionTarget:
            "partner",

            analysisMode:
            "compatibility",

          analysisScope:
            "birthDate",

          counterpartFacts: {
            birthDate:
              "1967-04-10",

            birthTime:
              null,

            calendarType:
              null,

            gender:
              "female",

            zodiac:
              "양띠",

            relationship:
              null,

            evidence: [
              "1967년 4월 10일",
              "양띠",
              "여성",
            ],
          },

          counterpartExists:
            true,

          compatibilityAnalysisRequired:
            true,

          timingAnalysisRequired:
            false,

          comparisonAnalysisRequired:
            false,
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

            ...(
              verificationCase
                .expected
                .analysisMode
              !== undefined
                ? {
                    analysisMode:
                      question.analysisMode,
                  }
                : {}
            ),

            ...(
              verificationCase
                .expected
                .analysisScope
              !== undefined
                ? {
                    analysisScope:
                      question.analysisScope,
                  }
                : {}
            ),

            ...(
              verificationCase
                .expected
                .counterpartFacts
              !== undefined
                ? {
                    counterpartFacts:
                      question.counterpartFacts,
                  }
                : {}
            ),

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

          ...(
            verificationCase
              .expected
              .roleRecommendationAnalysisRequired
            !== undefined
              ? {
                  roleRecommendationAnalysisRequired:
                    context
                      .requirements
                      .roleRecommendationAnalysisRequired,
                }
              : {}
          ),
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
