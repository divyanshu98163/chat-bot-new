'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  role: 'user' | 'bot';
  content: string;
};

// 1. Define your suggested actions here
const SUGGESTED_ACTIONS = [
  { label: "What is Next.js?", text: "What is Next.js?" },
  { label: "Check Time", text: "What time is it?" },
  { label: "Who are you?", text: "Who are you?" },
  { label: "Contact Support", text: "I need support" },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'bot', content: 'Hello! Click a suggestion below or type a message to start.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 2. The Bot Logic
  const getBotResponse = (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('next.js')) return "Next.js is a React framework for building full-stack web applications.";
    if (lowerText.includes('time')) return `The current time is ${new Date().toLocaleTimeString()}.`;
    if (lowerText.includes('who are you')) return "I am a simple rule-based chatbot running entirely in your browser.";
    if (lowerText.includes('support')) return "Please email us at help@example.com for further assistance.";
    if (lowerText.includes('hello') || lowerText.includes('hi')) return "Hi there! How can I help you today?";

    return "I'm not sure how to respond to that. Try one of the suggested actions!";
  };

  // 3. Shared Send Function (Used by Form & Buttons)
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput(''); // Clear input if it was used
    setIsLoading(true);

    // Simulate Network Delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: getBotResponse(text),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto h-screen bg-gray-50 text-black font-sans shadow-xl border-x border-gray-200">
      
      {/* Header */}
      <header className="p-4 bg-white border-b flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Helper Bot
        </h1>
        <span className="text-xs text-gray-400">v1.0 Local</span>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
              }`}>
              {m.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 text-gray-400 p-3 rounded-2xl rounded-bl-none text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Actions & Input Area */}
      <div className="p-4 bg-white border-t space-y-4">
        
        {/* Suggested Actions Scroll Area */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {SUGGESTED_ACTIONS.map((action, index) => (
            <button
              key={index}
              onClick={() => sendMessage(action.text)}
              disabled={isLoading}
              className="whitespace-nowrap px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors border border-gray-200 disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {/* SVG Send Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}