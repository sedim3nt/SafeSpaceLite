import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Emergency Contacts</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="tel:911" className="text-sm text-gray-600 hover:text-gray-900">
                  911 - Emergency
                </a>
              </li>
              <li>
                <a href="tel:3034413460" className="text-sm text-gray-600 hover:text-gray-900">
                  Boulder County Health - (303) 441-3460
                </a>
              </li>
              <li>
                <a href="tel:3034427060" className="text-sm text-gray-600 hover:text-gray-900">
                  EPRAS Mediation - (303) 442-7060
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="https://bouldercolorado.gov/services/renter-resources"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Boulder Tenant Rights
                </a>
              </li>
              <li>
                <a
                  href="https://www.cobar.org/For-the-Public/Find-a-Lawyer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Legal Aid Foundation
                </a>
              </li>
              <li>
                <a
                  href="https://leg.colorado.gov/bills/hb24-1098"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  2024 Health Laws
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">About SafeSpace</h3>
            <p className="mt-4 text-sm text-gray-600">
              Empowering Boulder County renters with health and safety law guidance and transparent
              landlord accountability.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} SafeSpace Boulder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
