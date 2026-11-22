import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminManagement() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role")?.toUpperCase();

    if (role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }

    loadManagementData();
  }, [navigate]);

  const loadManagementData = async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        api.get("/api/users"),
        api.get("/api/agents"),
        api.get("/api/hubs"),
        api.get("/api/analytics"),
      ]);

      if (results[0].status === "fulfilled") {
        setUsers(
          Array.isArray(results[0].value.data)
            ? results[0].value.data
            : []
        );
      }

      if (results[1].status === "fulfilled") {
        setAgents(
          Array.isArray(results[1].value.data)
            ? results[1].value.data
            : []
        );
      }

      if (results[2].status === "fulfilled") {
        setHubs(
          Array.isArray(results[2].value.data)
            ? results[2].value.data
            : []
        );
      }

      if (results[3].status === "fulfilled") {
        setAnalytics(results[3].value.data);
      }
    } catch (err) {
      console.error("Admin management error:", err);
      setError("Unable to load management data.");
    } finally {
      setLoading(false);
    }
  };

  const availableAgents = agents.filter(
    (agent) =>
      !agent.status ||
      agent.status.toUpperCase() === "AVAILABLE"
  ).length;

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3">
          Loading system management...
        </p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {error && (
        <div className="alert alert-warning">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">
              System Management ⚙️
            </h2>

            <p className="text-muted mb-0">
              Manage users, parcels, agents, hubs, payments,
              complaints and logistics operations.
            </p>
          </div>

          <span className="badge bg-danger">
            ADMIN
          </span>
        </div>
      </div>

      {/* Management Functions */}
      <h4 className="fw-bold mb-3">
        Management Functions
      </h4>

      <div className="row g-3 mb-4">

        {/* Users */}
        <div className="col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="fs-2 mb-2">👥</div>

              <h5 className="fw-bold">
                Users
              </h5>

              <p className="text-muted small">
                View registered SmartCourier users.
              </p>

              <h4 className="text-primary">
                {users.length}
              </h4>

              <Link
                to="/admin-users"
                className="btn btn-outline-primary btn-sm w-100"
              >
                Manage Users →
              </Link>
            </div>
          </div>
        </div>

        {/* Delivery Agents */}
        <div className="col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="fs-2 mb-2">🚚</div>

              <h5 className="fw-bold">
                Delivery Agents
              </h5>

              <p className="text-muted small">
                View delivery agents and their status.
              </p>

              <h4 className="text-info">
                {agents.length}
              </h4>

              <Link
                to="/admin-agents"
                className="btn btn-outline-info btn-sm w-100"
              >
                Manage Delivery Agents →
              </Link>
            </div>
          </div>
        </div>

        {/* Hubs */}
        <div className="col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="fs-2 mb-2">🏢</div>

              <h5 className="fw-bold">
                Courier Hubs
              </h5>

              <p className="text-muted small">
                View registered courier hubs.
              </p>

              <h4 className="text-success">
                {hubs.length}
              </h4>

              <Link
                to="/admin-hubs"
                className="btn btn-outline-success btn-sm w-100"
              >
                Manage Hubs →
              </Link>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="col-md-6 col-lg-3">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="fs-2 mb-2">📊</div>

              <h5 className="fw-bold">
                Analytics
              </h5>

              <p className="text-muted small">
                Monitor courier system performance.
              </p>

              <h4 className="text-warning">
                ₹
                {Number(
                  analytics?.totalRevenue || 0
                ).toFixed(2)}
              </h4>

              <Link
                to="/admin-analytics"
                className="btn btn-outline-warning btn-sm w-100"
              >
                Open Analytics →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Parcel & Customer Management */}
      <h4 className="fw-bold mb-3">
        Parcel & Customer Management
      </h4>

      <div className="row g-3 mb-4">

        {/* Parcels */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="fs-2 mb-2">📦</div>

              <h5 className="fw-bold">
                Parcel Management
              </h5>

              <p className="text-muted small">
                View all parcels, delivery status and payment status.
              </p>

              <h4>
                {analytics?.totalParcels ?? 0}
              </h4>

              <Link
                to="/admin-parcels"
                className="btn btn-primary w-100"
              >
                Manage Parcels →
              </Link>
            </div>
          </div>
        </div>

        {/* Complaints */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="fs-2 mb-2">📋</div>

              <h5 className="fw-bold">
                Complaints
              </h5>

              <p className="text-muted small">
                View customer complaints and their status.
              </p>

              <Link
                to="/admin-complaints"
                className="btn btn-outline-danger w-100"
              >
                Manage Complaints →
              </Link>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="fs-2 mb-2">⭐</div>

              <h5 className="fw-bold">
                Customer Feedback
              </h5>

              <p className="text-muted small">
                Review ratings and customer feedback.
              </p>

              <Link
                to="/admin-feedback"
                className="btn btn-outline-warning w-100"
              >
                Manage Feedback →
              </Link>
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="fs-2 mb-2">💳</div>

              <h5 className="fw-bold">
                Payments
              </h5>

              <p className="text-muted small">
                View payment transactions.
              </p>

              <Link
                to="/admin-payments"
                className="btn btn-outline-success w-100"
              >
                Manage Payments →
              </Link>
            </div>
          </div>
        </div>

        {/* Assignments */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="fs-2 mb-2">🚛</div>

              <h5 className="fw-bold">
                Parcel Assignments
              </h5>

              <p className="text-muted small">
                Assign parcels to delivery agents.
              </p>

              <Link
                to="/assignments"
                className="btn btn-outline-primary w-100"
              >
                Manage Assignments →
              </Link>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="fs-2 mb-2">🔔</div>

              <h5 className="fw-bold">
                Notifications
              </h5>

              <p className="text-muted small">
                View shipment and system notifications.
              </p>

              <Link
                to="/admin-notifications"
                className="btn btn-outline-primary w-100"
              >
                Manage Notifications →
              </Link>
            </div>
          </div>
        </div>

        {/* AI Prediction */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="fs-2 mb-2">🤖</div>

              <h5 className="fw-bold">
                AI Delivery Prediction
              </h5>

              <p className="text-muted small">
                Use AI to predict delivery time.
              </p>

              <Link
                to="/prediction"
                className="btn btn-outline-info w-100"
              >
                Open AI Prediction →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* System Statistics */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="fw-bold mb-3">
            System Statistics
          </h5>

          <div className="row g-3">

            <div className="col-6 col-md-3">
              <div className="border rounded p-3">
                <small className="text-muted">
                  Total Users
                </small>

                <h4 className="mb-0">
                  {analytics?.totalUsers ?? users.length}
                </h4>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="border rounded p-3">
                <small className="text-muted">
                  Total Parcels
                </small>

                <h4 className="mb-0">
                  {analytics?.totalParcels ?? 0}
                </h4>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="border rounded p-3">
                <small className="text-muted">
                  Delivered
                </small>

                <h4 className="text-success mb-0">
                  {analytics?.deliveredParcels ?? 0}
                </h4>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="border rounded p-3">
                <small className="text-muted">
                  Available Agents
                </small>

                <h4 className="text-info mb-0">
                  {analytics?.availableAgents ??
                    availableAgents}
                </h4>
              </div>
            </div>

          </div>

          <div className="row g-3 mt-1">

            <div className="col-6 col-md-3">
              <div className="border rounded p-3">
                <small className="text-muted">
                  Total Agents
                </small>

                <h4 className="mb-0">
                  {analytics?.totalAgents ?? agents.length}
                </h4>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="border rounded p-3">
                <small className="text-muted">
                  Hubs
                </small>

                <h4 className="mb-0">
                  {analytics?.totalHubs ?? hubs.length}
                </h4>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="border rounded p-3">
                <small className="text-muted">
                  Pending Parcels
                </small>

                <h4 className="text-warning mb-0">
                  {analytics?.pendingParcels ?? 0}
                </h4>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="border rounded p-3">
                <small className="text-muted">
                  Revenue
                </small>

                <h4 className="text-success mb-0">
                  ₹
                  {Number(
                    analytics?.totalRevenue || 0
                  ).toFixed(2)}
                </h4>
              </div>
            </div>

          </div>

          <div className="d-flex justify-content-end mt-4">
            <button
              className="btn btn-outline-secondary"
              onClick={loadManagementData}
            >
              ↻ Refresh Management Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminManagement;