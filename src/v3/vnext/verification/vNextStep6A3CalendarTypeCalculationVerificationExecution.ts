import {
  serializeVNextStep6A3CalendarTypeCalculationResult,
  verifyVNextStep6A3CalendarTypeCalculation,
} from "./vNextStep6A3CalendarTypeCalculationVerification.js";

const result = verifyVNextStep6A3CalendarTypeCalculation();

console.log(
  serializeVNextStep6A3CalendarTypeCalculationResult(result),
);

if (!result.passed) {
  throw new Error(
    "vNext STEP 6-3 Calendar Type Calculation verification failed.",
  );
}
