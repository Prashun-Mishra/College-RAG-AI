import { Schema, model, type Document as MDoc, type Types } from "mongoose";

export interface IFeedback extends MDoc {
  userId: Types.ObjectId;
  messageId: Types.ObjectId;
  rating: "up" | "down";
  reason?: string;
  comment?: string;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    messageId: { type: Schema.Types.ObjectId, ref: "Message", required: true, index: true },
    rating: { type: String, enum: ["up", "down"], required: true },
    reason: {
      type: String,
      enum: ["incorrect", "missing_information", "poor_source", "not_relevant", "other", null],
      default: null,
    },
    comment: { type: String },
  },
  { timestamps: true }
);

feedbackSchema.index({ userId: 1, messageId: 1 }, { unique: true });

export const Feedback = model<IFeedback>("Feedback", feedbackSchema);
