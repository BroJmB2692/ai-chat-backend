import OpenAI from "openai";

export default async function handler(req, res) {
  // --- CORS HEADERS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse body safely
    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: "Missing 'message' in request body" });
    }

    // Initialize OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const businessData = require("../data/business.json");
    
    // Call OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
{
  role: "system",
  content: `
You are Nova, the official AI assistant for Engage IT Partners.

Your ONLY purpose is to answer questions about:
- Engage IT Partners services
- automation kits
- pricing
- workflows
- onboarding
- support
- scheduling
- client use cases
- technical capabilities
- business information provided below

STRICT RULES:
1. You must ONLY answer using Engage IT Partners content.
2. If the user asks about anything unrelated (politics, celebrities, math, general knowledge, etc.), politely redirect them back to Engage IT Partners.
3. Never invent services, pricing, or capabilities that were not provided.
4. Keep your tone confident, warm, modern, and concise.
5. If you don’t have the information, say so and guide the user back to approved topics.

BUSINESS CONTENT (JSON):
${JSON.stringify(businessData, null, 2)}
`
},
{ role: "user", content: message }
      ],
    });

    const reply = completion.choices?.[0]?.message?.content || "";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
