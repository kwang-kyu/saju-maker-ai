export function getSeunCombinationText(params: {
    monthBranch: string;
    seunTenGod: string;
    strengthType: string;
    daeunTenGod: string;
  }): string {
    const { monthBranch, seunTenGod, strengthType, daeunTenGod } = params;
  
    const key = `${monthBranch}-${seunTenGod}-${strengthType}-${daeunTenGod}`;
  
    const map: Record<string, string> = {
      "자-편재-신강-편재":
        "자월 출생의 신강 사주가 편재 대운과 편재 세운을 동시에 만나면 외부 거래, 투자, 부동산, 사업 확장 기회가 크게 움직입니다. 다만 돈의 흐름이 빨라지므로 현금 회수 구조와 계약 조건을 먼저 확인해야 합니다.",
  
      "자-정재-신약-정인":
        "자월 출생의 신약 사주가 정인 대운 속에서 정재 세운을 만나면 무리한 확장보다 안정적인 수입, 문서, 급여, 임대수익, 장기 계약을 정리하기 좋은 흐름입니다.",
  
      "묘-정관-신강-정관":
        "묘월 출생의 신강 사주가 정관 대운과 정관 세운을 만나면 사회적 책임과 평가가 커지는 시기입니다. 직책, 명예, 조직 내 신뢰는 올라갈 수 있지만 지나친 자기주장은 평판을 흔들 수 있습니다.",
  
      "사-상관-신강-편재":
        "사월 출생의 신강 사주가 편재 대운 속에서 상관 세운을 만나면 콘텐츠, 영업, 홍보, 사업 아이디어가 돈으로 연결되기 좋은 흐름입니다. 다만 말과 계약이 앞서면 손실이 생길 수 있습니다.",
  
      "유-편관-신약-정인":
        "유월 출생의 신약 사주가 정인 대운 속에서 편관 세운을 만나면 책임과 압박이 들어오지만 문서, 자격, 제도, 귀인의 도움으로 버틸 수 있는 흐름입니다. 건강과 스트레스 관리를 함께 보아야 합니다.",
    };
  
    return (
      map[key] ||
      `${monthBranch}월 출생의 ${strengthType} 구조에서 ${daeunTenGod} 대운과 ${seunTenGod} 세운이 함께 작용하는 시기입니다. 이 조합은 재물·직업·관계·건강의 방향을 동시에 흔들 수 있으므로, 무리한 확장보다 현재 사주의 강점과 부족한 기운을 기준으로 선택하는 것이 중요합니다.`
    );
  }