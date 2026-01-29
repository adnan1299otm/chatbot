
import React, { useState } from 'react';
import { Search, GraduationCap, Palette, Globe, Play, ShieldCheck, ChevronDown, Check, ExternalLink } from 'lucide-react';
import { Theme } from '../types.ts';

interface HeroProps {
  onInitiate: () => void;
  theme: Theme;
  config: { audience: string; topic: string; language: string };
  onConfigChange: (config: any) => void;
}

const Hero: React.FC<HeroProps> = ({ onInitiate, theme, config, onConfigChange }) => {
  const isDark = theme === Theme.DARK;
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const options = {
    audience: ['Citizen', 'Entrepreneur', 'Developer', 'Govt Official'],
    topic: ['e-Governance', 'Cybersecurity', 'ICT Policy', 'Infrastructure'],
    language: ['English', 'Bengali', 'Arabic', 'French']
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const selectOption = (key: string, value: string) => {
    onConfigChange({ ...config, [key]: value });
    setActiveDropdown(null);
  };

  const Dropdown = ({ icon: Icon, label, value, stateKey, items }: any) => (
    <div className="flex flex-col flex-1 min-w-[140px] relative">
      <div
        onClick={() => toggleDropdown(stateKey)}
        className={`flex flex-col px-4 py-3 transition-all cursor-pointer group h-full justify-center ${isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-50'}`}
      >
        <div className="flex items-center space-x-2 mb-1">
          <Icon className={`w-3.5 h-3.5 ${isDark ? 'text-[#00a651]' : 'text-[#00a651]'}`} />
          <span className={`text-[10px] uppercase tracking-[0.2em] font-black ${isDark ? 'text-[#00a651]' : 'text-green-700'}`}>{label}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{value}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === stateKey ? 'rotate-180' : ''} ${isDark ? 'text-white/30 group-hover:text-white' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
        </div>
      </div>

      {activeDropdown === stateKey && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
          <div className={`absolute top-full left-0 w-full mt-2 p-1.5 rounded-2xl border z-20 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-zinc-200'}`}>
            {items.map((item: string) => (
              <div
                key={item}
                onClick={() => selectOption(stateKey, item)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer ${value === item
                  ? (isDark ? 'bg-[#00a651]/20 text-[#00a651]' : 'bg-[#00a651]/10 text-[#00a651]')
                  : (isDark ? 'hover:bg-white/5 text-zinc-400' : 'hover:bg-zinc-50 text-zinc-600')
                  }`}
              >
                <span className="font-bold">{item}</span>
                {value === item && <Check className="w-3.5 h-3.5" />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[80dvh] text-center max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className={`inline-flex items-center space-x-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full border mb-6 md:mb-8 transition-all duration-500 shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-green-50 border-green-100'}`}>
        <ShieldCheck className={`w-3 md:w-3.5 h-3 md:h-3.5 ${isDark ? 'text-[#00a651]' : 'text-green-600'}`} />
        <span className={`text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-black ${isDark ? 'text-green-400' : 'text-green-700'}`}>Smart Bangladesh 2026 Secured</span>
      </div>

      <h2 className="text-4xl md:text-7xl font-extrabold mb-4 md:mb-6 tracking-tight leading-[1.1] md:leading-[1.05]">
        <span className={`${isDark ? 'text-zinc-100' : 'text-zinc-900'} transition-colors duration-500`}>The Future of</span> <br />
        <span className={`bg-gradient-to-r ${isDark ? 'from-[#00a651] via-white to-[#ed1c24]' : 'from-[#00a651] via-zinc-800 to-[#ed1c24]'} bg-clip-text text-transparent`}>Digital Governance.</span>
      </h2>

      <p className={`text-sm md:text-lg mb-8 md:mb-12 max-w-2xl leading-relaxed mx-auto px-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500 font-medium'}`}>
        Official AI Assistant for ICT Bangladesh. Empowering citizens through real-time intelligence on policies, innovation, and digital transformation.
      </p>

      <div className={`w-full max-w-4xl p-1 md:p-1.5 rounded-2xl md:rounded-3xl border transition-all duration-500 shadow-xl md:shadow-2xl backdrop-blur-xl ${isDark ? 'bg-zinc-900/80 border-white/10' : 'bg-white/90 border-zinc-200 shadow-zinc-200/50'}`}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center">
          <div className="flex-1 px-4 md:px-6 py-3 md:py-4 flex items-center space-x-3 md:space-x-4">
            <Search className={`w-4 md:w-5 h-4 md:h-5 ${isDark ? 'text-[#00a651]/50' : 'text-zinc-400'}`} />
            <input
              type="text"
              placeholder="Ask about Smart Bangladesh..."
              className={`bg-transparent border-none outline-none w-full text-base md:text-lg placeholder:opacity-30 font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
              onKeyDown={(e) => e.key === 'Enter' && onInitiate()}
            />
          </div>

          <div className={`hidden md:flex items-center h-12 w-[1px] mx-2 ${isDark ? 'bg-white/10' : 'bg-zinc-200'}`} />

          <div className={`grid grid-cols-2 md:flex md:flex-row border-t md:border-t-0 md:divide-x ${isDark ? 'border-white/10 divide-white/10' : 'border-zinc-200 divide-zinc-200'}`}>
            <Dropdown icon={GraduationCap} label="Audience" value={config.audience} stateKey="audience" items={options.audience} />
            <Dropdown icon={Palette} label="Focus" value={config.topic} stateKey="topic" items={options.topic} />
            <div className="hidden md:block">
              <Dropdown icon={Globe} label="Language" value={config.language} stateKey="language" items={options.language} />
            </div>
          </div>

          <button
            onClick={onInitiate}
            className={`m-2 px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl transition-all flex items-center justify-center space-x-3 shadow-lg group ${isDark ? 'bg-[#00a651] hover:bg-[#00a651]/90 shadow-[#00a651]/30' : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-950/20'}`}
          >
            <Play className={`w-3.5 md:w-4 h-3.5 md:h-4 transition-transform group-hover:translate-x-0.5 fill-white`} />
            <span className="font-black uppercase tracking-[0.1em] text-xs md:text-sm text-white">INITIATE</span>
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        <div className="flex flex-col items-center">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Endorsed by</span>
          <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>ICT Division BD</p>
        </div>
        <div className={`hidden sm:block w-[1px] h-6 ${isDark ? 'bg-white/10' : 'bg-zinc-200'}`} />
        <div className="flex flex-col items-center">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Developer</span>
          <a
            href="https://www.linkedin.com/in/arafathaladnan"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs font-bold transition-all flex items-center group/dev ${isDark ? 'text-[#00a651] hover:text-[#00a651]/80' : 'text-green-700 hover:text-green-800'}`}
          >
            Arafath Adnan
            <ExternalLink className="w-2.5 h-2.5 ml-1 opacity-0 group-hover/dev:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>

      {/* Feature Sections */}
      <div className="mt-32 w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-left animate-fade-in [animation-delay:200ms]">
        {[
          {
            icon: ShieldCheck,
            title: "Policy Intelligence",
            desc: "Instant access to official ICT guidelines, e-Governance policies, and regulatory frameworks."
          },
          {
            icon: GraduationCap,
            title: "Training Support",
            desc: "Expert guidance on Software Engineering levels, AI foundations, and specialized certifications."
          },
          {
            icon: Globe,
            title: "24/7 Accessibility",
            desc: "Multi-language support catering to citizens, entrepreneurs, and global stakeholders."
          }
        ].map((feature, i) => (
          <div key={i} className={`p-8 rounded-3xl border transition-all duration-500 hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:border-[#00a651]/30' : 'bg-white border-zinc-200 hover:border-green-300 shadow-sm'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${isDark ? 'bg-[#00a651]/10' : 'bg-green-50'}`}>
              <feature.icon className={`w-6 h-6 ${isDark ? 'text-[#00a651]' : 'text-green-600'}`} />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{feature.title}</h3>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Statistics / Trust Section */}
      <div className={`mt-32 w-full p-8 md:p-12 rounded-[40px] border relative overflow-hidden animate-fade-in [animation-delay:400ms] ${isDark ? 'bg-zinc-900/50 border-white/10' : 'bg-green-50/50 border-green-100'}`}>
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Districts", value: "64" },
            { label: "Active Courses", value: "50+" },
            { label: "AI Grounding", value: "Real-time" },
            { label: "Vision", value: "2041" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className={`text-3xl md:text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{stat.value}</span>
              <span className={`text-[10px] uppercase tracking-[0.2em] font-black ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{stat.label}</span>
            </div>
          ))}
        </div>
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full -z-0 opacity-20 ${isDark ? 'bg-[#00a651]' : 'bg-[#00a651]'}`} />
      </div>
    </div>
  );
};

export default Hero;
