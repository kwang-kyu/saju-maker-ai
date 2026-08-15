import {
  verifyOccupationBusinessInputResolver,
} from "./occupationBusinessInputResolverVerification";

function executeVerification():
  void {
  const result =
    verifyOccupationBusinessInputResolver();

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
      "Occupation business input resolver verification failed.",
    );
  }
}

executeVerification();
