import { Document, Packer, type Paragraph } from "docx";
import { saveAs } from "file-saver";

import {
  createHeader,
  createFooter,
} from "./docxHeaderFooter";

export async function buildAndSaveDocx({
  name,
  fileSuffix,
  children,
}: {
  name: string;
  fileSuffix: string;
  children: Paragraph[];
}) {
  const doc = new Document({
    sections: [
      {
        headers: {
          default: createHeader(),
        },
        footers: {
          default: createFooter(),
        },
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${name}_천운문_${fileSuffix}.docx`);
}
