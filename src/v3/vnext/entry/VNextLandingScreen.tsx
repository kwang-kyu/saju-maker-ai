import {
  VNEXT_ENTRY_CLASSES,
  VNEXT_ENTRY_COPY,
  VNEXT_ENTRY_TOPIC_TAGS,
} from "./vNextEntryContent.js";

export type VNextLandingScreenProps = {
  onStartConsulting: () => void;
};

const TOPIC_TAGS = VNEXT_ENTRY_TOPIC_TAGS;

export function VNextLandingScreen({
  onStartConsulting,
}: VNextLandingScreenProps) {
  return (
    <div className={`vnext-entry-screen ${VNEXT_ENTRY_CLASSES.landingScreen}`}>
      <div className="vnext-entry-screen-inner">
        <header className="vnext-entry-header">
          <h1 className="vnext-entry-brand">
            {VNEXT_ENTRY_COPY.brand}
          </h1>
        </header>

        <div className="vnext-entry-hero">
          <p className="vnext-entry-lead">
            {VNEXT_ENTRY_COPY.landingLeadLine1}
            <br />
            {VNEXT_ENTRY_COPY.landingLeadLine2}
            <br />
            {VNEXT_ENTRY_COPY.landingLeadLine3}
          </p>

          <p className="vnext-entry-description">
            사주를 읽고
            <br />
            현재의 흐름을 확인하고
            <br />
            당신의 질문을 함께 살펴봅니다
          </p>
        </div>

        <div className="vnext-entry-actions">
          <button
            className="vnext-entry-primary-button"
            type="button"
            onClick={onStartConsulting}
          >
            {VNEXT_ENTRY_COPY.startButton}
          </button>
        </div>

        <footer className="vnext-entry-topics">
          {TOPIC_TAGS.map((topic) => (
            <span
              key={topic}
              className="vnext-entry-topic-tag"
            >
              {topic}
            </span>
          ))}
        </footer>
      </div>
    </div>
  );
}
