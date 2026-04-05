"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { Input, Button } from '../common';

// Extend Window type for Google Maps
declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          AutocompleteService: new () => {
            getPlacePredictions: (
              request: { input: string; componentRestrictions: { country: string }; types: string[] },
              callback: (predictions: GooglePrediction[] | null, status: string) => void
            ) => void;
          };
          PlacesService: new (el: HTMLDivElement) => {
            getDetails: (
              request: { placeId: string; fields: string[] },
              callback: (result: GooglePlaceDetail | null, status: string) => void
            ) => void;
          };
          PlacesServiceStatus: { OK: string };
        };
      };
    };
    initGoogleMaps?: () => void;
  }
}

interface GooglePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlaceDetail {
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address: string;
}

interface GoogleAutocompleteService {
  getPlacePredictions: (
    request: { input: string; componentRestrictions: { country: string }; types: string[] },
    callback: (predictions: GooglePrediction[] | null, status: string) => void
  ) => void;
}

interface GooglePlacesService {
  getDetails: (
    request: { placeId: string; fields: string[] },
    callback: (result: GooglePlaceDetail | null, status: string) => void
  ) => void;
}

interface AddressAutocompleteProps {
  onSelect: (address: string) => void;
  onSubmit: (address: string) => void;
  onChangeQuery?: (address: string) => void;
  searching?: boolean;
  error?: string;
  submitLabel?: string;
  searchingLabel?: string;
  placeholder?: string;
  initialValue?: string;
}

const GOOGLE_PLACES_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

let googleMapsLoaded = false;
let googleMapsLoading = false;
const loadCallbacks: Array<() => void> = [];

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (googleMapsLoaded) { resolve(); return; }
    loadCallbacks.push(resolve);
    if (googleMapsLoading) return;
    googleMapsLoading = true;

    window.initGoogleMaps = () => {
      googleMapsLoaded = true;
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_KEY}&libraries=places&callback=initGoogleMaps&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      googleMapsLoading = false;
      reject(new Error('Google Maps failed to load'));
    };
    document.head.appendChild(script);
  });
}

export function AddressAutocomplete({
  onSelect,
  onSubmit,
  onChangeQuery,
  searching,
  error,
  submitLabel = 'Check Rights',
  searchingLabel = 'Searching...',
  placeholder = 'Start typing your address...',
  initialValue = '',
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [predictions, setPredictions] = useState<GooglePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [mapsReady, setMapsReady] = useState(googleMapsLoaded);
  const [autocompleteMessage, setAutocompleteMessage] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dummyRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<GoogleAutocompleteService | null>(null);
  const placesService = useRef<GooglePlacesService | null>(null);

  // Load Google Maps SDK once
  useEffect(() => {
    if (!GOOGLE_PLACES_KEY) {
      setAutocompleteMessage(`Live address suggestions are unavailable right now. You can still type your full address and press ${submitLabel}.`);
      return;
    }
    loadGoogleMaps().then(() => {
      setMapsReady(true);
      if (window.google?.maps?.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        if (dummyRef.current) {
          placesService.current = new window.google.maps.places.PlacesService(dummyRef.current);
        }
      }
    }).catch(() => {
      setAutocompleteMessage(`Live address suggestions are unavailable right now. You can still type your full address and press ${submitLabel}.`);
    });
  }, [submitLabel]);

  useEffect(() => {
    setQuery(initialValue);
    setSelectedAddress(initialValue);
  }, [initialValue]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchPlaces = useCallback((q: string) => {
    if (q.length < 3 || !autocompleteService.current) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    autocompleteService.current.getPlacePredictions(
      { input: q, componentRestrictions: { country: 'us' }, types: ['address'] },
      (preds, status) => {
        if (status === window.google?.maps.places.PlacesServiceStatus.OK && preds) {
          setAutocompleteMessage('');
          setPredictions(preds.slice(0, 6));
          setShowDropdown(true);
        } else {
          setPredictions([]);
          setShowDropdown(false);
          if (q.length >= 5) {
            setAutocompleteMessage('Address suggestions are temporarily unavailable. Enter the full address and SafeSpace will still validate it when you submit.');
          }
        }
      }
    );
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    setSelectedAddress('');
    onChangeQuery?.(value);
    if (!value.trim()) {
      setAutocompleteMessage('');
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlaces(value), 200);
  };

  const handleSelect = (prediction: GooglePrediction) => {
    const addr = prediction.description;
    setQuery(addr);
    setSelectedAddress(addr);
    setShowDropdown(false);
    onChangeQuery?.(addr);
    onSelect(addr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const addr = selectedAddress || query;
    if (addr.trim()) onSubmit(addr.trim());
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Hidden div required by PlacesService */}
      <div ref={dummyRef} style={{ display: 'none' }} />

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1 relative">
            <Input
              placeholder={placeholder}
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              onFocus={() => predictions.length > 0 && setShowDropdown(true)}
              aria-label="Street address"
              autoComplete="off"
            />

            {showDropdown && predictions.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-72 overflow-y-auto">
                {predictions.map((p) => (
                  <li key={p.place_id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(p)}
                      className="w-full text-left px-4 py-3 hover:bg-sage-50 transition-colors border-b border-border/50 last:border-0"
                    >
                      <span className="block text-sm font-medium text-ink">
                        {p.structured_formatting.main_text}
                      </span>
                      <span className="block text-xs text-text-muted">
                        {p.structured_formatting.secondary_text}
                      </span>
                    </button>
                  </li>
                ))}
                {/* Required Google attribution */}
                <li className="px-4 py-2 text-right">
                  <img
                    src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png"
                    alt="Powered by Google"
                    className="inline-block h-4"
                  />
                </li>
              </ul>
            )}
          </div>
          <Button type="submit" disabled={!query.trim() || searching}>
            {searching ? searchingLabel : submitLabel}
          </Button>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        {autocompleteMessage && (
          <p className="text-xs text-text-muted">{autocompleteMessage}</p>
        )}
        {!mapsReady && GOOGLE_PLACES_KEY && !autocompleteMessage && (
          <p className="text-xs text-text-muted">Loading live address suggestions...</p>
        )}
      </form>
    </div>
  );
}
