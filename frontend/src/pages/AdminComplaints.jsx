import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/complaints");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setComplaints(data);
    } catch (err) {
      console.error("Load complaints error:", err);
      console.error("Status:", err.response?.status);
      console.error("Response:", err.response?.data);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to manage complaints."
        );
      } else {
        setError("Unable to load complaints.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage
      .getItem("role")
      ?.trim()
      .toUpperCase();

    if (role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }

    loadComplaints();
  }, [navigate]);

  const updateStatus = async (complaintId, newStatus) => {
    try {
      setUpdatingId(complaintId);
      setError("");
      setSuccess("");

      console.log(
        "Updating complaint:",
        complaintId,
        "to:",
        newStatus
      );

      /*
       * Backend endpoint:
       *
       * PUT /api/complaints/{id}/status?status=IN_PROGRESS
       *
       * We intentionally send the status as a query parameter
       * because that is what ComplaintController expects.
       */

      const response = await api.put(
        `/api/complaints/${complaintId}/status`,
        null,
        {
          params: {
            status: newStatus,
          },
        }
      );

      console.log(
        "Complaint update response:",
        response.data
      );

      setSuccess(
        `Complaint #${complaintId} updated to ${newStatus}.`
      );

      await loadComplaints();
    } catch (err) {
      console.error(
        "Update complaint error:",
        err
      );

      console.error(
        "HTTP status:",
        err.response?.status
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "Admin is not authorized to update complaints."
        );
      } else if (err.response?.status === 400) {
        setError(
          "Invalid complaint status sent to the server."
        );
      } else if (err.response?.status === 404) {
        setError(
          "Complaint was not found."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to update complaint."
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatus = (status) => {
    return String(status || "OPEN")
      .trim()
      .toUpperCase();
  };

  const getStatusBadge = (status) => {
    const value = getStatus(status);

    if (value === "RESOLVED") {
      return (
        <span className="badge bg-success">
          RESOLVED
        </span>
      );
    }

    if (value === "IN_PROGRESS") {
      return (
        <span className="badge bg-primary">
          IN PROGRESS
        </span>
      );
    }

    if (value === "CLOSED") {
      return (
        <span className="badge bg-secondary">
          CLOSED
        </span>
      );
    }

    return (
      <span className="badge bg-warning text-dark">
        OPEN
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleString("en-IN");
  };

  const totalComplaints = complaints.length;

  const openCount = complaints.filter(
    (complaint) =>
      getStatus(complaint.status) === "OPEN"
  ).length;

  const inProgressCount = complaints.filter(
    (complaint) =>
      getStatus(complaint.status) === "IN_PROGRESS"
  ).length;

  const resolvedCount = complaints.filter(
    (complaint) =>
      getStatus(complaint.status) === "RESOLVED"
  ).length;

  const closedCount = complaints.filter(
    (complaint) =>
      getStatus(complaint.status) === "CLOSED"
  ).length;

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3">
          Loading complaints...
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
              Complaint Management 📋
            </h2>

            <p className="text-muted mb-0">
              Review customer complaints and update their status.
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

      {/* Success */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Statistics */}
      <div className="row g-3 mb-4">

        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Total Complaints
              </small>

              <h3 className="fw-bold text-primary mb-0">
                {totalComplaints}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Open
              </small>

              <h3 className="fw-bold text-warning mb-0">
                {openCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                In Progress
              </small>

              <h3 className="fw-bold text-primary mb-0">
                {inProgressCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Resolved
              </small>

              <h3 className="fw-bold text-success mb-0">
                {resolvedCount}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* Complaints */}
      <div className="card shadow-sm border-0">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <div>
              <h5 className="fw-bold mb-1">
                Customer Complaints
              </h5>

              <small className="text-muted">
                Closed: {closedCount}
              </small>
            </div>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={loadComplaints}
            >
              ↻ Refresh
            </button>

          </div>

          {complaints.length === 0 ? (

            <div className="alert alert-info text-center mb-0">
              No complaints found.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>Parcel ID</th>
                    <th>Subject</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Manage</th>
                  </tr>
                </thead>

                <tbody>

                  {complaints.map(
                    (complaint) => {

                      const currentStatus =
                        getStatus(
                          complaint.status
                        );

                      const isUpdating =
                        updatingId === complaint.id;

                      return (
                        <tr
                          key={complaint.id}
                        >

                          <td>
                            <strong>
                              #{complaint.id}
                            </strong>
                          </td>

                          <td>
                            {complaint.userId ?? "-"}
                          </td>

                          <td>
                            {complaint.parcelId ?? "-"}
                          </td>

                          <td className="fw-semibold">
                            {complaint.subject || "-"}
                          </td>

                          <td
                            style={{
                              minWidth: "250px",
                              maxWidth: "400px",
                            }}
                          >
                            {complaint.description || "-"}
                          </td>

                          <td>
                            {getStatusBadge(
                              complaint.status
                            )}
                          </td>

                          <td>
                            {formatDate(
                              complaint.createdAt
                            )}
                          </td>

                          <td>

                            <div
                              className="d-flex flex-column gap-1"
                              style={{
                                minWidth: "160px",
                              }}
                            >

                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                disabled={
                                  isUpdating ||
                                  currentStatus ===
                                    "IN_PROGRESS"
                                }
                                onClick={() =>
                                  updateStatus(
                                    complaint.id,
                                    "IN_PROGRESS"
                                  )
                                }
                              >
                                {isUpdating &&
                                currentStatus !==
                                  "IN_PROGRESS"
                                  ? "Updating..."
                                  : "In Progress"}
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                disabled={
                                  isUpdating ||
                                  currentStatus ===
                                    "RESOLVED"
                                }
                                onClick={() =>
                                  updateStatus(
                                    complaint.id,
                                    "RESOLVED"
                                  )
                                }
                              >
                                Resolve
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                disabled={
                                  isUpdating ||
                                  currentStatus ===
                                    "CLOSED"
                                }
                                onClick={() =>
                                  updateStatus(
                                    complaint.id,
                                    "CLOSED"
                                  )
                                }
                              >
                                Close
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
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

export default AdminComplaints;