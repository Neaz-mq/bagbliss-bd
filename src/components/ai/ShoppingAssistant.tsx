"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, RotateCcw, MessageCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const BRAND = "#E91E8C";
const DARK  = "#0f0f13";

const WELCOME: Message = {
  role: "assistant",
  content: "Hey! 👜 I'm your personal bag stylist. Share your budget, occasion, or vibe — I'll find your perfect match!",
};

const QUICK = ["Under ৳1,000", "Office bag", "Travel bag", "Laptop bag"];

export default function ShoppingAssistant() {
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState<Message[]>([WELCOME]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [badge, setBadge]     = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => { if (!open) setBadge(true); }, 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) { setBadge(false); setTimeout(() => inputRef.current?.focus(), 250); }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    const userMsg: Message = { role: "user", content: msg };
    setMsgs(p => [...p, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const allMsgs = [...msgs, userMsg];
      // ✅ Filter out the static WELCOME message — Gemini requires strict user/model alternation
      const apiMessages = allMsgs.filter(m => m !== WELCOME);

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setMsgs(p => [...p, { role: "assistant", content: data.message ?? "Sorry, try again!" }]);
    } catch {
      setMsgs(p => [...p, { role: "assistant", content: "Connection issue. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 20, left: 20, zIndex: 9999 }}>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit  ={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            style={{
              marginBottom: 12,
              width: 330,
              height: 500,
              borderRadius: 20,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              background: "#fff",
              boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            {/* ── Header ── */}
            <div style={{
              background: `linear-gradient(135deg, ${DARK} 0%, #1a0a1a 50%, #2a0a20 100%)`,
              padding: "14px 16px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -20, right: -20,
                width: 80, height: 80, borderRadius: "50%",
                background: `radial-gradient(circle, ${BRAND}40, transparent)`,
                filter: "blur(16px)",
              }} />
              <div style={{
                position: "absolute", bottom: -10, left: 60,
                width: 60, height: 60, borderRadius: "50%",
                background: "radial-gradient(circle, #7c3aed30, transparent)",
                filter: "blur(12px)",
              }} />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: `linear-gradient(135deg, ${BRAND}, #9c1060)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, boxShadow: `0 4px 16px ${BRAND}50`,
                    }}>
                      👜
                    </div>
                    <div style={{
                      position: "absolute", bottom: -2, right: -2,
                      width: 11, height: 11, borderRadius: "50%",
                      background: "#22c55e",
                      border: "2px solid #0f0f13",
                    }} />
                  </div>

                  <div>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0, letterSpacing: 0.2 }}>
                      BagBliss AI
                    </p>
                    <p style={{ color: "#22c55e", fontSize: 11, fontWeight: 500, margin: "2px 0 0" }}>
                      ● Replies instantly
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 4 }}>
                  {[
                    { icon: <RotateCcw size={13}/>, action: () => setMsgs([WELCOME]), title: "New chat" },
                    { icon: <X size={14}/>,         action: () => setOpen(false),    title: "Close" },
                  ].map((btn, i) => (
                    <button
                      key={i}
                      onClick={btn.action}
                      title={btn.title}
                      style={{
                        width: 28, height: 28, borderRadius: 8, border: "none", cursor: "pointer",
                        background: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
                      }}
                    >
                      {btn.icon}
                    </button>
                  ))}
                </div>
              </div>

              <p style={{
                color: "rgba(255,255,255,0.35)", fontSize: 11,
                margin: "8px 0 0", position: "relative",
              }}>
                Your AI personal shopper · Powered by Groq AI
              </p>
            </div>

            {/* ── Messages ── */}
            <div style={{
              flex: 1, overflowY: "auto",
              padding: "14px 14px",
              display: "flex", flexDirection: "column", gap: 10,
              background: "linear-gradient(180deg, #faf8f6 0%, #f5f2ef 100%)",
            }}>
              {msgs.map((m, i) => (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}>
                  {m.role === "assistant" && (
                    <div style={{
                      width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                      background: `linear-gradient(135deg, ${BRAND}, #9c1060)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, marginRight: 6, alignSelf: "flex-end",
                    }}>
                      👜
                    </div>
                  )}
                  <div style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    fontSize: 13,
                    lineHeight: 1.55,
                    ...(m.role === "user"
                      ? {
                          background: `linear-gradient(135deg, ${BRAND}, #c4166f)`,
                          color: "#fff",
                          boxShadow: `0 4px 16px ${BRAND}35`,
                        }
                      : {
                          background: "#fff",
                          color: "#1a1a1a",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                          border: "1px solid rgba(0,0,0,0.06)",
                        }
                    ),
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}

              {/* Typing dots */}
              {loading && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                    background: `linear-gradient(135deg, ${BRAND}, #9c1060)`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                  }}>👜</div>
                  <div style={{
                    background: "#fff", borderRadius: "18px 18px 18px 4px",
                    padding: "12px 16px", display: "flex", gap: 5, alignItems: "center",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}>
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: "#ccc", display: "block" }}
                        animate={{ y: [0, -5, 0], backgroundColor: ["#ccc", BRAND, "#ccc"] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick replies */}
              {msgs.length === 1 && !loading && (
                <div style={{ marginTop: 4 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                    Try asking
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {QUICK.map(q => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        style={{
                          border: "1.5px solid #e5e5e5",
                          borderRadius: 99, padding: "6px 12px",
                          fontSize: 12, fontWeight: 500, cursor: "pointer",
                          background: "#fff", color: "#555",
                          transition: "all 0.15s",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.borderColor = BRAND;
                          el.style.background  = BRAND;
                          el.style.color       = "#fff";
                          el.style.boxShadow   = `0 4px 12px ${BRAND}40`;
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.borderColor = "#e5e5e5";
                          el.style.background  = "#fff";
                          el.style.color       = "#555";
                          el.style.boxShadow   = "0 1px 4px rgba(0,0,0,0.06)";
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Input ── */}
            <div style={{
              borderTop: "1px solid #efefef",
              padding: "10px 12px 12px",
              background: "#fff",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                border: "1.5px solid #e8e8e8",
                borderRadius: 14, padding: "8px 10px",
                background: "#fafafa",
                transition: "border-color 0.15s",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = BRAND)}
              onBlur={e  => (e.currentTarget.style.borderColor = "#e8e8e8")}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && send()}
                  placeholder="Ask about bags..."
                  disabled={loading}
                  style={{
                    flex: 1, border: "none", outline: "none",
                    background: "transparent",
                    fontSize: 13, color: "#1a1a1a",
                  }}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  style={{
                    width: 32, height: 32, borderRadius: 10, border: "none",
                    background: input.trim() ? `linear-gradient(135deg, ${BRAND}, #c4166f)` : "#e8e8e8",
                    color: input.trim() ? "#fff" : "#aaa",
                    cursor: input.trim() ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: input.trim() ? `0 4px 12px ${BRAND}45` : "none",
                    transition: "all 0.2s",
                  }}
                >
                  <Send size={13} />
                </button>
              </div>
              <p style={{
                textAlign: "center", fontSize: 10,
                color: "#bbb", marginTop: 8,
              }}>
                Powered by Groq AI · Free
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB Trigger Button ── */}
      <motion.button
        onClick={() => setOpen(p => !p)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        style={{
          width: 56, height: 56, borderRadius: "50%",
          border: "none", cursor: "pointer",
          background: open
            ? "#1a1a1a"
            : `linear-gradient(135deg, ${BRAND} 0%, #9c1060 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: open
            ? "0 8px 24px rgba(0,0,0,0.3)"
            : `0 8px 28px ${BRAND}60`,
          position: "relative",
          transition: "background 0.3s, box-shadow 0.3s",
        }}
      >
        {!open && (
          <motion.div
            style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              background: `${BRAND}50`,
            }}
            animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ color: "#fff", display: "flex" }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ color: "#fff", display: "flex" }}
            >
              <MessageCircle size={22} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {badge && !open && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{
                position: "absolute", top: -2, right: -2,
                width: 18, height: 18, borderRadius: "50%",
                background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 800, color: BRAND,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              1
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}