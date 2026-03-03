import React from 'react';
import { Card } from '../../common';
import { usePropertyReports } from '../../../hooks';
import { ReportWithRebuttal } from './ReportWithRebuttal';

interface OnChainReportsProps {
  propertyAddress: string;
}

export const OnChainReports: React.FC<OnChainReportsProps> = ({ propertyAddress }) => {
  const { reports, reportCount, isLoading, error } = usePropertyReports(propertyAddress);

  if (isLoading) {
    return (
      <Card>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Verified Reports</h3>
        <p className="text-sm text-gray-500">Loading reports...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Verified Reports</h3>
        <p className="text-sm text-gray-500">Unable to load reports. Please try again later.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Verified Reports</h3>
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            {reportCount} verified
          </span>
        </div>

        {reports.length === 0 ? (
          <p className="text-sm text-gray-500">No reports for this property yet.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report, index) => (
              <ReportWithRebuttal
                key={index}
                report={report}
                reportIndex={index}
                propertyAddress={propertyAddress}
              />
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400">
          Reports are permanently recorded and cannot be deleted or modified.
        </p>
      </div>
    </Card>
  );
};
