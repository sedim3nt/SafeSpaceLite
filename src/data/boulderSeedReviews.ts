/**
 * Seed reviews for Boulder properties to populate the launch experience.
 * These use fictional property management companies and realistic scenarios.
 * 
 * To seed into Supabase, run: npx tsx scripts/seed-boulder-reviews.ts
 */

export interface SeedReview {
  propertyName: string;
  area: string;
  managementCompany: string;
  relationshipType: string;
  ratings: {
    responsiveness: number;
    fairness: number;
    respect: number;
    temperament: number;
    property_condition: number;
    communication: number;
    safety: number;
  };
  tags: string[];
  comment: string;
}

export const boulderSeedReviews: SeedReview[] = [
  // University Hill area — student rentals
  {
    propertyName: '1140 University Ave',
    area: 'University Hill',
    managementCompany: 'Peak Property Management',
    relationshipType: 'management_company',
    ratings: { responsiveness: 2, fairness: 2, respect: 3, temperament: 3, property_condition: 2, communication: 2, safety: 3 },
    tags: ['Withheld deposit', 'Raised rent unfairly'],
    comment: 'Lived here for two years as a CU student. They raised rent 15% between leases with zero improvements. When I moved out, they charged $400 for "carpet cleaning" on carpet that was already stained when I moved in. Took 3 months to get the rest of my deposit back.',
  },
  {
    propertyName: '905 Pleasant St',
    area: 'University Hill',
    managementCompany: 'Peak Property Management',
    relationshipType: 'management_company',
    ratings: { responsiveness: 1, fairness: 1, respect: 2, temperament: 2, property_condition: 1, communication: 1, safety: 2 },
    tags: ['Withheld deposit', 'Impossible to reach'],
    comment: 'The heat went out in January and it took them 4 days to fix it. That\'s a 24-hour emergency under Colorado law. I had to buy a space heater. When I asked about a rent reduction they ghosted me. Bathroom had visible mold the entire time I lived there.',
  },
  {
    propertyName: '1035 13th St',
    area: 'University Hill',
    managementCompany: 'Flatirons Living',
    relationshipType: 'management_company',
    ratings: { responsiveness: 3, fairness: 3, respect: 4, temperament: 4, property_condition: 3, communication: 3, safety: 4 },
    tags: ['Responsive repairs'],
    comment: 'Decent for a Hill rental. They fix things within a reasonable time and the office staff are professional. Not the cheapest option but at least you get what you pay for. My biggest complaint is thin walls but that\'s the building, not management.',
  },
  // Bear Creek area
  {
    propertyName: '2850 Table Mesa Dr',
    area: 'Bear Creek',
    managementCompany: 'Mesa Ridge Rentals',
    relationshipType: 'management_company',
    ratings: { responsiveness: 2, fairness: 2, respect: 2, temperament: 1, property_condition: 3, communication: 2, safety: 3 },
    tags: ['Threatened eviction', 'Retaliatory'],
    comment: 'Filed a complaint about a broken CO detector and suddenly got a lease violation for "noise" that never existed. Classic retaliation. I documented everything and they backed off, but the experience was stressful. Other tenants warned me this is their pattern.',
  },
  {
    propertyName: '3040 Bear Creek Ave',
    area: 'Bear Creek',
    managementCompany: 'Pearl Street Rentals',
    relationshipType: 'property_owner',
    ratings: { responsiveness: 4, fairness: 4, respect: 5, temperament: 5, property_condition: 4, communication: 4, safety: 5 },
    tags: ['Great landlord', 'Returned deposit', 'Responsive repairs'],
    comment: 'One of the best rental experiences I\'ve had in Boulder. Owner is responsive, fair with deposit deductions, and actually invested in maintaining the property. Replaced the aging water heater before it became a problem. Would rent from them again.',
  },
  // Martin Acres
  {
    propertyName: '3200 Moorhead Ave',
    area: 'Martin Acres',
    managementCompany: 'Flatirons Living',
    relationshipType: 'management_company',
    ratings: { responsiveness: 3, fairness: 2, respect: 3, temperament: 3, property_condition: 2, communication: 3, safety: 3 },
    tags: ['Withheld deposit', 'Hidden fees'],
    comment: 'The apartment itself was fine but move-out was a nightmare. Charged $600 in "cleaning fees" for a place I left spotless — I have photos. They also tacked on a $200 "lease processing fee" at renewal that wasn\'t in the original lease. Deposit took the full 60 days to return.',
  },
  {
    propertyName: '2680 Kalmia Ave',
    area: 'Martin Acres',
    managementCompany: 'Baseline Property Group',
    relationshipType: 'management_company',
    ratings: { responsiveness: 2, fairness: 3, respect: 2, temperament: 2, property_condition: 2, communication: 2, safety: 2 },
    tags: ['Entered without notice', 'Lost maintenance requests'],
    comment: 'Maintenance came into my unit twice without any notice — not even a note. That\'s a violation of my privacy rights. When I submitted repair requests through their portal they would disappear. I started sending everything via email so I had a paper trail.',
  },
  // Downtown Boulder
  {
    propertyName: '1520 Pearl St',
    area: 'Downtown',
    managementCompany: 'Pearl Street Rentals',
    relationshipType: 'management_company',
    ratings: { responsiveness: 4, fairness: 3, respect: 4, temperament: 4, property_condition: 4, communication: 4, safety: 4 },
    tags: ['Responsive repairs', 'Raised rent unfairly'],
    comment: 'Great location and they maintain the building well. Only complaint is the annual rent increase — went up $200/month this year which felt aggressive for a lease renewal. But day-to-day management is solid. They actually respond to emails within 24 hours.',
  },
  {
    propertyName: '1200 Walnut St',
    area: 'Downtown',
    managementCompany: 'Canyon View Properties',
    relationshipType: 'management_company',
    ratings: { responsiveness: 1, fairness: 1, respect: 1, temperament: 2, property_condition: 1, communication: 1, safety: 2 },
    tags: ['Withheld deposit', 'Impossible to reach', 'Retaliatory'],
    comment: 'Worst rental experience in 5 years of renting in Boulder. Roach infestation that took 3 months to address. When I contacted the health department they tried to non-renew my lease. Withheld my entire $2,200 deposit for "damages" that were normal wear and tear. Currently in small claims court.',
  },
  {
    propertyName: '2020 Broadway',
    area: 'Downtown',
    managementCompany: 'Flatirons Living',
    relationshipType: 'management_company',
    ratings: { responsiveness: 3, fairness: 3, respect: 3, temperament: 3, property_condition: 3, communication: 3, safety: 4 },
    tags: ['High turnover staff'],
    comment: 'Middle of the road. The building is aging but they keep up with repairs. Staff turnover means you\'re re-explaining issues constantly. Deposit was returned on time with reasonable deductions. Nothing special but nothing terrible.',
  },
  // North Boulder
  {
    propertyName: '4850 North Broadway',
    area: 'North Boulder',
    managementCompany: 'Alpine Property Management',
    relationshipType: 'management_company',
    ratings: { responsiveness: 4, fairness: 4, respect: 4, temperament: 5, property_condition: 4, communication: 5, safety: 5 },
    tags: ['Great landlord', 'Returned deposit', 'Responsive repairs'],
    comment: 'Honestly can\'t complain. They use an app for maintenance requests and everything gets handled within 48 hours. Full deposit returned within 2 weeks of move-out. The property manager actually cares. This is how it should work everywhere.',
  },
  {
    propertyName: '3460 Iris Ave',
    area: 'North Boulder',
    managementCompany: 'Baseline Property Group',
    relationshipType: 'property_owner',
    ratings: { responsiveness: 2, fairness: 3, respect: 3, temperament: 3, property_condition: 3, communication: 2, safety: 3 },
    tags: [],
    comment: 'Owner lives out of state and is hard to reach. Not malicious, just slow and disorganized. Plumbing issue took 2 weeks to fix. The unit itself is decent and rent is fair for North Boulder. Just be prepared to follow up on everything multiple times.',
  },
  // Gunbarrel
  {
    propertyName: '6325 Gunpark Dr',
    area: 'Gunbarrel',
    managementCompany: 'Peak Property Management',
    relationshipType: 'management_company',
    ratings: { responsiveness: 3, fairness: 2, respect: 3, temperament: 3, property_condition: 3, communication: 3, safety: 4 },
    tags: ['Raised rent unfairly', 'Hidden fees'],
    comment: 'Gunbarrel used to be affordable. My rent went from $1,400 to $1,750 in two years. They added a $50/month "amenity fee" for a gym that\'s a closet with one treadmill. Building is maintained okay but the nickel-and-diming is real.',
  },
  {
    propertyName: '5050 Stonewall Ave',
    area: 'Gunbarrel',
    managementCompany: 'Alpine Property Management',
    relationshipType: 'management_company',
    ratings: { responsiveness: 3, fairness: 3, respect: 4, temperament: 4, property_condition: 3, communication: 3, safety: 4 },
    tags: ['Responsive repairs'],
    comment: 'Solid Gunbarrel complex. Nothing fancy but well-managed. They replaced the HVAC in our building last summer without any drama. Parking is included which is a plus. Rent increases have been reasonable — about 3-4% annually.',
  },
  // ESA-specific reviews
  {
    propertyName: '2400 Arapahoe Ave',
    area: 'Downtown',
    managementCompany: 'Canyon View Properties',
    relationshipType: 'management_company',
    ratings: { responsiveness: 1, fairness: 1, respect: 1, temperament: 1, property_condition: 3, communication: 1, safety: 2 },
    tags: ['Retaliatory', 'Threatened eviction'],
    comment: 'Denied my ESA despite providing proper documentation from my therapist. They said their "no pets policy" overrides federal law — it doesn\'t. Had to get Colorado Legal Services involved. They finally complied but the hostility was unacceptable. Other tenants with ESAs reported similar treatment.',
  },
  // Student noise complaint weaponization
  {
    propertyName: '820 University Ave',
    area: 'University Hill',
    managementCompany: 'Mesa Ridge Rentals',
    relationshipType: 'management_company',
    ratings: { responsiveness: 2, fairness: 1, respect: 2, temperament: 2, property_condition: 2, communication: 2, safety: 3 },
    tags: ['Retaliatory', 'Threatened eviction'],
    comment: 'Got 3 "noise violations" in one month for having friends over at 7pm on a Saturday. We weren\'t even loud — our neighbor confirmed it. Felt like they were trying to build a case to evict us before summer when they could charge more rent. Classic student harassment.',
  },
  // Positive CU-area review
  {
    propertyName: '1660 Euclid Ave',
    area: 'University Hill',
    managementCompany: 'Pearl Street Rentals',
    relationshipType: 'management_company',
    ratings: { responsiveness: 4, fairness: 4, respect: 4, temperament: 4, property_condition: 3, communication: 4, safety: 4 },
    tags: ['Great landlord', 'Returned deposit', 'Responsive repairs'],
    comment: 'Rented here all 4 years of college. They treat student tenants with respect which is sadly rare on the Hill. Had a plumbing issue once and it was fixed same day. Full deposit returned. If you can get a unit here, take it.',
  },
];
