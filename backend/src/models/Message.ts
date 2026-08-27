import { Schema, model, type Document as MDoc, type Types } from "mongoose";

export interface IMessageSource {
  documentId: string;
  documentName: string;
  page: number;
  snippet: string;
  category?: string;
  score?: number;
}

export interface IMessage extends MDoc {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  sources: IMessageSource[];
  chunksRetrieved: number;
  chunksUsed: number;
  averageScore: number;
  answered: boolean;
}

const sourceSchema = new Schema<IMessageSource>(
  {
    documentId: String,
    documentName: String,
    page: Number,
    snippet: String,
    category: String,
    score: Number,
  },
  { _id: false }
);

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    sources: { type: [sourceSchema], default: [] },
    chunksRetrieved: { type: Number, default: 0 },
    chunksUsed: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    answered: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Message = model<IMessage>("Message", messageSchema);
