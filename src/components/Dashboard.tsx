import { useState } from "react";
import Icon from "@/components/ui/icon";
import SectionDocuments from "@/components/sections/SectionDocuments";
import SectionProfiles from "@/components/sections/SectionProfiles";
import SectionSearch from "@/components/sections/SectionSearch";
import SectionHistory from "@/components/sections/SectionHistory";
import SectionStats from "@/components/sections/SectionStats";
import SectionAdmin from "@/components/sections/SectionAdmin";

interface User {
  name: string;
  role: string;
  badge: string;
}

interface Props {
  user: User;
  onLogout: () => void;
}

type Section = "documents" | "profiles" | "search" | "history" | "stats" | "admin";

const navItems: { id: Section; label: string; icon: string; count?: number }[] = [
  { id: "documents", label: "Документы", icon: "FileText", count: 1284 },
  { id: "profiles", label: "Профили", icon: "Users", count: 847 },
  { id: "search", label: "Поиск", icon: "Search" },
  { id: "history", label: "История", icon: "ClipboardList", count: 23 },
  { id: "stats", label: "Статистика", icon: "BarChart2" },
  { id: "admin", label: "Администрирование", icon: "Settings" },
];

export default function Dashboard({ user, onLogout }: Props) {
  const [activeSection, setActiveSection] = useState<Section>("profiles");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const now = new Date();
  const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

  const renderSection = () => {
    switch (activeSection) {
      case "documents": return <SectionDocuments />;
      case "profiles": return <SectionProfiles />;
      case "search": return <SectionSearch />;
      case "history": return <SectionHistory />;
      case "stats": return <SectionStats />;
      case "admin": return <SectionAdmin />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-ibm">
      {/* Top bar */}
      <header className="h-12 bg-sidebar border-b border-sidebar-border flex items-center px-4 gap-4 shrink-0 z-30">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="Menu" size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Icon name="Shield" size={11} className="text-primary" />
          </div>
          <span className="text-xs font-semibold text-foreground tracking-wider uppercase">АИС МВД</span>
          <span className="text-xs text-muted-foreground">— Реестр</span>
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono-ibm">ОНЛАЙН</span>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs font-mono-ibm text-muted-foreground hidden md:block">
            {dateStr} {timeStr}
          </span>

          <div className="flex items-center gap-2 pl-4 border-l border-border">
            <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Icon name="UserCheck" size={13} className="text-primary" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-medium text-foreground leading-none">{user.name}</div>
              <div className="text-xs text-muted-foreground leading-none mt-0.5">{user.badge}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="text-muted-foreground hover:text-destructive transition-colors"
            title="Выйти из системы"
          >
            <Icon name="LogOut" size={16} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "w-52" : "w-14"} bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 shrink-0 z-20`}
        >
          {/* User role */}
          {sidebarOpen && (
            <div className="px-3 py-3 border-b border-sidebar-border">
              <div className="text-xs text-muted-foreground">{user.role}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-green-400">Активная сессия</span>
              </div>
            </div>
          )}

          <nav className="flex-1 py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all relative group
                  ${activeSection === item.id
                    ? "bg-sidebar-accent text-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  }`}
              >
                {activeSection === item.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                )}
                <Icon name={item.icon as "FileText"} size={16} className={activeSection === item.id ? "text-primary" : ""} />
                {sidebarOpen && (
                  <span className="text-sm flex-1 truncate">{item.label}</span>
                )}
                {sidebarOpen && item.count && (
                  <span className="text-xs font-mono-ibm text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {item.count.toLocaleString("ru-RU")}
                  </span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 bg-card border border-border rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* System status */}
          {sidebarOpen && (
            <div className="px-3 py-3 border-t border-sidebar-border">
              <div className="text-xs text-muted-foreground mb-1.5">Состояние системы</div>
              {[
                { label: "БД", status: "ok" },
                { label: "Криптозащита", status: "ok" },
                { label: "Резервный сервер", status: "warn" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-0.5">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.status === "ok" ? "bg-green-500" : "bg-yellow-500"}`} />
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
