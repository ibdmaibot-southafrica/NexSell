// Auto-generated Supabase database types
// Run: npm run supabase:types
// This file will be overwritten by the generated types

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string;
          entity_type: "human" | "organization" | "ai_agent" | "machine";
          email: string | null;
          display_name: string;
          avatar_url: string | null;
          timezone: string;
          locale: string;
          trust_level: string;
          trust_score: number;
          metadata: Record<string, unknown>;
          preferences: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          last_active_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          auth_id: string;
          entity_type?: "human" | "organization" | "ai_agent" | "machine";
          email?: string | null;
          display_name: string;
          avatar_url?: string | null;
          timezone?: string;
          locale?: string;
          trust_level?: string;
          trust_score?: number;
          metadata?: Record<string, unknown>;
          preferences?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
          last_active_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          auth_id?: string;
          entity_type?: "human" | "organization" | "ai_agent" | "machine";
          email?: string | null;
          display_name?: string;
          avatar_url?: string | null;
          timezone?: string;
          locale?: string;
          trust_level?: string;
          trust_score?: number;
          metadata?: Record<string, unknown>;
          preferences?: Record<string, unknown>;
          last_active_at?: string | null;
          deleted_at?: string | null;
        };
      };
      marketplace_listings: {
        Row: {
          id: string;
          seller_id: string;
          organization_id: string | null;
          name: string;
          slug: string;
          short_description: string;
          long_description: string;
          listing_type: string;
          status: string;
          primary_category_id: string | null;
          tags: string[];
          pricing_model: string;
          price_cents: number | null;
          currency: string;
          pricing_details: Record<string, unknown>;
          logo_url: string | null;
          hero_image_url: string | null;
          view_count: number;
          purchase_count: number;
          rating_avg: number;
          rating_count: number;
          revenue_total: number;
          version: string;
          metadata: Record<string, unknown>;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          seller_id: string;
          name: string;
          slug: string;
          short_description: string;
          long_description: string;
          listing_type: string;
          organization_id?: string | null;
          status?: string;
          primary_category_id?: string | null;
          tags?: string[];
          pricing_model?: string;
          price_cents?: number | null;
          currency?: string;
          pricing_details?: Record<string, unknown>;
          logo_url?: string | null;
          hero_image_url?: string | null;
        };
        Update: {
          name?: string;
          short_description?: string;
          long_description?: string;
          status?: string;
          tags?: string[];
          pricing_model?: string;
          price_cents?: number | null;
          pricing_details?: Record<string, unknown>;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          buyer_id: string;
          buyer_agent_id: string | null;
          buyer_org_id: string | null;
          seller_id: string;
          seller_org_id: string | null;
          status: string;
          items: Record<string, unknown>[];
          subtotal_cents: number;
          discount_cents: number;
          tax_cents: number;
          shipping_cents: number;
          total_cents: number;
          currency: string;
          quote_id: string | null;
          negotiation_id: string | null;
          fulfillment_type: string;
          fulfillment_data: Record<string, unknown>;
          provisioned_at: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          cancelled_at: string | null;
        };
        Insert: {
          id?: string;
          order_number?: string;
          buyer_id: string;
          seller_id: string;
          status?: string;
          items: Record<string, unknown>[];
          subtotal_cents: number;
          total_cents: number;
          currency?: string;
        };
        Update: {
          status?: string;
          fulfillment_data?: Record<string, unknown>;
          provisioned_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
        };
      };
      ai_agents: {
        Row: {
          id: string;
          owner_id: string;
          organization_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          avatar_url: string | null;
          status: string;
          public_key: string | null;
          trust_score: number;
          trust_level: string;
          capability_manifest: Record<string, unknown>;
          supported_protocols: string[];
          max_negotiation_rounds: number;
          rate_limit_rpm: number;
          rate_limit_rpd: number;
          total_transactions: number;
          total_spend: number;
          total_revenue: number;
          is_listed: boolean;
          listing_id: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          last_active_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          description?: string | null;
          capability_manifest?: Record<string, unknown>;
          supported_protocols?: string[];
        };
        Update: {
          name?: string;
          description?: string | null;
          capability_manifest?: Record<string, unknown>;
          status?: string;
          is_listed?: boolean;
        };
      };
    };
    Views: {
      marketplace_summary: {
        Row: {
          listing_type: string;
          total_listings: number;
          published_listings: number;
          total_purchases: number;
          total_revenue: number;
          avg_rating: number | null;
        };
      };
      revenue_daily: {
        Row: {
          date: string;
          currency: string;
          order_count: number;
          revenue: number;
        };
      };
    };
    Functions: {
      // Add RPC functions as needed
    };
    Enums: {
      entity_type: "human" | "organization" | "ai_agent" | "machine";
      listing_type: "product" | "api" | "ai_agent" | "workflow" | "data_product" | "consulting" | "integration" | "template" | "subscription" | "license";
      listing_status: "draft" | "pending_review" | "published" | "unpublished" | "deprecated" | "sunset" | "rejected";
      order_status: "pending" | "confirmed" | "processing" | "provisioning" | "fulfilled" | "cancelled" | "refunded" | "disputed";
      trust_level: "unverified" | "email_verified" | "business_verified" | "kyc_verified" | "soc2_verified" | "enterprise_verified";
      pricing_model: "fixed" | "range" | "usage_based" | "tiered" | "subscription" | "freemium" | "auction" | "pay_what_you_want" | "negotiable";
    };
  };
};
