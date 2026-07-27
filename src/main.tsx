import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import "./index.css";

import {
  SajuMakerV2,
} from "./v2/SajuMakerV2";

import {
  V3ConsultingApp,
} from "./v3/components/V3ConsultingApp";

function isV3ConsultingLocation():
  boolean {
  return (
    window.location.hash
      .toLowerCase()
      === "#v3"
  );
}

const application =
  isV3ConsultingLocation()
    ? <V3ConsultingApp />
    : <SajuMakerV2 />;

createRoot(
  document.getElementById(
    "root",
  )!,
).render(
  <StrictMode>
    {application}
  </StrictMode>,
);