import type { Property } from '../types';

export const seedProperties: Record<string, Property> = {
  '1234 pearl st': {
    address: '1234 Pearl St, Boulder, CO 80302',
    landlord: 'Boulder Property Management LLC',
    licenseStatus: 'Active',
    violations: [
      {
        date: '2024-01-15',
        type: 'Mold',
        status: 'Resolved',
        description:
          'Black mold found in bathroom ceiling, remediated within 72 hours',
      },
      {
        date: '2023-11-20',
        type: 'Heating',
        status: 'Resolved',
        description: 'No heat during cold snap, fixed within 24 hours',
      },
    ],
    comments: [
      {
        id: '1',
        text: 'Had serious mold issues in the bathroom. Landlord did fix it eventually but took multiple requests.',
        date: '2024-01-20',
        helpful: 12,
        anonymous: true,
      },
      {
        id: '2',
        text: 'Heat went out in December and they fixed it the same day. Good response time for emergencies.',
        date: '2023-12-01',
        helpful: 8,
        anonymous: false,
      },
    ],
  },
  '2500 arapahoe ave': {
    address: '2500 Arapahoe Ave, Boulder, CO 80302',
    landlord: 'Peak Living Properties',
    licenseStatus: 'Active',
    violations: [
      {
        date: '2024-03-10',
        type: 'Plumbing',
        status: 'Resolved',
        description: 'Hot water heater failure in unit 4B, replaced within 48 hours',
      },
      {
        date: '2024-06-22',
        type: 'Pest Infestation',
        status: 'Pending',
        description: 'Cockroach infestation reported in multiple units, treatment ongoing',
      },
    ],
    comments: [
      {
        id: '3',
        text: 'Cockroach problem has been going on for months. Landlord sprayed once but they came back. Very frustrating.',
        date: '2024-07-01',
        helpful: 15,
        anonymous: true,
      },
    ],
  },
  '900 baseline rd': {
    address: '900 Baseline Rd, Boulder, CO 80302',
    landlord: 'CU Rentals Inc.',
    licenseStatus: 'Active',
    violations: [],
    comments: [
      {
        id: '4',
        text: 'Great landlord. Very responsive to maintenance requests. No health issues in 2 years.',
        date: '2024-02-15',
        helpful: 20,
        anonymous: false,
      },
    ],
  },
  '1600 broadway': {
    address: '1600 Broadway, Boulder, CO 80302',
    landlord: 'Front Range Housing LLC',
    licenseStatus: 'Expired',
    violations: [
      {
        date: '2024-05-01',
        type: 'Mold',
        status: 'Unresolved',
        description:
          'Extensive mold in basement units due to ongoing moisture intrusion, no remediation action taken',
      },
      {
        date: '2024-04-15',
        type: 'Structural',
        status: 'Unresolved',
        description: 'Cracked foundation allowing water seepage into basement apartments',
      },
      {
        date: '2023-12-10',
        type: 'Heating',
        status: 'Resolved',
        description: 'Boiler failure in winter, took 3 days to repair (exceeded 24hr deadline)',
      },
    ],
    comments: [
      {
        id: '5',
        text: 'Terrible mold in the basement. Landlord ignores all requests. Had to involve the health department.',
        date: '2024-05-20',
        helpful: 25,
        anonymous: true,
      },
      {
        id: '6',
        text: 'Heating took 3 days to fix in December. We were freezing. Landlord did not care.',
        date: '2023-12-15',
        helpful: 18,
        anonymous: true,
      },
    ],
  },
  '3100 28th st': {
    address: '3100 28th St, Boulder, CO 80301',
    landlord: 'University Hill Partners',
    licenseStatus: 'Active',
    violations: [
      {
        date: '2024-02-28',
        type: 'Electrical',
        status: 'Resolved',
        description: 'Faulty wiring in kitchen causing breaker trips, rewired by licensed electrician',
      },
    ],
    comments: [
      {
        id: '7',
        text: 'Had an electrical issue, landlord sent an electrician the next day. Properly fixed.',
        date: '2024-03-05',
        helpful: 6,
        anonymous: false,
      },
    ],
  },
  '4800 baseline rd': {
    address: '4800 Baseline Rd, Boulder, CO 80303',
    landlord: 'Flatiron Property Group',
    licenseStatus: 'Active',
    violations: [
      {
        date: '2024-08-10',
        type: 'Plumbing',
        status: 'Resolved',
        description: 'Sewage backup in ground floor unit, emergency repair completed same day',
      },
    ],
    comments: [],
  },
  '2000 walnut st': {
    address: '2000 Walnut St, Boulder, CO 80302',
    landlord: 'Rocky Mountain Rentals',
    licenseStatus: 'Active',
    violations: [
      {
        date: '2024-07-15',
        type: 'Mold',
        status: 'Resolved',
        description: 'Mold behind bathroom drywall discovered during renovation, professionally remediated',
      },
      {
        date: '2024-01-05',
        type: 'Heating',
        status: 'Resolved',
        description: "Furnace malfunction on New Year's weekend, repaired within 18 hours",
      },
    ],
    comments: [
      {
        id: '8',
        text: 'Furnace broke on a holiday weekend and they still got it fixed quickly. Impressed with the response.',
        date: '2024-01-10',
        helpful: 11,
        anonymous: false,
      },
    ],
  },
  '750 pearl st': {
    address: '750 Pearl St, Boulder, CO 80302',
    landlord: 'Downtown Boulder Properties',
    licenseStatus: 'Active',
    violations: [
      {
        date: '2024-09-01',
        type: 'Pest Infestation',
        status: 'Resolved',
        description: 'Bed bug infestation in unit 2A, heat treatment performed successfully',
      },
    ],
    comments: [
      {
        id: '9',
        text: 'Bed bugs were a nightmare but landlord paid for professional heat treatment and it worked. Good handling of a bad situation.',
        date: '2024-09-15',
        helpful: 14,
        anonymous: true,
      },
    ],
  },
  '1800 canyon blvd': {
    address: '1800 Canyon Blvd, Boulder, CO 80302',
    landlord: 'Canyon Creek Management',
    licenseStatus: 'Active',
    violations: [],
    comments: [
      {
        id: '10',
        text: 'Well maintained building. Landlord does annual radon testing and shares results proactively.',
        date: '2024-04-01',
        helpful: 9,
        anonymous: false,
      },
    ],
  },
  '5500 table mesa dr': {
    address: '5500 Table Mesa Dr, Boulder, CO 80305',
    landlord: 'Mesa Housing Group',
    licenseStatus: 'Active',
    violations: [
      {
        date: '2024-06-01',
        type: 'Structural',
        status: 'Pending',
        description: 'Sagging floor in second-story apartment, structural engineer assessment scheduled',
      },
    ],
    comments: [
      {
        id: '11',
        text: 'Floor in my apartment feels like it sags. Reported it and they are getting an engineer. Waiting on results.',
        date: '2024-06-15',
        helpful: 5,
        anonymous: true,
      },
    ],
  },
  '1200 college ave': {
    address: '1200 College Ave, Boulder, CO 80302',
    landlord: 'University Rentals Boulder',
    licenseStatus: 'Active',
    violations: [
      {
        date: '2024-10-01',
        type: 'Mold',
        status: 'Pending',
        description: 'Mold growth around windows in multiple units, likely due to poor insulation and condensation',
      },
      {
        date: '2024-03-20',
        type: 'Plumbing',
        status: 'Resolved',
        description: 'Persistent kitchen sink leak repaired after second request',
      },
    ],
    comments: [
      {
        id: '12',
        text: "Mold around the windows every winter. They clean it but it always comes back because they won't fix the insulation.",
        date: '2024-10-10',
        helpful: 17,
        anonymous: true,
      },
      {
        id: '13',
        text: 'Plumbing issue took two requests but they did eventually fix it properly.',
        date: '2024-04-01',
        helpful: 4,
        anonymous: false,
      },
    ],
  },
  '3300 iris ave': {
    address: '3300 Iris Ave, Boulder, CO 80301',
    landlord: 'North Boulder Homes',
    licenseStatus: 'Active',
    violations: [
      {
        date: '2024-11-15',
        type: 'Carbon Monoxide',
        status: 'Resolved',
        description: 'CO detector alarm triggered, gas furnace inspection found cracked heat exchanger, replaced immediately',
      },
    ],
    comments: [
      {
        id: '14',
        text: 'CO detector went off and landlord had the furnace replaced the same day. Very serious but handled well.',
        date: '2024-11-20',
        helpful: 22,
        anonymous: false,
      },
    ],
  },
};
