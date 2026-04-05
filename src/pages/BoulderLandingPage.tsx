import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/common';
import { getCityBySlug } from '../data/cityRegistry';
import { CityRightsAccordion } from '../components/features/Rights/CityRightsAccordion';
import { CityEmergencyContacts } from '../components/features/EmergencyGuide/CityEmergencyContacts';

const BOULDER_LAWS = [
  {
    id: 'habitability',
    title: 'Warranty of Habitability',
    citation: 'CRS § 38-12-505',
    plain: 'Your landlord must keep your rental fit to live in — working heat, plumbing, electricity, and no serious health hazards. If they don\'t fix emergency issues (no heat, gas leaks, sewage) within 24 hours, you have legal options including withholding rent or breaking your lease.',
    icon: '🏠',
  },
  {
    id: 'deposit',
    title: 'Security Deposit Return',
    citation: 'CRS § 38-12-510',
    plain: 'Your landlord has 60 days after you move out to return your security deposit with an itemized list of any deductions. (This was 30 days before the 2024 update.) If they don\'t comply, you can sue for up to 3× the amount wrongfully withheld, plus attorney fees.',
    icon: '💰',
  },
  {
    id: 'retaliation',
    title: 'Landlord Retaliation Prohibition',
    citation: 'CRS § 38-12-511',
    plain: 'Your landlord cannot punish you for reporting code violations, joining a tenant union, or exercising any legal right. If they raise your rent, cut services, or threaten eviction within 6 months of your complaint, the law presumes it\'s retaliation. You can recover damages and up to 2 months\' rent.',
    icon: '🛡️',
  },
  {
    id: 'licensing',
    title: 'Boulder Rental Licensing Program',
    citation: 'Boulder Revised Code',
    plain: 'Boulder requires all rental properties to be licensed with the city. This means your unit should meet minimum safety and habitability standards. You can verify your landlord\'s license status through the City of Boulder. Unlicensed rentals are a red flag.',
    icon: '📋',
  },
  {
    id: 'occupancy',
    title: 'Boulder Occupancy Limits',
    citation: 'Boulder Revised Code Title 9',
    plain: 'Boulder limits how many unrelated people can live in a single dwelling — typically 3-4 depending on the zone. This disproportionately affects student housing and drives up per-person costs. Know your zone\'s limits before signing a lease with roommates.',
    icon: '👥',
  },
  {
    id: 'application',
    title: 'Rental Application Fairness Act',
    citation: 'HB24-1098',
    plain: 'Colorado\'s new law limits what landlords can charge for application fees, requires them to provide the actual screening criteria upfront, and mandates that rejected applicants receive an explanation. No more $75 application fees with no accountability.',
    icon: '📝',
  },
  {
    id: 'income',
    title: 'Source of Income Discrimination',
    citation: 'Colorado Fair Housing Act',
    plain: 'Landlords in Colorado cannot refuse to rent to you because your income comes from housing vouchers, Social Security, disability benefits, or other lawful sources. If a listing says "no vouchers" or "employment income only," that\'s illegal.',
    icon: '⚖️',
  },
];

const LOCAL_RESOURCES = [
  {
    name: 'Boulder County Legal Services',
    phone: '(303) 449-7575',
    desc: 'Free legal help for low-income renters in Boulder County',
    url: 'https://www.bouldercountylegalservices.org',
  },
  {
    name: 'Colorado Legal Services',
    phone: '1-888-235-2674',
    desc: 'Statewide free legal aid for qualifying tenants',
    url: 'https://www.coloradolegalservices.org',
  },
  {
    name: 'CU Off-Campus Housing & Neighborhood Relations',
    phone: '(303) 492-7840',
    desc: 'Resources and mediation for CU Boulder students renting off-campus',
    url: 'https://www.colorado.edu/offcampus/',
  },
  {
    name: 'Boulder Housing Partners',
    phone: '(720) 564-4610',
    desc: 'Affordable housing, voucher programs, and tenant assistance',
    url: 'https://www.boulderhousing.org',
  },
  {
    name: 'Colorado DORA – Division of Housing',
    phone: '(303) 864-7810',
    desc: 'State housing authority — file discrimination complaints and get program info',
    url: 'https://dola.colorado.gov/division-housing',
  },
  {
    name: 'Boulder Mediation Services',
    phone: '(303) 441-4364',
    desc: 'Free mediation to resolve tenant-landlord disputes without court',
    url: 'https://bouldercolorado.gov/mediation',
  },
];

const BOULDER_STATS = {
  renterPct: '~60%',
  cuStudents: '36,000+',
  medianRent: '$1,850/mo',
  medianRentSource: '1BR, 2024 estimates',
};

export function BoulderLandingPage() {
  const city = getCityBySlug('boulder');
  const [expandedLaw, setExpandedLaw] = useState<string | null>(null);

  // SEO meta tags
  useEffect(() => {
    document.title = 'SafeSpace Boulder | Rental Reviews & Tenant Rights';
    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta('description', 'Rate your Boulder rental, learn your tenant rights under Colorado law, and access free legal resources. Built for CU students and Boulder renters.');
    setMeta('og:title', 'SafeSpace Boulder | Rental Reviews & Tenant Rights', 'property');
    setMeta('og:description', 'Know your rights as a Boulder renter. Rate landlords, report issues, and get AI-powered legal guidance. Free and anonymous.', 'property');
    setMeta('og:url', 'https://safespace.spirittree.dev/#/boulder', 'property');
    setMeta('og:type', 'website', 'property');
    return () => { document.title = 'SafeSpace | Tenant Health & Safety'; };
  }, []);

  if (!city) return null;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center pt-6 pb-2">
        <p className="text-sm font-medium uppercase tracking-widest text-sage-600 mb-3">
          SafeSpace × Boulder
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Boulder Renters:<br />
          <span className="text-sage-600">You Have Rights</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-text-muted leading-relaxed">
          Whether you're a CU student in a University Hill rental or a long-term
          renter downtown, Colorado law protects you. Know what you're entitled to.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/review">
            <Button size="lg">Rate Your Rental</Button>
          </Link>
          <Link to="/advocate">
            <Button variant="secondary" size="lg">Talk to AI Advocate</Button>
          </Link>
        </div>
      </section>

      {/* Boulder Stats Bar */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center !p-4">
          <p className="text-2xl sm:text-3xl font-bold text-sage-700">{BOULDER_STATS.renterPct}</p>
          <p className="text-xs text-text-muted mt-1">Renter Population</p>
        </Card>
        <Card className="text-center !p-4">
          <p className="text-2xl sm:text-3xl font-bold text-sage-700">{BOULDER_STATS.cuStudents}</p>
          <p className="text-xs text-text-muted mt-1">CU Students</p>
        </Card>
        <Card className="text-center !p-4">
          <p className="text-2xl sm:text-3xl font-bold text-sage-700">{BOULDER_STATS.medianRent}</p>
          <p className="text-xs text-text-muted mt-1">{BOULDER_STATS.medianRentSource}</p>
        </Card>
        <Card className="text-center !p-4">
          <p className="text-2xl sm:text-3xl font-bold text-sage-700">{city.keyLaws.length}+</p>
          <p className="text-xs text-text-muted mt-1">Laws Protecting You</p>
        </Card>
      </section>

      {/* Laws in Plain English */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink text-center mb-2">
          Your Rights, in Plain English
        </h2>
        <p className="text-center text-text-muted mb-8 max-w-xl mx-auto">
          Colorado and Boulder have strong tenant protections. Here's what they actually mean for you.
        </p>
        <div className="space-y-3">
          {BOULDER_LAWS.map((law) => (
            <Card
              key={law.id}
              className="cursor-pointer transition-all"
              onClick={() => setExpandedLaw(expandedLaw === law.id ? null : law.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{law.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-ink">{law.title}</h3>
                    <span className="text-text-muted text-lg flex-shrink-0">
                      {expandedLaw === law.id ? '−' : '+'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-sage-600 mt-0.5">{law.citation}</p>
                  {expandedLaw === law.id && (
                    <p className="mt-3 text-sm text-text leading-relaxed">
                      {law.plain}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Response Deadlines */}
      <section>
        <h2 className="text-2xl font-bold text-ink mb-4">Response Deadlines</h2>
        <p className="text-text-muted mb-6">When you report an issue, your landlord is legally required to respond within these timeframes.</p>
        <Card>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between py-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-danger-bg px-2.5 py-0.5 text-xs font-medium text-danger">
                  Emergency
                </span>
                <p className="mt-1.5 text-sm text-text-muted">{city.deadlines.emergency.label}</p>
              </div>
              <span className="text-2xl font-bold text-danger">{city.deadlines.emergency.hours}h</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-bamboo-50 px-2.5 py-0.5 text-xs font-medium text-bamboo-800">
                  Urgent
                </span>
                <p className="mt-1.5 text-sm text-text-muted">{city.deadlines.urgent.label}</p>
              </div>
              <span className="text-2xl font-bold text-bamboo-700">{city.deadlines.urgent.hours}h</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-sage-50 px-2.5 py-0.5 text-xs font-medium text-sage-700">
                  Standard
                </span>
                <p className="mt-1.5 text-sm text-text-muted">{city.deadlines.standard.label}</p>
              </div>
              <span className="text-2xl font-bold text-sage-700">{city.deadlines.standard.hours}h</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Review CTA */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink text-center mb-2">
          Add a Boulder Review
        </h2>
        <p className="text-center text-text-muted mb-8 max-w-xl mx-auto">
          SafeSpace no longer displays seeded example reviews. Add a real landlord review to help future Boulder renters research safely.
        </p>
        <Card className="mx-auto max-w-2xl text-center">
          <p className="text-sm text-text-muted">
            Submit a landlord review, safety issue, or legal notice from a real rental address to start building Boulder’s live public record.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/review">
              <Button>Leave a Review</Button>
            </Link>
            <Link to="/report">
              <Button variant="secondary">Report Safety Issue</Button>
            </Link>
          </div>
        </Card>
        <div className="text-center mt-6">
          <Link to="/review">
            <Button variant="secondary">Add Your Review</Button>
          </Link>
        </div>
      </section>

      {/* Existing Rights Accordion */}
      <section>
        <h2 className="text-2xl font-bold text-ink mb-6">Detailed Rights Breakdown</h2>
        <CityRightsAccordion rights={city.rights} />
      </section>

      {/* Who Enforces This */}
      <section>
        <h2 className="text-2xl font-bold text-ink mb-4">Who Enforces This</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h3 className="font-semibold text-ink">Health Department</h3>
            <p className="mt-1 text-sm font-medium text-sage-600">{city.enforcement.healthDept.name}</p>
            <a href={`tel:${city.enforcement.healthDept.phone.replace(/\D/g, '')}`} className="mt-1 block text-sm text-sage-600 hover:underline">
              {city.enforcement.healthDept.phone}
            </a>
            {city.enforcement.healthDept.address && (
              <p className="mt-1 text-xs text-text-muted">{city.enforcement.healthDept.address}</p>
            )}
            {city.enforcement.healthDept.hours && (
              <p className="mt-1 text-xs text-text-muted">{city.enforcement.healthDept.hours}</p>
            )}
          </Card>
          <Card>
            <h3 className="font-semibold text-ink">Code Enforcement</h3>
            <p className="mt-1 text-sm font-medium text-sage-600">{city.enforcement.codeEnforcement.name}</p>
            <a href={`tel:${city.enforcement.codeEnforcement.phone.replace(/\D/g, '')}`} className="mt-1 block text-sm text-sage-600 hover:underline">
              {city.enforcement.codeEnforcement.phone}
            </a>
            {city.enforcement.codeEnforcement.email && (
              <a href={`mailto:${city.enforcement.codeEnforcement.email}`} className="mt-1 block text-xs text-sage-600 hover:underline">
                {city.enforcement.codeEnforcement.email}
              </a>
            )}
            {city.enforcement.codeEnforcement.address && (
              <p className="mt-1 text-xs text-text-muted">{city.enforcement.codeEnforcement.address}</p>
            )}
          </Card>
        </div>
      </section>

      {/* Local Resources */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink text-center mb-2">
          Boulder Resources
        </h2>
        <p className="text-center text-text-muted mb-8 max-w-xl mx-auto">
          Free or low-cost help when you need it.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {LOCAL_RESOURCES.map((resource) => (
            <Card key={resource.name} className="space-y-2">
              <h3 className="font-semibold text-ink text-sm">{resource.name}</h3>
              <p className="text-xs text-text-muted">{resource.desc}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={`tel:${resource.phone.replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-sage-700 hover:text-sage-800 min-h-[44px]"
                >
                  📞 {resource.phone}
                </a>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sage-600 hover:underline"
                  >
                    Website →
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Emergency Contacts */}
      <section>
        <CityEmergencyContacts contacts={city.emergencyContacts} />
      </section>

      {/* CTAs */}
      <section className="rounded-lg bg-sage-700 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to Take Action?</h2>
        <p className="mt-2 text-sage-100 max-w-lg mx-auto">
          Rate your rental, report issues, or talk to our AI Advocate about your specific situation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link to="/review">
            <Button variant="secondary" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              ⭐ Rate Your Rental
            </Button>
          </Link>
          <Link to="/report?city=boulder">
            <Button variant="secondary" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              📋 Report an Issue
            </Button>
          </Link>
          <Link to="/advocate">
            <Button variant="secondary" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              🛡️ AI Advocate
            </Button>
          </Link>
        </div>
      </section>

      {/* Legal disclaimer */}
      <p className="text-center text-xs text-text-muted pb-4">
        ⚖️ SafeSpace provides general information, not legal advice. Consult a tenant rights attorney for your specific situation.
      </p>
    </div>
  );
}
