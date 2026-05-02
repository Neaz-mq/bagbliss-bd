"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebouncedCallback } from "use-debounce"; // or implement manually

interface SearchIntent {
  keywords: string[];
  category: string | null;
  priceMin: number | null;
  priceMax: number | null;
  color: string | null;
  useCase: string | null;
  sortBy: string | null;
}

// Simple debounce without extra package
function useDebounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

export default function AISmartSearch({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processWithAI = async (q: string) => {
    if (q.trim().length < 4) {
      setSuggestion("");
      setIsAIMode(false);
      return;
    }

    // Only trigger AI for natural language (5+ words or question-like)
    const wordCount = q.trim().split(" ").length;
    const isNatural = wordCount >= 3 || q.includes("?") || q.toLowerCase().includes("for") || q.toLowerCase().includes("under");

    if (!isNatural) {
      setSuggestion("");
      setIsAIMode(false);
      return;
    }

    setIsProcessing(true);
    setIsAIMode(true);

    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.suggestion && data.suggestion !== q) {
        setSuggestion(data.suggestion);
      }
    } catch {
      setSuggestion("");
    } finally {
      setIsProcessing(false);
    }
  };

  const debouncedAI = useDebounce(processWithAI, 600);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) {
      setSuggestion("");
      setIsAIMode(false);
      return;
    }
    debouncedAI(val);
  };

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    // For natural language, let AI parse the intent then redirect
    if (isAIMode && q.trim().split(" ").length >= 3) {
      try {
        const res = await fetch("/api/ai/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        const data = await res.json();
        const intent: SearchIntent = data.intent;

        // Build search URL with parsed params
        const params = new URLSearchParams();
        if (intent.keywords.length) params.set("q", intent.keywords.join(" "));
        if (intent.category) params.set("category", intent.category);
        if (intent.priceMin) params.set("minPrice", String(intent.priceMin));
        if (intent.priceMax) params.set("maxPrice", String(intent.priceMax));
        if (intent.color) params.set("color", intent.color);
        if (intent.sortBy) params.set("sort", intent.sortBy);

        router.push(`/shop?${params.toString()}`);
        return;
      } catch {
        // fallback to simple search
      }
    }

    router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") {
      setQuery("");
      setSuggestion("");
      setIsAIMode(false);
    }
  };

  const clear = () => {
    setQuery("");
    setSuggestion("");
    setIsAIMode(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 transition-all ${
          isAIMode ? "border-amber-400 shadow-sm shadow-amber-100" : "border-neutral-200 focus-within:border-neutral-400"
        }`}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          {isProcessing ? (
            <Loader2 size={16} className="animate-spin text-amber-500" />
          ) : isAIMode ? (
            <Sparkles size={16} className="text-amber-500" />
          ) : (
            <Search size={16} className="text-neutral-400" />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search bags... or try 'office bag for women under 2000'"
          className="flex-1 bg-transparent text-sm text-neutral-800 placeholder-neutral-400 outline-none"
        />

        {/* Clear */}
        {query && (
          <button onClick={clear} className="text-neutral-400 hover:text-neutral-600">
            <X size={14} />
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={() => handleSearch()}
          className="rounded-lg bg-neutral-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
        >
          Search
        </button>
      </div>

      {/* AI Suggestion Pill */}
      <AnimatePresence>
        {suggestion && suggestion !== query && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full z-10 mt-1"
          >
            <button
              onClick={() => {
                setQuery(suggestion);
                setSuggestion("");
                handleSearch(suggestion);
              }}
              className="flex w-full items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left text-sm text-amber-800 transition-colors hover:bg-amber-100"
            >
              <Sparkles size={12} className="flex-shrink-0 text-amber-500" />
              <span>Search for: <strong>{suggestion}</strong></span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Mode Label */}
      <AnimatePresence>
        {isAIMode && !suggestion && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-1 text-right text-[10px] text-amber-500"
          >
            ✦ AI-powered search active
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}