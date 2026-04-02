import { useState } from "react";
import Icon from "@/components/ui/icon";

const profiles = [
  { id: "P-001", name: "Смирнов Дмитрий Александрович", dob: "15.03.1985", inn: "771234567890", status: "active", category: "Гражданин РФ", region: "Москва", docs: 4, risk: "low" },
  { id: "P-002", name: "Козлова Анна Витальевна", dob: "22.07.1992", inn: "781234567891", status: "active", category: "Гражданин РФ", region: "СПб", docs: 2, risk: "low" },
  { id: "P-003", name: "Петренко Василий Иванович", dob: "01.11.1978", inn: "501234567892", status: "restricted", category: "Гражданин РФ", region: "МО", docs: 6, risk: "high" },
  { id: "P-004", name: "Захарова Елена Сергеевна", dob: "30.05.1990", inn: "231234567893", status: "active", category: "Иностранный гражданин", region: "Краснодар", docs: 3, risk: "medium" },
  { id: "P-005", name: "Морозов Игорь Николаевич", dob: "14.09.1965", inn: "631234567894", status: "inactive", category: "Гражданин РФ", region: "Самара", docs: 1, risk: "low" },
  { id: "P-006", name: "Волкова Марина Павловна", dob: "08.02.1988", inn: "661234567895", status: "active", category: "Гражданин РФ", region: "Екатеринбург", docs: 2, risk: "low" },
  { id: "P-007", name: "Новиков Алексей Романович", dob: "19.12.1973", inn: "741234567896", status: "restricted", category: "Гражданин РФ", region: "Челябинск", docs: 5, risk: "high" },
  { id: "P-008", name: "Федотова Ирина Олеговна", dob: "03.06.1995", inn: "541234567897", status: "active", category: "Гражданин РФ", region: "Новосибирск", docs: 1, risk: "low" },
];

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: "Активен", color: "text-green-400" },
  inactive: { label: "Неактивен", color: "text-muted-foreground" },
  restricted: { label: "Ограничен", color: "text-destructive" },
};

const riskMap: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Низкий", color: "text-green-400", bg: "bg-green-500/10" },
  medium: { label: "Средний", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  high: { label: "Высокий", color: "text-destructive", bg: "bg-destructive/10" },
};

export default function SectionProfiles() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? profiles : profiles.filter((p) => p.status === filter);
  const selectedProfile = profiles.find((p) => p.id === selected);

  return (
    <div className="flex h-full animate-fade-in">
      {/* List pane */}
      <div className={`flex flex-col ${selected ? "w-96 border-r border-border" : "flex-1"}`}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground tracking-wide">Профили</h2>
            <p className="text-xs text-muted-foreground">{profiles.length} записей в базе</p>
          </div>
          <button className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1.5 rounded transition-colors">
            <Icon name="Plus" size={12} />
            Добавить
          </button>
        </div>

        {/* Filter */}
        <div className="px-5 py-2 border-b border-border flex gap-1">
          {[{ id: "all", label: "Все" }, { id: "active", label: "Активные" }, { id: "restricted", label: "Ограниченные" }, { id: "inactive", label: "Неактивные" }].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${filter === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">ID</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">ФИО</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden md:table-cell">Регион</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Риск</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelected(selected === p.id ? null : p.id)}
                  className={`border-b border-border/50 hover-row cursor-pointer transition-colors ${selected === p.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                >
                  <td className="px-5 py-3 font-mono-ibm text-muted-foreground">{p.id}</td>
                  <td className="px-3 py-3 text-foreground font-medium">{p.name}</td>
                  <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{p.region}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${riskMap[p.risk].bg} ${riskMap[p.risk].color}`}>
                      {riskMap[p.risk].label}
                    </span>
                  </td>
                  <td className={`px-3 py-3 ${statusMap[p.status].color}`}>{statusMap[p.status].label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail pane */}
      {selectedProfile && (
        <div className="flex-1 overflow-auto p-5 animate-slide-up">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-xs font-mono-ibm text-muted-foreground mb-1">{selectedProfile.id}</div>
              <h3 className="text-lg font-semibold text-foreground">{selectedProfile.name}</h3>
              <div className={`text-xs mt-1 ${statusMap[selectedProfile.status].color}`}>
                {statusMap[selectedProfile.status].label}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 border border-border hover:border-primary text-muted-foreground hover:text-primary text-xs px-3 py-1.5 rounded transition-colors">
                <Icon name="Edit3" size={12} />
                Редактировать
              </button>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-muted transition-colors">
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>

          {selectedProfile.risk === "high" && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded px-3 py-2 mb-4">
              <Icon name="AlertTriangle" size={13} className="text-destructive" />
              <span className="text-xs text-destructive">Высокий уровень риска — требует дополнительной проверки</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "Дата рождения", value: selectedProfile.dob },
              { label: "ИНН", value: selectedProfile.inn },
              { label: "Категория", value: selectedProfile.category },
              { label: "Регион", value: selectedProfile.region },
              { label: "Документов", value: String(selectedProfile.docs) },
              { label: "Уровень риска", value: riskMap[selectedProfile.risk].label },
            ].map((f) => (
              <div key={f.label} className="bg-muted/40 border border-border rounded p-3">
                <div className="text-xs text-muted-foreground mb-0.5">{f.label}</div>
                <div className="text-sm text-foreground font-medium font-mono-ibm">{f.value}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4">
            <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Документы профиля</div>
            {Array.from({ length: selectedProfile.docs }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50">
                <Icon name="FileText" size={14} className="text-muted-foreground" />
                <span className="text-xs text-foreground flex-1">Документ №{(Math.random() * 9000 + 1000).toFixed(0)}</span>
                <span className="text-xs text-muted-foreground font-mono-ibm">PDF</span>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <Icon name="Download" size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
