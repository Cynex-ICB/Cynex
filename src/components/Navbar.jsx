import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Faculty', to: '/faculty' },
  { label: 'Achievements', to: '/achievements' },
  { label: 'Placements', to: '/placements-internships' },
  { label: 'Materials', to: '/materials' },
  { label: 'Profile', to: '/profile' },
  { label: 'Contact Us', to: '/contact' },
 
];

function Navbar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarId = 'site-sidebar';

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar" aria-label="Primary navigation">
      <button
        className={`menu-toggle ${isOpen ? 'is-open' : ''}`}
        type="button"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-controls={sidebarId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <button
        className={`sidebar-backdrop ${isOpen ? 'show' : ''}`}
        type="button"
        aria-label="Close navigation menu"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={closeMenu}
      />

      <aside className={`sidebar ${isOpen ? 'show' : ''}`} id={sidebarId} aria-hidden={!isOpen}>
        <Link className="nav-brand" to="/" onClick={closeMenu}>
          CSE (IoT, Cybersecurity, including Blockchain Technology)
        </Link>

        {user ? (
          <div className="sidebar-user">
            <span>Signed in as</span>
            <strong>{user.name}</strong>
          </div>
        ) : null}

        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <NavLink
                to={link.to}
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          {['admin', 'master-admin'].includes(user?.role) ? (
            <li>
              <NavLink className="admin-nav-link" to="/admin" onClick={closeMenu}>
                Admin Dashboard
              </NavLink>
            </li>
          ) : null}
        </ul>

        <div className="nav-session">
          <button
            className="nav-logout"
            type="button"
            onClick={() => {
              closeMenu();
              onLogout?.();
            }}
          >
            Logout
          </button>
        </div>
      </aside>
    </nav>
  );
}

export default Navbar;
