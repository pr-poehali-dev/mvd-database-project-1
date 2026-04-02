import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { store, type Profile, type Employee } from "@/lib/store";

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
const EMPTY: Omit<Profile, "id" | "createdAt"> = {
  name: "", dob: "", inn: "", status: "active", category: "Гражданин РФ",
  region: "", risk: "low", notes: "", createdBy: "", photoUrl: "",
};

export default function SectionProfiles({ user }: { user: Employee }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editing, setEditing] = useState<string | null>(null);

  const reload = () => setProfiles(store.getProfiles());
  useEffect(() => { reload(); }, []);

  const filtered = filter === "all" ? profiles : profiles.filter((p) => p.status === filter);
  const selectedProfile = profiles.find((p) => p.id === selected);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    if (editing) {
      store.updateProfile(editing, form);
      store.addLog({ action: "Изменение профиля", user: user.name, target: `${form.name} (${editing})`, ip: "10.0.1.x", type: "edit" });
      setEditing(null);
    } else {
      const p = store.addProfile({ ...form, createdBy: user.name });
      store.addLog({ action: "Создание профиля", user: user.name, target: `${form.name} (${p.id})`, ip: "10.0.1.x", type: "create" });
    }
    setForm({ ...EMPTY }); setShowForm(false); reload();
  };

  const handleEdit = (p: Profile) => {
    setForm({ name: p.name, dob: p.dob, inn: p.inn, status: p.status, category: p.category, region: p.region, risk: p.risk, notes: p.notes, createdBy: p.createdBy, photoUrl: p.photoUrl ?? "" });
    setEditing(p.id); setShowForm(true); setSelected(null);
  };

  const handleDelete = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    if (!p) return;
    if (!confirm(`Удалить профиль "${p.name}"?`)) return;
    store.deleteProfile(id);
    store.addLog({ action: "Удаление профиля", user: user.name, target: `${p.name} (${id})`, ip: "10.0.1.x", type: "delete" });
    setSelected(null); reload();
  };

  return (
    <div className="flex h-full animate-fade-in">
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded w-full max-w-lg animate-slide-up max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border sticky top-0 bg-card">
              <h3 className="text-sm font-semibold text-foreground">{editing ? "Редактировать профиль" : "Новый профиль"}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); setForm({ ...EMPTY }); }} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1">ФИО *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Дата рождения</label>
                  <input value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} placeholder="дд.мм.гггг"
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">ИНН</label>
                  <input value={form.inn} onChange={(e) => setForm({ ...form, inn: e.target.value })} maxLength={12}
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Регион</label>
                  <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Категория</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option>Гражданин РФ</option><option>Иностранный гражданин</option><option>Лицо без гражданства</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Статус</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Profile["status"] })}
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="active">Активен</option><option value="inactive">Неактивен</option><option value="restricted">Ограничен</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Уровень риска</label>
                  <select value={form.risk} onChange={(e) => setForm({ ...form, risk: e.target.value as Profile["risk"] })}
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1">Примечания</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-2 rounded transition-colors">
                  {editing ? "Сохранить изменения" : "Добавить профиль"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm({ ...EMPTY }); }}
                  className="px-4 bg-muted hover:bg-muted/80 text-foreground text-sm py-2 rounded transition-colors">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={`flex flex-col ${selected ? "w-96 border-r border-border" : "flex-1"}`}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Профили</h2>
            <p className="text-xs text-muted-foreground">{profiles.length} записей в базе</p>
          </div>
          <button onClick={() => { setForm({ ...EMPTY }); setEditing(null); setShowForm(true); }}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1.5 rounded transition-colors">
            <Icon name="Plus" size={12} />Добавить
          </button>
        </div>
        <div className="px-5 py-2 border-b border-border flex gap-1 flex-wrap">
          {[{ id: "all", l: "Все" }, { id: "active", l: "Активные" }, { id: "restricted", l: "Ограниченные" }, { id: "inactive", l: "Неактивные" }].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${filter === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              {f.l}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
            <Icon name="Users" size={28} className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Профили не найдены</p>
            <button onClick={() => { setForm({ ...EMPTY }); setShowForm(true); }}
              className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors">+ Добавить первый профиль</button>
          </div>
        ) : (
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
                  <tr key={p.id} onClick={() => setSelected(selected === p.id ? null : p.id)}
                    className={`border-b border-border/50 hover-row cursor-pointer transition-colors ${selected === p.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                    <td className="px-5 py-3 font-mono-ibm text-muted-foreground text-xs">{p.id.slice(-8)}</td>
                    <td className="px-3 py-3 text-foreground font-medium">{p.name}</td>
                    <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{p.region || "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded ${riskMap[p.risk].bg} ${riskMap[p.risk].color}`}>{riskMap[p.risk].label}</span>
                    </td>
                    <td className={`px-3 py-3 ${statusMap[p.status].color}`}>{statusMap[p.status].label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedProfile && (
        <div className="flex-1 overflow-auto p-5 animate-slide-up">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-xs font-mono-ibm text-muted-foreground mb-1">{selectedProfile.id}</div>
              <h3 className="text-lg font-semibold text-foreground">{selectedProfile.name}</h3>
              <div className={`text-xs mt-1 ${statusMap[selectedProfile.status].color}`}>{statusMap[selectedProfile.status].label}</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => handleEdit(selectedProfile)}
                className="flex items-center gap-1.5 border border-border hover:border-primary text-muted-foreground hover:text-primary text-xs px-3 py-1.5 rounded transition-colors">
                <Icon name="Edit3" size={12} />Редактировать
              </button>
              <button onClick={() => handleDelete(selectedProfile.id)}
                className="flex items-center gap-1.5 border border-destructive/40 hover:border-destructive text-destructive text-xs px-3 py-1.5 rounded transition-colors">
                <Icon name="Trash2" size={12} />Удалить
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
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Дата рождения", value: selectedProfile.dob || "—" },
              { label: "ИНН", value: selectedProfile.inn || "—" },
              { label: "Категория", value: selectedProfile.category },
              { label: "Регион", value: selectedProfile.region || "—" },
              { label: "Уровень риска", value: riskMap[selectedProfile.risk].label },
              { label: "Добавил", value: selectedProfile.createdBy || "—" },
            ].map((f) => (
              <div key={f.label} className="bg-muted/40 border border-border rounded p-3">
                <div className="text-xs text-muted-foreground mb-0.5">{f.label}</div>
                <div className="text-sm text-foreground font-medium font-mono-ibm">{f.value}</div>
              </div>
            ))}
          </div>
          {selectedProfile.notes && (
            <div className="bg-muted/40 border border-border rounded p-3 mb-3">
              <div className="text-xs text-muted-foreground mb-1">Примечания</div>
              <div className="text-sm text-foreground">{selectedProfile.notes}</div>
            </div>
          )}
          <div className="text-xs text-muted-foreground font-mono-ibm">Создан: {selectedProfile.createdAt}</div>
        </div>
      )}
    </div>
  );
}
