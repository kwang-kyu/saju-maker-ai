import OpenAI from "openai";

import type {
  DecisionTarget,
  QuestionIntent,
  QuestionMotive,
  QuestionReaderResult,
  QuestionTimingType,
  QuestionTopic,
  QuestionUrgency,
} from "./questionReader";

const QUESTION_TOPICS:
  readonly QuestionTopic[] = [
    "business",
    "money",
    "job",
    "realEstate",
    "relationship",
    "love",
    "marriage",
    "family",
    "health",
    "legal",
    "lifeFlow",
    "lifeDirection",
    "general",
  ];

const QUESTION_INTENTS:
  readonly QuestionIntent[] = [
    "possibility",
    "timing",
    "reason",
    "method",
    "risk",
    "comparison",
    "selection",
    "continuation",
    "termination",
    "prediction",
    "generalJudgement",
  ];

const QUESTION_MOTIVES:
  readonly QuestionMotive[] = [
    "opportunityCapture",
    "expansion",
    "recovery",
    "survival",
    "lossAvoidance",
    "anxietyReduction",
    "relationshipConfirmation",
    "lifeTransition",
    "selfUnderstanding",
    "unspecified",
  ];

const DECISION_TARGETS:
  readonly DecisionTarget[] = [
    "start",
    "continue",
    "stop",
    "wait",
    "choose",
    "invest",
    "sell",
    "move",
    "partner",
    "separate",
    "changeJob",
    "leaveJob",
    "marry",
    "reconcile",
    "manageMoney",
    "protectHealth",
    "respondToConflict",
    "confirmDirection",
    "none",
  ];

const QUESTION_URGENCIES:
  readonly QuestionUrgency[] = [
    "immediate",
    "nearTerm",
    "longTerm",
    "unknown",
  ];

const QUESTION_TIMING_TYPES:
  readonly QuestionTimingType[] = [
    "bestTiming",
    "executionTiming",
    "waitingTiming",
    "unknown",
  ];

type QuestionSemanticInterpretationResponse = {
  topic:
    QuestionTopic;

  intent:
    QuestionIntent;

  motive:
    QuestionMotive;

  decisionTarget:
    DecisionTarget;

  urgency:
    QuestionUrgency;

  timingType:
    QuestionTimingType;

  asksWhat:
    string;

  asksWhy:
    string;

  decisionQuestion:
    string;

  evidence:
    string[];

  confidence:
    number;
};

export class InvalidQuestionSemanticInterpretationError
  extends Error {
  readonly field:
    string;

  constructor(
    field:
      string,
    message:
      string,
  ) {
    super(
      message,
    );

    this.name =
      "InvalidQuestionSemanticInterpretationError";

    this.field =
      field;
  }
}

function requireNonEmptyString(
  value:
    unknown,
  field:
    string,
): string {
  if (
    typeof value
    !== "string"
  ) {
    throw new InvalidQuestionSemanticInterpretationError(
      field,
      `${field} must be a string.`,
    );
  }

  const normalizedValue =
    value.trim();

  if (
    normalizedValue.length
    === 0
  ) {
    throw new InvalidQuestionSemanticInterpretationError(
      field,
      `${field} must not be empty.`,
    );
  }

  return normalizedValue;
}

function normalizeAsksWhy(
    value:
      unknown,
  ): string {
    if (
      typeof value
      !== "string"
    ) {
      throw new InvalidQuestionSemanticInterpretationError(
        "asksWhy",
        "asksWhy must be a string.",
      );
    }

    const normalizedValue =
      value.trim();

    return normalizedValue
      || "원문에 질문 이유가 명시되지 않았다.";
  }

function requireEnumValue<
  TValue extends string,
>(
  value:
    unknown,
  allowedValues:
    readonly TValue[],
  field:
    string,
): TValue {
  if (
    typeof value
    !== "string"
    || !allowedValues.includes(
      value as TValue,
    )
  ) {
    throw new InvalidQuestionSemanticInterpretationError(
      field,
      `${field} contains an unsupported value.`,
    );
  }

  return value as TValue;
}

function requireEvidence(
  value:
    unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    throw new InvalidQuestionSemanticInterpretationError(
      "evidence",
      "evidence must be an array.",
    );
  }

  const evidence =
    Array.from(
      new Set(
        value.map(
          (
            item,
            index,
          ) =>
            requireNonEmptyString(
              item,
              `evidence[${index}]`,
            ),
        ),
      ),
    );

  if (
    evidence.length
    === 0
  ) {
    throw new InvalidQuestionSemanticInterpretationError(
      "evidence",
      "evidence must contain at least one original-question basis.",
    );
  }

  return evidence;
}

function requireConfidence(
  value:
    unknown,
): number {
  if (
    typeof value
    !== "number"
    || !Number.isFinite(
      value,
    )
    || value < 0
    || value > 1
  ) {
    throw new InvalidQuestionSemanticInterpretationError(
      "confidence",
      "confidence must be a finite number between zero and one.",
    );
  }

  return value;
}

function parseQuestionSemanticInterpretation(
  responseText:
    string,
): QuestionSemanticInterpretationResponse {
  const normalizedResponseText =
    responseText.trim();

  if (
    normalizedResponseText.length
    === 0
  ) {
    throw new InvalidQuestionSemanticInterpretationError(
      "response",
      "Question semantic interpretation response is empty.",
    );
  }

  let parsedValue:
    unknown;

  try {
    parsedValue =
      JSON.parse(
        normalizedResponseText,
      );
  } catch {
    throw new InvalidQuestionSemanticInterpretationError(
      "response",
      "Question semantic interpretation response is not valid JSON.",
    );
  }

  if (
    typeof parsedValue
    !== "object"
    || parsedValue
    === null
    || Array.isArray(
      parsedValue,
    )
  ) {
    throw new InvalidQuestionSemanticInterpretationError(
      "response",
      "Question semantic interpretation response must be an object.",
    );
  }

  const record =
    parsedValue as Record<
      string,
      unknown
    >;

  return {
    topic:
      requireEnumValue(
        record.topic,
        QUESTION_TOPICS,
        "topic",
      ),

    intent:
      requireEnumValue(
        record.intent,
        QUESTION_INTENTS,
        "intent",
      ),

    motive:
      requireEnumValue(
        record.motive,
        QUESTION_MOTIVES,
        "motive",
      ),

    decisionTarget:
      requireEnumValue(
        record.decisionTarget,
        DECISION_TARGETS,
        "decisionTarget",
      ),

    urgency:
      requireEnumValue(
        record.urgency,
        QUESTION_URGENCIES,
        "urgency",
      ),

    timingType:
      requireEnumValue(
        record.timingType,
        QUESTION_TIMING_TYPES,
        "timingType",
      ),

    asksWhat:
      requireNonEmptyString(
        record.asksWhat,
        "asksWhat",
      ),

      asksWhy:
      normalizeAsksWhy(
        record.asksWhy,
      ),

    decisionQuestion:
      requireNonEmptyString(
        record.decisionQuestion,
        "decisionQuestion",
      ),

    evidence:
      requireEvidence(
        record.evidence,
      ),

    confidence:
      requireConfidence(
        record.confidence,
      ),
  };
}

function normalizeQuestion(
  question:
    string,
): string {
  return question
    .trim()
    .replace(
      /\s+/g,
      " ",
    );
}

export async function interpretQuestionSemantics(
  question:
    string,
): Promise<QuestionReaderResult> {
  const originalQuestion =
    question.trim();

  const normalizedQuestion =
    normalizeQuestion(
      question,
    );

  if (
    normalizedQuestion.length
    === 0
  ) {
    throw new InvalidQuestionSemanticInterpretationError(
      "question",
      "Question semantic interpreter requires a non-empty question.",
    );
  }

  const client =
  new OpenAI({
    apiKey:
      process.env.OPENAI_API_KEY,
  });

  const response =
    await client.responses.create({
      model:
        process.env
          .OPENAI_QUESTION_INTERPRETER_MODEL
          ?.trim()
        || "gpt-5.5",

      input: [
        {
          role:
            "system",

          content: `
당신은 천운문 v3의 질문 의미 해석기이다.

권한 제한

- 사용자의 원문 질문이 실제로 무엇을 묻는지만 구조화한다.
- 사주를 판단하지 않는다.
- 운세, 미래, 성공 가능성, verdict, 조건 또는 위험을 만들지 않는다.
- 생년월일이나 원국 자료를 추측하지 않는다.
- 질문에 없는 대상, 행동, 관계, 시기 또는 목적을 만들지 않는다.
- 업종별 키워드 목록에 질문을 끼워 맞추지 않는다.
- 문장 전체의 의미, 조사, 서술어, 의문 표현과 문맥을 함께 읽는다.

의미 구분 원칙

- 무엇이 잘 맞는지 묻는 질문은 적합한 대상을 고르는 selection으로 해석한다.
- 할지 말지를 묻는 질문은 실행 여부 판단으로 해석한다.
- 언제가 좋은지 묻는 질문만 timing으로 해석한다.
- 어떻게 해야 하는지 묻는 질문은 method로 해석한다.
- 이유를 묻는 질문은 reason으로 해석한다.
- 장단점이나 위험을 묻는 질문은 risk로 해석한다.
- 둘 이상의 대안을 견주는 질문만 comparison으로 해석한다.
- 적합성 질문에 실행 시기나 기다림 판단을 임의로 추가하지 않는다.
- 원문에 명시되지 않은 긴급성과 마감 시점을 만들지 않는다.

분류값은 제공된 JSON Schema 값만 사용한다.
evidence에는 판단에 사용한 원문 표현만 넣는다.
asksWhat, asksWhy, decisionQuestion은 자연스러운 한국어로 작성한다.
원문에 질문 이유가 명시되지 않았다면 asksWhy에는 “원문에 질문 이유가 명시되지 않았다.”라고 작성한다.
`.trim(),
        },
        {
          role:
            "user",

          content: [
            "다음 원문 질문의 의미만 구조화하세요.",
            "",
            originalQuestion,
          ].join(
            "\n",
          ),
        },
      ],

      text: {
        format: {
          type:
            "json_schema",

          name:
            "question_semantic_interpretation",

          strict:
            true,

          schema: {
            type:
              "object",

            additionalProperties:
              false,

            properties: {
              topic: {
                type:
                  "string",

                enum:
                  QUESTION_TOPICS,
              },

              intent: {
                type:
                  "string",

                enum:
                  QUESTION_INTENTS,
              },

              motive: {
                type:
                  "string",

                enum:
                  QUESTION_MOTIVES,
              },

              decisionTarget: {
                type:
                  "string",

                enum:
                  DECISION_TARGETS,
              },

              urgency: {
                type:
                  "string",

                enum:
                  QUESTION_URGENCIES,
              },

              timingType: {
                type:
                  "string",

                enum:
                  QUESTION_TIMING_TYPES,
              },

              asksWhat: {
                type:
                  "string",
              },

              asksWhy: {
                type:
                  "string",
              },

              decisionQuestion: {
                type:
                  "string",
              },

              evidence: {
                type:
                  "array",

                minItems:
                  1,

                items: {
                  type:
                    "string",
                },
              },

              confidence: {
                type:
                  "number",

                minimum:
                  0,

                maximum:
                  1,
              },
            },

            required: [
              "topic",
              "intent",
              "motive",
              "decisionTarget",
              "urgency",
              "timingType",
              "asksWhat",
              "asksWhy",
              "decisionQuestion",
              "evidence",
              "confidence",
            ],
          },
        },
      },
    });

  const interpretation =
    parseQuestionSemanticInterpretation(
      response.output_text
      ?? "",
    );

  return {
    originalQuestion,

    normalizedQuestion,

    ...interpretation,

    humanContextReceived:
      true,
  };
}
