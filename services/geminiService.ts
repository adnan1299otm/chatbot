
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export interface AIResponse {
  text: string;
  sources?: { uri: string; title: string }[];
}

const SYSTEM_PROMPT = `You are the official AI Assistant for ICT Bangladesh (ictbangladesh.com.bd).
Strictly follow these rules:
1. ONLY provide info about ICT Bangladesh programs, services, policies, and initiatives.
2. DO NOT reference the government ICT Division or ictd.gov.bd.
3. ENTITY INFO:
   - Established: 2018.
   - Expertise: Web & Mobile App Development, Custom Software, IT Training/Consultation.
   - Clients: 30+ industries in Bangladesh & International (USA).
   - Website: https://ictbangladesh.com.bd/
   - Phone: +880 1753-060119
4. COURSES:
   - Web Development, Software Engineering, Mobile App Development, IT & Digital Skills Training.
   - Features: Practical training, experienced trainers, assignments, projects, certificate.
   - Pricing: Depends on duration; exact price after consultation.
5. SERVICES:
   - IT Consultation, Web/Mobile Apps, Custom Software, CMS & Enterprise Solutions.
6. ENROLLMENT:
   - Choose course/service -> Contact via +880 1753-060119 or website -> Enroll.
7. TONE: Professional, experienced, and institution-focused.`;

/**
 * Direct Gemini API call (Fallback)
 */
export const generateAIResponse = async (
  prompt: string,
  history: { role: string; parts: { text: string }[] }[],
  systemInstruction?: string
): Promise<AIResponse> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: systemInstruction || SYSTEM_PROMPT,
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 2048,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "I'm sorry, I couldn't process that request.";

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title)
      .map((web: any) => ({ uri: web.uri, title: web.title }));

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * n8n Real-time Chat Integration
 * Strictly following payload structure from User Image 2
 */
export const chatWithN8n = async (
  prompt: string,
  chatId: string,
  config: any
): Promise<AIResponse> => {
  const N8N_PRODUCTION_URL = import.meta.env.VITE_N8N_URL || 'https://n8n-1-14-2.onrender.com/webhook/1168bb38-0128-4e52-9f93-a7538c9e1007/chat';

  // Pure payload for n8n Chat Trigger / AI Agent
  const payload = {
    chatInput: prompt,
    sessionId: chatId,
    config: {
      audience: config.audience || 'Student',
      topic: config.topic || 'Training Courses',
      language: config.language || 'English',
      system_hint: "Focus strictly on ICT Bangladesh institutional data (est 2018)."
    },
    client_info: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      platform: typeof navigator !== 'undefined' ? navigator.platform : 'Win32'
    }
  };

  // 120-second Timeout Logic (for long agent chains)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);
  const startTime = Date.now();

  try {
    const response = await fetch(N8N_PRODUCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) throw new Error(`n8n Error: ${response.statusText}`);

    const data = await response.json();
    const duration = Date.now() - startTime;
    console.log(`n8n Chat Request (${duration}ms):`, data);

    // Deep Search for AI Output (Flexible mapping for n8n nodes)
    const findBestText = (obj: any): string | null => {
      if (!obj) return null;
      if (typeof obj === 'string') {
        const t = obj.trim();
        return (t.toLowerCase() === "workflow was started" || !t) ? null : t;
      }
      if (typeof obj !== 'object') return null;

      if (Array.isArray(obj)) {
        for (const item of obj) {
          const found = findBestText(item);
          if (found) return found;
        }
        return null;
      }

      // 1. Check Priority Keys (Standard for AI Agent / Chat Message nodes)
      const priorityKeys = ['output', 'text', 'reply', 'response', 'message', 'content', 'data', 'result'];
      for (const key of priorityKeys) {
        const val = obj[key];
        if (typeof val === 'string' && val.trim()) {
          const t = val.trim();
          if (t.toLowerCase() !== "workflow was started") return t;
        }
      }

      // 2. Single-key fallback
      const keys = Object.keys(obj);
      if (keys.length === 1) {
        const val = obj[keys[0]];
        if (typeof val === 'string' && val.trim()) {
          const t = val.trim();
          if (t.toLowerCase() !== "workflow was started") return t;
        }
      }

      // 3. Deep recursive drill-down
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          const found = findBestText(obj[key]);
          if (found) return found;
        }
      }

      return null;
    };

    const extractedText = findBestText(data);

    if (!extractedText) {
      console.warn("n8n responded but no valid text content was found.", data);
      return {
        text: "The ICT AI completed your request but the response format was unrecognizable. Please try rephrasing.",
        sources: []
      };
    }

    return {
      text: extractedText,
      sources: Array.isArray(data.sources) ? data.sources : []
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('The ICT Bangladesh AI gateway timed out (90s+). Please try again shortly.');
    }
    console.error("n8n Chat Request Failure:", error);
    throw new Error('The AI gateway is currently busy. Please try again in a moment.');
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * n8n Webhook Logging (Specific Test/Log URL)
 */
export const callN8nWebhook = async (payload: any) => {
  const N8N_LOG_URL = 'https://n8n-1-14-2.onrender.com/webhook/29b2f437-12ff-428f-99ce-855481f57a7c';

  const structuredPayload = {
    event: payload.event || "log",
    chat_id: payload.chat_id || null,
    user_id: payload.user_id || null,
    query: payload.chat_data?.query || null,
    response: payload.chat_data?.response || null,
    timestamp: payload.timestamp || new Date().toISOString(),
    metadata: payload.metadata || null
  };

  try {
    const response = await fetch(N8N_LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(structuredPayload)
    });
    return response.ok;
  } catch (error) {
    console.error("n8n Logging Error:", error);
    return false;
  }
};
