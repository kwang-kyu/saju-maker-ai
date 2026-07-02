import {
  downloadDetailDocx,
  type DocxSection,
} from "./detailDocxService";

export async function downloadAiDocx({
  name,
  sections,
}: {
  name: string;
  sections: DocxSection[];
}) {
  await downloadDetailDocx({
    name,
    sections,
    reportTitle: "AI Total Consulting Report",
    fileSuffix: "AI_종합상담리포트",
  });
}
