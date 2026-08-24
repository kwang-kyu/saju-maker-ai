import type {
    ConsultingSession,
  } from "./consultingSession.js";
  import type {
    ConsultingSessionAuthorizationHeader,
  } from "./consultingSessionOwnerResolver.js";
  import type {
    ConsultingSessionRepository,
  } from "./consultingSessionRepository.js";
  import {
    createAuthenticatedSupabaseConsultingSessionRepository,
  } from "./authenticatedSupabaseConsultingSessionRepositoryFactory.js";
  import type {
    CreateAuthenticatedSupabaseConsultingSessionRepositoryInput,
  } from "./authenticatedSupabaseConsultingSessionRepositoryFactory.js";
  import {
    executePersistedConsultingSessionTurn,
  } from "./persistedConsultingSessionTurnService.js";
  import type {
    ExecutePersistedConsultingSessionTurnInput,
  } from "./persistedConsultingSessionTurnService.js";
  import type {
    SupabaseServerEnvironment,
  } from "./supabaseConsultingSessionRepositoryFactory.js";
  import {
    interpretQuestionSemantics,
  } from "./question/questionSemanticInterpreter.js";
  import type {
    QuestionReaderResult,
  } from "./question/questionReader.js";

  export type ExecuteAuthenticatedPersistedConsultingSessionTurnInput =
    Omit<
      ExecutePersistedConsultingSessionTurnInput,
      "repository"
    > & {
      authorizationHeader:
        ConsultingSessionAuthorizationHeader;

      environment?:
        SupabaseServerEnvironment;
    };

  export type AuthenticatedPersistedConsultingSessionTurnDependencies = {
    createRepository(
      input:
        CreateAuthenticatedSupabaseConsultingSessionRepositoryInput,
    ): Promise<ConsultingSessionRepository>;

    interpretQuestion(
      question:
        string,
    ): Promise<QuestionReaderResult>;

    executeTurn(
      input:
        ExecutePersistedConsultingSessionTurnInput,
    ): Promise<ConsultingSession>;
  };

  const DEFAULT_DEPENDENCIES:
    AuthenticatedPersistedConsultingSessionTurnDependencies = {
      createRepository(
        input:
          CreateAuthenticatedSupabaseConsultingSessionRepositoryInput,
      ) {
        return createAuthenticatedSupabaseConsultingSessionRepository(
          input,
        );
      },

      interpretQuestion(
        question:
          string,
      ) {
        return interpretQuestionSemantics(
          question,
        );
      },

      executeTurn(
        input:
          ExecutePersistedConsultingSessionTurnInput,
      ) {
        return executePersistedConsultingSessionTurn(
          input,
        );
      },
    };

  export async function executeAuthenticatedPersistedConsultingSessionTurn(
    input:
      ExecuteAuthenticatedPersistedConsultingSessionTurnInput,
    dependencies:
      AuthenticatedPersistedConsultingSessionTurnDependencies =
        DEFAULT_DEPENDENCIES,
  ): Promise<ConsultingSession> {
    const {
      authorizationHeader,
      environment,
      ...turnInput
    } = input;

    const repository =
      await dependencies
        .createRepository({
          authorizationHeader,

          environment,
        });

    const preparationInput =
      turnInput
        .preparationInput
        .kind
      === "clarification"
      || turnInput
        .preparationInput
        .questionInterpretation
        !== undefined
        ? turnInput
            .preparationInput
        : {
            ...turnInput
              .preparationInput,

            questionInterpretation:
              await dependencies
                .interpretQuestion(
                  turnInput
                    .preparationInput
                    .question,
                ),
          };

    return dependencies
      .executeTurn({
        ...turnInput,

        preparationInput,

        repository,
      });
  }
