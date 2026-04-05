import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-bamboo-50">
      <div className="mx-auto max-w-[1220px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text">Emergency Contacts</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="tel:911" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  911 — Emergency
                </a>
              </li>
              <li>
                <a href="tel:3034413460" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  Boulder County Health — (303) 441-3460
                </a>
              </li>
              <li>
                <a href="tel:3034427060" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  EPRAS Mediation — (303) 442-7060
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text">Resources</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/cities" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  City Coverage
                </Link>
              </li>
              <li>
                <Link to="/know-your-rights" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  Know Your Rights
                </Link>
              </li>
              <li>
                <Link to="/legal-notice" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  Legal Notice Generator
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="mailto:hello@spirittree.dev" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  Contact SafeSpace
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text">About SafeSpace</h3>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              SafeSpace helps renters understand the laws that apply to their address, document safety issues,
              and review landlord behavior with stronger privacy and accountability controls.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-bamboo-200 pt-8">
          <p className="text-center text-xs text-text-muted">
            &copy; {new Date().getFullYear()} SafeSpace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
