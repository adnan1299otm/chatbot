
import React from 'react';
import { ExternalLink, Linkedin, Twitter, Mail, MapPin } from 'lucide-react';
import { Theme } from '../types.ts';

interface FooterProps {
    theme: Theme;
}

const Footer: React.FC<FooterProps> = ({ theme }) => {
    const isDark = theme === Theme.DARK;
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`mt-32 border-t transition-colors duration-500 pb-12 ${isDark ? 'border-white/5 bg-black/20' : 'border-zinc-200 bg-white'}`}>
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-bold flex items-center mb-6">
                            <span className="text-[#00a651]">ICT</span>
                            <span className={`mx-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Bangladesh</span>
                            <span className="text-[#ed1c24]">AI</span>
                        </h2>
                        <p className={`text-sm leading-relaxed max-w-sm mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            The official AI-powered interface for ICT Bangladesh, dedicated to empowering the next generation of innovators and practitioners through real-time intelligent guidance.
                        </p>
                        <div className="flex items-center space-x-5">
                            <a href="#" className={`transition-colors ${isDark ? 'text-zinc-500 hover:text-[#00a651]' : 'text-zinc-400 hover:text-green-600'}`}>
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className={`transition-colors ${isDark ? 'text-zinc-500 hover:text-[#00a651]' : 'text-zinc-400 hover:text-green-600'}`}>
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className={`transition-colors ${isDark ? 'text-zinc-500 hover:text-red-500' : 'text-zinc-400 hover:text-red-600'}`}>
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Institutional Links */}
                    <div>
                        <h4 className={`text-[10px] uppercase tracking-[0.25em] font-black mb-6 ${isDark ? 'text-zinc-300' : 'text-zinc-900'}`}>Links</h4>
                        <ul className="space-y-4">
                            {[
                                { label: 'Official Website', url: 'https://ictbangladesh.com.bd' },
                                { label: 'Course Enrollment', url: 'https://ictbangladesh.com.bd/courses' },
                                { label: 'IT Services', url: 'https://ictbangladesh.com.bd/services' }
                            ].map((link, i) => (
                                <li key={i}>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`text-sm flex items-center group transition-all ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
                                    >
                                        {link.label}
                                        <ExternalLink className="w-2.5 h-2.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Section */}
                    <div>
                        <h4 className={`text-[10px] uppercase tracking-[0.25em] font-black mb-6 ${isDark ? 'text-zinc-300' : 'text-zinc-900'}`}>Support</h4>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <MapPin className={`w-4 h-4 mt-0.5 ${isDark ? 'text-[#00a651]' : 'text-green-600'}`} />
                                <span className={`text-sm leading-snug ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                    ICT Bangladesh Campus<br />Dhaka, Bangladesh
                                </span>
                            </div>
                            <p className={`text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                Version 1.2.0 (Stable)<br />
                                Gemini Multi-Modal Core
                            </p>
                        </div>
                    </div>
                </div>

                <div className={`mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        &copy; {currentYear} ICT BANGLADESH. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center space-x-6">
                        <a href="#" className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-zinc-600 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}>Privacy</a>
                        <a href="#" className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-zinc-600 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}>Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
