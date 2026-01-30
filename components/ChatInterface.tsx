
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, AlertCircle, Plus, History, Trash2, ChevronLeft, ChevronRight, MessageSquare, ExternalLink, Mic, MicOff, Info } from 'lucide-react';
import { Message, Theme, ChatSession } from '../types.ts';
import { generateAIResponse, callN8nWebhook, chatWithN8n } from '../services/geminiService.ts';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface ChatInterfaceProps {
  theme: Theme;
  sessions: ChatSession[];
  currentSessionId: string | null;
  config: { audience: string; topic: string; language: string };
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onUpdateMessages: (id: string, messages: Message[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  theme,
  sessions,
  currentSessionId,
  config,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onUpdateMessages
}) => {
  const isDark = theme === Theme.DARK;
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' && window.innerWidth > 768);
  const [isListening, setIsListening] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      const langMap: Record<string, string> = {
        'English': 'en-US',
        'Bengali': 'bn-BD',
        'Arabic': 'ar-SA',
        'French': 'fr-FR'
      };
      recognition.lang = langMap[config.language] || 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
        setInputMode('voice');
      };
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [config.language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setError(null);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        setError("Microphone access denied or already in use.");
      }
    }
  };

  const handleSend = async () => {
    // Immediate Request Isolation Guard
    if (isProcessing.current || !input.trim() || !currentSessionId) return;

    const userQuery = input.trim();

    // Lock and clear immediately to prevent duplicate triggers
    isProcessing.current = true;
    setInput('');
    setIsLoading(true);
    setError(null);
    setInputMode('text');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userQuery,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    onUpdateMessages(currentSessionId, updatedMessages);

    try {
      // Step 1: PRODUCTION Webhook Interaction (Response generation)
      // Service layer now handles all mandatory delays and boilerplate filtering
      const aiResult = await chatWithN8n(userQuery, currentSessionId, config);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResult.text,
        timestamp: new Date(),
        sources: aiResult.sources
      };

      onUpdateMessages(currentSessionId, [...updatedMessages, assistantMessage]);

    } catch (err: any) {
      setError(err.message || 'The AI gateway is currently congested. Please try again shortly.');
    } finally {
      setIsLoading(false);
      isProcessing.current = false;
    }
  };

  return (
    <div className={`flex h-[80dvh] md:h-[78vh] w-full max-w-6xl mx-auto rounded-none md:rounded-3xl overflow-hidden border transition-all duration-500 shadow-2xl backdrop-blur-xl relative ${isDark ? 'bg-zinc-950/50 border-white/10' : 'bg-white border-zinc-200'}`}>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && typeof window !== 'undefined' && window.innerWidth <= 768 && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive Drawer */}
      <div className={`fixed md:relative z-50 md:z-10 h-full transition-all duration-500 border-r overflow-hidden flex flex-col ${isSidebarOpen ? 'w-[280px] md:w-72 left-0' : 'w-0 -left-20 md:left-0 opacity-0'} ${isDark ? 'border-white/10 bg-zinc-950 md:bg-black/20' : 'border-zinc-200 bg-white md:bg-zinc-50/50'}`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className={`w-4 h-4 ${isDark ? 'text-[#00a651]' : 'text-green-600'}`} />
            <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>History</span>
          </div>
          <button
            onClick={onNewChat}
            className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-[#00a651]' : 'hover:bg-white text-green-700 shadow-sm border border-zinc-200'}`}
            title="New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={`group relative flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all border ${currentSessionId === s.id
                ? (isDark ? 'bg-[#00a651]/20 border-[#00a651]/30 text-white' : 'bg-green-50 border-green-100 text-green-900 shadow-sm')
                : (isDark ? 'hover:bg-white/5 border-transparent text-zinc-500' : 'hover:bg-white hover:border-zinc-200 border-transparent text-zinc-600')
                }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${currentSessionId === s.id ? 'text-[#00a651]' : 'opacity-40'}`} />
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold truncate">{s.title || 'Untitled Chat'}</span>
                  <span className="text-[9px] opacity-40 uppercase tracking-tighter">
                    {s.lastUpdated.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 hover:text-red-500 transition-all ${isDark ? 'text-white/20' : 'text-zinc-400'}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative min-w-0">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 p-1.5 rounded-full border shadow-xl transition-all hidden md:flex ${isDark ? 'bg-zinc-900 border-white/10 hover:bg-zinc-800' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
        >
          {isSidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {/* Mobile Sidebar Toggle */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`md:hidden absolute left-4 top-4 z-30 p-2 rounded-xl border shadow-lg transition-all ${isDark ? 'bg-zinc-900/80 border-white/10' : 'bg-white/80 border-zinc-200'}`}
          >
            <History className={`w-4 h-4 ${isDark ? 'text-[#00a651]' : 'text-green-600'}`} />
          </button>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30 animate-in fade-in duration-1000">
              <div className={`p-4 rounded-full border-2 border-dashed ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
                <Bot className={`w-12 h-12 ${isDark ? 'text-white' : 'text-zinc-900'}`} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-black uppercase tracking-[0.2em] ${isDark ? 'text-white' : 'text-zinc-900'}`}>Ready to assist</p>
                <p className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>ICT Bangladesh AI Instance Connected</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div className={`flex max-w-full md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 md:gap-4`}>
                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors ${msg.role === 'user' ? (isDark ? 'bg-[#00a651]' : 'bg-green-600 shadow-md shadow-green-100') : (isDark ? 'bg-white/10' : 'bg-zinc-100 border border-zinc-200')}`}>
                  {msg.role === 'user' ? <User className="w-4 md:w-5 h-4 md:h-5 text-white" /> : <Bot className={`w-4 md:w-5 h-4 md:h-5 ${isDark ? 'text-[#00a651]' : 'text-green-600'}`} />}
                </div>
                <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all ${msg.role === 'user'
                  ? (isDark ? 'bg-[#00a651]/20 text-white rounded-tr-none border border-[#00a651]/30' : 'bg-green-50 text-zinc-800 rounded-tr-none border border-green-100 shadow-sm')
                  : (isDark ? 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5' : 'bg-zinc-50 text-zinc-700 rounded-tl-none border border-zinc-200 shadow-sm')}`}>
                  <div className="prose prose-sm prose-invert max-w-none leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.content}
                  </div>

                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className={`mt-4 pt-3 border-t ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Institutional Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300' : 'bg-white border-zinc-200 hover:border-[#00a651] hover:text-[#00a651] text-zinc-600'}`}
                          >
                            <span className="truncate max-w-[120px]">{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`mt-2 text-[9px] font-bold uppercase tracking-wider ${isDark ? 'opacity-30 text-white' : 'opacity-40 text-zinc-500'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className={`flex items-center space-x-4 p-4 rounded-2xl rounded-tl-none border ${isDark ? 'bg-white/5 border-white/5' : 'bg-zinc-50 border-zinc-200'}`}>
                <Loader2 className={`w-4 h-4 animate-spin ${isDark ? 'text-[#00a651]' : 'text-green-600'}`} />
                <span className={`text-xs font-bold uppercase tracking-widest opacity-40 ${isDark ? '' : 'text-zinc-600'}`}>Processing...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold">{error}</span>
              </div>
            </div>
          )}
        </div>

        <div className={`p-4 md:p-6 border-t transition-colors pb-[max(1rem,env(safe-area-inset-bottom))] ${isDark ? 'bg-white/5 border-white/10' : 'bg-zinc-50/50 border-zinc-200'}`}>
          <div className={`flex items-center gap-2 md:gap-4 p-1.5 md:p-2 rounded-xl md:rounded-2xl border transition-all shadow-inner relative ${isDark ? 'bg-black/40 border-white/10 focus-within:border-[#00a651]/50' : 'bg-white border-zinc-200 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100'}`}>
            <button
              onClick={toggleListening}
              disabled={isLoading}
              className={`p-2.5 md:p-3 rounded-lg md:rounded-xl transition-all relative ${isListening
                ? 'bg-red-500 text-white animate-pulse'
                : (isDark ? 'text-zinc-500 hover:text-[#00a651] hover:bg-white/5' : 'text-zinc-400 hover:text-green-600 hover:bg-zinc-50')} ${isLoading ? 'opacity-20 cursor-not-allowed' : ''}`}
              title={isListening ? "Stop Listening" : "Start Voice Input"}
            >
              {isListening ? <MicOff className="w-3.5 md:w-4 h-3.5 md:h-4" /> : <Mic className="w-3.5 md:w-4 h-3.5 md:h-4" />}
              {isListening && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              )}
            </button>
            <input
              type="text"
              value={input}
              disabled={isLoading}
              onChange={(e) => {
                setInput(e.target.value);
                setInputMode('text');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isLoading ? "Processing..." : isListening ? "Listening..." : "Message AI Assistant..."}
              className={`flex-1 bg-transparent px-2 md:px-4 py-2 md:py-3 text-sm border-none outline-none font-medium placeholder:opacity-30 ${isDark ? 'text-white' : 'text-zinc-800'} ${isLoading ? 'cursor-not-allowed italic' : ''}`}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`flex items-center justify-center w-10 md:w-12 h-10 md:h-12 rounded-full transition-all duration-300 group ${isLoading || !input.trim()
                ? 'opacity-20 cursor-not-allowed bg-zinc-800'
                : (isDark
                  ? 'bg-gradient-to-tr from-[#00a651] to-[#018241] text-white hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,166,81,0.4)]'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg hover:scale-105 active:scale-95')}`}
            >
              <Send
                strokeWidth={2.5}
                className={`w-4 md:w-5 h-4 md:h-5 text-white transition-transform ${!input.trim() ? '' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'}`}
              />
            </button>
          </div>
          <div className="mt-3 md:mt-4 flex items-center justify-between px-1 md:px-2">
            <div className={`flex items-center space-x-3 md:space-x-4 font-bold tracking-[0.2em] uppercase text-[8px] md:text-[9px] ${isDark ? 'opacity-30 text-white' : 'opacity-40 text-zinc-500'}`}>
              <span className="flex items-center"><Sparkles className="w-2.5 md:w-3 h-2.5 md:h-3 mr-1" /> GEMINI 3.0</span>
              <span className="hidden sm:inline">KNOWLEDGE: ICTBD</span>
              {isListening && <span className="text-red-500 animate-pulse font-black">RECORDING...</span>}
            </div>
            <div className={`flex items-center text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`}>
              <Info className="w-2.5 md:w-3 h-2.5 md:h-3 mr-1" /> SECURE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
