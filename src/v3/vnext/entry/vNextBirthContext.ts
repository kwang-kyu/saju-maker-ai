/**
 * vNext Birth Context — Entry Flow와 Consulting/Report Flow 사이 재사용 계약.
 */

import type {
  AnswerMode,
} from "../types/index.js";
import type {
  V3ConsultingRequest,
} from "../../consulting/v3ConsultingRequest.js";
import {
  buildVNextConsultingRequestFromBirthProfile,
} from "./vNextBirthInputAdapter.js";
import type {
  VNextBirthProfile,
} from "./vNextBirthProfile.js";

export type VNextBirthContext = {
  profile: VNextBirthProfile;
};

export function createVNextBirthContext(
  profile: VNextBirthProfile,
): VNextBirthContext {
  return {
    profile,
  };
}

export function buildVNextRequestFromBirthContext(
  context: VNextBirthContext,
  question: string,
  referenceDate: string,
  options: {
    humanLifeContextInput?: V3ConsultingRequest["humanLifeContextInput"];
    answerMode?: AnswerMode;
  } = {},
): V3ConsultingRequest & {
  answerMode: AnswerMode;
} {
  const request = buildVNextConsultingRequestFromBirthProfile(
    context.profile,
    question,
    referenceDate,
    options.humanLifeContextInput,
  );

  return {
    ...request,
    answerMode: options.answerMode ?? "question",
  };
}
