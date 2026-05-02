import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are BagBliss AI — a friendly, expert shopping assistant for BagBliss BD, a premium bag store in Bangladesh.

Your job:
- Help customers find the perfect bag based on their needs, budget, and style
- Answer questions about bag types (tote, backpack, sling, handbag, laptop bag, travel bag, etc.)
- Suggest products based on use case (office, travel, school, casual, gym)
- Provide care tips, material info, and size guidance
- Be warm, concise, and helpful — like a knowledgeable friend

Pricing context (BDT):
- Budget: ৳500–৳1,500
- Mid-range: ৳1,500–৳4,000
- Premium: ৳4,000+

Always respond in the language the customer uses (Bengali or English).
Keep responses short and practical (2–4 sentences max unless listing options).
Never make up specific product names or prices — suggest categories instead.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build chat history (exclude last user message)
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "System instructions: " + SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood! I'm BagBliss AI, ready to help customers find their perfect bag. How can I assist?" }] },
        ...history,
      ],
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
  }
}