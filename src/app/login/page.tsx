"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, ShieldCheck, UserCheck, ArrowRight, Lock, Mail, Sun, Moon, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { usePlantation } from "@/context/PlantationContext";
import type { UserRole } from "@/types";

export default function LoginPage() {
  const { login, notify } = usePlantation();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("user@florastudio.id");
  const [password, setPassword] = useState("user123");
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    if (role === "admin") {
      setEmail("admin@florastudio.id");
      setPassword("admin123");
    } else {
      setEmail("user@florastudio.id");
      setPassword("user123");
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const expectedEmail = selectedRole === "admin" ? "admin@florastudio.id" : "user@florastudio.id";
    const expectedPassword = selectedRole === "admin" ? "admin123" : "user123";

    setTimeout(() => {
      if (email === expectedEmail && password === expectedPassword) {
        login(selectedRole);
        router.push("/dashboard");
      } else {
        notify("Email atau kata sandi salah!", "error");
        setIsSubmitting(false);
      }
    }, 400);
  };

  return (
    <div className="relative min-h-screen grid lg:grid-cols-2 bg-[var(--surface)] text-[var(--on-surface)] transition-colors duration-300">
      {/* Floating Theme Toggle Button */}
      <motion.button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Ganti tema terang atau gelap"
        className="m3-focus absolute top-5 right-5 z-50 flex items-center gap-2 rounded-full border border-[var(--outline-variant)] bg-[var(--surface-container-high)]/80 px-4 py-2.5 text-xs font-bold shadow-md backdrop-blur-md hover:bg-[var(--surface-container-highest)]"
        whileHover={{ scale: 1.05, rotate: 3 }}
        whileTap={{ scale: 0.92 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === "dark" ? (
            <motion.span
              key="sun"
              className="flex items-center gap-2 text-amber-400"
              initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
              transition={{ duration: 0.2 }}
            >
              <Sun size={17} />
              <span>Mode Terang</span>
            </motion.span>
          ) : (
            <motion.span
              key="moon"
              className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300"
              initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
              transition={{ duration: 0.2 }}
            >
              <Moon size={17} />
              <span>Mode Gelap</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Left Column - Hero Banner */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-[var(--primary-container)] text-[var(--on-primary-container)]">
        <motion.div
          className="relative z-10 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            className="grid h-12 w-12 place-items-center rounded-2xl bg-white/60 text-[var(--primary)] shadow-sm dark:bg-black/30"
            whileHover={{ rotate: 12, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Sprout size={28} />
          </motion.span>
          <span className="font-display text-3xl font-semibold tracking-tight">
            Flora<span className="text-[var(--primary)]">Studio</span>
          </span>
        </motion.div>

        <motion.div
          className="relative z-10 max-w-lg my-auto space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.span
            className="inline-flex items-center gap-2 rounded-full bg-white/40 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm dark:bg-black/30"
            whileHover={{ scale: 1.04 }}
          >
            <Sparkles size={14} className="text-[var(--primary)]" /> Sistem Manajemen Kebun Harian
          </motion.span>
          <h1 className="font-display text-5xl font-medium leading-tight">
            Pantau Kebun, Kelola Tanaman, dan Catat Setiap Perkembangan.
          </h1>
          <p className="text-base leading-relaxed opacity-90">
            Akses platform dengan hak akses terpisah antara Operator Kebun (User Biasa) dan Administrator.
          </p>
        </motion.div>

        <motion.div
          className="relative z-10 text-xs opacity-75"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ delay: 0.4 }}
        >
          © 2026 FloraStudio · Garden & Plantation Monitoring
        </motion.div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          className="w-full max-w-md space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {/* Mobile Logo & Welcome */}
          <div className="text-center lg:text-left space-y-2">
            <motion.div
              className="inline-flex lg:hidden items-center gap-2 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--primary-container)] text-[var(--on-primary-container)]">
                <Sprout size={22} />
              </span>
              <span className="font-display text-2xl font-semibold">
                Flora<span className="text-[var(--primary)]">Studio</span>
              </span>
            </motion.div>
            <h2 className="font-display text-3xl font-semibold">Selamat Datang Kembali</h2>
            <p className="text-sm text-[var(--on-surface-variant)]">Pilih peran akun untuk melanjutkan ke dashboard.</p>
          </div>

          {/* Role Selection Tabs with Animated Pill */}
          <div className="grid grid-cols-2 gap-3 p-1.5 rounded-3xl bg-[var(--surface-container)] relative">
            <motion.button
              type="button"
              onClick={() => handleSelectRole("user")}
              className={`relative z-10 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition-colors ${
                selectedRole === "user"
                  ? "text-[var(--primary)] font-extrabold"
                  : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              {selectedRole === "user" && (
                <motion.div
                  layoutId="activeRoleBg"
                  className="absolute inset-0 rounded-2xl bg-[var(--surface)] shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <UserCheck size={16} /> User Biasa
              </span>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => handleSelectRole("admin")}
              className={`relative z-10 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition-colors ${
                selectedRole === "admin"
                  ? "text-[var(--primary)] font-extrabold"
                  : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              {selectedRole === "admin" && (
                <motion.div
                  layoutId="activeRoleBg"
                  className="absolute inset-0 rounded-2xl bg-[var(--surface)] shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <ShieldCheck size={16} /> Administrator
              </span>
            </motion.button>
          </div>

          {/* Access Permissions Box with Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedRole}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4 text-xs space-y-2 shadow-sm"
            >
              <div className="font-bold flex items-center gap-2 text-[var(--primary)]">
                {selectedRole === "user" ? <UserCheck size={15} /> : <ShieldCheck size={15} />}
                Izin Akses {selectedRole === "user" ? "User Biasa" : "Admin"}:
              </div>
              {selectedRole === "user" ? (
                <p className="text-[var(--on-surface-variant)] leading-relaxed">
                  • <strong>Bisa</strong>: Menambah & menghapus catatan kondisi harian.<br />
                  • <strong>Tidak Bisa</strong>: Membuat/mengubah/menghapus lahan dan tanaman.
                </p>
              ) : (
                <p className="text-[var(--on-surface-variant)] leading-relaxed">
                  • <strong>Bisa</strong>: Akses penuh untuk membuat, mengubah, dan menghapus seluruh data lahan, tanaman, serta catatan harian.
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Form Credentials */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <motion.div whileHover={{ scale: 1.005 }} transition={{ duration: 0.1 }}>
              <label className="mb-1.5 block text-xs font-bold text-[var(--on-surface-variant)]">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="m3-focus min-h-12 w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] pl-11 pr-4 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                />
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.005 }} transition={{ duration: 0.1 }}>
              <label className="mb-1.5 block text-xs font-bold text-[var(--on-surface-variant)]">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)]" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="m3-focus min-h-12 w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] pl-11 pr-4 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="m3-focus m3-ripple w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-6 text-sm font-bold text-[var(--on-primary)] shadow-md transition hover:opacity-95 disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memproses Login...
                </span>
              ) : (
                <>
                  Masuk sebagai {selectedRole === "admin" ? "Admin" : "User Biasa"} <ArrowRight size={17} />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
