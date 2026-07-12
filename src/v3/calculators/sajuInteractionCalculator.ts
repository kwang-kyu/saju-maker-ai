import type {
    SajuInteractionFact,
    SajuPillarFact,
  } from "../types/sajuFacts";
  
  type InteractionRule = {
    type: SajuInteractionFact["type"];
  
    targets: readonly string[];
  
    description: string;
  
    strength: SajuInteractionFact["strength"];
  };
  
  const heavenlyStemCombinationRules: InteractionRule[] = [
    {
      type: "combination",
      targets: ["갑", "기"],
      description: "천간 갑과 기의 합이 존재한다.",
      strength: "medium",
    },
    {
      type: "combination",
      targets: ["을", "경"],
      description: "천간 을과 경의 합이 존재한다.",
      strength: "medium",
    },
    {
      type: "combination",
      targets: ["병", "신"],
      description: "천간 병과 신의 합이 존재한다.",
      strength: "medium",
    },
    {
      type: "combination",
      targets: ["정", "임"],
      description: "천간 정과 임의 합이 존재한다.",
      strength: "medium",
    },
    {
      type: "combination",
      targets: ["무", "계"],
      description: "천간 무와 계의 합이 존재한다.",
      strength: "medium",
    },
  ];
  
  const earthlyBranchCombinationRules: InteractionRule[] = [
    {
      type: "combination",
      targets: ["자", "축"],
      description: "지지 자와 축의 육합이 존재한다.",
      strength: "medium",
    },
    {
      type: "combination",
      targets: ["인", "해"],
      description: "지지 인과 해의 육합이 존재한다.",
      strength: "medium",
    },
    {
      type: "combination",
      targets: ["묘", "술"],
      description: "지지 묘와 술의 육합이 존재한다.",
      strength: "medium",
    },
    {
      type: "combination",
      targets: ["진", "유"],
      description: "지지 진과 유의 육합이 존재한다.",
      strength: "medium",
    },
    {
      type: "combination",
      targets: ["사", "신"],
      description: "지지 사와 신의 육합이 존재한다.",
      strength: "medium",
    },
    {
      type: "combination",
      targets: ["오", "미"],
      description: "지지 오와 미의 육합이 존재한다.",
      strength: "medium",
    },
  ];
  
  const earthlyBranchClashRules: InteractionRule[] = [
    {
      type: "clash",
      targets: ["자", "오"],
      description: "지지 자와 오의 충이 존재한다.",
      strength: "strong",
    },
    {
      type: "clash",
      targets: ["축", "미"],
      description: "지지 축과 미의 충이 존재한다.",
      strength: "strong",
    },
    {
      type: "clash",
      targets: ["인", "신"],
      description: "지지 인과 신의 충이 존재한다.",
      strength: "strong",
    },
    {
      type: "clash",
      targets: ["묘", "유"],
      description: "지지 묘와 유의 충이 존재한다.",
      strength: "strong",
    },
    {
      type: "clash",
      targets: ["진", "술"],
      description: "지지 진과 술의 충이 존재한다.",
      strength: "strong",
    },
    {
      type: "clash",
      targets: ["사", "해"],
      description: "지지 사와 해의 충이 존재한다.",
      strength: "strong",
    },
  ];
  
  const earthlyBranchPunishmentRules: InteractionRule[] = [
    {
      type: "punishment",
      targets: ["인", "사"],
      description: "지지 인과 사 사이에 형의 관계가 존재한다.",
      strength: "medium",
    },
    {
      type: "punishment",
      targets: ["사", "신"],
      description: "지지 사와 신 사이에 형의 관계가 존재한다.",
      strength: "medium",
    },
    {
      type: "punishment",
      targets: ["인", "신"],
      description: "지지 인과 신 사이에 형의 관계가 존재한다.",
      strength: "medium",
    },
    {
      type: "punishment",
      targets: ["축", "술"],
      description: "지지 축과 술 사이에 형의 관계가 존재한다.",
      strength: "medium",
    },
    {
      type: "punishment",
      targets: ["술", "미"],
      description: "지지 술과 미 사이에 형의 관계가 존재한다.",
      strength: "medium",
    },
    {
      type: "punishment",
      targets: ["축", "미"],
      description: "지지 축과 미 사이에 형의 관계가 존재한다.",
      strength: "medium",
    },
    {
      type: "punishment",
      targets: ["자", "묘"],
      description: "지지 자와 묘 사이에 형의 관계가 존재한다.",
      strength: "medium",
    },
  ];
  
  const earthlyBranchBreakRules: InteractionRule[] = [
    {
      type: "break",
      targets: ["자", "유"],
      description: "지지 자와 유 사이에 파의 관계가 존재한다.",
      strength: "weak",
    },
    {
      type: "break",
      targets: ["축", "진"],
      description: "지지 축과 진 사이에 파의 관계가 존재한다.",
      strength: "weak",
    },
    {
      type: "break",
      targets: ["인", "해"],
      description: "지지 인과 해 사이에 파의 관계가 존재한다.",
      strength: "weak",
    },
    {
      type: "break",
      targets: ["묘", "오"],
      description: "지지 묘와 오 사이에 파의 관계가 존재한다.",
      strength: "weak",
    },
    {
      type: "break",
      targets: ["사", "신"],
      description: "지지 사와 신 사이에 파의 관계가 존재한다.",
      strength: "weak",
    },
    {
      type: "break",
      targets: ["미", "술"],
      description: "지지 미와 술 사이에 파의 관계가 존재한다.",
      strength: "weak",
    },
  ];
  
  const earthlyBranchHarmRules: InteractionRule[] = [
    {
      type: "harm",
      targets: ["자", "미"],
      description: "지지 자와 미 사이에 해의 관계가 존재한다.",
      strength: "medium",
    },
    {
      type: "harm",
      targets: ["축", "오"],
      description: "지지 축과 오 사이에 해의 관계가 존재한다.",
      strength: "medium",
    },
    {
      type: "harm",
      targets: ["인", "사"],
      description: "지지 인과 사 사이에 해의 관계가 존재한다.",
      strength: "medium",
    },
    {
      type: "harm",
      targets: ["묘", "진"],
      description: "지지 묘와 진 사이에 해의 관계가 존재한다.",
      strength: "medium",
    },
    {
      type: "harm",
      targets: ["신", "해"],
      description: "지지 신과 해 사이에 해의 관계가 존재한다.",
      strength: "medium",
    },
    {
      type: "harm",
      targets: ["유", "술"],
      description: "지지 유와 술 사이에 해의 관계가 존재한다.",
      strength: "medium",
    },
  ];
  
  function normalizePair(
    first: string,
    second: string,
  ): string[] {
    return [first, second].sort();
  }
  
  function ruleMatches(
    rule: InteractionRule,
    first: string,
    second: string,
  ): boolean {
    const ruleTargets = [...rule.targets].sort();
    const comparedTargets = normalizePair(first, second);
  
    return (
      ruleTargets.length === comparedTargets.length &&
      ruleTargets.every(
        (target, index) =>
          target === comparedTargets[index],
      )
    );
  }
  
  function getPillarLabel(
    pillar: SajuPillarFact,
  ): string {
    switch (pillar.position) {
      case "year":
        return "년주";
  
      case "month":
        return "월주";
  
      case "day":
        return "일주";
  
      case "time":
        return "시주";
    }
  }
  
  function buildFact(params: {
    rule: InteractionRule;
    firstPillar: SajuPillarFact;
    secondPillar: SajuPillarFact;
  }): SajuInteractionFact {
    const {
      rule,
      firstPillar,
      secondPillar,
    } = params;
  
    return {
      type: rule.type,
  
      targets: [
        `${getPillarLabel(firstPillar)} ${firstPillar.ganZhi}`,
        `${getPillarLabel(secondPillar)} ${secondPillar.ganZhi}`,
      ],
  
      description:
        `${rule.description} ` +
        `해당 위치는 ` +
        `${getPillarLabel(firstPillar)}와 ` +
        `${getPillarLabel(secondPillar)}이다.`,
  
      strength: rule.strength,
    };
  }
  
  function findRules(params: {
    rules: InteractionRule[];
    firstValue: string;
    secondValue: string;
    firstPillar: SajuPillarFact;
    secondPillar: SajuPillarFact;
  }): SajuInteractionFact[] {
    const {
      rules,
      firstValue,
      secondValue,
      firstPillar,
      secondPillar,
    } = params;
  
    return rules
      .filter((rule) =>
        ruleMatches(
          rule,
          firstValue,
          secondValue,
        ),
      )
      .map((rule) =>
        buildFact({
          rule,
          firstPillar,
          secondPillar,
        }),
      );
  }
  
  function comparePillars(
    firstPillar: SajuPillarFact,
    secondPillar: SajuPillarFact,
  ): SajuInteractionFact[] {
    const heavenlyStemFacts = findRules({
      rules: heavenlyStemCombinationRules,
      firstValue: firstPillar.heavenlyStem,
      secondValue: secondPillar.heavenlyStem,
      firstPillar,
      secondPillar,
    });
  
    const branchRules = [
      ...earthlyBranchCombinationRules,
      ...earthlyBranchClashRules,
      ...earthlyBranchPunishmentRules,
      ...earthlyBranchBreakRules,
      ...earthlyBranchHarmRules,
    ];
  
    const earthlyBranchFacts = findRules({
      rules: branchRules,
      firstValue: firstPillar.earthlyBranch,
      secondValue: secondPillar.earthlyBranch,
      firstPillar,
      secondPillar,
    });
  
    return [
      ...heavenlyStemFacts,
      ...earthlyBranchFacts,
    ];
  }
  
  export function calculateSajuInteractions(
    pillars: SajuPillarFact[],
  ): SajuInteractionFact[] {
    const interactionFacts: SajuInteractionFact[] = [];
  
    for (
      let firstIndex = 0;
      firstIndex < pillars.length;
      firstIndex += 1
    ) {
      for (
        let secondIndex = firstIndex + 1;
        secondIndex < pillars.length;
        secondIndex += 1
      ) {
        interactionFacts.push(
          ...comparePillars(
            pillars[firstIndex],
            pillars[secondIndex],
          ),
        );
      }
    }
  
    return interactionFacts;
  }