import type { EmergencyContact } from '../types';

export const emergencyContacts: EmergencyContact[] = [
  {
    name: 'Emergency Services (Fire, Medical)',
    phone: '911',
    description: 'For immediate life-threatening emergencies — gas leaks, fires, medical emergencies',
    emergency: true,
  },
  {
    name: 'Boulder Police (Non-Emergency)',
    phone: '(303) 441-3333',
    description: 'Non-emergency police line for noise complaints, trespassing, or landlord harassment',
    hours: '24/7',
  },
  {
    name: 'Poison Control Center',
    phone: '1-800-222-1222',
    description: 'Carbon monoxide exposure, chemical spills, mold-related poisoning questions',
    hours: '24/7',
    emergency: true,
  },
  {
    name: 'Boulder Housing Authority',
    phone: '(303) 441-3929',
    description: 'Report housing code violations, request inspections, habitability complaints',
    hours: 'Mon-Fri 8am-5pm',
  },
  {
    name: 'Boulder County Health Department',
    phone: '(303) 441-3460',
    description: 'Report health code violations and habitability issues',
    hours: 'Mon-Fri 8am-5pm',
  },
  {
    name: 'EPRAS Mediation Services',
    phone: '(303) 442-7060',
    description: 'Free mediation between tenants and landlords',
    hours: 'Mon-Fri 9am-5pm',
  },
  {
    name: 'Colorado Legal Aid',
    phone: '(303) 837-1313',
    description: 'Free legal assistance for qualifying renters',
    hours: 'Mon-Fri 9am-4pm',
  },
  {
    name: 'Boulder Housing Partners',
    phone: '(720) 564-4610',
    description: 'Affordable housing resources and tenant support',
    hours: 'Mon-Fri 8am-5pm',
  },
];
