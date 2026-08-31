import {
  verifyChangeSignalAggregation,
  verifyChangeSignals,
  verifyRequiredSignalsFiltering,
} from "./changeSignalVerification.js";

const scenarioResult = verifyChangeSignals();
const aggregationResult = verifyChangeSignalAggregation();
const filteringResult = verifyRequiredSignalsFiltering();

console.log(
  JSON.stringify(
    {
      changeSignalVerification: scenarioResult,
      aggregationVerification: aggregationResult,
      requiredSignalsFiltering: filteringResult,
    },
    null,
    2,
  ),
);

const allPassed =
  scenarioResult.passed
  && aggregationResult
  && filteringResult;

if (!allPassed) {
  throw new Error("Change signal verification failed.");
}
