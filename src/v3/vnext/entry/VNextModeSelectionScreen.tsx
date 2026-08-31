import type {
  VNextConsultingMode,
} from "./vNextEntryTypes.js";
import {
  VNEXT_ENTRY_CLASSES,
  VNEXT_ENTRY_COPY,
  VNEXT_ENTRY_MODE_CARDS,
} from "./vNextEntryContent.js";

export type VNextModeSelectionScreenProps = {
  selectedMode: VNextConsultingMode | null;
  onSelectMode: (mode: VNextConsultingMode) => void;
  onGoBack: () => void;
};

type ModeCardConfig = {
  mode: VNextConsultingMode;
  icon: string;
  title: string;
  description: string[];
};

const MODE_CARDS: ModeCardConfig[] = [
  {
    mode: "question",
    icon: VNEXT_ENTRY_MODE_CARDS[0].icon,
    title: VNEXT_ENTRY_COPY.questionModeTitle,
    description: [
      "지금 궁금한 내용을",
      "자유롭게 질문해보세요.",
      "",
      "질문하고 답변을 받은 뒤",
      "계속 대화할 수 있습니다.",
    ],
  },
  {
    mode: "report",
    icon: VNEXT_ENTRY_MODE_CARDS[1].icon,
    title: VNEXT_ENTRY_COPY.reportModeTitle,
    description: [
      "나의 현재 흐름을",
      "체계적으로 확인합니다.",
      "",
      "사람의 구조",
      "현재 시기",
      "변화와 방향",
    ],
  },
];

export function VNextModeSelectionScreen({
  selectedMode,
  onSelectMode,
  onGoBack,
}: VNextModeSelectionScreenProps) {
  return (
    <div className={`vnext-entry-screen ${VNEXT_ENTRY_CLASSES.modeSelectionScreen}`}>
      <div className="vnext-entry-screen-inner">
        <header className="vnext-entry-header">
          <h2 className="vnext-entry-section-title">
            {VNEXT_ENTRY_COPY.modeSelectionTitleLine1}
            <br />
            {VNEXT_ENTRY_COPY.modeSelectionTitleLine2}
          </h2>
        </header>

        <div className="vnext-entry-mode-cards">
          {MODE_CARDS.map((card) => {
            const isSelected = selectedMode === card.mode;

            return (
              <button
                key={card.mode}
                className={[
                  VNEXT_ENTRY_CLASSES.modeCard,
                  isSelected
                    ? VNEXT_ENTRY_CLASSES.modeCardSelected
                    : "",
                ].filter(Boolean).join(" ")}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectMode(card.mode)}
              >
                <span
                  className="vnext-entry-mode-card-icon"
                  aria-hidden="true"
                >
                  {card.icon}
                </span>

                <span className="vnext-entry-mode-card-title">
                  {card.title}
                </span>

                <span className="vnext-entry-mode-card-description">
                  {card.description.map((line, index) => (
                    line.length === 0 ? (
                      <br key={`${card.mode}-break-${index}`} />
                    ) : (
                      <span key={`${card.mode}-${line}`}>
                        {line}
                        <br />
                      </span>
                    )
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        <div className="vnext-entry-actions">
          <button
            className="vnext-entry-secondary-button"
            type="button"
            onClick={onGoBack}
          >
            {VNEXT_ENTRY_COPY.goBackButton}
          </button>
        </div>
      </div>
    </div>
  );
}
