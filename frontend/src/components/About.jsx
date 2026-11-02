import { CloudSun, Sparkles, Shield, Cpu, Languages } from "lucide-react";

export function About() {
  return (
    <section className="page-section" style={{ width: "100%" }}>
      <div className="section-title">
        <div>
          <div className="flex items-center gap-2">
            <CloudSun size={24} className="text-sky-400" />
            <h1>About WeatherGPT</h1>
          </div>
          <p>Conversational meteorological intelligence for everyone.</p>
        </div>
      </div>

      <div className="about-card">
        <div className="about-logo">
          <CloudSun size={48} className="text-sky-400" />
        </div>
        <h2>WeatherGPT Meteorological AI Platform</h2>
        <p>
          Our meteorological decision platform is engineered to transform raw atmospheric telemetry into
          actionable insight through conversational intelligence, live synoptic data, threshold hazard warnings,
          decision support, multilingual processing, and voice accessibility.
        </p>

        <div className="about-pills">
          <span className="about-pill">
            <Sparkles size={14} className="inline mr-1 text-sky-400" />
            Real-time Telemetry
          </span>
          <span className="about-pill">
            <Cpu size={14} className="inline mr-1 text-indigo-400" />
            Gemini AI Reasoning
          </span>
          <span className="about-pill">
            <Languages size={14} className="inline mr-1 text-emerald-400" />
            Multilingual Support
          </span>
          <span className="about-pill">
            <Shield size={14} className="inline mr-1 text-rose-400" />
            Atmospheric Safety
          </span>
        </div>
      </div>
    </section>
  );
}

export default About;
