import { Link } from 'react-router-dom';
import { Button, Card } from '../components/common';

export function HomePage() {
  const features = [
    {
      title: 'Emergency Health Guide',
      description: 'Get immediate guidance for health emergencies with 24/72-hour response requirements.',
      link: '/emergency-guide',
      icon: '🚨',
      urgent: true,
    },
    {
      title: 'Property Lookup',
      description: 'Research property health history and read community experiences.',
      link: '/property-lookup',
      icon: '🔍',
    },
    {
      title: 'Report Health Issues',
      description: 'Submit health violations with photo evidence and anonymous options.',
      link: '/report',
      icon: '📋',
    },
    {
      title: 'Track Landlord Response',
      description: 'Monitor compliance with legal deadlines and document responses.',
      link: '/tracker',
      icon: '⏱️',
    },
    {
      title: 'Know Your Rights',
      description: "Learn about Boulder County's tenant health and safety protections.",
      link: '/know-your-rights',
      icon: '⚖️',
    },
    {
      title: 'Legal Notice Generator',
      description: 'Generate professional legal notices with Boulder County law citations.',
      link: '/legal-notice',
      icon: '📄',
    },
    {
      title: 'Rate Your Rental Experience',
      description: 'Rate your landlord across 7 categories and help future tenants.',
      link: '/review',
      icon: '⭐',
    },
  ];

  return (
    <div className="space-y-14">
      <section className="text-center pt-4">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Protecting Boulder Renters'
          <span className="text-sage-600"> Health & Safety</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-text-muted leading-relaxed">
          Know your rights, report health violations, and hold landlords accountable under Boulder County law.
        </p>
      </section>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link key={feature.link} to={feature.link}>
            <Card hover className="h-full">
              <div className="mb-3 text-2xl">{feature.icon}</div>
              <h3 className={`text-lg font-semibold ${feature.urgent ? 'text-danger' : 'text-ink'}`}>
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-text-muted leading-relaxed">{feature.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      <section className="rounded-lg bg-sage-700 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Facing a Health Emergency?</h2>
        <p className="mt-2 text-sage-100">
          Some issues require landlord response within 24 hours by law.
        </p>
        <Link to="/emergency-guide">
          <Button variant="secondary" size="lg" className="mt-5 border-white/30 bg-white/10 text-white hover:bg-white/20">
            Get Emergency Guidance Now
          </Button>
        </Link>
      </section>
    </div>
  );
}
