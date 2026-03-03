import React from 'react';
import { Card } from '../../common';
import { emergencyContacts } from '../../../data/emergencyContacts';

export const EmergencyContacts: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Emergency Contacts</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {emergencyContacts.map((contact) => (
          <Card key={contact.phone} className={contact.emergency ? 'border-red-300 bg-red-50' : ''}>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">{contact.name}</h4>
              <a
                href={`tel:${contact.phone.replace(/\D/g, '')}`}
                className={`text-lg font-medium ${
                  contact.emergency ? 'text-red-600' : 'text-primary-600'
                } hover:underline`}
              >
                {contact.phone}
              </a>
              <p className="text-sm text-gray-600">{contact.description}</p>
              {contact.hours && <p className="text-xs text-gray-500">{contact.hours}</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
