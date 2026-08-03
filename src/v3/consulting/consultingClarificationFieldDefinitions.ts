export type ConsultingClarificationFieldDefinition = {
    key: string;

    label: string;

    required: boolean;
  };

  export type ConsultingClarificationCompletionPath = {
    key:
      string;

    label:
      string;

    requiredFieldKeys:
      readonly [
        string,
        ...string[],
      ];
  };

  export type ConsultingClarificationItemFieldDefinition = {
    itemKey:
      string;

    fields:
      [
        ConsultingClarificationFieldDefinition,
        ...ConsultingClarificationFieldDefinition[],
      ];

    /**
     * 값이 없으면 required 필드를 기본 완료 조건으로 사용한다.
     * 값이 있으면 여러 완료 경로 중 하나만 충족해도 완료한다.
     */
    completionPaths?:
      readonly [
        ConsultingClarificationCompletionPath,
        ...ConsultingClarificationCompletionPath[],
      ];
  };

  const DEFINITIONS:
    readonly ConsultingClarificationItemFieldDefinition[] = [
      {
        itemKey:
          "concreteDecisionTarget",

        fields: [
          {
            key:
              "decisionTarget",

            label:
              "실제로 결정하려는 행동 또는 선택",

            required:
              true,
          },
        ],
      },
      {
        itemKey:
          "comparisonTargets",

        fields: [
          {
            key:
              "firstTarget",

            label:
              "첫 번째 비교 대상",

            required:
              true,
          },
          {
            key:
              "secondTarget",

            label:
              "두 번째 비교 대상",

            required:
              true,
          },
        ],
      },
      {
        itemKey:
          "counterpartIdentity",

        fields: [
          {
            key:
              "relation",

            label:
              "상대방과의 관계",

            required:
              true,
          },
          {
            key:
              "currentStatus",

            label:
              "현재 관계 상태",

            required:
              true,
          },
          {
            key:
              "currentConflict",

            label:
              "현재 가장 고민되는 갈등",

            required:
              false,
          },
        ],
      },
      {
        itemKey:
          "counterpartBirthData",

        fields: [
          {
            key:
              "birthDate",

            label:
              "상대방 생년월일",

            required:
              false,
          },
          {
            key:
              "calendarType",

            label:
              "양력 또는 음력",

            required:
              false,
          },
          {
            key:
              "gender",

            label:
              "상대방 성별",

            required:
              false,
          },
          {
            key:
              "birthTime",

            label:
              "상대방 출생시간",

            required:
              false,
          },
          {
            key:
              "zodiacSign",

            label:
              "상대방의 띠",

            required:
              false,
          },
        ],

        completionPaths: [
          {
            key:
              "fullBirthData",

            label:
              "생년월일 기준 정식 궁합",

            requiredFieldKeys: [
              "birthDate",
              "calendarType",
              "gender",
            ],
          },
          {
            key:
              "zodiacOnly",

            label:
              "띠 기준 간이 궁합",

            requiredFieldKeys: [
              "zodiacSign",
            ],
          },
        ],
      },
      {
        itemKey:
          "decisionTiming",

        fields: [
          {
            key:
              "executionTiming",

            label:
              "결정 또는 실행 예정 시점",

            required:
              true,
          },
        ],
      },
      {
        itemKey:
          "debtRepaymentCapacity",

        fields: [
          {
            key:
              "loanBalance",

            label:
              "현재 대출 잔액",

            required:
              true,
          },
          {
            key:
              "monthlyRepayment",

            label:
              "월 상환액",

            required:
              true,
          },
          {
            key:
              "fixedMonthlyExpenses",

            label:
              "월 고정지출",

            required:
              true,
          },
          {
            key:
              "stableMonthlyIncome",

            label:
              "안정적인 월소득",

            required:
              true,
          },
        ],
      },
      {
        itemKey:
          "financialExecutionCapacity",

        fields: [
          {
            key:
              "selfFunds",

            label:
              "투입할 자기자금",

            required:
              true,
          },
          {
            key:
              "plannedDebt",

            label:
              "추가 대출 예정액",

            required:
              true,
          },
          {
            key:
              "reserveFunds",

            label:
              "반드시 남겨둘 비상자금",

            required:
              true,
          },
        ],
      },
      {
        itemKey:
          "essentialFundsBoundary",

        fields: [
          {
            key:
              "protectedFunds",

            label:
              "투입하지 않고 보호할 필수자금",

            required:
              true,
          },
          {
            key:
              "maximumLoss",

            label:
              "감당 가능한 최대 손실액",

            required:
              true,
          },
        ],
      },
      {
        itemKey:
          "liquiditySchedule",

        fields: [
          {
            key:
              "requiredLiquidityDate",

            label:
              "자금을 현금으로 확보해야 하는 시점",

            required:
              true,
          },
        ],
      },
      {
        itemKey:
          "assetAllocation",

        fields: [
          {
            key:
              "currentAssetShare",

            label:
              "현재 해당 자산의 비중",

            required:
              true,
          },
          {
            key:
              "expectedAssetShare",

            label:
              "실행 후 예상 자산 비중",

            required:
              true,
          },
        ],
      },
      {
        itemKey:
          "currentOccupation",

        fields: [
          {
            key:
              "employmentType",

            label:
              "현재 고용형태",

            required:
              true,
          },
          {
            key:
              "currentRole",

            label:
              "현재 담당 업무",

            required:
              true,
          },
          {
            key:
              "tenure",

            label:
              "현재 근속기간",

            required:
              true,
          },
          {
            key:
              "monthlyIncome",

            label:
              "현재 월소득",

            required:
              true,
          },
        ],
      },
      {
        itemKey:
          "jobTransitionPlan",

        fields: [
          {
            key:
              "incomeGapPeriod",

            label:
              "예상 소득 공백 기간",

            required:
              true,
          },
          {
            key:
              "livingFundsPeriod",

            label:
              "확보된 생활비의 유지 가능 기간",

            required:
              true,
          },
        ],
      },
      {
        itemKey:
          "currentRelationshipSituation",

        fields: [
          {
            key:
              "recentEvent",

            label:
              "최근 관계가 달라진 구체적인 사건",

            required:
              true,
          },
          {
            key:
              "counterpartPosition",

            label:
              "상대방의 현재 입장",

            required:
              true,
          },
          {
            key:
              "desiredOutcome",

            label:
              "본인이 원하는 관계의 결과",

            required:
              true,
          },
        ],
      },
      {
        itemKey:
          "currentHealthFacts",

        fields: [
          {
            key:
              "currentSymptoms",

            label:
              "현재 증상",

            required:
              true,
          },
          {
            key:
              "medicalFindings",

            label:
              "검사 또는 진단 결과",

            required:
              false,
          },
          {
            key:
              "currentTreatment",

            label:
              "현재 치료 상태",

            required:
              false,
          },
          {
            key:
              "dailyLimitations",

            label:
              "일상생활의 제한",

            required:
              false,
          },
        ],
      },
      {
        itemKey:
          "legalCaseStatus",

        fields: [
          {
            key:
              "caseStage",

            label:
              "현재 사건 단계",

            required:
              true,
          },
          {
            key:
              "counterpartDemand",

            label:
              "상대방의 요구",

            required:
              true,
          },
          {
            key:
              "availableDocuments",

            label:
              "보유한 계약서·문자·입금내역 등 자료",

            required:
              false,
          },
        ],
      },
      {
        itemKey:
          "desiredOutcome",

        fields: [
          {
            key:
              "realityToChange",

            label:
              "현재 바꾸고 싶은 현실",

            required:
              true,
          },
          {
            key:
              "consideredOptions",

            label:
              "현재 고려 중인 선택지",

            required:
              true,
          },
          {
            key:
              "desiredResult",

            label:
              "원하는 결과",

            required:
              true,
          },
        ],
      },
      {
        itemKey:
          "decisionDeadline",

        fields: [
          {
            key:
              "deadline",

            label:
              "실제 결정 마감일 또는 예정 시점",

            required:
              true,
          },
        ],
      },
    ];

  const DEFINITION_MAP =
    new Map(
      DEFINITIONS.map(
        (definition) => [
          definition.itemKey,
          definition,
        ],
      ),
    );

  export function getConsultingClarificationFieldDefinition(
    itemKey:
      string,
  ): ConsultingClarificationItemFieldDefinition {
    const definition =
      DEFINITION_MAP.get(
        itemKey,
      );

    if (!definition) {
      throw new Error(
        `Clarification field definition was not found: ${itemKey}`,
      );
    }

    return definition;
  }
