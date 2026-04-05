export type LandlordResponseType = 'report' | 'review';

export interface PendingLandlordResponse {
  responseType: LandlordResponseType;
  targetId: string;
  propertyId: string;
  landlordId?: string;
  landlordEmail: string;
  body: string;
}

const PENDING_RESPONSE_KEY = 'pending_landlord_response';

function getSupabaseFunctionUrl() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
  }

  return {
    url: `${supabaseUrl}/functions/v1/landlord-response`,
    anonKey: supabaseAnonKey,
  };
}

export function getPendingLandlordResponse(): PendingLandlordResponse | null {
  const raw = sessionStorage.getItem(PENDING_RESPONSE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingLandlordResponse;
  } catch {
    sessionStorage.removeItem(PENDING_RESPONSE_KEY);
    return null;
  }
}

export function clearPendingLandlordResponse() {
  sessionStorage.removeItem(PENDING_RESPONSE_KEY);
}

export async function startLandlordResponseCheckout(payload: PendingLandlordResponse) {
  const { url, anonKey } = getSupabaseFunctionUrl();

  sessionStorage.setItem(PENDING_RESPONSE_KEY, JSON.stringify(payload));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      action: 'create-checkout',
      responseType: payload.responseType,
      targetId: payload.targetId,
      propertyId: payload.propertyId,
      landlordId: payload.landlordId || null,
      landlordEmail: payload.landlordEmail,
      successUrl: `${window.location.origin}/#/property/${payload.propertyId}?payment=success&type=${payload.responseType}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/#/property/${payload.propertyId}?payment=cancelled&type=${payload.responseType}`,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Unable to start checkout.');
  }

  const data = await response.json();
  if (!data.checkoutUrl) {
    throw new Error('Stripe checkout URL was not returned.');
  }

  window.location.assign(data.checkoutUrl);
}

export async function finalizePendingLandlordResponse(sessionId: string) {
  const pending = getPendingLandlordResponse();
  if (!pending) {
    throw new Error('No pending landlord response was found for this browser session.');
  }

  const { url, anonKey } = getSupabaseFunctionUrl();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      action: 'finalize',
      sessionId,
      responseType: pending.responseType,
      targetId: pending.targetId,
      propertyId: pending.propertyId,
      landlordId: pending.landlordId || null,
      landlordEmail: pending.landlordEmail,
      body: pending.body,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Unable to verify payment and save the landlord response.');
  }

  clearPendingLandlordResponse();
  return response.json();
}
