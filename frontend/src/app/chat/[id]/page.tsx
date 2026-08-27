"use client";

import { use } from "react";
import { ChatWorkspace } from "@/components/ChatWorkspace";
import { Protected } from "@/components/Protected";
import { SiteHeader } from "@/components/SiteHeader";

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Protected>
        <ChatWorkspace conversationId={id} />
      </Protected>
    </div>
  );
}
