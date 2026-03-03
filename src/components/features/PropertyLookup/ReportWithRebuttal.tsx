import React from 'react';
import { useRebuttal } from '../../../hooks';
import { IssueTypeLabels, SeverityLabels } from '../../../lib/contracts';
import { RebuttalCard } from './RebuttalCard';
import { RebuttalForm } from './RebuttalForm';

interface ReportWithRebuttalProps {
  report: {
    issueType: number;
    severity: number;
    timestamp: bigint;
    arweaveHash: string;
  };
  reportIndex: number;
  propertyAddress: string;
}

export const ReportWithRebuttal: React.FC<ReportWithRebuttalProps> = ({
  report,
  reportIndex,
  propertyAddress,
}) => {
  const { hasRebuttal, rebuttal } = useRebuttal(propertyAddress, reportIndex);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-900">
            {IssueTypeLabels[report.issueType] ?? 'Unknown'}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Severity: {SeverityLabels[report.severity] ?? 'Unknown'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {new Date(Number(report.timestamp) * 1000).toLocaleDateString()}
          </p>
        </div>
        <span className="ml-3 inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
          Permanent
        </span>
      </div>

      {hasRebuttal && rebuttal ? (
        <RebuttalCard
          arweaveHash={rebuttal.arweaveHash}
          timestamp={rebuttal.timestamp}
        />
      ) : (
        <RebuttalForm
          propertyAddress={propertyAddress}
          reportIndex={reportIndex}
        />
      )}
    </div>
  );
};
