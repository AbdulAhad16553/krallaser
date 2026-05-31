import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const { message, history = [] } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Try models in order: 2.5-flash-lite (budget) -> 1.5-flash-8b -> gemini-pro
    const modelsToTry = ["gemini-2.5-flash-lite", "gemini-1.5-flash-8b", "gemini-pro"];
    let lastError: Error | null = null;

    for (const modelId of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelId });
        const formattedHistory = (history || []).slice(-10).map((h: { role: string; content: string }) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }],
        }));

        const chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [
                {
                  text: "You are Krallaser's assistant (krallaser.com), a Lahore-based importer of METAL fiber laser cutting machines in Pakistan—not wood CNC routers or CO2/acrylic machines. Topics: 1kW–3kW fiber laser prices, Cypcut & Weihong & MAX/Raycus, sheet/tube/mark/weld for steel/aluminum, single-phase/solar setups, spare parts. Do not describe Krallaser as a wood CNC shop. Phone +92 321 4198406.",
                },
              ],
            },
            {
              role: "model",
              parts: [
                {
                  text: "I'll help with Krallaser laser machines, imports, parts, and common Pakistan buyer questions.",
                },
              ],
            },
            ...formattedHistory,
          ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        return NextResponse.json({ reply: text });
      } catch (e) {
        lastError = e as Error;
        continue;
      }
    }

    throw lastError ?? new Error("All models failed");
  } catch (error) {
    const err = error as Error;
    console.error("Chat API error:", err?.message || err);
    const msg = err?.message || "Failed to get response. Please try again.";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
