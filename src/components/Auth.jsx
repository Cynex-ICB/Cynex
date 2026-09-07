import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowLeft, LogIn, KeyRound } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import aietLogo from "../assets/aiet-logo.png";
import { API_BASE_URL, readApiJson } from "../utils/api.js";

const initialFields = {
  collegeEmail: "",
  password: "",
  newPassword: "",
  confirmPassword: "",
};

const modeDetails = {
  login: {
    eyebrow: "Authorized Access",
    title: "Student & Faculty Portal Login",
    note: "Enter your official institutional credentials to access CIE marks, academic materials, and administrative functions.",
  },
  reset: {
    eyebrow: "Credential Recovery",
    title: "Reset Account Access",
    note: "Enter your registered college email address to receive password reset instructions.",
  },
};

const initialPasswordVisibility = {
  password: false,
  newPassword: false,
  confirmPassword: false,
};

function getModeFromPath(pathname) {
  if (pathname === "/reset") {
    return "reset";
  }
  return "login";
}

function PasswordField({ label, name, placeholder, value, isVisible, onChange, onToggle }) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-xs font-semibold text-academic-navy block">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          minLength="8"
          required
          className="w-full px-3.5 py-2.5 pr-10 rounded border border-academic-border bg-white text-xs text-academic-text focus:outline-none focus:ring-2 focus:ring-academic-navy/20"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          onClick={() => onToggle(name)}
          aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
        >
          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function Auth({ onAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState(() => getModeFromPath(location.pathname));
  const [fields, setFields] = useState(initialFields);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState(initialPasswordVisibility);

  const resetToken = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("resetToken");
  }, [location.search]);

  useEffect(() => {
    if (resetToken) {
      setMode("reset");
    }
  }, [resetToken]);

  useEffect(() => {
    const nextMode = getModeFromPath(location.pathname);
    setMode(nextMode);
    setStatus(location.state?.authMessage || "");
    setError("");
  }, [location.pathname, location.state]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFields((currentFields) => ({ ...currentFields, [name]: value }));
  };

  const saveSession = (data) => {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authUser", JSON.stringify(data.user));
    onAuthenticated?.(data);
  };

  const clearMessages = () => {
    setStatus("");
    setError("");
  };

  const goToMode = (nextMode) => {
    const nextPath = {
      login: "/login",
      reset: "/reset",
    }[nextMode];

    navigate(nextPath);
    setMode(nextMode);
    setFields(initialFields);
    setPasswordVisibility(initialPasswordVisibility);
    clearMessages();
  };

  const callApi = async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    return readApiJson(response);
  };

  const togglePasswordVisibility = (fieldName) => {
    setPasswordVisibility((currentVisibility) => ({
      ...currentVisibility,
      [fieldName]: !currentVisibility[fieldName],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessages();
    setIsLoading(true);

    try {
      if (mode === "login") {
        const data = await callApi("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            collegeEmail: fields.collegeEmail,
            password: fields.password,
          }),
        });
        saveSession(data);
        setStatus("Logged in successfully.");
      }

      if (mode === "reset" && !resetToken) {
        const data = await callApi("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ collegeEmail: fields.collegeEmail }),
        });
        setStatus(data.message);
      }

      if (mode === "reset" && resetToken) {
        if (fields.newPassword !== fields.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        const data = await callApi(`/auth/reset-password/${resetToken}`, {
          method: "POST",
          body: JSON.stringify({ password: fields.newPassword }),
        });
        saveSession(data);
        setStatus("Password reset successfully.");
      }

      setFields(initialFields);
      setPasswordVisibility(initialPasswordVisibility);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const showPassword = mode === "login";
  const showEmail = mode !== "reset" || !resetToken;
  const showNewPassword = mode === "reset" && resetToken;
  const submitLabel = {
    login: "Sign In to Portal",
    reset: resetToken ? "Update Password" : "Send Recovery Link",
  }[mode];
  const currentMode = modeDetails[mode];

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        
        {/* Department Identity Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <img src={aietLogo} alt="AIET Crest" className="w-16 h-16 mx-auto object-contain drop-shadow-sm" />
          </Link>
          <div>
            <span className="text-[11px] font-mono text-academic-gold-dark uppercase tracking-widest block font-semibold">
              Alva&apos;s Institute of Engineering &amp; Technology
            </span>
            <h1 className="text-xl font-extrabold text-academic-navy tracking-tight mt-0.5">
              Department of CSE (ICB)
            </h1>
            <p className="text-xs text-academic-text-muted">
              CYNEX Academic &amp; Evaluation Portal
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="institutional-card p-6 sm:p-8 shadow-card">
          <div className="border-b border-academic-border pb-4 mb-5">
            <span className="text-[10px] font-mono text-academic-gold-dark uppercase tracking-wider block font-semibold">
              {currentMode.eyebrow}
            </span>
            <h2 className="text-lg font-bold text-academic-navy mt-0.5">
              {currentMode.title}
            </h2>
            <p className="text-xs text-academic-text-muted mt-1 leading-relaxed">
              {currentMode.note}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {showEmail && (
              <div className="space-y-1.5 text-left">
                <label className="font-semibold text-academic-navy block">Institutional Email Address</label>
                <div className="relative">
                  <input
                    name="collegeEmail"
                    type="email"
                    placeholder="name@aiet.org.in"
                    value={fields.collegeEmail}
                    onChange={updateField}
                    required
                    className="w-full px-3.5 py-2.5 rounded border border-academic-border bg-white text-xs text-academic-text focus:outline-none focus:ring-2 focus:ring-academic-navy/20"
                  />
                </div>
              </div>
            )}

            {showPassword && (
              <PasswordField
                label="Account Password"
                name="password"
                placeholder="Enter your portal password"
                value={fields.password}
                isVisible={passwordVisibility.password}
                onChange={updateField}
                onToggle={togglePasswordVisibility}
              />
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-academic-text-muted">Forgot your credentials?</span>
                <button
                  type="button"
                  onClick={() => goToMode("reset")}
                  className="text-[11px] font-semibold text-academic-accent hover:underline"
                >
                  Reset password
                </button>
              </div>
            )}

            {showNewPassword && (
              <>
                <PasswordField
                  label="New Password"
                  name="newPassword"
                  placeholder="Create a strong password (min 8 chars)"
                  value={fields.newPassword}
                  isVisible={passwordVisibility.newPassword}
                  onChange={updateField}
                  onToggle={togglePasswordVisibility}
                />

                <PasswordField
                  label="Confirm New Password"
                  name="confirmPassword"
                  placeholder="Re-enter your new password"
                  value={fields.confirmPassword}
                  isVisible={passwordVisibility.confirmPassword}
                  onChange={updateField}
                  onToggle={togglePasswordVisibility}
                />
              </>
            )}

            {status && (
              <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {status}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-md bg-academic-navy hover:bg-academic-navy-light text-white text-xs font-semibold shadow-soft transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5 text-academic-gold-light" />
              <span>{isLoading ? "Authenticating..." : submitLabel}</span>
            </button>

            {mode === "reset" && !resetToken && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => goToMode("login")}
                  className="text-xs font-semibold text-academic-accent hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Portal Login</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Institutional Security Notice */}
        <div className="text-center text-[11px] text-academic-text-muted space-y-1">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-academic-gold-dark" />
            <span>Official VTU / AIET Department System</span>
          </p>
          <p>Unauthorized access is strictly prohibited and logged under institutional IT policies.</p>
        </div>

      </div>
    </div>
  );
}

export default Auth;

