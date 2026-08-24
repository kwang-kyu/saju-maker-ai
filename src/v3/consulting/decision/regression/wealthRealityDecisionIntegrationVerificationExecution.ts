import {
    verifyWealthRealityDecisionIntegration,
  } from "./wealthRealityDecisionIntegrationVerification.js";

  export const wealthRealityDecisionIntegrationVerification =
    verifyWealthRealityDecisionIntegration();

  console.log(
    JSON.stringify(
      wealthRealityDecisionIntegrationVerification,
      null,
      2,
    ),
  );