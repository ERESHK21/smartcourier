function LoadingScreen({ text = "Loading Smart Courier..." }) {
  return (
    <div className="sc-loading">
      <style>{`
        .sc-loading {
          position: relative;
          min-height: 60vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background:
            radial-gradient(
              circle at center,
              rgba(13,110,253,.08),
              transparent 42%
            );
        }

        .sc-loading::before,
        .sc-loading::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          pointer-events: none;
        }

        .sc-loading::before {
          width: 240px;
          height: 240px;
          background: rgba(0,217,255,.08);
          top: 10%;
          left: 15%;
          animation: loadingGlowOne 7s ease-in-out infinite;
        }

        .sc-loading::after {
          width: 220px;
          height: 220px;
          background: rgba(102,16,242,.08);
          bottom: 5%;
          right: 15%;
          animation: loadingGlowTwo 8s ease-in-out infinite;
        }

        .sc-loading-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sc-loading-logo-wrap {
          position: relative;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sc-loading-ring {
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 2px solid rgba(0,217,255,.12);
          border-top-color: #00d9ff;
          animation: loadingRotate 2s linear infinite;
        }

        .sc-loading-ring-two {
          position: absolute;
          width: 84px;
          height: 84px;
          border-radius: 50%;
          border: 2px dashed rgba(102,16,242,.45);
          animation: loadingRotateReverse 4s linear infinite;
        }

        .sc-loading-logo {
          width: 68px;
          height: 68px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          background:
            linear-gradient(
              135deg,
              #0d6efd,
              #6610f2
            );
          box-shadow:
            0 0 25px rgba(0,217,255,.28),
            inset 0 1px 0 rgba(255,255,255,.2);
          animation: loadingPulse 1.8s ease-in-out infinite;
        }

        .sc-loading-brand {
          margin-top: 24px;
          margin-bottom: 4px;
          color: #fff;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: .2px;
        }

        .sc-loading-brand span {
          color: #00d9ff;
        }

        .sc-loading-status {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 15px;
        }

        .sc-loading-spinner {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid rgba(13,110,253,.18);
          border-top-color: #0d6efd;
          border-right-color: #00d9ff;
          animation: loadingRotate .8s linear infinite;
        }

        .sc-loading-text {
          margin: 0;
          color: #7f8da0;
          font-size: .86rem;
          text-align: center;
        }

        .sc-loading-dots {
          display: flex;
          gap: 5px;
          margin-top: 15px;
        }

        .sc-loading-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00d9ff;
          animation: loadingDot 1.2s ease-in-out infinite;
        }

        .sc-loading-dot:nth-child(2) {
          animation-delay: .15s;
        }

        .sc-loading-dot:nth-child(3) {
          animation-delay: .3s;
        }

        @keyframes loadingPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow:
              0 0 22px rgba(0,217,255,.25);
          }

          50% {
            transform: scale(1.06);
            box-shadow:
              0 0 38px rgba(0,217,255,.42);
          }
        }

        @keyframes loadingRotate {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes loadingRotateReverse {
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes loadingDot {
          0%, 100% {
            opacity: .25;
            transform: translateY(0);
          }

          50% {
            opacity: 1;
            transform: translateY(-4px);
          }
        }

        @keyframes loadingGlowOne {
          0%, 100% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(50px, 30px);
          }
        }

        @keyframes loadingGlowTwo {
          0%, 100% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(-45px, -25px);
          }
        }

        @media (max-width: 576px) {
          .sc-loading {
            min-height: 55vh;
          }

          .sc-loading-logo-wrap {
            width: 90px;
            height: 90px;
          }

          .sc-loading-ring {
            width: 90px;
            height: 90px;
          }

          .sc-loading-ring-two {
            width: 76px;
            height: 76px;
          }

          .sc-loading-logo {
            width: 62px;
            height: 62px;
            font-size: 29px;
          }

          .sc-loading-text {
            max-width: 280px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sc-loading::before,
          .sc-loading::after,
          .sc-loading-ring,
          .sc-loading-ring-two,
          .sc-loading-logo,
          .sc-loading-spinner,
          .sc-loading-dot {
            animation: none;
          }
        }
      `}</style>

      <div className="sc-loading-content">

        {/* Animated Logo */}
        <div className="sc-loading-logo-wrap">
          <div className="sc-loading-ring" />

          <div className="sc-loading-ring-two" />

          <div className="sc-loading-logo">
            🚚
          </div>
        </div>

        {/* Brand */}
        <h4 className="sc-loading-brand">
          Smart
          <span>Courier</span>
        </h4>

        {/* Loading Status */}
        <div className="sc-loading-status">
          <div
            className="sc-loading-spinner"
            role="status"
            aria-label="Loading"
          />

          <p className="sc-loading-text">
            {text}
          </p>
        </div>

        {/* Animated Dots */}
        <div className="sc-loading-dots">
          <span className="sc-loading-dot" />
          <span className="sc-loading-dot" />
          <span className="sc-loading-dot" />
        </div>

      </div>
    </div>
  );
}

export default LoadingScreen;