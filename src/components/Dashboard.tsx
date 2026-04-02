import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import SectionDocuments from "@/components/sections/SectionDocuments";
import SectionProfiles from "@/components/sections/SectionProfiles";
import SectionSearch from "@/components/sections/SectionSearch";
import SectionHistory from "@/components/sections/SectionHistory";
import SectionStats from "@/components/sections/SectionStats";
import SectionAdmin from "@/components/sections/SectionAdmin";
import SectionFace from "@/components/sections/SectionFace";
import SectionMail from "@/components/sections/SectionMail";
import { store, canViewStats, ROLE_LABELS, type Employee } from "@/lib/store";

type Section = "profiles" | "documents" | "search" | "face" | "mail" | "history" | "stats" | "admin";

interface NavItem { id: Section; label: string; icon: string; chiefOnly?: boolean }

const NAV: NavItem[] = [
  { id: "profiles", label: "Профили", icon: "Users" },
  { id: "documents", label: "Документы", icon: "FileText" },
  { id: "search", label: "Поиск", icon: "Search" },
  { id: "face", label: "Сверка по лицу", icon: "ScanFace" },
  { id: "mail", label: "Внутренняя почта", icon: "Mail" },
  { id: "history", label: "История", icon: "ClipboardList" },
  { id: "stats", label: "Статистика", icon: "BarChart2", chiefOnly: true },
  { id: "admin", label: "Администрирование", icon: "Settings" },
];

interface Props {
  user: Employee;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: Props) {
  const [active, setActive] = useState<Section>("profiles");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [time, setTime] = useState(new Date());
  const [unreadMail, setUnreadMail] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const count = store.getMail().filter((m) => m.to === user.id && !m.read).length;
    setUnreadMail(count);
  }, [active, user.id]);

  const handleLogout = () => {
    store.addLog({ action: "Выход из системы", user: user.name, target: "Нормальное завершение сессии", ip: "10.0.1.x", type: "auth" });
    onLogout();
  };

  const visibleNav = NAV.filter((n) => !n.chiefOnly || canViewStats(user.role));

  const renderSection = () => {
    switch (active) {
      case "profiles": return <SectionProfiles user={user} />;
      case "documents": return <SectionDocuments user={user} />;
      case "search": return <SectionSearch />;
      case "face": return <SectionFace user={user} />;
      case "mail": return <SectionMail user={user} onUnreadChange={setUnreadMail} />;
      case "history": return <SectionHistory />;
      case "stats": return canViewStats(user.role) ? <SectionStats /> : null;
      case "admin": return <SectionAdmin user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-ibm">
      {/* Topbar */}
      <header className="h-12 bg-sidebar border-b border-sidebar-border flex items-center px-4 gap-4 shrink-0 z-30">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="Menu" size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Icon name="Shield" size={11} className="text-primary" />
          </div>
          <span className="text-xs font-semibold text-foreground tracking-wider uppercase">АИС МВД</span>
          <span className="text-xs text-muted-foreground hidden sm:block">— Реестр</span>
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono-ibm">ОНЛАЙН</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs font-mono-ibm text-muted-foreground hidden md:block">
            {time.toLocaleDateString("ru-RU")} {time.toLocaleTimeString("ru-RU")}
          </span>
          <button
            onClick={() => setActive("mail")}
            className="relative text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="Mail" size={16} />
            {unreadMail > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-mono-ibm leading-none">
                {unreadMail}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2 pl-4 border-l border-border">
            <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Icon name="UserCheck" size={13} className="text-primary" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-medium text-foreground leading-none">{user.name}</div>
              <div className="text-xs text-muted-foreground leading-none mt-0.5">{ROLE_LABELS[user.role]}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors" title="Выйти">
            <Icon name="LogOut" size={16} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-52" : "w-14"} bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 shrink-0 z-20`}>
          {sidebarOpen && (
            <div className="px-3 py-3 border-b border-sidebar-border">
              <div className="text-xs text-muted-foreground">{user.department}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-green-400">Активная сессия</span>
              </div>
            </div>
          )}
          <nav className="flex-1 py-2">
            {visibleNav.map((item) => (
              <button key={item.id} onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all relative group
                  ${active === item.id ? "bg-sidebar-accent text-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"}`}>
                {active === item.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
                <div className="relative shrink-0">
                  <Icon name={item.icon as "Mail"} size={16} className={active === item.id ? "text-primary" : ""} />
                  {item.id === "mail" && unreadMail > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-mono-ibm leading-none">
                      {unreadMail}
                    </span>
                  )}
                </div>
                {sidebarOpen && <span className="text-sm flex-1 truncate">{item.label}</span>}
                {sidebarOpen && item.chiefOnly && (
                  <span className="text-xs text-yellow-500/70 font-mono-ibm">★</span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 bg-card border border-border rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>
          {sidebarOpen && (
            <div className="px-3 py-3 border-t border-sidebar-border">
              <div className="text-xs text-muted-foreground mb-1.5">Состояние</div>
              {[{ label: "БД", ok: true }, { label: "Криптозащита", ok: true }, { label: "Резервный сервер", ok: false }].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-0.5">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? "bg-green-500" : "bg-yellow-500"}`} />
                </div>
              ))}
            </div>
          )}
        </aside>

        <main className="flex-1 overflow-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
