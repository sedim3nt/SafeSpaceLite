import type { EmergencyContact } from '../types';

export interface CityDeadlines {
  emergency: { hours: number; label: string };
  urgent: { hours: number; label: string };
  standard: { hours: number; label: string };
}

export interface CityLaw {
  name: string;
  citation: string;
  summary: string;
}

export interface CityEnforcementOffice {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  hours?: string;
}

export interface CityRight {
  title: string;
  content: string[];
  laws: string[];
}

export interface CityEntry {
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  population: number;
  renterPercent: number;
  university: { name: string; students: number };
  anonymousReporting: boolean;
  mandatoryInspections: boolean;
  mandatoryInspectionsDescription?: string;
  coordinates: [number, number]; // [lng, lat]
  deadlines: CityDeadlines;
  keyLaws: CityLaw[];
  enforcement: {
    healthDept: CityEnforcementOffice;
    codeEnforcement: CityEnforcementOffice;
  };
  emergencyContacts: EmergencyContact[];
  rights: CityRight[];
}

const cities: CityEntry[] = [
  // ── Boulder, CO ──
  {
    slug: 'boulder',
    name: 'Boulder',
    state: 'Colorado',
    stateCode: 'CO',
    population: 105_000,
    renterPercent: 60,
    university: { name: 'University of Colorado Boulder', students: 36_000 },
    anonymousReporting: true,
    mandatoryInspections: false,
    coordinates: [-105.2705, 40.015],
    deadlines: {
      emergency: { hours: 24, label: '24 hours — no heat, gas leak, sewage, no water' },
      urgent: { hours: 72, label: '72 hours — mold > 10 sq ft, no hot water' },
      standard: { hours: 168, label: '7–30 days — electrical, plumbing, structural, pests' },
    },
    keyLaws: [
      { name: 'Warranty of Habitability', citation: 'CRS § 38-12-501 et seq', summary: 'Landlords must maintain rental units in a condition fit for human habitation with repair deadlines of 24h/72h/7–30 days.' },
      { name: 'Security Deposit Return', citation: 'CRS § 38-12-510', summary: 'Landlords must return security deposits within 60 days of move-out (updated from 30 days in 2024) with an itemized deduction list.' },
      { name: 'Retaliation Prohibition', citation: 'CRS § 38-12-511', summary: 'Landlords cannot retaliate against tenants who report violations or exercise legal rights. Actions within 6 months are presumed retaliatory.' },
      { name: 'Rental Application Fairness Act', citation: 'HB24-1098', summary: 'Limits application fees, requires upfront disclosure of screening criteria, and mandates explanations for rejected applicants.' },
      { name: 'Boulder Rental Licensing', citation: 'Boulder Revised Code', summary: 'All rental properties in Boulder must be licensed with the city, ensuring minimum safety and habitability standards.' },
      { name: 'Boulder Property Maintenance Code', citation: 'Boulder Revised Code Title 10 Ch 2', summary: 'Sets minimum health and safety standards for occupied buildings in Boulder, enforced by city inspectors.' },
    ],
    enforcement: {
      healthDept: { name: 'Boulder County Health Department', phone: '(303) 441-3460', address: '3450 Broadway, Boulder, CO 80304', hours: 'Mon–Fri 8am–5pm' },
      codeEnforcement: { name: 'City of Boulder Building Services', phone: '(303) 441-3929', address: '1739 Broadway, Boulder, CO 80302', hours: 'Mon–Fri 8am–5pm' },
    },
    emergencyContacts: [
      { name: 'Emergency Services', phone: '911', description: 'For immediate life-threatening emergencies — gas leaks, fires, medical emergencies', emergency: true },
      { name: 'Boulder Police (Non-Emergency)', phone: '(303) 441-3333', description: 'Non-emergency police line for noise complaints, trespassing, or landlord harassment', hours: '24/7' },
      { name: 'Poison Control Center', phone: '1-800-222-1222', description: 'Carbon monoxide exposure, chemical spills, mold-related poisoning questions', hours: '24/7', emergency: true },
      { name: 'Boulder Housing Authority', phone: '(303) 441-3929', description: 'Report housing code violations, request inspections, habitability complaints', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Boulder County Health Department', phone: '(303) 441-3460', description: 'Report health code violations and habitability issues', hours: 'Mon–Fri 8am–5pm' },
      { name: 'EPRAS Mediation Services', phone: '(303) 442-7060', description: 'Free mediation between tenants and landlords', hours: 'Mon–Fri 9am–5pm' },
      { name: 'Colorado Legal Aid', phone: '(303) 837-1313', description: 'Free legal assistance for qualifying renters', hours: 'Mon–Fri 9am–4pm' },
      { name: 'Boulder Housing Partners', phone: '(720) 564-4610', description: 'Affordable housing resources and tenant support', hours: 'Mon–Fri 8am–5pm' },
    ],
    rights: [
      {
        title: 'Right to Habitable Living Conditions',
        content: [
          'Your rental must meet basic health and safety standards including working heat, plumbing, electrical, and structural integrity',
          'Boulder landlords must comply with the Boulder Property Maintenance Code (Title 10, Chapter 2) which sets minimum standards for occupied buildings',
          'You cannot waive habitability rights in your lease — any clause purporting to waive these rights is void under Colorado law',
          'If conditions are unlivable and your landlord fails to remedy them, you may break your lease without penalty or pursue rent abatement',
        ],
        laws: ['CRS § 38-12-503', 'Boulder Revised Code Title 10, Chapter 2'],
      },
      {
        title: 'Right to Timely Repairs',
        content: [
          '24-hour emergencies: No heat below 40°F, no running water, gas leaks, sewage backup, electrical hazards',
          '72-hour urgent issues: Mold over 10 sq ft, no hot water, broken exterior door locks, inoperable smoke/CO detectors',
          '7-day repairs: Other habitability issues affecting health or safety',
          '30-day repairs: Non-urgent maintenance such as minor leaks, cosmetic damage, appliance issues',
          'You must notify your landlord in writing (email counts) — keep copies of all communications',
        ],
        laws: ['CRS § 38-12-505', 'Boulder Housing Code'],
      },
      {
        title: 'Protection from Retaliation',
        content: [
          'Landlords cannot retaliate for reporting code violations, joining tenant unions, exercising legal rights, or contacting city inspectors',
          'Any adverse action within 6 months of your complaint is legally presumed to be retaliatory',
          'You can sue for actual damages, attorney fees, and up to 2 months\' rent if retaliation occurs',
        ],
        laws: ['CRS § 38-12-509'],
      },
      {
        title: 'Security Deposit Rights',
        content: [
          'Security deposits cannot exceed 2 months\' rent',
          'Landlords must return your deposit within 60 days of move-out (updated from 30 days in 2024)',
          'An itemized list of all deductions must be provided',
          'If wrongfully withheld, you can sue for up to 3x the amount plus attorney fees',
        ],
        laws: ['CRS § 38-12-103', 'CRS § 38-12-510'],
      },
    ],
  },

  // ── Fort Collins, CO ──
  {
    slug: 'fort-collins',
    name: 'Fort Collins',
    state: 'Colorado',
    stateCode: 'CO',
    population: 170_000,
    renterPercent: 44,
    university: { name: 'Colorado State University', students: 34_000 },
    anonymousReporting: true,
    mandatoryInspections: false,
    coordinates: [-105.0844, 40.5853],
    deadlines: {
      emergency: { hours: 24, label: '24 hours — no heat, no water, gas leak, sewage (SB24-094)' },
      urgent: { hours: 96, label: '96 hours — mold, no hot water, with hotel provision (SB24-094)' },
      standard: { hours: 168, label: '7–30 days — standard repairs' },
    },
    keyLaws: [
      { name: 'Colorado Rental Housing Safety Act', citation: 'SB24-094', summary: 'Establishes 24h/96h repair deadlines; landlords must provide hotel accommodation when emergency repairs exceed 24h.' },
      { name: 'Tenant Protection Act', citation: 'HB24-1007', summary: 'Strengthens tenant protections including limits on fees, standardized lease terms, and anti-retaliation provisions.' },
      { name: 'Warranty of Habitability', citation: 'CRS § 38-12-501 et seq', summary: 'Colorado statewide warranty requiring landlords to maintain fit-for-habitation rental units.' },
    ],
    enforcement: {
      healthDept: { name: 'Larimer County Health Department', phone: '(970) 498-6700', address: '1525 Blue Spruce Dr, Fort Collins, CO 80524', hours: 'Mon–Fri 7:30am–4:30pm' },
      codeEnforcement: { name: 'City of Fort Collins Code Compliance', phone: '(970) 416-2200', email: 'codecompliance@fcgov.com', address: '281 N College Ave, Fort Collins, CO 80524', hours: 'Mon–Fri 8am–5pm' },
    },
    emergencyContacts: [
      { name: 'Emergency Services', phone: '911', description: 'Life-threatening emergencies', emergency: true },
      { name: 'Fort Collins Police (Non-Emergency)', phone: '(970) 419-3273', description: 'Non-emergency police line', hours: '24/7' },
      { name: 'Poison Control Center', phone: '1-800-222-1222', description: 'Toxin and exposure questions', hours: '24/7', emergency: true },
      { name: 'Larimer County Health Dept', phone: '(970) 498-6700', description: 'Housing and health code complaints', hours: 'Mon–Fri 7:30am–4:30pm' },
      { name: 'Colorado Legal Aid', phone: '(303) 837-1313', description: 'Free legal assistance for qualifying renters', hours: 'Mon–Fri 9am–4pm' },
      { name: 'CSU Off-Campus Life', phone: '(970) 491-2248', description: 'Student tenant support and resources', hours: 'Mon–Fri 8am–5pm' },
    ],
    rights: [
      {
        title: 'Right to Habitable Living Conditions',
        content: [
          'Your rental must meet basic health and safety standards under Colorado law',
          'The Warranty of Habitability cannot be waived by lease terms',
          'Fort Collins follows Larimer County health and building codes for inspections',
        ],
        laws: ['CRS § 38-12-503', 'SB24-094'],
      },
      {
        title: 'Right to Timely Repairs with Hotel Provision',
        content: [
          '24-hour emergencies: no heat, gas leaks, sewage, no water',
          '96-hour urgent repairs: mold, no hot water — landlord must provide hotel if unresolved past 24h',
          '7–30 day standard repairs for non-emergency habitability issues',
        ],
        laws: ['SB24-094', 'CRS § 38-12-505'],
      },
      {
        title: 'Protection from Retaliation',
        content: [
          'Landlords cannot retaliate against tenants for exercising legal rights',
          'Adverse action within 6 months of a complaint is presumed retaliatory',
        ],
        laws: ['CRS § 38-12-509', 'HB24-1007'],
      },
    ],
  },

  // ── Ann Arbor, MI ──
  {
    slug: 'ann-arbor',
    name: 'Ann Arbor',
    state: 'Michigan',
    stateCode: 'MI',
    population: 123_000,
    renterPercent: 53,
    university: { name: 'University of Michigan', students: 48_000 },
    anonymousReporting: true,
    mandatoryInspections: true,
    mandatoryInspectionsDescription: '30-month mandatory rental inspection cycle',
    coordinates: [-83.7430, 42.2808],
    deadlines: {
      emergency: { hours: 24, label: '24 hours — no heat, no water, gas leak, structural danger' },
      urgent: { hours: 72, label: '72 hours — mold, no hot water, broken locks' },
      standard: { hours: 720, label: '30 days — standard maintenance issues' },
    },
    keyLaws: [
      { name: 'Ann Arbor Housing Code', citation: 'Chapter 105 Housing Code', summary: 'Comprehensive housing standards with 30-month mandatory inspection cycles for all rental units.' },
      { name: 'Green Rental Housing Ordinance', citation: 'Ann Arbor Green Rental Housing Ordinance', summary: 'Requires energy efficiency disclosures and improvements in rental properties.' },
    ],
    enforcement: {
      healthDept: { name: 'Washtenaw County Health Department', phone: '(734) 544-6700', address: '555 Towner St, Ypsilanti, MI 48198', hours: 'Mon–Fri 8:30am–5pm' },
      codeEnforcement: { name: 'City of Ann Arbor Building & Rental Inspections', phone: '(734) 794-6267', email: 'buildinginspections@a2gov.org', address: '301 E Huron St, Ann Arbor, MI 48104', hours: 'Mon–Fri 8am–5pm' },
    },
    emergencyContacts: [
      { name: 'Emergency Services', phone: '911', description: 'Life-threatening emergencies', emergency: true },
      { name: 'Ann Arbor Police (Non-Emergency)', phone: '(734) 794-6920', description: 'Non-emergency police line', hours: '24/7' },
      { name: 'Poison Control Center', phone: '1-800-222-1222', description: 'Toxin and exposure questions', hours: '24/7', emergency: true },
      { name: 'Ann Arbor Building Inspections', phone: '(734) 794-6267', description: 'Report housing code violations and request inspections', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Michigan Legal Services', phone: '(734) 665-6181', description: 'Free legal aid for tenants', hours: 'Mon–Fri 9am–5pm' },
      { name: 'UM Student Legal Services', phone: '(734) 763-9920', description: 'Free legal consultations for students', hours: 'Mon–Fri 8am–5pm' },
    ],
    rights: [
      {
        title: 'Right to Habitable Living Conditions',
        content: [
          'All rental units must pass mandatory inspections every 30 months',
          'Landlords must maintain units per Chapter 105 Housing Code standards',
          'The city proactively inspects — you don\'t need to file a complaint for scheduled inspections',
        ],
        laws: ['Chapter 105 Housing Code'],
      },
      {
        title: 'Right to Timely Repairs',
        content: [
          '24-hour emergencies: no heat, gas leaks, structural danger, no water',
          '72-hour urgent: mold, no hot water, broken locks',
          '30-day standard repairs for non-emergency issues',
        ],
        laws: ['Chapter 105 Housing Code', 'Michigan Truth in Renting Act'],
      },
      {
        title: 'Green Rental Housing Rights',
        content: [
          'Landlords must disclose energy efficiency information',
          'Properties must meet energy efficiency benchmarks during inspections',
        ],
        laws: ['Green Rental Housing Ordinance'],
      },
    ],
  },

  // ── Eugene, OR ──
  {
    slug: 'eugene',
    name: 'Eugene',
    state: 'Oregon',
    stateCode: 'OR',
    population: 176_000,
    renterPercent: 50,
    university: { name: 'University of Oregon', students: 23_000 },
    anonymousReporting: true,
    mandatoryInspections: false,
    coordinates: [-123.0868, 44.0521],
    deadlines: {
      emergency: { hours: 24, label: '24 hours — no heat, no water, gas leak, major hazard' },
      urgent: { hours: 72, label: '72 hours — mold, no hot water, broken locks' },
      standard: { hours: 720, label: '30 days — standard maintenance (ORS Ch 90)' },
    },
    keyLaws: [
      { name: 'Oregon Rent Cap Law', citation: 'SB 608', summary: 'Caps annual rent increases at 7% + CPI statewide; requires cause for eviction after 12 months tenancy.' },
      { name: 'Eugene Tenant Protections', citation: 'Ordinance 20670/20694', summary: 'Caps screening charges, requires relocation assistance for no-cause terminations, and limits move-in costs.' },
      { name: 'Oregon Residential Landlord-Tenant Act', citation: 'ORS Ch 90', summary: 'Comprehensive tenant protections including habitability standards, repair timelines, and security deposit rules.' },
    ],
    enforcement: {
      healthDept: { name: 'Lane County Public Health', phone: '(541) 682-4600', address: '151 W 7th Ave, Eugene, OR 97401', hours: 'Mon–Fri 8am–5pm' },
      codeEnforcement: { name: 'City of Eugene Code Compliance', phone: '(541) 682-5282', email: 'codecompliance@eugene-or.gov', address: '99 W 10th Ave, Eugene, OR 97401', hours: 'Mon–Fri 8am–5pm' },
    },
    emergencyContacts: [
      { name: 'Emergency Services', phone: '911', description: 'Life-threatening emergencies', emergency: true },
      { name: 'Eugene Police (Non-Emergency)', phone: '(541) 682-5111', description: 'Non-emergency police line', hours: '24/7' },
      { name: 'Poison Control Center', phone: '1-800-222-1222', description: 'Toxin and exposure questions', hours: '24/7', emergency: true },
      { name: 'Lane County Public Health', phone: '(541) 682-4600', description: 'Housing and health code complaints', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Oregon Law Center', phone: '(541) 485-2471', description: 'Free legal aid for low-income tenants', hours: 'Mon–Fri 9am–5pm' },
      { name: 'UO Off-Campus Housing', phone: '(541) 346-3111', description: 'Student housing resources', hours: 'Mon–Fri 8am–5pm' },
    ],
    rights: [
      {
        title: 'Right to Habitable Living Conditions',
        content: [
          'Landlords must maintain rental units in a habitable condition under ORS Ch 90',
          'You cannot waive habitability rights in your lease',
          'If conditions are dangerous, you may withhold rent or terminate the lease',
        ],
        laws: ['ORS Ch 90'],
      },
      {
        title: 'Rent Cap Protections',
        content: [
          'Annual rent increases capped at 7% + CPI (SB 608)',
          'Landlords must give 90-day written notice for rent increases',
          'After 12 months of tenancy, landlords need cause to evict',
        ],
        laws: ['SB 608'],
      },
      {
        title: 'Relocation Assistance',
        content: [
          'Eugene requires landlords to pay relocation assistance for no-cause terminations',
          'Screening fees are capped under city ordinance',
          'Move-in costs are limited to protect tenants',
        ],
        laws: ['Ordinance 20670/20694'],
      },
    ],
  },

  // ── Santa Cruz, CA ──
  {
    slug: 'santa-cruz',
    name: 'Santa Cruz',
    state: 'California',
    stateCode: 'CA',
    population: 65_000,
    renterPercent: 58,
    university: { name: 'UC Santa Cruz', students: 19_500 },
    anonymousReporting: true,
    mandatoryInspections: true,
    mandatoryInspectionsDescription: 'Proactive rental inspection program under Chapter 21.06',
    coordinates: [-122.0308, 36.9741],
    deadlines: {
      emergency: { hours: 24, label: '24 hours — no heat, gas leak, sewage, no water' },
      urgent: { hours: 72, label: '72 hours — mold, no hot water, broken locks' },
      standard: { hours: 720, label: '30 days — standard maintenance' },
    },
    keyLaws: [
      { name: 'Santa Cruz Rent Control', citation: 'Rent Control and Tenant Protection Act 2018', summary: 'Limits rent increases, requires just cause for eviction, and provides relocation assistance.' },
      { name: 'California Tenant Protection Act', citation: 'AB 1482', summary: 'Statewide rent cap (5% + CPI) and just-cause eviction protections for most renters.' },
      { name: 'Rental Inspection Program', citation: 'Chapter 21.06', summary: 'Proactive city inspection program for rental units to ensure habitability standards.' },
    ],
    enforcement: {
      healthDept: { name: 'Santa Cruz County Health Services', phone: '(831) 454-4000', address: '1080 Emeline Ave, Santa Cruz, CA 95060', hours: 'Mon–Fri 8am–5pm' },
      codeEnforcement: { name: 'City of Santa Cruz Code Compliance', phone: '(831) 420-5100', email: 'codecompliance@cityofsantacruz.com', address: '809 Center St, Santa Cruz, CA 95060', hours: 'Mon–Fri 8am–5pm' },
    },
    emergencyContacts: [
      { name: 'Emergency Services', phone: '911', description: 'Life-threatening emergencies', emergency: true },
      { name: 'Santa Cruz Police (Non-Emergency)', phone: '(831) 420-5820', description: 'Non-emergency police line', hours: '24/7' },
      { name: 'Poison Control Center', phone: '1-800-222-1222', description: 'Toxin and exposure questions', hours: '24/7', emergency: true },
      { name: 'Santa Cruz Code Compliance', phone: '(831) 420-5100', description: 'Report housing code violations', hours: 'Mon–Fri 8am–5pm' },
      { name: 'California Rural Legal Assistance', phone: '(831) 757-5221', description: 'Free legal aid for tenants', hours: 'Mon–Fri 9am–5pm' },
      { name: 'UCSC Student Legal Services', phone: '(831) 459-2979', description: 'Free legal consultations for students', hours: 'Mon–Fri 8am–5pm' },
    ],
    rights: [
      {
        title: 'Rent Control Protections',
        content: [
          'Rent increases are limited under the Santa Cruz Rent Control and Tenant Protection Act',
          'Statewide AB 1482 caps increases at 5% + CPI for covered units',
          'Just-cause eviction required — landlords must have a valid reason to terminate tenancy',
        ],
        laws: ['Rent Control and Tenant Protection Act 2018', 'AB 1482'],
      },
      {
        title: 'Right to Habitable Living Conditions',
        content: [
          'Landlords must maintain units to California habitability standards',
          'Santa Cruz has a proactive inspection program — the city inspects rental units regularly',
          'You can request an inspection at any time through Code Compliance',
        ],
        laws: ['Chapter 21.06', 'California Civil Code § 1941'],
      },
      {
        title: 'Right to Timely Repairs',
        content: [
          '24-hour emergencies: no heat, gas leaks, sewage, no water',
          '72-hour urgent: mold, no hot water, broken locks',
          '30-day standard repairs',
          'Repair and deduct remedy available under California law',
        ],
        laws: ['California Civil Code § 1942'],
      },
    ],
  },

  // ── Somerville, MA ──
  {
    slug: 'somerville',
    name: 'Somerville',
    state: 'Massachusetts',
    stateCode: 'MA',
    population: 81_000,
    renterPercent: 64,
    university: { name: 'Tufts University', students: 12_000 },
    anonymousReporting: true,
    mandatoryInspections: true,
    mandatoryInspectionsDescription: 'State sanitary code inspections required; city proactive enforcement',
    coordinates: [-71.0998, 42.3876],
    deadlines: {
      emergency: { hours: 24, label: '24 hours — no heat, gas leak, sewage, no water' },
      urgent: { hours: 72, label: '72 hours — mold, no hot water, broken locks' },
      standard: { hours: 720, label: '30 days — standard maintenance (105 CMR 410)' },
    },
    keyLaws: [
      { name: 'Housing Stability Notification Act', citation: 'HSNA (Somerville)', summary: 'Requires 12-month notice before condo conversion, relocation assistance, and right of first refusal for tenants.' },
      { name: 'State Sanitary Code', citation: '105 CMR 410.00', summary: 'Massachusetts minimum standards for human habitation — covers heating, plumbing, pest control, structural safety.' },
      { name: 'Condo Conversion Ordinance', citation: 'Somerville Condo Conversion Ordinance', summary: 'Protects tenants from displacement during condo conversions with notification and relocation requirements.' },
    ],
    enforcement: {
      healthDept: { name: 'Somerville Health & Human Services', phone: '(617) 625-6600 x4300', address: '93 Highland Ave, Somerville, MA 02143', hours: 'Mon–Fri 8:30am–4:30pm' },
      codeEnforcement: { name: 'Somerville Inspectional Services', phone: '(617) 625-6600 x4400', email: 'inspections@somervillema.gov', address: '93 Highland Ave, Somerville, MA 02143', hours: 'Mon–Fri 8:30am–4:30pm' },
    },
    emergencyContacts: [
      { name: 'Emergency Services', phone: '911', description: 'Life-threatening emergencies', emergency: true },
      { name: 'Somerville Police (Non-Emergency)', phone: '(617) 625-1212', description: 'Non-emergency police line', hours: '24/7' },
      { name: 'Poison Control Center', phone: '1-800-222-1222', description: 'Toxin and exposure questions', hours: '24/7', emergency: true },
      { name: 'Somerville Inspectional Services', phone: '(617) 625-6600 x4400', description: 'Report housing code violations', hours: 'Mon–Fri 8:30am–4:30pm' },
      { name: 'Massachusetts Legal Aid', phone: '(617) 603-1700', description: 'Free legal aid for tenants', hours: 'Mon–Fri 9am–5pm' },
      { name: 'Community Action Agency of Somerville', phone: '(617) 623-7370', description: 'Housing assistance and tenant support', hours: 'Mon–Fri 9am–5pm' },
    ],
    rights: [
      {
        title: 'Right to Habitable Living Conditions',
        content: [
          'All rental units must meet 105 CMR 410 sanitary code standards',
          'Landlords must provide heat from Sept 15 to June 15 (minimum 68°F)',
          'City Inspectional Services can inspect your unit at no cost',
        ],
        laws: ['105 CMR 410.00'],
      },
      {
        title: 'Housing Stability Protections',
        content: [
          '12-month notice required before condo conversion under HSNA',
          'Right of first refusal to purchase your unit during conversion',
          'Relocation assistance required for displaced tenants',
        ],
        laws: ['HSNA', 'Somerville Condo Conversion Ordinance'],
      },
      {
        title: 'Protection from Retaliation',
        content: [
          'Landlords cannot retaliate for exercising legal rights or filing complaints',
          'Massachusetts law provides strong anti-retaliation protections',
          'Any adverse action within 6 months of a complaint is presumed retaliatory',
        ],
        laws: ['MGL Ch 186 § 18'],
      },
    ],
  },

  // ── Olympia, WA ──
  {
    slug: 'olympia',
    name: 'Olympia',
    state: 'Washington',
    stateCode: 'WA',
    population: 55_000,
    renterPercent: 48,
    university: { name: 'The Evergreen State College', students: 2_200 },
    anonymousReporting: true,
    mandatoryInspections: false,
    coordinates: [-122.9007, 47.0379],
    deadlines: {
      emergency: { hours: 24, label: '24 hours — no heat, gas leak, sewage, no water' },
      urgent: { hours: 72, label: '72 hours — mold, no hot water, broken locks' },
      standard: { hours: 720, label: '10–30 days — standard repairs (RCW 59.18)' },
    },
    keyLaws: [
      { name: 'Olympia Relocation Assistance', citation: 'Ordinance 7391', summary: 'Requires landlords to pay relocation assistance to tenants displaced by rent increases of 10%+ or building demolition.' },
      { name: 'Olympia Rental Protections', citation: 'Ordinance 7376', summary: 'Establishes just-cause eviction requirements and limits on rent increases for Olympia tenants.' },
      { name: 'Washington Residential Landlord-Tenant Act', citation: 'RCW 59.18', summary: 'Statewide tenant protections including habitability standards, repair obligations, and deposit return rules.' },
      { name: 'Olympia Rental Housing Safety', citation: 'Chapter 5.82', summary: 'Local rental housing safety standards and compliance requirements.' },
    ],
    enforcement: {
      healthDept: { name: 'Thurston County Public Health', phone: '(360) 867-2500', address: '412 Lilly Rd NE, Olympia, WA 98506', hours: 'Mon–Fri 8am–5pm' },
      codeEnforcement: { name: 'City of Olympia Code Enforcement', phone: '(360) 753-8314', email: 'codeenforcement@ci.olympia.wa.us', address: '601 4th Ave E, Olympia, WA 98501', hours: 'Mon–Fri 8am–5pm' },
    },
    emergencyContacts: [
      { name: 'Emergency Services', phone: '911', description: 'Life-threatening emergencies', emergency: true },
      { name: 'Olympia Police (Non-Emergency)', phone: '(360) 753-8300', description: 'Non-emergency police line', hours: '24/7' },
      { name: 'Poison Control Center', phone: '1-800-222-1222', description: 'Toxin and exposure questions', hours: '24/7', emergency: true },
      { name: 'Thurston County Public Health', phone: '(360) 867-2500', description: 'Housing and health complaints', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Northwest Justice Project', phone: '(360) 753-3610', description: 'Free legal aid for tenants', hours: 'Mon–Fri 9am–5pm' },
    ],
    rights: [
      {
        title: 'Right to Habitable Living Conditions',
        content: [
          'Landlords must maintain units per RCW 59.18 habitability standards',
          'You may withhold rent or repair and deduct if landlord fails to make timely repairs',
          'The city enforces local rental housing safety standards under Chapter 5.82',
        ],
        laws: ['RCW 59.18', 'Chapter 5.82'],
      },
      {
        title: 'Relocation Assistance',
        content: [
          'Landlords must pay relocation assistance for rent increases of 10%+ (Ordinance 7391)',
          'Relocation assistance also applies to displacement from demolition or major renovation',
          'Just-cause eviction protections under Ordinance 7376',
        ],
        laws: ['Ordinance 7391', 'Ordinance 7376'],
      },
      {
        title: 'Security Deposit Rights',
        content: [
          'Landlords must return deposits within 21 days of move-out',
          'An itemized statement of deductions is required',
          'Failure to comply can result in 2x the deposit amount in damages',
        ],
        laws: ['RCW 59.18.280'],
      },
    ],
  },

  // ── Portland, ME ──
  {
    slug: 'portland-me',
    name: 'Portland',
    state: 'Maine',
    stateCode: 'ME',
    population: 68_000,
    renterPercent: 56,
    university: { name: 'University of Southern Maine', students: 7_000 },
    anonymousReporting: true,
    mandatoryInspections: false,
    coordinates: [-70.2553, 43.6591],
    deadlines: {
      emergency: { hours: 24, label: '24 hours — no heat, gas leak, sewage, no water' },
      urgent: { hours: 72, label: '72 hours — mold, no hot water, broken locks' },
      standard: { hours: 720, label: '30 days — standard maintenance' },
    },
    keyLaws: [
      { name: 'Portland Rent Control Ordinance', citation: 'Portland Rent Control Ordinance', summary: 'Caps annual rent increases at 5% or CPI (whichever is less); requires just cause for eviction.' },
      { name: 'No-Cause Eviction Notice', citation: 'Portland 90-Day No-Cause Notice', summary: 'Landlords must provide 90-day notice for no-cause lease terminations.' },
      { name: 'Anti-Retaliation Protection', citation: 'Portland Anti-Retaliation (6-month window)', summary: 'Adverse action within 6 months of a tenant complaint is presumed retaliatory.' },
    ],
    enforcement: {
      healthDept: { name: 'City of Portland Health & Human Services', phone: '(207) 874-8300', address: '389 Congress St, Portland, ME 04101', hours: 'Mon–Fri 8am–4:30pm' },
      codeEnforcement: { name: 'Portland Code Enforcement', phone: '(207) 874-8703', email: 'codeenforcement@portlandmaine.gov', address: '389 Congress St, Portland, ME 04101', hours: 'Mon–Fri 8am–4:30pm' },
    },
    emergencyContacts: [
      { name: 'Emergency Services', phone: '911', description: 'Life-threatening emergencies', emergency: true },
      { name: 'Portland Police (Non-Emergency)', phone: '(207) 874-8575', description: 'Non-emergency police line', hours: '24/7' },
      { name: 'Poison Control Center', phone: '1-800-222-1222', description: 'Toxin and exposure questions', hours: '24/7', emergency: true },
      { name: 'Portland Code Enforcement', phone: '(207) 874-8703', description: 'Report housing code violations', hours: 'Mon–Fri 8am–4:30pm' },
      { name: 'Pine Tree Legal Assistance', phone: '(207) 774-8211', description: 'Free legal aid for tenants', hours: 'Mon–Fri 9am–5pm' },
    ],
    rights: [
      {
        title: 'Rent Control Protections',
        content: [
          'Annual rent increases capped at 5% or CPI (whichever is less)',
          'Landlords must provide written notice for all rent increases',
          'Just-cause eviction required — landlords need a valid reason',
        ],
        laws: ['Portland Rent Control Ordinance'],
      },
      {
        title: 'Right to Habitable Living Conditions',
        content: [
          'Landlords must maintain units to Maine habitability standards',
          'Emergency repairs (no heat, gas leak, etc.) required within 24 hours',
          'You may repair and deduct for failures to address habitability issues',
        ],
        laws: ['Maine Title 14 § 6021'],
      },
      {
        title: 'Protection from Retaliation',
        content: [
          '90-day notice required for no-cause terminations',
          '6-month anti-retaliation window after complaints',
          'Adverse action during this window is presumed retaliatory',
        ],
        laws: ['Portland Anti-Retaliation Ordinance', 'Maine Title 14 § 6001'],
      },
    ],
  },

  // ── Asheville, NC ──
  {
    slug: 'asheville',
    name: 'Asheville',
    state: 'North Carolina',
    stateCode: 'NC',
    population: 94_000,
    renterPercent: 46,
    university: { name: 'UNC Asheville', students: 3_300 },
    anonymousReporting: true,
    mandatoryInspections: false,
    mandatoryInspectionsDescription: 'Complaint-based only — NC preempts local inspection programs',
    coordinates: [-82.5515, 35.5951],
    deadlines: {
      emergency: { hours: 24, label: '24 hours — no heat, gas leak, sewage, structural danger' },
      urgent: { hours: 72, label: '72 hours — mold, no hot water, broken locks' },
      standard: { hours: 720, label: '30 days — standard maintenance (NCGS § 42-42)' },
    },
    keyLaws: [
      { name: 'NC Residential Rental Agreements Act', citation: 'NCGS Ch 42 Art 5 (§ 42-42)', summary: 'Landlord must maintain fit and habitable premises including working plumbing, heating, electrical, and structural integrity.' },
      { name: 'NC Preemption', citation: 'NC State Preemption', summary: 'North Carolina preempts local rent control and most local tenant protection ordinances. Enforcement is complaint-based only.' },
    ],
    enforcement: {
      healthDept: { name: 'Buncombe County Health & Human Services', phone: '(828) 250-5000', address: '40 Coxe Ave, Asheville, NC 28801', hours: 'Mon–Fri 8am–5pm' },
      codeEnforcement: { name: 'City of Asheville Development Services', phone: '(828) 259-5846', email: 'development@ashevillenc.gov', address: '161 S Charlotte St, Asheville, NC 28801', hours: 'Mon–Fri 8am–5pm' },
    },
    emergencyContacts: [
      { name: 'Emergency Services', phone: '911', description: 'Life-threatening emergencies', emergency: true },
      { name: 'Asheville Police (Non-Emergency)', phone: '(828) 252-1110', description: 'Non-emergency police line', hours: '24/7' },
      { name: 'Poison Control Center', phone: '1-800-222-1222', description: 'Toxin and exposure questions', hours: '24/7', emergency: true },
      { name: 'Buncombe County Health Dept', phone: '(828) 250-5000', description: 'Housing and health complaints', hours: 'Mon–Fri 8am–5pm' },
      { name: 'Pisgah Legal Services', phone: '(828) 253-0406', description: 'Free legal aid for tenants', hours: 'Mon–Fri 8:30am–5pm' },
    ],
    rights: [
      {
        title: 'Right to Habitable Living Conditions',
        content: [
          'Under NCGS § 42-42, landlords must maintain fit and habitable premises',
          'Required: working plumbing, heating, electrical systems, and structural integrity',
          'NC is a preemption state — local governments cannot enact rent control or most tenant protections beyond state law',
          'Enforcement is complaint-based only; no proactive inspection program',
        ],
        laws: ['NCGS Ch 42 Art 5 (§ 42-42)'],
      },
      {
        title: 'Right to Timely Repairs',
        content: [
          'Emergency repairs should be addressed within 24 hours',
          'Standard repairs — landlord must act within a reasonable time',
          'You may pursue rent abatement or lease termination for serious habitability failures',
        ],
        laws: ['NCGS § 42-42'],
      },
      {
        title: 'Security Deposit Rights',
        content: [
          'Deposits limited to 2 months\' rent for month-to-month, 1.5 months for longer terms',
          'Must be returned within 30 days of lease termination',
          'Itemized list of deductions required',
        ],
        laws: ['NCGS § 42-51 to 42-56'],
      },
    ],
  },

  // ── Burlington, VT ──
  {
    slug: 'burlington',
    name: 'Burlington',
    state: 'Vermont',
    stateCode: 'VT',
    population: 45_000,
    renterPercent: 60,
    university: { name: 'University of Vermont', students: 13_700 },
    anonymousReporting: true,
    mandatoryInspections: true,
    mandatoryInspectionsDescription: 'Certificate-based inspections — rental units must be certified before occupancy',
    coordinates: [-73.2127, 44.4759],
    deadlines: {
      emergency: { hours: 24, label: '24 hours — no heat, gas leak, sewage, no water' },
      urgent: { hours: 72, label: '72 hours — mold, no hot water, broken locks' },
      standard: { hours: 720, label: '30 days — standard maintenance' },
    },
    keyLaws: [
      { name: 'Vermont Residential Rental Agreements Act', citation: '9 V.S.A. §§ 4457–4459', summary: 'Comprehensive tenant protections including 48-hour entry notice, 90-day rent increase notice, and habitability standards.' },
      { name: '48-Hour Entry Notice', citation: '9 V.S.A. § 4460', summary: 'Landlords must provide 48-hour written notice before entering a tenant\'s unit (not 24h like most states).' },
      { name: '90-Day Rent Increase Notice', citation: '9 V.S.A. § 4455', summary: 'Landlords must give 90-day written notice before increasing rent.' },
    ],
    enforcement: {
      healthDept: { name: 'Vermont Department of Health — Burlington', phone: '(802) 863-7200', address: '108 Cherry St, Burlington, VT 05401', hours: 'Mon–Fri 7:45am–4:30pm' },
      codeEnforcement: { name: 'Burlington Code Enforcement', phone: '(802) 865-7188', email: 'codeenforcement@burlingtonvt.gov', address: '149 Church St, Burlington, VT 05401', hours: 'Mon–Fri 8am–4:30pm' },
    },
    emergencyContacts: [
      { name: 'Emergency Services', phone: '911', description: 'Life-threatening emergencies', emergency: true },
      { name: 'Burlington Police (Non-Emergency)', phone: '(802) 658-2704', description: 'Non-emergency police line', hours: '24/7' },
      { name: 'Poison Control Center', phone: '1-800-222-1222', description: 'Toxin and exposure questions', hours: '24/7', emergency: true },
      { name: 'Burlington Code Enforcement', phone: '(802) 865-7188', description: 'Report housing code violations', hours: 'Mon–Fri 8am–4:30pm' },
      { name: 'Vermont Legal Aid', phone: '(802) 863-5620', description: 'Free legal aid for tenants', hours: 'Mon–Fri 8:30am–4:30pm' },
      { name: 'UVM Student Legal Services', phone: '(802) 656-3413', description: 'Free legal help for students', hours: 'Mon–Fri 8:30am–4:30pm' },
    ],
    rights: [
      {
        title: 'Right to Habitable Living Conditions',
        content: [
          'Burlington requires rental units to be certified before occupancy',
          'Landlords must maintain units to Vermont habitability standards',
          'Certificate-based inspection system ensures proactive compliance',
        ],
        laws: ['9 V.S.A. §§ 4457–4459'],
      },
      {
        title: 'Enhanced Privacy Protections',
        content: [
          'Landlords must give 48-hour written notice before entry (not 24h like most states)',
          'Entry only for legitimate purposes at reasonable times',
          'Unauthorized entry is a violation you can document and report',
        ],
        laws: ['9 V.S.A. § 4460'],
      },
      {
        title: 'Rent Increase Protections',
        content: [
          '90-day written notice required before any rent increase',
          'Provides significant advance planning time compared to most states',
          'Notice must be in writing — verbal notice is insufficient',
        ],
        laws: ['9 V.S.A. § 4455'],
      },
    ],
  },

  // ── Ithaca, NY ──
  {
    slug: 'ithaca',
    name: 'Ithaca',
    state: 'New York',
    stateCode: 'NY',
    population: 32_000,
    renterPercent: 73,
    university: { name: 'Cornell University', students: 25_600 },
    anonymousReporting: true,
    mandatoryInspections: false,
    coordinates: [-76.4966, 42.4440],
    deadlines: {
      emergency: { hours: 24, label: '24 hours — no heat, gas leak, sewage, no water' },
      urgent: { hours: 72, label: '72 hours — mold, no hot water, broken locks' },
      standard: { hours: 720, label: '30 days — standard maintenance' },
    },
    keyLaws: [
      { name: 'Good Cause Eviction Law', citation: 'Ithaca Good Cause Eviction (2024)', summary: 'Requires landlords to have good cause to evict or not renew a lease; limits unreasonable rent increases.' },
      { name: 'NY Warranty of Habitability', citation: 'NY Real Property Law § 235-b', summary: 'Landlords must maintain rental units in a condition fit for human habitation.' },
      { name: 'Credit Check Fee Cap', citation: 'NY $20 Credit Check Cap', summary: 'Landlords cannot charge more than $20 for credit/background checks.' },
    ],
    enforcement: {
      healthDept: { name: 'Tompkins County Health Department', phone: '(607) 274-6688', address: '55 Brown Rd, Ithaca, NY 14850', hours: 'Mon–Fri 8am–5pm' },
      codeEnforcement: { name: 'City of Ithaca Code Enforcement', phone: '(607) 274-6508', email: 'dgrunder@cityofithaca.org', address: '108 E Green St, Ithaca, NY 14850', hours: 'Mon–Fri 8:30am–4:30pm' },
    },
    emergencyContacts: [
      { name: 'Emergency Services', phone: '911', description: 'Life-threatening emergencies', emergency: true },
      { name: 'Ithaca Police (Non-Emergency)', phone: '(607) 272-3245', description: 'Non-emergency police line', hours: '24/7' },
      { name: 'Poison Control Center', phone: '1-800-222-1222', description: 'Toxin and exposure questions', hours: '24/7', emergency: true },
      { name: 'Ithaca Code Enforcement', phone: '(607) 274-6508', description: 'Report housing code violations', hours: 'Mon–Fri 8:30am–4:30pm' },
      { name: 'Legal Aid Society of Mid-NY', phone: '(607) 273-3667', description: 'Free legal aid for tenants', hours: 'Mon–Fri 9am–5pm' },
      { name: 'Cornell Off-Campus Living', phone: '(607) 255-5533', description: 'Student tenant support', hours: 'Mon–Fri 8am–5pm' },
    ],
    rights: [
      {
        title: 'Good Cause Eviction Protections',
        content: [
          'Landlords must have good cause to evict or refuse lease renewal',
          'Unreasonable rent increases (above a threshold) can be challenged',
          'Protects tenants from arbitrary displacement',
        ],
        laws: ['Ithaca Good Cause Eviction (2024)'],
      },
      {
        title: 'Right to Habitable Living Conditions',
        content: [
          'NY warranty of habitability requires landlords to maintain fit premises',
          'Cannot be waived in the lease',
          'Rent abatement available for habitability failures',
        ],
        laws: ['NY Real Property Law § 235-b'],
      },
      {
        title: 'Application Fee Protections',
        content: [
          'Credit/background check fee capped at $20 statewide',
          'Landlords cannot charge excessive application fees',
          'You can request a copy of any report obtained',
        ],
        laws: ['NY $20 Credit Check Cap', 'NY Real Property Law § 238-a'],
      },
    ],
  },
];

// ── Lookup functions ──

const cityBySlug = new Map(cities.map((c) => [c.slug, c]));

export function getCityBySlug(slug: string): CityEntry | undefined {
  return cityBySlug.get(slug);
}

export function getSupportedCities(): CityEntry[] {
  return cities;
}

// Zip-code-to-slug mapping for all supported cities
const ZIP_TO_SLUG: Record<string, string> = {};

function addZipRange(start: number, end: number, slug: string) {
  for (let z = start; z <= end; z++) {
    ZIP_TO_SLUG[String(z).padStart(5, '0')] = slug;
  }
}

// Boulder
for (const z of ['80301','80302','80303','80304','80305','80306','80307','80308','80309','80310','80314','80321','80322','80323','80328','80329','80455','80466','80471','80481','80501','80503','80504','80510','80513','80516','80520','80540','80544']) {
  ZIP_TO_SLUG[z] = 'boulder';
}
// Fort Collins
addZipRange(80521, 80528, 'fort-collins');
ZIP_TO_SLUG['80553'] = 'fort-collins';
// Ann Arbor
addZipRange(48103, 48109, 'ann-arbor');
ZIP_TO_SLUG['48113'] = 'ann-arbor';
// Eugene
addZipRange(97401, 97408, 'eugene');
ZIP_TO_SLUG['97440'] = 'eugene';
// Santa Cruz
addZipRange(95060, 95067, 'santa-cruz');
// Somerville
addZipRange(2143, 2145, 'somerville'); // padded to 02143-02145
// Olympia
addZipRange(98501, 98509, 'olympia');
ZIP_TO_SLUG['98516'] = 'olympia';
// Portland ME
addZipRange(4101, 4104, 'portland-me');
ZIP_TO_SLUG['04108'] = 'portland-me';
ZIP_TO_SLUG['04109'] = 'portland-me';
ZIP_TO_SLUG['04112'] = 'portland-me';
// Asheville
addZipRange(28801, 28806, 'asheville');
ZIP_TO_SLUG['28810'] = 'asheville';
addZipRange(28813, 28816, 'asheville');
// Burlington VT
addZipRange(5401, 5408, 'burlington');
// Ithaca
addZipRange(14850, 14853, 'ithaca');
ZIP_TO_SLUG['14882'] = 'ithaca';

/**
 * Match a USPS-validated address to a supported city.
 * Returns the city slug or null if unsupported.
 */
export function findCityByAddress(city: string, state: string, zip: string): string | null {
  // First try zip
  const byZip = ZIP_TO_SLUG[zip];
  if (byZip) return byZip;

  // Fallback: match city + state name
  const normalizedCity = city.trim().toLowerCase();
  const normalizedState = state.trim().toUpperCase();
  for (const entry of cities) {
    if (
      entry.stateCode === normalizedState &&
      entry.name.toLowerCase() === normalizedCity
    ) {
      return entry.slug;
    }
  }

  return null;
}

/**
 * Get deadline info for the legal notice generator, per city.
 */
export function getCityDeadlineInfo(
  citySlug: string,
  issueType: string
): { hours: number; label: string; statute: string } {
  const city = getCityBySlug(citySlug);
  const emergencyTypes = ['no-heat', 'no-water', 'gas-leak', 'sewage'];
  const urgentTypes = ['mold', 'no-hot-water'];

  if (!city) {
    // Fallback to Colorado defaults
    if (emergencyTypes.includes(issueType)) return { hours: 24, label: '24 hours', statute: 'C.R.S. § 38-12-505(1)(a)' };
    if (urgentTypes.includes(issueType)) return { hours: 72, label: '72 hours', statute: 'C.R.S. § 38-12-505(1)(b)' };
    return { hours: 168, label: '7 days', statute: 'C.R.S. § 38-12-505(1)(c)' };
  }

  const primaryLaw = city.keyLaws[0]?.citation || 'Local housing code';

  if (emergencyTypes.includes(issueType)) {
    return { hours: city.deadlines.emergency.hours, label: `${city.deadlines.emergency.hours} hours`, statute: primaryLaw };
  }
  if (urgentTypes.includes(issueType)) {
    return { hours: city.deadlines.urgent.hours, label: `${city.deadlines.urgent.hours} hours`, statute: primaryLaw };
  }
  const weekTypes = ['electrical', 'plumbing', 'structural', 'pests'];
  if (weekTypes.includes(issueType)) {
    return { hours: city.deadlines.standard.hours, label: `${Math.round(city.deadlines.standard.hours / 24)} days`, statute: primaryLaw };
  }
  return { hours: 720, label: '30 days', statute: primaryLaw };
}
