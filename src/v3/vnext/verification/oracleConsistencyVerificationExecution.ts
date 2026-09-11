/**
 * P10-A Oracle Consistency Diagnostic execution.
 *
 * Runs verification, prints metrics / conflicts / key cases.
 * Semantic judgment lives in oracleConsistencyVerification.ts.
 * Oracle conflict does not fail Strong Anchor gates.
 */

import {
  probeOracleKeyCases,
  serializeOracleConsistencyVerificationResult,
  verifyOracleConsistency,
  type OracleConsistencyCase,
} from "./oracleConsistencyVerification.js";

function formatSnapshot(
  label: string,
  snapshot: OracleConsistencyCase["meaningExpected"],
  primaryAxis: string | null,
): string {
  if (!snapshot) {
    return `  ${label}: (none)`;
  }
  return [
    `  ${label}:`,
    `    topic=${snapshot.topic}`,
    `    intent=${snapshot.intent}`,
    `    decisionTarget=${snapshot.decisionTarget}`,
    `    timingType=${snapshot.timingType ?? "∅"}`,
    `    analysisMode=${snapshot.analysisMode ?? "∅"}`,
    `    primaryAxis=${primaryAxis ?? "∅"}`,
  ].join("\n");
}

function printCaseBrief(item: OracleConsistencyCase): void {
  console.log(
    [
      `- q="${item.question}"`,
      `  meaningCellId=${item.meaningCellId ?? "∅"}`,
      `  exhaustiveId=${item.exhaustiveId ?? "∅"}`,
      `  statuses=${item.statuses.join(",")}`,
      `  flags=${JSON.stringify(item.flags)}`,
      formatSnapshot(
        "meaningExpected",
        item.meaningExpected,
        item.meaningPrimaryAxis,
      ),
      formatSnapshot(
        "exhaustiveExpected",
        item.exhaustiveExpected,
        item.exhaustivePrimaryAxis,
      ),
      formatSnapshot(
        "readerActual",
        item.readerActual,
        item.readerPrimaryAxis,
      ),
    ].join("\n"),
  );
}

const result = verifyOracleConsistency();

console.log("=== P10-A Oracle Consistency Diagnostic ===");
console.log(
  `executionSuccess=${result.executionSuccess} passed=${result.passed}`,
);
console.log("");
console.log("[Metrics]");
console.log(JSON.stringify(result.metrics, null, 2));
console.log("");
console.log(
  `[Cross Suite Conflicts] count=${result.crossSuiteConflictCases.length}`,
);
for (const item of result.crossSuiteConflictCases.slice(0, 20)) {
  printCaseBrief(item);
}
if (result.crossSuiteConflictCases.length > 20) {
  console.log(
    `... ${result.crossSuiteConflictCases.length - 20} more conflict cases`,
  );
}

console.log("");
console.log(
  `[Reader Mismatches] count=${result.readerMismatchCases.length}`,
);
for (const item of result.readerMismatchCases.slice(0, 20)) {
  printCaseBrief(item);
}
if (result.readerMismatchCases.length > 20) {
  console.log(
    `... ${result.readerMismatchCases.length - 20} more mismatch cases`,
  );
}

console.log("");
console.log("[Key Cases A-G]");
const keyCases = probeOracleKeyCases(result);
for (const probe of keyCases) {
  console.log(
    `${probe.label}. found=${probe.found} kind=${probe.kind} query="${probe.query}" matches=${probe.matches.length}`,
  );
  for (const item of probe.matches.slice(0, 3)) {
    printCaseBrief(item);
  }
}

console.log("");
console.log("[Serialized]");
console.log(serializeOracleConsistencyVerificationResult(result));

if (!result.executionSuccess) {
  throw new Error("P10-A Oracle Consistency diagnostic execution failed.");
}
