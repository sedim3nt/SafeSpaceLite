import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const USPS_TOKEN_URL = "https://apis.usps.com/oauth2/v3/token";
const USPS_ADDRESS_URL = "https://apis.usps.com/addresses/v3/address";
const GOOGLE_ADDRESS_URL = "https://addressvalidation.googleapis.com/v1:validateAddress";

let cachedToken: { token: string; expiresAt: number } | null = null;

function getAddressValidationProvider(): "usps" | "google" {
  const configured = (Deno.env.get("ADDRESS_VALIDATION_PROVIDER") || "usps").toLowerCase();
  return configured === "google" ? "google" : "usps";
}

function normalizeAddress(input: {
  streetAddress: string;
  secondaryAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}) {
  const line1 = input.streetAddress.trim();
  const line2 = input.secondaryAddress?.trim() || "";
  const locality = input.city?.trim() || "";
  const administrativeArea = input.state?.trim().toUpperCase() || "";
  const postalCode = input.zipCode?.trim() || "";
  return {
    line1,
    line2,
    locality,
    administrativeArea,
    postalCode,
  };
}

async function hashNormalizedAddress(normalized: string): Promise<string> {
  const hashInput = normalized.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, " ");
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(hashInput));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function buildNormalizedAddress(parts: {
  streetAddress: string;
  secondaryAddress?: string;
  city: string;
  state: string;
  zipCode: string;
}) {
  return `${parts.streetAddress}${parts.secondaryAddress ? " " + parts.secondaryAddress : ""}, ${parts.city}, ${parts.state} ${parts.zipCode}`;
}

async function validateWithGoogle(input: {
  streetAddress: string;
  secondaryAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}) {
  const apiKey = Deno.env.get("GOOGLE_ADDRESS_VALIDATION_API_KEY") || Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!apiKey) {
    throw new Error("Google Address Validation API key not configured");
  }

  const normalizedInput = normalizeAddress(input);
  const addressLines = [normalizedInput.line1];
  if (normalizedInput.line2) addressLines.push(normalizedInput.line2);
  const trailingLine = [normalizedInput.locality, normalizedInput.administrativeArea, normalizedInput.postalCode]
    .filter(Boolean)
    .join(", ");
  if (trailingLine) addressLines.push(trailingLine);

  const resp = await fetch(`${GOOGLE_ADDRESS_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address: {
        regionCode: "US",
        locality: normalizedInput.locality || undefined,
        administrativeArea: normalizedInput.administrativeArea || undefined,
        postalCode: normalizedInput.postalCode || undefined,
        addressLines,
      },
      enableUspsCass: true,
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text();
    throw new Error(`Google validation failed (${resp.status}): ${detail}`);
  }

  const data = await resp.json();
  const result = data.result;
  const address = result?.address;
  const postalAddress = address?.postalAddress;
  if (!postalAddress?.addressLines?.length) {
    return { valid: false, error: "Address not found" };
  }

  const city = postalAddress.locality || normalizedInput.locality;
  const state = postalAddress.administrativeArea || normalizedInput.administrativeArea;
  const zipCode = postalAddress.postalCode || normalizedInput.postalCode;
  const streetAddress = postalAddress.addressLines[0] || normalizedInput.line1;
  const secondaryAddress = postalAddress.addressLines.slice(1).join(" ").trim();
  const normalized = buildNormalizedAddress({ streetAddress, secondaryAddress, city, state, zipCode });
  const addressHash = await hashNormalizedAddress(normalized);
  const supportedCity = findSupportedCity(zipCode, city, state);

  return {
    valid: true,
    provider: "google",
    isBoulder: supportedCity === "boulder",
    supportedCity,
    citySlug: supportedCity,
    address: {
      streetAddress,
      secondaryAddress,
      city,
      state,
      zipCode,
      zipPlus4: "",
    },
    normalized,
    addressHash,
    corrections: [],
    additionalInfo: {
      business: result?.metadata?.business ? "Y" : "N",
      residential: result?.metadata?.residential,
      possibleNextAction: result?.verdict?.possibleNextAction,
    },
  };
}

async function validateWithUSPS(input: {
  streetAddress: string;
  secondaryAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}) {
  const token = await getUSPSToken();

  const params = new URLSearchParams();
  params.set("streetAddress", input.streetAddress);
  if (input.secondaryAddress) params.set("secondaryAddress", input.secondaryAddress);
  if (input.city) params.set("city", input.city);
  if (input.state) params.set("state", input.state);
  if (input.zipCode) params.set("ZIPCode", input.zipCode);

  const uspsResp = await fetch(`${USPS_ADDRESS_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!uspsResp.ok) {
    const errText = await uspsResp.text();
    return {
      error: "USPS validation failed",
      detail: errText,
      status: 422,
    };
  }

  const uspsData = await uspsResp.json();
  const addr = uspsData.address;

  if (!addr) {
    return { valid: false, error: "Address not found" };
  }

  const supportedCity = findSupportedCity(addr.ZIPCode, addr.city, addr.state);
  const normalized = buildNormalizedAddress({
    streetAddress: addr.streetAddress,
    secondaryAddress: addr.secondaryAddress || "",
    city: addr.city,
    state: addr.state,
    zipCode: addr.ZIPCode,
  });
  const addressHash = await hashNormalizedAddress(normalized);

  return {
    valid: true,
    provider: "usps",
    isBoulder: supportedCity === "boulder",
    supportedCity,
    citySlug: supportedCity,
    address: {
      streetAddress: addr.streetAddress,
      secondaryAddress: addr.secondaryAddress || "",
      city: addr.city,
      state: addr.state,
      zipCode: addr.ZIPCode,
      zipPlus4: addr.ZIPPlus4 || "",
    },
    normalized,
    addressHash,
    corrections: uspsData.corrections || [],
    additionalInfo: {
      deliveryPoint: uspsData.additionalInfo?.deliveryPoint,
      vacant: uspsData.additionalInfo?.vacant,
      business: uspsData.additionalInfo?.business,
    },
  };
}

async function getUSPSToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const clientId = Deno.env.get("USPS_CONSUMER_KEY");
  const clientSecret = Deno.env.get("USPS_CONSUMER_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("USPS credentials not configured");
  }

  const resp = await fetch(USPS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!resp.ok) {
    throw new Error(`USPS OAuth failed: ${resp.status}`);
  }

  const data = await resp.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + 7 * 60 * 60 * 1000,
  };

  return cachedToken.token;
}

// ── Supported cities: zip code → city slug ──
const SUPPORTED_CITIES: Record<string, string> = {};

function addZipRange(start: number, end: number, slug: string) {
  for (let z = start; z <= end; z++) {
    SUPPORTED_CITIES[String(z).padStart(5, "0")] = slug;
  }
}

// Boulder, CO
for (const z of ["80301","80302","80303","80304","80305","80306","80307","80308","80309","80310","80314","80321","80322","80323","80328","80329","80455","80466","80471","80481","80501","80503","80504","80510","80513","80516","80520","80540","80544"]) {
  SUPPORTED_CITIES[z] = "boulder";
}
// Fort Collins, CO
addZipRange(80521, 80528, "fort-collins");
SUPPORTED_CITIES["80553"] = "fort-collins";
// Ann Arbor, MI
addZipRange(48103, 48109, "ann-arbor");
SUPPORTED_CITIES["48113"] = "ann-arbor";
// Eugene, OR
addZipRange(97401, 97408, "eugene");
SUPPORTED_CITIES["97440"] = "eugene";
// Santa Cruz, CA
addZipRange(95060, 95067, "santa-cruz");
// Somerville, MA
addZipRange(2143, 2145, "somerville");
// Olympia, WA
addZipRange(98501, 98509, "olympia");
SUPPORTED_CITIES["98516"] = "olympia";
// Portland, ME
addZipRange(4101, 4104, "portland-me");
SUPPORTED_CITIES["04108"] = "portland-me";
SUPPORTED_CITIES["04109"] = "portland-me";
SUPPORTED_CITIES["04112"] = "portland-me";
// Asheville, NC
addZipRange(28801, 28806, "asheville");
SUPPORTED_CITIES["28810"] = "asheville";
addZipRange(28813, 28816, "asheville");
// Burlington, VT
addZipRange(5401, 5408, "burlington");
// Ithaca, NY
addZipRange(14850, 14853, "ithaca");
SUPPORTED_CITIES["14882"] = "ithaca";

function findSupportedCity(zip: string, cityName: string, state: string): string | null {
  const byZip = SUPPORTED_CITIES[zip];
  if (byZip) return byZip;

  // Fallback: city name + state match
  const cityLower = (cityName || "").toLowerCase().trim();
  const stateUpper = (state || "").toUpperCase().trim();
  const cityMap: Record<string, { name: string; state: string }> = {
    "boulder": { name: "boulder", state: "CO" },
    "fort-collins": { name: "fort collins", state: "CO" },
    "ann-arbor": { name: "ann arbor", state: "MI" },
    "eugene": { name: "eugene", state: "OR" },
    "santa-cruz": { name: "santa cruz", state: "CA" },
    "somerville": { name: "somerville", state: "MA" },
    "olympia": { name: "olympia", state: "WA" },
    "portland-me": { name: "portland", state: "ME" },
    "asheville": { name: "asheville", state: "NC" },
    "burlington": { name: "burlington", state: "VT" },
    "ithaca": { name: "ithaca", state: "NY" },
  };
  for (const [slug, info] of Object.entries(cityMap)) {
    if (cityLower === info.name && stateUpper === info.state) return slug;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { streetAddress, secondaryAddress, city, state, zipCode } = await req.json();

    if (!streetAddress) {
      return new Response(
        JSON.stringify({ error: "streetAddress is required" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const input = { streetAddress, secondaryAddress, city, state, zipCode };
    const provider = getAddressValidationProvider();
    const result = provider === "google"
      ? await validateWithGoogle(input)
      : await validateWithUSPS(input);

    if ("status" in result) {
      return new Response(
        JSON.stringify({ error: result.error, detail: result.detail }),
        { status: result.status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error", detail: String(err) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
