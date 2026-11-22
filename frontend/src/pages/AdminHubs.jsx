import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminHubs() {
  const navigate = useNavigate();

  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    hubName: "",
    city: "",
    address: "",
    contactNumber: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    const role = localStorage.getItem("role")?.toUpperCase();

    if (role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }

    loadHubs();
  }, [navigate]);

  const loadHubs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/hubs");

      setHubs(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Load hubs error:", err);

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to manage hubs."
        );
      } else {
        setError("Unable to load courier hubs.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.hubName.trim()) {
      setError("Hub name is required.");
      return;
    }

    if (!formData.city.trim()) {
      setError("City is required.");
      return;
    }

    if (!formData.address.trim()) {
      setError("Address is required.");
      return;
    }

    if (!formData.contactNumber.trim()) {
      setError("Contact number is required.");
      return;
    }

    try {
      setSaving(true);

      const hubData = {
        hubName: formData.hubName.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        contactNumber: formData.contactNumber.trim(),
        status: formData.status,
      };

      console.log("Creating hub:", hubData);

      await api.post("/api/hubs", hubData);

      setSuccess("Hub created successfully.");

      setFormData({
        hubName: "",
        city: "",
        address: "",
        contactNumber: "",
        status: "ACTIVE",
      });

      setShowForm(false);

      await loadHubs();
    } catch (err) {
      console.error("Create hub error:", err);
      console.error("Backend status:", err.response?.status);
      console.error("Backend response:", err.response?.data);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to create a hub."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to create hub."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const value = String(
      status || "ACTIVE"
    ).toUpperCase();

    if (value === "ACTIVE") {
      return (
        <span className="badge bg-success">
          ACTIVE
        </span>
      );
    }

    return (
      <span className="badge bg-secondary">
        {value}
      </span>
    );
  };

  const activeCount = hubs.filter(
    (hub) =>
      String(
        hub.status || "ACTIVE"
      ).toUpperCase() === "ACTIVE"
  ).length;

  const inactiveCount =
    hubs.length - activeCount;

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3">
          Loading courier hubs...
        </p>
      </div>
    );
  }

  return (
    <div className="container py-4">

      {/* Header */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body d-flex justify-content-between align-items-center gap-3">

          <div>
            <h2 className="fw-bold mb-1">
              Courier Hub Management 🏢
            </h2>

            <p className="text-muted mb-0">
              Add and manage courier hubs.
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

      {/* Messages */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Statistics */}
      <div className="row g-3 mb-4">

        <div className="col-6 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Total Hubs
              </small>

              <h3 className="fw-bold text-primary mb-0">
                {hubs.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Active Hubs
              </small>

              <h3 className="fw-bold text-success mb-0">
                {activeCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Inactive Hubs
              </small>

              <h3 className="fw-bold text-secondary mb-0">
                {inactiveCount}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* Manage Hubs */}
      <div className="card shadow-sm border-0 mb-4">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center">

            <div>
              <h5 className="fw-bold mb-1">
                Manage Hubs
              </h5>

              <small className="text-muted">
                Add a new courier hub to the system.
              </small>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                setShowForm(!showForm)
              }
            >
              {showForm
                ? "✕ Close"
                : "+ Add Hub"}
            </button>

          </div>

          {/* Add Hub Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mt-4"
            >

              <div className="row g-3">

                {/* Hub Name */}
                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Hub Name *
                  </label>

                  <input
                    type="text"
                    name="hubName"
                    value={formData.hubName}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Pune Central Hub"
                    required
                  />

                </div>

                {/* City */}
                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    City *
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Pune"
                    required
                  />

                </div>

                {/* Address */}
                <div className="col-md-8">

                  <label className="form-label fw-semibold">
                    Address *
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Wakad, Pune"
                    required
                  />

                </div>

                {/* Contact Number */}
                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    Contact Number *
                  </label>

                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="9876543210"
                    maxLength="15"
                    required
                  />

                </div>

                {/* Status */}
                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="ACTIVE">
                      ACTIVE
                    </option>

                    <option value="INACTIVE">
                      INACTIVE
                    </option>
                  </select>

                </div>

                {/* Button */}
                <div className="col-12">

                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={saving}
                  >
                    {saving
                      ? "Creating..."
                      : "Create Hub"}
                  </button>

                </div>

              </div>

            </form>
          )}

        </div>

      </div>

      {/* Existing Hubs */}
      <div className="card shadow-sm border-0">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h5 className="fw-bold mb-0">
              Courier Hubs
            </h5>

            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={loadHubs}
            >
              ↻ Refresh
            </button>

          </div>

          {hubs.length === 0 ? (

            <div className="alert alert-info text-center mb-0">
              No courier hubs found.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-dark">

                  <tr>
                    <th>ID</th>
                    <th>Hub Name</th>
                    <th>City</th>
                    <th>Address</th>
                    <th>Contact</th>
                    <th>Status</th>
                  </tr>

                </thead>

                <tbody>

                  {hubs.map((hub) => (

                    <tr key={hub.id}>

                      <td>
                        <strong>
                          #{hub.id}
                        </strong>
                      </td>

                      <td className="fw-semibold">
                        {hub.hubName || "-"}
                      </td>

                      <td>
                        {hub.city || "-"}
                      </td>

                      <td>
                        {hub.address || "-"}
                      </td>

                      <td>
                        {hub.contactNumber || "-"}
                      </td>

                      <td>
                        {getStatusBadge(
                          hub.status
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

export default AdminHubs;