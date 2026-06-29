import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, capturePayment } from "@/services/paypal";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// PayPal Webhook Handler
// This is the AUTOMATIC trigger for everything.
// When PayPal says "payment completed", we auto-fulfill.
// No human involved. Ever.
// ============================================================

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  // 1. Verify this actually came from PayPal
  const isValid = await verifyWebhookSignature(headers, body);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  const eventType = event.event_type;

  // 2. Route to the appropriate handler
  try {
    switch (eventType) {
      // ── One-Time Payments ──────────────────────────────
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePaymentCaptured(event);
        break;

      case "PAYMENT.CAPTURE.DENIED":
        await handlePaymentDenied(event);
        break;

      case "PAYMENT.SALE.REFUNDED":
      case "PAYMENT.CAPTURE.REFUNDED":
        await handlePaymentRefunded(event);
        break;

      case "PAYMENT.SALE.REVERSED":
        await handleChargeback(event);
        break;

      // ── Subscriptions ──────────────────────────────────
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleSubscriptionActivated(event);
        break;

      case "BILLING.SUBSCRIPTION.RENEWED":
        await handleSubscriptionRenewed(event);
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleSubscriptionCancelled(event);
        break;

      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await handleSubscriptionSuspended(event);
        break;

      case "BILLING.SUBSCRIPTION.FAILED":
        await handleSubscriptionFailed(event);
        break;

      // ── Payouts ────────────────────────────────────────
      case "MERCHANT.PAYOUT.COMPLETED":
        await handlePayoutCompleted(event);
        break;

      case "MERCHANT.PAYOUT.FAILED":
        await handlePayoutFailed(event);
        break;

      default:
        console.log(`Unhandled PayPal event: ${eventType}`);
    }
  } catch (error) {
    console.error(`Error handling PayPal event ${eventType}:`, error);
    // Return 200 so PayPal doesn't retry (we logged the error)
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}

// ── Payment Captured → AUTO-FULFILL ───────────────────────

async function handlePaymentCaptured(event: any) {
  const supabase = await createClient();
  const capture = event.resource;
  const orderNumber = capture.purchase_units?.[0]?.reference_id;

  if (!orderNumber) return;

  // 1. Find the NexSell order
  const { data: order } = await supabase
    .from("orders")
    .select("*, items")
    .eq("order_number", orderNumber)
    .single();

  if (!order) return;

  // 2. Update order status
  await supabase
    .from("orders")
    .update({
      status: "fulfilled",
      provisioned_at: new Date().toISOString(),
      fulfillment_data: {
        paypal_capture_id: capture.id,
        fulfilled_at: new Date().toISOString(),
        fulfillment_type: "automatic",
      },
    })
    .eq("id", order.id);

  // 3. Update payment record
  await supabase
    .from("payments")
    .update({
      status: "captured",
      provider_id: capture.id,
      completed_at: new Date().toISOString(),
    })
    .eq("order_id", order.id);

  // 4. AUTO-FULFILL based on product type
  for (const item of order.items) {
    await autoFulfill(item, order);
  }

  // 5. Update analytics (automatic)
  await supabase.from("commerce_events").insert({
    event_type: "order.fulfilled",
    entity_type: "order",
    entity_id: order.id,
    actor_id: order.buyer_id,
    payload: {
      order_number: orderNumber,
      total_cents: order.total_cents,
      fulfillment_type: "automatic",
      seconds_to_fulfill: (
        new Date().getTime() - new Date(order.created_at).getTime()
      ) / 1000,
    },
  });

  // 6. Send notification (email, webhook, in-app)
  await sendFulfillmentNotification(order);
}

// ── Auto-Fulfillment Logic ────────────────────────────────

async function autoFulfill(item: any, order: any) {
  const supabase = await createClient();

  switch (item.type) {
    case "product":
    case "license":
      // Generate license key + download link
      const licenseKey = generateLicenseKey();
      await supabase.from("order_fulfillments").insert({
        order_id: order.id,
        listing_id: item.listing_id,
        type: "license_key",
        data: {
          license_key: licenseKey,
          download_url: `https://nexsell.com/download/${item.listing_id}/${licenseKey}`,
        },
      });
      break;

    case "api":
      // Provision API key with rate limits
      const apiKey = generateApiKey();
      await supabase.from("order_fulfillments").insert({
        order_id: order.id,
        listing_id: item.listing_id,
        type: "api_key",
        data: {
          api_key: apiKey,
          rate_limit_rpm: 100,
          rate_limit_rpd: 10000,
        },
      });
      break;

    case "ai_agent":
      // Start agent session + escrow
      await supabase.from("order_fulfillments").insert({
        order_id: order.id,
        listing_id: item.listing_id,
        type: "agent_session",
        data: {
          session_id: `sess_${Date.now()}`,
          status: "active",
          escrow_cents: item.total_price_cents,
        },
      });
      break;

    case "subscription":
      // Already handled by subscription webhook
      break;

    case "data_product":
      // Generate secure download link with expiry
      const downloadToken = generateDownloadToken();
      await supabase.from("order_fulfillments").insert({
        order_id: order.id,
        listing_id: item.listing_id,
        type: "download_link",
        data: {
          download_url: `https://nexsell.com/download/${downloadToken}`,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        },
      });
      break;

    default:
      // Generic fulfillment
      await supabase.from("order_fulfillments").insert({
        order_id: order.id,
        listing_id: item.listing_id,
        type: "generic",
        data: { status: "fulfilled", fulfilled_at: new Date().toISOString() },
      });
  }
}

// ── Payment Denied → Auto-Retry ───────────────────────────

async function handlePaymentDenied(event: any) {
  const supabase = await createClient();
  const orderNumber = event.resource?.purchase_units?.[0]?.reference_id;

  if (!orderNumber) return;

  const { data: order } = await supabase
    .from("orders")
    .select("id, buyer_id")
    .eq("order_number", orderNumber)
    .single();

  if (!order) return;

  // Update payment status
  await supabase
    .from("payments")
    .update({ status: "failed" })
    .eq("order_id", order.id);

  // Queue retry (3 attempts with exponential backoff)
  await supabase.from("payment_retries").insert({
    order_id: order.id,
    attempt: 1,
    max_attempts: 3,
    next_attempt_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
  });

  // Notify buyer
  await sendPaymentFailedNotification(order);
}

// ── Refund → Auto-Revoke Access ───────────────────────────

async function handlePaymentRefunded(event: any) {
  const supabase = await createClient();
  const captureId = event.resource?.id;

  // Find the payment and order
  const { data: payment } = await supabase
    .from("payments")
    .select("*, orders(*)")
    .eq("provider_id", captureId)
    .single();

  if (!payment) return;

  // Update payment
  await supabase
    .from("payments")
    .update({
      status: "refunded_full",
      refund_cents: payment.amount_cents,
    })
    .eq("id", payment.id);

  // Update order
  await supabase
    .from("orders")
    .update({ status: "refunded" })
    .eq("id", payment.order_id);

  // AUTO-REVOKE access
  await supabase
    .from("order_fulfillments")
    .update({ revoked_at: new Date().toISOString() })
    .eq("order_id", payment.order_id);
}

// ── Subscription Events ───────────────────────────────────

async function handleSubscriptionActivated(event: any) {
  const supabase = await createClient();
  const subscriptionId = event.resource?.id;

  // Update subscription status
  await supabase
    .from("subscriptions")
    .update({
      status: "active",
      provider_subscription_id: subscriptionId,
      current_period_start: new Date().toISOString(),
    })
    .eq("provider_subscription_id", subscriptionId);

  // Auto-provision access
  // (Same logic as payment captured)
}

async function handleSubscriptionRenewed(event: any) {
  const supabase = await createClient();
  // Extend access period, update billing dates
  // Record renewal in analytics
}

async function handleSubscriptionCancelled(event: any) {
  const supabase = await createClient();
  // Mark for revocation at period end
  // Don't revoke immediately — buyer paid for this period
}

async function handleSubscriptionSuspended(event: any) {
  const supabase = await createClient();
  // Payment failed — suspend access but don't cancel
  // PayPal will retry automatically
}

async function handleSubscriptionFailed(event: any) {
  const supabase = await createClient();
  // All retries failed — cancel and notify
}

// ── Payout Events ─────────────────────────────────────────

async function handlePayoutCompleted(event: any) {
  // Seller received their money — update records
}

async function handlePayoutFailed(event: any) {
  // Payout failed — queue retry, alert operations
}

// ── Chargeback ────────────────────────────────────────────

async function handleChargeback(event: any) {
  const supabase = await createClient();
  // Dispute opened — auto-revoke access
  // Create support case
  // Alert seller
}

// ── Helpers ───────────────────────────────────────────────

function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segments = 4;
  const segmentLength = 4;
  return Array.from({ length: segments }, () =>
    Array.from({ length: segmentLength }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("")
  ).join("-");
}

function generateApiKey(): string {
  const prefix = "nexs_live";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const key = Array.from({ length: 32 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `${prefix}_${key}`;
}

function generateDownloadToken(): string {
  return Buffer.from(`${Date.now()}_${Math.random().toString(36).slice(2)}`)
    .toString("base64url");
}

async function sendFulfillmentNotification(order: any) {
  // Send email via Resend
  // Send in-app notification
  // Fire webhook events
  // All automatic
}

async function sendPaymentFailedNotification(order: any) {
  // Notify buyer that payment failed
  // Include retry link
}
