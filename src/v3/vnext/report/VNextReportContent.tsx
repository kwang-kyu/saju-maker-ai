import {
  useState,
  type ReactNode,
} from "react";

import type {
  HumanDestinyContext,
} from "../../types/humanDestinyContext.js";
import type {
  VNextBirthProfile,
} from "../entry/vNextBirthProfile.js";
import type {
  LuckFlowSnapshot,
  TimeState,
} from "../types/timeState.js";
import {
  normalizeConsultingDisplayText,
} from "../ui/consultingDisplayText.js";
import {
  VNEXT_REPORT_COPY,
  VNEXT_REPORT_SECTION_LABELS,
} from "./vNextReportCopy.js";
import {
  canDownloadVNextReportDocx,
  downloadVNextReportDocx,
  VNEXT_REPORT_DOCX_ERROR_MESSAGE,
} from "./vNextReportDocx.js";
import type {
  ProductReportMenu,
} from "./vNextReportMenu.js";
import {
  resolveVNextReportUxActions,
  type VNextReportSessionState,
} from "./vNextReportState.js";

const VNEXT_PRODUCT_REPORT_MENU_LABELS: Record<
  ProductReportMenu,
  string
> = {
  chongun: "총운",
  year: "올해의 운세",
  today: "오늘의 운세",
  todayLove: "오늘의 연애운",
  todayMoney: "오늘의 재물운",
};

export type VNextReportContentProps = {
  birthProfile: VNextBirthProfile;
  state: VNextReportSessionState;
  isBusy: boolean;
  isStreaming: boolean;
  onRetry?: () => void;
  onContinueToConsulting?: () => void;
};

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function nonEmptyStrings(
  values: readonly string[] | null | undefined,
): string[] {
  if (!values || values.length === 0) {
    return [];
  }

  return values.filter((value) => hasText(value));
}

function collectExactTexts(
  ...values: Array<string | readonly string[] | null | undefined>
): Set<string> {
  const texts = new Set<string>();

  for (const value of values) {
    if (typeof value === "string") {
      if (hasText(value)) {
        texts.add(value.trim());
      }
      continue;
    }

    for (const item of nonEmptyStrings(value)) {
      texts.add(item.trim());
    }
  }

  return texts;
}

function renderTextList(items: readonly string[]): ReactNode {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="vnext-report-chongun-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function renderChongunBlock(
  title: string,
  body: ReactNode,
  reactKey?: string,
): ReactNode {
  if (!body) {
    return null;
  }

  return (
    <section
      key={reactKey ?? title}
      className="vnext-report-chongun-block"
    >
      <h3 className="vnext-report-chongun-heading">{title}</h3>
      <div className="vnext-report-chongun-body">
        {body}
      </div>
    </section>
  );
}

function renderStructureItem(
  key: string,
  item: {
    title?: string | null;
    summary?: string | null;
  } | null | undefined,
): ReactNode {
  if (!item) {
    return null;
  }

  const title = hasText(item.title) ? item.title.trim() : null;
  const summary = hasText(item.summary) ? item.summary.trim() : null;

  if (!title && !summary) {
    return null;
  }

  return (
    <div
      key={key}
      className="vnext-report-chongun-structure-item"
    >
      {title ? (
        <p className="vnext-report-chongun-structure-title">{title}</p>
      ) : null}
      {summary ? (
        <p className="vnext-report-chongun-structure-summary">{summary}</p>
      ) : null}
    </div>
  );
}

function renderDaeunFacts(
  facts: LuckFlowSnapshot["facts"] | null | undefined,
): ReactNode {
  if (!facts) {
    return null;
  }

  const entries = Object.entries(facts).filter(([, value]) => {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === "string") {
      return hasText(value);
    }

    return true;
  });

  if (entries.length === 0) {
    return null;
  }

  return (
    <ul className="vnext-report-chongun-list">
      {entries.map(([key, value]) => (
        <li key={key}>
          {key}: {String(value)}
        </li>
      ))}
    </ul>
  );
}

function renderChongunContent(
  humanContext: HumanDestinyContext | null,
  timeState: TimeState | null,
): ReactNode {
  const identity = humanContext?.identity ?? null;
  const humanSummary = identity?.humanSummary ?? null;
  const explanation = identity?.explanation ?? null;

  const lifeDriver = explanation?.lifeDriver ?? null;
  const survivalPrimary = explanation?.survivalStyle?.primary ?? null;
  const repeatedPrimary = explanation?.repeatedPattern?.primary ?? null;
  const currentPhase = humanContext?.currentPhase ?? null;
  const daeun = timeState?.daeun ?? null;

  const structureTexts = collectExactTexts(
    lifeDriver?.title,
    lifeDriver?.summary,
    lifeDriver?.strengths,
    lifeDriver?.cautions,
    survivalPrimary?.title,
    survivalPrimary?.summary,
    survivalPrimary?.crisisBehaviors,
    survivalPrimary?.recoveryMethods,
    survivalPrimary?.prohibitedActions,
  );

  const coreText = hasText(humanSummary?.coreIdentity)
    ? humanSummary.coreIdentity.trim()
    : hasText(humanSummary?.summary)
      ? humanSummary.summary.trim()
      : null;

  const strengths = nonEmptyStrings(humanSummary?.strengths);
  const cautions = nonEmptyStrings(humanSummary?.cautions);
  const cautionSet = new Set(cautions.map((item) => item.trim()));

  const repeatedBehaviors = nonEmptyStrings(
    repeatedPrimary?.repeatedBehaviors,
  );
  const patternRisks = nonEmptyStrings(repeatedPrimary?.risks)
    .filter((risk) => {
      const normalized = risk.trim();
      return !structureTexts.has(normalized) && !cautionSet.has(normalized);
    })
    .slice(0, 3);

  const structureItems = [
    renderStructureItem("lifeDriver", lifeDriver),
    renderStructureItem("survivalStyle.primary", survivalPrimary),
    renderStructureItem("repeatedPattern.primary", repeatedPrimary),
  ].filter(Boolean);

  const phaseFocusAreas = nonEmptyStrings(currentPhase?.focusAreas);
  const phaseAvoidAreas = nonEmptyStrings(currentPhase?.avoidAreas);
  const hasCurrentPhase = Boolean(
    currentPhase
    && (
      hasText(currentPhase.phase)
      || hasText(currentPhase.title)
      || hasText(currentPhase.description)
      || phaseFocusAreas.length > 0
      || phaseAvoidAreas.length > 0
    ),
  );

  const hasDaeun = Boolean(
    daeun
    && (
      hasText(daeun.label)
      || hasText(daeun.summary)
      || Object.keys(daeun.facts ?? {}).length > 0
    ),
  );

  const careerSummary = hasText(explanation?.career?.summary)
    ? explanation.career.summary.trim()
    : null;
  const moneySummary = hasText(explanation?.money?.summary)
    ? explanation.money.summary.trim()
    : null;
  const relationshipSummary = hasText(explanation?.relationship?.summary)
    ? explanation.relationship.summary.trim()
    : null;

  const domainItems = [
    careerSummary
      ? {
        key: "career",
        title: hasText(explanation?.career?.title)
          ? explanation.career.title.trim()
          : null,
        summary: careerSummary,
      }
      : null,
    moneySummary
      ? {
        key: "money",
        title: hasText(explanation?.money?.title)
          ? explanation.money.title.trim()
          : null,
        summary: moneySummary,
      }
      : null,
    relationshipSummary
      ? {
        key: "relationship",
        title: hasText(explanation?.relationship?.title)
          ? explanation.relationship.title.trim()
          : null,
        summary: relationshipSummary,
      }
      : null,
  ].filter((item): item is {
    key: string;
    title: string | null;
    summary: string;
  } => item !== null);

  const blocks = [
    renderChongunBlock(
      "총운 핵심",
      coreText ? <p>{coreText}</p> : null,
    ),
    renderChongunBlock(
      "나의 기본 구조",
      structureItems.length > 0 ? structureItems : null,
    ),
    renderChongunBlock(
      "강점과 활용",
      renderTextList(strengths),
    ),
    renderChongunBlock(
      "반복되는 패턴",
      repeatedBehaviors.length > 0 || patternRisks.length > 0
        ? (
          <>
            {renderTextList(repeatedBehaviors)}
            {patternRisks.length > 0 ? renderTextList(patternRisks) : null}
          </>
        )
        : null,
    ),
    renderChongunBlock(
      "주의할 점",
      renderTextList(cautions),
    ),
    renderChongunBlock(
      "현재 인생 국면",
      hasCurrentPhase && currentPhase
        ? (
          <>
            {hasText(currentPhase.phase) ? (
              <p>{currentPhase.phase}</p>
            ) : null}
            {hasText(currentPhase.title) ? (
              <p className="vnext-report-chongun-structure-title">
                {currentPhase.title.trim()}
              </p>
            ) : null}
            {hasText(currentPhase.description) ? (
              <p>{currentPhase.description.trim()}</p>
            ) : null}
            {phaseFocusAreas.length > 0 ? renderTextList(phaseFocusAreas) : null}
            {phaseAvoidAreas.length > 0 ? renderTextList(phaseAvoidAreas) : null}
          </>
        )
        : null,
    ),
    renderChongunBlock(
      "현재 대운",
      hasDaeun && daeun
        ? (
          <>
            {hasText(daeun.label) ? (
              <p className="vnext-report-chongun-structure-title">
                {daeun.label.trim()}
              </p>
            ) : null}
            {hasText(daeun.summary) ? (
              <p>{daeun.summary.trim()}</p>
            ) : null}
            {renderDaeunFacts(daeun.facts)}
          </>
        )
        : null,
    ),
    renderChongunBlock(
      "직업·재물·관계 핵심",
      domainItems.length > 0
        ? domainItems.map((item) => (
          <div
            key={item.key}
            className="vnext-report-chongun-structure-item"
          >
            {item.title ? (
              <p className="vnext-report-chongun-structure-title">
                {item.title}
              </p>
            ) : null}
            <p>{item.summary}</p>
          </div>
        ))
        : null,
    ),
  ].filter(Boolean);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="vnext-report-chongun">
      {blocks}
    </div>
  );
}

function resolveDisplayText(
  state: VNextReportSessionState,
  isStreaming: boolean,
): string | null {
  if (isStreaming && state.streamingText) {
    return normalizeConsultingDisplayText(state.streamingText);
  }

  if (state.response?.text) {
    return normalizeConsultingDisplayText(state.response.text);
  }

  return null;
}

function renderYearContent(
  periodLuckFlowFacts: VNextReportSessionState["periodLuckFlowFacts"],
): ReactNode {
  const targetSeun = periodLuckFlowFacts?.year?.targetSeun ?? null;
  const yearSegments = periodLuckFlowFacts?.year?.yearSegments ?? [];

  const seunYear =
    targetSeun
    && typeof targetSeun.year === "number"
    && Number.isFinite(targetSeun.year)
      ? targetSeun.year
      : null;
  const seunAge =
    targetSeun
    && typeof targetSeun.age === "number"
    && Number.isFinite(targetSeun.age)
      ? targetSeun.age
      : null;

  const seunLines = targetSeun
    ? nonEmptyStrings([
      seunAge !== null ? `나이: ${seunAge}` : "",
      hasText(targetSeun.ganZhi) ? `간지: ${targetSeun.ganZhi.trim()}` : "",
      hasText(targetSeun.tenGod) ? `십신: ${targetSeun.tenGod.trim()}` : "",
      hasText(targetSeun.element) ? `오행: ${targetSeun.element.trim()}` : "",
    ])
    : [];

  const seunBlock = renderChongunBlock(
    seunYear !== null ? `${seunYear}년 세운` : "올해 세운",
    renderTextList(seunLines),
    "targetSeun",
  );

  const segmentBlocks = yearSegments.map((segment, index) => {
    const lines = nonEmptyStrings([
      hasText(segment.startDate) && hasText(segment.endDate)
        ? `기간: ${segment.startDate.trim()} ~ ${segment.endDate.trim()}`
        : "",
      hasText(segment.ganZhi) ? `간지: ${segment.ganZhi.trim()}` : "",
      hasText(segment.tenGod) ? `십신: ${segment.tenGod.trim()}` : "",
      hasText(segment.element) ? `오행: ${segment.element.trim()}` : "",
    ]);

    return renderChongunBlock(
      hasText(segment.ganZhi)
        ? segment.ganZhi.trim()
        : `구간 ${index + 1}`,
      renderTextList(lines),
      hasText(segment.startDate)
        ? segment.startDate.trim()
        : undefined,
    );
  }).filter(Boolean);

  const blocks = [seunBlock, ...segmentBlocks].filter(Boolean);

  if (blocks.length === 0) {
    return (
      <p className="vnext-report-content-empty">
        올해의 운세 정보를 준비하지 못했습니다.
      </p>
    );
  }

  return (
    <div className="vnext-report-chongun">
      {blocks}
    </div>
  );
}

function renderTodayContent(
  periodLuckFlowFacts: VNextReportSessionState["periodLuckFlowFacts"],
): ReactNode {
  const targetIlun = periodLuckFlowFacts?.day?.targetIlun ?? null;

  if (!targetIlun) {
    return (
      <p className="vnext-report-content-empty">
        오늘의 운세 정보를 준비하지 못했습니다.
      </p>
    );
  }

  const lines = nonEmptyStrings([
    hasText(targetIlun.targetDate)
      ? `날짜: ${targetIlun.targetDate.trim()}`
      : "",
    hasText(targetIlun.ganZhi) ? `간지: ${targetIlun.ganZhi.trim()}` : "",
    hasText(targetIlun.tenGod) ? `십신: ${targetIlun.tenGod.trim()}` : "",
    hasText(targetIlun.element) ? `오행: ${targetIlun.element.trim()}` : "",
  ]);

  const body = renderChongunBlock(
    "오늘의 운세",
    renderTextList(lines),
  );

  if (!body) {
    return (
      <p className="vnext-report-content-empty">
        오늘의 운세 정보를 준비하지 못했습니다.
      </p>
    );
  }

  return (
    <div className="vnext-report-chongun">
      {body}
    </div>
  );
}

function renderTodayLoveContent(
  periodLuckFlowFacts: VNextReportSessionState["periodLuckFlowFacts"],
  humanContext: HumanDestinyContext | null,
): ReactNode {
  const targetIlun = periodLuckFlowFacts?.day?.targetIlun ?? null;
  const relationship =
    humanContext?.identity?.explanation?.relationship ?? null;

  const todayLines = targetIlun
    ? nonEmptyStrings([
      hasText(targetIlun.targetDate)
        ? `날짜: ${targetIlun.targetDate.trim()}`
        : "",
      hasText(targetIlun.ganZhi) ? `간지: ${targetIlun.ganZhi.trim()}` : "",
      hasText(targetIlun.tenGod) ? `십신: ${targetIlun.tenGod.trim()}` : "",
      hasText(targetIlun.element) ? `오행: ${targetIlun.element.trim()}` : "",
    ])
    : [];

  const todayFlowBlock = renderChongunBlock(
    "오늘의 연애 흐름",
    renderTextList(todayLines),
  );

  const relationshipTitle = hasText(relationship?.title)
    ? relationship.title.trim()
    : null;
  const relationshipSummary = hasText(relationship?.summary)
    ? relationship.summary.trim()
    : null;
  const relationshipStrengths = nonEmptyStrings(relationship?.strengths);
  const relationshipCautions = nonEmptyStrings(
    relationship?.cautionConditions,
  );

  const hasRelationshipBody = Boolean(
    relationshipTitle
    || relationshipSummary
    || relationshipStrengths.length > 0
    || relationshipCautions.length > 0,
  );

  const relationshipBlock = renderChongunBlock(
    "관계 성향 참고",
    hasRelationshipBody
      ? (
        <>
          {relationshipTitle ? (
            <p className="vnext-report-chongun-structure-title">
              {relationshipTitle}
            </p>
          ) : null}
          {relationshipSummary ? <p>{relationshipSummary}</p> : null}
          {relationshipStrengths.length > 0
            ? renderTextList(relationshipStrengths)
            : null}
          {relationshipCautions.length > 0
            ? renderTextList(relationshipCautions)
            : null}
        </>
      )
      : null,
  );

  const blocks = [todayFlowBlock, relationshipBlock].filter(Boolean);

  if (blocks.length === 0) {
    return (
      <p className="vnext-report-content-empty">
        오늘의 연애운 정보를 준비하지 못했습니다.
      </p>
    );
  }

  return (
    <div className="vnext-report-chongun">
      {blocks}
    </div>
  );
}

function renderTodayMoneyContent(
  periodLuckFlowFacts: VNextReportSessionState["periodLuckFlowFacts"],
  humanContext: HumanDestinyContext | null,
): ReactNode {
  const targetIlun = periodLuckFlowFacts?.day?.targetIlun ?? null;
  const money = humanContext?.identity?.explanation?.money ?? null;

  const todayLines = targetIlun
    ? nonEmptyStrings([
      hasText(targetIlun.targetDate)
        ? `날짜: ${targetIlun.targetDate.trim()}`
        : "",
      hasText(targetIlun.ganZhi) ? `간지: ${targetIlun.ganZhi.trim()}` : "",
      hasText(targetIlun.tenGod) ? `십신: ${targetIlun.tenGod.trim()}` : "",
      hasText(targetIlun.element) ? `오행: ${targetIlun.element.trim()}` : "",
    ])
    : [];

  const todayFlowBlock = renderChongunBlock(
    "오늘의 재물 흐름",
    renderTextList(todayLines),
  );

  const moneyTitle = hasText(money?.title) ? money.title.trim() : null;
  const moneySummary = hasText(money?.summary) ? money.summary.trim() : null;
  const moneyStrengths = nonEmptyStrings(money?.strengths);
  const moneyCautions = nonEmptyStrings(money?.cautionConditions);

  const hasMoneyBody = Boolean(
    moneyTitle
    || moneySummary
    || moneyStrengths.length > 0
    || moneyCautions.length > 0,
  );

  const moneyBlock = renderChongunBlock(
    "재물 성향 참고",
    hasMoneyBody
      ? (
        <>
          {moneyTitle ? (
            <p className="vnext-report-chongun-structure-title">
              {moneyTitle}
            </p>
          ) : null}
          {moneySummary ? <p>{moneySummary}</p> : null}
          {moneyStrengths.length > 0
            ? renderTextList(moneyStrengths)
            : null}
          {moneyCautions.length > 0
            ? renderTextList(moneyCautions)
            : null}
        </>
      )
      : null,
  );

  const blocks = [todayFlowBlock, moneyBlock].filter(Boolean);

  if (blocks.length === 0) {
    return (
      <p className="vnext-report-content-empty">
        오늘의 재물운 정보를 준비하지 못했습니다.
      </p>
    );
  }

  return (
    <div className="vnext-report-chongun">
      {blocks}
    </div>
  );
}

function resolveCompletedSectionBody(
  activeSection: VNextReportSessionState["activeSection"],
  humanContext: HumanDestinyContext | null,
  timeState: TimeState | null,
  periodLuckFlowFacts: VNextReportSessionState["periodLuckFlowFacts"],
): ReactNode {
  if (activeSection === "year") {
    return renderYearContent(periodLuckFlowFacts);
  }

  if (activeSection === "today") {
    return renderTodayContent(periodLuckFlowFacts);
  }

  if (activeSection === "todayLove") {
    return renderTodayLoveContent(periodLuckFlowFacts, humanContext);
  }

  if (activeSection === "todayMoney") {
    return renderTodayMoneyContent(periodLuckFlowFacts, humanContext);
  }

  // chongun: preserve existing rendering
  return renderChongunContent(humanContext, timeState);
}

function renderCompletedResponse(
  activeSection: VNextReportSessionState["activeSection"],
  humanContext: HumanDestinyContext | null,
  timeState: TimeState | null,
  periodLuckFlowFacts: VNextReportSessionState["periodLuckFlowFacts"],
) {
  return (
    <article className="vnext-report-content-body">
      <p className="vnext-report-content-section-kicker">
        {VNEXT_PRODUCT_REPORT_MENU_LABELS[activeSection]}
      </p>

      <div className="vnext-report-content-text">
        {resolveCompletedSectionBody(
          activeSection,
          humanContext,
          timeState,
          periodLuckFlowFacts,
        )}
      </div>
    </article>
  );
}

export function VNextReportContent({
  birthProfile,
  state,
  isBusy,
  isStreaming,
  onRetry,
  onContinueToConsulting,
}: VNextReportContentProps) {
  const [docxPreparing, setDocxPreparing] = useState(false);
  const [docxErrorMessage, setDocxErrorMessage] = useState<string | null>(
    null,
  );

  const uxActions = resolveVNextReportUxActions(state.phase);
  const displayText = resolveDisplayText(state, isStreaming);
  const showEmpty = !displayText
    && !isBusy
    && !isStreaming
    && !state.errorMessage
    && state.phase === "idle";

  const responseText = state.response?.text ?? "";
  const canDownload = uxActions.canDownloadDocx
    && canDownloadVNextReportDocx(
      state.phase,
      responseText,
    )
    && !state.errorMessage;

  async function handleDocxDownload(): Promise<void> {
    if (!canDownload || docxPreparing || !state.response) {
      return;
    }

    setDocxPreparing(true);
    setDocxErrorMessage(null);

    try {
      const sectionLabels = state.sections.map(
        (section) => VNEXT_REPORT_SECTION_LABELS[section],
      );

      await downloadVNextReportDocx({
        displayName: birthProfile.displayName,
        birthProfile,
        responseText: state.response.text,
        sectionLabels,
      });
    } catch {
      setDocxErrorMessage(VNEXT_REPORT_DOCX_ERROR_MESSAGE);
    } finally {
      setDocxPreparing(false);
    }
  }

  if (state.errorMessage || state.phase === "error") {
    return (
      <section
        className="vnext-report-content"
        aria-label="리포트 내용"
      >
        <p
          className="vnext-report-error"
          role="alert"
        >
          {state.errorMessage ?? VNEXT_REPORT_COPY.errorFallback}
        </p>

        {uxActions.canRetry && onRetry ? (
          <div className="vnext-report-flow-actions">
            <button
              type="button"
              className="vnext-report-auth-button"
              onClick={onRetry}
              disabled={isBusy || isStreaming}
            >
              {VNEXT_REPORT_COPY.retryButton}
            </button>
          </div>
        ) : null}
      </section>
    );
  }

  if (isStreaming && displayText) {
    return (
      <section
        className="vnext-report-content"
        aria-label="리포트 내용"
        aria-busy="true"
      >
        <div className="vnext-report-content-text vnext-report-content-text--streaming">
          <p>
            {displayText}
            <span
              className="vnext-report-stream-cursor"
              aria-hidden="true"
            />
          </p>
        </div>
      </section>
    );
  }

  if (state.response && state.phase === "completed") {
    return (
      <section
        className="vnext-report-content"
        aria-label="리포트 내용"
      >
        {renderCompletedResponse(
          state.activeSection,
          state.humanContext,
          state.timeState,
          state.periodLuckFlowFacts,
        )}

        <div className="vnext-report-flow-actions">
          {canDownload ? (
            <button
              type="button"
              className="vnext-report-docx-button"
              onClick={() => {
                void handleDocxDownload();
              }}
              disabled={docxPreparing}
            >
              {docxPreparing
                ? "문서 준비 중..."
                : "DOCX 다운로드"}
            </button>
          ) : null}

          {uxActions.canContinueToConsulting && onContinueToConsulting ? (
            <button
              type="button"
              className="vnext-report-flow-button"
              onClick={onContinueToConsulting}
            >
              {VNEXT_REPORT_COPY.continueToConsultingButton}
            </button>
          ) : null}

          {docxErrorMessage ? (
            <p
              className="vnext-report-docx-error"
              role="alert"
            >
              {docxErrorMessage}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  if (showEmpty) {
    return (
      <section
        className="vnext-report-content"
        aria-label="리포트 내용"
      >
        <p className="vnext-report-content-empty">
          {VNEXT_REPORT_COPY.emptyContent}
        </p>
      </section>
    );
  }

  return (
    <section
      className="vnext-report-content"
      aria-label="리포트 내용"
      aria-busy={isBusy ? "true" : undefined}
    />
  );
}
