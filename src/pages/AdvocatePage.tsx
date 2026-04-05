import { useState } from 'react';
import { Button, Card, Textarea } from '../components/common';
import { chatCompletion, SITUATION_ANALYZER_PROMPT } from '../lib/ai';

const EXAMPLE_SITUATIONS = [
  "My landlord hasn't fixed the heat in 3 weeks",
  "I got a lease violation notice for my ESA",
  "My landlord entered my apartment without notice while I was at work",
  "I'm being charged $800 in 'cleaning fees' from my security deposit",
  "My landlord threatened to evict me after I complained about mold",
  "There's been a roach infestation for 2 months and management won't respond",
];

export function AdvocatePage() {
  const [situation, setSituation] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedSection, setCopiedSection] = useState('');

  const analyze = async () => {
    if (!situation.trim()) return;
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const result = await chatCompletion([
        { role: 'system', content: SITUATION_ANALYZER_PROMPT },
        { role: 'user', content: situation },
      ]);
      setResponse(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to analyze. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(''), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(''), 2000);
    }
  };

  const extractSection = (text: string, heading: string): string => {
    const regex = new RegExp(`##\\s*[^\\n]*${heading}[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown renderer
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        const isTemplateLetter = line.toLowerCase().includes('template letter');
        return (
          <div key={i} className="flex items-center justify-between mt-8 mb-3 first:mt-0">
            <h2 className="text-xl font-display font-semibold text-sage-800">
              {line.replace('## ', '')}
            </h2>
            {isTemplateLetter && (
              <button
                onClick={() => copyToClipboard(extractSection(response, 'Template Letter'), 'letter')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-sage-100 text-sage-700 hover:bg-sage-200 transition-colors"
              >
                {copiedSection === 'letter' ? '✓ Copied!' : '📋 Copy Letter'}
              </button>
            )}
          </div>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={i} className="text-lg font-display font-semibold text-sage-700 mt-5 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <div key={i} className="flex gap-3 ml-1 mb-2">
            <span className="text-sage-500 font-semibold min-w-[1.5rem]">
              {line.match(/^(\d+)\./)?.[1]}.
            </span>
            <span className="text-text">{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
          </div>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <div key={i} className="flex gap-2 ml-2 mb-1.5">
            <span className="text-sage-400 mt-1">•</span>
            <span className="text-text">{renderInline(line.replace(/^-\s/, ''))}</span>
          </div>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={i} className="border-l-3 border-sage-300 pl-4 text-text-muted italic my-2">
            {renderInline(line.replace(/^>\s/, ''))}
          </blockquote>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      if (line.startsWith('⚖️')) {
        return (
          <div key={i} className="mt-6 p-4 rounded-lg bg-bamboo-50 border border-bamboo-200 text-sm text-bamboo-800 italic">
            {renderInline(line)}
          </div>
        );
      }
      return (
        <p key={i} className="text-text mb-1.5 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    });
  };

  const renderInline = (text: string) => {
    // Bold and italic
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-text">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink">AI Advocate</h1>
        <p className="mt-2 text-lg text-text-muted">
          Describe your rental situation and get a plain-language analysis of the laws that apply, recommended next steps, and a draft letter you can use.
        </p>
      </div>

      {/* Input */}
      <Card className="space-y-4">
        <Textarea
          label="What's happening?"
          placeholder="Describe your situation in plain text. Include details like your city, how long the issue has persisted, and any communication with your landlord..."
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          className="min-h-[140px]"
        />

        {/* Example prompts */}
        <div>
          <p className="text-sm font-medium text-text-muted mb-2 uppercase tracking-wide">
            Example situations
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_SITUATIONS.map((example) => (
              <button
                key={example}
                onClick={() => setSituation(example)}
                className="px-3 py-1.5 text-sm rounded-full border border-border bg-surface text-text-muted hover:border-sage-300 hover:text-text hover:bg-sage-50 transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={analyze}
            disabled={!situation.trim() || loading}
            size="md"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              '🔍 Analyze My Situation'
            )}
          </Button>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Card variant="danger" className="text-sm">
          <p className="font-semibold text-danger mb-1">Analysis failed</p>
          <p className="text-text-muted">{error}</p>
          <p className="text-sm text-text-muted mt-2">
            Make sure you have a working internet connection and try again.
          </p>
        </Card>
      )}

      {/* Response */}
      {response && (
        <Card className="space-y-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-sage-800">
              Your Analysis
            </h2>
            <button
              onClick={() => copyToClipboard(response, 'full')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-sage-100 text-sage-700 hover:bg-sage-200 transition-colors"
            >
              {copiedSection === 'full' ? '✓ Copied!' : '📋 Copy All'}
            </button>
          </div>
          <div className="prose-safespace">{renderMarkdown(response)}</div>
        </Card>
      )}

      {/* Always-visible disclaimer */}
      <div className="text-sm text-text-muted pb-8">
        ⚖️ This is general information, not legal advice. Consult a tenant rights attorney for your situation.
        <br />
        SafeSpace Tenant Advocate is powered by AI and may occasionally produce inaccurate information.
      </div>
    </div>
  );
}
