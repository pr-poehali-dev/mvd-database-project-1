import Icon from "@/components/ui/icon";

const barData = [
  { label: "Янв", profiles: 45, docs: 82 },
  { label: "Фев", profiles: 62, docs: 105 },
  { label: "Мар", profiles: 38, docs: 91 },
  { label: "Апр", profiles: 71, docs: 134 },
  { label: "Май", profiles: 55, docs: 98 },
  { label: "Июн", profiles: 89, docs: 142 },
  { label: "Июл", profiles: 76, docs: 119 },
  { label: "Авг", profiles: 93, docs: 158 },
  { label: "Сен", profiles: 67, docs: 124 },
  { label: "Окт", profiles: 84, docs: 147 },
  { label: "Ноя", profiles: 101, docs: 183 },
  { label: "Дек", profiles: 88, docs: 162 },
];

const maxVal = Math.max(...barData.flatMap((d) => [d.profiles, d.docs]));

export default function SectionStats() {
  return (
    <div className="flex flex-col h-full overflow-auto animate-fade-in">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-wide">Статистика и аналитика</h2>
          <p className="text-xs text-muted-foreground">Данные за текущий период</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 border border-border hover:border-primary text-muted-foreground hover:text-primary text-xs px-3 py-1.5 rounded transition-colors">
            <Icon name="FileDown" size={12} />
            Сформировать отчёт
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Профилей в реестре", value: "847", change: "+12", trend: "up", icon: "Users", color: "text-primary" },
            { label: "Документов всего", value: "1 284", change: "+34", trend: "up", icon: "FileText", color: "text-purple-400" },
            { label: "Операций сегодня", value: "23", change: "-5", trend: "down", icon: "Activity", color: "text-yellow-400" },
            { label: "Активных сессий", value: "7", change: "+2", trend: "up", icon: "MonitorCheck", color: "text-green-400" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card border border-border rounded p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <Icon name={kpi.icon as "Users"} size={16} className={kpi.color} />
                <span className={`text-xs font-mono-ibm ${kpi.trend === "up" ? "text-green-400" : "text-destructive"}`}>
                  {kpi.change}
                </span>
              </div>
              <div className="text-2xl font-semibold text-foreground font-mono-ibm">{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-card border border-border rounded p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-foreground tracking-wide uppercase">Динамика регистраций за 2025 год</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
                <span className="text-xs text-muted-foreground">Профили</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
                <span className="text-xs text-muted-foreground">Документы</span>
              </div>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-36">
            {barData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex items-end gap-0.5">
                  <div
                    className="flex-1 bg-primary/70 hover:bg-primary rounded-t transition-all"
                    style={{ height: `${(d.profiles / maxVal) * 120}px` }}
                  />
                  <div
                    className="flex-1 bg-purple-500/70 hover:bg-purple-500 rounded-t transition-all"
                    style={{ height: `${(d.docs / maxVal) * 120}px` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded p-4">
            <h3 className="text-xs font-medium text-foreground tracking-wide uppercase mb-4">Профили по регионам</h3>
            <div className="space-y-2.5">
              {[
                { label: "Москва", value: 312, pct: 37 },
                { label: "Санкт-Петербург", value: 187, pct: 22 },
                { label: "Московская обл.", value: 143, pct: 17 },
                { label: "Прочие регионы", value: 205, pct: 24 },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{r.label}</span>
                    <span className="text-xs font-mono-ibm text-foreground">{r.value}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded p-4">
            <h3 className="text-xs font-medium text-foreground tracking-wide uppercase mb-4">Уровень риска</h3>
            <div className="space-y-2.5">
              {[
                { label: "Низкий риск", value: 641, pct: 76, color: "bg-green-500" },
                { label: "Средний риск", value: 148, pct: 17, color: "bg-yellow-500" },
                { label: "Высокий риск", value: 58, pct: 7, color: "bg-destructive" },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{r.label}</span>
                    <span className="text-xs font-mono-ibm text-foreground">{r.value}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
