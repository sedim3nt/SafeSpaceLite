import { supabase } from './supabase';

export interface USPSValidationResult {
  valid: boolean;
  isBoulder: boolean;
  address: {
    streetAddress: string;
    secondaryAddress: string;
    city: string;
    state: string;
    zipCode: string;
    zipPlus4: string;
  };
  normalized: string;
  addressHash: string;
  corrections: Array<{ code: string; text: string }>;
  additionalInfo: {
    deliveryPoint: string;
    vacant: string;
    business: string;
  };
  error?: string;
}

/**
 * Validate a street address via the USPS Addresses API (proxied through Supabase Edge Function).
 * Returns normalized address, hash for dedup, and Boulder County verification.
 */
export async function validateAddress(
  streetAddress: string,
  secondaryAddress?: string,
  city?: string,
  state?: string,
  zipCode?: string
): Promise<USPSValidationResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const resp = await fetch(`${supabaseUrl}/functions/v1/validate-address`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      streetAddress,
      secondaryAddress: secondaryAddress || '',
      city: city || 'Boulder',
      state: state || 'CO',
      zipCode: zipCode || '',
    }),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `USPS validation failed (${resp.status})`);
  }

  return resp.json();
}

/**
 * Ensure a property record exists in Supabase for this validated address.
 * Creates one if not found. Returns the property row.
 */
export async function ensureProperty(result: USPSValidationResult) {
  // Try to find existing
  const { data: existing } = await supabase
    .from('properties')
    .select('*')
    .eq('address_hash', result.addressHash)
    .single();

  if (existing) return existing;

  // Create new property
  const { data: created, error } = await supabase
    .from('properties')
    .insert({
      address_raw: result.address.streetAddress,
      address_normalized: result.normalized,
      address_hash: result.addressHash,
      city: result.address.city,
      state: result.address.state,
      zip: result.address.zipCode,
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}
