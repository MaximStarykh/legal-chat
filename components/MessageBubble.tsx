
import React from 'react';
import { ChatMessage, Sender } from '../types';
import { SourceList } from './SourceList';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


const UserIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-sky-400">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
  </svg>
);

const AIIcon: React.FC = () => (
 <span className="text-2xl leading-none">⚖️</span>
);


export const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.sender === Sender.USER;

  return (
    <div className={`flex items-end mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col space-y-1 text-sm max-w-xs md:max-w-md lg:max-w-lg mx-2 ${isUser ? 'order-1 items-end' : 'order-2 items-start'}`}>
        <div>
          <div
            className={`px-4 py-2.5 rounded-xl inline-block shadow-md prose prose-sm prose-invert max-w-full
                        ${isUser ? 'bg-sky-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-100 rounded-bl-none'}`}
          >
             <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                p: ({node, ...props}) => <p className="my-1" {...props} />,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ul: ({node, ...props}) => <ul className="my-1 list-disc list-inside" {...props} />,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ol: ({node, ...props}) => <ol className="my-1 list-decimal list-inside" {...props} />,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                h1: ({node, ...props}) => <h1 className="text-lg font-semibold my-2 text-sky-300" {...props} />,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                h2: ({node, ...props}) => <h2 className="text-md font-semibold my-1.5 text-sky-300" {...props} />,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                h3: ({node, ...props}) => <h3 className="text-sm font-semibold my-1 text-sky-300" {...props} />,
             }}>
                {message.text}
             </ReactMarkdown>
            {!isUser && message.sources && <SourceList sources={message.sources} />}
          </div>
        </div>
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow ${isUser ? 'order-2 bg-sky-700' : 'order-1 bg-slate-600'}`}>
        {isUser ? <UserIcon/> : <AIIcon/>}
      </div>
    </div>
  );
};
