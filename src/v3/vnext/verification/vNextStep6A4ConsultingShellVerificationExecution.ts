import {
  serializeVNextStep6A4ConsultingShellResult,
  verifyVNextStep6A4ConsultingShell,
} from "./vNextStep6A4ConsultingShellVerification.js";

const result = await verifyVNextStep6A4ConsultingShell();

console.log(serializeVNextStep6A4ConsultingShellResult(result));

process.exit(result.passed ? 0 : 1);
