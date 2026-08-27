/** Normalises extracted PDF text so chunks stay readable for the LLM. */
export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/-\n(?=\w)/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s*page\s+\d+\s*(of\s+\d+)?\s*$/gim, "")
    .trim();
}
