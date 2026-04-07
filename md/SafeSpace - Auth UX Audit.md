# SafeSpace - Auth UX Audit

## Purpose

This document audits the current SafeSpace account and sign-in experience for tenants and landlords, then defines the desired UX for MVP1.

The goal is clarity. A non-technical user should always know:

- whether an account is required
- why SafeSpace requires it
- whether they are signed in
- whether their report, review, or landlord response has actually been submitted
- what to do next

## Current Product Rule

SafeSpace currently uses two practical user types:

- tenants
- landlords

## Current Tenant Flow

### Report a safety issue

Current behavior before this implementation pass:

- A tenant had to be signed in to submit a report.
- The report form itself was gated behind `ProtectedAction`.
- The UI did not explain this early or explicitly enough.
- The tenant could still post anonymously, but this was explained separately from the account requirement.
- The auth gate copy was generic and did not clearly say:
  - a free account is required
  - anonymous posting is still available
  - the account is used for anti-spam / human verification

Current risk before this implementation pass:

- A user could fill out a flow, hit submit, and only then discover they needed an account.
- A user could create an account and still be unsure whether the report itself had been submitted.
- Email confirmation could send the user back without enough context about what happened or what remained to do.

### Review a landlord

Current behavior before this implementation pass:

- A tenant had to be signed in to submit a review.
- The review flow allowed the user to complete almost the entire multi-step form before the auth gate appeared.
- The final submit step used `ProtectedAction`, but the button and surrounding copy did not make the account requirement explicit enough.
- The review could still be anonymous, but the UI did not connect that clearly to the required account.

Current risk before this implementation pass:

- A user could think creating an account also submitted the review.
- A user could sign in successfully and still not know the review had not yet been posted.
- A user confirming their email later could lose confidence about whether their review was saved or whether they needed to restart.

## Current Landlord Flow

### Post a response or landlord note

Current behavior:

- Landlords must sign in before checkout.
- Landlords must use the same signed-in email at checkout.
- The response is published only after successful payment and server-side verification.
- This is stronger than the tenant flow and already enforces authentication.

Current issue before this implementation pass:

- The UX stated that sign-in was required, but did not explain the verification model clearly enough.
- A landlord might not understand how SafeSpace verifies the response without document upload.

## Desired Tenant UX

### Rule

Tenants should have a free SafeSpace account to submit a report or review.

They should not need an account just to browse property information.

### Why this is acceptable

This is a reasonable MVP1 tradeoff because it gives SafeSpace:

- a basic human-verification layer
- an anti-spam layer
- a moderation anchor
- a way to limit repeated abuse

### What the UI must say explicitly

For reports and reviews, SafeSpace should say:

- a free account is required to submit
- the post can still be anonymous publicly
- the account is used to reduce spam and confirm that a real person is submitting

### Submission clarity requirement

The user must always be able to distinguish these states:

- account created
- signed in
- post not submitted yet
- post submitted successfully

## Desired Landlord UX

### Rule

Landlords must be signed in to publish a response or landlord note.

### Lightweight verification approach

SafeSpace should avoid manual document review for MVP1.

The verification model should be:

- signed-in SafeSpace account required
- signed-in email must match the email used at checkout
- checkout must succeed
- the response is published only after server-side verification of the authenticated account and the paid session

This is not ownership proof in the legal sense. It is a lightweight platform verification model designed to reduce spam, impersonation, and disposable responses.

### What the UI must say explicitly

SafeSpace should say:

- sign-in is required
- the signed-in email must match the checkout email
- SafeSpace verifies the response through the account plus payment flow
- no document upload is required

## Implemented Changes

This implementation pass changed the UX in the following ways.

### Tenant auth copy

- Report and review gates now explicitly say a free account is required.
- They also state that posts can still be anonymous.
- They explain that the account exists to reduce spam and confirm a real person is submitting.

### Intent-aware auth modal

- The auth modal now knows whether the user is trying to submit a report, review, or landlord response.
- The copy now reflects that specific intent instead of using one generic message for everything.

### Explicit account confirmation states

- After sign-up, SafeSpace now distinguishes between:
  - account created and already signed in
  - account created and email confirmation still required
- For guarded actions, the modal now explicitly says the report or review has not been submitted yet.
- The modal tells the user to return and finish the submission.

### Return-to-flow after confirmation

- Sign-up confirmation links now include a return path.
- After email confirmation, SafeSpace can return the user to the correct flow instead of dropping them at a generic homepage destination.

### Landlord verification copy

- Landlord response UX now explains that SafeSpace verifies the response by requiring:
  - a signed-in account
  - the same email at checkout
  - successful payment
- It explicitly says no manual document upload is required.

## Recommended MVP1 Policy

### Tenants

- Browsing property pages: no account required
- Submitting a safety report: free account required
- Submitting a landlord review: free account required
- Public anonymity: allowed

### Landlords

- Viewing property pages: no account required
- Publishing a landlord note or response: account required
- Verification model: signed-in account + matching email + paid checkout

## Remaining Follow-Up

The main UX logic is now clearer, but a few follow-ups would improve confidence further:

- add one-time “You are signed in. Your report/review is not submitted yet.” banners after returning from email confirmation
- preserve richer draft state for long tenant forms if we later allow login after partial completion
- decide whether tenant email confirmation should remain required or whether immediate sign-in after account creation is acceptable for MVP1

## Bottom Line

SafeSpace should keep accounts required for tenant submissions and landlord responses.

That is workable for MVP1 as long as the UI says it plainly:

- tenants need a free account to post
- anonymous posting is still allowed
- landlords need login plus checkout
- SafeSpace verifies landlord responses through account identity and payment, not manual document review

The implementation in this pass moves the product toward that explicit model.
