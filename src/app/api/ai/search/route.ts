import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";

interface SearchIntent {
  keywords: string[];
  category: string | null;
  priceMin: number | null;
  priceMax: number | null;
  color: string | null;
  useCase: string | null;
  sortBy: "price_asc" | "price_desc" | "newest" | "popular" | null;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    // For very short queries, skip AI and return directly
    if (query.trim().split(" ").length <= 2) {
      return NextResponse.json({
        intent: {
          keywords: [query.trim()],
          category: null,
          priceMin: null,
          priceMax: null,
          color: null,
          useCase: null,
          sortBy: null,
        },
        suggestion: query.trim(),
      });
    }

    const prompt = `
You are a search intent parser for a Bangladeshi bag e-commerce store (BagBliss BD).

Parse this search query and extract structured intent as JSON.

Query: "${query}"

Bag categories available: backpack, tote, handbag, sling, laptop-bag, travel-bag, shoulder-bag, clutch, wallet, gym-bag

Return ONLY valid JSON in this exact shape:
{
  "keywords": ["array", "of", "search", "terms"],
  "category": "category name or null",
  "priceMin": number or null (in BDT),
  "priceMax": number or null (in BDT),
  "color": "color or null",
  "useCase": "office/travel/school/gym/casual or null",
  "sortBy": "price_asc/price_desc/newest/popular or null",
  "suggestion": "a clean short search phrase for display"
}`;

    const intent = await generateJSON<SearchIntent & { suggestion: string }>(prompt);

    return NextResponse.json({ intent, suggestion: intent.suggestion });
  } catch (error) {
    console.error("AI Search error:", error);
    // Graceful fallback — return basic keyword search
    const { query } = await req.json().catch(() => ({ query: "" }));
    return NextResponse.json({
      intent: { keywords: [query], category: null, priceMin: null, priceMax: null, color: null, useCase: null, sortBy: null },
      suggestion: query,
    });
  }
}