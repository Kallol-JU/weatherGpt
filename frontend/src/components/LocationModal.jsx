import { useRef, useState } from "react";
import { Search, MapPin, Check, ChevronRight, X, Navigation } from "lucide-react";
import { geocodeCity } from "../services/api";
import { useDialog } from "../hooks/useDialog";

export function LocationModal({ current, onClose, onChange }) {
  const [query, setQuery] = useState("");
  const dialogRef = useRef(null);

  useDialog(true, onClose, dialogRef);
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
        } catch {
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
      <div
        className="location-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-title"
        ref={dialogRef}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-title">
          <div>
            <h2 id="location-title">Choose Location</h2>
            <p>Select target meteorological coordinates for forecasts and advisories.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form
          className="location-search"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) choose(query.trim());
          }}
        >
          <Search size={18} className="text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city, district, or coordinates..."
            aria-label="Search city, district, or coordinates"
          />
          <button disabled={loading}>Search</button>
        </form>

        {error && <div className="form-error">{error}</div>}

        <button
          type="button"
          className="current-location-btn"
          onClick={useCurrentLocation}
          disabled={loading}
        >
          <Navigation size={16} className="inline mr-2 text-sky-400" />
          {loading ? "Locating Sensor Coordinates..." : "Use Current GPS Location"}
        </button>

        <span className="modal-label">Major Meteorological Stations</span>
        {recent.map((x) => (
          <button
            key={x}
            type="button"
            className={`location-option ${current?.name?.includes(x) ? "selected" : ""}`}
            onClick={() => choose(x)}
          >
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-sky-400" />
              <span>{x}</span>
            </div>
            <span>
              {current?.name?.includes(x) ? (
                <Check size={16} className="text-emerald-400" />
              ) : (
                <ChevronRight size={16} className="text-slate-500" />
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default LocationModal;
