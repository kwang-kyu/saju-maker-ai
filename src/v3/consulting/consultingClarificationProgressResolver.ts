import {
    getConsultingClarificationFieldDefinition,
  } from "./consultingClarificationFieldDefinitions";
  import type {
    ConsultingClarificationItem,
    ConsultingClarificationRequest,
    ConsultingConfirmedFact,
    ConsultingConfirmedField,
  } from "./consultingSession";

  export type ConsultingClarificationCompletionPathProgress = {
    key:
      string;

    label:
      string;

    missingFieldKeys:
      string[];

    completed:
      boolean;
  };

  export type ConsultingClarificationItemProgress = {
    item:
      ConsultingClarificationItem;

    confirmedFields:
      ConsultingConfirmedField[];

      missingRequiredFieldKeys:
      string[];

    completionPaths:
      ConsultingClarificationCompletionPathProgress[];

    completed:
      boolean;
  };

  export type ConsultingClarificationProgress = {
    decisionTurnId:
      string;

    items:
      [
        ConsultingClarificationItemProgress,
        ...ConsultingClarificationItemProgress[],
      ];

    completedItemKeys:
      string[];

    incompleteItemKeys:
      string[];

    completed:
      boolean;
  };

  export type ResolveConsultingClarificationProgressInput = {
    clarification:
      ConsultingClarificationRequest;

    confirmedFacts:
      readonly ConsultingConfirmedFact[];
  };

  export type RebuildPendingConsultingClarificationInput =
    ResolveConsultingClarificationProgressInput;

  function buildNonEmptyTuple<T>(
    values:
      T[],
    errorMessage:
      string,
  ): [T, ...T[]] {
    const [
      first,
      ...rest
    ] = values;

    if (
      first
      === undefined
    ) {
      throw new Error(
        errorMessage,
      );
    }

    return [
      first,
      ...rest,
    ];
  }

  function mergeConfirmedFields(
    facts:
      readonly ConsultingConfirmedFact[],
  ): ConsultingConfirmedField[] {
    const fieldsByKey =
      new Map<
        string,
        ConsultingConfirmedField
      >();

    for (
      const fact
      of facts
    ) {
      for (
        const field
        of fact.fields
      ) {
        const normalizedValue =
          field.value.trim();

        if (
          normalizedValue.length
          === 0
        ) {
          continue;
        }

        const existingField =
          fieldsByKey.get(
            field.key,
          );

        fieldsByKey.set(
          field.key,
          {
            key:
              field.key,

            value:
              normalizedValue,

            evidence:
              Array.from(
                new Set([
                  ...existingField
                    ?.evidence
                    ?? [],

                  ...field.evidence,
                ]),
              ),
          },
        );
      }
    }

    return Array.from(
      fieldsByKey.values(),
    );
  }

  /**
   * 하나의 원래 판단에서 여러 번에 걸쳐 확인된 답변을
   * 항목·필드 단위로 누적하고 완료 여부를 계산한다.
   *
   * 다른 판단에서 확인된 사실은 섞지 않으며,
   * 필수 필드가 모두 채워진 항목만 완료된 것으로 본다.
   */
  export function resolveConsultingClarificationProgress(
    input:
      ResolveConsultingClarificationProgressInput,
  ): ConsultingClarificationProgress {
    const decisionTurnId =
      input
        .clarification
        .decisionTurnId
        .trim();

    if (
      decisionTurnId.length
      === 0
    ) {
      throw new Error(
        "Clarification decisionTurnId must not be empty.",
      );
    }

    const itemProgress =
      input
        .clarification
        .items
        .map(
          (
            item,
          ): ConsultingClarificationItemProgress => {
            const matchingFacts =
              input
                .confirmedFacts
                .filter(
                  (fact) =>
                    fact.decisionTurnId
                    === decisionTurnId
                    && fact.key
                    === item.key,
                );

            const confirmedFields =
              mergeConfirmedFields(
                matchingFacts,
              );

            const confirmedFieldKeys =
              new Set(
                confirmedFields.map(
                  (field) =>
                    field.key,
                ),
              );

            const definition =
              getConsultingClarificationFieldDefinition(
                item.key,
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

            for (
              const field
              of confirmedFields
            ) {
              if (
                !allowedFieldKeys.has(
                  field.key,
                )
              ) {
                throw new Error(
                  `Confirmed clarification field is not allowed: ${item.key}.${field.key}`,
                );
              }
            }

            const completionPathDefinitions =
  definition
    .completionPaths
  ?? [
    {
      key:
        "requiredFields",

      label:
        "필수 정보",

      requiredFieldKeys:
        definition
          .fields
          .filter(
            (field) =>
              field.required,
          )
          .map(
            (field) =>
              field.key,
          ),
    },
  ];

const completionPaths =
  completionPathDefinitions
    .map(
      (path) => {
        for (
          const requiredFieldKey
          of path.requiredFieldKeys
        ) {
          if (
            !allowedFieldKeys.has(
              requiredFieldKey,
            )
          ) {
            throw new Error(
              `Clarification completion path field is not allowed: ${item.key}.${requiredFieldKey}`,
            );
          }
        }

        const missingFieldKeys =
          path
            .requiredFieldKeys
            .filter(
              (fieldKey) =>
                !confirmedFieldKeys.has(
                  fieldKey,
                ),
            );

        return {
          key:
            path.key,

          label:
            path.label,

          missingFieldKeys,

          completed:
            missingFieldKeys.length
            === 0,
        };
      },
    );

const completed =
  completionPaths
    .some(
      (path) =>
        path.completed,
    );

const missingRequiredFieldKeys =
  completed
    ? []
    : Array.from(
        new Set(
          completionPaths
            .flatMap(
              (path) =>
                path.missingFieldKeys,
            ),
        ),
      );

return {
  item,

  confirmedFields,

  missingRequiredFieldKeys,

  completionPaths,

  completed,
};


          },
        );

    const items =
      buildNonEmptyTuple(
        itemProgress,
        "Clarification progress requires at least one item.",
      );

    const completedItemKeys =
      items
        .filter(
          (item) =>
            item.completed,
        )
        .map(
          (item) =>
            item.item.key,
        );

    const incompleteItemKeys =
      items
        .filter(
          (item) =>
            !item.completed,
        )
        .map(
          (item) =>
            item.item.key,
        );

    return {
      decisionTurnId,

      items,

      completedItemKeys,

      incompleteItemKeys,

      completed:
        incompleteItemKeys.length
        === 0,
    };
  }

  /**
   * 지금까지 누적된 확인 사실을 기준으로
   * 아직 완료되지 않은 항목과 필수 필드만 다시 질문한다.
   *
   * 완료된 항목은 pending clarification에서 제거하며,
   * 모든 필수 항목이 완료되면 null을 반환한다.
   */
  export function rebuildPendingConsultingClarification(
    input:
      RebuildPendingConsultingClarificationInput,
  ): ConsultingClarificationRequest | null {
    const progress =
      resolveConsultingClarificationProgress(
        input,
      );

    if (
      progress.completed
    ) {
      return null;
    }

    const pendingItems =
      progress
        .items
        .filter(
          (itemProgress) =>
            !itemProgress.completed,
        )
        .map(
          (
            itemProgress,
          ): ConsultingClarificationItem => {
            const missingFieldKeySet =
  new Set(
    itemProgress
      .missingRequiredFieldKeys,
  );

const definition =
  getConsultingClarificationFieldDefinition(
    itemProgress
      .item
      .key,
  );

const missingFieldLabels =
  definition
    .fields
    .filter(
      (field) =>
        missingFieldKeySet.has(
          field.key,
        ),
    )
    .map(
      (field) =>
        field.label,
    );

if (
  missingFieldLabels.length
  !== itemProgress
    .missingRequiredFieldKeys
    .length
) {
  throw new Error(
    `Missing clarification field definition was not found: ${itemProgress.item.key}`,
  );
}

const question =
  definition
    .completionPaths
    ? `다음 방법 중 하나로 알려주세요: ${
        itemProgress
          .completionPaths
          .filter(
            (path) =>
              !path.completed,
          )
          .map(
            (path) => {
              const pathMissingFieldKeySet =
                new Set(
                  path
                    .missingFieldKeys,
                );

              const pathMissingLabels =
                definition
                  .fields
                  .filter(
                    (field) =>
                      pathMissingFieldKeySet
                        .has(
                          field.key,
                        ),
                  )
                  .map(
                    (field) =>
                      field.label,
                  );

              if (
                pathMissingLabels.length
                !== path
                  .missingFieldKeys
                  .length
              ) {
                throw new Error(
                  `Completion path field definition was not found: ${itemProgress.item.key}.${path.key}`,
                );
              }

              return `${path.label} (${pathMissingLabels.join(", ")})`;
            },
          )
          .join(" 또는 ")
      }`
    : `다음 정보만 추가로 알려주세요: ${missingFieldLabels.join(", ")}`;

return {
  key:
    itemProgress
      .item
      .key,

  description:
    itemProgress
      .item
      .description,

  question,
};
          },
        );

    return {
      decisionTurnId:
        progress
          .decisionTurnId,

      items:
        buildNonEmptyTuple(
          pendingItems,
          "Pending clarification requires at least one incomplete item.",
        ),
    };
  }
