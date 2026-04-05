import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

const primaryItems = [
  { name: 'Property Lookup', href: '/property-lookup' },
  { name: 'Report Safety Issue', href: '/report' },
  { name: 'Landlord Review', href: '/review' },
];

const toolItems = [
  { name: 'AI Advocate', href: '/advocate' },
  { name: 'Emergency', href: '/emergency-guide', urgent: true },
  { name: 'Tenant Rights', href: '/know-your-rights' },
  { name: 'Generate Legal Notice', href: '/legal-notice' },
  { name: 'City Search', href: '/cities' },
];

export function Navigation({ mobile = false, onNavigate }: NavigationProps) {
  const location = useLocation();
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setToolsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isToolRoute = toolItems.some((item) =>
    item.href === '/cities'
      ? location.pathname === '/cities' || location.pathname.startsWith('/city/')
      : location.pathname === item.href,
  );

  const baseClasses = mobile
    ? 'block w-full px-3 py-2.5 text-left text-base font-medium rounded-md'
    : 'px-3 py-2 text-sm font-medium rounded-md';

  const idleClasses = 'text-text-muted hover:bg-surface-muted hover:text-text';
  const activeClasses = 'bg-sage-50 text-sage-700 font-semibold';
  const urgentIdleClasses = 'text-danger hover:bg-danger-bg';
  const urgentActiveClasses = 'bg-danger-bg text-danger font-semibold';

  return (
    <nav className={mobile ? 'space-y-1' : 'flex items-center space-x-1'}>
      {primaryItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onNavigate}
            className={`${baseClasses} transition-colors duration-200 ${isActive ? activeClasses : idleClasses}`}
          >
            {item.name}
          </Link>
        );
      })}

      <div ref={toolsRef} className={mobile ? 'space-y-1' : 'relative'}>
        <button
          type="button"
          onClick={() => setToolsOpen((current) => !current)}
          className={`${baseClasses} inline-flex items-center gap-2 transition-colors duration-200 ${
            isToolRoute ? activeClasses : idleClasses
          }`}
          aria-expanded={toolsOpen}
          aria-haspopup="menu"
        >
          Tools
          <span className={`text-sm transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}>▾</span>
        </button>

        {toolsOpen && (
          <div
            className={
              mobile
                ? 'space-y-1 pl-3'
                : 'absolute right-0 top-full z-50 mt-2 min-w-[240px] rounded-xl border border-border bg-white p-2 shadow-lg'
            }
            role="menu"
          >
            {toolItems.map((item) => {
              const isActive =
                item.href === '/cities'
                  ? location.pathname === '/cities' || location.pathname.startsWith('/city/')
                  : location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    setToolsOpen(false);
                    onNavigate?.();
                  }}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    item.urgent
                      ? isActive
                        ? urgentActiveClasses
                        : urgentIdleClasses
                      : isActive
                        ? activeClasses
                        : idleClasses
                  }`}
                  role="menuitem"
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
