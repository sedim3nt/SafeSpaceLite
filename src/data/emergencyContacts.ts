import type { EmergencyContact } from '../types';

export const emergencyContacts: EmergencyContact[] = [
  {
    name: 'Emergency Services',
    phone: '911',
    description: 'For immediate health/safety emergencies',
    emergency: true,
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
