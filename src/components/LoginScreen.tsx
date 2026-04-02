import { useState } from "react";
import Icon from "@/components/ui/icon";
import { store, type Employee } from "@/lib/store";

interface Props {
  onLogin: (user: Employee) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<Employee | null>(null);

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = store.authenticate(login, password);
    if (!user) { setError("Неверный логин или пароль"); return; }
    setLoading(true);
    setPendingUser(user);
    setTimeout(() => { setLoading(false); setStep("2fa"); }, 900);
  };

  const handleOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) { setError("Введите 6-значный код"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (pendingUser) {
        store.addLog({ action: "Вход в систему", user: pendingUser.name, target: "Успешная авторизация", ip: "10.0.1.x", type: "auth" });
        onLogin(pendingUser);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full max-w-md px-4 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-primary/30 bg-primary/10 mb-4 scan-line">
            <Icon name="Shield" size={28} className="text-primary" />
          </div>
          <div className="text-xs font-mono-ibm text-muted-foreground tracking-[0.3em] uppercase mb-1">Министерство Внутренних Дел</div>
          <h1 className="text-xl font-semibold text-foreground tracking-wide">АИС МВД — Реестр</h1>
          <div className="text-xs text-muted-foreground mt-1">Автоматизированная информационная система</div>
        </div>
        <div className="bg-card border border-border rounded p-6 glow-blue">
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded px-3 py-2 mb-5">
            <Icon name="AlertTriangle" size={14} className="text-destructive shrink-0" />
            <span className="text-xs text-destructive font-mono-ibm">ОГРАНИЧЕННЫЙ ДОСТУП — только авторизованные сотрудники</span>
          </div>
          {step === "credentials" ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 tracking-wider uppercase">Табельный номер</label>
                <div className="relative">
                  <Icon name="User" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" value={login} onChange={(e) => setLogin(e.target.value)}
                    className="w-full bg-muted border border-border rounded pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="МВД-77-0412" />
                </div>
                <p className="text-xs text-muted-foreground/70 mt-1.5">
                  Инспектор: МВД-77-0412 · Начальник: МВД-77-0501 · Пароль: 1234
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 tracking-wider uppercase">Пароль</label>
                <div className="relative">
                  <Icon name="Lock" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-muted border border-border rounded pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="••••••••" />
                </div>
              </div>
              {error && <div className="text-xs text-destructive flex items-center gap-1.5"><Icon name="AlertCircle" size={12} />{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded text-sm tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Icon name="Loader2" size={14} className="animate-spin" />Проверка...</> : <><Icon name="LogIn" size={14} />Войти в систему</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="space-y-4">
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/15 border border-primary/30 mb-3">
                  <Icon name="Smartphone" size={18} className="text-primary" />
                </div>
                <p className="text-sm text-foreground font-medium">Двухфакторная аутентификация</p>
                <p className="text-xs text-muted-foreground mt-0.5">Введите любые 6 цифр (демо-режим)</p>
              </div>
              <input type="text" value={otp} maxLength={6} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-muted border border-border rounded px-3 py-3 text-center text-2xl tracking-[0.5em] text-foreground font-mono-ibm focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                placeholder="000000" />
              {error && <div className="text-xs text-destructive flex items-center gap-1.5"><Icon name="AlertCircle" size={12} />{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded text-sm tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Icon name="Loader2" size={14} className="animate-spin" />Верификация...</> : <><Icon name="ShieldCheck" size={14} />Подтвердить вход</>}
              </button>
              <button type="button" onClick={() => { setStep("credentials"); setOtp(""); setError(""); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1">← Назад</button>
            </form>
          )}
        </div>
        <div className="text-center mt-4 text-xs text-muted-foreground font-mono-ibm">
          Версия 3.14.2 · Все действия протоколируются
        </div>
      </div>
    </div>
  );
}
