import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { store, type Mail, type Employee } from "@/lib/store";

interface Props {
  user: Employee;
  onUnreadChange: (count: number) => void;
}

export default function SectionMail({ user, onUnreadChange }: Props) {
  const [mails, setMails] = useState<Mail[]>([]);
  const [tab, setTab] = useState<"inbox" | "sent" | "compose">("inbox");
  const [selected, setSelected] = useState<Mail | null>(null);
  const [form, setForm] = useState({ to: "", subject: "", body: "", priority: "normal" as Mail["priority"] });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const employees = store.getEmployees().filter((e) => e.id !== user.id);

  const reload = () => {
    const all = store.getMail();
    setMails(all);
    const unread = all.filter((m) => m.to === user.id && !m.read).length;
    onUnreadChange(unread);
  };

  useEffect(() => { reload(); }, []);

  const inbox = mails.filter((m) => m.to === user.id);
  const sentBox = mails.filter((m) => m.from === user.id);
  const unread = inbox.filter((m) => !m.read).length;

  const handleOpen = (m: Mail) => {
    setSelected(m);
    if (!m.read && m.to === user.id) {
      store.markRead(m.id);
      reload();
    }
  };

  const handleDelete = (id: string) => {
    store.deleteMail(id);
    setSelected(null);
    reload();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.to || !form.subject || !form.body) return;
    setSending(true);
    const toEmployee = employees.find((emp) => emp.id === form.to);
    setTimeout(() => {
      store.sendMail({
        from: user.id,
        fromName: user.name,
        to: form.to,
        toName: toEmployee?.name ?? form.to,
        subject: form.subject,
        body: form.body,
        priority: form.priority,
      });
      store.addLog({ action: "Отправка письма", user: user.name, target: `${form.subject} → ${toEmployee?.name}`, ip: "10.0.1.x", type: "view" });
      setSending(false);
      setSent(true);
      setForm({ to: "", subject: "", body: "", priority: "normal" });
      setTimeout(() => { setSent(false); setTab("sent"); reload(); }, 1500);
    }, 600);
  };

  const priorityStyle: Record<string, string> = {
    normal: "text-muted-foreground",
    high: "text-yellow-400",
    urgent: "text-destructive",
  };
  const priorityLabel: Record<string, string> = { normal: "Обычное", high: "Важное", urgent: "Срочное" };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Внутренняя почта</h2>
          <p className="text-xs text-muted-foreground">Защищённая переписка сотрудников</p>
        </div>
        <button onClick={() => { setTab("compose"); setSelected(null); }}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1.5 rounded transition-colors">
          <Icon name="PenLine" size={12} />Написать
        </button>
      </div>

      <div className="px-5 border-b border-border flex gap-0">
        {[
          { id: "inbox", label: "Входящие", icon: "Inbox", badge: unread },
          { id: "sent", label: "Отправленные", icon: "Send" },
          { id: "compose", label: "Новое письмо", icon: "PenLine" },
        ].map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id as typeof tab); setSelected(null); }}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs border-b-2 transition-colors relative ${tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon name={t.icon as "Inbox"} size={13} />
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="ml-0.5 bg-destructive text-destructive-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center font-mono-ibm">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* List */}
        {tab !== "compose" && (
          <div className={`${selected ? "w-80 border-r border-border" : "flex-1"} flex flex-col overflow-auto`}>
            {(tab === "inbox" ? inbox : sentBox).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <Icon name={tab === "inbox" ? "Inbox" : "Send"} size={28} className="text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">{tab === "inbox" ? "Нет входящих писем" : "Нет отправленных писем"}</p>
              </div>
            ) : (
              <div>
                {(tab === "inbox" ? inbox : sentBox).map((m) => (
                  <button key={m.id} onClick={() => handleOpen(m)}
                    className={`w-full text-left px-5 py-3.5 border-b border-border/50 hover-row transition-colors ${selected?.id === m.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {tab === "inbox" && !m.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        <span className={`text-xs font-medium truncate ${!m.read && tab === "inbox" ? "text-foreground" : "text-muted-foreground"}`}>
                          {tab === "inbox" ? m.fromName : m.toName}
                        </span>
                        {m.priority !== "normal" && (
                          <Icon name={m.priority === "urgent" ? "AlertTriangle" : "ArrowUp"} size={11} className={priorityStyle[m.priority]} />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono-ibm shrink-0">{m.date.split(" ")[0]}</span>
                    </div>
                    <div className={`text-xs mt-1 truncate ${!m.read && tab === "inbox" ? "text-foreground font-medium" : "text-muted-foreground"}`}>{m.subject}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{m.body}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Detail */}
        {selected && tab !== "compose" && (
          <div className="flex-1 overflow-auto p-5 animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">{selected.subject}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {tab === "inbox" ? `От: ${selected.fromName}` : `Кому: ${selected.toName}`}
                  </span>
                  <span className="text-xs font-mono-ibm text-muted-foreground">{selected.date}</span>
                  {selected.priority !== "normal" && (
                    <span className={`text-xs ${priorityStyle[selected.priority]}`}>{priorityLabel[selected.priority]}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {tab === "inbox" && (
                  <button onClick={() => { setForm({ to: selected.from, subject: `Re: ${selected.subject}`, body: "", priority: "normal" }); setTab("compose"); }}
                    className="flex items-center gap-1.5 border border-border hover:border-primary text-muted-foreground hover:text-primary text-xs px-3 py-1.5 rounded transition-colors">
                    <Icon name="Reply" size={12} />Ответить
                  </button>
                )}
                <button onClick={() => handleDelete(selected.id)}
                  className="flex items-center gap-1.5 border border-destructive/40 hover:border-destructive text-destructive text-xs px-3 py-1.5 rounded transition-colors">
                  <Icon name="Trash2" size={12} />Удалить
                </button>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-muted transition-colors">
                  <Icon name="X" size={16} />
                </button>
              </div>
            </div>
            <div className="bg-muted/30 border border-border rounded p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">{selected.body}</p>
            </div>
          </div>
        )}

        {/* Compose */}
        {tab === "compose" && (
          <div className="flex-1 overflow-auto p-5 animate-slide-up">
            <h3 className="text-sm font-semibold text-foreground mb-4">Новое письмо</h3>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-4">
                  <Icon name="CheckCircle" size={24} className="text-green-400" />
                </div>
                <p className="text-sm font-medium text-foreground">Письмо отправлено</p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Получатель *</label>
                  <select value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} required
                    className="w-full bg-muted border border-border rounded px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">— Выберите сотрудника —</option>
                    {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} ({emp.badge})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Тема *</label>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required
                    className="w-full bg-muted border border-border rounded px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Приоритет</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Mail["priority"] })}
                    className="w-full bg-muted border border-border rounded px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="normal">Обычное</option>
                    <option value="high">Важное</option>
                    <option value="urgent">Срочное</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Текст сообщения *</label>
                  <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required rows={6}
                    className="w-full bg-muted border border-border rounded px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={sending}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-6 py-2.5 rounded transition-colors disabled:opacity-50">
                    {sending ? <><Icon name="Loader2" size={14} className="animate-spin" />Отправка...</> : <><Icon name="Send" size={14} />Отправить</>}
                  </button>
                  <button type="button" onClick={() => { setForm({ to: "", subject: "", body: "", priority: "normal" }); setTab("inbox"); }}
                    className="px-4 bg-muted hover:bg-muted/80 text-foreground text-sm py-2.5 rounded transition-colors">Отмена</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
