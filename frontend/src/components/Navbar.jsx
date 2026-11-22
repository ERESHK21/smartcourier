import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import api from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const checkLogin = () => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    setIsLoggedIn(!!token);
    setRole((savedRole || "").toUpperCase());

    return !!token;
  };

  const fetchUnreadNotifications = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await api.get(
        `/api/notifications/user/${userId}`
      );

      const notifications = Array.isArray(response.data)
        ? response.data
        : [];

      const unread = notifications.filter(
        (notification) => !notification.read
      ).length;

      setUnreadCount(unread);
    } catch (error) {
      console.error(
        "Unable to load notification count:",
        error
      );

      setUnreadCount(0);
    }
  };

  useEffect(() => {
    const loggedIn = checkLogin();

    if (loggedIn) {
      fetchUnreadNotifications();
    }

    const handleStorage = () => {
      const loggedInNow = checkLogin();

      if (loggedInNow) {
        fetchUnreadNotifications();
      } else {
        setUnreadCount(0);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  useEffect(() => {
    const loggedIn = checkLogin();

    if (loggedIn) {
      fetchUnreadNotifications();
    } else {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const interval = setInterval(() => {
      fetchUnreadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    setIsLoggedIn(false);
    setRole("");
    setUnreadCount(0);

    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isCustomer = role === "CUSTOMER";
  const isDeliveryAgent = role === "DELIVERY_AGENT";
  const isManager = role === "MANAGER";
  const isAdmin = role === "ADMIN";

  return (
    <>
      <nav className="smart-navbar navbar navbar-expand-lg navbar-dark">
        <div className="container-fluid px-3 px-lg-4">

          {/* BRAND */}
          <Link
            className="navbar-brand smart-brand d-flex align-items-center gap-2"
            to="/"
          >
            <span className="brand-icon">
              🚚
            </span>

            <span className="brand-name">
              Smart
              <span> Courier</span>
            </span>
          </Link>

          {/* MOBILE BUTTON */}
          <button
            className="navbar-toggler smart-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMenu"
            aria-controls="navbarMenu"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* NAVIGATION */}
          <div
            className="collapse navbar-collapse"
            id="navbarMenu"
          >
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">

              {/* HOME */}
              <li className="nav-item">
                <Link
                  className={`smart-nav-link ${
                    isActive("/") ? "smart-active" : ""
                  }`}
                  to="/"
                >
                  <span>🏠</span>
                  <span>Home</span>
                </Link>
              </li>

              {isLoggedIn ? (
                <>

                  {/* DASHBOARD */}
                  <li className="nav-item">
                    <Link
                      className={`smart-nav-link ${
                        isActive("/dashboard")
                          ? "smart-active"
                          : ""
                      }`}
                      to="/dashboard"
                    >
                      <span>📊</span>
                      <span>Dashboard</span>
                    </Link>
                  </li>

                  {/* CUSTOMER */}
                  {isCustomer && (
                    <>
                      <li className="nav-item">
                        <Link
                          className={`smart-nav-link ${
                            isActive("/book-parcel")
                              ? "smart-active"
                              : ""
                          }`}
                          to="/book-parcel"
                        >
                          <span>📦</span>
                          <span>Book</span>
                        </Link>
                      </li>

                      <li className="nav-item">
                        <Link
                          className={`smart-nav-link ${
                            isActive("/tracking")
                              ? "smart-active"
                              : ""
                          }`}
                          to="/tracking"
                        >
                          <span>📍</span>
                          <span>Track</span>
                        </Link>
                      </li>

                      <li className="nav-item">
                        <Link
                          className={`smart-nav-link ${
                            isActive("/prediction")
                              ? "smart-active"
                              : ""
                          }`}
                          to="/prediction"
                        >
                          <span>🤖</span>
                          <span>AI</span>
                        </Link>
                      </li>

                      <li className="nav-item">
                        <Link
                          className={`smart-nav-link ${
                            isActive("/payments")
                              ? "smart-active"
                              : ""
                          }`}
                          to="/payments"
                        >
                          <span>💳</span>
                          <span>Payments</span>
                        </Link>
                      </li>
                    </>
                  )}

                  {/* DELIVERY AGENT */}
                  {isDeliveryAgent && (
                    <>
                      <li className="nav-item">
                        <Link
                          className={`smart-nav-link ${
                            isActive("/tracking")
                              ? "smart-active"
                              : ""
                          }`}
                          to="/tracking"
                        >
                          <span>📍</span>
                          <span>Track</span>
                        </Link>
                      </li>

                      <li className="nav-item">
                        <Link
                          className={`smart-nav-link ${
                            isActive("/prediction")
                              ? "smart-active"
                              : ""
                          }`}
                          to="/prediction"
                        >
                          <span>🤖</span>
                          <span>AI</span>
                        </Link>
                      </li>
                    </>
                  )}

                  {/* MANAGER */}
                  {isManager && (
                    <>
                      <li className="nav-item">
                        <Link
                          className={`smart-nav-link ${
                            isActive("/tracking")
                              ? "smart-active"
                              : ""
                          }`}
                          to="/tracking"
                        >
                          <span>📍</span>
                          <span>Track</span>
                        </Link>
                      </li>

                      <li className="nav-item">
                        <Link
                          className={`smart-nav-link ${
                            isActive("/prediction")
                              ? "smart-active"
                              : ""
                          }`}
                          to="/prediction"
                        >
                          <span>🤖</span>
                          <span>AI</span>
                        </Link>
                      </li>
                    </>
                  )}

                  {/* ADMIN */}
                  {isAdmin && (
                    <>
                      <li className="nav-item">
                        <Link
                          className={`smart-nav-link ${
                            isActive("/tracking")
                              ? "smart-active"
                              : ""
                          }`}
                          to="/tracking"
                        >
                          <span>📍</span>
                          <span>Track</span>
                        </Link>
                      </li>

                      <li className="nav-item">
                        <Link
                          className={`smart-nav-link ${
                            isActive("/prediction")
                              ? "smart-active"
                              : ""
                          }`}
                          to="/prediction"
                        >
                          <span>🤖</span>
                          <span>AI</span>
                        </Link>
                      </li>

                      <li className="nav-item">
                        <Link
                          className={`smart-nav-link admin-link ${
                            isActive("/admin-management")
                              ? "smart-active"
                              : ""
                          }`}
                          to="/admin-management"
                        >
                          <span>🛡️</span>
                          <span>Admin</span>
                        </Link>
                      </li>
                    </>
                  )}

                  {/* NOTIFICATIONS */}
                  <li className="nav-item">
                    <Link
                      className={`smart-nav-link notification-link ${
                        isActive("/notifications")
                          ? "smart-active"
                          : ""
                      }`}
                      to="/notifications"
                      title="Notifications"
                    >
                      <span className="notification-icon">
                        🔔

                        {unreadCount > 0 && (
                          <span className="notification-badge">
                            {unreadCount > 99
                              ? "99+"
                              : unreadCount}
                          </span>
                        )}
                      </span>

                      <span>Notifications</span>
                    </Link>
                  </li>

                  {/* PROFILE */}
                  <li className="nav-item">
                    <Link
                      className={`smart-nav-link ${
                        isActive("/profile")
                          ? "smart-active"
                          : ""
                      }`}
                      to="/profile"
                    >
                      <span>👤</span>
                      <span>Profile</span>
                    </Link>
                  </li>

                  {/* ROLE */}
                  <li className="nav-item ms-lg-2 my-2 my-lg-0">
                    <span className="smart-role">
                      <span className="role-dot"></span>
                      {role}
                    </span>
                  </li>

                  {/* LOGOUT */}
                  <li className="nav-item ms-lg-2">
                    <button
                      className="smart-logout"
                      onClick={handleLogout}
                    >
                      <span>↪</span>
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  {/* LOGIN */}
                  <li className="nav-item">
                    <Link
                      className={`smart-nav-link ${
                        isActive("/login")
                          ? "smart-active"
                          : ""
                      }`}
                      to="/login"
                    >
                      <span>🔐</span>
                      <span>Login</span>
                    </Link>
                  </li>

                  {/* REGISTER */}
                  <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                    <Link
                      className="smart-register"
                      to="/register"
                    >
                      Get Started
                      <span>🚀</span>
                    </Link>
                  </li>
                </>
              )}

            </ul>
          </div>
        </div>
      </nav>

      <style>{`
        .smart-navbar {
          position: sticky;
          top: 0;
          z-index: 1050;
          min-height: 70px;
          background:
            linear-gradient(
              135deg,
              rgba(7, 17, 31, 0.96),
              rgba(12, 25, 45, 0.92)
            );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 217, 255, 0.13);
          box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.25),
            0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .smart-navbar::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(108, 99, 255, 0.7),
            rgba(0, 217, 255, 0.7),
            transparent
          );
          opacity: 0.7;
        }

        .smart-brand {
          position: relative;
          color: #ffffff !important;
          font-size: 1.35rem;
          letter-spacing: 0.2px;
          transition: transform 0.3s ease;
        }

        .smart-brand:hover {
          transform: translateY(-2px);
        }

        .brand-icon {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          font-size: 25px;
          background:
            linear-gradient(
              135deg,
              #6c63ff,
              #a855f7,
              #00d9ff
            );
          box-shadow:
            0 7px 22px rgba(108, 99, 255, 0.35),
            inset 0 1px 0 rgba(255,255,255,0.25);
          animation: truckFloat 3s ease-in-out infinite;
        }

        .brand-name {
          font-weight: 800;
        }

        .brand-name span {
          color: #00d9ff;
          text-shadow: 0 0 15px rgba(0,217,255,0.25);
        }

        .smart-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 12px !important;
          margin: 3px 1px;
          border-radius: 11px;
          color: #aeb8c8 !important;
          font-size: 0.88rem;
          font-weight: 600;
          text-decoration: none;
          transition:
            color 0.25s ease,
            background 0.25s ease,
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .smart-nav-link:hover {
          color: #ffffff !important;
          background: rgba(108, 99, 255, 0.10);
          transform: translateY(-2px);
        }

        .smart-nav-link::after {
          content: "";
          position: absolute;
          bottom: 3px;
          left: 50%;
          width: 0;
          height: 2px;
          border-radius: 10px;
          transform: translateX(-50%);
          background: linear-gradient(
            90deg,
            #6c63ff,
            #00d9ff
          );
          transition: width 0.25s ease;
        }

        .smart-nav-link:hover::after {
          width: 45%;
        }

        .smart-nav-link.smart-active {
          color: #ffffff !important;
          background:
            linear-gradient(
              135deg,
              rgba(108, 99, 255, 0.18),
              rgba(0, 217, 255, 0.08)
            );
          box-shadow:
            inset 0 0 18px rgba(108, 99, 255, 0.06),
            0 4px 15px rgba(0, 0, 0, 0.08);
        }

        .smart-nav-link.smart-active::after {
          width: 60%;
        }

        .admin-link {
          color: #d8b4fe !important;
          background: rgba(168, 85, 247, 0.06);
        }

        .notification-icon {
          position: relative;
          display: inline-flex;
        }

        .notification-badge {
          position: absolute;
          top: -9px;
          right: -11px;
          min-width: 18px;
          height: 18px;
          padding: 2px 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50px;
          color: #ffffff;
          background: linear-gradient(
            135deg,
            #ef4444,
            #dc2626
          );
          border: 2px solid #09111f;
          font-size: 9px;
          font-weight: 800;
          box-shadow:
            0 0 12px rgba(239, 68, 68, 0.55);
          animation: notificationPulse 2s infinite;
        }

        .smart-role {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 13px;
          border-radius: 50px;
          color: #c7d2fe;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          background:
            linear-gradient(
              135deg,
              rgba(108, 99, 255, 0.17),
              rgba(0, 217, 255, 0.08)
            );
          border: 1px solid rgba(108, 99, 255, 0.25);
        }

        .role-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px rgba(34,197,94,0.8);
          animation: onlinePulse 2s infinite;
        }

        .smart-logout {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 15px;
          border: 1px solid rgba(239,68,68,0.35);
          border-radius: 10px;
          color: #fecaca;
          background: rgba(239,68,68,0.08);
          font-size: 0.82rem;
          font-weight: 600;
          transition:
            all 0.25s ease;
        }

        .smart-logout:hover {
          color: #ffffff;
          background:
            linear-gradient(
              135deg,
              rgba(239,68,68,0.85),
              rgba(190,24,93,0.8)
            );
          border-color: transparent;
          transform: translateY(-2px);
          box-shadow:
            0 8px 20px rgba(239,68,68,0.2);
        }

        .smart-register {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 17px;
          border-radius: 11px;
          color: #ffffff !important;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 700;
          background:
            linear-gradient(
              135deg,
              #6c63ff,
              #a855f7
            );
          box-shadow:
            0 7px 20px rgba(108,99,255,0.28);
          transition: all 0.3s ease;
        }

        .smart-register:hover {
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow:
            0 10px 28px rgba(108,99,255,0.42);
        }

        .smart-toggler {
          border: 1px solid rgba(255,255,255,0.12) !important;
          border-radius: 10px;
          padding: 7px 10px;
          background: rgba(255,255,255,0.05);
        }

        .smart-toggler:hover {
          background: rgba(108,99,255,0.15);
        }

        @keyframes truckFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-3px) rotate(-2deg);
          }
        }

        @keyframes notificationPulse {
          0%, 100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.12);
          }
        }

        @keyframes onlinePulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }

          50% {
            opacity: 0.5;
            transform: scale(0.75);
          }
        }

        @media (max-width: 991px) {
          .smart-navbar {
            min-height: 65px;
          }

          .smart-nav-link {
            margin: 2px 0;
            padding: 11px 13px !important;
          }

          .smart-nav-link::after {
            display: none;
          }

          .smart-nav-link:hover {
            transform: translateX(4px);
          }

          .smart-role {
            margin-left: 3px;
          }

          .smart-logout {
            margin-top: 5px;
            margin-bottom: 8px;
          }
        }

        @media (max-width: 576px) {
          .brand-icon {
            width: 39px;
            height: 39px;
            font-size: 22px;
            border-radius: 11px;
          }

          .smart-brand {
            font-size: 1.15rem;
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;