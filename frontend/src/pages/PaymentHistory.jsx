import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function PaymentHistory() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      const token = localStorage.getItem("token");
      const role = (
        localStorage.getItem("role") || ""
      ).toUpperCase();

      if (!token) {
        navigate("/login", {
          state: {
            from: "/payments",
          },
        });
        return;
      }

      if (role !== "CUSTOMER") {
        setError(
          "Payment history is available only for customers."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/api/payments"
        );

        console.log(
          "Payment history response:",
          response.data
        );

        if (Array.isArray(response.data)) {
          setPayments(response.data);
        } else if (
          Array.isArray(response.data?.payments)
        ) {
          setPayments(response.data.payments);
        } else {
          setPayments([]);
        }
      } catch (err) {
        console.error(
          "Payment history error:",
          err
        );

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("email");
          localStorage.removeItem("role");

          navigate("/login", {
            state: {
              from: "/payments",
            },
          });

          return;
        }

        if (err.response?.status === 403) {
          setError(
            "You are not authorized to view payment history."
          );
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load payment history."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [navigate]);

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "N/A";
    }

    try {
      return new Date(dateValue).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return dateValue;
    }
  };

  const getStatusClass = (status) => {
    const value = (
      status || ""
    ).toUpperCase();

    if (value === "SUCCESS") {
      return "payment-success";
    }

    if (value === "FAILED") {
      return "payment-failed";
    }

    if (value === "PENDING") {
      return "payment-pending";
    }

    return "payment-unknown";
  };

  const getPaymentMethod = (payment) => {
    if (payment.paymentMethod) {
      return payment.paymentMethod;
    }

    if (payment.razorpayPaymentId) {
      return "RAZORPAY";
    }

    return "N/A";
  };

  const successfulPayments = payments.filter(
    (payment) =>
      String(
        payment.paymentStatus
      ).toUpperCase() === "SUCCESS"
  );

  const totalPaid = successfulPayments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

  const failedPayments = payments.filter(
    (payment) =>
      String(
        payment.paymentStatus
      ).toUpperCase() === "FAILED"
  ).length;

  if (loading) {
    return (
      <div className="payment-page">
        <style>{paymentStyles}</style>

        <div className="payment-loading">
          <div className="loading-icon">
            💳
          </div>

          <div
            className="spinner-border text-primary mb-3"
            role="status"
          />

          <h4 className="fw-bold">
            Loading Payment History...
          </h4>

          <p className="text-muted mb-0">
            Please wait while we fetch your payments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <style>{paymentStyles}</style>

      <div className="payment-container">

        {/* HERO */}
        <section className="payment-hero">
          <div className="hero-content">
            <span className="hero-badge">
              PAYMENT CENTER
            </span>

            <h1>
              Payment History{" "}
              <span>💳</span>
            </h1>

            <p>
              View your Razorpay transactions,
              payment status and parcel payment
              details.
            </p>

            <div className="hero-actions">
              <Link
                to="/book-parcel"
                className="hero-button"
              >
                📦 Book New Parcel
              </Link>

              <span className="secure-label">
                🔐 Secure Payments
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="payment-orbit orbit-one" />
            <div className="payment-orbit orbit-two" />
            <div className="credit-card-icon">
              💳
            </div>
            <div className="floating-coin coin-one">
              ₹
            </div>
            <div className="floating-coin coin-two">
              ✓
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="payment-error">
            ⚠️ {error}
          </div>
        )}

        {/* SUMMARY */}
        {!error && (
          <div className="summary-grid">

            <div className="summary-card blue-card">
              <div className="summary-icon">
                💳
              </div>

              <div>
                <small>Total Payments</small>
                <h3>{payments.length}</h3>
              </div>
            </div>

            <div className="summary-card green-card">
              <div className="summary-icon">
                ✅
              </div>

              <div>
                <small>Successful Payments</small>
                <h3>
                  {successfulPayments.length}
                </h3>
              </div>
            </div>

            <div className="summary-card purple-card">
              <div className="summary-icon">
                ₹
              </div>

              <div>
                <small>Total Paid</small>
                <h3>
                  ₹{totalPaid.toFixed(2)}
                </h3>
              </div>
            </div>

          </div>
        )}

        {/* EXTRA STATS */}
        {!error && payments.length > 0 && (
          <div className="mini-stats">
            <div>
              <span>Successful</span>
              <strong>
                {successfulPayments.length}
              </strong>
            </div>

            <div>
              <span>Failed</span>
              <strong>{failedPayments}</strong>
            </div>

            <div>
              <span>Payment Gateway</span>
              <strong>Razorpay</strong>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!error && payments.length === 0 && (
          <div className="empty-payment">
            <div className="empty-icon">
              💳
            </div>

            <h3>No Payments Yet</h3>

            <p>
              You haven't made any parcel payments yet.
            </p>

            <Link
              to="/book-parcel"
              className="primary-button"
            >
              📦 Book a Parcel
            </Link>
          </div>
        )}

        {/* PAYMENT LIST */}
        {!error && payments.length > 0 && (
          <section className="transactions-card">
            <div className="transactions-header">
              <div>
                <span className="section-badge">
                  TRANSACTIONS
                </span>

                <h3>Your Payments</h3>

                <p>
                  {payments.length} transaction
                  {payments.length !== 1
                    ? "s"
                    : ""}{" "}
                  recorded
                </p>
              </div>

              <Link
                to="/book-parcel"
                className="new-parcel-button"
              >
                + New Parcel
              </Link>
            </div>

            {/* DESKTOP TABLE */}
            <div className="table-responsive payment-table">
              <table className="table table-dark align-middle mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Parcel</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Transaction</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>

                      <td>
                        <small>
                          {formatDate(
                            payment.paymentDate
                          )}
                        </small>
                      </td>

                      <td>
                        <span className="parcel-badge">
                          📦 Parcel #
                          {payment.parcelId}
                        </span>
                      </td>

                      <td>
                        <strong className="amount-text">
                          ₹
                          {Number(
                            payment.amount || 0
                          ).toFixed(2)}
                        </strong>
                      </td>

                      <td>
                        <span className="method-text">
                          {getPaymentMethod(payment)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            payment.paymentStatus
                          )}`}
                        >
                          {payment.paymentStatus ||
                            "UNKNOWN"}
                        </span>
                      </td>

                      <td>
                        <code className="transaction-id">
                          {payment.transactionId ||
                            payment.razorpayPaymentId ||
                            "N/A"}
                        </code>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE PAYMENT CARDS */}
            <div className="mobile-payments">
              {payments.map((payment) => (
                <div
                  className="mobile-payment-card"
                  key={payment.id}
                >
                  <div className="mobile-payment-top">
                    <span className="parcel-badge">
                      📦 Parcel #
                      {payment.parcelId}
                    </span>

                    <span
                      className={`status-badge ${getStatusClass(
                        payment.paymentStatus
                      )}`}
                    >
                      {payment.paymentStatus ||
                        "UNKNOWN"}
                    </span>
                  </div>

                  <div className="mobile-amount">
                    ₹
                    {Number(
                      payment.amount || 0
                    ).toFixed(2)}
                  </div>

                  <div className="mobile-details">
                    <div>
                      <span>Date</span>
                      <strong>
                        {formatDate(
                          payment.paymentDate
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Method</span>
                      <strong>
                        {getPaymentMethod(payment)}
                      </strong>
                    </div>
                  </div>

                  <code className="mobile-transaction">
                    {payment.transactionId ||
                      payment.razorpayPaymentId ||
                      "N/A"}
                  </code>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RAZORPAY INFO */}
        {!error && payments.length > 0 && (
          <div className="razorpay-info">
            <div className="razorpay-icon">
              🔐
            </div>

            <div>
              <strong>
                Razorpay Test Mode
              </strong>

              <p>
                Payments shown here are stored in
                the Smart Courier database. Test
                Mode payments do not charge real
                money.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const paymentStyles = `
  .payment-page {
    min-height: calc(100vh - 70px);
    padding: 28px 15px;
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 10% 10%,
        rgba(13,110,253,.12),
        transparent 28%
      ),
      radial-gradient(
        circle at 90% 90%,
        rgba(102,16,242,.12),
        transparent 30%
      );
  }

  .payment-page::before {
    content: "";
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(0,217,255,.05);
    filter: blur(75px);
    left: -100px;
    top: 20%;
    animation: paymentGlow 8s ease-in-out infinite;
  }

  .payment-container {
    width: 100%;
    max-width: 1400px;
    margin: auto;
    position: relative;
    z-index: 1;
  }

  .payment-loading {
    max-width: 550px;
    margin: 80px auto;
    padding: 45px 25px;
    text-align: center;
    border-radius: 20px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(0,217,255,.15);
    backdrop-filter: blur(15px);
    animation: paymentFade .5s ease both;
  }

  .loading-icon {
    font-size: 55px;
    margin-bottom: 10px;
    animation: cardFloat 2s ease-in-out infinite;
  }

  .payment-hero {
    min-height: 280px;
    padding: 35px 40px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    position: relative;
    background:
      linear-gradient(
        135deg,
        rgba(13,110,253,.18),
        rgba(102,16,242,.16),
        rgba(0,217,255,.06)
      );
    border: 1px solid rgba(0,217,255,.18);
    box-shadow: 0 20px 55px rgba(0,0,0,.12);
    animation: paymentFade .6s ease both;
  }

  .hero-content {
    max-width: 750px;
    position: relative;
    z-index: 2;
  }

  .hero-badge,
  .section-badge {
    display: inline-block;
    padding: 6px 11px;
    border-radius: 30px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #fff;
    background: linear-gradient(
      135deg,
      #0d6efd,
      #6610f2
    );
  }

  .payment-hero h1 {
    font-size: clamp(2rem, 4vw, 3.4rem);
    font-weight: 800;
    margin: 12px 0 10px;
  }

  .payment-hero h1 span {
    display: inline-block;
    animation: cardFloat 3s ease-in-out infinite;
  }

  .payment-hero p {
    color: var(--sc-muted, #9ca3af);
    font-size: 1.05rem;
    margin: 0;
    max-width: 680px;
  }

  .hero-actions {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-top: 22px;
    flex-wrap: wrap;
  }

  .hero-button,
  .primary-button,
  .new-parcel-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: #fff;
    border-radius: 11px;
    padding: 10px 17px;
    font-weight: 700;
    border: none;
    background: linear-gradient(
      135deg,
      #0d6efd,
      #6610f2
    );
    transition:
      transform .2s ease,
      box-shadow .2s ease;
  }

  .hero-button:hover,
  .primary-button:hover,
  .new-parcel-button:hover {
    color: #fff;
    transform: translateY(-2px);
    box-shadow:
      0 10px 25px rgba(13,110,253,.25);
  }

  .secure-label {
    color: var(--sc-muted, #9ca3af);
    font-size: .9rem;
  }

  .hero-visual {
    width: 250px;
    height: 220px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .credit-card-icon {
    width: 100px;
    height: 72px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(0,217,255,.2);
    backdrop-filter: blur(12px);
    box-shadow: 0 15px 35px rgba(0,0,0,.2);
    animation: cardFloat 3s ease-in-out infinite;
    z-index: 2;
  }

  .payment-orbit {
    position: absolute;
    border: 1px solid rgba(0,217,255,.15);
    border-radius: 50%;
    animation: rotateOrbit 12s linear infinite;
  }

  .orbit-one {
    width: 170px;
    height: 170px;
  }

  .orbit-two {
    width: 220px;
    height: 220px;
    animation-duration: 17s;
    animation-direction: reverse;
  }

  .floating-coin {
    position: absolute;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    background: rgba(13,110,253,.15);
    border: 1px solid rgba(0,217,255,.2);
    animation: coinFloat 3s ease-in-out infinite;
  }

  .coin-one {
    top: 10px;
    right: 20px;
  }

  .coin-two {
    bottom: 15px;
    left: 15px;
    animation-delay: .8s;
  }

  .payment-error {
    margin-top: 20px;
    padding: 13px 16px;
    border-radius: 12px;
    color: #ffb3b3;
    background: rgba(220,53,69,.1);
    border: 1px solid rgba(220,53,69,.25);
    animation: paymentFade .3s ease both;
  }

  .summary-grid {
    display: grid;
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
    gap: 18px;
    margin-top: 22px;
  }

  .summary-card {
    min-height: 120px;
    padding: 22px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255,255,255,.055);
    backdrop-filter: blur(12px);
    transition:
      transform .25s ease,
      box-shadow .25s ease;
    animation: cardUp .6s ease both;
  }

  .summary-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0,0,0,.15);
  }

  .blue-card {
    border: 1px solid rgba(0,217,255,.2);
  }

  .green-card {
    border: 1px solid rgba(25,135,84,.25);
  }

  .purple-card {
    border: 1px solid rgba(102,16,242,.25);
  }

  .summary-icon {
    width: 55px;
    height: 55px;
    flex-shrink: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 25px;
    background: rgba(13,110,253,.13);
  }

  .green-card .summary-icon {
    background: rgba(25,135,84,.13);
  }

  .purple-card .summary-icon {
    background: rgba(102,16,242,.13);
  }

  .summary-card small,
  .mini-stats span {
    color: var(--sc-muted, #9ca3af);
  }

  .summary-card h3 {
    margin: 3px 0 0;
    font-weight: 800;
  }

  .green-card h3 {
    color: #20c997;
  }

  .mini-stats {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    margin-top: 16px;
    padding: 15px 20px;
    border-radius: 15px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.07);
  }

  .mini-stats div {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .mini-stats strong {
    color: #00d9ff;
  }

  .empty-payment {
    margin-top: 22px;
    padding: 50px 20px;
    text-align: center;
    border-radius: 20px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(0,217,255,.16);
    animation: cardUp .6s ease both;
  }

  .empty-icon {
    font-size: 65px;
    margin-bottom: 8px;
    animation: cardFloat 3s ease-in-out infinite;
  }

  .empty-payment h3 {
    font-weight: 800;
  }

  .empty-payment p {
    color: var(--sc-muted, #9ca3af);
    margin-bottom: 20px;
  }

  .transactions-card {
    margin-top: 22px;
    padding: 24px;
    border-radius: 20px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(0,217,255,.17);
    backdrop-filter: blur(12px);
    animation: cardUp .65s ease both;
  }

  .transactions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    margin-bottom: 18px;
  }

  .transactions-header h3 {
    margin: 8px 0 2px;
    font-weight: 800;
  }

  .transactions-header p {
    margin: 0;
    color: var(--sc-muted, #9ca3af);
    font-size: .9rem;
  }

  .payment-table {
    border-radius: 14px;
    overflow: hidden;
  }

  .payment-table table {
    background: transparent;
  }

  .payment-table thead th {
    color: #9ca3af;
    font-size: .8rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    padding: 15px;
    border-bottom-color: rgba(255,255,255,.08);
  }

  .payment-table tbody td {
    padding: 15px;
    border-bottom-color: rgba(255,255,255,.06);
  }

  .payment-table tbody tr {
    transition: background .2s ease;
  }

  .payment-table tbody tr:hover {
    background: rgba(13,110,253,.06);
  }

  .parcel-badge {
    display: inline-block;
    padding: 6px 9px;
    border-radius: 8px;
    background: rgba(108,117,125,.18);
    font-size: .82rem;
  }

  .amount-text {
    color: #00d9ff;
  }

  .method-text {
    font-weight: 600;
  }

  .status-badge {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 20px;
    font-size: .72rem;
    font-weight: 800;
    letter-spacing: .4px;
  }

  .payment-success {
    color: #20c997;
    background: rgba(25,135,84,.14);
    border: 1px solid rgba(25,135,84,.22);
  }

  .payment-failed {
    color: #ff7b86;
    background: rgba(220,53,69,.12);
    border: 1px solid rgba(220,53,69,.22);
  }

  .payment-pending {
    color: #ffc107;
    background: rgba(255,193,7,.12);
    border: 1px solid rgba(255,193,7,.22);
  }

  .payment-unknown {
    color: #adb5bd;
    background: rgba(108,117,125,.12);
  }

  .transaction-id {
    color: #00d9ff;
    font-size: 11px;
  }

  .mobile-payments {
    display: none;
  }

  .razorpay-info {
    margin-top: 18px;
    padding: 16px 18px;
    border-radius: 14px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    color: #9ecfff;
    background: rgba(13,110,253,.08);
    border: 1px solid rgba(13,110,253,.16);
  }

  .razorpay-icon {
    font-size: 20px;
  }

  .razorpay-info p {
    margin: 4px 0 0;
    color: var(--sc-muted, #9ca3af);
    font-size: .88rem;
  }

  @keyframes paymentFade {
    from {
      opacity: 0;
      transform: translateY(15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes cardUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes cardFloat {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  @keyframes coinFloat {
    0%, 100% {
      transform: translateY(0) rotate(0);
    }
    50% {
      transform: translateY(-10px) rotate(8deg);
    }
  }

  @keyframes rotateOrbit {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes paymentGlow {
    0%, 100% {
      transform: translate(0,0);
    }
    50% {
      transform: translate(80px,30px);
    }
  }

  @media (max-width: 900px) {
    .payment-hero {
      padding: 28px;
    }

    .hero-visual {
      width: 190px;
    }

    .summary-grid {
      gap: 12px;
    }
  }

  @media (max-width: 768px) {
    .payment-page {
      padding: 18px 12px;
    }

    .payment-hero {
      min-height: auto;
      padding: 25px 22px;
    }

    .hero-visual {
      display: none;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .mini-stats {
      flex-direction: column;
    }

    .transactions-card {
      padding: 18px;
    }

    .transactions-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .payment-table {
      display: none;
    }

    .mobile-payments {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .mobile-payment-card {
      padding: 16px;
      border-radius: 14px;
      background: rgba(255,255,255,.045);
      border: 1px solid rgba(255,255,255,.08);
    }

    .mobile-payment-top {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: center;
    }

    .mobile-amount {
      font-size: 1.7rem;
      font-weight: 800;
      color: #00d9ff;
      margin: 12px 0;
    }

    .mobile-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }

    .mobile-details div {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .mobile-details span {
      color: #8b949e;
      font-size: .75rem;
    }

    .mobile-details strong {
      font-size: .85rem;
    }

    .mobile-transaction {
      display: block;
      color: #00d9ff;
      font-size: 10px;
      word-break: break-all;
    }
  }

  @media (max-width: 480px) {
    .payment-hero h1 {
      font-size: 1.9rem;
    }

    .payment-hero p {
      font-size: .92rem;
    }

    .hero-actions {
      align-items: flex-start;
      flex-direction: column;
      gap: 10px;
    }

    .summary-card {
      padding: 18px;
    }

    .razorpay-info {
      padding: 13px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .payment-page::before,
    .loading-icon,
    .payment-hero h1 span,
    .credit-card-icon,
    .payment-orbit,
    .floating-coin,
    .empty-icon,
    .payment-loading,
    .payment-hero,
    .summary-card,
    .empty-payment,
    .transactions-card {
      animation: none;
    }
  }
`;

export default PaymentHistory;