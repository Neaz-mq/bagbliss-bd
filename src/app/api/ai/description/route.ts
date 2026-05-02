import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";
import { auth } from "@/lib/auth";   // ← NextAuth v5: use auth() not getServerSession

interface ProductDescriptionInput {
  name: string;
  category: string;
  material?: string;
  color?: string;
  dimensions?: string;
  price?: number;
  features?: string[];
  tone?: "professional" | "casual" | "luxury";
}

interface GeneratedContent {
  shortDescription: string;
  longDescription: string;
  bulletPoints: string[];
  seoTitle: string;
  seoDescription: string;
  tags: string[];
}

export async function POST(req: NextRequest) {
  try {
    // NextAuth v5 — call auth() directly, no authOptions needed
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ProductDescriptionInput = await req.json();
    const { name, category, material, color, dimensions, price, features, tone = "professional" } = body;

    if (!name || !category) {
      return NextResponse.json({ error: "Product name and category are required" }, { status: 400 });
    }

    const toneMap = {
      professional: "professional and trustworthy, suitable for all ages",
      casual: "friendly and approachable, targeting young adults",
      luxury: "premium and aspirational, emphasizing quality and exclusivity",
    };

    const prompt = `
You are a product copywriter for BagBliss BD, a premium bag store in Bangladesh.

Generate compelling product content for this bag:

Product Details:
- Name: ${name}
- Category: ${category}
- Material: ${material || "not specified"}
- Color: ${color || "not specified"}
- Dimensions: ${dimensions || "not specified"}
- Price: ${price ? `৳${price}` : "not specified"}
- Key Features: ${features?.length ? features.join(", ") : "not specified"}
- Tone: ${toneMap[tone]}

Return ONLY valid JSON (no markdown, no backticks) in this exact shape:
{
  "shortDescription": "1-2 sentence product summary for product cards",
  "longDescription": "3-4 paragraph full description for product page",
  "bulletPoints": ["4 to 6 specific selling points starting with action verbs"],
  "seoTitle": "SEO-optimized product title under 60 characters",
  "seoDescription": "Meta description under 155 characters with primary keyword",
  "tags": ["6 to 8 relevant search tags in lowercase"]
}`;

    const content = await generateJSON<GeneratedContent>(prompt);
    return NextResponse.json({ content });

  } catch (error) {
    console.error("AI Description error:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}