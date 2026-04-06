import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/common';
import { getSupportedCities, getCityBySlug } from '../data/cityRegistry';
import { getResearchCityByName, getStats } from '../data/cityDatabase';
import { validateAddress } from '../lib/addressValidation';
import { AddressAutocomplete } from '../components/features/AddressAutocomplete';

function SafetyScoreBadge({ score }: { score: number }) {
  const color = score >= 7 ? 'bg-green-100 text-green-800' : score >= 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  const label = score >= 7 ? 'Strong' : score >= 4 ? 'Moderate' : 'Weak';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-semibold ${color}`}>
      {score}/10 — {label} Protections
    </span>
  );
}

interface AddressResult {
  citySlug: string;
  cityName: string;
  state: string;
  address: string;
  protectionScore: number;
}

export function HomePage() {
  const navigate = useNavigate();
  const cities = getSupportedCities();
  const dbStats = getStats();

  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [result, setResult] = useState<AddressResult | null>(null);

  const stats = [
    { value: `${dbStats.totalCities}+`, label: 'Cities Researched' },
    { value: '54', label: 'States & Territories' },
    { value: '7', label: 'Review Categories' },
    { value: 'Free for Renters', label: '$10 for Landlords' },
  ];

  const flows = [
    {
      icon: '🏠',
      title: 'Property Lookup',
      desc: 'Enter your address to see your tenant rights, safety data, landlord reviews, and the jurisdiction layers that apply.',
      link: '/property-lookup',
      cta: 'Search Property',
    },
    {
      icon: '📋',
      title: 'Report Safety Issue',
      desc: 'Document health violations with photo evidence. Anonymous reporting available. Generate legal notices.',
      link: '/report',
      cta: 'Report Issue',
    },
    {
      icon: '⭐',
      title: 'Landlord Review',
      desc: 'Rate your landlord across 7 categories so future renters can see patterns of fairness, safety, and responsiveness.',
      link: '/review',
      cta: 'Start Review',
    },
    {
      icon: '🤖',
      title: 'AI Advocate',
      desc: 'Describe your situation and get guidance on your rights, next steps, and template letters citing your state and local laws.',
      link: '/advocate',
      cta: 'Talk to Advocate',
    },
    {
      icon: '🚨',
      title: 'Emergency',
      desc: 'No heat? Gas leak? Mold? Get legally mandated response deadlines and emergency contacts for your city.',
      link: '/emergency-guide',
      cta: 'Get Help Now',
      urgent: true,
    },
    {
      icon: '⚖️',
      title: 'Tenant Rights',
      desc: 'Browse the laws that apply to tenants in your city and state, with local rules layered on top of state and federal protections.',
      link: '/know-your-rights',
      cta: 'View Rights',
    },
    {
      icon: '✉️',
      title: 'Generate Legal Notice',
      desc: 'Create a polished repair or habitability notice you can deliver to a landlord when you need a documented paper trail.',
      link: '/legal-notice',
      cta: 'Create Notice',
    },
    {
      icon: '🗺️',
      title: 'City Search',
      desc: 'Explore researched cities across the United States and compare tenant-protection strength before you rent.',
      link: '/cities',
      cta: 'Browse Cities',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center pt-8 pb-2">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Every renter deserves<br />
          <span className="text-sage-600">to know their rights.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-text-muted leading-relaxed">
          SafeSpace gives you the laws that protect you, the tools to enforce them,
          and a community of renters holding landlords accountable — in every US jurisdiction.
        </p>
      </section>

      {/* Address Search */}
      <section className="mx-auto max-w-2xl">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-ink">Enter your address</h2>
          <p className="text-sm text-text-muted mt-1">We'll show your rights, safety data, and reviews for your area.</p>
        </div>
        <AddressAutocomplete
          onSelect={() => { setSearchError(''); setResult(null); }}
          onSubmit={async (inputAddr) => {
            setSearching(true);
            setSearchError('');
            setResult(null);
            try {
              const res = await validateAddress(inputAddr);
              if (!res.valid) {
                setSearchError('Address not found. Please enter a valid US street address.');
                return;
              }
              const fullAddr = `${res.address.streetAddress}, ${res.address.city}, ${res.address.state} ${res.address.zipCode}`;
              
              // Try deep-data city first
              if (res.citySlug) {
                const city = getCityBySlug(res.citySlug);
                if (city) {
                  setResult({
                    citySlug: res.citySlug,
                    cityName: city.name,
                    state: city.stateCode,
                    address: fullAddr,
                    protectionScore: city.keyLaws.length >= 6 ? 7 : city.keyLaws.length >= 4 ? 5 : 3,
                  });
                } else {
                  navigate(`/city/${res.citySlug}`);
                }
              } else {
                // Try research database
                const researchCity = getResearchCityByName(res.address.city, res.address.state);
                if (researchCity) {
                  setResult({
                    citySlug: researchCity.slug,
                    cityName: researchCity.city,
                    state: researchCity.state,
                    address: fullAddr,
                    protectionScore: researchCity.tenantProtectionScore,
                  });
                } else {
                  setResult({
                    citySlug: '',
                    cityName: res.address.city,
                    state: res.address.state,
                    address: fullAddr,
                    protectionScore: 0,
                  });
                }
              }
            } catch (err) {
              setSearchError(err instanceof Error ? err.message : 'Unable to validate address.');
            } finally {
              setSearching(false);
            }
          }}
          searching={searching}
          error={searchError}
        />

        {/* Combined Safety + Review Result */}
        {result && (
          <div className="mt-6 space-y-4">
            <Card className="!p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text-muted">Results for</p>
                  <p className="font-semibold text-ink">{result.address}</p>
                  <p className="text-sm text-sage-600 mt-1">{result.cityName}, {result.state}</p>
                </div>
                {result.protectionScore > 0 && (
                  <SafetyScoreBadge score={result.protectionScore} />
                )}
              </div>

              {result.citySlug ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Link to={`/city/${result.citySlug}`}>
                    <Button className="w-full" size="sm">🛡️ Your Rights</Button>
                  </Link>
                  <Link to={`/review?city=${result.citySlug}`}>
                    <Button variant="secondary" className="w-full" size="sm">⭐ Leave Review</Button>
                  </Link>
                  <Link to={`/report?city=${result.citySlug}`}>
                    <Button variant="secondary" className="w-full" size="sm">📋 Report Issue</Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  <p className="text-sm text-text-muted">
                    We don't have full city data for {result.cityName} yet, but you can still:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link to="/review">
                      <Button className="w-full" size="sm">⭐ Leave a Review</Button>
                    </Link>
                    <Link to="/advocate">
                      <Button variant="secondary" className="w-full" size="sm">🤖 AI Advocate</Button>
                    </Link>
                  </div>
                  <Link to="/know-your-rights">
                    <p className="text-sm text-sage-600 hover:underline cursor-pointer mt-1">
                      → View general tenant rights for {result.state}
                    </p>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        )}
      </section>

      {/* Stats Bar */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="text-center !p-4">
            <p className="text-xl sm:text-2xl font-bold text-sage-700">{s.value}</p>
            <p className="text-sm text-text-muted mt-1">{s.label}</p>
          </Card>
        ))}
      </section>

      {/* Main Flows */}
      <section>
        <h2 className="text-2xl font-bold text-ink text-center mb-2">What SafeSpace Does</h2>
        <p className="text-center text-text-muted mb-8 max-w-xl mx-auto">
          Free tools for renters. No paywall, no account required for most features.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {flows.map((flow) => (
            <Link key={flow.link} to={flow.link}>
              <Card hover className="h-full flex flex-col">
                <div className="mb-3 text-2xl">{flow.icon}</div>
                <h3 className={`text-lg font-semibold ${flow.urgent ? 'text-danger' : 'text-ink'}`}>
                  {flow.title}
                </h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed flex-1">{flow.desc}</p>
                <p className={`mt-3 text-sm font-medium ${flow.urgent ? 'text-danger' : 'text-sage-600'}`}>
                  {flow.cta} →
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* City Grid */}
      <section>
        <h2 className="text-2xl font-bold text-ink text-center mb-2">Featured City Guides</h2>
        <p className="text-center text-text-muted mb-8 max-w-xl mx-auto">
          SafeSpace covers {dbStats.totalCities}+ U.S. cities. These featured guides include the strongest local detail, deadlines, and enforcement resources.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Link key={city.slug} to={`/city/${city.slug}`}>
              <Card hover className="h-full">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-ink">{city.name}, {city.stateCode}</h3>
                  {city.university && (
                    <span className="text-sm bg-sage-50 text-sage-600 px-2 py-0.5 rounded-full">🎓</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-text-muted">
                  {city.renterPercent}% renters · {city.population.toLocaleString()} pop.
                </p>
                <p className="mt-2 text-sm text-sage-700">{city.keyLaws[0]?.name}</p>
                <p className="mt-2 text-sm font-medium text-sage-600">Explore →</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse All */}
      <div className="text-center">
        <Link to="/cities">
          <Button variant="secondary" size="lg">Browse All {dbStats.totalCities}+ Cities →</Button>
        </Link>
      </div>

      {/* How It Works */}
      <section className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-ink text-center mb-8">How It Works</h2>
        <div className="space-y-6">
          {[
            { step: '1', title: 'Enter your address', desc: 'We identify your jurisdiction and pull the specific laws, deadlines, and resources that apply to you.' },
            { step: '2', title: 'Know your rights', desc: 'See tenant protections in plain English — security deposits, repair deadlines, retaliation prohibitions, rent control status.' },
            { step: '3', title: 'Take action', desc: 'Report issues with photo evidence, leave landlord reviews, generate legal notices, or talk to our AI Advocate for personalized guidance.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage-600 text-white flex items-center justify-center font-bold text-lg">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-ink">{item.title}</h3>
                <p className="mt-1 text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="rounded-lg bg-sage-700 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Facing an Emergency?</h2>
        <p className="mt-2 text-sage-100 max-w-lg mx-auto">
          No heat, gas leak, mold, sewage backup? Your landlord is legally required to respond — often within 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link to="/emergency-guide">
            <Button variant="secondary" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              🚨 Emergency Guide
            </Button>
          </Link>
          <Link to="/advocate">
            <Button variant="secondary" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              🤖 AI Advocate
            </Button>
          </Link>
        </div>
      </section>

      {/* Legal */}
      <p className="text-center text-sm text-text-muted pb-4">
        ⚖️ SafeSpace provides general information, not legal advice. Consult a tenant rights attorney for your specific situation.
      </p>
    </div>
  );
}
