import { useState } from "react";

export function TrendCard({ weather, unit = "C" }) {
  const [activeTab, setActiveTab] = useState("Temp");

  const daily = weather?.daily;
  const rawTimes = daily?.time || [];

  // Extract raw values based on the active tab
  const getRawData = () => {
    if (!daily) return [25, 25, 25, 25, 25, 25, 25];

    if (activeTab === "Rainfall") {
      return daily.rain_sum || daily.precipitation_sum || Array(7).fill(0);
    }
    if (activeTab === "Humidity") {
      return daily.precipitation_probability_max || Array(7).fill(50);
    }

    // Temperature (Converted according to selected unit)
    const temps = daily.temperature_2m_max || Array(7).fill(25);
    if (unit === "F") {
      return temps.map((t) => Math.round((t * 9) / 5 + 32));
    }
    return temps.map((t) => Math.round(t));
  };

  const values = getRawData();
  const days = rawTimes.length
    ? rawTimes
        .slice(0, 7)
        .map((t) =>
          new Date(t).toLocaleDateString("en-US", { weekday: "short" }),
        )
    : ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];

  // Compute scale boundaries for dynamic SVG plotting
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  // Map values to 600x220 SVG pixel space
  const points = values.slice(0, 7).map((v, i) => {
    const x = 30 + i * (540 / Math.max(values.length - 1, 1));
    const y = 170 - ((v - minVal) / range) * 120;
    return { x, y, val: v };
  });

  const linePath = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    "",
  );

  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} 210 L ${points[0].x} 210 Z`
    : "";

  const yLabelUnit =
    activeTab === "Temp" ? `°${unit}` : activeTab === "Rainfall" ? "mm" : "%";

  return (
    <section className="panel trend-panel">
      <div className="panel-head">
        <div>
          <h2>Weather Trends</h2>
          <p>Quick view of the week</p>
        </div>

        <div className="segmented">
          {["Temp", "Rainfall", "Humidity"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "selected" : ""}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="trend-chart">
        <div className="y-axis">
          <span>
            {Math.round(maxVal)}
            {yLabelUnit}
          </span>
          <span>
            {Math.round((maxVal + minVal) / 2)}
            {yLabelUnit}
          </span>
          <span>
            {Math.round(minVal)}
            {yLabelUnit}
          </span>
        </div>

        <svg
          viewBox="0 0 600 220"
          preserveAspectRatio="none"
          aria-label="Weather trend graph"
        >
          {areaPath && <path d={areaPath} fill="currentColor" opacity=".08" />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
          )}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="6" fill="currentColor" />
          ))}
        </svg>
      </div>

      <div className="trend-labels">
        {days.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
    </section>
  );
}
