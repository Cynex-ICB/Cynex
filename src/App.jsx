import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Programs from './components/Programs.jsx';
import Research from './components/Research.jsx';
import Faculty from './components/Faculty.jsx';
import Achievements from './components/Achievements.jsx';
import PlacementsInternships from './components/PlacementsInternships.jsx';
import NewsEvents from './components/NewsEvents.jsx';
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
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
};

function PageMotion({ children, keyProp }) {
  return (
    <motion.div
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
    <div className="flex flex-col min-h-screen bg-[#F8F9FB] text-[#111827]">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}

const loginRedirectState = {
  authMessage: 'Please login to access student portal and materials.',
};

function App() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || '');
  const [authUser, setAuthUser] = useState(readStoredUser);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = Boolean(authToken);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, left: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  }, [location.pathname]);

  const handleLogout = useCallback((state = { authMessage: 'You have been signed out.' }) => {
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
    navigate('/profile', { replace: true });
  };

  const handleUserUpdate = useCallback((user) => {
    localStorage.setItem('authUser', JSON.stringify(user));
    setAuthUser(user);
  }, []);

  return (
    <>
      <InstallPrompt />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          
          {/* Public Department Homepage */}
          <Route
            path="/"
            element={
              <PublicLayout user={authUser} onLogout={handleLogout}>
                <PageMotion keyProp={location.pathname}>
                  <Hero />
                  <About />
                </PageMotion>
              </PublicLayout>
            }
          />

          {/* About Department Page */}
          <Route
            path="/about"
            element={
              <PublicLayout user={authUser} onLogout={handleLogout}>
                <PageMotion keyProp={location.pathname}>
                  <About />
                </PageMotion>
              </PublicLayout>
            }
          />

          {/* Academic Programs */}
          <Route
            path="/programs"
            element={
              <PublicLayout user={authUser} onLogout={handleLogout}>
                <PageMotion keyProp={location.pathname}>
                  <Programs />
                </PageMotion>
              </PublicLayout>
            }
          />

          {/* Faculty Directory */}
          <Route
            path="/faculty"
            element={
              <PublicLayout user={authUser} onLogout={handleLogout}>
                <PageMotion keyProp={location.pathname}>
                  <Faculty />
                </PageMotion>
              </PublicLayout>
            }
          />

          {/* Research & Thrust Areas */}
          <Route
            path="/research"
            element={
              <PublicLayout user={authUser} onLogout={handleLogout}>
                <PageMotion keyProp={location.pathname}>
                  <Research />
                </PageMotion>
              </PublicLayout>
            }
          />

          {/* Placements & Internships */}
          <Route
            path="/placements-internships"
            element={
              <PublicLayout user={authUser} onLogout={handleLogout}>
                <PageMotion keyProp={location.pathname}>
                  <PlacementsInternships token={authToken} />
                </PageMotion>
              </PublicLayout>
            }
          />

          {/* Student Achievements */}
          <Route
            path="/achievements"
            element={
              <PublicLayout user={authUser} onLogout={handleLogout}>
                <PageMotion keyProp={location.pathname}>
                  <Achievements token={authToken} />
                </PageMotion>
              </PublicLayout>
            }
          />

          {/* News, Circulars & Events */}
          <Route
            path="/news-events"
            element={
              <PublicLayout user={authUser} onLogout={handleLogout}>
                <PageMotion keyProp={location.pathname}>
                  <NewsEvents />
                </PageMotion>
              </PublicLayout>
            }
          />

          {/* Contact Department */}
          <Route
            path="/contact"
            element={
              <PublicLayout user={authUser} onLogout={handleLogout}>
                <PageMotion keyProp={location.pathname}>
                  <Contact />
                </PageMotion>
              </PublicLayout>
            }
          />

          {/* Study Materials (Accessible if authenticated, otherwise invites login) */}
          <Route
            path="/materials"
            element={
              isAuthenticated ? (
                <PublicLayout user={authUser} onLogout={handleLogout}>
                  <PageMotion keyProp={location.pathname}>
                    <Materials token={authToken} user={authUser} />
                  </PageMotion>
                </PublicLayout>
              ) : (
                <Navigate
                  to="/login"
                  replace
                  state={{
                    from: location,
                    authMessage: 'Please sign in with your college credentials to access syllabus & lecture notes.',
                  }}
                />
              )
            }
          />

          {/* Student Profile / CIE Portal (Protected - Students only, Admins redirected to /admin) */}
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                ['admin', 'master-admin'].includes(authUser?.role) ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <PublicLayout user={authUser} onLogout={handleLogout}>
                    <PageMotion keyProp={location.pathname}>
                      <Profile token={authToken} user={authUser} onUserUpdate={handleUserUpdate} />
                    </PageMotion>
                  </PublicLayout>
                )
              ) : (
                <Navigate
                  to="/login"
                  replace
                  state={{
                    from: location,
                    authMessage: 'Please sign in to access your continuous internal evaluation (CIE) records.',
                  }}
                />
              )
            }
          />

          {/* Portal Authentication (Login & Password Recovery) */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/profile" replace />
              ) : (
                <PublicLayout user={null} onLogout={handleLogout}>
                  <PageMotion keyProp={location.pathname}>
                    <Auth onAuthenticated={handleAuthenticated} />
                  </PageMotion>
                </PublicLayout>
              )
            }
          />

          <Route
            path="/reset"
            element={
              <PublicLayout user={authUser} onLogout={handleLogout}>
                <PageMotion keyProp={location.pathname}>
                  <Auth onAuthenticated={handleAuthenticated} />
                </PageMotion>
              </PublicLayout>
            }
          />

          {/* Administrative Portal */}
          <Route
            path="/admin/*"
            element={
              isAuthenticated && ['admin', 'master-admin'].includes(authUser?.role) ? (
                <PageMotion keyProp={location.pathname}>
                  <AdminDashboard user={authUser} token={authToken} onLogout={handleLogout} />
                </PageMotion>
              ) : (
                <Navigate
                  to="/login"
                  replace
                  state={{
                    from: location,
                    authMessage: 'Administrator credentials required to access the management dashboard.',
                  }}
                />
              )
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;

