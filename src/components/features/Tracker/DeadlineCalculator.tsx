import React, { useState, useEffect, useCallback } from 'react';
import { Input, Select } from '../../common/Form';
import { Card } from '../../common';

interface DeadlineResult {
  deadline: Date;
  hoursRemaining: number;
  status: 'on-time' | 'late' | 'overdue';
  legalDeadline: string;
}

export const DeadlineCalculator: React.FC = () => {
  const [issueType, setIssueType] = useState('');
  const [reportedDate, setReportedDate] = useState('');
  const [reportedTime, setReportedTime] = useState('');
  const [result, setResult] = useState<DeadlineResult | null>(null);

  const issueTypes = [
    { value: '24hr', label: 'No heat (below 40°F)', deadline: '24 hours' },
    { value: '24hr-water', label: 'No running water', deadline: '24 hours' },
    { value: '24hr-sewage', label: 'Sewage backup', deadline: '24 hours' },
    { value: '24hr-gas', label: 'Gas leak/Carbon monoxide', deadline: '24 hours' },
    { value: '72hr', label: 'Mold (>10 sq ft)', deadline: '72 hours' },
    { value: '72hr-hot-water', label: 'No hot water', deadline: '72 hours' },
    { value: '7day', label: 'Minor repairs', deadline: '7 days' },
    { value: '30day', label: 'Non-emergency issues', deadline: '30 days' },
  ];

  const calculateDeadline = useCallback(() => {
    const reportDateTime = new Date(`${reportedDate}T${reportedTime}`);
    const now = new Date();
    
    let hoursToAdd = 0;
    let legalDeadline = '';
    
    switch (issueType) {
      case '24hr':
      case '24hr-water':
      case '24hr-sewage':
      case '24hr-gas':
        hoursToAdd = 24;
        legalDeadline = '24 hours';
        break;
      case '72hr':
      case '72hr-hot-water':
        hoursToAdd = 72;
        legalDeadline = '72 hours';
        break;
      case '7day':
        hoursToAdd = 24 * 7;
        legalDeadline = '7 days';
        break;
      case '30day':
        hoursToAdd = 24 * 30;
        legalDeadline = '30 days';
        break;
    }
    
    const deadline = new Date(reportDateTime.getTime() + hoursToAdd * 60 * 60 * 1000);
    const hoursRemaining = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    let status: 'on-time' | 'late' | 'overdue';
    if (hoursRemaining > 24) {
      status = 'on-time';
    } else if (hoursRemaining > 0) {
      status = 'late';
    } else {
      status = 'overdue';
    }
    
    setResult({
      deadline,
      hoursRemaining,
      status,
      legalDeadline,
    });
  }, [issueType, reportedDate, reportedTime]);

  useEffect(() => {
    if (issueType && reportedDate && reportedTime) {
      calculateDeadline();
    }
  }, [issueType, reportedDate, reportedTime, calculateDeadline]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'text-success bg-success-bg border-success/30';
      case 'late':
        return 'text-warning bg-warning-bg border-warning/30';
      case 'overdue':
        return 'text-danger bg-danger-bg border-danger/30';
      default:
        return 'text-text-muted bg-surface-muted border-border';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-4 text-lg font-semibold text-text">Calculate Response Deadline</h3>
        <div className="space-y-4">
          <Select
            label="Type of Issue"
            options={issueTypes}
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date Reported to Landlord"
              type="date"
              value={reportedDate}
              onChange={(e) => setReportedDate(e.target.value)}
              required
            />
            
            <Input
              label="Time Reported"
              type="time"
              value={reportedTime}
              onChange={(e) => setReportedTime(e.target.value)}
              required
            />
          </div>
        </div>
      </Card>

      {result && (
        <Card className={`border-2 ${getStatusColor(result.status)}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Legal Deadline</h4>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(result.status)}`}>
                {result.status === 'on-time' && 'On Time'}
                {result.status === 'late' && 'Response Due Soon'}
                {result.status === 'overdue' && 'Overdue'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-muted">Deadline</p>
                <p className="text-lg font-medium">
                  {result.deadline.toLocaleDateString()} at {result.deadline.toLocaleTimeString()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-text-muted">Time Remaining</p>
                <p className="text-lg font-medium">
                  {result.hoursRemaining > 0 
                    ? `${result.hoursRemaining} hours`
                    : `${Math.abs(result.hoursRemaining)} hours overdue`
                  }
                </p>
              </div>
            </div>
            
            <div className="border-t border-border pt-4">
              <p className="text-sm text-text-muted">
                Colorado law requires landlords to respond to this type of issue within <strong>{result.legalDeadline}</strong>.
                {result.status === 'overdue' && ' Since the deadline has passed, you may have additional legal remedies available.'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
