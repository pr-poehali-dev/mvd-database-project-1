import { useState } from "react";
import Icon from "@/components/ui/icon";

const documents = [
  { id: "D-4821", name: "Паспорт гражданина РФ", type: "Удостоверение личности", owner: "Смирнов Д.А.", date: "12.01.2024", size: "2.4 МБ", format: "PDF", classified: false },
  { id: "D-4822", name: "Водительское удостоверение", type: "Разрешение", owner: "Козлова А.В.", date: "15.03.2024", size: "1.1 МБ", format: "PDF", classified: false },
  { id: "D-4823", name: "Протокол допроса №112", type: "Служебный документ", owner: "Петренко В.И.", date: "22.06.2024", size: "0.8 МБ", format: "PDF", classified: true },
  { id: "D-4824", name: "Вид на жительство", type: "Разрешение на проживание", owner: "Захарова Е.С.", date: "05.07.2024", size: "3.2 МБ", format: "PDF", classified: false },
  { id: "D-4825", name: "Справка о несудимости", type: "Справочный документ", owner: "Морозов И.Н.", date: "18.08.2024", size: "0.5 МБ", format: "PDF", classified: false },
  { id: "D-4826", name: "Оперативный рапорт №88", type: "Служебный документ", owner: "Волкова М.П.", date: "01.09.2024", size: "1.7 МБ", format: "DOC", classified: true },
  { id: "D-4827", name: "Акт осмотра места происшествия", type: "Процессуальный документ", owner: "Новиков А.Р.", date: "14.10.2024", size: "5.6 МБ", format: "PDF", classified: true },
  { id: "D-4828", name: "Свидетельство о рождении", type: "Удостоверение личности", owner: "Федотова И.О.", date: "02.11.2024", size: "0.9 МБ", format: "PDF", classified: false },
];

export default function SectionDocuments() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const types = ["all", ...Array.from(new Set(documents.map((d) => d.type)))];
  const filtered = documents
    .filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.owner.toLowerCase().includes(search.toLowerCase()))
    .filter((d) => typeFilter === "all" || d.type === typeFilter);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-wide">Документы</h2>
          <p className="text-xs text-muted-foreground">{documents.length} файлов в хранилище</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 border border-border hover:border-primary text-muted-foreground hover:text-primary text-xs px-3 py-1.5 rounded transition-colors">
            <Icon name="Upload" size={12} />
            Загрузить
          </button>
          <button className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1.5 rounded transition-colors">
            <Icon name="Plus" size={12} />
            Добавить
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 py-2.5 border-b border-border flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск по названию или владельцу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted border border-border rounded pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-muted border border-border rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {types.map((t) => (
            <option key={t} value={t}>{t === "all" ? "Все типы" : t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b border-border">
              <th className="text-left px-5 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">ID</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Название</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden lg:table-cell">Тип</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden md:table-cell">Владелец</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden md:table-cell">Дата</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Размер</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-border/50 hover-row group">
                <td className="px-5 py-3 font-mono-ibm text-muted-foreground">{d.id}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    {d.classified && (
                      <Icon name="Lock" size={11} className="text-destructive shrink-0" />
                    )}
                    <span className={`font-medium ${d.classified ? "text-foreground" : "text-foreground"}`}>
                      {d.name}
                    </span>
                    {d.classified && (
                      <span className="text-xs px-1.5 py-0.5 bg-destructive/10 text-destructive rounded border border-destructive/20">ДСП</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-muted-foreground hidden lg:table-cell">{d.type}</td>
                <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{d.owner}</td>
                <td className="px-3 py-3 text-muted-foreground font-mono-ibm hidden md:table-cell">{d.date}</td>
                <td className="px-3 py-3 text-muted-foreground font-mono-ibm">{d.size}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-muted">
                      <Icon name="Eye" size={13} />
                    </button>
                    <button className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-muted">
                      <Icon name="Download" size={13} />
                    </button>
                    <button className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-muted">
                      <Icon name="Trash2" size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-2 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{filtered.length} из {documents.length} документов</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Зашифровано:</span>
          <Icon name="ShieldCheck" size={13} className="text-green-400" />
          <span className="text-xs text-green-400">ГОСТ Р 34.12</span>
        </div>
      </div>
    </div>
  );
}
