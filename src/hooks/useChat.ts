import { useState, useCallback } from "react";
import { sendMessage } from "../services/geminiService";
import type { Message } from "../types";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setLoading(true);
    setError(null);

    // Optimistically add the user's message to the UI
    const userTurn: Message = { role: "user", parts: [{ text: userMessage }] };
    setMessages(prev => [...prev, userTurn]);

    try {
      // Pass the PREVIOUS messages array and the new message text to the service
      const { text, sources } = await sendMessage(
        messages, // This is the state BEFORE the current user message was added
        userMessage
      );

      // Add the bot's response to the UI
      const botMessage: Message = { role: "model", parts: [{ text }], sources };
      setMessages((prev) => [...prev, botMessage]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      // On error, revert the optimistic UI update by removing the last message
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [messages]);

  // The `sources` state is no longer needed as it's part of each message
  return { messages, loading, error, handleSendMessage };
};
