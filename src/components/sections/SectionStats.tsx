import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { store } from "@/lib/store";

export default function SectionStats() {
  const profiles = store.getProfiles();
  const docs = store.getDocuments();
  const logs = store.getLogs();
  const mails = store.getMail();

  const today = new Date().toLocaleDateString("ru-RU");
  const todayLogs = logs.filter((l) => l.time.startsWith(today));

  const riskCounts = useMemo(() => ({
    low: profiles.filter((p) => p.risk === "low").length,
    medium: profiles.filter((p) => p.risk === "medium").length,
    high: profiles.filter((p) => p.risk === "high").length,
  }), [profiles]);

  const regionMap: Record<string, number> = {};
  profiles.forEach((p) => { if (p.region) regionMap[p.region] = (regionMap[p.region] || 0) + 1; });
  const topRegions = Object.entries(regionMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxRegion = topRegions[0]?.[1] || 1;

  const handleExport = () => {
    const data = {
      generatedAt: new Date().toLocaleString("ru-RU"),
      profiles: { total: profiles.length, risk: riskCounts },
      documents: docs.length,
      logs: logs.length,
      mails: mails.length,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `report_${today.replace(/\./g, "-")}.json`;
    a.click(); URL.revokeObjectURL(url);
    store.addLog({ action: "Экспорт отчёта", user: "Начальник", target: `Отчёт за ${today}`, ip: "10.0.1.x", type: "export" });
  };

  return (
    <div className="flex flex-col h-full overflow-auto animate-fade-in">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Статистика и аналитика</h2>
          <p className="text-xs text-muted-foreground">Только для руководителей ★</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-1.5 border border-border hover:border-primary text-muted-foreground hover:text-primary text-xs px-3 py-1.5 rounded transition-colors">
          <Icon name="FileDown" size={12} />Сформировать отчёт
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Профилей в реестре", value: profiles.length, icon: "Users", color: "text-primary" },
            { label: "Документов всего", value: docs.length, icon: "FileText", color: "text-purple-400" },
            { label: "Операций сегодня", value: todayLogs.length, icon: "Activity", color: "text-yellow-400" },
            { label: "Писем в системе", value: mails.length, icon: "Mail", color: "text-green-400" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card border border-border rounded p-4 hover:border-primary/30 transition-colors">
              <Icon name={kpi.icon as "Users"} size={16} className={`${kpi.color} mb-2`} />
              <div className="text-2xl font-semibold text-foreground font-mono-ibm">{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded p-4">
            <h3 className="text-xs font-medium text-foreground tracking-wide uppercase mb-4">Профили по регионам</h3>
            {topRegions.length === 0 ? (
              <p className="text-xs text-muted-foreground">Нет данных — добавьте профили с регионом</p>
            ) : (
              <div className="space-y-2.5">
                {topRegions.map(([region, count]) => (
                  <div key={region}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{region}</span>
                      <span className="text-xs font-mono-ibm text-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(count / maxRegion) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded p-4">
            <h3 className="text-xs font-medium text-foreground tracking-wide uppercase mb-4">Уровень риска</h3>
            {profiles.length === 0 ? (
              <p className="text-xs text-muted-foreground">Нет профилей</p>
            ) : (
              <div className="space-y-2.5">
                {[
                  { label: "Низкий риск", value: riskCounts.low, color: "bg-green-500" },
                  { label: "Средний риск", value: riskCounts.medium, color: "bg-yellow-500" },
                  { label: "Высокий риск", value: riskCounts.high, color: "bg-destructive" },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{r.label}</span>
                      <span className="text-xs font-mono-ibm text-foreground">{r.value}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full transition-all`} style={{ width: profiles.length ? `${(r.value / profiles.length) * 100}%` : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded p-4">
          <h3 className="text-xs font-medium text-foreground tracking-wide uppercase mb-4">Последние операции</h3>
          {logs.length === 0 ? (
            <p className="text-xs text-muted-foreground">Нет операций</p>
          ) : (
            <div className="space-y-1.5">
              {logs.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-xs text-foreground">{l.action} — {l.target}</span>
                  <span className="text-xs text-muted-foreground font-mono-ibm shrink-0 ml-3">{l.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
