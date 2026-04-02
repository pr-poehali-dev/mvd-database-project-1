import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { store, type Case, type Employee, ROLE_LABELS } from "@/lib/store";

const statusMap: Record<Case["status"], { label: string; color: string; bg: string }> = {
  open:      { label: "Открыто",     color: "text-green-400",       bg: "bg-green-500/10"     },
  suspended: { label: "Приостановлено", color: "text-yellow-400",   bg: "bg-yellow-500/10"   },
  closed:    { label: "Закрыто",     color: "text-muted-foreground", bg: "bg-muted"            },
};

const priorityMap: Record<Case["priority"], { label: string; color: string; dot: string }> = {
  low:    { label: "Низкий",   color: "text-muted-foreground", dot: "bg-muted-foreground" },
  medium: { label: "Средний",  color: "text-yellow-400",       dot: "bg-yellow-400"       },
  high:   { label: "Высокий",  color: "text-destructive",      dot: "bg-destructive"      },
};

const CATEGORIES = [
  "Уголовное", "Административное", "Розыскное",
  "Оперативное", "Надзорное", "Иное",
];

const EMPTY: Omit<Case, "id" | "createdAt" | "updatedAt"> = {
  number: "", title: "", description: "", status: "open", priority: "medium",
  category: "Уголовное", assignedTo: "", createdBy: "", documentIds: [], profileIds: [],
};

export default function SectionCases({ user }: { user: Employee }) {
  const [cases, setCases]           = useState<Case[]>([]);
  const [selected, setSelected]     = useState<Case | null>(null);
  const [showForm, setShowForm]      = useState(false);
  const [editing, setEditing]        = useState<string | null>(null);
  const [form, setForm]              = useState({ ...EMPTY });
  const [filterStatus, setFilterStatus] = useState<"all" | Case["status"]>("all");

  // для прикрепления
  const [attachDocModal, setAttachDocModal] = useState(false);
  const [attachProfModal, setAttachProfModal] = useState(false);

  const allDocs     = store.getDocuments();
  const allProfiles = store.getProfiles();
  const employees   = store.getEmployees();

  const reload = () => {
    const all = store.getCases();
    setCases(all);
    if (selected) setSelected(all.find((c) => c.id === selected.id) ?? null);
  };

  useEffect(() => { reload(); }, []);

  const filtered = filterStatus === "all" ? cases : cases.filter((c) => c.status === filterStatus);

  /* ── форма ── */
  const openNew = () => {
    setForm({ ...EMPTY, createdBy: user.name, assignedTo: user.id });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (c: Case) => {
    setForm({ number: c.number, title: c.title, description: c.description, status: c.status,
      priority: c.priority, category: c.category, assignedTo: c.assignedTo, createdBy: c.createdBy,
      documentIds: c.documentIds, profileIds: c.profileIds });
    setEditing(c.id);
    setShowForm(true);
    setSelected(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    if (editing) {
      store.updateCase(editing, form);
      store.addLog({ action: "Изменение дела", user: user.name, target: `${form.title} (${editing})`, ip: "10.0.1.x", type: "edit" });
    } else {
      const c = store.addCase({ ...form, createdBy: user.name });
      store.addLog({ action: "Создание дела", user: user.name, target: `${form.title} (${c.id})`, ip: "10.0.1.x", type: "create" });
    }
    setShowForm(false); setEditing(null); setForm({ ...EMPTY }); reload();
  };

  const handleDelete = (c: Case) => {
    if (!confirm(`Удалить дело «${c.title}»?`)) return;
    store.deleteCase(c.id);
    store.addLog({ action: "Удаление дела", user: user.name, target: `${c.title} (${c.id})`, ip: "10.0.1.x", type: "delete" });
    setSelected(null); reload();
  };

  /* ── прикрепление документов ── */
  const toggleDoc = (docId: string) => {
    const ids = selected!.documentIds.includes(docId)
      ? selected!.documentIds.filter((x) => x !== docId)
      : [...selected!.documentIds, docId];
    store.updateCase(selected!.id, { documentIds: ids });
    reload();
  };

  const toggleProfile = (pid: string) => {
    const ids = selected!.profileIds.includes(pid)
      ? selected!.profileIds.filter((x) => x !== pid)
      : [...selected!.profileIds, pid];
    store.updateCase(selected!.id, { profileIds: ids });
    reload();
  };

  /* ── рендер ── */
  return (
    <div className="flex h-full animate-fade-in">

      {/* ── Форма создания/редактирования ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded w-full max-w-lg max-h-[92vh] overflow-auto animate-slide-up">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="text-sm font-semibold text-foreground">{editing ? "Редактировать дело" : "Новое дело"}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Номер дела</label>
                  <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })}
                    placeholder="2026/УД-001"
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono-ibm" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Категория</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1">Заголовок *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1">Описание</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Статус</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Case["status"] })}
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="open">Открыто</option>
                    <option value="suspended">Приостановлено</option>
                    <option value="closed">Закрыто</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Приоритет</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Case["priority"] })}
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="low">Низкий</option>
                    <option value="medium">Средний</option>
                    <option value="high">Высокий</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-muted-foreground mb-1">Ответственный</label>
                  <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">— Не назначен —</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name} · {ROLE_LABELS[emp.role]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-2 rounded transition-colors">
                  {editing ? "Сохранить изменения" : "Создать дело"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                  className="px-4 bg-muted hover:bg-muted/80 text-foreground text-sm py-2 rounded transition-colors">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Модал: прикрепить документы ── */}
      {attachDocModal && selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded w-full max-w-md max-h-[80vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Прикрепить документы</h3>
              <button onClick={() => setAttachDocModal(false)} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={16} /></button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {allDocs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">Нет документов в системе</p>
              ) : (
                <div className="space-y-1.5">
                  {allDocs.map((d) => {
                    const attached = selected.documentIds.includes(d.id);
                    return (
                      <button key={d.id} onClick={() => toggleDoc(d.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded border transition-all text-left
                          ${attached ? "border-primary/50 bg-primary/5" : "border-border hover:border-muted-foreground bg-muted/20"}`}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors
                          ${attached ? "border-primary bg-primary" : "border-border"}`}>
                          {attached && <Icon name="Check" size={11} className="text-primary-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground truncate">{d.name}</div>
                          <div className="text-xs text-muted-foreground">{d.type} · {d.format}</div>
                        </div>
                        {d.classified && <span className="text-xs text-destructive border border-destructive/30 px-1.5 py-0.5 rounded">ДСП</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-border">
              <button onClick={() => setAttachDocModal(false)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-2 rounded transition-colors">
                Готово ({selected.documentIds.length} прикреплено)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Модал: прикрепить профили ── */}
      {attachProfModal && selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded w-full max-w-md max-h-[80vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Прикрепить профили</h3>
              <button onClick={() => setAttachProfModal(false)} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={16} /></button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {allProfiles.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">Нет профилей в системе</p>
              ) : (
                <div className="space-y-1.5">
                  {allProfiles.map((p) => {
                    const attached = selected.profileIds.includes(p.id);
                    const riskColors = { low: "text-green-400", medium: "text-yellow-400", high: "text-destructive" };
                    return (
                      <button key={p.id} onClick={() => toggleProfile(p.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded border transition-all text-left
                          ${attached ? "border-primary/50 bg-primary/5" : "border-border hover:border-muted-foreground bg-muted/20"}`}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors
                          ${attached ? "border-primary bg-primary" : "border-border"}`}>
                          {attached && <Icon name="Check" size={11} className="text-primary-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.category} · {p.region || "—"}</div>
                        </div>
                        <span className={`text-xs font-medium ${riskColors[p.risk]}`}>
                          {p.risk === "high" ? "Высокий риск" : p.risk === "medium" ? "Средний" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-border">
              <button onClick={() => setAttachProfModal(false)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-2 rounded transition-colors">
                Готово ({selected.profileIds.length} прикреплено)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Список дел ── */}
      <div className={`flex flex-col ${selected ? "w-96 border-r border-border" : "flex-1"}`}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Дела</h2>
            <p className="text-xs text-muted-foreground">{cases.length} дел в реестре</p>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1.5 rounded transition-colors">
            <Icon name="Plus" size={12} />Новое дело
          </button>
        </div>

        {/* Фильтры */}
        <div className="px-5 py-2 border-b border-border flex gap-1 flex-wrap">
          {[
            { id: "all",       l: "Все"              },
            { id: "open",      l: "Открытые"         },
            { id: "suspended", l: "Приостановленные" },
            { id: "closed",    l: "Закрытые"         },
          ].map((f) => (
            <button key={f.id} onClick={() => setFilterStatus(f.id as typeof filterStatus)}
              className={`text-xs px-2.5 py-1 rounded transition-colors
                ${filterStatus === f.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              {f.l}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-muted/40 border border-border flex items-center justify-center mb-4">
              <Icon name="FolderOpen" size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Дела не найдены</p>
            <button onClick={openNew} className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors">
              + Создать первое дело
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {filtered.map((c) => {
              const st = statusMap[c.status];
              const pr = priorityMap[c.priority];
              const assignedEmp = employees.find((e) => e.id === c.assignedTo);
              return (
                <button key={c.id} onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  className={`w-full text-left px-5 py-3.5 border-b border-border/60 hover-row transition-all
                    ${selected?.id === c.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pr.dot}`} />
                      <span className="text-xs font-semibold text-foreground truncate">{c.title}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${st.bg} ${st.color}`}>{st.label}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-3.5">
                    {c.number && <span className="text-xs font-mono-ibm text-muted-foreground">{c.number}</span>}
                    <span className="text-xs text-muted-foreground">{c.category}</span>
                    {assignedEmp && (
                      <span className="text-xs text-muted-foreground truncate">{assignedEmp.name}</span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-1.5 ml-3.5">
                    {c.documentIds.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Icon name="FileText" size={10} />{c.documentIds.length} докум.
                      </span>
                    )}
                    {c.profileIds.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Icon name="User" size={10} />{c.profileIds.length} профил.
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Карточка дела ── */}
      {selected && (
        <div className="flex-1 overflow-auto animate-slide-up">
          {/* Шапка */}
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {selected.number && (
                  <div className="text-xs font-mono-ibm text-muted-foreground mb-1">{selected.number}</div>
                )}
                <h3 className="text-lg font-semibold text-foreground leading-tight">{selected.title}</h3>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded ${statusMap[selected.status].bg} ${statusMap[selected.status].color}`}>
                    {statusMap[selected.status].label}
                  </span>
                  <span className={`flex items-center gap-1.5 text-xs ${priorityMap[selected.priority].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priorityMap[selected.priority].dot}`} />
                    Приоритет: {priorityMap[selected.priority].label}
                  </span>
                  <span className="text-xs text-muted-foreground">{selected.category}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(selected)}
                  className="flex items-center gap-1.5 border border-border hover:border-primary text-muted-foreground hover:text-primary text-xs px-3 py-1.5 rounded transition-colors">
                  <Icon name="Edit3" size={12} />Изменить
                </button>
                <button onClick={() => handleDelete(selected)}
                  className="flex items-center gap-1.5 border border-destructive/40 hover:border-destructive text-destructive text-xs px-3 py-1.5 rounded transition-colors">
                  <Icon name="Trash2" size={12} />
                </button>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-muted transition-colors">
                  <Icon name="X" size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Мета */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Создано", value: selected.createdAt },
                { label: "Обновлено", value: selected.updatedAt },
                { label: "Создал", value: selected.createdBy || "—" },
                { label: "Ответственный", value: employees.find((e) => e.id === selected.assignedTo)?.name ?? "Не назначен" },
              ].map((f) => (
                <div key={f.label} className="bg-muted/40 border border-border rounded p-3">
                  <div className="text-xs text-muted-foreground mb-0.5">{f.label}</div>
                  <div className="text-sm text-foreground font-medium font-mono-ibm">{f.value}</div>
                </div>
              ))}
            </div>

            {/* Описание */}
            {selected.description && (
              <div className="bg-muted/30 border border-border rounded p-4">
                <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Описание</div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{selected.description}</p>
              </div>
            )}

            {/* Прикреплённые документы */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Документы ({selected.documentIds.length})
                </div>
                <button onClick={() => setAttachDocModal(true)}
                  className="flex items-center gap-1.5 border border-border hover:border-primary text-muted-foreground hover:text-primary text-xs px-2.5 py-1 rounded transition-colors">
                  <Icon name="Paperclip" size={11} />Прикрепить
                </button>
              </div>
              {selected.documentIds.length === 0 ? (
                <div className="border border-dashed border-border rounded py-6 text-center">
                  <Icon name="FileText" size={20} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Нет прикреплённых документов</p>
                  <button onClick={() => setAttachDocModal(true)} className="text-xs text-primary hover:text-primary/80 mt-1 transition-colors">
                    + Прикрепить документ
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {selected.documentIds.map((docId) => {
                    const doc = allDocs.find((d) => d.id === docId);
                    if (!doc) return null;
                    return (
                      <div key={docId} className="flex items-center gap-3 bg-muted/30 border border-border rounded px-3 py-2.5 group">
                        <Icon name="FileText" size={14} className="text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground truncate">{doc.name}</div>
                          <div className="text-xs text-muted-foreground">{doc.type} · {doc.format}</div>
                        </div>
                        {doc.classified && (
                          <span className="text-xs text-destructive border border-destructive/30 px-1.5 py-0.5 rounded">ДСП</span>
                        )}
                        <button onClick={() => toggleDoc(docId)}
                          className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all p-1 rounded">
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Прикреплённые профили */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Фигуранты / Профили ({selected.profileIds.length})
                </div>
                <button onClick={() => setAttachProfModal(true)}
                  className="flex items-center gap-1.5 border border-border hover:border-primary text-muted-foreground hover:text-primary text-xs px-2.5 py-1 rounded transition-colors">
                  <Icon name="UserPlus" size={11} />Прикрепить
                </button>
              </div>
              {selected.profileIds.length === 0 ? (
                <div className="border border-dashed border-border rounded py-6 text-center">
                  <Icon name="Users" size={20} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Нет прикреплённых профилей</p>
                  <button onClick={() => setAttachProfModal(true)} className="text-xs text-primary hover:text-primary/80 mt-1 transition-colors">
                    + Прикрепить профиль
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {selected.profileIds.map((pid) => {
                    const prof = allProfiles.find((p) => p.id === pid);
                    if (!prof) return null;
                    const riskColors = { low: "text-green-400", medium: "text-yellow-400", high: "text-destructive" };
                    const riskLabels = { low: "Низкий", medium: "Средний", high: "Высокий" };
                    return (
                      <div key={pid} className="flex items-center gap-3 bg-muted/30 border border-border rounded px-3 py-2.5 group">
                        <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                          <Icon name="User" size={12} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground truncate">{prof.name}</div>
                          <div className="text-xs text-muted-foreground">{prof.category} · {prof.region || "—"}</div>
                        </div>
                        <span className={`text-xs ${riskColors[prof.risk]}`}>{riskLabels[prof.risk]}</span>
                        <button onClick={() => toggleProfile(pid)}
                          className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all p-1 rounded">
                          <Icon name="X" size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
