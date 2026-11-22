import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Profile() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const storedEmail = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    setUserId(storedUserId || "");
    setEmail(storedEmail || "");
    setRole(
      storedRole ? storedRole.toUpperCase() : ""
    );

    fetchProfile(storedUserId);
  }, [navigate]);

  const fetchProfile = async (id) => {
    if (!id) {
      setLoading(false);
      setError(
        "User information is missing. Please login again."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/users/${id}`
      );

      setUser(response.data);

      if (response.data.email) {
        localStorage.setItem(
          "email",
          response.data.email
        );
        setEmail(response.data.email);
      }

      if (response.data.role) {
        const normalizedRole =
          response.data.role.toUpperCase();

        localStorage.setItem(
          "role",
          normalizedRole
        );

        setRole(normalizedRole);
      }
    } catch (err) {
      console.error(
        "Error loading profile:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setUser({
          id: id,
          email:
            localStorage.getItem("email") || "",
          role:
            localStorage.getItem("role") || "",
        });
      } else if (!err.response) {
        setError(
          "Unable to connect to the Smart Courier server."
        );
      } else {
        setError(
          "Unable to load profile information."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    window.dispatchEvent(
      new Event("storage")
    );

    navigate("/login");
  };

  const getInitial = () => {
    if (user?.name) {
      return user.name
        .charAt(0)
        .toUpperCase();
    }

    if (!email) {
      return "U";
    }

    return email
      .charAt(0)
      .toUpperCase();
  };

  const getRoleTitle = () => {
    switch (role) {
      case "CUSTOMER":
        return "Customer";
      case "DELIVERY_AGENT":
        return "Delivery Agent";
      case "MANAGER":
        return "Manager";
      case "ADMIN":
        return "Administrator";
      default:
        return role || "User";
    }
  };

  const getRoleBadgeClass = () => {
    switch (role) {
      case "ADMIN":
        return "bg-danger";
      case "MANAGER":
        return "bg-warning text-dark";
      case "DELIVERY_AGENT":
        return "bg-info text-dark";
      case "CUSTOMER":
        return "bg-primary";
      default:
        return "bg-secondary";
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div
          className="card p-4 text-center profile-card"
        >
          <div
            className="profile-loader"
            role="status"
          />
          <h5 className="fw-bold mb-1">
            Loading Profile...
          </h5>
          <p className="text-muted mb-0">
            Please wait while we load your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-3 py-md-4">
      <style>{`
        .profile-card {
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 18px;
          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .profile-card:hover {
          box-shadow: 0 14px 35px rgba(0,0,0,.16);
        }

        .profile-hero {
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              rgba(13,110,253,.16),
              rgba(102,16,242,.13),
              rgba(0,217,255,.06)
            );
        }

        .profile-hero::before {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: rgba(0,217,255,.1);
          filter: blur(45px);
          right: -60px;
          top: -100px;
          animation: profileGlow 5s ease-in-out infinite;
        }

        .profile-avatar {
          width: 105px;
          height: 105px;
          border-radius: 50%;
          font-size: 42px;
          font-weight: 700;
          color: white;
          background:
            linear-gradient(135deg,#0d6efd,#6610f2);
          border: 3px solid rgba(0,217,255,.25);
          box-shadow:
            0 0 35px rgba(13,110,253,.35);
          animation: avatarFloat 3s ease-in-out infinite;
        }

        .info-card {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px;
          transition:
            transform .22s ease,
            border-color .22s ease,
            box-shadow .22s ease;
        }

        .info-card:hover {
          transform: translateY(-3px);
          border-color: rgba(0,217,255,.25);
          box-shadow: 0 10px 25px rgba(0,0,0,.12);
        }

        .info-icon {
          transition:
            transform .25s ease,
            background .25s ease;
        }

        .info-card:hover .info-icon {
          transform: scale(1.08);
        }

        .action-btn {
          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 18px rgba(0,0,0,.15);
        }

        .feature-card {
          cursor: pointer;
          transition:
            transform .25s ease,
            box-shadow .25s ease,
            border-color .25s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 14px 30px rgba(0,0,0,.16);
          border-color: rgba(0,217,255,.25) !important;
        }

        .feature-icon {
          transition: transform .3s ease;
        }

        .feature-card:hover .feature-icon {
          transform: scale(1.12) rotate(-4deg);
        }

        .security-box {
          background:
            linear-gradient(
              135deg,
              rgba(25,135,84,.08),
              rgba(13,110,253,.06)
            );
          border: 1px solid rgba(25,135,84,.18);
        }

        .security-pulse {
          animation: securityPulse 2.5s ease-in-out infinite;
        }

        .profile-loader {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 4px solid rgba(13,110,253,.15);
          border-top-color: #0d6efd;
          margin: 0 auto 15px;
          animation: spin 1s linear infinite;
        }

        @keyframes profileGlow {
          0%,100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-30px);
          }
        }

        @keyframes avatarFloat {
          0%,100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes securityPulse {
          0%,100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .profile-title {
            font-size: 2rem;
          }

          .profile-avatar {
            width: 90px;
            height: 90px;
            font-size: 36px;
          }
        }
      `}</style>

      {/* HEADER */}
      <div
        className="card p-3 p-md-4 mb-3 profile-card profile-hero"
      >
        <div className="row align-items-center">
          <div className="col-md-8 position-relative">
            <span className="badge bg-primary mb-2">
              👤 ACCOUNT CENTER
            </span>

            <h1 className="display-6 fw-bold profile-title mb-1">
              My Profile
            </h1>

            <p className="text-muted mb-0">
              Manage and view your Smart Courier account.
            </p>
          </div>

          <div className="col-md-4 text-center mt-3 mt-md-0 position-relative">
            <div className="profile-avatar mx-auto d-flex align-items-center justify-content-center">
              {getInitial()}
            </div>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger py-2 mb-3">
          ⚠️ {error}
        </div>
      )}

      {/* PROFILE */}
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card p-3 p-md-4 profile-card">
            {/* PROFILE SUMMARY */}
            <div className="text-center pb-3 mb-3 border-bottom">
              <h2 className="fw-bold mb-1">
                {user?.name ||
                  "Smart Courier User"}
              </h2>

              <p className="text-muted mb-2">
                {email}
              </p>

              <span
                className={`badge px-3 py-2 ${getRoleBadgeClass()}`}
              >
                🛡️ {getRoleTitle()}
              </span>
            </div>

            {/* ACCOUNT INFORMATION */}
            <div className="mb-3">
              <span className="badge bg-primary mb-1">
                ACCOUNT INFORMATION
              </span>

              <h4 className="fw-bold mb-0">
                Your Details
              </h4>
            </div>

            <div className="row g-3">
              {/* USER ID */}
              <div className="col-md-6">
                <div className="info-card p-3 h-100">
                  <div
                    className="info-icon rounded-3 d-flex align-items-center justify-content-center mb-2"
                    style={{
                      width: "42px",
                      height: "42px",
                      background:
                        "rgba(13,110,253,.12)",
                      fontSize: "21px",
                    }}
                  >
                    🆔
                  </div>

                  <small className="text-muted">
                    User ID
                  </small>

                  <h5 className="fw-bold mt-1 mb-0">
                    {user?.id || userId}
                  </h5>
                </div>
              </div>

              {/* NAME */}
              <div className="col-md-6">
                <div className="info-card p-3 h-100">
                  <div
                    className="info-icon rounded-3 d-flex align-items-center justify-content-center mb-2"
                    style={{
                      width: "42px",
                      height: "42px",
                      background:
                        "rgba(102,16,242,.12)",
                      fontSize: "21px",
                    }}
                  >
                    👤
                  </div>

                  <small className="text-muted">
                    Full Name
                  </small>

                  <h5 className="fw-bold mt-1 mb-0">
                    {user?.name ||
                      "Not available"}
                  </h5>
                </div>
              </div>

              {/* EMAIL */}
              <div className="col-md-6">
                <div className="info-card p-3 h-100">
                  <div
                    className="info-icon rounded-3 d-flex align-items-center justify-content-center mb-2"
                    style={{
                      width: "42px",
                      height: "42px",
                      background:
                        "rgba(0,217,255,.10)",
                      fontSize: "21px",
                    }}
                  >
                    📧
                  </div>

                  <small className="text-muted">
                    Email Address
                  </small>

                  <h6 className="fw-bold mt-1 mb-0 text-break">
                    {email}
                  </h6>
                </div>
              </div>

              {/* PHONE */}
              <div className="col-md-6">
                <div className="info-card p-3 h-100">
                  <div
                    className="info-icon rounded-3 d-flex align-items-center justify-content-center mb-2"
                    style={{
                      width: "42px",
                      height: "42px",
                      background:
                        "rgba(25,135,84,.10)",
                      fontSize: "21px",
                    }}
                  >
                    📱
                  </div>

                  <small className="text-muted">
                    Phone Number
                  </small>

                  <h5 className="fw-bold mt-1 mb-0">
                    {user?.phone ||
                      "Not available"}
                  </h5>
                </div>
              </div>

              {/* ROLE */}
              <div className="col-md-6">
                <div className="info-card p-3 h-100">
                  <div
                    className="info-icon rounded-3 d-flex align-items-center justify-content-center mb-2"
                    style={{
                      width: "42px",
                      height: "42px",
                      background:
                        "rgba(255,193,7,.12)",
                      fontSize: "21px",
                    }}
                  >
                    🛡️
                  </div>

                  <small className="text-muted">
                    Account Role
                  </small>

                  <h5 className="fw-bold mt-1 mb-0">
                    {getRoleTitle()}
                  </h5>
                </div>
              </div>

              {/* STATUS */}
              <div className="col-md-6">
                <div
                  className="info-card p-3 h-100"
                  style={{
                    background:
                      "rgba(25,135,84,.06)",
                    border:
                      "1px solid rgba(25,135,84,.18)",
                  }}
                >
                  <div
                    className="info-icon rounded-3 d-flex align-items-center justify-content-center mb-2"
                    style={{
                      width: "42px",
                      height: "42px",
                      background:
                        "rgba(25,135,84,.12)",
                      fontSize: "21px",
                    }}
                  >
                    🟢
                  </div>

                  <small className="text-muted">
                    Account Status
                  </small>

                  <h5 className="fw-bold mt-1 mb-0 text-success">
                    Active
                  </h5>
                </div>
              </div>
            </div>

            {/* SECURITY */}
            <div className="security-box p-3 rounded-3 mt-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="security-pulse rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "44px",
                    height: "44px",
                    background:
                      "rgba(25,135,84,.15)",
                    fontSize: "20px",
                  }}
                >
                  🔒
                </div>

                <div>
                  <h6 className="fw-bold mb-0">
                    Account Security Active
                  </h6>

                  <small className="text-muted">
                    Your session is protected using JWT
                    authentication.
                  </small>
                </div>

                <span className="badge bg-success ms-auto">
                  Active
                </span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="border-top mt-3 pt-3">
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <button
                  className="btn btn-primary px-3 action-btn"
                  onClick={() =>
                    navigate("/dashboard")
                  }
                >
                  📊 Dashboard
                </button>

                <button
                  className="btn btn-outline-primary px-3 action-btn"
                  onClick={() =>
                    navigate("/notifications")
                  }
                >
                  🔔 Notifications
                </button>

                <button
                  className="btn btn-outline-primary px-3 action-btn"
                  onClick={() =>
                    navigate("/tracking")
                  }
                >
                  📍 Track Parcel
                </button>

                {role === "CUSTOMER" && (
                  <button
                    className="btn btn-outline-primary px-3 action-btn"
                    onClick={() =>
                      navigate("/book-parcel")
                    }
                  >
                    📦 Book Parcel
                  </button>
                )}

                <button
                  className="btn btn-outline-primary px-3 action-btn"
                  onClick={() =>
                    navigate("/prediction")
                  }
                >
                  🤖 AI Prediction
                </button>

                <button
                  className="btn btn-outline-danger px-3 action-btn"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE CARDS */}
      <div className="row g-3 mt-1">
        <div className="col-md-4">
          <div
            className="card p-3 text-center h-100 profile-card feature-card"
            role="button"
            onClick={() =>
              navigate("/tracking")
            }
          >
            <div className="feature-icon display-6 mb-2">
              📦
            </div>

            <h5 className="fw-bold mb-1">
              Track Parcels
            </h5>

            <p className="text-muted small mb-0">
              Track your courier shipments and view
              their current delivery status.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card p-3 text-center h-100 profile-card feature-card"
            role="button"
            onClick={() =>
              navigate("/prediction")
            }
          >
            <div className="feature-icon display-6 mb-2">
              🤖
            </div>

            <h5 className="fw-bold mb-1">
              AI Prediction
            </h5>

            <p className="text-muted small mb-0">
              Estimate delivery time using the machine
              learning system.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="card p-3 text-center h-100 profile-card feature-card"
            role="button"
            onClick={() =>
              navigate("/notifications")
            }
          >
            <div className="feature-icon display-6 mb-2">
              🔔
            </div>

            <h5 className="fw-bold mb-1">
              Smart Updates
            </h5>

            <p className="text-muted small mb-0">
              Receive important notifications about
              your courier deliveries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;