import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STRIPE_API_BASE = "https://api.stripe.com/v1";
const DEFAULT_PRICE_ID = "price_1TGvYr3mPzsVWwtASfSMXL5K";

type ResponseType = "report" | "review";

interface CreateCheckoutPayload {
  action: "create-checkout";
  responseType: ResponseType;
  targetId: string;
  propertyId: string;
  landlordId?: string | null;
  landlordEmail: string;
  successUrl: string;
  cancelUrl: string;
}

interface FinalizePayload {
  action: "finalize";
  sessionId: string;
  responseType: ResponseType;
  targetId: string;
  propertyId: string;
  landlordId?: string | null;
  landlordEmail: string;
  body: string;
}

function getStripeSecretKey() {
  const secret = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secret) throw new Error("STRIPE_SECRET_KEY is not configured");
  return secret;
}

function getPriceId() {
  return Deno.env.get("STRIPE_LANDLORD_RESPONSE_PRICE_ID") || DEFAULT_PRICE_ID;
}

function getSupabaseAdmin() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function stripeRequest(path: string, method = "POST", params?: URLSearchParams) {
  const secret = getStripeSecretKey();
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: params ? params.toString() : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || `Stripe request failed (${response.status})`);
  }

  return data;
}

async function createCheckoutSession(payload: CreateCheckoutPayload) {
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", payload.successUrl);
  params.set("cancel_url", payload.cancelUrl);
  params.set("customer_email", payload.landlordEmail);
  params.set("line_items[0][price]", getPriceId());
  params.set("line_items[0][quantity]", "1");
  params.set("metadata[response_type]", payload.responseType);
  params.set("metadata[target_id]", payload.targetId);
  params.set("metadata[property_id]", payload.propertyId);
  if (payload.landlordId) {
    params.set("metadata[landlord_id]", payload.landlordId);
  }

  return stripeRequest("/checkout/sessions", "POST", params);
}

async function retrieveCheckoutSession(sessionId: string) {
  return stripeRequest(`/checkout/sessions/${sessionId}`, "GET");
}

function normalizeEmail(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

async function finalizePaidResponse(payload: FinalizePayload) {
  const session = await retrieveCheckoutSession(payload.sessionId);
  if (session.payment_status !== "paid") {
    throw new Error("Stripe session has not been paid");
  }

  const metadata = session.metadata || {};
  if (metadata.response_type !== payload.responseType) {
    throw new Error("Stripe session response type did not match the pending response");
  }
  if (metadata.target_id !== payload.targetId || metadata.property_id !== payload.propertyId) {
    throw new Error("Stripe session metadata did not match the pending response");
  }
  if (payload.responseType === "review" && payload.landlordId && metadata.landlord_id !== payload.landlordId) {
    throw new Error("Stripe session landlord ID did not match the pending response");
  }

  const sessionEmail = normalizeEmail(session.customer_details?.email || session.customer_email);
  const expectedEmail = normalizeEmail(payload.landlordEmail);
  if (sessionEmail && expectedEmail && sessionEmail !== expectedEmail) {
    throw new Error("Stripe session email did not match the landlord response email");
  }

  const admin = getSupabaseAdmin();
  const stripePaymentId = session.id as string;

  if (payload.responseType === "report") {
    const { data, error } = await admin
      .from("rebuttals")
      .upsert(
        {
          report_id: payload.targetId,
          property_id: payload.propertyId,
          landlord_email: expectedEmail || payload.landlordEmail,
          body: payload.body.trim(),
          stripe_payment_id: stripePaymentId,
        },
        { onConflict: "report_id" },
      )
      .select("id")
      .single();

    if (error) throw error;
    return { id: data.id, table: "rebuttals" };
  }

  if (!payload.landlordId) {
    throw new Error("Landlord ID is required for review responses");
  }

  const { data, error } = await admin
    .from("review_responses")
    .upsert(
      {
        review_id: payload.targetId,
        property_id: payload.propertyId,
        landlord_id: payload.landlordId,
        landlord_email: expectedEmail || payload.landlordEmail,
        body: payload.body.trim(),
        stripe_payment_id: stripePaymentId,
      },
      { onConflict: "review_id" },
    )
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id, table: "review_responses" };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const payload = await request.json();

    if (payload.action === "create-checkout") {
      const session = await createCheckoutSession(payload as CreateCheckoutPayload);
      return new Response(
        JSON.stringify({
          checkoutUrl: session.url,
          sessionId: session.id,
        }),
        {
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (payload.action === "finalize") {
      const record = await finalizePaidResponse(payload as FinalizePayload);
      return new Response(JSON.stringify({ success: true, record }), {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 400,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
