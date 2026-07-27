import type {
    PatternEvidence,
  } from "../masterReader/types/repeatedPattern";

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

  function toCombinedWeight(
    strengths: SajuEvidenceStrength[],
  ): number {
    const strongestWeight =
      Math.max(
        ...strengths.map(
          toWeight,
        ),
      );

    if (
      strengths.length >= 3 ||
      strongestWeight >= 3
    ) {
      return 3;
    }

    if (strengths.length >= 2) {
      return 2;
    }

    return strongestWeight;
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

  function buildEarlySuccessCollapseEvidence(
    facts: SajuFacts,
  ): PatternEvidence[] {
    const dayMasterFact =
      findFactBySignalKind(
        facts.structureFacts,
        "dayMasterStrength",
      );

    const tenGodFact =
      findFactBySignalKind(
        facts.structureFacts,
        "tenGodDominance",
      );

    if (
      dayMasterFact?.signal?.kind !==
        "dayMasterStrength" ||
      tenGodFact?.signal?.kind !==
        "tenGodDominance"
    ) {
      return [];
    }

    const isStrongDayMaster =
      dayMasterFact.signal.type ===
      "strong";

    const isExpansionTenGod =
      tenGodFact.signal.dominantTenGod ===
        "편재" ||
      tenGodFact.signal.dominantTenGod ===
        "겁재" ||
      tenGodFact.signal.dominantTenGod ===
        "식신" ||
      tenGodFact.signal.dominantTenGod ===
        "상관";

    const isConcentrated =
      !tenGodFact.signal.distributed &&
      tenGodFact.signal.dominantCount >= 2;

    if (
      !isStrongDayMaster ||
      !isExpansionTenGod ||
      !isConcentrated
    ) {
      return [];
    }

    return [
      {
        source: "structure",

        description:
          `${tenGodFact.signal.dominantTenGod}의 집중과 ` +
          "강한 일간이 함께 나타나 빠른 성공과 성과 이후 확장·과속·무리한 투자로 유지가 흔들릴 수 있는 구조이다.",

        weight:
          toCombinedWeight([
            dayMasterFact.strength,
            tenGodFact.strength,
          ]),
      },
    ];
  }

  function buildSlowGrowthEvidence(
    facts: SajuFacts,
  ): PatternEvidence[] {
    const rootingFact =
      findFactBySignalKind(
        facts.structureFacts,
        "rooting",
      );

    if (
      rootingFact?.signal?.kind !==
        "rooting" ||
      !rootingFact.signal.rooted ||
      facts.strongestElement !== "earth"
    ) {
      return [];
    }

    const fiveElementFact =
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

    if (!fiveElementFact) {
      return [];
    }

    return [
      {
        source: "fiveElementFlow",

        description:
          "토 기운의 축적성과 실제 통근 기반이 함께 있어, 빠른 확장보다 꾸준한 반복·안정·장기 성장을 만드는 구조이다.",

        weight:
          toCombinedWeight([
            fiveElementFact.strength,
            rootingFact.strength,
          ]),
      },
    ];
  }

  function buildRootingGrowthEvidence(
    facts: SajuFacts,
  ): PatternEvidence[] {
    const rootingFact =
      findFactBySignalKind(
        facts.structureFacts,
        "rooting",
      );

    if (
      rootingFact?.signal?.kind !==
        "rooting" ||
      !rootingFact.signal.rooted
    ) {
      return [];
    }

    const {
      rootingCount,
      totalBranches,
    } = rootingFact.signal;

    const weight =
      rootingCount >= 3
        ? 3
        : rootingCount >= 2
          ? 2
          : 1;

    return [
      {
        source: "rooting",

        description:
          `전체 ${totalBranches}개 지지 중 ` +
          `${rootingCount}개에서 실제 통근과 뿌리가 확인되어, ` +
          "자기 기반을 꾸준히 활용하고 장기적으로 성과를 축적하는 반복 구조이다.",

        weight,
      },
    ];
  }

  function buildRelationshipLossEvidence(
    facts: SajuFacts,
  ): PatternEvidence[] {
    return facts.interactionFacts.flatMap(
      (fact): PatternEvidence[] => {
        if (
          fact.type !== "punishment" &&
          fact.type !== "break" &&
          fact.type !== "harm" &&
          fact.type !== "mixed"
        ) {
          return [];
        }

        return [
          {
            source: "interaction",

            description:
              `${fact.description} ` +
              "관계·협력·인맥 과정에서 감정 충돌이나 신뢰 손실이 반복되지 않도록 경계가 필요한 구조이다.",

            weight:
              toWeight(fact.strength),
          },
        ];
      },
    );
  }

  function buildWealthLeakEvidence(
    facts: SajuFacts,
  ): PatternEvidence[] {
    const tenGodFact =
      findFactBySignalKind(
        facts.structureFacts,
        "tenGodDominance",
      );

    if (
      tenGodFact?.signal?.kind !==
        "tenGodDominance" ||
      tenGodFact.signal.dominantTenGod !==
        "편재" ||
      tenGodFact.signal.dominantCount < 2 ||
      tenGodFact.signal.distributed
    ) {
      return [];
    }

    return [
      {
        source: "tenGodStrength",

        description:
          "편재의 집중이 강해 재물과 투자 기회를 넓히려는 힘이 크지만, 지출·확장·현금흐름 누수가 반복되지 않도록 관리가 필요한 구조이다.",

        weight:
          toWeight(
            tenGodFact.strength,
          ),
      },
    ];
  }

  function buildRestartCycleEvidence(
    facts: SajuFacts,
  ): PatternEvidence[] {
    const changeFacts =
      facts.interactionFacts.filter(
        (fact) =>
          fact.type === "clash" ||
          fact.type === "break" ||
          fact.type === "mixed",
      );

    if (changeFacts.length < 2) {
      return [];
    }

    const strength =
      changeFacts.some(
        (fact) =>
          fact.strength === "strong",
      )
        ? "strong"
        : changeFacts.some(
              (fact) =>
                fact.strength === "medium",
            )
          ? "medium"
          : "weak";

    return [
      {
        source: "structure",

        description:
          "원국에서 복수의 충·파·복합 변동이 확인되어 변화·전환·이동과 재시작·새출발이 반복될 가능성이 있는 구조이다.",

        weight:
          toWeight(strength),
      },
    ];
  }

  function buildResponsibilityOverloadEvidence(
    facts: SajuFacts,
  ): PatternEvidence[] {
    const dayMasterFact =
      findFactBySignalKind(
        facts.structureFacts,
        "dayMasterStrength",
      );

    if (
      dayMasterFact?.signal?.kind !==
      "dayMasterStrength"
    ) {
      return [];
    }

    const {
      type,
      supportScore,
      opposingScore,
    } = dayMasterFact.signal;

    if (
      type === "weak" &&
      opposingScore > supportScore
    ) {
      return [
        {
          source: "dayMasterStrength",

          description:
            "일간의 지원력보다 대항 압력이 커서 책임·부담·압박을 혼자 감당하거나 희생하면서 소진되는 흐름을 경계해야 한다.",

          weight:
            toWeight(
              dayMasterFact.strength,
            ),
        },
      ];
    }

    if (
      type === "strong" &&
      supportScore >=
        opposingScore + 3
    ) {
      return [
        {
          source: "dayMasterStrength",

          description:
            "자기 힘이 강해 주변의 책임과 부담까지 혼자 감당하려는 경향이 생기기 쉬우며, 과도한 책임감으로 소진되는 반복을 경계해야 한다.",

          weight:
            toWeight(
              dayMasterFact.strength,
            ),
        },
      ];
    }

    return [];
  }

  function buildLateBloomEvidence(
    facts: SajuFacts,
  ): PatternEvidence[] {
    const monthCommandFact =
      findFactBySignalKind(
        facts.structureFacts,
        "monthCommand",
      );

    const rootingFact =
      findFactBySignalKind(
        facts.structureFacts,
        "rooting",
      );

    if (
      monthCommandFact?.signal?.kind !==
        "monthCommand" ||
      rootingFact?.signal?.kind !==
        "rooting" ||
      monthCommandFact.signal.supported !==
        false ||
      !rootingFact.signal.rooted
    ) {
      return [];
    }

    return [
      {
        source: "monthCommand",

        description:
          "초기에는 월령 지원이 약하지만 실제 뿌리가 있어, 경험과 실력을 늦게까지 축적한 뒤 후반에 성숙하는 대기만성 구조이다.",

        weight:
          toCombinedWeight([
            monthCommandFact.strength,
            rootingFact.strength,
          ]),
      },
    ];
  }

  function buildOpportunityMissEvidence(
    facts: SajuFacts,
  ): PatternEvidence[] {
    if (
      !facts.usefulGod ||
      !facts.weakestElement
    ) {
      return [];
    }

    if (
      facts.usefulGod !==
      facts.weakestElement
    ) {
      return [];
    }

    const usefulGodFact =
      facts.structureFacts.find(
        (fact) =>
          fact.category ===
          "usefulGod",
      );

    if (!usefulGodFact) {
      return [];
    }

    return [
      {
        source: "usefulGod",

        description:
          "필요한 용신 자원이 원국에서 약해 신중한 검토가 길어질 수 있으므로, 결정 지연과 망설임으로 기회를 놓치고 후회하는 반복을 경계해야 한다.",

        weight:
          toWeight(
            usefulGodFact.strength,
          ),
      },
    ];
  }

  function buildDistributedAdaptationEvidence(
    facts:
      SajuFacts,
  ): PatternEvidence[] {
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

    const tenGodFact =
      findFactBySignalKind(
        facts.structureFacts,
        "tenGodDominance",
      );

    if (
      dayMasterFact?.signal?.kind
        !== "dayMasterStrength"
      || rootingFact?.signal?.kind
        !== "rooting"
      || tenGodFact?.signal?.kind
        !== "tenGodDominance"
    ) {
      return [];
    }

    if (
      dayMasterFact.signal.type
        !== "balanced"
      || rootingFact.signal.rooted
        !== false
      || tenGodFact.signal.distributed
        !== true
    ) {
      return [];
    }

    return [
      {
        source:
          "structure",

        description:
          "일간은 중화를 이루어 상황에 유연하게 대응할 수 있지만, " +
          "통근 기반이 없고 십성이 분산되어 있어 역할과 관심, " +
          "선택 방향이 여러 갈래로 분산되는 반복 구조이다.",

        weight:
          toCombinedWeight([
            dayMasterFact.strength,
            rootingFact.strength,
            tenGodFact.strength,
          ]),
      },
    ];
  }

  export function buildRepeatedPatternEvidence(
    facts: SajuFacts,
  ): PatternEvidence[] {
    return [
      ...buildEarlySuccessCollapseEvidence(
        facts,
      ),

      ...buildSlowGrowthEvidence(
        facts,
      ),

      ...buildRootingGrowthEvidence(
        facts,
      ),

      ...buildRelationshipLossEvidence(
        facts,
      ),

      ...buildWealthLeakEvidence(
        facts,
      ),

      ...buildRestartCycleEvidence(
        facts,
      ),

      ...buildResponsibilityOverloadEvidence(
        facts,
      ),

      ...buildLateBloomEvidence(
        facts,
      ),

      ...buildOpportunityMissEvidence(
        facts,
      ),

      ...buildDistributedAdaptationEvidence(
        facts,
      ),
    ];
  }