import { useParams, Link, Navigate } from 'react-router-dom';
import { getCityBySlug } from '../data/cityRegistry';
import { Card, Button } from '../components/common';
import { CityRightsAccordion } from '../components/features/Rights/CityRightsAccordion';
import { CityEmergencyContacts } from '../components/features/EmergencyGuide/CityEmergencyContacts';

export function CityPage() {
  const { slug } = useParams<{ slug: string }>();
  // Redirect Boulder to dedicated landing page
  if (slug === 'boulder') {
    return <Navigate to="/boulder" replace />;
  }

  const city = slug ? getCityBySlug(slug) : undefined;

  if (!city) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-bold text-ink">City Not Found</h1>
        <p className="mt-4 text-text-muted">
          We don't have data for this city yet.
        </p>
        <Link to="/">
          <Button className="mt-6">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center pt-4">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {city.name}, <span className="text-sage-600">{city.stateCode}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-text-muted">
          {city.population.toLocaleString()} residents · {city.renterPercent}% renters · {city.university.name} ({city.university.students.toLocaleString()} students)
        </p>
      </section>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <p className="text-sm text-text-muted">Anonymous Reporting</p>
          <p className={`mt-1 text-lg font-semibold ${city.anonymousReporting ? 'text-sage-600' : 'text-text-muted'}`}>
            {city.anonymousReporting ? 'Available' : 'Not Available'}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-text-muted">Mandatory Inspections</p>
          <p className={`mt-1 text-lg font-semibold ${city.mandatoryInspections ? 'text-sage-600' : 'text-text-muted'}`}>
            {city.mandatoryInspections ? 'Yes' : 'No'}
          </p>
          {city.mandatoryInspectionsDescription && (
            <p className="mt-1 text-xs text-text-muted">{city.mandatoryInspectionsDescription}</p>
          )}
        </Card>
        <Card className="text-center">
          <p className="text-sm text-text-muted">Key Laws</p>
          <p className="mt-1 text-lg font-semibold text-ink">{city.keyLaws.length}</p>
        </Card>
      </div>

      {/* Your Rights Here */}
      <section>
        <h2 className="text-2xl font-bold text-ink mb-6">Your Rights in {city.name}</h2>
        <CityRightsAccordion rights={city.rights} />
      </section>

      {/* Response Deadlines */}
      <section>
        <h2 className="text-2xl font-bold text-ink mb-4">Response Deadlines</h2>
        <Card>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between py-3">
              <div>
                <span className="inline-flex items-center rounded-full bg-danger-bg px-2.5 py-0.5 text-xs font-medium text-danger">Emergency</span>
                <p className="mt-1 text-sm text-text-muted">{city.deadlines.emergency.label}</p>
              </div>
              <span className="text-lg font-bold text-danger">{city.deadlines.emergency.hours}h</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <span className="inline-flex items-center rounded-full bg-bamboo-50 px-2.5 py-0.5 text-xs font-medium text-bamboo-800">Urgent</span>
                <p className="mt-1 text-sm text-text-muted">{city.deadlines.urgent.label}</p>
              </div>
              <span className="text-lg font-bold text-bamboo-700">{city.deadlines.urgent.hours}h</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <span className="inline-flex items-center rounded-full bg-sage-50 px-2.5 py-0.5 text-xs font-medium text-sage-700">Standard</span>
                <p className="mt-1 text-sm text-text-muted">{city.deadlines.standard.label}</p>
              </div>
              <span className="text-lg font-bold text-sage-700">{city.deadlines.standard.hours}h</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Key Laws */}
      <section>
        <h2 className="text-2xl font-bold text-ink mb-4">Key Laws</h2>
        <div className="space-y-3">
          {city.keyLaws.map((law) => (
            <Card key={law.citation}>
              <h3 className="font-semibold text-ink">{law.name}</h3>
              <p className="mt-1 text-xs font-mono text-sage-600">{law.citation}</p>
              <p className="mt-2 text-sm text-text-muted">{law.summary}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Who Enforces This */}
      <section>
        <h2 className="text-2xl font-bold text-ink mb-4">Who Enforces This</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="font-semibold text-ink">Health Department</h3>
            <p className="mt-1 text-sm font-medium text-sage-600">{city.enforcement.healthDept.name}</p>
            <a href={`tel:${city.enforcement.healthDept.phone.replace(/\D/g, '')}`} className="mt-1 block text-sm text-sage-600 hover:underline">
              {city.enforcement.healthDept.phone}
            </a>
            {city.enforcement.healthDept.address && (
              <p className="mt-1 text-xs text-text-muted">{city.enforcement.healthDept.address}</p>
            )}
            {city.enforcement.healthDept.hours && (
              <p className="mt-1 text-xs text-text-muted">{city.enforcement.healthDept.hours}</p>
            )}
          </Card>
          <Card>
            <h3 className="font-semibold text-ink">Code Enforcement</h3>
            <p className="mt-1 text-sm font-medium text-sage-600">{city.enforcement.codeEnforcement.name}</p>
            <a href={`tel:${city.enforcement.codeEnforcement.phone.replace(/\D/g, '')}`} className="mt-1 block text-sm text-sage-600 hover:underline">
              {city.enforcement.codeEnforcement.phone}
            </a>
            {city.enforcement.codeEnforcement.email && (
              <a href={`mailto:${city.enforcement.codeEnforcement.email}`} className="mt-1 block text-xs text-sage-600 hover:underline">
                {city.enforcement.codeEnforcement.email}
              </a>
            )}
            {city.enforcement.codeEnforcement.address && (
              <p className="mt-1 text-xs text-text-muted">{city.enforcement.codeEnforcement.address}</p>
            )}
            {city.enforcement.codeEnforcement.hours && (
              <p className="mt-1 text-xs text-text-muted">{city.enforcement.codeEnforcement.hours}</p>
            )}
          </Card>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section>
        <CityEmergencyContacts contacts={city.emergencyContacts} />
      </section>

      {/* CTAs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Link to={`/report?city=${city.slug}`}>
          <Button size="lg" fullWidth>Report an Issue</Button>
        </Link>
        <Link to={`/property-lookup?city=${city.slug}`}>
          <Button variant="secondary" size="lg" fullWidth>Lookup a Property</Button>
        </Link>
      </div>
    </div>
  );
}
