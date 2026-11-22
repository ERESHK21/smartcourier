import { useEffect, useState } from "react";
import api from "../services/api";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/payments");

      setPayments(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Error loading payments:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load payment records."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
      case "PAID":
        return "bg-success";

      case "PENDING":
        return "bg-warning text-dark";

      case "FAILED":
        return "bg-danger";

      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Payment Management 💳
          </h2>

          <p className="text-muted mb-0">
            View payment transactions across the courier system.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={loadPayments}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="mt-3 mb-0">
                Loading payment records...
              </p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-5">
              <div className="fs-1">💳</div>

              <h5 className="mt-2">
                No payments found
              </h5>

              <p className="text-muted mb-0">
                There are currently no payment records.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Parcel ID</th>
                    <th>User ID</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Transaction ID</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.id}</td>

                      <td>
                        {payment.parcelId ?? "N/A"}
                      </td>

                      <td>
                        {payment.userId ?? "N/A"}
                      </td>

                      <td className="fw-semibold">
                        ₹
                        {Number(
                          payment.amount || 0
                        ).toFixed(2)}
                      </td>

                      <td>
                        {payment.paymentMethod || "N/A"}
                      </td>

                      <td>
                        <span
                          className={`badge ${getStatusClass(
                            payment.paymentStatus
                          )}`}
                        >
                          {payment.paymentStatus || "UNKNOWN"}
                        </span>
                      </td>

                      <td>
                        {payment.transactionId || "N/A"}
                      </td>

                      <td>
                        {payment.paymentDate
                          ? new Date(
                              payment.paymentDate
                            ).toLocaleString()
                          : "N/A"}
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

export default AdminPayments;