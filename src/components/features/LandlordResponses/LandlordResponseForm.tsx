import { useState } from 'react';
import { Card, Button, Input, Textarea } from '../../common';
import {
  startLandlordResponseCheckout,
  type LandlordResponseType,
} from '../../../lib/landlordResponses';

interface LandlordResponseFormProps {
  responseType: LandlordResponseType;
  targetId: string;
  propertyId: string;
  landlordId?: string;
}

const RESPONSE_COPY: Record<
  LandlordResponseType,
  {
    title: string;
    intro: string;
    placeholder: string;
  }
> = {
  report: {
    title: 'Respond as Property Owner ($10)',
    intro:
      'Owners and managers can add a paid response to a safety report. The fee reduces spam and the response is displayed alongside the report.',
    placeholder: 'Explain the actions taken, the current status, or any factual context you want tenants to see.',
  },
  review: {
    title: 'Respond to This Review ($10)',
    intro:
      'Owners and managers can add a paid public response to a rental review. Use this to acknowledge the issue, clarify facts, or explain what changed.',
    placeholder: 'Share your response to this review, including any repairs, policy changes, or factual corrections.',
  },
};

export function LandlordResponseForm({
  responseType,
  targetId,
  propertyId,
  landlordId,
}: LandlordResponseFormProps) {
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const copy = RESPONSE_COPY[responseType];

  const handleCheckout = async () => {
    if (!email.trim() || !body.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      await startLandlordResponseCheckout({
        responseType,
        targetId,
        propertyId,
        landlordId,
        landlordEmail: email.trim(),
        body: body.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start checkout.');
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-teal-200 bg-teal-50/50">
      <h4 className="text-base font-semibold text-text">{copy.title}</h4>
      <p className="mt-2 text-sm text-text-muted">{copy.intro}</p>

      <div className="mt-4 space-y-4">
        <Input
          label="Your email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="landlord@example.com"
          required
        />

        <Textarea
          label="Your response"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={copy.placeholder}
          maxLength={1000}
          required
        />
        <p className="text-xs text-text-muted">{body.length}/1000 characters</p>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button
          onClick={handleCheckout}
          disabled={!email.trim() || !body.trim() || submitting}
          fullWidth
        >
          {submitting ? 'Redirecting to payment...' : 'Pay $10 and Submit Response'}
        </Button>
      </div>
    </Card>
  );
}
