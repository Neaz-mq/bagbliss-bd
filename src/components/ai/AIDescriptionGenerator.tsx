"use client";

import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface ProductInput {
  name: string;
  category: string;
  material?: string;
  color?: string;
  price?: number;
  features?: string[];
}

interface GeneratedContent {
  shortDescription: string;
  longDescription: string;
  bulletPoints: string[];
  seoTitle: string;
  seoDescription: string;
  tags: string[];
}

interface Props {
  product: ProductInput;
  onApply?: (content: GeneratedContent) => void;
}

export default function AIDescriptionGenerator({ product, onApply }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [tone, setTone] = useState<"professional" | "casual" | "luxury">("professional");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>("shortDescription");

  const generate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, tone }),
      });
      const data = await res.json();
      if (data.content) {
        setContent(data.content);
        toast.success("AI description generated!");
      } else {
        toast.error("Failed to generate. Try again.");
      }
    } catch {
      toast.error("AI service error.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("Copied!");
  };

  const sections = content
    ? [
        { key: "shortDescription", label: "Short Description", value: content.shortDescription, type: "text" },
        { key: "longDescription", label: "Full Description", value: content.longDescription, type: "text" },
        { key: "bulletPoints", label: "Key Features", value: content.bulletPoints, type: "list" },
        { key: "seoTitle", label: "SEO Title", value: content.seoTitle, type: "text" },
        { key: "seoDescription", label: "Meta Description", value: content.seoDescription, type: "text" },
        { key: "tags", label: "Product Tags", value: content.tags, type: "tags" },
      ]
    : [];

  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-500" />
          <span className="text-sm font-semibold text-neutral-800">AI Description Generator</span>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">FREE</span>
        </div>

        {content && (
          <button
            onClick={generate}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800"
          >
            <RefreshCw size={12} />
            Regenerate
          </button>
        )}
      </div>

      {/* Tone Selector */}
      <div className="flex gap-2 mb-4">
        {(["professional", "casual", "luxury"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTone(t)}
            className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition-all ${
              tone === t
                ? "bg-neutral-900 text-white"
                : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Generate Button */}
      {!content && (
        <button
          onClick={generate}
          disabled={isGenerating}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Generating with Gemini AI...
            </>
          ) : (
            <>
              <Sparkles size={14} className="text-amber-400" />
              Generate Descriptions
            </>
          )}
        </button>
      )}

      {/* Generated Sections */}
      <AnimatePresence>
        {content && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {sections.map(({ key, label, value, type }) => (
              <div key={key} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                <button
                  onClick={() => setExpanded(expanded === key ? null : key)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                >
                  <span className="text-xs font-semibold text-neutral-700">{label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const text = Array.isArray(value) ? value.join(", ") : value;
                        copyText(text, key);
                      }}
                      className="rounded p-1 text-neutral-400 hover:text-neutral-700"
                    >
                      {copiedKey === key ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                    </button>
                    {expanded === key ? <ChevronUp size={12} className="text-neutral-400" /> : <ChevronDown size={12} className="text-neutral-400" />}
                  </div>
                </button>

                {expanded === key && (
                  <div className="border-t border-neutral-100 px-3 py-2.5">
                    {type === "text" && (
                      <p className="text-xs leading-relaxed text-neutral-600">{value as string}</p>
                    )}
                    {type === "list" && (
                      <ul className="space-y-1">
                        {(value as string[]).map((item, i) => (
                          <li key={i} className="text-xs text-neutral-600">• {item}</li>
                        ))}
                      </ul>
                    )}
                    {type === "tags" && (
                      <div className="flex flex-wrap gap-1.5">
                        {(value as string[]).map((tag, i) => (
                          <span key={i} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Apply All Button */}
            {onApply && (
              <button
                onClick={() => { onApply(content); toast.success("Applied to form!"); }}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
              >
                Apply All to Form
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}