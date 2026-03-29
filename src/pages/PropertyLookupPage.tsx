import { useState, useCallback } from 'react';
import { PropertySearch } from '../components/features/PropertyLookup/PropertySearch';
import { PropertyDetails } from '../components/features/PropertyLookup/PropertyDetails';
import { CommunityComments } from '../components/features/PropertyLookup/CommunityComments';
import { RebuttalForm } from '../components/features/PropertyLookup/RebuttalForm';
import { LandlordScoreCard } from '../components/features/RentalReview/LandlordScoreCard';
import { supabase } from '../lib/supabase';
import { ensureProperty, type USPSValidationResult } from '../lib/usps';
import type { Report, Comment as DbComment, Rebuttal, Property } from '../types/database';

type Tab = 'health' | 'rental';

export function PropertyLookupPage() {
  const [searchedAddress, setSearchedAddress] = useState('');
  const [property, setProperty] = useState<Property | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [comments, setComments] = useState<DbComment[]>([]);
  const [rebuttals, setRebuttals] = useState<Rebuttal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [uspsInfo, setUspsInfo] = useState<USPSValidationResult | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('health');

  const fetchPropertyData = useCallback(async (addressHash: string) => {
    const { data: prop } = await supabase
      .from('properties')
      .select('*')
      .eq('address_hash', addressHash)
      .single();

    if (prop) {
      setProperty(prop);

      const [reportsRes, commentsRes, rebuttalsRes] = await Promise.all([
        supabase.from('reports').select('*').eq('property_id', prop.id).order('created_at', { ascending: false }),
        supabase.from('comments').select('*').eq('property_id', prop.id).order('created_at', { ascending: false }),
        supabase.from('rebuttals').select('*').eq('property_id', prop.id),
      ]);

      setReports(reportsRes.data || []);
      setComments(commentsRes.data || []);
      setRebuttals(rebuttalsRes.data || []);
    } else {
      setProperty(null);
      setReports([]);
      setComments([]);
      setRebuttals([]);
    }
  }, []);

  const handleSearch = async (result: USPSValidationResult) => {
    setSearchedAddress(result.normalized);
    setUspsInfo(result);
    setLoading(true);
    setSearched(true);

    // Ensure property exists so rental tab works even for new addresses
    await ensureProperty(result);
    await fetchPropertyData(result.addressHash);
    setLoading(false);
  };

  const handleRefresh = () => {
    if (property) {
      fetchPropertyData(property.address_hash);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'health', label: 'Health & Safety' },
    { key: 'rental', label: 'Rental Experience' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">Property Health Lookup</h1>
        <p className="mt-2 text-lg text-text-muted">
          Research rental property health history and read community experiences
        </p>
      </div>

      <PropertySearch onSearch={handleSearch} loading={loading} />

      {searched && !loading && uspsInfo && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-start gap-2">
          <span className="text-green-600 text-lg">✓</span>
          <div>
            <p className="text-sm font-medium text-green-800">
              USPS Verified: {uspsInfo.normalized}
            </p>
            {uspsInfo.additionalInfo?.vacant === 'Y' && (
              <p className="text-xs text-amber-700 mt-1">⚠ USPS reports this address as vacant</p>
            )}
            {uspsInfo.additionalInfo?.business === 'Y' && (
              <p className="text-xs text-amber-700 mt-1">ℹ This is a commercial address</p>
            )}
            {uspsInfo.corrections?.some(c => c.code === '32') && (
              <p className="text-xs text-gray-600 mt-1">
                Tip: Add an apartment or unit number for more specific results
              </p>
            )}
          </div>
        </div>
      )}

      {searched && !loading && property && (
        <>
          {/* Tab bar */}
          <div className="border-b border-border">
            <div className="flex gap-0">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
                    activeTab === tab.key
                      ? 'border-sage-600 text-sage-700'
                      : 'border-transparent text-text-muted hover:text-text hover:border-sage-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Health & Safety tab */}
          {activeTab === 'health' && (
            <>
              <PropertyDetails
                address={property.address_normalized}
                reports={reports}
                comments={comments}
                rebuttals={rebuttals}
              />

              <div className="border-t border-border pt-8">
                <CommunityComments
                  propertyId={property.id}
                  comments={comments}
                  onCommentAdded={handleRefresh}
                />
              </div>

              {reports.length > 0 && (
                <div className="border-t border-border pt-8">
                  <h3 className="mb-4 text-lg font-semibold text-text">Property Owner?</h3>
                  <RebuttalForm reportId={reports[0].id} propertyId={property.id} />
                </div>
              )}
            </>
          )}

          {/* Rental Experience tab */}
          {activeTab === 'rental' && (
            <LandlordScoreCard propertyId={property.id} />
          )}
        </>
      )}

      {searched && !loading && !property && (
        <div className="py-12 text-center">
          <p className="text-text-muted">No records found for "{searchedAddress}"</p>
          <p className="mt-2 text-sm text-text-muted">
            This property has no reports yet. You can be the first to report an issue.
          </p>
        </div>
      )}

      {searched && (
        <div className="rounded-xl bg-surface-muted p-6">
          <p className="text-sm text-text-muted">
            <strong>Note:</strong> This information is compiled from community reports. Always conduct your own inspection and due diligence before renting.
          </p>
        </div>
      )}
    </div>
  );
}
