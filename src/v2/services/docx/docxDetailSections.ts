import type { DocxSection } from "./detailDocxService";
import { basicMapper } from "../basic/basicMapper";
import { basicConsulting } from "../basic/basicConsulting";
import { totalConsulting } from "../total/totalConsulting";
import { yearConsulting } from "../year/yearConsulting";
import { moneyConsulting } from "../money/moneyConsulting";
import { jobConsulting } from "../job/jobConsulting";

export function buildDetailDocxSections(
  sections: DocxSection[],
): DocxSection[] {
  const detailSections = sections;

  return detailSections;
}

export function buildDetailDocxPreparedData(params: {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: string;
}) {
  const { name, birthDate, birthTime, gender } = params;
  const inputData = { name, birthDate, birthTime, gender };
  const mappedBasic = basicMapper(inputData);

  const sajuPersonalNote = `${name}님은 일간 기준으로 ${mappedBasic.summary}
강하게 살아나는 기운은 ${mappedBasic.strongestElement}, 보완이 필요한 기운은 ${mappedBasic.weakestElement}입니다.
이 흐름은 돈, 일, 관계, 건강, 사업 판단에 함께 반영됩니다.`;

  return {
    inputData,
    mappedBasic,
    sajuPersonalNote,
  };
}



export function buildDetailDocxBaseSections(params: {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: string;
  personalProfile: string;
}) {
  const { name, birthDate, birthTime, gender, personalProfile } = params;
  const { inputData, mappedBasic } = buildDetailDocxPreparedData({
    name,
    birthDate,
    birthTime,
    gender,
  });

  return [
    { title: "상담 기본 정보", content: personalProfile },
    { title: "기본 사주", content: basicConsulting(mappedBasic) },
    { title: "전체 운세", content: totalConsulting(inputData) },
    { title: "올해 운세", content: yearConsulting(inputData) },
  ];
}

export function buildDetailDocxMoneyJobSections(params: {
  mappedBasic: ReturnType<typeof basicMapper>;
  birthDate: string;
  sajuPersonalNote: string;
  moneyPersonalNote: string;
  jobPersonalNote: string;
}) {
  const { mappedBasic, birthDate, moneyPersonalNote, jobPersonalNote } = params;

  return [
    {
      title: "재물운",
      content: moneyPersonalNote + "\n\n" + moneyConsulting(mappedBasic, birthDate),
    },
    {
      title: "직업운",
      content: jobPersonalNote + "\n\n" + jobConsulting(mappedBasic, birthDate),
      
    },
  ];
}




