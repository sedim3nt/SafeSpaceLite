import { useParams, Link, Navigate } from 'react-router-dom';
import { getCityBySlug } from '../data/cityRegistry';
import { getResearchCity, getStateProfile, type ResearchCity } from '../data/cityDatabase';
import { Card, Button } from '../components/common';
import { CityRightsAccordion } from '../components/features/Rights/CityRightsAccordion';
import { CityEmergencyContacts } from '../components/features/EmergencyGuide/CityEmergencyContacts';
import { JurisdictionLayers } from '../components/features/Jurisdictions/JurisdictionLayers';
import { getJurisdictionLayersForCitySlug } from '../data/jurisdictions';

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 7 ? 'bg-green-100 text-green-800' : score >= 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  const label = score >= 7 ? 'Strong' : score >= 4 ? 'Moderate' : 'Weak';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${color}`}>
      {score}/10 — {label} Protections
    </span>
  );
}

/** Renders a research-only city (no deep data) */
function ResearchCityPage({ city }: { city: ResearchCity }) {
  const stateProfile = getStateProfile(city.state);
  const jurisdictions = getJurisdictionLayersForCitySlug(city.slug);

  return (
    <div className="space-y-10">
      {/* Header */}
      <section className="pt-4">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {city.city}, <span className="text-sage-600">{city.state}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-text-muted">
          {city.population > 0 ? `${city.population.toLocaleString()} residents` : ''}
        </p>
        <div className="mt-3">
          <ScoreBadge score={city.tenantProtectionScore} />
        </div>
      </section>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <p className="text-sm text-text-muted">Rent Control</p>
          <p className={`mt-1 text-lg font-semibold ${city.rentControlExists ? 'text-sage-600' : 'text-text-muted'}`}>
            {city.rentControlExists ? 'Yes' : 'No'}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-text-muted">Just Cause Eviction</p>
          <p className={`mt-1 text-lg font-semibold ${city.justCauseEviction ? 'text-sage-600' : 'text-text-muted'}`}>
            {city.justCauseEviction ? 'Yes' : 'No'}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-text-muted">Retaliation Protection</p>
          <p className={`mt-1 text-lg font-semibold ${city.retaliationProtection ? 'text-sage-600' : 'text-text-muted'}`}>
            {city.retaliationProtection ? 'Yes' : 'No'}
          </p>
        </Card>
      </div>

      {jurisdictions && (
        <JurisdictionLayers
          layers={jurisdictions.layers}
          title="County, State, and Federal Layers"
          subtitle={`SafeSpace resolves ${city.city} into the local jurisdiction stack that shapes inspections, deadlines, discrimination protections, and escalation paths.`}
          omitKinds={['city']}
        />
      )}

      {/* Repair Deadlines */}
      <section>
        <h2 className="text-2xl font-bold text-ink mb-4">Repair Deadlines</h2>
        <Card>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between py-3">
              <span className="inline-flex items-center rounded-full bg-danger-bg px-2.5 py-0.5 text-sm font-medium text-danger">Emergency</span>
              <span className="text-lg font-bold text-danger">{city.repairDeadlines.emergency}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="inline-flex items-center rounded-full bg-bamboo-50 px-2.5 py-0.5 text-sm font-medium text-bamboo-800">Urgent</span>
              <span className="text-lg font-bold text-bamboo-700">{city.repairDeadlines.urgent}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="inline-flex items-center rounded-full bg-sage-50 px-2.5 py-0.5 text-sm font-medium text-sage-700">Standard</span>
              <span className="text-lg font-bold text-sage-700">{city.repairDeadlines.standard}</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Key Laws */}
      {city.keyLaws.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-ink mb-4">Key Laws</h2>
          <div className="space-y-3">
            {city.keyLaws.map((law, i) => (
              <Card key={i}>
                <h3 className="font-semibold text-ink">{law.name}</h3>
                {law.citation && <p className="mt-1 text-sm font-mono text-sage-600">{law.citation}</p>}
                <p className="mt-2 text-sm text-text-muted">{law.summary}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Security Deposit */}
      {city.securityDepositRules && (
        <section>
          <h2 className="text-2xl font-bold text-ink mb-4">Security Deposit Rules</h2>
          <Card>
            <p className="text-sm text-text-muted leading-relaxed">{city.securityDepositRules}</p>
          </Card>
        </section>
      )}

      {/* Enforcement Contacts */}
      {(city.enforcement.healthDept.name || city.enforcement.codeEnforcement.name) && (
        <section>
          <h2 className="text-2xl font-bold text-ink mb-4">Who Enforces This</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {city.enforcement.healthDept.name && (
              <Card>
                <h3 className="font-semibold text-ink">Health Department</h3>
                <p className="mt-1 text-sm text-sage-600">{city.enforcement.healthDept.name}</p>
                {city.enforcement.healthDept.phone && (
                  <a href={`tel:${city.enforcement.healthDept.phone.replace(/\D/g, '')}`} className="mt-1 block text-sm text-sage-600 hover:underline">
                    {city.enforcement.healthDept.phone}
                  </a>
                )}
              </Card>
            )}
            {city.enforcement.codeEnforcement.name && (
              <Card>
                <h3 className="font-semibold text-ink">Code Enforcement</h3>
                <p className="mt-1 text-sm text-sage-600">{city.enforcement.codeEnforcement.name}</p>
                {city.enforcement.codeEnforcement.phone && (
                  <a href={`tel:${city.enforcement.codeEnforcement.phone.replace(/\D/g, '')}`} className="mt-1 block text-sm text-sage-600 hover:underline">
                    {city.enforcement.codeEnforcement.phone}
                  </a>
                )}
              </Card>
            )}
          </div>
        </section>
      )}

      {/* State Profile */}
      {stateProfile && (
        <section className="rounded-lg bg-sage-50 p-6">
          <h2 className="text-lg font-bold text-ink mb-2">State-Level: {stateProfile.state}</h2>
          <p className="text-sm text-text-muted">
            Statewide tenant protection score: <strong>{stateProfile.tenantProtectionScore}/10</strong>
          </p>
        </section>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Link to="/review">
          <Button size="lg" fullWidth>⭐ Leave a Review</Button>
        </Link>
        <Link to="/report">
          <Button variant="secondary" size="lg" fullWidth>📋 Report an Issue</Button>
        </Link>
        <Link to="/advocate">
          <Button variant="secondary" size="lg" fullWidth>🤖 AI Advocate</Button>
        </Link>
      </div>
    </div>
  );
}

/** Main CityPage — tries deep data first, falls back to research data */
export function CityPage() {
  const { slug } = useParams<{ slug: string }>();

  if (slug === 'boulder') {
    return <Navigate to="/boulder" replace />;
  }

  // Try deep-data city first (11 cities with full info)
  const deepCity = slug ? getCityBySlug(slug) : undefined;

  if (deepCity) {
    const jurisdictions = getJurisdictionLayersForCitySlug(deepCity.slug);

    return (
      <div className="space-y-10">
        {/* Header */}
        <section className="pt-4">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {deepCity.name}, <span className="text-sage-600">{deepCity.stateCode}</span>
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-text-muted">
            {deepCity.population.toLocaleString()} residents · {deepCity.renterPercent}% renters · {deepCity.university.name} ({deepCity.university.students.toLocaleString()} students)
          </p>
        </section>

        {/* Quick stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="text-center">
            <p className="text-sm text-text-muted">Anonymous Reporting</p>
            <p className={`mt-1 text-lg font-semibold ${deepCity.anonymousReporting ? 'text-sage-600' : 'text-text-muted'}`}>
              {deepCity.anonymousReporting ? 'Available' : 'Not Available'}
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-text-muted">Mandatory Inspections</p>
            <p className={`mt-1 text-lg font-semibold ${deepCity.mandatoryInspections ? 'text-sage-600' : 'text-text-muted'}`}>
              {deepCity.mandatoryInspections ? 'Yes' : 'No'}
            </p>
            {deepCity.mandatoryInspectionsDescription && (
              <p className="mt-1 text-sm text-text-muted">{deepCity.mandatoryInspectionsDescription}</p>
            )}
          </Card>
          <Card className="text-center">
            <p className="text-sm text-text-muted">Key Laws</p>
            <p className="mt-1 text-lg font-semibold text-ink">{deepCity.keyLaws.length}</p>
          </Card>
        </div>

        {jurisdictions && (
          <JurisdictionLayers
            layers={jurisdictions.layers}
            title="County, State, and Federal Layers"
            subtitle={`SafeSpace resolves ${deepCity.name} into the enforcement and legal stack behind the city-specific rules below.`}
            omitKinds={['city']}
          />
        )}

        {/* Rights */}
        <section>
          <h2 className="text-2xl font-bold text-ink mb-6">Your Rights in {deepCity.name}</h2>
          <CityRightsAccordion rights={deepCity.rights} />
        </section>

        {/* Deadlines */}
        <section>
          <h2 className="text-2xl font-bold text-ink mb-4">Response Deadlines</h2>
          <Card>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="inline-flex items-center rounded-full bg-danger-bg px-2.5 py-0.5 text-sm font-medium text-danger">Emergency</span>
                  <p className="mt-1 text-sm text-text-muted">{deepCity.deadlines.emergency.label}</p>
                </div>
                <span className="text-lg font-bold text-danger">{deepCity.deadlines.emergency.hours}h</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="inline-flex items-center rounded-full bg-bamboo-50 px-2.5 py-0.5 text-sm font-medium text-bamboo-800">Urgent</span>
                  <p className="mt-1 text-sm text-text-muted">{deepCity.deadlines.urgent.label}</p>
                </div>
                <span className="text-lg font-bold text-bamboo-700">{deepCity.deadlines.urgent.hours}h</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="inline-flex items-center rounded-full bg-sage-50 px-2.5 py-0.5 text-sm font-medium text-sage-700">Standard</span>
                  <p className="mt-1 text-sm text-text-muted">{deepCity.deadlines.standard.label}</p>
                </div>
                <span className="text-lg font-bold text-sage-700">{deepCity.deadlines.standard.hours}h</span>
              </div>
            </div>
          </Card>
        </section>

        {/* Key Laws */}
        <section>
          <h2 className="text-2xl font-bold text-ink mb-4">Key Laws</h2>
          <div className="space-y-3">
            {deepCity.keyLaws.map((law) => (
              <Card key={law.citation}>
                <h3 className="font-semibold text-ink">{law.name}</h3>
                <p className="mt-1 text-sm font-mono text-sage-600">{law.citation}</p>
                <p className="mt-2 text-sm text-text-muted">{law.summary}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Enforcement */}
        <section>
          <h2 className="text-2xl font-bold text-ink mb-4">Who Enforces This</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="font-semibold text-ink">Health Department</h3>
              <p className="mt-1 text-sm font-medium text-sage-600">{deepCity.enforcement.healthDept.name}</p>
              <a href={`tel:${deepCity.enforcement.healthDept.phone.replace(/\D/g, '')}`} className="mt-1 block text-sm text-sage-600 hover:underline">
                {deepCity.enforcement.healthDept.phone}
              </a>
              {deepCity.enforcement.healthDept.address && <p className="mt-1 text-sm text-text-muted">{deepCity.enforcement.healthDept.address}</p>}
              {deepCity.enforcement.healthDept.hours && <p className="mt-1 text-sm text-text-muted">{deepCity.enforcement.healthDept.hours}</p>}
            </Card>
            <Card>
              <h3 className="font-semibold text-ink">Code Enforcement</h3>
              <p className="mt-1 text-sm font-medium text-sage-600">{deepCity.enforcement.codeEnforcement.name}</p>
              <a href={`tel:${deepCity.enforcement.codeEnforcement.phone.replace(/\D/g, '')}`} className="mt-1 block text-sm text-sage-600 hover:underline">
                {deepCity.enforcement.codeEnforcement.phone}
              </a>
              {deepCity.enforcement.codeEnforcement.address && <p className="mt-1 text-sm text-text-muted">{deepCity.enforcement.codeEnforcement.address}</p>}
              {deepCity.enforcement.codeEnforcement.hours && <p className="mt-1 text-sm text-text-muted">{deepCity.enforcement.codeEnforcement.hours}</p>}
            </Card>
          </div>
        </section>

        {/* Emergency Contacts */}
        <section>
          <CityEmergencyContacts contacts={deepCity.emergencyContacts} />
        </section>

        {/* CTAs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link to="/review">
            <Button size="lg" fullWidth>⭐ Leave a Review</Button>
          </Link>
          <Link to={`/report?city=${deepCity.slug}`}>
            <Button variant="secondary" size="lg" fullWidth>📋 Report Issue</Button>
          </Link>
          <Link to="/advocate">
            <Button variant="secondary" size="lg" fullWidth>🤖 AI Advocate</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Try research city
  const researchCity = slug ? getResearchCity(slug) : undefined;

  if (researchCity) {
    return <ResearchCityPage city={researchCity} />;
  }

  // Not found
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-bold text-ink">City Not Found</h1>
      <p className="mt-4 text-text-muted">We don't have data for this city yet.</p>
      <Link to="/">
        <Button className="mt-6">Back to Home</Button>
      </Link>
    </div>
  );
}
