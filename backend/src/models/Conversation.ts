import { Schema, model, type Document as MDoc, type Types } from "mongoose";

export interface IConversation extends MDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  lastMessageAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "New conversation" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Conversation = model<IConversation>("Conversation", conversationSchema);
