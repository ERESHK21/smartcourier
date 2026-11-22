import { useEffect, useState } from "react";
import api from "../services/api";
import LoadingScreen from "../components/LoadingScreen";

function DeliveryPrediction() {
  const [parcels, setParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState("");
  const [distance, setDistance] = useState("");
  const [hubDelay, setHubDelay] = useState("0");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchParcels();
  }, []);

  const fetchParcels = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = localStorage.getItem("userId");
      const role = (
        localStorage.getItem("role") || "CUSTOMER"
      ).toUpperCase();

      if (!userId) {
        setError(
          "User information not found. Please login again."
        );
        return;
      }

      let response;

      if (role === "CUSTOMER") {
        response = await api.get(
          `/api/parcels/user/${userId}`
        );
      } else {
        response = await api.get("/api/parcels");
      }

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setParcels(data);

      if (data.length > 0) {
        setSelectedParcel(String(data[0].id));
      }
    } catch (err) {
      console.error(
        "Error fetching parcels:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        window.location.href = "/login";
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to view these parcels."
        );
      } else if (!err.response) {
        setError(
          "Unable to connect to the Smart Courier server."
        );
      } else {
        setError(
          "Unable to load your parcels. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrediction = async (event) => {
    event.preventDefault();

    setError("");
    setPrediction(null);

    if (!selectedParcel) {
      setError("Please select a parcel.");
      return;
    }

    if (!distance || Number(distance) <= 0) {
      setError(
        "Please enter a valid delivery distance."
      );
      return;
    }

    if (Number(hubDelay) < 0) {
      setError("Hub delay cannot be negative.");
      return;
    }

    try {
      setPredicting(true);

      const response = await api.post(
        `/api/prediction/parcel/${selectedParcel}`,
        {
          distance: Number(distance),
          hubDelay: Number(hubDelay),
        }
      );

      setPrediction(response.data);
    } catch (err) {
      console.error(
        "Prediction error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        window.location.href = "/login";
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to predict this parcel."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to predict delivery time."
        );
      }
    } finally {
      setPredicting(false);
    }
  };

  const selectedParcelData = parcels.find(
    (parcel) =>
      String(parcel.id) === String(selectedParcel)
  );

  if (loading) {
    return (
      <div className="container py-3 py-md-4">
        <LoadingScreen text="Loading AI prediction..." />
      </div>
    );
  }

  return (
    <div className="container py-3 py-md-4">
      <style>{`
        .prediction-card {
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .prediction-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0,0,0,.16);
        }

        .ai-robot {
          animation: aiFloat 3s ease-in-out infinite;
          filter: drop-shadow(0 0 25px rgba(0,217,255,.4));
        }

        .ai-icon {
          animation: aiPulse 2.5s ease-in-out infinite;
        }

        .prediction-result {
          animation: resultIn .45s ease both;
        }

        .input-focus:focus {
          box-shadow: 0 0 0 4px rgba(13,110,253,.12);
        }

        .feature-item {
          transition: transform .2s ease;
        }

        .feature-item:hover {
          transform: translateX(4px);
        }

        .result-number {
          animation: numberIn .5s ease both;
        }

        @keyframes aiFloat {
          0%,100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(2deg);
          }
        }

        @keyframes aiPulse {
          0%,100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }

        @keyframes resultIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes numberIn {
          from {
            opacity: 0;
            transform: scale(.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 768px) {
          .prediction-title {
            font-size: 2rem;
          }

          .ai-robot {
            font-size: 65px !important;
          }
        }
      `}</style>

      {/* HERO */}
      <div
        className="card p-3 p-md-4 mb-3 prediction-card"
        style={{
          background:
            "linear-gradient(135deg,rgba(13,110,253,.16),rgba(102,16,242,.14),rgba(0,217,255,.06))",
          border:
            "1px solid rgba(0,217,255,.18)",
        }}
      >
        <div className="row align-items-center">
          <div className="col-lg-8">
            <span className="badge bg-primary mb-2">
              AI DELIVERY PREDICTION
            </span>

            <h1 className="display-6 fw-bold prediction-title mb-1">
              Predict Your Delivery Time 🤖
            </h1>

            <p className="text-muted mb-0">
              Our Random Forest machine learning model
              estimates how many days your parcel may take
              to reach its destination.
            </p>
          </div>

          <div className="col-lg-4 text-center mt-3 mt-lg-0">
            <div
              className="ai-robot"
              style={{
                fontSize: "75px",
                lineHeight: 1,
              }}
            >
              🤖
            </div>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger py-2 mb-3">
          ⚠️ {error}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="row g-3">
        {/* FORM */}
        <div className="col-lg-7">
          <div
            className="card p-3 p-md-4 h-100 prediction-card"
          >
            <div className="mb-3">
              <span className="badge bg-primary mb-1">
                PREDICTION INPUT
              </span>

              <h3 className="fw-bold mb-1">
                Enter Delivery Details
              </h3>

              <p className="text-muted small mb-0">
                Select your parcel and provide the delivery
                information.
              </p>
            </div>

            <form onSubmit={handlePrediction}>
              {/* PARCEL */}
              <div className="mb-3">
                <label className="form-label fw-semibold mb-1">
                  Select Parcel
                </label>

                <select
                  className="form-select"
                  value={selectedParcel}
                  onChange={(e) => {
                    setSelectedParcel(
                      e.target.value
                    );
                    setPrediction(null);
                    setError("");
                  }}
                  disabled={parcels.length === 0}
                >
                  {parcels.length === 0 ? (
                    <option value="">
                      No parcels available
                    </option>
                  ) : (
                    <>
                      <option value="">
                        Choose a parcel
                      </option>

                      {parcels.map((parcel) => (
                        <option
                          key={parcel.id}
                          value={parcel.id}
                        >
                          {parcel.trackingId} —{" "}
                          {parcel.deliveryType} —{" "}
                          {parcel.status}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* DISTANCE */}
              <div className="mb-3">
                <label className="form-label fw-semibold mb-1">
                  Delivery Distance
                </label>

                <div className="input-group">
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    className="form-control input-focus"
                    placeholder="Example: 75"
                    value={distance}
                    onChange={(e) =>
                      setDistance(e.target.value)
                    }
                  />

                  <span className="input-group-text">
                    km
                  </span>
                </div>

                <small className="text-muted">
                  Approximate distance between pickup and
                  delivery location.
                </small>
              </div>

              {/* HUB DELAY */}
              <div className="mb-3">
                <label className="form-label fw-semibold mb-1">
                  Expected Hub Delay
                </label>

                <div className="input-group">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="form-control input-focus"
                    value={hubDelay}
                    onChange={(e) =>
                      setHubDelay(e.target.value)
                    }
                  />

                  <span className="input-group-text">
                    days
                  </span>
                </div>

                <small className="text-muted">
                  Enter 0 if there is no expected hub delay.
                </small>
              </div>

              {/* SELECTED PARCEL */}
              {selectedParcelData && (
                <div
                  className="p-3 mb-3 rounded-3"
                  style={{
                    background:
                      "rgba(255,255,255,.05)",
                    border:
                      "1px solid rgba(255,255,255,.1)",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Selected Parcel</strong>
                    <span className="badge bg-primary">
                      #{selectedParcelData.id}
                    </span>
                  </div>

                  <div className="row g-2">
                    <div className="col-sm-6">
                      <small className="text-muted">
                        Tracking ID
                      </small>

                      <div className="fw-bold">
                        {selectedParcelData.trackingId}
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <small className="text-muted">
                        Delivery Type
                      </small>

                      <div className="fw-bold">
                        {selectedParcelData.deliveryType}
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <small className="text-muted">
                        Parcel Weight
                      </small>

                      <div className="fw-bold">
                        {selectedParcelData.weight} kg
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <small className="text-muted">
                        Current Status
                      </small>

                      <div className="fw-bold">
                        {selectedParcelData.status}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                className="btn btn-primary w-100 py-2"
                disabled={
                  predicting ||
                  parcels.length === 0 ||
                  !selectedParcel
                }
              >
                {predicting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    AI is calculating...
                  </>
                ) : (
                  <>
                    🤖 Predict Delivery Time
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* AI INFORMATION */}
        <div className="col-lg-5">
          <div
            className="card p-3 mb-3 prediction-card"
          >
            <div className="d-flex align-items-center gap-3 mb-2">
              <div
                className="ai-icon d-flex align-items-center justify-content-center"
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg,#0d6efd,#6610f2)",
                  fontSize: "25px",
                }}
              >
                🧠
              </div>

              <div>
                <h5 className="fw-bold mb-0">
                  Random Forest AI
                </h5>

                <small className="text-success">
                  ● Model Available
                </small>
              </div>
            </div>

            <p className="text-muted small mb-2">
              The system uses a Random Forest machine
              learning model trained with historical
              delivery data.
            </p>

            <hr className="my-2" />

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">
                Model
              </span>

              <span className="fw-bold">
                Random Forest
              </span>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">
                Input
              </span>

              <span className="fw-bold">
                4 Features
              </span>
            </div>

            <div className="d-flex justify-content-between">
              <span className="text-muted">
                Output
              </span>

              <span className="fw-bold">
                Delivery Days
              </span>
            </div>
          </div>

          {/* FEATURES */}
          <div
            className="card p-3 prediction-card"
          >
            <h5 className="fw-bold mb-3">
              What affects the prediction?
            </h5>

            <div className="feature-item d-flex gap-3 mb-3">
              <div className="fs-4">⚖️</div>

              <div>
                <strong>Weight</strong>

                <p className="text-muted small mb-0">
                  Heavier parcels may require different
                  transportation handling.
                </p>
              </div>
            </div>

            <div className="feature-item d-flex gap-3 mb-3">
              <div className="fs-4">📍</div>

              <div>
                <strong>Distance</strong>

                <p className="text-muted small mb-0">
                  Longer delivery routes can increase
                  estimated delivery time.
                </p>
              </div>
            </div>

            <div className="feature-item d-flex gap-3 mb-3">
              <div className="fs-4">🚀</div>

              <div>
                <strong>Delivery Type</strong>

                <p className="text-muted small mb-0">
                  Express and standard deliveries have
                  different expected timelines.
                </p>
              </div>
            </div>

            <div className="feature-item d-flex gap-3">
              <div className="fs-4">🏢</div>

              <div>
                <strong>Hub Delay</strong>

                <p className="text-muted small mb-0">
                  Additional hub delays can affect the
                  final prediction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESULT */}
      {prediction && (
        <div
          className="card mt-3 p-3 p-md-4 text-center prediction-card prediction-result"
          style={{
            background:
              "linear-gradient(135deg,rgba(25,135,84,.15),rgba(0,217,255,.08))",
            border:
              "1px solid rgba(25,135,84,.3)",
          }}
        >
          <div
            className="status-icon"
            style={{
              fontSize: "60px",
              filter:
                "drop-shadow(0 0 20px rgba(0,217,255,.3))",
            }}
          >
            🚚
          </div>

          <span className="badge bg-success mb-2">
            AI PREDICTION COMPLETE
          </span>

          <h3 className="fw-bold mb-0">
            Estimated Delivery Time
          </h3>

          <div
            className="result-number display-2 fw-bold my-1"
            style={{
              color: "#00d9ff",
              textShadow:
                "0 0 25px rgba(0,217,255,.35)",
            }}
          >
            {prediction.predictedDeliveryDays}
          </div>

          <h6 className="text-muted mb-3">
            day
            {Number(
              prediction.predictedDeliveryDays
            ) !== 1
              ? "s"
              : ""}
          </h6>

          <div className="row justify-content-center g-3">
            <div className="col-md-3">
              <small className="text-muted">
                Tracking ID
              </small>

              <div className="fw-bold mt-1">
                {prediction.trackingId}
              </div>
            </div>

            <div className="col-md-3">
              <small className="text-muted">
                Delivery Type
              </small>

              <div className="fw-bold mt-1">
                {prediction.deliveryType}
              </div>
            </div>

            <div className="col-md-3">
              <small className="text-muted">
                Distance
              </small>

              <div className="fw-bold mt-1">
                {distance} km
              </div>
            </div>

            <div className="col-md-3">
              <small className="text-muted">
                Hub Delay
              </small>

              <div className="fw-bold mt-1">
                {hubDelay} days
              </div>
            </div>
          </div>

          <p className="text-muted small mt-3 mb-0">
            This is an AI-based estimate and actual
            delivery time may vary depending on operational
            conditions.
          </p>
        </div>
      )}
    </div>
  );
}

export default DeliveryPrediction;