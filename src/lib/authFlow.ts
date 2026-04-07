export type AuthIntent = 'general' | 'report' | 'review' | 'landlord';

export function getIntentActionLabel(intent: AuthIntent) {
  if (intent === 'report') return 'report';
  if (intent === 'review') return 'review';
  if (intent === 'landlord') return 'landlord response';
  return 'action';
}

export function getIntentReturnLabel(intent: AuthIntent) {
  if (intent === 'report') return 'Return to report';
  if (intent === 'review') return 'Return to review';
  if (intent === 'landlord') return 'Return to landlord response';
  return 'Continue';
}

export function getIntentAccountRequirementCopy(intent: AuthIntent) {
  if (intent === 'report') {
    return 'A free SafeSpace account is required to submit a report. Your report can still be posted anonymously. SafeSpace uses accounts to reduce spam and confirm a real person is submitting.';
  }
  if (intent === 'review') {
    return 'A free SafeSpace account is required to submit a review. Your review can still be posted anonymously. SafeSpace uses accounts to reduce spam and confirm a real person is submitting.';
  }
  if (intent === 'landlord') {
    return 'A SafeSpace account is required to publish a landlord response. SafeSpace verifies the response by tying the signed-in account to the same email used at checkout.';
  }
  return 'Sign in or create a free SafeSpace account to continue.';
}
