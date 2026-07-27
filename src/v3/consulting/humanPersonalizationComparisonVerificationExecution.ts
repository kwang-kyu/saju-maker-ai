import {
    verifyHumanPersonalizationComparison,
  } from "./humanPersonalizationComparisonVerification";

  async function execute():
    Promise<void> {
    const result =
      await verifyHumanPersonalizationComparison();

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
  }

  void execute();