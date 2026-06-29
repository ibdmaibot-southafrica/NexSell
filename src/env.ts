import { z } from "zod";

export const env = {
  // Server-only (never exposed to client)
  server: {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID!,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET!,
    PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID!,
    PAYPAL_MERCHANT_ID: process.env.PAYPAL_MERCHANT_ID!,
    PAYPAL_SANDBOX: process.env.PAYPAL_SANDBOX === 'true',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY!,
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
    AI_MODEL: process.env.AI_MODEL ?? 'openai/gpt-4o',
    AI_EMBEDDING_MODEL: process.env.AI_EMBEDDING_MODEL ?? 'openai/text-embedding-3-large',
    RESEND_API_KEY: process.env.RESEND_API_KEY!,
    QDRANT_URL: process.env.QDRANT_URL!,
    QDRANT_API_KEY: process.env.QDRANT_API_KEY!,
    MEILISEARCH_HOST: process.env.MEILISEARCH_HOST!,
    MEILISEARCH_API_KEY: process.env.MEILISEARCH_API_KEY!,
    KV_REST_API_URL: process.env.KV_REST_API_URL!,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN!,
  },

  // Public (exposed to client via NEXT_PUBLIC_)
  client: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  },
} as const;

// Validate at build time
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),
  PAYPAL_CLIENT_ID: z.string().min(1),
  PAYPAL_CLIENT_SECRET: z.string().min(1),
  PAYPAL_WEBHOOK_ID: z.string().min(1),
  PAYPAL_MERCHANT_ID: z.string().min(1),
  OPENROUTER_API_KEY: z.string().min(1),
  OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  AI_MODEL: z.string().default('openai/gpt-4o'),
  AI_EMBEDDING_MODEL: z.string().default('openai/text-embedding-3-large'),
  RESEND_API_KEY: z.string().min(1),
  QDRANT_URL: z.string().url(),
  QDRANT_API_KEY: z.string().min(1),
  MEILISEARCH_HOST: z.string().url(),
  MEILISEARCH_API_KEY: z.string().min(1),
  KV_REST_API_URL: z.string().url(),
  KV_REST_API_TOKEN: z.string().min(1),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

// Only validate in production to avoid dev friction
if (process.env.NODE_ENV === "production") {
  serverSchema.parse(env.server);
  clientSchema.parse(env.client);
}
