import { useState } from 'react';
import { Button } from '../../common';
import { chatCompletion, REVIEW_HELPER_PROMPT } from '../../../lib/ai';

interface ReviewAIHelperProps {
  reviewText: string;
  onAccept: (improvedText: string) => void;
}

export function ReviewAIHelper({ reviewText, onAccept }: ReviewAIHelperProps) {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const improve = async () => {
    if (!reviewText.trim()) return;
    setLoading(true);
    setError('');
    setResult('');
    setExpanded(true);

    try {
      const response = await chatCompletion([
        { role: 'system', content: REVIEW_HELPER_PROMPT },
        { role: 'user', content: `Here is my draft review:\n\n${reviewText}` },
      ]);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to improve review.');
    } finally {
      setLoading(false);
    }
  };

  const extractImprovedReview = (text: string): string => {
    const match = text.match(/##\s*[^\n]*Improved Review[^\n]*\n([\s\S]*?)(?=\n##\s|$)/i);
    return match ? match[1].trim() : text;
  };

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={improve}
        disabled={!reviewText.trim() || loading}
        className="flex items-center gap-1.5 text-sm font-medium text-sage-600 hover:text-sage-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
            Improving...
          </>
        ) : (
          <>✨ Improve with AI</>
        )}
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-sage-200 bg-sage-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-sage-800 flex items-center gap-1.5">
          ✨ AI Review Helper
        </h4>
        <button
          onClick={() => { setExpanded(false); setResult(''); }}
          className="text-sm text-text-muted hover:text-text"
        >
          ✕ Close
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-text-muted py-4">
          <span className="inline-block w-4 h-4 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
          Analyzing your review...
        </div>
      )}

      {error && (
        <div className="text-sm text-danger bg-danger-bg rounded-md p-3">
          {error}
          <button onClick={improve} className="ml-2 underline text-danger hover:text-red-700">
            Retry
          </button>
        </div>
      )}

      {result && (
        <>
          <div className="text-sm text-text space-y-2 max-h-[300px] overflow-y-auto">
            {result.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return (
                  <h3 key={i} className="font-semibold text-sage-700 mt-3 first:mt-0">
                    {line.replace('## ', '')}
                  </h3>
                );
              }
              if (line.startsWith('- ')) {
                return (
                  <div key={i} className="flex gap-2 ml-1">
                    <span className="text-sage-400">•</span>
                    <span>{line.replace('- ', '')}</span>
                  </div>
                );
              }
              if (line.trim() === '') return <div key={i} className="h-1" />;
              return <p key={i} className="leading-relaxed">{line}</p>;
            })}
          </div>

          <div className="flex gap-2 pt-2 border-t border-sage-200">
            <Button
              size="sm"
              onClick={() => {
                onAccept(extractImprovedReview(result));
                setExpanded(false);
                setResult('');
              }}
            >
              Use Improved Version
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setExpanded(false); setResult(''); }}
            >
              Keep Original
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
