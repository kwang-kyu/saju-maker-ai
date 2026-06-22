export const getSajuGrade = (
    score: number,
    gyeokguk: string,
    strongestElement: string,
    weakestElement: string
  ) => {
  
    let bonus = 0;
  
    // 격국 가산점
    if (
      gyeokguk === "정관격" ||
      gyeokguk === "편관격" ||
      gyeokguk === "정재격" ||
      gyeokguk === "편재격"
    ) {
      bonus += 5;
    }
  
    if (
      gyeokguk === "식신격" ||
      gyeokguk === "상관격"
    ) {
      bonus += 3;
    }
  
    // 오행 균형
    if (strongestElement !== weakestElement) {
      bonus += 2;
    }
  
    const finalScore = score + bonus;
  
    if (finalScore >= 95) return "S+";
    if (finalScore >= 90) return "S";
    if (finalScore >= 85) return "A+";
    if (finalScore >= 80) return "A";
    if (finalScore >= 75) return "B+";
    if (finalScore >= 70) return "B";
  
    return "C";
  };