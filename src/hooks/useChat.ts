import { useState, useCallback, useRef, useEffect } from "react";
import {
  ChatMessage,
  Sender,
  GroundingSource,
  ErrorState,
  ApiStatus,
} from "../types";
import {
  initializeChatSession,
  sendMessageToChat,
  GeminiErrorCode,
  type ChatSession,
} from "../services/geminiService";

export const useChat = (initialMessages: ChatMessage[] = []) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [apiStatus, setApiStatus] = useState<ApiStatus>(ApiStatus.IDLE);
  const [error, setError] = useState<ErrorState | null>(null);
  const chatSessionRef = useRef<ChatSession | null>(null);
  const isMountedRef = useRef(true);

  const isLoading = apiStatus === ApiStatus.LOADING;
  const isError = apiStatus === ApiStatus.ERROR;

  const initChat = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setApiStatus(ApiStatus.LOADING);
      setError(null);
      const session = await initializeChatSession();
      chatSessionRef.current = session;

      if (isMountedRef.current) {
        if (messages.length === 0) {
          const welcomeMessage: ChatMessage = {
            id: crypto.randomUUID(),
            sender: Sender.AI,
            text: "Вітаю! Я ваш AI-асистент. Як я можу вам допомогти сьогодні?",
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
        }
        setApiStatus(ApiStatus.SUCCESS);
      }
    } catch (err) {
      console.error("Initialization error:", err);
      if (isMountedRef.current) {
        const error = err as Error;
        setError({
          message: error.message || "Помилка ініціалізації чату.",
          code: (error as any).cause?.code || GeminiErrorCode.UNKNOWN_ERROR,
          isRecoverable: true,
        });
        setApiStatus(ApiStatus.ERROR);
      }
    }
  }, [messages.length]);

  useEffect(() => {
    initChat();
    return () => {
      isMountedRef.current = false;
    };
  }, [initChat]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedInput = content.trim();
      if (!trimmedInput || isLoading || !chatSessionRef.current) {
        if (!chatSessionRef.current) {
          setError({
            message: "Сесія чату не активна. Спробуйте оновити сторінку.",
            code: "CHAT_SESSION_ERROR",
            isRecoverable: true,
          });
        }
        return false;
      }

      setApiStatus(ApiStatus.LOADING);
      setError(null);

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: Sender.USER,
        text: trimmedInput,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const { text: aiText, sources } = await sendMessageToChat(
          chatSessionRef.current,
          trimmedInput,
        );

        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          sender: Sender.AI,
          text: aiText,
          timestamp: new Date(),
          sources: sources as GroundingSource[],
        };

        setMessages((prev) => [...prev, aiMessage]);
        setApiStatus(ApiStatus.SUCCESS);
        return true;
      } catch (err) {
        console.error("Error sending message:", err);
        const error = err as Error;
        const errorCode = (error as any).cause?.code || "UNKNOWN_ERROR";

        const errorState: ErrorState = {
          message: error.message || "Виникла невідома помилка.",
          code: errorCode,
          isRecoverable: errorCode !== GeminiErrorCode.INVALID_API_KEY,
        };
        setError(errorState);

        // Add an error message to the chat history for recoverable errors
        if (errorState.isRecoverable) {
          const errorAiMessage: ChatMessage = {
            id: crypto.randomUUID(),
            sender: Sender.AI,
            text: `Вибачте, сталася помилка: ${errorState.message}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorAiMessage]);
        }

        setApiStatus(ApiStatus.ERROR);
        return false;
      }
    },
    [isLoading],
  );

  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.sender === Sender.USER);

    if (lastUserMessage) {
      // Find the index of the last user message and slice the array up to that point
      const lastMessageIndex = messages.findIndex(
        (m) => m.id === lastUserMessage.id,
      );
      setMessages((prev) => prev.slice(0, lastMessageIndex));
      // Resend the message
      await sendMessage(lastUserMessage.text);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    sendMessage,
    isLoading,
    isTyping: isLoading, // isTyping can be derived from isLoading
    error,
    isError,
    retryLastMessage,
    reinitializeChat: initChat,
    clearError: () => setError(null),
  };
};
