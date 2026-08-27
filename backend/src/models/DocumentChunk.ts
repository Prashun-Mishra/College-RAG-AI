import { Schema, model, type Document as MDoc, type Types } from "mongoose";

export interface IDocumentChunk extends MDoc {
  _id: Types.ObjectId;
  documentId: Types.ObjectId;
  documentName: string;
  chunkIndex: number;
  content: string;
  pageNumber: number;
  category?: string;
  department?: string;
  year?: number;
  vectorId: string;
}

const chunkSchema = new Schema<IDocumentChunk>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true, index: true },
    documentName: { type: String, required: true },
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    pageNumber: { type: Number, default: 1 },
    category: { type: String, index: true },
    department: { type: String },
    year: { type: Number },
    vectorId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// Enables the keyword half of hybrid search.
chunkSchema.index({ content: "text", documentName: "text" });

export const DocumentChunk = model<IDocumentChunk>("DocumentChunk", chunkSchema);
