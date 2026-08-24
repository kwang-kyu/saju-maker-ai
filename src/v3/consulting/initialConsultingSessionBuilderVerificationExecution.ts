import {
    verifyInitialConsultingSessionBuilder,
  } from "./initialConsultingSessionBuilderVerification.js";

  const verification =
    verifyInitialConsultingSessionBuilder();

  console.log(
    JSON.stringify(
      {
        checks:
          verification.checks,

        session: {
          id:
            verification.session.id,

          status:
            verification.session.status,

          turnCount:
            verification
              .session
              .turns
              .length,

          lifeContextRevisionCount:
            verification
              .session
              .lifeContextHistory
              .length,

          pendingClarification:
            verification
              .session
              .pendingClarification,
        },

        passed:
          verification.passed,
      },
      null,
      2,
    ),
  );