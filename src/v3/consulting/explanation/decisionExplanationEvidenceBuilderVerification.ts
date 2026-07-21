import type {
    DecisionExplanationEvidence,
  } from "./decisionResultReader";
  import {
    buildDecisionExplanationEvidence,
  } from "./decisionExplanationEvidenceBuilder";
  export type DecisionExplanationEvidenceBuilderVerificationResult = {
    content: string;
    checks: Record<
      string,
      boolean
    >;
    passed: boolean;
  };
  export function verifyDecisionExplanationEvidenceBuilder():
    DecisionExplanationEvidenceBuilderVerificationResult {
    const evidence:
      DecisionExplanationEvidence[] = [
        {
          source: "humanIdentity",
          description:
            "사람의 중심 구조",
          importance: "core",
        },
        {
          source: "capacity",
          description:
            "감당력 요약",
          importance: "core",
        },
        {
          source: "capacity",
          description:
            "감당력 하위 원문",
          importance: "supporting",
        },
        {
          source: "money",
          description:
            "재물 구조 요약",
          importance: "core",
        },
        {
          source: "money",
          description:
            "재물 구조 하위 원문",
          importance: "supporting",
        },
        {
          source: "survivalStyle",
          description:
            "현실 대응 방식",
          importance: "supporting",
        },
        {
          source: "repeatedPattern",
          description:
            "반복 패턴 근거",
          importance: "supporting",
        },
        {
          source: "questionIntent",
          description:
            "질문의 실제 의도",
          importance: "supporting",
        },
      ];
    const content =
      buildDecisionExplanationEvidence(
        evidence,
      );
    const checks = {
      coreEvidenceIsIncluded:
        content.includes(
          "사람의 중심 구조",
        ),
      readerSummaryIsIncluded:
        content.includes(
          "감당력 요약",
        )
        && content.includes(
          "재물 구조 요약",
        ),
      readerSupportingEvidenceIsExcluded:
        !content.includes(
          "감당력 하위 원문",
        )
        && !content.includes(
          "재물 구조 하위 원문",
        ),
      survivalStyleIsPreserved:
        content.includes(
          "현실 대응 방식",
        ),
      repeatedPatternIsPreserved:
        content.includes(
          "반복 패턴 근거",
        ),
      questionIntentIsPreserved:
        content.includes(
          "질문의 실제 의도",
        ),
      originalOrderIsPreserved:
        content
        === [
          "사람의 중심 구조",
          "감당력 요약",
          "재물 구조 요약",
          "현실 대응 방식",
          "반복 패턴 근거",
          "질문의 실제 의도",
        ].join("\n"),
    };
    return {
      content,
      checks,
      passed:
        Object.values(checks)
          .every(Boolean),
    };
  }