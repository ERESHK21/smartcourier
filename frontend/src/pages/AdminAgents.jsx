import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminAgents() {
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role")?.toUpperCase();

    if (role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }

    loadAgents();
  }, [navigate]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/agents");

      setAgents(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Admin agents error:", err);

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to view delivery agents."
        );
      } else {
        setError("Unable to load delivery agents.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "AVAILABLE") {
      return (
        <span className="badge bg-success">
          AVAILABLE
        </span>
      );
    }

    if (value === "BUSY") {
      return (
        <span className="badge bg-warning text-dark">
          BUSY
        </span>
      );
    }

    if (
      value === "OFFLINE" ||
      value === "INACTIVE"
    ) {
      return (
        <span className="badge bg-secondary">
          {value}
        </span>
      );
    }

    return (
      <span className="badge bg-info text-dark">
        {value || "UNKNOWN"}
      </span>
    );
  };

  const availableCount = agents.filter(
    (agent) =>
      String(agent.status || "").toUpperCase() ===
      "AVAILABLE"
  ).length;

  const busyCount = agents.filter(
    (agent) =>
      String(agent.status || "").toUpperCase() ===
      "BUSY"
  ).length;

  const otherCount =
    agents.length -
    availableCount -
    busyCount;

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3">
          Loading delivery agents...
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
              Delivery Agent Management 🚚
            </h2>

            <p className="text-muted mb-0">
              View delivery agents, vehicles and availability.
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
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="row g-3 mb-4">

        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Total Agents
              </small>

              <h3 className="fw-bold text-primary mb-0">
                {agents.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Available
              </small>

              <h3 className="fw-bold text-success mb-0">
                {availableCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Busy
              </small>

              <h3 className="fw-bold text-warning mb-0">
                {busyCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Other
              </small>

              <h3 className="fw-bold text-secondary mb-0">
                {otherCount}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* Agents Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              Delivery Agents
            </h5>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={loadAgents}
            >
              ↻ Refresh
            </button>
          </div>

          {agents.length === 0 ? (
            <div className="alert alert-info text-center mb-0">
              No delivery agents found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">

                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>Vehicle</th>
                    <th>City</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.id}>

                      <td>
                        <strong>
                          #{agent.id}
                        </strong>
                      </td>

                      <td>
                        {agent.userId ?? "-"}
                      </td>

                      <td className="fw-semibold">
                        {agent.vehicleNumber ||
                          agent.vehicle ||
                          "-"}
                      </td>

                      <td>
                        {agent.city || "-"}
                      </td>

                      <td>
                        {getStatusBadge(
                          agent.status
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default AdminAgents;