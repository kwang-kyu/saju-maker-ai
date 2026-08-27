import type {
    SubscriptionAccessState,
  } from "./subscriptionTypes.js";
  
  export type FreeUsagePolicy = {
    maximumFreeConsultations: number;
    allowInitialConsultation: boolean;
    requireSubscriptionAfterLimit: boolean;
  };
  
  export type FreeUsageDecision = {
    accessState: SubscriptionAccessState;
    canStartConsultation: boolean;
    remainingFreeConsultations: number;
  };
  
  export const FREE_USAGE_POLICY: FreeUsagePolicy = {
    maximumFreeConsultations: 1,
    allowInitialConsultation: true,
    requireSubscriptionAfterLimit: true,
  };
  
  export function evaluateFreeUsage(
    usedConsultationCount: number,
  ): FreeUsageDecision {
    const normalizedUsedCount =
      Math.max(0, usedConsultationCount);
  
    const remainingFreeConsultations =
      Math.max(
        0,
        FREE_USAGE_POLICY.maximumFreeConsultations -
          normalizedUsedCount,
      );
  
    if (remainingFreeConsultations > 0) {
      return {
        accessState: "trialAvailable",
        canStartConsultation: true,
        remainingFreeConsultations,
      };
    }
  
    return {
      accessState: "subscriptionRequired",
      canStartConsultation: false,
      remainingFreeConsultations: 0,
    };
  }