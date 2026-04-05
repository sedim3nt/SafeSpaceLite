import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../common';
import { decisionTree } from '../../../data/decisionTreeData';

interface DecisionTreeProps {
  legalNoticeHref?: string;
}

export const DecisionTree: React.FC<DecisionTreeProps> = ({ legalNoticeHref = '/legal-notice' }) => {
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [history, setHistory] = useState<string[]>([]);

  const currentNode = decisionTree[currentNodeId];

  const handleOptionClick = (nextId: string | null) => {
    if (nextId) {
      setHistory([...history, currentNodeId]);
      setCurrentNodeId(nextId);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const previousNodeId = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setCurrentNodeId(previousNodeId);
    }
  };

  const reset = () => {
    setCurrentNodeId('start');
    setHistory([]);
  };

  if (currentNode?.result) {
    const { result } = currentNode;
    const urgencyColors = {
      '24hr': 'bg-red-50 border-red-200 text-red-900',
      '72hr': 'bg-orange-50 border-orange-200 text-orange-900',
      standard: 'bg-blue-50 border-blue-200 text-blue-900',
    };

    return (
      <div className="space-y-6">
        <Card className={`border-2 ${urgencyColors[result.urgency]}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${result.urgency === '24hr' ? 'bg-red-100 text-red-800' : ''} ${result.urgency === '72hr' ? 'bg-orange-100 text-orange-800' : ''} ${result.urgency === 'standard' ? 'bg-blue-100 text-blue-800' : ''} `}
              >
                {result.urgency === '24hr' && '24-Hour Emergency'}
                {result.urgency === '72hr' && '72-Hour Response Required'}
                {result.urgency === 'standard' && 'Standard Timeline'}
              </span>
            </div>

            <h2 className="text-2xl font-bold">{result.title}</h2>
            <p className="text-lg">{result.description}</p>

            <div className="space-y-2">
              <h3 className="font-semibold">Steps to Take:</h3>
              <ol className="list-inside list-decimal space-y-1">
                {result.steps.map((step, index) => (
                  <li key={index} className="text-sm">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {result.legalNotice && (
              <div className="rounded-md bg-gray-100 p-3">
                <p className="text-sm font-medium text-text">Legal Notice:</p>
                <p className="text-sm text-text-muted">{result.legalNotice}</p>
              </div>
            )}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleBack} variant="secondary">
            Back
          </Button>
          <Button onClick={reset}>Start Over</Button>
          <Link to={legalNoticeHref}>
            <Button variant="secondary">Generate Legal Notice</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{currentNode.question}</h2>
          {currentNode.description && <p className="text-text-muted">{currentNode.description}</p>}

          <div className="space-y-2">
            {currentNode.options?.map((option) => (
              <button
                key={option.label}
                onClick={() => handleOptionClick(option.nextId)}
                className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-surface-muted ${option.urgency === '24hr' ? 'border-red-300 hover:bg-red-50' : 'border-border'} `}
              >
                <span className="font-medium">{option.label}</span>
                {option.urgency === '24hr' && (
                  <span className="ml-2 text-sm text-red-600">(24hr Emergency)</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {history.length > 0 && (
        <Button onClick={handleBack} variant="ghost">
          ← Back to previous question
        </Button>
      )}
    </div>
  );
};
