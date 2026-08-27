import type { Request, Response } from "express";
import * as documentService from "../services/documentService";
import { DOCUMENT_CATEGORIES } from "../models/Document";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const listDocuments = asyncHandler(async (req: Request, res: Response) => {
  const documents = await documentService.listDocuments({
    category: req.query.category as string | undefined,
    status: req.query.status as string | undefined,
    search: req.query.search as string | undefined,
  });
  res.json({ documents, categories: DOCUMENT_CATEGORIES });
});

export const getDocument = asyncHandler(async (req: Request, res: Response) => {
  res.json(await documentService.getDocument(req.params.id));
});

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("Please attach a PDF file.");
  if (!req.user) throw ApiError.unauthorized();

  const doc = await documentService.createDocument({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category ?? "General",
    department: req.body.department,
    year: req.body.year ? Number(req.body.year) : undefined,
    file: req.file,
    uploadedBy: String(req.user._id),
  });

  // Ingestion runs in the background; the admin table polls for status.
  void documentService.processDocument(String(doc._id)).catch(() => undefined);

  res.status(201).json({ document: doc });
});

export const reprocessDocument = asyncHandler(async (req: Request, res: Response) => {
  void documentService.processDocument(req.params.id).catch(() => undefined);
  res.json({ success: true, status: "PROCESSING" });
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  await documentService.deleteDocument(req.params.id);
  res.json({ success: true });
});
