import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Card, Input, Textarea, Select } from '../components/common';
import { ProtectedAction } from '../components/auth/ProtectedAction';
import { AddressAutocomplete } from '../components/features/AddressAutocomplete';
import { useAuth } from '../contexts/AuthContext';
import { useFormBehavior } from '../hooks';
import { supabase } from '../lib/supabase';
import { validateAddress, ensureProperty, parseSingleLineAddress } from '../lib/addressValidation';
import type { Database } from '../types/database';

/** Strip EXIF metadata by re-encoding the image through a canvas */
function stripExif(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Failed to encode image')),
        'image/jpeg',
        0.9,
      );
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

function getEvidenceExtension(file: File) {
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

function getEvidenceKind(file: File) {
  const lowerName = file.name.toLowerCase();
  if (file.type === 'application/pdf' || lowerName.endsWith('.pdf')) return 'pdf';
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    lowerName.endsWith('.docx')
  ) {
    return 'docx';
  }
  if (file.type.startsWith('image/')) return 'image';
  return 'unknown';
}

const issueTypes = [
  { value: 'mold', label: 'Mold' },
  { value: 'radon', label: 'Radon' },
  { value: 'carbon-monoxide', label: 'Carbon Monoxide' },
  { value: 'heating', label: 'Heating / No Heat' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'structural', label: 'Structural' },
  { value: 'pests', label: 'Pests' },
  { value: 'other', label: 'Other' },
];

const severityOptions = [
  { value: 'emergency_24h', label: '24-Hour Emergency (no heat, gas leak, sewage)' },
  { value: 'urgent_72h', label: '72-Hour Urgent (mold > 10 sq ft, no hot water)' },
  { value: 'standard', label: 'Standard (7–30 day repair window)' },
];

const evidenceTierOptions = [
  { value: 'narrative_only', label: 'Level 1: Narrative only' },
  { value: 'photo_documentation', label: 'Level 2: Photo or document evidence' },
  { value: 'third_party_test', label: 'Level 3: Third-party test or inspection' },
  { value: 'official_finding', label: 'Level 4: Official agency finding' },
];

function EvidenceTierGuide() {
  return (
    <Card className="h-full border-border bg-surface p-5">
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-ink">How SafeSpace grades evidence</h3>
          <p className="text-sm text-text-muted">
            Choose the strongest support you have today so readers can judge certainty and urgency correctly.
          </p>
        </div>
        <div className="space-y-2 text-sm text-text-muted">
          <p><strong className="text-text">Level 1:</strong> narrative only.</p>
          <p><strong className="text-text">Level 2:</strong> photos, screenshots, receipts, or documents.</p>
          <p><strong className="text-text">Level 3:</strong> third-party tests or inspections.</p>
          <p><strong className="text-text">Level 4:</strong> official agency notice, citation, or written finding.</p>
        </div>
      </div>
    </Card>
  );
}

function normalizeAddressPart(value: string) {
  return value.replace(/\./g, '').replace(/\s+/g, ' ').trim().toUpperCase();
}

function shouldConfirmValidatedAddress(original: string, normalized: string) {
  const parsedOriginal = parseSingleLineAddress(original);
  const parsedNormalized = parseSingleLineAddress(normalized);

  if (!parsedOriginal || !parsedNormalized) {
    return normalizeAddressPart(original) !== normalizeAddressPart(normalized);
  }

  return (
    normalizeAddressPart(parsedOriginal.streetAddress) !== normalizeAddressPart(parsedNormalized.streetAddress) ||
    normalizeAddressPart(parsedOriginal.city) !== normalizeAddressPart(parsedNormalized.city) ||
    normalizeAddressPart(parsedOriginal.state) !== normalizeAddressPart(parsedNormalized.state)
  );
}

export function ReportPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isHumanLikely, onKeyActivity, honeypot, setHoneypot } = useFormBehavior();

  const [form, setForm] = useState({
    address: searchParams.get('address') ?? '',
    issueType: '',
    severity: '',
    description: '',
    evidenceTier: 'narrative_only',
    evidenceDetails: '',
    dateOccurred: '',
    landlordNotified: false,
    dateNotified: '',
    isAnonymous: true,
  });
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submittedPropertyId, setSubmittedPropertyId] = useState<string | null>(null);
  const [addressSearching, setAddressSearching] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [validatedAddressSuggestion, setValidatedAddressSuggestion] = useState<{
    original: string;
    normalized: string;
  } | null>(null);

  // Severity color-shift: set data attribute on body
  useEffect(() => {
    if (form.severity) {
      document.body.setAttribute('data-severity', form.severity);
    } else {
      document.body.removeAttribute('data-severity');
    }
    return () => {
      document.body.removeAttribute('data-severity');
    };
  }, [form.severity]);

  const updateField = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((file) => {
      const evidenceKind = getEvidenceKind(file);
      return file.size <= 5 * 1024 * 1024 && evidenceKind !== 'unknown';
    });
    setEvidenceFiles((prev) => [...prev, ...valid].slice(0, 4));
  };

  const removePhoto = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddressLookup = async (address: string) => {
    setAddressSearching(true);
    setAddressError('');
    setError('');

    try {
      const validationResult = await validateAddress(address);
      if (!validationResult.valid) {
        setAddressError('Address not found. Please enter a valid U.S. street address.');
        return;
      }

      updateField('address', validationResult.normalized);
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : 'Unable to validate this address right now.');
    } finally {
      setAddressSearching(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !isHumanLikely) return;

    setSubmitting(true);
    setError('');

    try {
      // Validate address through the configured provider
      const validationResult = await validateAddress(form.address);
      if (!validationResult.valid) {
        setError('Address not found. Please enter a valid street address.');
        return;
      }
      if (!validationResult.supportedCity) {
        setError(`This address is in ${validationResult.address.city}, ${validationResult.address.state}. SafeSpace doesn't cover this area yet.`);
        return;
      }
      if (shouldConfirmValidatedAddress(form.address, validationResult.normalized)) {
        setValidatedAddressSuggestion({
          original: form.address,
          normalized: validationResult.normalized,
        });
        setError('');
        return;
      }
      setValidatedAddressSuggestion(null);

      // Find or create property using the canonical normalized address
      const property = await ensureProperty(validationResult);

      // Upload evidence files to Supabase Storage (EXIF stripped for images)
      const photoUrls: string[] = [];
      for (const file of evidenceFiles) {
        const evidenceKind = getEvidenceKind(file);
        const uploadBody = evidenceKind === 'image' ? await stripExif(file) : file;
        const extension = getEvidenceExtension(file);
        const contentType = evidenceKind === 'pdf'
          ? 'application/pdf'
          : evidenceKind === 'docx'
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : file.type === 'image/png'
            ? 'image/png'
            : file.type === 'image/webp'
              ? 'image/webp'
              : 'image/jpeg';
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
        const { error: uploadErr } = await supabase.storage
          .from('evidence')
          .upload(path, uploadBody, { contentType });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from('evidence').getPublicUrl(path);
          photoUrls.push(urlData.publicUrl);
        }
      }

      // Insert the report
      const reportPayload: Database['public']['Tables']['reports']['Insert'] = {
        property_id: property.id,
        reporter_id: user.id,
        issue_type: form.issueType,
        severity: form.severity,
        description: form.description.trim(),
        evidence_tier: form.evidenceTier,
        evidence_details: form.evidenceDetails.trim() || null,
        issue_started_at: form.dateOccurred || null,
        landlord_notified_at: form.landlordNotified ? (form.dateNotified || null) : null,
        photo_urls: photoUrls.length > 0 ? photoUrls : null,
        is_anonymous: form.isAnonymous,
      };

      const { error: reportErr } = await supabase.from('reports').insert(reportPayload);

      if (reportErr) throw reportErr;
      setSubmittedPropertyId(property.id);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <Card variant="success" className="text-center">
          <div className="space-y-4 py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
              <svg className="h-8 w-8 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-sage-800">Report Submitted</h2>
            <p className="text-sage-700">
              Your report has been recorded. This helps other tenants and builds a record of property conditions.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Link to={submittedPropertyId ? `/property/${submittedPropertyId}` : '/property-lookup'}>
                <Button variant="secondary">View Property</Button>
              </Link>
              <Link to={`/legal-notice?address=${encodeURIComponent(form.address)}`}>
                <Button>Generate Legal Notice</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ink">Report a Health or Safety Issue</h1>
        <p className="mt-2 text-lg text-text-muted">
          Document violations to build a community record and protect future tenants.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="h-full border-border bg-surface p-5">
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-ink">Before You Report</h3>
              <p className="text-sm text-text-muted">
                Build the cleanest record you can before you publish. That makes the report more useful and easier to defend.
              </p>
            </div>
            <div className="space-y-2 text-sm text-text-muted">
              <p>Take photos and gather documentation first.</p>
              <p>Notify your landlord in writing when possible.</p>
              <p>
                Use the <Link to="/legal-notice" className="underline underline-offset-2">Legal Notice Generator</Link> if you need a formal notice.
              </p>
              <p>Anonymous posting hides your name publicly, but your account is still used for moderation.</p>
            </div>
          </div>
        </Card>
        <EvidenceTierGuide />
      </div>

      <ProtectedAction>
        <Card>
          <form onSubmit={handleSubmit} onKeyDown={onKeyActivity} className="space-y-6">
            {/* Honeypot field — hidden from real users, catches bots */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0 }}>
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">Property Address</label>
              <AddressAutocomplete
                initialValue={form.address}
                onChangeQuery={(value) => updateField('address', value)}
                autoSubmitOnSelect
                onSelect={(address) => {
                  updateField('address', address);
                  setAddressError('');
                }}
                onSubmit={handleAddressLookup}
                searching={addressSearching}
                error={addressError}
                placeholder="Start typing the property address..."
                showSubmitButton={false}
              />
              {validatedAddressSuggestion && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-medium text-amber-950">Review the validated address before you post.</p>
                  <p className="mt-2">
                    You entered <strong>{validatedAddressSuggestion.original}</strong>, but SafeSpace validated this as{' '}
                    <strong>{validatedAddressSuggestion.normalized}</strong>.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        updateField('address', validatedAddressSuggestion.normalized);
                        setValidatedAddressSuggestion(null);
                        setAddressError('');
                      }}
                    >
                      Use Validated Address
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setValidatedAddressSuggestion(null)}
                    >
                      Keep Editing
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Select
                label="Issue Type"
                options={issueTypes}
                value={form.issueType}
                onChange={e => updateField('issueType', e.target.value)}
                required
              />

              <Select
                label="Severity"
                options={severityOptions}
                value={form.severity}
                onChange={e => updateField('severity', e.target.value)}
                required
              />
            </div>

            {form.severity && (
              <div className={`rounded-md p-3 text-sm transition-colors duration-500 ${
                form.severity === 'emergency_24h'
                  ? 'bg-danger-bg text-danger border border-red-200'
                  : form.severity === 'urgent_72h'
                    ? 'bg-bamboo-50 text-bamboo-800 border border-bamboo-200'
                    : 'bg-sage-50 text-sage-700 border border-sage-200'
              }`}>
                {form.severity === 'emergency_24h' && 'This requires landlord response within 24 hours by law.'}
                {form.severity === 'urgent_72h' && 'This requires landlord response within 72 hours by law.'}
                {form.severity === 'standard' && 'Standard repair window of 7–30 days applies.'}
              </div>
            )}

            <Textarea
              label="Description"
              placeholder="Describe the issue in detail. Include location within the unit, how long it's been occurring, and any health effects..."
              value={form.description}
              onChange={e => updateField('description', e.target.value)}
              maxLength={5000}
              required
            />
            <p className="text-sm text-text-muted">{form.description.length}/5000 characters</p>

            <div className="grid gap-6 md:grid-cols-2">
              <Select
                label="Evidence Level"
                options={evidenceTierOptions}
                value={form.evidenceTier}
                onChange={e => updateField('evidenceTier', e.target.value)}
                required
              />

              <Input
                label="When did this issue start?"
                type="date"
                value={form.dateOccurred}
                onChange={e => updateField('dateOccurred', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Textarea
                label="Evidence Notes (optional)"
                placeholder="Summarize what backs up this report: photos taken today, repair request emails, inspector visit, test results pending, or neighbors who witnessed the issue."
                value={form.evidenceDetails}
                onChange={e => updateField('evidenceDetails', e.target.value)}
                maxLength={500}
              />
              <p className="text-sm text-text-muted">{form.evidenceDetails.length}/500 characters</p>
            </div>

            <div className="space-y-3 rounded-md border border-border p-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.landlordNotified}
                  onChange={e => updateField('landlordNotified', e.target.checked)}
                  className="h-4 w-4 rounded border-border text-sage-600 focus:ring-sage-500"
                />
                <span className="text-sm text-text">I have already notified my landlord about this issue</span>
              </label>

              {form.landlordNotified && (
                <Input
                  label="Date landlord was notified"
                  type="date"
                  value={form.dateNotified}
                  onChange={e => updateField('dateNotified', e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text">
                Evidence Uploads (up to 4 files, images, PDF, or DOCX, 5 MB each)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                multiple
                onChange={handlePhotoChange}
                className="block w-full text-sm text-text-muted file:mr-4 file:rounded-md file:border-0 file:bg-sage-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-sage-700 hover:file:bg-sage-100"
              />
              {evidenceFiles.length > 0 && (
                <div className="flex gap-3 pt-2">
                  {evidenceFiles.map((file, i) => (
                    <div key={i} className="relative">
                      {getEvidenceKind(file) === 'image' ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${i + 1}`}
                          className="h-20 w-20 rounded-md object-cover border border-border"
                        />
                      ) : (
                        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-md border border-border bg-surface-muted text-center">
                          <span className="text-xs font-semibold text-danger">
                            {getEvidenceKind(file).toUpperCase()}
                          </span>
                          <span className="mt-1 px-1 text-[10px] leading-tight text-text-muted">
                            {file.name}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-sm text-white"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isAnonymous}
                onChange={e => updateField('isAnonymous', e.target.checked)}
                className="h-4 w-4 rounded border-border text-sage-600 focus:ring-sage-500"
              />
              <span className="text-sm text-text">Submit anonymously</span>
            </label>

            {error && <p className="text-sm text-danger">{error}</p>}

            {!isHumanLikely && (
              <p className="text-sm text-text-muted">
                Please take a moment to fill out the form. Submissions are available after a brief delay.
              </p>
            )}

            <Button type="submit" fullWidth disabled={submitting || !isHumanLikely}>
              {submitting ? 'Submitting Report...' : 'Submit Report'}
            </Button>
          </form>
        </Card>
      </ProtectedAction>

      <div className="rounded-md bg-surface-muted p-6">
        <p className="text-sm text-text-muted">
          <strong>Privacy:</strong> Anonymous reports do not display your identity. Your account is
          used only to prevent abuse. Reports are publicly visible to help other renters research properties.
        </p>
      </div>
    </div>
  );
}
