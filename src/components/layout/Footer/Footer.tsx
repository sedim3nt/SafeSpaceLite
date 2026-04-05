import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-bamboo-50">
      <div className="mx-auto max-w-[1220px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text">Get Help</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="tel:911" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  911 — Emergency
                </a>
              </li>
              <li>
                <a href="tel:988" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  988 — Crisis and Mental Health Support
                </a>
              </li>
              <li>
                <a href="tel:211" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  211 — Local Housing and Community Services
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
                <a href="mailto:terraloam.eye@gmail.com" className="text-sm text-text-muted transition-colors hover:text-sage-600">
                  Contact SafeSpace
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text">About SafeSpace</h3>
              <p className="mt-4 text-sm leading-relaxed text-text-muted">
                SafeSpace helps renters research addresses, understand tenant protections, document health and safety issues,
                and read landlord reviews before they sign or renew a lease.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text">Improve SafeSpace</h3>
              <p className="mt-4 text-sm leading-relaxed text-text-muted">
                Found a bug, confusing UI, or something we should improve? Send feedback so we can make SafeSpace clearer, faster, and more useful.
              </p>
              <a
                href="mailto:terraloam.eye@gmail.com?subject=SafeSpace%20Feedback"
                className="mt-4 inline-flex items-center justify-center rounded-md bg-sage-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sage-700"
              >
                Provide Feedback
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-bamboo-200 pt-8">
          <p className="text-center text-sm text-text-muted">
            &copy; {new Date().getFullYear()} SafeSpace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
