"use client";

import { useState, useRef, useMemo, useEffect, FormEvent } from "react";

/* ================= DATASET ================= */
const DATASET = [
  {
    id: "revenue",
    keywords: "revenue income profit pricing subscription",
    answer:
      "We generate revenue through SaaS subscriptions, enterprise licensing, and consulting services.",
  },
  {
    id: "customers",
    keywords: "customers users clients audience target",
    answer:
      "Our main customers are SMBs, freelance developers, and educational institutions.",
  },
  {
    id: "refund",
    keywords: "refund return moneyback guarantee",
    answer:
      "We offer a 30-day money-back guarantee with no questions asked.",
  },
  {
    id: "location",
    keywords: "location address office headquarters",
    answer:
      "Our headquarters are located in Silicon Valley, USA.",
  },
  {
    id: "support",
    keywords: "support help contact email phone",
    answer:
      "You can contact us at help@business.com or call +1-800-555-0123.",
  },
];

/* ================= SYNONYMS ================= */
const SYNONYMS: Record<string, string[]> = {
  revenue: ["income", "profit", "earnings", "pricing"],
  refund: ["return", "moneyback", "guarantee"],
  location: ["address", "office", "headquarters"],
  support: ["help", "contact", "email", "phone"],
  customers: ["users", "clients", "audience"],
};

/* ================= NLP HELPERS ================= */
const tokenize = (text: string) => {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2);

  const expanded = [...words];

  words.forEach(word => {
    Object.entries(SYNONYMS).forEach(([key, values]) => {
      if (values.includes(word)) expanded.push(key);
    });
  });

  return expanded;
};

const calculateScore = (user: string[], keywords: string[]) => {
  let score = 0;
  user.forEach(word => {
    if (keywords.includes(word)) score += 2;
  });
  return score / keywords.length;
};

/* ================= COMPONENT ================= */
type Message = { role: "user" | "bot"; content: string };

export default function OfflineChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! Ask me about revenue, refunds, customers, or support." },
  ]);
  const [input, setInput] = useState("");
  const lastTopic = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* Preprocess dataset once */
  const processed = useMemo(
    () =>
      DATASET.map(d => ({
        ...d,
        tokens: tokenize(d.keywords),
      })),
    []
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const findBestMatch = (query: string) => {
    const userTokens = tokenize(query);
    let best = null;
    let maxScore = 0;

    for (const item of processed) {
      const score = calculateScore(userTokens, item.tokens);
      if (score > maxScore) {
        maxScore = score;
        best = item;
      }
    }

    if (!best && lastTopic.current) {
      return processed.find(p => p.id === lastTopic.current) || null;
    }

    if (best) lastTopic.current = best.id;

    return maxScore > 0.25 ? best : null;
  };

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: "user", content: input }]);

    const match = findBestMatch(input);
    const reply = match
      ? match.answer
      : "I didn’t understand that. Try asking about revenue, refunds, or support.";

    setMessages(prev => [...prev, { role: "bot", content: reply }]);
    setInput("");
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="w-full max-w-xl bg-slate-800 rounded-xl shadow-lg p-4 flex flex-col h-[80vh]">
        <h1 className="text-center font-bold mb-3">Offline AI Chatbot</h1>

        <div className="flex-1 overflow-y-auto space-y-2 mb-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg max-w-[80%] ${m.role === "user"
                  ? "ml-auto bg-indigo-600"
                  : "mr-auto bg-slate-700"
                }`}
            >
              {m.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 p-2 rounded bg-slate-900 border border-slate-700"
          />
          <button className="bg-indigo-600 px-4 rounded">Send</button>
        </form>
      </div>
    </main>
  );
}
