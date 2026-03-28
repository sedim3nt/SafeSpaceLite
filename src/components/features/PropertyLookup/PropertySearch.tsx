import { useState, type FormEvent } from 'react';
import { Button, Input } from '../../common';

interface PropertySearchProps {
  onSearch: (address: string) => void;
  loading?: boolean;
}

const BOULDER_ZIPS = [
  '80301', '80302', '80303', '80304', '80305', '80306', '80307', '80308', '80309', '80310',
  '80314', '80321', '80322', '80323', '80328', '80329',
];

function isBoulderAddress(address: string): boolean {
  const lower = address.toLowerCase();
  if (lower.includes('boulder')) return true;
  if (/\bco\b/.test(lower)) return true;
  return BOULDER_ZIPS.some((zip) => address.includes(zip));
}

export function PropertySearch({ onSearch, loading }: PropertySearchProps) {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) return;

    if (!isBoulderAddress(trimmed)) {
      setError('Please enter a Boulder, CO address (include city, state, or zip code).');
      return;
    }

    setError('');
    onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Enter a Boulder County address..."
            value={address}
            onChange={(e) => { setAddress(e.target.value); setError(''); }}
            aria-label="Property address"
          />
        </div>
        <Button type="submit" disabled={!address.trim() || loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <p className="text-sm text-text-muted">
        Search any Boulder County rental address to view reports, comments, and landlord responses.
      </p>
    </form>
  );
}
