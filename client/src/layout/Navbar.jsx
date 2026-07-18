import { MdMenu } from 'react-icons/md';
import useAuth from '../hooks/useAuth.js';

export const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="app-navbar">
      <button
        type="button"
        className="navbar-toggle"
        onClick={onToggleSidebar}
        aria-label="Toggle Sidebar"
      >
        <MdMenu />
      </button>

      <div className="navbar-actions">
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span className="text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {user.name}
            </span>
            <div className="navbar-user-avatar" title={`${user.name} (${user.role})`}>
              {getInitials(user.name)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
