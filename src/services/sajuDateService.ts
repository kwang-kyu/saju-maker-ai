import { Lunar, Solar } from "lunar-javascript";

type SajuDateParams = {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  calendarType: string;
};

export function convertToSajuSolarDate({
  birthYear,
  birthMonth,
  birthDay,
  calendarType,
}: SajuDateParams) {
  const year = Number(birthYear);
  const month = Number(birthMonth);
  const day = Number(birthDay);

  let solarDate = "";
  let lunarDate = "";
  let finalSolarYear = year;
  let finalSolarMonth = month;
  let finalSolarDay = day;

  if (calendarType === "solar") {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    finalSolarYear = solar.getYear();
    finalSolarMonth = solar.getMonth();
    finalSolarDay = solar.getDay();

    solarDate = `${finalSolarYear}년 ${finalSolarMonth}월 ${finalSolarDay}일`;
    lunarDate = `${lunar.getYear()}년 ${Math.abs(lunar.getMonth())}월 ${lunar.getDay()}일`;
  } else {
    const lunar = Lunar.fromYmdHms(year, month, day, 0, 0, 0);
    const solar = lunar.getSolar();

    finalSolarYear = solar.getYear();
    finalSolarMonth = solar.getMonth();
    finalSolarDay = solar.getDay();

    solarDate = `${finalSolarYear}년 ${finalSolarMonth}월 ${finalSolarDay}일`;
    lunarDate = `${year}년 ${month}월 ${day}일`;
  }

  return {
    year,
    solarDate,
    lunarDate,
    finalSolarYear,
    finalSolarMonth,
    finalSolarDay,
  };
}
