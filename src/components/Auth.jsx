import { useEffect, useMemo, useState } from "react";
import aietLogo from "../assets/aiet-logo.png";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialFields = {
  name: "",
  email: "",
  password: "",
  newPassword: "",
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

function getModeFromPath() {
  if (window.location.pathname === "/signup") {
    return "signup";
  }

  if (window.location.pathname === "/reset") {
    return "reset";
  }

  return "login";
}

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState(getModeFromPath);
  const [fields, setFields] = useState(initialFields);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetToken = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("resetToken");
  }, []);

  useEffect(() => {
    if (resetToken) {
      setMode("reset");
    }
  }, [resetToken]);

  useEffect(() => {
    const syncModeWithPath = () => {
      setMode(getModeFromPath());
      clearMessages();
    };

    window.addEventListener("popstate", syncModeWithPath);

    return () => {
      window.removeEventListener("popstate", syncModeWithPath);
    };
  }, []);

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

    window.history.pushState({}, document.title, nextPath);
    setMode(nextMode);
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
      if (mode === "signup") {
        const data = await callApi("/auth/signup", {
          method: "POST",
          body: JSON.stringify({
            name: fields.name,
            email: fields.email,
            password: fields.password,
          }),
        });
        saveSession(data);
        setStatus("Account created successfully.");
      }

      if (mode === "login") {
        const data = await callApi("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: fields.email,
            password: fields.password,
          }),
        });
        saveSession(data);
        setStatus("Logged in successfully.");
      }

      if (mode === "reset" && !resetToken) {
        const data = await callApi("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email: fields.email }),
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
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      setFields(initialFields);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const showName = mode === "signup";
  const showPassword = mode === "login" || mode === "signup";
  const showEmail = mode !== "reset" || !resetToken;
  const showNewPassword = mode === "reset" && resetToken;
  const submitLabel = {
    login: "Log In",
    signup: "Create Account",
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

          {showEmail ? (
            <label className="auth-field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                value={fields.email}
                onChange={updateField}
                required
              />
            </label>
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

          {mode === "login" || mode === "signup" ? (
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
              Already registered?{" "}
              <button type="button" onClick={() => goToMode("login")}>
                Login instead
              </button>
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
