import { supabase } from './supabase';
import { clearDraft } from './draftStorage';

export type LandlordResponseType = 'report' | 'review' | 'property';

export interface PendingLandlordResponse {
  responseType: LandlordResponseType;
  targetId: string;
  propertyId: string;
  landlordId?: string;
  landlordEmail: string;
  body: string;
}

const PENDING_RESPONSE_KEY = 'pending_landlord_response';

export function getLandlordResponseDraftKey(payload: Pick<PendingLandlordResponse, 'responseType' | 'targetId' | 'propertyId'>) {
  return `landlord-response:${payload.responseType}:${payload.propertyId}:${payload.targetId}`;
}

export function clearLandlordResponseDraft(payload: Pick<PendingLandlordResponse, 'responseType' | 'targetId' | 'propertyId'>) {
  clearDraft(getLandlordResponseDraftKey(payload));
}

function getCheckoutReturnUrl(
  payload: PendingLandlordResponse,
  status: 'success' | 'cancelled',
) {
  const params = new URLSearchParams();
  params.set('payment', status);
  params.set('type', payload.responseType);
  params.set('target', payload.targetId);

  if (status === 'success') {
    params.set('session_id', '{CHECKOUT_SESSION_ID}');
  }

  if (payload.responseType === 'property') {
    params.set('compose', 'landlord-note');
  }

  if (payload.responseType === 'review') {
    params.set('tab', 'rental');
  }

  return `${window.location.origin}/#/property/${payload.propertyId}?${params.toString()}`;
}

function getSupabaseFunctionUrl() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error('Missing VITE_SUPABASE_URL environment variable');
  }

  return {
    url: `${supabaseUrl}/functions/v1/landlord-response`,
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

async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.access_token) {
    return session.access_token;
  }

  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.access_token) {
    throw new Error('Sign in as a landlord before submitting a response.');
  }

  return data.session.access_token;
}

async function readFunctionError(response: Response) {
  const body = await response.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return 'Unable to contact SafeSpace checkout.';
  }

  const message =
    ('error' in body && typeof body.error === 'string' && body.error) ||
    ('message' in body && typeof body.message === 'string' && body.message) ||
    ('msg' in body && typeof body.msg === 'string' && body.msg);

  return message || 'Unable to contact SafeSpace checkout.';
}

async function callLandlordResponseFunction(payload: unknown, accessToken: string) {
  const { url } = getSupabaseFunctionUrl();

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function startLandlordResponseCheckout(payload: PendingLandlordResponse) {
  sessionStorage.setItem(PENDING_RESPONSE_KEY, JSON.stringify(payload));

  const requestBody = {
    action: 'create-checkout',
    responseType: payload.responseType,
    targetId: payload.targetId,
    propertyId: payload.propertyId,
    landlordId: payload.landlordId || null,
    landlordEmail: payload.landlordEmail,
    successUrl: getCheckoutReturnUrl(payload, 'success'),
    cancelUrl: getCheckoutReturnUrl(payload, 'cancelled'),
  };

  let accessToken = await getAccessToken();
  let response = await callLandlordResponseFunction(requestBody, accessToken);

  if (response.status === 401) {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session?.access_token) {
      throw new Error('Sign in again before starting checkout.');
    }

    accessToken = data.session.access_token;
    response = await callLandlordResponseFunction(requestBody, accessToken);
  }

  if (!response.ok) {
    throw new Error(await readFunctionError(response));
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

  const requestBody = {
    action: 'finalize',
    sessionId,
    responseType: pending.responseType,
    targetId: pending.targetId,
    propertyId: pending.propertyId,
    landlordId: pending.landlordId || null,
    landlordEmail: pending.landlordEmail,
    body: pending.body,
  };

  let accessToken = await getAccessToken();
  let response = await callLandlordResponseFunction(requestBody, accessToken);

  if (response.status === 401) {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session?.access_token) {
      throw new Error('Sign in again to finish publishing this landlord response.');
    }

    accessToken = data.session.access_token;
    response = await callLandlordResponseFunction(requestBody, accessToken);
  }

  if (!response.ok) {
    throw new Error(await readFunctionError(response));
  }

  clearPendingLandlordResponse();
  return response.json();
}
