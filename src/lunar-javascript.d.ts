declare module "lunar-javascript" {
  export class Solar {
    static fromYmd(
      year: number,
      month: number,
      day: number,
    ): Solar;

    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Solar;

    static fromDate(
      date: Date,
    ): Solar;

    getLunar(): Lunar;

    getYear(): number;

    getMonth(): number;

    getDay(): number;

    toYmd(): string;
  }

  export class Lunar {
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Lunar;

    getSolar(): Solar;

    getYear(): number;

    getMonth(): number;

    getDay(): number;

    getEightChar(): EightChar;

    getYearInGanZhi(): string;

    getYearInGanZhiExact(): string;

    getYearGan(): string;

    getYearZhi(): string;

    getMonthInGanZhi(): string;

    getMonthInGanZhiExact(): string;

    getMonthGan(): string;

    getMonthZhi(): string;

    getDayInGanZhi(): string;

    getDayInGanZhiExact(): string;

    getJieQi(): string;
  }

  export class EightChar {
    getTime(): string;

    getYun(
      gender: number,
      sect?: number,
    ): Yun;
  }

  class Yun {
    getStartYear(): number;

    getStartMonth(): number;

    getStartDay(): number;

    getStartHour(): number;

    getStartSolar(): Solar;

    isForward(): boolean;

    getDaYun(
      count?: number,
    ): DaYun[];
  }

  class DaYun {
    getIndex(): number;

    getGanZhi(): string;

    getStartYear(): number;

    getEndYear(): number;

    getStartAge(): number;

    getEndAge(): number;
  }
}
