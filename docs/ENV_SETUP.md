# NexSell Environment Setup Guide
# 
# HOW TO SET UP YOUR .env.local FILE:
#
# 1. Copy this file: Copy .env.example to .env.local
#    In PowerShell: copy .env.example .env.local
#
# 2. Fill in your real values in .env.local
#    .env.local is in .gitignore — it will NEVER be committed or shared
#
# 3. Never share .env.local in chat, email, or anywhere
#
# ─────────────────────────────────────────────────────────
# WHERE TO GET EACH VALUE:
# ─────────────────────────────────────────────────────────

# ── Supabase (https://supabase.com) ──────────────────────
# 1. Create a new project at supabase.com
# 2. Go to Project Settings → API
# 3. Copy the Project URL → NEXT_PUBLIC_SUPABASE_URL
# 4. Copy the anon/public key → NEXT_PUBLIC_SUPABASE_ANON_KEY
# 5. Copy the service_role key → SUPABASE_SERVICE_ROLE_KEY (keep secret!)
#
# NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
# SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ── PayPal (https://developer.paypal.com) ────────────────
# 1. Go to developer.paypal.com
# 2. Create a REST API app in My Apps & Credentials
# 3. Copy Client ID → PAYPAL_CLIENT_ID
# 4. Copy Secret → PAYPAL_CLIENT_SECRET
# 5. Copy Merchant ID from your business profile → PAYPAL_MERCHANT_ID
# 6. Create a webhook and copy its ID → PAYPAL_WEBHOOK_ID
# 7. Use Sandbox for testing, switch to Live for production
#
# PAYPAL_CLIENT_ID=AWs1bBz...
# PAYPAL_CLIENT_SECRET=EB-Ahg...
# PAYPAL_WEBHOOK_ID=WH-xxx...
# PAYPAL_MERCHANT_ID=YOUR_MERCHANT_ID
# PAYPAL_SANDBOX=true
# NEXT_PUBLIC_PAYPAL_CLIENT_ID=AWs1bBz...

# ── OpenRouter (https://openrouter.ai) ──────────────────
# 1. Go to openrouter.ai → Sign up
# 2. Go to Keys → Create a new key
# 3. Copy it → OPENROUTER_API_KEY
# 4. Choose your default model → AI_MODEL (see model list below)
#
# OPENROUTER_API_KEY=sk-or-...
# OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
# AI_MODEL=openai/gpt-4o
# AI_EMBEDDING_MODEL=openai/text-embedding-3-large
#
# Available models (swap anytime, no code changes):
#   Reasoning:  openai/gpt-4o, anthropic/claude-sonnet-4, google/gemini-2.5-pro
#   Fast/cheap: openai/gpt-4o-mini, anthropic/claude-3.5-haiku, google/gemini-2.0-flash
#   Code:       deepseek/deepseek-coder
#   Embeddings: openai/text-embedding-3-large

# ── Search (optional for MVP) ────────────────────────────
# Qdrant: https://cloud.qdrant.io → create cluster → copy URL + API key
# Meilisearch: https://www.meilisearch.com/cloud → create instance → copy host + key
#
# QDRANT_URL=https://YOUR_CLUSTER.qdrant.io
# QDRANT_API_KEY=...
# MEILISEARCH_HOST=https://YOUR_INDEX.meilisearch.io
# MEILISEARCH_API_KEY=...

# ── Email (optional for MVP) ─────────────────────────────
# Resend: https://resend.com → create API key
#
# RESEND_API_KEY=re_...

# ── Cache (optional for MVP) ─────────────────────────────
# Vercel KV: automatically available if you deploy to Vercel
# Or use any Redis provider
#
# KV_REST_API_URL=https://YOUR_KV.vercel-storage.com
# KV_REST_API_TOKEN=...

# ── App ──────────────────────────────────────────────────
# NEXT_PUBLIC_APP_URL=http://localhost:3000
# NODE_ENV=development

# ─────────────────────────────────────────────────────────
# MINIMUM REQUIRED TO RUN LOCALLY:
# ─────────────────────────────────────────────────────────
# You only NEED these to start the dev server:
#   - Supabase (URL + anon key + service role key)
#   - PayPal (client ID + secret + merchant ID)
#   - OpenRouter (API key — gives you 100+ models)
#
# Everything else can be added later.
# ─────────────────────────────────────────────────────────
