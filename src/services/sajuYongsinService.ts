import { getYongsinSet } from "../data/yongsinService";

export function getSajuYongsinInfo(
  weakestName: string,
  strongestName: string
) {
  return getYongsinSet(weakestName, strongestName);
}