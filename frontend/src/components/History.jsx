import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  History as HistoryIcon,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";

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

  return (
    <section className="page-section" style={{ width: "100%" }}>
      <div className="section-title">
        <div>
          <div className="flex items-center gap-2">
            <HistoryIcon size={24} className="text-sky-400" aria-hidden="true" />
            <h1>Query History & Archives</h1>
          </div>
          <p>Review and resume previously synthesized meteorological sessions.</p>
        </div>
      </div>

      <div className="history-card">
        {pairs.length === 0 ? (
          <div className="empty-state">
            No archived consultations yet. Ask the assistant a question and it
            will appear here.
          </div>
        ) : (
          pairs.map((item, i) => {
            const isExpanded = expandedIndex === i;
            const detailsId = `history-answer-${i}`;

            return (
              <div
                key={item.id ?? i}
                className={`history-item-wrapper ${isExpanded ? "open" : ""}`}
              >
                <div className="history-row">
                  <button
                    type="button"
                    className="history-main"
                    onClick={() => onSelect && onSelect(item.question)}
                  >
                    <MessageSquare
                      size={18}
                      className="text-sky-400 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="history-content-col">
                      <strong>{item.question}</strong>
                      {item.timestamp && (
                        <small>
                          <Clock size={12} aria-hidden="true" />
                          <span>
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </small>
                      )}
                    </span>
                  </button>

                  {item.answer && (
                    <button
                      type="button"
                      className="expand-btn"
                      onClick={() => setExpandedIndex(isExpanded ? null : i)}
                      aria-expanded={isExpanded}
                      aria-controls={detailsId}
                    >
                      <span>{isExpanded ? "Collapse" : "Expand"}</span>
                      {isExpanded ? (
                        <ChevronUp size={14} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={14} aria-hidden="true" />
                      )}
                    </button>
                  )}
                </div>

                {isExpanded && item.answer && (
                  <div className="history-details" id={detailsId}>
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

export default History;
