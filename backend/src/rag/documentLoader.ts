import fs from "fs/promises";
import { ApiError } from "../utils/ApiError";

export async function loadDocumentBuffer(filePath: string): Promise<Buffer> {
  try {
    return await fs.readFile(filePath);
  } catch {
    throw ApiError.badRequest("The original file could not be found on the server.");
  }
}

export async function removeDocumentFile(filePath: string) {
  await fs.rm(filePath, { force: true });
}
