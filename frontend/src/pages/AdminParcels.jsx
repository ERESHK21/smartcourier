import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminParcels() {
  const navigate = useNavigate();

  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role")?.toUpperCase();

    if (role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }

    loadParcels();
  }, [navigate]);

  const loadParcels = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/parcels");

      setParcels(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Admin parcels error:", err);

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to view parcels."
        );
      } else {
        setError("Unable to load parcels.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "DELIVERED") {
      return (
        <span className="badge bg-success">
          DELIVERED
        </span>
      );
    }

    if (
      value === "IN_TRANSIT" ||
      value === "OUT_FOR_DELIVERY"
    ) {
      return (
        <span className="badge bg-primary">
          {value.replaceAll("_", " ")}
        </span>
      );
    }

    if (value === "CANCELLED") {
      return (
        <span className="badge bg-danger">
          CANCELLED
        </span>
      );
    }

    return (
      <span className="badge bg-warning text-dark">
        {value || "PENDING"}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const value = String(status || "").toUpperCase();

    if (
      value === "PAID" ||
      value === "SUCCESS"
    ) {
      return (
        <span className="badge bg-success">
          PAID
        </span>
      );
    }

    return (
      <span className="badge bg-warning text-dark">
        {value || "PENDING"}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN");
  };

  const deliveredCount = parcels.filter(
    (parcel) =>
      String(parcel.status).toUpperCase() ===
      "DELIVERED"
  ).length;

  const pendingCount = parcels.filter(
    (parcel) =>
      String(parcel.status).toUpperCase() !==
      "DELIVERED"
  ).length;

  const paidCount = parcels.filter((parcel) => {
    const status = String(
      parcel.paymentStatus || ""
    ).toUpperCase();

    return (
      status === "PAID" ||
      status === "SUCCESS"
    );
  }).length;

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3">
          Loading parcels...
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
              Parcel Management 📦
            </h2>

            <p className="text-muted mb-0">
              View and monitor all courier parcels.
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

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Total Parcels
              </small>

              <h3 className="fw-bold text-primary mb-0">
                {parcels.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Delivered
              </small>

              <h3 className="fw-bold text-success mb-0">
                {deliveredCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Pending / Active
              </small>

              <h3 className="fw-bold text-warning mb-0">
                {pendingCount}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <small className="text-muted">
                Paid Parcels
              </small>

              <h3 className="fw-bold text-success mb-0">
                {paidCount}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* Parcel Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              All Parcels
            </h5>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={loadParcels}
            >
              ↻ Refresh
            </button>
          </div>

          {parcels.length === 0 ? (
            <div className="alert alert-info text-center mb-0">
              No parcels found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">

                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Tracking ID</th>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Type</th>
                    <th>Weight</th>
                    <th>Charge</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Booking Date</th>
                  </tr>
                </thead>

                <tbody>
                  {parcels.map((parcel) => (
                    <tr key={parcel.id}>

                      <td>
                        <strong>
                          #{parcel.id}
                        </strong>
                      </td>

                      <td>
                        <span className="fw-semibold">
                          {parcel.trackingId || "-"}
                        </span>
                      </td>

                      <td>
                        {parcel.senderName || "-"}
                      </td>

                      <td>
                        {parcel.receiverName || "-"}
                      </td>

                      <td>
                        {parcel.deliveryType || "-"}
                      </td>

                      <td>
                        {parcel.weight ?? "-"} kg
                      </td>

                      <td>
                        ₹
                        {Number(
                          parcel.deliveryCharge || 0
                        ).toFixed(2)}
                      </td>

                      <td>
                        {getStatusBadge(
                          parcel.status
                        )}
                      </td>

                      <td>
                        {getPaymentBadge(
                          parcel.paymentStatus
                        )}
                      </td>

                      <td>
                        {formatDate(
                          parcel.bookingDate
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

export default AdminParcels;