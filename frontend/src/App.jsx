import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ParcelTracking from "./pages/ParcelTracking";
import BookParcel from "./pages/BookParcel";
import DeliveryPrediction from "./pages/DeliveryPrediction";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import PaymentHistory from "./pages/PaymentHistory";
import ManagerAssignments from "./pages/ManagerAssignments";

import AdminManagement from "./pages/AdminManagement";
import AdminUsers from "./pages/AdminUsers";
import AdminAgents from "./pages/AdminAgents";
import AdminHubs from "./pages/AdminHubs";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminComplaints from "./pages/AdminComplaints";
import AdminFeedback from "./pages/AdminFeedback";
import AdminPayments from "./pages/AdminPayments";
import AdminParcels from "./pages/AdminParcels";
import AdminNotifications from "./pages/AdminNotifications";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <main className="sc-app-content">
      <style>{`
        .sc-app-content {
          min-height: calc(100vh - 70px);
          animation: appPageEnter .35s ease both;
        }

        @keyframes appPageEnter {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sc-app-content {
            animation: none;
          }
        }
      `}</style>

      <div key={location.pathname}>
        <Routes>
          {/* Public Pages */}
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* Protected Pages */}
          <Route element={<ProtectedRoute />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/tracking"
              element={<ParcelTracking />}
            />

            <Route
              path="/book-parcel"
              element={<BookParcel />}
            />

            <Route
              path="/prediction"
              element={<DeliveryPrediction />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/payments"
              element={<PaymentHistory />}
            />

            {/* Manager / Delivery Agent */}
            <Route
              path="/assignments"
              element={<ManagerAssignments />}
            />

            {/* Admin Control Center */}
            <Route
              path="/admin-management"
              element={<AdminManagement />}
            />

            {/* Admin Pages */}
            <Route
              path="/admin-users"
              element={<AdminUsers />}
            />

            <Route
              path="/admin-agents"
              element={<AdminAgents />}
            />

            <Route
              path="/admin-hubs"
              element={<AdminHubs />}
            />

            <Route
              path="/admin-analytics"
              element={<AdminAnalytics />}
            />

            <Route
              path="/admin-complaints"
              element={<AdminComplaints />}
            />

            <Route
              path="/admin-feedback"
              element={<AdminFeedback />}
            />

            <Route
              path="/admin-payments"
              element={<AdminPayments />}
            />

            <Route
              path="/admin-parcels"
              element={<AdminParcels />}
            />

            <Route
              path="/admin-notifications"
              element={<AdminNotifications />}
            />

          </Route>
        </Routes>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>

      {/* Navigation */}
      <Navbar />

      {/* Application Pages */}
      <AnimatedRoutes />

      {/* Floating AI Assistant */}
      <Chatbot />

      {/* Footer */}
      <Footer />

    </BrowserRouter>
  );
}

export default App;