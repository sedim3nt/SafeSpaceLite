import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { Button, Card, Input, Textarea, Select } from '../components/common';
import { AddressAutocomplete } from '../components/features/AddressAutocomplete';
import { getCityBySlug, getCityDeadlineInfo } from '../data/cityRegistry';
import { validateAddress } from '../lib/addressValidation';

const issueTypes = [
  { value: 'no-heat', label: 'No Heat (Emergency)' },
  { value: 'no-water', label: 'No Running Water (Emergency)' },
  { value: 'gas-leak', label: 'Gas Leak / Carbon Monoxide (Emergency)' },
  { value: 'sewage', label: 'Sewage Backup (Emergency)' },
  { value: 'mold', label: 'Mold (Urgent)' },
  { value: 'no-hot-water', label: 'No Hot Water (Urgent)' },
  { value: 'electrical', label: 'Electrical Issue (Standard)' },
  { value: 'plumbing', label: 'Plumbing Issue (Standard)' },
  { value: 'structural', label: 'Structural Issue (Standard)' },
  { value: 'pests', label: 'Pest Infestation (Standard)' },
  { value: 'other', label: 'Other Habitability Issue (Standard)' },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function generatePDF(data: {
  tenantName: string;
  address: string;
  landlordName: string;
  issueType: string;
  description: string;
  dateNoticed: string;
  citySlug: string;
}) {
  const deadline = getCityDeadlineInfo(data.citySlug, data.issueType);
  const city = getCityBySlug(data.citySlug);
  const issueLabel = issueTypes.find(t => t.value === data.issueType)?.label || data.issueType;
  const today = new Date();
  const deadlineDate = new Date(today.getTime() + deadline.hours * 60 * 60 * 1000);

  const cityState = city ? `${city.name}, ${city.stateCode}` : 'your jurisdiction';
  const primaryLawName = city?.keyLaws[0]?.name || 'applicable tenant protection law';

  const doc = new jsPDF();
  const margin = 25;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const addText = (text: string, fontSize: number, bold = false, spacing = 7) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += spacing;
    }
  };

  addText('NOTICE OF HEALTH & SAFETY VIOLATION', 16, true, 10);
  addText('AND DEMAND FOR REPAIR', 14, true, 12);
  y += 5;

  addText(`Date: ${formatDate(today)}`, 11, false);
  y += 3;

  addText(`To: ${data.landlordName}`, 11, false);
  addText(`Property: ${data.address}`, 11, false);
  addText(`From: ${data.tenantName}`, 11, false);
  y += 5;

  addText('Dear Property Owner/Manager,', 11, false, 8);
  y += 3;

  addText(
    `This letter serves as formal written notice of a health and safety violation at the above-referenced property, as required under ${cityState} law. This notice is being provided pursuant to ${deadline.statute} and the ${primaryLawName}.`,
    11, false, 6
  );
  y += 5;

  addText('NATURE OF THE ISSUE', 12, true, 8);
  addText(`Issue Type: ${issueLabel}`, 11, false);
  addText(`Date First Noticed: ${data.dateNoticed ? formatDate(new Date(data.dateNoticed)) : 'See description'}`, 11, false);
  y += 3;
  addText(`Description: ${data.description}`, 11, false, 6);
  y += 5;

  addText('LEGAL REQUIREMENTS', 12, true, 8);
  addText(
    `Under ${deadline.statute}, you are required to address this issue within ${deadline.label} of receiving this notice. The legal deadline for response is ${formatDate(deadlineDate)}.`,
    11, false, 6
  );
  y += 3;

  if (city) {
    for (const law of city.keyLaws.slice(0, 2)) {
      addText(`${law.citation}: ${law.summary}`, 10, false, 6);
      y += 2;
    }
  }
  y += 5;

  addText('TENANT REMEDIES', 12, true, 8);
  addText(
    'Please be advised that if this issue is not remedied within the statutory timeframe, I may exercise the following remedies available under law:',
    11, false, 6
  );
  y += 2;
  const remedies = [
    '1. Repair and deduct: Make necessary repairs and deduct the cost from rent',
    '2. Rent withholding: Withhold rent until repairs are completed',
    '3. Lease termination: Terminate the lease agreement without penalty',
    '4. Legal action: Pursue damages through the courts, including recovery of attorney fees',
  ];
  for (const remedy of remedies) {
    addText(remedy, 10, false, 6);
  }
  y += 5;

  addText('REQUEST FOR ACTION', 12, true, 8);
  addText(
    `I respectfully request that you take immediate action to address this issue by ${formatDate(deadlineDate)}. Please contact me to schedule any necessary inspections or repairs.`,
    11, false, 6
  );
  y += 5;

  addText(
    'This notice is being retained for my records and may be presented as evidence if further action becomes necessary.',
    11, false, 6
  );
  y += 10;

  addText('Sincerely,', 11, false, 10);
  addText(data.tenantName, 11, true, 7);
  addText(`Date: ${formatDate(today)}`, 11, false);

  y += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  addText(
    `Generated by SafeSpace — Protecting Renters' Health & Safety. This document is for informational purposes and does not constitute legal advice.`,
    9, false, 5
  );

  doc.save(`legal-notice-${today.toISOString().split('T')[0]}.pdf`);
}

export function LegalNoticePage() {
  const [searchParams] = useSearchParams();
  const cityParam = searchParams.get('city') || 'boulder';
  const addressParam = searchParams.get('address') || '';

  const [form, setForm] = useState({
    tenantName: '',
    address: addressParam,
    landlordName: '',
    issueType: '',
    description: '',
    dateNoticed: '',
    citySlug: cityParam,
  });
  const [generated, setGenerated] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [addressHelp, setAddressHelp] = useState('');

  const city = getCityBySlug(form.citySlug);

  const updateField = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const canGenerate = form.tenantName && form.address && form.landlordName && form.issueType && form.description;

  const handleGenerate = () => {
    if (!canGenerate) return;
    generatePDF(form);
    setGenerated(true);
  };

  const handleAddressSubmit = async (inputAddress: string) => {
    setSearchingAddress(true);
    setAddressError('');
    setAddressHelp('');

    try {
      const result = await validateAddress(inputAddress);

      if (!result.valid) {
        setAddressError('Address not found. Please enter a valid U.S. street address.');
        return;
      }

      if (!result.citySlug) {
        setAddressError(`SafeSpace does not yet have a legal notice template for ${result.address.city}, ${result.address.state}.`);
        return;
      }

      const citySlug = result.citySlug;
      const matchedCity = getCityBySlug(citySlug);
      setForm((prev) => ({
        ...prev,
        address: result.normalized,
        citySlug,
      }));

      if (matchedCity) {
        setAddressHelp(`Address verified. Jurisdiction set to ${matchedCity.name}, ${matchedCity.stateCode}.`);
      }
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : 'Unable to validate this address right now.');
    } finally {
      setSearchingAddress(false);
    }
  };

  const deadlineInfo = form.issueType ? getCityDeadlineInfo(form.citySlug, form.issueType) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ink">Legal Notice Generator</h1>
        <p className="mt-2 text-lg text-text-muted">
          Generate a professional legal notice citing {city ? `${city.name}, ${city.stateCode}` : 'local'} tenant protection laws.
        </p>
      </div>

      <Card>
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text">Property Address</label>
            <AddressAutocomplete
              initialValue={form.address}
              onChangeQuery={(value) => updateField('address', value)}
              autoSubmitOnSelect
              onSelect={() => {
                setAddressError('');
                setAddressHelp('');
              }}
              onSubmit={handleAddressSubmit}
              searching={searchingAddress}
              error={addressError}
              placeholder="Start typing the rental address..."
              showSubmitButton={false}
            />
            {addressHelp && (
              <p className="text-sm text-sage-700">{addressHelp}</p>
            )}
          </div>

          <Input
            label="Your Full Name"
            placeholder="Jane Doe"
            value={form.tenantName}
            onChange={e => updateField('tenantName', e.target.value)}
            required
          />

          <Input
            label="Landlord / Property Manager Name"
            placeholder="Acme Property Management"
            value={form.landlordName}
            onChange={e => updateField('landlordName', e.target.value)}
            required
          />

          <Select
            label="Issue Type"
            options={issueTypes}
            value={form.issueType}
            onChange={e => updateField('issueType', e.target.value)}
            required
          />

          {deadlineInfo && (
            <div className="rounded-md border border-sage-200 bg-sage-50 p-4">
              <p className="text-sm font-medium text-sage-800">
                Legal deadline: <strong>{deadlineInfo.label}</strong> ({deadlineInfo.statute})
              </p>
            </div>
          )}

          <Input
            label="Date Issue Was First Noticed"
            type="date"
            value={form.dateNoticed}
            onChange={e => updateField('dateNoticed', e.target.value)}
          />

          <Textarea
            label="Description of the Issue"
            placeholder="Describe the health or safety issue in detail, including its location, duration, and any impact on your health..."
            value={form.description}
            onChange={e => updateField('description', e.target.value)}
            maxLength={3000}
            required
          />
          <p className="text-sm text-text-muted">{form.description.length}/3000 characters</p>

          <Button onClick={handleGenerate} fullWidth disabled={!canGenerate}>
            Generate Legal Notice (PDF)
          </Button>

          {generated && (
            <div className="rounded-md border border-sage-200 bg-sage-50 p-4 text-center">
              <p className="font-medium text-sage-800">PDF downloaded successfully.</p>
              <p className="mt-1 text-sm text-sage-700">
                Print and deliver to your landlord via certified mail or hand delivery with a witness.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-surface-muted">
        <h3 className="mb-3 text-lg font-semibold text-ink">Tips for Effective Notice</h3>
        <ul className="space-y-2 text-sm text-text-muted">
          <li className="flex gap-2">
            <span className="text-bamboo-600 font-bold">1.</span>
            <span>Send via certified mail with return receipt for proof of delivery</span>
          </li>
          <li className="flex gap-2">
            <span className="text-bamboo-600 font-bold">2.</span>
            <span>Keep a copy of the notice and all photographs for your records</span>
          </li>
          <li className="flex gap-2">
            <span className="text-bamboo-600 font-bold">3.</span>
            <span>Follow up in writing if the landlord does not respond by the deadline</span>
          </li>
          <li className="flex gap-2">
            <span className="text-bamboo-600 font-bold">4.</span>
            <span>Contact a local tenant legal aid service if you need additional help</span>
          </li>
        </ul>
      </Card>

      <div className="rounded-md border border-bamboo-200 bg-bamboo-50 p-4">
        <p className="text-sm text-bamboo-800">
          <strong>Disclaimer:</strong> This tool generates a template notice for informational purposes only.
          It does not constitute legal advice. For specific legal guidance, consult with a qualified attorney.
        </p>
      </div>
    </div>
  );
}
