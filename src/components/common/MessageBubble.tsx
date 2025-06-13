import React from 'react';
import { Message } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

const UserIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5 text-gray-300"
  >
    <path
      fillRule="evenodd"
      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
      clipRule="evenodd"
    />
  </svg>
);

const AIIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5 text-gray-100"
  >
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2ZM9.75 18c-1.24 0-2.25-1.01-2.25-2.25S8.51 13.5 9.75 13.5 12 14.51 12 15.75 10.99 18 9.75 18Zm4.5 0c-1.24 0-2.25-1.01-2.25-2.25S13.01 13.5 14.25 13.5 16.5 14.51 16.5 15.75 15.49 18 14.25 18Z" />
  </svg>
);

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`group w-full ${isUser ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="mx-auto max-w-3xl px-4 py-3 sm:py-4">
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`flex items-start max-w-full ${isUser ? 'flex-row-reverse ml-auto' : 'flex-row'}`}
            style={{
              maxWidth: 'calc(100% - 40px)',
            }}
          >
            <div className="flex-shrink-0">
              {isUser ? (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserIcon />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center">
                  <AIIcon />
                </div>
              )}
            </div>

            <div
              className={`mx-3 ${
                isUser ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'
              } rounded-2xl px-4 py-3 shadow-sm max-w-full`}
            >
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    code({ node, className, children, ...props }) {
                      const isInline = !className;

                      if (isInline) {
                        return (
                          <code
                            className={`px-1 py-0.5 rounded text-sm font-mono ${
                              isUser ? 'bg-blue-500/30 text-blue-100' : 'bg-gray-100 text-red-600'
                            }`}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <div
                          className={`rounded-lg p-3 my-2 overflow-x-auto ${isUser ? 'bg-blue-500/20' : 'bg-gray-800'}`}
                        >
                          <pre className="text-sm">
                            <code
                              className={`language-text ${isUser ? 'text-blue-100' : 'text-gray-100'}`}
                              {...props}
                            >
                              {children}
                            </code>
                          </pre>
                        </div>
                      );
                    },
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${isUser ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'} underline`}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className={`list-disc pl-5 space-y-1 my-2 ${isUser ? 'marker:text-blue-200' : 'marker:text-gray-500'}`}
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        className={`list-decimal pl-5 space-y-1 my-2 ${isUser ? 'marker:text-blue-200' : 'marker:text-gray-500'}`}
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p
                        className={`my-2 leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}
                        {...props}
                      />
                    ),
                    h1: ({ node, ...props }) => (
                      <h1
                        className={`text-xl font-bold my-3 ${isUser ? 'text-white' : 'text-gray-900'}`}
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className={`text-lg font-semibold my-2.5 ${isUser ? 'text-white' : 'text-gray-900'}`}
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className={`text-base font-medium my-2 ${isUser ? 'text-white' : 'text-gray-900'}`}
                        {...props}
                      />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className={`border-l-4 pl-4 my-3 italic ${
                          isUser ? 'border-blue-400 text-blue-100' : 'border-gray-300 text-gray-600'
                        }`}
                        {...props}
                      />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto">
                        <table
                          className={`min-w-full border-collapse my-3 ${isUser ? 'text-white' : 'text-gray-800'}`}
                          {...props}
                        />
                      </div>
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className={`px-4 py-2 text-left border ${
                          isUser ? 'border-blue-400 bg-blue-500/30' : 'border-gray-300 bg-gray-100'
                        }`}
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td
                        className={`px-4 py-2 border ${
                          isUser ? 'border-blue-400' : 'border-gray-200'
                        }`}
                        {...props}
                      />
                    ),
                  }}
                >
                  {message.parts.map((part) => part.text).join('')}
                </ReactMarkdown>
              </div>

              {!isUser && message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    Sources
                  </h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {message.sources.map((source, index) => (
                      <li key={index} className="text-sm truncate">
                        <a
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          title={source.title}
                        >
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
