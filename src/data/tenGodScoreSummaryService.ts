import { getLuckScore, getScoreComment } from "./luckScoreData";
export function getTenGodScore(tenGod: string): number {
    const scoreMap: Record<string, number> = {
      정재: 88,
      편재: 90,
      정관: 87,
      편관: 82,
      정인: 85,
      편인: 78,
      식신: 86,
      상관: 76,
      비견: 74,
      겁재: 70,
    };
  
    return scoreMap[tenGod] || 75;
  }

export function getStarRating(score: number): string {
  if (score >= 90) return "★★★★★";
  if (score >= 85) return "★★★★☆";
  if (score >= 80) return "★★★★";
  if (score >= 75) return "★★★☆";
  if (score >= 70) return "★★★";
  return "★★☆";
}

export function getTenGodScoreSummary(
  yearTenGod: string,
  monthTenGod: string,
  timeTenGod: string
) {
  const yearTenGodScore = getTenGodScore(yearTenGod);
  const monthTenGodScore = getTenGodScore(monthTenGod);
  const timeTenGodScore = getTenGodScore(timeTenGod);

  const yearTenGodStars = getStarRating(yearTenGodScore);
  const monthTenGodStars = getStarRating(monthTenGodScore);
  const timeTenGodStars = getStarRating(timeTenGodScore);

  const totalTenGodScore = Math.round(
    (yearTenGodScore + monthTenGodScore + timeTenGodScore) / 3
  );

  const sajuGradeStars = getStarRating(totalTenGodScore);

  const tenGodMoneyScore = getLuckScore(yearTenGod, "money");
  const tenGodJobScore = getLuckScore(monthTenGod, "job");
  const tenGodLoveScore = getLuckScore(timeTenGod, "love");

  const tenGodMoneyComment = getScoreComment(tenGodMoneyScore);
  const tenGodJobComment = getScoreComment(tenGodJobScore);
  const tenGodLoveComment = getScoreComment(tenGodLoveScore);

  return {
    yearTenGodScore,
    monthTenGodScore,
    timeTenGodScore,
    yearTenGodStars,
    monthTenGodStars,
    timeTenGodStars,
    totalTenGodScore,
    sajuGradeStars,
    tenGodMoneyScore,
    tenGodJobScore,
    tenGodLoveScore,
    tenGodMoneyComment,
    tenGodJobComment,
    tenGodLoveComment,
  };
}