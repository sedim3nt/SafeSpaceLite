import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PropertySearch } from '../components/features/PropertyLookup/PropertySearch';
import { PropertyDetails } from '../components/features/PropertyLookup/PropertyDetails';
import { LandlordScoreCard } from '../components/features/RentalReview/LandlordScoreCard';
import { JurisdictionLayers } from '../components/features/Jurisdictions/JurisdictionLayers';
import { PersistentLandlordPanel } from '../components/features/LandlordResponses/PersistentLandlordPanel';
import { supabase } from '../lib/supabase';
import { ensureProperty, type AddressValidationResult } from '../lib/addressValidation';
import { finalizePendingLandlordResponse } from '../lib/landlordResponses';
import { resolveJurisdictionLayers, type JurisdictionResolution } from '../data/jurisdictions';
import type { PropertyLandlordStatement, Report, Rebuttal, Property } from '../types/database';

type Tab = 'health' | 'rental';

function getTabFromParams(searchParams: URLSearchParams): Tab {
  return searchParams.get('tab') === 'rental' ? 'rental' : 'health';
}

export function PropertyLookupPage() {
  const { propertyId: routePropertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchedAddress, setSearchedAddress] = useState('');
  const [property, setProperty] = useState<Property | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [rebuttals, setRebuttals] = useState<Rebuttal[]>([]);
  const [landlordStatement, setLandlordStatement] = useState<PropertyLandlordStatement | null>(null);
  const [rentalReviewCount, setRentalReviewCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [jurisdictions, setJurisdictions] = useState<JurisdictionResolution | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(() => getTabFromParams(searchParams));
  const [rentalTabLoading, setRentalTabLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | 'error' | null>(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [reviewRefreshToken, setReviewRefreshToken] = useState(0);

  const fetchPropertyData = useCallback(async (propertyId: string, existingProperty?: Property) => {
    const prop = existingProperty || (
      await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()
    ).data;

    if (!prop) {
      setProperty(null);
      setReports([]);
      setRebuttals([]);
      setLandlordStatement(null);
      setRentalReviewCount(0);
      return;
    }

    setProperty(prop);
    setSearched(true);
    setSearchedAddress(prop.address_normalized);
    setJurisdictions(
      resolveJurisdictionLayers({
        city: prop.city,
        state: prop.state,
        zip: prop.zip || '',
      }),
    );

    const [reportsRes, rebuttalsRes, statementRes, rentalReviewCountRes] = await Promise.all([
      supabase.from('reports').select('*').eq('property_id', prop.id).order('created_at', { ascending: false }),
      supabase.from('rebuttals').select('*').eq('property_id', prop.id),
      supabase.from('property_landlord_statements').select('*').eq('property_id', prop.id).maybeSingle(),
      supabase.from('rental_reviews').select('id', { count: 'exact', head: true }).eq('property_id', prop.id),
    ]);

    setReports(reportsRes.data || []);
    setRebuttals(rebuttalsRes.data || []);
    setLandlordStatement(statementRes.data || null);
    setRentalReviewCount(rentalReviewCountRes.count || 0);
  }, []);

  useEffect(() => {
    if (!routePropertyId) return;

    setLoading(true);
    fetchPropertyData(routePropertyId)
      .finally(() => setLoading(false));
  }, [routePropertyId, fetchPropertyData]);

  useEffect(() => {
    const requestedTab = getTabFromParams(searchParams);
    if (requestedTab !== activeTab) {
      setActiveTab(requestedTab);
    }
  }, [searchParams, activeTab]);

  useEffect(() => {
    if (!routePropertyId && !property) return;

    const nextParams = new URLSearchParams(searchParams);

    if (activeTab === 'health') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', activeTab);
    }

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [activeTab, routePropertyId, property, searchParams, setSearchParams]);

  useEffect(() => {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    const propertyId = routePropertyId || searchParams.get('property') || undefined;
    const responseType = searchParams.get('type');

    if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      setPaymentMessage('Payment was cancelled. Your landlord response was not submitted.');
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('payment');
      setSearchParams(nextParams, { replace: true });
      return;
    }

    if (payment !== 'success' || !sessionId || !propertyId) return;
    const paidSessionId = sessionId;
    const resolvedPropertyId = propertyId;

    let cancelled = false;

    async function completeLandlordResponse() {
      try {
        await finalizePendingLandlordResponse(paidSessionId);
        if (cancelled) return;
        setPaymentStatus('success');
        setPaymentMessage(
          responseType === 'review'
            ? 'Payment received. The landlord response was added to this rental review.'
            : responseType === 'property'
              ? 'Payment received. The landlord note was added to this property page.'
            : 'Payment received. The landlord response was added to this safety report.',
        );
        await fetchPropertyData(resolvedPropertyId);
        setReviewRefreshToken((current) => current + 1);
      } catch (err) {
        if (cancelled) return;
        setPaymentStatus('error');
        setPaymentMessage(
          err instanceof Error
            ? err.message
            : 'Payment was completed, but SafeSpace could not save the landlord response.',
        );
      } finally {
        if (!cancelled) {
          const nextParams = new URLSearchParams(searchParams);
          nextParams.delete('payment');
          nextParams.delete('session_id');
          nextParams.delete('property');
          nextParams.delete('type');
          setSearchParams(nextParams, { replace: true });
        }
      }
    }

    completeLandlordResponse();

    return () => {
      cancelled = true;
    };
  }, [routePropertyId, searchParams, setSearchParams, fetchPropertyData]);

  const handleSearch = async (result: AddressValidationResult) => {
    setSearchedAddress(result.normalized);
    setJurisdictions(result.jurisdictions);
    setLoading(true);
    setSearched(true);

    // Ensure property exists so rental tab works even for new addresses
    const prop = await ensureProperty(result);
    await fetchPropertyData(prop.id, prop);
    navigate(`/property/${prop.id}`, { replace: true });
    setLoading(false);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'health', label: 'Health & Safety' },
    { key: 'rental', label: 'Rental Experience' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">Property Lookup</h1>
        <p className="mt-2 text-lg text-text-muted">
          Research health history, landlord reviews, and the laws that apply to a rental address
        </p>
      </div>

      {paymentStatus === 'success' && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
          <p className="text-sm font-medium text-green-800">✓ {paymentMessage}</p>
        </div>
      )}
      {paymentStatus === 'cancelled' && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 mb-4">
          <p className="text-sm font-medium text-amber-800">{paymentMessage}</p>
        </div>
      )}
      {paymentStatus === 'error' && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
          <p className="text-sm font-medium text-red-800">{paymentMessage}</p>
        </div>
      )}

      <PropertySearch onSearch={handleSearch} loading={loading} />

      {!searched && (
        <div className="rounded-xl bg-surface-muted p-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-text">How Property Lookup Works</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>1. Enter a rental property address above.</li>
              <li>2. View health and safety reports, comments, and landlord rebuttals.</li>
              <li>3. Switch to the rental experience tab for landlord reviews and ratings.</li>
              <li>4. Report a new issue or start tracking deadlines from the property view.</li>
            </ul>
            <p className="text-sm text-text-muted">No account is required to search and review public property records.</p>
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
                  className={`px-5 py-3 text-xl font-semibold transition-colors duration-200 border-b-2 -mb-px font-[var(--font-display)] ${
                    activeTab === tab.key
                      ? 'border-sage-600 text-sage-700'
                      : 'border-transparent text-text hover:text-sage-700 hover:border-sage-200'
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
                propertyId={property.id}
                address={property.address_normalized}
                reports={reports}
                rebuttals={rebuttals}
              />
            </>
          )}

          {/* Rental Experience tab */}
          {activeTab === 'rental' && (
            <LandlordScoreCard
              propertyId={property.id}
              refreshToken={reviewRefreshToken}
              onLoadingChange={setRentalTabLoading}
            />
          )}

          <div className="pt-2">
            <PersistentLandlordPanel
              propertyId={property.id}
              statement={landlordStatement}
              hasReports={reports.length > 0}
              hasReviews={rentalReviewCount > 0}
            />
          </div>
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

      {searched && !loading && jurisdictions && !(activeTab === 'rental' && rentalTabLoading) && (
        <div className="border-t border-border pt-10">
          <JurisdictionLayers
            layers={jurisdictions.layers}
            title="What laws apply to this address?"
            subtitle="SafeSpace layers city, county, state, and federal housing rules so the property record matches the jurisdiction stack behind it."
          />
        </div>
      )}

      {searched && !(activeTab === 'rental' && rentalTabLoading) && (
        <div className="rounded-xl bg-surface-muted p-6">
          <p className="text-sm text-text-muted">
            <strong>Note:</strong> This information is compiled from community reports. Always conduct your own inspection and due diligence before renting.
          </p>
        </div>
      )}
    </div>
  );
}
