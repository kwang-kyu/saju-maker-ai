import {
  verifyConsultingInputModeResolver,
} from "./consultingInputModeResolverVerification";

function executeVerification():
  void {
  const result =
    verifyConsultingInputModeResolver();

  console.log(
    JSON.stringify(
      result,
      null,
      2,
    ),
  );

  if (
    !result.passed
  ) {
    throw new Error(
      "Consulting input mode resolver verification failed.",
    );
  }
}

executeVerification();
