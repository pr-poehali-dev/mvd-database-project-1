import { useState } from "react";
import Icon from "@/components/ui/icon";

const users = [
  { id: "U-01", name: "Иванов А.П.", badge: "МВД-77-0412", role: "Старший инспектор", access: "full", status: "online", lastSeen: "Сейчас" },
  { id: "U-02", name: "Сидорова Н.К.", badge: "МВД-77-0388", role: "Инспектор", access: "limited", status: "online", lastSeen: "5 мин назад" },
  { id: "U-03", name: "Карпов Е.Д.", badge: "МВД-77-0501", role: "Администратор", access: "admin", status: "offline", lastSeen: "2 часа назад" },
  { id: "U-04", name: "Громов Р.С.", badge: "МВД-77-0312", role: "Оперативный дежурный", access: "readonly", status: "offline", lastSeen: "вчера" },
  { id: "U-05", name: "Яковлева Д.М.", badge: "МВД-77-0445", role: "Инспектор", access: "limited", status: "online", lastSeen: "Сейчас" },
];

const accessMap: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: "Администратор", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  full: { label: "Полный доступ", color: "text-primary", bg: "bg-primary/10" },
  limited: { label: "Ограниченный", color: "text-foreground", bg: "bg-muted" },
  readonly: { label: "Только чтение", color: "text-muted-foreground", bg: "bg-muted/50" },
};

export default function SectionAdmin() {
  const [tab, setTab] = useState<"users" | "security" | "backup">("users");

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground tracking-wide">Администрирование</h2>
        <p className="text-xs text-muted-foreground">Управление пользователями и безопасностью</p>
      </div>

      {/* Tabs */}
      <div className="px-5 border-b border-border flex gap-0">
        {[
          { id: "users", label: "Пользователи", icon: "Users" },
          { id: "security", label: "Безопасность", icon: "Shield" },
          { id: "backup", label: "Резервное копирование", icon: "HardDrive" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs border-b-2 transition-colors ${
              tab === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon name={t.icon as "Users"} size={13} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tab === "users" && (
          <div className="animate-fade-in">
            <div className="px-5 py-3 flex items-center justify-between border-b border-border">
              <span className="text-xs text-muted-foreground">{users.length} пользователей в системе</span>
              <button className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1.5 rounded transition-colors">
                <Icon name="UserPlus" size={12} />
                Добавить сотрудника
              </button>
            </div>
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Сотрудник</th>
                  <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden md:table-cell">Должность</th>
                  <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Доступ</th>
                  <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Статус</th>
                  <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden lg:table-cell">Последний вход</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover-row group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                          <Icon name="User" size={13} className="text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-foreground font-medium">{u.name}</div>
                          <div className="text-muted-foreground font-mono-ibm">{u.badge}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{u.role}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${accessMap[u.access].bg} ${accessMap[u.access].color}`}>
                        {accessMap[u.access].label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === "online" ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
                        <span className={u.status === "online" ? "text-green-400" : "text-muted-foreground"}>
                          {u.status === "online" ? "Онлайн" : "Офлайн"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground hidden lg:table-cell">{u.lastSeen}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-muted transition-colors">
                          <Icon name="Edit3" size={13} />
                        </button>
                        <button className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-muted transition-colors">
                          <Icon name="UserX" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "security" && (
          <div className="p-5 space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: "Двухфакторная аутентификация", desc: "Обязательно для всех пользователей", enabled: true, icon: "Smartphone" },
                { label: "Шифрование базы данных", desc: "ГОСТ Р 34.12-2015 (Кузнечик)", enabled: true, icon: "Lock" },
                { label: "Автоблокировка сессии", desc: "Через 15 минут неактивности", enabled: true, icon: "Timer" },
                { label: "Логирование всех операций", desc: "Защищённый неизменяемый журнал", enabled: true, icon: "ClipboardList" },
                { label: "Блокировка по IP", desc: "Только корпоративная сеть МВД", enabled: false, icon: "Globe" },
                { label: "VPN-туннель", desc: "Шифрованный канал передачи данных", enabled: true, icon: "Network" },
              ].map((s) => (
                <div key={s.label} className="flex items-start gap-3 bg-card border border-border rounded p-3.5 hover:border-primary/30 transition-colors">
                  <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${s.enabled ? "bg-primary/10 border border-primary/20" : "bg-muted border border-border"}`}>
                    <Icon name={s.icon as "Lock"} size={14} className={s.enabled ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-foreground">{s.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded ${s.enabled ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"}`}>
                    {s.enabled ? "Вкл" : "Выкл"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "backup" && (
          <div className="p-5 space-y-3 animate-fade-in">
            <div className="bg-green-500/10 border border-green-500/20 rounded p-3.5 flex items-center gap-3">
              <Icon name="CheckCircle" size={16} className="text-green-400" />
              <div>
                <div className="text-sm font-medium text-foreground">Последнее резервное копирование</div>
                <div className="text-xs text-muted-foreground">02.04.2026 в 03:00 — выполнено успешно (8.7 ГБ)</div>
              </div>
            </div>
            {[
              { date: "02.04.2026 03:00", size: "8.7 ГБ", type: "Полная копия", status: "ok" },
              { date: "01.04.2026 03:00", size: "8.6 ГБ", type: "Полная копия", status: "ok" },
              { date: "31.03.2026 03:00", size: "8.4 ГБ", type: "Полная копия", status: "ok" },
              { date: "30.03.2026 03:00", size: "8.4 ГБ", type: "Полная копия", status: "warn" },
            ].map((b) => (
              <div key={b.date} className="flex items-center justify-between bg-card border border-border rounded px-4 py-3">
                <div className="flex items-center gap-3">
                  <Icon name={b.status === "ok" ? "HardDrive" : "AlertCircle"} size={14} className={b.status === "ok" ? "text-muted-foreground" : "text-yellow-400"} />
                  <div>
                    <div className="text-xs text-foreground font-mono-ibm">{b.date}</div>
                    <div className="text-xs text-muted-foreground">{b.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono-ibm text-muted-foreground">{b.size}</span>
                  <button className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                    <Icon name="RotateCcw" size={11} />
                    Восстановить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
