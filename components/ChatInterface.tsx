
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, Sender, GroundingSource } from '../types';
import { MessageBubble } from './MessageBubble';
import { LoadingIndicator } from './LoadingIndicator';
import { initializeChatSession, sendMessageToChat } from '../services/geminiService';
import { INPUT_PLACEHOLDER, SEND_BUTTON_TEXT, API_KEY_MISSING_MESSAGE, INITIAL_GREETING_TEXT, API_ERROR_MESSAGE } from '../constants';
import type { Chat } from '@google/genai';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const isApiKeyMissing = !process.env.API_KEY;

  useEffect(() => {
    // Add initial greeting message from AI
    const initialMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: Sender.AI,
      text: INITIAL_GREETING_TEXT,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);

    if (!isApiKeyMissing) {
      try {
        const session = initializeChatSession();
        chatSessionRef.current = session;
        if (!session) {
          setError(API_KEY_MISSING_MESSAGE + " Не вдалося ініціалізувати сесію чату.");
        }
      } catch (e) {
        console.error("Initialization error:", e);
        setError(e instanceof Error ? e.message : API_ERROR_MESSAGE);
      }
    } else {
        setError(API_KEY_MISSING_MESSAGE + " Функціонал AI буде обмежено.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApiKeyMissing]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (inputValue.trim() === '' || isLoading || isApiKeyMissing || !chatSessionRef.current) {
        if (!chatSessionRef.current && !isApiKeyMissing) {
            setError("Сесія чату не активна. Спробуйте оновити сторінку.");
        }
        return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: Sender.USER,
      text: inputValue.trim(),
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const { text: aiText, sources: aiSources } = await sendMessageToChat(chatSessionRef.current, currentInput);
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: Sender.AI,
        text: aiText,
        sources: aiSources as GroundingSource[],
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (err) {
      let errorMessage = API_ERROR_MESSAGE;
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      const errorAiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: Sender.AI,
        text: `Вибачте, сталася помилка: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, isLoading, isApiKeyMissing]);

  return (
    <div className="flex flex-col flex-grow bg-slate-800/70 backdrop-blur-sm shadow-2xl rounded-lg overflow-hidden border border-sky-700/50">
      <div className="flex-grow p-4 md:p-6 space-y-4 overflow-y-auto custom-scrollbar">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isLoading && <LoadingIndicator />}
      
      {error && !isLoading && (
         <div className="p-3 bg-red-700/30 text-red-200 text-sm text-center border-t border-red-500/50">
          {error}
        </div>
      )}

      {isApiKeyMissing && !error && ( // Show API key missing message only if no other error is already displayed from init
        <div className="p-3 bg-yellow-700/30 text-yellow-200 text-sm text-center border-t border-yellow-500/50">
          {API_KEY_MISSING_MESSAGE} Функціонал AI буде обмежено.
        </div>
      )}

      <div className="p-3 md:p-4 border-t border-sky-700/50 bg-slate-800/90 backdrop-blur-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2 md:space-x-3"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isApiKeyMissing || !chatSessionRef.current ? "AI недоступний" : INPUT_PLACEHOLDER}
            className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || isApiKeyMissing || !chatSessionRef.current}
            aria-label="Поле вводу для вашого питання"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading || inputValue.trim() === '' || isApiKeyMissing || !chatSessionRef.current}
            aria-label={SEND_BUTTON_TEXT}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-0 sm:mr-2" aria-hidden="true">
              <path d="M3.105 3.105a1.5 1.5 0 0 1 2.122-.001L17.806 15.58a1.5 1.5 0 0 1 0 2.121L15.58 20.025a1.5 1.5 0 0 1-2.122-.001L1.072 7.536a1.5 1.5 0 0 1 0-2.121L3.105 3.105Z" />
              <path d="M7.895 10.895a1.5 1.5 0 0 1 2.122-.001l4.28 4.28a1.5 1.5 0 0 1 0 2.12l-2.299 2.3a1.5 1.5 0 0 1-2.122-.001l-4.28-4.28a1.5 1.5 0 0 1 0-2.122l2.299-2.3Z" />
            </svg>
            <span className="hidden sm:inline">{SEND_BUTTON_TEXT}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
