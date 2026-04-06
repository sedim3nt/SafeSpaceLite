import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.16";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRIMARY_RECIPIENT = "terraform.eye@gmail.com";
const CC_RECIPIENT = "suede0619@gmail.com";
const APP_URL = "https://safespace.spirittree.dev";

type ReportPayload = {
  type: "report";
  propertyId: string;
  propertyAddress: string;
  issueType: string;
  severity: string;
  description: string;
  evidenceTier?: string;
  isAnonymous: boolean;
};

type ReviewPayload = {
  type: "review";
  propertyId: string;
  propertyAddress: string;
  landlordName: string;
  relationshipType: string;
  comment?: string;
  tags?: string[];
  isAnonymous: boolean;
  ratings: Record<string, number>;
};

type NotificationPayload = ReportPayload | ReviewPayload;

type AuthenticatedActor = {
  id: string;
  email: string;
};

function getEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function getSupabaseAdmin() {
  return createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function getAuthenticatedActor(request: Request): Promise<AuthenticatedActor> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    throw new Error("You must be signed in to send notifications");
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);

  if (error || !data.user?.email) {
    throw new Error("SafeSpace could not verify the signed-in account");
  }

  return {
    id: data.user.id,
    email: data.user.email,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatSeverity(value: string) {
  if (value === "emergency_24h") return "24hr Emergency";
  if (value === "urgent_72h") return "72hr Urgent";
  return "Standard";
}

function formatIssueType(value: string) {
  if (value === "carbon-monoxide") return "Carbon Monoxide";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRelationshipType(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildReportMessage(payload: ReportPayload, actor: AuthenticatedActor) {
  const propertyUrl = `${APP_URL}/#/property/${payload.propertyId}`;
  const subject = `[SafeSpace] New report for ${payload.propertyAddress}`;
  const text = [
    `A new SafeSpace report was posted.`,
    ``,
    `Address: ${payload.propertyAddress}`,
    `Property page: ${propertyUrl}`,
    `Issue type: ${formatIssueType(payload.issueType)}`,
    `Severity: ${formatSeverity(payload.severity)}`,
    `Evidence tier: ${payload.evidenceTier || "narrative_only"}`,
    `Anonymous: ${payload.isAnonymous ? "Yes" : "No"}`,
    `Signed-in user: ${actor.email}`,
    ``,
    `Description:`,
    payload.description,
  ].join("\n");

  const html = `
    <p>A new SafeSpace report was posted.</p>
    <p><strong>Address:</strong> ${escapeHtml(payload.propertyAddress)}<br />
    <strong>Property page:</strong> <a href="${propertyUrl}">${propertyUrl}</a><br />
    <strong>Issue type:</strong> ${escapeHtml(formatIssueType(payload.issueType))}<br />
    <strong>Severity:</strong> ${escapeHtml(formatSeverity(payload.severity))}<br />
    <strong>Evidence tier:</strong> ${escapeHtml(payload.evidenceTier || "narrative_only")}<br />
    <strong>Anonymous:</strong> ${payload.isAnonymous ? "Yes" : "No"}<br />
    <strong>Signed-in user:</strong> ${escapeHtml(actor.email)}</p>
    <p><strong>Description:</strong><br />${escapeHtml(payload.description).replaceAll("\n", "<br />")}</p>
  `;

  return { subject, text, html };
}

function buildReviewMessage(payload: ReviewPayload, actor: AuthenticatedActor) {
  const propertyUrl = `${APP_URL}/#/property/${payload.propertyId}?tab=rental`;
  const subject = `[SafeSpace] New review for ${payload.propertyAddress}`;
  const ratingLines = Object.entries(payload.ratings)
    .map(([key, value]) => `${formatRelationshipType(key)}: ${value}/5`)
    .join("\n");
  const ratingHtml = Object.entries(payload.ratings)
    .map(([key, value]) => `<li><strong>${escapeHtml(formatRelationshipType(key))}:</strong> ${value}/5</li>`)
    .join("");

  const text = [
    `A new SafeSpace landlord review was posted.`,
    ``,
    `Address: ${payload.propertyAddress}`,
    `Property page: ${propertyUrl}`,
    `Landlord: ${payload.landlordName}`,
    `Relationship type: ${formatRelationshipType(payload.relationshipType)}`,
    `Anonymous: ${payload.isAnonymous ? "Yes" : "No"}`,
    `Signed-in user: ${actor.email}`,
    payload.tags?.length ? `Tags: ${payload.tags.join(", ")}` : "",
    ``,
    `Ratings:`,
    ratingLines,
    payload.comment ? `\nComment:\n${payload.comment}` : "",
  ].filter(Boolean).join("\n");

  const html = `
    <p>A new SafeSpace landlord review was posted.</p>
    <p><strong>Address:</strong> ${escapeHtml(payload.propertyAddress)}<br />
    <strong>Property page:</strong> <a href="${propertyUrl}">${propertyUrl}</a><br />
    <strong>Landlord:</strong> ${escapeHtml(payload.landlordName)}<br />
    <strong>Relationship type:</strong> ${escapeHtml(formatRelationshipType(payload.relationshipType))}<br />
    <strong>Anonymous:</strong> ${payload.isAnonymous ? "Yes" : "No"}<br />
    <strong>Signed-in user:</strong> ${escapeHtml(actor.email)}${payload.tags?.length ? `<br /><strong>Tags:</strong> ${escapeHtml(payload.tags.join(", "))}` : ""}</p>
    <p><strong>Ratings:</strong></p>
    <ul>${ratingHtml}</ul>
    ${payload.comment ? `<p><strong>Comment:</strong><br />${escapeHtml(payload.comment).replaceAll("\n", "<br />")}</p>` : ""}
  `;

  return { subject, text, html };
}

async function sendNotificationEmail(payload: NotificationPayload, actor: AuthenticatedActor) {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: getEnv("GMAIL_USER"),
      pass: getEnv("GMAIL_APP_PASSWORD"),
    },
  });

  const message = payload.type === "report"
    ? buildReportMessage(payload, actor)
    : buildReviewMessage(payload, actor);

  await transport.sendMail({
    from: `"SafeSpace Alerts" <${getEnv("GMAIL_USER")}>`,
    to: PRIMARY_RECIPIENT,
    cc: CC_RECIPIENT,
    replyTo: actor.email,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const actor = await getAuthenticatedActor(request);
    const payload = await request.json() as NotificationPayload;

    if (payload.type !== "report" && payload.type !== "review") {
      throw new Error("Unsupported notification payload");
    }

    await sendNotificationEmail(payload, actor);

    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("content-notify failed", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Notification failed",
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
