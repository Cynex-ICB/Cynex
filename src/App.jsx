import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Faculty from './components/Faculty.jsx';
import Achievements from './components/Achievements.jsx';
import NewsEvents from './components/NewsEvents.jsx';
import CynAI from './components/CynAI.jsx';
import StudentPortal from './components/StudentPortal.jsx';
import Materials from './components/Materials.jsx';
import Marks from './components/Marks.jsx';
import Attendance from './components/Attendance.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Auth from './components/Auth.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';
import Profile from './components/Profile.jsx';
import { ModalProvider } from './components/Modal.jsx';
import { useToast } from './hooks/useToast.jsx';
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
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
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

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (scrolled / max) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-academic-accent via-academic-gold to-academic-accent z-[100]"
      style={{ width: `${progress}%` }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
}

function PublicLayout({ user, onLogout, children, showFooter = true }) {
  if (['admin', 'master-admin'].includes(user?.role)) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FB] text-[#111827]">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1 w-full">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}

const loginRedirectState = {
  authMessage: 'Please login to access the student portal.',
};

function App() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || '');
  const [authUser, setAuthUser] = useState(readStoredUser);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast, ToastContainer } = useToast();
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
    navigate('/login', { replace: true, state });
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
    if (['admin', 'master-admin'].includes(user?.role)) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/portal', { replace: true });
    }
  };

  const handleUserUpdate = useCallback((user) => {
    localStorage.setItem('authUser', JSON.stringify(user));
    setAuthUser(user);
  }, []);

  return (
    <>
      <ModalProvider>
        <InstallPrompt />
        <ScrollProgress />
        <ToastContainer />
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

            {/* CynAI (Authenticated users only — not part of the public site) */}
            <Route
              path="/cynai"
              element={
                isAuthenticated ? (
                  <PublicLayout user={authUser} onLogout={handleLogout} showFooter={false}>
                    <PageMotion keyProp={location.pathname}>
                      <CynAI user={authUser} />
                    </PageMotion>
                  </PublicLayout>
                ) : (
                  <Navigate
                    to="/login"
                    replace
                    state={{
                      from: location,
                      authMessage: 'Please sign in to chat with CynAI.',
                    }}
                  />
                )
              }
            />
            {/* Legacy path — redirects to CynAI */}
            <Route path="/study-companion" element={<Navigate to="/cynai" replace />} />

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

{/* Academic Programs */}
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

{/* Student Portal Home (Protected - Students only, Admins redirected to /admin) */}
          <Route
            path="/portal"
            element={
              isAuthenticated ? (
                ['admin', 'master-admin'].includes(authUser?.role) ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <PublicLayout user={authUser} onLogout={handleLogout}>
                    <PageMotion keyProp={location.pathname}>
                      <StudentPortal token={authToken} user={authUser} />
                    </PageMotion>
                  </PublicLayout>
                )
              ) : (
                <Navigate
                  to="/login"
                  replace
                  state={{
                    from: location,
                    authMessage: 'Please sign in to access the student portal.',
                  }}
                />
              )
            }
          />

{/* Study Materials (Protected - any authenticated user) */}
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
                    authMessage: 'Please sign in to access study materials.',
                  }}
                />
              )
            }
          />

{/* Student Marks (Protected - Students only, Admins redirected to /admin) */}
          <Route
            path="/marks"
            element={
              isAuthenticated ? (
                ['admin', 'master-admin'].includes(authUser?.role) ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <PublicLayout user={authUser} onLogout={handleLogout}>
                    <PageMotion keyProp={location.pathname}>
                      <Marks token={authToken} />
                    </PageMotion>
                  </PublicLayout>
                )
              ) : (
                <Navigate
                  to="/login"
                  replace
                  state={{
                    from: location,
                    authMessage: 'Please sign in to access your marks.',
                  }}
                />
              )
            }
          />

{/* Student Attendance (Protected - Students only, Admins redirected to /admin) */}
          <Route
            path="/attendance"
            element={
              isAuthenticated ? (
                ['admin', 'master-admin'].includes(authUser?.role) ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <PublicLayout user={authUser} onLogout={handleLogout}>
                    <PageMotion keyProp={location.pathname}>
                      <Attendance token={authToken} />
                    </PageMotion>
                  </PublicLayout>
                )
              ) : (
                <Navigate
                  to="/login"
                  replace
                  state={{
                    from: location,
                    authMessage: 'Please sign in to access your attendance.',
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
                ['admin', 'master-admin'].includes(authUser?.role) ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/portal" replace />
                )
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
                  }}
                />
              )
            }
          />

{/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </ModalProvider>
    </>
  );
}

export default App;

