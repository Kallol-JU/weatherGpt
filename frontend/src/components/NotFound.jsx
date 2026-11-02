import { Compass, CloudOff } from "lucide-react";

export function NotFound({ onHome }) {
  return (
    <section className="not-found-page" role="alert" aria-label="Page Not Found">
      <div className="not-found-card">
        <div className="not-found-icon-wrap">
          <CloudOff size={64} className="text-slate-400" strokeWidth={1.5} />
          <span className="not-found-badge">404</span>
        </div>

        <h1>Lost in the Atmosphere</h1>
        <p>
          The forecast or route you are looking for has drifted off the radar.
          The requested coordinate or view is not available.
        </p>

        <div className="not-found-actions">
          <button
            type="button"
            className="btn-glass btn-glass-md btn-glass-cyan"
            onClick={onHome}
          >
            <Compass size={16} className="inline mr-2" />
            Return to Dashboard
          </button>
        </div>
      </div>
    </section>
  );
}

export default NotFound;

