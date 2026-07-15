import type {
    QuestionContext,
    QuestionCounterpartRelation,
  } from "./questionContext";
  import type {
    QuestionReaderResult,
  } from "./questionReader";
  
  function detectCounterpartRelation(
    question: string,
  ): QuestionCounterpartRelation {
    if (
      question.includes("남편") ||
      question.includes("아내") ||
      question.includes("배우자")
    ) {
      return "spouse";
    }
  
    if (
      question.includes("남자친구") ||
      question.includes("여자친구") ||
      question.includes("연인") ||
      question.includes("애인")
    ) {
      return "lover";
    }
  
    if (question.includes("친구")) {
      return "friend";
    }
  
    if (
      question.includes("아버지") ||
      question.includes("어머니") ||
      question.includes("부모")
    ) {
      return "parent";
    }
  
    if (
      question.includes("아들") ||
      question.includes("딸") ||
      question.includes("자식") ||
      question.includes("자녀")
    ) {
      return "child";
    }
  
    if (
      question.includes("형제") ||
      question.includes("누나") ||
      question.includes("언니") ||
      question.includes("오빠") ||
      question.includes("동생")
    ) {
      return "sibling";
    }
  
    if (
      question.includes("직장동료") ||
      question.includes("동료")
    ) {
      return "coworker";
    }
  
    if (
      question.includes("동업") ||
      question.includes("공동창업") ||
      question.includes("사업 파트너")
    ) {
      return "businessPartner";
    }
  
    if (
      question.includes("상대") ||
      question.includes("사람") ||
      question.includes("파트너")
    ) {
      return "other";
    }
  
    return "unknown";
  }

  function mapActionObjectType(
    topic: QuestionReaderResult["topic"],
  ): QuestionContext["actionObject"]["type"] {
    switch (topic) {
      case "business":
        return "business";
  
      case "job":
        return "job";
  
      case "money":
        return "investment";
  
      case "realEstate":
        return "realEstate";
  
      case "marriage":
        return "marriage";
  
      case "relationship":
      case "love":
      case "family":
        return "relationship";
  
      case "health":
        return "health";
  
      case "legal":
        return "legal";
  
      case "lifeFlow":
      case "lifeDirection":
        return "lifeDirection";
  
      case "general":
        return "unknown";
    }
  }
  
  export function buildQuestionContext(
    question:
      QuestionReaderResult,
  ): QuestionContext {
    const normalizedQuestion =
      question.normalizedQuestion;
  
    const relation =
      detectCounterpartRelation(
        normalizedQuestion,
      );
  
    const counterpartExists =
      relation !== "unknown" ||
      question.decisionTarget === "partner" ||
      question.decisionTarget === "marry" ||
      question.decisionTarget === "separate" ||
      question.decisionTarget === "reconcile";
  
    return {
      question,
  
      counterpart: {
        exists: counterpartExists,
        relation,
  
        identityProvided: false,
        birthDataProvided: false,
      },
  
      actionObject: {
        type:
          mapActionObjectType(
            question.topic,
          ),
      
        subtype: null,
        description: null,
      },
  
      comparisonTargets: [],
  
      requirements: {
        counterpartReadingRequired:
          counterpartExists,
  
        compatibilityAnalysisRequired:
          question.decisionTarget === "partner" ||
          question.decisionTarget === "marry",
  
        timingAnalysisRequired:
          question.intent === "timing" ||
          question.urgency !== "unknown",
  
        realityAssessmentRequired:
          question.topic === "business" ||
          question.topic === "money" ||
          question.topic === "job" ||
          question.topic === "realEstate" ||
          question.topic === "marriage",
  
        comparisonAnalysisRequired:
          question.intent === "comparison" ||
          question.intent === "selection",
      },
    };
  }