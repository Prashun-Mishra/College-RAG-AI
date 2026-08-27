# CollegeRAG AI — Architecture

## Request lifecycle: asking a question

```text
Browser (chat page)
  │  POST /api/chat  { conversationId?, question, filters? }
  ▼
Express route  →  requireAuth  →  validate  →  chatController.ask
  ▼
chatService.answerQuestion
  ├─ 1. persist user message
  ├─ 2. queryProcessor: normalise question, expand with recent turns
  ├─ 3. embeddings.embedQuery(question)
  ├─ 4. retriever.retrieve
  │      ├─ vectorStore.query (Pinecone, topK, metadata filter)
  │      ├─ keywordSearch (MongoDB $text)        [HYBRID_SEARCH_ENABLED]
  │      └─ reciprocal-rank fusion
  ├─ 5. reranker.rerank (score + query-term overlap) → RERANK_TOP_N
  ├─ 6. guard: best score < MIN_RELEVANCE_SCORE → refusal, no LLM call
  ├─ 7. promptBuilder.build (system rules + numbered context blocks)
  ├─ 8. llmService.streamCompletion (Gemini | OpenRouter)
  └─ 9. persist assistant message with sources + retrieval metadata
  ▼
SSE stream: meta → token* → done
```

## Request lifecycle: ingesting a document

```text
Admin upload (multipart)
  ▼
multer (PDF only, size-capped, stored in UPLOAD_DIR)
  ▼
Document saved with status UPLOADED  → response returns immediately
  ▼
ingestDocument (async)
  ├─ status = PROCESSING
  ├─ textExtractor: per-page text
  ├─ textCleaner: strip headers/footers, fix hyphenation, collapse whitespace
  ├─ chunker: sentence-aware chunks (CHUNK_SIZE / CHUNK_OVERLAP) + page numbers
  ├─ embeddings.embedBatch
  ├─ vectorStore.upsert (Pinecone) + DocumentChunk rows (MongoDB)
  └─ status = PROCESSED (chunkCount, pageCount) | FAILED (errorMessage)
```

Ingestion is idempotent: reprocessing deletes the document's existing chunks and vectors first.

## Data model

| Collection | Key fields |
| --- | --- |
| `users` | name, email (unique), passwordHash, role (`student` \| `admin`), department |
| `documents` | title, category, department, year, fileName, filePath, fileSize, pageCount, chunkCount, status, errorMessage, uploadedBy |
| `documentchunks` | documentId, documentName, category, department, year, pageNumber, chunkIndex, text, vectorId, text index for hybrid search |
| `conversations` | userId, title, lastMessageAt |
| `messages` | conversationId, userId, role, content, sources[], retrieval{}, createdAt |
| `feedbacks` | messageId, userId, rating (`up` \| `down`), reason, comment |

Pinecone stores one vector per chunk; the vector id is mirrored on the chunk row so deletes stay in sync.

## Layering rules

- `routes/` — path, middleware and validators only.
- `controllers/` — HTTP shape: parse the request, call a service, send the response.
- `services/` — business logic and persistence; no `req`/`res`.
- `rag/` — pure pipeline modules, each independently replaceable.
- `models/` — Mongoose schemas and indexes.
- `config/` — environment parsing plus MongoDB and Pinecone clients.

Swapping a provider means editing exactly one file: `rag/vectorStore.ts` for the vector database,
`rag/embeddings.ts` for embeddings, `services/llmService.ts` for the LLM.

## Grounding guarantees

1. The system prompt permits only facts present in the supplied context blocks.
2. Every context block is numbered and labelled with document name, page and category, so citations map
   back to real sources.
3. When retrieval returns nothing above `MIN_RELEVANCE_SCORE`, the LLM is bypassed entirely and the
   fixed refusal sentence is returned.
4. Sources are computed server-side from the retrieved chunks, never parsed out of the model's text.

## Frontend structure

```text
frontend/src
├── app/            landing, login, register, chat, documents, documents/upload, admin, settings
├── components/     SiteHeader, SiteFooter, AuthProvider, Protected, chat/*, documents/*
├── lib/            api client (fetch + SSE), types, formatting helpers
└── store/          Zustand auth store persisted to localStorage
```

`AuthProvider` restores the session on mount; `Protected` gates routes and supports `adminOnly`. The chat
page consumes the SSE stream directly so tokens render as they arrive, with a stop control that aborts
the request.
