"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // 👉 REAL API CALL
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updatedMessages }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    const aiMsg: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, aiMsg]);

    let aiText = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiText += decoder.decode(value);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsg.id ? { ...m, content: aiText } : m
          )
        );
      }
    }

    setIsLoading(false);
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <div className="w-full max-w-md h-[80vh] bg-white rounded-2xl shadow-lg flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-yellow-400 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image src="/logo.jpeg" alt="logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-white">AI Chat</span>
          </div>
          <button
            onClick={clearChat}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded-full"
          >
            Clear
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
          {messages.length === 0 && (
            <div className="bg-white p-3 rounded-xl w-fit border">
              Hello! How can I help you?
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-[70%] text-sm ${m.role === "user"
                    ? "bg-yellow-400 text-white"
                    : "bg-white border"
                  }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="bg-white px-4 py-2 rounded-xl w-fit border text-sm">
              typing...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message..."
            className="flex-1 border rounded-full px-4 py-2 outline-none"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="bg-yellow-400 text-white px-5 rounded-full font-semibold disabled:opacity-50"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}
