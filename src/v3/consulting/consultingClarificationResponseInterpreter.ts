import OpenAI from "openai";

import {
  getConsultingClarificationFieldDefinition,
} from "./consultingClarificationFieldDefinitions";
import type {
  ConsultingClarificationRequest,
  ConsultingConfirmedField,
} from "./consultingSession";

export type InterpretedClarificationFact = {
  key: string;

  description: string;

  fields:
    ConsultingConfirmedField[];

  confidence: number;
};

export type ConsultingClarificationResponseInterpretation = {
  confirmedFacts:
    InterpretedClarificationFact[];

  hasUnresolvedResponse:
    boolean;
};

export type ConsultingClarificationResponseInterpreterInput = {
  clarification:
    ConsultingClarificationRequest;

  response:
    string;
};

export type ConsultingClarificationResponseModelRequest = {
  systemPrompt: string;

  userPrompt: string;

  allowedKeys:
    [string, ...string[]];
};

export type ConsultingClarificationResponseRequestFunction = (
  request:
    ConsultingClarificationResponseModelRequest,
) => Promise<string>;

type ClarificationModelResponse = {
  matches:
    InterpretedClarificationFact[];
};

export class InvalidConsultingClarificationResponseError
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
      "InvalidConsultingClarificationResponseError";

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
    throw new InvalidConsultingClarificationResponseError(
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
    throw new InvalidConsultingClarificationResponseError(
      field,
      `${field} must not be empty.`,
    );
  }

  return normalizedValue;
}

function requireConfidence(
  value:
    unknown,
  field:
    string,
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
    throw new InvalidConsultingClarificationResponseError(
      field,
      `${field} must be between zero and one.`,
    );
  }

  return value;
}

function requireExactEvidence(
  value:
    unknown,
  field:
    string,
  originalResponse:
    string,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    throw new InvalidConsultingClarificationResponseError(
      field,
      `${field} must be an array.`,
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
              `${field}[${index}]`,
            ),
        ),
      ),
    );

  if (
    evidence.length
    === 0
  ) {
    throw new InvalidConsultingClarificationResponseError(
      field,
      `${field} must contain explicit user evidence.`,
    );
  }

  if (
    evidence.some(
      (item) =>
        !originalResponse.includes(
          item,
        ),
    )
  ) {
    throw new InvalidConsultingClarificationResponseError(
      field,
      `${field} must quote the user's response exactly.`,
    );
  }

  return evidence;
}

function parseConfirmedFields(
  value:
    unknown,
  itemKey:
    string,
  matchIndex:
    number,
  originalResponse:
    string,
): ConsultingConfirmedField[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    throw new InvalidConsultingClarificationResponseError(
      `matches[${matchIndex}].fields`,
      "Clarification fields must be an array.",
    );
  }

  if (
    value.length
    === 0
  ) {
    throw new InvalidConsultingClarificationResponseError(
      `matches[${matchIndex}].fields`,
      "At least one explicitly answered field is required.",
    );
  }

  const definition =
    getConsultingClarificationFieldDefinition(
      itemKey,
    );

  const allowedFieldKeys =
    new Set(
      definition
        .fields
        .map(
          (field) =>
            field.key,
        ),
    );

  const registeredFieldKeys =
    new Set<string>();

  return value.map(
    (
      fieldValue,
      fieldIndex,
    ) => {
      if (
        typeof fieldValue
        !== "object"
        || fieldValue
        === null
        || Array.isArray(
          fieldValue,
        )
      ) {
        throw new InvalidConsultingClarificationResponseError(
          `matches[${matchIndex}].fields[${fieldIndex}]`,
          "Clarification field must be an object.",
        );
      }

      const fieldRecord =
        fieldValue as Record<
          string,
          unknown
        >;

      const key =
        requireNonEmptyString(
          fieldRecord.key,
          `matches[${matchIndex}].fields[${fieldIndex}].key`,
        );

      if (
        !allowedFieldKeys.has(
          key,
        )
      ) {
        throw new InvalidConsultingClarificationResponseError(
          `matches[${matchIndex}].fields[${fieldIndex}].key`,
          "The model returned a field that is not defined for the clarification item.",
        );
      }

      if (
        registeredFieldKeys.has(
          key,
        )
      ) {
        throw new InvalidConsultingClarificationResponseError(
          `matches[${matchIndex}].fields[${fieldIndex}].key`,
          "The model returned the same clarification field more than once.",
        );
      }

      registeredFieldKeys.add(
        key,
      );

      return {
        key,

        value:
          requireNonEmptyString(
            fieldRecord.value,
            `matches[${matchIndex}].fields[${fieldIndex}].value`,
          ),

        evidence:
          requireExactEvidence(
            fieldRecord.evidence,
            `matches[${matchIndex}].fields[${fieldIndex}].evidence`,
            originalResponse,
          ),
      };
    },
  );
}

function parseModelResponse(
  responseText:
    string,
  originalResponse:
    string,
  allowedKeys:
    ReadonlySet<string>,
): ClarificationModelResponse {
  const normalizedResponseText =
    requireNonEmptyString(
      responseText,
      "modelResponse",
    );

  let parsedValue:
    unknown;

  try {
    parsedValue =
      JSON.parse(
        normalizedResponseText,
      );
  } catch {
    throw new InvalidConsultingClarificationResponseError(
      "modelResponse",
      "Clarification response is not valid JSON.",
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
    throw new InvalidConsultingClarificationResponseError(
      "modelResponse",
      "Clarification response must be an object.",
    );
  }

  const record =
    parsedValue as Record<
      string,
      unknown
    >;

  if (
    !Array.isArray(
      record.matches,
    )
  ) {
    throw new InvalidConsultingClarificationResponseError(
      "matches",
      "matches must be an array.",
    );
  }

  const registeredKeys =
    new Set<string>();

  const matches =
    record.matches.map(
      (
        value,
        index,
      ) => {
        if (
          typeof value
          !== "object"
          || value
          === null
          || Array.isArray(
            value,
          )
        ) {
          throw new InvalidConsultingClarificationResponseError(
            `matches[${index}]`,
            `matches[${index}] must be an object.`,
          );
        }

        const match =
          value as Record<
            string,
            unknown
          >;

        const key =
          requireNonEmptyString(
            match.key,
            `matches[${index}].key`,
          );

        if (
          !allowedKeys.has(
            key,
          )
        ) {
          throw new InvalidConsultingClarificationResponseError(
            `matches[${index}].key`,
            "The model returned a key that is not awaiting clarification.",
          );
        }

        if (
          registeredKeys.has(
            key,
          )
        ) {
          throw new InvalidConsultingClarificationResponseError(
            `matches[${index}].key`,
            "The model returned the same clarification key more than once.",
          );
        }

        registeredKeys.add(
          key,
        );

        return {
          key,

          description:
            requireNonEmptyString(
              match.description,
              `matches[${index}].description`,
            ),

          fields:
            parseConfirmedFields(
              match.fields,
              key,
              index,
              originalResponse,
            ),

          confidence:
            requireConfidence(
              match.confidence,
              `matches[${index}].confidence`,
            ),
        };
      },
    );

  return {
    matches,
  };
}

function buildAllowedKeys(
  clarification:
    ConsultingClarificationRequest,
): [string, ...string[]] {
  const keys =
    clarification
      .items
      .map(
        (item) =>
          item.key,
      );

  const [
    first,
    ...rest
  ] = keys;

  if (!first) {
    throw new InvalidConsultingClarificationResponseError(
      "clarification.items",
      "At least one clarification item is required.",
    );
  }

  if (
    new Set(
      keys,
    ).size
    !== keys.length
  ) {
    throw new InvalidConsultingClarificationResponseError(
      "clarification.items",
      "Clarification item keys must be unique.",
    );
  }

  return [
    first,
    ...rest,
  ];
}

async function requestClarificationInterpretation(
  request:
    ConsultingClarificationResponseModelRequest,
): Promise<string> {
  const client =
    new OpenAI({
      apiKey:
        process.env
          .OPENAI_API_KEY,
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

          content:
            request.systemPrompt,
        },
        {
          role:
            "user",

          content:
            request.userPrompt,
        },
      ],

      text: {
        format: {
          type:
            "json_schema",

          name:
            "consulting_clarification_response",

          strict:
            true,

          schema: {
            type:
              "object",

            additionalProperties:
              false,

            properties: {
              matches: {
                type:
                  "array",

                items: {
                  type:
                    "object",

                  additionalProperties:
                    false,

                  properties: {
                    key: {
                      type:
                        "string",

                      enum:
                        request.allowedKeys,
                    },

                    description: {
                      type:
                        "string",
                    },

                    fields: {
                      type:
                        "array",

                      minItems:
                        1,

                      items: {
                        type:
                          "object",

                        additionalProperties:
                          false,

                        properties: {
                          key: {
                            type:
                              "string",
                          },

                          value: {
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
                        },

                        required: [
                          "key",
                          "value",
                          "evidence",
                        ],
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
                    "key",
                    "description",
                    "fields",
                    "confidence",
                  ],
                },
              },
            },

            required: [
              "matches",
            ],
          },
        },
      },
    });

  return response.output_text
    ?? "";
}

export async function interpretConsultingClarificationResponse(
  input:
    ConsultingClarificationResponseInterpreterInput,
  requestInterpretation:
    ConsultingClarificationResponseRequestFunction =
      requestClarificationInterpretation,
): Promise<ConsultingClarificationResponseInterpretation> {
  const originalResponse =
    requireNonEmptyString(
      input.response,
      "response",
    );

  const allowedKeys =
    buildAllowedKeys(
      input.clarification,
    );

  const clarificationItems =
    input
      .clarification
      .items
      .map(
        (item) => {
          const definition =
            getConsultingClarificationFieldDefinition(
              item.key,
            );

          return {
            key:
              item.key,

            description:
              item.description,

            question:
              item.question,

            fields:
              definition.fields,
          };
        },
      );

  const responseText =
    await requestInterpretation({
      allowedKeys,

      systemPrompt: `
당신은 천운문 v3의 추가정보 응답 추출기이다.

권한 제한

- 사용자의 답변을 제공된 확인 항목과 세부 필드에 연결하는 일만 한다.
- 사주, 운세, 성공 가능성, verdict, 조건 또는 위험을 판단하지 않는다.
- 사용자 답변에 없는 사실을 추측하거나 보완하지 않는다.
- 답변에 명시된 세부 필드만 반환한다.
- 아직 답하지 않은 필드는 만들지 않는다.
- 단순 숫자는 의미가 명확한 필드에만 연결한다.
- 어떤 항목 또는 필드의 답인지 불명확하면 matches에 넣지 않는다.
- 하나의 답변이 여러 필드에 명확히 답했다면 각각 추출할 수 있다.
- evidence에는 사용자 답변의 표현을 글자 그대로 인용한다.
- value에는 사용자가 밝힌 값을 의미가 달라지지 않게 정규화한다.
- description에는 이번 답변에서 확인된 사실만 간결하게 정리한다.
- confidence가 충분하지 않은 항목은 matches에서 제외한다.
`.trim(),

      userPrompt: [
        "대기 중인 확인 항목과 세부 필드:",
        JSON.stringify(
          clarificationItems,
          null,
          2,
        ),
        "",
        "사용자의 추가 답변:",
        originalResponse,
      ].join(
        "\n",
      ),
    });

  const parsedResponse =
    parseModelResponse(
      responseText,
      originalResponse,
      new Set(
        allowedKeys,
      ),
    );

  const confirmedFacts =
    parsedResponse
      .matches
      .filter(
        (match) =>
          match.confidence
          >= 0.85,
      );

  return {
    confirmedFacts,

    hasUnresolvedResponse:
      confirmedFacts.length
      === 0,
  };
}
