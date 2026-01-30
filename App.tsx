
import React, { useState, useEffect, useCallback } from 'react';
import { Theme, ChatSession, Message } from './types.ts';
import Header from './components/Header.tsx';
import Hero from './components/Hero.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import FluidBackground from './components/FluidBackground.tsx';
import Footer from './components/Footer.tsx';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [isChatActive, setIsChatActive] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Global Chat Configuration
  const [chatConfig, setChatConfig] = useState({
    audience: 'Student',
    topic: 'Training Courses',
    language: 'English'
  });

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('ict_bd_chat_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        // Revive dates
        const revived = parsed.map((s: any) => ({
          ...s,
          lastUpdated: new Date(s.lastUpdated),
          messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
        setSessions(revived);
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ict_bd_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (theme === Theme.LIGHT) {
      document.body.classList.add('light', 'bg-zinc-50', 'text-zinc-900');
      document.body.classList.remove('dark', 'bg-black', 'text-white');
    } else {
      document.body.classList.remove('light', 'bg-zinc-50', 'text-zinc-900');
      document.body.classList.add('dark', 'bg-black', 'text-white');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === Theme.DARK ? Theme.LIGHT : Theme.DARK);
  };

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: `chat_${Date.now()}`,
      title: 'New Discussion',
      messages: [], // Initially empty as requested
      lastUpdated: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsChatActive(true);
  }, []);

  const startChat = () => {
    if (sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
      setIsChatActive(true);
    } else {
      createNewSession();
    }
  };

  const goHome = () => {
    setIsChatActive(false);
  };

  const updateSessionMessages = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        let title = s.title;
        if (title === 'New Discussion' || !title) {
          const firstUserMsg = messages.find(m => m.role === 'user');
          if (firstUserMsg) {
            title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
          }
        }
        return { ...s, messages, lastUpdated: new Date(), title };
      }
      return s;
    }));
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
      } else {
        setIsChatActive(false);
        setCurrentSessionId(null);
      }
    }
  };

  return (
    <div className={`min-h-[100dvh] relative overflow-hidden flex flex-col ${theme === Theme.DARK ? 'dot-grid bg-black text-white' : 'dot-grid bg-zinc-50 text-zinc-900'}`}>
      <FluidBackground theme={theme} />

      <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-0 md:px-6 lg:px-8 relative z-10 transition-all duration-500">
        <div className="px-4 md:px-0">
          <Header theme={theme} onToggleTheme={toggleTheme} onGoHome={goHome} />
        </div>

        <main className="flex-1 flex flex-col transition-all duration-700 ease-out relative z-20 overflow-hidden">
          {!isChatActive ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <Hero
                onInitiate={startChat}
                theme={theme}
                config={chatConfig}
                onConfigChange={setChatConfig}
              />
            </div>
          ) : (
            <div className="flex-1 py-0 md:py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden flex flex-col">
              <ChatInterface
                theme={theme}
                sessions={sessions}
                currentSessionId={currentSessionId}
                config={chatConfig}
                onSelectSession={setCurrentSessionId}
                onNewChat={createNewSession}
                onDeleteSession={deleteSession}
                onUpdateMessages={updateSessionMessages}
              />
            </div>
          )}
        </main>

        {!isChatActive && <Footer theme={theme} />}
      </div>

      <div className={`fixed top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full -z-10 transition-colors duration-1000 ${theme === Theme.DARK ? 'bg-green-600/5' : 'bg-green-600/10'}`} />
      <div className={`fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full -z-10 transition-colors duration-1000 ${theme === Theme.DARK ? 'bg-red-600/5' : 'bg-blue-600/5'}`} />
    </div>
  );
};

export default App;
