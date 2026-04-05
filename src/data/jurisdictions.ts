import {
  getCityBySlug,
  type CityEntry,
} from './cityRegistry';
import {
  getResearchCity,
  getResearchCityByName,
  getStateProfile,
  type ResearchCity,
  type StateProfile,
} from './cityDatabase';

export type JurisdictionLayerKind = 'city' | 'county' | 'state' | 'federal';

export interface JurisdictionLaw {
  name: string;
  citation: string;
  summary: string;
  url?: string;
}

export interface JurisdictionResource {
  name: string;
  description: string;
  phone?: string;
  url?: string;
}

export interface JurisdictionLayer {
  kind: JurisdictionLayerKind;
  slug: string;
  name: string;
  summary: string;
  laws: JurisdictionLaw[];
  resources: JurisdictionResource[];
  notes?: string[];
}

export interface JurisdictionResolution {
  citySlug: string | null;
  cityName: string;
  countySlug: string | null;
  countyName: string | null;
  stateCode: string;
  layers: JurisdictionLayer[];
}

const FEDERAL_LAYER: JurisdictionLayer = {
  kind: 'federal',
  slug: 'federal-us',
  name: 'Federal Housing Protections',
  summary:
    'Federal law sets the anti-discrimination floor nationwide and creates complaint paths when local enforcement fails.',
  laws: [
    {
      name: 'Fair Housing Act',
      citation: '42 U.S.C. §§ 3601-3619',
      summary:
        'Prohibits housing discrimination based on race, color, national origin, religion, sex, disability, and familial status.',
      url: 'https://www.hud.gov/program_offices/fair_housing_equal_opp/fair_housing_act_overview',
    },
    {
      name: 'Reasonable Accommodations and Assistance Animals',
      citation: 'Fair Housing Act; Section 504 of the Rehabilitation Act',
      summary:
        'Covered housing providers must consider reasonable accommodations for disabled tenants, including assistance animal requests.',
      url: 'https://www.hud.gov/program_offices/fair_housing_equal_opp/assistance_animals',
    },
    {
      name: 'Violence Against Women Act Housing Protections',
      citation: '34 U.S.C. § 12491 et seq.',
      summary:
        'Protects covered tenants and applicants from eviction or denial of housing because of domestic violence, dating violence, sexual assault, or stalking.',
      url: 'https://www.hud.gov/vawa',
    },
    {
      name: 'Fair Housing Anti-Retaliation',
      citation: '42 U.S.C. § 3617',
      summary:
        'Landlords may not coerce, intimidate, threaten, or retaliate against tenants for exercising fair-housing rights or filing complaints.',
      url: 'https://www.justice.gov/crt/fair-housing-act-2',
    },
  ],
  resources: [
    {
      name: 'HUD Fair Housing Complaint Portal',
      description: 'File a federal housing discrimination complaint with HUD.',
      url: 'https://www.hud.gov/fairhousing/fileacomplaint',
    },
    {
      name: 'Legal Services Corporation',
      description: 'Find a federally funded legal aid provider in your area.',
      url: 'https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help',
    },
  ],
};

const COLORADO_STATE_LAYER: JurisdictionLayer = {
  kind: 'state',
  slug: 'co',
  name: 'Colorado Tenant Law',
  summary:
    'Colorado now provides the statewide baseline for repair timelines, anti-retaliation, source-of-income protections, and eviction reforms.',
  laws: [
    {
      name: 'Warranty of Habitability',
      citation: 'C.R.S. § 38-12-503',
      summary:
        'Landlords must provide habitable housing, including heat, water, pest control, and safe structural conditions.',
    },
    {
      name: 'Repair Deadlines and Remedies',
      citation: 'C.R.S. § 38-12-505; SB24-094',
      summary:
        'Colorado uses tiered repair deadlines for emergencies, urgent hazards, and standard habitability issues, with stronger tenant remedies after the 2024 reforms.',
    },
    {
      name: 'Security Deposits',
      citation: 'C.R.S. § 38-12-103',
      summary:
        'Deposits must be returned within the statutory deadline with an itemized statement when deductions are taken.',
    },
    {
      name: 'Anti-Retaliation',
      citation: 'C.R.S. § 38-12-509',
      summary:
        'Landlords may not retaliate because a tenant reported unsafe conditions, organized, or exercised housing rights.',
    },
    {
      name: 'Source of Income Protection',
      citation: 'C.R.S. § 24-34-502.2',
      summary:
        'Colorado bars landlords from rejecting applicants solely because they use housing vouchers or other lawful income sources.',
    },
  ],
  resources: [
    {
      name: 'Colorado Legal Services',
      description: 'Free or reduced-cost tenant-side legal help for qualifying Coloradans.',
      url: 'https://www.coloradolegalservices.org/',
    },
    {
      name: 'Colorado Division of Housing',
      description: 'State housing agency information, tenant resources, and program links.',
      url: 'https://cdola.colorado.gov/housing',
    },
  ],
  notes: [
    'Colorado counties often handle inspections and health enforcement, while the core landlord-tenant rules stay at the state level.',
  ],
};

const COLORADO_COUNTY_LAYERS: Record<string, JurisdictionLayer> = {
  'adams-county': {
    kind: 'county',
    slug: 'adams-county',
    name: 'Adams County',
    summary:
      'Adams County is the main public-health and housing-program enforcement layer for many north and east Denver metro rentals.',
    laws: [
      {
        name: 'County Public Health Enforcement',
        citation: 'County environmental health authority',
        summary:
          'Unsafe housing conditions such as mold, sewage, pests, and indoor-environment hazards can trigger county inspection and enforcement alongside city code teams.',
      },
    ],
    resources: [
      {
        name: 'Adams County Housing Authority',
        description: 'Voucher and housing-program resources that often intersect with tenant complaints.',
        url: 'https://www.adcogov.org/',
      },
    ],
  },
  'arapahoe-county': {
    kind: 'county',
    slug: 'arapahoe-county',
    name: 'Arapahoe County',
    summary:
      'Arapahoe County is the county-level enforcement and housing-program layer for much of Aurora and Centennial.',
    laws: [
      {
        name: 'County Health and Housing Enforcement',
        citation: 'County public health authority',
        summary:
          'County agencies can become the escalation path when unsafe conditions affect health or habitability and municipal enforcement stalls.',
      },
    ],
    resources: [
      {
        name: 'Arapahoe County Housing Authority',
        description: 'County housing authority and local housing-program entry point.',
        url: 'https://www.arapahoegov.com/',
      },
    ],
  },
  'boulder-county': {
    kind: 'county',
    slug: 'boulder-county',
    name: 'Boulder County',
    summary:
      'Boulder County adds an active public-health and environmental-health enforcement layer on top of Colorado tenant law.',
    laws: [
      {
        name: 'County Public Health Enforcement',
        citation: 'Boulder County Public Health',
        summary:
          'County health officials are a key escalation path for mold, sewage, pests, indoor air hazards, and other housing conditions that threaten tenant health.',
        url: 'https://bouldercounty.gov/environment/healthy-home/',
      },
    ],
    resources: [
      {
        name: 'Boulder County Public Health',
        description: 'County health enforcement and healthy-homes resources.',
        phone: '(303) 441-3460',
        url: 'https://bouldercounty.gov/environment/healthy-home/',
      },
      {
        name: 'Boulder County Legal Services',
        description: 'Tenant-side legal help serving Boulder County residents.',
        url: 'https://www.coloradolegalservices.org/',
      },
    ],
  },
  'broomfield-county': {
    kind: 'county',
    slug: 'broomfield-county',
    name: 'Broomfield County',
    summary:
      'Broomfield acts as a combined city-county government, so enforcement may route through Broomfield agencies rather than a separate county office.',
    laws: [
      {
        name: 'Combined City-County Enforcement',
        citation: 'Local environmental health and code authority',
        summary:
          'Address-based enforcement may run through Broomfield municipal departments even though the county layer still matters for housing programs.',
      },
    ],
    resources: [
      {
        name: 'Broomfield Housing and Human Services',
        description: 'Housing and tenant-assistance entry point for Broomfield addresses.',
        url: 'https://www.broomfield.org/',
      },
    ],
  },
  'douglas-county': {
    kind: 'county',
    slug: 'douglas-county',
    name: 'Douglas County',
    summary:
      'Douglas County matters for some south Aurora addresses and tends to be more of an enforcement and resource layer than a separate tenant-law layer.',
    laws: [
      {
        name: 'County Environmental Health Escalation',
        citation: 'County public health authority',
        summary:
          'County offices can step in on environmental-health complaints when hazards affect tenant safety and local code enforcement is limited.',
      },
    ],
    resources: [
      {
        name: 'Douglas County Housing Partnership',
        description: 'Local housing and support directory for Douglas County residents.',
        url: 'https://www.douglas.co.us/',
      },
    ],
  },
  'el-paso-county': {
    kind: 'county',
    slug: 'el-paso-county',
    name: 'El Paso County',
    summary:
      'El Paso County is the county-level public-health and housing-support layer for Colorado Springs addresses.',
    laws: [
      {
        name: 'County Public Health Enforcement',
        citation: 'El Paso County Public Health',
        summary:
          'County agencies can escalate habitability complaints involving sanitation, indoor health risks, and serious unsafe conditions.',
      },
    ],
    resources: [
      {
        name: 'Colorado Springs Housing Authority',
        description: 'Primary housing-resource partner for many city and county renters.',
        url: 'https://www.csha.us/',
      },
    ],
  },
  'jefferson-county': {
    kind: 'county',
    slug: 'jefferson-county',
    name: 'Jefferson County',
    summary:
      'Jefferson County provides the main county resource layer for Arvada and Lakewood renters and for part of Westminster.',
    laws: [
      {
        name: 'County Health and Housing Escalation',
        citation: 'County public health authority',
        summary:
          'County agencies complement municipal code enforcement when conditions create public-health or sanitation risks.',
      },
    ],
    resources: [
      {
        name: 'Jefferson County Housing Authority',
        description: 'County housing-program and rental-assistance entry point.',
        url: 'https://www.jeffcohousing.org/',
      },
    ],
  },
  'larimer-county': {
    kind: 'county',
    slug: 'larimer-county',
    name: 'Larimer County',
    summary:
      'Larimer County is the key county enforcement layer for Fort Collins and Loveland, especially when health hazards need inspection.',
    laws: [
      {
        name: 'County Public Health Enforcement',
        citation: 'Larimer County Department of Health and Environment',
        summary:
          'Larimer County is often the escalation point for mold, unsafe sanitation, pests, and environmental-health conditions in rentals.',
      },
    ],
    resources: [
      {
        name: 'Larimer County Department of Health and Environment',
        description: 'County health department handling housing and environmental-health complaints.',
        phone: '(970) 498-6700',
        url: 'https://www.larimer.gov/health',
      },
    ],
  },
  'pueblo-county': {
    kind: 'county',
    slug: 'pueblo-county',
    name: 'Pueblo County',
    summary:
      'Pueblo County is the county-level support and public-health layer for Pueblo renters.',
    laws: [
      {
        name: 'County Health Enforcement',
        citation: 'County public health authority',
        summary:
          'County-level health and environmental services can support escalation of unsafe housing conditions and sanitation complaints.',
      },
    ],
    resources: [
      {
        name: 'Housing Authority of the City of Pueblo',
        description: 'Housing authority and tenant-support resource for Pueblo renters.',
        url: 'https://www.hapueblo.org/',
      },
    ],
  },
  'weld-county': {
    kind: 'county',
    slug: 'weld-county',
    name: 'Weld County',
    summary:
      'Weld County becomes the county layer for parts of Longmont and Thornton that sit outside the Boulder and Adams county boundaries.',
    laws: [
      {
        name: 'County Public Health Enforcement',
        citation: 'County public health authority',
        summary:
          'County agencies may be the best escalation path where city identity and county health jurisdiction do not line up cleanly.',
      },
    ],
    resources: [
      {
        name: 'Colorado Legal Services',
        description: 'Colorado tenant-side legal help when county lines complicate enforcement.',
        url: 'https://www.coloradolegalservices.org/',
      },
    ],
  },
};

const COLORADO_CITY_TO_PRIMARY_COUNTY: Record<string, string> = {
  boulder: 'boulder-county',
  'fort-collins': 'larimer-county',
  'arvada-co': 'jefferson-county',
  'aurora-co': 'arapahoe-county',
  'centennial-co': 'arapahoe-county',
  'colorado-springs-co': 'el-paso-county',
  'lakewood-co': 'jefferson-county',
  'longmont-co': 'boulder-county',
  'loveland-co': 'larimer-county',
  'pueblo-co': 'pueblo-county',
  'thornton-co': 'adams-county',
  'westminster-co': 'adams-county',
};

const COLORADO_ZIP_TO_COUNTY: Record<string, string> = {
  '80002': 'jefferson-county',
  '80003': 'jefferson-county',
  '80004': 'jefferson-county',
  '80005': 'jefferson-county',
  '80007': 'jefferson-county',
  '80010': 'arapahoe-county',
  '80011': 'adams-county',
  '80012': 'arapahoe-county',
  '80013': 'arapahoe-county',
  '80014': 'arapahoe-county',
  '80015': 'arapahoe-county',
  '80016': 'arapahoe-county',
  '80017': 'arapahoe-county',
  '80018': 'arapahoe-county',
  '80019': 'adams-county',
  '80020': 'broomfield-county',
  '80021': 'jefferson-county',
  '80023': 'adams-county',
  '80030': 'adams-county',
  '80031': 'adams-county',
  '80033': 'jefferson-county',
  '80111': 'arapahoe-county',
  '80112': 'arapahoe-county',
  '80121': 'arapahoe-county',
  '80122': 'arapahoe-county',
  '80214': 'jefferson-county',
  '80215': 'jefferson-county',
  '80226': 'jefferson-county',
  '80227': 'jefferson-county',
  '80228': 'jefferson-county',
  '80229': 'adams-county',
  '80232': 'jefferson-county',
  '80233': 'adams-county',
  '80234': 'adams-county',
  '80235': 'jefferson-county',
  '80241': 'adams-county',
  '80260': 'adams-county',
  '80301': 'boulder-county',
  '80302': 'boulder-county',
  '80303': 'boulder-county',
  '80304': 'boulder-county',
  '80305': 'boulder-county',
  '80455': 'boulder-county',
  '80501': 'boulder-county',
  '80503': 'boulder-county',
  '80504': 'weld-county',
  '80521': 'larimer-county',
  '80524': 'larimer-county',
  '80525': 'larimer-county',
  '80526': 'larimer-county',
  '80528': 'larimer-county',
  '80537': 'larimer-county',
  '80538': 'larimer-county',
  '80539': 'larimer-county',
  '80602': 'weld-county',
  '80903': 'el-paso-county',
  '80904': 'el-paso-county',
  '80905': 'el-paso-county',
  '80906': 'el-paso-county',
  '80907': 'el-paso-county',
  '80909': 'el-paso-county',
  '80910': 'el-paso-county',
  '80911': 'el-paso-county',
  '80915': 'el-paso-county',
  '80916': 'el-paso-county',
  '80917': 'el-paso-county',
  '80918': 'el-paso-county',
  '80919': 'el-paso-county',
  '80920': 'el-paso-county',
  '80921': 'el-paso-county',
  '80922': 'el-paso-county',
  '80923': 'el-paso-county',
  '80924': 'el-paso-county',
  '80925': 'el-paso-county',
  '80927': 'el-paso-county',
  '80930': 'el-paso-county',
  '81001': 'pueblo-county',
  '81003': 'pueblo-county',
  '81004': 'pueblo-county',
  '81005': 'pueblo-county',
  '81006': 'pueblo-county',
  '81007': 'pueblo-county',
  '81008': 'pueblo-county',
};

const COLORADO_MULTI_COUNTY_NOTES: Partial<Record<string, string>> = {
  'aurora-co':
    'Aurora spans Arapahoe, Adams, and Douglas counties. SafeSpace uses ZIP-based routing when possible and otherwise defaults to the primary county layer.',
  'longmont-co':
    'Longmont spans Boulder and Weld counties. ZIP-based routing is used where possible because county enforcement can change by address.',
  'thornton-co':
    'Thornton spans Adams and Weld counties. County escalation may differ based on the exact address.',
  'westminster-co':
    'Westminster spans Adams, Jefferson, and Broomfield counties. SafeSpace uses ZIP-based routing when possible and otherwise defaults to Adams County.',
};

function humanizeStateRule(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return 'State rules apply.';

  const parts = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== null && entry !== undefined && entry !== '')
    .map(([key, entry]) => {
      const label = key.replace(/_/g, ' ');
      return `${label}: ${String(entry)}`;
    });

  return parts.join(' · ');
}

function buildGenericStateLayer(stateCode: string, stateProfile: StateProfile): JurisdictionLayer {
  return {
    kind: 'state',
    slug: stateCode.toLowerCase(),
    name: `${stateProfile.state} Tenant Law`,
    summary:
      `${stateProfile.state} sets the main landlord-tenant baseline for notices, deposits, retaliation, and statewide tenant protections.`,
    laws: [
      {
        name: 'State Tenant Protection Profile',
        citation: `${stateProfile.state} statewide summary`,
        summary: `Tenant protection score: ${stateProfile.tenantProtectionScore}/10.`,
      },
      {
        name: 'Security Deposits',
        citation: `${stateProfile.state} deposit rules`,
        summary: humanizeStateRule(stateProfile.securityDeposit),
      },
      {
        name: 'Eviction and Notice Rules',
        citation: `${stateProfile.state} eviction rules`,
        summary: humanizeStateRule(stateProfile.eviction),
      },
      {
        name: 'Retaliation Protection',
        citation: `${stateProfile.state} retaliation rules`,
        summary: humanizeStateRule(stateProfile.retaliationProtection),
      },
    ],
    resources: [],
  };
}

function buildDeepCityLayer(city: CityEntry): JurisdictionLayer {
  return {
    kind: 'city',
    slug: city.slug,
    name: `${city.name}, ${city.stateCode}`,
    summary:
      `${city.name} has city-specific enforcement and guidance layered on top of ${city.stateCode} law. SafeSpace uses this as the local operating layer for deadlines and agency escalation.`,
    laws: city.keyLaws.map((law) => ({
      name: law.name,
      citation: law.citation,
      summary: law.summary,
    })),
    resources: [
      {
        name: city.enforcement.healthDept.name,
        description: 'Public health inspection and environmental-health escalation.',
        phone: city.enforcement.healthDept.phone,
      },
      {
        name: city.enforcement.codeEnforcement.name,
        description: 'Local code enforcement and habitability complaints.',
        phone: city.enforcement.codeEnforcement.phone,
      },
    ],
  };
}

function buildResearchCityLayer(city: ResearchCity): JurisdictionLayer {
  const defaultColoradoLaws: JurisdictionLaw[] = [
    {
      name: 'Warranty of Habitability',
      citation: 'C.R.S. § 38-12-503',
      summary:
        'Colorado requires habitable rental housing and gives tenants remedies when unsafe conditions are not fixed.',
    },
    {
      name: 'Repair Timelines',
      citation: 'C.R.S. § 38-12-505',
      summary:
        'Emergency and urgent repair timing comes from Colorado state law, with local enforcement often handled by city and county agencies.',
    },
  ];

  return {
    kind: 'city',
    slug: city.slug,
    name: `${city.city}, ${city.state}`,
    summary:
      city.state === 'CO'
        ? `${city.city} is covered through Colorado statewide tenant law plus local city and county enforcement. Local city-specific code data is still being expanded.`
        : `${city.city} is covered through the research database. State and federal layers provide the current legal baseline while SafeSpace expands local depth.`,
    laws: city.keyLaws.length > 0
      ? city.keyLaws.map((law) => ({
          name: law.name,
          citation: law.citation,
          summary: law.summary,
        }))
      : city.state === 'CO'
        ? defaultColoradoLaws
        : [],
    resources: [],
    notes: city.state === 'CO' ? [COLORADO_MULTI_COUNTY_NOTES[city.slug] || ''] .filter(Boolean) : undefined,
  };
}

function getCountySlugForColorado(citySlug: string, zip: string): string | null {
  return COLORADO_ZIP_TO_COUNTY[zip] || COLORADO_CITY_TO_PRIMARY_COUNTY[citySlug] || null;
}

function buildCountyLayer(citySlug: string | null, stateCode: string, zip: string): JurisdictionLayer | null {
  if (stateCode !== 'CO' || !citySlug) return null;

  const countySlug = getCountySlugForColorado(citySlug, zip);
  if (!countySlug) return null;

  const layer = COLORADO_COUNTY_LAYERS[countySlug];
  if (!layer) return null;

  const note = COLORADO_MULTI_COUNTY_NOTES[citySlug];
  if (!note) return layer;

  return {
    ...layer,
    notes: [...(layer.notes || []), note],
  };
}

function getResolvedCity(city: string, stateCode: string, citySlug?: string | null): {
  citySlug: string | null;
  cityName: string;
  layer: JurisdictionLayer | null;
} {
  const deepCity = citySlug ? getCityBySlug(citySlug) : undefined;
  if (deepCity) {
    return {
      citySlug: deepCity.slug,
      cityName: deepCity.name,
      layer: buildDeepCityLayer(deepCity),
    };
  }

  const researchCity = citySlug
    ? getResearchCity(citySlug)
    : getResearchCityByName(city, stateCode);

  if (researchCity) {
    return {
      citySlug: researchCity.slug,
      cityName: researchCity.city,
      layer: buildResearchCityLayer(researchCity),
    };
  }

  return {
    citySlug: citySlug || null,
    cityName: city,
    layer: null,
  };
}

export function isColoradoResearchCitySupported(city: string, stateCode: string): boolean {
  return stateCode.toUpperCase() === 'CO' && !!getResearchCityByName(city, stateCode.toUpperCase());
}

export function resolveJurisdictionLayers(input: {
  city: string;
  state: string;
  zip: string;
  citySlug?: string | null;
}): JurisdictionResolution {
  const stateCode = input.state.toUpperCase();
  const resolvedCity = getResolvedCity(input.city, stateCode, input.citySlug);
  const countyLayer = buildCountyLayer(resolvedCity.citySlug, stateCode, input.zip);
  const stateProfile = getStateProfile(stateCode);
  const stateLayer = stateCode === 'CO'
    ? COLORADO_STATE_LAYER
    : stateProfile
      ? buildGenericStateLayer(stateCode, stateProfile)
      : null;

  const layers = [
    resolvedCity.layer,
    countyLayer,
    stateLayer,
    FEDERAL_LAYER,
  ].filter(Boolean) as JurisdictionLayer[];

  return {
    citySlug: resolvedCity.citySlug,
    cityName: resolvedCity.cityName || input.city,
    countySlug: countyLayer?.slug || null,
    countyName: countyLayer?.name || null,
    stateCode,
    layers,
  };
}

export function getJurisdictionLayersForCitySlug(citySlug: string): JurisdictionResolution | null {
  const deepCity = getCityBySlug(citySlug);
  if (deepCity) {
    return resolveJurisdictionLayers({
      city: deepCity.name,
      state: deepCity.stateCode,
      zip: '',
      citySlug,
    });
  }

  const researchCity = getResearchCity(citySlug);
  if (researchCity) {
    return resolveJurisdictionLayers({
      city: researchCity.city,
      state: researchCity.state,
      zip: '',
      citySlug,
    });
  }

  return null;
}
