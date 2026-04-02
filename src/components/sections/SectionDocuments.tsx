import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { store, type Document, type Employee } from "@/lib/store";

const EMPTY: Omit<Document, "id" | "createdAt"> = {
  name: "", type: "Удостоверение личности", ownerId: "", ownerName: "",
  date: "", size: "", format: "PDF", classified: false, createdBy: "", content: "",
};

export default function SectionDocuments({ user }: { user: Employee }) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });

  const reload = () => setDocs(store.getDocuments());
  useEffect(() => { reload(); }, []);

  const profiles = store.getProfiles();
  const filtered = docs.filter((d) =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const profileName = profiles.find((p) => p.id === form.ownerId)?.name ?? form.ownerName;
    const doc = store.addDocument({ ...form, ownerName: profileName, createdBy: user.name, date: new Date().toLocaleDateString("ru-RU"), size: "< 1 МБ" });
    store.addLog({ action: "Загрузка документа", user: user.name, target: `${form.name} (${doc.id})`, ip: "10.0.1.x", type: "upload" });
    setForm({ ...EMPTY }); setShowForm(false); reload();
  };

  const handleDelete = (id: string) => {
    const d = docs.find((x) => x.id === id);
    if (!d) return;
    if (!confirm(`Удалить документ "${d.name}"?`)) return;
    store.deleteDocument(id);
    store.addLog({ action: "Удаление документа", user: user.name, target: `${d.name} (${id})`, ip: "10.0.1.x", type: "delete" });
    reload();
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Новый документ</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Название *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Тип документа</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option>Удостоверение личности</option>
                    <option>Разрешение</option>
                    <option>Служебный документ</option>
                    <option>Процессуальный документ</option>
                    <option>Справочный документ</option>
                    <option>Рапорт</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Формат</label>
                  <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option>PDF</option><option>DOC</option><option>JPEG</option><option>PNG</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Привязать к профилю</label>
                <select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
                  className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">— Без привязки —</option>
                  {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Содержание / Описание</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3}
                  className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.classified} onChange={(e) => setForm({ ...form, classified: e.target.checked })}
                  className="accent-destructive" />
                <span className="text-xs text-muted-foreground">Пометить как ДСП (для служебного пользования)</span>
              </label>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-2 rounded transition-colors">Добавить документ</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 bg-muted hover:bg-muted/80 text-foreground text-sm py-2 rounded transition-colors">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Документы</h2>
          <p className="text-xs text-muted-foreground">{docs.length} файлов в хранилище</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1.5 rounded transition-colors">
          <Icon name="Plus" size={12} />Добавить
        </button>
      </div>

      <div className="px-5 py-2.5 border-b border-border">
        <div className="relative">
          <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Поиск по названию или владельцу..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted border border-border rounded pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <Icon name="FileText" size={28} className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">{search ? "Ничего не найдено" : "Документы не добавлены"}</p>
            {!search && (
              <button onClick={() => setShowForm(true)} className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors">+ Добавить первый документ</button>
            )}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border">
                <th className="text-left px-5 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Название</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden lg:table-cell">Тип</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden md:table-cell">Владелец</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden md:table-cell">Дата</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Формат</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-border/50 hover-row group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {d.classified && <Icon name="Lock" size={11} className="text-destructive shrink-0" />}
                      <span className="font-medium text-foreground">{d.name}</span>
                      {d.classified && <span className="text-xs px-1.5 py-0.5 bg-destructive/10 text-destructive rounded border border-destructive/20">ДСП</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground hidden lg:table-cell">{d.type}</td>
                  <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{d.ownerName || "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground font-mono-ibm hidden md:table-cell">{d.date}</td>
                  <td className="px-3 py-3 text-muted-foreground font-mono-ibm">{d.format}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(d.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-muted">
                        <Icon name="Trash2" size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="px-5 py-2 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{filtered.length} документов</span>
        <div className="flex items-center gap-1.5">
          <Icon name="ShieldCheck" size={13} className="text-green-400" />
          <span className="text-xs text-green-400">ГОСТ Р 34.12</span>
        </div>
      </div>
    </div>
  );
}
