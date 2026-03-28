import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Card, Button, Input, Textarea } from '../../common';
import { supabase } from '../../../lib/supabase';

interface RebuttalFormProps {
  reportId: string;
  propertyId: string;
}

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

export function RebuttalForm({ reportId, propertyId }: RebuttalFormProps) {
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [step, setStep] = useState<'form' | 'paying' | 'submitted'>('form');
  const [error, setError] = useState('');

  const handlePayAndSubmit = async () => {
    if (!email || !body.trim()) return;
    setError('');
    setStep('paying');

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        setError('Payment system is not configured.');
        setStep('form');
        return;
      }

      // Insert rebuttal into Supabase with a placeholder payment ID
      // In production, this would be done via webhook after payment confirmation
      const paymentRef = `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const { error: insertErr } = await supabase.from('rebuttals').insert({
        report_id: reportId,
        property_id: propertyId,
        landlord_email: email,
        body: body.trim(),
        stripe_payment_id: paymentRef,
      });

      if (insertErr) throw insertErr;

      // Redirect to Stripe Checkout for $10 rebuttal fee
      const { error: stripeErr } = await stripe.redirectToCheckout({
        lineItems: [{ price: 'price_rebuttal_10', quantity: 1 }],
        mode: 'payment',
        successUrl: `${window.location.origin}/#/property-lookup?payment=success`,
        cancelUrl: `${window.location.origin}/#/property-lookup?payment=cancelled`,
        customerEmail: email,
      });

      if (stripeErr) {
        // Stripe redirect failed — still show submitted since rebuttal is saved
        console.warn('Stripe redirect failed:', stripeErr.message);
        setStep('submitted');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
      setStep('form');
    }
  };

  if (step === 'submitted') {
    return (
      <Card variant="success">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-emerald-800">Rebuttal Submitted</h4>
          <p className="mt-2 text-sm text-emerald-700">
            Your response will appear alongside the report after payment confirmation.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-teal-200 bg-teal-50/50">
      <h4 className="mb-4 text-lg font-semibold text-text">Respond as Property Owner ($10)</h4>
      <p className="mb-4 text-sm text-text-muted">
        Property owners can respond to reports. A $10 fee helps prevent abuse. Your response will be displayed with a "Landlord Response" badge.
      </p>

      <div className="space-y-4">
        <Input
          label="Your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="landlord@example.com"
          required
        />

        <Textarea
          label="Your response"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Explain the actions taken to address this issue..."
          maxLength={1000}
          required
        />
        <p className="text-xs text-text-muted">{body.length}/1000 characters</p>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button
          onClick={handlePayAndSubmit}
          disabled={!email || !body.trim() || step === 'paying'}
          fullWidth
        >
          {step === 'paying' ? 'Processing...' : 'Pay $10 & Submit Response'}
        </Button>
      </div>
    </Card>
  );
}
