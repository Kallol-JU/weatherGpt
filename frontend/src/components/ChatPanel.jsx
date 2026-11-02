import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowUp,
  CalendarDays,
  ChevronRight,
  CloudSun,
  LogIn,
  Mic,
  ShieldAlert,
  Sparkles,
  Square,
  StopCircle,
} from "lucide-react";
import "./ChatPanel.css";

const SUGGESTIONS = [
  {
    icon: CloudSun,
    title: "Today's conditions",
    detail: "Temperature, rain, and wind",
    prompt: "What are the current weather conditions?",
  },
  {
    icon: CalendarDays,
    title: "The week ahead",
    detail: "Highs, lows, and rain for seven days",
    prompt: "What do the next seven days look like?",
  },
  {
    icon: ShieldAlert,
    title: "Hazard check",
    detail: "Active warnings and air quality",
    prompt: "Are there any active weather warnings or air quality concerns?",
  },
];

function TypingDots() {
  return (
    <span className="chat-typing" role="status" aria-label="WeatherGPT is thinking">
      <i />
      <i />
      <i />
    </span>
  );
}

function ChatMessage({ message }) {
  const isAssistant = message.role === "assistant";

  if (isAssistant) {
    return (
      <article className="chat-msg chat-msg--assistant">
        <div className="chat-msg__meta">
          <span>WeatherGPT</span>
          {message.time && <time>{message.time}</time>}
        </div>
        <div className="chat-msg__body">
          {message.text ? (
            <ReactMarkdown>{message.text}</ReactMarkdown>
          ) : message.streaming ? (
            <TypingDots />
          ) : null}
          {message.streaming && message.text && (
            <span className="typing-caret" aria-hidden="true" />
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="chat-msg chat-msg--user">
      <div className="chat-msg__body">
        <ReactMarkdown>{message.text}</ReactMarkdown>
      </div>
      {message.time && <time className="chat-msg__time">{message.time}</time>}
    </article>
  );
}

function ChatIntro({ location, authenticated, onQuick, onLogin }) {
  return (
    <div className="chat-intro">
      <h3>Ask about the weather</h3>
      <p>
        Current conditions, the week ahead, and local hazards
        {location?.name ? ` for ${location.name}` : ""}.
      </p>

      <div className="chat-suggestions">
        {SUGGESTIONS.map(({ icon: Icon, title, detail, prompt }) => (
          <button
            key={title}
            type="button"
            className="chat-suggestion"
            onClick={() => onQuick(prompt)}
          >
            <Icon size={16} aria-hidden="true" />
            <span className="chat-suggestion__text">
              <strong>{title}</strong>
              <small>{detail}</small>
            </span>
            <ChevronRight
              size={14}
              className="chat-suggestion__chevron"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      {!authenticated && onLogin && (
        <button type="button" className="chat-signin" onClick={onLogin}>
          <LogIn size={13} aria-hidden="true" />
          <span>
            <strong>Sign in</strong> to send messages and keep your history
          </span>
        </button>
      )}
    </div>
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
  authenticated = false,
  onLogin,
  language,
  location,
  onStop,
}) {
  const endRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    endRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
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

  const handleSuggestion = (prompt) => {
    onQuick(prompt);
    requestAnimationFrame(() => textareaRef.current?.focus());
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

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const status = !authenticated
    ? "Signed out"
    : connected
      ? "Online"
      : "Connecting…";
  const statusClass = !authenticated
    ? "chat-status--offline"
    : connected
      ? "chat-status--online"
      : "chat-status--pending";

  return (
    <aside className="chat-panel" aria-label="WeatherGPT assistant">
      <header className="chat-header">
        <span className="chat-header__mark" aria-hidden="true">
          <Sparkles size={15} />
        </span>
        <div className="chat-header__text">
          <h2>WeatherGPT</h2>
          <p className={`chat-status ${statusClass}`}>
            <i aria-hidden="true" />
            {status}
          </p>
        </div>
      </header>

      <div
        className={`chat-thread ${messages.length === 0 ? "chat-thread--empty" : ""}`}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={streaming}
        aria-label="Conversation"
      >
        {messages.length === 0 ? (
          <ChatIntro
            location={location}
            authenticated={authenticated}
            onQuick={handleSuggestion}
            onLogin={onLogin}
          />
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={`${message.role}-${index}`} message={message} />
          ))
        )}

        {streaming && messages[messages.length - 1]?.role !== "assistant" && (
          <article className="chat-msg chat-msg--assistant">
            <div className="chat-msg__meta">
              <span>WeatherGPT</span>
            </div>
            <TypingDots />
          </article>
        )}

        <span ref={endRef} />
      </div>

      <form
        className="chat-composer"
        onSubmit={submit}
        aria-label="Ask the weather assistant"
      >
        <div className="chat-field">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Message"
            placeholder={
              isRecording ? "Listening…" : "Ask about the weather"
            }
            rows={1}
            disabled={streaming}
          />

          {authenticated && (
            <button
              type="button"
              className={`chat-icon-btn ${isRecording ? "is-recording" : ""}`}
              aria-label={isRecording ? "Stop voice input" : "Use microphone"}
              title={isRecording ? "Stop recording" : "Use microphone"}
              onClick={isRecording ? stopVoiceInput : startVoiceInput}
              disabled={streaming}
            >
              {isRecording ? <Square size={14} /> : <Mic size={16} />}
            </button>
          )}

          {streaming ? (
            <button
              type="button"
              className="chat-send chat-send--stop"
              onClick={onStop}
              aria-label="Stop generating"
              title="Stop generating"
            >
              <StopCircle size={17} />
            </button>
          ) : (
            <button
              type="submit"
              className="chat-send"
              disabled={!input.trim()}
              aria-label="Send message"
              title="Send"
            >
              <ArrowUp size={17} />
            </button>
          )}
        </div>
      </form>

      <p className="chat-note">
        AI-generated guidance. Check official warnings before acting.
      </p>
    </aside>
  );
}

export default ChatPanel;
