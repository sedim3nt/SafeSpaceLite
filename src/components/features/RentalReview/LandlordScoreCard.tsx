import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../../common';
import { supabase } from '../../../lib/supabase';
import type {
  Landlord,
  RentalReview,
  LandlordScore,
  ReviewResponse,
} from '../../../types/database';
import { LandlordResponseForm } from '../LandlordResponses/LandlordResponseForm';

const RELATIONSHIP_BADGES: Record<string, { icon: string; label: string }> = {
  property_owner: { icon: '🏠', label: 'Property Owner' },
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

function getBarColor(score: number): string {
  if (score >= 4.5) return 'bg-green-500';
  if (score >= 3.5) return 'bg-lime-500';
  if (score >= 2.5) return 'bg-yellow-500';
  if (score >= 1.5) return 'bg-orange-500';
  return 'bg-red-500';
}

interface LandlordScoreCardProps {
  propertyId: string;
  refreshToken?: number;
}

export function LandlordScoreCard({ propertyId, refreshToken = 0 }: LandlordScoreCardProps) {
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [reviews, setReviews] = useState<RentalReview[]>([]);
  const [scores, setScores] = useState<LandlordScore[]>([]);
  const [reviewResponses, setReviewResponses] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openResponseFor, setOpenResponseFor] = useState<string | null>(null);

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
        <p className="text-sm text-text-muted mt-1">Be the first to share your experience.</p>
        <Link to="/review">
          <Button size="sm" className="mt-4">Write a Review</Button>
        </Link>
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
      <div className="space-y-2">
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
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-bamboo-100 text-bamboo-700 text-xs font-medium">
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
                    <span className="text-xs text-text-muted w-28 shrink-0">{label}</span>
                    <div className="flex-1 h-2 bg-sage-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getBarColor(val)}`}
                        style={{ width: `${(val / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-text w-6 text-right">{val}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      {/* Tag frequency */}
      {sortedTags.length > 0 && (
        <div>
          <h3 className="mb-3 text-3xl font-bold tracking-tight text-ink">Common Themes</h3>
          <div className="flex flex-wrap gap-2">
            {sortedTags.slice(0, 10).map(([tag, count]) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-100 text-sage-700 text-xs font-medium"
              >
                {tag}
                <span className="bg-sage-200 text-sage-800 rounded-full px-1.5 text-xs">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent reviews */}
      <div className="space-y-3">
        <h3 className="text-3xl font-bold tracking-tight text-ink">Recent Reviews</h3>
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
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bamboo-100 text-bamboo-700 text-xs font-medium">
                  {badge.icon} {badge.label}
                </span>
                <span className="text-sm font-semibold text-text">{avg} / 5</span>
              </div>

              {review.tags && review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {review.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-sage-50 text-sage-600 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {review.comment && (
                <p className="text-sm text-text leading-relaxed">{review.comment}</p>
              )}

              <p className="text-xs text-text-muted">
                {new Date(review.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
                {review.is_anonymous && ' · Anonymous'}
              </p>

              {reviewResponse ? (
                <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                      Landlord Response
                    </span>
                    {reviewResponse.is_verified && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        Verified Owner
                      </span>
                    )}
                    <time className="ml-auto text-xs text-text-muted">
                      {new Date(reviewResponse.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="text-sm text-teal-900">{reviewResponse.body}</p>
                </div>
              ) : (
                <div className="space-y-3 border-t border-border pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-text">Own or manage this property?</p>
                      <p className="text-xs text-text-muted">
                        Add one paid public response to this rental review.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={openResponseFor === review.id ? 'ghost' : 'secondary'}
                      onClick={() => setOpenResponseFor((current) => current === review.id ? null : review.id)}
                    >
                      {openResponseFor === review.id ? 'Close' : 'Respond'}
                    </Button>
                  </div>

                  {openResponseFor === review.id && (
                    <LandlordResponseForm
                      responseType="review"
                      targetId={review.id}
                      propertyId={propertyId}
                      landlordId={review.landlord_id}
                    />
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* CTA */}
      <div className="text-center pt-2">
        <Link to="/review">
          <Button variant="secondary" size="sm">Write a Review</Button>
        </Link>
      </div>
    </div>
  );
}
