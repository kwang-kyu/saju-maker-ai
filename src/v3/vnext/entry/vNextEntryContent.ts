/**
 * vNext Entry Flow UI 콘텐츠 및 클래스 계약.
 *
 * SSR verification 대신 정적 콘텐츠/구조 계약을 검증한다.
 */

export const VNEXT_ENTRY_COPY = {
  brand: "천운문",
  landingLeadLine1: "지금 당신에게 필요한 것은",
  landingLeadLine2: "정해진 운세가 아니라",
  landingLeadLine3: "지금의 질문에 대한 답입니다",
  startButton: "상담 시작하기",
  modeSelectionTitleLine1: "어떤 방식으로",
  modeSelectionTitleLine2: "확인해볼까요?",
  questionModeTitle: "질문 상담",
  reportModeTitle: "분석 리포트",
  goBackButton: "이전으로",
  birthInputTitle: "기본 정보를 알려주세요",
  birthInputDescriptionLine1: "보다 정확하게 현재의 흐름을",
  birthInputDescriptionLine2: "살펴보기 위해 필요합니다.",
  birthInputDisplayNameLabel: "이름 또는 호칭 (선택)",
  birthInputGenderLabel: "성별",
  birthInputGenderMale: "남성",
  birthInputGenderFemale: "여성",
  birthInputBirthDateLabel: "생년월일",
  birthInputBirthTimeLabel: "출생시간",
  birthInputYearSuffix: "년",
  birthInputMonthSuffix: "월",
  birthInputDaySuffix: "일",
  birthInputNextButton: "다음 단계",
  birthInputBackButton: "← 이전",
  reportEntryTitle: "분석할 내용을 선택해주세요.",
  reportEntryDescription: "현재 흐름을 정리하고 있습니다.",
} as const;

export const VNEXT_ENTRY_TOPIC_TAGS = [
  "사주",
  "운세",
  "금전",
  "사업",
  "궁합",
  "관계",
  "진로",
  "선택",
] as const;

export const VNEXT_ENTRY_CLASSES = {
  flow: "vnext-entry-flow",
  landingScreen: "vnext-entry-screen--landing",
  modeSelectionScreen: "vnext-entry-screen--mode-selection",
  modeCard: "vnext-entry-mode-card",
  modeCardSelected: "vnext-entry-mode-card--selected",
  birthInputScreen: "vnext-entry-screen--birth-input",
  birthTimeGrid: "vnext-entry-birth-time-grid",
  birthTimeOption: "vnext-entry-birth-time-option",
  birthTimeOptionSelected: "vnext-entry-birth-time-option--selected",
  reportEntryScreen: "vnext-entry-screen--report",
} as const;

export const VNEXT_ENTRY_MODE_CARDS = [
  {
    mode: "question",
    icon: "💬",
    title: VNEXT_ENTRY_COPY.questionModeTitle,
  },
  {
    mode: "report",
    icon: "📊",
    title: VNEXT_ENTRY_COPY.reportModeTitle,
  },
] as const;
