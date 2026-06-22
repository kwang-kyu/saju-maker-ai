export function getYongsinDescription(
    yongsin: string,
    heesin: string,
    gisin: string
  ): string {
    return `용신 ${yongsin}은 현재 사주에서 가장 보완하면 좋은 핵심 기운입니다.
  희신 ${heesin}은 용신을 도와주는 보조 기운으로 함께 활용하면 운의 흐름이 좋아질 수 있습니다.
  기신 ${gisin}은 이미 강하거나 과해지기 쉬운 기운으로 균형을 유지하는 것이 중요합니다.`;
  }
  export function getYongsinSet(
    weakestName: string,
    strongestName: string
  ) {
    const yongsin = weakestName;
  
    const heesin =
      weakestName === "수(水)"
        ? "금(金)"
        : weakestName === "목(木)"
        ? "수(水)"
        : weakestName === "화(火)"
        ? "목(木)"
        : weakestName === "토(土)"
        ? "화(火)"
        : "토(土)";
  
    const gisin = strongestName;
  
    const yongsinDescription = getYongsinDescription(
      yongsin,
      heesin,
      gisin
    );
  
    return {
      yongsin,
      heesin,
      gisin,
      yongsinDescription,
    };
  }