import { useState } from "react";
import { Sprout, Plane, Waves, Building2, CheckCircle2, ArrowRight } from "lucide-react";

export function Advisories({ location, onAsk }) {
  const [activeTab, setActiveTab] = useState(0);

  const advisorySectors = [
    {
      id: "agri",
      title: "Agriculture & Farming",
      icon: Sprout,
      prompt: "Is today suitable for agricultural sowing, irrigation, and field operations?",
      description: "Crop spraying feasibility, soil moisture guidance, and evapotranspiration management.",
    },
    {
      id: "aviation",
      title: "Aviation & Flight Safety",
      icon: Plane,
      prompt: "What are the aviation parameters, cloud ceiling, and turbulence risk?",
      description: "Visibility minimums, surface wind shear, and convective cloud tops for flight planning.",
    },
    {
      id: "marine",
      title: "Marine & Coastal Operations",
      icon: Waves,
      prompt: "What are the marine wind conditions, wave chop, and coastal risks?",
      description: "Coastal swell risk, offshore wind gusts, and small-craft advisory checks.",
    },
    {
      id: "urban",
      title: "Urban Logistics & Commute",
      icon: Building2,
      prompt: "Is there any urban weather risk, heat stress, or transit impact today?",
      description: "Heat island exposure, sudden rain impact on transit corridors, and pedestrian safety.",
    },
  ];

  return (
    <section className="page-section" style={{ width: "100%" }}>
      <div className="section-title">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={24} className="text-sky-400" />
            <h1>Domain-Specific Advisories</h1>
          </div>
          <p>Convert live meteorological telemetry into actionable operational decisions for {location?.name}.</p>
        </div>
      </div>

      <div
        className="advisory-tabs"
        role="tablist"
        aria-label="Advisory sectors"
      >
        {advisorySectors.map((sector, i) => {
          const IconComp = sector.icon;
          const isActive = activeTab === i;
          return (
            <button
              type="button"
              className={`advisory-tab-btn ${isActive ? "active" : ""}`}
              key={sector.id}
              id={`advisory-tab-${sector.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls="advisory-panel"
              onClick={() => setActiveTab(i)}
            >
              <IconComp size={16} aria-hidden="true" />
              <span>{sector.title}</span>
            </button>
          );
        })}
      </div>

      <div
        className="advisory-card"
        id="advisory-panel"
        role="tabpanel"
        aria-labelledby={`advisory-tab-${advisorySectors[activeTab].id}`}
        tabIndex={0}
      >
        <div className="advisory-card-header">
          <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
          <div>
            <strong>Operational Guidance for {location?.name || "Target Area"}</strong>
            <p>{advisorySectors[activeTab].description}</p>
          </div>
        </div>

        <div className="advisory-actions-group">
          {advisorySectors.map((sector) => {
            const IconComponent = sector.icon;
            return (
              <button
                key={sector.id}
                type="button"
                className="btn-glass btn-glass-sm"
                onClick={() => onAsk(sector.prompt)}
              >
                <IconComponent
                  size={14}
                  className="inline mr-1 text-sky-400"
                  aria-hidden="true"
                />
                <span>{sector.title} Query</span>
                <ArrowRight size={12} className="inline ml-1" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Advisories;
