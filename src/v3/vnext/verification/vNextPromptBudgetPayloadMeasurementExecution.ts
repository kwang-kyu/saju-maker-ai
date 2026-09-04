import {
  measurePromptBudgetPayload,
  serializePromptBudgetPayloadMeasurementResult,
} from "./vNextPromptBudgetPayloadMeasurement.js";

const result = measurePromptBudgetPayload();

console.log(serializePromptBudgetPayloadMeasurementResult(result));
