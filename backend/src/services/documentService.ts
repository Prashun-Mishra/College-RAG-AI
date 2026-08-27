import { Types } from "mongoose";
import { CollegeDocument, type ICollegeDocument } from "../models/Document";
import { DocumentChunk } from "../models/DocumentChunk";
import { chunkPages } from "../rag/chunker";
import { loadDocumentBuffer, removeDocumentFile } from "../rag/documentLoader";
import { embedTexts } from "../rag/embeddings";
import { extractPdfText } from "../rag/textExtractor";
import { deleteVectorsByIds, upsertVectors } from "../rag/vectorStore";
import { ApiError } from "../utils/ApiError";

export interface CreateDocumentInput {
  title: string;
  description?: string;
  category: string;
  department?: string;
  year?: number;
  file: Express.Multer.File;
  uploadedBy: string;
}

export async function createDocument(input: CreateDocumentInput) {
  return CollegeDocument.create({
    title: input.title,
    description: input.description,
    category: input.category as ICollegeDocument["category"],
    department: input.department,
    year: input.year,
    fileName: input.file.originalname,
    filePath: input.file.path,
    fileUrl: `/uploads/${input.file.filename}`,
    fileSize: input.file.size,
    status: "UPLOADED",
    uploadedBy: new Types.ObjectId(input.uploadedBy),
  });
}

/** Full ingestion: extract -> clean -> chunk -> embed -> vector store -> metadata. */
export async function processDocument(documentId: string) {
  const doc = await CollegeDocument.findById(documentId);
  if (!doc) throw ApiError.notFound("Document not found.");

  doc.status = "PROCESSING";
  doc.errorMessage = undefined;
  await doc.save();

  try {
    await deleteExistingChunks(doc._id.toString());

    const buffer = await loadDocumentBuffer(doc.filePath);
    const { pages, pageCount } = await extractPdfText(buffer);
    const chunks = chunkPages(pages);

    if (!chunks.length) {
      throw ApiError.badRequest(
        "We couldn't process this document. Please verify that the PDF contains readable text."
      );
    }

    const vectors = await embedTexts(chunks.map((c) => c.content));

    const records = chunks.map((chunk, i) => ({
      id: `${doc._id.toString()}-${chunk.chunkIndex}`,
      values: vectors[i],
      metadata: {
        documentId: doc._id.toString(),
        documentName: doc.title,
        category: doc.category,
        department: doc.department ?? "",
        year: doc.year ?? 0,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        uploadedAt: doc.get("createdAt")?.toISOString?.() ?? new Date().toISOString(),
      },
    }));

    await upsertVectors(records);

    await DocumentChunk.insertMany(
      chunks.map((chunk, i) => ({
        documentId: doc._id,
        documentName: doc.title,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        pageNumber: chunk.pageNumber,
        category: doc.category,
        department: doc.department,
        year: doc.year,
        vectorId: records[i].id,
      }))
    );

    doc.pageCount = pageCount;
    doc.chunkCount = chunks.length;
    doc.status = "PROCESSED";
    await doc.save();
    return doc;
  } catch (error: any) {
    console.error("[processDocument error]:", error);
    doc.status = "FAILED";
    doc.errorMessage = error?.message || "We couldn't process this document. Please check the logs.";
    await doc.save();
    throw error;
  }
}

async function deleteExistingChunks(documentId: string) {
  const chunks = await DocumentChunk.find({ documentId }).select("vectorId").lean();
  if (chunks.length) {
    await deleteVectorsByIds(chunks.map((c) => c.vectorId)).catch(() => undefined);
    await DocumentChunk.deleteMany({ documentId });
  }
}

export async function listDocuments(filters: { category?: string; status?: string; search?: string }) {
  const query: Record<string, unknown> = {};
  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  if (filters.search) query.title = { $regex: filters.search, $options: "i" };
  return CollegeDocument.find(query).sort({ createdAt: -1 }).populate("uploadedBy", "name email").lean();
}

export async function getDocument(id: string) {
  const doc = await CollegeDocument.findById(id).populate("uploadedBy", "name email").lean();
  if (!doc) throw ApiError.notFound("Document not found.");
  const chunks = await DocumentChunk.find({ documentId: id }).sort({ chunkIndex: 1 }).limit(20).lean();
  return { document: doc, sampleChunks: chunks };
}

export async function deleteDocument(id: string) {
  const doc = await CollegeDocument.findById(id);
  if (!doc) throw ApiError.notFound("Document not found.");
  await deleteExistingChunks(id);
  await removeDocumentFile(doc.filePath).catch(() => undefined);
  await doc.deleteOne();
}
