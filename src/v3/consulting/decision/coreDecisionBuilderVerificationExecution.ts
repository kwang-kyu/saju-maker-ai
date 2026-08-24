import {
    verifyCoreDecisionBuilder,
  } from "./coreDecisionBuilderVerification.js";

  const result =
    verifyCoreDecisionBuilder();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (!result.passed) {
    process.exitCode = 1;
  }
