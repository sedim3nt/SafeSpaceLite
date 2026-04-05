import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RightsAccordion } from '../components/features/Rights/RightsAccordion';
import { CityRightsAccordion } from '../components/features/Rights/CityRightsAccordion';
import { Card, Select } from '../components/common';
import { getCityBySlug, getSupportedCities } from '../data/cityRegistry';
import { getAllResearchCities, getResearchCity } from '../data/cityDatabase';
import { JurisdictionLayers } from '../components/features/Jurisdictions/JurisdictionLayers';
import { getJurisdictionLayersForCitySlug } from '../data/jurisdictions';

export const KnowYourRightsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityParam = searchParams.get('city');
  const [selectedCity, setSelectedCity] = useState(cityParam || '');

  const deepCity = selectedCity ? getCityBySlug(selectedCity) : undefined;
  const researchCity = !deepCity && selectedCity ? getResearchCity(selectedCity) : undefined;
  const jurisdictions = selectedCity ? getJurisdictionLayersForCitySlug(selectedCity) : null;
  const cities = getSupportedCities();
  const researchCities = getAllResearchCities();
  const cityOptions = [
    ...cities.map((c) => ({ value: c.slug, label: `${c.name}, ${c.stateCode}` })),
    ...researchCities.map((c) => ({ value: c.slug, label: `${c.city}, ${c.state}` })),
  ]
    .reduce<Array<{ value: string; label: string }>>((unique, entry) => {
      if (!unique.some((item) => item.value === entry.value)) {
        unique.push(entry);
      }
      return unique;
    }, [])
    .sort((a, b) => a.label.localeCompare(b.label));

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    setSelectedCity(slug);
    if (slug) {
      setSearchParams({ city: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ink">Know Your Rights</h1>
        <p className="mt-2 text-lg text-text-muted">
          {deepCity
            ? `Tenant protections in ${deepCity.name}, ${deepCity.stateCode}`
            : researchCity
              ? `Tenant protections in ${researchCity.city}, ${researchCity.state}`
            : 'Understanding tenant protections in your city'}
        </p>
      </div>

      {/* City selector */}
      <div className="max-w-xs">
        <Select
          label="Choose your city"
          options={cityOptions}
          value={selectedCity}
          onChange={handleCityChange}
        />
      </div>

      {deepCity ? (
        <>
          <Card className="bg-sage-50 border-sage-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-sage-900">{deepCity.name} Tenant Protections</h3>
                <p className="mt-1 text-sage-800">
                  {deepCity.keyLaws.map((l) => l.name).join(', ')}
                </p>
              </div>
            </div>
          </Card>

          {jurisdictions && (
            <JurisdictionLayers
              layers={jurisdictions.layers}
              title="Jurisdiction Layers"
              subtitle="City rights sit on top of county enforcement, state tenant law, and federal housing protections."
              omitKinds={['city']}
            />
          )}

          <div>
            <h2 className="text-2xl font-bold text-ink mb-6">Your Legal Rights</h2>
            <CityRightsAccordion rights={deepCity.rights} />
          </div>

          <Card className="bg-surface-muted">
            <h3 className="text-lg font-semibold text-ink mb-4">Need Legal Help?</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {deepCity.emergencyContacts
                .filter((c) => c.description.toLowerCase().includes('legal'))
                .slice(0, 2)
                .map((contact) => (
                  <div key={contact.phone}>
                    <h4 className="font-medium text-ink">{contact.name}</h4>
                    <p className="text-sm text-text-muted">{contact.description}</p>
                    <a href={`tel:${contact.phone.replace(/\D/g, '')}`} className="text-sage-600 hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                ))}
            </div>
          </Card>
        </>
      ) : researchCity ? (
        <>
          <Card className="bg-sage-50 border-sage-200">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-sage-900">
                {researchCity.city}, {researchCity.state} Tenant Protections
              </h3>
              <p className="text-sage-800">
                Tenant protection score: {researchCity.tenantProtectionScore}/10
              </p>
              <p className="text-sm text-sage-700">
                This city is covered through SafeSpace research mode. City-specific enforcement detail is expanding, while state and federal protections are already layered in.
              </p>
            </div>
          </Card>

          {jurisdictions && (
            <JurisdictionLayers
              layers={jurisdictions.layers}
              title="Jurisdiction Layers"
              subtitle="Research-mode cities still resolve into city, county, state, and federal layers so the legal baseline is visible."
            />
          )}

          {researchCity.keyLaws.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-ink mb-4">Local Highlights</h3>
              <div className="space-y-3">
                {researchCity.keyLaws.map((law) => (
                  <div key={`${law.name}-${law.citation}`} className="rounded-lg bg-surface-muted p-3">
                    <p className="font-medium text-text">{law.name}</p>
                    <p className="mt-1 text-sm text-text-muted">{law.citation}</p>
                    <p className="mt-2 text-sm text-text-muted">{law.summary}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <>
          <Card className="bg-sage-50 border-sage-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-sage-900">Select a City Above</h3>
                <p className="mt-1 text-sage-800">
                  Choose your city to see the specific tenant protections that apply to you.
                </p>
              </div>
            </div>
          </Card>

          <div>
            <h2 className="text-2xl font-bold text-ink mb-6">General Tenant Rights (Boulder, CO)</h2>
            <RightsAccordion />
          </div>
        </>
      )}

      <div className="bg-bamboo-50 border border-bamboo-200 rounded-md p-4">
        <p className="text-sm text-bamboo-800">
          <strong>Disclaimer:</strong> This information is for educational purposes only and does not constitute legal advice.
          For specific legal guidance, consult with a qualified attorney.
        </p>
      </div>
    </div>
  );
};
