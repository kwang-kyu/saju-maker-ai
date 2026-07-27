import {
    verifyConsultingClarificationBuilder,
  } from "./consultingClarificationBuilderVerification";
  
  const verification =
    verifyConsultingClarificationBuilder();
  
  console.log(
    JSON.stringify(
      verification,
      null,
      2,
    ),
  );