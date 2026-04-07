import { useState, type ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { getIntentAccountRequirementCopy, type AuthIntent } from '../../lib/authFlow';

interface ProtectedActionProps {
  children: ReactNode;
  fallback?: ReactNode;
  intent?: AuthIntent;
  ctaLabel?: string;
  title?: string;
  returnPath?: string;
}

export function ProtectedAction({
  children,
  fallback,
  intent = 'general',
  ctaLabel = 'Sign in to continue',
  title = 'Sign in to continue',
  returnPath,
}: ProtectedActionProps) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (user) return <>{children}</>;

  return (
    <>
      <div onClick={() => setShowAuth(true)} className="cursor-pointer">
        {fallback || (
          <div className="rounded-md border-2 border-dashed border-sage-200 bg-sage-50/50 p-6 text-center">
            <p className="font-medium text-sage-800">{title}</p>
            <p className="mt-1 text-sm text-sage-600">{getIntentAccountRequirementCopy(intent)}</p>
            <p className="mt-3 text-sm font-medium text-sage-700">{ctaLabel}</p>
          </div>
        )}
      </div>
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        intent={intent}
        returnPath={returnPath}
      />
    </>
  );
}
