import { TrendingUp, Sparkles } from "lucide-react";

export function Climate({ location }) {
  return (
    <section className="page-section" style={{ width: "100%" }}>
      <div className="section-title">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={24} className="text-sky-400" />
            <h1>Long-term Climate Perspectives</h1>
          </div>
          <p>Longitudinal historical meteorological trends and anomalies for {location?.name}.</p>
        </div>
      </div>

      <div className="climate-large">
        <div className="climate-head">
          <div>
            <small>Multi-Decadal Temperature Anomaly</small>
            <strong>20-Year Baseline Shift Comparison</strong>
          </div>
          <b className="anomaly-badge text-amber-400">+1.2°C Projected Variance</b>
        </div>

        <div className="climate-chart">
          <div className="bars">
            {[34, 40, 37, 46, 43, 51, 48, 58, 54, 62, 59, 70].map((h, i) => (
              <i style={{ height: `${h}%` }} key={i} title={`Year offset -${12 - i}`} />
            ))}
          </div>
        </div>

        <div className="climate-insight">
          <Sparkles size={20} className="text-amber-400 shrink-0" />
          <div>
            <strong>Synoptic Analysis Insight</strong>
            <p>
              WeatherGPT analyzes regional climate normals against live telemetry to project long-term seasonal
              drift, precipitation shifts, and heat index changes for agricultural and municipal planning.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Climate;
