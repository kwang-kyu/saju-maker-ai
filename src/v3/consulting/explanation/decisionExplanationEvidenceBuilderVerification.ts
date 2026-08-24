import type {
  DecisionExplanationEvidence,
} from "./decisionResultReader.js";
import {
  buildDecisionExplanationEvidence,
} from "./decisionExplanationEvidenceBuilder.js";

export type DecisionExplanationEvidenceBuilderVerificationResult = {
  cases: Array<{
    name: string;
    content: string;
    checks: Record<
      string,
      boolean
    >;
    passed: boolean;
  }>;
  passed: boolean;
};

function buildSampleEvidence():
  DecisionExplanationEvidence[] {
  return [
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
      source: "career",
      description:
        "직업 구조 요약",
      importance: "core",
    },
    {
      source: "relationship",
      description:
        "관계 구조 요약",
      importance: "core",
    },
    {
      source: "destiny",
      description:
        "장기 방향 구조 요약",
      importance: "core",
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
    {
      source: "humanIdentity",
      description:
        "",
      importance: "core",
    },
    {
      source: "humanIdentity",
      description:
        "사람의 중심 구조",
      importance: "core",
    },
  ];
}

function snapshotEvidence(
  evidence:
    DecisionExplanationEvidence[],
): string {
  return JSON.stringify(
    evidence,
  );
}

function verifyBusinessWithoutReaderEffectSources():
  DecisionExplanationEvidenceBuilderVerificationResult["cases"][number] {
  const evidence =
    buildSampleEvidence();
  const originalSnapshot =
    snapshotEvidence(
      evidence,
    );
  const input = {
    evidence,
    topic:
      "business" as const,
    readerEffectSources:
      [] as const,
  };
  const content =
    buildDecisionExplanationEvidence(
      input,
    );
  const repeatedContent =
    buildDecisionExplanationEvidence(
      input,
    );
  const expectedContent = [
    "사람의 중심 구조",
    "감당력 요약",
    "재물 구조 요약",
    "현실 대응 방식",
    "반복 패턴 근거",
    "질문의 실제 의도",
  ].join(
    "\n",
  );
  const checks = {
    coreHumanIdentityIsPreserved:
      content.includes(
        "사람의 중심 구조",
      ),
    capacitySummaryIsIncluded:
      content.includes(
        "감당력 요약",
      ),
    moneySummaryIsIncluded:
      content.includes(
        "재물 구조 요약",
      ),
    careerSummaryIsExcluded:
      !content.includes(
        "직업 구조 요약",
      ),
    relationshipSummaryIsExcluded:
      !content.includes(
        "관계 구조 요약",
      ),
    destinySummaryIsExcluded:
      !content.includes(
        "장기 방향 구조 요약",
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
    emptyDescriptionIsExcluded:
      content
        .split("\n")
        .every(
          (line) =>
            line.trim().length
            > 0,
        ),
    duplicateDescriptionIsRemoved:
      content
        .split("\n")
        .filter(
          (line) =>
            line
            === "사람의 중심 구조",
        ).length === 1,
    originalOrderIsPreserved:
      content === expectedContent,
    originalEvidenceIsUnchanged:
      snapshotEvidence(
        evidence,
      )
      === originalSnapshot,
    outputIsDeterministic:
      content === repeatedContent,
    sameInputProducesSameOutput:
      content
      === buildDecisionExplanationEvidence(
        {
          evidence:
            buildSampleEvidence(),
          topic:
            "business",
          readerEffectSources:
            [],
        },
      ),
  };

  return {
    name:
      "business-without-reader-effect-sources",
    content,
    checks,
    passed:
      Object.values(checks)
        .every(Boolean),
  };
}

function verifyBusinessWithRelationshipReaderEffect():
  DecisionExplanationEvidenceBuilderVerificationResult["cases"][number] {
  const evidence =
    buildSampleEvidence();
  const originalSnapshot =
    snapshotEvidence(
      evidence,
    );
  const input = {
    evidence,
    topic:
      "business" as const,
    readerEffectSources: [
      "relationship" as const,
    ],
  };
  const content =
    buildDecisionExplanationEvidence(
      input,
    );
  const repeatedContent =
    buildDecisionExplanationEvidence(
      input,
    );
  const expectedContent = [
    "사람의 중심 구조",
    "관계 구조 요약",
    "현실 대응 방식",
    "반복 패턴 근거",
    "질문의 실제 의도",
  ].join(
    "\n",
  );
  const checks = {
    coreHumanIdentityIsPreserved:
      content.includes(
        "사람의 중심 구조",
      ),
    relationshipSummaryIsIncluded:
      content.includes(
        "관계 구조 요약",
      ),
    otherReaderSummariesAreExcluded:
      !content.includes(
        "감당력 요약",
      )
      && !content.includes(
        "재물 구조 요약",
      )
      && !content.includes(
        "직업 구조 요약",
      )
      && !content.includes(
        "장기 방향 구조 요약",
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
    emptyDescriptionIsExcluded:
      content
        .split("\n")
        .every(
          (line) =>
            line.trim().length
            > 0,
        ),
    duplicateDescriptionIsRemoved:
      content
        .split("\n")
        .filter(
          (line) =>
            line
            === "사람의 중심 구조",
        ).length === 1,
    originalOrderIsPreserved:
      content === expectedContent,
    originalEvidenceIsUnchanged:
      snapshotEvidence(
        evidence,
      )
      === originalSnapshot,
    outputIsDeterministic:
      content === repeatedContent,
    sameInputProducesSameOutput:
      content
      === buildDecisionExplanationEvidence(
        {
          evidence:
            buildSampleEvidence(),
          topic:
            "business",
          readerEffectSources: [
            "relationship",
          ],
        },
      ),
  };

  return {
    name:
      "business-with-relationship-reader-effect",
    content,
    checks,
    passed:
      Object.values(checks)
        .every(Boolean),
  };
}

export function verifyDecisionExplanationEvidenceBuilder():
  DecisionExplanationEvidenceBuilderVerificationResult {
  const cases = [
    verifyBusinessWithoutReaderEffectSources(),
    verifyBusinessWithRelationshipReaderEffect(),
  ];

  return {
    cases,
    passed:
      cases.every(
        (item) =>
          item.passed,
      ),
  };
}
