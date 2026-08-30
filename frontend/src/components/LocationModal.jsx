import { useState } from "react";
import { geocodeCity } from "../services/api";

export function LocationModal({ current, onClose, onChange }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recent = ["Kolkata", "Mumbai", "Delhi", "Bengaluru", "Chennai"];

  async function choose(value) {
    setLoading(true);
    setError("");
    try {
      const p = await geocodeCity(value);
      onChange(p);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          // Reverse geocoding to translate coordinates into a readable city name
          const mapTilerKey =
            import.meta.env.VITE_MAPTILER_API_KEY || "skvm1S2eynHwdOdazyId";
          const res = await fetch(
            `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${mapTilerKey}`,
          );
          const data = await res.json();

          let cityName = "Current Location";
          let admin1 = "";
          let country = "India";

          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            cityName = feature.text || cityName;

            const stateFeature = data.features.find((f) =>
              f.place_type.includes("region"),
            );
            if (stateFeature) admin1 = stateFeature.text;

            const countryFeature = data.features.find((f) =>
              f.place_type.includes("country"),
            );
            if (countryFeature) country = countryFeature.text;
          }

          onChange({
            name: `${cityName}${admin1 ? `, ${admin1}` : ""}`,
            country: country,
            admin1: admin1,
            latitude: latitude,
            longitude: longitude,
            timezone: "auto",
          });

          onClose();
        } catch (e) {
          setError("Could not retrieve location details.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location access denied by browser.");
        } else {
          setError("Could not use your current location.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }

  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <div className="location-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-title">
          <div>
            <h2>Choose your location</h2>
            <p>WeatherGPT uses this location for forecasts and advice.</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>

        <form
          className="location-search"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) choose(query.trim());
          }}
        >
          <span>⌕</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city or location..."
          />
          <button disabled={loading}>Search</button>
        </form>

        {error && <div className="form-error">{error}</div>}

        <button
          className="current-location-btn"
          onClick={useCurrentLocation}
          disabled={loading}
        >
          {loading ? "Fetching..." : "⌖ Use my current location"}
        </button>

        <span className="modal-label">Recent locations</span>
        {recent.map((x) => (
          <button
            key={x}
            className={`location-option ${current?.name === x ? "selected" : ""}`}
            onClick={() => choose(x)}
          >
            ⌖ {x}
            <span>{current?.name === x ? "✓" : "›"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
