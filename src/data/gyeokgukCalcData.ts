export function getGyeokgukByMonthTenGod(monthTenGod: string): string {
    const tenGod = (monthTenGod || "").trim();
  
    switch (tenGod) {
      case "정관":
        return "정관격";
      case "편관":
      case "칠살":
        return "편관격";
      case "정재":
        return "정재격";
      case "편재":
        return "편재격";
      case "식신":
        return "식신격";
      case "상관":
        return "상관격";
      case "정인":
        return "정인격";
      case "편인":
        return "편인격";
      case "비견":
        return "비견격";
      case "겁재":
        return "겁재격";
      default:
        return "일반격";
    }
  }