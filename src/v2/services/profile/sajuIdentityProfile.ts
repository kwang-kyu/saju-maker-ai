import type { BasicSajuResult } from "../../types/basic";

export type SajuIdentityProfile = {
  lifeStyle: string;
  decisionStyle: string;
  moneyStyle: string;
  workStyle: string;
  relationshipStyle: string;
  riskPoint: string;
  successPoint: string;
};

export function buildSajuIdentityProfile(data: BasicSajuResult): SajuIdentityProfile {
  const name = data.name;
  const dayMaster = String(data.dayMaster);
  const strongest = String(data.strongestElement);
  const weakest = String(data.weakestElement);

  const lifeStyle =
    dayMaster.includes("갑") || dayMaster.includes("을")
      ? `${name}님은 성장과 확장을 통해 운이 열리는 사람입니다. 다만 방향을 너무 많이 벌리기보다 하나의 줄기를 오래 키울 때 힘이 커집니다.`
      : dayMaster.includes("병") || dayMaster.includes("정")
      ? `${name}님은 표현력과 존재감이 살아날 때 운이 열리는 사람입니다. 다만 감정이 앞서면 선택이 빨라질 수 있어 현실 기준이 필요합니다.`
      : dayMaster.includes("무") || dayMaster.includes("기")
      ? `${name}님은 안정과 책임을 바탕으로 운을 만들어가는 사람입니다. 다만 혼자 너무 오래 감당하면 피로가 쌓일 수 있습니다.`
      : dayMaster.includes("경") || dayMaster.includes("신")
      ? `${name}님은 판단과 정리를 통해 운이 열리는 사람입니다. 다만 지나치게 엄격해지면 기회를 좁게 볼 수 있습니다.`
      : dayMaster.includes("임") || dayMaster.includes("계")
      ? `${name}님은 흐름을 읽고 상황을 살피는 감각으로 운을 만드는 사람입니다. 다만 생각이 길어지면 실행이 늦어질 수 있습니다.`
      : `${name}님은 자기 기준을 세우고 차근차근 쌓아갈 때 운이 살아나는 사람입니다.`;

  const decisionStyle =
    strongest === "목"
      ? "가능성과 성장성을 먼저 보되, 최종 결정 전에는 방향을 하나로 좁혀야 합니다."
      : strongest === "화"
      ? "마음이 움직이면 추진력이 살아나지만, 중요한 결정일수록 감정과 현실 조건을 함께 봐야 합니다."
      : strongest === "토"
      ? "안정성과 책임 범위를 먼저 보는 신중형입니다. 감당 가능한 범위를 정하면 판단이 좋아집니다."
      : strongest === "금"
      ? "조건과 기준을 따지는 분석형입니다. 문서, 숫자, 약속이 분명할수록 좋은 선택을 합니다."
      : strongest === "수"
      ? "흐름과 정보를 살피는 관찰형입니다. 충분히 살핀 뒤 실행 기준을 정하는 것이 중요합니다."
      : "감정보다 기준과 순서를 세울 때 판단이 좋아집니다.";

  const moneyStyle =
    weakest === "토"
      ? "돈은 크게 벌기보다 먼저 새지 않게 관리해야 합니다. 고정비와 생활비 구조를 안정시키는 것이 우선입니다."
      : weakest === "금"
      ? "돈은 기준 없이 움직이면 흩어지기 쉽습니다. 투자, 계약, 지출의 중단 기준을 미리 정해야 합니다."
      : weakest === "수"
      ? "돈은 무리해서 밀어붙일수록 피로가 커질 수 있습니다. 회복 가능한 범위 안에서 움직여야 오래 갑니다."
      : "돈은 한 번에 크게 벌기보다 반복 수입과 안정적인 구조를 만들 때 좋아집니다.";

  const workStyle =
    strongest === "목"
      ? "일에서는 기획, 성장, 교육, 확장성이 있는 역할이 잘 맞습니다."
      : strongest === "화"
      ? "일에서는 표현, 설득, 홍보, 사람 앞에 드러나는 역할이 잘 맞습니다."
      : strongest === "토"
      ? "일에서는 관리, 운영, 책임, 안정적인 시스템을 다루는 역할이 잘 맞습니다."
      : strongest === "금"
      ? "일에서는 판단, 정리, 분석, 기준을 세우는 역할이 잘 맞습니다."
      : strongest === "수"
      ? "일에서는 정보, 흐름, 상담, 기획처럼 깊이 생각하고 연결하는 역할이 잘 맞습니다."
      : "일에서는 경험이 쌓이고 신뢰가 남는 역할이 잘 맞습니다.";

  const relationshipStyle =
    weakest === "화"
      ? "관계에서는 마음을 숨기기보다 필요한 표현을 적절히 하는 것이 중요합니다."
      : weakest === "금"
      ? "관계에서는 거절과 경계선이 중요합니다. 좋은 사람이라도 기준 없이 받아주면 피로가 쌓입니다."
      : weakest === "수"
      ? "관계에서는 혼자 회복할 시간이 필요합니다. 사람을 많이 만나는 것보다 편안한 관계를 남기는 것이 좋습니다."
      : "관계에서는 넓은 인맥보다 오래 신뢰할 수 있는 사람을 남기는 것이 좋습니다.";

  const riskPoint =
    weakest === "목"
      ? "계획은 세우지만 오래 이어가지 못할 때 손실이 생길 수 있습니다."
      : weakest === "화"
      ? "참고 넘기다가 감정이 한 번에 터질 때 관계와 일이 흔들릴 수 있습니다."
      : weakest === "토"
      ? "생활의 중심이 흔들리면 돈, 건강, 일이 함께 흔들릴 수 있습니다."
      : weakest === "금"
      ? "끊고 맺는 기준이 늦어지면 손해 보는 관계나 지출이 길어질 수 있습니다."
      : weakest === "수"
      ? "쉬지 않고 버티면 판단력이 떨어지고, 그때 중요한 선택을 잘못할 수 있습니다."
      : "조급하게 결정할 때 손실이 커질 수 있습니다.";

  const successPoint =
    strongest === "목"
      ? "하나의 방향을 정해 꾸준히 키울 때 운이 커집니다."
      : strongest === "화"
      ? "자신의 생각과 장점을 밖으로 드러낼 때 운이 열립니다."
      : strongest === "토"
      ? "안정적인 구조를 만들고 오래 유지할 때 운이 커집니다."
      : strongest === "금"
      ? "기준을 세우고 정리할수록 실속 있는 성과가 생깁니다."
      : strongest === "수"
      ? "정보를 모으고 흐름을 읽은 뒤 차분히 움직일 때 운이 열립니다."
      : "자기 기준에 맞는 환경을 선택할 때 운이 살아납니다.";

  return {
    lifeStyle,
    decisionStyle,
    moneyStyle,
    workStyle,
    relationshipStyle,
    riskPoint,
    successPoint,
  };
}
