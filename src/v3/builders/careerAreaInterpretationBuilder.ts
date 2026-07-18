import type {
    CareerArea,
    CareerAreaInterpretation,
    CareerLevel,
  } from "../masterReader/types/career";
  import type {
    CareerAreaSelection,
  } from "../masterReader/readers/careerSelector";
  
  type CareerAreaDefinition = {
    corePattern: Record<CareerLevel, string>;
  
    strengthExpression:
      Record<CareerLevel, string>;
  
    limitationPattern:
      Record<CareerLevel, string>;
  
    defaultSuitableConditions: string[];
  
    defaultCautionConditions: string[];
  };
  
  const CAREER_AREA_DEFINITIONS: Record<
    CareerArea,
    CareerAreaDefinition
  > = {
    roleOrientation: {
      corePattern: {
        limited:
          "직업 역할의 중심 방향이 환경과 외부 요구에 따라 쉽게 흔들릴 수 있는 구조이다.",
  
        moderate:
          "역할과 책임의 기준이 명확할 때 자신의 직업 방향을 안정적으로 유지하는 구조이다.",
  
        strong:
          "자신이 맡아야 할 역할과 성과 방식의 중심 방향이 뚜렷한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "역할의 범위가 단순하고 기대 결과가 명확할수록 자기 기능을 안정적으로 수행한다.",
  
        moderate:
          "업무 목적과 책임이 정리되어 있을 때 자신의 역할 강점을 꾸준히 발휘한다.",
  
        strong:
          "새로운 환경에서도 자신이 맡아야 할 핵심 역할을 빠르게 파악하고 중심을 세운다.",
      },
  
      limitationPattern: {
        limited:
          "여러 역할을 동시에 요구받거나 기대 기준이 자주 바뀌면 직업 방향을 잃을 수 있다.",
  
        moderate:
          "권한과 책임이 일치하지 않으면 자신의 역할보다 주변 요구를 처리하는 데 힘을 소모할 수 있다.",
  
        strong:
          "한 역할에 대한 확신이 강해 다른 기능과 협업해야 할 때 유연성이 낮아질 수 있다.",
      },
  
      defaultSuitableConditions: [
        "역할과 기대 결과가 명확한 업무",
        "책임과 권한이 일치하는 환경",
        "핵심 역할에 집중할 수 있는 구조",
      ],
  
      defaultCautionConditions: [
        "서로 충돌하는 역할을 동시에 요구받는 경우",
        "직무의 목적과 평가 기준이 계속 바뀌는 경우",
        "자신의 역할 밖의 책임을 반복해서 떠맡는 경우",
      ],
    },
  
    workStyle: {
      corePattern: {
        limited:
          "업무량과 외부 요구가 커질수록 자신의 작업 순서와 판단 방식이 쉽게 흔들리는 구조이다.",
  
        moderate:
          "업무 기준과 우선순위가 정리되어 있을 때 일정한 방식으로 일을 완성하는 구조이다.",
  
        strong:
          "분석·실행·조율·관리 방식을 상황에 맞게 조직하여 결과를 완성하는 힘이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "한 번에 하나의 핵심 과제에 집중할 때 정확성과 실행력이 안정적으로 드러난다.",
  
        moderate:
          "업무 순서와 마감 기준이 명확할 때 꾸준한 실행력과 완성도가 나타난다.",
  
        strong:
          "복수의 업무 기능을 조합하고 우선순위를 조정하며 결과를 만들어낸다.",
      },
  
      limitationPattern: {
        limited:
          "긴급 업무와 역할 변경이 반복되면 집중력과 완성도가 빠르게 떨어질 수 있다.",
  
        moderate:
          "업무 기준이 불명확하거나 여러 방식이 충돌하면 실행 속도가 늦어질 수 있다.",
  
        strong:
          "여러 업무를 처리할 수 있다는 이유로 과제를 과도하게 받아들이면 마무리력이 약해질 수 있다.",
      },
  
      defaultSuitableConditions: [
        "업무 순서와 마감 기준이 명확한 환경",
        "집중과 점검 시간을 확보할 수 있는 구조",
        "업무 방식에 일정한 자율성이 주어지는 조건",
      ],
  
      defaultCautionConditions: [
        "우선순위 없이 긴급 업무가 반복되는 경우",
        "작업 방식과 평가 기준이 자주 변경되는 경우",
        "완료 전에 새로운 과제가 계속 추가되는 경우",
      ],
    },
  
    expertiseGrowth: {
      corePattern: {
        limited:
          "기술과 경험을 한 방향으로 축적하는 과정에서 환경 변화와 역할 이동의 영향을 크게 받는 구조이다.",
  
        moderate:
          "학습 방향과 활용 목적이 명확할 때 전문성을 단계적으로 축적하는 구조이다.",
  
        strong:
          "지식·기술·경험을 장기간 축적하여 자신만의 전문영역을 형성하는 힘이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "학습 범위가 구체적이고 즉시 활용할 수 있을 때 기술 습득력이 안정적으로 드러난다.",
  
        moderate:
          "학습과 실무가 연결될 때 경험을 전문성으로 발전시키는 힘이 나타난다.",
  
        strong:
          "반복된 학습과 실무 경험을 체계화하여 대체하기 어려운 전문성을 만든다.",
      },
  
      limitationPattern: {
        limited:
          "학습 분야가 자주 바뀌거나 실무 적용 없이 정보만 늘어나면 전문성이 분산될 수 있다.",
  
        moderate:
          "성과 확인 없이 준비 기간만 길어지면 전문성의 실제 활용이 늦어질 수 있다.",
  
        strong:
          "전문성에 대한 확신이 강해지면 새로운 방식과 외부 의견을 받아들이는 속도가 늦어질 수 있다.",
      },
  
      defaultSuitableConditions: [
        "학습과 실무 적용이 연결되는 환경",
        "경험을 반복하고 체계화할 수 있는 구조",
        "전문성의 활용 목적과 평가 기준이 명확한 조건",
      ],
  
      defaultCautionConditions: [
        "학습 분야를 짧은 주기로 계속 변경하는 경우",
        "실무 적용 없이 정보와 자격만 축적하는 경우",
        "기존 전문성만 고수하며 변화된 방식을 거부하는 경우",
      ],
    },
  
    organizationFit: {
      corePattern: {
        limited:
          "조직의 규칙과 역할 관계가 복잡해질수록 통제와 책임 압박을 크게 받는 구조이다.",
  
        moderate:
          "권한·책임·보고체계가 명확할 때 조직 안에서 안정적으로 기능하는 구조이다.",
  
        strong:
          "조직의 규칙과 역할 구조를 이해하고 자신의 기능을 체계적으로 수행하는 힘이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "조직 규모가 작고 보고 관계가 단순할수록 맡은 역할을 정확하게 수행한다.",
  
        moderate:
          "책임과 의사결정 경로가 정리되어 있을 때 협업과 역할 수행 능력이 드러난다.",
  
        strong:
          "복잡한 조직에서도 규칙과 책임 관계를 파악하고 필요한 역할을 안정적으로 수행한다.",
      },
  
      limitationPattern: {
        limited:
          "권한 없이 책임만 커지거나 통제가 과도하면 조직 피로와 회피가 나타날 수 있다.",
  
        moderate:
          "보고체계와 평가 기준이 불명확하면 업무보다 관계 조정에 힘을 소모할 수 있다.",
  
        strong:
          "조직 질서와 규칙을 중시하여 비정형적 변화나 자율적인 방식과 충돌할 수 있다.",
      },
  
      defaultSuitableConditions: [
        "책임과 권한이 명확하게 구분된 조직",
        "보고와 의사결정 경로가 정리된 환경",
        "평가 기준과 역할 범위가 투명한 구조",
      ],
  
      defaultCautionConditions: [
        "권한 없이 결과 책임만 부담하는 경우",
        "공식 기준보다 비공식 관계가 우선하는 조직",
        "보고체계와 평가 기준이 계속 변경되는 경우",
      ],
    },
  
    independenceFit: {
      corePattern: {
        limited:
          "모든 판단과 결과 책임을 혼자 부담할 때 환경 지원과 자원 부족의 영향을 크게 받는 구조이다.",
  
        moderate:
          "업무 범위와 지원 체계가 정리되어 있을 때 독립적으로 자기 영역을 운영하는 구조이다.",
  
        strong:
          "자기 기준과 전문 기능을 바탕으로 독립적인 업무 방향을 만들고 유지하는 힘이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "책임 범위가 작고 필요한 지원을 확보할 때 자기 주도성이 안정적으로 드러난다.",
  
        moderate:
          "업무 권한과 외부 지원의 경계가 명확할 때 독립성과 실행력이 나타난다.",
  
        strong:
          "외부 지시가 부족한 상황에서도 스스로 기준을 세우고 결과를 만들어낸다.",
      },
  
      limitationPattern: {
        limited:
          "지원과 검토 체계 없이 모든 책임을 혼자 맡으면 판단 부담과 소진이 빠르게 커질 수 있다.",
  
        moderate:
          "독립성을 유지하려다 필요한 협업과 외부 자원을 늦게 요청할 수 있다.",
  
        strong:
          "자기 기준이 강해지면 조직의 통제나 파트너와의 의사결정 과정에서 충돌할 수 있다.",
      },
  
      defaultSuitableConditions: [
        "업무 방향과 의사결정 권한이 주어지는 환경",
        "필요한 전문 지원을 선택적으로 활용할 수 있는 구조",
        "성과와 책임 범위를 스스로 확인할 수 있는 조건",
      ],
  
      defaultCautionConditions: [
        "지원 체계 없이 모든 기능을 혼자 담당하는 경우",
        "협업이 필요한 문제까지 독립적으로 처리하는 경우",
        "자기 기준과 외부 요구의 조정 없이 책임을 확대하는 경우",
      ],
    },
  
    leadershipFit: {
      corePattern: {
        limited:
          "타인의 업무와 결과까지 책임지는 상황에서 의사결정 압력과 관계 부담을 크게 받는 구조이다.",
  
        moderate:
          "권한과 책임 범위가 명확할 때 사람과 업무의 방향을 안정적으로 이끄는 구조이다.",
  
        strong:
          "기준을 세우고 의사결정을 내리며 여러 역할을 조정하는 리더십 기반이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "인원과 책임 범위가 제한될수록 구체적인 지시와 실무 중심 리더십이 안정적으로 나타난다.",
  
        moderate:
          "목표와 권한이 주어질 때 업무 배분과 의사결정 능력이 발휘된다.",
  
        strong:
          "불확실한 상황에서도 방향을 정하고 사람과 자원을 조직하는 힘이 드러난다.",
      },
  
      limitationPattern: {
        limited:
          "타인의 문제와 감정까지 함께 책임지면 결정 피로와 소진이 빠르게 누적될 수 있다.",
  
        moderate:
          "권한보다 책임이 커지거나 역할 분담이 불명확하면 통제력이 약해질 수 있다.",
  
        strong:
          "의사결정 능력을 과신하여 권한을 집중시키면 구성원의 자율성과 충돌할 수 있다.",
      },
  
      defaultSuitableConditions: [
        "의사결정 권한과 결과 책임이 일치하는 환경",
        "구성원의 역할과 책임이 구분된 구조",
        "목표와 평가 기준을 공유할 수 있는 조건",
      ],
  
      defaultCautionConditions: [
        "권한 없이 타인의 결과까지 책임지는 경우",
        "역할 분담 없이 모든 결정을 직접 처리하는 경우",
        "구성원의 의견을 확인하지 않고 기준을 일방적으로 적용하는 경우",
      ],
    },
  
    performanceConversion: {
      corePattern: {
        limited:
          "노력과 활동이 실제 결과·평가·보상으로 연결되는 과정에서 외부 기준의 영향을 크게 받는 구조이다.",
  
        moderate:
          "성과 기준과 보상 구조가 명확할 때 활동을 실제 결과로 안정적으로 전환하는 구조이다.",
  
        strong:
          "생산·기획·영업·운영 활동을 구체적인 결과와 평가로 연결하는 힘이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "결과 기준이 구체적이고 짧은 주기로 확인될 때 성과 완성력이 안정적으로 드러난다.",
  
        moderate:
          "목표와 평가 기준이 명확할 때 노력의 우선순위를 정하고 결과를 만들어낸다.",
  
        strong:
          "아이디어와 활동을 측정 가능한 결과로 완성하고 현실적인 성과로 연결한다.",
      },
  
      limitationPattern: {
        limited:
          "평가 기준이 불명확하거나 결과 확인이 늦어지면 노력에 비해 성과가 남지 않을 수 있다.",
  
        moderate:
          "성과보다 과정의 요구가 계속 늘어나면 실제 결과와 보상의 연결이 약해질 수 있다.",
  
        strong:
          "성과를 빠르게 만들려는 성향이 강해지면 과정의 안정성과 장기 품질을 놓칠 수 있다.",
      },
  
      defaultSuitableConditions: [
        "목표와 평가 기준이 수치 또는 결과로 명확한 업무",
        "활동과 보상의 연결 구조가 투명한 환경",
        "중간 성과를 확인하고 조정할 수 있는 조건",
      ],
  
      defaultCautionConditions: [
        "평가 기준 없이 활동량만 늘어나는 경우",
        "결과보다 역할과 절차의 요구가 계속 확대되는 경우",
        "단기 성과를 위해 장기 품질과 기반을 소모하는 경우",
      ],
    },
  
    careerContinuity: {
      corePattern: {
        limited:
          "직업 환경과 역할이 바뀔 때 기존 경험을 같은 방향으로 이어가는 힘이 약해질 수 있는 구조이다.",
  
        moderate:
          "경력 방향과 성장 단계가 명확할 때 직업 경험을 안정적으로 이어가는 구조이다.",
  
        strong:
          "하나의 직업 방향을 장기간 유지하며 경험과 역할을 확장하는 지속력이 강한 구조이다.",
      },
  
      strengthExpression: {
        limited:
          "기간과 목표가 분명한 업무에서 경력 경험을 구체적인 성과로 남기는 힘이 드러난다.",
  
        moderate:
          "중간 점검과 성장 기준이 있을 때 경험을 다음 역할로 연결하는 힘이 나타난다.",
  
        strong:
          "환경 변화 속에서도 직업의 중심 방향을 유지하며 경험을 장기 자산으로 축적한다.",
      },
  
      limitationPattern: {
        limited:
          "환경 지원이 약해지거나 역할 갈등이 반복되면 기존 경력을 중단하고 방향을 바꿀 수 있다.",
  
        moderate:
          "성장 경로가 보이지 않거나 같은 역할이 장기간 반복되면 직업 전환 욕구가 커질 수 있다.",
  
        strong:
          "경력 지속성을 중시하여 이미 성장 가능성이 낮아진 환경에서도 지나치게 오래 머물 수 있다.",
      },
  
      defaultSuitableConditions: [
        "경력의 다음 단계와 성장 기준이 보이는 환경",
        "기존 경험을 새로운 역할로 확장할 수 있는 구조",
        "정기적으로 직업 방향과 성과를 점검하는 조건",
      ],
  
      defaultCautionConditions: [
        "경력 목표 없이 단기 상황에 따라 역할을 바꾸는 경우",
        "성장 경로가 사라진 상태에서 같은 업무만 반복하는 경우",
        "기존 경험을 활용하지 못하는 전환을 반복하는 경우",
      ],
    },
  };
  
  function normalizeText(
    value: string,
  ): string {
    return value
      .replace(/\s+/g, " ")
      .trim();
  }
  
  function uniqueTexts(
    values: string[],
  ): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
  
    for (const value of values) {
      const normalized =
        normalizeText(value);
  
      if (
        !normalized
        || seen.has(normalized)
      ) {
        continue;
      }
  
      seen.add(normalized);
      result.push(normalized);
    }
  
    return result;
  }
  
  function collectSuitableConditions(
    selection: CareerAreaSelection,
    definition: CareerAreaDefinition,
  ): string[] {
    const evidenceConditions =
      selection.supportingMatches.flatMap(
        (match) =>
          match.evidence.conditions,
      );
  
    return uniqueTexts([
      ...evidenceConditions,
      ...definition.defaultSuitableConditions,
    ]);
  }
  
  function collectCautionConditions(
    selection: CareerAreaSelection,
    definition: CareerAreaDefinition,
  ): string[] {
    const evidenceConditions =
      selection.limitingMatches.flatMap(
        (match) => [
          ...match.evidence.conditions,
          ...match.evidence.exceptions,
        ],
      );
  
    return uniqueTexts([
      ...evidenceConditions,
      ...definition.defaultCautionConditions,
    ]);
  }
  
  export function buildCareerAreaInterpretation(
    selection: CareerAreaSelection,
  ): CareerAreaInterpretation | null {
    if (
      selection.status === "insufficient"
      || selection.level === null
    ) {
      return null;
    }
  
    const definition =
      CAREER_AREA_DEFINITIONS[
        selection.area
      ];
  
    const level = selection.level;
  
    return {
      corePattern:
        definition.corePattern[level],
  
      strengthExpression:
        definition.strengthExpression[level],
  
      limitationPattern:
        definition.limitationPattern[level],
  
      suitableConditions:
        collectSuitableConditions(
          selection,
          definition,
        ),
  
      cautionConditions:
        collectCautionConditions(
          selection,
          definition,
        ),
    };
  }