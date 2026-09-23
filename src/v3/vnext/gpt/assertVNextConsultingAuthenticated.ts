/**
 * vNext consulting server authentication helper.
 *
 * Reuses the existing Supabase Bearer consulting auth path.
 * Endpoints must check the result before calling OpenAI/Mock gateway.
 */

import type {
  ConsultingSessionOwnerId,
} from "../../consulting/consultingSessionOwnerId.js";
import {
  ConsultingSessionAuthenticationError,
  parseConsultingSessionBearerToken,
} from "../../consulting/consultingSessionOwnerResolver.js";
import type {
  ConsultingSessionAuthorizationHeader,
} from "../../consulting/consultingSessionOwnerResolver.js";
import {
  createSupabaseConsultingSessionServerClient,
} from "../../consulting/supabaseConsultingSessionRepositoryFactory.js";
import type {
  SupabaseServerEnvironment,
} from "../../consulting/supabaseConsultingSessionRepositoryFactory.js";
import {
  SupabaseConsultingSessionAuthenticationError,
  SupabaseConsultingSessionOwnerResolver,
} from "../../consulting/supabaseConsultingSessionOwnerResolver.js";

export type AssertVNextConsultingAuthenticatedInput = {
  authorizationHeader: ConsultingSessionAuthorizationHeader;
  environment?: SupabaseServerEnvironment;
};

export type VNextConsultingAuthenticatedSuccess = {
  ok: true;
  ownerId: ConsultingSessionOwnerId;
};

export type VNextConsultingAuthenticatedFailure = {
  ok: false;
  status: 401;
  error: "authenticationRequired";
};

export type AssertVNextConsultingAuthenticatedResult =
  | VNextConsultingAuthenticatedSuccess
  | VNextConsultingAuthenticatedFailure;

/**
 * Asserts that the request carries a valid Supabase consulting Bearer session.
 *
 * Returns a discriminated result so generate/stream endpoints can reject with
 * 401 before any OpenAI or Mock gateway call.
 */
export async function assertVNextConsultingAuthenticated(
  input: AssertVNextConsultingAuthenticatedInput,
): Promise<AssertVNextConsultingAuthenticatedResult> {
  try {
    const accessToken = parseConsultingSessionBearerToken(
      input.authorizationHeader,
    );

    const client = createSupabaseConsultingSessionServerClient(
      input.environment,
    );

    const ownerResolver = new SupabaseConsultingSessionOwnerResolver(
      client,
    );

    const ownerId = await ownerResolver.resolveOwnerId(
      accessToken,
    );

    return {
      ok: true,
      ownerId,
    };
  } catch (error) {
    if (
      error instanceof ConsultingSessionAuthenticationError
      || error instanceof SupabaseConsultingSessionAuthenticationError
    ) {
      return {
        ok: false,
        status: 401,
        error: "authenticationRequired",
      };
    }

    throw error;
  }
}
