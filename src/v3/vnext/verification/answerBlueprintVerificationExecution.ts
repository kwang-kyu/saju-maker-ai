import {
  verifyAnswerBlueprintDoesNotJudge,
  verifyAnswerBlueprints,
} from "./answerBlueprintVerification.js";

const blueprintResult = verifyAnswerBlueprints();
const noJudgement = verifyAnswerBlueprintDoesNotJudge();

console.log(
  JSON.stringify(
    {
      answerBlueprintVerification: blueprintResult,
      blueprintDoesNotJudge: noJudgement,
    },
    null,
    2,
  ),
);

const allPassed =
  blueprintResult.passed
  && noJudgement;

if (!allPassed) {
  throw new Error("Answer blueprint verification failed.");
}
