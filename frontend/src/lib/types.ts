export type Role = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string | null;
}

export interface Source {
  documentId: string;
  documentName: string;
  page: number;
  snippet: string;
  category?: string;
  score?: number;
}

export interface Retrieval {
  chunksRetrieved: number;
  chunksUsed: number;
  confidence: "high" | "medium" | "low";
  averageScore: number;
}

export interface ChatMessage {
  _id?: string;
  id?: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  retrieval?: Retrieval;
  chunksRetrieved?: number;
  chunksUsed?: number;
  answered?: boolean;
  pending?: boolean;
}

export interface Conversation {
  _id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
}

export type DocumentStatus = "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";

export interface CollegeDocument {
  _id: string;
  title: string;
  description?: string;
  category: string;
  department?: string;
  year?: number;
  status: DocumentStatus;
  errorMessage?: string;
  pageCount: number;
  chunkCount: number;
  fileUrl: string;
  createdAt: string;
  uploadedBy?: { name: string; email: string };
}

export const CATEGORIES = [
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
