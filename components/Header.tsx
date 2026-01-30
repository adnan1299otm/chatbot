
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Theme } from '../types.ts';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onGoHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onGoHome }) => {
  const isDark = theme === Theme.DARK;

  return (
    <header className={`py-4 md:py-6 flex justify-between items-center border-b transition-colors duration-500 ${isDark ? 'border-white/5' : 'border-zinc-200'}`}>
      <div
        className="flex items-center space-x-3 md:space-x-5 group cursor-pointer"
        onClick={onGoHome}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onGoHome()}
      >
        <div className="relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0 transition-all duration-500 group-hover:scale-105">
          <div className={`absolute inset-0 blur-xl md:blur-2xl opacity-25 rounded-full transition-colors duration-500 ${isDark ? 'bg-green-400' : 'bg-green-500'}`} />

          <svg
            viewBox="0 0 100 100"
            className="relative w-full h-full drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 85C55 85 58 82 58 78H42C42 82 45 85 50 85Z"
              fill={isDark ? "#ffffff" : "#18181b"}
            />
            <path
              d="M35 74H65V70H35V74Z"
              fill={isDark ? "#ffffff" : "#18181b"}
            />
            <path
              d="M48 20C35 20 25 30 25 43C25 53 32 60 38 65L48 65V20Z"
              fill="#00a651"
              className="animate-pulse"
              style={{ animationDuration: '3s' }}
            />
            <path
              d="M52 20C65 20 75 30 75 43C75 53 68 60 62 65L52 65V20Z"
              fill="#ed1c24"
              className="animate-pulse"
              style={{ animationDuration: '3s', animationDelay: '1.5s' }}
            />
            <circle cx="40" cy="35" r="2" fill="white" fillOpacity="0.5" />
            <circle cx="60" cy="45" r="2" fill="white" fillOpacity="0.5" />
            <circle cx="45" cy="55" r="2" fill="white" fillOpacity="0.5" />
          </svg>
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-none flex items-center">
            <span className="text-[#00a651]">ICT</span>
            <span className={`mx-1 md:mx-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Bangladesh</span>
            <span className="text-[#ed1c24]">AI</span>
          </h1>
          <p className={`text-[8px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.25em] font-black mt-1 md:mt-2 transition-opacity duration-300 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Next-Gen AI
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <div className={`flex items-center space-x-2 px-2 md:px-4 py-1.5 md:py-2 rounded-full border transition-colors duration-500 ${isDark ? 'bg-[#00a651]/10 border-[#00a651]/20' : 'bg-green-50 border-green-100'}`}>
          <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#00a651] animate-pulse" />
          <span className={`hidden md:inline text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-[#00a651]' : 'text-green-700'}`}>System Live</span>
        </div>

        <button
          onClick={onToggleTheme}
          className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl border transition-all duration-300 ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-white hover:bg-zinc-100 border-zinc-200 shadow-sm'}`}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" /> : <Moon className="w-4 h-4 md:w-5 md:h-5 text-zinc-700" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
