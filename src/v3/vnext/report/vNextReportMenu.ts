/**
 * Product Report UI menu identifiers (5 tabs).
 * Not related to ReportAnswerSection / Blueprint contracts.
 */
export type ProductReportMenu =
  | "chongun"
  | "year"
  | "today"
  | "todayLove"
  | "todayMoney";

export const PRODUCT_REPORT_MENUS = [
  "chongun",
  "year",
  "today",
  "todayLove",
  "todayMoney",
] as const satisfies readonly ProductReportMenu[];
