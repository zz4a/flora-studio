import type { DailyObservation, Plot } from "@/types";
import { getSeedCopy } from "@/lib/mockData";

const STORAGE_KEY = "florastudio-demo-v1";
export interface PersistedState { plots: Plot[]; observations: DailyObservation[]; updatedAt?: string }

function isPlot(value: unknown): value is Plot {
  if (!value || typeof value !== "object") return false;
  const plot = value as Partial<Plot>;
  return typeof plot.id === "string" && typeof plot.code === "string" && typeof plot.name === "string" &&
    typeof plot.crop === "string" && typeof plot.image === "string" && typeof plot.area === "number" &&
    typeof plot.plantedAt === "string" && Array.isArray(plot.images) && Array.isArray(plot.growthHistory) &&
    !!plot.location && typeof plot.location === "object" && !!plot.environment && typeof plot.environment === "object";
}
function isObservation(value: unknown): value is DailyObservation {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<DailyObservation>;
  return typeof item.id === "string" && typeof item.plotId === "string" && typeof item.dateTime === "string" &&
    typeof item.weather === "string" && typeof item.temperature === "number" && typeof item.humidity === "number" &&
    (item.soilMoisture === null || typeof item.soilMoisture === "number") &&
    (item.rainfall === null || typeof item.rainfall === "number");
}

export function readStoredState(): PersistedState {
  if (typeof window === "undefined") return getSeedCopy();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getSeedCopy();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (!Array.isArray(parsed.plots) || !Array.isArray(parsed.observations)) return getSeedCopy();
    if (!parsed.plots.every(isPlot) || !parsed.observations.every(isObservation)) return getSeedCopy();
    const plotIds = new Set(parsed.plots.map(plot => plot.id));
    if (parsed.observations.some(observation => !plotIds.has(observation.plotId))) return getSeedCopy();
    return { plots: parsed.plots, observations: parsed.observations, updatedAt: parsed.updatedAt };
  } catch {
    return getSeedCopy();
  }
}

export function writeStoredState(state: PersistedState) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, updatedAt: new Date().toISOString() })); }
  catch { /* Quota or browser privacy settings: app remains usable in memory. */ }
}

export function clearStoredState() {
  if (typeof window !== "undefined") { try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* Browser privacy mode: in-memory reset still succeeds. */ } }
}
