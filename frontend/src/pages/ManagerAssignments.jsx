import { useEffect, useState } from "react";
import api from "../services/api";

function ManagerAssignments() {
  const [parcels, setParcels] = useState([]);
  const [agents, setAgents] = useState([]);

  const [selectedParcel, setSelectedParcel] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [parcelResponse, agentResponse] = await Promise.all([
        api.get("/api/parcels"),
        api.get("/api/agents"),
      ]);

      const parcelData = Array.isArray(parcelResponse.data)
        ? parcelResponse.data
        : [];

      const agentData = Array.isArray(agentResponse.data)
        ? agentResponse.data
        : [];

      // Show only parcels that still need delivery
      const pendingParcels = parcelData.filter(
        (parcel) =>
          parcel.status?.toUpperCase() !== "DELIVERED" &&
          parcel.status?.toUpperCase() !== "CANCELLED"
      );

      // Show only available agents
      const availableAgents = agentData.filter(
        (agent) =>
          !agent.status ||
          agent.status.toUpperCase() === "AVAILABLE"
      );

      setParcels(pendingParcels);
      setAgents(availableAgents);
    } catch (err) {
      console.error("Error loading assignment data:", err);

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to access assignments."
        );
      } else {
        setError(
          "Failed to load parcels or delivery agents."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!selectedParcel || !selectedAgent) {
      setError(
        "Please select both a parcel and a delivery agent."
      );
      return;
    }

    try {
      setAssigning(true);

      /*
       * Backend expects:
       * POST /api/assignments?parcelId=7&deliveryAgentId=4
       *
       * It does NOT expect a JSON body.
       */
      await api.post("/api/assignments", null, {
        params: {
          parcelId: Number(selectedParcel),
          deliveryAgentId: Number(selectedAgent),
        },
      });

      setMessage(
        "Parcel assigned successfully."
      );

      setSelectedParcel("");
      setSelectedAgent("");

      // Refresh data after successful assignment
      await loadData();

    } catch (err) {
      console.error(
        "Assignment error:",
        err
      );

      console.error(
        "Assignment response:",
        err.response?.data
      );

      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
          "Invalid parcel or delivery agent."
        );
      } else if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to assign parcels."
        );
      } else if (err.response?.status === 404) {
        setError(
          "Parcel or delivery agent was not found."
        );
      } else {
        setError(
          err.response?.data?.message ||
          "Failed to assign parcel."
        );
      }

    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h4>Loading assignments...</h4>
      </div>
    );
  }

  return (
    <div className="container py-5">

      {/* ================= HEADER ================= */}

      <div className="mb-4">
        <h2 className="fw-bold">
          Parcel Assignment
        </h2>

        <p className="text-muted">
          Assign pending parcels to available delivery agents.
        </p>
      </div>


      {/* ================= MESSAGES ================= */}

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}


      {/* ================= STATISTICS ================= */}

      <div className="row g-3 mb-4">

        {/* Pending Parcels */}

        <div className="col-md-6">

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <h6 className="text-muted">
                Pending Parcels
              </h6>

              <h2 className="fw-bold">
                {parcels.length}
              </h2>

            </div>

          </div>

        </div>


        {/* Available Agents */}

        <div className="col-md-6">

          <div className="card shadow-sm border-0">

            <div className="card-body">

              <h6 className="text-muted">
                Available Agents
              </h6>

              <h2 className="fw-bold">
                {agents.length}
              </h2>

            </div>

          </div>

        </div>

      </div>


      {/* ================= ASSIGNMENT FORM ================= */}

      <div className="card shadow-sm border-0">

        <div className="card-body p-4">

          <h4 className="mb-4">
            Assign Delivery Agent
          </h4>


          <form onSubmit={handleAssign}>

            {/* ================= PARCEL ================= */}

            <div className="mb-3">

              <label className="form-label fw-semibold">
                Select Parcel
              </label>

              <select
                className="form-select"
                value={selectedParcel}
                onChange={(e) =>
                  setSelectedParcel(e.target.value)
                }
                disabled={assigning}
              >

                <option value="">
                  -- Select Parcel --
                </option>

                {parcels.map((parcel) => (

                  <option
                    key={parcel.id}
                    value={parcel.id}
                  >

                    {parcel.trackingId} -{" "}
                    {parcel.receiverName} -{" "}
                    {parcel.status}

                  </option>

                ))}

              </select>

            </div>


            {/* ================= DELIVERY AGENT ================= */}

            <div className="mb-4">

              <label className="form-label fw-semibold">
                Select Delivery Agent
              </label>

              <select
                className="form-select"
                value={selectedAgent}
                onChange={(e) =>
                  setSelectedAgent(e.target.value)
                }
                disabled={assigning}
              >

                <option value="">
                  -- Select Agent --
                </option>

                {agents.map((agent) => (

                  <option
                    key={agent.id}
                    value={agent.id}
                  >

                    {agent.name ||
                      `Agent ${agent.id}`}

                    {agent.vehicleNumber
                      ? ` - ${agent.vehicleNumber}`
                      : ""}

                  </option>

                ))}

              </select>

            </div>


            {/* ================= ASSIGN BUTTON ================= */}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={
                assigning ||
                !selectedParcel ||
                !selectedAgent
              }
            >

              {assigning
                ? "Assigning..."
                : "Assign Parcel"}

            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default ManagerAssignments;