import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Ticket, BarChart2 } from 'lucide-react';

const USER_NAV = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/token', icon: Ticket, label: 'My Token' },
];

const ADMIN_NAV = [
  { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
];

export default function BottomNav({ isAdmin = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV;

  return (
    <nav className="bottom-nav safe-pb" aria-label="Main navigation">
      {navItems.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            id={`nav-${label.toLowerCase().replace(/\s/g, '-')}-btn`}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(path)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.5 : 1.8}
              style={{ color: active ? 'var(--secondary)' : '#9CA3AF' }}
            />
            <span>{label}</span>
            {active && (
              <div
                className="absolute bottom-0 w-5 h-0.5 rounded-full"
                style={{ background: 'var(--secondary)' }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
