import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">

      {/* ================= HERO ================= */}

      <section className="home-hero position-relative overflow-hidden">
        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>

        <div className="container py-5">
          <div className="row align-items-center min-vh-75">

            {/* LEFT */}

            <div className="col-lg-7 hero-content">

              <div className="mb-3 hero-badge-wrap">
                <span className="home-badge">
                  <span className="pulse-dot"></span>
                  🚀 Smart Logistics Technology
                </span>
              </div>

              <h1 className="home-title">
                Deliver Smarter.
                <br />
                <span>Track Everything.</span>
              </h1>

              <p className="home-description">
                Smart Courier is a modern logistics management
                system that helps you book parcels, track deliveries,
                predict delivery time with AI, and manage your
                courier operations from one place.
              </p>

              <div className="d-flex flex-wrap gap-3 hero-buttons">

                <Link
                  to="/register"
                  className="home-primary-btn"
                >
                  🚀 Get Started
                  <span>→</span>
                </Link>

                <Link
                  to="/tracking"
                  className="home-secondary-btn"
                >
                  📍 Track Parcel
                </Link>

              </div>

              {/* Stats */}

              <div className="row mt-5 g-3 hero-stats">

                <div className="col-4">
                  <div className="hero-stat">
                    <h3>24/7</h3>
                    <small>Tracking</small>
                  </div>
                </div>

                <div className="col-4">
                  <div className="hero-stat">
                    <h3>AI</h3>
                    <small>Prediction</small>
                  </div>
                </div>

                <div className="col-4">
                  <div className="hero-stat">
                    <h3>100%</h3>
                    <small>Digital</small>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT */}

            <div className="col-lg-5 text-center mt-5 mt-lg-0">

              <div className="delivery-visual">

                <div className="orbit orbit-one"></div>
                <div className="orbit orbit-two"></div>

                <div className="floating-particle particle-one">
                  ✦
                </div>

                <div className="floating-particle particle-two">
                  +
                </div>

                <div className="floating-particle particle-three">
                  ✦
                </div>

                <div className="truck-circle">
                  <div className="truck-glow"></div>

                  <div className="truck-icon">
                    🚚
                  </div>
                </div>

                <div className="delivery-card delivery-card-top">
                  <span>📦</span>
                  <div>
                    <strong>Parcel</strong>
                    <small>Ready to ship</small>
                  </div>
                  <span className="online-dot"></span>
                </div>

                <div className="delivery-card delivery-card-bottom">
                  <span>🤖</span>
                  <div>
                    <strong>AI Enabled</strong>
                    <small>Smart prediction</small>
                  </div>
                </div>

              </div>

              <h3 className="smart-delivery-title">
                Smart Delivery
              </h3>

              <p className="smart-delivery-text">
                From booking to delivery, everything
                is managed digitally.
              </p>

              <div className="mt-3">
                <span className="status-pill success-pill">
                  ● System Online
                </span>

                <span className="status-pill ai-pill">
                  ✦ AI Enabled
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}

      <section className="home-section py-5">

        <div className="container py-5">

          <div className="text-center mb-5 section-heading">

            <span className="section-badge">
              POWERFUL FEATURES
            </span>

            <h2>
              Everything You Need
            </h2>

            <p>
              A complete platform for modern courier management.
            </p>

          </div>

          <div className="row g-4">

            {/* Feature 1 */}

            <div className="col-md-6 col-lg-4">
              <div className="home-feature-card">

                <div className="feature-icon">
                  📦
                </div>

                <h4>
                  Easy Parcel Booking
                </h4>

                <p>
                  Create parcel bookings quickly with
                  sender, receiver, address, weight and
                  delivery type information.
                </p>

                <Link
                  to="/book-parcel"
                  className="feature-link"
                >
                  Book Parcel →
                </Link>

              </div>
            </div>

            {/* Feature 2 */}

            <div className="col-md-6 col-lg-4">
              <div className="home-feature-card">

                <div className="feature-icon">
                  📍
                </div>

                <h4>
                  Parcel Tracking
                </h4>

                <p>
                  Track your parcel using its unique
                  tracking ID and view its current
                  delivery status.
                </p>

                <Link
                  to="/tracking"
                  className="feature-link"
                >
                  Track Parcel →
                </Link>

              </div>
            </div>

            {/* Feature 3 */}

            <div className="col-md-6 col-lg-4">
              <div className="home-feature-card">

                <div className="feature-icon">
                  🤖
                </div>

                <h4>
                  AI Delivery Prediction
                </h4>

                <p>
                  Machine learning estimates delivery
                  time using parcel weight, distance,
                  delivery type and hub delay.
                </p>

                <Link
                  to="/prediction"
                  className="feature-link"
                >
                  Try AI →
                </Link>

              </div>
            </div>

            {/* Feature 4 */}

            <div className="col-md-6 col-lg-4">
              <div className="home-feature-card">

                <div className="feature-icon">
                  🔔
                </div>

                <h4>
                  Smart Notifications
                </h4>

                <p>
                  Stay updated with parcel booking,
                  delivery and status notifications.
                </p>

                <Link
                  to="/notifications"
                  className="feature-link"
                >
                  View Notifications →
                </Link>

              </div>
            </div>

            {/* Feature 5 */}

            <div className="col-md-6 col-lg-4">
              <div className="home-feature-card">

                <div className="feature-icon">
                  🔐
                </div>

                <h4>
                  Secure Login
                </h4>

                <p>
                  JWT-based authentication and role-based
                  access provide secure access to the
                  application.
                </p>

                <Link
                  to="/login"
                  className="feature-link"
                >
                  Login →
                </Link>

              </div>
            </div>

            {/* Feature 6 */}

            <div className="col-md-6 col-lg-4">
              <div className="home-feature-card">

                <div className="feature-icon">
                  🤝
                </div>

                <h4>
                  AI Chatbot
                </h4>

                <p>
                  Ask the Smart Courier AI assistant
                  about tracking, delivery status and
                  courier charges.
                </p>

                <button
                  className="feature-link feature-button"
                  onClick={() =>
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: "smooth",
                    })
                  }
                >
                  Ask AI →
                </button>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section className="home-process py-5">

        <div className="container py-5">

          <div className="text-center mb-5 section-heading">

            <span className="section-badge">
              SIMPLE PROCESS
            </span>

            <h2>
              How Smart Courier Works
            </h2>

          </div>

          <div className="row g-4 text-center">

            <div className="col-md-4">
              <div className="process-card">

                <div className="process-number">
                  01
                </div>

                <div className="process-icon">
                  📦
                </div>

                <h4>
                  Book
                </h4>

                <p>
                  Enter sender and receiver details,
                  address and parcel information.
                </p>

              </div>
            </div>

            <div className="col-md-4">
              <div className="process-card">

                <div className="process-number">
                  02
                </div>

                <div className="process-icon">
                  📍
                </div>

                <h4>
                  Track
                </h4>

                <p>
                  Get a unique tracking ID and monitor
                  your parcel status.
                </p>

              </div>
            </div>

            <div className="col-md-4">
              <div className="process-card">

                <div className="process-number">
                  03
                </div>

                <div className="process-icon">
                  🚚
                </div>

                <h4>
                  Deliver
                </h4>

                <p>
                  Follow the delivery process and use
                  AI to estimate delivery time.
                </p>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className="home-cta py-5">

        <div className="container py-5">

          <div className="cta-box text-center">

            <div className="cta-icon">
              🚚
            </div>

            <h2>
              Ready to Ship Smarter?
            </h2>

            <p>
              Create your Smart Courier account and
              start managing your deliveries digitally.
            </p>

            <div className="mt-4">

              <Link
                to="/register"
                className="cta-button"
              >
                Create Free Account
                <span>🚀</span>
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* ================= HOME STYLES ================= */}

      <style>{`

        .home-page {
          overflow: hidden;
        }

        /* HERO */

        .home-hero {
          min-height: calc(100vh - 70px);
          background:
            radial-gradient(
              circle at 15% 30%,
              rgba(108,99,255,0.13),
              transparent 32%
            ),
            radial-gradient(
              circle at 85% 30%,
              rgba(0,217,255,0.10),
              transparent 30%
            );
        }

        .hero-glow {
          position: absolute;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          opacity: 0.18;
        }

        .hero-glow-one {
          top: -150px;
          left: -100px;
          background: #6c63ff;
          animation: glowMove 8s ease-in-out infinite;
        }

        .hero-glow-two {
          right: -100px;
          bottom: -150px;
          background: #00d9ff;
          animation: glowMove 10s ease-in-out infinite reverse;
        }

        .hero-content {
          animation: heroContentIn 0.8s ease forwards;
        }

        .hero-badge-wrap {
          animation: fadeUp 0.7s ease 0.1s both;
        }

        .home-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 15px;
          border-radius: 50px;
          color: #c7d2fe;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.4px;
          background:
            linear-gradient(
              135deg,
              rgba(108,99,255,0.16),
              rgba(0,217,255,0.08)
            );
          border: 1px solid rgba(108,99,255,0.25);
          box-shadow:
            0 8px 25px rgba(0,0,0,0.12);
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 12px rgba(34,197,94,0.8);
          animation: onlinePulse 2s infinite;
        }

        .home-title {
          font-size: clamp(3rem, 6vw, 5.5rem);
          line-height: 1.02;
          font-weight: 900;
          letter-spacing: -3px;
          margin-bottom: 25px;
          color: #ffffff;
          animation: fadeUp 0.8s ease 0.2s both;
        }

        .home-title span {
          background:
            linear-gradient(
              90deg,
              #ffffff,
              #00d9ff,
              #8b85ff,
              #ffffff
            );
          background-size: 250% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientSlide 6s linear infinite;
        }

        .home-description {
          max-width: 650px;
          color: #9ca8b8;
          font-size: 1.08rem;
          line-height: 1.8;
          margin-bottom: 28px;
          animation: fadeUp 0.8s ease 0.3s both;
        }

        .hero-buttons {
          animation: fadeUp 0.8s ease 0.4s both;
        }

        .home-primary-btn,
        .home-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 52px;
          padding: 0 24px;
          border-radius: 13px;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .home-primary-btn {
          color: #ffffff;
          background:
            linear-gradient(
              135deg,
              #6c63ff,
              #a855f7
            );
          box-shadow:
            0 10px 30px rgba(108,99,255,0.28);
        }

        .home-primary-btn:hover {
          color: #ffffff;
          transform: translateY(-4px);
          box-shadow:
            0 15px 38px rgba(108,99,255,0.42);
        }

        .home-primary-btn span {
          transition: transform 0.25s ease;
        }

        .home-primary-btn:hover span {
          transform: translateX(5px);
        }

        .home-secondary-btn {
          color: #dce5f2;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(10px);
        }

        .home-secondary-btn:hover {
          color: #ffffff;
          border-color: rgba(0,217,255,0.4);
          background: rgba(0,217,255,0.08);
          transform: translateY(-4px);
        }

        /* STATS */

        .hero-stats {
          animation: fadeUp 0.8s ease 0.5s both;
        }

        .hero-stat {
          padding: 15px 5px;
          border-left: 1px solid rgba(255,255,255,0.08);
        }

        .hero-stat h3 {
          margin: 0;
          font-size: 1.65rem;
          font-weight: 800;
          background:
            linear-gradient(
              90deg,
              #ffffff,
              #00d9ff
            );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-stat small {
          color: #7f8da0;
          font-size: 0.78rem;
        }

        /* DELIVERY VISUAL */

        .delivery-visual {
          position: relative;
          width: 390px;
          height: 390px;
          max-width: 100%;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .truck-circle {
          position: relative;
          width: 225px;
          height: 225px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(108,99,255,0.20),
              rgba(0,217,255,0.04) 65%,
              transparent 70%
            );
          border: 1px solid rgba(108,99,255,0.22);
          box-shadow:
            0 0 60px rgba(108,99,255,0.16),
            inset 0 0 50px rgba(0,217,255,0.05);
          animation: truckFloat 4s ease-in-out infinite;
        }

        .truck-glow {
          position: absolute;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: #00d9ff;
          filter: blur(70px);
          opacity: 0.12;
        }

        .truck-icon {
          position: relative;
          z-index: 2;
          font-size: 105px;
          filter:
            drop-shadow(0 0 20px rgba(0,217,255,0.5));
        }

        .orbit {
          position: absolute;
          border: 1px solid rgba(0,217,255,0.16);
          border-radius: 50%;
        }

        .orbit-one {
          width: 300px;
          height: 300px;
          animation: orbitRotate 12s linear infinite;
        }

        .orbit-two {
          width: 360px;
          height: 360px;
          border-color: rgba(108,99,255,0.12);
          animation: orbitRotate 18s linear infinite reverse;
        }

        .delivery-card {
          position: absolute;
          z-index: 4;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 165px;
          padding: 11px 13px;
          text-align: left;
          border-radius: 14px;
          background:
            rgba(10,20,35,0.78);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(14px);
          box-shadow:
            0 12px 35px rgba(0,0,0,0.25);
        }

        .delivery-card span:first-child {
          font-size: 25px;
        }

        .delivery-card strong,
        .delivery-card small {
          display: block;
        }

        .delivery-card strong {
          color: #ffffff;
          font-size: 0.82rem;
        }

        .delivery-card small {
          color: #7f8da0;
          font-size: 0.68rem;
          margin-top: 2px;
        }

        .delivery-card-top {
          top: 30px;
          right: 0;
          animation: cardFloat 4s ease-in-out infinite;
        }

        .delivery-card-bottom {
          left: 0;
          bottom: 28px;
          animation: cardFloat 4s ease-in-out 1s infinite;
        }

        .online-dot {
          width: 7px;
          height: 7px;
          margin-left: auto;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px #22c55e;
        }

        .floating-particle {
          position: absolute;
          color: #00d9ff;
          font-size: 22px;
          opacity: 0.7;
        }

        .particle-one {
          top: 20px;
          left: 65px;
          animation: particleFloat 3s ease-in-out infinite;
        }

        .particle-two {
          right: 40px;
          bottom: 90px;
          color: #8b85ff;
          animation: particleFloat 4s ease-in-out 1s infinite;
        }

        .particle-three {
          left: 70px;
          bottom: 50px;
          animation: particleFloat 3.5s ease-in-out 0.5s infinite;
        }

        .smart-delivery-title {
          font-weight: 800;
          margin-top: 10px;
        }

        .smart-delivery-text {
          color: #7f8da0;
          margin-bottom: 15px;
        }

        .status-pill {
          display: inline-block;
          padding: 7px 12px;
          margin: 3px;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .success-pill {
          color: #86efac;
          background: rgba(34,197,94,0.10);
          border: 1px solid rgba(34,197,94,0.2);
        }

        .ai-pill {
          color: #c4b5fd;
          background: rgba(139,92,246,0.10);
          border: 1px solid rgba(139,92,246,0.2);
        }

        /* SECTION */

        .home-section {
          position: relative;
        }

        .section-heading {
          animation: fadeUp 0.7s ease both;
        }

        .section-badge {
          display: inline-block;
          padding: 7px 13px;
          border-radius: 50px;
          color: #a5b4fc;
          background: rgba(108,99,255,0.10);
          border: 1px solid rgba(108,99,255,0.2);
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .section-heading h2 {
          margin-top: 15px;
          margin-bottom: 10px;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 850;
        }

        .section-heading p {
          color: #7f8da0;
        }

        /* FEATURES */

        .home-feature-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 28px;
          border-radius: 20px;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.065),
              rgba(255,255,255,0.018)
            );
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          transition: all 0.35s ease;
          position: relative;
          overflow: hidden;
        }

        .home-feature-card::before {
          content: "";
          position: absolute;
          width: 130px;
          height: 130px;
          top: -70px;
          right: -70px;
          border-radius: 50%;
          background: rgba(108,99,255,0.12);
          transition: transform 0.4s ease;
        }

        .home-feature-card:hover {
          transform: translateY(-9px);
          border-color: rgba(108,99,255,0.3);
          box-shadow:
            0 20px 45px rgba(0,0,0,0.24),
            0 0 25px rgba(108,99,255,0.06);
        }

        .home-feature-card:hover::before {
          transform: scale(2.3);
        }

        .feature-icon {
          position: relative;
          z-index: 1;
          width: 65px;
          height: 65px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          border-radius: 17px;
          font-size: 32px;
          background:
            linear-gradient(
              135deg,
              rgba(108,99,255,0.18),
              rgba(0,217,255,0.08)
            );
          border: 1px solid rgba(108,99,255,0.15);
          transition: all 0.35s ease;
        }

        .home-feature-card:hover .feature-icon {
          transform: translateY(-5px) rotate(-3deg);
          box-shadow:
            0 10px 25px rgba(108,99,255,0.16);
        }

        .home-feature-card h4 {
          position: relative;
          z-index: 1;
          font-weight: 750;
          margin-bottom: 12px;
        }

        .home-feature-card p {
          position: relative;
          z-index: 1;
          color: #7f8da0;
          line-height: 1.7;
          flex-grow: 1;
        }

        .feature-link {
          position: relative;
          z-index: 1;
          align-self: flex-start;
          margin-top: 15px;
          padding: 0;
          border: 0;
          color: #7dd3fc;
          background: transparent;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.25s ease;
        }

        .feature-link:hover {
          color: #ffffff;
          transform: translateX(5px);
        }

        .feature-button {
          font-size: inherit;
        }

        /* PROCESS */

        .home-process {
          background:
            linear-gradient(
              180deg,
              transparent,
              rgba(108,99,255,0.025),
              transparent
            );
        }

        .process-card {
          position: relative;
          height: 100%;
          padding: 32px 25px;
          border-radius: 20px;
          background:
            rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.35s ease;
        }

        .process-card:hover {
          transform: translateY(-7px);
          border-color: rgba(0,217,255,0.25);
          box-shadow:
            0 18px 35px rgba(0,0,0,0.2);
        }

        .process-number {
          font-size: 3.5rem;
          font-weight: 900;
          color: rgba(108,99,255,0.15);
          line-height: 1;
        }

        .process-icon {
          margin: 15px 0;
          font-size: 40px;
        }

        .process-card h4 {
          font-weight: 800;
        }

        .process-card p {
          color: #7f8da0;
          line-height: 1.7;
          margin-bottom: 0;
        }

        /* CTA */

        .cta-box {
          position: relative;
          overflow: hidden;
          padding: 70px 30px;
          border-radius: 28px;
          background:
            radial-gradient(
              circle at 20% 20%,
              rgba(0,217,255,0.14),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              rgba(108,99,255,0.18),
              rgba(168,85,247,0.12)
            );
          border: 1px solid rgba(108,99,255,0.22);
          box-shadow:
            0 25px 60px rgba(0,0,0,0.2);
        }

        .cta-box::before,
        .cta-box::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(0,217,255,0.12);
          pointer-events: none;
        }

        .cta-box::before {
          width: 300px;
          height: 300px;
          top: -180px;
          right: -80px;
        }

        .cta-box::after {
          width: 220px;
          height: 220px;
          bottom: -150px;
          left: -70px;
        }

        .cta-icon {
          position: relative;
          font-size: 55px;
          margin-bottom: 15px;
          animation: truckFloat 3s ease-in-out infinite;
        }

        .cta-box h2 {
          position: relative;
          font-size: clamp(2rem, 4vw, 3.3rem);
          font-weight: 850;
        }

        .cta-box p {
          position: relative;
          max-width: 650px;
          margin: 15px auto;
          color: #8996a8;
          line-height: 1.7;
        }

        .cta-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 25px;
          border-radius: 13px;
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 750;
          background:
            linear-gradient(
              135deg,
              #6c63ff,
              #a855f7
            );
          box-shadow:
            0 12px 30px rgba(108,99,255,0.28);
          transition: all 0.3s ease;
        }

        .cta-button:hover {
          transform: translateY(-4px);
          box-shadow:
            0 17px 38px rgba(108,99,255,0.4);
        }

        /* ANIMATIONS */

        @keyframes heroContentIn {
          from {
            opacity: 0;
            transform: translateX(-25px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradientSlide {
          0% {
            background-position: 0% center;
          }

          100% {
            background-position: 250% center;
          }
        }

        @keyframes glowMove {
          0%, 100% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(35px, 25px);
          }
        }

        @keyframes truckFloat {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-9px);
          }
        }

        @keyframes cardFloat {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-15px) rotate(15deg);
          }
        }

        @keyframes orbitRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes onlinePulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }

          50% {
            opacity: 0.45;
            transform: scale(0.75);
          }
        }

        /* RESPONSIVE */

        @media (max-width: 991px) {
          .home-title {
            letter-spacing: -2px;
          }

          .delivery-visual {
            width: 340px;
            height: 340px;
          }

          .truck-circle {
            width: 195px;
            height: 195px;
          }

          .truck-icon {
            font-size: 85px;
          }

          .orbit-one {
            width: 270px;
            height: 270px;
          }

          .orbit-two {
            width: 315px;
            height: 315px;
          }
        }

        @media (max-width: 576px) {
          .home-title {
            font-size: 2.8rem;
            letter-spacing: -1.5px;
          }

          .home-description {
            font-size: 0.95rem;
          }

          .home-primary-btn,
          .home-secondary-btn {
            width: 100%;
          }

          .delivery-visual {
            width: 300px;
            height: 300px;
          }

          .truck-circle {
            width: 165px;
            height: 165px;
          }

          .truck-icon {
            font-size: 70px;
          }

          .orbit-one {
            width: 235px;
            height: 235px;
          }

          .orbit-two {
            width: 280px;
            height: 280px;
          }

          .delivery-card {
            min-width: 145px;
            padding: 9px 10px;
          }

          .delivery-card-top {
            right: -5px;
          }

          .delivery-card-bottom {
            left: -5px;
          }

          .hero-stat h3 {
            font-size: 1.35rem;
          }

          .hero-stat small {
            font-size: 0.7rem;
          }

          .home-feature-card {
            padding: 23px;
          }

          .cta-box {
            padding: 50px 20px;
            border-radius: 22px;
          }
        }

      `}</style>
    </div>
  );
}

export default Home;