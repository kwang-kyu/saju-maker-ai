import BasicResult from "./BasicResult";
import TotalResult from "./TotalResult";
import YearResult from "./YearResult";
import TodayResult from "./TodayResult";
import MoneyResult from "./MoneyResult";
import MoneyTodayResult from "./MoneyTodayResult";
import JobResult from "./JobResult";
import LoveResult from "./LoveResult";
import HealthResult from "./HealthResult";
import MarriageResult from "./MarriageResult";
import BusinessResult from "./BusinessResult";
import RealEstateResult from "./RealEstateResult";
import CaseResult from "./CaseResult";
import AiResult from "./AiResult";
import LuckyResult from "./LuckyResult";
import LoveTodayResult from "./LoveTodayResult";
import HealthTodayResult from "./HealthTodayResult";

import { calculateSaju } from "../engine/sajuEngine";
import { downloadSummaryPdf } from "../services/pdf/downloadSummaryPdf";
import { downloadDetailPdf } from "../services/pdf/downloadDetailPdf";

import { basicConsulting } from "../services/basic/basicConsulting";
import { basicMapper } from "../services/basic/basicMapper";
import { totalConsulting } from "../services/total/totalConsulting";
import { yearConsulting } from "../services/year/yearConsulting";
import { todayConsulting } from "../services/today/todayConsulting";
import { moneyConsulting } from "../services/money/moneyConsulting";
import { jobConsulting } from "../services/job/jobConsulting";
import { loveConsulting } from "../services/love/loveConsulting";
import { getHealthConsulting } from "../services/health/healthConsulting";
import { getMarriageConsulting } from "../services/marriage/marriageConsulting";
import { getBusinessConsulting } from "../services/business/businessConsulting";
import { getRealEstateConsulting } from "../services/realEstate/realEstateConsulting";
import { getAiTotalConsulting } from "../services/ai/aiTotalConsulting";

type ResultViewProps = {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: string;
  calendarType?: string;
  selectedMenu: string;
};

function getCurrentAge(birthDate: string) {
  const birthYear = Number(birthDate.split("-")[0]);
  if (!birthYear) return "";
  return String(new Date().getFullYear() - birthYear + 1);
}

function getTimePeriodLabel(time: string) {
  const map: Record<string, string> = {
    "00:00": "자시 (23:00~01:00)",
    "01:00": "축시 (01:00~03:00)",
    "02:00": "축시 (01:00~03:00)",
    "03:00": "인시 (03:00~05:00)",
    "04:00": "인시 (03:00~05:00)",
    "05:00": "묘시 (05:00~07:00)",
    "06:00": "묘시 (05:00~07:00)",
    "07:00": "진시 (07:00~09:00)",
    "08:00": "진시 (07:00~09:00)",
    "09:00": "사시 (09:00~11:00)",
    "10:00": "사시 (09:00~11:00)",
    "11:00": "오시 (11:00~13:00)",
    "12:00": "오시 (11:00~13:00)",
    "13:00": "미시 (13:00~15:00)",
    "14:00": "미시 (13:00~15:00)",
    "15:00": "신시 (15:00~17:00)",
    "16:00": "신시 (15:00~17:00)",
    "17:00": "유시 (17:00~19:00)",
    "18:00": "유시 (17:00~19:00)",
    "19:00": "술시 (19:00~21:00)",
    "20:00": "술시 (19:00~21:00)",
    "21:00": "해시 (21:00~23:00)",
    "22:00": "해시 (21:00~23:00)",
    "23:00": "자시 (23:00~01:00)",
  };

  return map[time] ?? time;
}
function buildPersonalProfile(params: {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: string;
  calendarType: string;
  solarDate: string;
  lunarDate: string;
  sajuPillars: string;
}) {
  const { name, birthDate, birthTime, gender, calendarType, solarDate, lunarDate, sajuPillars } = params;
  const timeText = getTimePeriodLabel(birthTime);
  const writtenDate = new Date().toLocaleDateString("ko-KR");
  const age = getCurrentAge(birthDate);
  const genderText = gender === "male" ? "남성" : "여성";
  const calendarText = calendarType === "lunar" ? "음력" : "양력";

  return `${name}님의 상담은 아래 입력 정보를 기준으로 작성되었습니다.

이름: ${name}
출생 기준: ${calendarText}
입력 생년월일: ${birthDate}
출생 당시 양력 환산일: ${solarDate}
음력 생일: ${lunarDate}
출생시간: ${timeText}
성별: ${genderText}
현재 나이: ${age ? `${age}세` : "확인 필요"}
작성일: ${writtenDate}
상담버전: 천운문 Premium 4.0
만세력 기준: 절기 기준 사주명리 해석
사주팔자: ${sajuPillars}

이번 리포트는 입력된 생년월일과 현재 나이 흐름을 기준으로 인생의 방향, 돈, 일, 관계, 건강, 결혼, 사업, 부동산 흐름을 종합 상담하는 방식으로 구성됩니다.`;
}

function buildConsultingPersonalNote(params: {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: string;
  calendarType: string;
  area: string;
}) {
  const { name, birthDate, birthTime, gender, calendarType, area } = params;
  const timeText = getTimePeriodLabel(birthTime);
  const age = getCurrentAge(birthDate);
  const genderText = gender === "male" ? "남성" : "여성";
  const calendarText = calendarType === "lunar" ? "음력" : "양력";

  return `${area}은 ${name}님의 ${birthDate} ${calendarText} 출생, ${timeText}에 태어나신 ${genderText} 기준으로 해석합니다.
현재 나이는 ${age ? `${age}세` : "확인 필요"}로 보며, 지금 시점에서 어떤 선택을 줄이고 어떤 흐름을 키워야 하는지를 중심으로 상담합니다.`;
}


function buildPremiumPdfExpansion(params: {
  name: string;
  title: string;
}) {
  const { name, title } = params;

  if (title.includes("개인 상담 기준")) {
    return `
[Premium 4.0 안내]
이 리포트는 단순히 사주 정보를 나열하는 문서가 아닙니다.
${name}님의 출생 정보와 현재 시점의 흐름을 바탕으로, 인생의 방향을 현실적으로 정리하기 위한 프리미엄 상담서입니다.

[상담서 활용법]
한 번에 전부 맞고 틀림을 판단하기보다, 반복해서 읽으면서 지금 자신의 상황과 맞는 부분을 표시해 두는 것이 좋습니다.
특히 재물, 직업, 관계, 건강, 사업, 부동산 흐름은 서로 따로 움직이지 않고 함께 연결되어 나타나는 경우가 많습니다.

[중요한 기준]
운이 좋다는 것은 아무 노력 없이 결과가 생긴다는 뜻이 아닙니다.
좋은 흐름을 알아차리고, 불리한 선택을 줄이며, 본인에게 맞는 방향으로 현실을 조정하는 힘이 커진다는 뜻입니다.
`;
  }

  if (title.includes("기본 사주")) {
    return `
[성향 심층 해석]
${name}님은 겉으로 드러나는 모습보다 속으로 판단하고 정리하는 힘이 중요한 사람입니다.
주변에서 보기에는 단순히 조용하거나 신중해 보일 수 있지만, 실제로는 마음속 기준이 분명하고 쉽게 흔들리지 않으려는 성향이 있습니다.

[반복되는 인생 패턴]
이런 흐름의 사람은 초반에는 속도가 느린 것처럼 보여도, 시간이 지나면서 자신만의 기준과 경험이 쌓이면 안정적으로 성장합니다.
다만 스스로 납득되지 않는 일을 억지로 오래 끌고 가면 마음이 쉽게 지치고, 관계나 일에서 거리감이 생길 수 있습니다.

[생활 속 조언]
중요한 것은 남의 속도에 맞추는 것이 아니라, 본인이 오래 유지할 수 있는 리듬을 만드는 것입니다.
인생의 중요한 선택을 할 때는 순간적인 감정보다 "이 선택을 3년 이상 유지할 수 있는가"를 기준으로 보면 좋습니다.
`;
  }

  if (title.includes("전체 운세")) {
    return `
[인생 전체 흐름]
${name}님의 전체 운은 한 번에 크게 터지는 흐름보다, 준비와 축적을 통해 점점 안정되는 쪽에 가깝습니다.
초반에 결과가 늦어 보이더라도 경험이 쌓일수록 판단력이 강해지고, 사람과 돈의 흐름을 보는 눈도 현실적으로 변합니다.

[주의해야 할 흐름]
가장 조심해야 할 것은 방향이 정리되기 전에 일을 너무 많이 벌리는 것입니다.
일, 돈, 관계가 동시에 넓어지면 겉으로는 바빠 보이지만 실제로는 에너지가 흩어질 수 있습니다.

[운을 좋게 쓰는 방법]
하나를 깊게 만들고, 그다음 확장하는 방식이 좋습니다.
지금 당장 큰 성공보다, 오래 유지될 기반을 만드는 선택이 결국 더 큰 운으로 이어집니다.
`;
  }

  if (title.includes("올해 운세")) {
    return `
[올해의 핵심 방향]
올해는 무리한 확장보다 정리와 선택이 중요한 해입니다.
새로운 기회가 보이더라도 모두 잡으려 하기보다, 실제로 남는 것이 무엇인지 따져보는 태도가 필요합니다.

[현실 조언]
계약, 금전, 약속, 인간관계는 말보다 기록을 남기는 것이 좋습니다.
좋은 흐름도 준비 없이 잡으면 부담이 되고, 나쁜 흐름도 미리 정리하면 큰 문제로 번지지 않습니다.

[올해 실천 체크]
첫째, 지출 구조를 점검하세요.
둘째, 건강 리듬을 무너뜨리지 마세요.
셋째, 사람 관계에서 지나친 책임을 떠안지 마세요.
넷째, 오래 가져갈 일과 정리할 일을 구분하세요.
`;
  }

  if (title.includes("오늘")) {
    return `
[오늘의 활용법]
오늘의 운세는 큰 운명을 단정하는 것이 아니라 하루의 리듬을 정리하는 기준입니다.
중요한 일은 오전이나 집중이 잘 되는 시간에 먼저 처리하고, 감정적인 판단은 한 박자 늦추는 것이 좋습니다.

[오늘 조심할 점]
말을 빠르게 하거나 약속을 쉽게 잡으면 나중에 부담으로 돌아올 수 있습니다.
작은 돈, 작은 실수, 작은 피로를 가볍게 넘기지 말고 바로 정리하는 것이 좋습니다.

[오늘의 한 가지 실천]
오늘은 많은 일을 벌리는 것보다 하나를 확실히 마무리하는 것이 운을 안정시키는 방법입니다.
`;
  }

  if (title.includes("재물")) {
    return `
[재물 심층 상담]
${name}님의 재물운은 단순히 돈이 들어오느냐보다, 들어온 돈을 어떻게 지키고 키우느냐가 더 중요합니다.
수입이 생겨도 지출 구조가 정리되지 않으면 돈이 남지 않는 흐름이 반복될 수 있습니다.

[실제 상담에서 자주 보이는 사례]
이런 흐름의 분들은 능력이 없어서 돈이 부족한 것이 아니라, 주변 부탁, 가족 문제, 사업 확장, 충동적인 결정에서 돈이 새는 경우가 많습니다.
매출이나 수입은 있는데 통장에 남는 돈이 적다면 재물운이 약해서가 아니라 관리 구조를 바꿔야 하는 신호입니다.

[실천 전략]
첫째, 큰돈보다 고정지출을 먼저 점검하세요.
둘째, 투자보다 현금 흐름을 먼저 안정시키세요.
셋째, 보증, 급한 대여, 감정적 소비는 피하는 것이 좋습니다.
넷째, 돈이 들어오는 날보다 돈이 빠져나가는 이유를 기록해야 합니다.
`;
  }

  if (title.includes("직업")) {
    return `
[직업 심층 상담]
${name}님은 단순히 오래 버티는 직업보다, 본인의 판단과 경험이 쌓이는 일에서 운이 살아납니다.
시키는 일만 반복하는 환경에서는 답답함이 커질 수 있고, 반대로 책임과 권한이 적절히 주어지면 실력이 드러납니다.

[일에서 반복되는 패턴]
처음에는 조용히 배우고 관찰하지만, 시간이 지나면 자신만의 방식과 기준이 생깁니다.
다만 인정받지 못하거나 역할이 불분명한 환경에서는 의욕이 떨어질 수 있습니다.

[직업 전략]
지금 중요한 것은 직업 이름이 아니라 일하는 구조입니다.
본인이 성장할 수 있는 일, 성과가 남는 일, 경험이 자산이 되는 일을 선택해야 합니다.
`;
  }

  if (title.includes("사업")) {
    return `
[사업 심층 상담]
사업운은 무조건 창업을 하라는 뜻이 아닙니다.
${name}님에게 사업은 확장보다 구조, 속도보다 관리, 감정보다 계산이 중요합니다.

[사업에서 조심할 점]
사람을 믿고 시작한 일이 돈 문제로 번질 수 있고, 준비되지 않은 확장은 부담으로 돌아올 수 있습니다.
특히 초기에는 매출보다 고정비, 인건비, 재고, 계약 조건을 더 꼼꼼히 봐야 합니다.

[사업 전략]
작게 검증하고, 숫자로 확인하고, 반복 가능한 구조가 생겼을 때 확장하는 것이 좋습니다.
감으로 시작한 사업보다 기록과 계산이 있는 사업이 오래 갑니다.
`;
  }

  if (title.includes("부동산")) {
    return `
[부동산 심층 상담]
부동산운은 단순히 집을 사느냐 파느냐의 문제가 아니라, 삶의 기반과 자산의 방향을 정하는 문제입니다.
${name}님은 분위기에 휩쓸린 결정보다 입지, 현금흐름, 보유기간을 함께 보는 것이 중요합니다.

[실제 판단 기준]
좋은 매물처럼 보여도 대출 부담, 공실 가능성, 관리 비용, 환금성을 함께 봐야 합니다.
특히 남들이 좋다고 하는 지역보다 본인의 자금 구조와 생활 흐름에 맞는 선택이 더 중요합니다.

[부동산 전략]
첫째, 무리한 레버리지는 피하세요.
둘째, 단기 차익보다 오래 버틸 수 있는 구조를 보세요.
셋째, 계약 전에는 반드시 권리관계와 현장성을 확인하세요.
`;
  }

  if (title.includes("연애")) {
    return `
[연애 심층 상담]
${name}님의 연애운은 감정의 시작보다 관계를 유지하는 방식이 중요합니다.
처음에는 마음이 움직여도, 시간이 지나면서 신뢰와 생활 리듬이 맞는지를 크게 보게 됩니다.

[반복되는 관계 패턴]
상대에게 맞추다가 지치거나, 반대로 마음을 쉽게 표현하지 못해 오해가 생길 수 있습니다.
좋은 인연은 감정을 급하게 밀어붙이는 사람이 아니라, ${name}님의 속도를 존중하는 사람입니다.

[연애 조언]
말하지 않아도 알아주길 기대하기보다, 불편한 점을 부드럽게 표현하는 연습이 필요합니다.
관계는 참는 것이 아니라 조율하는 것입니다.
`;
  }

  if (title.includes("결혼")) {
    return `
[결혼 심층 상담]
결혼운은 좋은 사람을 만나는 것만큼, 함께 생활을 유지할 수 있는 구조가 중요합니다.
${name}님은 감정만으로 결혼을 결정하기보다 가치관, 돈 관리, 가족 관계, 생활 습관을 함께 봐야 합니다.

[배우자 관계에서 중요한 점]
상대가 화려하거나 강한 사람보다, 안정적으로 대화가 되고 책임을 나눌 수 있는 사람이 좋습니다.
결혼 후에는 작은 불만을 쌓아두지 않는 것이 중요합니다.

[결혼 전략]
경제 기준, 부모가족 문제, 주거 계획, 일과 생활의 균형을 결혼 전부터 현실적으로 이야기하는 것이 좋습니다.
`;
  }

  if (title.includes("건강")) {
    return `
[건강 심층 상담]
건강운은 병을 단정하는 것이 아니라 몸이 약해지는 생활 패턴을 보는 것입니다.
${name}님은 무리할 때 바로 무너지는 흐름보다, 피로가 누적되다가 어느 순간 크게 나타나는 흐름을 조심해야 합니다.

[생활에서 조심할 점]
수면 부족, 불규칙한 식사, 스트레스성 긴장, 오래 참는 습관이 몸의 리듬을 흔들 수 있습니다.
몸이 보내는 작은 신호를 무시하면 회복 시간이 길어질 수 있습니다.

[건강 전략]
첫째, 수면 시간을 일정하게 유지하세요.
둘째, 몸이 피곤할 때 중요한 결정을 미루세요.
셋째, 정기검진과 기본 운동을 생활화하세요.
`;
  }

  if (title.includes("AI")) {
    return `
[Premium 4.0 종합 총평]
한마디로 말하면, ${name}님은 빠르게 모든 것을 바꾸는 사람이라기보다 흐름을 읽고 기준을 세울 때 인생이 안정되는 사람입니다.
돈, 일, 관계, 건강은 따로 떨어져 있지 않습니다.
돈이 불안하면 관계가 흔들리고, 일이 과하면 건강이 약해지며, 건강이 무너지면 판단력도 흐려집니다.

[앞으로의 핵심 전략]
앞으로는 더 많이 벌고, 더 많이 만나고, 더 많이 벌리는 것보다 내게 맞는 것을 남기고 불필요한 것을 줄이는 방향이 중요합니다.
좋은 운은 무리해서 잡는 것이 아니라 준비된 상태에서 받아들이는 것입니다.

[3년 실행 방향]
1년 차에는 정리와 회복이 중요합니다.
2년 차에는 실력과 수입 구조를 안정시키는 것이 좋습니다.
3년 차에는 자산화, 전문화, 장기 계획으로 연결해야 합니다.

[최종 총평]
${name}님에게 가장 중요한 말은 이것입니다.
지금부터의 운은 속도가 아니라 선택의 질에서 갈립니다.
남들이 좋다고 하는 길보다, 오래 버틸 수 있고 실제로 내 삶에 남는 길을 선택할 때 천운문 리포트의 의미가 현실에서 살아납니다.
`;
  }

  return `
[Premium 4.0 보강 상담]
이 장은 ${name}님의 실제 생활 선택에 연결해서 읽는 것이 중요합니다.
좋은 흐름은 키우고, 부담이 되는 선택은 줄이는 방향으로 활용해 주세요.

[실천 기준]
지금 당장 크게 바꾸기보다 작은 선택을 꾸준히 바꾸는 것이 좋습니다.
운은 방향을 알고 움직일 때 더 안정적으로 열립니다.
`;
}

export default function ResultView({
  name,
  birthDate,
  birthTime,
  gender,
  calendarType = "solar",
  selectedMenu,
}: ResultViewProps) {
  const commonProps = { name, birthDate, birthTime, gender };
  const birthTimeText = getTimePeriodLabel(birthTime);
  const writtenDateText = new Date().toLocaleDateString("ko-KR");

  const sajuInfo = calculateSaju({
    name,
    birthDate,
    birthTime,
    gender,
    calendarType,
  });

  const sajuPillars = `${sajuInfo.yearGanZhi} / ${sajuInfo.monthGanZhi} / ${sajuInfo.dayGanZhi} / ${sajuInfo.timeGanZhi}`;

  const getPdfSections = () => {
    const inputData = { name, birthDate, birthTime, gender };
    const mappedBasic = basicMapper(inputData);

    const sajuPersonalNote = `${name}님은 일간 기준으로 ${mappedBasic.summary}
강하게 살아나는 기운은 ${mappedBasic.strongestElement}, 보완이 필요한 기운은 ${mappedBasic.weakestElement}입니다.
이 흐름은 돈, 일, 관계, 건강, 사업 판단에 함께 반영됩니다.`;

    const baseSections = [
      {
        title: "개인 상담 기준",
        content: buildPersonalProfile({
          name,
          birthDate,
          birthTime,
          gender,
          calendarType,
          solarDate: sajuInfo.solarDate,
          lunarDate: sajuInfo.lunarDate,
          sajuPillars,
        }),
      },
      { title: "기본 사주", content: basicConsulting(mappedBasic) },
      { title: "전체 운세", content: totalConsulting(inputData) },
      { title: "올해 운세", content: yearConsulting(inputData) },
      { title: "오늘의 운세", content: todayConsulting(name) },
      {
        title: "재물 상담",
        content:
          buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "재물 상담" }) +
          "\n\n" +
          sajuPersonalNote +
          "\n\n" +
          moneyConsulting(mappedBasic, birthDate),
      },
      {
        title: "직업 상담",
        content:
          buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "직업 상담" }) +
          "\n\n" +
          sajuPersonalNote +
          "\n\n" +
          jobConsulting(mappedBasic),
      },
      {
        title: "연애 상담",
        content:
          buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "연애 상담" }) +
          "\n\n" +
          sajuPersonalNote +
          "\n\n" +
          loveConsulting(mappedBasic),
      },
      {
        title: "건강 상담",
        content:
          buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "건강 상담" }) +
          "\n\n" +
          sajuPersonalNote +
          "\n\n" +
          getHealthConsulting(mappedBasic),
      },
      {
        title: "결혼 상담",
        content:
          buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "결혼 상담" }) +
          "\n\n" +
          sajuPersonalNote +
          "\n\n" +
          getMarriageConsulting(mappedBasic),
      },
      {
        title: "사업 상담",
        content:
          buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "사업 상담" }) +
          "\n\n" +
          sajuPersonalNote +
          "\n\n" +
          getBusinessConsulting(mappedBasic),
      },
      {
        title: "부동산 상담",
        content:
          buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "부동산 상담" }) +
          "\n\n" +
          sajuPersonalNote +
          "\n\n" +
          getRealEstateConsulting(mappedBasic),
      },
      {
        title: "사안별 상담",
        content: "사안별 상담은 질문 선택 방식으로 제공됩니다. 구체적인 고민이 입력되면 해당 사안에 맞춰 상담을 진행합니다.",
      },
      { title: "AI 종합상담", content: getAiTotalConsulting(mappedBasic) },
    ];

    return baseSections.map((section) => ({
      ...section,
      content:
        section.content +
        "\n\n" +
        buildPremiumPdfExpansion({
          name,
          title: section.title,
        }),
    }));
  };

  const getSummaryPdfSections = () => [
    {
      title: "개인 상담 기준",
      content: buildPersonalProfile({
        name,
        birthDate,
        birthTime,
        gender,
        calendarType,
        solarDate: sajuInfo.solarDate,
        lunarDate: sajuInfo.lunarDate,
        sajuPillars,
      }),
    },
    {
      title: "기본 사주 요약",
      content: `${name}님의 기본 사주는 스스로 기준을 세우고 차분히 쌓아갈 때 강점이 살아나는 흐름입니다.

겉으로는 조용하거나 신중해 보여도, 속으로는 생각이 깊고 판단 기준이 분명한 편입니다.

무리하게 빠르게 움직이기보다 본인이 납득할 수 있는 방향을 정한 뒤 꾸준히 가는 것이 좋습니다.`,
    },
    {
      title: "전체 운세 요약",
      content: `${name}님은 앞으로 무리한 확장보다 안정, 정리, 건강, 관계의 균형이 더 중요한 시기입니다.

일과 돈은 크게 벌리는 것보다 새는 부분을 막고, 오래 가져갈 기준을 세울 때 흐름이 안정됩니다.`,
    },
    {
      title: "올해 운세 요약",
      content: `${name}님에게 올해는 속도보다 방향이 중요한 해입니다.

새로운 일을 무리하게 늘리기보다 지금 하는 일의 완성도와 안정성을 높이는 것이 좋습니다.`,
    },
    {
      title: "오늘의 운세 요약",
      content: `${name}님은 오늘 많은 일을 한꺼번에 처리하기보다 중요한 일 하나를 먼저 끝내는 것이 좋습니다.

돈, 약속, 문서, 건강 리듬을 차분히 점검하면 하루 흐름이 안정됩니다.`,
    },
  ];

  const handleSummaryPdf = () => {
    downloadSummaryPdf({ name, sections: getSummaryPdfSections() });
  };

  const handleDetailPdf = () => {
    downloadDetailPdf({ name, sections: getPdfSections() });
  };

  const renderResult = () => {
    switch (selectedMenu) {
      case "basic":
        return <BasicResult {...commonProps} />;
      case "total":
        return <TotalResult {...commonProps} />;
      case "year":
        return <YearResult {...commonProps} />;
      case "today":
        return <TodayResult {...commonProps} />;
      case "moneyToday":
        return <MoneyTodayResult name={name} />;
      case "money":
        return <MoneyResult {...commonProps} />;
      case "job":
        return <JobResult {...commonProps} />;
      case "love":
        return <LoveResult {...commonProps} />;
      case "health":
        return <HealthResult {...commonProps} />;
      case "marriage":
        return <MarriageResult {...commonProps} />;
      case "business":
        return <BusinessResult {...commonProps} />;
      case "realEstate":
        return <RealEstateResult {...commonProps} />;
      case "case":
        return <CaseResult {...commonProps} />;
      case "ai":
        return <AiResult {...commonProps} />;
      case "lucky":
        return <LuckyResult name={name} />;
      case "loveToday":
        return <LoveTodayResult name={name} />;
      case "healthToday":
        return <HealthTodayResult name={name} />;
      default:
        return <BasicResult {...commonProps} />;
    }
  };

  return (
    <div style={{ marginTop: "24px" }}>
      <h2 style={{ marginBottom: "16px" }}>결과 확인</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={handleSummaryPdf}
          style={{
            flex: 1,
            padding: "13px",
            border: "none",
            borderRadius: "12px",
            background: "#f59e0b",
            color: "#111827",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          📄 요약 리포트
        </button>

        <button
          type="button"
          onClick={handleDetailPdf}
          style={{
            flex: 1,
            padding: "13px",
            border: "none",
            borderRadius: "12px",
            background: "#38bdf8",
            color: "#0f172a",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          📘 상세 리포트
        </button>
      </div>

      <div
        style={{
          padding: "20px",
          border: "1px solid #334155",
          borderRadius: "16px",
          background: "#1e293b",
          lineHeight: "1.9",
          fontSize: "15px",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "14px", fontSize: "20px" }}>
          📋 상담 기준 정보
        </h3>
        <div>이름: {name}</div>
        <div>출생 기준: {calendarType === "lunar" ? "음력 생일" : "양력 생일"}</div>
        <div>입력 생년월일: {birthDate}</div>
        <div>출생 당시 양력 환산일: {sajuInfo.solarDate}</div>
        <div>출생 시간: {birthTimeText}</div>
        <div>작성일: {writtenDateText}</div>
        <div>상담버전: 천운문 Premium 4.0</div>
        <div>만세력 기준: 절기 기준 사주명리 해석</div>
        <div>성별: {gender === "male" ? "남성" : "여성"}</div>
      </div>

      <div
        style={{
          marginTop: "14px",
          padding: "20px",
          border: "1px solid #334155",
          borderRadius: "16px",
          background: "#0f172a",
          lineHeight: "1.9",
          fontSize: "15px",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "14px", fontSize: "20px" }}>
          📜 만세력 사주팔자
        </h3>
        <div>연주: {sajuInfo.yearGanZhi}</div>
        <div>월주: {sajuInfo.monthGanZhi}</div>
        <div>일주: {sajuInfo.dayGanZhi}</div>
        <div>시주: {sajuInfo.timeGanZhi}</div>
      </div>

      <div
        style={{
          marginTop: "18px",
          padding: "24px",
          border: "1px solid #334155",
          borderRadius: "16px",
          background: "#111827",
          lineHeight: "2",
          fontSize: "16px",
          letterSpacing: "-0.2px",
          wordBreak: "keep-all",
          overflowWrap: "break-word",
        }}
      >
        {renderResult()}
      </div>
    </div>
  );
}




















