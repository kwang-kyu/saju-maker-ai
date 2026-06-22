import { getDayMasterDetail } from "../data/dayMasterData";

export function getSajuDayMaster(dayGanZhi: string) {
  return getDayMasterDetail(String(dayGanZhi).charAt(0));
}