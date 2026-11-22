import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminAnalytics() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role")?.toUpperCase();

    if (role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }

    loadAnalytics();
  }, [navigate]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        api.get("/api/analytics"),
        api.get("/api/hubs"),
      ]);

      if (results[0].status === "fulfilled") {
        setAnalytics(results[0].value.data);
      }

      if (results[1].status === "fulfilled") {
        const hubData = results[1].value.data;

        setHubs(
          Array.isArray(hubData)
            ? hubData
            : []
        );
      }

      if (
        results[0].status === "rejected" &&
        results[1].status === "rejected"
      ) {
        setError("Unable to load analytics data.");
      }
    } catch (err) {
      console.error(
        "Admin analytics error:",
        err
      );

      setError(
        "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  const totalUsers =
    analytics?.totalUsers ?? 0;

  const totalParcels =
    analytics?.totalParcels ?? 0;

  const deliveredParcels =
    analytics?.deliveredParcels ?? 0;

  const pendingParcels =
    analytics?.pendingParcels ?? 0;

  const totalAgents =
    analytics?.totalAgents ?? 0;

  const availableAgents =
    analytics?.availableAgents ?? 0;

  const totalHubs =
    hubs.length > 0
      ? hubs.length
      : analytics?.totalHubs ?? 0;

  const totalRevenue =
    Number(analytics?.totalRevenue || 0);

  const deliveryCompletion =
    totalParcels > 0
      ? (
          (deliveredParcels /
            totalParcels) *
          100
        ).toFixed(1)
      : "0.0";

  const agentAvailability =
    totalAgents > 0
      ? (
          (availableAgents /
            totalAgents) *
          100
        ).toFixed(1)
      : "0.0";

  const averageRevenue =
    totalParcels > 0
      ? (
          totalRevenue /
          totalParcels
        ).toFixed(2)
      : "0.00";

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-3">
          Loading analytics...
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
              System Analytics 📊
            </h2>

            <p className="text-muted mb-0">
              Monitor SmartCourier system performance.
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

      {/* Main Statistics */}
      <div className="row g-4">

        {/* Users */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="fs-2 mb-2">
                👥
              </div>

              <small className="text-muted">
                Total Users
              </small>

              <h2 className="fw-bold text-primary">
                {totalUsers}
              </h2>
            </div>
          </div>
        </div>

        {/* Parcels */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="fs-2 mb-2">
                📦
              </div>

              <small className="text-muted">
                Total Parcels
              </small>

              <h2 className="fw-bold text-info">
                {totalParcels}
              </h2>
            </div>
          </div>
        </div>

        {/* Delivered */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="fs-2 mb-2">
                ✅
              </div>

              <small className="text-muted">
                Delivered Parcels
              </small>

              <h2 className="fw-bold text-success">
                {deliveredParcels}
              </h2>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="fs-2 mb-2">
                ⏳
              </div>

              <small className="text-muted">
                Pending Parcels
              </small>

              <h2 className="fw-bold text-warning">
                {pendingParcels}
              </h2>
            </div>
          </div>
        </div>

        {/* Agents */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="fs-2 mb-2">
                🚚
              </div>

              <small className="text-muted">
                Total Agents
              </small>

              <h2 className="fw-bold text-dark">
                {totalAgents}
              </h2>
            </div>
          </div>
        </div>

        {/* Available Agents */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="fs-2 mb-2">
                🟢
              </div>

              <small className="text-muted">
                Available Agents
              </small>

              <h2 className="fw-bold text-success">
                {availableAgents}
              </h2>
            </div>
          </div>
        </div>

        {/* Hubs */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="fs-2 mb-2">
                🏢
              </div>

              <small className="text-muted">
                Total Hubs
              </small>

              <h2 className="fw-bold text-primary">
                {totalHubs}
              </h2>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="fs-2 mb-2">
                💰
              </div>

              <small className="text-muted">
                Total Revenue
              </small>

              <h2 className="fw-bold text-success">
                ₹{totalRevenue.toFixed(2)}
              </h2>
            </div>
          </div>
        </div>

      </div>

      {/* Performance Summary */}
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              Performance Summary
            </h5>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={loadAnalytics}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="row g-3">

            {/* Delivery Completion */}
            <div className="col-md-4">
              <div className="border rounded p-3 bg-white">
                <small className="text-secondary">
                  Delivery Completion
                </small>

                <h3 className="fw-bold text-success mb-0 mt-1">
                  {deliveryCompletion}%
                </h3>

                <small className="text-secondary">
                  {deliveredParcels} of{" "}
                  {totalParcels} parcels delivered
                </small>
              </div>
            </div>

            {/* Agent Availability */}
            <div className="col-md-4">
              <div className="border rounded p-3 bg-white">
                <small className="text-secondary">
                  Agent Availability
                </small>

                <h3 className="fw-bold text-primary mb-0 mt-1">
                  {agentAvailability}%
                </h3>

                <small className="text-secondary">
                  {availableAgents} of{" "}
                  {totalAgents} agents available
                </small>
              </div>
            </div>

            {/* Average Revenue */}
            <div className="col-md-4">
              <div className="border rounded p-3 bg-white">
                <small className="text-secondary">
                  Average Revenue / Parcel
                </small>

                <h3 className="fw-bold text-success mb-0 mt-1">
                  ₹{averageRevenue}
                </h3>

                <small className="text-secondary">
                  Based on total courier revenue
                </small>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

export default AdminAnalytics;