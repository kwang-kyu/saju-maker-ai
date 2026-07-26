import type {
    SurvivalEvidence,
  } from "../masterReader/types/survivalStyle";

  import type {
    SajuEvidenceStrength,
    SajuFacts,
    SajuStructureFact,
  } from "../types/sajuFacts";

  function toWeight(
    strength: SajuEvidenceStrength,
  ): number {
    switch (strength) {
      case "strong":
        return 3;

      case "medium":
        return 2;

      case "weak":
        return 1;
    }
  }

  function findFactBySignalKind(
    structureFacts: SajuStructureFact[],
    kind:
      | "tenGodDominance"
      | "dayMasterStrength"
      | "monthCommand"
      | "rooting",
  ): SajuStructureFact | null {
    return (
      structureFacts.find(
        (fact) =>
          fact.signal?.kind === kind,
      ) ?? null
    );
  }

  function buildDayMasterEvidence(
    fact: SajuStructureFact,
  ): SurvivalEvidence[] {
    if (
      fact.signal?.kind !==
      "dayMasterStrength"
    ) {
      return [];
    }

    switch (fact.signal.type) {
      case "strong":
        return [
          {
            source: "dayMasterStrength",

            description:
              "강한 일간과 자기 힘을 바탕으로 독자적 판단을 내리고, 압박을 정면으로 밀어붙이는 생존 방식이 확인된다.",

            weight:
              toWeight(fact.strength),
          },

          {
            source: "dayMasterStrength",

            description:
              "외부 간섭보다 자기 기준과 통제권을 중시하며, 스스로 결정하는 자립적·자율적 대응력이 강하다.",

            weight:
              toWeight(fact.strength),
          },
        ];

      case "balanced":
        return [
          {
            source: "dayMasterStrength",

            description:
              "자기 기준을 유지하면서도 상황에 맞게 통제 범위를 조절하는 자율적 대응 기반이 확인된다.",

            weight:
              toWeight(fact.strength),
          },
        ];

      case "weak":
        return [];
    }
  }

  function buildRootingEvidence(
    fact: SajuStructureFact,
  ): SurvivalEvidence[] {
    if (
      fact.signal?.kind !== "rooting" ||
      !fact.signal.rooted
    ) {
      return [];
    }

    return [
      {
        source: "rooting",

        description:
          `전체 ${fact.signal.totalBranches}개 지지 중 ` +
          `${fact.signal.rootingCount}개에서 뿌리가 확인되어, ` +
          "자기 기반과 내부 자원을 바탕으로 독자 생존하는 힘이 있다.",

        weight:
          toWeight(fact.strength),
      },

      {
        source: "rooting",

        description:
          "근과 자기 기반이 있어 장기전에서도 쉽게 무너지지 않고, 버팀·인내·지속·유지력을 발휘하는 구조이다.",

        weight:
          toWeight(fact.strength),
      },
    ];
  }

  function buildMonthCommandEvidence(
    fact: SajuStructureFact,
  ): SurvivalEvidence[] {
    if (
      fact.signal?.kind !== "monthCommand"
    ) {
      return [];
    }

    if (fact.signal.supported === true) {
      return [
        {
          source: "monthCommand",

          description:
            "월령과 계절의 힘이 일간을 지원하여 환경 적응력·생활력·지속력과 버티는 힘이 살아나는 구조이다.",

          weight:
            toWeight(fact.strength),
        },
      ];
    }

    if (fact.signal.supported === false) {
      return [
        {
          source: "monthCommand",

          description:
            "월령의 직접 지원은 약하지만, 계절 환경의 압박에 적응하며 생활력과 생존력을 길러야 하는 구조이다.",

          weight:
            toWeight(fact.strength),
        },
      ];
    }

    return [];
  }

  function buildTenGodEvidence(
    fact: SajuStructureFact,
  ): SurvivalEvidence[] {
    if (
      fact.signal?.kind !==
      "tenGodDominance"
    ) {
      return [];
    }

    const dominantTenGod =
      fact.signal.dominantTenGod;

    if (
      dominantTenGod !== "정인" &&
      dominantTenGod !== "편인"
    ) {
      return [];
    }

    return [
      {
        source: "tenGodStrength",

        description:
          `${dominantTenGod} 인성의 영향이 두드러져 ` +
          "정보를 수집하고 분석·검토·계획한 뒤 해결 방향을 정하는 방식이 강하다.",

        weight:
          toWeight(fact.strength),
      },

      {
        source: "tenGodStrength",

        description:
          `${dominantTenGod} 인성의 힘을 통해 ` +
          "지식·기술·전문성·학습·연구·숙련으로 위기 대응 능력을 높이는 구조이다.",

        weight:
          toWeight(fact.strength),
      },
    ];
  }

  function buildFiveElementEvidence(
    facts: SajuFacts,
  ): SurvivalEvidence[] {
    const strongestElement =
      facts.strongestElement;

    if (!strongestElement) {
      return [];
    }

    const sourceFact =
      facts.structureFacts.find(
        (fact) =>
          fact.category ===
            "fiveElementFlow" &&
          fact.description.includes(
            "가장 많이 나타난 오행",
          ),
      ) ??
      facts.structureFacts.find(
        (fact) =>
          fact.category ===
          "fiveElementFlow",
      ) ??
      null;

    if (!sourceFact) {
      return [];
    }

    switch (strongestElement) {
      case "earth":
        return [
          {
            source: "fiveElementFlow",

            description:
              "토 기운의 비중이 높아 확장보다 안정·유지·관리·축적을 통해 기반을 보존하는 생존 방식이 강하다.",

            weight:
              toWeight(sourceFact.strength),
          },
        ];

      case "metal":
        return [
          {
            source: "fiveElementFlow",

            description:
              "금 기운의 비중이 높아 상황을 정리하고 기준에 따라 판단·검증하며 단계적으로 조절하는 방식이 강하다.",

            weight:
              toWeight(sourceFact.strength),
          },
        ];

      case "water":
        return [
          {
            source: "fiveElementFlow",

            description:
              "수 기운의 비중이 높아 흐름과 순환을 살피고 조건을 정리·분석하여 유연하게 조절하는 방식이 강하다.",

            weight:
              toWeight(sourceFact.strength),
          },
        ];

      case "wood":
      case "fire":
        return [];
    }
  }

  function buildInteractionEvidence(
    facts: SajuFacts,
  ): SurvivalEvidence[] {
    return facts.interactionFacts.flatMap(
      (fact): SurvivalEvidence[] => {
        switch (fact.type) {
          case "combination":
            return [
              {
                source: "interaction",

                description:
                  `${fact.description} ` +
                  "합과 연결의 작용을 통해 관계·협력·도움·파트너를 활용하는 회복 방식이 나타난다.",

                weight:
                  toWeight(fact.strength),
              },
            ];

          case "clash":
          case "punishment":
          case "break":
          case "harm":
          case "mixed":
            return [
              {
                source: "interaction",

                description:
                  `${fact.description} ` +
                  "외부 변동과 환경 변화에 대응하여 이동성·전환·새로운 기회를 찾는 방식이 요구된다.",

                weight:
                  toWeight(fact.strength),
              },
            ];
        }
      },
    );
  }

  export function buildSurvivalStyleEvidence(
    facts: SajuFacts,
  ): SurvivalEvidence[] {
    const dayMasterFact =
      findFactBySignalKind(
        facts.structureFacts,
        "dayMasterStrength",
      );

    const rootingFact =
      findFactBySignalKind(
        facts.structureFacts,
        "rooting",
      );

    const monthCommandFact =
      findFactBySignalKind(
        facts.structureFacts,
        "monthCommand",
      );

    const tenGodFact =
      findFactBySignalKind(
        facts.structureFacts,
        "tenGodDominance",
      );

    return [
      ...(dayMasterFact
        ? buildDayMasterEvidence(
            dayMasterFact,
          )
        : []),

      ...(rootingFact
        ? buildRootingEvidence(
            rootingFact,
          )
        : []),

      ...(monthCommandFact
        ? buildMonthCommandEvidence(
            monthCommandFact,
          )
        : []),

      ...(tenGodFact
        ? buildTenGodEvidence(
            tenGodFact,
          )
        : []),

      ...buildFiveElementEvidence(
        facts,
      ),

      ...buildInteractionEvidence(
        facts,
      ),
    ];
  }