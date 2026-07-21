import type {
    DecisionEvidence,
  } from "./decisionTypes";
  function normalizeEvidenceDescription(
    description: string,
  ): string {
    return description
      .trim()
      .replace(
        /\s+/g,
        " ",
      );
  }
  export function deduplicateReaderDecisionEvidence(
    evidence:
      DecisionEvidence[],
  ): DecisionEvidence[] {
    const seenDescriptions =
      new Set<string>();
    return evidence.filter(
      (item) => {
        const normalizedDescription =
          normalizeEvidenceDescription(
            item.description,
          );
        if (
          seenDescriptions.has(
            normalizedDescription,
          )
        ) {
          return false;
        }
        seenDescriptions.add(
          normalizedDescription,
        );
        return true;
      },
    );
  }