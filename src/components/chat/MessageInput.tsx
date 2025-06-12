import React, { useCallback, useRef, useEffect } from 'react';
import { SendIcon, LoadingSpinner } from '../common/Icons';

interface MessageInputProps {
  value: string;
  isLoading: boolean;
  isApiKeyMissing: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  isLoading,
  isApiKeyMissing,
  placeholder,
  onChange,
  onSubmit,
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      className={`relative ${className}`}
    >
      <div className="flex items-end bg-white rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden transition-all duration-200">
        <div className="flex-1 min-w-0">
          <label htmlFor="chat-input" className="sr-only">
            {placeholder}
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            name="message"
            rows={1}
            className="block w-full border-0 bg-transparent resize-none py-3 px-4 placeholder-gray-500 focus:ring-0 focus:outline-none sm:text-sm"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isApiKeyMissing}
            aria-label="Повідомлення"
            aria-describedby="chat-input-help"
          />
          <p id="chat-input-help" className="sr-only">
            Натисніть Enter для відправки, Shift+Enter для нового рядка
          </p>
        </div>
        <div className="px-3 py-2">
          <button
            type="submit"
            disabled={!value.trim() || isLoading || isApiKeyMissing}
            className={`inline-flex items-center justify-center p-2 rounded-full transition-colors duration-200 ${
              value.trim() && !isLoading && !isApiKeyMissing
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
            aria-label="Відправити повідомлення"
          >
            {isLoading ? (
              <LoadingSpinner className="h-5 w-5 animate-spin" />
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
