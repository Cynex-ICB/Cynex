import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Faculty from './components/Faculty.jsx';
import Achievements from './components/Achievements.jsx';
import PlacementsInternships from './components/PlacementsInternships.jsx';
import Materials from './components/Materials.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Auth from './components/Auth.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

function readStoredUser() {
  try {
    const savedUser = localStorage.getItem('authUser');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem('authUser');
    return null;
  }
}

function PublicLayout({ user, onLogout, children }) {
  return (
    <>
      <Header />
      <Navbar user={user} onLogout={onLogout} />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function ProtectedPublicPage({ user, onLogout, children }) {
  return (
    <PublicLayout user={user} onLogout={onLogout}>
      {children}
    </PublicLayout>
  );
}

function App() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || '');
  const [authUser, setAuthUser] = useState(readStoredUser);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = Boolean(authToken);

  useEffect(() => {
    document.body.classList.toggle('auth-only', !isAuthenticated);

    return () => {
      document.body.classList.remove('auth-only');
    };
  }, [isAuthenticated]);

  const handleAuthenticated = ({ token, user }) => {
    setAuthToken(token);
    setAuthUser(user);
    navigate(user?.role === 'admin' ? '/admin' : '/', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setAuthToken('');
    setAuthUser(null);
    navigate('/login', { replace: true });
  };

  const authElement = isAuthenticated ? (
    <Navigate to={authUser?.role === 'admin' ? '/admin' : '/'} replace />
  ) : (
    <main className="auth-page">
      <Auth onAuthenticated={handleAuthenticated} />
    </main>
  );

  return (
    <Routes>
      <Route path="/login" element={authElement} />
      <Route path="/signup" element={authElement} />
      <Route path="/reset" element={authElement} />
      <Route
        path="/admin/*"
        element={
          isAuthenticated && authUser?.role === 'admin' ? (
            <AdminDashboard user={authUser} token={authToken} onLogout={handleLogout} />
          ) : (
            <Navigate to={isAuthenticated ? '/' : '/login'} replace state={{ from: location }} />
          )
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <ProtectedPublicPage user={authUser} onLogout={handleLogout}>
              <Hero />
              <About />
            </ProtectedPublicPage>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/faculty"
        element={
          isAuthenticated ? (
            <ProtectedPublicPage user={authUser} onLogout={handleLogout}>
              <Faculty />
            </ProtectedPublicPage>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/achievements"
        element={
          isAuthenticated ? (
            <ProtectedPublicPage user={authUser} onLogout={handleLogout}>
              <Achievements token={authToken} />
            </ProtectedPublicPage>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/placements-internships"
        element={
          isAuthenticated ? (
            <ProtectedPublicPage user={authUser} onLogout={handleLogout}>
              <PlacementsInternships token={authToken} />
            </ProtectedPublicPage>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/materials"
        element={
          isAuthenticated ? (
            <ProtectedPublicPage user={authUser} onLogout={handleLogout}>
              <Materials token={authToken} user={authUser} />
            </ProtectedPublicPage>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/contact"
        element={
          isAuthenticated ? (
            <ProtectedPublicPage user={authUser} onLogout={handleLogout}>
              <Contact />
            </ProtectedPublicPage>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? (authUser?.role === 'admin' ? '/admin' : '/') : '/login'} replace />}
      />
    </Routes>
  );
}

export default App;
