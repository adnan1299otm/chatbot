
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: { uri: string; title: string }[];
}

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light'
}

export interface ChatConfig {
  service: string;
  division: string;
  language: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}
