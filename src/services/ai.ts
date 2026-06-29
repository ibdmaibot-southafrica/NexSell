// ============================================================
// NexSell AI Service — Powered by OpenRouter
// One API, 100+ models. Swap models without changing code.
// ============================================================

import { env } from "@/env";

// ── OpenRouter Client ─────────────────────────────────────

const OPENROUTER_BASE = env.server.OPENROUTER_BASE_URL;
const OPENROUTER_KEY = env.server.OPENROUTER_API_KEY;

interface OpenRouterMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
}

interface OpenRouterTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface ChatResponse {
  content: string;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
}

/**
 * Call any model through OpenRouter.
 * OpenRouter is OpenAI-compatible — same API shape, 100x more models.
 */
async function chat(params: {
  model?: string;
  messages: OpenRouterMessage[];
  tools?: OpenRouterTool[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" | "text" };
  stream?: boolean;
}): Promise<ChatResponse> {
  const model = params.model || env.server.AI_MODEL;

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://nexsell.com",
      "X-Title": "NexSell",
    },
    body: JSON.stringify({
      model,
      messages: params.messages,
      ...(params.tools && { tools: params.tools }),
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 4096,
      ...(params.response_format && { response_format: params.response_format }),
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const choice = data.choices[0];

  return {
    content: choice.message.content,
    model: data.model,
    usage: data.usage,
    tool_calls: choice.message.tool_calls,
  };
}

/**
 * Generate embeddings via OpenRouter.
 * Used for semantic product search, agent matching, and knowledge retrieval.
 */
async function embed(params: {
  model?: string;
  input: string | string[];
}): Promise<{ embeddings: number[][]; model: string; usage: { prompt_tokens: number; total_tokens: number } }> {
  const model = params.model || env.server.AI_EMBEDDING_MODEL;
  const inputs = Array.isArray(params.input) ? params.input : [params.input];

  const response = await fetch(`${OPENROUTER_BASE}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: inputs,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter embedding error (${response.status}): ${error}`);
  }

  const data = await response.json();

  return {
    embeddings: data.data.map((d: any) => d.embedding),
    model: data.model,
    usage: data.usage,
  };
}

// ── NexSell AI Capabilities ───────────────────────────────

/**
 * AI-powered negotiation.
 * The agent negotiates on behalf of the buyer or seller.
 */
export async function negotiate(params: {
  role: "buyer" | "seller";
  product_name: string;
  product_description: string;
  current_price_cents: number;
  offer_cents: number;
  round: number;
  max_rounds: number;
  strategy: string;
  constraints?: {
    max_price_cents?: number;
    min_price_cents?: number;
    budget_cents?: number;
  };
  negotiation_history?: Array<{ role: string; amount_cents: number; message: string }>;
}): Promise<{
  action: "accept" | "counter_offer" | "reject" | "walk_away";
  counter_offer_cents?: number;
  reasoning: string;
}> {
  const systemPrompt = `You are an AI negotiation agent for NexSell, an autonomous commerce platform.
You are negotiating on behalf of the ${params.role}.

Rules:
- Be professional and data-driven
- Consider the negotiation history and strategy
- Stay within constraints if provided
- Round ${params.round} of ${params.max_rounds}
- If this is the last round, you MUST accept or reject (no more counter-offers)
- Respond in JSON format only`;

  const userPrompt = `Product: ${params.product_name}
Description: ${params.product_description}
Current asking price: $${(params.current_price_cents / 100).toFixed(2)}
${params.role === "buyer" ? `My offer: $${(params.offer_cents / 100).toFixed(2)}` : `Buyer's offer: $${(params.offer_cents / 100).toFixed(2)}`}
Strategy: ${params.strategy}
${params.constraints?.max_price_cents ? `Max budget: $${(params.constraints.max_price_cents / 100).toFixed(2)}` : ""}
${params.constraints?.min_price_cents ? `Minimum acceptable: $${(params.constraints.min_price_cents / 100).toFixed(2)}` : ""}

${params.negotiation_history?.length ? `History:\n${params.negotiation_history.map(h => `- ${h.role}: $${(h.amount_cents / 100).toFixed(2)} — ${h.message}`).join("\n")}` : ""}

Decide: accept, counter_offer, reject, or walk_away. Provide your reasoning.`;

  const result = await chat({
    model: env.server.AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3, // Low temperature for consistent negotiation
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return { action: "reject", reasoning: "Failed to parse negotiation response" };
  }
}

/**
 * AI-powered product recommendation.
 * Suggests products based on user needs, past purchases, and market data.
 */
export async function recommend(params: {
  user_query: string;
  user_history?: string[];
  available_products: Array<{
    id: string;
    name: string;
    description: string;
    price_cents: number;
    rating: number;
    tags: string[];
  }>;
  budget_cents?: number;
}): Promise<{
  recommended_ids: string[];
  reasoning: string;
}> {
  const result = await chat({
    model: env.server.AI_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a product recommendation engine for NexSell. 
Analyze the user's needs and recommend the best products from the available options.
Consider: relevance, quality (rating), price, and value.
Respond in JSON: { "recommended_ids": ["id1", "id2"], "reasoning": "..." }`,
      },
      {
        role: "user",
        content: `Query: ${params.user_query}
${params.budget_cents ? `Budget: $${(params.budget_cents / 100).toFixed(2)}` : ""}
${params.user_history?.length ? `Past purchases: ${params.user_history.join(", ")}` : ""}

Available products:
${params.available_products.map(p => `- ${p.name} ($${(p.price_cents / 100).toFixed(2)}) — ${p.short_description || p.description.slice(0, 100)} — Rating: ${p.rating} — Tags: ${p.tags.join(", ")}`).join("\n")}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return { recommended_ids: [], reasoning: "Failed to parse recommendation response" };
  }
}

/**
 * AI-powered support agent.
 * Handles customer support cases autonomously.
 */
export async function supportAgent(params: {
  subject: string;
  body: string;
  order_context?: string;
  product_context?: string;
  previous_messages?: Array<{ role: string; content: string }>;
}): Promise<{
  response: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  suggested_actions: string[];
}> {
  const result = await chat({
    model: env.server.AI_MODEL,
    messages: [
      {
        role: "system",
        content: `You are an AI support agent for NexSell. Resolve the customer's issue if possible.
If you can resolve it, set resolved: true and explain the resolution.
If you need more info, set resolved: false and ask clarifying questions.
Categorize and prioritize the issue.
Respond in JSON: { "response": "...", "category": "...", "priority": "...", "resolved": bool, "suggested_actions": [...] }`,
      },
      {
        role: "user",
        content: `Subject: ${params.subject}
Message: ${params.body}
${params.order_context ? `Order context: ${params.order_context}` : ""}
${params.product_context ? `Product context: ${params.product_context}` : ""}`,
      },
      ...(params.previous_messages || []).map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  try {
    return JSON.parse(result.content);
  } catch {
    return {
      response: "I'm looking into your issue. A human agent will follow up shortly.",
      category: "general",
      priority: "medium",
      resolved: false,
      suggested_actions: ["escalate_to_human"],
    };
  }
}

/**
 * AI-powered contract generation.
 * Generates purchase agreements from negotiation outcomes.
 */
export async function generateContract(params: {
  buyer_name: string;
  seller_name: string;
  product_name: string;
  product_description: string;
  price_cents: number;
  currency: string;
  terms?: string;
  subscription?: { interval: string; duration: string };
}): Promise<string> {
  const result = await chat({
    model: env.server.AI_MODEL,
    messages: [
      {
        role: "system",
        content: "You are a contract generation AI. Generate a clear, professional purchase agreement in markdown. Include all standard commercial terms.",
      },
      {
        role: "user",
        content: `Generate a purchase agreement:
Buyer: ${params.buyer_name}
Seller: ${params.seller_name}
Product: ${params.product_name}
Description: ${params.product_description}
Price: $${(params.price_cents / 100).toFixed(2)} ${params.currency}
${params.terms ? `Special terms: ${params.terms}` : ""}
${params.subscription ? `Subscription: ${params.subscription.interval} for ${params.subscription.duration}` : "One-time purchase"}
Date: ${new Date().toISOString().split("T")[0]}`,
      },
    ],
    temperature: 0.1,
  });

  return result.content;
}

/**
 * Generate embeddings for product search.
 * Powers semantic discovery across the marketplace.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embed({ input: text });
  return result.embeddings[0];
}

/**
 * Batch embed multiple texts (for catalog indexing).
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // OpenRouter/embedding APIs often have batch limits
  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const result = await embed({ input: batch });
    allEmbeddings.push(...result.embeddings);
  }

  return allEmbeddings;
}

// ── Model Catalog (available via OpenRouter) ──────────────

/**
 * Recommended models for different tasks.
 * Swap freely — OpenRouter handles routing.
 */
export const AI_MODELS = {
  // Primary reasoning (negotiation, recommendations, support)
  reasoning: [
    "openai/gpt-4o",              // Best general-purpose
    "anthropic/claude-sonnet-4",   // Strong reasoning
    "google/gemini-2.5-pro",       // Good at long context
    "meta-llama/llama-3.3-70b",   // Open source, cheap
  ],

  // Fast/cheap (classification, triage, simple tasks)
  fast: [
    "openai/gpt-4o-mini",         // Fast + cheap
    "anthropic/claude-3.5-haiku",  // Very fast
    "google/gemini-2.0-flash",     // Google's fast model
    "meta-llama/llama-3.3-8b",    // Cheapest decent model
  ],

  // Embeddings (semantic search)
  embeddings: [
    "openai/text-embedding-3-large",  // Best quality (3072 dim)
    "openai/text-embedding-3-small",  // Good quality, cheaper
  ],

  // Code generation (developer tools, API specs)
  code: [
    "openai/gpt-4o",
    "anthropic/claude-sonnet-4",
    "deepseek/deepseek-coder",     // Specialized for code
  ],
} as const;
