import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { SajuMakerV2 } from "./v2/SajuMakerV2";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SajuMakerV2 />
  </StrictMode>
);
