import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function ParcelTracking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [trackingId, setTrackingId] = useState("");
  const [parcel, setParcel] = useState(null);
  const [myParcels, setMyParcels] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingParcels, setLoadingParcels] = useState(false);

  useEffect(() => {
    const loadMyParcels = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) return;

      try {
        setLoadingParcels(true);

        const response = await api.get(
          `/api/parcels/user/${userId}`
        );

        const data = Array.isArray(response.data)
          ? response.data
          : [];

        setMyParcels(data);
      } catch (err) {
        console.error("Unable to load parcels:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("email");
          localStorage.removeItem("role");
          navigate("/login");
        }
      } finally {
        setLoadingParcels(false);
      }
    };

    loadMyParcels();
  }, [navigate]);

  const trackParcel = async (id) => {
    const cleanId = id.trim().toUpperCase();

    if (!cleanId) {
      setError("Please enter or select a tracking ID.");
      setParcel(null);
      return;
    }

    setParcel(null);
    setError("");
    setLoading(true);

    try {
      const response = await api.get(
        `/api/parcels/tracking/${encodeURIComponent(cleanId)}`
      );

      setParcel(response.data);
      setTrackingId(cleanId);
    } catch (err) {
      console.error("Tracking error:", err);
      setParcel(null);

      if (err.response?.status === 404) {
        setError(
          "Parcel not found. Please check your tracking ID."
        );
      } else if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

        setError(
          "Your session has expired. Please login again."
        );

        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to track this parcel."
        );
      } else if (!err.response) {
        setError(
          "Unable to connect to the Smart Courier server."
        );
      } else {
        setError(
          "Unable to track parcel. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlTrackingId = searchParams.get("trackingId");

    if (urlTrackingId) {
      const cleanId = urlTrackingId.trim().toUpperCase();
      setTrackingId(cleanId);
      trackParcel(cleanId);
    }
  }, [searchParams]);

  const handleParcelSelect = (e) => {
    const selectedTrackingId = e.target.value;

    setTrackingId(selectedTrackingId);
    setError("");

    if (!selectedTrackingId) {
      setParcel(null);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    await trackParcel(trackingId);
  };

  const getStatusInfo = (status) => {
    const value = status?.toUpperCase();

    if (value === "DELIVERED") {
      return {
        icon: "✅",
        title: "Delivered",
        text: "Your parcel has been successfully delivered.",
        color: "#198754",
      };
    }

    if (value === "OUT_FOR_DELIVERY") {
      return {
        icon: "🚚",
        title: "Out for Delivery",
        text: "Your parcel is out for delivery.",
        color: "#0d6efd",
      };
    }

    if (value === "IN_TRANSIT") {
      return {
        icon: "🚛",
        title: "In Transit",
        text: "Your parcel is currently on the way.",
        color: "#0d6efd",
      };
    }

    if (value === "PICKED_UP") {
      return {
        icon: "📦",
        title: "Picked Up",
        text: "Your parcel has been picked up.",
        color: "#0d6efd",
      };
    }

    return {
      icon: "⏳",
      title: "Booked",
      text: "Your parcel booking has been confirmed.",
      color: "#ffc107",
    };
  };

  const getStepStatus = (step) => {
    const status = parcel?.status?.toUpperCase();

    const order = {
      BOOKED: 1,
      PICKED_UP: 2,
      IN_TRANSIT: 3,
      OUT_FOR_DELIVERY: 4,
      DELIVERED: 5,
    };

    return (order[status] || 0) >= step;
  };

  const statusInfo = parcel
    ? getStatusInfo(parcel.status)
    : null;

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString();
  };

  const cardStyle = {
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "16px",
  };

  return (
    <div className="container py-3 py-md-4">
      <style>{`
        .tracking-card {
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .tracking-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0,0,0,.16);
        }

        .tracking-icon {
          animation: trackingFloat 3s ease-in-out infinite;
        }

        .status-icon {
          animation: statusFloat 2.5s ease-in-out infinite;
        }

        .step-circle {
          transition: all .25s ease;
        }

        .step-circle:hover {
          transform: scale(1.08);
        }

        .tracking-input {
          transition: box-shadow .2s ease, border-color .2s ease;
        }

        .tracking-input:focus {
          box-shadow: 0 0 0 4px rgba(13,110,253,.12);
        }

        .result-card {
          animation: resultIn .45s ease both;
        }

        .empty-card {
          animation: resultIn .5s ease both;
        }

        @keyframes trackingFloat {
          0%,100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes statusFloat {
          0%,100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-6px) scale(1.03);
          }
        }

        @keyframes resultIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .tracking-heading {
            font-size: 2rem;
          }

          .status-icon-large {
            font-size: 60px !important;
          }
        }
      `}</style>

      {/* HEADER */}
      <div className="text-center mb-3">
        <span className="badge bg-primary px-3 py-2 mb-2">
          📍 LIVE PARCEL TRACKING
        </span>

        <h1 className="display-6 fw-bold tracking-heading mb-1">
          Track Your Parcel
        </h1>

        <p
          className="text-muted mx-auto mb-0"
          style={{ maxWidth: "620px" }}
        >
          Enter your tracking ID to see your shipment
          status, delivery information and progress.
        </p>
      </div>

      {/* SEARCH */}
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div
            className="card p-3 p-md-4 mb-3 tracking-card"
            style={{
              ...cardStyle,
              background:
                "linear-gradient(135deg,rgba(13,110,253,.10),rgba(102,16,242,.08))",
            }}
          >
            <div className="text-center mb-3">
              <div
                className="tracking-icon mb-1"
                style={{
                  fontSize: "48px",
                  filter:
                    "drop-shadow(0 0 18px rgba(0,217,255,.35))",
                }}
              >
                🔎
              </div>

              <h3 className="fw-bold mb-1">
                Find Your Shipment
              </h3>

              <p className="text-muted small mb-0">
                Select one of your parcels or enter a
                tracking ID manually.
              </p>
            </div>

            <form onSubmit={handleTrack}>
              <label className="form-label fw-bold mb-1">
                Tracking ID
              </label>

              <div className="input-group input-group-lg mb-2">
                <span className="input-group-text bg-dark text-white border-secondary">
                  📦
                </span>

                <input
                  type="text"
                  className="form-control tracking-input"
                  placeholder="Example: TRK-2B7ED117"
                  value={trackingId}
                  onChange={(e) =>
                    setTrackingId(
                      e.target.value.toUpperCase()
                    )
                  }
                  required
                />

                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                      Searching...
                    </>
                  ) : (
                    "Track Parcel"
                  )}
                </button>
              </div>

              <label className="form-label fw-bold mt-2 mb-1">
                📦 Select From Your Parcels
              </label>

              <select
                className="form-select"
                value={trackingId}
                onChange={handleParcelSelect}
                disabled={
                  loadingParcels ||
                  myParcels.length === 0
                }
              >
                <option value="">
                  {loadingParcels
                    ? "Loading your parcels..."
                    : myParcels.length === 0
                    ? "No parcels available"
                    : "Choose a parcel to track"}
                </option>

                {myParcels.map((item) => (
                  <option
                    key={item.id}
                    value={item.trackingId}
                  >
                    {item.trackingId} —{" "}
                    {item.status || "UNKNOWN"}
                  </option>
                ))}
              </select>

              <small className="text-muted d-block mt-1">
                Select a parcel from your bookings and
                click "Track Parcel".
              </small>
            </form>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="alert alert-danger text-center py-2 mb-3">
              ⚠️ {error}
            </div>
          </div>
        </div>
      )}

      {/* RESULT */}
      {parcel && statusInfo && (
        <div className="result-card">
          {/* STATUS + DETAILS */}
          <div className="row g-3">
            {/* STATUS */}
            <div className="col-lg-4">
              <div
                className="card p-3 h-100 text-center tracking-card"
                style={{
                  ...cardStyle,
                  background: `linear-gradient(145deg, ${statusInfo.color}18, rgba(255,255,255,.04))`,
                }}
              >
                <div
                  className="status-icon status-icon-large"
                  style={{
                    fontSize: "70px",
                    filter: `drop-shadow(0 0 20px ${statusInfo.color}66)`,
                  }}
                >
                  {statusInfo.icon}
                </div>

                <span
                  className={`badge ${
                    parcel.status?.toUpperCase() ===
                    "DELIVERED"
                      ? "bg-success"
                      : parcel.status?.toUpperCase() ===
                        "BOOKED"
                      ? "bg-warning text-dark"
                      : "bg-primary"
                  } mx-auto px-3 py-2`}
                >
                  {parcel.status}
                </span>

                <h3 className="fw-bold mt-2 mb-1">
                  {statusInfo.title}
                </h3>

                <p className="text-muted small mb-2">
                  {statusInfo.text}
                </p>

                <hr className="my-2" />

                <small className="text-muted">
                  Tracking ID
                </small>

                <h5 className="fw-bold mt-1 mb-0">
                  {parcel.trackingId}
                </h5>
              </div>
            </div>

            {/* DETAILS */}
            <div className="col-lg-8">
              <div
                className="card p-3 h-100 tracking-card"
                style={cardStyle}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span className="badge bg-primary mb-1">
                      SHIPMENT DETAILS
                    </span>

                    <h3 className="fw-bold mb-0">
                      Parcel Information
                    </h3>
                  </div>

                  <span className="badge bg-secondary">
                    #{parcel.id}
                  </span>
                </div>

                <div className="row g-2">
                  <div className="col-md-6">
                    <div className="p-2 rounded border border-secondary h-100">
                      <small className="text-muted">
                        Sender
                      </small>

                      <h6 className="fw-bold mt-1 mb-0">
                        👤 {parcel.senderName || "-"}
                      </h6>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-2 rounded border border-secondary h-100">
                      <small className="text-muted">
                        Receiver
                      </small>

                      <h6 className="fw-bold mt-1 mb-0">
                        👤 {parcel.receiverName || "-"}
                      </h6>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-2 rounded border border-secondary h-100">
                      <small className="text-muted">
                        Pickup Address
                      </small>

                      <p className="fw-bold mt-1 mb-0 small">
                        📍 {parcel.pickupAddress || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-2 rounded border border-secondary h-100">
                      <small className="text-muted">
                        Delivery Address
                      </small>

                      <p className="fw-bold mt-1 mb-0 small">
                        🏠 {parcel.deliveryAddress || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="p-2 rounded border border-secondary text-center">
                      <small className="text-muted">
                        Weight
                      </small>

                      <h6 className="fw-bold mt-1 mb-0">
                        ⚖️ {parcel.weight ?? 0} kg
                      </h6>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="p-2 rounded border border-secondary text-center">
                      <small className="text-muted">
                        Delivery Type
                      </small>

                      <h6 className="fw-bold mt-1 mb-0">
                        {parcel.deliveryType || "-"}
                      </h6>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="p-2 rounded border border-secondary text-center">
                      <small className="text-muted">
                        Charge
                      </small>

                      <h6 className="fw-bold mt-1 mb-0">
                        ₹
                        {Number(
                          parcel.deliveryCharge || 0
                        ).toFixed(2)}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PROGRESS */}
          <div
            className="card p-3 p-md-4 mt-3 tracking-card"
            style={cardStyle}
          >
            <div className="text-center mb-3">
              <span className="badge bg-primary mb-1">
                DELIVERY JOURNEY
              </span>

              <h3 className="fw-bold mb-1">
                Shipment Progress
              </h3>

              <p className="text-muted small mb-0">
                Follow your parcel from booking to final
                delivery.
              </p>
            </div>

            <div className="row text-center g-2">
              {[
                {
                  step: 1,
                  title: "Booked",
                  text: "Shipment created",
                  icon: "📦",
                },
                {
                  step: 2,
                  title: "Picked Up",
                  text: "Parcel collected",
                  icon: "🤝",
                },
                {
                  step: 3,
                  title: "In Transit",
                  text: "On the way",
                  icon: "🚛",
                },
                {
                  step: 4,
                  title: "Out for Delivery",
                  text: "Final journey",
                  icon: "🚚",
                },
                {
                  step: 5,
                  title: "Delivered",
                  text: "Shipment complete",
                  icon: "🏠",
                },
              ].map((item) => (
                <div
                  className="col-6 col-md"
                  key={item.step}
                >
                  <div
                    className={`step-circle rounded-circle ${
                      getStepStatus(item.step)
                        ? "bg-success"
                        : "bg-secondary"
                    } text-white mx-auto d-flex align-items-center justify-content-center`}
                    style={{
                      width: "52px",
                      height: "52px",
                      boxShadow: getStepStatus(item.step)
                        ? "0 0 18px rgba(25,135,84,.35)"
                        : "none",
                    }}
                  >
                    {getStepStatus(item.step)
                      ? "✓"
                      : item.icon}
                  </div>

                  <h6 className="fw-bold mt-2 mb-0">
                    {item.title}
                  </h6>

                  <small className="text-muted">
                    {item.text}
                  </small>
                </div>
              ))}
            </div>

            <hr className="my-3" />

            <div className="row text-center g-2">
              <div className="col-md-4">
                <small className="text-muted">
                  Booking Date
                </small>

                <div className="fw-bold mt-1 small">
                  {formatDate(parcel.bookingDate)}
                </div>
              </div>

              <div className="col-md-4">
                <small className="text-muted">
                  Current Status
                </small>

                <div className="fw-bold mt-1">
                  {parcel.status}
                </div>
              </div>

              <div className="col-md-4">
                <small className="text-muted">
                  Tracking Number
                </small>

                <div className="fw-bold mt-1">
                  {parcel.trackingId}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!parcel && !error && !loading && (
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div
              className="card p-3 p-md-4 text-center empty-card tracking-card"
              style={{
                ...cardStyle,
                background:
                  "linear-gradient(135deg,rgba(13,110,253,.08),rgba(102,16,242,.08))",
              }}
            >
              <div
                className="tracking-icon"
                style={{
                  fontSize: "65px",
                  filter:
                    "drop-shadow(0 0 20px rgba(0,217,255,.25))",
                }}
              >
                🚚
              </div>

              <h3 className="fw-bold mt-2 mb-1">
                Where is your parcel?
              </h3>

              <p className="text-muted mb-0">
                Select one of your parcels above or enter a
                tracking ID to see the latest shipment
                information.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParcelTracking;