import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../common';
import type { Report, Comment as DbComment, Rebuttal } from '../../../types/database';
import { LandlordResponseForm } from '../LandlordResponses/LandlordResponseForm';

interface PropertyDetailsProps {
  propertyId: string;
  address: string;
  reports: Report[];
  comments: DbComment[];
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
  propertyId,
  address,
  reports,
  comments,
  rebuttals,
}: PropertyDetailsProps) {
  const [openResponseFor, setOpenResponseFor] = useState<string | null>(null);
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-text">{address}</h3>
        <div className="mt-2 flex gap-4 text-sm text-text-muted">
          <span>{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
          <span>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
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

      {reports.length === 0 ? (
        <Card className="py-8 text-center">
          <p className="text-text-muted">No reports filed for this property yet.</p>
          <p className="mt-1 text-sm text-text-muted">Be the first to report an issue.</p>
        </Card>
      ) : (
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
                        Issue started: {new Date(report.issue_started_at).toLocaleDateString()}
                      </span>
                    )}
                    {report.landlord_notified_at && (
                      <span className="rounded-full bg-surface-muted px-2.5 py-1">
                        Landlord notified: {new Date(report.landlord_notified_at).toLocaleDateString()}
                      </span>
                    )}
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
                    <div className="flex gap-2 overflow-x-auto">
                      {report.photo_urls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Evidence ${i + 1}`}
                          className="h-20 w-20 rounded-lg object-cover"
                          loading="lazy"
                        />
                      ))}
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

                  {!rebuttal && (
                    <div className="space-y-3 border-t border-border pt-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-text">Own or manage this property?</p>
                          <p className="text-sm text-text-muted">
                            Add one paid public response to this safety report.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={openResponseFor === report.id ? 'ghost' : 'secondary'}
                          onClick={() => setOpenResponseFor((current) => current === report.id ? null : report.id)}
                        >
                          {openResponseFor === report.id ? 'Close' : 'Respond'}
                        </Button>
                      </div>

                      {openResponseFor === report.id && (
                        <LandlordResponseForm
                          responseType="report"
                          targetId={report.id}
                          propertyId={propertyId}
                        />
                      )}
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
