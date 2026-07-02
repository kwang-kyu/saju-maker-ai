import { getMarriageConsulting } from "../marriage/marriageConsulting";
import { getBusinessConsulting } from "../business/businessConsulting";
import { getRealEstateConsulting } from "../realEstate/realEstateConsulting";

export function buildDetailDocxLifeAssetSections({
  mappedBasic,
  name,
  birthDate,
  birthTime,
  gender,
  calendarType,
  sajuPersonalNote,
  buildConsultingPersonalNote,
}: any) {
  return [
    {
      title: "결혼 상담",
      content:
        buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "결혼 상담" }) +
        "\n\n" +
        sajuPersonalNote +
        "\n\n" +
        getMarriageConsulting(mappedBasic),
    },
    {
      title: "사업 상담",
      content:
        buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "사업 상담" }) +
        "\n\n" +
        sajuPersonalNote +
        "\n\n" +
        getBusinessConsulting(mappedBasic),
    },
    {
      title: "부동산 상담",
      content:
        buildConsultingPersonalNote({ name, birthDate, birthTime, gender, calendarType, area: "부동산 상담" }) +
        "\n\n" +
        sajuPersonalNote +
        "\n\n" +
        getRealEstateConsulting(mappedBasic),
    },
  ];
}
