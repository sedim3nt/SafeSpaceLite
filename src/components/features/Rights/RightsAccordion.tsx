import React, { useState } from 'react';

interface RightSection {
  id: string;
  title: string;
  content: string[];
  laws?: string[];
}

const rightsData: RightSection[] = [
  {
    id: 'habitability',
    title: 'Right to Habitable Living Conditions',
    content: [
      'Your rental must meet basic health and safety standards including working heat, plumbing, electrical, and structural integrity',
      'Boulder landlords must comply with the Boulder Property Maintenance Code (Title 10, Chapter 2) which sets minimum standards for occupied buildings',
      'You cannot waive habitability rights in your lease — any clause purporting to waive these rights is void under Colorado law',
      'If conditions are unlivable and your landlord fails to remedy them, you may break your lease without penalty or pursue rent abatement',
      'The City of Boulder Building Services Division (303-441-3929) can inspect your unit for code violations at no cost to you',
    ],
    laws: ['Colorado Revised Statutes § 38-12-503', 'Boulder Revised Code Title 10, Chapter 2'],
  },
  {
    id: 'repairs',
    title: 'Right to Timely Repairs',
    content: [
      '24-hour emergencies: No heat when outside temp is below 40°F, no running water, gas leaks, sewage backup, electrical hazards',
      '72-hour urgent issues: Mold over 10 sq ft, no hot water, broken exterior door locks, inoperable smoke/CO detectors',
      '7-day repairs: Other habitability issues affecting health or safety',
      '30-day repairs: Non-urgent maintenance such as minor leaks, cosmetic damage, appliance issues',
      'You must notify your landlord in writing (email counts) about repair needs — keep copies of all communications',
      'If your landlord fails to repair within the required timeframe, contact Boulder Housing Authority at (303) 441-3929',
    ],
    laws: ['C.R.S. § 38-12-505', 'Boulder Housing Code'],
  },
  {
    id: 'mold',
    title: 'Mold Disclosure and Remediation Rights',
    content: [
      'Landlords must disclose known mold issues before you sign a lease — failure to disclose is a violation of Colorado law',
      'Mold over 10 square feet requires professional remediation by a licensed contractor',
      'You can request mold testing at landlord\'s expense if you experience health issues (respiratory problems, allergic reactions)',
      'Landlords cannot retaliate against you for reporting mold — retaliation is a separate legal violation',
      'Document all mold with dated photos, keep medical records, and save all written communication with your landlord',
      'Boulder County Health Department (303-441-3460) can advise on mold-related health concerns',
    ],
    laws: ['C.R.S. § 38-12-1001 to 1004', 'Boulder Mold Ordinance'],
  },
  {
    id: 'retaliation',
    title: 'Protection from Retaliation',
    content: [
      'Landlords cannot retaliate for: reporting code violations, joining tenant unions, exercising legal rights, or contacting city inspectors',
      'Retaliation includes: eviction notices, rent increases, reducing services, harassment, refusing to renew your lease',
      'Any adverse action within 6 months of your complaint is legally presumed to be retaliatory — the burden of proof shifts to the landlord',
      'You can sue for actual damages, attorney fees, and up to 2 months\' rent if retaliation occurs',
      'Keep detailed records: save texts, emails, take notes on verbal conversations with dates and times',
    ],
    laws: ['C.R.S. § 38-12-509'],
  },
  {
    id: 'privacy',
    title: 'Right to Privacy and Quiet Enjoyment',
    content: [
      'Landlords must give at least 24-hour written notice before entering your unit (except in genuine emergencies)',
      'Entry must be at reasonable times (generally 8am-6pm) and for legitimate purposes (repairs, inspections, showings)',
      'You can refuse entry if proper notice was not given — document any unauthorized entry attempts',
      'Landlords cannot use excessive entry requests as a form of harassment or pressure',
      'If your landlord enters without proper notice, document it and file a complaint with Boulder Housing Authority',
    ],
    laws: ['C.R.S. § 38-12-1001', 'Common Law Right to Quiet Enjoyment'],
  },
  {
    id: 'deposit',
    title: 'Security Deposit Rights',
    content: [
      'Security deposits cannot exceed 2 months\' rent under Colorado law',
      'Landlords must return your deposit within 30 days of move-out (or 60 days if stated in your lease, up to a maximum of 60)',
      'An itemized list of all deductions must be provided — vague deductions like "cleaning" without specifics are not valid',
      'Normal wear and tear (scuff marks, minor nail holes, faded paint) cannot be deducted',
      'If your landlord wrongfully withholds your deposit, you can sue for up to 3x the withheld amount plus attorney fees',
      'Take timestamped photos/video of your unit when moving in and out — do a walkthrough with your landlord if possible',
    ],
    laws: ['C.R.S. § 38-12-103'],
  },
];

export const RightsAccordion: React.FC = () => {
  const [openSections, setOpenSections] = useState<string[]>(['habitability']);

  const toggleSection = (id: string) => {
    setOpenSections(prev =>
      prev.includes(id)
        ? prev.filter(sectionId => sectionId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-2">
      {rightsData.map((section) => (
        <div key={section.id} className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full px-4 py-3 sm:px-6 sm:py-4 text-left flex items-center justify-between hover:bg-surface-muted transition-colors"
          >
            <h3 className="text-base font-medium text-gray-900 sm:text-lg pr-2">{section.title}</h3>
            <svg
              className={`h-5 w-5 text-gray-500 transform transition-transform ${
                openSections.includes(section.id) ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {openSections.includes(section.id) && (
            <div className="px-4 pb-4 sm:px-6">
              <ul className="space-y-2">
                {section.content.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-teal-600 mr-2">•</span>
                    <span className="text-text">{item}</span>
                  </li>
                ))}
              </ul>
              
              {section.laws && (
                <div className="mt-4 p-3 bg-gray-100 rounded">
                  <p className="text-sm font-medium text-text">Relevant Laws:</p>
                  <p className="text-sm text-text-muted">{section.laws.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};