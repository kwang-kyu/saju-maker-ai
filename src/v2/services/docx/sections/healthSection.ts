import type { BasicSajuResult } from "../../../types/basic";

function getDayMasterHealth(dayMaster?: string): string {
  if (!dayMaster) {
    return "일간 정보가 뚜렷하지 않을 때는 특정 체질을 단정하기보다 생활 리듬과 피로 누적 여부를 중심으로 보는 것이 좋습니다.";
  }

  if (dayMaster.includes("갑") || dayMaster.includes("을")) {
    return "목(木) 일간은 성장력과 회복 의지가 강한 편입니다. 다만 신경을 많이 쓰거나 책임을 오래 끌어안으면 간담, 근육, 목·어깨 긴장 쪽으로 피로가 쌓이기 쉽습니다.";
  }

  if (dayMaster.includes("병") || dayMaster.includes("정")) {
    return "화(火) 일간은 활력과 반응 속도가 빠른 편입니다. 다만 과로하거나 감정 기복이 커지면 심장 부담, 혈압, 수면의 질, 열감 관리가 중요해집니다.";
  }

  if (dayMaster.includes("무") || dayMaster.includes("기")) {
    return "토(土) 일간은 버티는 힘과 생활 안정성이 장점입니다. 다만 오래 참거나 움직임이 부족하면 소화, 위장, 체중, 순환 정체 쪽을 관리해야 합니다.";
  }

  if (dayMaster.includes("경") || dayMaster.includes("신")) {
    return "금(金) 일간은 절제력과 관리 능력이 강한 편입니다. 다만 긴장 상태가 오래가면 호흡기, 피부, 대장, 관절의 뻣뻣함으로 나타날 수 있습니다.";
  }

  if (dayMaster.includes("임") || dayMaster.includes("계")) {
    return "수(水) 일간은 회복력과 적응력이 좋은 편입니다. 다만 체력이 바닥나면 신장, 방광, 허리, 하체 냉증, 만성 피로 쪽을 신경 써야 합니다.";
  }

  return "일간의 흐름상 무리하게 밀어붙이기보다 자신의 체력 리듬을 먼저 파악하는 것이 건강 관리의 출발점입니다.";
}

function getStrongElementHealth(element: string): string {
  switch (element) {
    case "목":
      return "목 기운이 강하면 추진력은 좋지만 긴장과 스트레스가 근육, 목, 어깨, 눈의 피로로 쌓이기 쉽습니다.";
    case "화":
      return "화 기운이 강하면 활동성은 좋지만 열이 위로 오르거나 수면, 혈압, 심장 부담으로 나타날 수 있습니다.";
    case "토":
      return "토 기운이 강하면 버티는 힘은 좋지만 소화 정체, 체중 증가, 몸이 무거워지는 흐름을 조심해야 합니다.";
    case "금":
      return "금 기운이 강하면 절제력은 좋지만 호흡기, 피부, 대장, 관절의 건조함과 경직을 관리해야 합니다.";
    case "수":
      return "수 기운이 강하면 회복력은 있으나 몸이 차가워지거나 하체, 신장, 방광, 허리 쪽으로 부담이 올 수 있습니다.";
    default:
      return "강한 오행이 뚜렷하지 않을 때는 특정 장부보다 전체적인 생활 균형을 보는 것이 좋습니다.";
  }
}

function getWeakElementHealth(element: string): string {
  switch (element) {
    case "목":
      return "목 기운이 약하면 회복 탄력, 근육의 유연성, 눈의 피로 관리가 중요합니다. 스트레칭과 산책처럼 몸을 부드럽게 여는 습관이 필요합니다.";
    case "화":
      return "화 기운이 약하면 활력, 체온, 혈액순환, 의욕이 떨어지기 쉽습니다. 햇빛, 가벼운 유산소 운동, 규칙적인 수면이 보완 포인트입니다.";
    case "토":
      return "토 기운이 약하면 소화력, 체력 유지, 생활 안정감이 흔들릴 수 있습니다. 식사 시간과 위장 부담을 줄이는 관리가 중요합니다.";
    case "금":
      return "금 기운이 약하면 호흡기, 피부, 대장 리듬이 약해질 수 있습니다. 물 섭취, 호흡 운동, 규칙적인 배변 습관을 챙기는 것이 좋습니다.";
    case "수":
      return "수 기운이 약하면 회복력, 수면, 허리와 하체, 신장·방광 쪽 관리가 중요합니다. 과로를 줄이고 몸을 따뜻하게 하는 습관이 필요합니다.";
    default:
      return "약한 오행이 뚜렷하지 않을 때는 무리한 보완보다 기본 체력과 수면 리듬을 먼저 안정시키는 것이 좋습니다.";
  }
}

function getAgeHealthAdvice(age: number | null): string {
  if (!age) {
    return "연령 정보가 뚜렷하지 않으므로 현재 생활 패턴, 수면, 식사, 스트레스 정도를 기준으로 건강 관리를 시작하는 것이 좋습니다.";
  }

  if (age < 30) {
    return "현재 나이대는 회복력이 좋지만 생활 리듬이 무너지기 쉬운 시기입니다. 밤샘, 불규칙한 식사, 과도한 카페인부터 줄이는 것이 좋습니다.";
  }

  if (age < 45) {
    return "현재 나이대는 일과 책임이 늘면서 피로가 누적되기 쉬운 시기입니다. 운동을 새로 크게 시작하기보다 꾸준히 유지할 수 있는 루틴이 중요합니다.";
  }

  if (age < 60) {
    return "현재 나이대는 체력보다 회복 속도 관리가 중요합니다. 혈압, 혈당, 체중, 수면의 질을 정기적으로 확인하는 습관이 필요합니다.";
  }

  return "현재 나이대는 무리한 활동보다 회복, 순환, 관절, 근력 유지가 핵심입니다. 갑작스러운 운동보다 걷기와 근력 유지 운동을 꾸준히 하는 것이 좋습니다.";
}

function getStrengthHealthAdvice(summary?: string): string {
  const text = summary ?? "";

  if (text.includes("신강") || text.includes("강")) {
    return "전체적으로 기운이 강한 편이라면 건강 문제는 부족함보다 과함에서 오는 경우가 많습니다. 무리하게 버티는 습관, 과로, 감정 억제를 줄이는 것이 핵심입니다.";
  }

  if (text.includes("신약") || text.includes("약")) {
    return "전체적으로 기운이 약한 편이라면 체력 소모를 줄이고 회복 시간을 확보하는 것이 우선입니다. 무리한 목표보다 꾸준한 생활 관리가 더 큰 효과를 냅니다.";
  }

  return "전체 균형이 뚜렷하게 한쪽으로 치우치지 않는다면 작은 습관의 누적이 건강운을 좌우합니다. 수면, 식사, 운동의 기본 리듬을 지키는 것이 가장 중요합니다.";
}

export function buildHealthSection(basic: BasicSajuResult): string[] {
  const name = basic.name ?? "고객";
  const dayMaster = basic.dayMaster ?? "";
  const strongElement = basic.strongestElement ?? "없음";
  const weakElement = basic.weakestElement ?? "없음";
  const age = null;

  return [
    "건강운",
    `${name}님의 건강운은 단순히 병이 있다 없다를 말하는 영역이 아니라, 타고난 기운이 몸의 어느 부분에서 쉽게 피로로 나타나는지를 살피는 영역입니다.`,
    getDayMasterHealth(dayMaster),
    getStrengthHealthAdvice(basic.summary),
    getStrongElementHealth(strongElement),
    getWeakElementHealth(weakElement),
    getAgeHealthAdvice(age),
    "따라서 건강 관리는 큰 결심보다 반복 가능한 생활 습관이 중요합니다. 무리한 운동, 극단적인 식단, 갑작스러운 생활 변화보다 매일 지킬 수 있는 수면, 식사, 걷기, 스트레스 관리가 더 현실적인 해법입니다.",
    "특히 사주상 약한 기운은 평소에는 잘 드러나지 않다가 피로가 누적될 때 먼저 흔들릴 수 있습니다. 몸이 보내는 작은 신호를 무시하지 않고 미리 조절하는 것이 건강운을 좋게 쓰는 방법입니다.",
    "최종적으로 건강운은 조심해야 할 부분을 알고 생활을 정돈하면 충분히 안정적으로 관리할 수 있는 흐름입니다.",
  ];
}