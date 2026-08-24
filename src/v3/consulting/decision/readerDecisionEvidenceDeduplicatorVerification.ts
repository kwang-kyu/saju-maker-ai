import type {
    DecisionEvidence,
  } from "./decisionTypes.js";
  import {
    deduplicateReaderDecisionEvidence,
  } from "./readerDecisionEvidenceDeduplicator.js";
  export type ReaderDecisionEvidenceDeduplicatorVerificationResult = {
    input:
      DecisionEvidence[];
    output:
      DecisionEvidence[];
    checks: Record<
      string,
      boolean
    >;
    passed: boolean;
  };
  export function verifyReaderDecisionEvidenceDeduplicator():
    ReaderDecisionEvidenceDeduplicatorVerificationResult {
    const input:
      DecisionEvidence[] = [
        {
          source: "capacity",
          key:
            "capacity-summary",
          description:
            "책임을 감당하는 구조가 확인된다.",
          weight: 4,
        },
        {
          source: "money",
          key:
            "money-evidence-1",
          description:
            "자원을 반복적으로 관리하는 힘이 확인된다.",
          weight: 3,
        },
        {
          source: "career",
          key:
            "career-evidence-1",
          description:
            "  자원을 반복적으로   관리하는 힘이 확인된다.  ",
          weight: 3,
        },
        {
          source: "relationship",
          key:
            "relationship-summary",
          description:
            "역할과 책임을 나누며 협력하는 구조이다.",
          weight: 4,
        },
        {
          source: "health",
          key:
            "health-evidence-1",
          description:
            "책임을 감당하는 구조가 확인된다.",
          weight: 3,
        },
      ];
    const output =
      deduplicateReaderDecisionEvidence(
        input,
      );
    const checks = {
      duplicateDescriptionsAreRemoved:
        output.length === 3,
      whitespaceDifferencesAreNormalized:
        output.some(
          (item) =>
            item.key
            === "money-evidence-1",
        )
        && !output.some(
          (item) =>
            item.key
            === "career-evidence-1",
        ),
      firstEvidenceIsPreserved:
        output[0]
          ?.key
        === "capacity-summary",
      firstEvidenceMetadataIsPreserved:
        output[0]
          ?.source
        === "capacity"
        && output[0]
          ?.weight
        === 4,
      distinctEvidenceIsPreserved:
        output.some(
          (item) =>
            item.key
            === "relationship-summary",
        ),
      originalOrderIsPreserved:
        output
          .map(
            (item) =>
              item.key,
          )
          .join(",")
        === [
          "capacity-summary",
          "money-evidence-1",
          "relationship-summary",
        ].join(","),
    };
    return {
      input,
      output,
      checks,
      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }