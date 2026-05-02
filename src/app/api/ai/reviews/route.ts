import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";

interface Review {
  rating: number;
  comment: string;
  createdAt?: string;
}

interface ReviewSummary {
  overallSentiment: "positive" | "mixed" | "negative";
  summary: string;          // 2-3 sentence overview
  pros: string[];           // Top 3 positives
  cons: string[];           // Top 3 negatives (empty if none)
  recommendationRate: number; // 0–100
  topKeywords: string[];    // Recurring words customers mention
}

// Simple in-memory cache (per product)
const summaryCache = new Map<string, { data: ReviewSummary; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function POST(req: NextRequest) {
  try {
    const { productId, reviews } = await req.json();

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json({ error: "Reviews array required" }, { status: 400 });
    }

    // Return cache if fresh
    if (productId) {
      const cached = summaryCache.get(productId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json({ summary: cached.data, cached: true });
      }
    }

    // Limit to 20 most recent reviews to stay within token limits
    const recentReviews: Review[] = reviews.slice(-20);

    const reviewText = recentReviews
      .map((r, i) => `Review ${i + 1} (${r.rating}/5): ${r.comment}`)
      .join("\n");

    const avgRating = (recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length).toFixed(1);

    const prompt = `
You are analyzing customer reviews for a product on BagBliss BD (a bag e-commerce store in Bangladesh).

Average Rating: ${avgRating}/5
Total Reviews Analyzed: ${recentReviews.length}

Reviews:
${reviewText}

Summarize these reviews objectively. Return ONLY valid JSON (no markdown):
{
  "overallSentiment": "positive or mixed or negative",
  "summary": "2-3 sentence balanced overview of what customers say",
  "pros": ["up to 3 most mentioned positives"],
  "cons": ["up to 3 most mentioned negatives, empty array if mostly positive"],
  "recommendationRate": number between 0 and 100,
  "topKeywords": ["5 keywords customers repeatedly mention"]
}`;

    const summary = await generateJSON<ReviewSummary>(prompt);

    // Cache it
    if (productId) {
      summaryCache.set(productId, { data: summary, timestamp: Date.now() });
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("AI Review Summary error:", error);
    return NextResponse.json({ error: "Failed to summarize reviews" }, { status: 500 });
  }
}