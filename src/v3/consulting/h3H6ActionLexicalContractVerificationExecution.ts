import {
  verifyH3H6ActionLexicalContract,
} from "./h3H6ActionLexicalContractVerification.js";

const result = verifyH3H6ActionLexicalContract();

console.log(JSON.stringify(result, null, 2));

if (!result.passed) {
  process.exitCode = 1;
}
