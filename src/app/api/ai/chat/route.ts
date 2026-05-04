import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

// ── In-memory cache (5 min TTL) ──
let cachedContext: string | null = null;
let cacheExpiry: number = 0;

async function getProductContext(): Promise<string> {
  // Return cache if still valid
  if (cachedContext && Date.now() < cacheExpiry) {
    return cachedContext;
  }

  try {
    await connectDB();
    const products = await Product.find(
      { isActive: true },
      {
        name: 1, slug: 1, shortDescription: 1, price: 1,
        originalPrice: 1, category: 1, colors: 1, totalStock: 1,
        isFlashSale: 1, flashSalePrice: 1, isFeatured: 1,
        rating: 1, reviewCount: 1, soldCount: 1, tags: 1,
      }
    ).lean();

    if (!products.length) return "No products currently available.";

    const context = products.map((p: any) => {
      const isOnSale    = p.originalPrice && p.originalPrice > p.price;
      const priceStr    = isOnSale
        ? `৳${p.price} (was ৳${p.originalPrice}, save ${Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%)`
        : `৳${p.price}`;
      const flashStr    = p.isFlashSale && p.flashSalePrice
        ? ` | 🔥 Flash Sale: ৳${p.flashSalePrice}` : "";
      const featuredStr = p.isFeatured ? " ⭐" : "";
      const colors      = (p.colors ?? []).map((c: any) => c.name).join(", ") || "N/A";
      const stock       = p.totalStock > 0 ? `${p.totalStock} in stock` : "❌ Out of stock";
      const ratingStr   = p.reviewCount > 0
        ? `${p.rating}★ (${p.reviewCount} reviews, ${p.soldCount} sold)` : "New arrival";
      const tags        = p.tags?.length ? p.tags.join(", ") : "";

      return [
        `📦 ${p.name}${featuredStr}`,
        `   Category: ${p.category} | Price: ${priceStr}${flashStr}`,
        `   Colors: ${colors} | Stock: ${stock}`,
        `   Rating: ${ratingStr}`,
        tags ? `   Tags: ${tags}` : "",
        `   Desc: ${p.shortDescription || "—"} | Link: /product/${p.slug}`,
      ].filter(Boolean).join("\n");
    }).join("\n\n");

    // Cache for 5 minutes
    cachedContext = context;
    cacheExpiry   = Date.now() + 5 * 60 * 1000;

    return context;
  } catch (err) {
    console.error("AI product fetch error:", err);
    return cachedContext ?? "Product data temporarily unavailable.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    // Fetch product context and build prompt in parallel with nothing
    // (cache makes this instant after first request)
    const productContext = await getProductContext();

    const SYSTEM_PROMPT = `You are BagBliss AI 👜 — a warm, expert shopping assistant for BagBliss BD, a premium bag store in Bangladesh.

━━━ LIVE PRODUCT CATALOG ━━━
${productContext}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

PERSONALITY: Warm, enthusiastic, like a stylish friend. Use emojis naturally.

WHAT YOU DO:
1. Budget queries → filter by price, highlight savings
2. Use case (office/travel/school) → match by tags/category, explain why it fits
3. Color preference → filter by available colors
4. Flash sale → highlight flash price vs original
5. Low stock (≤5) → mention "Only X left!" for urgency
6. Always end with the product link: "Check it out at [link]"

FORMAT (when listing products):
- **[Name]** — ৳[price]
  Colors: [colors] | [stock]
  [one line why it's perfect]
  👉 [link]

RULES:
- ONLY recommend products from the catalog — never invent
- ALWAYS respond in English only — no exceptions
- NEVER use non-English greetings (no Konnichiwa, Bonjour, Hola, etc.)
- Greet ONLY with "Hi!", "Hello!" or "Hey!"
- Keep responses short: 1 pick for specific asks, 2-3 for broad asks
- Never be pushy — be genuinely helpful`;

    const groqMessages = messages.map(
      (msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })
    );

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 500,   // reduced from 700
      temperature: 0.5,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...groqMessages,
      ],
    });

    const text = response.choices[0]?.message?.content || "";
    return NextResponse.json({ message: text });

  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: "AI service unavailable" },
      { status: 500 }
    );
  }
}