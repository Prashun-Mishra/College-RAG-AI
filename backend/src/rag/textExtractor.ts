import { getDocument, type PDFDocumentProxy } from "pdfjs-dist/legacy/build/pdf.js";
import { ApiError } from "../utils/ApiError";

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractedDocument {
  pages: ExtractedPage[];
  pageCount: number;
}

/**
 * Extracts text page-by-page so every chunk can keep a real page number
 * for citations. Uses pdfjs-dist (modern pdf.js) for robust parsing.
 */
export async function extractPdfText(buffer: Buffer): Promise<ExtractedDocument> {
  let pdf: PDFDocumentProxy;

  try {
    const data = new Uint8Array(buffer);
    pdf = await getDocument({ data, useSystemFonts: true }).promise;
  } catch (err: any) {
    console.error("[extractPdfText] Failed to load PDF:", err?.message || err);
    throw ApiError.badRequest(
      `Failed to parse PDF: ${err?.message || "The file may be corrupted or not a valid PDF."}`
    );
  }

  const pages: ExtractedPage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item: any) => (typeof item.str === "string" ? item.str : ""))
        .join(" ")
        .trim();
      if (text.length > 0) {
        pages.push({ pageNumber: i, text });
      }
    } catch (pageErr: any) {
      console.warn(`[extractPdfText] Skipping page ${i}:`, pageErr?.message);
    }
  }

  // Fallback: if individual page extraction failed, try bulk text
  if (!pages.length) {
    console.error("[extractPdfText] No readable text found. Total pages:", pdf.numPages);
    throw ApiError.badRequest(
      "We couldn't find any readable text in this document. Please ensure the PDF is text-based (not a scanned image) and not empty."
    );
  }

  return { pages, pageCount: pdf.numPages };
}
