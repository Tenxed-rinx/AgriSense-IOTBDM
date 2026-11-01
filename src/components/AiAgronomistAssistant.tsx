import React, { useState, useRef, useEffect } from 'react';
import { AgroSimulationParams } from '../utils/soilAgronomyData';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle,
  Sprout,
  HeartHandshake,
} from 'lucide-react';

interface AiAgronomistAssistantProps {
  params: AgroSimulationParams;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAgronomistAssistant: React.FC<AiAgronomistAssistantProps> = ({
  params,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Namaste! I am your AI Farm Doctor (Kisan Salahkar). I am looking at your current field conditions (${params.soilType} Soil, pH ${params.soilPh.toFixed(1)}, ${params.temperature}°C, ${params.humidity}% Air Moisture). Ask me anything about which crops to plant, how much to water, organic manure, or fixing yellow leaves!`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agronomy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          context: {
            soilType: params.soilType,
            soilMoistureAdc: params.soilMoistureAdc,
            temperature: params.temperature,
            humidity: params.humidity,
            soilPh: params.soilPh,
            salinityEc: params.salinityEc,
            nitrogenPpm: params.nitrogenPpm,
          },
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Field advice formulated.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('Chat error:', err);
      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: `For your ${params.soilType} field: Keep regular watering at dawn or dusk to avoid sun evaporation. Make sure soil drainage is clear, and add well-rotted cow dung compost to keep your soil soft and full of healthy earthworms!`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    `Is my soil ready for planting right now?`,
    `How can I improve fertility in ${params.soilType}?`,
    `How to fix sour (acidic) or chalky soil?`,
    `Best time of day to run the water pump?`,
  ];

  return (
    <div className="fixed bottom-4 right-4 z-40 w-96 max-w-[calc(100vw-2rem)]">
      {/* Minimized Bubble or Open Chatbox */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="ml-auto flex items-center gap-2.5 px-4 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all cursor-pointer font-bold text-xs border border-emerald-400/40"
        >
          <HeartHandshake className="w-4 h-4 text-emerald-200" />
          <span>Ask AI Farm Doctor (Kisan Mitra)</span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col h-[520px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-150">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white px-4 py-3 flex items-center justify-between border-b border-emerald-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sprout className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-tight">
                  AI Farm Doctor &amp; Soil Advisor
                </h4>
                <div className="text-[10px] text-emerald-300 font-medium">
                  Field: {params.soilType} · pH {params.soilPh.toFixed(1)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-emerald-200 hover:text-white p-1 rounded-md transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/70 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs whitespace-pre-wrap'
                  }`}
                >
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-1">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Farm Doctor is preparing advice...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-slate-100 border-t border-slate-200 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 text-[10px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 rounded-md border border-slate-200 transition-colors shrink-0 font-medium"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask any question about your field or crops..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
