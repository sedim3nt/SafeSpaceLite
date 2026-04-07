import { useState } from 'react';
import { Card, Button, Input, Textarea } from '../../common';
import { useAuth } from '../../../contexts/AuthContext';
import { AuthModal } from '../../auth/AuthModal';
import { trackAnalyticsEvent } from '../../../lib/analytics';
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
    title: 'Respond as Landlord ($10)',
    intro:
      'Landlords and managers can add a paid response to a safety report. The fee reduces spam, and the response is displayed alongside the report once payment is complete.',
    placeholder: 'Explain the actions taken, the current status, or any factual context you want tenants to see.',
  },
  review: {
    title: 'Respond to This Review ($10)',
    intro:
      'Landlords and managers can add a paid public response to a rental review. Use this to acknowledge the issue, clarify facts, or explain what changed.',
    placeholder: 'Share your response to this review, including any repairs, policy changes, or factual corrections.',
  },
  property: {
    title: 'Publish a Landlord Note ($10)',
    intro:
      'Use one verified landlord note to address false claims, explain fixes already completed, or highlight positive improvements on the property page.',
    placeholder: 'Explain what is true about this property, what work has been completed, or what prospective renters should know.',
  },
};

export function LandlordResponseForm({
  responseType,
  targetId,
  propertyId,
  landlordId,
}: LandlordResponseFormProps) {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [confirmedAuthority, setConfirmedAuthority] = useState(false);

  const copy = RESPONSE_COPY[responseType];

  const handleCheckout = async () => {
    if (!user?.email || !body.trim() || !confirmedAuthority) return;

    setSubmitting(true);
    setError('');

    try {
      if (responseType === 'property') {
        trackAnalyticsEvent('landlord_note_checkout_started', {
          property_id: propertyId,
        });
      }

      await startLandlordResponseCheckout({
        responseType,
        targetId,
        propertyId,
        landlordId,
        landlordEmail: user.email.trim(),
        body: body.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start checkout.');
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <>
        <Card className="border-teal-200 bg-teal-50/50">
          <h4 className="text-base font-semibold text-text">{copy.title}</h4>
          <p className="mt-2 text-sm text-text-muted">
            Sign in as a landlord before checkout. SafeSpace only publishes landlord responses from authenticated accounts,
            and the signed-in email must match the email used at checkout.
          </p>
          <Button className="mt-4" onClick={() => setShowAuth(true)}>
            Sign in to respond
          </Button>
        </Card>
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          intent="landlord"
          returnPath={`/property/${propertyId}`}
        />
      </>
    );
  }

  return (
    <>
    <Card className="border-teal-200 bg-teal-50/50">
      <h4 className="text-base font-semibold text-text">{copy.title}</h4>
      <p className="mt-2 text-sm text-text-muted">{copy.intro}</p>

      <div className="mt-4 space-y-4">
        <Input
          label="Signed-in landlord email"
          type="email"
          value={user.email || ''}
          readOnly
        />

        <Textarea
          label="Your response"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={copy.placeholder}
          maxLength={1000}
          required
        />
        <p className="text-sm text-text-muted">{body.length}/1000 characters</p>

        <label className="flex items-start gap-3 rounded-lg border border-border bg-white p-4">
          <input
            type="checkbox"
            checked={confirmedAuthority}
            onChange={(event) => setConfirmedAuthority(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-sage-600 focus:ring-sage-500"
          />
          <span className="text-sm text-text-muted">
            I am the landlord, owner, or authorized property manager for this address, and I understand my response will
            be published under this signed-in account after payment.
          </span>
        </label>

        <div className="rounded-lg border border-border bg-white p-4 text-sm text-text-muted">
          SafeSpace verifies this response by requiring a signed-in account and a $10 checkout tied to the same email.
          No manual document upload is required.
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button
          onClick={handleCheckout}
          disabled={!user.email || !body.trim() || !confirmedAuthority || submitting}
          fullWidth
        >
          {submitting ? 'Redirecting to payment...' : 'Pay $10 and Submit Response'}
        </Button>
      </div>
    </Card>
    <AuthModal
      isOpen={showAuth}
      onClose={() => setShowAuth(false)}
      intent="landlord"
      returnPath={`/property/${propertyId}`}
    />
    </>
  );
}
