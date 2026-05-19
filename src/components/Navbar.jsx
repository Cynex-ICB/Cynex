import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Faculty', to: '/faculty' },
  { label: 'Achievements', to: '/achievements' },
  { label: 'Placements', to: '/placements-internships' },
  { label: 'Materials', to: '/materials' },
  { label: 'Contact Us', to: '/contact' },
 
];

function Navbar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };


  
  return (
    <nav className="navbar">
      <Link className="nav-brand" to="/" onClick={closeMenu}>
        CSE (IoT, Cybersecurity, including Blockchain Technology)
      </Link>

      <button
        className="menu-toggle"
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={`nav-links ${isOpen ? 'show' : ''}`}>
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
        {user?.role === 'admin' ? (
          <li>
            <NavLink className="admin-nav-link" to="/admin" onClick={closeMenu}>
              Admin Dashboard
            </NavLink>
          </li>
        ) : null}
        <li className="nav-session">
          {user ? <span>{user.name}</span> : null}
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
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
