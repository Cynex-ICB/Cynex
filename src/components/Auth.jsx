import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import aietLogo from "../assets/aiet-logo.png";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialFields = {
  name: "",
  collegeEmail: "",
  password: "",
  newPassword: "",
  usn: "",
  semester: "1",
  otp: "",
};

const modeDetails = {
  login: {
    eyebrow: "Welcome back",
    title: "Login to your portal",
  },
  signup: {
    eyebrow: "New account",
    title: "Create your portal access",
    note: "Set up a secure account with your department email.",
  },
  reset: {
    eyebrow: "Password help",
    title: "Reset account access",
    note: "Request a recovery link or complete your password reset.",
  },
};

function getModeFromPath(pathname) {
  if (pathname === "/signup") {
    return "signup";
  }

  if (pathname === "/reset") {
    return "reset";
  }

  return "login";
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
    setMode(getModeFromPath(location.pathname));
    clearMessages();
  }, [location.pathname]);

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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessages();
    setIsLoading(true);

    try {
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
        const data = await callApi(`/auth/reset-password/${resetToken}`, {
          method: "POST",
          body: JSON.stringify({ password: fields.newPassword }),
        });
        saveSession(data);
        setStatus("Password reset successfully.");
      }

      setFields(initialFields);
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
                placeholder="4AL23IC044@aiet.org.in"
                value={fields.collegeEmail}
                onChange={updateField}
                pattern="^4[aA][lL][0-9]{2}[iI][cC][0-9]{3}@aiet\.org\.in$"
                title="Use your department email format: 4ALxxICxxx@aiet.org.in"
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
            <label className="auth-field">
              <span>Password</span>
              <input
                name="password"
                type="password"
                placeholder="At least 8 characters"
                value={fields.password}
                onChange={updateField}
                minLength="8"
                required
              />
            </label>
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
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
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
            <label className="auth-field">
              <span>New password</span>
              <input
                name="newPassword"
                type="password"
                placeholder="Create a stronger password"
                value={fields.newPassword}
                onChange={updateField}
                minLength="8"
                required
              />
            </label>
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
