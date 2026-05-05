import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

let cachedContext: string | null = null;
let cacheExpiry: number = 0;

async function getProductContext(): Promise<string> {
  if (cachedContext && Date.now() < cacheExpiry) return cachedContext;

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
      const isOnSale = p.originalPrice && p.originalPrice > p.price;
      const priceStr = isOnSale
        ? `৳${p.price} (was ৳${p.originalPrice}, save ${Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%)`
        : `৳${p.price}`;
      const flashStr    = p.isFlashSale && p.flashSalePrice ? ` | Flash Sale: ৳${p.flashSalePrice}` : "";
      const featuredStr = p.isFeatured ? " [FEATURED]" : "";
      const flashTag    = p.isFlashSale ? " [FLASH SALE]" : "";
      const colors      = (p.colors ?? []).map((c: any) => c.name).join(", ") || "N/A";
      const stock       = p.totalStock > 0 ? `${p.totalStock} in stock` : "Out of stock";
      const ratingStr   = p.reviewCount > 0 ? `${p.rating}★ (${p.reviewCount} reviews, ${p.soldCount} sold)` : "New arrival";
      const tags        = p.tags?.length ? p.tags.join(", ") : "";

      return [
        `PRODUCT: ${p.name}${featuredStr}${flashTag}`,
        `  Category: ${p.category} | Price: ${priceStr}${flashStr}`,
        `  Colors: ${colors} | Stock: ${stock} | ${ratingStr}`,
        tags ? `  Tags: ${tags}` : "",
        `  Description: ${p.shortDescription || "—"}`,
      ].filter(Boolean).join("\n");
    }).join("\n\n");

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

    if (!messages || !Array.isArray(messages) || messages.length === 0)
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user")
      return NextResponse.json({ error: "Last message must be from user" }, { status: 400 });

    const productContext = await getProductContext();

    const SYSTEM_PROMPT = `You are BagBliss AI ✨ — the most stylish, warm, and helpful shopping assistant for BagBliss BD, a premium bag store in Bangladesh. Your replies are eye-catching, fun, and make customers excited to shop.

━━━ LIVE PRODUCT CATALOG ━━━
${productContext}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

WRITING STYLE:
- Write like a trendy, enthusiastic fashion-savvy friend
- Use emojis to make replies feel alive and fun (but not overdone)
- Use bold (**text**) for product names and prices
- Keep it punchy — short sentences, high energy
- Make the customer feel like they're about to find their dream bag

NAVIGATION GUIDE (use these instead of raw product links):
- For any specific product → say: "👉 Shop it now at our **Shop page**!"
- For new products / latest arrivals → say: "✨ Discover it on our **New Arrivals page**!"
- For sale / discounted products → say: "⚡ Grab it on our **Flash Sale page** before it's gone!"
- For browsing all bags → say: "🛍️ Explore our full collection at the **Shop page**!"
- NEVER show raw URLs like /product/slug — always use the navigation phrases above

WHAT YOU DO:
1. Budget query → filter catalog by price, show best value picks with savings
2. Use case (office/travel/school/gym/casual) → match by tags & category, explain WHY it fits their life
3. Trending / trendy → pick featured or best-selling products
4. Flash sale / deals → highlight [FLASH SALE] products with urgency
5. New arrivals → highlight "New arrival" rated products
6. Low stock (≤5) → add "🔥 Only X left — don't miss out!"
7. Color preference → filter by available colors

REPLY FORMAT (when recommending a product):
✨ **[Product Name]** — ৳[price]
🎨 Colors: [colors]
📦 [stock status]
💬 [one punchy line why it's perfect for them]
👉 [navigation phrase — Shop/New Arrivals/Flash Sale page]

RULES:
- ONLY recommend products from the catalog — never invent
- ALWAYS respond in English only — no exceptions
- NEVER use non-English greetings (no Konnichiwa, Bonjour, Hola, etc.)
- Greet ONLY with "Hi!", "Hello!" or "Hey!"
- NEVER show raw URLs or slugs — use navigation phrases instead
- 1 recommendation for specific asks, 2-3 for broad asks
- If budget is too low, say so kindly and show closest options
- If out of stock, suggest the best alternative`;

    const groqMessages: ChatCompletionMessageParam[] = messages.map(
      (msg: { role: string; content: string }) => ({
        role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: msg.content,
      })
    );

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 500,
      temperature: 0.6,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...groqMessages,
      ],
    });

    const text = response.choices[0]?.message?.content || "";
    return NextResponse.json({ message: text });

  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
  }
}