import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();
    const password = formData.password;
    const role = formData.role;

    if (name.length < 2) {
      setError("Please enter a valid name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError(
        "Phone number must contain exactly 10 digits."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (!["CUSTOMER", "DELIVERY_AGENT"].includes(role)) {
      setError("Invalid account type.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/users", {
        name,
        email,
        phone,
        password,
        role,
      });

      console.log(
        "Registration response:",
        response.data
      );

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "CUSTOMER",
      });

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1800);
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response) {
        if (err.response.status === 409) {
          setError(
            "This email address is already registered."
          );
        } else if (err.response.status === 400) {
          setError(
            err.response.data?.message ||
              "Invalid registration details."
          );
        } else {
          setError(
            err.response.data?.message ||
              err.response.data?.error ||
              "Registration failed. Please try again."
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
    <div className="register-page">
      <style>{`
        .register-page {
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 25px 15px;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(13,110,253,.16),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 80%,
              rgba(102,16,242,.16),
              transparent 30%
            );
        }

        .register-page::before {
          content: "";
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: rgba(0,217,255,.08);
          filter: blur(80px);
          left: -100px;
          top: 5%;
          animation: glowOne 8s ease-in-out infinite;
        }

        .register-page::after {
          content: "";
          position: absolute;
          width: 330px;
          height: 330px;
          border-radius: 50%;
          background: rgba(102,16,242,.08);
          filter: blur(80px);
          right: -100px;
          bottom: 0;
          animation: glowTwo 9s ease-in-out infinite;
        }

        .register-content {
          width: 100%;
          max-width: 1150px;
          position: relative;
          z-index: 1;
        }

        .register-intro {
          animation: slideLeft .65s ease both;
        }

        .register-card {
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 20px;
          background: rgba(255,255,255,.065);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 20px 55px rgba(0,0,0,.18);
          animation: slideRight .65s ease both;
          transition:
            transform .3s ease,
            box-shadow .3s ease;
        }

        .register-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 25px 65px rgba(0,0,0,.22);
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

        .register-logo {
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

        .gradient-text {
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

        .register-input,
        .register-select {
          transition:
            border-color .2s ease,
            box-shadow .2s ease,
            transform .2s ease;
        }

        .register-input:focus,
        .register-select:focus {
          transform: translateY(-1px);
          border-color: #0d6efd;
          box-shadow:
            0 0 0 3px rgba(13,110,253,.12);
        }

        .register-button {
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

        .register-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 10px 25px rgba(13,110,253,.28);
        }

        .register-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .message-box {
          animation: messageIn .3s ease both;
        }

        .security-text {
          animation: securityPulse 3s ease-in-out infinite;
        }

        @keyframes truckFloat {
          0%, 100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(-9px) rotate(2deg);
          }
        }

        @keyframes logoPulse {
          0%, 100% {
            box-shadow:
              0 0 0 rgba(0,217,255,0);
          }
          50% {
            box-shadow:
              0 0 25px rgba(0,217,255,.14);
          }
        }

        @keyframes glowOne {
          0%, 100% {
            transform: translate(0,0);
          }
          50% {
            transform: translate(70px,45px);
          }
        }

        @keyframes glowTwo {
          0%, 100% {
            transform: translate(0,0);
          }
          50% {
            transform: translate(-60px,-45px);
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

        @keyframes messageIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes securityPulse {
          0%, 100% {
            opacity: .65;
          }
          50% {
            opacity: 1;
          }
        }

        @media (max-width: 991px) {
          .register-page {
            min-height: calc(100vh - 60px);
            padding: 20px 12px;
          }

          .register-card {
            max-width: 600px;
            margin: 0 auto;
          }
        }

        @media (max-width: 576px) {
          .register-card {
            padding: 20px !important;
            border-radius: 16px;
          }

          .register-logo {
            width: 55px;
            height: 55px;
            font-size: 26px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .register-page::before,
          .register-page::after,
          .truck-icon,
          .register-logo,
          .register-intro,
          .register-card,
          .security-text {
            animation: none;
          }
        }
      `}</style>

      <div className="register-content">
        <div className="row justify-content-center align-items-center g-4">

          {/* LEFT SIDE */}
          <div className="col-lg-5 d-none d-lg-block">
            <div className="register-intro pe-4">
              <div className="truck-icon mb-3">
                🚚
              </div>

              <h1 className="display-4 fw-bold mb-3">
                Join{" "}
                <span className="gradient-text">
                  Smart Courier
                </span>
              </h1>

              <p className="lead text-muted mb-4">
                Create your account and manage your
                courier deliveries with a smarter,
                faster and AI-powered platform.
              </p>

              <div className="d-flex flex-column gap-2">
                <div className="feature-row d-flex align-items-center">
                  <div className="feature-icon me-3">
                    ⚡
                  </div>
                  <span>
                    Fast and simple parcel booking
                  </span>
                </div>

                <div className="feature-row d-flex align-items-center">
                  <div className="feature-icon me-3">
                    📍
                  </div>
                  <span>
                    Easy parcel tracking
                  </span>
                </div>

                <div className="feature-row d-flex align-items-center">
                  <div className="feature-icon me-3">
                    🤖
                  </div>
                  <span>
                    AI-powered delivery prediction
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

          {/* REGISTER CARD */}
          <div className="col-lg-6 col-md-8 col-sm-10">
            <div className="card register-card p-3 p-md-4">
              <div className="text-center mb-3">
                <div className="register-logo">
                  🚀
                </div>

                <h2 className="fw-bold mt-3 mb-1">
                  Create Account
                </h2>

                <p className="text-muted mb-0">
                  Start your smart delivery journey
                </p>
              </div>

              {success && (
                <div className="alert alert-success py-2 message-box">
                  ✅ {success}
                </div>
              )}

              {error && (
                <div className="alert alert-danger py-2 message-box">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleRegister}>

                {/* NAME */}
                <div className="mb-3">
                  <label className="form-label fw-semibold mb-1">
                    Full Name
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-dark text-white border-secondary">
                      👤
                    </span>

                    <input
                      type="text"
                      name="name"
                      className="form-control register-input"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

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
                      name="email"
                      className="form-control register-input"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div className="mb-3">
                  <label className="form-label fw-semibold mb-1">
                    Phone Number
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-dark text-white border-secondary">
                      📱
                    </span>

                    <input
                      type="tel"
                      name="phone"
                      className="form-control register-input"
                      placeholder="10 digit phone number"
                      value={formData.phone}
                      onChange={(e) => {
                        const value =
                          e.target.value.replace(
                            /\D/g,
                            ""
                          );

                        if (value.length <= 10) {
                          setFormData((previous) => ({
                            ...previous,
                            phone: value,
                          }));
                        }

                        setError("");
                      }}
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="tel"
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
                      name="password"
                      className="form-control register-input"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                  </div>

                  <small className="text-muted">
                    Minimum 6 characters
                  </small>
                </div>

                {/* ROLE */}
                <div className="mb-3">
                  <label className="form-label fw-semibold mb-1">
                    Account Type
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-dark text-white border-secondary">
                      🛡️
                    </span>

                    <select
                      name="role"
                      className="form-select register-select"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="CUSTOMER">
                        Customer
                      </option>

                      <option value="DELIVERY_AGENT">
                        Delivery Agent
                      </option>
                    </select>
                  </div>

                  <small className="text-muted">
                    Manager and Admin accounts are created
                    by system administrators.
                  </small>
                </div>

                {/* REGISTER BUTTON */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 register-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account 🚀
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <p className="text-muted mb-0">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="fw-bold text-decoration-none"
                    style={{
                      color: "#00d9ff",
                    }}
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>

            <div className="text-center mt-2">
              <small className="text-muted security-text">
                🔒 Your account is protected by JWT authentication
              </small>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;