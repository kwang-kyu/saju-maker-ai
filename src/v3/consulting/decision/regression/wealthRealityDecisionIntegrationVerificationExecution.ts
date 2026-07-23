import {
    verifyWealthRealityDecisionIntegration,
  } from "./wealthRealityDecisionIntegrationVerification";

  export const wealthRealityDecisionIntegrationVerification =
    verifyWealthRealityDecisionIntegration();

  console.log(
    JSON.stringify(
      wealthRealityDecisionIntegrationVerification,
      null,
      2,
    ),
  );