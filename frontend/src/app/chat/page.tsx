"use client";

import { ChatWorkspace } from "@/components/ChatWorkspace";
import { Protected } from "@/components/Protected";
import { SiteHeader } from "@/components/SiteHeader";

export default function ChatPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Protected>
        <ChatWorkspace />
      </Protected>
    </div>
  );
}
