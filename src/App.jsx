import { useCallback, useEffect, useState } from 'react';
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
import InstallPrompt from './components/InstallPrompt.jsx';
import Profile from './components/Profile.jsx';
import { API_BASE_URL, readApiJson } from './utils/api.js';

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
    <div className="public-layout">
      <Navbar user={user} onLogout={onLogout} />
      {/* <Header /> */}
      <main className="public-main">{children}</main>
      <Footer />
    </div>
  );
}

function ProtectedPublicPage({ user, onLogout, children }) {
  return (
    <PublicLayout user={user} onLogout={onLogout}>
      {children}
    </PublicLayout>
  );
}

const loginRedirectState = {
  authMessage: 'Please login to continue.',
};

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

  useEffect(() => {
    if (!isAuthenticated && location.pathname === '/login') {
      navigate('/', { replace: true, state: loginRedirectState });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const handleLogout = useCallback((state = loginRedirectState) => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setAuthToken('');
    setAuthUser(null);
    navigate('/', { replace: true, state });
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    async function validateSession() {
      if (!authToken) return;

      try {
        const data = await readApiJson(
          await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        );

        if (isMounted) {
          localStorage.setItem('authUser', JSON.stringify(data.user));
          setAuthUser(data.user);
        }
      } catch (error) {
        if (isMounted && /not authorized/i.test(error.message)) {
          handleLogout({ authMessage: 'Session expired. Please login again.' });
        }
      }
    }

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [authToken, handleLogout]);

  const handleAuthenticated = ({ token, user }) => {
    setAuthToken(token);
    setAuthUser(user);
    navigate('/', { replace: true });
  };

  const handleUserUpdate = useCallback((user) => {
    localStorage.setItem('authUser', JSON.stringify(user));
    setAuthUser(user);
  }, []);

  const authElement = isAuthenticated ? (
    <Navigate to="/" replace />
  ) : (
    <main className="auth-page">
      <Auth onAuthenticated={handleAuthenticated} />
    </main>
  );

  return (
    <>
      <InstallPrompt />
      <Routes>
        <Route
          path="/login"
          element={
            <Navigate
              to="/"
              replace
              state={isAuthenticated ? undefined : loginRedirectState}
            />
          }
        />
        <Route path="/signup" element={authElement} />
        <Route path="/reset" element={authElement} />
        <Route
          path="/admin/*"
          element={
            isAuthenticated && ['admin', 'master-admin'].includes(authUser?.role) ? (
              <AdminDashboard user={authUser} token={authToken} onLogout={handleLogout} />
            ) : (
              <Navigate
                to={isAuthenticated ? '/' : '/'}
                replace
                state={isAuthenticated ? undefined : { from: location, ...loginRedirectState }}
              />
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
            <main className="auth-page">
              <Auth onAuthenticated={handleAuthenticated} />
            </main>
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
            <Navigate to="/" replace state={{ from: location, ...loginRedirectState }} />
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
            <Navigate to="/" replace state={{ from: location, ...loginRedirectState }} />
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
            <Navigate to="/" replace state={{ from: location, ...loginRedirectState }} />
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
            <Navigate to="/" replace state={{ from: location, ...loginRedirectState }} />
          )
        }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <ProtectedPublicPage user={authUser} onLogout={handleLogout}>
                <Profile token={authToken} user={authUser} onUserUpdate={handleUserUpdate} />
            </ProtectedPublicPage>
          ) : (
            <Navigate to="/" replace state={{ from: location, ...loginRedirectState }} />
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
            <Navigate to="/" replace state={{ from: location, ...loginRedirectState }} />
          )
        }
      />
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
              state={isAuthenticated ? undefined : loginRedirectState}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
