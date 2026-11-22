import { useEffect, useState } from "react";
import api from "../services/api";
import LoadingScreen from "../components/LoadingScreen";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  const fetchNotifications = async () => {
    try {
      setError("");

      if (!userId) {
        setError(
          "User information is missing. Please login again."
        );
        setLoading(false);
        return;
      }

      const response = await api.get(
        `/api/notifications/user/${userId}`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      data.sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );

      setNotifications(data);
    } catch (err) {
      console.error(
        "Error fetching notifications:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to view these notifications."
        );
      } else if (!err.response) {
        setError(
          "Unable to connect to the Smart Courier server."
        );
      } else {
        setError(
          "Unable to load notifications."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError(
        "User information is missing. Please login again."
      );
      setLoading(false);
      return;
    }

    fetchNotifications();
  }, [userId]);

  const markAsRead = async (notification) => {
    if (notification.read) {
      return;
    }

    try {
      setUpdatingId(notification.id);
      setError("");

      await api.put(
        `/api/notifications/${notification.id}/read`
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Error marking notification as read:",
        err
      );

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to update this notification."
        );
      } else {
        setError(
          "Unable to update notification."
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications =
      notifications.filter(
        (notification) => !notification.read
      );

    if (unreadNotifications.length === 0) {
      return;
    }

    try {
      setError("");

      for (const notification of unreadNotifications) {
        await api.put(
          `/api/notifications/${notification.id}/read`
        );
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (err) {
      console.error(
        "Error marking all notifications as read:",
        err
      );

      setError(
        "Some notifications could not be updated."
      );
    }
  };

  const getNotificationIcon = (notification) => {
    const text = (
      notification.title ||
      notification.message ||
      ""
    ).toLowerCase();

    if (text.includes("delivered")) {
      return "✅";
    }

    if (
      text.includes("transit") ||
      text.includes("shipping")
    ) {
      return "🚚";
    }

    if (
      text.includes("book") ||
      text.includes("parcel")
    ) {
      return "📦";
    }

    if (
      text.includes("payment") ||
      text.includes("paid")
    ) {
      return "💳";
    }

    if (
      text.includes("complaint") ||
      text.includes("issue")
    ) {
      return "⚠️";
    }

    if (
      text.includes("assigned") ||
      text.includes("assignment")
    ) {
      return "👨‍💼";
    }

    return "🔔";
  };

  const formatDate = (date) => {
    if (!date) {
      return "Recently";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString();
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const readCount =
    notifications.length - unreadCount;

  if (loading) {
    return (
      <div className="container py-3 py-md-4">
        <LoadingScreen text="Loading your notifications..." />
      </div>
    );
  }

  return (
    <div className="container py-3 py-md-4">
      <style>{`
        .notification-card {
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          transition:
            transform .25s ease,
            box-shadow .25s ease,
            border-color .25s ease;
        }

        .notification-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0,0,0,.16);
        }

        .notification-hero {
          overflow: hidden;
          position: relative;
        }

        .notification-hero::before {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: rgba(0,217,255,.12);
          filter: blur(35px);
          right: 8%;
          top: -80px;
          animation: glowMove 5s ease-in-out infinite;
        }

        .notification-bell {
          animation: bellFloat 3s ease-in-out infinite;
          filter: drop-shadow(0 0 25px rgba(0,217,255,.4));
        }

        .stat-card {
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,.14);
        }

        .stat-icon {
          animation: softPulse 2.5s ease-in-out infinite;
        }

        .unread-card {
          position: relative;
          overflow: hidden;
        }

        .unread-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(
            180deg,
            #0d6efd,
            #00d9ff,
            #6610f2
          );
        }

        .notification-icon {
          transition: transform .25s ease;
        }

        .notification-card:hover .notification-icon {
          transform: scale(1.08) rotate(-4deg);
        }

        .new-badge {
          animation: badgePulse 2s ease-in-out infinite;
        }

        .empty-icon {
          animation: emptyFloat 3s ease-in-out infinite;
        }

        @keyframes bellFloat {
          0%,100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(-8px) rotate(4deg);
          }
        }

        @keyframes glowMove {
          0%,100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-30px);
          }
        }

        @keyframes softPulse {
          0%,100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes badgePulse {
          0%,100% {
            box-shadow: 0 0 0 rgba(255,193,7,0);
          }
          50% {
            box-shadow: 0 0 12px rgba(255,193,7,.35);
          }
        }

        @keyframes emptyFloat {
          0%,100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }

        @media (max-width: 768px) {
          .notification-title {
            font-size: 2rem;
          }
        }
      `}</style>

      {/* HERO */}
      <div
        className="card p-3 p-md-4 mb-3 notification-card notification-hero"
        style={{
          background:
            "linear-gradient(135deg,rgba(13,110,253,.16),rgba(102,16,242,.14),rgba(0,217,255,.06))",
          border:
            "1px solid rgba(0,217,255,.18)",
        }}
      >
        <div className="row align-items-center">
          <div className="col-lg-8 position-relative">
            <span className="badge bg-primary mb-2">
              SMART NOTIFICATIONS
            </span>

            <h1 className="display-6 fw-bold notification-title mb-1">
              Stay Updated 🔔
            </h1>

            <p className="text-muted mb-0">
              Get real-time updates about your parcels,
              deliveries and payments.
            </p>
          </div>

          <div className="col-lg-4 text-center mt-3 mt-lg-0">
            <div
              className="notification-bell"
              style={{
                fontSize: "70px",
                lineHeight: 1,
              }}
            >
              🔔
            </div>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger py-2 mb-3 d-flex justify-content-between align-items-center">
          <span>⚠️ {error}</span>

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
              setLoading(true);
              fetchNotifications();
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card p-3 h-100 stat-card notification-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1">
                  Total Notifications
                </p>

                <h2 className="fw-bold mb-0">
                  {notifications.length}
                </h2>
              </div>

              <div className="display-6 stat-icon">
                🔔
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 h-100 stat-card notification-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1">
                  Unread
                </p>

                <h2 className="fw-bold text-warning mb-0">
                  {unreadCount}
                </h2>
              </div>

              <div className="display-6 stat-icon">
                🟡
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 h-100 stat-card notification-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1">
                  Read
                </p>

                <h2 className="fw-bold text-success mb-0">
                  {readCount}
                </h2>
              </div>

              <div className="display-6 stat-icon">
                ✅
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="card p-3 mb-3 notification-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h5 className="fw-bold mb-0">
              Notification Center
            </h5>

            <small className="text-muted">
              {unreadCount > 0
                ? `${unreadCount} notification${
                    unreadCount !== 1 ? "s" : ""
                  } waiting for you`
                : "You're all caught up!"}
            </small>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                setLoading(true);
                fetchNotifications();
              }}
            >
              🔄 Refresh
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              ✓ Mark All Read
            </button>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {notifications.length === 0 ? (
        <div className="card p-4 text-center notification-card">
          <div
            className="empty-icon"
            style={{
              fontSize: "65px",
              opacity: 0.8,
            }}
          >
            🔕
          </div>

          <h4 className="fw-bold mt-2 mb-1">
            No Notifications
          </h4>

          <p className="text-muted mb-0">
            You don't have any notifications yet.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {notifications.map((notification) => {
            const isUnread = !notification.read;

            return (
              <div
                key={notification.id}
                className={`card p-3 notification-card ${
                  isUnread ? "unread-card" : ""
                }`}
                style={{
                  border: isUnread
                    ? "1px solid rgba(0,217,255,.28)"
                    : "1px solid rgba(255,255,255,.08)",
                  background: isUnread
                    ? "linear-gradient(135deg,rgba(13,110,253,.09),rgba(0,217,255,.04))"
                    : "rgba(255,255,255,.035)",
                }}
              >
                <div className="row align-items-center g-2">
                  {/* ICON */}
                  <div className="col-auto">
                    <div
                      className="notification-icon d-flex align-items-center justify-content-center"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "14px",
                        background: isUnread
                          ? "linear-gradient(135deg,#0d6efd,#6610f2)"
                          : "rgba(255,255,255,.08)",
                        fontSize: "24px",
                      }}
                    >
                      {getNotificationIcon(
                        notification
                      )}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="col">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <h5 className="fw-bold mb-0">
                        {notification.title ||
                          "Smart Courier Notification"}
                      </h5>

                      {isUnread && (
                        <span className="badge bg-warning text-dark new-badge">
                          NEW
                        </span>
                      )}
                    </div>

                    <p className="text-muted mb-1">
                      {notification.message ||
                        "You have a new notification."}
                    </p>

                    <small className="text-muted">
                      🕒{" "}
                      {formatDate(
                        notification.createdAt
                      )}
                    </small>
                  </div>

                  {/* ACTION */}
                  <div className="col-auto">
                    {isUnread ? (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        disabled={
                          updatingId ===
                          notification.id
                        }
                        onClick={() =>
                          markAsRead(notification)
                        }
                      >
                        {updatingId ===
                        notification.id ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                            />
                            Updating
                          </>
                        ) : (
                          "✓ Mark Read"
                        )}
                      </button>
                    ) : (
                      <span className="badge bg-success">
                        ✓ Read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;