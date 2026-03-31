"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { Input, Button } from '../common';

interface NominatimResult {
  place_id: number;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  lat: string;
  lon: string;
}

interface AddressAutocompleteProps {
  onSelect: (address: string) => void;
  onSubmit: (address: string) => void;
  searching?: boolean;
  error?: string;
}

export function AddressAutocomplete({ onSelect, onSubmit, searching, error }: AddressAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const searchNominatim = useCallback(async (q: string) => {
    if (q.length < 5) { setResults([]); return; }
    
    try {
      const params = new URLSearchParams({
        q: q,
        format: 'json',
        addressdetails: '1',
        countrycodes: 'us',
        limit: '6',
      });
      
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { 'User-Agent': 'SafeSpace/1.0 (safespace.spirittree.dev)' },
      });
      
      if (!resp.ok) return;
      const data: NominatimResult[] = await resp.json();
      
      // Filter to results with street addresses
      const filtered = data.filter(r => r.address?.road);
      setResults(filtered);
      setShowDropdown(filtered.length > 0);
    } catch {
      // Silent fail — user can still type and submit manually
    }
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    setSelectedAddress('');
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchNominatim(value), 300);
  };

  const handleSelect = (result: NominatimResult) => {
    const addr = result.address;
    const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
    const city = addr.city || addr.town || addr.village || '';
    const formatted = [street, city, addr.state, addr.postcode].filter(Boolean).join(', ');
    
    setQuery(formatted);
    setSelectedAddress(formatted);
    setShowDropdown(false);
    onSelect(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const addr = selectedAddress || query;
    if (addr.trim()) onSubmit(addr.trim());
  };

  return (
    <div ref={wrapperRef} className="relative">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1 relative">
            <Input
              placeholder="Start typing your address..."
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              aria-label="Street address"
              autoComplete="off"
            />
            
            {showDropdown && results.length > 0 && (
              <ul className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {results.map((r) => {
                  const addr = r.address;
                  const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
                  const city = addr.city || addr.town || addr.village || '';
                  return (
                    <li key={r.place_id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(r)}
                        className="w-full text-left px-4 py-3 hover:bg-sage-50 transition-colors border-b border-border/50 last:border-0"
                      >
                        <span className="block text-sm font-medium text-ink">{street}</span>
                        <span className="block text-xs text-text-muted">{[city, addr.state, addr.postcode].filter(Boolean).join(', ')}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <Button type="submit" disabled={!query.trim() || searching}>
            {searching ? 'Validating...' : 'Search'}
          </Button>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
    </div>
  );
}
