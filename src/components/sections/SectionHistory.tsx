import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { store, type LogEntry } from "@/lib/store";

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  view: { icon: "Eye", color: "text-blue-400", bg: "bg-blue-500/10" },
  edit: { icon: "Edit3", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  upload: { icon: "Upload", color: "text-primary", bg: "bg-primary/10" },
  export: { icon: "Download", color: "text-purple-400", bg: "bg-purple-500/10" },
  delete: { icon: "Trash2", color: "text-destructive", bg: "bg-destructive/10" },
  auth: { icon: "LogIn", color: "text-green-400", bg: "bg-green-500/10" },
  create: { icon: "Plus", color: "text-green-400", bg: "bg-green-500/10" },
  search: { icon: "Search", color: "text-muted-foreground", bg: "bg-muted" },
  admin: { icon: "Settings", color: "text-orange-400", bg: "bg-orange-500/10" },
};

export default function SectionHistory() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => { setLogs(store.getLogs()); }, []);

  const today = new Date().toLocaleDateString("ru-RU");
  const todayLogs = logs.filter((l) => l.time.startsWith(today));
  const deleteLogs = logs.filter((l) => l.type === "delete");
  const editLogs = logs.filter((l) => l.type === "edit" || l.type === "create");
  const authLogs = logs.filter((l) => l.type === "auth");

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">История операций</h2>
          <p className="text-xs text-muted-foreground">Защищённый журнал всех действий</p>
        </div>
      </div>

      <div className="px-5 py-3 border-b border-border grid grid-cols-4 gap-3">
        {[
          { label: "За сегодня", value: todayLogs.length, icon: "Activity" },
          { label: "Изменений", value: editLogs.length, icon: "Edit3" },
          { label: "Авторизаций", value: authLogs.length, icon: "LogIn" },
          { label: "Удалений", value: deleteLogs.length, icon: "Trash2" },
        ].map((s) => (
          <div key={s.label} className="bg-muted/30 border border-border rounded p-2.5">
            <div className="text-lg font-semibold text-foreground font-mono-ibm">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <Icon name="ClipboardList" size={28} className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">История пуста</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Все действия будут записываться сюда</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Действие</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden md:table-cell">Сотрудник</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden lg:table-cell">Объект</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Время</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((e) => {
                const cfg = typeConfig[e.type] ?? typeConfig.view;
                return (
                  <tr key={e.id} className="border-b border-border/50 hover-row">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${cfg.bg}`}>
                          <Icon name={cfg.icon as "Eye"} size={11} className={cfg.color} />
                        </span>
                        <span className="text-foreground">{e.action}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{e.user}</td>
                    <td className="px-3 py-3 text-muted-foreground hidden lg:table-cell truncate max-w-xs">{e.target}</td>
                    <td className="px-3 py-3 font-mono-ibm text-muted-foreground">{e.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="px-5 py-2 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{logs.length} записей</span>
        <div className="flex items-center gap-1.5">
          <Icon name="Lock" size={11} className="text-green-400" />
          <span className="text-xs text-green-400">Журнал защищён от изменений</span>
        </div>
      </div>
    </div>
  );
}
