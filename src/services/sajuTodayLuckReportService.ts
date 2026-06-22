type TodayLuckReportInput = {
    yearLuckReportSectionText: string;
    todayLuckReportSectionText: string;
  };
  
  export function getTodayLuckFullReportText({
    yearLuckReportSectionText,
    todayLuckReportSectionText,
  }: TodayLuckReportInput): string {
    return `${yearLuckReportSectionText}
  
  ${todayLuckReportSectionText}
  `;
  }