import { formatTemp } from "./weather.js";

const SECTOR_GROUPS = {
  "Urban & General": "general",
  Agriculture: "agriculture",
  "Fisheries & Maritime": "maritime",
  "Construction & Labor": "outdoor",
  "Logistics & Transport": "transport",
  "Public Safety": "safety",
};

const SECTOR_LABELS = {
  "Urban & General": "Urban & general",
  Agriculture: "Agriculture & farming",
  "Fisheries & Maritime": "Fisheries & maritime",
  "Construction & Labor": "Construction & labor",
  "Logistics & Transport": "Logistics & transport",
  "Public Safety": "Public safety & relief",
};

const ROLE_GROUPS = [
  {
    group: "safety",
    words: ["safety", "emergency", "rescue", "relief", "police", "fire"],
  },
  {
    group: "agriculture",
    words: ["farmer", "farm", "agri", "crop", "field"],
  },
  {
    group: "maritime",
    words: ["fisher", "fish", "boat", "marine", "port", "sail"],
  },
  {
    group: "outdoor",
    words: ["construction", "labor", "labour", "worker", "site", "outdoor"],
  },
  {
    group: "transport",
    words: ["driver", "delivery", "transport", "logistic", "route", "truck"],
  },
  {
    group: "general",
    words: ["student", "commuter", "office", "teacher"],
  },
];

const ACTIONS = {
  aqi: {
    general: "Sensitive groups should limit prolonged outdoor exertion.",
    safety:
      "Limit prolonged outdoor deployment, rotate crews, and keep AQI alerts on.",
    agriculture:
      "Shift prolonged field work, take breaks, and keep AQI alerts on.",
    maritime: "Limit prolonged deck work and keep AQI alerts on.",
    outdoor:
      "Shift prolonged outdoor work, take breaks, and keep AQI alerts on.",
    transport:
      "Limit prolonged outdoor loading and keep AQI alerts on.",
  },
  heat: {
    general: "Limit midday exertion and hydrate.",
    safety: "Rotate crews, take shade breaks, and hydrate.",
    agriculture: "Work early or late, take shade breaks, and hydrate.",
    maritime: "Take shade breaks and hydrate.",
    outdoor:
      "Schedule strenuous work for cooler hours, take shade breaks, and hydrate.",
    transport: "Take shade breaks and keep water in the cab.",
  },
  rain: {
    general: "Carry rain protection and allow extra commute time.",
    safety: "Watch roads and field conditions, and keep alerts on.",
    agriculture: "Hold irrigation or spraying and check field drainage.",
    maritime: "Check wind and visibility before departure.",
    outdoor: "Secure loose materials, cover work areas, and plan indoor tasks.",
    transport: "Allow extra time, increase following distance, and check visibility.",
  },
  wind: {
    general: "Secure loose outdoor items and take care in exposed areas.",
    safety: "Secure equipment and avoid exposed positions.",
    agriculture: "Secure equipment and postpone spraying.",
    maritime: "Postpone small-boat work and check the next hourly wind shift.",
    outdoor: "Secure loose materials and postpone work at height.",
    transport: "Reduce speed and secure loads.",
  },
  visibility: {
    general: "Allow extra travel time and use fog lights if driving.",
    safety: "Use extra lighting and keep crews in contact.",
    agriculture: "Delay field work until visibility improves.",
    maritime: "Use radar, reduce speed, and check the next hourly visibility.",
    outdoor: "Keep crews together and use marked walkways.",
    transport: "Use fog lights, reduce speed, and allow extra time.",
  },
  uv: {
    general: "Use sun protection and seek shade during midday.",
    safety: "Cover up, rotate crews, and schedule shade breaks.",
    agriculture: "Cover up and schedule field work around peak sun.",
    maritime: "Cover up and keep water on hand.",
    outdoor: "Cover up, use sun protection, and schedule shade breaks.",
    transport: "Use sun protection and keep water in the cab.",
  },
  thunder: {
    general: "Move indoors and keep severe-weather alerts on.",
    safety: "Stage response early and keep severe-weather alerts on.",
    agriculture: "Bring equipment in and keep severe-weather alerts on.",
    maritime: "Stay off the water and keep severe-weather alerts on.",
    outdoor:
      "Stop work at height, move crews indoors, and keep severe-weather alerts on.",
    transport: "Delay unnecessary travel and keep severe-weather alerts on.",
  },
};

const DEFAULT_TIPS = {
  general:
    "A reasonable window to be outside. Check the hourly forecast before heading out.",
  agriculture:
    "A workable window for field tasks. Check the hourly rain signal before spraying.",
  maritime:
    "Conditions are manageable. Check the hourly wind shift before departure.",
  outdoor:
    "Workable conditions. Keep water on hand and watch the afternoon radar.",
  transport:
    "A good travel window. Check the next hourly update for rain or visibility changes.",
  safety:
    "No significant hazard in the current reading. Keep alerts on and monitor the hourly outlook.",
};

function groupFor(user) {
  const role = (user?.customDomain || "").trim().toLowerCase();

  if (role) {
    const match = ROLE_GROUPS.find(({ words }) =>
      words.some((word) => role.includes(word)),
    );
    if (match) return match.group;
  }

  return SECTOR_GROUPS[user?.sector] || "general";
}

function capitalize(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function compactFactors(values) {
  return [...new Set(values.filter(Boolean))].slice(0, 3);
}

export function buildWorkBrief({
  user,
  current = {},
  daily = {},
  aqiRaw,
  rainChance,
  unit = "C",
}) {
  const group = groupFor(user);
  const role = (user?.customDomain || "").trim();
  const hasWork = Boolean(user?.sector || role);
  const label = role
    ? capitalize(role)
    : SECTOR_LABELS[user?.sector] || "General conditions";
  const title = hasWork ? "Work brief" : "Weather brief";

  const code = Number(current.weather_code ?? 0);
  const feels =
    current.apparent_temperature != null
      ? Number(current.apparent_temperature)
      : null;
  const wind = Number(current.wind_speed_10m ?? 0);
  const visibility =
    current.visibility != null ? Number(current.visibility) / 1000 : null;
  const uv = Number(daily.uv_index_max?.[0] ?? 0);
  const rain = Number(rainChance ?? 0);
  const precipitation = Number(current.precipitation ?? 0);
  const aqi =
    aqiRaw != null && !Number.isNaN(Number(aqiRaw)) ? Number(aqiRaw) : null;

  const feelsFactor = feels != null ? `Feels ${formatTemp(feels, unit)}` : null;
  const windFactor = wind > 0 ? `Wind ${Math.round(wind)} km/h` : null;
  const visibilityFactor =
    visibility != null ? `Visibility ${Math.round(visibility)} km` : null;
  const uvFactor = uv > 0 ? `UV ${Math.round(uv)}` : null;
  const aqiFactor = aqi != null ? `AQI ${aqi}` : null;

  const rainNow = precipitation > 0;
  const rainyCode = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code);
  const rainFactor = rainNow
    ? "Rain now"
    : rain > 0
      ? `Rain ${rain}%`
      : rainyCode
        ? "Rain"
        : null;

  const thunder = code >= 95 && code <= 99;
  const isRain = rainNow || rainyCode || rain >= 60;
  const aqiLimit = aqi != null && aqi >= 100;
  const heatLimit = feels != null && feels >= (group === "general" ? 38 : 35);
  const windLimit = wind >= (["maritime", "outdoor", "transport"].includes(group) ? 30 : 40);
  const visibilityLimit = visibility != null && visibility < 2;
  const uvLimit = uv >= 8;

  const signals = [];

  if (thunder) {
    signals.push({
      tip: `Thunderstorms are in the current reading. ${ACTIONS.thunder[group]}`,
      factors: compactFactors(["Thunderstorms", rainFactor, aqiFactor]),
    });
  }

  if (aqiLimit) {
    const level =
      aqi >= 200
        ? "very unhealthy"
        : aqi >= 150
          ? "unhealthy"
          : "in the sensitive range";
    const action =
      group === "general" && aqi < 150
        ? ACTIONS.aqi.general
        : ACTIONS.aqi[group];
    signals.push({
      tip: `Air quality is ${level}. ${action}`,
      factors: compactFactors([aqiFactor, rainFactor, feelsFactor]),
    });
  }

  if (heatLimit) {
    signals.push({
      tip: `Heat stress is a risk. ${ACTIONS.heat[group]}`,
      factors: compactFactors([feelsFactor, uvFactor, rainFactor]),
    });
  }

  if (isRain) {
    const condition = rainNow
      ? "Rain is falling."
      : rainyCode
        ? "Rain is in the current reading."
        : "Rain is likely today.";
    signals.push({
      tip: `${condition} ${ACTIONS.rain[group]}`,
      factors: compactFactors([rainFactor, aqiFactor, feelsFactor]),
    });
  }

  if (windLimit) {
    signals.push({
      tip: `Winds are gusty. ${ACTIONS.wind[group]}`,
      factors: compactFactors([windFactor, rainFactor, visibilityFactor]),
    });
  }

  if (visibilityLimit) {
    signals.push({
      tip: `Visibility is low. ${ACTIONS.visibility[group]}`,
      factors: compactFactors([visibilityFactor, windFactor, rainFactor]),
    });
  }

  if (uvLimit) {
    signals.push({
      tip: `UV is high. ${ACTIONS.uv[group]}`,
      factors: compactFactors([uvFactor, feelsFactor, rainFactor]),
    });
  }

  const primary = signals[0];

  return {
    title,
    label,
    tip: primary?.tip || DEFAULT_TIPS[group],
    factors:
      primary?.factors ||
      compactFactors([feelsFactor, rainFactor, aqiFactor]),
  };
}
