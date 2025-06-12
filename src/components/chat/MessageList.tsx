import React, { useRef, useEffect } from 'react';
import { MessageBubble } from '../common/MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatMessage } from '../../types';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping,
  className = '',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isTyping]);

  return (
    <div className={`space-y-6 py-4 ${className}`}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {isTyping && <TypingIndicator />}
      
      <div ref={messagesEndRef} className="h-8" />
    </div>
  );
};
