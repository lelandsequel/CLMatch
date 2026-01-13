import { Document, Packer, Paragraph, TextRun } from "docx";

export async function renderResumeDocx(payload: { fullName: string; content: string }) {
  const paragraphs = payload.content.split("\n").map((line) => new Paragraph(line));
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: payload.fullName, bold: true, size: 32 })]
          }),
          ...paragraphs
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}
