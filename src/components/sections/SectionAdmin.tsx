import { useState } from "react";
import Icon from "@/components/ui/icon";
import { store, ROLE_LABELS, type Employee } from "@/lib/store";

const accessColor: Record<string, string> = {
  chief: "text-yellow-400 bg-yellow-500/10",
  admin: "text-orange-400 bg-orange-500/10",
  senior_inspector: "text-primary bg-primary/10",
  inspector: "text-foreground bg-muted",
};

export default function SectionAdmin({ user }: { user: Employee }) {
  const [tab, setTab] = useState<"users" | "security" | "backup">("users");
  const employees = store.getEmployees();

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Администрирование</h2>
        <p className="text-xs text-muted-foreground">Управление системой</p>
      </div>
      <div className="px-5 border-b border-border flex gap-0">
        {[{ id: "users", label: "Пользователи", icon: "Users" }, { id: "security", label: "Безопасность", icon: "Shield" }, { id: "backup", label: "Резервные копии", icon: "HardDrive" }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs border-b-2 transition-colors ${tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon name={t.icon as "Users"} size={13} />{t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        {tab === "users" && (
          <div className="animate-fade-in">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{employees.length} сотрудников</span>
            </div>
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Сотрудник</th>
                  <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden md:table-cell">Отдел</th>
                  <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Роль</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((u) => (
                  <tr key={u.id} className={`border-b border-border/50 ${u.id === user.id ? "bg-primary/5" : "hover-row"}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                          <Icon name="User" size={13} className="text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-foreground font-medium flex items-center gap-1.5">
                            {u.name}
                            {u.id === user.id && <span className="text-xs text-primary font-mono-ibm">(вы)</span>}
                          </div>
                          <div className="text-muted-foreground font-mono-ibm">{u.badge}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{u.department}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${accessColor[u.role] ?? "text-foreground bg-muted"}`}>{ROLE_LABELS[u.role]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "security" && (
          <div className="p-5 space-y-3 animate-fade-in">
            {[
              { label: "Двухфакторная аутентификация", desc: "Обязательно для всех пользователей", enabled: true, icon: "Smartphone" },
              { label: "Шифрование базы данных", desc: "ГОСТ Р 34.12-2015 (Кузнечик)", enabled: true, icon: "Lock" },
              { label: "Автоблокировка сессии", desc: "Через 15 минут неактивности", enabled: true, icon: "Timer" },
              { label: "Логирование операций", desc: "Защищённый неизменяемый журнал", enabled: true, icon: "ClipboardList" },
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
        )}
        {tab === "backup" && (
          <div className="p-5 space-y-3 animate-fade-in">
            <div className="bg-green-500/10 border border-green-500/20 rounded p-3.5 flex items-center gap-3">
              <Icon name="CheckCircle" size={16} className="text-green-400" />
              <div>
                <div className="text-sm font-medium text-foreground">Последнее резервное копирование</div>
                <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString("ru-RU")} — автоматическое</div>
              </div>
            </div>
            <div className="bg-card border border-border rounded p-4">
              <div className="text-xs text-muted-foreground mb-3">Данные в системе</div>
              <div className="space-y-2">
                {[
                  { label: "Профили", value: store.getProfiles().length },
                  { label: "Документы", value: store.getDocuments().length },
                  { label: "Записи журнала", value: store.getLogs().length },
                  { label: "Письма", value: store.getMail().length },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-mono-ibm text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm("Очистить все данные системы? Это действие необратимо.")) {
                  localStorage.removeItem("mvd_profiles");
                  localStorage.removeItem("mvd_documents");
                  localStorage.removeItem("mvd_mail");
                  localStorage.removeItem("mvd_logs");
                  localStorage.removeItem("mvd_face_checks");
                  store.addLog({ action: "Очистка данных", user: user.name, target: "Все данные удалены", ip: "10.0.1.x", type: "admin" });
                  window.location.reload();
                }
              }}
              className="flex items-center gap-2 border border-destructive/40 hover:border-destructive text-destructive text-xs px-4 py-2 rounded transition-colors">
              <Icon name="Trash2" size={13} />Очистить все данные
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
