type MoneyDetailInput = {
    name: string;
    dayStem: string;
    gyeokguk: string;
    strengthType: string;
    strongestName: string;
    weakestName: string;
    moneyScore: number;
    moneyPersonalTypeText: string;
  };
  
  export function getMoneyDetailText({
    name,
    dayStem,
    gyeokguk,
    strongestName,
    weakestName,
    moneyScore,
    moneyPersonalTypeText,
  }: MoneyDetailInput) {
    return `💰 재물운 상세 분석

${name}님의 재물운은 ${dayStem} 일간의 수익 방식과 ${gyeokguk}의 재물 구조를 중심으로 해석합니다.

💰 재물운 점수: ${moneyScore}점 ${"⭐".repeat(
  Math.max(1, Math.ceil(moneyScore / 20))
)}
  
  ■ 재물 구조
  ${moneyPersonalTypeText}
  
 ■ 현실 조언
돈이 들어오는 방식과 돈이 새는 지점을 함께 관리해야 합니다.
강한 ${strongestName} 기운은 직업·영업·투자·사업 방향에서 수익을 만드는 무기로 활용할 수 있습니다.
부족한 ${weakestName} 기운은 생활비, 고정비, 계약, 투자 판단에서 보완 장치를 두는 것이 좋습니다.
큰돈을 움직일 때는 감각보다 숫자, 계약서, 현금흐름표를 기준으로 판단해야 합니다.
${gyeokguk} 구조에서는 본인이 일하는 방식과 돈의 흐름을 함께 정리할수록 재물운이 현실적으로 커집니다.
  `;
  }