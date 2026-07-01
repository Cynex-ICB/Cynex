import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

const pageMotion = {
  initial: { opacity: 0, y: 24, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -24, scale: 0.99 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

function PageMotion({ children, keyProp }) {
  return (
    <motion.div
      className="page-motion-wrapper"
      variants={pageMotion}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageMotion.transition}
      key={keyProp}
    >
      {children}
    </motion.div>
  );
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
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, left: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  }, [location.pathname]);

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
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
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
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route path="/reset" element={authElement} />
          <Route
            path="/admin/*"
            element={
              isAuthenticated && ['admin', 'master-admin'].includes(authUser?.role) ? (
                <PageMotion keyProp={location.pathname}>
                  <AdminDashboard user={authUser} token={authToken} onLogout={handleLogout} />
                </PageMotion>
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
                  <PageMotion keyProp={location.pathname}>
                    <Hero />
                    <About />
                  </PageMotion>
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
                  <PageMotion keyProp={location.pathname}>
                    <Faculty />
                  </PageMotion>
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
                  <PageMotion keyProp={location.pathname}>
                    <Achievements token={authToken} />
                  </PageMotion>
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
                  <PageMotion keyProp={location.pathname}>
                    <PlacementsInternships token={authToken} />
                  </PageMotion>
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
                  <PageMotion keyProp={location.pathname}>
                    <Materials token={authToken} user={authUser} />
                  </PageMotion>
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
                  <PageMotion keyProp={location.pathname}>
                    <Profile token={authToken} user={authUser} onUserUpdate={handleUserUpdate} />
                  </PageMotion>
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
                  <PageMotion keyProp={location.pathname}>
                    <Contact />
                  </PageMotion>
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
      </AnimatePresence>
    </>
  );
}

export default App;
