import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../components/common';
import { getSupportedCities } from '../data/cityRegistry';
import { validateAddress } from '../lib/usps';
import { WaitlistForm } from '../components/features/Waitlist/WaitlistForm';

export function HomePage() {
  const navigate = useNavigate();
  const cities = getSupportedCities();

  const [address, setAddress] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [unsupportedCity, setUnsupportedCity] = useState<{ city: string; state: string; zip: string } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setSearching(true);
    setSearchError('');
    setUnsupportedCity(null);

    try {
      const result = await validateAddress(address.trim());
      if (!result.valid) {
        setSearchError('Address not found. Please enter a valid street address.');
        return;
      }
      if (result.citySlug) {
        navigate(`/city/${result.citySlug}`);
      } else {
        setUnsupportedCity({
          city: result.address.city,
          state: result.address.state,
          zip: result.address.zipCode,
        });
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Unable to validate address.');
    } finally {
      setSearching(false);
    }
  };

  const features = [
    { title: 'Emergency Health Guide', description: 'Get immediate guidance for health emergencies with legally mandated response deadlines.', link: '/emergency-guide', icon: '\u{1F6A8}', urgent: true },
    { title: 'Property Lookup', description: 'Research property health history and read community experiences.', link: '/property-lookup', icon: '\u{1F50D}' },
    { title: 'Report Health Issues', description: 'Submit health violations with photo evidence and anonymous options.', link: '/report', icon: '\u{1F4CB}' },
    { title: 'Track Landlord Response', description: 'Monitor compliance with legal deadlines and document responses.', link: '/tracker', icon: '\u{23F1}\uFE0F' },
    { title: 'Know Your Rights', description: 'Learn about tenant health and safety protections in your city.', link: '/know-your-rights', icon: '⚖️' },
    { title: 'Legal Notice Generator', description: 'Generate professional legal notices citing your local tenant protection laws.', link: '/legal-notice', icon: '📄' },
    { title: 'Rate Your Rental Experience', description: 'Rate your landlord across 7 categories and help future tenants.', link: '/review', icon: '⭐' },
  ];

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="text-center pt-4">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Know your rights. Report violations.
          <span className="text-sage-600"> Hold landlords accountable.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-text-muted leading-relaxed">
          SafeSpace helps renters in {cities.length} cities understand their rights, document violations, and take action.
        </p>
      </section>

      {/* Address Search */}
      <section className="mx-auto max-w-xl">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Enter your address to get started"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setSearchError(''); setUnsupportedCity(null); }}
                aria-label="Street address"
              />
            </div>
            <Button type="submit" disabled={!address.trim() || searching}>
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          {searchError && (
            <p className="text-sm text-danger">{searchError}</p>
          )}
        </form>
        {unsupportedCity && (
          <div className="mt-4">
            <WaitlistForm city={unsupportedCity.city} state={unsupportedCity.state} zip={unsupportedCity.zip} />
          </div>
        )}
      </section>

      {/* City Cards Grid */}
      <section>
        <h2 className="text-2xl font-bold text-ink text-center mb-6">Supported Cities</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Link key={city.slug} to={`/city/${city.slug}`}>
              <Card hover className="h-full">
                <h3 className="text-lg font-semibold text-ink">{city.name}, {city.stateCode}</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {city.renterPercent}% renters · {city.population.toLocaleString()} pop.
                </p>
                <p className="mt-2 text-sm text-sage-700">
                  {city.keyLaws[0]?.name}
                </p>
                <p className="mt-2 text-xs font-medium text-sage-600">Explore →</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 className="text-2xl font-bold text-ink text-center mb-6">What SafeSpace Does</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.link} to={feature.link}>
              <Card hover className="h-full">
                <div className="mb-3 text-2xl">{feature.icon}</div>
                <h3 className={`text-lg font-semibold ${feature.urgent ? 'text-danger' : 'text-ink'}`}>
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{feature.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="rounded-lg bg-sage-700 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Facing a Health Emergency?</h2>
        <p className="mt-2 text-sage-100">
          Some issues require landlord response within 24 hours by law.
        </p>
        <Link to="/emergency-guide">
          <Button variant="secondary" size="lg" className="mt-5 border-white/30 bg-white/10 text-white hover:bg-white/20">
            Get Emergency Guidance Now
          </Button>
        </Link>
      </section>
    </div>
  );
}
