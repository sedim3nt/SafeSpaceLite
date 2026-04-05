import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { DeadlineCalculator } from '../components/features/Tracker/DeadlineCalculator';
import { TrackedIssues } from '../components/features/Tracker/TrackedIssues';
import { Card } from '../components/common';

export const TrackerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialAddress = searchParams.get('address') ?? '';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ink">Landlord Response Tracker</h1>
        <p className="mt-2 text-lg text-text-muted">
          Track response times and ensure compliance with legal deadlines
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-ink mb-4">Deadline Calculator</h2>
          <DeadlineCalculator />
        </div>

        <div>
          <TrackedIssues initialAddress={initialAddress} />
        </div>
      </div>

      <Card className="bg-sage-50 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-900 mb-2">
          Know Your Rights
        </h3>
        <div className="space-y-2 text-sm text-sage-800">
          <p>
            • <strong>24-hour issues:</strong> No heat (below 40°F), no water, gas leaks, sewage backup
          </p>
          <p>
            • <strong>72-hour issues:</strong> Extensive mold (&gt;10 sq ft), no hot water
          </p>
          <p>
            • <strong>7-day issues:</strong> Minor repairs affecting habitability
          </p>
          <p className="mt-3">
            If your landlord misses these deadlines, you may have the right to repair and deduct,
            withhold rent, or terminate your lease. Contact legal aid for guidance.
          </p>
        </div>
      </Card>
    </div>
  );
};
