import { useState, useEffect, type FormEvent } from 'react';
import { Button, Card, Input, Textarea } from '../../common';
import { ProtectedAction } from '../../auth/ProtectedAction';
import { AddressAutocomplete } from '../AddressAutocomplete';
import { supabase } from '../../../lib/supabase';
import { sendContentNotification } from '../../../lib/contentNotifications';
import { ensureProperty, validateAddress, type AddressValidationResult } from '../../../lib/addressValidation';
import { useAuth } from '../../../contexts/AuthContext';
import type { Landlord } from '../../../types/database';

const RELATIONSHIP_TYPES = [
  { value: 'property_owner', label: 'Landlord', desc: "Owns it, doesn't live there", icon: '🏠' },
  { value: 'management_company', label: 'Management Company', desc: 'Professional firm manages property', icon: '🏢' },
  { value: 'master_tenant', label: 'Master Tenant / Roommate', desc: 'They hold the lease, you sublet or were added', icon: '🔑' },
  { value: 'owner_occupant', label: 'Owner-Occupant', desc: 'Owns it, lives there, rents you a room', icon: '🏡' },
  { value: 'coop', label: 'Co-op / Housing Collective', desc: 'Group governance', icon: '🤝' },
] as const;

const CATEGORIES = [
  { key: 'responsiveness', label: 'Responsiveness', desc: 'Repair speed, returns calls, reachable' },
  { key: 'fairness', label: 'Fairness', desc: 'Rent increases, deposit return, lease terms' },
  { key: 'respect', label: 'Respect', desc: 'Privacy, proper notice, boundaries' },
  { key: 'temperament', label: 'Temperament', desc: 'Emotional stability, courtesy, no threats' },
  { key: 'property_condition', label: 'Property Condition', desc: 'Cleanliness, common areas, pest control' },
  { key: 'communication', label: 'Communication', desc: 'Clear expectations, follow-through' },
  { key: 'safety', label: 'Safety', desc: 'Pets, retaliation, feeling physically safe' },
] as const;

type RatingKey = (typeof CATEGORIES)[number]['key'];

const COMMON_TAGS = [
  'Returned deposit', 'Withheld deposit', 'Entered without notice', 'Retaliatory',
  'Threatened eviction', 'Great landlord', 'Responsive repairs', 'Raised rent unfairly',
];

const MASTER_TENANT_TAGS = [
  'Controlled shared spaces', 'Changed house rules', 'Locked common areas',
  'Had aggressive pet', 'Hoarding/clutter', 'Was dirty', 'Loud/disruptive',
];

const MANAGEMENT_TAGS = [
  'Impossible to reach', 'High turnover staff', 'Hidden fees', 'Lost maintenance requests',
];

const COOP_TAGS = [
  'Cliquish governance', 'Arbitrary rule enforcement', 'Transparent finances', 'Democratic process',
];

const RATING_SCALE = [
  { value: 1, label: 'Very poor' },
  { value: 2, label: 'Poor' },
  { value: 3, label: 'Fair' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Excellent' },
] as const;

interface ReviewFormProps {
  propertyId?: string;
  propertyAddress?: string;
}

export function ReviewForm({ propertyId: initialPropertyId, propertyAddress }: ReviewFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(initialPropertyId ? 2 : 1);
  const [propertyId, setPropertyId] = useState(initialPropertyId || '');
  const [address, setAddress] = useState(propertyAddress || '');
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [landlordName, setLandlordName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [existingLandlords, setExistingLandlords] = useState<Landlord[]>([]);
  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    responsiveness: 0, fairness: 0, respect: 0, temperament: 0,
    property_condition: 0, communication: 0, safety: 0,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch existing landlords when property is set
  useEffect(() => {
    if (!propertyId) return;
    supabase
      .from('landlords')
      .select('*')
      .eq('property_id', propertyId)
      .then(({ data }) => {
        if (data) setExistingLandlords(data);
      });
  }, [propertyId]);

  const handleAddressSearch = async (result: AddressValidationResult) => {
    const prop = await ensureProperty(result);
    setPropertyId(prop.id);
    setAddress(result.normalized);
    setSearchError('');
    setStep(2);
  };

  const handleAddressSubmit = async (inputAddr: string) => {
    setSearchingAddress(true);
    setSearchError('');

    try {
      const result = await validateAddress(inputAddr);
      if (!result.valid) {
        setSearchError('Address not found. Please enter a valid US street address.');
        return;
      }

      await handleAddressSearch(result);
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : 'Unable to validate this address right now. Please try again.',
      );
    } finally {
      setSearchingAddress(false);
    }
  };

  const getTagsForType = () => {
    const tags = [...COMMON_TAGS];
    if (relationshipType === 'master_tenant' || relationshipType === 'owner_occupant') {
      tags.push(...MASTER_TENANT_TAGS);
    }
    if (relationshipType === 'management_company') {
      tags.push(...MANAGEMENT_TAGS);
    }
    if (relationshipType === 'coop') {
      tags.push(...COOP_TAGS);
    }
    return tags;
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const allRated = Object.values(ratings).every((v) => v > 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSubmitting(true);

    try {
      // Find or create landlord
      const landlordPayload = {
        name: landlordName.trim(),
        management_company: relationshipType === 'management_company' ? companyName.trim() || null : null,
        relationship_type: relationshipType,
        property_id: propertyId,
        created_by: user.id,
      };

      let landlordId: string;

      // Check if landlord already exists
      const { data: existing } = await supabase
        .from('landlords')
        .select('id')
        .eq('name', landlordPayload.name)
        .eq('property_id', propertyId)
        .eq('relationship_type', relationshipType)
        .single();

      if (existing) {
        landlordId = existing.id;
      } else {
        const { data: newLandlord, error: landlordErr } = await supabase
          .from('landlords')
          .insert(landlordPayload)
          .select('id')
          .single();
        if (landlordErr) throw landlordErr;
        landlordId = newLandlord.id;
      }

      // Insert review
      const { error: reviewErr } = await supabase.from('rental_reviews').insert({
        property_id: propertyId,
        landlord_id: landlordId,
        reviewer_id: user.id,
        relationship_type: relationshipType,
        ...ratings,
        tags: selectedTags,
        comment: comment.trim() || null,
        is_anonymous: isAnonymous,
      });

      if (reviewErr) {
        if (reviewErr.code === '23505') {
          throw new Error('You have already reviewed this landlord.');
        }
        throw reviewErr;
      }

      void sendContentNotification({
        type: 'review',
        propertyId,
        propertyAddress: address,
        landlordName: landlordPayload.name,
        relationshipType,
        comment: comment.trim() || undefined,
        tags: selectedTags,
        isAnonymous,
        ratings,
      }).catch((notificationError) => {
        console.error('Failed to send review notification', notificationError);
      });

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card variant="success" className="text-center py-10">
        <div className="text-4xl mb-3">✓</div>
        <h3 className="text-xl font-semibold text-sage-800">Review Submitted</h3>
        <p className="mt-2 text-text-muted">
          Thank you for helping future tenants make informed decisions.
        </p>
        {address && (
          <p className="mt-3 text-sm text-sage-600">
            Your review for <strong>{address}</strong> is now visible on the property page.
          </p>
        )}
      </Card>
    );
  }

  const filteredLandlords = existingLandlords.filter(
    (l) => l.name.toLowerCase().includes(landlordName.toLowerCase()) && landlordName.length > 0
  );

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              s <= step ? 'bg-sage-500' : 'bg-sage-100'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Address */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text">Where did you live?</h2>
          <AddressAutocomplete
            onSelect={() => setSearchError('')}
            onSubmit={handleAddressSubmit}
            searching={searchingAddress}
            error={searchError}
            submitLabel="Start Review"
            searchingLabel="Starting..."
            placeholder="Start typing the rental address..."
          />
        </div>
      )}

      {/* Step 2: Relationship Type */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text">Who managed your rental?</h2>
          <p className="text-sm text-text-muted">Select the type that best describes your landlord or manager.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {RELATIONSHIP_TYPES.map((rt) => (
              <Card
                key={rt.value}
                hover
                onClick={() => {
                  setRelationshipType(rt.value);
                  setStep(3);
                }}
                className={`cursor-pointer transition-all ${
                  relationshipType === rt.value
                    ? 'border-sage-500 bg-sage-50 ring-2 ring-sage-400/30'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{rt.icon}</span>
                  <div>
                    <p className="font-semibold text-text">{rt.label}</p>
                    <p className="text-sm text-text-muted mt-0.5">{rt.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
            ← Back
          </Button>
        </div>
      )}

      {/* Step 3: Landlord Name */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text">
            {relationshipType === 'management_company' ? 'Company & contact name' : "What's their name?"}
          </h2>
          {relationshipType === 'management_company' && (
            <Input
              label="Company name"
              placeholder="e.g. Four Star Realty"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          )}
          <div className="relative">
            <Input
              label={relationshipType === 'management_company' ? 'Contact person (optional)' : 'Name'}
              placeholder="e.g. John Smith"
              value={landlordName}
              onChange={(e) => setLandlordName(e.target.value)}
            />
            {filteredLandlords.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-surface shadow-lg">
                {filteredLandlords.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-sage-50 transition-colors"
                    onClick={() => {
                      setLandlordName(l.name);
                      if (l.management_company) setCompanyName(l.management_company);
                    }}
                  >
                    {l.name}
                    {l.management_company && (
                      <span className="text-text-muted ml-1">({l.management_company})</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button
              size="sm"
              onClick={() => setStep(4)}
              disabled={
                relationshipType === 'management_company'
                  ? !companyName.trim()
                  : !landlordName.trim()
              }
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Report Card — 7 category ratings */}
      {step === 4 && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-text">Rate your experience</h2>
          <p className="text-sm text-text-muted">Rate each category from very poor to excellent.</p>

          <div className="grid gap-4 md:grid-cols-2">
            {CATEGORIES.map((cat) => (
              <div key={cat.key} className="space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-text">{cat.label}</p>
                  <p className="text-sm text-text-muted">{cat.desc}</p>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2">
                    {RATING_SCALE.map(({ value, label }) => {
                      const val = value;
                      const isSelected = ratings[cat.key] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setRatings((prev) => ({ ...prev, [cat.key]: val }))
                          }
                          className={`flex h-11 items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-200 ${
                            isSelected
                              ? 'border-sage-600 bg-sage-600 text-white shadow-sm'
                              : 'border-stone-300 bg-stone-100 text-stone-700 hover:border-sage-300 hover:bg-stone-50'
                          }`}
                          aria-label={`${cat.label}: ${label}`}
                          aria-pressed={isSelected}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {RATING_SCALE.map(({ value, label }) => {
                      const isSelected = ratings[cat.key] === value;
                      return (
                        <span
                          key={label}
                          className={`text-center text-sm leading-tight ${
                            isSelected ? 'font-medium text-sage-700' : 'text-text-muted'
                          }`}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
              ← Back
            </Button>
            <Button size="sm" onClick={() => setStep(5)} disabled={!allRated}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Tags */}
      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text">Any of these apply?</h2>
          <p className="text-sm text-text-muted">Select all that fit. These help others quickly understand the situation.</p>
          <div className="flex flex-wrap gap-2">
            {getTagsForType().map((tag) => {
              const selected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all duration-200 ${
                    selected
                      ? 'bg-sage-600 text-white border-sage-600'
                      : 'bg-surface border-border text-text-muted hover:border-sage-300 hover:text-text'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => setStep(4)}>
              ← Back
            </Button>
            <Button size="sm" onClick={() => setStep(6)}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Step 6: Comment */}
      {step === 6 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text">Anything else?</h2>
          <div>
            <Textarea
              placeholder="Anything else future tenants should know?"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              helperText={`${comment.length}/500 characters`}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => setStep(5)}>
              ← Back
            </Button>
            <Button size="sm" onClick={() => setStep(7)}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Step 7: Anonymous toggle + Submit */}
      {step === 7 && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-text">Ready to submit</h2>

          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text">Post anonymously</p>
                <p className="text-sm text-text-muted">Your name won't be shown with the review</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isAnonymous}
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                  isAnonymous ? 'bg-sage-500' : 'bg-sage-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
                    isAnonymous ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {/* Review summary */}
            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-sm text-text-muted">
                <strong>Property:</strong> {address}
              </p>
              <p className="text-sm text-text-muted">
                <strong>Landlord:</strong> {landlordName || companyName}
              </p>
              <p className="text-sm text-text-muted">
                <strong>Overall:</strong>{' '}
                {(Object.values(ratings).reduce((a, b) => a + b, 0) / 7).toFixed(1)} / 5
              </p>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-sage-100 text-sage-700 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => setStep(6)}>
              ← Back
            </Button>
            <ProtectedAction
              fallback={
                <Button size="sm">Sign in to submit review</Button>
              }
            >
              <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </ProtectedAction>
          </div>
        </div>
      )}
    </div>
  );
}
