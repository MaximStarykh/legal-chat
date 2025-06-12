import React, { useCallback, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import type { ChatMessage } from '@/types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ErrorMessage } from './ErrorMessage';
import { WelcomeScreen } from './WelcomeScreen';
import { 
  WELCOME_TITLE, 
  WELCOME_SUBTITLE, 
  AI_DISCLAIMER, 
  INPUT_PLACEHOLDER,
  API_KEY_MISSING_MESSAGE,
  API_KEY_REQUIRED
} from '../../constants';

interface ChatInterfaceProps {
  /** Callback when the API key is missing */
  onApiKeyMissing?: () => void;
  /** Initial messages to display */
  initialMessages?: ChatMessage[];
  /** Additional class name for the container */
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onApiKeyMissing,
  initialMessages = [],
  className = ''
}) => {
  const {
    messages,
    sendMessage,
    isTyping,
    error,
    isLoading,
    isApiKeyMissing,
    retryLastMessage,
    clearError
  } = useChat(initialMessages);

  const [input, setInput] = useState('');

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim()) {
      await sendMessage(input);
      setInput('');
    }
  }, [input, sendMessage]);

  const handleRetry = useCallback(() => {
    if (error?.isRecoverable) {
      clearError();
      if (error.code === 'CHAT_SESSION_ERROR') {
        window.location.reload();
      } else {
        retryLastMessage();
      }
    }
  }, [error, clearError, retryLastMessage]);

  // Notify parent if API key is missing
  React.useEffect(() => {
    if (isApiKeyMissing && onApiKeyMissing) {
      onApiKeyMissing();
    }
  }, [isApiKeyMissing, onApiKeyMissing]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <WelcomeScreen 
              title={WELCOME_TITLE}
              subtitle={WELCOME_SUBTITLE}
              disclaimer={AI_DISCLAIMER}
            />
          ) : (
            <MessageList messages={messages} isTyping={isTyping} />
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
        {error && (
          <ErrorMessage 
            error={error} 
            onRetry={handleRetry}
            className="mb-4"
          />
        )}
        
        <MessageInput
          value={input}
          isLoading={isLoading}
          isApiKeyMissing={isApiKeyMissing}
          placeholder={
            isApiKeyMissing
              ? `${API_KEY_MISSING_MESSAGE} ${API_KEY_REQUIRED}`
              : INPUT_PLACEHOLDER
          }
          onChange={setInput}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
