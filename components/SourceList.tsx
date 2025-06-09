
import React from 'react';
import { GroundingSource } from '../types';
import { SOURCES_TITLE } from '../constants';

interface SourceListProps {
  sources: GroundingSource[];
}

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-600">
      <h4 className="text-sm font-semibold text-sky-300 mb-1.5">{SOURCES_TITLE}</h4>
      <ul className="list-disc list-inside space-y-1">
        {sources.map((source, index) => (
          <li key={index} className="text-xs text-slate-400 hover:text-sky-400 transition-colors">
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              title={source.title || source.uri}
              className="underline break-all"
            >
              {source.title || source.uri}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
