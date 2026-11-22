import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="sc-footer">
      <style>{`
        .sc-footer {
          position: relative;
          overflow: hidden;
          margin-top: 45px;
          background:
            linear-gradient(
              180deg,
              #07111f 0%,
              #030914 100%
            );
          border-top: 1px solid rgba(0,217,255,.12);
        }

        .sc-footer::before {
          content: "";
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: rgba(0,217,255,.045);
          filter: blur(80px);
          left: -120px;
          top: -120px;
          animation: footerGlow 8s ease-in-out infinite;
        }

        .sc-footer::after {
          content: "";
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: rgba(102,16,242,.05);
          filter: blur(80px);
          right: -100px;
          bottom: -120px;
          animation: footerGlowTwo 9s ease-in-out infinite;
        }

        .sc-footer-container {
          position: relative;
          z-index: 1;
          padding-top: 42px;
          padding-bottom: 25px;
        }

        .sc-footer-brand {
          display: inline-block;
          color: white;
          font-size: 1.3rem;
          font-weight: 800;
          text-decoration: none;
          transition: transform .25s ease;
        }

        .sc-footer-brand:hover {
          color: white;
          transform: translateX(3px);
        }

        .sc-footer-brand-icon {
          display: inline-block;
          margin-right: 5px;
          animation: footerTruck 3s ease-in-out infinite;
        }

        .sc-footer-brand-text {
          background:
            linear-gradient(
              135deg,
              #ffffff,
              #00d9ff
            );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sc-footer-description {
          max-width: 460px;
          color: #8b98a9;
          line-height: 1.7;
          margin-top: 13px;
        }

        .sc-footer-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 18px;
        }

        .sc-footer-badge {
          padding: 7px 11px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.05);
          color: #dce5ef;
          transition:
            transform .2s ease,
            background .2s ease,
            box-shadow .2s ease;
        }

        .sc-footer-badge:hover {
          transform: translateY(-3px);
          background: rgba(13,110,253,.12);
          box-shadow:
            0 8px 20px rgba(0,0,0,.2);
        }

        .sc-footer-title {
          color: white;
          font-size: .9rem;
          font-weight: 800;
          margin-bottom: 15px;
          position: relative;
        }

        .sc-footer-title::after {
          content: "";
          display: block;
          width: 25px;
          height: 2px;
          margin-top: 6px;
          border-radius: 5px;
          background:
            linear-gradient(
              90deg,
              #00d9ff,
              #6610f2
            );
        }

        .sc-footer-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sc-footer-link {
          width: fit-content;
          color: #8b98a9;
          text-decoration: none;
          font-size: .88rem;
          transition:
            color .2s ease,
            transform .2s ease;
        }

        .sc-footer-link:hover {
          color: #00d9ff;
          transform: translateX(5px);
        }

        .sc-contact-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .sc-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: #8b98a9;
          font-size: .87rem;
          line-height: 1.5;
          transition: transform .2s ease;
        }

        .sc-contact-item:hover {
          transform: translateX(4px);
        }

        .sc-contact-icon {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(13,110,253,.1);
        }

        .sc-footer-divider {
          margin: 32px 0 22px;
          border: 0;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.1),
              transparent
            );
        }

        .sc-footer-bottom {
          color: #68778a;
          font-size: .82rem;
        }

        .sc-tech-badges {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 5px;
        }

        .sc-tech-badge {
          padding: 5px 9px;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 700;
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.07);
          color: #9eacbd;
          transition:
            transform .2s ease,
            color .2s ease,
            border-color .2s ease;
        }

        .sc-tech-badge:hover {
          transform: translateY(-2px);
          color: #00d9ff;
          border-color: rgba(0,217,255,.2);
        }

        .sc-heart {
          display: inline-block;
          animation: heartBeat 1.8s ease-in-out infinite;
        }

        @keyframes footerGlow {
          0%, 100% {
            transform: translate(0,0);
          }
          50% {
            transform: translate(70px,35px);
          }
        }

        @keyframes footerGlowTwo {
          0%, 100% {
            transform: translate(0,0);
          }
          50% {
            transform: translate(-60px,-35px);
          }
        }

        @keyframes footerTruck {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(4px);
          }
        }

        @keyframes heartBeat {
          0%, 100% {
            transform: scale(1);
          }
          15% {
            transform: scale(1.15);
          }
          30% {
            transform: scale(1);
          }
        }

        @media (max-width: 767px) {
          .sc-footer-container {
            padding-top: 32px;
            padding-bottom: 20px;
          }

          .sc-footer-description {
            max-width: 100%;
          }

          .sc-tech-badges {
            justify-content: flex-start;
            margin-top: 10px;
          }

          .sc-footer-divider {
            margin: 25px 0 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sc-footer::before,
          .sc-footer::after,
          .sc-footer-brand-icon,
          .sc-heart {
            animation: none;
          }
        }
      `}</style>

      <div className="container sc-footer-container">
        <div className="row g-4">

          {/* BRAND */}
          <div className="col-lg-5 col-md-6">
            <Link
              to="/"
              className="sc-footer-brand"
            >
              <span className="sc-footer-brand-icon">
                🚚
              </span>

              Smart
              <span
                style={{
                  color: "#00d9ff",
                }}
              >
                Courier
              </span>
            </Link>

            <p className="sc-footer-description">
              A smart courier and logistics management
              system for booking parcels, tracking
              shipments and predicting delivery time
              using artificial intelligence.
            </p>

            <div className="sc-footer-badges">
              <span className="sc-footer-badge">
                🤖 AI Powered
              </span>

              <span className="sc-footer-badge">
                🔐 Secure
              </span>

              <span className="sc-footer-badge">
                ⚡ Fast
              </span>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="col-6 col-lg-2 col-md-3">
            <h6 className="sc-footer-title">
              Quick Links
            </h6>

            <div className="sc-footer-links">
              <Link
                to="/"
                className="sc-footer-link"
              >
                Home
              </Link>

              <Link
                to="/tracking"
                className="sc-footer-link"
              >
                Track Parcel
              </Link>

              <Link
                to="/book-parcel"
                className="sc-footer-link"
              >
                Book Parcel
              </Link>

              <Link
                to="/prediction"
                className="sc-footer-link"
              >
                AI Prediction
              </Link>
            </div>
          </div>

          {/* ACCOUNT */}
          <div className="col-6 col-lg-2 col-md-3">
            <h6 className="sc-footer-title">
              Account
            </h6>

            <div className="sc-footer-links">
              <Link
                to="/login"
                className="sc-footer-link"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="sc-footer-link"
              >
                Register
              </Link>

              <Link
                to="/profile"
                className="sc-footer-link"
              >
                Profile
              </Link>

              <Link
                to="/notifications"
                className="sc-footer-link"
              >
                Notifications
              </Link>
            </div>
          </div>

          {/* CONTACT */}
          <div className="col-lg-3">
            <h6 className="sc-footer-title">
              Contact
            </h6>

            <div className="sc-contact-list">
              <div className="sc-contact-item">
                <span className="sc-contact-icon">
                  📧
                </span>

                <span>
                  ereshkomkar@gmail.com
                </span>
              </div>

              <div className="sc-contact-item">
                <span className="sc-contact-icon">
                  📞
                </span>

                <span>
                  +91 84216 21803
                </span>
              </div>

              <div className="sc-contact-item">
                <span className="sc-contact-icon">
                  📍
                </span>

                <span>
                  Pune, Maharashtra
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <hr className="sc-footer-divider" />

        {/* BOTTOM */}
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="sc-footer-bottom mb-0">
              © 2026 Smart Courier.
              All Rights Reserved.
            </p>
          </div>

          <div className="col-md-6 mt-3 mt-md-0">
            <div className="sc-tech-badges">
              <span className="sc-footer-bottom">
                Built with{" "}
                <span className="sc-heart">
                  ❤️
                </span>{" "}
                using
              </span>

              <span className="sc-tech-badge">
                React
              </span>

              <span className="sc-tech-badge">
                Spring Boot
              </span>

              <span className="sc-tech-badge">
                AI/ML
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;