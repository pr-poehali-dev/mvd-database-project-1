import { useState } from "react";
import LoginScreen from "@/components/LoginScreen";
import Dashboard from "@/components/Dashboard";
import type { Employee } from "@/lib/store";

export default function Index() {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  return <Dashboard user={currentUser} onLogout={() => setCurrentUser(null)} />;
}
