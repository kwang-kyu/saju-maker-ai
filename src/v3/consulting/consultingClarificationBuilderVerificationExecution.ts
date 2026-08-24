import {
    verifyConsultingClarificationBuilder,
  } from "./consultingClarificationBuilderVerification.js";
  
  const verification =
    verifyConsultingClarificationBuilder();
  
  console.log(
    JSON.stringify(
      verification,
      null,
      2,
    ),
  );