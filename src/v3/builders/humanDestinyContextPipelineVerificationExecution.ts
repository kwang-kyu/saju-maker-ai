import {
    verifyHumanDestinyContextPipeline,
  } from "./humanDestinyContextPipelineVerification";

  const result =
    verifyHumanDestinyContextPipeline();

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