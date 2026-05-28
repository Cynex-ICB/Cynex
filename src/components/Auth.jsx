import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import aietLogo from "../assets/aiet-logo.png";
import { API_BASE_URL, readApiJson } from "../utils/api.js";

const initialFields = {
  name: "",
  collegeEmail: "",
  password: "",
  newPassword: "",
  confirmPassword: "",
  usn: "",
  semester: "3",
  otp: "",
};

const modeDetails = {
  login: {
    eyebrow: "Welcome back",
    title: "Login to your portal",
    note: "Please login to continue.",
  },
  signup: {
    eyebrow: "New account",
    title: "Create your portal access",
    note: "Set up a secure account with your email.",
  },
  reset: {
    eyebrow: "Password help",
    title: "Reset account access",
    note: "Request a recovery link or complete your password reset.",
  },
};

const STUDENT_EMAIL_ID_PATTERN = /^4AL\d{2}IC0\d{2}$/i;
const EMAIL_PATTERN_EXEMPTIONS = (
  import.meta.env.VITE_EMAIL_PATTERN_EXEMPT_EMAIL ||
  import.meta.env.VITE_EMAIL_PATTERN_EXEMPT_EMAILS ||
  ""
)
  .split(/[,;\s]+/)
  .map((email) => email.trim().replace(/^["']|["']$/g, "").toLowerCase())
  .filter(Boolean);
const EMAIL_PATTERN_ERROR = "College email ID must match the 4ALXXIC0XX pattern.";
const initialPasswordVisibility = {
  password: false,
  newPassword: false,
  confirmPassword: false,
};

function isAllowedCollegeEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const emailId = normalizedEmail.split("@")[0] || "";

  return EMAIL_PATTERN_EXEMPTIONS.includes(normalizedEmail) || STUDENT_EMAIL_ID_PATTERN.test(emailId);
}

function getModeFromPath(pathname) {
  if (pathname === "/signup") {
    return "signup";
  }

  if (pathname === "/reset") {
    return "reset";
  }

  return "login";
}

function PasswordField({ label, name, placeholder, value, isVisible, onChange, onToggle }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div className="auth-password-control">
        <input
          name={name}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          minLength="8"
          required
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => onToggle(name)}
          aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>
    </label>
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
  const [isSignupOtpPending, setIsSignupOtpPending] = useState(false);
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
    setStatus(location.state?.authMessage || (nextMode === "login" ? "Please login to continue." : ""));
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
      signup: "/signup",
      reset: "/reset",
    }[nextMode];

    navigate(nextPath);
    setMode(nextMode);
    setIsSignupOtpPending(false);
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

  const canUseEmailForLogin = async (email) => {
    if (isAllowedCollegeEmail(email)) {
      return true;
    }

    const data = await callApi("/auth/email-access", {
      method: "POST",
      body: JSON.stringify({ collegeEmail: email }),
    });

    return Boolean(data.allowed);
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
      if (mode === "signup" && !isSignupOtpPending && !isAllowedCollegeEmail(fields.collegeEmail)) {
        setError(EMAIL_PATTERN_ERROR);
        return;
      }

      if (mode === "login" && !(await canUseEmailForLogin(fields.collegeEmail))) {
        setError(EMAIL_PATTERN_ERROR);
        return;
      }

      if (mode === "signup" && !isSignupOtpPending) {
        const data = await callApi("/auth/signup", {
          method: "POST",
          body: JSON.stringify({
            name: fields.name,
            collegeEmail: fields.collegeEmail,
            password: fields.password,
            usn: fields.usn,
            semester: fields.semester,
          }),
        });
        setIsSignupOtpPending(true);
        setStatus(data.message || "OTP sent to your college email.");
        return;
      }

      if (mode === "signup" && isSignupOtpPending) {
        const data = await callApi("/auth/verify-signup", {
          method: "POST",
          body: JSON.stringify({
            collegeEmail: fields.collegeEmail,
            otp: fields.otp,
          }),
        });
        saveSession(data);
        setStatus("Account verified successfully.");
      }

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
      setIsSignupOtpPending(false);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const showName = mode === "signup" && !isSignupOtpPending;
  const showPassword = mode === "login" || (mode === "signup" && !isSignupOtpPending);
  const showEmail = mode !== "reset" || !resetToken;
  const showNewPassword = mode === "reset" && resetToken;
  const showSignupDetails = mode === "signup" && !isSignupOtpPending;
  const showSignupOtp = mode === "signup" && isSignupOtpPending;
  const submitLabel = {
    login: "Log In",
    signup: isSignupOtpPending ? "Verify OTP" : "Send OTP",
    reset: resetToken ? "Reset Password" : "Send Reset Link",
  }[mode];
  const currentMode = isSignupOtpPending
    ? {
        eyebrow: "Verify email",
        title: "Enter your OTP",
        note: "We sent a 6-digit code to your college email.",
      }
    : modeDetails[mode];

  return (
    <section className="section auth-section" id="login">
      <div className="auth-layout">
        <div className="auth-welcome">
          <span className="auth-welcome-logo">
            <img src={aietLogo} alt="AIET logo" />
          </span>
          <div>
            <p>Welcome to</p>
            <h1>Department of CSE(IoT, Cybersecurity,including Blockchain Technology)</h1>
          </div>
        </div>

        <form className="card auth-card" onSubmit={handleSubmit}>
          <div className="auth-form-heading">
            <p>{currentMode.eyebrow}</p>
            <h2>{currentMode.title}</h2>
            <span>{currentMode.note}</span>
          </div>

          {showName ? (
            <label className="auth-field">
              <span>Name</span>
              <input
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={fields.name}
                onChange={updateField}
                minLength="2"
                required
              />
            </label>
          ) : null}

          {showEmail && !showSignupOtp ? (
            <label className="auth-field">
              <span>College Email</span>
              <input
                name="collegeEmail"
                type="email"
                placeholder="4ALXXIC0XX@aiet.org.in"
                value={fields.collegeEmail}
                onChange={updateField}
                required
              />
            </label>
          ) : null}

          {showSignupOtp ? (
            <>
              <label className="auth-field">
                <span>College Email</span>
                <input name="collegeEmail" type="email" value={fields.collegeEmail} readOnly />
              </label>

              <label className="auth-field">
                <span>Email OTP</span>
                <input
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  placeholder="Enter 6-digit OTP"
                  value={fields.otp}
                  onChange={updateField}
                  required
                />
              </label>
            </>
          ) : null}

          {showPassword ? (
            <PasswordField
              label="Password"
              name="password"
              placeholder="At least 8 characters"
              value={fields.password}
              isVisible={passwordVisibility.password}
              onChange={updateField}
              onToggle={togglePasswordVisibility}
            />
          ) : null}

          {showSignupDetails ? (
            <>
              <label className="auth-field">
                <span>USN</span>
                <input
                  name="usn"
                  type="text"
                  placeholder="1SE23CSxxx"
                  value={fields.usn}
                  onChange={updateField}
                  required
                />
              </label>

              <label className="auth-field">
                <span>Semester</span>
                <select
                  name="semester"
                  value={fields.semester}
                  onChange={updateField}
                  required
                >
                  <option value="3">3rd Semester</option>
                  <option value="4">4th Semester</option>
                  <option value="5">5th Semester</option>
                  <option value="6">6th Semester</option>
                  <option value="7">7th Semester</option>
                  <option value="8">8th Semester</option>
                </select>
              </label>
            </>
          ) : null}

          {mode === "login" || showSignupDetails ? (
            <p className="auth-helper-row">
              <span>Forgot your password?</span>
              <button type="button" onClick={() => goToMode("reset")}>
                Reset password
              </button>
            </p>
          ) : null}

          {showNewPassword ? (
            <>
              <PasswordField
                label="New password"
                name="newPassword"
                placeholder="Create a stronger password"
                value={fields.newPassword}
                isVisible={passwordVisibility.newPassword}
                onChange={updateField}
                onToggle={togglePasswordVisibility}
              />

              <PasswordField
                label="Confirm password"
                name="confirmPassword"
                placeholder="Re-enter your new password"
                value={fields.confirmPassword}
                isVisible={passwordVisibility.confirmPassword}
                onChange={updateField}
                onToggle={togglePasswordVisibility}
              />
            </>
          ) : null}

          {status ? <p className="form-message success">{status}</p> : null}
          {error ? <p className="form-message error">{error}</p> : null}

          <button className="primary-button auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : submitLabel}
          </button>

          {mode === "login" ? (
            <p className="auth-switch">
              Don&apos;t have account?{" "}
              <button type="button" onClick={() => goToMode("signup")}>
                Create one
              </button>
            </p>
          ) : null}

          {mode === "signup" ? (
            <p className="auth-switch">
              {isSignupOtpPending ? (
                <>
                  Need to edit details?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignupOtpPending(false);
                      setFields((currentFields) => ({ ...currentFields, otp: "" }));
                      clearMessages();
                    }}
                  >
                    Go back
                  </button>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <button type="button" onClick={() => goToMode("login")}>
                    Login instead
                  </button>
                </>
              )}
            </p>
          ) : null}

          {mode === "reset" && !resetToken ? (
            <p className="auth-switch">
              Remembered it?{" "}
              <button type="button" onClick={() => goToMode("login")}>
                Back to login
              </button>
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

export default Auth;
