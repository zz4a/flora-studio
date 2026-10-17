"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AppActivity, DailyObservation, ObservationFormValues, Plot, PlotFormValues, User, UserRole, PlantHealth } from "@/types";
import { getSeedCopy, SEED_PLOTS } from "@/lib/mockData";
import { clearStoredState, readStoredState, writeStoredState } from "@/lib/storage";

export const DEMO_USERS: Record<UserRole, User> = {
  admin: { id: "usr-admin", name: "Admin FloraStudio", email: "admin@florastudio.id", role: "admin" },
  user: { id: "usr-user", name: "Petani / Operator Kebun", email: "user@florastudio.id", role: "user" },
};

interface ToastMessage { id: string; message: string; tone: "success" | "error" | "info" }
interface PlantationContextValue {
  currentUser: User | null; login: (role: UserRole) => void; logout: () => void;
  plots: Plot[]; observations: DailyObservation[]; activities: AppActivity[]; hydrated: boolean; toasts: ToastMessage[];
  notify: (message: string, tone?: ToastMessage["tone"]) => void; dismissToast: (id: string) => void;
  addPlot: (values: PlotFormValues) => Plot | null; updatePlot: (id: string, values: PlotFormValues) => boolean; deletePlot: (id: string) => boolean;
  addObservation: (values: ObservationFormValues) => DailyObservation; updateObservation: (id: string, values: ObservationFormValues) => void; deleteObservation: (id: string) => void;
  resetDemoData: () => void;
}
const PlantationContext = createContext<PlantationContextValue | null>(null);
const makeId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
const now = () => new Date().toISOString();
const nextPlotCode = (plots: Plot[]) => {
  const used = new Set(plots.map(plot => plot.code));
  let serial = 1;
  while (used.has(`LHN-${String(serial).padStart(3, "0")}`)) serial += 1;
  return `LHN-${String(serial).padStart(3, "0")}`;
};
const observationHealthScore = (health: DailyObservation["plantHealth"]) =>
  health === "Sehat" ? 92 : health === "Perlu Perhatian" ? 68 : health === "Perawatan" ? 62 : 45;

const analyzeHealthFromNotes = (values: Omit<DailyObservation, "id">): PlantHealth => {
  const text = (values.growthNotes + " " + values.notes + " " + values.pestDisease).toLowerCase();
  
  // Prioritas tertinggi: Jika ada kata-kata krusial/kematian/penyakit parah
  if (text.match(/layu|kering|mati|busuk|berpenyakit|rontok parah|hama parah/)) return "Perawatan";
  
  // Prioritas kedua: Kekurangan nutrisi atau masalah ringan
  if (text.match(/kurang|lambat|pucat|kuning|kecil|hama|perlu perhatian/)) return "Perlu Perhatian";
  
  // Prioritas ketiga: Pertumbuhan baik
  if (text.match(/segar|subur|hijau|baik|sehat|mekar|tumbuh|berkembang/)) return "Sehat";
  
  return values.plantHealth; // Fallback ke yang dipilih manual
};

function applyObservationToPlot(plot: Plot, observation: DailyObservation): Plot {
  const date = observation.dateTime.slice(0, 10);
  const previous = plot.growthHistory.filter(record => record.date < date).sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const originalForDate = plot.growthHistory.find(record => record.date === date && !record.sourceObservationId);
  
  const textToAnalyze = (observation.growthNotes + " " + observation.notes + " " + observation.pestDisease).toLowerCase();
  let addedProgress = 0;
  if (textToAnalyze.match(/bertambah|tumbuh|berkembang|tinggi|muncul|berbuah|berbunga|meningkat|besar|lebat/)) {
      addedProgress = Math.floor(Math.random() * 3) + 4; // Tambah 4% sampai 6%
  } else if (observation.plantHealth === "Sehat") {
      addedProgress = Math.floor(Math.random() * 2) + 1; // Passive growth 1% sampai 2%
  }
  
  const prevProgress = previous ? previous.progress : plot.progress;
  const newProgress = Math.min(100, prevProgress + addedProgress);

  const record = {
    date,
    heightCm: originalForDate?.heightCm ?? previous?.heightCm ?? plot.growthHistory.at(-1)?.heightCm ?? 8,
    leaves: originalForDate?.leaves ?? previous?.leaves ?? plot.growthHistory.at(-1)?.leaves ?? 4,
    healthScore: observationHealthScore(observation.plantHealth),
    progress: newProgress,
    sourceObservationId: observation.id,
  };
  
  const growthHistory = [...plot.growthHistory.filter(item => item.sourceObservationId !== observation.id && !(item.sourceObservationId && item.date === date)), record].sort((a, b) => a.date.localeCompare(b.date));
  return {
    ...plot, 
    health: observation.plantHealth,
    progress: newProgress,
    environment: { temperature: observation.temperature, humidity: observation.humidity, soilMoisture: observation.soilMoisture, rainfall: observation.rainfall, weather: observation.weather },
    growthHistory,
  };
}

const cropImageMap: Record<string,string> = {
  "Cabai Merah":"https://images.unsplash.com/photo-1760627823649-3b353622c16e?auto=format&fit=crop&w=1200&q=85",
  "Tomat":"https://images.unsplash.com/photo-1692039743891-fc44365e09cb?auto=format&fit=crop&w=1200&q=85",
  "Terong Ungu":"https://images.unsplash.com/photo-1560951812-58e6bce53149?auto=format&fit=crop&w=1200&q=85",
  "Kangkung":"https://images.unsplash.com/photo-1569185835836-a9683f3c72a4?auto=format&fit=crop&w=1200&q=85",
  "Bayam Hijau":"https://images.unsplash.com/photo-1784043436675-dbe53cbcec88?auto=format&fit=crop&w=1200&q=85",
  "Jagung Manis":"https://images.unsplash.com/photo-1744726008519-5f9698b729f9?auto=format&fit=crop&w=1200&q=85",
  "Mentimun":"https://images.unsplash.com/photo-1725369865690-5a1a09f87e56?auto=format&fit=crop&w=1200&q=85",
  "Pakcoy":"https://images.unsplash.com/photo-1725369865403-82ca4f17bb5b?auto=format&fit=crop&w=1200&q=85",
};

export function PlantationProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [plots, setPlots] = useState<Plot[]>(() => getSeedCopy().plots);
  const [observations, setObservations] = useState<DailyObservation[]>(() => getSeedCopy().observations);
  const [activities, setActivities] = useState<AppActivity[]>([
    {id:"activity-start-1",message:"Demo FloraStudio siap digunakan",dateTime:"2026-10-17T07:00:00.000Z",type:"settings"},
  ]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    const stored = readStoredState(); setPlots(stored.plots); setObservations(stored.observations); 
    const savedUser = localStorage.getItem("flora_studio_active_user");
    if (savedUser) {
      try { setCurrentUser(JSON.parse(savedUser)); } catch { setCurrentUser(DEMO_USERS.user); }
    } else {
      setCurrentUser(null);
    }
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) writeStoredState({plots, observations}); }, [plots, observations, hydrated]);

  const login = useCallback((role: UserRole) => {
    const user = DEMO_USERS[role]; setCurrentUser(user); localStorage.setItem("flora_studio_active_user", JSON.stringify(user));
  }, []);
  const logout = useCallback(() => { setCurrentUser(null); localStorage.removeItem("flora_studio_active_user"); }, []);
  const notify = useCallback((message: string, tone: ToastMessage["tone"] = "success") => {
    const id = makeId("toast"); setToasts(current => [...current, {id,message,tone}]);
    window.setTimeout(() => setToasts(current => current.filter(t => t.id !== id)), 4000);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts(current => current.filter(t => t.id !== id)), []);
  const recordActivity = useCallback((message: string, type: AppActivity["type"]) => {
    setActivities(current => [{id:makeId("activity"),message,dateTime:now(),type}, ...current].slice(0,12));
  }, []);
  
  const addPlot = useCallback((values: PlotFormValues) => {
    if (currentUser?.role !== "admin") { notify("Akses ditolak. User Biasa hanya dapat mencatat observasi.", "error"); return null; }
    const image = values.image.trim() || cropImageMap[values.crop] || cropImageMap["Bayam Hijau"];
    const id = makeId("plot");
    const plot: Plot = {
      id, code:nextPlotCode(plots), name:values.name.trim(), crop:values.crop, variety:values.variety.trim() || "Varietas belum ditentukan",
      area:Number(values.area), areaUnit:values.areaUnit, plantedAt:values.plantedAt, population:Number(values.population),
      location:{province:values.province.trim() || "Riau",regency:values.regency.trim() || "Lokasi contoh",address:values.address.trim() || `Area contoh, ${values.regency || "Riau"}`,description:"Lokasi ilustratif untuk demonstrasi."},
      description:values.description.trim() || `Catatan demonstrasi untuk tanaman ${values.crop}.`, health:values.health,cultivationStatus:values.cultivationStatus,progress:Number(values.progress),
      image,imageAlt:`Foto ${values.crop}`,images:[{src:image,alt:`Foto ${values.crop}`,caption:values.crop}],notes:values.notes.trim(),
      environment:{temperature:28.5,humidity:72,soilMoisture:null,rainfall:null,weather:"Berawan"},
      growthHistory:[{date:values.plantedAt,heightCm:1,leaves:2,healthScore:values.health === "Sehat" ? 90 : 70,progress:Math.min(15,Number(values.progress))}]
    };
    setPlots(current => [...current,plot]); recordActivity(`Lahan ${plot.name} ditambahkan`,"plot"); notify("Lahan berhasil ditambahkan."); return plot;
  }, [currentUser, plots, notify, recordActivity]);
  
  const updatePlot = useCallback((id: string, values: PlotFormValues) => {
    if (currentUser?.role !== "admin") { notify("Akses ditolak. Hanya Admin yang dapat mengedit lahan.", "error"); return false; }
    setPlots(current => current.map(plot => plot.id !== id ? plot : ({...plot,name:values.name.trim(),crop:values.crop,variety:values.variety.trim(),area:Number(values.area),areaUnit:values.areaUnit,plantedAt:values.plantedAt,population:Number(values.population),location:{...plot.location,province:values.province.trim() || "Riau",regency:values.regency.trim(),address:values.address.trim(),description:plot.location.description},description:values.description.trim(),health:values.health,cultivationStatus:values.cultivationStatus,progress:Number(values.progress),image:values.image.trim() || plot.image,notes:values.notes.trim()})));
    recordActivity(`Data lahan ${values.name} diperbarui`,"plot"); notify("Perubahan lahan disimpan.");
    return true;
  },[currentUser, notify, recordActivity]);
  
  const deletePlot = useCallback((id: string) => {
    if (currentUser?.role !== "admin") { notify("Akses ditolak. User biasa tidak dapat menghapus lahan.", "error"); return false; }
    const plot = plots.find(p=>p.id===id); setPlots(current=>current.filter(p=>p.id!==id)); setObservations(current=>current.filter(o=>o.plotId!==id));
    if (plot) { recordActivity(`Lahan ${plot.name} dihapus`,"plot"); notify("Lahan dan catatan terkait telah dihapus.","info"); }
    return true;
  },[currentUser, plots, notify, recordActivity]);
  
  const reconcilePlotObservations = useCallback((plotId: string, records: DailyObservation[]) => {
    setPlots(current => current.map(plot => {
      if (plot.id !== plotId) return plot;
      const seed = SEED_PLOTS.find(item => item.id === plotId);
      const baseline: Plot = seed
        ? { ...plot, health: seed.health, progress: seed.progress, environment: structuredClone(seed.environment), growthHistory: structuredClone(seed.growthHistory) }
        : { ...plot, health: "Belum Ada Data", progress: plot.growthHistory[0]?.progress ?? 0, environment: { temperature: 28.5, humidity: 72, soilMoisture: null, rainfall: null, weather: "Berawan" }, growthHistory: plot.growthHistory.filter(record => !record.sourceObservationId) };
      return records.filter(item => item.plotId === plotId).slice().sort((a, b) => a.dateTime.localeCompare(b.dateTime)).reduce(applyObservationToPlot, baseline);
    }));
  }, []);
  
  const addObservation = useCallback((values: ObservationFormValues) => {
    const derivedHealth = analyzeHealthFromNotes(values);
    const observation: DailyObservation = { ...values, plantHealth: derivedHealth, id: makeId("obs") };
    const nextObservations = [observation, ...observations].sort((a, b) => b.dateTime.localeCompare(a.dateTime));
    
    setObservations(nextObservations); 
    reconcilePlotObservations(observation.plotId, nextObservations);
    recordActivity(`Catatan baru untuk ${plots.find(p => p.id === observation.plotId)?.name ?? "lahan"}`, "observation");
    
    if (derivedHealth !== values.plantHealth) {
       notify(`Kondisi otomatis diubah ke "${derivedHealth}" berdasarkan catatan Anda.`, "info");
    } else {
       notify("Catatan kondisi berhasil disimpan.");
    }
    return observation;
  }, [observations, plots, reconcilePlotObservations, notify, recordActivity]);
  
  const updateObservation = useCallback((id: string, values: ObservationFormValues) => {
    const previous = observations.find(item => item.id === id);
    const derivedHealth = analyzeHealthFromNotes(values);
    const observation: DailyObservation = { ...values, plantHealth: derivedHealth, id };
    const nextObservations = observations.map(item => item.id === id ? observation : item).sort((a, b) => b.dateTime.localeCompare(a.dateTime));
    
    setObservations(nextObservations);
    if (previous && previous.plotId !== observation.plotId) reconcilePlotObservations(previous.plotId, nextObservations);
    reconcilePlotObservations(observation.plotId, nextObservations);
    recordActivity("Catatan pemantauan diperbarui", "observation"); 
    
    if (derivedHealth !== values.plantHealth) {
       notify(`Catatan diperbarui. Status otomatis diubah ke "${derivedHealth}".`, "info");
    } else {
       notify("Catatan berhasil diperbarui.");
    }
  }, [observations, reconcilePlotObservations, notify, recordActivity]);
  
  const deleteObservation = useCallback((id: string) => {
    const removed = observations.find(item => item.id === id);
    const nextObservations = observations.filter(item => item.id !== id);
    setObservations(nextObservations);
    if (removed) reconcilePlotObservations(removed.plotId, nextObservations);
    recordActivity("Catatan pemantauan dihapus", "observation"); notify("Catatan dihapus.", "info");
  }, [observations, reconcilePlotObservations, notify, recordActivity]);
  
  const resetDemoData = useCallback(() => {
    const seed = getSeedCopy(); setPlots(seed.plots);setObservations(seed.observations);setActivities([{id:makeId("activity"),message:"Data demo dipulihkan ke kondisi awal",dateTime:now(),type:"settings"}]);clearStoredState();notify("Data demo dikembalikan ke delapan lahan awal.");
  },[notify]);
  
  const value = useMemo(()=>({currentUser,login,logout,plots,observations,activities,hydrated,toasts,notify,dismissToast,addPlot,updatePlot,deletePlot,addObservation,updateObservation,deleteObservation,resetDemoData}),[currentUser,login,logout,plots,observations,activities,hydrated,toasts,notify,dismissToast,addPlot,updatePlot,deletePlot,addObservation,updateObservation,deleteObservation,resetDemoData]);
  return <PlantationContext.Provider value={value}>{children}</PlantationContext.Provider>;
}
export function usePlantation() { const context = useContext(PlantationContext); if(!context) throw new Error("usePlantation harus digunakan di dalam PlantationProvider"); return context; }
