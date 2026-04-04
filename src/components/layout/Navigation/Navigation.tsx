import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function Navigation({ mobile = false, onNavigate }: NavigationProps) {
  const location = useLocation();
  const navItems = [
    { name: 'Emergency Guide', href: '/emergency-guide', urgent: true },
    { name: 'Property Lookup', href: '/property-lookup' },
    { name: 'Report Issue', href: '/report' },
    { name: 'Track Response', href: '/tracker' },
    { name: 'Know Your Rights', href: '/know-your-rights' },
    { name: 'Review', href: '/review' },
    { name: 'AI Advocate', href: '/advocate' },
  ];

  const baseClasses = mobile
    ? 'block px-3 py-2.5 text-base font-medium rounded-md'
    : 'px-3 py-2 text-sm font-medium rounded-md';

  return (
    <nav className={mobile ? 'space-y-1' : 'flex space-x-1'}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onNavigate}
            className={`${baseClasses} transition-colors duration-200 ${
              item.urgent
                ? isActive
                  ? 'bg-danger-bg text-danger font-semibold'
                  : 'text-danger hover:bg-danger-bg'
                : isActive
                  ? 'bg-sage-50 text-sage-700 font-semibold'
                  : 'text-text-muted hover:bg-surface-muted hover:text-text'
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
