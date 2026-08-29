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
  onStop, // 1. Added onStop prop
}) {
  const endRef = useRef(null);
  const recognitionRef = useRef(null); // 2. Store mic instance to allow stopping
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

  // --- Voice to Text Handler ---
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
    recognitionRef.current = recognition; // Save instance to ref
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
      // Append spoken text to whatever is already typed in the input
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
          // 3. Toggle start/stop based on recording state
          onClick={isRecording ? stopVoiceInput : startVoiceInput}
          disabled={streaming} // Removed isRecording from disabled logic
          style={{
            color: isRecording ? "#ff4757" : "inherit",
            animation: isRecording ? "pulse 1.5s infinite" : "none",
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

        {/* 4. Swap Send icon for Stop icon when generating */}
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

      {!connected && (
        <button className="login-hint" type="button" onClick={onLogin}>
          Sign in to unlock the live WeatherGPT assistant
        </button>
      )}
      <p className="chat-disclaimer">
        WeatherGPT can make mistakes. Please verify important information.
      </p>
    </aside>
  );
}
