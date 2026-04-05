import { supabase } from './supabase';
import {
  isColoradoResearchCitySupported,
  resolveJurisdictionLayers,
  type JurisdictionResolution,
} from '../data/jurisdictions';
import { getResearchCityByName } from '../data/cityDatabase';
import type { Database, Property } from '../types/database';

export interface AddressValidationResult {
  valid: boolean;
  isBoulder: boolean;
  supportedCity: string | null;
  citySlug: string | null;
  jurisdictions: JurisdictionResolution;
  provider?: 'google' | 'usps';
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
    deliveryPoint?: string;
    vacant?: string;
    business?: string;
    residential?: boolean;
    possibleNextAction?: string;
  };
  error?: string;
}

interface ParsedSingleLineAddress {
  streetAddress: string;
  secondaryAddress?: string;
  city: string;
  state: string;
  zipCode?: string;
}

export function parseSingleLineAddress(input: string): ParsedSingleLineAddress | null {
  const trimmed = input.trim();
  if (!trimmed.includes(',')) return null;

  const match = trimmed.match(
    /^(?<street>.+?),\s*(?<city>[^,]+),\s*(?<state>[A-Za-z]{2})(?:\s+(?<zip>\d{5}(?:-\d{4})?))?\s*$/,
  );

  if (!match?.groups) return null;

  const street = match.groups.street.trim();
  const city = match.groups.city.trim();
  const state = match.groups.state.trim().toUpperCase();
  const zipCode = match.groups.zip?.trim();

  if (!street || !city || !state) return null;

  return {
    streetAddress: street,
    city,
    state,
    zipCode,
  };
}

/**
 * Validate a street address via the configured address validation provider
 * (currently USPS, with Google Address Validation support available behind the edge function).
 */
export async function validateAddress(
  streetAddress: string,
  secondaryAddress?: string,
  city?: string,
  state?: string,
  zipCode?: string
): Promise<AddressValidationResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const parsedAddress =
    !secondaryAddress && !city && !state && !zipCode
      ? parseSingleLineAddress(streetAddress)
      : null;

  const requestPayload = {
    streetAddress: parsedAddress?.streetAddress || streetAddress,
    secondaryAddress: parsedAddress?.secondaryAddress || secondaryAddress || '',
    city: parsedAddress?.city || city || '',
    state: parsedAddress?.state || state || '',
    zipCode: parsedAddress?.zipCode || zipCode || '',
  };

  const resp = await fetch(`${supabaseUrl}/functions/v1/validate-address`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(requestPayload),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `Address validation failed (${resp.status})`);
  }

  const data = await resp.json();
  const normalizedState = (data.address?.state || '').toUpperCase();
  const researchCity =
    !data.citySlug && normalizedState === 'CO'
      ? getResearchCityByName(data.address?.city || '', normalizedState)
      : null;
  const resolvedCitySlug =
    data.citySlug ??
    data.supportedCity ??
    (isColoradoResearchCitySupported(data.address?.city || '', normalizedState)
      ? researchCity?.slug || null
      : null);
  const jurisdictions = resolveJurisdictionLayers({
    city: data.address?.city || '',
    state: normalizedState,
    zip: data.address?.zipCode || '',
    citySlug: resolvedCitySlug,
  });

  return {
    ...data,
    isBoulder: resolvedCitySlug === 'boulder',
    supportedCity: resolvedCitySlug,
    citySlug: resolvedCitySlug,
    jurisdictions,
  };
}

/**
 * Ensure a property record exists in Supabase for this validated address.
 * Creates one if not found. Returns the property row.
 */
export async function ensureProperty(result: AddressValidationResult) {
  const { data: existing } = await supabase
    .from('properties')
    .select('*')
    .eq('address_hash', result.addressHash)
    .single();

  if (existing) return existing;

  const propertyInsert: Database['public']['Tables']['properties']['Insert'] = {
    address_raw: result.address.streetAddress,
    address_normalized: result.normalized,
    address_hash: result.addressHash,
    city: result.address.city,
    state: result.address.state,
    zip: result.address.zipCode,
  };

  const { data: created, error } = await supabase
    .from('properties')
    .insert(propertyInsert)
    .select()
    .single();

  if (error) throw error;
  return created as Property;
}
