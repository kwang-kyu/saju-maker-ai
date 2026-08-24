import {
    deduplicateExplanationLines,
  } from "./decisionExplanationTextDeduplicator.js";

  export type DecisionExplanationTextDeduplicatorVerificationCase = {
    name: string;

    passed: boolean;

    expected: string[];

    actual: string[];
  };

  export type DecisionExplanationTextDeduplicatorVerificationResult = {
    cases:
      DecisionExplanationTextDeduplicatorVerificationCase[];

    passed: boolean;
  };

  function areLinesEqual(
    actual: readonly string[],
    expected: readonly string[],
  ): boolean {
    return (
      actual.length === expected.length
      && actual.every(
        (line, index) =>
          line === expected[index],
      )
    );
  }

  function buildVerificationCase(
    name: string,
    input: readonly string[],
    expected: readonly string[],
    excludedLines: readonly string[] = [],
  ): DecisionExplanationTextDeduplicatorVerificationCase {
    const actual =
      deduplicateExplanationLines(
        input,
        excludedLines,
      );

    return {
      name,

      passed:
        areLinesEqual(
          actual,
          expected,
        ),

      expected:
        [...expected],

      actual,
    };
  }

  function verifyInputOrderIsPreserved():
    DecisionExplanationTextDeduplicatorVerificationCase {
    return buildVerificationCase(
      "입력 문장의 순서를 보존한다.",
      [
        "첫 번째 판단 근거",
        "두 번째 실행 조건",
        "세 번째 위험 요소",
      ],
      [
        "첫 번째 판단 근거",
        "두 번째 실행 조건",
        "세 번째 위험 요소",
      ],
    );
  }

  function verifyEmptyLinesAreRemoved():
    DecisionExplanationTextDeduplicatorVerificationCase {
    return buildVerificationCase(
      "빈 문장과 공백 문장을 제거한다.",
      [
        "",
        "   ",
        "\t",
        "유효한 판단 문장",
        "\n",
      ],
      [
        "유효한 판단 문장",
      ],
    );
  }

  function verifyWhitespaceDuplicatesAreRemoved():
    DecisionExplanationTextDeduplicatorVerificationCase {
    return buildVerificationCase(
      "공백 차이만 있는 동일 문장을 제거한다.",
      [
        "생활비를 제외한 여유자금이 필요합니다.",
        "  생활비를 제외한 여유자금이 필요합니다.  ",
        "생활비를  제외한   여유자금이 필요합니다.",
        "부채 상환 부담을 먼저 확인해야 합니다.",
      ],
      [
        "생활비를 제외한 여유자금이 필요합니다.",
        "부채 상환 부담을 먼저 확인해야 합니다.",
      ],
    );
  }

  function verifyExcludedLinesAreRemoved():
    DecisionExplanationTextDeduplicatorVerificationCase {
    return buildVerificationCase(
      "앞 블록에서 이미 사용된 문장을 제외한다.",
      [
        "퇴직금이 투자 자금으로 언급되었습니다.",
        "손실이 발생하면 생활 기반이 흔들릴 수 있습니다.",
        "소액 검증을 먼저 진행해야 합니다.",
      ],
      [
        "손실이 발생하면 생활 기반이 흔들릴 수 있습니다.",
        "소액 검증을 먼저 진행해야 합니다.",
      ],
      [
        "  퇴직금이  투자 자금으로 언급되었습니다.  ",
      ],
    );
  }

  function verifySimilarButDifferentLinesArePreserved():
    DecisionExplanationTextDeduplicatorVerificationCase {
    return buildVerificationCase(
      "주제가 유사해도 역할과 내용이 다른 문장은 보존한다.",
      [
        "질문에 퇴직금을 투자 자금으로 사용하려는 현실이 명시되어 있습니다.",
        "퇴직금과 생활비를 제외한 별도 여유자금을 확보해야 합니다.",
        "퇴직금을 투자하면 손실 시 생활 기반과 노후 자금이 함께 약해질 수 있습니다.",
      ],
      [
        "질문에 퇴직금을 투자 자금으로 사용하려는 현실이 명시되어 있습니다.",
        "퇴직금과 생활비를 제외한 별도 여유자금을 확보해야 합니다.",
        "퇴직금을 투자하면 손실 시 생활 기반과 노후 자금이 함께 약해질 수 있습니다.",
      ],
    );
  }

  function verifyFirstOriginalLineIsPreserved():
    DecisionExplanationTextDeduplicatorVerificationCase {
    return buildVerificationCase(
      "중복 문장 중 처음 입력된 원문을 보존한다.",
      [
        "  실행 전에 자금 계획을 확인해야 합니다.  ",
        "실행 전에  자금 계획을 확인해야 합니다.",
      ],
      [
        "실행 전에 자금 계획을 확인해야 합니다.",
      ],
    );
  }

  export function verifyDecisionExplanationTextDeduplicator():
    DecisionExplanationTextDeduplicatorVerificationResult {
    const cases = [
      verifyInputOrderIsPreserved(),
      verifyEmptyLinesAreRemoved(),
      verifyWhitespaceDuplicatesAreRemoved(),
      verifyExcludedLinesAreRemoved(),
      verifySimilarButDifferentLinesArePreserved(),
      verifyFirstOriginalLineIsPreserved(),
    ];

    return {
      cases,

      passed:
        cases.every(
          (verificationCase) =>
            verificationCase.passed,
        ),
    };
  }