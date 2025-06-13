import React from 'react';
import { GroundingSource } from '../../types/index';
import { SOURCES_TITLE } from '../../constants';

interface SourceListProps {
  sources: GroundingSource[];
}

export const SourceList: React.FC<SourceListProps> = ({ sources }: SourceListProps) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">{SOURCES_TITLE}</p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-200"
          >
            <svg
              className="w-3 h-3 mr-1.5 flex-shrink-0 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span className="truncate max-w-[200px]">
              {source.title || (() => {
                try {
                  return new URL(source.uri).hostname.replace('www.', '');
                } catch {
                  return source.uri;
                }
              })()}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};
