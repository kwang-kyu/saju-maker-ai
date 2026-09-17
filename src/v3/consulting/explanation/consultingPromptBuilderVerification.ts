import {
  buildDecisionEngineRegressionInput,
} from "../decision/regression/decisionEngineRegressionFixture.js";

import {
  runDecisionEngine,
} from "../decision/decisionEngine.js";

import {
  buildQuestionContext,
} from "../question/questionContextBuilder.js";

import {
  readQuestion,
} from "../question/questionReader.js";

import {
  readDecisionResult,
  type DecisionExplanationInput,
} from "./decisionResultReader.js";

import type {
  LifeFlowInterpretationAssessment,
} from "../decision/lifeFlowInterpretationAssessment.js";

import {
  buildDecisionExplanationPlan,
} from "./decisionExplanationPlan.js";

import type {
  DecisionExplanationFocus,
} from "./decisionExplanationFocus.js";

import {
  buildDecisionExplanationPayload,
} from "./decisionExplanationPayload.js";

import {
  buildConsultingPrompt,
  resolveConsultingAnswerMode,
  type ConsultingAnswerMode,
  type ConsultingPrompt,
} from "./consultingPromptBuilder.js";

import {
  buildConsultingGroundingContext,
} from "./consultingGroundingContextBuilder.js";

import {
  verifyRoleRecommendationExplanation,
} from "./roleRecommendationExplanationVerification.js";

import {
  verifyConsultingAnswerQuality,
} from "./consultingAnswerQualityVerification.js";

import {
  verifyReaderDecisionExplanationIntegration,
  type ReaderDecisionExplanationIntegrationVerificationResult,
} from "./readerDecisionExplanationIntegrationVerification.js";

const OLD_LAST_PARAGRAPH_COPY_RULE =
  "답변의 마지막 단락에는 제공된 엔진 확정 최종 결론을 한 글자도 변경하지 않고 그대로 작성한다";

const ROLE_QUESTION =
  "내가 연극을 하면 어떤 역할이 어울릴까요?";

const LIFE_FLOW_QUESTION =
  "올해 총운을 봐주세요";

const BUSINESS_START_PROMPT_MARKERS = [
  "사업을 시작하는 것이 맞는지 중심으로 답한다",
  "현재 시점, 성공 조건, 사업 위험, 실행 방향을 필요한 만큼 설명한다",
] as const;

const DIRECT_ANSWER_PRIORITY_BLOCK_MARKERS = [
  "직답 우선 원칙",
  "이것은 고정 문장 템플릿이 아니라 답변 생성의 우선순위다",
  "사용자가 묻는 행동과 판단 대상을 먼저 파악한다",
  "엔진 verdict와 최종 결론의 의미를 그 대상에 적용해서 설명한다",
  "질문에 대한 판단을 제시하지 않은 채",
  "사주 성향이나 인생 일반론부터 길게 설명하지 않는다",
  "evidence는 직답을 뒷받침하는 데 사용한다",
  "조건과 위험은 판단에 실제로 필요한 경우에만 사용한다",
  "질문과 직접 관련 없는 Reader 설명은 생략한다",
  "엔진 판단을 새로 만들거나 뒤집지 않는다",
  "답변 본문에는 finalDecision 원문 전체를 정확히 한 번 포함한다",
  "단어·조사·문장 구조를 바꾸거나 요약·재작성하지 않는다",
  "finalDecision과 같은 의미의 별도 결론 문장을 추가로 만들지 않는다",
  "finalDecision 원문 주변 설명은 원래 질문의 대상과 행동에 적용한다",
] as const;

const DIRECT_ANSWER_PRIORITY_BLOCK_END_MARKERS = [
  "\n영역·기간 흐름 해석 원칙",
  "\n근거 선택 원칙",
  "\n질문형 근거 사용 원칙",
  "\n정보 부족 표현 원칙",
  "\n확인 원자료 사용 원칙",
  "\n설명 구성 원칙",
] as const;

const REPORT_ANSWER_PRIORITY_MARKERS = [
  "영역·기간 흐름 해석 원칙",
  "질문한 영역과 기간의 전체 흐름을 우선 설명한다",
  "해당 영역의 관련 evidence를 활용한다",
  "강점, 가능성, 주의점, 변화 흐름을 설명한다",
  "특정 행동 판단을 억지로 만들지 않는다",
  "\"정보가 부족하다\"를 기본 시작 문장으로 사용하지 않는다",
  "현재 자료로 설명 가능한 범위는 충분히 설명한다",
  "전문적인 절기·대운 기준은 사용자가 이해할 수 있는 방식으로 설명한다",
  "한 해의 운이 달력 1월 1일이 아니라 입춘을 기준으로 바뀐다는 의미를 먼저 설명하고",
] as const;

const PARTNERSHIP_QUESTION_MARKERS = [
  "동업 질문 답변 원칙",
  "사업·동업 판단을 중심으로 답한다",
  "상대 궁합은 동업 판단의 보조 근거로만 사용한다",
  "궁합 설명이 답변 전체를 지배하지 않게 한다",
] as const;

const EVIDENCE_SELECTION_MARKERS = [
  "근거 선택 원칙",
  "자료가 있다는 이유만으로 설명하지 않는다. 질문에 필요하므로 설명한다.",
  "핵심 근거",
  "보조 근거",
  "비관련 근거",
  "근거의 강도만 보고 선택하지 않는다. 질문과의 관련성을 먼저 본다.",
  "강한 근거라도 질문과 관계없으면 사용하지 않는다.",
  "약한 근거라도 질문의 핵심 판단과 직접 연결된다면 필요한 만큼 사용할 수 있다.",
] as const;

const QUESTION_EVIDENCE_PRIORITY_MARKERS = [
  "질문형 근거 사용 원칙",
  "질문형에서는 근거를 최대한 선택적으로 사용한다.",
  "evidence, conditions, risks, recommendedDirection, prohibitedDirection은 질문과 관련 있을 때 우선 사용한다.",
  "관련 없는 근거는 사용하지 않는다.",
  "질문과 직접 관계없는 건강, 직업, 인생 Reader 설명을 자동으로 모두 사용하지 않는다.",
  "근거가 많다는 이유로 모든 근거를 설명하지 않는다.",
  "같은 사람의 삶의 동력을 매번 처음부터 설명하지 않는다.",
  "재물 질문이 아닌데 재물 흐름을 장황하게 설명하지 않는다.",
  "관계 질문이 아닌데 관계 특성을 장황하게 설명하지 않는다.",
] as const;

const MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS = [
  "제공된 질문 의도(primary Intent)는 답변의 판단 중심이다.",
  "원문에 서로 다른 요구가 함께 포함되어 있으면, primary Intent를 중심으로 답하되 원문에 명시된 secondary 요구도 엔진이 제공한 판단 자료(evidence, conditions, risks, recommendedDirection, prohibitedDirection 등) 범위 안에서 함께 설명한다.",
  "secondary 요구를 이유로 엔진의 primary 판단을 재판단하거나, verdict·direction·conditions·risks를 변경하지 않는다.",
  "엔진이 제공하지 않은 새로운 사실이나 판단을 secondary 요구 설명이라도 만들지 않는다.",
  "질문의 중심을 유지하면서 원문에 포함된 명시적 요구사항을 빠뜨리지 않았는가?",
] as const;

const MULTI_SPEECHACT_OLD_FINAL_CHECK_MARKER =
  "질문 유형의 중심에 맞게 답했는가?";

const METHOD_PROXY_MATERIAL_BINDING_MARKERS = [
  "secondary 요구가 method이면, 이미 제공된 conditions와 recommendedDirection·prohibitedDirection(directions)만 방법 설명의 proxy로 쓴다.",
  "risks는 primary risk 판단/설명용이며, secondary method를 설명하는 방법 자료로 쓰지 않는다.",
  "secondary method 때문에 evidence를 별도 method 근거로 확장하거나, method 전용 material을 만들거나, 없는 material·무관한 Reader/domain 자료를 추가하지 않는다.",
] as const;

const METHOD_PROXY_FORBIDDEN_ALLOWING_MARKERS = [
  "risks를 방법 설명의 proxy로 쓴다",
  "risks도 방법 자료로 사용",
  "secondary method를 설명하는 방법 자료로 쓴다",
  "evidence를 별도 method 근거로 확장한다",
  "method 전용 material을 만든다",
  "없는 material·무관한 Reader/domain 자료를 추가한다",
] as const;

const REPORT_EVIDENCE_PRIORITY_MARKERS = [
  "리포트형 근거 사용 원칙",
  "리포트형은 질문형보다 더 많은 근거를 사용할 수 있다.",
  "그러나 모든 Reader를 설명한다는 뜻이 아니다.",
  "질문한 영역에 해당하는 자료를 중심으로 선택한다.",
  "질문 영역과 관계없는 Reader 설명을 과도하게 사용하지 않는다.",
  "모든 Reader를 같은 비중으로 나열하지 않는다.",
  "필요한 근거가 많으면 충분히 설명한다. 억지로 짧게 만들지 않는다.",
] as const;

const EVIDENCE_COMPRESSION_MARKERS = [
  "반복 근거 압축 원칙",
  "답변을 기계적으로 몇 자 이하로 제한하지 않는다.",
  "문단 수를 고정하지 않는다.",
  "핵심은 길이가 아니라 정보 밀도다.",
  "질문과 관계없는 설명이 없는 답변이 목표다.",
  "같은 순서와 같은 분량으로 반복하지 않는다.",
  "질문에 필요한 의미만 사용한다.",
] as const;

const QUESTION_SPECIFIC_EVIDENCE_PRIORITY_MARKERS = [
  "질문형의 설명 순서는 질문, 직답, 핵심 근거, 필요한 조건과 위험, 방향이다",
  "삶의 동력, 생존 방식, 반복 패턴, 정체성, 인생 국면, 현재 운, 무관한 Reader는 질문에 실제 기여할 때만 사용한다",
  "질문마다 자동 반복하지 않는다",
] as const;

const REPORT_SPECIFIC_EVIDENCE_PRIORITY_MARKERS = [
  "리포트형의 설명 순서는 질문 영역의 전체 흐름, 핵심 근거, 변화와 강점과 주의, 활용 방향이다",
  "연애운, 재물운, 사업운, 총운의 기존 충분한 설명력을 유지한다",
  "과도하게 압축하지 않는다",
] as const;

const MONEY_RECOVERY_EVIDENCE_PRIORITY_MARKERS = [
  "돈 회수 질문이라면 회수 가능성에 대한 엔진 판단, 회수 조건, 제한 요소, 위험, 실행 조건을 우선한다",
  "일반 재물운, 전체 사업운, 전체 직업운, 인생운",
  "자동으로 길게 쓰지 않는다",
] as const;

const PARTNERSHIP_EVIDENCE_PRIORITY_MARKERS = [
  "역할, 책임, 권한, 금전, 갈등 조정을 우선한다",
  "궁합은 동업 판단의 보조 근거이며 답변의 중심이 아니다",
] as const;

const CONTINUATION_EVIDENCE_PRIORITY_MARKERS = [
  "갈등, 신뢰, 대기 중 확인사항",
  "기다리며 지켜보라는 판단을 정보가 부족하다로 바꾸지 않는다",
] as const;

const BUSINESS_START_EVIDENCE_PRIORITY_MARKERS = [
  "시작 가능 여부를 중심으로 한다",
  "자금, 책임, 실행 조건과 위험을 사용한다",
  "현재 확장 흐름은 필요할 때만 보조한다",
] as const;

const INSUFFICIENT_EVIDENCE_RANGE_MARKERS = [
  "질문 자체에 대한 현재 판단 가능한 범위를 먼저 설명한다",
  "공통 정보 부족 문장으로 길게 끝내지 않는다.",
  "지금 질문에 대해 무엇을 말할 수 있는지를 먼저 설명한다.",
  "현재 evidence가 어떤 방향을 보여주는지를 설명한다.",
] as const;

const FORBIDDEN_MECHANICAL_TEMPLATE_MARKERS = [
  "첫 문단에는 반드시 결론을 작성한다",
  "마지막 단락에 제목이나 '최종 판단' 형식을 붙여 finalDecision을 복사한다",
  "답변의 마지막 단락에는 제공된 엔진 확정 최종 결론을 한 글자도 변경하지 않고 그대로 작성한다",
  "결론 → 이유 → 실행전략 → 주의 → 오늘의 과제",
  "번호가 매겨진 explanationOrder를 그대로 나열",
  "먼저 이 사람에게서 현재 질문과 관련된 강점과 취약점",
  "먼저 강점과 취약점",
] as const;

const INSUFFICIENT_EVIDENCE_AVOIDANCE_FORBIDDEN_MARKERS = [
  "정보 부족이면 판단하지 않는다",
  "정보가 부족하면 답하지 않는다",
  "정보 부족이면 판단하지 말",
] as const;

const FOUR_QUESTION_FIXTURES = [
  {
    id:
      "compatibility",

    question:
      "우리 둘의 궁합은 어떤가요?",

    expectedFocus:
      "compatibility" as const,
  },
  {
    id:
      "partnership",

    question:
      "친구와 통닭집을 동업해도 될까요?",

    expectedFocus:
      null,
  },
  {
    id:
      "continuation",

    question:
      "남자친구와 계속 만나야 할까요?",

    expectedFocus:
      "continuation" as const,
  },
  {
    id:
      "moneyRecovery",

    question:
      "이번에 빌려준 돈을 받을 수 있을까요?",

    expectedFocus:
      "generalJudgement" as const,
  },
] as const;

function extractDirectAnswerPriorityBlock(
  systemPrompt:
    string,
): string | null {
  const startMarker =
    "직답 우선 원칙";

  const startIndex =
    systemPrompt.indexOf(
      startMarker,
    );

  if (
    startIndex
    < 0
  ) {
    return null;
  }

  let endIndex =
    systemPrompt.length;

  for (const endMarker of DIRECT_ANSWER_PRIORITY_BLOCK_END_MARKERS) {
    const markerIndex =
      systemPrompt.indexOf(
        endMarker,
        startIndex
        + startMarker.length,
      );

    if (
      markerIndex
      >= 0
      && markerIndex
      < endIndex
    ) {
      endIndex =
        markerIndex;
    }
  }

  return systemPrompt.slice(
    startIndex,
    endIndex,
  );
}

function directAnswerPriorityBlockIncludesFinalDecisionPolicy(
  block:
    string,
): boolean {
  return (
    block.includes(
      "답변 본문에는 finalDecision 원문 전체를 정확히 한 번 포함한다",
    )
    && block.includes(
      "단어·조사·문장 구조를 바꾸거나 요약·재작성하지 않는다",
    )
    && block.includes(
      "finalDecision과 같은 의미의 별도 결론 문장을 추가로 만들지 않는다",
    )
  );
}

function hasDirectAnswerPriority(
  prompt:
    ConsultingPrompt,
): boolean {
  const block =
    extractDirectAnswerPriorityBlock(
      prompt.systemPrompt,
    );

  if (
    !block
  ) {
    return false;
  }

  return (
    DIRECT_ANSWER_PRIORITY_BLOCK_MARKERS.every(
      (marker) =>
        block.includes(
          marker,
        ),
    )
    && directAnswerPriorityBlockIncludesFinalDecisionPolicy(
      block,
    )
  );
}

function hasReportAnswerPriority(
  prompt:
    ConsultingPrompt,
): boolean {
  return REPORT_ANSWER_PRIORITY_MARKERS.every(
    (marker) =>
      prompt.systemPrompt.includes(
        marker,
      ),
  );
}

function isQuestionAnswerModePrompt(
  prompt:
    ConsultingPrompt,
): boolean {
  return (
    hasDirectAnswerPriority(
      prompt,
    )
    && !prompt.systemPrompt.includes(
      "영역·기간 흐름 해석 원칙",
    )
  );
}

function isReportAnswerModePrompt(
  prompt:
    ConsultingPrompt,
): boolean {
  return (
    hasReportAnswerPriority(
      prompt,
    )
    && !prompt.systemPrompt.includes(
      "직답 우선 원칙",
    )
    && !prompt.userPrompt.includes(
      "질문에 대한 직답을 우선으로 작성하세요",
    )
  );
}

function hasPartnershipBusinessCenter(
  prompt:
    ConsultingPrompt,
): boolean {
  return PARTNERSHIP_QUESTION_MARKERS.every(
    (marker) =>
      prompt.systemPrompt.includes(
        marker,
      ),
  );
}

function hasEvidenceSelection(
  prompt:
    ConsultingPrompt,
): boolean {
  return EVIDENCE_SELECTION_MARKERS.every(
    (marker) =>
      prompt.systemPrompt.includes(
        marker,
      ),
  );
}

function hasQuestionEvidencePriority(
  prompt:
    ConsultingPrompt,
): boolean {
  return QUESTION_EVIDENCE_PRIORITY_MARKERS.every(
    (marker) =>
      prompt.systemPrompt.includes(
        marker,
      ),
  );
}

function hasReportEvidencePriority(
  prompt:
    ConsultingPrompt,
): boolean {
  return REPORT_EVIDENCE_PRIORITY_MARKERS.every(
    (marker) =>
      prompt.systemPrompt.includes(
        marker,
      ),
  );
}

function hasEvidenceCompression(
  prompt:
    ConsultingPrompt,
): boolean {
  return EVIDENCE_COMPRESSION_MARKERS.every(
    (marker) =>
      prompt.systemPrompt.includes(
        marker,
      ),
  );
}

function omitsMechanicalTemplates(
  prompt:
    ConsultingPrompt,
): boolean {
  const combined =
    combinedPromptText(
      prompt,
    );

  return FORBIDDEN_MECHANICAL_TEMPLATE_MARKERS.every(
    (marker) =>
      !combined.includes(
        marker,
      ),
  );
}

function omitsInsufficientEvidenceAvoidanceRule(
  prompt:
    ConsultingPrompt,
): boolean {
  const combined =
    combinedPromptText(
      prompt,
    );

  return INSUFFICIENT_EVIDENCE_AVOIDANCE_FORBIDDEN_MARKERS.every(
    (marker) =>
      !combined.includes(
        marker,
      ),
  );
}

function keepsQuestionContextRules(
  prompt:
    ConsultingPrompt,
): boolean {
  return (
    prompt.userPrompt.includes(
      "알고 싶은 점:",
    )
    && prompt.userPrompt.includes(
      "이유의 초점:",
    )
    && prompt.userPrompt.includes(
      "결정할 질문:",
    )
    && prompt.userPrompt.includes(
      "분석의 초점:",
    )
    && prompt.userPrompt.includes(
      "대상:",
    )
  );
}

export type ConsultingPromptBuilderVerificationCase = {
  name:
    string;

  question:
    string;

  focus:
    DecisionExplanationFocus
    | null;

  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

export type ConsultingPromptBuilderVerificationResult = {
  cases:
    ConsultingPromptBuilderVerificationCase[];

  passed:
    boolean;
};

function combinedPromptText(
  prompt:
    ConsultingPrompt,
): string {
  return [
    prompt.systemPrompt,
    prompt.userPrompt,
  ].join(
    "\n",
  );
}

function systemPromptForbidsFinalDecisionChange(
  prompt:
    ConsultingPrompt,
): boolean {
  return (
    prompt.systemPrompt.includes(
      "payload.finalDecision은 엔진이 확정한 최종 결론이다.",
    )
    && prompt.systemPrompt.includes(
      "finalDecision의 단어, 조사, 문장 구조를 바꾸거나 요약하거나 자연스럽게 재작성하지 않는다.",
    )
  );
}

function systemPromptRequiresFinalDecisionOnceInBody(
  prompt:
    ConsultingPrompt,
): boolean {
  return prompt.systemPrompt.includes(
    "답변 본문에는 payload.finalDecision의 원문 전체를 정확히 한 번 포함해야 한다.",
  );
}

function systemPromptOmitsLastParagraphCopyRule(
  prompt:
    ConsultingPrompt,
): boolean {
  return (
    !prompt.systemPrompt.includes(
      OLD_LAST_PARAGRAPH_COPY_RULE,
    )
    && !prompt.userPrompt.includes(
      "위 최종 결론을 답변의 마지막 단락에",
    )
  );
}

function systemPromptForbidsFinalDecisionPrefixLabels(
  prompt:
    ConsultingPrompt,
): boolean {
  return prompt.systemPrompt.includes(
    "finalDecision 원문 앞뒤에 최종 결론, 최종 판단 같은 제목이나 형식 라벨을 붙이지 않는다.",
  );
}

function userPromptIncludesCanonicalFinalDecision(
  prompt:
    ConsultingPrompt,
  finalDecision:
    string,
): boolean {
  if (
    finalDecision.trim().length
    === 0
  ) {
    return false;
  }

  const sectionMarker =
    "엔진이 확정한 최종 결론";

  const markerIndex =
    prompt.userPrompt.indexOf(
      sectionMarker,
    );

  if (
    markerIndex
    < 0
  ) {
    return false;
  }

  const afterSection =
    prompt.userPrompt.slice(
      markerIndex,
    );

  return afterSection.includes(
    finalDecision,
  );
}

function userPromptIncludesFinalDecisionSection(
  prompt:
    ConsultingPrompt,
): boolean {
  return prompt.userPrompt.includes(
    "엔진이 확정한 최종 결론",
  );
}

function userPromptRequiresFinalDecisionVerbatimOnce(
  prompt:
    ConsultingPrompt,
): boolean {
  return (
    prompt.userPrompt.includes(
      "'엔진이 확정한 최종 결론'에 적힌 finalDecision 원문 전체를 답변 본문에 정확히 한 번 그대로 포함하세요",
    )
    && prompt.userPrompt.includes(
      "단어·조사·문장 구조를 바꾸거나 요약·재작성하지 마세요",
    )
  );
}

function userPromptForbidsDuplicateFinalDecisionMeaning(
  prompt:
    ConsultingPrompt,
): boolean {
  return prompt.userPrompt.includes(
    "finalDecision과 같은 의미의 별도 결론 문장을 추가로 만들지 마세요",
  );
}

function userPromptFinalChecklistIncludesFinalDecisionPolicy(
  prompt:
    ConsultingPrompt,
): boolean {
  return (
    prompt.userPrompt.includes(
      "작성 전 최종 확인",
    )
    && prompt.userPrompt.includes(
      "'엔진이 확정한 최종 결론'에 적힌 finalDecision 원문 전체가 답변 본문에 정확히 한 번만 포함되었는가?",
    )
    && prompt.userPrompt.includes(
      "finalDecision을 바꿔 쓰거나, 요약하거나, 같은 의미의 별도 결론 문장을 추가하지 않았는가?",
    )
  );
}

function userPromptIncludesFinalDecisionPolicy(
  prompt:
    ConsultingPrompt,
  finalDecision:
    string,
): boolean {
  return (
    userPromptIncludesFinalDecisionSection(
      prompt,
    )
    && userPromptIncludesCanonicalFinalDecision(
      prompt,
      finalDecision,
    )
    && userPromptRequiresFinalDecisionVerbatimOnce(
      prompt,
    )
    && userPromptForbidsDuplicateFinalDecisionMeaning(
      prompt,
    )
    && userPromptFinalChecklistIncludesFinalDecisionPolicy(
      prompt,
    )
  );
}

const INTEGRATION_CHECKS_EXCLUDED_FROM_REGRESSION =
  new Set([
    "promptIncludesFinalDecisionOnce",
    "readerContentExplainsWait",
  ]);

function integrationCasePassesWithCurrentFinalDecisionPolicy(
  verificationCase:
    ReaderDecisionExplanationIntegrationVerificationResult["cases"][number],
): boolean {
  const integrationChecksPass =
    Object.entries(
      verificationCase.checks,
    )
      .filter(
        ([
          key,
        ]) =>
          !INTEGRATION_CHECKS_EXCLUDED_FROM_REGRESSION.has(
            key,
          ),
      )
      .every(
        ([
          ,
          value,
        ]) =>
          value,
      );

  return (
    integrationChecksPass
    && verificationCase.plan.engineDecisionLocked
    && verificationCase.payload.engineDecisionLocked
    && !verificationCase.plan.gptMayRejudge
    && !verificationCase.payload.gptMayRejudge
    && userPromptIncludesFinalDecisionPolicy(
      verificationCase.prompt,
      verificationCase.payload.finalDecision,
    )
    && systemPromptRequiresFinalDecisionOnceInBody(
      verificationCase.prompt,
    )
    && systemPromptForbidsFinalDecisionChange(
      verificationCase.prompt,
    )
    && systemPromptOmitsLastParagraphCopyRule(
      verificationCase.prompt,
    )
  );
}

function engineDecisionLockedInPrompt(
  prompt:
    ConsultingPrompt,
  finalDecision:
    string,
): boolean {
  return (
    prompt.systemPrompt.includes(
      "엔진의 verdict를 변경하지 않는다",
    )
    && systemPromptForbidsFinalDecisionChange(
      prompt,
    )
    && systemPromptRequiresFinalDecisionOnceInBody(
      prompt,
    )
    && userPromptIncludesCanonicalFinalDecision(
      prompt,
      finalDecision,
    )
  );
}

function explanationOrderIsNotNumberedOutline(
  prompt:
    ConsultingPrompt,
): boolean {
  return (
    prompt.userPrompt.includes(
      "그대로 번호 매겨 출력해야 하는 목차가 아닙니다",
    )
    && !prompt.systemPrompt.includes(
      "번호가 매겨진 explanationOrder를 그대로 나열",
    )
  );
}

function buildArtifacts(
  questionText:
    string,
): {
  focus:
    DecisionExplanationFocus
    | null;

  prompt:
    ConsultingPrompt;

  finalDecision:
    string;

  verdictLabelPresent:
    boolean;

  verdict:
    string;
} {
  const input =
    buildDecisionEngineRegressionInput({
      questionText,
    });

  const question =
    readQuestion(
      input.humanContext,
      questionText,
    );

  const questionContext =
    buildQuestionContext(
      question,
    );

  const decisionResult =
    runDecisionEngine({
      ...input,
      question,
      questionContext,
    });

  const plan =
    buildDecisionExplanationPlan(
      readDecisionResult(
        decisionResult,
      ),
      question.originalQuestion,
      questionContext,
    );

  const payload =
    buildDecisionExplanationPayload(
      plan,
    );

  const prompt =
    buildConsultingPrompt(
      payload,
      undefined,
      questionContext,
    );

  return {
    focus:
      plan.explanationFocus
      ?? null,

    prompt,

    finalDecision:
      payload.finalDecision,

    verdictLabelPresent:
      prompt.userPrompt.includes(
        "확정된 판단",
      ),

    verdict:
      payload.verdict,
  };
}

function buildCase(
  name:
    string,
  questionText:
    string,
  expectedFocus:
    DecisionExplanationFocus
    | null,
  checksBuilder: (
    artifacts:
      ReturnType<
        typeof buildArtifacts
      >,
  ) => Record<
    string,
    boolean
  >,
): ConsultingPromptBuilderVerificationCase {
  const artifacts =
    buildArtifacts(
      questionText,
    );

  const checks =
    checksBuilder(
      artifacts,
    );

  return {
    name,

    question:
      questionText,

    focus:
      artifacts.focus,

    checks,

    passed:
      artifacts.focus
      === expectedFocus
      && Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyCompatibility():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "A-B-compatibility-prompt-does-not-force-business-or-strength-first",
    "우리 둘의 궁합은 어떤가요?",
    "compatibility",
    (
      artifacts,
    ) => {
      const combined =
        combinedPromptText(
          artifacts.prompt,
        );

      return {
        usesCompatibilityFocus:
          artifacts.focus
          === "compatibility",

        answersCompatibilityDirectly:
          artifacts.prompt.systemPrompt.includes(
            "두 사람의 궁합에 직접 답한다",
          ),

        explainsFitAndConflict:
          artifacts.prompt.systemPrompt.includes(
            "잘 맞는 부분과 충돌하는 부분을 필요한 근거와 함께 설명한다",
          ),

        doesNotForceBusinessStartExplanation:
          BUSINESS_START_PROMPT_MARKERS.every(
            (marker) =>
              !artifacts.prompt.systemPrompt.includes(
                marker,
              ),
          ),

        doesNotForceStrengthThenWeakness:
          !combined.includes(
            "먼저 이 사람에게서 현재 질문과 관련된 강점과 취약점",
          )
          && !combined.includes(
            "먼저 강점과 취약점",
          ),

        hasDirectAnswerPriority:
          hasDirectAnswerPriority(
            artifacts.prompt,
          ),
      };
    },
  );
}

function verifyContinuation():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "D-continuation-prompt-centers-keep-or-change",
    "오래된 친구와 관계를 계속 이어가야 할까요?",
    "continuation",
    (
      artifacts,
    ) => ({
      usesContinuationFocus:
        artifacts.focus
        === "continuation",

      centersKeepDecision:
        artifacts.prompt.systemPrompt.includes(
          "계속 유지하는 것이 맞는지 중심으로 답한다",
        ),

      explainsKeepReasonsAndConditions:
        artifacts.prompt.systemPrompt.includes(
          "유지해야 할 이유와 조건을 설명한다",
        ),

      explainsLeaveSignalsOnlyWhenPresent:
        artifacts.prompt.systemPrompt.includes(
          "변화 또는 이탈 신호가 있을 때만 설명한다",
        ),

      hasDirectAnswerPriority:
        hasDirectAnswerPriority(
          artifacts.prompt,
        ),

      doesNotConvertWaitToInsufficientEvidence:
        artifacts.prompt.systemPrompt.includes(
          "기다리며 지켜보라는 판단을 정보가 부족하다로 바꾸지 않는다",
        ),
    }),
  );
}

function verifyTermination():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "termination-prompt-centers-leave-or-move",
    "현재 직장을 옮겨 이직해도 될까요?",
    "termination",
    (
      artifacts,
    ) => ({
      usesTerminationFocus:
        artifacts.focus
        === "termination",

      answersLeaveOrMoveDirectly:
        artifacts.prompt.systemPrompt.includes(
          "계속할지 떠날지 또는 변경할지에 직접 답한다",
        ),

      centersEvidenceConditionsRisks:
        artifacts.prompt.systemPrompt.includes(
          "필요한 근거와 실행 조건, 위험을 중심으로 설명한다",
        ),
    }),
  );
}

function verifyBusinessStart():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "C-business-start-prompt-centers-business-decision",
    "통닭집 창업을 해도 될까요?",
    "businessStart",
    (
      artifacts,
    ) => ({
      usesBusinessStartFocus:
        artifacts.focus
        === "businessStart",

      centersBusinessStartDecision:
        artifacts.prompt.systemPrompt.includes(
          "사업을 시작하는 것이 맞는지 중심으로 답한다",
        ),

      usesNeededBusinessMaterials:
        artifacts.prompt.systemPrompt.includes(
          "현재 시점, 성공 조건, 사업 위험, 실행 방향을 필요한 만큼 설명한다",
        ),

      avoidsGenericSajuRepetition:
        artifacts.prompt.systemPrompt.includes(
          "일반적인 사주 성향 설명을 길게 반복하지 않는다",
        ),

      hasDirectAnswerPriority:
        hasDirectAnswerPriority(
          artifacts.prompt,
        ),

      partnershipDoesNotDominateWithCompatibility:
        artifacts.prompt.systemPrompt.includes(
          "궁합 설명이 답변 전체를 지배하지 않게 한다",
        ),
    }),
  );
}

function verifyBusinessTiming():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "business-timing-prompt-centers-when-to-start",
    "지금 통닭집을 시작하면 성공할까요?",
    "businessTiming",
    (
      artifacts,
    ) => ({
      usesBusinessTimingFocus:
        artifacts.focus
        === "businessTiming",

      centersBusinessTiming:
        artifacts.prompt.systemPrompt.includes(
          "언제 시작하는 것이 좋은가라는 질문 목적에 집중한다",
        ),

      distinguishesPreparationAndExecutionTiming:
        artifacts.prompt.systemPrompt.includes(
          "현재 시점의 의미, 준비 시기인지 실행 시기인지를 중심으로 설명한다",
        ),

      centersWaitingAndExecutionConditions:
        artifacts.prompt.systemPrompt.includes(
          "기다려야 하는 조건과 실행으로 넘어가기 위한 조건을 중심으로 설명한다",
        ),

      avoidsInventedSpecificTiming:
        artifacts.prompt.systemPrompt.includes(
          "엔진이 제공하지 않는 구체적인 날짜나 시점을 만들어내지 않는다",
        ),

      preservesEngineJudgement:
        artifacts.prompt.systemPrompt.includes(
          "현재 엔진의 verdict와 evidence를 변경하거나 새 판단을 하지 않는다",
        ),

      avoidsGenericSajuRepetition:
        artifacts.prompt.systemPrompt.includes(
          "일반적인 사주 성향 설명을 길게 반복하지 않는다",
        ),

      hasDirectAnswerPriority:
        hasDirectAnswerPriority(
          artifacts.prompt,
        ),
    }),
  );
}

function verifyBusinessFieldFit():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "business-field-fit-prompt-centers-field-or-structure-fit",
    "어떤 사업 분야가 나에게 맞을까요?",
    "businessFieldFit",
    (
      artifacts,
    ) => ({
      usesBusinessFieldFitFocus:
        artifacts.focus
        === "businessFieldFit",

      centersBusinessFieldOrStructureFit:
        artifacts.prompt.systemPrompt.includes(
          "어떤 사업 분야 또는 사업 구조가 사용자에게 맞는가에 집중한다",
        ),

      explainsBusinessMethodRoleAndStrengthStructure:
        artifacts.prompt.systemPrompt.includes(
          "사용자에게 맞는 사업 방식, 역할, 강점이 활용되는 구조를 중심으로 설명한다",
        ),

      explainsStructuresToAvoid:
        artifacts.prompt.systemPrompt.includes(
          "피해야 할 사업 구조를 필요한 근거와 함께 설명한다",
        ),

      avoidsArbitrarySpecificBusinessType:
        artifacts.prompt.systemPrompt.includes(
          "엔진이 제공하지 않는 특정 업종을 임의로 단정하지 않는다",
        ),

      preservesEngineJudgement:
        artifacts.prompt.systemPrompt.includes(
          "현재 엔진의 verdict와 evidence를 변경하거나 새 판단을 하지 않는다",
        ),

      avoidsGenericSajuRepetition:
        artifacts.prompt.systemPrompt.includes(
          "일반적인 사주 성향 설명을 길게 반복하지 않는다",
        ),

      hasDirectAnswerPriority:
        hasDirectAnswerPriority(
          artifacts.prompt,
        ),
    }),
  );
}

function verifyRealEstateBuy():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "E-real-estate-buy-prompt-centers-purchase-decision",
    "대출 부담이 있는데 상가를 매수해도 될까요?",
    "realEstateBuy",
    (
      artifacts,
    ) => ({
      usesRealEstateBuyFocus:
        artifacts.focus
        === "realEstateBuy",

      centersPurchaseAndTiming:
        artifacts.prompt.systemPrompt.includes(
          "매수 여부와 현재 시점에 집중한다",
        ),

      usesCashFlowOnlyWhenEvidenceExists:
        artifacts.prompt.systemPrompt.includes(
          "자금과 현금흐름은 실제 근거 자료가 있을 때만 설명한다",
        ),

      avoidsGenericLifeRepetition:
        artifacts.prompt.systemPrompt.includes(
          "일반적인 인생 설명을 반복하지 않는다",
        ),

      hasDirectAnswerPriority:
        hasDirectAnswerPriority(
          artifacts.prompt,
        ),
    }),
  );
}

function verifyGeneralJudgement():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "F-general-judgement-prompt-centers-the-question",
    "여유자금으로 ETF에 투자해도 될까요?",
    "generalJudgement",
    (
      artifacts,
    ) => ({
      usesGeneralJudgementFocus:
        artifacts.focus
        === "generalJudgement",

      answersTheQuestionDirectly:
        artifacts.prompt.systemPrompt.includes(
          "질문 자체에 직접 답한다",
        ),

      usesNeededEvidenceOnly:
        artifacts.prompt.systemPrompt.includes(
          "필요한 근거와 조건, 위험만 사용한다",
        ),

      doesNotForceUnrelatedReaderExplanation:
        artifacts.prompt.systemPrompt.includes(
          "질문과 관계없는 설명을 억지로 붙이지 않는다",
        ),

      hasDirectAnswerPriority:
        hasDirectAnswerPriority(
          artifacts.prompt,
        ),

      doesNotRewriteQuestionAsGenericWealth:
        artifacts.prompt.systemPrompt.includes(
          "질문 자체를 일반적인 재물운 설명으로 바꾸지 않는다",
        ),
    }),
  );
}

function verifyFinalDecisionPolicyInPrompt():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "G-final-decision-policy-is-in-prompt",
    "통닭집 창업을 해도 될까요?",
    "businessStart",
    (
      artifacts,
    ) => ({
      userPromptIncludesCanonicalFinalDecision:
        userPromptIncludesCanonicalFinalDecision(
          artifacts.prompt,
          artifacts.finalDecision,
        ),

      userPromptIncludesFinalDecisionSection:
        userPromptIncludesFinalDecisionSection(
          artifacts.prompt,
        ),

      userPromptRequiresFinalDecisionVerbatimOnce:
        userPromptRequiresFinalDecisionVerbatimOnce(
          artifacts.prompt,
        ),

      userPromptForbidsDuplicateFinalDecisionMeaning:
        userPromptForbidsDuplicateFinalDecisionMeaning(
          artifacts.prompt,
        ),

      userPromptFinalChecklistIncludesFinalDecisionPolicy:
        userPromptFinalChecklistIncludesFinalDecisionPolicy(
          artifacts.prompt,
        ),

      directAnswerPriorityBlockIncludesFinalDecisionPolicy:
        directAnswerPriorityBlockIncludesFinalDecisionPolicy(
          extractDirectAnswerPriorityBlock(
            artifacts.prompt.systemPrompt,
          )
          ?? "",
        ),

      systemPromptRequiresFinalDecisionOnceInBody:
        systemPromptRequiresFinalDecisionOnceInBody(
          artifacts.prompt,
        ),

      systemPromptForbidsFinalDecisionPrefixLabels:
        systemPromptForbidsFinalDecisionPrefixLabels(
          artifacts.prompt,
        ),

      systemPromptOmitsLastParagraphCopyRule:
        systemPromptOmitsLastParagraphCopyRule(
          artifacts.prompt,
        ),

      explanationOrderIsNotNumberedOutline:
        explanationOrderIsNotNumberedOutline(
          artifacts.prompt,
        ),
    }),
  );
}

function verifyEngineDecisionIsLocked():
  ConsultingPromptBuilderVerificationCase {
  return buildCase(
    "H-prompt-does-not-change-engine-verdict-or-final-decision",
    "통닭집 창업을 해도 될까요?",
    "businessStart",
    (
      artifacts,
    ) => ({
      systemPromptForbidsVerdictChange:
        artifacts.prompt.systemPrompt.includes(
          "엔진의 verdict를 변경하지 않는다",
        ),

      systemPromptForbidsFinalDecisionChange:
        systemPromptForbidsFinalDecisionChange(
          artifacts.prompt,
        ),

      systemPromptExplainsInsteadOfRejudging:
        artifacts.prompt.systemPrompt.includes(
          "GPT는 판단을 새로 만들지 않고 엔진 판단을 사람이 이해할 수 있게 설명한다",
        ),

      userPromptIncludesCanonicalFinalDecision:
        artifacts.prompt.userPrompt.includes(
          artifacts.finalDecision,
        ),

      userPromptIncludesLockedVerdictSection:
        artifacts.verdictLabelPresent,
    }),
  );
}

function verifyRoleRecommendationKept():
  ConsultingPromptBuilderVerificationCase {
  const existing =
    verifyRoleRecommendationExplanation();

  const artifacts =
    buildArtifacts(
      ROLE_QUESTION,
    );

  return {
    name:
      "I-existing-role-recommendation-prompt-is-kept",

    question:
      ROLE_QUESTION,

    focus:
      artifacts.focus,

    checks: {
      existingRoleRecommendationVerificationPasses:
        existing.passed,

      promptStillIncludesRoleRules:
        artifacts.prompt.systemPrompt.includes(
          "evidence에 없는 배역",
        )
        && artifacts.prompt.systemPrompt.includes(
          "세 가지 배역 후보",
        ),

      promptDoesNotApplyDecisionFocusRules:
        !artifacts.prompt.systemPrompt.includes(
          "사업을 시작하는 것이 맞는지 중심으로 답한다",
        )
        && !artifacts.prompt.systemPrompt.includes(
          "두 사람의 궁합에 직접 답한다",
        ),

      promptKeepsQuestionAnswerMode:
        isQuestionAnswerModePrompt(
          artifacts.prompt,
        ),
    },

    passed:
      existing.passed
      && artifacts.focus
      === null
      && artifacts.prompt.systemPrompt.includes(
        "evidence에 없는 배역",
      )
      && artifacts.prompt.systemPrompt.includes(
        "세 가지 배역 후보",
      )
      && !artifacts.prompt.systemPrompt.includes(
        "사업을 시작하는 것이 맞는지 중심으로 답한다",
      )
      && !artifacts.prompt.systemPrompt.includes(
        "두 사람의 궁합에 직접 답한다",
      )
      && isQuestionAnswerModePrompt(
        artifacts.prompt,
      ),
  };
}

function buildAvailableLifeFlowAssessment():
  LifeFlowInterpretationAssessment {
  return {
    available:
      true,

    target: {
      scope:
        "overall",

      referenceDate:
        "2025-08-16",

      targetYear:
        2025,

      targetMonth:
        null,

      targetDay:
        null,

      half:
        null,

      startDate:
        "2025-01-01",

      endDate:
        "2025-12-31",

      yearExplicit:
        true,

      evidence: [
        LIFE_FLOW_QUESTION,
      ],

      limitations:
        [],
    },

    overallTheme:
      "전체 흐름의 핵심 한 줄",

    supportiveSignals: [
      "유리하게 나타나는 부분",
    ],

    tensionSignals: [
      "주의할 흐름",
    ],

    phaseInterpretation:
      "국면 해석",

    periodSegments:
      [],

    periodInteractions:
      [],

    signalContributions:
      [],

    cautions:
      [],

    limitations:
      [],

    evidenceKeys:
      [],

    sourceLocked:
      true,
  };
}

function verifyLifeFlowInterpretationKept():
  ConsultingPromptBuilderVerificationCase {
  const input =
    buildDecisionEngineRegressionInput({
      questionText:
        LIFE_FLOW_QUESTION,
    });

  const question =
    readQuestion(
      input.humanContext,
      LIFE_FLOW_QUESTION,
    );

  const questionContext =
    buildQuestionContext(
      question,
    );

  const explanationInput:
    DecisionExplanationInput = {
      ...readDecisionResult(
        runDecisionEngine({
          ...input,
          question,
          questionContext,
        }),
      ),

      lifeFlowInterpretationAssessment:
        buildAvailableLifeFlowAssessment(),
    };

  const plan =
    buildDecisionExplanationPlan(
      explanationInput,
      question.originalQuestion,
      questionContext,
    );

  const prompt =
    buildConsultingPrompt(
      buildDecisionExplanationPayload(
        plan,
      ),
      undefined,
      questionContext,
    );

  const checks = {
    promptStillIncludesLifeFlowRules:
      prompt.systemPrompt.includes(
        "제공된 Evidence와 계산된 대운·세운·월운·일운 Fact만 설명한다",
      ),

    promptStillForbidsActionFollowUp:
      prompt.systemPrompt.includes(
        "실제로 결정하려는 행동은 무엇인가요?",
      ),

    promptDoesNotApplyDecisionFocusRules:
      !prompt.systemPrompt.includes(
        "사업을 시작하는 것이 맞는지 중심으로 답한다",
      )
      && !prompt.systemPrompt.includes(
        "질문 자체에 직접 답한다",
      ),

    promptUsesReportFlowRules:
      isReportAnswerModePrompt(
        prompt,
      ),

    doesNotListAllReadersEqually:
      prompt.systemPrompt.includes(
        "모든 Reader를 같은 비중으로 나열하지 않는다.",
      ),
  };

  return {
    name:
      "J-existing-life-flow-interpretation-prompt-is-kept",

    question:
      LIFE_FLOW_QUESTION,

    focus:
      plan.explanationFocus
      ?? null,

    checks,

    passed:
      plan.explanationKind
      === "lifeFlowInterpretation"
      && plan.explanationFocus
      === undefined
      && Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyExistingAnswerQualityKept():
  ConsultingPromptBuilderVerificationCase {
  const answerQualityResult =
    verifyConsultingAnswerQuality();

  const artifacts =
    buildArtifacts(
      "여유자금으로 ETF에 투자해도 될까요?",
    );

  const prompt =
    artifacts.prompt;

  const checks = {
    existingAnswerQualityVerificationPasses:
      answerQualityResult.passed,

    answerQualityCasesPass:
      answerQualityResult.cases.every(
        (item) =>
          item.passed,
      ),

    answerQualityCrossFixtureChecksPass:
      Object.values(
        answerQualityResult.crossFixtureChecks,
      ).every(
        Boolean,
      ),

    promptIncludesFinalDecisionPolicy:
      userPromptIncludesFinalDecisionPolicy(
        prompt,
        artifacts.finalDecision,
      )
      && engineDecisionLockedInPrompt(
        prompt,
        artifacts.finalDecision,
      ),
  };

  return {
    name:
      "K-existing-consulting-answer-quality-is-kept",

    question:
      "여유자금으로 ETF에 투자해도 될까요?",

    focus:
      artifacts.focus,

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyIntegrationFinalDecisionOnceIsResolved():
  ConsultingPromptBuilderVerificationCase {
  const integrationResult =
    verifyReaderDecisionExplanationIntegration();

  const artifacts =
    buildArtifacts(
      "새로운 사업을 지금 시작해도 될까요?",
    );

  const prompt =
    artifacts.prompt;

  const readerEffectCase =
    integrationResult.cases.find(
      (item) =>
        item.name
        === "reader-effect-reaches-consulting-prompt",
    );

  const noReaderEffectCase =
    integrationResult.cases.find(
      (item) =>
        item.name
        === "unused-reader-effect-is-excluded",
    );

  const checks = {
    integrationReaderEffectDeliveryPasses:
      readerEffectCase
      !== undefined
      && integrationCasePassesWithCurrentFinalDecisionPolicy(
        readerEffectCase,
      ),

    integrationNoReaderEffectExcludedPasses:
      noReaderEffectCase
      !== undefined
      && integrationCasePassesWithCurrentFinalDecisionPolicy(
        noReaderEffectCase,
      ),

    integrationPayloadExcludesFinalDecisionFromOrder:
      integrationResult.cases.every(
        (item) =>
          item.checks.payloadExcludesFinalDecisionFromOrder
          === true,
      ),

    integrationEngineDecisionLocked:
      integrationResult.cases.every(
        (item) =>
          item.plan.engineDecisionLocked
          && item.payload.engineDecisionLocked
          && !item.plan.gptMayRejudge
          && !item.payload.gptMayRejudge,
      ),

    promptIncludesCanonicalFinalDecision:
      userPromptIncludesCanonicalFinalDecision(
        prompt,
        artifacts.finalDecision,
      ),

    userPromptIncludesFinalDecisionPolicy:
      userPromptIncludesFinalDecisionPolicy(
        prompt,
        artifacts.finalDecision,
      ),

    systemPromptRequiresFinalDecisionOnceInBody:
      systemPromptRequiresFinalDecisionOnceInBody(
        prompt,
      ),

    systemPromptForbidsVerdictChange:
      prompt.systemPrompt.includes(
        "엔진의 verdict를 변경하지 않는다",
      ),

    systemPromptOmitsLastParagraphCopyRule:
      systemPromptOmitsLastParagraphCopyRule(
        prompt,
      ),

    directAnswerPriorityBlockIncludesFinalDecisionPolicy:
      directAnswerPriorityBlockIncludesFinalDecisionPolicy(
        extractDirectAnswerPriorityBlock(
          prompt.systemPrompt,
        )
        ?? "",
      ),
  };

  const passed =
    Object.values(
      checks,
    ).every(
      Boolean,
    );

  return {
    name:
      "L-final-decision-once-policy-is-in-prompt",

    question:
      "새로운 사업을 지금 시작해도 될까요?",

    focus:
      artifacts.focus,

    checks,

    passed,
  };
}

function verifyPayloadAndGroundingKeepQuestionFocusRules():
  ConsultingPromptBuilderVerificationCase {
  const scenarios = [
    {
      question:
        "통닭집 창업을 해도 될까요?",

      expectedFocus:
        "businessStart" as const,

      requiredSystemMarkers: [
        "사업을 시작하는 것이 맞는지 중심으로 답한다",
        "현재 시점, 성공 조건, 사업 위험, 실행 방향을 필요한 만큼 설명한다",
      ],

      forbiddenSystemMarkers: [
        "두 사람의 궁합에 직접 답한다",
      ],
    },
    {
      question:
        "우리 둘의 궁합은 어떤가요?",

      expectedFocus:
        "compatibility" as const,

      requiredSystemMarkers: [
        "두 사람의 궁합에 직접 답한다",
        "잘 맞는 부분과 충돌하는 부분을 필요한 근거와 함께 설명한다",
      ],

      forbiddenSystemMarkers: [
        ...BUSINESS_START_PROMPT_MARKERS,
      ],
    },
    {
      question:
        "여유자금으로 ETF에 투자해도 될까요?",

      expectedFocus:
        "generalJudgement" as const,

      requiredSystemMarkers: [
        "질문 자체에 직접 답한다",
        "필요한 근거와 조건, 위험만 사용한다",
        "질문과 관계없는 설명을 억지로 붙이지 않는다",
      ],

      forbiddenSystemMarkers: [
        ...BUSINESS_START_PROMPT_MARKERS,
      ],
    },
  ] as const;

  const scenarioChecks =
    scenarios.map(
      (scenario) => {
        const input =
          buildDecisionEngineRegressionInput({
            questionText:
              scenario.question,
          });

        const question =
          readQuestion(
            input.humanContext,
            scenario.question,
          );

        const questionContext =
          buildQuestionContext(
            question,
          );

        const plan =
          buildDecisionExplanationPlan(
            readDecisionResult(
              runDecisionEngine({
                ...input,
                question,
                questionContext,
              }),
            ),
            question.originalQuestion,
            questionContext,
          );

        const payload =
          buildDecisionExplanationPayload(
            plan,
          );

        const groundingContext =
          buildConsultingGroundingContext({
            humanContext:
              input.humanContext,

            lifeContext:
              input.lifeContext,

            question:
              scenario.question,
          });

        const prompt =
          buildConsultingPrompt(
            payload,
            groundingContext,
            questionContext,
          );

        const serializedGrounding =
          JSON.stringify(
            groundingContext,
            null,
            2,
          );

        const actualFocus =
          plan.explanationFocus
          ?? null;

        return {
          keepsExpectedFocus:
            actualFocus
            === scenario.expectedFocus,

          keepsQuestionFocusRules:
            scenario
              .requiredSystemMarkers
              .every(
                (marker) =>
                  prompt.systemPrompt.includes(
                    marker,
                  ),
              ),

          doesNotApplyOtherFocusRules:
            scenario
              .forbiddenSystemMarkers
              .every(
                (marker) =>
                  !prompt.systemPrompt.includes(
                    marker,
                  ),
              ),

          includesGroundingJson:
            prompt.userPrompt.includes(
              serializedGrounding,
            ),

          includesPayloadEvidence:
            payload
              .explanationOrder
              .length
            > 0
            && payload
              .explanationOrder
              .every(
                (item) =>
                  prompt.userPrompt.includes(
                    item.content,
                  ),
              ),

          groundingOmitsReaderDump:
            [
              "humanIdentity",
              "readerEvidence",
              "masterReaderInput",
              "lifePhaseInput",
              "lifeDriver",
              "survivalStyle",
              "repeatedPattern",
            ].every(
              (key) =>
                !serializedGrounding.includes(
                  `"${key}"`,
                ),
            ),

          usesConfirmationSourceTitle:
            prompt.userPrompt.includes(
              "확인 원자료 — 원국·현재 운 국면·현실 정보",
            )
            && !prompt.userPrompt.includes(
              "개인별 사주 근거",
            ),

          groundingComesAfterMaterials:
            prompt.userPrompt.indexOf(
              "답변에 필요한 판단 근거와 설명 요소",
            )
            >= 0
            && prompt.userPrompt.indexOf(
              "확인 원자료 — 원국·현재 운 국면·현실 정보",
            )
            > prompt.userPrompt.indexOf(
              "답변에 필요한 판단 근거와 설명 요소",
            ),

          groundingIsNotForcedFirst:
            prompt.systemPrompt.includes(
              "확인 원자료 전체를 답변의 시작점이나 공통 설명의 근거로 사용하지 않는다.",
            )
            && prompt.systemPrompt.includes(
              "확인 원자료는 질문의 직답을 설명하는 데 필요한 경우에만 사용한다.",
            )
            && prompt.systemPrompt.includes(
              "원국 사실은 직답의 판단 근거와 직접 연결될 때 우선 사용한다.",
            ),
        };
      },
    );

  const checks = {
    businessStartKeepsFocusRules:
      scenarioChecks[0]?.keepsExpectedFocus
      === true
      && scenarioChecks[0]?.keepsQuestionFocusRules
      === true
      && scenarioChecks[0]?.doesNotApplyOtherFocusRules
      === true,

    compatibilityKeepsFocusRules:
      scenarioChecks[1]?.keepsExpectedFocus
      === true
      && scenarioChecks[1]?.keepsQuestionFocusRules
      === true
      && scenarioChecks[1]?.doesNotApplyOtherFocusRules
      === true,

    generalJudgementKeepsFocusRules:
      scenarioChecks[2]?.keepsExpectedFocus
      === true
      && scenarioChecks[2]?.keepsQuestionFocusRules
      === true
      && scenarioChecks[2]?.doesNotApplyOtherFocusRules
      === true,

    groundingIsIncludedWithPayload:
      scenarioChecks.every(
        (result) =>
          result.includesGroundingJson
          && result.includesPayloadEvidence,
      ),

    groundingDoesNotRestoreReaderDump:
      scenarioChecks.every(
        (result) =>
          result.groundingOmitsReaderDump,
      ),

    groundingIsConfirmationSourceNotAnswerStart:
      scenarioChecks.every(
        (result) =>
          result.usesConfirmationSourceTitle
          && result.groundingComesAfterMaterials
          && result.groundingIsNotForcedFirst,
      ),
  };

  return {
    name:
      "M-payload-and-grounding-keep-question-focus-rules",

    question:
      scenarios[0].question,

    focus:
      scenarios[0].expectedFocus,

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function buildFullArtifacts(
  questionText:
    string,
): ReturnType<
  typeof buildArtifacts
> & {
  originalQuestion:
    string;

  answerMode:
    ConsultingAnswerMode;
} {
  const input =
    buildDecisionEngineRegressionInput({
      questionText,
    });

  const question =
    readQuestion(
      input.humanContext,
      questionText,
    );

  const questionContext =
    buildQuestionContext(
      question,
    );

  const decisionResult =
    runDecisionEngine({
      ...input,
      question,
      questionContext,
    });

  const plan =
    buildDecisionExplanationPlan(
      readDecisionResult(
        decisionResult,
      ),
      question.originalQuestion,
      questionContext,
    );

  const payload =
    buildDecisionExplanationPayload(
      plan,
    );

  const groundingContext =
    buildConsultingGroundingContext({
      humanContext:
        input.humanContext,

      lifeContext:
        input.lifeContext,

      question:
        questionText,
    });

  const prompt =
    buildConsultingPrompt(
      payload,
      groundingContext,
      questionContext,
    );

  return {
    focus:
      plan.explanationFocus
      ?? null,

    prompt,

    finalDecision:
      payload.finalDecision,

    verdictLabelPresent:
      prompt.userPrompt.includes(
        "확정된 판단",
      ),

    verdict:
      payload.verdict,

    originalQuestion:
      question.originalQuestion,

    answerMode:
      resolveConsultingAnswerMode(
        payload,
      ),
  };
}

function verifyWaitIsNotInsufficientEvidenceAvoidance():
  ConsultingPromptBuilderVerificationCase {
  const artifacts =
    buildArtifacts(
      "오래된 친구와 관계를 계속 이어가야 할까요?",
    );

  const checks = {
    hasDirectAnswerPriority:
      hasDirectAnswerPriority(
        artifacts.prompt,
      ),

    omitsInsufficientEvidenceAvoidanceRule:
      omitsInsufficientEvidenceAvoidanceRule(
        artifacts.prompt,
      ),

    waitIsNotRewrittenAsCannotJudge:
      artifacts.prompt.systemPrompt.includes(
        "기다리며 지켜보라는 판단을 판단할 수 없다 또는 정보가 부족하다로 바꾸지 않는다",
      ),

    waitMeaningIsAppliedToQuestion:
      artifacts.prompt.systemPrompt.includes(
        "엔진이 기다리며 지켜보라고 판단했다면 그 의미를 질문 대상에 적용해서 설명한다",
      ),

    waitAndOtherVerdictsDoNotUseInsufficientEvidenceAvoidance:
      artifacts.prompt.systemPrompt.includes(
        "기다리며 지켜보라는 판단, 진행 권고, 조건부 진행, 진행하지 않음, 해석 판단에서는 정보 부족을 이유로 답변을 회피하지 않는다",
      ),

    waitVerdictDoesNotAllowInsufficientEvidenceLanguage:
      artifacts.verdict
      !== "wait"
      || artifacts.prompt.systemPrompt.includes(
        "현재 엔진 판단은 정보 부족이 아니므로 정보 부족을 이유로 답변을 회피하지 않는다",
      ),
  };

  return {
    name:
      "N-wait-is-not-treated-as-insufficient-evidence-avoidance",

    question:
      "오래된 친구와 관계를 계속 이어가야 할까요?",

    focus:
      artifacts.focus,

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyInsufficientEvidenceLanguageIsRestricted():
  ConsultingPromptBuilderVerificationCase {
  const compatibility =
    buildFullArtifacts(
      "우리 둘의 궁합은 어떤가요?",
    );

  const businessStart =
    buildArtifacts(
      "통닭집 창업을 해도 될까요?",
    );

  const insufficientEvidencePrompt =
    compatibility.verdict
    === "insufficientEvidence"
      ? compatibility.prompt
      : businessStart.verdict
        === "insufficientEvidence"
        ? businessStart.prompt
        : compatibility.prompt;

  const nonInsufficientPrompt =
    businessStart.verdict
    !== "insufficientEvidence"
      ? businessStart.prompt
      : compatibility.verdict
        !== "insufficientEvidence"
        ? compatibility.prompt
        : businessStart.prompt;

  const checks = {
    insufficientEvidenceLanguageAllowedOnlyThen:
      insufficientEvidencePrompt.systemPrompt.includes(
        "정보 부족 표현은 엔진 판단이 현재 정보만으로는 결론을 확정하기 어려운 경우에만 사용할 수 있다",
      )
      && nonInsufficientPrompt.systemPrompt.includes(
        "정보 부족 표현은 엔진 판단이 현재 정보만으로는 결론을 확정하기 어려운 경우에만 사용할 수 있다",
      ),

    insufficientEvidenceExplainsCurrentRangeWhenPresent:
      compatibility.verdict
      !== "insufficientEvidence"
      && businessStart.verdict
      !== "insufficientEvidence"
      || insufficientEvidencePrompt.systemPrompt.includes(
        "질문 자체에 대한 현재 판단 가능한 범위를 먼저 설명한다",
      ),

    nonInsufficientDoesNotGetInsufficientExplanationBlock:
      (
        businessStart.verdict
        === "insufficientEvidence"
      )
      || (
        businessStart.prompt.systemPrompt.includes(
          "현재 엔진 판단은 정보 부족이 아니므로 정보 부족을 이유로 답변을 회피하지 않는다",
        )
        && !businessStart.prompt.systemPrompt.includes(
          "공통 회피 문장만 반복하지 않는다",
        )
      )
      || compatibility.verdict
      === "insufficientEvidence"
      && compatibility.prompt.systemPrompt.includes(
        "질문 자체에 대한 현재 판단 가능한 범위를 먼저 설명한다",
      ),

    omitsInsufficientEvidenceAvoidanceRule:
      omitsInsufficientEvidenceAvoidanceRule(
        compatibility.prompt,
      )
      && omitsInsufficientEvidenceAvoidanceRule(
        businessStart.prompt,
      ),
  };

  return {
    name:
      "O-insufficient-evidence-language-is-allowed-only-then",

    question:
      compatibility.originalQuestion,

    focus:
      compatibility.focus,

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyMechanicalTemplatesStayRemoved():
  ConsultingPromptBuilderVerificationCase {
  const artifacts =
    buildArtifacts(
      "새로운 사업을 지금 시작해도 될까요?",
    );

  const checks = {
    omitsFirstParagraphForcedConclusion:
      !combinedPromptText(
        artifacts.prompt,
      ).includes(
        "첫 문단에는 반드시 결론을 작성한다",
      ),

    omitsFinalDecisionCopyRule:
      systemPromptOmitsLastParagraphCopyRule(
        artifacts.prompt,
      )
      && systemPromptRequiresFinalDecisionOnceInBody(
        artifacts.prompt,
      ),

    omitsExplanationOrderOutlineRule:
      artifacts.prompt.userPrompt.includes(
        "그대로 번호 매겨 출력해야 하는 목차가 아닙니다",
      )
      && !artifacts.prompt.systemPrompt.includes(
        "번호가 매겨진 explanationOrder를 그대로 나열",
      ),

    omitsStrengthThenWeaknessRule:
      !combinedPromptText(
        artifacts.prompt,
      ).includes(
        "먼저 강점과 취약점",
      ),

    omitsAllMechanicalTemplates:
      omitsMechanicalTemplates(
        artifacts.prompt,
      ),
  };

  return {
    name:
      "P-mechanical-templates-stay-removed",

    question:
      "새로운 사업을 지금 시작해도 될까요?",

    focus:
      artifacts.focus,

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyFourQuestionDirectAnswerPriority():
  ConsultingPromptBuilderVerificationCase {
  const results =
    FOUR_QUESTION_FIXTURES.map(
      (fixture) => {
        const artifacts =
          buildFullArtifacts(
            fixture.question,
          );

        const groundingHeadingIndex =
          artifacts.prompt.userPrompt.indexOf(
            "확인 원자료 — 원국·현재 운 국면·현실 정보",
          );

        const materialsHeadingIndex =
          artifacts.prompt.userPrompt.indexOf(
            "답변에 필요한 판단 근거와 설명 요소",
          );

        const originalQuestionHeadingIndex =
          artifacts.prompt.userPrompt.indexOf(
            "사용자의 원래 질문",
          );

        const waitConverted =
          artifacts.verdict
          === "wait"
          && (
            artifacts.prompt.systemPrompt.includes(
              "정보 부족이면 판단하지 않는다",
            )
            || !artifacts.prompt.systemPrompt.includes(
              "기다리며 지켜보라는 판단을 판단할 수 없다 또는 정보가 부족하다로 바꾸지 않는다",
            )
          );

        const insufficientEvidenceOk =
          artifacts.verdict
          !== "insufficientEvidence"
          || (
            artifacts.prompt.systemPrompt.includes(
              "질문 자체에 대한 현재 판단 가능한 범위를 먼저 설명한다",
            )
            && artifacts.prompt.systemPrompt.includes(
              "무엇이 부족한지 구체적으로 설명한다",
            )
          );

        return {
          id:
            fixture.id,

          questionReflected:
            artifacts.prompt.userPrompt.includes(
              fixture.question,
            ),

          hasDirectAnswerPriority:
            hasDirectAnswerPriority(
              artifacts.prompt,
            ),

          doesNotLeadWithPersonalityDump:
            artifacts.prompt.systemPrompt.includes(
              "질문에 대한 판단을 제시하지 않은 채",
            )
            && artifacts.prompt.systemPrompt.includes(
              "사주 성향이나 인생 일반론부터 길게 설명하지 않는다",
            )
            && artifacts.prompt.userPrompt.includes(
              "사주 성향이나 인생 일반론부터 길게 시작하지 마세요",
            ),

          waitNotConvertedToInsufficientEvidence:
            !waitConverted,

          insufficientEvidenceExplainsPossibleRange:
            insufficientEvidenceOk,

          groundingIsConfirmationSource:
            groundingHeadingIndex
            >= 0
            && materialsHeadingIndex
            >= 0
            && originalQuestionHeadingIndex
            >= 0
            && originalQuestionHeadingIndex
            < materialsHeadingIndex
            && materialsHeadingIndex
            < groundingHeadingIndex
            && !artifacts.prompt.userPrompt.includes(
              "개인별 사주 근거",
            ),

          keepsQuestionContextRules:
            keepsQuestionContextRules(
              artifacts.prompt,
            ),

          partnershipKeepsBusinessAction:
            fixture.id
            !== "partnership"
            || artifacts.prompt.systemPrompt.includes(
              "궁합 설명이 답변 전체를 지배하지 않게 한다",
            ),

          expectedFocusKeptWhenKnown:
            fixture.expectedFocus
            === null
            || artifacts.focus
            === fixture.expectedFocus,
        };
      },
    );

  const checks = {
    compatibilityDirectAnswerPriority:
      results[0]?.hasDirectAnswerPriority
      === true
      && results[0]?.questionReflected
      === true
      && results[0]?.expectedFocusKeptWhenKnown
      === true,

    partnershipDirectAnswerPriority:
      results[1]?.hasDirectAnswerPriority
      === true
      && results[1]?.questionReflected
      === true
      && results[1]?.partnershipKeepsBusinessAction
      === true,

    continuationDirectAnswerPriority:
      results[2]?.hasDirectAnswerPriority
      === true
      && results[2]?.questionReflected
      === true
      && results[2]?.expectedFocusKeptWhenKnown
      === true,

    moneyRecoveryDirectAnswerPriority:
      results[3]?.hasDirectAnswerPriority
      === true
      && results[3]?.questionReflected
      === true
      && results[3]?.expectedFocusKeptWhenKnown
      === true,

    answersQuestionDirectlyWithoutPersonalityLead:
      results.every(
        (result) =>
          result.doesNotLeadWithPersonalityDump,
      ),

    waitNotConvertedToInsufficientEvidence:
      results.every(
        (result) =>
          result.waitNotConvertedToInsufficientEvidence,
      ),

    insufficientEvidenceExplainsPossibleRange:
      results.every(
        (result) =>
          result.insufficientEvidenceExplainsPossibleRange,
      ),

    groundingIsConfirmationSourceNotStart:
      results.every(
        (result) =>
          result.groundingIsConfirmationSource,
      ),

    questionContextRulesKept:
      results.every(
        (result) =>
          result.keepsQuestionContextRules,
      ),
  };

  return {
    name:
      "Q-four-questions-keep-direct-answer-priority",

    question:
      FOUR_QUESTION_FIXTURES[0].question,

    focus:
      "compatibility",

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function doesNotLeadWithPersonality(
  prompt:
    ConsultingPrompt,
): boolean {
  return (
    prompt.systemPrompt.includes(
      "질문에 대한 판단을 제시하지 않은 채",
    )
    && prompt.systemPrompt.includes(
      "사주 성향이나 인생 일반론부터 길게 설명하지 않는다",
    )
    && prompt.userPrompt.includes(
      "사주 성향이나 인생 일반론부터 길게 시작하지 마세요",
    )
  );
}

function doesNotBlockReportWithInsufficientEvidence(
  prompt:
    ConsultingPrompt,
): boolean {
  return (
    prompt.systemPrompt.includes(
      "\"정보가 부족하다\"를 기본 시작 문장으로 사용하지 않는다",
    )
    && prompt.systemPrompt.includes(
      "현재 자료로 설명 가능한 범위는 충분히 설명한다",
    )
    && prompt.systemPrompt.includes(
      "정보 부족을 이유로 흐름 설명을 중단하지 않는다",
    )
    && omitsInsufficientEvidenceAvoidanceRule(
      prompt,
    )
    && !prompt.userPrompt.includes(
      "질문에 대한 직답을 우선으로 작성하세요",
    )
  );
}

function verifyAnswerModeTenQuestions():
  ConsultingPromptBuilderVerificationCase[] {
  const fixtures = [
    {
      id:
        "A-compatibility-question-mode",

      question:
        "우리 둘의 궁합은 어떤가요?",

      expectedFocus:
        "compatibility" as const,

      expectedMode:
        "question" as const,
    },
    {
      id:
        "B-partnership-question-mode",

      question:
        "이 여성과 동업해도 될까요?",

      expectedFocus:
        "compatibility" as const,

      expectedMode:
        "question" as const,
    },
    {
      id:
        "C-continuation-question-mode",

      question:
        "남자친구와 계속 만나야 할까요?",

      expectedFocus:
        "continuation" as const,

      expectedMode:
        "question" as const,
    },
    {
      id:
        "D-money-recovery-question-mode",

      question:
        "이번에 빌려준 돈을 받을 수 있을까요?",

      expectedFocus:
        "generalJudgement" as const,

      expectedMode:
        "question" as const,
    },
    {
      id:
        "E-role-recommendation-question-mode",

      question:
        "내 사주로 연극을 한다면 어떤 역할일까요?",

      expectedFocus:
        null,

      expectedMode:
        "question" as const,
    },
    {
      id:
        "F-daeun-timing-report-mode",

      question:
        "나는 언제쯤 대운이 들어올까요?",

      expectedFocus:
        "generalJudgement" as const,

      expectedMode:
        "report" as const,
    },
    {
      id:
        "G-overall-fortune-report-mode",

      question:
        "올해 총운을 봐주세요",

      expectedFocus:
        "generalJudgement" as const,

      expectedMode:
        "report" as const,
    },
    {
      id:
        "H-love-fortune-report-mode",

      question:
        "나의 연애운은 어떨까요?",

      expectedFocus:
        "generalJudgement" as const,

      expectedMode:
        "report" as const,
    },
    {
      id:
        "I-wealth-fortune-report-mode",

      question:
        "난 재물운이 있나요?",

      expectedFocus:
        "generalJudgement" as const,

      expectedMode:
        "report" as const,
    },
    {
      id:
        "J-year-fortune-report-mode",

      question:
        "2026년 운세 알려줘",

      expectedFocus:
        "generalJudgement" as const,

      expectedMode:
        "report" as const,
    },
  ] as const;

  return fixtures.map(
    (fixture) => {
      const artifacts =
        buildFullArtifacts(
          fixture.question,
        );

      const prompt =
        artifacts.prompt;

      const isQuestion =
        fixture.expectedMode
        === "question";

      const checks = {
        usesExpectedAnswerMode:
          artifacts.answerMode
          === fixture.expectedMode
          && (
            isQuestion
              ? isQuestionAnswerModePrompt(
                  prompt,
                )
              : isReportAnswerModePrompt(
                  prompt,
                )
          ),

        keepsExplanationFocus:
          artifacts.focus
          === fixture.expectedFocus,

        doesNotRewritePartnershipFocusToBusinessStart:
          fixture.id
          !== "B-partnership-question-mode"
          || artifacts.focus
          === "compatibility",

        partnershipUsesBusinessCenter:
          fixture.id
          !== "B-partnership-question-mode"
          || (
            hasPartnershipBusinessCenter(
              prompt,
            )
            && !prompt.systemPrompt.includes(
              "두 사람의 궁합에 직접 답한다",
            )
          ),

        compatibilityAnswersDirectly:
          fixture.id
          !== "A-compatibility-question-mode"
          || prompt.systemPrompt.includes(
            "두 사람의 궁합에 직접 답한다",
          ),

        continuationCentersKeep:
          fixture.id
          !== "C-continuation-question-mode"
          || prompt.systemPrompt.includes(
            "계속 유지하는 것이 맞는지 중심으로 답한다",
          ),

        moneyRecoveryAnswersQuestion:
          fixture.id
          !== "D-money-recovery-question-mode"
          || prompt.systemPrompt.includes(
            "질문 자체에 직접 답한다",
          ),

        roleKeepsDedicatedRules:
          fixture.id
          !== "E-role-recommendation-question-mode"
          || (
            prompt.systemPrompt.includes(
              "세 가지 배역 후보",
            )
            && prompt.systemPrompt.includes(
              "evidence에 없는 배역",
            )
          ),

        daeunWhenUsesReportMode:
          fixture.id
          !== "F-daeun-timing-report-mode"
          || (
            artifacts.answerMode
            === "report"
            && isReportAnswerModePrompt(
              prompt,
            )
            && !isQuestionAnswerModePrompt(
              prompt,
            )
          ),

        reportOmitsDirectAnswerLead:
          isQuestion
          || (
            !prompt.systemPrompt.includes(
              "직답 우선 원칙",
            )
            && !prompt.userPrompt.includes(
              "질문에 대한 직답을 우선으로 작성하세요",
            )
          ),

        reportOmitsForcedActionFocus:
          isQuestion
          || (
            !prompt.systemPrompt.includes(
              "사업을 시작하는 것이 맞는지 중심으로 답한다",
            )
            && !prompt.systemPrompt.includes(
              "질문 자체에 직접 답한다",
            )
          ),

        questionDoesNotLeadWithPersonality:
          !isQuestion
          || doesNotLeadWithPersonality(
            prompt,
          ),

        reportDoesNotBlockWithInsufficientEvidence:
          isQuestion
          || doesNotBlockReportWithInsufficientEvidence(
            prompt,
          ),

        keepsQuestionContext:
          keepsQuestionContextRules(
            prompt,
          ),

        engineDecisionLocked:
          engineDecisionLockedInPrompt(
            prompt,
            artifacts.finalDecision,
          ),
      };

      return {
        name:
          fixture.id,

        question:
          fixture.question,

        focus:
          artifacts.focus,

        checks,

        passed:
          Object.values(
            checks,
          ).every(
            Boolean,
          ),
      };
    },
  );
}

function verifyAnswerModePriorityAndRegression():
  ConsultingPromptBuilderVerificationCase {
  const mixedStart =
    buildFullArtifacts(
      "2026년에 사업 시작해도 될까요?",
    );

  const mixedFortune =
    buildFullArtifacts(
      "2026년 사업운은 어떨까요?",
    );

  const questionCases =
    [
      "우리 둘의 궁합은 어떤가요?",
      "이 여성과 동업해도 될까요?",
      "남자친구와 계속 만나야 할까요?",
      "이번에 빌려준 돈을 받을 수 있을까요?",
      "내 사주로 연극을 한다면 어떤 역할일까요?",
      "사업을 언제 시작하면 좋을까요?",
    ].map(
      (question) =>
        buildFullArtifacts(
          question,
        ),
    );

  const reportCases =
    [
      "올해 총운을 봐주세요",
      "나의 연애운은 어떨까요?",
      "난 재물운이 있나요?",
      "2026년 운세 알려줘",
      "나는 언제쯤 대운이 들어올까요?",
    ].map(
      (question) =>
        buildFullArtifacts(
          question,
        ),
    );

  const checks = {
    K_questionDoesNotLeadWithPersonality:
      questionCases.every(
        (artifacts) =>
          doesNotLeadWithPersonality(
            artifacts.prompt,
          ),
      ),

    L_reportDoesNotBlockWithInsufficientEvidence:
      reportCases.every(
        (artifacts) =>
          doesNotBlockReportWithInsufficientEvidence(
            artifacts.prompt,
          ),
      ),

    M_explanationFocusUnchanged:
      questionCases[0]?.focus
      === "compatibility"
      && questionCases[1]?.focus
      === "compatibility"
      && mixedStart.focus
      === "businessStart"
      && mixedFortune.focus
      === "businessStart"
      && questionCases[2]?.focus
      === "continuation"
      && questionCases[3]?.focus
      === "generalJudgement"
      && questionCases[4]?.focus
      === null
      && questionCases[5]?.focus
      === "businessTiming",

    N_payloadStillPresent:
      mixedStart.prompt.userPrompt.includes(
        "답변에 필요한 판단 근거와 설명 요소",
      )
      && mixedFortune.prompt.userPrompt.includes(
        "답변에 필요한 판단 근거와 설명 요소",
      ),

    O_promptStructureKeepsMaterialsThenGrounding:
      mixedStart.prompt.userPrompt.indexOf(
        "답변에 필요한 판단 근거와 설명 요소",
      )
      < mixedStart.prompt.userPrompt.indexOf(
        "확인 원자료 — 원국·현재 운 국면·현실 정보",
      )
      && mixedFortune.prompt.userPrompt.indexOf(
        "답변에 필요한 판단 근거와 설명 요소",
      )
      < mixedFortune.prompt.userPrompt.indexOf(
        "확인 원자료 — 원국·현재 운 국면·현실 정보",
      ),

    P_groundingIsConfirmationSource:
      mixedStart.prompt.userPrompt.includes(
        "확인 원자료 — 원국·현재 운 국면·현실 정보",
      )
      && !mixedStart.prompt.userPrompt.includes(
        "개인별 사주 근거",
      )
      && mixedFortune.prompt.userPrompt.includes(
        "확인 원자료 — 원국·현재 운 국면·현실 정보",
      ),

    Q_questionContextKept:
      questionCases.every(
        (artifacts) =>
          keepsQuestionContextRules(
            artifacts.prompt,
          ),
      )
      && reportCases.every(
        (artifacts) =>
          keepsQuestionContextRules(
            artifacts.prompt,
          ),
      ),

    R_directAnswerPriorityKeptForQuestions:
      questionCases.every(
        (artifacts) =>
          hasDirectAnswerPriority(
            artifacts.prompt,
          ),
      ),

    S_roleRecommendationKept:
      questionCases[4]?.prompt.systemPrompt.includes(
        "세 가지 배역 후보",
      )
      === true,

    T_lifeFlowInterpretationKept:
      reportCases[0]?.prompt.systemPrompt.includes(
        "제공된 Evidence와 계산된 대운·세운·월운·일운 Fact만 설명한다",
      )
      === true
      || isReportAnswerModePrompt(
        reportCases[0]?.prompt
        ?? mixedFortune.prompt,
      ),

    U_engineVerdictAndFinalDecisionUnchanged:
      [...questionCases, ...reportCases, mixedStart, mixedFortune].every(
        (artifacts) =>
          engineDecisionLockedInPrompt(
            artifacts.prompt,
            artifacts.finalDecision,
          ),
      ),

    mixedStartStaysQuestion:
      isQuestionAnswerModePrompt(
        mixedStart.prompt,
      )
      && !isReportAnswerModePrompt(
        mixedStart.prompt,
      ),

    mixedFortuneStaysReport:
      isReportAnswerModePrompt(
        mixedFortune.prompt,
      )
      && !mixedFortune.prompt.systemPrompt.includes(
        "사업을 시작하는 것이 맞는지 중심으로 답한다",
      ),

    executionWhenStaysQuestion:
      questionCases[5]?.answerMode
      === "question"
      && isQuestionAnswerModePrompt(
        questionCases[5]?.prompt
        ?? mixedStart.prompt,
      ),

    daeunWhenStaysReport:
      reportCases[4]?.answerMode
      === "report"
      && isReportAnswerModePrompt(
        reportCases[4]?.prompt
        ?? mixedFortune.prompt,
      ),
  };

  return {
    name:
      "K-U-answer-mode-priority-and-4-1-to-4-6-regression",

    question:
      "2026년에 사업 시작해도 될까요?",

    focus:
      mixedStart.focus,

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyEvidenceSelectionAndCompression():
  ConsultingPromptBuilderVerificationCase {
  const partnership =
    buildFullArtifacts(
      "1967년 4월 10일 양력 출생 여성과 동업해도 될까요?",
    );

  const moneyRecovery =
    buildFullArtifacts(
      "이번에 빌려준 돈을 받을 수 있을까요?",
    );

  const continuation =
    buildFullArtifacts(
      "지금 만나는 사람과 이 관계를 계속 유지하는 게 좋을까요?",
    );

  const loveFortune =
    buildFullArtifacts(
      "나의 연애운은 어떨까요?",
    );

  const wealthFortune =
    buildFullArtifacts(
      "난 재물운이 있나요?",
    );

  const businessFortune =
    buildFullArtifacts(
      "2026년 사업운은 어떨까요?",
    );

  const businessStart =
    buildFullArtifacts(
      "2026년에 사업 시작해도 될까요?",
    );

  const overallFortune =
    buildFullArtifacts(
      "나의 총운은 어떻게 될까요?",
    );

  const daeunTiming =
    buildFullArtifacts(
      "나는 언제쯤 대운이 들어올까요?",
    );

  const executionWhen =
    buildFullArtifacts(
      "이 사람과 언제 결혼하면 좋을까요?",
    );

  const role =
    buildFullArtifacts(
      "내 사주로 연극을 한다면 나는 어떤 역할일까?",
    );

  const questionCases =
    [
      partnership,
      moneyRecovery,
      continuation,
      businessStart,
      executionWhen,
    ];

  const reportCases =
    [
      loveFortune,
      wealthFortune,
      businessFortune,
      overallFortune,
      daeunTiming,
    ];

  const insufficientEvidenceCase =
    [
      moneyRecovery,
      partnership,
      continuation,
      daeunTiming,
      buildFullArtifacts(
        "우리 둘의 궁합은 어떤가요?",
      ),
    ].find(
      (artifacts) =>
        artifacts.verdict
        === "insufficientEvidence",
    )
    ?? moneyRecovery;

  const waitCase =
    [
      continuation,
      partnership,
      moneyRecovery,
    ].find(
      (artifacts) =>
        artifacts.verdict
        === "wait",
    )
    ?? continuation;

  const checks = {
    A_questionKeepsDirectAnswerPriority:
      questionCases.every(
        (artifacts) =>
          hasDirectAnswerPriority(
            artifacts.prompt,
          )
          && isQuestionAnswerModePrompt(
            artifacts.prompt,
          ),
      ),

    B_reportKeepsAreaFlow:
      reportCases.every(
        (artifacts) =>
          isReportAnswerModePrompt(
            artifacts.prompt,
          ),
      ),

    C_questionDoesNotAutoUseUnrelatedReaders:
      questionCases.every(
        (artifacts) =>
          hasQuestionEvidencePriority(
            artifacts.prompt,
          )
          && artifacts.prompt.systemPrompt.includes(
            "질문과 직접 관계없는 건강, 직업, 인생 Reader 설명을 자동으로 모두 사용하지 않는다.",
          ),
      ),

    D_reportDoesNotOveruseUnrelatedReaders:
      reportCases.every(
        (artifacts) =>
          hasReportEvidencePriority(
            artifacts.prompt,
          )
          && artifacts.prompt.systemPrompt.includes(
            "질문 영역과 관계없는 Reader 설명을 과도하게 사용하지 않는다.",
          ),
      ),

    E_repeatedEvidenceCompressionExists:
      [...questionCases, ...reportCases].every(
        (artifacts) =>
          hasEvidenceCompression(
            artifacts.prompt,
          ),
      ),

    F_relatedEvidenceConditionsRisksDirectionFirst:
      questionCases.every(
        (artifacts) =>
          artifacts.prompt.systemPrompt.includes(
            "evidence, conditions, risks, recommendedDirection, prohibitedDirection은 질문과 관련 있을 때 우선 사용한다.",
          ),
      )
      && reportCases.every(
        (artifacts) =>
          artifacts.prompt.systemPrompt.includes(
            "evidence, conditions, risks, recommendedDirection, prohibitedDirection은 질문한 영역과 관련 있을 때 우선 사용한다.",
          ),
      ),

    G_unrelatedEvidenceIsNotUsed:
      [...questionCases, ...reportCases].every(
        (artifacts) =>
          hasEvidenceSelection(
            artifacts.prompt,
          )
          && artifacts.prompt.systemPrompt.includes(
            "관련 없는 근거는 사용하지 않는다.",
          ),
      ),

    H_insufficientEvidenceExplainsCurrentRangeFirst:
      insufficientEvidenceCase.verdict
      !== "insufficientEvidence"
      || INSUFFICIENT_EVIDENCE_RANGE_MARKERS.every(
        (marker) =>
          insufficientEvidenceCase.prompt.systemPrompt.includes(
            marker,
          ),
      ),

    I_waitIsNotRewrittenAsInsufficientEvidence:
      waitCase.prompt.systemPrompt.includes(
        "기다리며 지켜보라는 판단을 판단할 수 없다 또는 정보가 부족하다로 바꾸지 않는다",
      )
      && (
        waitCase.verdict
        !== "wait"
        || waitCase.prompt.systemPrompt.includes(
          "현재 엔진 판단은 정보 부족이 아니므로 정보 부족을 이유로 답변을 회피하지 않는다",
        )
      ),

    J_engineVerdictUnchanged:
      [...questionCases, ...reportCases, role].every(
        (artifacts) =>
          artifacts.prompt.systemPrompt.includes(
            "엔진의 verdict를 변경하지 않는다",
          ),
      ),

    K_finalDecisionMeaningUnchanged:
      [...questionCases, ...reportCases, role].every(
        (artifacts) =>
          systemPromptForbidsFinalDecisionChange(
            artifacts.prompt,
          )
          && userPromptIncludesCanonicalFinalDecision(
            artifacts.prompt,
            artifacts.finalDecision,
          ),
      ),

      L_finalDecisionAppearsExactlyOnce:
      [...questionCases, ...reportCases].every(
        (artifacts) =>
          systemPromptRequiresFinalDecisionOnceInBody(
            artifacts.prompt,
          )
          && userPromptIncludesCanonicalFinalDecision(
            artifacts.prompt,
            artifacts.finalDecision,
          ),
      ),

    M_explanationFocusKept:
      partnership.focus
      === "compatibility"
      && continuation.focus
      === "continuation"
      && moneyRecovery.focus
      === "generalJudgement"
      && businessStart.focus
      === "businessStart"
      && businessFortune.focus
      === "businessStart"
      && role.focus
      === null,

    N_payloadKept:
      [...questionCases, ...reportCases, role].every(
        (artifacts) =>
          artifacts.prompt.userPrompt.includes(
            "답변에 필요한 판단 근거와 설명 요소",
          ),
      ),

    O_promptStructureKept:
      [...questionCases, ...reportCases].every(
        (artifacts) =>
          artifacts.prompt.userPrompt.indexOf(
            "답변에 필요한 판단 근거와 설명 요소",
          )
          < artifacts.prompt.userPrompt.indexOf(
            "확인 원자료 — 원국·현재 운 국면·현실 정보",
          ),
      ),

    P_groundingKept:
      [...questionCases, ...reportCases].every(
        (artifacts) =>
          artifacts.prompt.userPrompt.includes(
            "확인 원자료 — 원국·현재 운 국면·현실 정보",
          )
          && artifacts.prompt.systemPrompt.includes(
            "확인 원자료 전체를 답변의 시작점이나 공통 설명의 근거로 사용하지 않는다.",
          ),
      ),

    Q_questionContextKept:
      [...questionCases, ...reportCases, role].every(
        (artifacts) =>
          keepsQuestionContextRules(
            artifacts.prompt,
          ),
      ),

    R_directAnswerPriorityKept:
      questionCases.every(
        (artifacts) =>
          hasDirectAnswerPriority(
            artifacts.prompt,
          ),
      ),

    S_questionReportSplitKept:
      isQuestionAnswerModePrompt(
        businessStart.prompt,
      )
      && isReportAnswerModePrompt(
        businessFortune.prompt,
      )
      && !businessFortune.prompt.systemPrompt.includes(
        "직답 우선 원칙",
      )
      && executionWhen.answerMode
      === "question"
      && daeunTiming.answerMode
      === "report",

    T_roleRecommendationKept:
      role.prompt.systemPrompt.includes(
        "세 가지 배역 후보",
      )
      && role.prompt.systemPrompt.includes(
        "evidence에 없는 배역",
      )
      && role.prompt.systemPrompt.includes(
        "역할과 직접 관계없는 Reader 설명을 무분별하게 추가하지 않는다.",
      )
      && !role.prompt.systemPrompt.includes(
        "질문형 근거 사용 원칙",
      )
      && !role.prompt.systemPrompt.includes(
        "반복 근거 압축 원칙",
      ),

    U_lifeFlowInterpretationKept:
      verifyLifeFlowInterpretationKept().passed
      && overallFortune.prompt.systemPrompt.includes(
        "모든 Reader를 같은 비중으로 나열하지 않는다.",
      )
      && isReportAnswerModePrompt(
        overallFortune.prompt,
      ),

    V_partnershipNotDominatedByCompatibility:
      hasPartnershipBusinessCenter(
        partnership.prompt,
      )
      && !partnership.prompt.systemPrompt.includes(
        "두 사람의 궁합에 직접 답한다",
      )
      && partnership.prompt.systemPrompt.includes(
        "동업 진행 판단, 상대와의 협업 가능성, 역할·책임·권한, 금전 부담과 위험, 필요한 조건을 중심으로 근거를 선택한다.",
      ),
  };

  return {
    name:
      "4-8-evidence-selection-and-answer-compression",

    question:
      partnership.originalQuestion,

    focus:
      partnership.focus,

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function includesAllMarkers(
  value:
    string,
  markers:
    readonly string[],
): boolean {
  return markers.every(
    (marker) =>
      value.includes(
        marker,
      ),
  );
}

function verifyQuestionSpecificEvidencePriority():
  ConsultingPromptBuilderVerificationCase {
  const partnership =
    buildFullArtifacts(
      "1967년 4월 10일 양력 출생 여성과 동업해도 될까요?",
    );

  const moneyRecovery =
    buildFullArtifacts(
      "이번에 빌려준 돈을 받을 수 있을까요?",
    );

  const continuation =
    buildFullArtifacts(
      "지금 만나는 사람과 이 관계를 계속 유지하는 게 좋을까요?",
    );

  const businessStart =
    buildFullArtifacts(
      "2026년에 사업 시작해도 될까요?",
    );

  const loveFortune =
    buildFullArtifacts(
      "나의 연애운은 어떨까요?",
    );

  const wealthFortune =
    buildFullArtifacts(
      "난 재물운이 있나요?",
    );

  const businessFortune =
    buildFullArtifacts(
      "2026년 사업운은 어떨까요?",
    );

  const overallFortune =
    buildFullArtifacts(
      "나의 총운은 어떻게 될까요?",
    );

  const role =
    buildFullArtifacts(
      "내 사주로 연극을 한다면 나는 어떤 역할일까?",
    );

  const questionCases =
    [
      partnership,
      moneyRecovery,
      continuation,
      businessStart,
    ];

  const reportCases =
    [
      loveFortune,
      wealthFortune,
      businessFortune,
      overallFortune,
    ];

  const checks = {
    A_questionKeepsDirectAnswerThenCoreEvidence:
      questionCases.every(
        (artifacts) =>
          hasDirectAnswerPriority(
            artifacts.prompt,
          )
          && includesAllMarkers(
            artifacts.prompt.systemPrompt,
            QUESTION_SPECIFIC_EVIDENCE_PRIORITY_MARKERS,
          )
          && artifacts.prompt.userPrompt.includes(
            "직답 다음에 핵심 근거, 필요한 조건과 위험, 방향을 사용하세요",
          ),
      ),

    B_reportKeepsAreaFlowThenCoreEvidence:
      reportCases.every(
        (artifacts) =>
          isReportAnswerModePrompt(
            artifacts.prompt,
          )
          && includesAllMarkers(
            artifacts.prompt.systemPrompt,
            REPORT_SPECIFIC_EVIDENCE_PRIORITY_MARKERS,
          ),
      ),

    C_commonEvidenceOnlyWhenItContributes:
      questionCases.every(
        (artifacts) =>
          artifacts.prompt.systemPrompt.includes(
            "삶의 동력, 생존 방식, 반복 패턴, 정체성, 인생 국면, 현재 운, 무관한 Reader는 질문에 실제 기여할 때만 사용한다",
          )
          && artifacts.prompt.systemPrompt.includes(
            "정체성과 인생 국면을 질문과 관계없이 반복하지 않는다",
          )
          && artifacts.prompt.userPrompt.includes(
            "삶의 동력, 생존 방식, 반복 패턴, 정체성, 인생 국면, 현재 운은 질문에 실제 기여할 때만 사용하세요",
          ),
      )
      && reportCases.every(
        (artifacts) =>
          artifacts.prompt.systemPrompt.includes(
            "삶의 동력, 생존 방식, 반복 패턴, 정체성, 인생 국면, 현재 운, 무관한 Reader는 질문한 영역에 실제 기여할 때만 사용한다",
          ),
      ),

    D_partnershipCentersRolesResponsibilityMoneyConflict:
      includesAllMarkers(
        partnership.prompt.systemPrompt,
        PARTNERSHIP_EVIDENCE_PRIORITY_MARKERS,
      )
      && hasPartnershipBusinessCenter(
        partnership.prompt,
      )
      && !partnership.prompt.systemPrompt.includes(
        "두 사람의 궁합에 직접 답한다",
      )
      && partnership.prompt.systemPrompt.includes(
        "동업 진행 판단, 상대와의 협업 가능성, 역할·책임·권한, 금전 부담과 위험, 필요한 조건을 중심으로 근거를 선택한다.",
      ),

    E_moneyRecoveryCentersRecoveryNotGenericFortune:
      includesAllMarkers(
        moneyRecovery.prompt.systemPrompt,
        MONEY_RECOVERY_EVIDENCE_PRIORITY_MARKERS,
      )
      && moneyRecovery.prompt.systemPrompt.includes(
        "일반 재물운, 전체 사업운, 전체 직업운, 인생운",
      )
      && moneyRecovery.prompt.systemPrompt.includes(
        "질문 자체에 직접 답한다",
      )
      && isQuestionAnswerModePrompt(
        moneyRecovery.prompt,
      ),

    F_continuationCentersKeepAndWaitMeaning:
      includesAllMarkers(
        continuation.prompt.systemPrompt,
        CONTINUATION_EVIDENCE_PRIORITY_MARKERS,
      )
      && continuation.prompt.systemPrompt.includes(
        "계속 유지하는 것이 맞는지 중심으로 답한다",
      )
      && continuation.prompt.systemPrompt.includes(
        "기다리며 지켜보라는 판단을 판단할 수 없다 또는 정보가 부족하다로 바꾸지 않는다",
      )
      && (
        continuation.verdict
        !== "wait"
        || continuation.prompt.systemPrompt.includes(
          "현재 엔진 판단은 정보 부족이 아니므로 정보 부족을 이유로 답변을 회피하지 않는다",
        )
      ),

    G_businessStartCentersStartFeasibility:
      includesAllMarkers(
        businessStart.prompt.systemPrompt,
        BUSINESS_START_EVIDENCE_PRIORITY_MARKERS,
      )
      && businessStart.prompt.systemPrompt.includes(
        "사업을 시작하는 것이 맞는지 중심으로 답한다",
      )
      && businessStart.prompt.systemPrompt.includes(
        "현재 시점, 성공 조건, 사업 위험, 실행 방향을 필요한 만큼 설명한다",
      )
      && isQuestionAnswerModePrompt(
        businessStart.prompt,
      ),

    H_reportDoesNotOverCompress:
      reportCases.every(
        (artifacts) =>
          artifacts.prompt.systemPrompt.includes(
            "연애운, 재물운, 사업운, 총운의 기존 충분한 설명력을 유지한다",
          )
          && artifacts.prompt.systemPrompt.includes(
            "과도하게 압축하지 않는다",
          )
          && artifacts.prompt.systemPrompt.includes(
            "필요한 근거가 많으면 충분히 설명한다. 억지로 짧게 만들지 않는다.",
          )
          && artifacts.prompt.userPrompt.includes(
            "연애운·재물운·사업운·총운의 설명력을 과도하게 줄이지 않았는가?",
          ),
      ),

    I_groundingUsesCommonEvidenceOnlyWhenNeeded:
      questionCases.every(
        (artifacts) =>
          artifacts.prompt.systemPrompt.includes(
            "원국 사실은 직답의 판단 근거와 직접 연결될 때 우선 사용한다.",
          ),
      )
      && reportCases.every(
        (artifacts) =>
          artifacts.prompt.systemPrompt.includes(
            "질문한 영역과 직접 관련 없는 Reader나 공통 성향은 자동으로 추가하지 않는다.",
          ),
      ),

    J_questionReportSplitAndDirectAnswerKept:
      isQuestionAnswerModePrompt(
        businessStart.prompt,
      )
      && isReportAnswerModePrompt(
        businessFortune.prompt,
      )
      && !businessFortune.prompt.systemPrompt.includes(
        "직답 우선 원칙",
      )
      && questionCases.every(
        (artifacts) =>
          hasDirectAnswerPriority(
            artifacts.prompt,
          ),
      ),

    K_roleRecommendationNotRewritten:
      role.prompt.systemPrompt.includes(
        "세 가지 배역 후보",
      )
      && role.prompt.systemPrompt.includes(
        "evidence에 없는 배역",
      )
      && !role.prompt.systemPrompt.includes(
        "질문형의 설명 순서는 질문, 직답, 핵심 근거, 필요한 조건과 위험, 방향이다",
      )
      && !role.prompt.systemPrompt.includes(
        "반복 근거 압축 원칙",
      ),
  };

  return {
    name:
      "4-9-question-specific-evidence-priority",

    question:
      partnership.originalQuestion,

    focus:
      partnership.focus,

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyMultiSpeechActResponsePolicyRegression():
  ConsultingPromptBuilderVerificationCase {
  const multiSpeechAct =
    buildFullArtifacts(
      "사업을 계속할 방법과 위험한 점은 무엇일까요?",
    );

  const singleSpeechAct =
    buildFullArtifacts(
      "사업을 계속할 방법이 있을까요?",
    );

  const fixtures = [
    multiSpeechAct,
    singleSpeechAct,
  ];

  const promptTexts =
    fixtures.map(
      (artifacts) =>
        combinedPromptText(
          artifacts.prompt,
        ),
    );

  const everyPrompt = (
    predicate: (
      text:
        string,
    ) => boolean,
  ): boolean =>
    promptTexts.every(
      predicate,
    );

  const checks = {
    A_primaryIntentIsJudgementCenter:
      everyPrompt(
        (text) =>
          text.includes(
            MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
          ),
      ),

    B_secondarySpeechActPolicyPresent:
      everyPrompt(
        (text) =>
          text.includes(
            MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
          ),
      ),

    C_secondaryDoesNotRejudgePrimary:
      everyPrompt(
        (text) =>
          text.includes(
            MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
          ),
      ),

    D_secondaryDoesNotInventFacts:
      everyPrompt(
        (text) =>
          text.includes(
            MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
          ),
      ),

    E_finalCheckKeepsCenterAndExplicitAsks:
      everyPrompt(
        (text) =>
          text.includes(
            MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[4],
          ),
      ),

    F_oldFinalCheckMarkerAbsent:
      everyPrompt(
        (text) =>
          !text.includes(
            MULTI_SPEECHACT_OLD_FINAL_CHECK_MARKER,
          ),
      ),

    keepsVerdictSection:
      fixtures.every(
        (artifacts) =>
          artifacts.verdictLabelPresent
          && artifacts.verdict.length
          > 0,
      ),

    keepsEngineDecisionLockedInPrompt:
      fixtures.every(
        (artifacts) =>
          engineDecisionLockedInPrompt(
            artifacts.prompt,
            artifacts.finalDecision,
          ),
      ),
  };

  return {
    name:
      "I-37-multi-speechact-response-policy-regression",

    question:
      multiSpeechAct.originalQuestion,

    focus:
      multiSpeechAct.focus,

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function inspectSecondaryMaterialsCoverage(
  questionText:
    string,
) {
  const input =
    buildDecisionEngineRegressionInput({
      questionText,
    });

  const question =
    readQuestion(
      input.humanContext,
      questionText,
    );

  const questionContext =
    buildQuestionContext(
      question,
    );

  const explanationInput =
    readDecisionResult(
      runDecisionEngine({
        ...input,
        question,
        questionContext,
      }),
    );

  const plan =
    buildDecisionExplanationPlan(
      explanationInput,
      question.originalQuestion,
      questionContext,
    );

  const payload =
    buildDecisionExplanationPayload(
      plan,
    );

  const prompt =
    buildConsultingPrompt(
      payload,
      buildConsultingGroundingContext({
        humanContext:
          input.humanContext,
        lifeContext:
          input.lifeContext,
        question:
          questionText,
      }),
      questionContext,
    );

  return {
    originalQuestion:
      question.originalQuestion,
    intent:
      payload.intent,
    decisionTarget:
      question.decisionTarget,
    timingType:
      question.timingType,
    asksWhat:
      question.asksWhat,
    focus:
      plan.explanationFocus
      ?? null,
    prompt,
    verdict:
      payload.verdict,
    finalDecision:
      payload.finalDecision,
    explanationTitles:
      payload.explanationOrder.map(
        (item) =>
          item.title,
      ),
    existingMaterialTexts: [
      ...explanationInput.conditions.map(
        (item) =>
          item.description,
      ),
      explanationInput.recommendedDirection,
      explanationInput.prohibitedDirection,
      ...payload.explanationOrder.map(
        (item) =>
          item.content,
      ),
    ].filter(
      (value) =>
        value.trim().length
        > 0,
    ),
    risksCount:
      explanationInput.risks.length,
    hasDedicatedRisksMaterial:
      plan.blocks.some(
        (block) =>
          block.step
          === "risks"
          && block.required,
      ),
    conditionsTexts:
      explanationInput.conditions.map(
        (item) =>
          item.description,
      ),
    hasConditionMaterial:
      explanationInput.conditions.length
      > 0,
    recommendedDirection:
      explanationInput.recommendedDirection,
    prohibitedDirection:
      explanationInput.prohibitedDirection,
    hasDirectionMaterial:
      explanationInput.recommendedDirection.trim().length
      > 0
      && explanationInput.prohibitedDirection.trim().length
      > 0,
  };
}

function verifySecondaryMaterialsCoverageRegression():
  ConsultingPromptBuilderVerificationCase {
  const multi =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 방법과 위험한 점은 무엇일까요?",
    );

  const single =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 방법이 있을까요?",
    );

  const multiText =
    combinedPromptText(
      multi.prompt,
    );

  const checks = {
    multiOriginalKeepsMethodAndRisk:
      multi.prompt.userPrompt.includes(
        multi.originalQuestion,
      ),

    multiPrimaryIntentIsRisk:
      multi.intent
      === "risk",

    multiAsksWhatStaysPrimaryCentered:
      multi.asksWhat.includes(
        "위험",
      )
      && !multi.asksWhat.includes(
        "방법",
      )
      && multi.prompt.userPrompt.includes(
        `알고 싶은 점: ${multi.asksWhat}`,
      )
      && !multiText.includes(
        "secondaryIntent",
      ),

    existingMaterialsAppearInPrompt:
      multi.hasConditionMaterial
      && multi.hasDirectionMaterial
      && multi.existingMaterialTexts.every(
        (value) =>
          multi.prompt.userPrompt.includes(
            value,
          ),
      ),

    absentDedicatedRisksAreNotInvented:
      multi.risksCount
      === 0
      && !multi.hasDedicatedRisksMaterial
      && !multi.explanationTitles.includes(
        "변경·이탈을 고려해야 하는 신호",
      )
      && !multi.explanationTitles.includes(
        "사업상 위험",
      ),

    noDedicatedMethodMaterialField:
      !multi.explanationTitles.some(
        (title) =>
          title.includes(
            "방법",
          ),
      ),

    singleDoesNotTriggerMultiCoverage:
      single.originalQuestion.includes(
        "방법",
      )
      && !single.originalQuestion.includes(
        "위험",
      )
      && single.intent
      === "method",
  };

  return {
    name:
      "I-38-secondary-materials-coverage-regression",
    question:
      multi.originalQuestion,
    focus:
      multi.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function promptHasMethodProxyBinding(
  promptText:
    string,
): boolean {
  return METHOD_PROXY_MATERIAL_BINDING_MARKERS.every(
    (marker) =>
      promptText.includes(
        marker,
      ),
  );
}

function promptAllowsRisksAsMethodProxy(
  promptText:
    string,
): boolean {
  return METHOD_PROXY_FORBIDDEN_ALLOWING_MARKERS.some(
    (marker) =>
      promptText.includes(
        marker,
      ),
  );
}

function hasNoDedicatedMethodMaterialField(
  explanationTitles:
    string[],
): boolean {
  return !explanationTitles.some(
    (title) =>
      title.includes(
        "방법",
      ),
  );
}

function verifySecondaryMethodProxyMaterialBindingRegression():
  ConsultingPromptBuilderVerificationCase {
  const continueMulti =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 방법과 위험한 점은 무엇일까요?",
    );

  const leaveMulti =
    inspectSecondaryMaterialsCoverage(
      "사업을 끝낼 방법과 위험한 점은 무엇일까요?",
    );

  const continueSingle =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 방법이 있을까요?",
    );

  const continueMultiText =
    combinedPromptText(
      continueMulti.prompt,
    );

  const leaveMultiText =
    combinedPromptText(
      leaveMulti.prompt,
    );

  const continueSingleText =
    combinedPromptText(
      continueSingle.prompt,
    );

  const checks = {
    A_multiSpeechActCoverageApplied:
      continueMulti.originalQuestion.includes(
        "방법",
      )
      && continueMulti.originalQuestion.includes(
        "위험",
      )
      && continueMultiText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && continueMultiText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      ),

    A_primaryIntentIsRisk:
      continueMulti.intent
      === "risk",

    A_secondaryMethodPreservedInOriginal:
      continueMulti.prompt.userPrompt.includes(
        continueMulti.originalQuestion,
      )
      && continueMulti.originalQuestion.includes(
        "방법",
      )
      && !continueMulti.asksWhat.includes(
        "방법",
      ),

    A_methodProxyIsConditionsAndDirections:
      continueMulti.hasConditionMaterial
      && continueMulti.hasDirectionMaterial
      && promptHasMethodProxyBinding(
        continueMultiText,
      ),

    A_absentRisksAreNotMethodProxyMaterial:
      continueMulti.risksCount
      === 0
      && !continueMulti.hasDedicatedRisksMaterial
      && !promptAllowsRisksAsMethodProxy(
        continueMultiText,
      )
      && hasNoDedicatedMethodMaterialField(
        continueMulti.explanationTitles,
      ),

    B_multiSpeechActCoverageApplied:
      leaveMulti.originalQuestion.includes(
        "방법",
      )
      && leaveMulti.originalQuestion.includes(
        "위험",
      )
      && leaveMultiText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && leaveMultiText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      ),

    B_primaryIntentIsRisk:
      leaveMulti.intent
      === "risk",

    B_risksMaterialExistsForPrimaryRisk:
      leaveMulti.risksCount
      > 0
      && leaveMulti.hasDedicatedRisksMaterial
      && leaveMulti.explanationTitles.includes(
        "위험",
      ),

    B_methodProxyLimitedToConditionsAndDirections:
      leaveMulti.hasConditionMaterial
      && leaveMulti.hasDirectionMaterial
      && promptHasMethodProxyBinding(
        leaveMultiText,
      )
      && !promptAllowsRisksAsMethodProxy(
        leaveMultiText,
      ),

    B_noEvidenceOrDedicatedMethodExpansion:
      leaveMultiText.includes(
        METHOD_PROXY_MATERIAL_BINDING_MARKERS[2],
      )
      && hasNoDedicatedMethodMaterialField(
        leaveMulti.explanationTitles,
      )
      && !leaveMultiText.includes(
        "secondaryIntent",
      ),

    C_singleSpeechActOnly:
      continueSingle.originalQuestion.includes(
        "방법",
      )
      && !continueSingle.originalQuestion.includes(
        "위험",
      )
      && continueSingle.intent
      === "method",

    C_multiCoverageDoesNotMisFire:
      !continueSingle.asksWhat.includes(
        "위험",
      )
      && !continueSingleText.includes(
        "secondaryIntent",
      )
      && continueSingle.prompt.userPrompt.includes(
        `알고 싶은 점: ${continueSingle.asksWhat}`,
      ),

    C_continueMaterialsMatchConditionsDirectionsShape:
      continueSingle.hasConditionMaterial
      && continueSingle.hasDirectionMaterial
      && continueSingle.risksCount
      === 0
      && !continueSingle.hasDedicatedRisksMaterial
      && continueSingle.explanationTitles.join(
        "|",
      )
      === continueMulti.explanationTitles.join(
        "|",
      )
      && promptHasMethodProxyBinding(
        continueSingleText,
      )
      && !promptAllowsRisksAsMethodProxy(
        continueSingleText,
      ),
  };

  return {
    name:
      "I-39-secondary-method-proxy-material-binding-regression",
    question:
      continueMulti.originalQuestion,
    focus:
      continueMulti.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyNonRiskPrimaryCompositeEvaluationMethodRegression():
  ConsultingPromptBuilderVerificationCase {
  const evalMethodComposite =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속하는 게 좋을지, 어떤 방법으로 해야 할지 궁금합니다.",
    );

  const evaluationSingle =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속하는 게 좋을까요?",
    );

  const evaluationReasonComposite =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속하는 게 좋을지, 그 이유가 궁금합니다.",
    );

  const methodSingle =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 방법이 있을까요?",
    );

  const evalMethodText =
    combinedPromptText(
      evalMethodComposite.prompt,
    );

  const evaluationSingleText =
    combinedPromptText(
      evaluationSingle.prompt,
    );

  const evaluationReasonText =
    combinedPromptText(
      evaluationReasonComposite.prompt,
    );

  const checks = {
    A_primaryIntentIsMethodNotEvaluation:
      evalMethodComposite.intent
      === "method"
      && evalMethodComposite.decisionTarget
      === "continue",

    A_asksWhatStaysMethodCentered:
      evalMethodComposite.asksWhat.includes(
        "대응",
      )
      && !evalMethodComposite.asksWhat.includes(
        "판단",
      )
      && evalMethodComposite.prompt.userPrompt.includes(
        `알고 싶은 점: ${evalMethodComposite.asksWhat}`,
      ),

    A_originalPreservesEvaluationAndMethod:
      evalMethodComposite.originalQuestion.includes(
        "좋을지",
      )
      && evalMethodComposite.originalQuestion.includes(
        "방법",
      )
      && evalMethodComposite.prompt.userPrompt.includes(
        evalMethodComposite.originalQuestion,
      ),

    A_multiSpeechActKeepsPrimaryCenter:
      evalMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && evalMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      )
      && evalMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && evalMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && !evalMethodText.includes(
        "secondaryIntent",
      ),

    A_secondaryEvaluationDoesNotRejudgeMaterials:
      evalMethodComposite.verdict
      === methodSingle.verdict
      && evalMethodComposite.finalDecision
      === methodSingle.finalDecision
      && evalMethodComposite.explanationTitles.join(
        "|",
      )
      === methodSingle.explanationTitles.join(
        "|",
      )
      && evalMethodComposite.risksCount
      === methodSingle.risksCount
      && engineDecisionLockedInPrompt(
        evalMethodComposite.prompt,
        evalMethodComposite.finalDecision,
      ),

    A_methodProxyNotMisappliedToEvaluationSecondary:
      evalMethodComposite.intent
      !== "risk"
      && evalMethodComposite.asksWhat
      === methodSingle.asksWhat
      && promptHasMethodProxyBinding(
        evalMethodText,
      )
      && evalMethodText.includes(
        METHOD_PROXY_MATERIAL_BINDING_MARKERS[0],
      )
      && !evalMethodText.includes(
        "secondary evaluation",
      )
      && hasNoDedicatedMethodMaterialField(
        evalMethodComposite.explanationTitles,
      ),

    B_evaluationSingleIsNotComposite:
      evaluationSingle.intent
      === "evaluation"
      && evaluationSingle.decisionTarget
      === "continue"
      && evaluationSingle.originalQuestion.includes(
        "좋을까요",
      )
      && !evaluationSingle.originalQuestion.includes(
        "방법",
      )
      && !evaluationSingle.originalQuestion.includes(
        "이유",
      ),

    B_multiSpeechActDoesNotMisFire:
      evaluationSingle.asksWhat.includes(
        "판단",
      )
      && !evaluationSingle.asksWhat.includes(
        "대응",
      )
      && !evaluationSingleText.includes(
        "secondaryIntent",
      )
      && evaluationSingle.prompt.userPrompt.includes(
        `알고 싶은 점: ${evaluationSingle.asksWhat}`,
      ),

    C_evaluationReasonKeepsEvaluationPrimary:
      evaluationReasonComposite.intent
      === "evaluation"
      && evaluationReasonComposite.decisionTarget
      === "continue"
      && evaluationReasonComposite.originalQuestion.includes(
        "좋을지",
      )
      && evaluationReasonComposite.originalQuestion.includes(
        "이유",
      )
      && !evaluationReasonComposite.originalQuestion.includes(
        "방법",
      )
      && evaluationReasonComposite.asksWhat
      === evaluationSingle.asksWhat
      && evaluationReasonComposite.prompt.userPrompt.includes(
        evaluationReasonComposite.originalQuestion,
      )
      && !evaluationReasonText.includes(
        "secondaryIntent",
      ),
  };

  return {
    name:
      "I-40-non-risk-primary-composite-evaluation-method-regression",
    question:
      evalMethodComposite.originalQuestion,
    focus:
      evalMethodComposite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyTimingPrimaryCompositeSecondaryRiskMethodRegression():
  ConsultingPromptBuilderVerificationCase {
  const timingRiskComposite =
    inspectSecondaryMaterialsCoverage(
      "사업을 시작할 시기와 위험은 무엇인가요?",
    );

  const timingMethodComposite =
    inspectSecondaryMaterialsCoverage(
      "사업을 시작할 시기와 어떤 방법으로 준비해야 할까요?",
    );

  const timingOnly =
    inspectSecondaryMaterialsCoverage(
      "사업을 시작할 시기인가요?",
    );

  const riskOnlyStart =
    inspectSecondaryMaterialsCoverage(
      "사업을 시작할 때 위험한 점은 무엇인가요?",
    );

  const timingRiskText =
    combinedPromptText(
      timingRiskComposite.prompt,
    );

  const timingMethodText =
    combinedPromptText(
      timingMethodComposite.prompt,
    );

  const timingOnlyText =
    combinedPromptText(
      timingOnly.prompt,
    );

  const checks = {
    A_primaryIntentIsTimingNotRisk:
      timingRiskComposite.intent
      === "timing"
      && timingRiskComposite.decisionTarget
      === "start"
      && timingRiskComposite.timingType
      === "bestTiming",

    A_asksWhatStaysTimingCentered:
      timingRiskComposite.asksWhat.includes(
        "언제",
      )
      && !timingRiskComposite.asksWhat.includes(
        "위험",
      )
      && timingRiskComposite.prompt.userPrompt.includes(
        `알고 싶은 점: ${timingRiskComposite.asksWhat}`,
      ),

    A_originalPreservesSecondaryRisk:
      timingRiskComposite.originalQuestion.includes(
        "시기",
      )
      && timingRiskComposite.originalQuestion.includes(
        "위험",
      )
      && timingRiskComposite.prompt.userPrompt.includes(
        timingRiskComposite.originalQuestion,
      ),

    A_multiSpeechActKeepsPrimaryCenter:
      timingRiskText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && timingRiskText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      )
      && timingRiskText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && timingRiskText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && !timingRiskText.includes(
        "secondaryIntent",
      ),

    A_secondaryRiskDoesNotRejudgeTimingMaterials:
      timingRiskComposite.verdict
      === timingOnly.verdict
      && timingRiskComposite.finalDecision
      === timingOnly.finalDecision
      && timingRiskComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      )
      && timingRiskComposite.risksCount
      === timingOnly.risksCount
      && engineDecisionLockedInPrompt(
        timingRiskComposite.prompt,
        timingRiskComposite.finalDecision,
      ),

    A_risksStayWithinExistingEngineMaterials:
      timingRiskComposite.risksCount
      > 0
      && timingRiskComposite.hasDedicatedRisksMaterial
      && timingRiskComposite.explanationTitles.includes(
        "사업상 위험",
      )
      && timingRiskComposite.existingMaterialTexts.every(
        (value) =>
          timingRiskComposite.prompt.userPrompt.includes(
            value,
          ),
      )
      && timingRiskText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      ),

    B_primaryIntentIsTimingNotMethod:
      timingMethodComposite.intent
      === "timing"
      && timingMethodComposite.decisionTarget
      === "start"
      && timingMethodComposite.timingType
      === "bestTiming",

    B_asksWhatStaysTimingCentered:
      timingMethodComposite.asksWhat.includes(
        "언제",
      )
      && !timingMethodComposite.asksWhat.includes(
        "방법",
      )
      && timingMethodComposite.prompt.userPrompt.includes(
        `알고 싶은 점: ${timingMethodComposite.asksWhat}`,
      ),

    B_originalPreservesSecondaryMethod:
      timingMethodComposite.originalQuestion.includes(
        "시기",
      )
      && timingMethodComposite.originalQuestion.includes(
        "방법",
      )
      && timingMethodComposite.prompt.userPrompt.includes(
        timingMethodComposite.originalQuestion,
      ),

    B_multiSpeechActKeepsPrimaryCenter:
      timingMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && timingMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      )
      && timingMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && timingMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && !timingMethodText.includes(
        "secondaryIntent",
      ),

    B_secondaryMethodDoesNotRejudgeTimingMaterials:
      timingMethodComposite.verdict
      === timingOnly.verdict
      && timingMethodComposite.finalDecision
      === timingOnly.finalDecision
      && timingMethodComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      )
      && timingMethodComposite.risksCount
      === timingOnly.risksCount
      && engineDecisionLockedInPrompt(
        timingMethodComposite.prompt,
        timingMethodComposite.finalDecision,
      ),

    B_methodProxyStaysCompatibleWithI39Boundary:
      timingMethodComposite.hasConditionMaterial
      && timingMethodComposite.hasDirectionMaterial
      && promptHasMethodProxyBinding(
        timingMethodText,
      )
      && !promptAllowsRisksAsMethodProxy(
        timingMethodText,
      )
      && hasNoDedicatedMethodMaterialField(
        timingMethodComposite.explanationTitles,
      )
      && timingMethodComposite.existingMaterialTexts.every(
        (value) =>
          timingMethodComposite.prompt.userPrompt.includes(
            value,
          ),
      ),

    C_timingOnlyIsNotComposite:
      timingOnly.intent
      === "timing"
      && timingOnly.decisionTarget
      === "start"
      && timingOnly.timingType
      === "bestTiming"
      && timingOnly.originalQuestion.includes(
        "시기",
      )
      && !timingOnly.originalQuestion.includes(
        "위험",
      )
      && !timingOnly.originalQuestion.includes(
        "방법",
      ),

    C_multiSpeechActDoesNotMisFire:
      timingOnly.asksWhat.includes(
        "언제",
      )
      && !timingOnly.asksWhat.includes(
        "위험",
      )
      && !timingOnly.asksWhat.includes(
        "방법",
      )
      && !timingOnlyText.includes(
        "secondaryIntent",
      )
      && timingOnly.prompt.userPrompt.includes(
        `알고 싶은 점: ${timingOnly.asksWhat}`,
      ),

    D_riskOnlyStartIsNotTimingPrimary:
      riskOnlyStart.intent
      === "risk"
      && riskOnlyStart.decisionTarget
      === "start"
      && riskOnlyStart.timingType
      === "unknown"
      && riskOnlyStart.originalQuestion.includes(
        "위험",
      )
      && !riskOnlyStart.originalQuestion.includes(
        "시기",
      )
      && riskOnlyStart.asksWhat.includes(
        "위험",
      )
      && !riskOnlyStart.asksWhat.includes(
        "언제",
      ),
  };

  return {
    name:
      "I-41-timing-primary-composite-secondary-risk-method-regression",
    question:
      timingRiskComposite.originalQuestion,
    focus:
      timingRiskComposite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyEvaluationPrimaryReasonSecondaryEvidenceProxyRegression():
  ConsultingPromptBuilderVerificationCase {
  const evaluationReasonComposite =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속하는 게 좋을지, 그 이유가 궁금합니다.",
    );

  const evaluationSingle =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속하는 게 좋을까요?",
    );

  const evaluationReasonText =
    combinedPromptText(
      evaluationReasonComposite.prompt,
    );

  const checks = {
    evaluationPrimaryMaintained:
      evaluationReasonComposite.intent
      === "evaluation",

    decisionTargetContinueMaintained:
      evaluationReasonComposite.decisionTarget
      === "continue",

    originalPreservesReasonDemand:
      evaluationReasonComposite.originalQuestion.includes(
        "좋을지",
      )
      && evaluationReasonComposite.originalQuestion.includes(
        "이유",
      )
      && evaluationReasonComposite.prompt.userPrompt.includes(
        evaluationReasonComposite.originalQuestion,
      ),

    asksWhatStaysEvaluationCentered:
      evaluationReasonComposite.asksWhat.includes(
        "판단",
      )
      && !evaluationReasonComposite.asksWhat.includes(
        "이유",
      )
      && !evaluationReasonComposite.asksWhat.includes(
        "방법",
      )
      && evaluationReasonComposite.asksWhat
      === evaluationSingle.asksWhat
      && evaluationReasonComposite.prompt.userPrompt.includes(
        `알고 싶은 점: ${evaluationReasonComposite.asksWhat}`,
      ),

    reasonSecondaryDoesNotCreateReasonIntent:
      evaluationReasonComposite.intent
      === "evaluation"
      && !evaluationReasonText.includes(
        "secondaryIntent",
      ),

    reasonDemandBindsToEvidenceProxyYujiGeungeo:
      evaluationReasonComposite.explanationTitles.includes(
        "유지의 근거",
      )
      && evaluationReasonComposite.prompt.userPrompt.includes(
        "유지의 근거",
      )
      && evaluationReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      ),

    evidenceMaterialDoesNotDisappearVsSingle:
      evaluationSingle.explanationTitles.includes(
        "유지의 근거",
      )
      && evaluationReasonComposite.explanationTitles.includes(
        "유지의 근거",
      )
      && evaluationReasonComposite.explanationTitles.join(
        "|",
      )
      === evaluationSingle.explanationTitles.join(
        "|",
      ),

    reasonSecondaryDoesNotOverExpandConditions:
      evaluationReasonComposite.hasConditionMaterial
      === evaluationSingle.hasConditionMaterial
      && evaluationReasonComposite.conditionsTexts.join(
        "|",
      )
      === evaluationSingle.conditionsTexts.join(
        "|",
      ),

    reasonSecondaryDoesNotOverExpandRisks:
      evaluationReasonComposite.risksCount
      === evaluationSingle.risksCount
      && evaluationReasonComposite.hasDedicatedRisksMaterial
      === evaluationSingle.hasDedicatedRisksMaterial,

    reasonSecondaryDoesNotOverExpandDirections:
      evaluationReasonComposite.hasDirectionMaterial
      === evaluationSingle.hasDirectionMaterial
      && evaluationReasonComposite.recommendedDirection
      === evaluationSingle.recommendedDirection
      && evaluationReasonComposite.prohibitedDirection
      === evaluationSingle.prohibitedDirection
      && evaluationReasonComposite.verdict
      === evaluationSingle.verdict
      && evaluationReasonComposite.finalDecision
      === evaluationSingle.finalDecision
      && engineDecisionLockedInPrompt(
        evaluationReasonComposite.prompt,
        evaluationReasonComposite.finalDecision,
      ),

    methodSpecificMaterialNotCreatedByReason:
      hasNoDedicatedMethodMaterialField(
        evaluationReasonComposite.explanationTitles,
      )
      && !evaluationReasonComposite.asksWhat.includes(
        "방법",
      )
      && !evaluationReasonComposite.originalQuestion.includes(
        "방법",
      ),

    fixtureDoesNotInventFactsOrJudgements:
      evaluationReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && evaluationReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && evaluationReasonComposite.existingMaterialTexts.every(
        (value) =>
          evaluationReasonComposite.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-42-evaluation-primary-reason-secondary-evidence-proxy-regression",
    question:
      evaluationReasonComposite.originalQuestion,
    focus:
      evaluationReasonComposite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyMethodPrimaryReasonSecondaryEvidenceProxyRegression():
  ConsultingPromptBuilderVerificationCase {
  const methodReasonComposite =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 방법이 있을지, 그 이유도 궁금합니다.",
    );

  const methodSingle =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 방법이 있을까요?",
    );

  const methodReasonText =
    combinedPromptText(
      methodReasonComposite.prompt,
    );

  const checks = {
    methodPrimaryMaintained:
      methodReasonComposite.intent
      === "method",

    decisionTargetContinueMaintained:
      methodReasonComposite.decisionTarget
      === "continue",

    originalPreservesMethodAndReasonDemand:
      methodReasonComposite.originalQuestion.includes(
        "방법",
      )
      && methodReasonComposite.originalQuestion.includes(
        "이유",
      )
      && methodReasonComposite.prompt.userPrompt.includes(
        methodReasonComposite.originalQuestion,
      ),

    asksWhatStaysMethodCentered:
      methodReasonComposite.asksWhat.includes(
        "대응",
      )
      && !methodReasonComposite.asksWhat.includes(
        "판단",
      )
      && !methodReasonComposite.asksWhat.includes(
        "이유",
      )
      && methodReasonComposite.asksWhat
      === methodSingle.asksWhat
      && methodReasonComposite.prompt.userPrompt.includes(
        `알고 싶은 점: ${methodReasonComposite.asksWhat}`,
      ),

    reasonSecondaryDoesNotCreateReasonIntent:
      methodReasonComposite.intent
      === "method"
      && !methodReasonText.includes(
        "secondaryIntent",
      ),

    methodProxyStructureMaintained:
      methodReasonComposite.hasConditionMaterial
      && methodReasonComposite.hasDirectionMaterial
      && promptHasMethodProxyBinding(
        methodReasonText,
      )
      && !promptAllowsRisksAsMethodProxy(
        methodReasonText,
      )
      && hasNoDedicatedMethodMaterialField(
        methodReasonComposite.explanationTitles,
      ),

    materialsDoNotOverExpandVsMethodOnly:
      methodReasonComposite.explanationTitles.join(
        "|",
      )
      === methodSingle.explanationTitles.join(
        "|",
      )
      && methodReasonComposite.verdict
      === methodSingle.verdict
      && methodReasonComposite.finalDecision
      === methodSingle.finalDecision,

    reasonSecondaryDoesNotOverExpandConditions:
      methodReasonComposite.hasConditionMaterial
      === methodSingle.hasConditionMaterial
      && methodReasonComposite.conditionsTexts.join(
        "|",
      )
      === methodSingle.conditionsTexts.join(
        "|",
      ),

    reasonSecondaryDoesNotOverExpandRisks:
      methodReasonComposite.risksCount
      === methodSingle.risksCount
      && methodReasonComposite.hasDedicatedRisksMaterial
      === methodSingle.hasDedicatedRisksMaterial,

    reasonSecondaryDoesNotOverExpandDirections:
      methodReasonComposite.hasDirectionMaterial
      === methodSingle.hasDirectionMaterial
      && methodReasonComposite.recommendedDirection
      === methodSingle.recommendedDirection
      && methodReasonComposite.prohibitedDirection
      === methodSingle.prohibitedDirection
      && engineDecisionLockedInPrompt(
        methodReasonComposite.prompt,
        methodReasonComposite.finalDecision,
      ),

    evaluationSpecificMaterialNotCreatedByReason:
      methodReasonComposite.intent
      !== "evaluation"
      && !methodReasonComposite.asksWhat.includes(
        "판단",
      )
      && methodReasonComposite.explanationTitles.join(
        "|",
      )
      === methodSingle.explanationTitles.join(
        "|",
      ),

    fixtureDoesNotInventFactsOrJudgements:
      methodReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && methodReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && methodReasonComposite.existingMaterialTexts.every(
        (value) =>
          methodReasonComposite.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-43-method-primary-reason-secondary-evidence-proxy-regression",
    question:
      methodReasonComposite.originalQuestion,
    focus:
      methodReasonComposite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyFalseMultiSpeechAntiExpansionNegativeBoundaryRegression():
  ConsultingPromptBuilderVerificationCase {
  const falseMulti =
    inspectSecondaryMaterialsCoverage(
      "위험한 방법으로 사업을 계속해도 될까요?",
    );

  const riskOnly =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속하면 위험할까요?",
    );

  const evaluationSurface =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속해도 될까요?",
    );

  const trueMethodRiskMulti =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 방법과 위험한 점은 무엇일까요?",
    );

  const falseMultiText =
    combinedPromptText(
      falseMulti.prompt,
    );

  const checks = {
    riskPrimaryMaintained:
      falseMulti.intent
      === "risk",

    decisionTargetContinueMaintained:
      falseMulti.decisionTarget
      === "continue",

    secondaryMethodIntentNotCreated:
      falseMulti.intent
      !== "method"
      && !falseMultiText.includes(
        "secondaryIntent",
      ),

    asksWhatStaysRiskCentered:
      falseMulti.asksWhat.includes(
        "위험",
      )
      && !falseMulti.asksWhat.includes(
        "방법",
      )
      && falseMulti.asksWhat
      === riskOnly.asksWhat
      && falseMulti.prompt.userPrompt.includes(
        `알고 싶은 점: ${falseMulti.asksWhat}`,
      ),

    lexicalMethodPreservedWithoutSpeechActDemand:
      falseMulti.originalQuestion.includes(
        "방법",
      )
      && falseMulti.originalQuestion.includes(
        "위험",
      )
      && falseMulti.prompt.userPrompt.includes(
        falseMulti.originalQuestion,
      )
      && !falseMulti.asksWhat.includes(
        "방법",
      )
      && trueMethodRiskMulti.originalQuestion.includes(
        "방법",
      )
      && trueMethodRiskMulti.originalQuestion.includes(
        "위험",
      )
      && trueMethodRiskMulti.intent
      === "risk",

    materialsDoNotExpandLikeTrueMethodRiskComposite:
      falseMulti.explanationTitles.join(
        "|",
      )
      === riskOnly.explanationTitles.join(
        "|",
      )
      && falseMulti.risksCount
      === riskOnly.risksCount
      && falseMulti.hasDedicatedRisksMaterial
      === riskOnly.hasDedicatedRisksMaterial
      && hasNoDedicatedMethodMaterialField(
        falseMulti.explanationTitles,
      ),

    methodProxyMaterialsNotCreatedWithoutMethodDemand:
      falseMulti.hasConditionMaterial
      === riskOnly.hasConditionMaterial
      && falseMulti.conditionsTexts.join(
        "|",
      )
      === riskOnly.conditionsTexts.join(
        "|",
      )
      && falseMulti.hasDirectionMaterial
      === riskOnly.hasDirectionMaterial
      && falseMulti.recommendedDirection
      === riskOnly.recommendedDirection
      && falseMulti.prohibitedDirection
      === riskOnly.prohibitedDirection,

    evaluationPermissionSurfaceDoesNotFlipRiskPrimary:
      evaluationSurface.intent
      === "evaluation"
      && evaluationSurface.decisionTarget
      === "continue"
      && falseMulti.intent
      === "risk"
      && falseMulti.originalQuestion.includes(
        "해도 될까요",
      )
      && falseMulti.asksWhat
      !== evaluationSurface.asksWhat,

    multiSpeechPolicyNotMisclassifiedAsTrueMulti:
      !falseMultiText.includes(
        "secondaryIntent",
      )
      && falseMulti.asksWhat
      === riskOnly.asksWhat
      && falseMulti.explanationTitles.join(
        "|",
      )
      === riskOnly.explanationTitles.join(
        "|",
      )
      && falseMultiText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && falseMultiText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      ),

    baselineRiskOnlyMaterialsAndVerdictUnchanged:
      falseMulti.verdict
      === riskOnly.verdict
      && falseMulti.finalDecision
      === riskOnly.finalDecision
      && falseMulti.explanationTitles.join(
        "|",
      )
      === riskOnly.explanationTitles.join(
        "|",
      )
      && falseMulti.conditionsTexts.join(
        "|",
      )
      === riskOnly.conditionsTexts.join(
        "|",
      )
      && falseMulti.risksCount
      === riskOnly.risksCount
      && falseMulti.recommendedDirection
      === riskOnly.recommendedDirection
      && falseMulti.prohibitedDirection
      === riskOnly.prohibitedDirection
      && engineDecisionLockedInPrompt(
        falseMulti.prompt,
        falseMulti.finalDecision,
      ),

    fixtureDoesNotInventFactsOrJudgements:
      falseMultiText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && falseMultiText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && falseMulti.existingMaterialTexts.every(
        (value) =>
          falseMulti.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-44-false-multi-speech-anti-expansion-negative-boundary-regression",
    question:
      falseMulti.originalQuestion,
    focus:
      falseMulti.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyRiskPrimaryReasonSecondaryEvidenceProxyRegression():
  ConsultingPromptBuilderVerificationCase {
  const continueRiskReason =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속하면 위험한 점과 그 이유가 궁금합니다.",
    );

  const continueRiskOnly =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속하면 위험할까요?",
    );

  const stopRiskReason =
    inspectSecondaryMaterialsCoverage(
      "사업을 끝낼 때 위험한 점과 그 이유가 궁금합니다.",
    );

  const stopRiskOnly =
    inspectSecondaryMaterialsCoverage(
      "사업을 끝내면 위험할까요?",
    );

  const continueRiskReasonText =
    combinedPromptText(
      continueRiskReason.prompt,
    );

  const stopRiskReasonText =
    combinedPromptText(
      stopRiskReason.prompt,
    );

  const checks = {
    continueRiskPrimaryMaintained:
      continueRiskReason.intent
      === "risk",

    continueDecisionTargetMaintained:
      continueRiskReason.decisionTarget
      === "continue",

    continueOriginalPreservesReasonDemand:
      continueRiskReason.originalQuestion.includes(
        "위험",
      )
      && continueRiskReason.originalQuestion.includes(
        "이유",
      )
      && continueRiskReason.prompt.userPrompt.includes(
        continueRiskReason.originalQuestion,
      ),

    continueAsksWhatStaysRiskCentered:
      continueRiskReason.asksWhat.includes(
        "위험",
      )
      && !continueRiskReason.asksWhat.includes(
        "이유",
      )
      && !continueRiskReason.asksWhat.includes(
        "방법",
      )
      && !continueRiskReason.asksWhat.includes(
        "판단",
      )
      && continueRiskReason.asksWhat
      === continueRiskOnly.asksWhat
      && continueRiskReason.prompt.userPrompt.includes(
        `알고 싶은 점: ${continueRiskReason.asksWhat}`,
      ),

    continueReasonSecondaryDoesNotCreateReasonIntent:
      continueRiskReason.intent
      === "risk"
      && !continueRiskReasonText.includes(
        "secondaryIntent",
      ),

    continueReasonDemandBindsToEvidenceProxy:
      continueRiskReason.explanationTitles.includes(
        "유지의 근거",
      )
      && continueRiskReason.prompt.userPrompt.includes(
        "유지의 근거",
      )
      && continueRiskReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      ),

    continueRisksRemainZeroWithoutInvention:
      continueRiskReason.risksCount
      === 0
      && continueRiskOnly.risksCount
      === 0
      && !continueRiskReason.hasDedicatedRisksMaterial
      && !continueRiskOnly.hasDedicatedRisksMaterial
      && !continueRiskReason.explanationTitles.includes(
        "위험",
      )
      && !continueRiskReason.explanationTitles.includes(
        "변경·이탈을 고려해야 하는 신호",
      )
      && !continueRiskReason.explanationTitles.includes(
        "사업상 위험",
      ),

    continueMaterialsDoNotOverExpandVsRiskOnly:
      continueRiskReason.explanationTitles.join(
        "|",
      )
      === continueRiskOnly.explanationTitles.join(
        "|",
      )
      && continueRiskReason.verdict
      === continueRiskOnly.verdict
      && continueRiskReason.finalDecision
      === continueRiskOnly.finalDecision
      && continueRiskReason.hasConditionMaterial
      === continueRiskOnly.hasConditionMaterial
      && continueRiskReason.conditionsTexts.join(
        "|",
      )
      === continueRiskOnly.conditionsTexts.join(
        "|",
      )
      && continueRiskReason.risksCount
      === continueRiskOnly.risksCount
      && continueRiskReason.hasDedicatedRisksMaterial
      === continueRiskOnly.hasDedicatedRisksMaterial
      && continueRiskReason.hasDirectionMaterial
      === continueRiskOnly.hasDirectionMaterial
      && continueRiskReason.recommendedDirection
      === continueRiskOnly.recommendedDirection
      && continueRiskReason.prohibitedDirection
      === continueRiskOnly.prohibitedDirection
      && engineDecisionLockedInPrompt(
        continueRiskReason.prompt,
        continueRiskReason.finalDecision,
      ),

    continueReasonDoesNotCreateOtherSpeechActs:
      continueRiskReason.intent
      !== "method"
      && continueRiskReason.intent
      !== "evaluation"
      && continueRiskReason.timingType
      === continueRiskOnly.timingType
      && hasNoDedicatedMethodMaterialField(
        continueRiskReason.explanationTitles,
      ),

    stopRiskPrimaryMaintained:
      stopRiskReason.intent
      === "risk",

    stopDecisionTargetMaintained:
      stopRiskReason.decisionTarget
      === "stop",

    stopOriginalPreservesReasonDemand:
      stopRiskReason.originalQuestion.includes(
        "위험",
      )
      && stopRiskReason.originalQuestion.includes(
        "이유",
      )
      && stopRiskReason.prompt.userPrompt.includes(
        stopRiskReason.originalQuestion,
      ),

    stopAsksWhatStaysRiskCentered:
      stopRiskReason.asksWhat.includes(
        "위험",
      )
      && !stopRiskReason.asksWhat.includes(
        "이유",
      )
      && !stopRiskReason.asksWhat.includes(
        "방법",
      )
      && !stopRiskReason.asksWhat.includes(
        "판단",
      )
      && stopRiskReason.asksWhat
      === stopRiskOnly.asksWhat
      && stopRiskReason.prompt.userPrompt.includes(
        `알고 싶은 점: ${stopRiskReason.asksWhat}`,
      ),

    stopReasonSecondaryDoesNotCreateReasonIntent:
      stopRiskReason.intent
      === "risk"
      && !stopRiskReasonText.includes(
        "secondaryIntent",
      ),

    stopRiskPrimaryMaterialMaintained:
      stopRiskReason.risksCount
      > 0
      && stopRiskReason.hasDedicatedRisksMaterial
      && stopRiskReason.explanationTitles.includes(
        "위험",
      )
      && stopRiskReason.risksCount
      === stopRiskOnly.risksCount
      && stopRiskReason.hasDedicatedRisksMaterial
      === stopRiskOnly.hasDedicatedRisksMaterial,

    stopReasonDemandBindsToEvidenceProxy:
      stopRiskReason.explanationTitles.includes(
        "이동·변경의 근거",
      )
      && stopRiskReason.prompt.userPrompt.includes(
        "이동·변경의 근거",
      )
      && stopRiskReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      ),

    stopMaterialsDoNotOverExpandVsRiskOnly:
      stopRiskReason.explanationTitles.join(
        "|",
      )
      === stopRiskOnly.explanationTitles.join(
        "|",
      )
      && stopRiskReason.verdict
      === stopRiskOnly.verdict
      && stopRiskReason.finalDecision
      === stopRiskOnly.finalDecision
      && stopRiskReason.hasConditionMaterial
      === stopRiskOnly.hasConditionMaterial
      && stopRiskReason.conditionsTexts.join(
        "|",
      )
      === stopRiskOnly.conditionsTexts.join(
        "|",
      )
      && stopRiskReason.hasDirectionMaterial
      === stopRiskOnly.hasDirectionMaterial
      && stopRiskReason.recommendedDirection
      === stopRiskOnly.recommendedDirection
      && stopRiskReason.prohibitedDirection
      === stopRiskOnly.prohibitedDirection
      && engineDecisionLockedInPrompt(
        stopRiskReason.prompt,
        stopRiskReason.finalDecision,
      ),

    stopReasonDoesNotCreateOtherSpeechActs:
      stopRiskReason.intent
      !== "method"
      && stopRiskReason.intent
      !== "evaluation"
      && stopRiskReason.timingType
      === stopRiskOnly.timingType
      && hasNoDedicatedMethodMaterialField(
        stopRiskReason.explanationTitles,
      ),

    fixtureDoesNotInventFactsOrJudgements:
      continueRiskReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && continueRiskReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && stopRiskReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && stopRiskReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && continueRiskReason.existingMaterialTexts.every(
        (value) =>
          continueRiskReason.prompt.userPrompt.includes(
            value,
          ),
      )
      && stopRiskReason.existingMaterialTexts.every(
        (value) =>
          stopRiskReason.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-45-risk-primary-reason-secondary-evidence-proxy-regression",
    question:
      continueRiskReason.originalQuestion,
    focus:
      continueRiskReason.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyTimingPrimaryReasonSecondaryEvidenceProxyRegression():
  ConsultingPromptBuilderVerificationCase {
  const timingReasonComposite =
    inspectSecondaryMaterialsCoverage(
      "사업을 시작할 시기와 그 이유가 궁금합니다.",
    );

  const timingOnly =
    inspectSecondaryMaterialsCoverage(
      "사업을 시작할 시기가 궁금합니다.",
    );

  const timingReasonText =
    combinedPromptText(
      timingReasonComposite.prompt,
    );

  const checks = {
    timingPrimaryMaintained:
      timingReasonComposite.intent
      === "timing",

    decisionTargetStartMaintained:
      timingReasonComposite.decisionTarget
      === "start",

    timingTypeBestTimingMaintained:
      timingReasonComposite.timingType
      === "bestTiming",

    originalPreservesReasonDemand:
      timingReasonComposite.originalQuestion.includes(
        "시기",
      )
      && timingReasonComposite.originalQuestion.includes(
        "이유",
      )
      && timingReasonComposite.prompt.userPrompt.includes(
        timingReasonComposite.originalQuestion,
      ),

    asksWhatStaysTimingCentered:
      timingReasonComposite.asksWhat.includes(
        "언제",
      )
      && !timingReasonComposite.asksWhat.includes(
        "이유",
      )
      && !timingReasonComposite.asksWhat.includes(
        "방법",
      )
      && timingReasonComposite.asksWhat
      === timingOnly.asksWhat
      && timingReasonComposite.prompt.userPrompt.includes(
        `알고 싶은 점: ${timingReasonComposite.asksWhat}`,
      ),

    reasonSecondaryDoesNotCreateReasonIntent:
      timingReasonComposite.intent
      === "timing"
      && !timingReasonText.includes(
        "secondaryIntent",
      ),

    reasonDemandBindsToEvidenceProxyCoreGeungeo:
      timingReasonComposite.explanationTitles.includes(
        "이번 질문을 판단한 핵심 근거",
      )
      && timingReasonComposite.prompt.userPrompt.includes(
        "이번 질문을 판단한 핵심 근거",
      )
      && timingReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      ),

    evidenceMaterialDoesNotDisappearVsTimingOnly:
      timingOnly.explanationTitles.includes(
        "이번 질문을 판단한 핵심 근거",
      )
      && timingReasonComposite.explanationTitles.includes(
        "이번 질문을 판단한 핵심 근거",
      )
      && timingReasonComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      ),

    reasonSecondaryDoesNotOverExpandConditions:
      timingReasonComposite.hasConditionMaterial
      === timingOnly.hasConditionMaterial
      && timingReasonComposite.conditionsTexts.join(
        "|",
      )
      === timingOnly.conditionsTexts.join(
        "|",
      ),

    reasonSecondaryDoesNotOverExpandRisks:
      timingReasonComposite.risksCount
      === timingOnly.risksCount
      && timingReasonComposite.hasDedicatedRisksMaterial
      === timingOnly.hasDedicatedRisksMaterial,

    reasonSecondaryDoesNotOverExpandDirections:
      timingReasonComposite.hasDirectionMaterial
      === timingOnly.hasDirectionMaterial
      && timingReasonComposite.recommendedDirection
      === timingOnly.recommendedDirection
      && timingReasonComposite.prohibitedDirection
      === timingOnly.prohibitedDirection
      && timingReasonComposite.verdict
      === timingOnly.verdict
      && timingReasonComposite.finalDecision
      === timingOnly.finalDecision
      && engineDecisionLockedInPrompt(
        timingReasonComposite.prompt,
        timingReasonComposite.finalDecision,
      ),

    methodSpecificMaterialNotCreatedByReason:
      hasNoDedicatedMethodMaterialField(
        timingReasonComposite.explanationTitles,
      )
      && !timingReasonComposite.asksWhat.includes(
        "방법",
      )
      && !timingReasonComposite.originalQuestion.includes(
        "방법",
      ),

    reasonDoesNotPromoteOtherSpeechActs:
      timingReasonComposite.intent
      !== "method"
      && timingReasonComposite.intent
      !== "evaluation"
      && timingReasonComposite.intent
      !== "risk"
      && timingReasonComposite.timingType
      === timingOnly.timingType
      && timingReasonComposite.decisionTarget
      === timingOnly.decisionTarget
      && timingReasonComposite.intent
      === timingOnly.intent,

    multiSpeechActKeepsPrimaryCenter:
      timingReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && timingReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      )
      && timingReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && timingReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      ),

    fixtureDoesNotInventFactsOrJudgements:
      timingReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && timingReasonText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && timingReasonComposite.existingMaterialTexts.every(
        (value) =>
          timingReasonComposite.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-46-timing-primary-reason-secondary-evidence-proxy-regression",
    question:
      timingReasonComposite.originalQuestion,
    focus:
      timingReasonComposite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyRiskPrimaryEvaluationSecondaryAntiExpansionRegression():
  ConsultingPromptBuilderVerificationCase {
  const continueRiskEval =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속하는 게 좋을지, 위험한 점도 궁금합니다.",
    );

  const continueRiskOnly =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속하면 위험할까요?",
    );

  const stopRiskEval =
    inspectSecondaryMaterialsCoverage(
      "사업을 끝낼 때 위험한지, 그래도 끝내도 될지 궁금합니다.",
    );

  const stopRiskOnly =
    inspectSecondaryMaterialsCoverage(
      "사업을 끝낼 때 위험할까요?",
    );

  const continueRiskEvalText =
    combinedPromptText(
      continueRiskEval.prompt,
    );

  const stopRiskEvalText =
    combinedPromptText(
      stopRiskEval.prompt,
    );

  const checks = {
    continueRiskPrimaryMaintained:
      continueRiskEval.intent
      === "risk",

    continueDecisionTargetMaintained:
      continueRiskEval.decisionTarget
      === "continue",

    continueEvaluationDoesNotReclassifyPrimary:
      continueRiskEval.intent
      !== "evaluation"
      && continueRiskEval.intent
      === continueRiskOnly.intent,

    continueOriginalPreservesEvaluationSurface:
      continueRiskEval.originalQuestion.includes(
        "좋을지",
      )
      && continueRiskEval.originalQuestion.includes(
        "위험",
      )
      && continueRiskEval.prompt.userPrompt.includes(
        continueRiskEval.originalQuestion,
      ),

    continueAsksWhatStaysRiskCentered:
      continueRiskEval.asksWhat.includes(
        "위험",
      )
      && !continueRiskEval.asksWhat.includes(
        "판단",
      )
      && !continueRiskEval.asksWhat.includes(
        "좋을지",
      )
      && !continueRiskEval.asksWhat.includes(
        "방법",
      )
      && continueRiskEval.asksWhat
      === continueRiskOnly.asksWhat
      && continueRiskEval.prompt.userPrompt.includes(
        `알고 싶은 점: ${continueRiskEval.asksWhat}`,
      ),

    continueEvaluationSecondaryDoesNotCreateSecondaryIntent:
      continueRiskEval.intent
      === "risk"
      && !continueRiskEvalText.includes(
        "secondaryIntent",
      ),

    continueRisksRemainZeroWithoutInvention:
      continueRiskEval.risksCount
      === 0
      && continueRiskOnly.risksCount
      === 0
      && !continueRiskEval.hasDedicatedRisksMaterial
      && !continueRiskOnly.hasDedicatedRisksMaterial
      && !continueRiskEval.explanationTitles.includes(
        "위험",
      )
      && !continueRiskEval.explanationTitles.includes(
        "변경·이탈을 고려해야 하는 신호",
      )
      && !continueRiskEval.explanationTitles.includes(
        "사업상 위험",
      ),

    continueMaterialsDoNotOverExpandVsRiskOnly:
      continueRiskEval.explanationTitles.join(
        "|",
      )
      === continueRiskOnly.explanationTitles.join(
        "|",
      )
      && continueRiskEval.verdict
      === continueRiskOnly.verdict
      && continueRiskEval.finalDecision
      === continueRiskOnly.finalDecision
      && continueRiskEval.hasConditionMaterial
      === continueRiskOnly.hasConditionMaterial
      && continueRiskEval.conditionsTexts.join(
        "|",
      )
      === continueRiskOnly.conditionsTexts.join(
        "|",
      )
      && continueRiskEval.risksCount
      === continueRiskOnly.risksCount
      && continueRiskEval.hasDedicatedRisksMaterial
      === continueRiskOnly.hasDedicatedRisksMaterial
      && continueRiskEval.hasDirectionMaterial
      === continueRiskOnly.hasDirectionMaterial
      && continueRiskEval.recommendedDirection
      === continueRiskOnly.recommendedDirection
      && continueRiskEval.prohibitedDirection
      === continueRiskOnly.prohibitedDirection
      && engineDecisionLockedInPrompt(
        continueRiskEval.prompt,
        continueRiskEval.finalDecision,
      ),

    continueEvaluationDoesNotCreateOtherSpeechActs:
      continueRiskEval.intent
      !== "method"
      && continueRiskEval.intent
      !== "evaluation"
      && continueRiskEval.timingType
      === continueRiskOnly.timingType
      && continueRiskEval.decisionTarget
      === continueRiskOnly.decisionTarget
      && hasNoDedicatedMethodMaterialField(
        continueRiskEval.explanationTitles,
      ),

    continueMultiSpeechActKeepsPrimaryCenter:
      continueRiskEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && continueRiskEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      )
      && continueRiskEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && continueRiskEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      ),

    stopRiskPrimaryMaintained:
      stopRiskEval.intent
      === "risk",

    stopDecisionTargetMaintained:
      stopRiskEval.decisionTarget
      === "stop",

    stopEvaluationDoesNotReclassifyPrimary:
      stopRiskEval.intent
      !== "evaluation"
      && stopRiskEval.intent
      === stopRiskOnly.intent,

    stopOriginalPreservesEvaluationSurface:
      (
        stopRiskEval.originalQuestion.includes(
          "끝내도 될지",
        )
        || stopRiskEval.originalQuestion.includes(
          "해도 될지",
        )
      )
      && stopRiskEval.originalQuestion.includes(
        "위험",
      )
      && stopRiskEval.prompt.userPrompt.includes(
        stopRiskEval.originalQuestion,
      ),

    stopAsksWhatStaysRiskCentered:
      stopRiskEval.asksWhat.includes(
        "위험",
      )
      && !stopRiskEval.asksWhat.includes(
        "판단",
      )
      && !stopRiskEval.asksWhat.includes(
        "해도 될지",
      )
      && !stopRiskEval.asksWhat.includes(
        "방법",
      )
      && stopRiskEval.asksWhat
      === stopRiskOnly.asksWhat
      && stopRiskEval.prompt.userPrompt.includes(
        `알고 싶은 점: ${stopRiskEval.asksWhat}`,
      ),

    stopEvaluationSecondaryDoesNotCreateSecondaryIntent:
      stopRiskEval.intent
      === "risk"
      && !stopRiskEvalText.includes(
        "secondaryIntent",
      ),

    stopRiskPrimaryMaterialMaintained:
      stopRiskEval.risksCount
      > 0
      && stopRiskEval.hasDedicatedRisksMaterial
      && stopRiskEval.explanationTitles.includes(
        "위험",
      )
      && stopRiskEval.risksCount
      === stopRiskOnly.risksCount
      && stopRiskEval.hasDedicatedRisksMaterial
      === stopRiskOnly.hasDedicatedRisksMaterial,

    stopMaterialsDoNotOverExpandVsRiskOnly:
      stopRiskEval.explanationTitles.join(
        "|",
      )
      === stopRiskOnly.explanationTitles.join(
        "|",
      )
      && stopRiskEval.verdict
      === stopRiskOnly.verdict
      && stopRiskEval.finalDecision
      === stopRiskOnly.finalDecision
      && stopRiskEval.hasConditionMaterial
      === stopRiskOnly.hasConditionMaterial
      && stopRiskEval.conditionsTexts.join(
        "|",
      )
      === stopRiskOnly.conditionsTexts.join(
        "|",
      )
      && stopRiskEval.hasDirectionMaterial
      === stopRiskOnly.hasDirectionMaterial
      && stopRiskEval.recommendedDirection
      === stopRiskOnly.recommendedDirection
      && stopRiskEval.prohibitedDirection
      === stopRiskOnly.prohibitedDirection
      && engineDecisionLockedInPrompt(
        stopRiskEval.prompt,
        stopRiskEval.finalDecision,
      ),

    stopEvaluationDoesNotCreateOtherSpeechActs:
      stopRiskEval.intent
      !== "method"
      && stopRiskEval.intent
      !== "evaluation"
      && stopRiskEval.timingType
      === stopRiskOnly.timingType
      && stopRiskEval.decisionTarget
      === stopRiskOnly.decisionTarget
      && hasNoDedicatedMethodMaterialField(
        stopRiskEval.explanationTitles,
      ),

    stopMultiSpeechActKeepsPrimaryCenter:
      stopRiskEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && stopRiskEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      )
      && stopRiskEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && stopRiskEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      ),

    fixtureDoesNotInventFactsOrJudgements:
      continueRiskEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && continueRiskEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && stopRiskEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && stopRiskEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && continueRiskEval.existingMaterialTexts.every(
        (value) =>
          continueRiskEval.prompt.userPrompt.includes(
            value,
          ),
      )
      && stopRiskEval.existingMaterialTexts.every(
        (value) =>
          stopRiskEval.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-47-risk-primary-evaluation-secondary-anti-expansion-regression",
    question:
      continueRiskEval.originalQuestion,
    focus:
      continueRiskEval.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyTimingPrimaryEvaluationSecondaryAntiExpansionRegression():
  ConsultingPromptBuilderVerificationCase {
  const timingEvalComposite =
    inspectSecondaryMaterialsCoverage(
      "사업을 시작할 시기인지, 시작하는 게 좋을지 궁금합니다.",
    );

  const timingOnly =
    inspectSecondaryMaterialsCoverage(
      "사업을 시작할 시기일까요?",
    );

  const timingEvalText =
    combinedPromptText(
      timingEvalComposite.prompt,
    );

  const checks = {
    timingPrimaryMaintained:
      timingEvalComposite.intent
      === "timing",

    decisionTargetStartMaintained:
      timingEvalComposite.decisionTarget
      === "start",

    timingTypeBestTimingMaintained:
      timingEvalComposite.timingType
      === "bestTiming",

    evaluationDoesNotReclassifyPrimary:
      timingEvalComposite.intent
      !== "evaluation"
      && timingEvalComposite.intent
      === timingOnly.intent,

    originalPreservesEvaluationSurface:
      timingEvalComposite.originalQuestion.includes(
        "시기",
      )
      && timingEvalComposite.originalQuestion.includes(
        "시작하는 게 좋을지",
      )
      && timingEvalComposite.prompt.userPrompt.includes(
        timingEvalComposite.originalQuestion,
      ),

    asksWhatStaysTimingCentered:
      timingEvalComposite.asksWhat.includes(
        "언제",
      )
      && !timingEvalComposite.asksWhat.includes(
        "좋을지",
      )
      && !timingEvalComposite.asksWhat.includes(
        "판단",
      )
      && !timingEvalComposite.asksWhat.includes(
        "방법",
      )
      && timingEvalComposite.asksWhat
      === timingOnly.asksWhat
      && timingEvalComposite.prompt.userPrompt.includes(
        `알고 싶은 점: ${timingEvalComposite.asksWhat}`,
      ),

    evaluationSecondaryDoesNotCreateSecondaryIntent:
      timingEvalComposite.intent
      === "timing"
      && !timingEvalText.includes(
        "secondaryIntent",
      ),

    evidenceMaterialDoesNotDisappearVsTimingOnly:
      timingOnly.explanationTitles.includes(
        "이번 질문을 판단한 핵심 근거",
      )
      && timingEvalComposite.explanationTitles.includes(
        "이번 질문을 판단한 핵심 근거",
      )
      && timingEvalComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      ),

    evaluationSecondaryDoesNotOverExpandTitles:
      timingEvalComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      ),

    evaluationSecondaryDoesNotOverExpandConditions:
      timingEvalComposite.hasConditionMaterial
      === timingOnly.hasConditionMaterial
      && timingEvalComposite.conditionsTexts.join(
        "|",
      )
      === timingOnly.conditionsTexts.join(
        "|",
      ),

    evaluationSecondaryDoesNotOverExpandRisks:
      timingEvalComposite.risksCount
      === timingOnly.risksCount
      && timingEvalComposite.hasDedicatedRisksMaterial
      === timingOnly.hasDedicatedRisksMaterial,

    evaluationSecondaryDoesNotOverExpandDirections:
      timingEvalComposite.hasDirectionMaterial
      === timingOnly.hasDirectionMaterial
      && timingEvalComposite.recommendedDirection
      === timingOnly.recommendedDirection
      && timingEvalComposite.prohibitedDirection
      === timingOnly.prohibitedDirection
      && timingEvalComposite.verdict
      === timingOnly.verdict
      && timingEvalComposite.finalDecision
      === timingOnly.finalDecision
      && engineDecisionLockedInPrompt(
        timingEvalComposite.prompt,
        timingEvalComposite.finalDecision,
      ),

    evaluationSecondaryDoesNotExpandTimingMaterials:
      timingEvalComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      )
      && timingEvalComposite.hasConditionMaterial
      === timingOnly.hasConditionMaterial
      && timingEvalComposite.conditionsTexts.join(
        "|",
      )
      === timingOnly.conditionsTexts.join(
        "|",
      )
      && timingEvalComposite.risksCount
      === timingOnly.risksCount
      && timingEvalComposite.hasDedicatedRisksMaterial
      === timingOnly.hasDedicatedRisksMaterial
      && timingEvalComposite.hasDirectionMaterial
      === timingOnly.hasDirectionMaterial
      && timingEvalComposite.recommendedDirection
      === timingOnly.recommendedDirection
      && timingEvalComposite.prohibitedDirection
      === timingOnly.prohibitedDirection
      && timingEvalComposite.verdict
      === timingOnly.verdict
      && timingEvalComposite.finalDecision
      === timingOnly.finalDecision,

    methodSpecificMaterialNotCreatedByEvaluation:
      hasNoDedicatedMethodMaterialField(
        timingEvalComposite.explanationTitles,
      )
      && !timingEvalComposite.asksWhat.includes(
        "방법",
      )
      && !timingEvalComposite.originalQuestion.includes(
        "방법",
      ),

    evaluationDoesNotPromoteOtherSpeechActs:
      timingEvalComposite.intent
      !== "method"
      && timingEvalComposite.intent
      !== "evaluation"
      && timingEvalComposite.intent
      !== "risk"
      && timingEvalComposite.timingType
      === timingOnly.timingType
      && timingEvalComposite.decisionTarget
      === timingOnly.decisionTarget
      && timingEvalComposite.intent
      === timingOnly.intent,

    multiSpeechActKeepsPrimaryCenter:
      timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      )
      && timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      ),

    fixtureDoesNotInventFactsOrJudgements:
      timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && timingEvalComposite.existingMaterialTexts.every(
        (value) =>
          timingEvalComposite.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-48-timing-primary-evaluation-secondary-anti-expansion-regression",
    question:
      timingEvalComposite.originalQuestion,
    focus:
      timingEvalComposite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyTimingPrimaryEvaluationSecondaryContinueAntiExpansionRegression():
  ConsultingPromptBuilderVerificationCase {
  const timingEvalComposite =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속하는 게 좋을지, 언제가 맞을지도 궁금합니다.",
    );

  const timingOnly =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 시기가 맞을까요?",
    );

  const timingEvalText =
    combinedPromptText(
      timingEvalComposite.prompt,
    );

  const checks = {
    timingPrimaryMaintained:
      timingEvalComposite.intent
      === "timing",

    decisionTargetContinueMaintained:
      timingEvalComposite.decisionTarget
      === "continue",

    timingTypeBestTimingMaintained:
      timingEvalComposite.timingType
      === "bestTiming",

    evaluationDoesNotReclassifyPrimary:
      timingEvalComposite.intent
      !== "evaluation"
      && timingEvalComposite.intent
      === timingOnly.intent,

    evaluationDoesNotChangeDecisionTargetToStart:
      timingEvalComposite.decisionTarget
      !== "start"
      && timingEvalComposite.decisionTarget
      === "continue"
      && timingEvalComposite.decisionTarget
      === timingOnly.decisionTarget,

    originalPreservesEvaluationSurface:
      timingEvalComposite.originalQuestion.includes(
        "계속하는 게 좋을지",
      )
      && timingEvalComposite.originalQuestion.includes(
        "언제",
      )
      && timingEvalComposite.prompt.userPrompt.includes(
        timingEvalComposite.originalQuestion,
      ),

    asksWhatStaysTimingCentered:
      timingEvalComposite.asksWhat.includes(
        "언제",
      )
      && !timingEvalComposite.asksWhat.includes(
        "좋을지",
      )
      && !timingEvalComposite.asksWhat.includes(
        "판단",
      )
      && !timingEvalComposite.asksWhat.includes(
        "방법",
      )
      && timingEvalComposite.asksWhat
      === timingOnly.asksWhat
      && timingEvalComposite.prompt.userPrompt.includes(
        `알고 싶은 점: ${timingEvalComposite.asksWhat}`,
      ),

    evaluationSecondaryDoesNotCreateSecondaryIntent:
      timingEvalComposite.intent
      === "timing"
      && !timingEvalText.includes(
        "secondaryIntent",
      ),

    evidenceMaterialDoesNotDisappearVsTimingOnly:
      timingOnly.explanationTitles.includes(
        "유지의 근거",
      )
      && timingEvalComposite.explanationTitles.includes(
        "유지의 근거",
      )
      && timingEvalComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      ),

    evaluationSecondaryDoesNotOverExpandTitles:
      timingEvalComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      ),

    evaluationSecondaryDoesNotOverExpandConditions:
      timingEvalComposite.hasConditionMaterial
      === timingOnly.hasConditionMaterial
      && timingEvalComposite.conditionsTexts.join(
        "|",
      )
      === timingOnly.conditionsTexts.join(
        "|",
      ),

    evaluationSecondaryDoesNotOverExpandRisks:
      timingEvalComposite.risksCount
      === timingOnly.risksCount
      && timingEvalComposite.hasDedicatedRisksMaterial
      === timingOnly.hasDedicatedRisksMaterial,

    evaluationSecondaryDoesNotOverExpandDirections:
      timingEvalComposite.hasDirectionMaterial
      === timingOnly.hasDirectionMaterial
      && timingEvalComposite.recommendedDirection
      === timingOnly.recommendedDirection
      && timingEvalComposite.prohibitedDirection
      === timingOnly.prohibitedDirection
      && timingEvalComposite.verdict
      === timingOnly.verdict
      && timingEvalComposite.finalDecision
      === timingOnly.finalDecision
      && engineDecisionLockedInPrompt(
        timingEvalComposite.prompt,
        timingEvalComposite.finalDecision,
      ),

    evaluationSecondaryDoesNotExpandTimingMaterials:
      timingEvalComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      )
      && timingEvalComposite.hasConditionMaterial
      === timingOnly.hasConditionMaterial
      && timingEvalComposite.conditionsTexts.join(
        "|",
      )
      === timingOnly.conditionsTexts.join(
        "|",
      )
      && timingEvalComposite.risksCount
      === timingOnly.risksCount
      && timingEvalComposite.hasDedicatedRisksMaterial
      === timingOnly.hasDedicatedRisksMaterial
      && timingEvalComposite.hasDirectionMaterial
      === timingOnly.hasDirectionMaterial
      && timingEvalComposite.recommendedDirection
      === timingOnly.recommendedDirection
      && timingEvalComposite.prohibitedDirection
      === timingOnly.prohibitedDirection
      && timingEvalComposite.verdict
      === timingOnly.verdict
      && timingEvalComposite.finalDecision
      === timingOnly.finalDecision,

    methodSpecificMaterialNotCreatedByEvaluation:
      hasNoDedicatedMethodMaterialField(
        timingEvalComposite.explanationTitles,
      )
      && !timingEvalComposite.asksWhat.includes(
        "방법",
      )
      && !timingEvalComposite.originalQuestion.includes(
        "방법",
      ),

    evaluationDoesNotPromoteOtherSpeechActs:
      timingEvalComposite.intent
      !== "method"
      && timingEvalComposite.intent
      !== "evaluation"
      && timingEvalComposite.intent
      !== "risk"
      && timingEvalComposite.timingType
      === timingOnly.timingType
      && timingEvalComposite.decisionTarget
      === timingOnly.decisionTarget
      && timingEvalComposite.intent
      === timingOnly.intent,

    multiSpeechActKeepsPrimaryCenter:
      timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      )
      && timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      ),

    fixtureDoesNotInventFactsOrJudgements:
      timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && timingEvalComposite.existingMaterialTexts.every(
        (value) =>
          timingEvalComposite.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-49-timing-primary-evaluation-secondary-continue-anti-expansion-regression",
    question:
      timingEvalComposite.originalQuestion,
    focus:
      timingEvalComposite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyTimingPrimaryEvaluationSecondaryLeaveJobAntiExpansionRegression():
  ConsultingPromptBuilderVerificationCase {
  const timingEvalComposite =
    inspectSecondaryMaterialsCoverage(
      "직장을 그만둘 시기인지, 그만두는 게 좋을지도 궁금합니다.",
    );

  const timingOnly =
    inspectSecondaryMaterialsCoverage(
      "직장을 그만둘 시기가 궁금합니다.",
    );

  const timingEvalText =
    combinedPromptText(
      timingEvalComposite.prompt,
    );

  const checks = {
    timingPrimaryMaintained:
      timingEvalComposite.intent
      === "timing",

    decisionTargetLeaveJobMaintained:
      timingEvalComposite.decisionTarget
      === "leaveJob",

    timingTypeBestTimingMaintained:
      timingEvalComposite.timingType
      === "bestTiming",

    evaluationDoesNotReclassifyPrimary:
      timingEvalComposite.intent
      !== "evaluation"
      && timingEvalComposite.intent
      === timingOnly.intent,

    evaluationDoesNotChangeDecisionTargetAwayFromLeaveJob:
      timingEvalComposite.decisionTarget
      !== "start"
      && timingEvalComposite.decisionTarget
      !== "continue"
      && timingEvalComposite.decisionTarget
      === "leaveJob"
      && timingEvalComposite.decisionTarget
      === timingOnly.decisionTarget,

    originalPreservesEvaluationSurface:
      timingEvalComposite.originalQuestion.includes(
        "시기",
      )
      && timingEvalComposite.originalQuestion.includes(
        "그만두는 게 좋을지",
      )
      && timingEvalComposite.prompt.userPrompt.includes(
        timingEvalComposite.originalQuestion,
      ),

    asksWhatStaysTimingCentered:
      timingEvalComposite.asksWhat.includes(
        "언제",
      )
      && !timingEvalComposite.asksWhat.includes(
        "좋을지",
      )
      && !timingEvalComposite.asksWhat.includes(
        "판단",
      )
      && !timingEvalComposite.asksWhat.includes(
        "방법",
      )
      && timingEvalComposite.asksWhat
      === timingOnly.asksWhat
      && timingEvalComposite.prompt.userPrompt.includes(
        `알고 싶은 점: ${timingEvalComposite.asksWhat}`,
      ),

    evaluationSecondaryDoesNotCreateSecondaryIntent:
      timingEvalComposite.intent
      === "timing"
      && !timingEvalText.includes(
        "secondaryIntent",
      ),

    evidenceMaterialDoesNotDisappearVsTimingOnly:
      timingOnly.explanationTitles.includes(
        "이동·변경의 근거",
      )
      && timingEvalComposite.explanationTitles.includes(
        "이동·변경의 근거",
      )
      && timingEvalComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      ),

    evaluationSecondaryDoesNotOverExpandTitles:
      timingEvalComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      ),

    evaluationSecondaryDoesNotOverExpandConditions:
      timingEvalComposite.hasConditionMaterial
      === timingOnly.hasConditionMaterial
      && timingEvalComposite.conditionsTexts.join(
        "|",
      )
      === timingOnly.conditionsTexts.join(
        "|",
      ),

    evaluationSecondaryDoesNotOverExpandRisks:
      timingEvalComposite.risksCount
      === timingOnly.risksCount
      && timingEvalComposite.hasDedicatedRisksMaterial
      === timingOnly.hasDedicatedRisksMaterial,

    evaluationSecondaryDoesNotOverExpandDirections:
      timingEvalComposite.hasDirectionMaterial
      === timingOnly.hasDirectionMaterial
      && timingEvalComposite.recommendedDirection
      === timingOnly.recommendedDirection
      && timingEvalComposite.prohibitedDirection
      === timingOnly.prohibitedDirection
      && timingEvalComposite.verdict
      === timingOnly.verdict
      && timingEvalComposite.finalDecision
      === timingOnly.finalDecision
      && engineDecisionLockedInPrompt(
        timingEvalComposite.prompt,
        timingEvalComposite.finalDecision,
      ),

    evaluationSecondaryDoesNotExpandTimingMaterials:
      timingEvalComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      )
      && timingEvalComposite.hasConditionMaterial
      === timingOnly.hasConditionMaterial
      && timingEvalComposite.conditionsTexts.join(
        "|",
      )
      === timingOnly.conditionsTexts.join(
        "|",
      )
      && timingEvalComposite.risksCount
      === timingOnly.risksCount
      && timingEvalComposite.hasDedicatedRisksMaterial
      === timingOnly.hasDedicatedRisksMaterial
      && timingEvalComposite.hasDirectionMaterial
      === timingOnly.hasDirectionMaterial
      && timingEvalComposite.recommendedDirection
      === timingOnly.recommendedDirection
      && timingEvalComposite.prohibitedDirection
      === timingOnly.prohibitedDirection
      && timingEvalComposite.verdict
      === timingOnly.verdict
      && timingEvalComposite.finalDecision
      === timingOnly.finalDecision,

    methodSpecificMaterialNotCreatedByEvaluation:
      hasNoDedicatedMethodMaterialField(
        timingEvalComposite.explanationTitles,
      )
      && !timingEvalComposite.asksWhat.includes(
        "방법",
      )
      && !timingEvalComposite.originalQuestion.includes(
        "방법",
      ),

    evaluationDoesNotPromoteOtherSpeechActs:
      timingEvalComposite.intent
      !== "method"
      && timingEvalComposite.intent
      !== "evaluation"
      && timingEvalComposite.intent
      !== "risk"
      && timingEvalComposite.timingType
      === timingOnly.timingType
      && timingEvalComposite.decisionTarget
      === timingOnly.decisionTarget
      && timingEvalComposite.intent
      === timingOnly.intent,

    multiSpeechActKeepsPrimaryCenter:
      timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      )
      && timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      ),

    fixtureDoesNotInventFactsOrJudgements:
      timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && timingEvalText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && timingEvalComposite.existingMaterialTexts.every(
        (value) =>
          timingEvalComposite.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-55-timing-primary-evaluation-secondary-leaveJob-anti-expansion-regression",
    question:
      timingEvalComposite.originalQuestion,
    focus:
      timingEvalComposite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyFalseMultiTimingModifierEvaluationExpansionRegression():
  ConsultingPromptBuilderVerificationCase {
  const composite =
    inspectSecondaryMaterialsCoverage(
      "지금 시기에 사업을 계속하는 게 좋을까요?",
    );

  const baseline =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속하는 게 좋을까요?",
    );

  const contrastNowPrefix =
    inspectSecondaryMaterialsCoverage(
      "지금 사업을 계속하는 게 좋을까요?",
    );

  const contrastNowSuffix =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속하는 게 지금 좋을까요?",
    );

  const compositeText =
    combinedPromptText(
      composite.prompt,
    );

  const checks = {
    baselineEvaluationPrimaryMaintained:
      baseline.intent
      === "evaluation",

    compositeTimingPrimaryFromFalseMultiModifier:
      composite.intent
      === "timing",

    decisionTargetContinueMaintained:
      baseline.decisionTarget
      === "continue"
      && composite.decisionTarget
      === "continue",

    baselineTimingTypeUnknownMaintained:
      baseline.timingType
      === "unknown",

    compositeTimingTypeExecutionTiming:
      composite.timingType
      === "executionTiming",

    timingModifierCausesEvaluationToTimingExpansion:
      baseline.intent
      === "evaluation"
      && composite.intent
      === "timing"
      && baseline.timingType
      === "unknown"
      && composite.timingType
      === "executionTiming"
      && composite.originalQuestion.includes(
        "지금 시기에",
      )
      && composite.originalQuestion.includes(
        "좋을까요",
      ),

    compositeVerdictDiffersFromBaseline:
      baseline.verdict
      === "conditionallyRecommended"
      && composite.verdict
      === "wait",

    compositeAsksWhatDiffersFromBaseline:
      baseline.asksWhat.includes(
        "전체적으로 어떻게 판단",
      )
      && composite.asksWhat.includes(
        "언제 움직여야",
      )
      && composite.asksWhat
      !== baseline.asksWhat
      && composite.prompt.userPrompt.includes(
        `알고 싶은 점: ${composite.asksWhat}`,
      ),

    compositeConditionsDiffersFromBaseline:
      baseline.conditionsTexts.join(
        "|",
      )
      !== composite.conditionsTexts.join(
        "|",
      )
      && baseline.conditionsTexts.length
      === 1
      && composite.conditionsTexts.length
      === 2
      && composite.conditionsTexts.some(
        (text) =>
          text.includes(
            "실행 시기를 확정할 수 없다",
          ),
      ),

    compositeDirectionsDiffersFromBaseline:
      composite.recommendedDirection
      !== baseline.recommendedDirection
      && composite.prohibitedDirection
      !== baseline.prohibitedDirection
      && composite.finalDecision
      !== baseline.finalDecision
      && engineDecisionLockedInPrompt(
        composite.prompt,
        composite.finalDecision,
      ),

    falseMultiSpeechActSurfaceMatchesCurrentResult:
      !compositeText.includes(
        "secondaryIntent",
      )
      && compositeText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && compositeText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      )
      && compositeText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && compositeText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      ),

    originalQuestionPreservedAsCompositeSource:
      composite.originalQuestion
      === "지금 시기에 사업을 계속하는 게 좋을까요?"
      && composite.prompt.userPrompt.includes(
        composite.originalQuestion,
      ),

    distinctFromI44FalseMultiAsTimingModifierBoundary:
      composite.intent
      === "timing"
      && baseline.intent
      === "evaluation"
      && composite.originalQuestion.includes(
        "지금 시기에",
      )
      && !composite.originalQuestion.includes(
        "위험한 방법으로",
      )
      && !composite.asksWhat.includes(
        "방법",
      ),

    contrastNowPrefixKeepsEvaluationPrimary:
      contrastNowPrefix.intent
      === "evaluation"
      && contrastNowPrefix.decisionTarget
      === "continue"
      && contrastNowPrefix.asksWhat
      === baseline.asksWhat
      && contrastNowPrefix.intent
      !== composite.intent,

    contrastNowSuffixKeepsEvaluationPrimary:
      contrastNowSuffix.intent
      === "evaluation"
      && contrastNowSuffix.decisionTarget
      === "continue"
      && contrastNowSuffix.asksWhat
      === baseline.asksWhat
      && contrastNowSuffix.intent
      !== composite.intent,

    jigeumsiGiePhraseIsDistinctTimingExpansionBoundary:
      composite.intent
      === "timing"
      && contrastNowPrefix.intent
      === "evaluation"
      && contrastNowSuffix.intent
      === "evaluation"
      && composite.originalQuestion.includes(
        "지금 시기에",
      )
      && !contrastNowPrefix.originalQuestion.includes(
        "시기에",
      )
      && !contrastNowSuffix.originalQuestion.includes(
        "시기에",
      ),

    fixtureDoesNotInventFactsOrJudgements:
      compositeText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && compositeText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && composite.existingMaterialTexts.every(
        (value) =>
          composite.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-58-false-multi-timing-modifier-evaluation-expansion-regression",
    question:
      composite.originalQuestion,
    focus:
      composite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyActionNatureEvaluationReasonPrimaryHijackRegression():
  ConsultingPromptBuilderVerificationCase {
  const baseline =
    inspectSecondaryMaterialsCoverage(
      "이직하는 게 좋을까요?",
    );

  const composite =
    inspectSecondaryMaterialsCoverage(
      "이직하는 게 좋을지, 그 이유가 궁금합니다.",
    );

  const compositeText =
    combinedPromptText(
      composite.prompt,
    );

  const checks = {
    baselineEvaluationPrimaryMaintained:
      baseline.intent
      === "evaluation",

    baselineDecisionTargetChangeJobMaintained:
      baseline.decisionTarget
      === "changeJob",

    compositeReasonPrimaryHijack:
      composite.intent
      === "reason",

    compositeDecisionTargetChangeJobMaintained:
      composite.decisionTarget
      === "changeJob",

    reasonHijacksPrimaryIntentNotSecondary:
      composite.intent
      !== baseline.intent
      && baseline.intent
      === "evaluation"
      && composite.intent
      === "reason"
      && !compositeText.includes(
        "secondaryIntent",
      ),

    asksWhatShiftsEvaluationSurfaceToReasonSurface:
      baseline.asksWhat.includes(
        "어떻게 판단",
      )
      && composite.asksWhat.includes(
        "왜 이런 상황",
      )
      && composite.asksWhat
      !== baseline.asksWhat
      && composite.prompt.userPrompt.includes(
        `알고 싶은 점: ${composite.asksWhat}`,
      ),

    finalDecisionShiftsConditionalProgressToCauseInterpretation:
      baseline.finalDecision.includes(
        "진행할 수는 있지만",
      )
      && composite.finalDecision.includes(
        "해석된다",
      )
      && composite.finalDecision
      !== baseline.finalDecision
      && engineDecisionLockedInPrompt(
        composite.prompt,
        composite.finalDecision,
      ),

    decisionTargetUnchanged:
      composite.decisionTarget
      === baseline.decisionTarget
      && composite.decisionTarget
      === "changeJob",

    timingTypeUnchanged:
      baseline.timingType
      === "unknown"
      && composite.timingType
      === baseline.timingType,

    focusUnchanged:
      composite.focus
      === baseline.focus,

    titlesUnchanged:
      composite.explanationTitles.join(
        "|",
      )
      === baseline.explanationTitles.join(
        "|",
      ),

    conditionsUnchanged:
      composite.conditionsTexts.join(
        "|",
      )
      === baseline.conditionsTexts.join(
        "|",
      )
      && composite.hasConditionMaterial
      === baseline.hasConditionMaterial,

    directionsUnchanged:
      composite.recommendedDirection
      === baseline.recommendedDirection
      && composite.prohibitedDirection
      === baseline.prohibitedDirection
      && composite.hasDirectionMaterial
      === baseline.hasDirectionMaterial,

    risksUnchanged:
      composite.risksCount
      === baseline.risksCount
      && composite.hasDedicatedRisksMaterial
      === baseline.hasDedicatedRisksMaterial,

    verdictUnchanged:
      composite.verdict
      === baseline.verdict
      && baseline.verdict
      === "conditionallyRecommended",

    originalQuestionPreservedAsCompositeSource:
      composite.originalQuestion
      === "이직하는 게 좋을지, 그 이유가 궁금합니다."
      && composite.prompt.userPrompt.includes(
        composite.originalQuestion,
      ),

    reasonPrimaryDoesNotCreateExtraMaterialExpansion:
      composite.explanationTitles.join(
        "|",
      )
      === baseline.explanationTitles.join(
        "|",
      )
      && composite.conditionsTexts.join(
        "|",
      )
      === baseline.conditionsTexts.join(
        "|",
      )
      && composite.recommendedDirection
      === baseline.recommendedDirection
      && composite.prohibitedDirection
      === baseline.prohibitedDirection
      && composite.risksCount
      === baseline.risksCount
      && composite.verdict
      === baseline.verdict
      && composite.intent
      === "reason"
      && baseline.intent
      === "evaluation",

    fixtureDoesNotInventFactsOrJudgements:
      compositeText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && compositeText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && composite.existingMaterialTexts.every(
        (value) =>
          composite.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-59-action-nature-evaluation-reason-primary-hijack-regression",
    question:
      composite.originalQuestion,
    focus:
      composite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyRiskPrimaryTimingModifierLeakageRegression():
  ConsultingPromptBuilderVerificationCase {
  const baseline =
    inspectSecondaryMaterialsCoverage(
      "위험한 사업을 계속해도 될까요?",
    );

  const composite =
    inspectSecondaryMaterialsCoverage(
      "시기적으로 위험한 사업을 계속해도 될까요?",
    );

  const controlNowPrefix =
    inspectSecondaryMaterialsCoverage(
      "지금 위험한 사업을 계속해도 될까요?",
    );

  const compositeText =
    combinedPromptText(
      composite.prompt,
    );

  const checks = {
    baselineRiskPrimaryMaintained:
      baseline.intent
      === "risk",

    compositeRiskPrimaryMaintained:
      composite.intent
      === "risk",

    baselineDecisionTargetContinueMaintained:
      baseline.decisionTarget
      === "continue",

    compositeDecisionTargetContinueMaintained:
      composite.decisionTarget
      === "continue",

    baselineTimingTypeUnknownMaintained:
      baseline.timingType
      === "unknown",

    compositeTimingTypeBestTimingLeakage:
      composite.timingType
      === "bestTiming",

    timingModifierChangesTimingTypeOnly:
      composite.timingType
      !== baseline.timingType
      && baseline.timingType
      === "unknown"
      && composite.timingType
      === "bestTiming",

    asksWhatUnchanged:
      composite.asksWhat
      === baseline.asksWhat
      && composite.asksWhat.includes(
        "위험이 있는지",
      )
      && composite.prompt.userPrompt.includes(
        `알고 싶은 점: ${composite.asksWhat}`,
      ),

    focusUnchanged:
      composite.focus
      === baseline.focus
      && composite.focus
      === "continuation",

    titlesUnchanged:
      composite.explanationTitles.join(
        "|",
      )
      === baseline.explanationTitles.join(
        "|",
      )
      && baseline.explanationTitles.length
      === 5,

    conditionsExpandedByTimingModifier:
      composite.conditionsTexts.join(
        "|",
      )
      !== baseline.conditionsTexts.join(
        "|",
      )
      && baseline.conditionsTexts.length
      === 1
      && composite.conditionsTexts.length
      === 2
      && composite.conditionsTexts.some(
        (text) =>
          text.includes(
            "실행 시기를 확정할 수 없다",
          ),
      ),

    directionsShiftToWaitHold:
      composite.recommendedDirection
      !== baseline.recommendedDirection
      && composite.prohibitedDirection
      !== baseline.prohibitedDirection
      && composite.recommendedDirection.includes(
        "유보",
      )
      && engineDecisionLockedInPrompt(
        composite.prompt,
        composite.finalDecision,
      ),

    compositeVerdictWait:
      composite.verdict
      === "wait",

    baselineVerdictConditionallyRecommended:
      baseline.verdict
      === "conditionallyRecommended",

    finalDecisionDiffersFromBaseline:
      composite.finalDecision
      !== baseline.finalDecision
      && composite.finalDecision.includes(
        "시기를 늦추",
      )
      && baseline.finalDecision.includes(
        "진행할 수는 있지만",
      ),

    risksCountUnchanged:
      composite.risksCount
      === baseline.risksCount
      && composite.risksCount
      === 0
      && composite.hasDedicatedRisksMaterial
      === baseline.hasDedicatedRisksMaterial,

    compositeSecondaryIntentAbsent:
      !compositeText.includes(
        "secondaryIntent",
      ),

    originalQuestionPreservedAsCompositeSource:
      composite.originalQuestion
      === "시기적으로 위험한 사업을 계속해도 될까요?"
      && composite.prompt.userPrompt.includes(
        composite.originalQuestion,
      ),

    noActualTimingSpeechActBoundary:
      composite.intent
      === "risk"
      && composite.originalQuestion.includes(
        "시기적으로",
      )
      && composite.originalQuestion.includes(
        "위험한",
      )
      && !composite.originalQuestion.includes(
        "시기가",
      )
      && !composite.originalQuestion.includes(
        "언제",
      )
      && !composite.asksWhat.includes(
        "언제",
      )
      && composite.timingType
      === "bestTiming",

    controlNowPrefixAlsoLeaksButAsExecutionTiming:
      controlNowPrefix.intent
      === "risk"
      && controlNowPrefix.decisionTarget
      === "continue"
      && controlNowPrefix.timingType
      === "executionTiming"
      && controlNowPrefix.timingType
      !== composite.timingType
      && controlNowPrefix.asksWhat
      === baseline.asksWhat
      && controlNowPrefix.verdict
      === "wait",

    fixtureDoesNotInventFactsOrJudgements:
      compositeText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && compositeText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && composite.existingMaterialTexts.every(
        (value) =>
          composite.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-60-risk-primary-timing-modifier-leakage-regression",
    question:
      composite.originalQuestion,
    focus:
      composite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyRiskPrimarySecondaryStopTimingDecisionTargetHijackRegression():
  ConsultingPromptBuilderVerificationCase {
  const baseline =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 때 위험한 점이 궁금합니다.",
    );

  const composite =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 때 위험한 점과 그만둘 시기가 궁금합니다.",
    );

  const controlStartBaseline =
    inspectSecondaryMaterialsCoverage(
      "사업을 시작할 때 위험한 점이 궁금합니다.",
    );

  const controlStartComposite =
    inspectSecondaryMaterialsCoverage(
      "사업을 시작할 때 위험한 점과 그만둘 시기",
    );

  const compositeText =
    combinedPromptText(
      composite.prompt,
    );

  const controlText =
    combinedPromptText(
      controlStartComposite.prompt,
    );

  const checks = {
    baselineRiskPrimaryMaintained:
      baseline.intent
      === "risk",

    baselineDecisionTargetContinueMaintained:
      baseline.decisionTarget
      === "continue",

    baselineTimingTypeUnknownMaintained:
      baseline.timingType
      === "unknown",

    baselineFocusContinuationMaintained:
      baseline.focus
      === "continuation",

    baselineRiskSurfaceMaintained:
      baseline.asksWhat.includes(
        "위험",
      )
      && baseline.risksCount
      === 0
      && baseline.hasDedicatedRisksMaterial
      === false
      && baseline.explanationTitles.every(
        (title) =>
          !title.includes(
            "위험",
          ),
      ),

    baselineVerdictConditionallyRecommended:
      baseline.verdict
      === "conditionallyRecommended",

    compositeTimingPrimaryHijack:
      composite.intent
      === "timing",

    compositeDecisionTargetStopHijack:
      composite.decisionTarget
      === "stop",

    compositeTimingTypeBestTiming:
      composite.timingType
      === "bestTiming",

    compositeFocusTermination:
      composite.focus
      === "termination",

    compositeRisksExpandedToThree:
      composite.risksCount
      === 3
      && composite.hasDedicatedRisksMaterial
      === true,

    compositeVerdictWait:
      composite.verdict
      === "wait",

    secondaryStopTimingFlipsDecisionTargetContinueToStop:
      String(baseline.decisionTarget)
      !== String(composite.decisionTarget)
      && baseline.decisionTarget
      === "continue"
      && composite.decisionTarget
      === "stop"
      && composite.originalQuestion.includes(
        "그만둘 시기",
      )
      && baseline.originalQuestion.includes(
        "위험한 점",
      )
      && !baseline.originalQuestion.includes(
        "그만둘 시기",
      ),

    decisionTargetDiffersFromBaseline:
      String(composite.decisionTarget)
      !== String(baseline.decisionTarget),

    timingPrimaryFlipFromRisk:
      String(baseline.intent)
      !== String(composite.intent)
      && baseline.intent
      === "risk"
      && composite.intent
      === "timing",

    timingTypeChangesUnknownToBestTiming:
      String(baseline.timingType)
      !== String(composite.timingType)
      && baseline.timingType
      === "unknown"
      && composite.timingType
      === "bestTiming",

    focusChangesContinuationToTermination:
      String(baseline.focus)
      !== String(composite.focus)
      && baseline.focus
      === "continuation"
      && composite.focus
      === "termination",

    titlesShiftFromContinuationToTerminationSurface:
      composite.explanationTitles.join(
        "|",
      )
      !== baseline.explanationTitles.join(
        "|",
      )
      && baseline.explanationTitles[0]
      === "계속 유지하는 것이 맞는지"
      && composite.explanationTitles[0]
      === "현재 상태에서 벗어나는 것이 맞는지"
      && composite.explanationTitles.includes(
        "위험",
      )
      && !baseline.explanationTitles.includes(
        "위험",
      ),

    risksChangeFromBaselineSurface:
      composite.risksCount
      !== baseline.risksCount
      && baseline.risksCount
      === 0
      && composite.risksCount
      === 3
      && composite.hasDedicatedRisksMaterial
      !== baseline.hasDedicatedRisksMaterial,

    verdictChangesConditionallyRecommendedToWait:
      String(baseline.verdict)
      !== String(composite.verdict)
      && baseline.verdict
      === "conditionallyRecommended"
      && composite.verdict
      === "wait",

    finalDecisionChangesProgressToWaitHold:
      composite.finalDecision
      !== baseline.finalDecision
      && baseline.finalDecision.includes(
        "진행할 수는 있지만",
      )
      && composite.finalDecision.includes(
        "지켜보는",
      )
      && composite.recommendedDirection.includes(
        "유보",
      )
      && engineDecisionLockedInPrompt(
        composite.prompt,
        composite.finalDecision,
      ),

    baselineRiskPrimarySurfaceNotPreservedInComposite:
      composite.intent
      !== "risk"
      && composite.focus
      !== "continuation"
      && composite.decisionTarget
      !== "continue"
      && composite.asksWhat.includes(
        "언제",
      )
      && !composite.asksWhat.includes(
        "위험",
      )
      && baseline.asksWhat.includes(
        "위험",
      ),

    primaryIntentTimingHijackNotSecondaryMultiSpeech:
      composite.intent
      === "timing"
      && !compositeText.includes(
        "secondaryIntent",
      )
      && composite.originalQuestion.includes(
        "위험한 점",
      )
      && composite.originalQuestion.includes(
        "그만둘 시기",
      ),

    controlStartBaselineRiskPrimaryMaintained:
      controlStartBaseline.intent
      === "risk"
      && controlStartBaseline.decisionTarget
      === "start"
      && controlStartBaseline.timingType
      === "unknown"
      && controlStartBaseline.focus
      === "businessStart"
      && controlStartBaseline.verdict
      === "conditionallyRecommended",

    controlStartToStopSameDecisionTargetHijack:
      controlStartComposite.intent
      === "timing"
      && controlStartComposite.decisionTarget
      === "stop"
      && controlStartComposite.timingType
      === "bestTiming"
      && controlStartComposite.focus
      === "termination"
      && controlStartComposite.verdict
      === "wait"
      && controlStartComposite.risksCount
      === 3
      && controlStartBaseline.decisionTarget
      === "start"
      && String(controlStartComposite.decisionTarget)
      !== String(controlStartBaseline.decisionTarget)
      && !controlText.includes(
        "secondaryIntent",
      ),

    originalQuestionPreservedAsCompositeSource:
      composite.originalQuestion
      === "사업을 계속할 때 위험한 점과 그만둘 시기가 궁금합니다."
      && composite.prompt.userPrompt.includes(
        composite.originalQuestion,
      ),

    fixtureDoesNotInventFactsOrJudgements:
      compositeText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && compositeText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && composite.existingMaterialTexts.every(
        (value) =>
          composite.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-61-risk-primary-secondary-stop-timing-decision-target-hijack-regression",
    question:
      composite.originalQuestion,
    focus:
      composite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyTimingPrimaryRiskSecondaryContinueAntiExpansionRegression():
  ConsultingPromptBuilderVerificationCase {
  const timingRiskComposite =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 시기와 위험한 점이 궁금합니다.",
    );

  const timingOnly =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 시기가 궁금합니다.",
    );

  const timingRiskText =
    combinedPromptText(
      timingRiskComposite.prompt,
    );

  const checks = {
    timingPrimaryMaintained:
      timingRiskComposite.intent
      === "timing",

    decisionTargetContinueMaintained:
      timingRiskComposite.decisionTarget
      === "continue",

    timingTypeBestTimingMaintained:
      timingRiskComposite.timingType
      === "bestTiming",

    riskDoesNotReclassifyPrimary:
      timingRiskComposite.intent
      !== "risk"
      && timingRiskComposite.intent
      === timingOnly.intent,

    riskDoesNotChangeDecisionTargetToStart:
      timingRiskComposite.decisionTarget
      !== "start"
      && timingRiskComposite.decisionTarget
      === "continue"
      && timingRiskComposite.decisionTarget
      === timingOnly.decisionTarget,

    originalPreservesRiskSurface:
      timingRiskComposite.originalQuestion.includes(
        "시기",
      )
      && timingRiskComposite.originalQuestion.includes(
        "위험",
      )
      && timingRiskComposite.prompt.userPrompt.includes(
        timingRiskComposite.originalQuestion,
      ),

    asksWhatStaysTimingCentered:
      timingRiskComposite.asksWhat.includes(
        "언제",
      )
      && !timingRiskComposite.asksWhat.includes(
        "위험",
      )
      && !timingRiskComposite.asksWhat.includes(
        "좋을지",
      )
      && !timingRiskComposite.asksWhat.includes(
        "방법",
      )
      && timingRiskComposite.asksWhat
      === timingOnly.asksWhat
      && timingRiskComposite.prompt.userPrompt.includes(
        `알고 싶은 점: ${timingRiskComposite.asksWhat}`,
      ),

    riskSecondaryDoesNotCreateSecondaryIntent:
      timingRiskComposite.intent
      === "timing"
      && !timingRiskText.includes(
        "secondaryIntent",
      ),

    evidenceMaterialDoesNotDisappearVsTimingOnly:
      timingOnly.explanationTitles.includes(
        "유지의 근거",
      )
      && timingRiskComposite.explanationTitles.includes(
        "유지의 근거",
      )
      && timingRiskComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      ),

    riskSecondaryDoesNotOverExpandTitles:
      timingRiskComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      ),

    riskSecondaryDoesNotOverExpandConditions:
      timingRiskComposite.hasConditionMaterial
      === timingOnly.hasConditionMaterial
      && timingRiskComposite.conditionsTexts.join(
        "|",
      )
      === timingOnly.conditionsTexts.join(
        "|",
      ),

    riskSecondaryDoesNotInventRiskMaterials:
      timingRiskComposite.risksCount
      === 0
      && timingOnly.risksCount
      === 0
      && timingRiskComposite.risksCount
      === timingOnly.risksCount
      && !timingRiskComposite.hasDedicatedRisksMaterial
      && !timingOnly.hasDedicatedRisksMaterial
      && timingRiskComposite.hasDedicatedRisksMaterial
      === timingOnly.hasDedicatedRisksMaterial
      && !timingRiskComposite.explanationTitles.includes(
        "위험",
      )
      && !timingRiskComposite.explanationTitles.includes(
        "사업상 위험",
      )
      && !timingRiskComposite.explanationTitles.includes(
        "변경·이탈을 고려해야 하는 신호",
      ),

    riskSecondaryDoesNotOverExpandDirections:
      timingRiskComposite.hasDirectionMaterial
      === timingOnly.hasDirectionMaterial
      && timingRiskComposite.recommendedDirection
      === timingOnly.recommendedDirection
      && timingRiskComposite.prohibitedDirection
      === timingOnly.prohibitedDirection
      && timingRiskComposite.verdict
      === timingOnly.verdict
      && timingRiskComposite.finalDecision
      === timingOnly.finalDecision
      && engineDecisionLockedInPrompt(
        timingRiskComposite.prompt,
        timingRiskComposite.finalDecision,
      ),

    riskSecondaryDoesNotExpandTimingMaterials:
      timingRiskComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      )
      && timingRiskComposite.hasConditionMaterial
      === timingOnly.hasConditionMaterial
      && timingRiskComposite.conditionsTexts.join(
        "|",
      )
      === timingOnly.conditionsTexts.join(
        "|",
      )
      && timingRiskComposite.risksCount
      === timingOnly.risksCount
      && timingRiskComposite.hasDedicatedRisksMaterial
      === timingOnly.hasDedicatedRisksMaterial
      && timingRiskComposite.hasDirectionMaterial
      === timingOnly.hasDirectionMaterial
      && timingRiskComposite.recommendedDirection
      === timingOnly.recommendedDirection
      && timingRiskComposite.prohibitedDirection
      === timingOnly.prohibitedDirection
      && timingRiskComposite.verdict
      === timingOnly.verdict
      && timingRiskComposite.finalDecision
      === timingOnly.finalDecision
      && timingRiskComposite.timingType
      === timingOnly.timingType,

    methodSpecificMaterialNotCreatedByRisk:
      hasNoDedicatedMethodMaterialField(
        timingRiskComposite.explanationTitles,
      )
      && !timingRiskComposite.asksWhat.includes(
        "방법",
      )
      && !timingRiskComposite.originalQuestion.includes(
        "방법",
      ),

    riskDoesNotPromoteOtherSpeechActs:
      timingRiskComposite.intent
      !== "method"
      && timingRiskComposite.intent
      !== "evaluation"
      && timingRiskComposite.intent
      !== "risk"
      && timingRiskComposite.timingType
      === timingOnly.timingType
      && timingRiskComposite.decisionTarget
      === timingOnly.decisionTarget
      && timingRiskComposite.intent
      === timingOnly.intent,

    multiSpeechActKeepsPrimaryCenter:
      timingRiskText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && timingRiskText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      )
      && timingRiskText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && timingRiskText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      ),

    fixtureDoesNotInventFactsOrJudgements:
      timingRiskText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && timingRiskText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && timingRiskComposite.existingMaterialTexts.every(
        (value) =>
          timingRiskComposite.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-50-timing-primary-risk-secondary-continue-anti-expansion-regression",
    question:
      timingRiskComposite.originalQuestion,
    focus:
      timingRiskComposite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyTimingPrimaryMethodSecondaryContinueAntiExpansionRegression():
  ConsultingPromptBuilderVerificationCase {
  const timingMethodComposite =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 시기와 어떤 방법으로 준비해야 할까요?",
    );

  const timingOnly =
    inspectSecondaryMaterialsCoverage(
      "사업을 계속할 시기가 궁금합니다.",
    );

  const timingMethodText =
    combinedPromptText(
      timingMethodComposite.prompt,
    );

  const checks = {
    timingPrimaryMaintained:
      timingMethodComposite.intent
      === "timing",

    decisionTargetContinueMaintained:
      timingMethodComposite.decisionTarget
      === "continue",

    timingTypeBestTimingMaintained:
      timingMethodComposite.timingType
      === "bestTiming",

    methodDoesNotReclassifyPrimary:
      timingMethodComposite.intent
      !== "method"
      && timingMethodComposite.intent
      === timingOnly.intent,

    methodDoesNotChangeDecisionTargetToStart:
      timingMethodComposite.decisionTarget
      !== "start"
      && timingMethodComposite.decisionTarget
      === "continue"
      && timingMethodComposite.decisionTarget
      === timingOnly.decisionTarget,

    originalPreservesMethodSurface:
      timingMethodComposite.originalQuestion.includes(
        "시기",
      )
      && timingMethodComposite.originalQuestion.includes(
        "방법",
      )
      && timingMethodComposite.prompt.userPrompt.includes(
        timingMethodComposite.originalQuestion,
      ),

    asksWhatStaysTimingCentered:
      timingMethodComposite.asksWhat.includes(
        "언제",
      )
      && !timingMethodComposite.asksWhat.includes(
        "방법",
      )
      && !timingMethodComposite.asksWhat.includes(
        "위험",
      )
      && !timingMethodComposite.asksWhat.includes(
        "좋을지",
      )
      && timingMethodComposite.asksWhat
      === timingOnly.asksWhat
      && timingMethodComposite.prompt.userPrompt.includes(
        `알고 싶은 점: ${timingMethodComposite.asksWhat}`,
      ),

    methodSecondaryDoesNotCreateSecondaryIntent:
      timingMethodComposite.intent
      === "timing"
      && !timingMethodText.includes(
        "secondaryIntent",
      ),

    evidenceMaterialDoesNotDisappearVsTimingOnly:
      timingOnly.explanationTitles.includes(
        "유지의 근거",
      )
      && timingMethodComposite.explanationTitles.includes(
        "유지의 근거",
      )
      && timingMethodComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      ),

    methodSecondaryDoesNotOverExpandTitles:
      timingMethodComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      ),

    methodSecondaryDoesNotOverExpandConditions:
      timingMethodComposite.hasConditionMaterial
      === timingOnly.hasConditionMaterial
      && timingMethodComposite.conditionsTexts.join(
        "|",
      )
      === timingOnly.conditionsTexts.join(
        "|",
      ),

    methodSecondaryDoesNotInventMethodMaterials:
      hasNoDedicatedMethodMaterialField(
        timingMethodComposite.explanationTitles,
      )
      && hasNoDedicatedMethodMaterialField(
        timingOnly.explanationTitles,
      )
      && !timingMethodComposite.explanationTitles.includes(
        "방법",
      )
      && !timingMethodComposite.explanationTitles.includes(
        "준비 방법",
      )
      && !timingMethodComposite.explanationTitles.includes(
        "대응 방법",
      ),

    methodProxyStaysWithinConditionsAndDirections:
      timingMethodComposite.hasConditionMaterial
      && timingMethodComposite.hasDirectionMaterial
      && promptHasMethodProxyBinding(
        timingMethodText,
      )
      && !promptAllowsRisksAsMethodProxy(
        timingMethodText,
      )
      && timingMethodComposite.hasConditionMaterial
      === timingOnly.hasConditionMaterial
      && timingMethodComposite.hasDirectionMaterial
      === timingOnly.hasDirectionMaterial
      && timingMethodComposite.conditionsTexts.join(
        "|",
      )
      === timingOnly.conditionsTexts.join(
        "|",
      )
      && timingMethodComposite.recommendedDirection
      === timingOnly.recommendedDirection
      && timingMethodComposite.prohibitedDirection
      === timingOnly.prohibitedDirection,

    methodSecondaryDoesNotOverExpandDirections:
      timingMethodComposite.hasDirectionMaterial
      === timingOnly.hasDirectionMaterial
      && timingMethodComposite.recommendedDirection
      === timingOnly.recommendedDirection
      && timingMethodComposite.prohibitedDirection
      === timingOnly.prohibitedDirection
      && timingMethodComposite.verdict
      === timingOnly.verdict
      && timingMethodComposite.finalDecision
      === timingOnly.finalDecision
      && engineDecisionLockedInPrompt(
        timingMethodComposite.prompt,
        timingMethodComposite.finalDecision,
      ),

    methodSecondaryDoesNotExpandTimingMaterials:
      timingMethodComposite.explanationTitles.join(
        "|",
      )
      === timingOnly.explanationTitles.join(
        "|",
      )
      && timingMethodComposite.hasConditionMaterial
      === timingOnly.hasConditionMaterial
      && timingMethodComposite.conditionsTexts.join(
        "|",
      )
      === timingOnly.conditionsTexts.join(
        "|",
      )
      && timingMethodComposite.risksCount
      === timingOnly.risksCount
      && timingMethodComposite.hasDedicatedRisksMaterial
      === timingOnly.hasDedicatedRisksMaterial
      && timingMethodComposite.hasDirectionMaterial
      === timingOnly.hasDirectionMaterial
      && timingMethodComposite.recommendedDirection
      === timingOnly.recommendedDirection
      && timingMethodComposite.prohibitedDirection
      === timingOnly.prohibitedDirection
      && timingMethodComposite.verdict
      === timingOnly.verdict
      && timingMethodComposite.finalDecision
      === timingOnly.finalDecision
      && timingMethodComposite.timingType
      === timingOnly.timingType,

    methodDoesNotPromoteOtherSpeechActs:
      timingMethodComposite.intent
      !== "method"
      && timingMethodComposite.intent
      !== "evaluation"
      && timingMethodComposite.intent
      !== "risk"
      && timingMethodComposite.timingType
      === timingOnly.timingType
      && timingMethodComposite.decisionTarget
      === timingOnly.decisionTarget
      && timingMethodComposite.intent
      === timingOnly.intent,

    multiSpeechActKeepsPrimaryCenter:
      timingMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && timingMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      )
      && timingMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && timingMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      ),

    fixtureDoesNotInventFactsOrJudgements:
      timingMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && timingMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && timingMethodComposite.existingMaterialTexts.every(
        (value) =>
          timingMethodComposite.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-51-timing-primary-method-secondary-continue-anti-expansion-regression",
    question:
      timingMethodComposite.originalQuestion,
    focus:
      timingMethodComposite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyRiskPrimaryMethodSecondaryStartAntiExpansionRegression():
  ConsultingPromptBuilderVerificationCase {
  const riskMethodComposite =
    inspectSecondaryMaterialsCoverage(
      "사업을 시작할 때 위험한 점과 어떤 방법으로 준비해야 할지 궁금합니다.",
    );

  const riskOnly =
    inspectSecondaryMaterialsCoverage(
      "사업을 시작할 때 위험한 점은 무엇인가요?",
    );

  const riskMethodText =
    combinedPromptText(
      riskMethodComposite.prompt,
    );

  const checks = {
    riskPrimaryMaintained:
      riskMethodComposite.intent
      === "risk",

    decisionTargetStartMaintained:
      riskMethodComposite.decisionTarget
      === "start",

    timingTypeUnknownMaintained:
      riskMethodComposite.timingType
      === "unknown",

    asksWhatStaysRiskCentered:
      riskMethodComposite.asksWhat.includes(
        "위험",
      )
      && !riskMethodComposite.asksWhat.includes(
        "방법",
      )
      && !riskMethodComposite.asksWhat.includes(
        "언제",
      )
      && !riskMethodComposite.asksWhat.includes(
        "좋을지",
      )
      && riskMethodComposite.asksWhat
      === riskOnly.asksWhat
      && riskMethodComposite.prompt.userPrompt.includes(
        `알고 싶은 점: ${riskMethodComposite.asksWhat}`,
      ),

    baselineRiskPrimaryMaintained:
      riskOnly.intent
      === "risk",

    baselineDecisionTargetStartMaintained:
      riskOnly.decisionTarget
      === "start",

    primaryDecisionSurfaceMatchesBaseline:
      riskMethodComposite.intent
      === riskOnly.intent
      && riskMethodComposite.decisionTarget
      === riskOnly.decisionTarget
      && riskMethodComposite.timingType
      === riskOnly.timingType
      && riskMethodComposite.verdict
      === riskOnly.verdict
      && riskMethodComposite.finalDecision
      === riskOnly.finalDecision
      && riskMethodComposite.conditionsTexts.join(
        "|",
      )
      === riskOnly.conditionsTexts.join(
        "|",
      )
      && riskMethodComposite.recommendedDirection
      === riskOnly.recommendedDirection
      && riskMethodComposite.prohibitedDirection
      === riskOnly.prohibitedDirection
      && riskMethodComposite.risksCount
      === riskOnly.risksCount
      && riskMethodComposite.hasDedicatedRisksMaterial
      === riskOnly.hasDedicatedRisksMaterial
      && riskMethodComposite.explanationTitles.join(
        "|",
      )
      === riskOnly.explanationTitles.join(
        "|",
      )
      && riskMethodComposite.focus
      === riskOnly.focus,

    originalPreservesMethodSurface:
      riskMethodComposite.originalQuestion.includes(
        "위험한 점",
      )
      && riskMethodComposite.originalQuestion.includes(
        "어떤 방법으로",
      )
      && riskMethodComposite.originalQuestion.includes(
        "방법",
      )
      && riskMethodComposite.prompt.userPrompt.includes(
        riskMethodComposite.originalQuestion,
      ),

    methodSecondaryDoesNotCreateSecondaryIntent:
      riskMethodComposite.intent
      === "risk"
      && !riskMethodText.includes(
        "secondaryIntent",
      ),

    methodDoesNotReclassifyPrimaryAsksWhat:
      riskMethodComposite.asksWhat
      === riskOnly.asksWhat
      && !riskMethodComposite.asksWhat.includes(
        "방법",
      ),

    methodSecondaryDoesNotInventMethodMaterials:
      hasNoDedicatedMethodMaterialField(
        riskMethodComposite.explanationTitles,
      )
      && hasNoDedicatedMethodMaterialField(
        riskOnly.explanationTitles,
      )
      && !riskMethodComposite.explanationTitles.includes(
        "방법",
      )
      && !riskMethodComposite.explanationTitles.includes(
        "준비 방법",
      )
      && !riskMethodComposite.explanationTitles.includes(
        "대응 방법",
      ),

    methodProxyStaysWithinConditionsAndDirections:
      riskMethodComposite.hasConditionMaterial
      && riskMethodComposite.hasDirectionMaterial
      && promptHasMethodProxyBinding(
        riskMethodText,
      )
      && !promptAllowsRisksAsMethodProxy(
        riskMethodText,
      )
      && riskMethodComposite.hasConditionMaterial
      === riskOnly.hasConditionMaterial
      && riskMethodComposite.hasDirectionMaterial
      === riskOnly.hasDirectionMaterial
      && riskMethodComposite.conditionsTexts.join(
        "|",
      )
      === riskOnly.conditionsTexts.join(
        "|",
      )
      && riskMethodComposite.recommendedDirection
      === riskOnly.recommendedDirection
      && riskMethodComposite.prohibitedDirection
      === riskOnly.prohibitedDirection,

    baselineHasActualRiskMaterial:
      riskOnly.risksCount
      > 0
      && riskOnly.hasDedicatedRisksMaterial
      && riskOnly.explanationTitles.includes(
        "사업상 위험",
      ),

    riskMaterialMatchesBaseline:
      riskMethodComposite.risksCount
      > 0
      && riskMethodComposite.hasDedicatedRisksMaterial
      && riskMethodComposite.explanationTitles.includes(
        "사업상 위험",
      )
      && riskMethodComposite.risksCount
      === riskOnly.risksCount
      && riskMethodComposite.hasDedicatedRisksMaterial
      === riskOnly.hasDedicatedRisksMaterial,

    methodSecondaryDoesNotChangeDecisionSurface:
      riskMethodComposite.verdict
      === riskOnly.verdict
      && riskMethodComposite.finalDecision
      === riskOnly.finalDecision
      && riskMethodComposite.conditionsTexts.join(
        "|",
      )
      === riskOnly.conditionsTexts.join(
        "|",
      )
      && riskMethodComposite.recommendedDirection
      === riskOnly.recommendedDirection
      && riskMethodComposite.prohibitedDirection
      === riskOnly.prohibitedDirection
      && riskMethodComposite.risksCount
      === riskOnly.risksCount
      && riskMethodComposite.hasDedicatedRisksMaterial
      === riskOnly.hasDedicatedRisksMaterial
      && engineDecisionLockedInPrompt(
        riskMethodComposite.prompt,
        riskMethodComposite.finalDecision,
      ),

    methodSecondaryDoesNotInventMethodSpecificDecisionTitles:
      riskMethodComposite.explanationTitles.join(
        "|",
      )
      === riskOnly.explanationTitles.join(
        "|",
      )
      && !riskMethodComposite.explanationTitles.some(
        (title) =>
          title.includes(
            "방법",
          ),
      ),

    methodDoesNotPromoteOtherSpeechActs:
      riskMethodComposite.intent
      !== "method"
      && riskMethodComposite.intent
      !== "evaluation"
      && riskMethodComposite.intent
      !== "timing"
      && riskMethodComposite.timingType
      === riskOnly.timingType
      && riskMethodComposite.decisionTarget
      === riskOnly.decisionTarget
      && riskMethodComposite.intent
      === riskOnly.intent,

    multiSpeechActKeepsPrimaryCenter:
      riskMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[0],
      )
      && riskMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[1],
      )
      && riskMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && riskMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      ),

    originalQuestionFullyPreserved:
      riskMethodComposite.prompt.userPrompt.includes(
        riskMethodComposite.originalQuestion,
      )
      && riskMethodComposite.originalQuestion.includes(
        "위험한 점",
      )
      && riskMethodComposite.originalQuestion.includes(
        "어떤 방법으로",
      ),

    fixtureDoesNotInventFactsOrJudgements:
      riskMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[2],
      )
      && riskMethodText.includes(
        MULTI_SPEECHACT_RESPONSE_POLICY_MARKERS[3],
      )
      && riskMethodComposite.existingMaterialTexts.every(
        (value) =>
          riskMethodComposite.prompt.userPrompt.includes(
            value,
          ),
      ),
  };

  return {
    name:
      "I-53-risk-primary-method-secondary-start-anti-expansion-regression",
    question:
      riskMethodComposite.originalQuestion,
    focus:
      riskMethodComposite.focus,
    checks,
    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

function verifyWhenQuestionModeClassification():
  ConsultingPromptBuilderVerificationCase {
  const fixtures = [
    {
      id:
        "daeun-when-report",

      question:
        "대운이 언제 들어오나요?",

      expectedMode:
        "report" as const,
    },
    {
      id:
        "wealth-fortune-when-report",

      question:
        "재물운이 언제 좋아지나요?",

      expectedMode:
        "report" as const,
    },
    {
      id:
        "year-business-fortune-when-report",

      question:
        "2026년 사업운은 언제부터 달라지나요?",

      expectedMode:
        "report" as const,
    },
    {
      id:
        "month-fortune-when-report",

      question:
        "9월 운은 언제부터 달라지나요?",

      expectedMode:
        "report" as const,
    },
    {
      id:
        "business-start-when-question",

      question:
        "2026년에 사업을 언제 시작하면 좋을까요?",

      expectedMode:
        "question" as const,
    },
    {
      id:
        "real-estate-buy-when-question",

      question:
        "부동산을 언제 매수하면 좋을까요?",

      expectedMode:
        "question" as const,
    },
    {
      id:
        "marriage-when-question",

      question:
        "이 사람과 언제 결혼하면 좋을까요?",

      expectedMode:
        "question" as const,
    },
    {
      id:
        "partnership-start-when-question",

      question:
        "동업을 언제 시작하면 좋을까요?",

      expectedMode:
        "question" as const,
    },
  ] as const;

  const results =
    fixtures.map(
      (fixture) => {
        const artifacts =
          buildFullArtifacts(
            fixture.question,
          );

        const matchesExpectedMode =
          artifacts.answerMode
          === fixture.expectedMode;

        const matchesPromptMode =
          fixture.expectedMode
          === "question"
            ? isQuestionAnswerModePrompt(
                artifacts.prompt,
              )
              && !isReportAnswerModePrompt(
                artifacts.prompt,
              )
            : isReportAnswerModePrompt(
                artifacts.prompt,
              )
              && !isQuestionAnswerModePrompt(
                artifacts.prompt,
              );

        return {
          id:
            fixture.id,

          answerMode:
            artifacts.answerMode,

          expectedMode:
            fixture.expectedMode,

          passed:
            matchesExpectedMode
            && matchesPromptMode,
        };
      },
    );

  const businessStart =
    buildFullArtifacts(
      "2026년에 사업 시작해도 될까요?",
    );

  const businessFortune =
    buildFullArtifacts(
      "2026년 사업운은 어떨까요?",
    );

  const overallFortune =
    buildFullArtifacts(
      "올해 총운을 봐주세요",
    );

  const checks = {
    A_daeunWhenIsReport:
      results[0]?.passed
      === true,

    B_wealthFortuneWhenIsReport:
      results[1]?.passed
      === true,

    C_yearBusinessFortuneWhenIsReport:
      results[2]?.passed
      === true,

    D_monthFortuneWhenIsReport:
      results[3]?.passed
      === true,

    E_businessStartWhenIsQuestion:
      results[4]?.passed
      === true,

    F_realEstateBuyWhenIsQuestion:
      results[5]?.passed
      === true,

    G_marriageWhenIsQuestion:
      results[6]?.passed
      === true,

    H_partnershipStartWhenIsQuestion:
      results[7]?.passed
      === true,

    I_answerModeMatchesEveryFixture:
      results.every(
        (result) =>
          result.answerMode
          === result.expectedMode
          && result.passed,
      ),

    J_existingBusinessStartStaysQuestion:
      businessStart.answerMode
      === "question"
      && isQuestionAnswerModePrompt(
        businessStart.prompt,
      ),

    K_existingBusinessFortuneStaysReport:
      businessFortune.answerMode
      === "report"
      && isReportAnswerModePrompt(
        businessFortune.prompt,
      ),

    L_lifeFlowInterpretationStaysReport:
      overallFortune.answerMode
      === "report"
      && isReportAnswerModePrompt(
        overallFortune.prompt,
      )
      && (
        overallFortune.prompt.systemPrompt.includes(
          "제공된 Evidence와 계산된 대운·세운·월운·일운 Fact만 설명한다",
        )
        || isReportAnswerModePrompt(
          overallFortune.prompt,
        )
      ),
  };

  return {
    name:
      "4-10-when-question-mode-classification",

    question:
      fixtures[0].question,

    focus:
      null,

    checks,

    passed:
      Object.values(
        checks,
      ).every(
        Boolean,
      ),
  };
}

export function verifyConsultingPromptBuilder():
  ConsultingPromptBuilderVerificationResult {
  const cases = [
    verifyCompatibility(),
    verifyContinuation(),
    verifyTermination(),
    verifyBusinessStart(),
    verifyBusinessTiming(),
    verifyBusinessFieldFit(),
    verifyRealEstateBuy(),
    verifyGeneralJudgement(),
    verifyFinalDecisionPolicyInPrompt(),
    verifyEngineDecisionIsLocked(),
    verifyRoleRecommendationKept(),
    verifyLifeFlowInterpretationKept(),
    verifyExistingAnswerQualityKept(),
    verifyIntegrationFinalDecisionOnceIsResolved(),
    verifyPayloadAndGroundingKeepQuestionFocusRules(),
    verifyWaitIsNotInsufficientEvidenceAvoidance(),
    verifyInsufficientEvidenceLanguageIsRestricted(),
    verifyMechanicalTemplatesStayRemoved(),
    verifyFourQuestionDirectAnswerPriority(),
    ...verifyAnswerModeTenQuestions(),
    verifyAnswerModePriorityAndRegression(),
    verifyEvidenceSelectionAndCompression(),
    verifyQuestionSpecificEvidencePriority(),
    verifyWhenQuestionModeClassification(),
    verifyMultiSpeechActResponsePolicyRegression(),
    verifySecondaryMaterialsCoverageRegression(),
    verifySecondaryMethodProxyMaterialBindingRegression(),
    verifyNonRiskPrimaryCompositeEvaluationMethodRegression(),
    verifyTimingPrimaryCompositeSecondaryRiskMethodRegression(),
    verifyEvaluationPrimaryReasonSecondaryEvidenceProxyRegression(),
    verifyMethodPrimaryReasonSecondaryEvidenceProxyRegression(),
    verifyFalseMultiSpeechAntiExpansionNegativeBoundaryRegression(),
    verifyRiskPrimaryReasonSecondaryEvidenceProxyRegression(),
    verifyTimingPrimaryReasonSecondaryEvidenceProxyRegression(),
    verifyRiskPrimaryEvaluationSecondaryAntiExpansionRegression(),
    verifyTimingPrimaryEvaluationSecondaryAntiExpansionRegression(),
    verifyTimingPrimaryEvaluationSecondaryContinueAntiExpansionRegression(),
    verifyTimingPrimaryEvaluationSecondaryLeaveJobAntiExpansionRegression(),
    verifyTimingPrimaryRiskSecondaryContinueAntiExpansionRegression(),
    verifyTimingPrimaryMethodSecondaryContinueAntiExpansionRegression(),
    verifyRiskPrimaryMethodSecondaryStartAntiExpansionRegression(),
    verifyFalseMultiTimingModifierEvaluationExpansionRegression(),
    verifyActionNatureEvaluationReasonPrimaryHijackRegression(),
    verifyRiskPrimaryTimingModifierLeakageRegression(),
    verifyRiskPrimarySecondaryStopTimingDecisionTargetHijackRegression(),
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







