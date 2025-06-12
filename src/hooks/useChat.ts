import { useState, useCallback } from "react";
import { sendMessage } from "../services/geminiService";
import type { Message, GroundingSource } from "../types";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);

  const handleSendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setLoading(true);
    setError(null);

    const newMessages: Message[] = [
      ...messages,
      { role: "user", parts: [{ text: userMessage }] },
    ];
    setMessages(newMessages);

    try {
      const { text, sources: newSources } = await sendMessage(
        newMessages,
        userMessage
      );

      const botMessage: Message = { role: "model", parts: [{ text }] };
      setMessages((prev) => [...prev, botMessage]);
      setSources(newSources);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }, [messages]);

  return { messages, loading, error, sources, handleSendMessage };
};
