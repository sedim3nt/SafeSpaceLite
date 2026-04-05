import React, { useEffect, useState } from 'react';
import { Card, Button } from '../../common';
import { Input, Select, Textarea } from '../../common/Form';
import { useLocalStorage } from '../../../hooks';
import type { TrackedIssue } from '../../../types';

const defaultIssues: TrackedIssue[] = [
  {
    id: '1',
    propertyAddress: '1234 Pearl St, Boulder, CO',
    issueType: 'No heat',
    dateReported: '2024-01-28',
    deadline: '2024-01-29',
    status: 'pending',
    notes: 'Temperature dropped below 40\u00b0F, notified landlord via email',
  },
];

interface TrackedIssuesProps {
  initialAddress?: string;
}

export const TrackedIssues: React.FC<TrackedIssuesProps> = ({ initialAddress = '' }) => {
  const [issues, setIssues] = useLocalStorage<TrackedIssue[]>(
    'safespace-tracked-issues',
    defaultIssues
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [newIssue, setNewIssue] = useState({
    propertyAddress: initialAddress,
    issueType: '',
    dateReported: '',
    notes: '',
  });

  useEffect(() => {
    if (initialAddress) {
      setShowAddForm(true);
      setNewIssue((current) => ({ ...current, propertyAddress: current.propertyAddress || initialAddress }));
    }
  }, [initialAddress]);

  const issueTypes = [
    { value: 'no-heat', label: 'No heat' },
    { value: 'no-water', label: 'No water' },
    { value: 'mold', label: 'Mold' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'other', label: 'Other' },
  ];

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate deadline based on issue type
    const reportDate = new Date(newIssue.dateReported);
    const deadline = new Date(reportDate);

    if (newIssue.issueType === 'no-heat' || newIssue.issueType === 'no-water') {
      deadline.setHours(deadline.getHours() + 24);
    } else if (newIssue.issueType === 'mold') {
      deadline.setHours(deadline.getHours() + 72);
    } else {
      deadline.setDate(deadline.getDate() + 7);
    }

    const issue: TrackedIssue = {
      id: Date.now().toString(),
      propertyAddress: newIssue.propertyAddress,
      issueType: newIssue.issueType,
      dateReported: newIssue.dateReported,
      deadline: deadline.toISOString().split('T')[0],
      status: 'pending',
      notes: newIssue.notes,
    };

    setIssues([issue, ...issues]);
    setShowAddForm(false);
    setNewIssue({
      propertyAddress: '',
      issueType: '',
      dateReported: '',
      notes: '',
    });
  };

  const updateStatus = (id: string, status: TrackedIssue['status']) => {
    setIssues(issues.map((issue) => (issue.id === id ? { ...issue, status } : issue)));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning-bg text-warning border-warning/30';
      case 'resolved':
        return 'bg-success-bg text-success border-success/30';
      case 'overdue':
        return 'bg-danger-bg text-danger border-danger/30';
      default:
        return 'bg-surface-muted text-text-muted border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text">Your Tracked Issues</h3>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} size="sm">
            Track New Issue
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card className="bg-surface-muted">
          <form onSubmit={handleAddIssue} className="space-y-4">
            <Input
              label="Property Address"
              required
              value={newIssue.propertyAddress}
              onChange={(e) => setNewIssue({ ...newIssue, propertyAddress: e.target.value })}
            />

            <Select
              label="Issue Type"
              required
              options={issueTypes}
              value={newIssue.issueType}
              onChange={(e) => setNewIssue({ ...newIssue, issueType: e.target.value })}
            />

            <Input
              label="Date Reported to Landlord"
              type="date"
              required
              value={newIssue.dateReported}
              onChange={(e) => setNewIssue({ ...newIssue, dateReported: e.target.value })}
            />

            <Textarea
              label="Notes"
              value={newIssue.notes}
              onChange={(e) => setNewIssue({ ...newIssue, notes: e.target.value })}
              placeholder="Any additional details..."
              rows={3}
            />

            <div className="flex gap-3">
              <Button type="submit">Add Issue</Button>
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {issues.length === 0 ? (
        <Card className="py-8 text-center">
          <p className="text-text-muted">No issues being tracked</p>
          <p className="mt-2 text-sm text-text-muted">
            Start tracking to monitor landlord response times
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => {
            const deadline = new Date(issue.deadline);
            const now = new Date();
            const isOverdue = deadline < now && issue.status === 'pending';

            return (
              <Card key={issue.id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-text">{issue.propertyAddress}</h4>
                      <p className="mt-1 text-sm text-text-muted">{issue.issueType}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium ${
                        isOverdue ? 'bg-danger-bg text-danger border-danger/30' : getStatusColor(issue.status)
                      }`}
                    >
                      {isOverdue ? 'Overdue' : issue.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-muted">Reported</p>
                      <p className="font-medium">
                        {new Date(issue.dateReported).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-muted">Deadline</p>
                      <p className="font-medium">{deadline.toLocaleDateString()}</p>
                    </div>
                  </div>

                  {issue.notes && <p className="text-sm text-text-muted">{issue.notes}</p>}

                  {issue.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateStatus(issue.id, 'resolved')}
                      >
                        Mark Resolved
                      </Button>
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
};
