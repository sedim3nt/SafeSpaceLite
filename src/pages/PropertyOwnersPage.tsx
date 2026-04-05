import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button/Button';

const landlordBenefits = [
  {
    title: 'Check the public record on any property',
    body: 'Use Property Lookup to see health and safety reports, community comments, and rental reviews tied to an address before a concern turns into a larger reputation problem.',
  },
  {
    title: 'Respond when something needs context',
    body: 'If a review or safety report is incomplete, outdated, or unfair, you can add a paid public response from the property page so future renters see your side as well.',
  },
  {
    title: 'Promote strengths that matter to renters',
    body: 'Responses are not only for disputes. They also let you highlight repairs completed, improvements made, safety upgrades, and the care you put into the property.',
  },
];

const responseUseCases = [
  'Clarify what happened when a review leaves out important facts.',
  'Document repairs, remediation, or other corrective actions already completed.',
  'Explain upgrades such as storage, accessibility improvements, or safety work.',
  'Show prospective renters that the property is actively managed and responsive.',
];

export function PropertyOwnersPage() {
  return (
    <div className="space-y-10">
      <div className="max-w-4xl space-y-4">
        <h1 className="text-3xl font-bold text-text">For Landlords</h1>
        <p className="text-lg text-text-muted">
          SafeSpace gives landlords and managers a clear way to monitor public property records, respond to tenant concerns,
          and present improvements directly on the address page renters already use.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-text">Use Property Lookup as your public record check</h2>
            <p className="text-base text-text-muted">
              Search any property you own or manage to review the same health and safety reports, landlord reviews, and
              jurisdiction details that renters see. When you find something inaccurate, incomplete, or outdated, you can
              respond directly from that property page.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {landlordBenefits.map((benefit) => (
              <div key={benefit.title} className="rounded-xl border border-border bg-surface p-5">
                <h3 className="text-xl font-semibold text-text">{benefit.title}</h3>
                <p className="mt-3 text-base text-text-muted">{benefit.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-text">$10 public response</h2>
            <p className="text-base text-text-muted">
              A response is a simple, professional way to protect your reputation. For $10, you can publish one public
              reply on a review or safety report from the property page. Landlord responses require a signed-in account
              before checkout, so the response is tied to an authenticated landlord session rather than an anonymous email.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {responseUseCases.map((item) => (
              <div key={item} className="flex gap-3 rounded-xl bg-white p-4">
                <div className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-sage-600" />
                <p className="text-base text-text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="max-w-4xl space-y-4">
          <h2 className="text-xl font-semibold text-text">How it works</h2>
          <p className="text-base text-text-muted">
            Start with the address. From the property result page, review public safety reports and tenant reviews. If you
            disagree with a claim or want to highlight improvements, use the response action on that page to add a public
            landlord statement. SafeSpace keeps that response attached to the record renters are already reading.
          </p>
          <p className="text-base text-text-muted">
            This gives responsible landlords a constructive option: respond to negative feedback with facts, or promote
            completed work and positive property strengths where prospective renters can actually see them.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link to="/property-lookup">
            <Button size="lg">Go to Property Lookup</Button>
          </Link>
          <Link to="/know-your-rights">
            <Button variant="secondary" size="lg">View Tenant Rights</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
