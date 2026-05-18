import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Faculty from './components/Faculty.jsx';
import Achievements from './components/Achievements.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Auth from './components/Auth.jsx';

function readStoredUser() {
  try {
    const savedUser = localStorage.getItem('authUser');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem('authUser');
    return null;
  }
}

function App() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || '');
  const [authUser, setAuthUser] = useState(readStoredUser);

  const isAuthenticated = Boolean(authToken);

  useEffect(() => {
    document.body.classList.toggle('auth-only', !isAuthenticated);

    if (isAuthenticated) {
      window.history.replaceState({}, document.title, '/#home');
      return;
    }

    const authPaths = ['/login', '/signup', '/reset'];
    const resetToken = new URLSearchParams(window.location.search).get('resetToken');

    if (resetToken && window.location.pathname !== '/reset') {
      window.history.replaceState({}, document.title, `/reset${window.location.search}`);
    } else if (!resetToken && !authPaths.includes(window.location.pathname)) {
      window.history.replaceState({}, document.title, '/login');
    }

    return () => {
      document.body.classList.remove('auth-only');
    };
  }, [isAuthenticated]);

  const handleAuthenticated = ({ token, user }) => {
    setAuthToken(token);
    setAuthUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setAuthToken('');
    setAuthUser(null);
  };

  if (!isAuthenticated) {
    return (
      <main className="auth-page">
        <Auth onAuthenticated={handleAuthenticated} />
      </main>
    );
  }

  return (
    <>
      <Header />
      <Navbar user={authUser} onLogout={handleLogout} />
      <main>
        <Hero />
        <About />
        <Faculty />
        <Achievements />
        <Contact /> 
      </main>
      <Footer />
    </>
  );
}

export default App;
