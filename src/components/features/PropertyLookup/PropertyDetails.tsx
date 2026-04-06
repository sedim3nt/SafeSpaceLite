import { Link } from 'react-router-dom';
import { Button, Card } from '../../common';
import type { Report, Rebuttal } from '../../../types/database';

interface PropertyDetailsProps {
  propertyId: string;
  address: string;
  reports: Report[];
  rebuttals: Rebuttal[];
}

const EVIDENCE_TIERS: Record<string, { label: string; style: string }> = {
  narrative_only: {
    label: 'Level 1: Narrative',
    style: 'bg-slate-100 text-slate-700',
  },
  photo_documentation: {
    label: 'Level 2: Photo / Document',
    style: 'bg-sky-100 text-sky-700',
  },
  third_party_test: {
    label: 'Level 3: Third-Party Test',
    style: 'bg-violet-100 text-violet-700',
  },
  official_finding: {
    label: 'Level 4: Official Finding',
    style: 'bg-emerald-100 text-emerald-700',
  },
};

export function PropertyDetails({
  address,
  reports,
  rebuttals,
}: PropertyDetailsProps) {
  const issueLabels: Record<string, string> = {
    mold: 'Mold',
    radon: 'Radon',
    'carbon-monoxide': 'Carbon Monoxide',
    heating: 'Heating',
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    structural: 'Structural',
    pests: 'Pests',
    other: 'Other',
  };

  const severityConfig: Record<string, { label: string; className: string }> = {
    emergency_24h: { label: '24hr Emergency', className: 'bg-red-100 text-red-700' },
    urgent_72h: { label: '72hr Urgent', className: 'bg-amber-100 text-amber-700' },
    standard: { label: 'Standard', className: 'bg-blue-100 text-blue-700' },
  };

  const getRebuttalForReport = (reportId: string) =>
    rebuttals.find((r) => r.report_id === reportId);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="space-y-6">
      <div className="pt-4">
        <h3 className="text-xl font-semibold text-text">{address}</h3>
        <div className="mt-2 flex gap-4 text-sm text-text-muted">
          <span>{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/report?address=${encodeURIComponent(address)}`}>
            <Button size="sm">Report an Issue</Button>
          </Link>
          <Link to={`/legal-notice?address=${encodeURIComponent(address)}`}>
            <Button size="sm" variant="secondary">Generate Legal Notice</Button>
          </Link>
        </div>
      </div>

      {reports.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-3xl font-bold tracking-tight text-ink">Reports Timeline</h3>
          {reports.map((report) => {
            const rebuttal = getRebuttalForReport(report.id);
            const severity = severityConfig[report.severity] || severityConfig.standard;
            const evidenceTier = EVIDENCE_TIERS[report.evidence_tier] || EVIDENCE_TIERS.narrative_only;

            return (
              <Card key={report.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-text">
                        {issueLabels[report.issue_type] || report.issue_type}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${severity.className}`}>
                        {severity.label}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${evidenceTier.style}`}>
                        {evidenceTier.label}
                      </span>
                    </div>
                    <time className="text-sm text-text-muted">
                      {new Date(report.created_at).toLocaleDateString()}
                    </time>
                  </div>

                  <p className="text-text-muted">{report.description}</p>

                  <div className="flex flex-wrap gap-2 text-sm text-text-muted">
                    {report.issue_started_at && (
                      <span className="rounded-full bg-surface-muted px-2.5 py-1">
                        Issue started: {formatDate(report.issue_started_at)}
                      </span>
                    )}
                    {report.landlord_notified_at && (
                      <span className="rounded-full bg-surface-muted px-2.5 py-1">
                        Landlord notified: {formatDate(report.landlord_notified_at)}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3 rounded-lg border border-border bg-surface-muted/60 p-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Issue Type</p>
                      <p className="mt-1 text-sm font-medium text-text">
                        {issueLabels[report.issue_type] || report.issue_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Posted</p>
                      <p className="mt-1 text-sm font-medium text-text">{formatDate(report.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Severity</p>
                      <p className="mt-1 text-sm font-medium text-text">{severity.label}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Evidence Level</p>
                      <p className="mt-1 text-sm font-medium text-text">{evidenceTier.label}</p>
                    </div>
                  </div>

                  {report.evidence_details && (
                    <div className="rounded-lg bg-surface-muted p-3">
                      <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                        Evidence summary
                      </p>
                      <p className="mt-1 text-sm text-text">{report.evidence_details}</p>
                    </div>
                  )}

                  {report.photo_urls && report.photo_urls.length > 0 && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                          Evidence Uploads
                        </p>
                        <p className="mt-1 text-sm text-text-muted">
                          Open an image in a new tab or download the original file.
                        </p>
                      </div>
                      <div className="flex gap-3 overflow-x-auto pb-1">
                        {report.photo_urls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="group block shrink-0"
                          >
                            <img
                              src={url}
                              alt={`Evidence ${i + 1}`}
                              className="h-28 w-28 rounded-lg border border-border object-cover transition-transform group-hover:scale-[1.02]"
                              loading="lazy"
                            />
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="inline-flex rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text">
                                Evidence {i + 1}
                              </span>
                              <span className="inline-flex rounded-full bg-sage-50 px-2.5 py-1 text-xs font-medium text-sage-700">
                                Open
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {report.photo_urls.map((url, i) => (
                          <a
                            key={`${url}-download`}
                            href={url}
                            download
                            className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-sm font-medium text-sage-700 ring-1 ring-border transition-colors hover:bg-sage-50"
                          >
                            Download Evidence {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.is_anonymous && (
                    <p className="text-sm text-text-muted italic">Reported anonymously</p>
                  )}

                  {rebuttal && (
                    <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-sm font-medium text-teal-700">
                          Landlord Response
                        </span>
                        {rebuttal.is_verified && (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-medium text-emerald-700">
                            Verified Owner
                          </span>
                        )}
                        <time className="ml-auto text-sm text-text-muted">
                          {new Date(rebuttal.created_at).toLocaleDateString()}
                        </time>
                      </div>
                      <p className="text-sm text-teal-900">{rebuttal.body}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
