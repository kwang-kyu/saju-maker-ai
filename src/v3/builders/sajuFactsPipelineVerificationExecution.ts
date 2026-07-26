import {
    verifySajuFactsPipeline,
  } from "./sajuFactsPipelineVerification";

  const result =
    verifySajuFactsPipeline();

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
