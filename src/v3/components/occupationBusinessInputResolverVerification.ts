import {
  normalizeHasActiveBusinessForRequest,
  resolveAutoHasActiveBusinessSelection,
  resolveHasActiveBusinessOnOccupationChange,
  shouldShowSeparateBusinessQuestion,
} from "./occupationBusinessInputResolver";

export type OccupationBusinessInputResolverVerificationResult = {
  checks:
    Record<
      string,
      boolean
    >;

  passed:
    boolean;
};

export function verifyOccupationBusinessInputResolver():
  OccupationBusinessInputResolverVerificationResult {
  const checks = {
    selfEmployedAutoYes:
      resolveAutoHasActiveBusinessSelection(
        "selfEmployed",
      ) === "yes",

    selfEmployedHidesBusinessQuestion:
      !shouldShowSeparateBusinessQuestion(
        "selfEmployed",
      ),

    businessOwnerAutoYes:
      resolveAutoHasActiveBusinessSelection(
        "businessOwner",
      ) === "yes",

    businessOwnerHidesBusinessQuestion:
      !shouldShowSeparateBusinessQuestion(
        "businessOwner",
      ),

    studentAutoNo:
      resolveAutoHasActiveBusinessSelection(
        "student",
      ) === "no",

    studentHidesBusinessQuestion:
      !shouldShowSeparateBusinessQuestion(
        "student",
      ),

    unemployedAutoNo:
      resolveAutoHasActiveBusinessSelection(
        "unemployed",
      ) === "no",

    unemployedHidesBusinessQuestion:
      !shouldShowSeparateBusinessQuestion(
        "unemployed",
      ),

    retiredAutoNo:
      resolveAutoHasActiveBusinessSelection(
        "retired",
      ) === "no",

    retiredHidesBusinessQuestion:
      !shouldShowSeparateBusinessQuestion(
        "retired",
      ),

    employedShowsBusinessQuestion:
      shouldShowSeparateBusinessQuestion(
        "employed",
      ),

    employedDoesNotAutoResolve:
      resolveAutoHasActiveBusinessSelection(
        "employed",
      ) === null,

    employedRequestPreservesYes:
      normalizeHasActiveBusinessForRequest(
        "employed",
        "yes",
      ) === true,

    employedRequestPreservesNo:
      normalizeHasActiveBusinessForRequest(
        "employed",
        "no",
      ) === false,

    employedRequestPreservesUnknown:
      normalizeHasActiveBusinessForRequest(
        "employed",
        "unknown",
      ) === null,

    employedToEmployedPreservesYes:
      resolveHasActiveBusinessOnOccupationChange(
        "employed",
        "employed",
        "yes",
      ) === "yes",

    employedToEmployedPreservesNo:
      resolveHasActiveBusinessOnOccupationChange(
        "employed",
        "employed",
        "no",
      ) === "no",

    employedToEmployedPreservesUnknown:
      resolveHasActiveBusinessOnOccupationChange(
        "employed",
        "employed",
        "unknown",
      ) === "unknown",

    employedYesToUnemployedBecomesNo:
      resolveHasActiveBusinessOnOccupationChange(
        "unemployed",
        "employed",
        "yes",
      ) === "no",

    businessOwnerToEmployedBecomesUnknown:
      resolveHasActiveBusinessOnOccupationChange(
        "employed",
        "businessOwner",
        "yes",
      ) === "unknown",

    unknownOccupationAutoUnknown:
      resolveAutoHasActiveBusinessSelection(
        "unknown",
      ) === "unknown",

    unknownOccupationHidesBusinessQuestion:
      !shouldShowSeparateBusinessQuestion(
        "unknown",
      ),

    unknownOccupationRequestIsUnknown:
      normalizeHasActiveBusinessForRequest(
        "unknown",
        "yes",
      ) === null,

    selfEmployedRequestIgnoresStaleNo:
      normalizeHasActiveBusinessForRequest(
        "selfEmployed",
        "no",
      ) === true,

    studentRequestIgnoresStaleYes:
      normalizeHasActiveBusinessForRequest(
        "student",
        "yes",
      ) === false,
  };

  return {
    checks,

    passed:
      Object
        .values(
          checks,
        )
        .every(
          Boolean,
        ),
  };
}
