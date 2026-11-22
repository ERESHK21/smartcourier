import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute() {
  const location = useLocation();

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return (
    <>
      <style>{`
        .protected-page {
          animation: protectedPageEnter .3s ease both;
        }

        @keyframes protectedPageEnter {
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
          .protected-page {
            animation: none;
          }
        }
      `}</style>

      <div className="protected-page">
        <Outlet />
      </div>
    </>
  );
}

export default ProtectedRoute;