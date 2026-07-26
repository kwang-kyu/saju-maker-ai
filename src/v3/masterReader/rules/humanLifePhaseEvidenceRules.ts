import type {
    HumanLifePhase,
  } from "../types/humanLifePhase";

  import type {
    SajuLuckFlowTenGod,
  } from "../../types/luckFlowFact";

  export type HumanLifePhaseFlowScope =
    | "daeun"
    | "seun";

  export type HumanLifePhaseWeightRule = {
    phase: HumanLifePhase;

    daeunWeight: number;

    seunWeight: number;

    reason: string;
  };

  export type HumanLifePhaseEvidenceRule = {
    id: string;

    tenGod: SajuLuckFlowTenGod;

    weights:
      readonly HumanLifePhaseWeightRule[];
  };

  export const HUMAN_LIFE_PHASE_EVIDENCE_RULES:
    readonly HumanLifePhaseEvidenceRule[] = [
      {
        id: "peer-self-expansion",

        tenGod: "비견",

        weights: [
          {
            phase: "growth",

            daeunWeight: 4,

            seunWeight: 2,

            reason:
              "비견은 자기 기준과 독립성이 강해지며 스스로 영역을 넓히는 성장 작용을 만든다.",
          },

          {
            phase: "stability",

            daeunWeight: 1,

            seunWeight: 1,

            reason:
              "비견은 자기 힘으로 현재 기반을 지키고 유지하려는 작용도 함께 만든다.",
          },
        ],
      },

      {
        id: "rivalry-pressure-change",

        tenGod: "겁재",

        weights: [
          {
            phase: "challenge",

            daeunWeight: 4,

            seunWeight: 2,

            reason:
              "겁재는 경쟁과 자원 분산 압력을 높여 직접 대응해야 하는 도전 국면을 만든다.",
          },

          {
            phase: "transition",

            daeunWeight: 1,

            seunWeight: 1,

            reason:
              "겁재는 기존 관계와 자원 배분 방식을 다시 조정하게 하는 전환 작용을 만든다.",
          },
        ],
      },

      {
        id: "output-creation-growth",

        tenGod: "식신",

        weights: [
          {
            phase: "growth",

            daeunWeight: 4,

            seunWeight: 2,

            reason:
              "식신은 생산·표현·기술 활용이 자연스럽게 이어져 역량을 키우는 성장 작용을 만든다.",
          },

          {
            phase: "harvest",

            daeunWeight: 1,

            seunWeight: 1,

            reason:
              "식신은 축적한 능력을 결과물과 생활 성과로 전환하는 수확 작용도 만든다.",
          },
        ],
      },

      {
        id: "expression-restructure-transition",

        tenGod: "상관",

        weights: [
          {
            phase: "transition",

            daeunWeight: 4,

            seunWeight: 2,

            reason:
              "상관은 기존 방식과 질서의 한계를 드러내고 새로운 표현 방식으로 바꾸는 전환 작용을 만든다.",
          },

          {
            phase: "growth",

            daeunWeight: 1,

            seunWeight: 1,

            reason:
              "상관은 새로운 시도와 표현 범위를 넓혀 성장 가능성을 자극한다.",
          },
        ],
      },

      {
        id: "opportunity-resource-harvest",

        tenGod: "편재",

        weights: [
          {
            phase: "harvest",

            daeunWeight: 4,

            seunWeight: 2,

            reason:
              "편재는 외부 기회와 유동 자원을 성과로 연결하려는 수확 작용을 만든다.",
          },

          {
            phase: "transition",

            daeunWeight: 1,

            seunWeight: 1,

            reason:
              "편재는 활동 범위와 자원 흐름이 넓어지면서 기존 운영 방식을 바꾸게 한다.",
          },
        ],
      },

      {
        id: "managed-resource-stability",

        tenGod: "정재",

        weights: [
          {
            phase: "stability",

            daeunWeight: 4,

            seunWeight: 2,

            reason:
              "정재는 수입·지출·책임을 예측 가능한 구조로 관리하며 기반을 안정시키는 작용을 만든다.",
          },

          {
            phase: "harvest",

            daeunWeight: 1,

            seunWeight: 1,

            reason:
              "정재는 꾸준히 축적한 자원을 현실적인 성과로 회수하는 수확 작용도 만든다.",
          },
        ],
      },

      {
        id: "pressure-responsibility-challenge",

        tenGod: "편관",

        weights: [
          {
            phase: "challenge",

            daeunWeight: 4,

            seunWeight: 2,

            reason:
              "편관은 강한 책임과 외부 압력에 대응해야 하는 도전 국면을 만든다.",
          },

          {
            phase: "reset",

            daeunWeight: 1,

            seunWeight: 1,

            reason:
              "편관은 감당 범위를 넘는 구조를 정리하고 기준을 다시 세우게 하는 재설정 작용도 만든다.",
          },
        ],
      },

      {
        id: "order-role-stability",

        tenGod: "정관",

        weights: [
          {
            phase: "stability",

            daeunWeight: 4,

            seunWeight: 2,

            reason:
              "정관은 역할·책임·질서를 분명하게 하여 생활과 사회적 기반을 안정시키는 작용을 만든다.",
          },

          {
            phase: "preparation",

            daeunWeight: 1,

            seunWeight: 1,

            reason:
              "정관은 다음 책임을 맡기 전에 자격과 기준을 갖추게 하는 준비 작용도 만든다.",
          },
        ],
      },

      {
        id: "unconventional-learning-reset",

        tenGod: "편인",

        weights: [
          {
            phase: "reset",

            daeunWeight: 4,

            seunWeight: 2,

            reason:
              "편인은 익숙한 방식에서 벗어나 관점과 생활 구조를 다시 짜는 재설정 작용을 만든다.",
          },

          {
            phase: "preparation",

            daeunWeight: 1,

            seunWeight: 1,

            reason:
              "편인은 새로운 지식과 해석 체계를 익히며 다음 움직임을 준비하게 한다.",
          },
        ],
      },

      {
        id: "support-learning-preparation",

        tenGod: "정인",

        weights: [
          {
            phase: "preparation",

            daeunWeight: 4,

            seunWeight: 2,

            reason:
              "정인은 지식·보호·지원 기반을 쌓아 다음 단계에 필요한 자원을 준비하게 한다.",
          },

          {
            phase: "recovery",

            daeunWeight: 1,

            seunWeight: 1,

            reason:
              "정인은 외부 지원과 내적 정리를 통해 소진된 자원을 회복하게 하는 작용도 만든다.",
          },
        ],
      },
    ];

  export function getHumanLifePhaseEvidenceRule(
    tenGod: SajuLuckFlowTenGod,
  ): HumanLifePhaseEvidenceRule {
    const rule =
      HUMAN_LIFE_PHASE_EVIDENCE_RULES.find(
        (candidate) =>
          candidate.tenGod === tenGod,
      );

    if (!rule) {
      throw new Error(
        `Human life phase evidence rule is missing for tenGod: ${tenGod}`,
      );
    }

    return rule;
  }

  export function getHumanLifePhaseEvidenceWeight(
    rule: HumanLifePhaseWeightRule,
    scope: HumanLifePhaseFlowScope,
  ): number {
    return scope === "daeun"
      ? rule.daeunWeight
      : rule.seunWeight;
  }
