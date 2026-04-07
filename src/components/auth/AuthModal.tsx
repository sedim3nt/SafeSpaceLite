import { useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getIntentAccountRequirementCopy,
  getIntentActionLabel,
  getIntentReturnLabel,
  type AuthIntent,
} from '../../lib/authFlow';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  intent?: AuthIntent;
  returnPath?: string;
}

type CompletionState = {
  title: string;
  body: string;
  buttonLabel: string;
};

export function AuthModal({ isOpen, onClose, intent = 'general', returnPath }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle, googleAuthEnabled } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [completionState, setCompletionState] = useState<CompletionState | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error, status } = await signUp(email, password, { returnPath, intent });
        if (error) {
          setError(error.message);
        } else if (status === 'signed_in') {
          setCompletionState({
            title: 'Account created. You are signed in.',
            body: intent === 'general'
              ? 'Your SafeSpace account is ready.'
              : `Your SafeSpace account is ready. Your ${getIntentActionLabel(intent)} has not been submitted yet. Return to finish it.`,
            buttonLabel: getIntentReturnLabel(intent),
          });
        } else {
          setCompletionState({
            title: 'Account created. Check your email.',
            body: intent === 'general'
              ? `We sent a SafeSpace confirmation link to ${email}. Confirm your account to finish signing in.`
              : `We sent a SafeSpace confirmation link to ${email}. After you confirm, SafeSpace will bring you back here so you can finish your ${getIntentActionLabel(intent)}.`,
            buttonLabel: 'Got it',
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else if (intent === 'general') {
          onClose();
        } else {
          setCompletionState({
            title: 'Signed in.',
            body: `You are signed in to SafeSpace. Your ${getIntentActionLabel(intent)} has not been submitted yet. Return to finish it.`,
            buttonLabel: getIntentReturnLabel(intent),
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    const { error } = await signInWithGoogle({ returnPath, intent });
    if (error) {
      if (error.message.includes('Unsupported provider')) {
        setError('Google sign-in is not configured in SafeSpace yet. Use email sign-in for now.');
          return;
      }
      setError(error.message);
    }
  };

  if (completionState) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
        <div className="w-full max-w-md rounded-lg bg-surface p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage-100">
              <svg className="h-6 w-6 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text">{completionState.title}</h2>
            <p className="mt-2 text-text-muted">
              {completionState.body}
            </p>
            <button onClick={onClose} className="mt-6 rounded-md bg-sage-600 px-6 py-2 text-white hover:bg-sage-700 transition-colors">
              {completionState.buttonLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-surface p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-text">
            {mode === 'login' ? 'Sign in to SafeSpace' : 'Create your SafeSpace account'}
          </h2>
          <p className="mt-1 text-text-muted">
            {mode === 'login' ? 'Access SafeSpace to continue' : 'Join SafeSpace to continue'}
          </p>
        </div>

        <div className="mb-6 rounded-md border border-border bg-surface-muted p-4 text-sm text-text-muted">
          {getIntentAccountRequirementCopy(intent)}
        </div>

        {googleAuthEnabled ? (
          <>
            <button
              onClick={handleGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-3 font-medium text-text transition-colors hover:bg-surface-muted"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border"></div>
              <span className="text-sm text-text-muted">or</span>
              <div className="h-px flex-1 bg-border"></div>
            </div>
          </>
        ) : (
          <div className="mb-6 rounded-md border border-border bg-surface-muted p-4 text-sm text-text-muted">
            Google sign-in is not available in SafeSpace yet. Use email to create your account or sign in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-text">Email</label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-border bg-surface px-4 py-3 text-text placeholder:text-text-muted focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-400/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-text">Password</label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-border bg-surface px-4 py-3 text-text placeholder:text-text-muted focus:border-sage-400 focus:outline-none focus:ring-2 focus:ring-sage-400/20"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <div className="rounded-md bg-danger-bg p-3 text-sm text-danger">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-sage-600 px-4 py-3 font-medium text-white transition-colors hover:bg-sage-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setCompletionState(null); }}
            className="font-medium text-sage-600 hover:text-sage-700"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
