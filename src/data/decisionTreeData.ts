import type { DecisionNode } from '../types';

export const decisionTree: Record<string, DecisionNode> = {
  start: {
    id: 'start',
    question: 'What type of health/safety issue are you experiencing?',
    options: [
      { label: 'No heat in winter', nextId: 'no-heat' },
      { label: 'Water/plumbing issues', nextId: 'water-issues' },
      { label: 'Mold or moisture', nextId: 'mold' },
      { label: 'Carbon monoxide/gas leak', nextId: 'immediate-emergency' },
      { label: 'Electrical hazards', nextId: 'electrical' },
      { label: 'Structural damage', nextId: 'structural' },
      { label: 'Pest infestation', nextId: 'pests' },
      { label: 'Other health/safety issue', nextId: 'other' },
    ],
  },

  // ── Heat ─────────────────────────────────────────────

  'no-heat': {
    id: 'no-heat',
    question: 'Is the outside temperature below 40\u00b0F?',
    options: [
      { label: 'Yes', nextId: 'heat-emergency', urgency: '24hr' },
      { label: 'No', nextId: 'heat-standard', urgency: '72hr' },
    ],
  },
  'heat-emergency': {
    id: 'heat-emergency',
    question: '',
    result: {
      urgency: '24hr',
      title: '24-Hour Emergency: No Heat in Winter',
      description:
        'Lack of heat when temperatures are below 40\u00b0F is a 24-hour emergency under Boulder law.',
      steps: [
        'Document the temperature (take photos of thermometer)',
        'Notify your landlord immediately in writing',
        'Keep all communication records',
        'If not fixed within 24 hours, you may have the right to repair and deduct or withhold rent',
        'Contact Boulder County Health Department if landlord does not respond',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-505, lack of heat in winter is considered an emergency habitability issue requiring response within 24 hours.',
    },
  },
  'heat-standard': {
    id: 'heat-standard',
    question: '',
    result: {
      urgency: '72hr',
      title: '72-Hour Response: Heating System Issue',
      description:
        'Heating system problems when temperatures are above 40\u00b0F require landlord response within 72 hours.',
      steps: [
        'Document the issue with photos or video of the heating system',
        'Record indoor temperature readings over time',
        'Notify your landlord in writing with details',
        'Use portable space heaters safely if available',
        'Follow up if no response within 72 hours',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-505, landlords must maintain heating systems in working order. Non-emergency heating issues require response within 72 hours.',
    },
  },

  // ── Water / Plumbing ─────────────────────────────────

  'water-issues': {
    id: 'water-issues',
    question: 'What type of water issue?',
    options: [
      { label: 'No running water', nextId: 'water-emergency', urgency: '24hr' },
      { label: 'No hot water', nextId: 'hot-water' },
      { label: 'Sewage backup', nextId: 'sewage-emergency', urgency: '24hr' },
      { label: 'Minor leak', nextId: 'water-standard', urgency: 'standard' },
    ],
  },
  'water-emergency': {
    id: 'water-emergency',
    question: '',
    result: {
      urgency: '24hr',
      title: '24-Hour Emergency: No Running Water',
      description:
        'Complete lack of running water is a 24-hour emergency requiring immediate landlord action.',
      steps: [
        'Document the issue with photos/videos',
        'Notify landlord immediately in writing',
        'Request immediate repair',
        'Keep records of all communications',
        'Contact health department if not resolved in 24 hours',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-505, lack of running water is an emergency habitability issue requiring response within 24 hours.',
    },
  },
  'hot-water': {
    id: 'hot-water',
    question: '',
    result: {
      urgency: '72hr',
      title: '72-Hour Response: No Hot Water',
      description:
        'Lack of hot water is considered an urgent issue requiring landlord response within 72 hours.',
      steps: [
        'Check if the water heater pilot light is on (gas) or breaker is tripped (electric)',
        'Document the issue and the date it started',
        'Notify your landlord in writing',
        'Note any other tenants affected in the building',
        'Follow up if no response within 72 hours',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-505, landlords must provide functioning hot water. Failure to do so within 72 hours of notification may entitle tenant to remedies.',
    },
  },
  'sewage-emergency': {
    id: 'sewage-emergency',
    question: '',
    result: {
      urgency: '24hr',
      title: '24-Hour Emergency: Sewage Backup',
      description:
        'Sewage backup is a serious health hazard requiring immediate 24-hour emergency response.',
      steps: [
        'Avoid contact with sewage water \u2014 it contains harmful bacteria',
        'Do not use sinks, toilets, or drains until resolved',
        'Document with photos from a safe distance',
        'Notify landlord immediately in writing',
        'Contact Boulder County Health Department if landlord does not respond within 24 hours',
        'Consider temporary relocation if the unit is uninhabitable',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-505, sewage backup constitutes an emergency habitability violation. Landlords must respond within 24 hours.',
    },
  },
  'water-standard': {
    id: 'water-standard',
    question: '',
    result: {
      urgency: 'standard',
      title: 'Standard Timeline: Minor Plumbing Leak',
      description:
        'Minor plumbing leaks generally fall under a 7-day repair timeline, unless they worsen.',
      steps: [
        'Document the leak location and severity with photos',
        'Place a bucket or towel to prevent water damage',
        'Notify your landlord in writing with photos',
        'Note if the leak is causing mold, which may escalate the timeline',
        'Follow up if no response within 7 days',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-503, landlords must maintain plumbing in good working order. Minor repairs are generally expected within 7 days of notification.',
    },
  },

  // ── Mold ─────────────────────────────────────────────

  mold: {
    id: 'mold',
    question: 'How extensive is the mold?',
    description: 'Mold coverage is measured in square feet of affected area',
    options: [
      { label: 'More than 10 square feet', nextId: 'mold-extensive', urgency: '72hr' },
      { label: 'Less than 10 square feet', nextId: 'mold-minor', urgency: 'standard' },
      { label: 'Black mold (any amount)', nextId: 'mold-black', urgency: '72hr' },
    ],
  },
  'mold-extensive': {
    id: 'mold-extensive',
    question: '',
    result: {
      urgency: '72hr',
      title: '72-Hour Response Required: Extensive Mold',
      description:
        'Mold coverage over 10 square feet requires response within 72 hours under Boulder regulations.',
      steps: [
        'Take photos of all affected areas',
        'Measure and document the size of mold areas',
        'Send written notice to landlord with photos',
        'Request professional mold remediation',
        'Keep windows open and avoid the area if possible',
        'Document any health symptoms',
      ],
      legalNotice:
        'Boulder County regulations require landlords to address mold issues over 10 sq ft within 72 hours of notification.',
    },
  },
  'mold-minor': {
    id: 'mold-minor',
    question: '',
    result: {
      urgency: 'standard',
      title: 'Standard Timeline: Minor Mold Issue',
      description:
        'Small mold areas (under 10 sq ft) fall under the standard repair timeline, but should still be documented and reported.',
      steps: [
        'Take photos of the affected area with a ruler or reference object for scale',
        'Document the location and any moisture source (leaking pipe, condensation, etc.)',
        'Notify your landlord in writing with photos',
        'Clean small surface mold with soap and water while wearing a mask',
        'Improve ventilation by opening windows or running exhaust fans',
        'Monitor for regrowth and document any health symptoms',
      ],
      legalNotice:
        'Per Boulder County mold regulations, landlords must address mold of any size. Small areas generally follow a 7\u201330 day timeline depending on the underlying cause.',
    },
  },
  'mold-black': {
    id: 'mold-black',
    question: '',
    result: {
      urgency: '72hr',
      title: '72-Hour Response Required: Black Mold',
      description:
        'Black mold (Stachybotrys) of any size is a serious health hazard requiring urgent response within 72 hours.',
      steps: [
        'Do NOT attempt to clean black mold yourself',
        'Avoid the affected area and seal it off if possible',
        'Take photos from a safe distance',
        'Notify landlord immediately in writing',
        'Request professional testing and remediation',
        'Document any health symptoms (respiratory issues, headaches, etc.)',
        'Consult a doctor if experiencing symptoms',
      ],
      legalNotice:
        'Boulder County mold regulations require professional remediation for suspected toxic mold. Landlords must respond within 72 hours and engage certified remediation professionals.',
    },
  },

  // ── Carbon Monoxide / Gas Leak ───────────────────────

  'immediate-emergency': {
    id: 'immediate-emergency',
    question: '',
    result: {
      urgency: '24hr',
      title: '24-Hour EMERGENCY: Carbon Monoxide / Gas Leak',
      description:
        'Carbon monoxide and gas leaks are life-threatening emergencies. If you smell gas or your CO detector is sounding, evacuate immediately and call 911.',
      steps: [
        'EVACUATE the building immediately \u2014 do not use light switches or electronics',
        'Call 911 from outside the building',
        'Do not re-enter until cleared by emergency responders',
        'Notify your landlord immediately',
        'Request professional inspection of all gas appliances and CO sources',
        'Document the incident and all communications',
        'Contact Boulder County Health Department for follow-up inspection',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-505 and Boulder County health codes, gas leaks and CO hazards are 24-hour emergencies. Landlords must maintain working CO detectors per C.R.S. \u00a7 38-12-801.',
    },
  },

  // ── Electrical ───────────────────────────────────────

  electrical: {
    id: 'electrical',
    question: 'What type of electrical issue?',
    options: [
      { label: 'Sparking or burning smell from outlets/wiring', nextId: 'electrical-emergency', urgency: '24hr' },
      { label: 'Frequent breaker trips or power outages', nextId: 'electrical-urgent' },
      { label: 'Non-working outlets or fixtures', nextId: 'electrical-standard' },
    ],
  },
  'electrical-emergency': {
    id: 'electrical-emergency',
    question: '',
    result: {
      urgency: '24hr',
      title: '24-Hour Emergency: Electrical Fire Hazard',
      description:
        'Sparking outlets, burning smells, or exposed wiring are fire hazards requiring immediate action.',
      steps: [
        'Do NOT touch the affected outlet or wiring',
        'Turn off the breaker for the affected circuit if safe to do so',
        'If you see flames or heavy smoke, call 911 and evacuate',
        'Document the issue with photos from a safe distance',
        'Notify your landlord immediately in writing',
        'Do not use the affected electrical system until inspected by a licensed electrician',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-505 and the National Electrical Code, electrical fire hazards are emergency habitability issues requiring 24-hour response.',
    },
  },
  'electrical-urgent': {
    id: 'electrical-urgent',
    question: '',
    result: {
      urgency: '72hr',
      title: '72-Hour Response: Electrical System Issues',
      description:
        'Frequent breaker trips or power outages may indicate an overloaded or faulty electrical system.',
      steps: [
        'Document which circuits are affected and when outages occur',
        'Avoid using high-wattage appliances on the same circuit',
        'Notify your landlord in writing with details',
        'Request a licensed electrician inspection',
        'Do not attempt electrical repairs yourself',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-503, landlords must maintain electrical systems in safe working order. Recurring electrical issues require response within 72 hours.',
    },
  },
  'electrical-standard': {
    id: 'electrical-standard',
    question: '',
    result: {
      urgency: 'standard',
      title: 'Standard Timeline: Non-Working Outlets or Fixtures',
      description:
        'Non-working outlets or light fixtures that do not pose a safety hazard fall under the standard repair timeline.',
      steps: [
        'Check that the issue is not a tripped breaker or burned-out bulb',
        'Document which outlets/fixtures are affected',
        'Notify your landlord in writing',
        'Follow up if no response within 7 days',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-503, landlords must maintain electrical systems. Non-emergency repairs are generally expected within 7\u201330 days.',
    },
  },

  // ── Structural ───────────────────────────────────────

  structural: {
    id: 'structural',
    question: 'What type of structural issue?',
    options: [
      { label: 'Ceiling/roof collapse or imminent risk', nextId: 'structural-emergency', urgency: '24hr' },
      { label: 'Large cracks, sagging floors, or broken stairs', nextId: 'structural-urgent' },
      { label: 'Minor damage (cosmetic cracks, chipped paint)', nextId: 'structural-standard' },
    ],
  },
  'structural-emergency': {
    id: 'structural-emergency',
    question: '',
    result: {
      urgency: '24hr',
      title: '24-Hour Emergency: Structural Collapse Risk',
      description:
        'Imminent or actual structural collapse is a life-safety emergency requiring immediate action.',
      steps: [
        'Evacuate the affected area immediately',
        'Call 911 if anyone is trapped or injured',
        'Do not re-enter until the structure is inspected',
        'Document from a safe distance with photos',
        'Notify your landlord immediately in writing',
        'Contact Boulder County Building Department for emergency inspection',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-505 and Boulder building codes, structural hazards threatening occupant safety are 24-hour emergencies.',
    },
  },
  'structural-urgent': {
    id: 'structural-urgent',
    question: '',
    result: {
      urgency: '72hr',
      title: '72-Hour Response: Significant Structural Damage',
      description:
        'Large cracks, sagging floors, or broken stairs pose safety risks and require prompt attention.',
      steps: [
        'Avoid using damaged stairs or walking on sagging floors',
        'Document all damage with photos and measurements',
        'Notify your landlord in writing with details',
        'Request a professional structural inspection',
        'Follow up if no response within 72 hours',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-503, landlords must maintain structural integrity. Safety-related structural issues require response within 72 hours.',
    },
  },
  'structural-standard': {
    id: 'structural-standard',
    question: '',
    result: {
      urgency: 'standard',
      title: 'Standard Timeline: Minor Structural/Cosmetic Damage',
      description:
        'Cosmetic cracks, chipped paint, or minor wear fall under the standard maintenance timeline.',
      steps: [
        'Document the damage with photos',
        'Notify your landlord in writing',
        'Note whether the damage is worsening over time',
        'Follow up if no response within 30 days',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-503, landlords are responsible for maintaining the property. Cosmetic and minor issues generally follow a 30-day timeline.',
    },
  },

  // ── Pests ────────────────────────────────────────────

  pests: {
    id: 'pests',
    question: 'What type of pest problem?',
    options: [
      { label: 'Rodents (mice, rats)', nextId: 'pests-rodents' },
      { label: 'Bed bugs', nextId: 'pests-bedbugs' },
      { label: 'Cockroaches or other insects', nextId: 'pests-insects' },
    ],
  },
  'pests-rodents': {
    id: 'pests-rodents',
    question: '',
    result: {
      urgency: '72hr',
      title: '72-Hour Response: Rodent Infestation',
      description:
        'Rodents carry diseases and contaminate food. This is a health hazard requiring prompt action.',
      steps: [
        'Document evidence of rodents (droppings, gnaw marks, nesting material)',
        'Store all food in sealed containers',
        'Do not use poison if you have pets or children',
        'Notify your landlord in writing with photos',
        'Request professional pest control service',
        'Document any damage to property or belongings',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-503 and Boulder County health codes, landlords must maintain pest-free conditions. Rodent infestations are health hazards requiring response within 72 hours.',
    },
  },
  'pests-bedbugs': {
    id: 'pests-bedbugs',
    question: '',
    result: {
      urgency: '72hr',
      title: '72-Hour Response: Bed Bug Infestation',
      description:
        'Bed bugs are a significant health and quality-of-life issue requiring professional treatment.',
      steps: [
        'Do not throw out furniture \u2014 it can spread the infestation',
        'Document bites and evidence (bugs, shells, blood spots on sheets)',
        'Wash and dry all bedding and clothing on high heat',
        'Notify your landlord in writing immediately',
        'Request professional pest control (heat treatment is most effective)',
        'Cooperate with treatment preparation requirements',
      ],
      legalNotice:
        'Per Boulder County regulations and Colorado landlord-tenant law, landlords are responsible for pest control in multi-unit buildings. Bed bug treatment typically requires professional intervention within 72 hours.',
    },
  },
  'pests-insects': {
    id: 'pests-insects',
    question: '',
    result: {
      urgency: 'standard',
      title: 'Standard Timeline: Insect Infestation',
      description:
        'Cockroach or insect infestations should be addressed, but generally fall under the standard repair timeline unless severe.',
      steps: [
        'Document the extent of the infestation with photos',
        'Clean and store food in sealed containers',
        'Seal any visible cracks or entry points temporarily',
        'Notify your landlord in writing',
        'Request professional pest control treatment',
        'Follow up if no response within 7 days',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-503, landlords must maintain habitable conditions including pest control. Standard insect issues follow a 7\u201330 day timeline.',
    },
  },

  // ── Other ────────────────────────────────────────────

  other: {
    id: 'other',
    question: 'Is this issue an immediate threat to health or safety?',
    options: [
      { label: 'Yes \u2014 someone could be seriously harmed', nextId: 'other-emergency', urgency: '24hr' },
      { label: 'No \u2014 but it needs to be fixed', nextId: 'other-standard', urgency: 'standard' },
    ],
  },
  'other-emergency': {
    id: 'other-emergency',
    question: '',
    result: {
      urgency: '24hr',
      title: '24-Hour Emergency: Immediate Health/Safety Threat',
      description:
        'Any condition that poses an immediate threat to health or safety is a 24-hour emergency.',
      steps: [
        'If anyone is in immediate danger, call 911',
        'Evacuate the area if necessary',
        'Document the hazard with photos or video',
        'Notify your landlord immediately in writing',
        'Contact Boulder County Health Department for inspection',
        'Keep records of all communications and expenses',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-505, conditions that pose immediate threats to health or safety are emergency habitability issues requiring 24-hour response.',
    },
  },
  'other-standard': {
    id: 'other-standard',
    question: '',
    result: {
      urgency: 'standard',
      title: 'Standard Timeline: Non-Emergency Repair',
      description:
        'Non-emergency maintenance and repair issues follow the standard timeline of 7\u201330 days.',
      steps: [
        'Document the issue with photos and description',
        'Notify your landlord in writing',
        'Include specific details about what needs repair',
        'Keep copies of all written notices',
        'Follow up in writing if no response within 7 days',
        'Contact EPRAS Mediation if the issue is not addressed within 30 days',
      ],
      legalNotice:
        'Per Colorado Revised Statutes \u00a7 38-12-503, landlords must maintain rental properties in habitable condition. Standard repairs are generally expected within 7\u201330 days of written notification.',
    },
  },
};
