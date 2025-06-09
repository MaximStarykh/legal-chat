
import React from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { DisclaimerText } from './components/DisclaimerText';
import { APP_TITLE, APP_DESCRIPTION, DISCLAIMER_TEXT } from './constants';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen max-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-gray-100">
      <Header title={APP_TITLE} description={APP_DESCRIPTION} />
      <main className="flex-grow overflow-hidden flex flex-col p-4 md:p-6 lg:p-8">
        <ChatInterface />
      </main>
      <DisclaimerText text={DISCLAIMER_TEXT} />
    </div>
  );
};

export default App;
