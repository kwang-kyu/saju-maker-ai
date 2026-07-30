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

const V3_CONSULTING_HASH =
  "#v3";

const V3_AUTH_CALLBACK_PATH =
  "/v3-auth-callback";

function normalizePathname(
  pathname:
    string,
): string {
  const normalizedPathname =
    pathname
      .trim()
      .toLowerCase()
      .replace(
        /\/+$/,
        "",
      );

  return normalizedPathname
    || "/";
}

function isV3ConsultingLocation():
  boolean {
  const normalizedHash =
    window.location.hash
      .toLowerCase();

  const normalizedPathname =
    normalizePathname(
      window.location.pathname,
    );

  return (
    normalizedHash
      === V3_CONSULTING_HASH
    || normalizedPathname
      === V3_AUTH_CALLBACK_PATH
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