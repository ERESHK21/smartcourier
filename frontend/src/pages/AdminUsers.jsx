import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role")?.toUpperCase();

    if (role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }

    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/users");

      setUsers(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Admin users error:", err);

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to view users."
        );
      } else {
        setError("Unable to load users.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const value = String(role || "").toUpperCase();

    if (value === "ADMIN") {
      return (
        <span className="badge bg-danger">
          ADMIN
        </span>
      );
    }

    if (value === "MANAGER") {
      return (
        <span className="badge bg-primary">
          MANAGER
        </span>
      );
    }

    if (value === "DELIVERY_AGENT") {
      return (
        <span className="badge bg-info text-dark">
          DELIVERY AGENT
        </span>
      );
    }

    return (
      <span className="badge bg-secondary">
        {value || "CUSTOMER"}
      </span>
    );
  };

  const adminCount = users.filter(
    (user) =>
      String(user.role).toUpperCase() === "ADMIN"
  ).length;

  const managerCount = users.filter(
    (user) =>
      String(user.role).toUpperCase() === "MANAGER"
  ).length;

  const customerCount = users.filter(
    (user) =>
      String(user.role).toUpperCase() === "CUSTOMER"
  ).length;

  const agentCount = users.filter(
    (user) =>
      String(user.role).toUpperCase() ===
      "DELIVERY_AGENT"
  ).length;

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3">
          Loading users...
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
              User Management 👥
            </h2>

            <p className="text-muted mb-0">
              View all registered SmartCourier users.
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
                Total Users
              </small>

              <h3 className="fw-bold text-primary mb-0">
                {users.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Customers
              </small>

              <h3 className="fw-bold text-secondary mb-0">
                {customerCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Managers
              </small>

              <h3 className="fw-bold text-primary mb-0">
                {managerCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Admins
              </small>

              <h3 className="fw-bold text-danger mb-0">
                {adminCount}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* User Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-1">
                Registered Users
              </h5>

              <small className="text-muted">
                Delivery Agents: {agentCount}
              </small>
            </div>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={loadUsers}
            >
              ↻ Refresh
            </button>
          </div>

          {users.length === 0 ? (
            <div className="alert alert-info text-center mb-0">
              No users found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">

                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>

                      <td>
                        <strong>
                          #{user.id}
                        </strong>
                      </td>

                      <td className="fw-semibold">
                        {user.name || "-"}
                      </td>

                      <td>
                        {user.email || "-"}
                      </td>

                      <td>
                        {user.phone || "-"}
                      </td>

                      <td>
                        {getRoleBadge(user.role)}
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

export default AdminUsers;