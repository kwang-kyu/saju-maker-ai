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
    reportTitle: "천운문 AI 종합상담 리포트",
    fileSuffix: "AI_종합상담리포트",
  });
}

