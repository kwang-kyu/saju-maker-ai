import {
    verifyLuckFlowFactBuilder,
  } from "./luckFlowFactBuilderVerification";

  const result =
    verifyLuckFlowFactBuilder();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (!result.passed) {
    throw new Error(
      "Luck Flow fact builder verification failed.",
    );
  }