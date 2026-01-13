import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function parseResumeText(fileName: string, buffer: Buffer) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".pdf")) {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }

  if (lowerName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return buffer.toString("utf-8");
}
