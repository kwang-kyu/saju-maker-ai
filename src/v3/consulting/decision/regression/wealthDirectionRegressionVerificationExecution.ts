import {
    verifyWealthDirectionRegression,
} from "./wealthDirectionRegressionVerification";

const result =
    verifyWealthDirectionRegression();

console.log(
    JSON.stringify(
        result,
        null,
        2,
    ),
);

if (!result.passed) {
    throw new Error(
        "Wealth Direction regression verification failed.",
    );
}