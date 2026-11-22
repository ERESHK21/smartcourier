import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Chatbot() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const createWelcomeMessage = () => ({
    sender: "bot",
    text:
      "Hello! 👋 I'm Smart Courier AI. I can help you with parcel tracking, delivery status, charges and AI prediction.",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  const [messages, setMessages] = useState([
    createWelcomeMessage(),
  ]);

  const quickQuestions = [
    {
      icon: "📍",
      text: "Track Parcel",
      message: "Where is my parcel?",
    },
    {
      icon: "💰",
      text: "Charges",
      message: "What are the delivery charges?",
    },
    {
      icon: "🚚",
      text: "Status",
      message: "What is my delivery status?",
    },
    {
      icon: "🤖",
      text: "AI Prediction",
      action: "prediction",
    },
  ];

  const getTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isLoggedIn = () => {
    return Boolean(
      localStorage.getItem("token") &&
      localStorage.getItem("userId")
    );
  };

  const sendMessage = async (customMessage = null) => {
    const userMessage = (
      customMessage !== null
        ? customMessage
        : message
    ).trim();

    if (!userMessage || loading) {
      return;
    }

    if (!isLoggedIn()) {
      setMessages((previous) => [
        ...previous,
        {
          sender: "user",
          text: userMessage,
          time: getTime(),
        },
        {
          sender: "bot",
          text:
            "🔐 Please login first to use Smart Courier AI.",
          time: getTime(),
        },
      ]);

      setMessage("");
      return;
    }

    const userMessageObject = {
      sender: "user",
      text: userMessage,
      time: getTime(),
    };

    setMessages((previous) => [
      ...previous,
      userMessageObject,
    ]);

    setMessage("");
    setLoading(true);

    try {
      const userId =
        localStorage.getItem("userId");

      const response = await api.post(
        "/api/chatbot/chat",
        {
          userId: Number(userId),
          message: userMessage,
        }
      );

      const botResponse =
        typeof response.data === "string"
          ? response.data
          : response.data?.message ||
            response.data?.response ||
            JSON.stringify(response.data);

      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: botResponse,
          time: getTime(),
        },
      ]);
    } catch (error) {
      console.error(
        "Chatbot error:",
        error
      );

      let errorMessage =
        "⚠️ Sorry, I couldn't process that request. Please try again.";

      if (error.response?.status === 401) {
        errorMessage =
          "🔐 Your session has expired. Please login again.";

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

        window.dispatchEvent(
          new Event("storage")
        );
      } else if (error.response?.status === 403) {
        errorMessage =
          "🚫 You don't have permission to use this AI feature.";
      } else if (
        !error.response &&
        error.request
      ) {
        errorMessage =
          "⚠️ Cannot connect to the Smart Courier server. Please make sure Spring Boot is running.";
      }

      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: errorMessage,
          time: getTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (item) => {
    if (item.action === "prediction") {
      sendMessage(
        "How long will my parcel take to deliver?"
      );
      return;
    }

    sendMessage(item.message);
  };

  const handleClearChat = () => {
    setMessages([
      {
        ...createWelcomeMessage(),
        time: getTime(),
      },
    ]);
  };

  const handleBookParcel = () => {
    if (!isLoggedIn()) {
      setIsOpen(false);

      navigate("/login", {
        state: {
          from: "/book-parcel",
        },
      });

      return;
    }

    setIsOpen(false);
    navigate("/book-parcel");
  };

  const handleTracking = () => {
    if (!isLoggedIn()) {
      setIsOpen(false);

      navigate("/login", {
        state: {
          from: "/tracking",
        },
      });

      return;
    }

    setIsOpen(false);
    navigate("/tracking");
  };

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  return (
    <>
      <style>{`
        .sc-ai-button-wrap {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 2000;
        }

        .sc-ai-button {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          border: 2px solid rgba(0,217,255,.45);
          background:
            linear-gradient(
              135deg,
              #0d6efd,
              #6610f2
            );
          color: white;
          font-size: 31px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 0 25px rgba(0,217,255,.35),
            0 10px 35px rgba(0,0,0,.4);
          animation: aiPulse 2.5s ease-in-out infinite;
          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .sc-ai-button:hover {
          transform: scale(1.1) rotate(4deg);
          box-shadow:
            0 0 35px rgba(0,217,255,.5),
            0 15px 40px rgba(0,0,0,.45);
        }

        .sc-ai-tooltip {
          position: absolute;
          right: 0;
          bottom: 78px;
          padding: 8px 13px;
          border-radius: 10px;
          white-space: nowrap;
          color: white;
          background: rgba(7,17,31,.97);
          border: 1px solid rgba(0,217,255,.2);
          box-shadow: 0 8px 25px rgba(0,0,0,.3);
          font-size: 12px;
          opacity: 0;
          transform: translateY(5px);
          pointer-events: none;
          transition: all .2s ease;
        }

        .sc-ai-button-wrap:hover .sc-ai-tooltip {
          opacity: 1;
          transform: translateY(0);
        }

        .sc-chat-window {
          position: fixed;
          right: 24px;
          bottom: 24px;
          width: 410px;
          max-width: calc(100vw - 30px);
          height: 650px;
          max-height: calc(100vh - 40px);
          background: rgba(7,17,31,.98);
          border: 1px solid rgba(0,217,255,.25);
          border-radius: 22px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow:
            0 25px 70px rgba(0,0,0,.55),
            0 0 35px rgba(0,217,255,.12);
          z-index: 2000;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: chatOpen .3s ease both;
        }

        .sc-chat-header {
          padding: 15px 16px;
          background:
            linear-gradient(
              135deg,
              #0d6efd,
              #6610f2
            );
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sc-ai-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: rgba(255,255,255,.18);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
          animation: avatarFloat 2.5s ease-in-out infinite;
        }

        .sc-online {
          color: #b8ffd8;
          font-size: 11px;
        }

        .sc-header-button {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,.13);
          color: white;
          cursor: pointer;
          transition:
            transform .2s ease,
            background .2s ease;
        }

        .sc-header-button:hover {
          transform: scale(1.08);
          background: rgba(255,255,255,.22);
        }

        .sc-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          scroll-behavior: smooth;
        }

        .sc-messages::-webkit-scrollbar {
          width: 5px;
        }

        .sc-messages::-webkit-scrollbar-thumb {
          background: rgba(0,217,255,.2);
          border-radius: 10px;
        }

        .sc-message-row {
          margin-bottom: 13px;
          display: flex;
          animation: messageIn .25s ease both;
        }

        .sc-message-row.user {
          justify-content: flex-end;
        }

        .sc-message-row.bot {
          justify-content: flex-start;
        }

        .sc-message-wrapper {
          max-width: 84%;
        }

        .sc-message {
          padding: 10px 13px;
          border-radius: 17px;
          color: white;
          font-size: 14px;
          line-height: 1.5;
          word-break: break-word;
          white-space: pre-wrap;
        }

        .sc-message.user {
          border-radius: 17px 17px 4px 17px;
          background:
            linear-gradient(
              135deg,
              #0d6efd,
              #6610f2
            );
        }

        .sc-message.bot {
          border-radius: 17px 17px 17px 4px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.08);
        }

        .sc-message-meta {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 4px;
        }

        .sc-message-meta.user {
          justify-content: flex-end;
        }

        .sc-message-time {
          color: #64748b;
          font-size: 10px;
        }

        .sc-copy-button {
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 11px;
          cursor: pointer;
          padding: 0;
          transition: color .2s ease;
        }

        .sc-copy-button:hover {
          color: #00d9ff;
        }

        .sc-typing {
          padding: 10px 15px;
          border-radius: 17px 17px 17px 4px;
          background: rgba(255,255,255,.07);
          color: #94a3b8;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          animation: messageIn .2s ease both;
        }

        .sc-dots {
          letter-spacing: 3px;
          animation: dots 1.2s infinite;
        }

        .sc-quick-section {
          padding: 10px 12px;
          border-top: 1px solid rgba(255,255,255,.07);
        }

        .sc-quick-scroll {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .sc-quick-scroll::-webkit-scrollbar {
          height: 3px;
        }

        .sc-quick-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,217,255,.2);
        }

        .sc-quick-button {
          flex-shrink: 0;
          border: 1px solid rgba(0,217,255,.15);
          background: rgba(255,255,255,.05);
          color: #e2e8f0;
          border-radius: 10px;
          padding: 7px 10px;
          font-size: 12px;
          cursor: pointer;
          transition:
            transform .2s ease,
            background .2s ease,
            border-color .2s ease;
        }

        .sc-quick-button:hover:not(:disabled) {
          transform: translateY(-2px);
          background: rgba(13,110,253,.12);
          border-color: rgba(0,217,255,.3);
        }

        .sc-quick-button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .sc-shortcuts {
          display: flex;
          gap: 8px;
          padding: 8px 12px;
        }

        .sc-shortcut {
          flex: 1;
          border-radius: 9px;
          transition: transform .2s ease;
        }

        .sc-shortcut:hover {
          transform: translateY(-1px);
        }

        .sc-input-area {
          padding: 10px 12px 12px;
          background: rgba(0,0,0,.18);
        }

        .sc-send-button {
          min-width: 48px;
          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .sc-send-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 7px 18px rgba(13,110,253,.25);
        }

        .sc-powered {
          font-size: 10px;
        }

        @keyframes aiPulse {
          0%, 100% {
            box-shadow:
              0 0 25px rgba(0,217,255,.35),
              0 10px 35px rgba(0,0,0,.4);
          }
          50% {
            box-shadow:
              0 0 38px rgba(0,217,255,.52),
              0 10px 35px rgba(0,0,0,.4);
          }
        }

        @keyframes chatOpen {
          from {
            opacity: 0;
            transform: translateY(15px) scale(.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes messageIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes avatarFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes dots {
          0%, 100% {
            opacity: .35;
          }
          50% {
            opacity: 1;
          }
        }

        @media (max-width: 576px) {
          .sc-ai-button-wrap {
            right: 16px;
            bottom: 16px;
          }

          .sc-ai-button {
            width: 60px;
            height: 60px;
            font-size: 27px;
          }

          .sc-chat-window {
            right: 10px;
            bottom: 10px;
            width: calc(100vw - 20px);
            height: calc(100vh - 20px);
            max-height: calc(100vh - 20px);
            border-radius: 18px;
          }

          .sc-message-wrapper {
            max-width: 90%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sc-ai-button,
          .sc-chat-window,
          .sc-ai-avatar,
          .sc-message-row,
          .sc-typing {
            animation: none;
          }

          .sc-messages {
            scroll-behavior: auto;
          }
        }
      `}</style>

      {/* FLOATING AI BUTTON */}
      {!isOpen && (
        <div className="sc-ai-button-wrap">
          <div className="sc-ai-tooltip">
            🤖 Ask Smart Courier AI
          </div>

          <button
            type="button"
            className="sc-ai-button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Smart Courier AI"
          >
            🤖
          </button>
        </div>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="sc-chat-window">

          {/* HEADER */}
          <div className="sc-chat-header">
            <div className="d-flex align-items-center gap-2">
              <div className="sc-ai-avatar">
                🤖
              </div>

              <div>
                <h6 className="fw-bold mb-0">
                  Smart Courier AI
                </h6>

                <small className="sc-online">
                  ● Online Assistant
                </small>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="sc-header-button"
                onClick={handleClearChat}
                title="Clear chat"
              >
                🗑️
              </button>

              <button
                type="button"
                className="sc-header-button"
                onClick={() => setIsOpen(false)}
                title="Close chatbot"
              >
                ✕
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="sc-messages">
            <div
              className="text-center mb-4"
              style={{
                fontSize: "11px",
                color: "#64748b",
              }}
            >
              Smart Courier AI Assistant
            </div>

            {messages.map((item, index) => (
              <div
                key={index}
                className={`sc-message-row ${item.sender}`}
              >
                <div className="sc-message-wrapper">
                  <div
                    className={`sc-message ${item.sender}`}
                  >
                    {item.sender === "bot" && (
                      <span className="me-1">
                        🤖
                      </span>
                    )}

                    {item.text}
                  </div>

                  <div
                    className={`sc-message-meta ${item.sender}`}
                  >
                    <small className="sc-message-time">
                      {item.time}
                    </small>

                    {item.sender === "bot" && (
                      <button
                        type="button"
                        className="sc-copy-button"
                        onClick={() =>
                          copyMessage(item.text)
                        }
                        title="Copy response"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {loading && (
              <div className="d-flex justify-content-start mb-3">
                <div className="sc-typing">
                  🤖
                  <span className="ms-2">
                    Thinking...
                  </span>
                  <span className="ms-1 sc-dots">
                    •••
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div className="sc-quick-section">
            <small className="text-muted d-block mb-2">
              Quick actions
            </small>

            <div className="sc-quick-scroll">
              {quickQuestions.map(
                (item, index) => (
                  <button
                    key={index}
                    type="button"
                    className="sc-quick-button"
                    onClick={() =>
                      handleQuickAction(item)
                    }
                    disabled={loading}
                  >
                    {item.icon} {item.text}
                  </button>
                )
              )}
            </div>
          </div>

          {/* SHORTCUTS */}
          <div className="sc-shortcuts">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary sc-shortcut"
              onClick={handleTracking}
            >
              📍 Track
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline-primary sc-shortcut"
              onClick={handleBookParcel}
            >
              📦 Book
            </button>
          </div>

          {/* INPUT */}
          <div className="sc-input-area">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="d-flex gap-2"
            >
              <input
                type="text"
                className="form-control"
                placeholder="Ask about your parcel..."
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                disabled={loading}
              />

              <button
                type="submit"
                className="btn btn-primary sc-send-button"
                disabled={
                  loading ||
                  !message.trim()
                }
              >
                {loading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                  />
                ) : (
                  "➤"
                )}
              </button>
            </form>

            <div className="text-center mt-2">
              <small className="text-muted sc-powered">
                Powered by Smart Courier AI
              </small>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;