import type {
    HumanLifeContext,
  } from "../types/humanLifeContext";

  import type {
    ConsultingClarificationRequest,
  } from "./consultingSession";
  import type {
    DecisionResult,
  } from "./decision/decisionTypes";
  import type {
    QuestionContext,
    QuestionRealitySignal,
  } from "./question/questionContext";

  export type ConsultingClarificationBuilderInput = {
    decisionTurnId:
      string;

    lifeContext:
      HumanLifeContext;

    questionContext:
      QuestionContext;

    decisionResult:
      DecisionResult;
  };

  type MissingInformationItem = {
    key:
      string;

    description:
      string;

    question:
      string;
  };

  function hasRealitySignal(
    questionContext:
      QuestionContext,
    signal:
      QuestionRealitySignal,
  ): boolean {
    return questionContext
      .reality
      .constraints
      .some(
        (constraint) =>
          constraint.signal
          === signal,
      );
  }

  function buildNonEmptyTuple<T>(
    values:
      T[],
    errorMessage:
      string,
  ): [T, ...T[]] {
    const [
      first,
      ...rest
    ] = values;

    if (
      first
      === undefined
    ) {
      throw new Error(
        errorMessage,
      );
    }

    return [
      first,
      ...rest,
    ];
  }

  /**
   * insufficientEvidence 판정에서 실제로 부족한 현실 정보를 찾아
   * 사용자가 답할 수 있는 구체적인 추가 질문을 만든다.
   *
   * 이미 확인된 질문 현실과 현재 삶의 Context를 함께 사용하며,
   * 일반적인 상담 문구나 고정 질문으로 판단 부족을 감추지 않는다.
   */
  export function buildConsultingClarification(
    input:
      ConsultingClarificationBuilderInput,
  ): ConsultingClarificationRequest | null {
    if (
      input.decisionResult.verdict
      !== "insufficientEvidence"
    ) {
      return null;
    }

    if (
      input.decisionTurnId
        .trim()
        .length === 0
    ) {
      throw new Error(
        "decisionTurnId is required to build a clarification request.",
      );
    }

    const missingItems:
      MissingInformationItem[] = [];

    const registeredKeys =
      new Set<string>();

    const registerMissingInformation = (
      item:
        MissingInformationItem,
    ) => {
      if (
        registeredKeys.has(
          item.key,
        )
      ) {
        return;
      }

      registeredKeys.add(
        item.key,
      );

      missingItems.push(
        item,
      );
    };

    const question =
      input.questionContext.question;

    if (
      (
        question.decisionTarget
        === "none"
        || input.questionContext
          .actionObject
          .type
          === "unknown"
      )
      && question.analysisMode
        !== "interpretation"
    ) {
      registerMissingInformation({
        key:
          "concreteDecisionTarget",

        description:
          "실제로 결정하려는 행동이나 선택지가 구체적으로 확인되지 않았다.",

        question:
          "이번 상담에서 실제로 결정하려는 행동이나 선택지는 무엇인가요?",
      });
    }

    if (
      input.questionContext
        .requirements
        .lifeFlowInterpretationAnalysisRequired
      && input.decisionResult
        .lifeFlowInterpretationAssessment
        ?.target
        ?.ambiguity
        ?.needsClarification
    ) {
      registerMissingInformation({
        key:
          "lifeFlowTargetPeriod",

        description:
          "운세 해석에 필요한 대상 연도 또는 기간이 확인되지 않았다.",

        question:
          "어느 연도 또는 기간의 운을 보고 싶으신가요?",
      });
    }

    if (
      input.questionContext
        .requirements
        .comparisonAnalysisRequired
      && input.questionContext
        .comparisonTargets
        .length < 2
    ) {
      registerMissingInformation({
        key:
          "comparisonTargets",

        description:
          "비교 판단에 필요한 두 개 이상의 선택지가 확인되지 않았다.",

        question:
          "비교하려는 선택지를 각각 구체적으로 적어주세요.",
      });
    }

    if (
      input.questionContext
        .requirements
        .counterpartReadingRequired
      && !input.questionContext
        .counterpart
        .identityProvided
    ) {
      registerMissingInformation({
        key:
          "counterpartIdentity",

        description:
          "관계 판단의 상대방과 현재 관계 상태가 확인되지 않았다.",

        question:
          "상대방과의 관계, 현재 관계 상태, 지금 가장 고민되는 갈등은 무엇인가요?",
      });
    }

    if (
      input.questionContext
        .requirements
        .compatibilityAnalysisRequired
    ) {
      const counterpartFacts =
        question.counterpartFacts;

      const missingCounterpartFields:
        string[] = [];

      if (
        question.analysisScope
        === "zodiac"
      ) {
        if (
          !counterpartFacts.zodiac
        ) {
          missingCounterpartFields.push(
            "띠",
          );
        }
      } else {
        if (
          !counterpartFacts.birthDate
        ) {
          missingCounterpartFields.push(
            "생년월일",
          );
        }

        if (
          !counterpartFacts.calendarType
        ) {
          missingCounterpartFields.push(
            "양력·음력 여부",
          );
        }

        if (
          !counterpartFacts.gender
        ) {
          missingCounterpartFields.push(
            "성별",
          );
        }

        if (
          question.analysisScope
          === "fullSaju"
          && !counterpartFacts.birthTime
        ) {
          missingCounterpartFields.push(
            "출생시간",
          );
        }
      }

      if (
        missingCounterpartFields.length
        > 0
      ) {
        const missingFieldText =
          missingCounterpartFields.join(
            ", ",
          );

        registerMissingInformation({
          key:
            "counterpartBirthData",

          description:
            `궁합 판단에 필요한 상대방의 ${missingFieldText} 정보가 확인되지 않았다.`,

          question:
            `이미 알려주신 정보는 다시 적지 않아도 됩니다. 상대방의 ${missingFieldText}만 알려주세요.`,
        });
      }
    }

    if (
      input.questionContext
        .requirements
        .timingAnalysisRequired
      && question.timingType
        === "unknown"
    ) {
      registerMissingInformation({
        key:
          "decisionTiming",

        description:
          "판단하려는 실행 시점이나 기한이 확인되지 않았다.",

        question:
          "이 선택을 언제까지 결정하거나 실행해야 하나요?",
      });
    }

    switch (
      question.topic
    ) {
      case "business":
      case "money":
      case "realEstate": {
        if (
          hasRealitySignal(
            input.questionContext,
            "debtBurden",
          )
        ) {
          registerMissingInformation({
            key:
              "debtRepaymentCapacity",

            description:
              "대출 부담은 확인됐지만 잔액·월 상환액·상환 재원이 확인되지 않았다.",

            question:
              "현재 대출 잔액, 월 상환액, 월 고정지출과 안정적으로 들어오는 월소득은 각각 얼마인가요?",
          });
        } else {
          registerMissingInformation({
            key:
              "financialExecutionCapacity",

            description:
              "실행에 사용할 자기자금과 차입 범위가 확인되지 않았다.",

            question:
              "이번 선택에 투입할 자기자금, 추가 대출 예정액, 반드시 남겨둘 비상자금은 각각 얼마인가요?",
          });
        }

        if (
          hasRealitySignal(
            input.questionContext,
            "essentialFundsExposure",
          )
        ) {
          registerMissingInformation({
            key:
              "essentialFundsBoundary",

            description:
              "필수 생활자금이 노출됐지만 보호할 금액과 손실 한도가 확인되지 않았다.",

            question:
              "생활비·퇴직금·비상금 중 절대 투자하지 않고 보호해야 할 금액은 얼마인가요?",
          });
        }

        if (
          hasRealitySignal(
            input.questionContext,
            "liquidityConstraint",
          )
        ) {
          registerMissingInformation({
            key:
              "liquiditySchedule",

            description:
              "자금 회수 제약은 확인됐지만 필요한 현금화 시점이 확인되지 않았다.",

            question:
              "투입한 자금을 다시 현금으로 확보해야 하는 가장 늦은 시점은 언제인가요?",
          });
        }

        if (
          hasRealitySignal(
            input.questionContext,
            "assetConcentration",
          )
        ) {
          registerMissingInformation({
            key:
              "assetAllocation",

            description:
              "자산 집중 우려는 확인됐지만 현재 자산 구성과 투자 후 비중이 확인되지 않았다.",

            question:
              "현재 총자산에서 해당 자산이 차지하는 비중과 투자 후 예상 비중은 각각 몇 퍼센트인가요?",
          });
        }

        break;
      }

      case "job": {
        if (
          input.lifeContext
            .occupationStatus
          === "unknown"
        ) {
          registerMissingInformation({
            key:
              "currentOccupation",

            description:
              "현재 직업 상태가 확인되지 않았다.",

            question:
              "현재 고용형태, 담당 업무, 근속기간과 월소득을 알려주세요.",
          });
        }

        registerMissingInformation({
          key:
            "jobTransitionPlan",

          description:
            "직업 전환의 준비 수준과 소득 공백 대응 계획이 확인되지 않았다.",

          question:
            "이직·퇴사 후 예상되는 소득 공백 기간과 현재 확보한 생활비는 몇 개월분인가요?",
        });

        break;
      }

      case "relationship":
      case "love":
      case "marriage":
      case "family": {
        registerMissingInformation({
          key:
            "currentRelationshipSituation",

          description:
            "현재 관계에서 실제로 발생한 사건과 상대방의 입장이 충분히 확인되지 않았다.",

          question:
            "최근 관계가 달라진 구체적인 사건, 상대방의 현재 입장, 본인이 원하는 결과를 알려주세요.",
        });

        break;
      }

      case "health": {
        registerMissingInformation({
          key:
            "currentHealthFacts",

          description:
            "현재 증상·검사·진단·치료 상태가 확인되지 않았다.",

          question:
            "현재 증상, 의료기관에서 받은 검사나 진단, 진행 중인 치료와 일상생활의 제한을 알려주세요.",
        });

        break;
      }

      case "legal": {
        registerMissingInformation({
          key:
            "legalCaseStatus",

          description:
            "법적 판단에 필요한 사건 단계와 객관적 자료가 확인되지 않았다.",

          question:
            "현재 사건 단계, 상대방의 요구, 보유한 계약서·문자·입금내역 등 핵심 자료를 알려주세요.",
        });

        break;
      }

      case "lifeFlow":
      case "lifeDirection": {
        if (
          input.questionContext
            .requirements
            .lifeFlowInterpretationAnalysisRequired
        ) {
          break;
        }

        registerMissingInformation({
          key:
            "desiredOutcome",

          description:
            "현재 바꾸려는 현실과 원하는 결과가 구체적으로 확인되지 않았다.",

          question:
            "지금 가장 바꾸고 싶은 현실, 고려 중인 선택지, 원하는 결과를 각각 알려주세요.",
        });

        break;
      }

      case "general": {
        registerMissingInformation({
          key:
            "desiredOutcome",

          description:
            "현재 바꾸려는 현실과 원하는 결과가 구체적으로 확인되지 않았다.",

          question:
            "지금 가장 바꾸고 싶은 현실, 고려 중인 선택지, 원하는 결과를 각각 알려주세요.",
        });

        break;
      }
    }

    if (
      input.questionContext
        .requirements
        .lifeFlowInterpretationAnalysisRequired
      && question.analysisMode
        === "interpretation"
    ) {
      // interpretation 운세 질문은 decisionDeadline clarification을 요구하지 않는다.
    } else if (
      question.urgency
      === "unknown"
    ) {
      registerMissingInformation({
        key:
          "decisionDeadline",

        description:
          "결정을 내려야 하는 현실적인 기한이 확인되지 않았다.",

        question:
          "이 결정을 내려야 하는 실제 마감 시점이나 예정일이 있나요?",
      });
    }

    const items =
    buildNonEmptyTuple(
      missingItems,
      "Insufficient evidence was returned, but no clarification item was built.",
    );

  return {
    decisionTurnId:
      input.decisionTurnId,

    items,
  };
}
