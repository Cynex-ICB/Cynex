import { useState } from 'react';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Faculty', href: '#faculty' },
  { label: 'Achievements', href: '#achievements' },
  { label: 'Contact Us', href: '#contact' },
 
];

function Navbar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };


  
  return (
    <nav className="navbar">
      <a className="nav-brand" href="#home" onClick={closeMenu}>
        CSE (IoT, Cybersecurity, including Blockchain Technology)
      </a>

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
            <a href={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          </li>
        ))}
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
