import React, { useCallback, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ErrorMessage } from './ErrorMessage';
import { WelcomeScreen } from './WelcomeScreen';
import { useTranslation } from 'react-i18next';

interface ChatInterfaceProps {
  /** Additional class name for the container */
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  className = '',
}) => {
  const { t } = useTranslation();
  const {
    messages,
    handleSendMessage: sendMessage,
    error,
    loading: isLoading,
  } = useChat();

  const [input, setInput] = useState('');

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (input.trim()) {
        await sendMessage(input);
        setInput('');
      }
    },
    [input, sendMessage]
  );

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <WelcomeScreen
              title={t('welcomeTitle')}
              subtitle={t('welcomeSubtitle')}
              disclaimer={t('aiDisclaimer')}
            />
          ) : (
            <MessageList messages={messages} />
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
        {error && <ErrorMessage message={error} className="mb-4" />}

        <MessageInput
          value={input}
          isLoading={isLoading}
          placeholder={t('inputPlaceholder')}
          onChange={setInput}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
