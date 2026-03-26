import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Input, Textarea, Select } from '../../common/Form';
import { Button, Card } from '../../common';
import { useSubmitReport } from '../../../hooks';
import { useFormBehavior } from '../../../hooks/useFormBehavior';
import { ConnectWallet } from '../Wallet/ConnectWallet';

interface ReportFormData {
  propertyAddress: string;
  issueType: string;
  description: string;
  dateOccurred: string;
  landlordNotified: boolean;
  dateNotified: string;
  anonymous: boolean;
  contactEmail?: string;
}

function parseSubmitError(error: Error): string {
  const msg = error.message || '';
  if (msg.includes('Cooldown active'))
    return 'You can submit another report in 24 hours. Please check back tomorrow.';
  if (msg.includes('Max reports reached'))
    return 'You have reached the maximum number of reports for this property (5). This limit helps prevent spam.';
  if (msg.includes('Arweave hash required'))
    return 'Report data is missing. Please fill out all required fields.';
  if (msg.includes('User rejected') || msg.includes('user rejected'))
    return 'Submission was cancelled.';
  return 'Something went wrong. Please try again later.';
}

export const ReportForm: React.FC = () => {
  const { authenticated } = usePrivy();
  const { submitReport, isPending, isConfirming, isSuccess, error } = useSubmitReport();
  const { isHumanLikely, onKeyActivity } = useFormBehavior();

  const [formData, setFormData] = useState<ReportFormData>({
    propertyAddress: '',
    issueType: '',
    description: '',
    dateOccurred: '',
    landlordNotified: false,
    dateNotified: '',
    anonymous: true,
    contactEmail: '',
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // When tx confirms, show success
  useEffect(() => {
    if (isSuccess) setSubmitted(true);
  }, [isSuccess]);

  const issueTypes = [
    { value: 'mold', label: 'Mold/Moisture' },
    { value: 'heating', label: 'Heating/Cooling' },
    { value: 'plumbing', label: 'Plumbing/Water' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'structural', label: 'Structural Damage' },
    { value: 'pests', label: 'Pest Infestation' },
    { value: 'carbon-monoxide', label: 'Carbon Monoxide/Gas' },
    { value: 'other', label: 'Other Health/Safety Issue' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build a content hash from the report data
    // MVP: encode report as JSON string for the arweaveHash field
    // Production: upload to Arweave first, use the returned tx hash
    const reportPayload = JSON.stringify({
      address: formData.propertyAddress,
      issue: formData.issueType,
      description: formData.description,
      dateOccurred: formData.dateOccurred,
      landlordNotified: formData.landlordNotified,
      dateNotified: formData.dateNotified,
      photoCount: photos.length,
      timestamp: Date.now(),
    });

    submitReport({
      propertyAddress: formData.propertyAddress,
      issueType: formData.issueType,
      severity: 2, // Standard by default for MVP
      arweaveHash: reportPayload,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  if (submitted) {
    return (
      <Card className="py-12 text-center">
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Report Submitted Successfully</h2>
          <p className="text-text-muted">
            Your report has been submitted and recorded on-chain.
          </p>
          <p className="text-sm text-gray-500">
            It is intended to remain publicly viewable, though availability can depend on external networks and providers.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                propertyAddress: '',
                issueType: '',
                description: '',
                dateOccurred: '',
                landlordNotified: false,
                dateNotified: '',
                anonymous: true,
                contactEmail: '',
              });
              setPhotos([]);
            }}
          >
            Submit Another Report
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={onKeyActivity} className="space-y-6">
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Property Information</h3>
        <Input
          label="Property Address"
          type="text"
          required
          value={formData.propertyAddress}
          onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
          placeholder="1234 Pearl St, Boulder, CO 80302"
        />
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Issue Details</h3>
        <div className="space-y-4">
          <Select
            label="Type of Issue"
            required
            options={issueTypes}
            value={formData.issueType}
            onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
          />

          <Textarea
            label="Description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Please describe the health/safety issue in detail..."
            rows={6}
          />

          <Input
            label="When did this issue occur/start?"
            type="date"
            required
            value={formData.dateOccurred}
            onChange={(e) => setFormData({ ...formData, dateOccurred: e.target.value })}
          />

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="landlord-notified"
                checked={formData.landlordNotified}
                onChange={(e) => setFormData({ ...formData, landlordNotified: e.target.checked })}
                className="text-brand-600 focus:ring-brand-500 h-4 w-4 rounded border-border"
              />
              <label htmlFor="landlord-notified" className="text-sm text-text">
                I have already notified my landlord about this issue
              </label>
            </div>

            {formData.landlordNotified && (
              <Input
                label="Date landlord was notified"
                type="date"
                value={formData.dateNotified}
                onChange={(e) => setFormData({ ...formData, dateNotified: e.target.value })}
              />
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Photo Evidence</h3>
        <div className="space-y-4">
          <div className="flex w-full items-center justify-center">
            <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-muted hover:bg-surface-muted">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="mb-3 h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </label>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Evidence ${index + 1}`}
                    className="h-32 w-full rounded object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Submission Options</h3>
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 mb-4">
          <p className="text-sm text-amber-800">
            <strong>How your report is stored:</strong> Reports are recorded on a public blockchain. While your identity can be hidden, report content is publicly visible. This transparency helps hold landlords accountable, but please don't include sensitive personal information in your description.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.anonymous}
              onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
              className="text-brand-600 focus:ring-brand-500 h-4 w-4 rounded border-border"
            />
            <label htmlFor="anonymous" className="text-sm text-text">
              Hide my display name on this report
            </label>
          </div>
          <p className="text-xs text-text-muted ml-6">
            Your name won't be shown, but report details are stored on a public blockchain and are visible to anyone.
          </p>

          {!formData.anonymous && (
            <Input
              label="Contact Email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="your@email.com"
              helperText="We'll only use this to follow up on your report"
            />
          )}
        </div>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{parseSubmitError(error)}</p>
        </Card>
      )}

      {isPending && (
        <Card className="border-yellow-200 bg-yellow-50">
          <p className="text-sm text-yellow-800">Confirming your submission...</p>
        </Card>
      )}

      {isConfirming && (
        <Card className="border-blue-200 bg-blue-50">
          <p className="text-sm text-blue-800">Saving your report...</p>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        {!authenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Sign in to submit</span>
            <ConnectWallet />
          </div>
        ) : (
          <>
            <Button type="submit" disabled={isPending || isConfirming || !isHumanLikely}>
              {isPending ? 'Confirming...' : isConfirming ? 'Submitting...' : 'Submit Report'}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};
