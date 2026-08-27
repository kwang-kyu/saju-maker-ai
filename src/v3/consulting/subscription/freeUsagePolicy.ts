import type {
    SubscriptionAccessState,
  } from "./subscriptionTypes.js";
  
  export type FreeUsagePolicy = {
    maximumFreeConsultations:
      number | null;
  
    allowInitialConsultation:
      boolean;
  
    requireSubscriptionAfterLimit:
      boolean;
  };
  
  export type FreeUsageDecision = {
    accessState:
      SubscriptionAccessState;
  
    canStartConsultation:
      boolean;
  
    remainingFreeConsultations:
      number | null;
  };
  
  export const FREE_USAGE_POLICY:
    FreeUsagePolicy = {
      maximumFreeConsultations:
        null,
  
      allowInitialConsultation:
        true,
  
      requireSubscriptionAfterLimit:
        false,
    };
  
  export function evaluateFreeUsage(
    usedConsultationCount:
      number,
  ): FreeUsageDecision {
    const normalizedUsedCount =
      Math.max(
        0,
        usedConsultationCount,
      );
  
    if (
      FREE_USAGE_POLICY
        .maximumFreeConsultations
      === null
    ) {
      return {
        accessState:
          "allowed",
  
        canStartConsultation:
          true,
  
        remainingFreeConsultations:
          null,
      };
    }
  
    const remainingFreeConsultations =
      Math.max(
        0,
        FREE_USAGE_POLICY
          .maximumFreeConsultations -
          normalizedUsedCount,
      );
  
    if (
      remainingFreeConsultations
      > 0
    ) {
      return {
        accessState:
          "trialAvailable",
  
        canStartConsultation:
          true,
  
        remainingFreeConsultations,
      };
    }
  
    return {
      accessState:
        "subscriptionRequired",
  
      canStartConsultation:
        false,
  
      remainingFreeConsultations:
        0,
    };
  }