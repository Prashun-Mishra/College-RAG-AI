"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Conversation } from "@/lib/types";

interface Props {
  conversations: Conversation[];
  activeId?: string;
  loading?: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationSidebar({
  conversations, activeId, loading, onSelect, onNew, onRename, onDelete,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <button onClick={onNew} className="btn btn-primary w-full">
        <Plus size={16} /> New conversation
      </button>

      <div className="relative mt-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)]" />
        <input
          className="field pl-9"
          placeholder="Search conversations"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1">
        {loading &&
          [0, 1, 2].map((i) => <div key={i} className="skeleton mb-2 h-10 w-full" />)}

        {!loading && !filtered.length && (
          <p className="px-1 py-6 text-sm text-[var(--color-ink-soft)]">No conversations yet.</p>
        )}

        {filtered.map((conversation) => (
          <div
            key={conversation._id}
            className={`group flex items-center gap-1 rounded px-2 py-2 text-sm ${
              conversation._id === activeId
                ? "bg-[var(--color-parchment-deep)] text-[var(--color-ink)]"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-parchment-deep)]"
            }`}
          >
            <button onClick={() => onSelect(conversation._id)} className="flex-1 truncate text-left">
              {conversation.title}
            </button>
            <button
              aria-label="Rename conversation"
              className="opacity-0 transition group-hover:opacity-100"
              onClick={() => {
                const title = window.prompt("Rename conversation", conversation.title);
                if (title?.trim()) onRename(conversation._id, title.trim());
              }}
            >
              <Pencil size={14} />
            </button>
            <button
              aria-label="Delete conversation"
              className="opacity-0 transition group-hover:opacity-100 hover:text-[var(--color-crimson)]"
              onClick={() => {
                if (window.confirm("Delete this conversation?")) onDelete(conversation._id);
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
