import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const role = localStorage.getItem("role")?.toUpperCase();

    if (role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }

    if (!userId) {
      setError("Admin user information is missing. Please login again.");
      setLoading(false);
      return;
    }

    loadNotifications();
  }, [navigate, userId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/api/notifications/user/${userId}`
      );

      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Admin notifications error:",
        err
      );

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to view notifications."
        );
      } else if (err.response?.status === 404) {
        setError(
          "Notification service or endpoint was not found."
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

  const formatDate = (date) => {
    if (!date) {
      return "Recently";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN");
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const readCount =
    notifications.length - unreadCount;

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3">
          Loading notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="container py-4">

      {/* Header */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              Notification Management 🔔
            </h2>

            <p className="text-muted mb-0">
              View system and shipment notifications.
            </p>
          </div>

          <Link
            to="/admin-management"
            className="btn btn-dark"
          >
            ← Admin Panel
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-warning">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="row g-3 mb-4">

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Total Notifications
              </small>

              <h3 className="fw-bold text-primary mb-0">
                {notifications.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Unread Notifications
              </small>

              <h3 className="fw-bold text-warning mb-0">
                {unreadCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Read Notifications
              </small>

              <h3 className="fw-bold text-success mb-0">
                {readCount}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* Notifications */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              Admin Notifications
            </h5>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={loadNotifications}
            >
              ↻ Refresh
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="alert alert-info text-center mb-0">
              No notifications found for this admin account.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">

                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Parcel ID</th>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {notifications.map(
                    (notification) => (
                      <tr key={notification.id}>

                        <td>
                          {notification.id}
                        </td>

                        <td>
                          {notification.parcelId ?? "-"}
                        </td>

                        <td className="fw-semibold">
                          {notification.title || "-"}
                        </td>

                        <td
                          style={{
                            minWidth: "250px",
                            maxWidth: "450px",
                          }}
                        >
                          {notification.message || "-"}
                        </td>

                        <td>
                          {notification.read ? (
                            <span className="badge bg-success">
                              READ
                            </span>
                          ) : (
                            <span className="badge bg-warning text-dark">
                              UNREAD
                            </span>
                          )}
                        </td>

                        <td>
                          {formatDate(
                            notification.createdAt
                          )}
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default AdminNotifications;