import { useState, useEffect, useCallback, FC, ReactNode } from "react";
import { MenuIcon, CloseIcon } from "./components/common/Icons";
import { DISCLAIMER_TEXT } from "./constants";

declare global {
  namespace JSX {
    interface Element extends React.ReactElement {}
  }
}

type Chat = {
  id: string;
  title: string;
  unread: boolean;
};

interface ChatInterfaceProps {
  onApiKeyMissing: () => void;
  className?: string;
  children?: ReactNode;
}

const ChatInterface: FC<ChatInterfaceProps> = ({ className, children }) => (
  <div className={className}>{children}</div>
);

const App: FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chats] = useState<Chat[]>([
    { id: "1", title: "Новий чат", unread: false },
    { id: "2", title: "Юридична консультація", unread: true },
    { id: "3", title: "Аналіз договору", unread: false },
  ]);

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = useCallback((): void => {
    setIsSidebarOpen((prev: boolean) => !prev);
  }, []);

  const closeSidebar = useCallback((): void => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              onClick={toggleSidebar}
              className="mr-2 p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
              aria-label="Toggle sidebar"
            >
              <MenuIcon size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">oLegal</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => {
                setActiveChat(null);
                closeSidebar();
              }}
            >
              Новий чат
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed inset-0 z-20 bg-gray-900 bg-opacity-50 transition-opacity duration-300 ease-in-out ${
            isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          } md:hidden`}
          onClick={closeSidebar}
          aria-hidden="true"
        />

        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 md:flex md:flex-shrink-0 md:flex-col`}
        >
          <div className="flex h-16 flex-shrink-0 items-center border-b border-gray-200 px-4">
            <h2 className="text-lg font-medium text-gray-900">Чати</h2>
            <button
              type="button"
              className="ml-auto p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <CloseIcon size={24} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    activeChat === chat.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setActiveChat(chat.id);
                    closeSidebar();
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{chat.title}</span>
                    {chat.unread && (
                      <span className="inline-flex items-center justify-center h-2 w-2 rounded-full bg-blue-500">
                        <span className="sr-only">Непрочитано</span>
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto focus:outline-none">
            <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
              <ChatInterface className="h-full" />
            </div>
          </div>

          <footer className="bg-white border-t border-gray-200 py-3 px-4">
            <p className="text-xs text-center text-gray-500">
              {DISCLAIMER_TEXT}
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;
