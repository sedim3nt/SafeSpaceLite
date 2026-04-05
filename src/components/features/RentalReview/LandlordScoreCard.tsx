import { useEffect, useState } from 'react';
import { Card } from '../../common';
import { supabase } from '../../../lib/supabase';
import type {
  Landlord,
  RentalReview,
  LandlordScore,
  ReviewResponse,
} from '../../../types/database';

const RELATIONSHIP_BADGES: Record<string, { icon: string; label: string }> = {
  property_owner: { icon: '🏠', label: 'Landlord' },
  management_company: { icon: '🏢', label: 'Management' },
  master_tenant: { icon: '🔑', label: 'Master Tenant' },
  owner_occupant: { icon: '🏡', label: 'Owner-Occupant' },
  coop: { icon: '🤝', label: 'Co-op' },
};

const CATEGORY_LABELS: Record<string, string> = {
  avg_responsiveness: 'Responsiveness',
  avg_fairness: 'Fairness',
  avg_respect: 'Respect',
  avg_temperament: 'Temperament',
  avg_property_condition: 'Property Condition',
  avg_communication: 'Communication',
  avg_safety: 'Safety',
};

function getLetterGrade(score: number): { grade: string; color: string } {
  if (score >= 4.5) return { grade: 'A', color: 'text-green-700 bg-green-100' };
  if (score >= 3.5) return { grade: 'B', color: 'text-lime-700 bg-lime-100' };
  if (score >= 2.5) return { grade: 'C', color: 'text-yellow-700 bg-yellow-100' };
  if (score >= 1.5) return { grade: 'D', color: 'text-orange-700 bg-orange-100' };
  return { grade: 'F', color: 'text-red-700 bg-red-100' };
}

function getBarColor(): string {
  return 'bg-sage-600';
}

interface LandlordScoreCardProps {
  propertyId: string;
  refreshToken?: number;
  onLoadingChange?: (loading: boolean) => void;
}

export function LandlordScoreCard({ propertyId, refreshToken = 0, onLoadingChange }: LandlordScoreCardProps) {
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [reviews, setReviews] = useState<RentalReview[]>([]);
  const [scores, setScores] = useState<LandlordScore[]>([]);
  const [reviewResponses, setReviewResponses] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [landlordRes, reviewRes, reviewResponseRes] = await Promise.all([
        supabase.from('landlords').select('*').eq('property_id', propertyId),
        supabase.from('rental_reviews').select('*').eq('property_id', propertyId).order('created_at', { ascending: false }),
        supabase.from('review_responses').select('*').eq('property_id', propertyId),
      ]);

      const fetchedLandlords = landlordRes.data || [];
      const fetchedReviews = reviewRes.data || [];
      setLandlords(fetchedLandlords);
      setReviews(fetchedReviews);
      setReviewResponses(reviewResponseRes.data || []);

      if (fetchedLandlords.length > 0) {
        const ids = fetchedLandlords.map((l) => l.id);
        const { data: scoreData } = await supabase
          .from('landlord_scores')
          .select('*')
          .in('landlord_id', ids);
        setScores(scoreData || []);
      }

      setLoading(false);
    }
    fetchData();
  }, [propertyId, refreshToken]);

  if (loading) {
    return <p className="text-sm text-text-muted py-4">Loading rental reviews...</p>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-muted">No rental reviews yet for this property.</p>
        <p className="mt-1 text-sm text-text-muted">Check back here as tenant reviews are added.</p>
      </div>
    );
  }

  // Compute tag frequencies across all reviews
  const tagCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    r.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div className="space-y-2 pt-4">
        <h3 className="text-xl font-semibold text-text">Rental Experience</h3>
        <p className="text-sm text-text-muted">
          Review patterns, landlord responses, and renter-reported experience for this property.
        </p>
      </div>

      {/* Per-landlord score cards */}
      {scores.map((score) => {
        const landlord = landlords.find((l) => l.id === score.landlord_id);
        if (!landlord) return null;
        const { grade, color } = getLetterGrade(score.overall_score);
        const badge = RELATIONSHIP_BADGES[landlord.relationship_type] || { icon: '', label: '' };

        return (
          <Card key={score.landlord_id} className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text">{landlord.name}</h3>
                {landlord.management_company && (
                  <p className="text-sm text-text-muted">{landlord.management_company}</p>
                )}
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-bamboo-100 text-bamboo-700 text-sm font-medium">
                  {badge.icon} {badge.label}
                </span>
              </div>
              <div className={`flex items-center justify-center w-14 h-14 rounded-lg text-2xl font-bold ${color}`}>
                {grade}
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-text">{score.overall_score}</span>
              <span className="text-sm text-text-muted">/ 5 from {score.review_count} review{score.review_count !== 1 ? 's' : ''}</span>
            </div>

            {/* Category bars */}
            <div className="space-y-2">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const val = score[key as keyof LandlordScore] as number;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-sm text-text">{label}</span>
                    <div className="h-4 flex-1 overflow-hidden rounded-full bg-sage-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
                        style={{ width: `${(val / 5) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-medium text-text">{val}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      {/* Tag frequency */}
      {sortedTags.length > 0 && (
        <div className="pt-4">
          <h3 className="mb-3 text-xl font-semibold text-text">Common Themes</h3>
          <div className="flex flex-wrap gap-2">
            {sortedTags.slice(0, 10).map(([tag, count]) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-3.5 py-1.5 text-sm font-medium text-sage-700"
              >
                {tag}
                <span className="rounded-full bg-sage-200 px-2 py-0.5 text-sm text-sage-800">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent reviews */}
      <div className="space-y-3 pt-4">
        <h3 className="text-xl font-semibold text-text">Recent Reviews</h3>
        {reviews.map((review) => {
          const badge = RELATIONSHIP_BADGES[review.relationship_type] || { icon: '', label: '' };
          const avg = (
            (review.responsiveness + review.fairness + review.respect + review.temperament +
              review.property_condition + review.communication + review.safety) / 7
          ).toFixed(1);
          const reviewResponse = reviewResponses.find((response) => response.review_id === review.id);

          return (
            <Card key={review.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bamboo-100 text-bamboo-700 text-sm font-medium">
                  {badge.icon} {badge.label}
                </span>
                <span className="text-sm font-semibold text-text">{avg} / 5</span>
              </div>

              {review.tags && review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {review.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-sage-50 px-3 py-1 text-sm text-sage-600">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {review.comment && (
                <p className="text-sm text-text leading-relaxed">{review.comment}</p>
              )}

              <p className="text-sm text-text-muted">
                {new Date(review.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
                {review.is_anonymous && ' · Anonymous'}
              </p>

              {reviewResponse ? (
                <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-sm font-medium text-teal-700">
                      Landlord Response
                    </span>
                    {reviewResponse.is_verified && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-medium text-emerald-700">
                        Verified Owner
                      </span>
                    )}
                    <time className="ml-auto text-sm text-text-muted">
                      {new Date(reviewResponse.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="text-sm text-teal-900">{reviewResponse.body}</p>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
