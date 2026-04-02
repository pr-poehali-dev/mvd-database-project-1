import { useState } from "react";
import Icon from "@/components/ui/icon";

const results = [
  { id: "P-003", type: "profile", name: "Петренко Василий Иванович", detail: "ИНН 501234567892 · Ограниченный · МО", risk: "high" },
  { id: "D-4823", type: "doc", name: "Протокол допроса №112", detail: "Служебный документ · 22.06.2024 · ДСП", risk: "medium" },
  { id: "P-007", type: "profile", name: "Новиков Алексей Романович", detail: "ИНН 741234567896 · Ограниченный · Челябинск", risk: "high" },
  { id: "D-4827", type: "doc", name: "Акт осмотра места происшествия", detail: "Процессуальный документ · 14.10.2024 · ДСП", risk: "medium" },
];

export default function SectionSearch() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSearched(true); }, 800);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground tracking-wide">Поиск</h2>
        <p className="text-xs text-muted-foreground">Глобальный поиск по реестру МВД</p>
      </div>

      <div className="px-5 py-5 border-b border-border bg-muted/20">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ФИО, ИНН, номер документа, регион..."
                className="w-full bg-card border border-border rounded pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded text-sm font-medium transition-all disabled:opacity-50"
            >
              {loading ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Search" size={14} />}
              Поиск
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground self-center">Искать в:</span>
            {[
              { id: "all", label: "Везде" },
              { id: "profiles", label: "Профили" },
              { id: "docs", label: "Документы" },
              { id: "history", label: "История" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSearchType(t.id)}
                className={`text-xs px-3 py-1 rounded border transition-colors ${searchType === t.id ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </form>

        {/* Advanced filters */}
        <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: "Регион", placeholder: "Выберите регион" },
            { label: "Период с", placeholder: "дд.мм.гггг" },
            { label: "Период по", placeholder: "дд.мм.гггг" },
            { label: "Уровень риска", placeholder: "Любой" },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
              <input
                type="text"
                placeholder={f.placeholder}
                className="w-full bg-card border border-border rounded px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {!searched && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-14 h-14 rounded-full bg-muted/50 border border-border flex items-center justify-center mb-4">
              <Icon name="Search" size={22} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Введите запрос для поиска</p>
            <p className="text-xs text-muted-foreground/60 mt-1">ФИО, ИНН, номер документа или регион</p>
          </div>
        )}

        {searched && (
          <div className="p-5 animate-slide-up">
            <div className="text-xs text-muted-foreground mb-3">
              Найдено {results.length} результатов по запросу «{query}»
            </div>
            <div className="space-y-2">
              {results.map((r) => (
                <div
                  key={r.id}
                  className="flex items-start gap-3 bg-card border border-border hover:border-primary/40 rounded p-3.5 cursor-pointer transition-all group"
                >
                  <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${r.type === "profile" ? "bg-primary/10 border border-primary/20" : "bg-muted border border-border"}`}>
                    <Icon name={r.type === "profile" ? "User" : "FileText"} size={14} className={r.type === "profile" ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground font-medium truncate">{r.name}</span>
                      {r.risk === "high" && (
                        <Icon name="AlertTriangle" size={12} className="text-destructive shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.detail}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono-ibm text-muted-foreground">{r.id}</span>
                    <Icon name="ChevronRight" size={13} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
