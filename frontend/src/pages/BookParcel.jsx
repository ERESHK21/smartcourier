import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function BookParcel() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    senderName: "",
    receiverName: "",
    pickupAddress: "",
    deliveryAddress: "",
    weight: "",
    deliveryType: "STANDARD",
    paymentMethod: "UPI",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const calculateEstimatedCharge = () => {
    const weight = Number(formData.weight);

    if (!weight || weight <= 0) return 0;

    const baseCharge = 50;
    const weightCharge = weight * 20;
    const expressCharge =
      formData.deliveryType === "EXPRESS" ? 100 : 0;

    return baseCharge + weightCharge + expressCharge;
  };

  const estimatedCharge = calculateEstimatedCharge();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const clearLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(null);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const role = (
      localStorage.getItem("role") || ""
    ).toUpperCase();

    if (!token || !userId) {
      setError(
        "Your login session has expired. Please login again."
      );

      navigate("/login", {
        state: { from: "/book-parcel" },
      });

      return;
    }

    if (role !== "CUSTOMER") {
      setError(
        "Only customers can create new parcel bookings."
      );
      return;
    }

    if (
      !formData.senderName.trim() ||
      !formData.receiverName.trim() ||
      !formData.pickupAddress.trim() ||
      !formData.deliveryAddress.trim() ||
      !formData.weight
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const weight = Number(formData.weight);

    if (!Number.isFinite(weight) || weight <= 0) {
      setError("Parcel weight must be greater than 0.");
      return;
    }

    if (estimatedCharge <= 0) {
      setError("Unable to calculate parcel charge.");
      return;
    }

    const razorpayLoaded = await loadRazorpayScript();

    if (!razorpayLoaded) {
      setError(
        "Razorpay Checkout could not be loaded. Check your internet connection."
      );
      return;
    }

    try {
      setLoading(true);

      /* CREATE PARCEL */
      const parcelResponse = await api.post(
        `/api/parcels?userId=${userId}`,
        {
          senderName: formData.senderName.trim(),
          receiverName: formData.receiverName.trim(),
          pickupAddress: formData.pickupAddress.trim(),
          deliveryAddress: formData.deliveryAddress.trim(),
          weight,
          deliveryType: formData.deliveryType,
        }
      );

      const parcel = parcelResponse.data;

      if (!parcel?.id) {
        throw new Error(
          "Parcel was created but parcel ID was not returned."
        );
      }

      /* CREATE RAZORPAY ORDER */
      const orderResponse = await api.post(
        `/api/razorpay/create-order?amount=${estimatedCharge}&parcelId=${parcel.id}`
      );

      const order = orderResponse.data;

      if (!order?.orderId) {
        throw new Error(
          "Razorpay order ID was not returned."
        );
      }

      /* RAZORPAY CHECKOUT */
      const razorpayOptions = {
        key: "rzp_test_TilPoXyvcpbJjD",
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Smart Courier",
        description: `Payment for parcel ${parcel.trackingId}`,
        order_id: order.orderId,

        prefill: {
          name: formData.senderName.trim(),
          email: localStorage.getItem("email") || "",
        },

        notes: {
          parcelId: String(parcel.id),
          trackingId: parcel.trackingId,
        },

        theme: {
          color: "#0d6efd",
        },

        handler: async function (paymentResponse) {
          try {
            setLoading(true);
            setError("");

            const verificationResponse = await api.post(
              "/api/razorpay/verify-payment",
              {
                parcelId: parcel.id,
                userId: Number(userId),
                razorpayOrderId:
                  paymentResponse.razorpay_order_id,
                razorpayPaymentId:
                  paymentResponse.razorpay_payment_id,
                razorpaySignature:
                  paymentResponse.razorpay_signature,
              }
            );

            const verifiedPayment =
              verificationResponse.data;

            if (verifiedPayment.success) {
              const razorpayPaymentId =
                verifiedPayment.razorpayPaymentId ||
                paymentResponse.razorpay_payment_id;

              const razorpayOrderId =
                verifiedPayment.razorpayOrderId ||
                paymentResponse.razorpay_order_id ||
                order.orderId;

              const transactionId =
                verifiedPayment.transactionId ||
                verifiedPayment.transactionID ||
                razorpayPaymentId;

              const paymentMethod =
                verifiedPayment.paymentMethod ||
                "RAZORPAY";

              const paymentStatus =
                verifiedPayment.paymentStatus ||
                "SUCCESS";

              const databasePaymentId =
                verifiedPayment.paymentId ||
                verifiedPayment.id ||
                null;

              setSuccess({
                ...parcel,
                paymentVerified: true,
                paymentId: databasePaymentId,
                transactionId,
                paymentStatus,
                paymentMethod,
                razorpayPaymentId,
                razorpayOrderId,
              });

              setFormData({
                senderName: "",
                receiverName: "",
                pickupAddress: "",
                deliveryAddress: "",
                weight: "",
                deliveryType: "STANDARD",
                paymentMethod: "UPI",
              });
            } else {
              setError(
                verifiedPayment.message ||
                  "Payment verification failed."
              );
            }
          } catch (err) {
            console.error(
              "Payment verification error:",
              err
            );

            if (err.response?.status === 401) {
              clearLogin();

              navigate("/login", {
                state: { from: "/book-parcel" },
              });

              return;
            }

            setError(
              err.response?.data?.message ||
                "Payment was completed but verification failed. Please contact support."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);

            setError(
              "Payment window was closed. Your parcel was created, but payment was not completed."
            );
          },
        },
      };

      const razorpay = new window.Razorpay(
        razorpayOptions
      );

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay payment failed:",
            response.error
          );

          setLoading(false);

          setError(
            response.error?.description ||
              "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (err) {
      console.error(
        "Parcel booking/payment error:",
        err
      );

      if (err.response?.status === 401) {
        clearLogin();

        navigate("/login", {
          state: { from: "/book-parcel" },
        });

        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You are not authorized to create this parcel."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Unable to process parcel booking."
        );
      }

      setLoading(false);
    }
  };

  const cardStyle = {
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "16px",
  };

  return (
    <div className="container py-3 py-md-4">
      <style>{`
        .booking-card {
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .booking-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0,0,0,.16);
        }

        .booking-hero {
          position: relative;
          overflow: hidden;
        }

        .booking-hero::after {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          right: -60px;
          top: -80px;
          border-radius: 50%;
          background: rgba(0,217,255,.10);
          animation: pulseGlow 3s ease-in-out infinite;
        }

        .parcel-icon {
          animation: floatParcel 3s ease-in-out infinite;
        }

        .payment-option {
          cursor: pointer;
          transition: all .2s ease;
          height: 100%;
        }

        .payment-option:hover {
          transform: translateY(-2px);
          border-color: #0d6efd !important;
        }

        .form-control,
        .form-select {
          border-radius: 10px;
        }

        .price-total {
          text-shadow: 0 0 14px rgba(0,217,255,.25);
        }

        .success-card {
          animation: successIn .45s ease both;
        }

        @keyframes floatParcel {
          0%,100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(3deg);
          }
        }

        @keyframes pulseGlow {
          0%,100% {
            transform: scale(1);
            opacity: .5;
          }
          50% {
            transform: scale(1.15);
            opacity: .9;
          }
        }

        @keyframes successIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .parcel-icon {
            font-size: 55px !important;
          }
        }
      `}</style>

      {/* HERO */}
      <div
        className="card p-3 p-md-4 mb-3 booking-card booking-hero"
        style={{
          ...cardStyle,
          background:
            "linear-gradient(135deg,rgba(13,110,253,.18),rgba(102,16,242,.16),rgba(0,217,255,.06))",
        }}
      >
        <div className="row align-items-center">
          <div className="col-lg-8">
            <span className="badge bg-primary mb-2">
              SMART SHIPPING
            </span>

            <h1 className="display-6 fw-bold mb-1">
              Book Your Parcel 📦
            </h1>

            <p className="text-muted mb-0">
              Create a shipment and securely pay through
              Razorpay Test Mode.
            </p>
          </div>

          <div className="col-lg-4 text-center mt-3 mt-lg-0">
            <div
              className="parcel-icon"
              style={{
                fontSize: "70px",
                lineHeight: 1,
                filter:
                  "drop-shadow(0 0 25px rgba(0,217,255,.4))",
              }}
            >
              📦
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS */}
      {success && (
        <div
          className="card p-3 p-md-4 mb-3 text-center success-card"
          style={{
            ...cardStyle,
            background:
              "linear-gradient(135deg,rgba(25,135,84,.16),rgba(0,217,255,.06))",
            border:
              "1px solid rgba(25,135,84,.35)",
          }}
        >
          <div className="fs-1 mb-1">✅</div>

          <span className="badge bg-success mb-2">
            PAYMENT VERIFIED
          </span>

          <h3 className="fw-bold mb-1">
            Parcel booking completed!
          </h3>

          <p className="text-muted small mb-3">
            Your Razorpay Test Mode payment was verified
            and saved successfully.
          </p>

          <div
            className="p-3 rounded-3 mb-3"
            style={{
              background: "rgba(255,255,255,.05)",
            }}
          >
            <small className="text-muted">
              YOUR TRACKING ID
            </small>

            <h3
              className="fw-bold mt-1 mb-0"
              style={{
                color: "#00d9ff",
                letterSpacing: "2px",
              }}
            >
              {success.trackingId}
            </h3>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6 col-md-3">
              <small className="text-muted">
                Delivery Type
              </small>

              <div className="fw-bold">
                {success.deliveryType}
              </div>
            </div>

            <div className="col-6 col-md-3">
              <small className="text-muted">
                Weight
              </small>

              <div className="fw-bold">
                {success.weight} kg
              </div>
            </div>

            <div className="col-6 col-md-3">
              <small className="text-muted">
                Amount
              </small>

              <div className="fw-bold text-success">
                ₹{success.deliveryCharge}
              </div>
            </div>

            <div className="col-6 col-md-3">
              <small className="text-muted">
                Status
              </small>

              <div className="fw-bold text-success">
                {success.paymentStatus || "PAID"}
              </div>
            </div>
          </div>

          {/* PAYMENT DETAILS */}
          <div
            className="p-3 rounded-3 text-start mb-3"
            style={{
              background: "rgba(0,217,255,.07)",
              border:
                "1px solid rgba(0,217,255,.35)",
            }}
          >
            <h5 className="fw-bold mb-3">
              💳 Payment Details
            </h5>

            <div className="row g-3">
              <div className="col-md-6">
                <small className="text-muted">
                  Razorpay Payment ID
                </small>

                <div
                  className="fw-bold mt-1 text-break"
                  style={{ color: "#00d9ff" }}
                >
                  {success.razorpayPaymentId ||
                    "Not available"}
                </div>
              </div>

              <div className="col-md-6">
                <small className="text-muted">
                  Razorpay Order ID
                </small>

                <div className="fw-bold mt-1 text-break">
                  {success.razorpayOrderId ||
                    "Not available"}
                </div>
              </div>

              <div className="col-md-6">
                <small className="text-muted">
                  Transaction ID
                </small>

                <div className="fw-bold mt-1 text-break">
                  {success.transactionId ||
                    success.razorpayPaymentId ||
                    "Not available"}
                </div>
              </div>

              <div className="col-md-6">
                <small className="text-muted">
                  Payment Method
                </small>

                <div className="fw-bold mt-1">
                  {success.paymentMethod ||
                    "RAZORPAY"}
                </div>
              </div>

              <div className="col-md-6">
                <small className="text-muted">
                  Payment Status
                </small>

                <div className="fw-bold mt-1 text-success">
                  {success.paymentStatus || "SUCCESS"}
                </div>
              </div>

              {success.paymentId && (
                <div className="col-md-6">
                  <small className="text-muted">
                    Payment Record ID
                  </small>

                  <div className="fw-bold mt-1">
                    #{success.paymentId}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="alert alert-success text-start py-2 mb-3">
            <strong>
              ✅ Payment Verified Successfully
            </strong>
            <br />
            <small>
              Razorpay payment signature was verified by
              the Spring Boot server and the payment record
              was saved in the Smart Courier database.
            </small>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-2">
            <Link
              to={`/tracking?trackingId=${success.trackingId}`}
              className="btn btn-primary"
            >
              📍 Track Parcel
            </Link>

            <Link
              to="/notifications"
              className="btn btn-outline-primary"
            >
              🔔 Notifications
            </Link>

            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setSuccess(null);
                setError("");
              }}
            >
              + Book Another
            </button>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger py-2 mb-3">
          ⚠️ {error}
        </div>
      )}

      {/* BOOKING FORM */}
      {!success && (
        <div className="row g-3">
          {/* FORM */}
          <div className="col-lg-8">
            <div
              className="card p-3 p-md-4 booking-card"
              style={cardStyle}
            >
              <div className="mb-3">
                <span className="badge bg-primary mb-1">
                  SHIPMENT DETAILS
                </span>

                <h3 className="fw-bold mb-1">
                  Enter Parcel Information
                </h3>

                <p className="text-muted small mb-0">
                  Fill in the sender, receiver and delivery
                  details.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* SENDER / RECEIVER */}
                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold mb-1">
                      Sender Name
                    </label>

                    <input
                      type="text"
                      name="senderName"
                      className="form-control"
                      placeholder="Enter sender name"
                      value={formData.senderName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold mb-1">
                      Receiver Name
                    </label>

                    <input
                      type="text"
                      name="receiverName"
                      className="form-control"
                      placeholder="Enter receiver name"
                      value={formData.receiverName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* ADDRESSES */}
                <div className="mb-2">
                  <label className="form-label fw-semibold mb-1">
                    Pickup Address
                  </label>

                  <textarea
                    name="pickupAddress"
                    className="form-control"
                    rows="2"
                    placeholder="Enter pickup address"
                    value={formData.pickupAddress}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label fw-semibold mb-1">
                    Delivery Address
                  </label>

                  <textarea
                    name="deliveryAddress"
                    className="form-control"
                    rows="2"
                    placeholder="Enter delivery address"
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* WEIGHT / DELIVERY TYPE */}
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold mb-1">
                      Weight (kg)
                    </label>

                    <input
                      type="number"
                      name="weight"
                      className="form-control"
                      placeholder="Example: 2"
                      min="0.1"
                      step="0.1"
                      value={formData.weight}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold mb-1">
                      Delivery Type
                    </label>

                    <select
                      name="deliveryType"
                      className="form-select"
                      value={formData.deliveryType}
                      onChange={handleChange}
                    >
                      <option value="STANDARD">
                        Standard Delivery
                      </option>

                      <option value="EXPRESS">
                        Express Delivery
                      </option>
                    </select>
                  </div>
                </div>

                {/* PAYMENT METHOD */}
                <div className="mb-3">
                  <label className="form-label fw-semibold mb-2">
                    Payment Method
                  </label>

                  <div className="row g-2">
                    <div className="col-md-4">
                      <label
                        className={`payment-option border rounded p-2 d-block ${
                          formData.paymentMethod === "UPI"
                            ? "border-primary bg-primary bg-opacity-10"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="UPI"
                          checked={
                            formData.paymentMethod === "UPI"
                          }
                          onChange={handleChange}
                          className="me-2"
                        />
                        📱 UPI
                      </label>
                    </div>

                    <div className="col-md-4">
                      <label
                        className={`payment-option border rounded p-2 d-block ${
                          formData.paymentMethod === "CARD"
                            ? "border-primary bg-primary bg-opacity-10"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="CARD"
                          checked={
                            formData.paymentMethod ===
                            "CARD"
                          }
                          onChange={handleChange}
                          className="me-2"
                        />
                        💳 Card
                      </label>
                    </div>

                    <div className="col-md-4">
                      <label
                        className={`payment-option border rounded p-2 d-block ${
                          formData.paymentMethod ===
                          "NET_BANKING"
                            ? "border-primary bg-primary bg-opacity-10"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="NET_BANKING"
                          checked={
                            formData.paymentMethod ===
                            "NET_BANKING"
                          }
                          onChange={handleChange}
                          className="me-2"
                        />
                        🏦 Net Banking
                      </label>
                    </div>
                  </div>

                  <div className="alert alert-info py-2 mt-2 mb-0 small">
                    🔐 <strong>Razorpay Test Mode</strong>
                    <br />
                    No real money will be charged. Razorpay's
                    test checkout will be used for this
                    project.
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                      Opening Secure Payment...
                    </>
                  ) : (
                    <>
                      🔒 Pay ₹{estimatedCharge} & Book
                      Parcel
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* PRICE SUMMARY */}
          <div className="col-lg-4">
            <div
              className="card p-3 booking-card sticky-top"
              style={{
                ...cardStyle,
                top: "85px",
              }}
            >
              <span className="badge bg-primary mb-2">
                PRICE SUMMARY
              </span>

              <h4 className="fw-bold mb-3">
                Shipment Cost
              </h4>

              <div className="d-flex justify-content-between mb-2">
                <span>Base Charge</span>
                <strong>
                  ₹{formData.weight ? 50 : 0}
                </strong>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Weight Charge</span>

                <strong>
                  ₹
                  {formData.weight
                    ? Number(formData.weight) * 20
                    : 0}
                </strong>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Express Charge</span>

                <strong>
                  ₹
                  {formData.deliveryType === "EXPRESS"
                    ? 100
                    : 0}
                </strong>
              </div>

              <hr className="my-2" />

              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">
                  Total
                </span>

                <span
                  className="fw-bold fs-3 price-total"
                  style={{ color: "#00d9ff" }}
                >
                  ₹{estimatedCharge}
                </span>
              </div>

              <div className="mt-3 p-2 rounded bg-light">
                <small className="text-muted">
                  Payment
                </small>

                <div className="fw-bold mt-1 small">
                  🔐 Razorpay Secure Checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookParcel;