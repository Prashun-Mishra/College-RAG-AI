import { CollegeDocument } from "../models/Document";
import { DocumentChunk } from "../models/DocumentChunk";
import { Feedback } from "../models/Feedback";
import { Message } from "../models/Message";

export async function getDashboard() {
  const [total, processed, processing, failed, chunks, questions, recent] = await Promise.all([
    CollegeDocument.countDocuments(),
    CollegeDocument.countDocuments({ status: "PROCESSED" }),
    CollegeDocument.countDocuments({ status: { $in: ["PROCESSING", "UPLOADED"] } }),
    CollegeDocument.countDocuments({ status: "FAILED" }),
    DocumentChunk.countDocuments(),
    Message.countDocuments({ role: "user" }),
    CollegeDocument.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const categories = await CollegeDocument.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);

  return {
    documents: { total, processed, processing, failed },
    totalChunks: chunks,
    totalQuestions: questions,
    topCategories: categories.map((c) => ({ category: c._id, count: c.count })),
    recentUploads: recent,
  };
}

export async function getAnalytics(days = 14) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [perDay, topDocuments, feedback, unanswered, scoreAgg, totalAnswers] = await Promise.all([
    Message.aggregate([
      { $match: { role: "user", createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Message.aggregate([
      { $match: { role: "assistant" } },
      { $unwind: "$sources" },
      { $group: { _id: "$sources.documentName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Feedback.aggregate([{ $group: { _id: "$rating", count: { $sum: 1 } } }]),
    Message.countDocuments({ role: "assistant", answered: false }),
    Message.aggregate([
      { $match: { role: "assistant", answered: true } },
      { $group: { _id: null, avg: { $avg: "$averageScore" } } },
    ]),
    Message.countDocuments({ role: "assistant" }),
  ]);

  const topics = await Message.aggregate([
    { $match: { role: "assistant" } },
    { $unwind: "$sources" },
    { $group: { _id: "$sources.category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);

  return {
    questionsPerDay: perDay.map((d) => ({ date: d._id, count: d.count })),
    topDocuments: topDocuments.map((d) => ({ documentName: d._id, count: d.count })),
    topTopics: topics.filter((t) => t._id).map((t) => ({ category: t._id, count: t.count })),
    feedback: {
      up: feedback.find((f) => f._id === "up")?.count ?? 0,
      down: feedback.find((f) => f._id === "down")?.count ?? 0,
    },
    unansweredQuestions: unanswered,
    totalAnswers,
    averageRelevanceScore: Number((scoreAgg[0]?.avg ?? 0).toFixed(3)),
  };
}
