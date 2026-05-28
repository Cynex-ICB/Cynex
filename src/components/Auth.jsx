import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
    eyebrow: "Welcome back",
    title: "Login to your portal",
    note: "Please login to continue.",
  },
  reset: {
    eyebrow: "Password help",
    title: "Reset account access",
    note: "Request a recovery link or complete your password reset.",
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
    login: "Log In",
    reset: resetToken ? "Reset Password" : "Send Reset Link",
  }[mode];
  const currentMode = modeDetails[mode];

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

          {showEmail ? (
            <label className="auth-field">
              <span>College Email</span>
              <input
                name="collegeEmail"
                type="email"
                placeholder="name@aiet.org.in"
                value={fields.collegeEmail}
                onChange={updateField}
                required
              />
            </label>
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

          {mode === "login" ? (
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
