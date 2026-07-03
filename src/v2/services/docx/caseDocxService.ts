import {
  downloadDetailDocx,
  type DocxSection,
} from "./detailDocxService";

export async function downloadCaseDocx({
  name,
  sections,
}: {
  name: string;
  sections: DocxSection[];
}) {
  await downloadDetailDocx({
    name,
    sections,
    reportTitle: "천운문 주제별 상담 리포트",
    fileSuffix: "주제별_상담리포트",
  });
}

