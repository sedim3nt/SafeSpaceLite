/**
 * Seed Boulder rental reviews into Supabase.
 * 
 * Usage: 
 *   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npx tsx scripts/seed-boulder-reviews.ts
 * 
 * Or set env vars in .env and run:
 *   npx tsx --env-file=.env scripts/seed-boulder-reviews.ts
 * 
 * This creates properties, landlords, and reviews for Boulder seed data.
 * Uses a service-role key if available (SUPABASE_SERVICE_KEY), otherwise anon key.
 */

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { boulderSeedReviews } from '../src/data/boulderSeedReviews';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or key env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Deterministic seed user ID for seeded reviews
const SEED_USER_ID = '00000000-0000-0000-0000-000000000001';

function hashAddress(addr: string): string {
  return createHash('sha256').update(addr.toLowerCase().trim()).digest('hex');
}

async function seed() {
  console.log(`Seeding ${boulderSeedReviews.length} Boulder reviews...`);
  
  let created = 0;
  let skipped = 0;

  for (const review of boulderSeedReviews) {
    const fullAddress = `${review.propertyName}, Boulder, CO`;
    const addressHash = hashAddress(fullAddress);

    // Upsert property
    const { data: property, error: propErr } = await supabase
      .from('properties')
      .upsert({
        address_raw: fullAddress,
        address_normalized: fullAddress,
        address_hash: addressHash,
        city: 'Boulder',
        state: 'CO',
        zip: '80302',
      }, { onConflict: 'address_hash' })
      .select('id')
      .single();

    if (propErr) {
      console.error(`  ✗ Property "${review.propertyName}":`, propErr.message);
      skipped++;
      continue;
    }

    // Upsert landlord
    const landlordName = review.managementCompany;
    const { data: landlord, error: llErr } = await supabase
      .from('landlords')
      .upsert({
        name: landlordName,
        management_company: review.relationshipType === 'management_company' ? landlordName : null,
        relationship_type: review.relationshipType,
        property_id: property.id,
        created_by: SEED_USER_ID,
      }, { onConflict: 'name,property_id,relationship_type' })
      .select('id')
      .single();

    if (llErr) {
      // Try select instead
      const { data: existingLL } = await supabase
        .from('landlords')
        .select('id')
        .eq('name', landlordName)
        .eq('property_id', property.id)
        .eq('relationship_type', review.relationshipType)
        .single();
      
      if (!existingLL) {
        console.error(`  ✗ Landlord "${landlordName}":`, llErr.message);
        skipped++;
        continue;
      }

      // Insert review with existing landlord
      const { error: revErr } = await supabase.from('rental_reviews').insert({
        property_id: property.id,
        landlord_id: existingLL.id,
        reviewer_id: SEED_USER_ID,
        relationship_type: review.relationshipType,
        ...review.ratings,
        tags: review.tags,
        comment: review.comment,
        is_anonymous: true,
      });

      if (revErr) {
        if (revErr.code === '23505') {
          skipped++;
          continue;
        }
        console.error(`  ✗ Review for "${review.propertyName}":`, revErr.message);
        skipped++;
      } else {
        created++;
        console.log(`  ✓ ${review.propertyName} (${review.area})`);
      }
      continue;
    }

    // Insert review
    const { error: revErr } = await supabase.from('rental_reviews').insert({
      property_id: property.id,
      landlord_id: landlord.id,
      reviewer_id: SEED_USER_ID,
      relationship_type: review.relationshipType,
      ...review.ratings,
      tags: review.tags,
      comment: review.comment,
      is_anonymous: true,
    });

    if (revErr) {
      if (revErr.code === '23505') {
        skipped++;
        continue;
      }
      console.error(`  ✗ Review for "${review.propertyName}":`, revErr.message);
      skipped++;
    } else {
      created++;
      console.log(`  ✓ ${review.propertyName} (${review.area})`);
    }
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);
}

seed().catch(console.error);
