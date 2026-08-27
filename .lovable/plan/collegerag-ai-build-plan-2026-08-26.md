# CollegeRAG AI — Build Plan

Build the project exactly as the spec sheet describes: a Next.js frontend and an Express + MongoDB backend with a real RAG pipeline (Pinecone vector store, Gemini/OpenRouter LLM), plus a full README covering local setup.

## Important tradeoff (please read)

The spec's stack is Next.js + Express + MongoDB. This Lovable environment runs a single TanStack Start app in its live preview, so a Next/Express codebase **cannot render in the preview window**. You'll clone the repo and run it locally with the README steps. The Lovable preview will keep showing the placeholder page — that is expected, not a failure.

## Repository layout

```text
CollegeRAG-AI/
├── frontend/          Next.js 15 App Router + TS + Tailwind + Zustand + Lucide
├── backend/           Express + TS + Mongoose + Pinecone + Gemini
├── docs/architecture.md
├── README.md
└── .gitignore
```

## Phases

### Phase 1 — Setup & Auth
- Backend scaffold: `app.ts`, config (`env`, `db`, `vectorDb`), Helmet, CORS, rate limiting, error handler, `GET /api/health`.
- Mongoose models: User, Document, DocumentChunk, Conversation, Message, Feedback.
- Auth: register / login / me / logout, bcrypt hashing, JWT, `auth` + `admin` middleware, express-validator.
- **First registered user is automatically assigned the `admin` role**; every later signup is a `student`.
- Frontend scaffold: Next.js app, design tokens (burgundy accent, warm off-white, charcoal; Libre Baskerville headings + Inter UI), API client, auth store, protected route wrapper, `/login`, `/register`, landing page `/`.

### Phase 2 — Documents & Ingestion
- Secure PDF upload (type + size validation, disk/S3-compatible storage), metadata form (title, category, department, description, year).
- RAG modules: `documentLoader`, `textExtractor` (pdf-parse), text cleaning, `chunker` (configurable size/overlap via env).
- Status machine UPLOADED → PROCESSING → PROCESSED → FAILED, chunk metadata per spec.
- Pages: `/documents` (table with view / reprocess / delete), `/documents/upload`.

### Phase 3 — Embeddings & Vector Search
- `embeddings.ts` (configurable embedding model), `vectorStore.ts` (Pinecone upsert/query/delete by documentId).
- Semantic search with metadata filtering by category / department / year.

### Phase 4 — RAG Answering
- `retriever` → optional `reranker` → `promptBuilder` → `ragService`.
- Grounded system prompt: no invented facts, explicit "couldn't find this information" fallback for unknown questions.
- `POST /api/chat` returns `{ answer, sources[], retrieval: { chunksRetrieved, chunksUsed } }`.

### Phase 5 — Chat Experience
- `/chat` three-pane layout (history · chat · sources), `/chat/[id]`.
- Streaming responses, stop generation, copy, regenerate, suggested questions, skeletons.
- Conversation CRUD + rename + search; feedback endpoints with 👍/👎 and reason codes.

### Phase 6 — Advanced RAG & Admin
- Hybrid search (vector + Mongo text index), reranking toggle, relevance/confidence indicator, knowledge collections.
- `/admin` dashboard (document counts, chunks, questions, recent uploads) and analytics (questions/day, top topics, top documents, feedback split, no-source rate, avg relevance).

### Phase 7 — Polish, Docs & Deployment
- Full responsive pass (mobile history drawer, sources drawer, card-style tables), friendly error copy, `/settings` page.
- `README.md` with: problem statement, architecture diagram, features, RAG pipeline explanation, tech stack, screenshot placeholders, **step-by-step local setup for Node/MongoDB/Pinecone/Gemini**, full env-var tables for both apps, database + vector DB setup, API docs, future improvements.
- `docs/architecture.md`, `.env.example` files, `.gitignore` (never commit `.env`), Vercel + Render deployment notes.

## Technical notes

- All secrets via environment variables only; `.env.example` files document every key (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `PINECONE_API_KEY`, `PINECONE_INDEX`, `EMBEDDING_MODEL`, `CHUNK_SIZE`, `CHUNK_OVERLAP`, `RERANK_ENABLED`, `TOP_K`).
- Strict layering: routes → controllers → services → rag modules; controllers hold no business logic.
- Errors are mapped to user-safe messages; stack traces never leave the server.
