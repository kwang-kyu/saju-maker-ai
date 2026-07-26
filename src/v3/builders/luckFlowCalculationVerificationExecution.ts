import { verifyLuckFlowCalculation } from "./luckFlowCalculationVerification";

const result =
  verifyLuckFlowCalculation();

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (!result.passed) {
  throw new Error(
    "Luck Flow calculation verification failed.",
  );
}