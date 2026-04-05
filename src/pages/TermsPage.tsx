import { Card } from '../components/common';

const sections = [
  {
    title: 'Acceptance',
    body: 'By accessing or using SafeSpace, you agree to these Terms of Service. If you do not agree, do not use the platform.',
  },
  {
    title: 'What SafeSpace Is',
    body: 'SafeSpace provides tools for renters, landlords, and other users to share information about rental housing conditions, landlord responsiveness, tenant rights, and related issues. SafeSpace is a platform for user-submitted content and informational resources.',
  },
  {
    title: 'No Legal, Medical, or Professional Advice',
    body: 'SafeSpace is not a law firm, medical provider, inspector, government agency, or emergency service. Content on the platform is provided for general informational purposes only and is not legal advice, medical advice, inspection certification, or a guarantee of any result.',
  },
  {
    title: 'User Content',
    body: 'Users may submit reports, reviews, comments, rebuttals, attachments, and other content. You are solely responsible for your submissions and represent that they are made in good faith, are not knowingly false or unlawful, and that you have the right to share any attached material.',
  },
  {
    title: 'Platform Role',
    body: 'SafeSpace is not the author of user submissions and does not independently verify every statement, review, report, or response. SafeSpace may use moderation tools, verification tools, evidence tiers, account checks, and challenge processes, but does not guarantee that user content is complete, accurate, current, or error-free.',
  },
  {
    title: 'Moderation and Display',
    body: 'SafeSpace may review, flag, limit, de-rank, hide, or remove content from public display if it appears to violate these terms, create legal risk, or undermine platform integrity. SafeSpace may request supporting information or verification from users.',
  },
  {
    title: 'Landlord Responses and Paid Rebuttals',
    body: 'Fees charged for landlord responses are platform access fees. Payment does not guarantee publication, verification, ranking, removal of user content, or any specific outcome.',
  },
  {
    title: 'Accounts and Verification',
    body: 'SafeSpace may require login, email verification, phone verification, payment verification, or other authentication steps for certain actions. Users may not impersonate others, submit repeated false content, or use automation to distort platform activity.',
  },
  {
    title: 'Privacy',
    body: 'Public anonymity does not necessarily mean internal anonymity. SafeSpace may retain limited internal verification and abuse-prevention data even when content is displayed publicly without a user name.',
  },
  {
    title: 'Warranty and Liability',
    body: 'SafeSpace is provided "as is" and "as available." To the maximum extent permitted by law, SafeSpace disclaims warranties and limits liability for losses arising from use of the platform.',
  },
  {
    title: 'User Responsibility and Indemnification',
    body: 'You agree to indemnify and hold harmless SafeSpace and its operators from claims, liabilities, damages, losses, and expenses arising from your content, misuse of the platform, or violation of another person’s rights.',
  },
  {
    title: 'Changes',
    body: 'SafeSpace may update these Terms from time to time. Continued use after updated terms are posted constitutes acceptance of the revised terms.',
  },
];

export function TermsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sage-600">Legal</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Terms of Service</h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-text-muted">
          Last updated April 4, 2026. These terms govern access to SafeSpace and explain the platform’s role,
          user responsibilities, and basic risk allocation.
        </p>
      </div>

      <Card className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h2 className="text-lg font-semibold text-ink">{section.title}</h2>
            <p className="text-sm leading-relaxed text-text-muted">{section.body}</p>
          </section>
        ))}
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <p className="text-sm leading-relaxed text-amber-900">
          SafeSpace provides platform tools and general information, not legal advice. For specific legal guidance,
          consult a qualified attorney. For questions about these terms, contact{' '}
          <a className="font-medium underline underline-offset-2" href="mailto:hello@spirittree.dev">
            hello@spirittree.dev
          </a>.
        </p>
      </Card>
    </div>
  );
}
