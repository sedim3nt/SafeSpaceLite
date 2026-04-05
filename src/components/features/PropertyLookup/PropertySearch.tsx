import { useState, type FormEvent } from 'react';
import { Button, Input } from '../../common';
import { validateAddress, type AddressValidationResult } from '../../../lib/addressValidation';
import { WaitlistForm } from '../Waitlist/WaitlistForm';

interface PropertySearchProps {
  onSearch: (result: AddressValidationResult) => void;
  loading?: boolean;
}

export function PropertySearch({ onSearch, loading }: PropertySearchProps) {
  const [streetAddress, setStreetAddress] = useState('');
  const [unit, setUnit] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [unsupportedCity, setUnsupportedCity] = useState<{ city: string; state: string; zip: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = streetAddress.trim();
    if (!trimmed) return;

    setError('');
    setValidating(true);
    setUnsupportedCity(null);

    try {
      const result = await validateAddress(trimmed, unit.trim() || undefined);

      if (!result.valid) {
        setError('Address not found. Please check the street address and try again.');
        return;
      }

      if (!result.supportedCity) {
        setUnsupportedCity({
          city: result.address.city,
          state: result.address.state,
          zip: result.address.zipCode,
        });
        return;
      }

      // Show corrections as info, not errors
      if (result.corrections?.length > 0) {
        const needsUnit = result.corrections.some((c) => c.code === '32');
        if (needsUnit && !unit.trim()) {
          // Address is valid but may need a unit — still proceed but note it
        }
      }

      onSearch(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to validate address. Please try again.'
      );
    } finally {
      setValidating(false);
    }
  };

  const isLoading = loading || validating;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Street address (e.g. 1600 Pearl St)"
                value={streetAddress}
                onChange={(e) => {
                  setStreetAddress(e.target.value);
                  setError('');
                  setUnsupportedCity(null);
                }}
                aria-label="Street address"
              />
            </div>
            <div className="w-full sm:w-36">
              <Input
                placeholder="Apt / Unit"
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  setError('');
                }}
                aria-label="Apartment or unit number"
              />
            </div>
          </div>
          <div>
            <Button type="submit" disabled={!streetAddress.trim() || isLoading}>
              {isLoading ? 'Validating...' : 'Search Property'}
            </Button>
          </div>
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <p className="text-sm text-text-muted">
          Enter any street address in a supported city. We validate it to keep property records accurate and prevent duplicates.
        </p>
      </form>
      {unsupportedCity && (
        <WaitlistForm city={unsupportedCity.city} state={unsupportedCity.state} zip={unsupportedCity.zip} />
      )}
    </div>
  );
}
