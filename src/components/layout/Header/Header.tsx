import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../Navigation/Navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { AuthModal } from '../../auth/AuthModal';
import { Button } from '../../common/Button/Button';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-rice/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="font-[var(--font-display)] text-[1.5625rem] font-bold text-ink transition-colors hover:text-sage-700" style={{ fontFamily: 'var(--font-display)' }}>
              SafeSpace
            </Link>

            <div className="hidden md:block">
              <Navigation />
            </div>

            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to="/property-owners">
                    <Button variant="secondary" size="sm" className="bg-white text-text hover:bg-surface-muted">
                      For Property Owners
                    </Button>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="rounded-md px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="rounded-md bg-sage-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sage-700"
                >
                  Sign in
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-text-muted hover:bg-surface-muted hover:text-text focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-inset md:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-border md:hidden">
            <div className="space-y-1 px-4 pt-3 pb-4">
              <Navigation mobile onNavigate={() => setIsMobileMenuOpen(false)} />
              <div className="mt-4 border-t border-border pt-4">
                <Link
                  to="/property-owners"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mb-3 block"
                >
                  <Button variant="secondary" className="w-full bg-white text-text hover:bg-surface-muted">
                    For Property Owners
                  </Button>
                </Link>
                {user ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                      className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-text-muted hover:bg-surface-muted"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setShowAuth(true); setIsMobileMenuOpen(false); }}
                    className="w-full rounded-md bg-sage-600 px-4 py-2.5 text-center font-medium text-white hover:bg-sage-700"
                  >
                    Sign in
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
