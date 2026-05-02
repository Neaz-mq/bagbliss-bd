"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, RotateCcw, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME: Message = {
  role: "assistant",
  content: "Hi! 👋 I'm BagBliss AI. Tell me your budget, occasion, or style and I'll find the perfect bag for you!",
};

const QUICK = ["Under ৳1,000", "Office bag", "Travel bag", "Laptop bag"];

export default function ShoppingAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [badge, setBadge] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => { if (!open) setBadge(true); }, 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) {
      setBadge(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    const userMsg: Message = { role: "user", content: msg };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages(p => [...p, { role: "assistant", content: data.message ?? "Sorry, try again!" }]);
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "Connection issue. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-40">

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="mb-3 flex flex-col overflow-hidden rounded-2xl bg-white"
            style={{
              width: 320,
              height: 460,
              boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ background: "linear-gradient(120deg,#1a1a2e,#2d1b4e)" }}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#E91E8C] text-base shadow">
                  👜
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1a1a2e] bg-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none text-white">BagBliss AI</p>
                  <p className="mt-0.5 text-[11px] font-medium text-emerald-400">● Always online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMessages([WELCOME])}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
                  title="Reset chat"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto bg-[#f7f5f3] px-3 py-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-sm bg-[#E91E8C] text-white"
                        : "rounded-bl-sm bg-white text-neutral-800 shadow-sm ring-1 ring-black/5"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {/* Typing dots */}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-neutral-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick replies — first message only */}
              {messages.length === 1 && !loading && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {QUICK.map(q => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[12px] font-medium text-neutral-600 shadow-sm transition hover:border-[#E91E8C] hover:bg-[#E91E8C] hover:text-white"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-neutral-100 bg-white px-3 py-2.5">
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 transition-all focus-within:border-[#E91E8C] focus-within:bg-white">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && send()}
                  placeholder="Ask about bags..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-[13px] text-neutral-800 placeholder-neutral-400 outline-none"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#E91E8C] text-white shadow transition hover:bg-[#c4166f] disabled:opacity-30"
                >
                  <Send size={12} />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-neutral-400">
                Powered by Gemini AI · Free
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        onClick={() => setOpen(p => !p)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 220 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center gap-2 rounded-2xl px-4 py-2.5 text-white shadow-lg"
        style={{ background: "linear-gradient(120deg,#1a1a2e,#2d1b4e)" }}
      >
        {/* Pulse ring */}
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-2xl bg-[#2d1b4e]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}

        <Sparkles size={15} className="relative text-[#E91E8C]" />
        <span className="relative text-[13px] font-semibold">
          {open ? "Close" : "AI Assistant"}
        </span>

        {/* Unread badge */}
        <AnimatePresence>
          {badge && !open && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E91E8C] text-[9px] font-bold text-white"
            >
              1
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}