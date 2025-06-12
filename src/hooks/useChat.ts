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
} from "../services/geminiService";
import type { Chat } from "@google/genai";

export const useChat = (initialMessages: ChatMessage[] = []) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [apiStatus, setApiStatus] = useState<ApiStatus>(ApiStatus.IDLE);
  const [error, setError] = useState<ErrorState | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const isLoading = apiStatus === ApiStatus.LOADING;

  // Initialize chat session
  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      try {
        if (isMounted) setApiStatus(ApiStatus.LOADING);
        const session = await initializeChatSession();
        if (!session) {
          if (isMounted) {
            setIsApiKeyMissing(true);
            setError({
              message: `API ключ не налаштовано. Будь ласка, налаштуйте ваш API ключ у файлі .env`,
              code: GeminiErrorCode.INVALID_API_KEY,
              isRecoverable: false,
            });
            setApiStatus(ApiStatus.ERROR);
          }
          return;
        }
        chatSessionRef.current = session;

        if (isMounted && initialMessages.length === 0) {
          const welcomeMessage: ChatMessage = {
            id: crypto.randomUUID(),
            sender: Sender.AI,
            text: "Вітаю! Я ваш AI-асистент. Як я можу вам допомогти сьогодні?",
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
        } else if (isMounted) {
          setMessages(initialMessages);
        }

        if (isMounted) setApiStatus(ApiStatus.SUCCESS);
      } catch (error) {
        console.error("Initialization error:", error);
        if (isMounted) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Помилка ініціалізації чату";
          setError({
            message: errorMessage,
            code: GeminiErrorCode.UNKNOWN_ERROR,
            isRecoverable: true,
          });
          setApiStatus(ApiStatus.ERROR);
        }
      }
    };

    initChat();

    return () => {
      isMounted = false;
    };
  }, [initialMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedInput = content.trim();
      if (
        !trimmedInput ||
        isLoading ||
        isApiKeyMissing ||
        !chatSessionRef.current
      ) {
        if (!chatSessionRef.current && !isApiKeyMissing) {
          setError({
            message: "Сесія чату не активна. Будь ласка, оновіть сторінку.",
            code: "CHAT_SESSION_ERROR",
            isRecoverable: true,
          });
        }
        return false;
      }

      setIsTyping(true);
      setError(null);

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: Sender.USER,
        text: trimmedInput,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setApiStatus(ApiStatus.LOADING);

      try {
        const { text: aiText, sources: aiSources } = await sendMessageToChat(
          chatSessionRef.current,
          trimmedInput,
        );

        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate typing delay

        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          sender: Sender.AI,
          text: aiText,
          sources: aiSources as GroundingSource[],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
        setApiStatus(ApiStatus.SUCCESS);
        return true;
      } catch (error) {
        console.error("Error sending message:", error);

        let errorMessage =
          "Виникла помилка під час обробки вашого запиту. Будь ласка, спробуйте пізніше.";
        let errorCode = "UNKNOWN_ERROR";

        if (error instanceof Error) {
          errorMessage = error.message || errorMessage;
          errorCode = (error as any).cause?.code || errorCode;
        }

        const errorState: ErrorState = {
          message: errorMessage,
          code: errorCode,
          isRecoverable: errorCode !== GeminiErrorCode.INVALID_API_KEY,
        };

        setError(errorState);

        if (errorState.isRecoverable) {
          const errorAiMessage: ChatMessage = {
            id: crypto.randomUUID(),
            sender: Sender.AI,
            text: `Вибачте, сталася помилка: ${errorMessage}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorAiMessage]);
        }

        setApiStatus(ApiStatus.ERROR);
        return false;
      } finally {
        setIsTyping(false);
      }
    },
    [isLoading, isApiKeyMissing],
  );

  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.sender === Sender.USER);
    if (lastUserMessage) {
      return sendMessage(lastUserMessage.text);
    }
    return false;
  }, [messages, sendMessage]);

  return {
    messages,
    sendMessage,
    isTyping,
    error,
    isLoading,
    isApiKeyMissing,
    retryLastMessage,
    clearError: () => setError(null),
  };
};
