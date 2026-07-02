import type { DocxSection } from "./detailDocxService";
import { basicMapper } from "../basic/basicMapper";

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


