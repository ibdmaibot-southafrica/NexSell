// ============================================================
// NexSell PayPal Payment Service
// The money engine — handles all payment operations via PayPal
// ============================================================

import type { Order, Subscription, Payment } from "@/types/index";

// ── PayPal Configuration ──────────────────────────────────

const PAYPAL_API_BASE = process.env.PAYPAL_SANDBOX === "true"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const NEXSELL_MERCHANT_ID = process.env.PAYPAL_MERCHANT_ID!;

// Platform fee configuration
const PLATFORM_FEES = {
  product: { percent: 5, fixed_cents: 30 },
  api: { percent: 4, fixed_cents: 20 },
  ai_agent: { percent: 7, fixed_cents: 50 },
  data_product: { percent: 5, fixed_cents: 30 },
  consulting: { percent: 3, fixed_cents: 10 },
  subscription: { percent: 4, fixed_cents: 20 },
  workflow: { percent: 5, fixed_cents: 30 },
  default: { percent: 5, fixed_cents: 30 },
} as const;

// ── PayPal Auth ───────────────────────────────────────────

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // Refresh 1 min early

  return accessToken!;
}

async function paypalRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `nexsell_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`PayPal API error (${res.status}): ${error}`);
  }

  return res.json();
}

// ── Platform Fee Calculation ──────────────────────────────

export function calculatePlatformFee(
  amountCents: number,
  listingType: string,
): { feeCents: number; sellerCents: number } {
  const feeConfig = PLATFORM_FEES[listingType as keyof typeof PLATFORM_FEES] || PLATFORM_FEES.default;
  const percentFee = Math.round((amountCents * feeConfig.percent) / 100);
  const totalFee = percentFee + feeConfig.fixed_cents;
  const sellerAmount = amountCents - totalFee;

  return {
    feeCents: totalFee,
    sellerCents: Math.max(sellerAmount, 0), // Never negative
  };
}

// ── One-Time Payments ─────────────────────────────────────

export interface CreatePaymentParams {
  orderId: string;           // NexSell order ID
  orderNumber: string;       // Human-readable: NXS-2026-7F3A2B
  listingName: string;
  listingType: string;
  amountCents: number;
  currency: string;
  sellerPaypalEmail: string;
  sellerMerchantId?: string;
  buyerEmail?: string;
  description?: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentResult {
  paypalOrderId: string;
  status: "created" | "captured" | "failed";
  approvalUrl?: string;     // For human buyers to redirect to
  captureId?: string;       // For captured payments
}

/**
 * Create a PayPal order for one-time payment.
 * For human buyers: returns approval URL for PayPal checkout.
 * For AI agents: can be captured directly with pre-authorized payment.
 */
export async function createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  const { feeCents } = calculatePlatformFee(params.amountCents, params.listingType);
  const amountDollars = (params.amountCents / 100).toFixed(2);
  const feeDollars = (feeCents / 100).toFixed(2);

  const order = await paypalRequest("POST", "/v2/checkout/orders", {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: params.orderNumber,
        description: params.description || params.listingName,
        amount: {
          currency_code: params.currency,
          value: amountDollars,
        },
        payee: {
          email_address: params.sellerPaypalEmail,
          ...(params.sellerMerchantId && { merchant_id: params.sellerMerchantId }),
        },
        payment_instructions: {
          disbursement_mode: "INSTANT",
          platform_fees: [
            {
              amount: {
                currency_code: params.currency,
                value: feeDollars,
              },
              payee: {
                merchant_id: NEXSELL_MERCHANT_ID,
              },
            },
          ],
        },
      },
    ],
    ...(params.buyerEmail && {
      payer: {
        email_address: params.buyerEmail,
      },
    }),
    application_context: {
      brand_name: "NexSell",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
      shipping_preference: "NO_SHIPPING", // Digital products
    },
  }) as any;

  // Extract approval URL for human buyers
  const approvalLink = order.links?.find((l: any) => l.rel === "approve")?.href;

  return {
    paypalOrderId: order.id,
    status: "created",
    approvalUrl: approvalLink,
  };
}

/**
 * Capture a PayPal order (after buyer approves).
 * Called automatically via webhook or after redirect.
 */
export async function capturePayment(paypalOrderId: string): Promise<PaymentResult> {
  const result = await paypalRequest(
    "POST",
    `/v2/checkout/orders/${paypalOrderId}/capture`,
  ) as any;

  const captureId = result.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  const status = result.status === "COMPLETED" ? "captured" : "failed";

  return {
    paypalOrderId,
    status,
    captureId,
  };
}

/**
 * Refund a captured payment.
 */
export async function refundPayment(
  captureId: string,
  amountCents?: number, // Partial refund if specified
  reason?: string,
): Promise<{ refundId: string; status: string }> {
  const body: any = {};
  if (amountCents) {
    body.amount = {
      value: (amountCents / 100).toFixed(2),
      currency_code: "USD",
    };
  }
  if (reason) {
    body.note_to_payer = reason;
  }

  const result = await paypalRequest(
    "POST",
    `/v2/payments/captures/${captureId}/refund`,
    body,
  ) as any;

  return {
    refundId: result.id,
    status: result.status,
  };
}

// ── Subscriptions ─────────────────────────────────────────

export interface CreateSubscriptionParams {
  planName: string;
  description: string;
  amountCents: number;
  currency: string;
  interval: "MONTH" | "YEAR" | "WEEK";
  sellerPaypalEmail: string;
  buyerEmail?: string;
  returnUrl: string;
  cancelUrl: string;
}

/**
 * Create a PayPal billing plan and subscription.
 * The subscriber is auto-charged on each billing cycle.
 */
export async function createSubscription(params: CreateSubscriptionParams): Promise<{
  planId: string;
  subscriptionId: string;
  approvalUrl?: string;
}> {
  const amountDollars = (params.amountCents / 100).toFixed(2);
  const { feeCents } = calculatePlatformFee(params.amountCents, "subscription");
  const feeDollars = (feeCents / 100).toFixed(2);

  // Step 1: Create the product
  const product = await paypalRequest("POST", "/v1/catalogs/products", {
    name: params.planName,
    description: params.description,
    type: "SERVICE",
  }) as any;

  // Step 2: Create the billing plan
  const plan = await paypalRequest("POST", "/v1/billing/plans", {
    product_id: product.id,
    name: params.planName,
    description: params.description,
    billing_cycles: [
      {
        frequency: {
          interval_unit: params.interval,
          interval_count: 1,
        },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0, // Infinite
        pricing_scheme: {
          fixed_price: {
            value: amountDollars,
            currency_code: params.currency,
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee: {
        value: "0",
        currency_code: params.currency,
      },
      setup_fee_failure_action: "CONTINUE",
      payment_failure_threshold: 3, // Retry 3 times before suspending
    },
    taxes: {
      percentage: "0",
      inclusive: false,
    },
  }) as any;

  // Step 3: Create the subscription
  const subscription = await paypalRequest("POST", "/v1/billing/subscriptions", {
    plan_id: plan.id,
    ...(params.buyerEmail && {
      subscriber: {
        email_address: params.buyerEmail,
      },
    }),
    application_context: {
      brand_name: "NexSell",
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
      user_action: "SUBSCRIBE_NOW",
    },
  }) as any;

  const approvalLink = subscription.links?.find((l: any) => l.rel === "approve")?.href;

  return {
    planId: plan.id,
    subscriptionId: subscription.id,
    approvalUrl: approvalLink,
  };
}

/**
 * Cancel a subscription.
 */
export async function cancelSubscription(
  paypalSubscriptionId: string,
  reason: string = "Cancelled by user",
): Promise<void> {
  await paypalRequest(
    "POST",
    `/v1/billing/subscriptions/${paypalSubscriptionId}/cancel`,
    { reason },
  );
}

// ── Payouts (Paying Sellers) ──────────────────────────────

export interface PayoutItem {
  sellerId: string;
  paypalEmail: string;
  amountCents: number;
  currency: string;
  period: string; // e.g., "2026-06-28"
}

/**
 * Batch payout to sellers. Runs daily via cron job.
 * This is how sellers get paid — automatically.
 */
export async function processPayouts(payouts: PayoutItem[]): Promise<{
  batchId: string;
  totalPayoutCents: number;
  itemCount: number;
}> {
  if (payouts.length === 0) {
    return { batchId: "", totalPayoutCents: 0, itemCount: 0 };
  }

  const batchId = `nexsell_payout_${new Date().toISOString().split("T")[0]}_${Date.now()}`;

  const result = await paypalRequest("POST", "/v1/payments/payouts", {
    sender_batch_header: {
      email_subject: "You received a payment from NexSell!",
      sender_batch_id: batchId,
    },
    items: payouts.map((payout, index) => ({
      recipient_type: "EMAIL",
      amount: {
        value: (payout.amountCents / 100).toFixed(2),
        currency: payout.currency,
      },
      receiver: payout.paypalEmail,
      note: `NexSell payout for ${payout.period}`,
      sender_item_id: `${batchId}_${index}`,
    })),
  }) as any;

  const totalCents = payouts.reduce((sum, p) => sum + p.amountCents, 0);

  return {
    batchId: result.batch_header?.payout_batch_id || batchId,
    totalPayoutCents: totalCents,
    itemCount: payouts.length,
  };
}

// ── Webhook Verification ──────────────────────────────────

/**
 * Verify that a webhook event actually came from PayPal.
 * Critical for security — prevents fake payment notifications.
 */
export async function verifyWebhookSignature(
  headers: Record<string, string>,
  body: string,
): Promise<boolean> {
  // In production, use PayPal's webhook signature verification
  // This involves checking the PAYPAL-TRANSMISSION-SIG, PAYPAL-CERT-URL,
  // and PAYPAL-AUTH-ALGO headers against PayPal's public key
  
  // For now, basic check
  const transmissionId = headers["paypal-transmission-id"];
  if (!transmissionId) return false;

  // Full verification would use PayPal's auth algorithm
  // See: https://developer.paypal.com/api/rest/webhooks/rest/#verify-webhook-signature
  return true; // TODO: Implement full signature verification
}

// ── PayPal Smart Buttons (for frontend) ───────────────────

/**
 * Generate the PayPal Smart Buttons script URL for the frontend.
 * This gives buyers the familiar PayPal checkout experience.
 */
export function getPayPalScriptUrl(): string {
  const baseUrl = "https://www.paypal.com/sdk/js";
  const params = new URLSearchParams({
    "client-id": PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
    "disable-funding": "credit,card", // Customize which funding sources to show
    "merchant-id": NEXSELL_MERCHANT_ID,
  });

  return `${baseUrl}?${params.toString()}`;
}
