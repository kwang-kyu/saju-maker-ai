import {
  downloadDetailDocx,
  type DocxSection,
} from "./detailDocxService";

export async function downloadSummaryDocx({
  name,
  sections,
}: {
  name: string;
  sections: DocxSection[];
}) {
  await downloadDetailDocx({
    name,
    sections,
    reportTitle: "천운문 요약 리포트",
    fileSuffix: "요약리포트",
  });
}

