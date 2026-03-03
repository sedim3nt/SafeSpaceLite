import React, { useState } from 'react';
import { PropertySearch } from '../components/features/PropertyLookup/PropertySearch';
import { PropertyDetails } from '../components/features/PropertyLookup/PropertyDetails';
import { CommunityComments } from '../components/features/PropertyLookup/CommunityComments';
import { OnChainReports } from '../components/features/PropertyLookup/OnChainReports';
import { seedProperties } from '../data/properties';
import type { Property } from '../types';

function findProperty(query: string): Property | null {
  const normalized = query.toLowerCase().replace(/[,.]/g, '').trim();

  // Exact key match first
  if (seedProperties[normalized]) {
    return seedProperties[normalized];
  }

  // Fuzzy: find any property whose key or full address contains the query
  for (const [key, property] of Object.entries(seedProperties)) {
    if (key.includes(normalized) || property.address.toLowerCase().includes(normalized)) {
      return property;
    }
  }

  return null;
}

export const PropertyLookupPage: React.FC = () => {
  const [searchedAddress, setSearchedAddress] = useState<string>('');
  const [propertyData, setPropertyData] = useState<Property | null>(null);

  const handleSearch = (address: string) => {
    setSearchedAddress(address);
    const property = findProperty(address);

    if (property) {
      setPropertyData(property);
    } else {
      setPropertyData({
        address: address,
        violations: [],
        comments: [],
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Property Health Lookup</h1>
        <p className="mt-2 text-lg text-gray-600">
          Research rental property health history and read community experiences
        </p>
      </div>

      <PropertySearch onSearch={handleSearch} />

      {propertyData && (
        <>
          <PropertyDetails property={propertyData} />

          <OnChainReports propertyAddress={propertyData.address} />

          <div className="border-t pt-8">
            <CommunityComments
              propertyAddress={propertyData.address}
              comments={propertyData.comments || []}
            />
          </div>

          <div className="rounded-lg bg-gray-50 p-6">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> This information is compiled from public records and community
              reports. Always conduct your own inspection and due diligence before renting.
            </p>
          </div>
        </>
      )}

      {searchedAddress && !propertyData && (
        <div className="py-12 text-center">
          <p className="text-gray-500">No records found for this address</p>
          <p className="mt-2 text-sm text-gray-400">
            Try searching with a different format or check the address
          </p>
        </div>
      )}
    </div>
  );
};
