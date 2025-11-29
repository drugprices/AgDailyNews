export interface MarketSnapshot {
  instrument: string;
  current_price: number;
  change_absolute: number;
  change_percent: number;
  day_high: number;
  day_low: number;
  reason_label?: string;
}

export interface WeatherToday {
  date: string;
  temp_high: number;
  temp_low: number;
  precipitation_chance: number;
  wind_speed: number;
  conditions: string;
  risk_flags: string[];
  summary_sentence: string;
}

export interface WeatherForecastDay {
  date: string;
  temp_high: number;
  temp_low: number;
  precipitation_chance: number;
  conditions: string;
}

export interface NewsStory {
  id: string;
  headline: string;
  source: string;
  published_at: string;
  url: string;
  summary_bullets: string[];
  tags: string[];
}

export const mockMarkets: MarketSnapshot[] = [
  {
    instrument: "CORN",
    current_price: 452.5,
    change_absolute: 2.25,
    change_percent: 0.5,
    day_high: 453.0,
    day_low: 450.75,
    reason_label: "USDA stocks up"
  },
  {
    instrument: "SOYBEANS",
    current_price: 1035.0,
    change_absolute: -8.5,
    change_percent: -0.82,
    day_high: 1040,
    day_low: 1032,
    reason_label: "Weak export demand"
  },
  {
    instrument: "WHEAT",
    current_price: 612.75,
    change_absolute: 1.5,
    change_percent: 0.24,
    day_high: 615.0,
    day_low: 608.25,
    reason_label: "Dry Plains forecast"
  }
];

export const mockWeatherToday: WeatherToday = {
  date: "2025-03-15",
  temp_high: 68,
  temp_low: 52,
  precipitation_chance: 10,
  wind_speed: 12,
  conditions: "Sunny",
  risk_flags: [],
  summary_sentence: "Good planting conditions today."
};

export const mockWeatherForecast: WeatherForecastDay[] = [
  { date: "Sat", temp_high: 72, temp_low: 54, precipitation_chance: 10, conditions: "Sunny" },
  { date: "Sun", temp_high: 70, temp_low: 53, precipitation_chance: 20, conditions: "Partly Cloudy" },
  { date: "Mon", temp_high: 65, temp_low: 50, precipitation_chance: 60, conditions: "Rain" },
  { date: "Tue", temp_high: 68, temp_low: 51, precipitation_chance: 30, conditions: "Sunny" }
];

export const mockNews: NewsStory[] = [
  {
    id: "1",
    headline: "USDA corn stocks up 5% YoY",
    source: "USDA",
    published_at: "2025-03-15T08:00:00Z",
    url: "https://example.com/usda-corn-stocks",
    summary_bullets: [
      "Ending stocks above forecast",
      "May pressure near-term prices",
      "Export demand steady"
    ],
    tags: ["markets", "usda"]
  },
  {
    id: "2",
    headline: "Rain forecast for Midwest planting window",
    source: "DTN",
    published_at: "2025-03-15T07:30:00Z",
    url: "https://example.com/midwest-rain",
    summary_bullets: [
      "Heavy rain in western Corn Belt",
      "Could delay early planting",
      "Soil moisture improves in dry areas"
    ],
    tags: ["weather_impact"]
  }
];
