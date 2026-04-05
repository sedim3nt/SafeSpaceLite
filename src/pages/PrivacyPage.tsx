import { Card } from '../components/common';

const sections = [
  {
    title: 'What we collect',
    body: 'SafeSpace may collect account details, verification data, payment metadata, submitted reports and reviews, attachments, device and session information, and abuse-prevention signals needed to operate the platform.',
  },
  {
    title: 'How we use data',
    body: 'We use data to authenticate users, publish and moderate content, process payments, prevent abuse, investigate disputes, and improve the platform.',
  },
  {
    title: 'Public anonymity and internal records',
    body: 'If you post anonymously, your name may be hidden publicly while limited account or verification records are still retained internally for moderation, fraud prevention, and legal compliance.',
  },
  {
    title: 'Verification and fraud prevention',
    body: 'SafeSpace may use email verification, phone verification, payment verification, rate limits, and related anti-abuse signals to reduce impersonation, spam, and repeated false submissions.',
  },
  {
    title: 'Payments',
    body: 'Landlord response payments are processed through third-party payment providers. SafeSpace does not store full payment card details directly.',
  },
  {
    title: 'Sharing',
    body: 'We may share data with infrastructure providers, payment providers, analytics or anti-abuse vendors, and when required by law or to protect platform integrity.',
  },
  {
    title: 'Retention',
    body: 'SafeSpace may retain account, moderation, payment, and verification records for as long as reasonably necessary to operate the platform, enforce policies, resolve disputes, and meet legal obligations.',
  },
  {
    title: 'Contact',
    body: 'Questions about privacy can be sent to hello@spirittree.dev.',
  },
];

export function PrivacyPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sage-600">Legal</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Privacy Policy</h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-text-muted">
          Last updated April 4, 2026. This policy summarizes how SafeSpace handles account, submission, and
          verification data while operating the platform.
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
    </div>
  );
}
