import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectPath =
    location.state?.from || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError(
        "Please enter email and password."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/api/auth/login",
        {
          email: cleanEmail,
          password,
        }
      );

      console.log(
        "Login response:",
        response.data
      );

      const token = response.data?.token;
      const userId = response.data?.userId;
      const responseEmail = response.data?.email;
      const userRole = (
        response.data?.role || "CUSTOMER"
      ).toUpperCase();

      if (!token || !userId) {
        setError(
          "Invalid login response from server."
        );
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem(
        "userId",
        String(userId)
      );
      localStorage.setItem(
        "email",
        responseEmail || cleanEmail
      );
      localStorage.setItem(
        "role",
        userRole
      );

      window.dispatchEvent(
        new Event("storage")
      );

      navigate(redirectPath, {
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        if (err.response.status === 401) {
          setError(
            "Invalid email or password."
          );
        } else if (err.response.data) {
          setError(
            err.response.data.message ||
              err.response.data.error ||
              "Login failed. Please try again."
          );
        } else {
          setError(
            "Login failed. Please try again."
          );
        }
      } else if (err.request) {
        setError(
          "Unable to connect to the server. Make sure Spring Boot is running on port 8080."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <style>{`
        .login-page {
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 25px 15px;
          overflow: hidden;
          position: relative;
          background:
            radial-gradient(
              circle at 15% 20%,
              rgba(13,110,253,.16),
              transparent 30%
            ),
            radial-gradient(
              circle at 85% 80%,
              rgba(102,16,242,.16),
              transparent 30%
            );
        }

        .login-page::before {
          content: "";
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: rgba(0,217,255,.08);
          filter: blur(70px);
          left: -80px;
          top: 10%;
          animation: moveGlow 7s ease-in-out infinite;
        }

        .login-page::after {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(102,16,242,.08);
          filter: blur(70px);
          right: -100px;
          bottom: 5%;
          animation: moveGlow2 8s ease-in-out infinite;
        }

        .login-content {
          width: 100%;
          max-width: 1100px;
          position: relative;
          z-index: 1;
        }

        .welcome-section {
          animation: slideLeft .65s ease both;
        }

        .login-card {
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 20px;
          background: rgba(255,255,255,.065);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow:
            0 20px 55px rgba(0,0,0,.18);
          animation: slideRight .65s ease both;
          transition:
            transform .3s ease,
            box-shadow .3s ease;
        }

        .login-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 25px 65px rgba(0,0,0,.22);
        }

        .truck-icon {
          font-size: 75px;
          line-height: 1;
          display: inline-block;
          filter:
            drop-shadow(
              0 0 25px rgba(0,217,255,.5)
            );
          animation: truckFloat 3s ease-in-out infinite;
        }

        .brand-gradient {
          background:
            linear-gradient(
              135deg,
              #00d9ff,
              #0d6efd,
              #6610f2
            );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .feature-row {
          padding: 9px 12px;
          border-radius: 12px;
          transition:
            transform .2s ease,
            background .2s ease;
        }

        .feature-row:hover {
          transform: translateX(5px);
          background: rgba(255,255,255,.05);
        }

        .feature-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(13,110,253,.1);
          font-size: 20px;
        }

        .login-logo {
          width: 62px;
          height: 62px;
          margin: 0 auto;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          background:
            linear-gradient(
              135deg,
              rgba(13,110,253,.2),
              rgba(102,16,242,.2)
            );
          border: 1px solid rgba(0,217,255,.18);
          animation: logoPulse 2.5s ease-in-out infinite;
        }

        .login-input {
          transition:
            border-color .2s ease,
            box-shadow .2s ease,
            transform .2s ease;
        }

        .login-input:focus {
          transform: translateY(-1px);
          border-color: #0d6efd;
          box-shadow:
            0 0 0 3px rgba(13,110,253,.12);
        }

        .login-button {
          border: none;
          background:
            linear-gradient(
              135deg,
              #0d6efd,
              #6610f2
            );
          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 10px 25px rgba(13,110,253,.28);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .secure-badge {
          animation: securePulse 3s ease-in-out infinite;
        }

        .error-box {
          animation: errorIn .3s ease both;
        }

        @keyframes truckFloat {
          0%,100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(-9px) rotate(2deg);
          }
        }

        @keyframes logoPulse {
          0%,100% {
            box-shadow:
              0 0 0 rgba(0,217,255,0);
          }
          50% {
            box-shadow:
              0 0 25px rgba(0,217,255,.14);
          }
        }

        @keyframes securePulse {
          0%,100% {
            opacity: .7;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes moveGlow {
          0%,100% {
            transform: translate(0,0);
          }
          50% {
            transform: translate(70px,40px);
          }
        }

        @keyframes moveGlow2 {
          0%,100% {
            transform: translate(0,0);
          }
          50% {
            transform: translate(-60px,-40px);
          }
        }

        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(-25px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(25px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes errorIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 991px) {
          .login-page {
            min-height: calc(100vh - 60px);
            padding: 20px 12px;
          }

          .login-card {
            max-width: 500px;
            margin: 0 auto;
          }
        }

        @media (max-width: 576px) {
          .login-card {
            padding: 22px !important;
            border-radius: 16px;
          }

          .login-logo {
            width: 55px;
            height: 55px;
            font-size: 26px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-page::before,
          .login-page::after,
          .truck-icon,
          .login-logo,
          .secure-badge,
          .welcome-section,
          .login-card {
            animation: none;
          }

          * {
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className="login-content">
        <div className="row justify-content-center align-items-center g-4">
          {/* LEFT SIDE */}
          <div className="col-lg-6 d-none d-lg-block">
            <div className="welcome-section pe-4">
              <div className="truck-icon mb-3">
                🚚
              </div>

              <h1 className="display-4 fw-bold mb-3">
                Welcome Back to{" "}
                <span className="brand-gradient">
                  Smart Courier
                </span>
              </h1>

              <p className="lead text-muted mb-4">
                Manage your parcels, track deliveries
                and use AI-powered delivery prediction
                from one smart platform.
              </p>

              <div className="d-flex flex-column gap-2">
                <div className="feature-row d-flex align-items-center">
                  <div className="feature-icon me-3">
                    📦
                  </div>
                  <span>
                    Easy parcel management
                  </span>
                </div>

                <div className="feature-row d-flex align-items-center">
                  <div className="feature-icon me-3">
                    📍
                  </div>
                  <span>
                    Real-time parcel tracking
                  </span>
                </div>

                <div className="feature-row d-flex align-items-center">
                  <div className="feature-icon me-3">
                    🤖
                  </div>
                  <span>
                    AI delivery prediction
                  </span>
                </div>

                <div className="feature-row d-flex align-items-center">
                  <div className="feature-icon me-3">
                    🔔
                  </div>
                  <span>
                    Smart delivery notifications
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LOGIN CARD */}
          <div className="col-lg-5 col-md-7 col-sm-10">
            <div className="card login-card p-3 p-md-4">
              <div className="text-center mb-3">
                <div className="login-logo">
                  🔐
                </div>

                <h2 className="fw-bold mt-3 mb-1">
                  Welcome Back
                </h2>

                <p className="text-muted mb-0">
                  Login to your Smart Courier account
                </p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 error-box">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                {/* EMAIL */}
                <div className="mb-3">
                  <label className="form-label fw-semibold mb-1">
                    Email Address
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-dark text-white border-secondary">
                      📧
                    </span>

                    <input
                      type="email"
                      className="form-control login-input"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="mb-3">
                  <label className="form-label fw-semibold mb-1">
                    Password
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-dark text-white border-secondary">
                      🔑
                    </span>

                    <input
                      type="password"
                      className="form-control login-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 login-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login to Account →
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <p className="text-muted mb-0">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="fw-bold text-decoration-none"
                    style={{
                      color: "#00d9ff",
                    }}
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </div>

            <div className="text-center mt-2">
              <small className="text-muted secure-badge">
                🔒 Secure JWT Authentication
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;