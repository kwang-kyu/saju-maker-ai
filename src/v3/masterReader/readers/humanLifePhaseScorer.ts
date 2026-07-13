import type { HumanLifePhase } from "../types/humanLifePhase";
import type {
  HumanLifePhaseEvidence,
  HumanLifePhaseReaderInput,
} from "../types/humanLifePhaseEvidence";

export type HumanLifePhaseScore = {
  phase: HumanLifePhase;

  supportScore: number;

  counterScore: number;

  finalScore: number;

  evidence: HumanLifePhaseEvidence[];

  counterEvidence: HumanLifePhaseEvidence[];
};

const humanLifePhases: HumanLifePhase[] = [
  "growth",
  "preparation",
  "transition",
  "harvest",
  "stability",
  "challenge",
  "recovery",
  "reset",
];

function calculatePhaseScore(
  phase: HumanLifePhase,
  evidence: HumanLifePhaseEvidence[],
): HumanLifePhaseScore {
  const phaseEvidence = evidence.filter(
    (item) => item.phase === phase,
  );

  const supportEvidence = phaseEvidence.filter(
    (item) => !item.isCounterEvidence,
  );

  const counterEvidence = phaseEvidence.filter(
    (item) => item.isCounterEvidence,
  );

  const supportScore = supportEvidence.reduce(
    (total, item) => total + item.weight,
    0,
  );

  const counterScore = counterEvidence.reduce(
    (total, item) => total + item.weight,
    0,
  );

  return {
    phase,

    supportScore,

    counterScore,

    finalScore: supportScore - counterScore,

    evidence: supportEvidence,

    counterEvidence,
  };
}

export function scoreHumanLifePhases(
  input: HumanLifePhaseReaderInput,
): HumanLifePhaseScore[] {
  return humanLifePhases
    .map((phase) =>
      calculatePhaseScore(phase, input.evidence),
    )
    .sort((a, b) => {
      if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore;
      }
    
      if (b.supportScore !== a.supportScore) {
        return b.supportScore - a.supportScore;
      }
    
      return a.counterScore - b.counterScore;
    });
}