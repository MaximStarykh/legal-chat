import React, { useRef, useEffect } from 'react';
import { MessageBubble } from '../common/MessageBubble';
import { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  className = '',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  return (
    <div
      className={`space-y-6 py-4 ${className}`}
      role="log"
      aria-live="polite"
    >
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}

      <div ref={messagesEndRef} className="h-8" />
    </div>
  );
};
