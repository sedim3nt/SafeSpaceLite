import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button/Button';

export function PropertyOwnersPage() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-bold text-text">For Landlords</h1>
        <p className="text-lg text-text-muted">
          Use Property Lookup to view health and safety reports and landlord reviews for any address. From that same page,
          you can publish a verified landlord note to correct the record, explain what was fixed, or introduce the property
          in your own words before anyone else does.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-text">What landlords can do</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="text-xl font-semibold text-text">See what renters see</h3>
              <p className="mt-2 text-base text-text-muted">
                View the same reports and reviews renters see before you decide how to respond.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="text-xl font-semibold text-text">Publish one verified landlord note</h3>
              <p className="mt-2 text-base text-text-muted">
                Use it to dispute a false claim, explain work that has already been completed, or highlight upgrades and strengths.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="text-xl font-semibold text-text">Pay once, post publicly</h3>
              <p className="mt-2 text-base text-text-muted">
                The note costs $10 and requires a signed-in landlord account before checkout.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-sage-50/60 p-8">
          <h2 className="text-xl font-semibold text-text">$10 landlord note</h2>
          <p className="mt-3 text-base text-text-muted">
            The landlord note always appears on the property page. Landlords can use it whether the address already has
            reports or reviews, or nothing has been posted yet.
          </p>
          <p className="mt-3 text-base text-text-muted">
            That gives you two clear options: answer criticism with facts, or take the initiative and say something
            positive about the property before a dispute defines it.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <Link to="/property-lookup">
              <Button size="lg">Go to Property Lookup</Button>
            </Link>
            <Link to="/know-your-rights">
              <Button variant="secondary" size="lg">View Tenant Rights</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
