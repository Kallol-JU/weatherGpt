import { useState } from "react";
import ReactMarkdown from "react-markdown";

export function History({ history = [], onSelect }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Group adjacent user questions and AI responses
  const pairs = [];
  for (let i = 0; i < history.length; i++) {
    const current = history[i];
    if (current.role === "user" || !current.role) {
      const nextMsg = history[i + 1];
      const isNextModel =
        nextMsg && (nextMsg.role === "model" || nextMsg.role === "assistant");

      pairs.push({
        id: i,
        question: current.message || current.text || "",
        answer: isNextModel ? nextMsg.message || nextMsg.text : null,
        timestamp: current.timestamp,
      });

      if (isNextModel) i++; // Skip AI message since it is paired
    }
  }

  const toggleExpand = (e, index) => {
    e.stopPropagation(); // Prevents triggering onSelect when expanding
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="page-section">
      <div className="section-title">
        <div>
          <h1>Chat history</h1>
          <p>Continue a previous WeatherGPT conversation.</p>
        </div>
      </div>

      <div className="history-card">
        {pairs.length === 0 ? (
          <div className="empty-state">No saved conversations yet.</div>
        ) : (
          pairs.map((item, i) => {
            const isExpanded = expandedIndex === i;

            return (
              <div
                key={i}
                className={`history-item-wrapper ${isExpanded ? "open" : ""}`}
                style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}
              >
                <div
                  className="history-row"
                  onClick={() => onSelect && onSelect(item.question)}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <span style={{ marginRight: "12px" }}>💬</span>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <strong>{item.question}</strong>
                    {item.timestamp && (
                      <small style={{ display: "block", opacity: 0.7 }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </small>
                    )}
                  </div>

                  {item.answer && (
                    <button
                      type="button"
                      className="expand-btn"
                      onClick={(e) => toggleExpand(e, i)}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "none",
                        color: "#fff",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        marginLeft: "12px",
                      }}
                    >
                      {isExpanded ? "Collapse ▲" : "Expand ▼"}
                    </button>
                  )}
                </div>

                {isExpanded && item.answer && (
                  <div
                    className="history-details"
                    style={{
                      padding: "12px 16px 16px 44px",
                      background: "rgba(0, 0, 0, 0.2)",
                      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                      textAlign: "left",
                    }}
                  >
                    <ReactMarkdown>{item.answer}</ReactMarkdown>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
