import { useEffect, useRef } from "react";

function ChatMessage({ message }) {
  const isAssistant = message.role === "assistant";

  return (
    <article className={`chat-message ${message.role}`}>
      {isAssistant && <span className="bot-avatar">●</span>}

      <section>
        <p className="bubble">
          {message.text}
          {message.streaming && <span className="typing-caret" />}
        </p>

        {message.time && <time>{message.time}</time>}
      </section>
    </article>
  );
}

function TypingIndicator() {
  return (
    <article className="chat-message assistant">
      <span className="bot-avatar">●</span>

      <p className="bubble typing">
        <i />
        <i />
        <i />
      </p>
    </article>
  );
}

export function ChatPanel({
  messages = [],
  input,
  setInput,
  onSend,
  onQuick,
  connected,
  streaming,
  onLogin,
}) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages, streaming]);

  const submit = (event) => {
    event.preventDefault();

    const text = input.trim();

    if (!text || streaming) return;

    onSend(text);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit(event);
    }
  };

  return (
    <aside className="chat-panel">

      {/* Header */}
      <header className="chat-head">
        <span className="ai-logo">✦</span>

        <section>
          <h2>WeatherGPT</h2>

          <p>
            <i className={connected ? "online" : "offline"} />
            {connected
              ? "Your AI Weather Assistant"
              : "Sign in to use live AI chat"}
          </p>
        </section>

        <nav className="chat-head-actions">
          <button type="button" aria-label="New chat">
            ↶
          </button>

          <button type="button" aria-label="More options">
            ⋮
          </button>
        </nav>
      </header>

      {/* Messages */}
      <main className="chat-scroll">
        {messages.length === 0 ? (
          <section className="chat-empty">
            <span>✦</span>
            <h3>How can I help?</h3>
            <p>
              Ask me about weather, forecasts, warnings,
              climate, or local advice.
            </p>
          </section>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={`${message.role}-${index}`}
              message={message}
            />
          ))
        )}

        {streaming &&
          messages[messages.length - 1]?.role !== "assistant" && (
            <TypingIndicator />
          )}

        <span ref={endRef} />
      </main>

      {/* Quick actions */}
      <nav className="chat-quick" aria-label="Quick questions">
        {[
          "Current weather",
          "5 day forecast",
          "Weather alerts",
        ].map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => onQuick(question)}
            disabled={streaming}
          >
            {question}
          </button>
        ))}
      </nav>

      {/* Input */}
      <form className="chat-input" onSubmit={submit}>
        <button
          type="button"
          className="mic"
          aria-label="Voice input"
        >
          🎙️
        </button>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about the weather..."
          rows={1}
          disabled={streaming}
        />

        <button
          className="send"
          type="submit"
          disabled={!input.trim() || streaming}
          aria-label="Send message"
        >
          ➤
        </button>
      </form>

      {!connected && (
        <button
          className="login-hint"
          type="button"
          onClick={onLogin}
        >
          Sign in to unlock the live WeatherGPT assistant
        </button>
      )}

      <p className="chat-disclaimer">
        WeatherGPT can make mistakes. Please verify important information.
      </p>

    </aside>
  );
}