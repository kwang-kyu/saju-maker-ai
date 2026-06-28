import { getMoneyComboText } from "../data/moneyComboData";

type MoneyPersonalTypeInput = {
  name: string;
  dayStem: string;
  gyeokguk: string;
  strengthType: string;
  strongestName: string;
  weakestName: string;
  moneyScore: number;
};

export function getMoneyPersonalTypeText({
  name,
  dayStem,
  gyeokguk,
  strengthType,
  strongestName,
  weakestName,
  moneyScore,
}: MoneyPersonalTypeInput): string {
  return `
💰 재물운 점수: ${moneyScore}점 ${"⭐".repeat(
  Math.max(1, Math.ceil(moneyScore / 20))
)}

${getMoneyComboText(
  dayStem,
  gyeokguk,
  strengthType,
  strongestName,
  weakestName
)}

■ ${name}님 맞춤 현실 조언
1. ${name}님은 ${dayStem} 일간과 ${gyeokguk} 구조를 함께 보아야 하므로, 돈이 들어오는 방식과 새는 지점을 동시에 관리해야 합니다.
2. 강한 ${strongestName} 기운은 수익을 만드는 무기이므로 직업, 사업, 투자 방향에서 적극 활용하는 것이 좋습니다.
3. 부족한 ${weakestName} 기운은 재물 관리의 약점이 될 수 있으므로 생활비, 고정비, 계약, 투자 판단에서 보완 장치를 두는 것이 좋습니다.
4. 큰돈을 움직일 때는 감각보다 숫자, 계약서, 현금흐름표를 기준으로 판단해야 합니다.
5. 이 사주의 재물운은 ${gyeokguk}의 특성이 살아나는 환경에서 가장 현실적으로 커질 가능성이 높습니다.
`;
}