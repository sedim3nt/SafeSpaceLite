import { Card, Button } from '../../common';
import type { PropertyLandlordStatement } from '../../../types/database';
import { LandlordResponseForm } from './LandlordResponseForm';
import { useSearchParams } from 'react-router-dom';

interface PersistentLandlordPanelProps {
  propertyId: string;
  statement: PropertyLandlordStatement | null;
  hasReports: boolean;
  hasReviews: boolean;
}

function getPanelCopy(hasReports: boolean, hasReviews: boolean) {
  if (hasReports || hasReviews) {
    return {
      title: 'Landlord Response',
      body: 'If a health and safety report or landlord review is false, incomplete, or already fixed, publish one verified landlord note here. You can also use this space to highlight upgrades and positive facts about the property.',
    };
  }

  return {
    title: 'Landlord Response',
    body: 'Nothing has been reported on this address yet. Landlords can still publish the first verified note for the property to highlight repairs, upgrades, safety work, or other strengths renters should know.',
  };
}

export function PersistentLandlordPanel({
  propertyId,
  statement,
  hasReports,
  hasReviews,
}: PersistentLandlordPanelProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const copy = getPanelCopy(hasReports, hasReviews);
  const open = searchParams.get('compose') === 'landlord-note';

  const setOpen = (nextOpen: boolean) => {
    const nextParams = new URLSearchParams(searchParams);

    if (nextOpen) {
      nextParams.set('compose', 'landlord-note');
    } else {
      nextParams.delete('compose');
    }

    setSearchParams(nextParams, { replace: true });
  };

  return (
    <Card className="space-y-5 border-sage-200 bg-sage-50/60">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-text">{copy.title}</h3>
        <p className="text-base text-text-muted">{copy.body}</p>
      </div>

      {statement && (
        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-sm font-medium text-teal-700">
              Landlord Note
            </span>
            {statement.is_verified && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-medium text-emerald-700">
                Verified Landlord
              </span>
            )}
            <time className="text-sm text-text-muted sm:ml-auto">
              {new Date(statement.updated_at || statement.created_at).toLocaleDateString()}
            </time>
          </div>
          <p className="mt-3 text-base leading-relaxed text-text">{statement.body}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-text">
            {statement ? 'Update or replace the landlord note for this property.' : 'Publish one verified landlord note for this property.'}
          </p>
          <p className="text-sm text-text-muted">
            Sign in, confirm you represent the property, and complete the $10 checkout.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(!open)}>
          {open ? 'Close' : statement ? 'Update Landlord Note' : 'Add Landlord Note'}
        </Button>
      </div>

      {open && (
        <LandlordResponseForm
          responseType="property"
          targetId={propertyId}
          propertyId={propertyId}
        />
      )}
    </Card>
  );
}
