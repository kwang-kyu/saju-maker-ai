import {
  verifyH1aOpenLifeDirectionParaphrase,
} from "./h1aOpenLifeDirectionParaphraseVerification.js";

const result = verifyH1aOpenLifeDirectionParaphrase();

console.log(JSON.stringify(result, null, 2));

if (!result.passed) {
  process.exitCode = 1;
}
