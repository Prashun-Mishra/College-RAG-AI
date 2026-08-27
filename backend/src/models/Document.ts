import { Schema, model, type Document as MDoc, type Types } from "mongoose";

export const DOCUMENT_CATEGORIES = [
  "Admissions",
  "Academics",
  "Examinations",
  "Fees",
  "Scholarships",
  "Hostel",
  "Placements",
  "Departments",
  "Library",
  "Student Affairs",
  "Policies",
  "Notices",
  "Events",
  "General",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
export type DocumentStatus = "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";

export interface ICollegeDocument extends MDoc {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  category: DocumentCategory;
  department?: string;
  year?: number;
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  status: DocumentStatus;
  errorMessage?: string;
  pageCount: number;
  chunkCount: number;
  uploadedBy: Types.ObjectId;
}

const documentSchema = new Schema<ICollegeDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: String, enum: DOCUMENT_CATEGORIES, default: "General", index: true },
    department: { type: String, index: true },
    year: { type: Number },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    status: { type: String, enum: ["UPLOADED", "PROCESSING", "PROCESSED", "FAILED"], default: "UPLOADED", index: true },
    errorMessage: { type: String },
    pageCount: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const CollegeDocument = model<ICollegeDocument>("Document", documentSchema);
