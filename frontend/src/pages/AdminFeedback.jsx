import { useEffect, useState } from "react";
import api from "../services/api";

function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/feedback");

      setFeedback(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Error loading feedback:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load customer feedback."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRatingClass = (rating) => {
    if (rating >= 4) return "bg-success";
    if (rating >= 3) return "bg-warning text-dark";
    return "bg-danger";
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Customer Feedback ⭐
          </h2>

          <p className="text-muted mb-0">
            View feedback submitted by SmartCourier customers.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={loadFeedback}
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
                Loading customer feedback...
              </p>
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-5">
              <div className="fs-1">⭐</div>

              <h5 className="mt-2">
                No feedback found
              </h5>

              <p className="text-muted mb-0">
                There is currently no customer feedback.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>Parcel ID</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {feedback.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>

                      <td>
                        {item.userId ?? "N/A"}
                      </td>

                      <td>
                        {item.parcelId ?? "N/A"}
                      </td>

                      <td>
                        <span
                          className={`badge ${getRatingClass(
                            Number(item.rating || 0)
                          )}`}
                        >
                          ⭐ {item.rating ?? "N/A"}
                        </span>
                      </td>

                      <td style={{ minWidth: "280px" }}>
                        {item.comment ||
                          item.message ||
                          "No comment"}
                      </td>

                      <td>
                        {item.createdAt
                          ? new Date(
                              item.createdAt
                            ).toLocaleDateString()
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

export default AdminFeedback;