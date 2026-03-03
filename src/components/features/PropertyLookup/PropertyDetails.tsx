import React from 'react';
import { Card } from '../../common';
import type { Property } from '../../../types';

interface PropertyDetailsProps {
  property: Property;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'text-green-600 bg-green-50';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'Unresolved':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getLicenseColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-600';
      case 'Expired':
        return 'text-red-600';
      case 'Revoked':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{property.address}</h2>
          {property.landlord && <p className="mt-1 text-gray-600">Landlord: {property.landlord}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <p className="text-sm text-gray-500">License Status</p>
            <p className={`text-lg font-semibold ${getLicenseColor(property.licenseStatus)}`}>
              {property.licenseStatus || 'Unknown'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Violations</p>
            <p className="text-2xl font-bold text-gray-900">{property.violations.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Unresolved Issues</p>
            <p className="text-2xl font-bold text-red-600">
              {property.violations.filter((v) => v.status === 'Unresolved').length}
            </p>
          </div>
        </div>

        {property.violations.length > 0 && (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Violation History</h3>
            <div className="space-y-3">
              {property.violations.map((violation, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{violation.type}</p>
                      <p className="mt-1 text-sm text-gray-600">{violation.description}</p>
                      <p className="mt-2 text-xs text-gray-500">
                        Reported: {new Date(violation.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`ml-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(violation.status)}`}
                    >
                      {violation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
