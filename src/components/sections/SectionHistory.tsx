import Icon from "@/components/ui/icon";

const events = [
  { id: "L-8801", action: "Просмотр профиля", user: "Иванов А.П.", target: "Петренко В.И. (P-003)", time: "02.04.2026 09:41:12", ip: "10.0.1.45", type: "view" },
  { id: "L-8800", action: "Изменение статуса", user: "Сидорова Н.К.", target: "Новиков А.Р. (P-007)", time: "02.04.2026 09:38:05", ip: "10.0.1.52", type: "edit" },
  { id: "L-8799", action: "Загрузка документа", user: "Иванов А.П.", target: "Протокол №112 (D-4823)", time: "02.04.2026 09:35:50", ip: "10.0.1.45", type: "upload" },
  { id: "L-8798", action: "Экспорт данных", user: "Карпов Е.Д.", target: "Отчёт за март 2026", time: "02.04.2026 09:22:31", ip: "10.0.2.17", type: "export" },
  { id: "L-8797", action: "Удаление файла", user: "Сидорова Н.К.", target: "Черновик рапорта (D-4819)", time: "02.04.2026 09:15:44", ip: "10.0.1.52", type: "delete" },
  { id: "L-8796", action: "Вход в систему", user: "Иванов А.П.", target: "Успешная авторизация", time: "02.04.2026 09:10:02", ip: "10.0.1.45", type: "auth" },
  { id: "L-8795", action: "Создание профиля", user: "Карпов Е.Д.", target: "Федотова И.О. (P-008)", time: "01.04.2026 17:55:19", ip: "10.0.2.17", type: "create" },
  { id: "L-8794", action: "Поиск в реестре", user: "Сидорова Н.К.", target: "Запрос: «Новиков Алексей»", time: "01.04.2026 17:48:33", ip: "10.0.1.52", type: "search" },
  { id: "L-8793", action: "Изменение прав доступа", user: "Карпов Е.Д.", target: "Сидорова Н.К.", time: "01.04.2026 16:30:00", ip: "10.0.2.17", type: "admin" },
  { id: "L-8792", action: "Выход из системы", user: "Иванов А.П.", target: "Нормальное завершение сессии", time: "01.04.2026 14:00:48", ip: "10.0.1.45", type: "auth" },
];

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
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-wide">История операций</h2>
          <p className="text-xs text-muted-foreground">Журнал всех действий в системе</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 border border-border hover:border-primary text-muted-foreground hover:text-primary text-xs px-3 py-1.5 rounded transition-colors">
            <Icon name="Download" size={12} />
            Экспорт журнала
          </button>
          <button className="flex items-center gap-1.5 border border-border hover:border-muted-foreground text-muted-foreground text-xs px-3 py-1.5 rounded transition-colors">
            <Icon name="Filter" size={12} />
            Фильтр
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-5 py-3 border-b border-border grid grid-cols-4 gap-3">
        {[
          { label: "За сегодня", value: "23", icon: "Activity" },
          { label: "Изменений", value: "5", icon: "Edit3" },
          { label: "Авторизаций", value: "3", icon: "LogIn" },
          { label: "Критичных", value: "1", icon: "AlertTriangle" },
        ].map((s) => (
          <div key={s.label} className="bg-muted/30 border border-border rounded p-2.5">
            <div className="text-lg font-semibold text-foreground font-mono-ibm">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b border-border">
              <th className="text-left px-5 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">ID</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Действие</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden md:table-cell">Сотрудник</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden lg:table-cell">Объект</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase hidden md:table-cell">IP</th>
              <th className="text-left px-3 py-2.5 text-muted-foreground font-medium tracking-wider uppercase">Время</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => {
              const cfg = typeConfig[e.type] || typeConfig.view;
              return (
                <tr key={e.id} className="border-b border-border/50 hover-row">
                  <td className="px-5 py-3 font-mono-ibm text-muted-foreground">{e.id}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${cfg.bg}`}>
                        <Icon name={cfg.icon as "Eye"} size={11} className={cfg.color} />
                      </span>
                      <span className="text-foreground">{e.action}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{e.user}</td>
                  <td className="px-3 py-3 text-muted-foreground hidden lg:table-cell truncate max-w-xs">{e.target}</td>
                  <td className="px-3 py-3 font-mono-ibm text-muted-foreground hidden md:table-cell">{e.ip}</td>
                  <td className="px-3 py-3 font-mono-ibm text-muted-foreground">{e.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-2 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Показано {events.length} последних записей</span>
        <div className="flex items-center gap-1.5">
          <Icon name="Lock" size={11} className="text-green-400" />
          <span className="text-xs text-green-400">Журнал защищён от изменений</span>
        </div>
      </div>
    </div>
  );
}
