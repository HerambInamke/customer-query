import { NavLink } from 'react-router-dom';
import { MdDashboard, MdListAlt, MdAddCircle, MdLogout } from 'react-icons/md';
import useAuth from '../hooks/useAuth.js';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <MdDashboard /> },
    { to: '/queries', label: 'Queries', icon: <MdListAlt />, end: true },
    { to: '/queries/create', label: 'New Query', icon: <MdAddCircle /> },
  ];

  return (
    <>
      {}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`app-sidebar ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-logo">
          <span>CustomerQuery</span>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-link-icon" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center' }}>
                {link.icon}
              </span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name}</span>
              <span className="sidebar-user-role">{user.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '0.25rem',
                minWidth: 'auto',
                width: '2rem',
                height: '2rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <MdLogout style={{ fontSize: '1rem' }} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
export default Sidebar;
