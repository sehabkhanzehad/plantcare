import { useCallback, useRef, useState } from "react";

import type { QuickActionRoute } from "@/constants/quick-actions";
import { typewriterDuration } from "@/lib/typewriter";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  route?: QuickActionRoute;
  /** Typewriter reveal for assistant copy (ChatGPT-style). */
  stream?: boolean;
};

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi, how can I help you?",
  stream: true,
};

const COMING_SOON = "Hey! This feature is coming soon.";

const SCRIPTED: { text: string; route?: QuickActionRoute }[] = [
  {
    text: "You can add a plant anytime from quick actions or the Plants tab.",
    route: "/add-plant",
  },
  {
    text: "Sell cuttings or buy from others in the community shop.",
    route: { pathname: "/community", params: { segment: "shop" } },
  },
  {
    text: "Share tips or ask questions with a community post.",
    route: "/post/create",
  },
  {
    text: "Check your care calendar so nothing gets missed.",
    route: "/calendar",
  },
];

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [typing, setTyping] = useState(false);
  const busy = useRef(false);

  const sendUserMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy.current) return;

    busy.current = true;
    setMessages((prev) => [...prev, { id: id(), role: "user", text: trimmed }]);
    setTyping(true);

    await delay(480);
    setTyping(false);
    setMessages((prev) => [
      ...prev,
      { id: id(), role: "assistant", text: COMING_SOON, stream: true },
    ]);
    await delay(typewriterDuration(COMING_SOON));

    for (const line of SCRIPTED) {
      setTyping(true);
      await delay(360);
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: id(), role: "assistant", text: line.text, route: line.route, stream: true },
      ]);
      await delay(typewriterDuration(line.text));
    }

    busy.current = false;
  }, []);

  return { messages, typing, sendUserMessage };
}
