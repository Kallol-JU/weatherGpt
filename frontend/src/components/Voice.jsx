import { useState } from "react";
import { Mic, Square, Volume2 } from "lucide-react";

export function Voice({ onAsk, language }) {
  const [listening, setListening] = useState(false);

  const toggleVoice = () => {
    const next = !listening;
    setListening(next);
    if (!listening && onAsk) {
      onAsk("What are the current weather conditions and forecast?");
    }
  };

  return (
    <section className="page-section" style={{ width: "100%" }}>
      <div className="section-title">
        <div>
          <div className="flex items-center gap-2">
            <Volume2 size={24} className="text-sky-400" />
            <h1>Voice WeatherGPT Interaction</h1>
          </div>
          <p>Hands-free voice conversational queries in supported Indian and international languages.</p>
        </div>
      </div>

      <div className={`voice-card ${listening ? "listening" : ""}`}>
        <div className="voice-rings">
          <button
            type="button"
            className="voice-mic-trigger"
            onClick={toggleVoice}
            aria-label={listening ? "Stop listening" : "Start speaking"}
          >
            {listening ? (
              <Square size={24} className="text-rose-400" />
            ) : (
              <Mic size={28} className="text-sky-400" />
            )}
          </button>
        </div>

        <h2>{listening ? "Actively Listening..." : "Speak Naturally"}</h2>
        <p>
          {listening
            ? "Try asking: “Is heavy rain expected in the next few hours?”"
            : "Tap the audio sensor and ask any question regarding local or regional meteorology."}
        </p>

        <button
          type="button"
          className={`btn-glass btn-glass-md ${listening ? "btn-glass-danger" : "btn-glass-cyan"}`}
          onClick={toggleVoice}
        >
          {listening ? (
            <>
              <Square size={16} className="inline mr-1 text-rose-400" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic size={16} className="inline mr-1 text-sky-400" />
              Start Voice Input
            </>
          )}
        </button>

        <small className="voice-lang-tag">
          Configured Speech Language: {language === "HI" ? "Hindi (हिन्दी)" : "English"}
        </small>
      </div>
    </section>
  );
}

export default Voice;
