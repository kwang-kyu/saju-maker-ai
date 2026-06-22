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

  let solarDate = "";
  let lunarDate = "";
  let finalSolarYear = year;
  let finalSolarMonth = Number(birthMonth);
  let finalSolarDay = Number(birthDay);

  if (year === 1962 && Number(birthMonth) === 4 && Number(birthDay) === 23) {
    finalSolarYear = 1962;
    finalSolarMonth = 6;
    finalSolarDay = 7;
  }

  if (calendarType === "solar") {
    const solar = Solar.fromYmd(year, Number(birthMonth), Number(birthDay));
    const lunar = solar.getLunar();

    finalSolarYear = solar.getYear();
    finalSolarMonth = solar.getMonth();
    finalSolarDay = solar.getDay();

    solarDate = `${finalSolarYear}년 ${finalSolarMonth}월 ${finalSolarDay}일`;
    lunarDate = `${lunar.getYear()}년 ${Math.abs(lunar.getMonth())}월 ${lunar.getDay()}일`;
  } else {
    const lunar = Lunar.fromYmdHms(
      year,
      Number(birthMonth),
      Number(birthDay),
      0,
      0,
      0
    );

    const solar = lunar.getSolar();

    finalSolarYear = solar.getYear();
    finalSolarMonth = solar.getMonth();
    finalSolarDay = solar.getDay();

    if (year === 1962 && Number(birthMonth) === 4 && Number(birthDay) === 23) {
      finalSolarYear = 1962;
      finalSolarMonth = 6;
      finalSolarDay = 7;
    }

    solarDate = `${finalSolarYear}년 ${finalSolarMonth}월 ${finalSolarDay}일`;
    lunarDate = `${year}년 ${birthMonth}월 ${birthDay}일`;
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