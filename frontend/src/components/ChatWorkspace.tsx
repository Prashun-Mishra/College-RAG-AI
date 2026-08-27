"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, PanelLeft, RefreshCw, Send, Square, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { api } from "@/lib/api";
import { streamAnswer } from "@/lib/chatStream";
import type { ChatMessage, Conversation, Retrieval, Source } from "@/lib/types";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { SourcesPanel } from "@/components/SourcesPanel";

const SUGGESTED = [
  "What are the admission requirements?",
  "When do semester exams begin?",
  "What scholarships are available?",
  "What is the hostel fee?",
  "Tell me about placement eligibility.",
];

const FEEDBACK_REASONS = [
  { value: "incorrect", label: "Incorrect answer" },
  { value: "missing_information", label: "Missing information" },
  { value: "poor_source", label: "Poor source" },
  { value: "not_relevant", label: "Not relevant" },
  { value: "other", label: "Other" },
];

export function ChatWorkspace({ conversationId }: { conversationId?: string }) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeSources, setActiveSources] = useState<Source[]>([]);
  const [retrieval, setRetrieval] = useState<Retrieval | undefined>();
  const [question, setQuestion] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackFor, setFeedbackFor] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastQuestionRef = useRef<string>("");

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await api<{ conversations: Conversation[] }>("/chat/conversations");
      setConversations(data.conversations);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setActiveSources([]);
      setRetrieval(undefined);
      return;
    }
    void (async () => {
      try {
        const data = await api<{ messages: ChatMessage[] }>(`/chat/conversations/${conversationId}`);
        setMessages(data.messages);
        const lastAssistant = [...data.messages].reverse().find((m) => m.role === "assistant");
        setActiveSources(lastAssistant?.sources ?? []);
        setRetrieval(
          lastAssistant
            ? {
                chunksRetrieved: lastAssistant.chunksRetrieved ?? 0,
                chunksUsed: lastAssistant.chunksUsed ?? lastAssistant.sources?.length ?? 0,
                confidence: (lastAssistant.sources?.length ?? 0) > 2 ? "high" : "medium",
                averageScore: 0,
              }
            : undefined
        );
      } catch {
        setError("This conversation could not be loaded.");
      }
    })();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    lastQuestionRef.current = trimmed;
    setQuestion("");
    setError(null);
    setStreaming(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed },
      { role: "assistant", content: "", pending: true },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamAnswer(
        { question: trimmed, conversationId },
        {
          onMeta: (data) => {
            setActiveSources(data.sources);
            setRetrieval(data.retrieval);
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last) next[next.length - 1] = { ...last, sources: data.sources, retrieval: data.retrieval };
              return next;
            });
            if (!conversationId) router.replace(`/chat/${data.conversationId}`);
          },
          onToken: (token) =>
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last) next[next.length - 1] = { ...last, content: last.content + token, pending: false };
              return next;
            }),
          onError: (message) => setError(message),
          onDone: (data) => {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last) next[next.length - 1] = { ...last, _id: data.messageId, pending: false };
              return next;
            });
            void loadConversations();
          },
        },
        controller.signal
      );
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "The AI service is temporarily unavailable.");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const regenerate = () => {
    if (!lastQuestionRef.current) return;
    setMessages((prev) => prev.slice(0, -2));
    void send(lastQuestionRef.current);
  };

  const copy = async (message: ChatMessage) => {
    await navigator.clipboard.writeText(message.content);
    setCopiedId(message._id ?? message.content.slice(0, 12));
    setTimeout(() => setCopiedId(null), 1500);
  };

  const sendFeedback = async (messageId: string, rating: "up" | "down", reason?: string) => {
    await api("/feedback", {
      method: "POST",
      body: JSON.stringify({ messageId, rating, reason }),
    }).catch(() => undefined);
    setFeedbackFor(null);
  };

  const newConversation = () => {
    setShowHistory(false);
    router.push("/chat");
  };

  const renameConversation = async (id: string, title: string) => {
    await api(`/chat/conversations/${id}`, { method: "PATCH", body: JSON.stringify({ title }) });
    void loadConversations();
  };

  const deleteConversation = async (id: string) => {
    await api(`/chat/conversations/${id}`, { method: "DELETE" });
    if (id === conversationId) router.push("/chat");
    void loadConversations();
  };

  const sidebar = (
    <ConversationSidebar
      conversations={conversations}
      activeId={conversationId}
      loading={loadingList}
      onSelect={(id) => {
        setShowHistory(false);
        router.push(`/chat/${id}`);
      }}
      onNew={newConversation}
      onRename={renameConversation}
      onDelete={deleteConversation}
    />
  );

  return (
    <div className="mx-auto grid h-[calc(100vh-4rem)] w-full max-w-[1500px] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
      <aside className="hidden border-r border-[var(--color-line)] bg-white p-4 lg:block">{sidebar}</aside>

      <section className="flex min-h-0 flex-col">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-white px-4 py-3 lg:hidden">
          <button className="btn btn-outline" onClick={() => setShowHistory(true)}>
            <PanelLeft size={15} /> History
          </button>
          <button className="btn btn-outline" onClick={() => setShowSources(true)}>
            Sources ({activeSources.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {!messages.length && (
            <div className="mx-auto max-w-2xl">
              <h1 className="text-2xl">Ask about your college</h1>
              <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
                Answers are drawn only from official documents published by the institution, with the
                source and page cited.
              </p>
              <div className="mt-8 space-y-2">
                {SUGGESTED.map((item) => (
                  <button
                    key={item}
                    onClick={() => void send(item)}
                    className="card w-full px-4 py-3 text-left text-sm transition hover:border-[var(--color-crimson)]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((message, index) => (
              <article key={message._id ?? index} className={message.role === "user" ? "text-right" : ""}>
                <p className="mb-1 text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
                  {message.role === "user" ? "You" : "CollegeRAG AI"}
                </p>

                {message.role === "user" ? (
                  <div className="inline-block max-w-[85%] rounded bg-[var(--color-parchment-deep)] px-4 py-3 text-sm">
                    {message.content}
                  </div>
                ) : (
                  <div className="card p-5">
                    {message.pending && !message.content ? (
                      <div className="space-y-2">
                        <div className="skeleton h-3 w-full" />
                        <div className="skeleton h-3 w-11/12" />
                        <div className="skeleton h-3 w-3/5" />
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    )}

                    {!!message.sources?.length && (
                      <div className="mt-4 border-t border-[var(--color-line)] pt-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">Sources</p>
                        <ul className="mt-2 space-y-1 text-xs text-[var(--color-ink-soft)]">
                          {message.sources.map((source, i) => (
                            <li key={`${source.documentId}-${i}`}>
                              <span className="text-[var(--color-ink)]">{source.documentName}</span> · Page{" "}
                              {source.page}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!message.pending && (
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-[var(--color-ink-soft)]">
                        <button onClick={() => void copy(message)} className="chat-action-btn">
                          {copiedId === (message._id ?? message.content.slice(0, 12)) ? (
                            <Check size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                          Copy
                        </button>
                        <button onClick={regenerate} className="chat-action-btn">
                          <RefreshCw size={14} /> Regenerate
                        </button>
                        {message._id && (
                          <>
                            <button
                              onClick={() => void sendFeedback(message._id!, "up")}
                              className="chat-action-btn"
                              aria-label="Helpful"
                            >
                              <ThumbsUp size={14} />
                            </button>
                            <button
                              onClick={() => setFeedbackFor(message._id!)}
                              className="chat-action-btn"
                              aria-label="Not helpful"
                            >
                              <ThumbsDown size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {feedbackFor === message._id && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--color-line)] pt-3">
                        {FEEDBACK_REASONS.map((reason) => (
                          <button
                            key={reason.value}
                            onClick={() => void sendFeedback(message._id!, "down", reason.value)}
                            className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs hover:border-[var(--color-crimson)]"
                          >
                            {reason.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-[var(--color-line)] bg-white px-4 py-4 sm:px-8">
          {error && <p className="mx-auto mb-3 max-w-3xl text-sm text-[var(--color-crimson)]">{error}</p>}
          <form
            className="mx-auto flex max-w-3xl items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void send(question);
            }}
          >
            <textarea
              className="field min-h-[48px] resize-none"
              rows={1}
              placeholder="Ask about admissions, exams, fees, scholarships..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(question);
                }
              }}
            />
            {streaming ? (
              <button type="button" onClick={stop} className="btn btn-outline">
                <Square size={14} /> Stop
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={!question.trim()}>
                <Send size={15} /> Ask
              </button>
            )}
          </form>
        </div>
      </section>

      <aside className="hidden border-l border-[var(--color-line)] bg-white p-4 lg:block">
        <SourcesPanel sources={activeSources} retrieval={retrieval} />
      </aside>

      {showHistory && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="w-72 bg-white p-4">
            <div className="mb-3 flex justify-end">
              <button onClick={() => setShowHistory(false)} aria-label="Close history">
                <X size={18} />
              </button>
            </div>
            {sidebar}
          </div>
          <button className="flex-1 bg-black/30" aria-label="Close" onClick={() => setShowHistory(false)} />
        </div>
      )}

      {showSources && (
        <div className="fixed inset-0 z-40 flex justify-end lg:hidden">
          <button className="flex-1 bg-black/30" aria-label="Close" onClick={() => setShowSources(false)} />
          <div className="w-80 overflow-y-auto bg-white p-4">
            <div className="mb-3 flex justify-end">
              <button onClick={() => setShowSources(false)} aria-label="Close sources">
                <X size={18} />
              </button>
            </div>
            <SourcesPanel sources={activeSources} retrieval={retrieval} />
          </div>
        </div>
      )}
    </div>
  );
}
