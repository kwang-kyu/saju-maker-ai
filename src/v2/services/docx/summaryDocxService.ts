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
    reportTitle: "Summary Report",
    fileSuffix: "요약리포트",
  });
}
