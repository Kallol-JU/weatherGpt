import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

function ChatMessage({ message }) {
  const isAssistant = message.role === "assistant";

  return (
    <article className={`chat-message ${message.role}`}>
      {isAssistant && <span className="bot-avatar">●</span>}

      <section>
        <div className="bubble">
          <ReactMarkdown>{message.text}</ReactMarkdown>
          {message.streaming && <span className="typing-caret" />}
        </div>

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
  language,
  onStop,
}) {
  const endRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

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

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Chrome or Edge.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.interimResults = false;

    const langCodes = {
      English: "en-IN",
      Hindi: "hi-IN",
      Bengali: "bn-IN",
      Tamil: "ta-IN",
      Telugu: "te-IN",
    };

    recognition.lang = langCodes[language] || "en-IN";

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
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
              : "Live AI Weather Assistant"}
          </p>
        </section>
      </header>

      {/* Messages */}
      <main className="chat-scroll">
        {messages.length === 0 ? (
          <section className="chat-empty">
            <span>✦</span>
            <h3>How can I help?</h3>
            <p>
              Ask me about weather, forecasts, warnings, climate, or local
              advice.
            </p>
          </section>
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={`${message.role}-${index}`} message={message} />
          ))
        )}

        {streaming && messages[messages.length - 1]?.role !== "assistant" && (
          <TypingIndicator />
        )}
        <span ref={endRef} />
      </main>

      {/* Quick actions */}
      <nav className="chat-quick" aria-label="Quick questions">
        {["Current weather", "5 day forecast", "Weather alerts"].map(
          (question) => (
            <button
              key={question}
              type="button"
              onClick={() => onQuick(question)}
              disabled={streaming}
            >
              {question}
            </button>
          ),
        )}
      </nav>

      {/* Input Form */}
      <form className="chat-input" onSubmit={submit}>
        <button
          type="button"
          className={`mic ${isRecording ? "recording" : ""}`}
          aria-label="Voice input"
          title={
            !connected ? "Sign in to use voice features" : "Use microphone"
          }
          onClick={() => {
            if (!connected) {
              alert("Sign in to use voice and location features.");
              if (onLogin) onLogin();
              return;
            }
            isRecording ? stopVoiceInput() : startVoiceInput();
          }}
          disabled={streaming}
          style={{
            color: isRecording ? "#ff4757" : "inherit",
            animation: isRecording ? "pulse 1.5s infinite" : "none",
            opacity: !connected ? 0.5 : 1,
            cursor: !connected ? "not-allowed" : "pointer",
          }}
        >
          {isRecording ? "◼" : "🎙️"}
        </button>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isRecording ? "Listening..." : "Ask anything about the weather..."
          }
          rows={1}
          disabled={streaming}
        />

        {streaming ? (
          <button
            className="send stop-btn"
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            style={{ fontSize: "1.2rem" }}
          >
            ◼
          </button>
        ) : (
          <button
            className="send"
            type="submit"
            disabled={!input.trim()}
            aria-label="Send message"
          >
            ➤
          </button>
        )}
      </form>

      <p className="chat-disclaimer">
        WeatherGPT can make mistakes. Please verify important information.
      </p>
    </aside>
  );
}
