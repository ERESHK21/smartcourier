import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingScreen from "../components/LoadingScreen";

function Dashboard() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [parcels, setParcels] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const storedEmail = localStorage.getItem("email") || "";

    const storedRole = (
      localStorage.getItem("role") || "CUSTOMER"
    ).toUpperCase();

    setEmail(storedEmail);
    setRole(storedRole);

    loadDashboard(storedRole);
  }, [navigate]);

  const loadDashboard = async (currentRole) => {
    try {
      setLoading(true);
      setError("");

      if (!userId) {
        setError("User information not found. Please login again.");
        setLoading(false);
        return;
      }

      if (currentRole === "CUSTOMER") {
        await loadCustomerDashboard();
      } else if (currentRole === "DELIVERY_AGENT") {
        await loadAgentDashboard();
      } else if (
        currentRole === "MANAGER" ||
        currentRole === "ADMIN"
      ) {
        await loadManagementDashboard();
      } else {
        await loadCustomerDashboard();
      }
    } catch (err) {
      console.error("Dashboard error:", err);

      if (err.response?.status === 401) {
        clearLogin();
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError("You are not authorized to access this dashboard.");
      } else {
        setError("Unable to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDashboard = async () => {
    const response = await api.get(`/api/parcels/user/${userId}`);

    setParcels(
      Array.isArray(response.data) ? response.data : []
    );
  };

  const totalParcels = parcels.length;

  const deliveredParcels = parcels.filter(
    (parcel) =>
      parcel.status?.toUpperCase() === "DELIVERED"
  ).length;

  const inTransitParcels = parcels.filter((parcel) =>
    [
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "PICKED_UP",
    ].includes(parcel.status?.toUpperCase())
  ).length;

  const pendingParcels = parcels.filter(
    (parcel) =>
      parcel.status?.toUpperCase() === "BOOKED"
  ).length;

  const totalRevenue = parcels.reduce(
    (total, parcel) =>
      total + Number(parcel.deliveryCharge || 0),
    0
  );

  const loadAgentDashboard = async () => {
    const response = await api.get(
      `/api/agents/user/${userId}`
    );

    const currentAgent = response.data;

    setAgent(currentAgent);

    if (currentAgent?.id) {
      const assignmentResponse = await api.get(
        `/api/assignments/agent/${currentAgent.id}`
      );

      setAssignments(
        Array.isArray(assignmentResponse.data)
          ? assignmentResponse.data
          : []
      );
    }
  };

  const acceptAssignment = async (assignmentId) => {
    try {
      setError("");

      await api.put(
        `/api/assignments/${assignmentId}/accept`
      );

      await loadAgentDashboard();
    } catch (err) {
      console.error("Accept assignment error:", err);

      if (err.response?.status === 401) {
        clearLogin();
        navigate("/login");
        return;
      }

      setError("Unable to accept assignment.");
    }
  };

  const completeAssignment = async (assignmentId) => {
    try {
      setError("");

      await api.put(
        `/api/assignments/${assignmentId}/complete`
      );

      await loadAgentDashboard();
    } catch (err) {
      console.error("Complete assignment error:", err);

      if (err.response?.status === 401) {
        clearLogin();
        navigate("/login");
        return;
      }

      setError("Unable to complete assignment.");
    }
  };

  const assignedCount = assignments.length;

  const acceptedCount = assignments.filter(
    (item) =>
      item.status?.toUpperCase() === "ACCEPTED"
  ).length;

  const completedCount = assignments.filter(
    (item) =>
      item.status?.toUpperCase() === "COMPLETED"
  ).length;

  const loadManagementDashboard = async () => {
    const results = await Promise.allSettled([
      api.get("/api/analytics"),
      api.get("/api/users"),
      api.get("/api/agents"),
      api.get("/api/hubs"),
    ]);

    if (results[0].status === "fulfilled") {
      setAnalytics(results[0].value.data);
    }

    if (results[1].status === "fulfilled") {
      setUsers(
        Array.isArray(results[1].value.data)
          ? results[1].value.data
          : []
      );
    }

    if (results[2].status === "fulfilled") {
      setAgents(
        Array.isArray(results[2].value.data)
          ? results[2].value.data
          : []
      );
    }

    if (results[3].status === "fulfilled") {
      setHubs(
        Array.isArray(results[3].value.data)
          ? results[3].value.data
          : []
      );
    }

    const failed = results.some(
      (result) => result.status === "rejected"
    );

    if (failed) {
      setError(
        "Some management dashboard information could not be loaded."
      );
    }
  };

  const clearLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
  };

  const handleLogout = () => {
    clearLogin();
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  const getStatusClass = (status) => {
    const value = status?.toUpperCase();

    if (
      value === "DELIVERED" ||
      value === "COMPLETED"
    ) {
      return "bg-success";
    }

    if (
      value === "BOOKED" ||
      value === "ASSIGNED"
    ) {
      return "bg-warning text-dark";
    }

    if (
      value === "OUT_FOR_DELIVERY" ||
      value === "ACCEPTED"
    ) {
      return "bg-info text-dark";
    }

    if (value === "IN_TRANSIT") {
      return "bg-primary";
    }

    return "bg-secondary";
  };

  const getStatusIcon = (status) => {
    const value = status?.toUpperCase();

    if (
      value === "DELIVERED" ||
      value === "COMPLETED"
    ) {
      return "✅";
    }

    if (
      value === "BOOKED" ||
      value === "ASSIGNED"
    ) {
      return "📦";
    }

    if (
      value === "OUT_FOR_DELIVERY" ||
      value === "ACCEPTED"
    ) {
      return "🚚";
    }

    if (value === "IN_TRANSIT") {
      return "🚛";
    }

    return "⏳";
  };

  const cardStyle = {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    transition: "all .25s ease",
  };

  const compactSection = {
    marginBottom: "28px",
  };

  if (loading) {
    return (
      <div className="container py-4">
        <LoadingScreen text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="container py-3 py-md-4">
      <style>{`
        .dashboard-card {
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .dashboard-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,.18);
        }

        .dashboard-stat {
          transition: transform .2s ease;
        }

        .dashboard-stat:hover {
          transform: translateY(-3px);
        }

        .dashboard-link {
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .dashboard-link:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,.15);
        }

        .dashboard-table th,
        .dashboard-table td {
          padding: 10px 12px;
        }

        .dashboard-title {
          letter-spacing: -.5px;
        }

        @media (max-width: 768px) {
          .dashboard-table {
            min-width: 650px;
          }
        }
      `}</style>

      {/* HEADER */}
      <div
        className="card p-3 p-md-4 mb-3 dashboard-card"
        style={{
          ...cardStyle,
          background:
            "linear-gradient(135deg,rgba(13,110,253,.18),rgba(102,16,242,.14),rgba(0,217,255,.06))",
        }}
      >
        <div className="row align-items-center">
          <div className="col-lg-8">
            <span className="badge bg-primary mb-2">
              SMART LOGISTICS DASHBOARD
            </span>

            <h1 className="display-6 fw-bold dashboard-title mb-1">
              Welcome back! 👋
            </h1>

            <p className="text-muted mb-2">
              Manage your courier operations and AI-powered
              logistics from one place.
            </p>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="text-muted small">
                📧 {email}
              </span>

              <span
                className="badge px-3 py-2"
                style={{
                  background:
                    "linear-gradient(135deg,#0d6efd,#6610f2)",
                }}
              >
                🛡️ {role}
              </span>
            </div>
          </div>

          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <div
              style={{
                fontSize: "4rem",
                lineHeight: 1,
                filter:
                  "drop-shadow(0 0 20px rgba(0,217,255,.35))",
              }}
            >
              🚚
            </div>

            <button
              className="btn btn-outline-danger btn-sm mt-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger py-2 mb-3">
          ⚠️ {error}
        </div>
      )}

      {/* CUSTOMER */}
      {role === "CUSTOMER" && (
        <>
          {/* STATS */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-xl-3">
              <div
                className="card p-3 h-100 dashboard-card dashboard-stat"
                style={cardStyle}
              >
                <small className="text-muted">
                  Total Parcels
                </small>

                <h2 className="fw-bold mb-1">
                  {totalParcels}
                </h2>

                <span className="badge bg-primary">
                  All Shipments
                </span>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div
                className="card p-3 h-100 dashboard-card dashboard-stat"
                style={cardStyle}
              >
                <small className="text-muted">
                  In Transit
                </small>

                <h2 className="fw-bold text-info mb-1">
                  {inTransitParcels}
                </h2>

                <span className="badge bg-info text-dark">
                  On the way
                </span>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div
                className="card p-3 h-100 dashboard-card dashboard-stat"
                style={cardStyle}
              >
                <small className="text-muted">
                  Delivered
                </small>

                <h2 className="fw-bold text-success mb-1">
                  {deliveredParcels}
                </h2>

                <span className="badge bg-success">
                  Completed
                </span>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div
                className="card p-3 h-100 dashboard-card dashboard-stat"
                style={cardStyle}
              >
                <small className="text-muted">
                  Pending
                </small>

                <h2 className="fw-bold text-warning mb-1">
                  {pendingParcels}
                </h2>

                <span className="badge bg-warning text-dark">
                  Booked
                </span>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div style={compactSection}>
            <span className="badge bg-primary mb-1">
              QUICK ACTIONS
            </span>

            <h3 className="fw-bold mb-3">
              What would you like to do?
            </h3>

            <div className="row g-3">
              <div className="col-md-4">
                <Link
                  to="/book-parcel"
                  className="text-decoration-none"
                >
                  <div
                    className="card h-100 p-3 dashboard-card dashboard-link"
                    style={cardStyle}
                  >
                    <div className="fs-1 mb-2">
                      📦
                    </div>

                    <h5 className="fw-bold">
                      Book Parcel
                    </h5>

                    <p className="text-muted small mb-2">
                      Create a new courier booking and
                      receive your tracking ID instantly.
                    </p>

                    <span className="text-info fw-bold">
                      Book Now →
                    </span>
                  </div>
                </Link>
              </div>

              <div className="col-md-4">
                <Link
                  to="/tracking"
                  className="text-decoration-none"
                >
                  <div
                    className="card h-100 p-3 dashboard-card dashboard-link"
                    style={cardStyle}
                  >
                    <div className="fs-1 mb-2">
                      📍
                    </div>

                    <h5 className="fw-bold">
                      Track Parcel
                    </h5>

                    <p className="text-muted small mb-2">
                      Check the latest status of your
                      courier shipment.
                    </p>

                    <span className="text-info fw-bold">
                      Track Now →
                    </span>
                  </div>
                </Link>
              </div>

              <div className="col-md-4">
                <Link
                  to="/prediction"
                  className="text-decoration-none"
                >
                  <div
                    className="card h-100 p-3 dashboard-card dashboard-link"
                    style={cardStyle}
                  >
                    <div className="fs-1 mb-2">
                      🤖
                    </div>

                    <h5 className="fw-bold">
                      AI Prediction
                    </h5>

                    <p className="text-muted small mb-2">
                      Estimate delivery time using your
                      machine learning model.
                    </p>

                    <span className="text-info fw-bold">
                      Predict Delivery →
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* CUSTOMER PARCELS */}
          <div
            className="card p-3 mb-3 dashboard-card"
            style={cardStyle}
          >
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <div>
                <span className="badge bg-primary mb-1">
                  SHIPMENTS
                </span>

                <h4 className="fw-bold mb-0">
                  Recent Parcels
                </h4>

                <small className="text-muted">
                  Your latest courier shipments.
                </small>
              </div>

              <Link
                to="/tracking"
                className="btn btn-outline-primary btn-sm"
              >
                View Tracking
              </Link>
            </div>

            {parcels.length === 0 ? (
              <div className="text-center py-4">
                <div className="fs-1">
                  📦
                </div>

                <h5 className="fw-bold mt-2">
                  No parcels yet
                </h5>

                <p className="text-muted small">
                  Start by booking your first parcel.
                </p>

                <Link
                  to="/book-parcel"
                  className="btn btn-primary btn-sm"
                >
                  Book Your First Parcel
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle dashboard-table mb-0">
                  <thead>
                    <tr>
                      <th>Tracking ID</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Charge</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {parcels.map((parcel) => (
                      <tr key={parcel.id}>
                        <td>
                          <div className="fw-bold">
                            {parcel.trackingId}
                          </div>

                          <small className="text-muted">
                            Parcel #{parcel.id}
                          </small>
                        </td>

                        <td>
                          <span className="badge bg-secondary">
                            {parcel.deliveryType}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge ${getStatusClass(
                              parcel.status
                            )}`}
                          >
                            {getStatusIcon(parcel.status)}{" "}
                            {parcel.status}
                          </span>
                        </td>

                        <td className="fw-bold">
                          ₹
                          {Number(
                            parcel.deliveryCharge || 0
                          ).toFixed(2)}
                        </td>

                        <td>
                          <Link
                            to={`/tracking?trackingId=${parcel.trackingId}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CUSTOMER BOTTOM CARDS */}
          <div className="row g-3">
            <div className="col-md-4">
              <div
                className="card p-3 h-100 dashboard-card"
                style={cardStyle}
              >
                <div className="fs-2 mb-1">
                  💰
                </div>

                <small className="text-muted">
                  Total Shipment Charges
                </small>

                <h4 className="fw-bold mt-1 mb-0">
                  ₹{totalRevenue.toFixed(2)}
                </h4>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="card p-3 h-100 dashboard-card"
                style={cardStyle}
              >
                <div className="fs-2 mb-1">
                  🤖
                </div>

                <h6 className="fw-bold">
                  Smart AI Assistant
                </h6>

                <p className="text-muted small mb-2">
                  Ask the chatbot about your parcel,
                  delivery status or charges.
                </p>

                <span className="badge bg-success">
                  ● AI Online
                </span>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="card p-3 h-100 dashboard-card"
                style={cardStyle}
              >
                <div className="fs-2 mb-1">
                  🔔
                </div>

                <h6 className="fw-bold">
                  Smart Notifications
                </h6>

                <p className="text-muted small mb-2">
                  Stay informed about your shipment
                  activity.
                </p>

                <Link
                  to="/notifications"
                  className="btn btn-outline-primary btn-sm"
                >
                  View Notifications
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* DELIVERY AGENT */}
      {role === "DELIVERY_AGENT" && (
        <>
          <div style={compactSection}>
            <span className="badge bg-info text-dark mb-1">
              DELIVERY AGENT
            </span>

            <h2 className="fw-bold mb-1">
              Delivery Operations 🚚
            </h2>

            <p className="text-muted mb-0">
              Manage your assigned parcels and delivery
              tasks.
            </p>
          </div>

          {agent && (
            <div
              className="card p-3 mb-3 dashboard-card"
              style={cardStyle}
            >
              <div className="row g-3">
                <div className="col-md-4">
                  <small className="text-muted">
                    Agent
                  </small>

                  <h6 className="fw-bold mb-0">
                    {agent.name}
                  </h6>
                </div>

                <div className="col-md-4">
                  <small className="text-muted">
                    Vehicle
                  </small>

                  <h6 className="fw-bold mb-0">
                    {agent.vehicleNumber || "-"}
                  </h6>
                </div>

                <div className="col-md-4">
                  <small className="text-muted">
                    Status
                  </small>

                  <div>
                    <span
                      className={`badge ${
                        agent.status?.toUpperCase() ===
                        "AVAILABLE"
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {agent.status || "UNKNOWN"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div
                className="card p-3 dashboard-card"
                style={cardStyle}
              >
                <small className="text-muted">
                  Assigned Parcels
                </small>

                <h2 className="fw-bold mb-1">
                  {assignedCount}
                </h2>

                <span className="badge bg-primary">
                  Total Assignments
                </span>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="card p-3 dashboard-card"
                style={cardStyle}
              >
                <small className="text-muted">
                  Accepted
                </small>

                <h2 className="fw-bold text-info mb-1">
                  {acceptedCount}
                </h2>

                <span className="badge bg-info text-dark">
                  Active Deliveries
                </span>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="card p-3 dashboard-card"
                style={cardStyle}
              >
                <small className="text-muted">
                  Completed
                </small>

                <h2 className="fw-bold text-success mb-1">
                  {completedCount}
                </h2>

                <span className="badge bg-success">
                  Delivered
                </span>
              </div>
            </div>
          </div>

          <div
            className="card p-3 dashboard-card"
            style={cardStyle}
          >
            <span className="badge bg-primary mb-1">
              ASSIGNMENTS
            </span>

            <h4 className="fw-bold mb-3">
              My Delivery Assignments
            </h4>

            {assignments.length === 0 ? (
              <div className="text-center py-4">
                <div className="fs-1">
                  📦
                </div>

                <h6 className="fw-bold mt-2">
                  No assignments
                </h6>

                <p className="text-muted small mb-0">
                  You currently have no assigned parcels.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle dashboard-table mb-0">
                  <thead>
                    <tr>
                      <th>Assignment</th>
                      <th>Parcel ID</th>
                      <th>Status</th>
                      <th>Assigned At</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {assignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>
                          #{assignment.id}
                        </td>

                        <td>
                          Parcel #{assignment.parcelId}
                        </td>

                        <td>
                          <span
                            className={`badge ${getStatusClass(
                              assignment.status
                            )}`}
                          >
                            {getStatusIcon(
                              assignment.status
                            )}{" "}
                            {assignment.status}
                          </span>
                        </td>

                        <td>
                          {assignment.assignedAt
                            ? new Date(
                                assignment.assignedAt
                              ).toLocaleString()
                            : "-"}
                        </td>

                        <td>
                          {assignment.status ===
                            "ASSIGNED" && (
                            <button
                              className="btn btn-sm btn-info me-1"
                              onClick={() =>
                                acceptAssignment(
                                  assignment.id
                                )
                              }
                            >
                              Accept
                            </button>
                          )}

                          {assignment.status ===
                            "ACCEPTED" && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() =>
                                completeAssignment(
                                  assignment.id
                                )
                              }
                            >
                              Complete
                            </button>
                          )}

                          {assignment.status ===
                            "COMPLETED" && (
                            <span className="text-success fw-bold">
                              Completed ✓
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* MANAGER / ADMIN */}
      {(role === "MANAGER" || role === "ADMIN") && (
        <>
          <div style={compactSection}>
            <span className="badge bg-primary mb-1">
              {role} DASHBOARD
            </span>

            <h2 className="fw-bold mb-1">
              Logistics Management 📊
            </h2>

            <p className="text-muted mb-0">
              Monitor courier operations, users, delivery
              agents and hubs.
            </p>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-6 col-xl-3">
              <div
                className="card p-3 h-100 dashboard-card dashboard-stat"
                style={cardStyle}
              >
                <small className="text-muted">
                  Total Users
                </small>

                <h2 className="fw-bold mb-1">
                  {analytics?.totalUsers ?? users.length}
                </h2>

                <span className="badge bg-primary">
                  Registered Users
                </span>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div
                className="card p-3 h-100 dashboard-card dashboard-stat"
                style={cardStyle}
              >
                <small className="text-muted">
                  Total Parcels
                </small>

                <h2 className="fw-bold mb-1">
                  {analytics?.totalParcels ?? 0}
                </h2>

                <span className="badge bg-info text-dark">
                  Shipments
                </span>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div
                className="card p-3 h-100 dashboard-card dashboard-stat"
                style={cardStyle}
              >
                <small className="text-muted">
                  Delivered
                </small>

                <h2 className="fw-bold text-success mb-1">
                  {analytics?.deliveredParcels ?? 0}
                </h2>

                <span className="badge bg-success">
                  Completed
                </span>
              </div>
            </div>

            <div className="col-6 col-xl-3">
              <div
                className="card p-3 h-100 dashboard-card dashboard-stat"
                style={cardStyle}
              >
                <small className="text-muted">
                  Revenue
                </small>

                <h2 className="fw-bold mb-1">
                  ₹
                  {Number(
                    analytics?.totalRevenue ?? 0
                  ).toFixed(2)}
                </h2>

                <span className="badge bg-warning text-dark">
                  Total Revenue
                </span>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div
                className="card p-3 h-100 dashboard-card"
                style={cardStyle}
              >
                <div className="fs-2 mb-1">
                  👥
                </div>

                <h5 className="fw-bold mb-1">
                  Users
                </h5>

                <h3 className="text-primary mb-1">
                  {users.length}
                </h3>

                <small className="text-muted">
                  Registered users in the system.
                </small>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="card p-3 h-100 dashboard-card"
                style={cardStyle}
              >
                <div className="fs-2 mb-1">
                  🚚
                </div>

                <h5 className="fw-bold mb-1">
                  Delivery Agents
                </h5>

                <h3 className="text-info mb-1">
                  {analytics?.totalAgents ??
                    agents.length}
                </h3>

                <small className="text-muted">
                  Delivery agents registered in the system.
                </small>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="card p-3 h-100 dashboard-card"
                style={cardStyle}
              >
                <div className="fs-2 mb-1">
                  🏢
                </div>

                <h5 className="fw-bold mb-1">
                  Hubs
                </h5>

                <h3 className="text-success mb-1">
                  {hubs.length}
                </h3>

                <small className="text-muted">
                  Courier hubs currently available.
                </small>
              </div>
            </div>
          </div>

          <div
            className="card p-3 mb-3 dashboard-card"
            style={cardStyle}
          >
            <span className="badge bg-primary mb-1">
              OPERATIONS
            </span>

            <h4 className="fw-bold mb-3">
              Current System Overview
            </h4>

            <div className="row g-3">
              <div className="col-6 col-md-3">
                <div className="border rounded p-2">
                  <small className="text-muted">
                    Pending Parcels
                  </small>

                  <h3 className="fw-bold text-warning mb-0">
                    {analytics?.pendingParcels ?? 0}
                  </h3>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="border rounded p-2">
                  <small className="text-muted">
                    Available Agents
                  </small>

                  <h3 className="fw-bold text-success mb-0">
                    {analytics?.availableAgents ?? 0}
                  </h3>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="border rounded p-2">
                  <small className="text-muted">
                    Active Hubs
                  </small>

                  <h3 className="fw-bold text-info mb-0">
                    {
                      hubs.filter(
                        (hub) =>
                          hub.status?.toUpperCase() ===
                          "ACTIVE"
                      ).length
                    }
                  </h3>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="border rounded p-2">
                  <small className="text-muted">
                    System Role
                  </small>

                  <h5 className="fw-bold mb-0">
                    {role}
                  </h5>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <Link
                to="/notifications"
                className="text-decoration-none"
              >
                <div
                  className="card p-3 h-100 dashboard-card dashboard-link"
                  style={cardStyle}
                >
                  <div className="fs-2 mb-1">
                    🔔
                  </div>

                  <h6 className="fw-bold">
                    Notifications
                  </h6>

                  <p className="text-muted small mb-2">
                    View system notifications and shipment
                    activity.
                  </p>

                  <span className="text-primary fw-bold small">
                    View Notifications →
                  </span>
                </div>
              </Link>
            </div>

            {/* MANAGER ASSIGN PARCEL */}
            {role === "MANAGER" && (
              <div className="col-md-4">
                <Link
                  to="/assignments"
                  className="text-decoration-none"
                >
                  <div
                    className="card p-3 h-100 dashboard-card dashboard-link border-primary"
                    style={cardStyle}
                  >
                    <div className="fs-2 mb-1">
                      📦
                    </div>

                    <h6 className="fw-bold">
                      Parcel Assignments
                    </h6>

                    <p className="text-muted small mb-2">
                      Assign pending parcels to available
                      delivery agents.
                    </p>

                    <span className="text-primary fw-bold small">
                      Manage Assignments →
                    </span>
                  </div>
                </Link>
              </div>
            )}

            <div className="col-md-4">
              <div
                className="card p-3 h-100 dashboard-card"
                style={cardStyle}
              >
                <div className="fs-2 mb-1">
                  🤖
                </div>

                <h6 className="fw-bold">
                  AI Logistics
                </h6>

                <p className="text-muted small mb-2">
                  AI-powered delivery prediction is
                  available through the prediction system.
                </p>

                <Link
                  to="/prediction"
                  className="btn btn-outline-primary btn-sm"
                >
                  Open AI Prediction
                </Link>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="card p-3 h-100 dashboard-card"
                style={cardStyle}
              >
                <div className="fs-2 mb-1">
                  📦
                </div>

                <h6 className="fw-bold">
                  Parcel Operations
                </h6>

                <p className="text-muted small mb-2">
                  Total parcels currently managed by the
                  courier system.
                </p>

                <h3 className="fw-bold mb-0">
                  {analytics?.totalParcels ?? 0}
                </h3>
              </div>
            </div>

            {role === "ADMIN" && (
              <div className="col-md-4">
                <Link
                  to="/admin-management"
                  className="text-decoration-none"
                >
                  <div
                    className="card p-3 h-100 border-danger dashboard-card dashboard-link"
                    style={cardStyle}
                  >
                    <div className="fs-2 mb-1">
                      🛡️
                    </div>

                    <h6 className="fw-bold">
                      Admin Control Center
                    </h6>

                    <p className="text-muted small mb-2">
                      Manage users, agents, hubs,
                      assignments and system operations.
                    </p>

                    <span className="btn btn-danger btn-sm">
                      Open Admin Panel →
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;