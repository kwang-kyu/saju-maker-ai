import { loveConsulting } from "../love/loveConsulting";
import { getHealthConsulting } from "../health/healthConsulting";

export function buildDetailDocxLoveHealthSections({
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
      title: "연애 상담",
      content:
        buildConsultingPersonalNote({
          name,
          birthDate,
          birthTime,
          gender,
          calendarType,
          area: "연애 상담",
        }) +
        "\n\n" +
        sajuPersonalNote +
        "\n\n" +
        loveConsulting(mappedBasic),
    },
    {
      title: "건강 상담",
      content:
        buildConsultingPersonalNote({
          name,
          birthDate,
          birthTime,
          gender,
          calendarType,
          area: "건강 상담",
        }) +
        "\n\n" +
        sajuPersonalNote +
        "\n\n" +
        getHealthConsulting(mappedBasic),
    },
  ];
}
