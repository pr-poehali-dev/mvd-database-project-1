export type UserRole = "inspector" | "senior_inspector" | "chief" | "admin";

export interface Employee {
  id: string;
  name: string;
  badge: string;
  role: UserRole;
  department: string;
  password: string;
}

export interface Profile {
  id: string;
  name: string;
  dob: string;
  inn: string;
  status: "active" | "inactive" | "restricted";
  category: string;
  region: string;
  risk: "low" | "medium" | "high";
  notes: string;
  createdAt: string;
  createdBy: string;
  photoUrl?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  ownerId: string;
  ownerName: string;
  date: string;
  size: string;
  format: string;
  classified: boolean;
  createdBy: string;
  createdAt: string;
  content?: string;
}

export interface Mail {
  id: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  priority: "normal" | "high" | "urgent";
}

export interface LogEntry {
  id: string;
  action: string;
  user: string;
  target: string;
  time: string;
  ip: string;
  type: string;
}

export interface Case {
  id: string;
  number: string;
  title: string;
  description: string;
  status: "open" | "suspended" | "closed";
  priority: "low" | "medium" | "high";
  category: string;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  documentIds: string[];
  profileIds: string[];
}

export interface FaceCheck {
  id: string;
  photoUrl: string;
  matchName: string;
  matchId: string;
  confidence: number;
  status: "match" | "no_match" | "pending";
  checkedBy: string;
  checkedAt: string;
}

const EMPLOYEES: Employee[] = [
  { id: "U-01", name: "Иванов А.П.", badge: "МВД-77-0412", role: "senior_inspector", department: "Отдел №3", password: "1234" },
  { id: "U-02", name: "Сидорова Н.К.", badge: "МВД-77-0388", role: "inspector", department: "Отдел №3", password: "1234" },
  { id: "U-03", name: "Карпов Е.Д.", badge: "МВД-77-0501", role: "chief", department: "Руководство", password: "1234" },
  { id: "U-04", name: "Громов Р.С.", badge: "МВД-77-0312", role: "inspector", department: "Отдел №2", password: "1234" },
  { id: "U-05", name: "Яковлева Д.М.", badge: "МВД-77-0445", role: "inspector", department: "Отдел №3", password: "1234" },
];

function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getEmployees: (): Employee[] => EMPLOYEES,

  getEmployee: (badge: string): Employee | null =>
    EMPLOYEES.find((e) => e.badge === badge || e.id === badge) ?? null,

  authenticate: (login: string, password: string): Employee | null => {
    const emp = EMPLOYEES.find(
      (e) => e.badge.toLowerCase() === login.toLowerCase() || e.id.toLowerCase() === login.toLowerCase()
    );
    if (emp && emp.password === password) return emp;
    return null;
  },

  // Profiles
  getProfiles: (): Profile[] => load<Profile[]>("mvd_profiles", []),

  addProfile: (data: Omit<Profile, "id" | "createdAt">) => {
    const profiles = store.getProfiles();
    const profile: Profile = { ...data, id: genId("P"), createdAt: new Date().toLocaleString("ru-RU") };
    save("mvd_profiles", [...profiles, profile]);
    return profile;
  },

  updateProfile: (id: string, data: Partial<Profile>) => {
    const profiles = store.getProfiles().map((p) => (p.id === id ? { ...p, ...data } : p));
    save("mvd_profiles", profiles);
  },

  deleteProfile: (id: string) => {
    save("mvd_profiles", store.getProfiles().filter((p) => p.id !== id));
  },

  // Documents
  getDocuments: (): Document[] => load<Document[]>("mvd_documents", []),

  addDocument: (data: Omit<Document, "id" | "createdAt">) => {
    const docs = store.getDocuments();
    const doc: Document = { ...data, id: genId("D"), createdAt: new Date().toLocaleString("ru-RU") };
    save("mvd_documents", [...docs, doc]);
    return doc;
  },

  deleteDocument: (id: string) => {
    save("mvd_documents", store.getDocuments().filter((d) => d.id !== id));
  },

  // Mail
  getMail: (): Mail[] => load<Mail[]>("mvd_mail", []),

  sendMail: (data: Omit<Mail, "id" | "date" | "read">) => {
    const mails = store.getMail();
    const mail: Mail = { ...data, id: genId("M"), date: new Date().toLocaleString("ru-RU"), read: false };
    save("mvd_mail", [...mails, mail]);
    return mail;
  },

  markRead: (id: string) => {
    const mails = store.getMail().map((m) => (m.id === id ? { ...m, read: true } : m));
    save("mvd_mail", mails);
  },

  deleteMail: (id: string) => {
    save("mvd_mail", store.getMail().filter((m) => m.id !== id));
  },

  // Log
  getLogs: (): LogEntry[] => load<LogEntry[]>("mvd_logs", []),

  addLog: (entry: Omit<LogEntry, "id" | "time">) => {
    const logs = store.getLogs();
    const log: LogEntry = { ...entry, id: genId("L"), time: new Date().toLocaleString("ru-RU") };
    save("mvd_logs", [log, ...logs].slice(0, 200));
  },

  // Cases
  getCases: (): Case[] => load<Case[]>("mvd_cases", []),

  addCase: (data: Omit<Case, "id" | "createdAt" | "updatedAt">) => {
    const cases = store.getCases();
    const now = new Date().toLocaleString("ru-RU");
    const c: Case = { ...data, id: genId("C"), createdAt: now, updatedAt: now };
    save("mvd_cases", [...cases, c]);
    return c;
  },

  updateCase: (id: string, data: Partial<Case>) => {
    const cases = store.getCases().map((c) =>
      c.id === id ? { ...c, ...data, updatedAt: new Date().toLocaleString("ru-RU") } : c
    );
    save("mvd_cases", cases);
  },

  deleteCase: (id: string) => {
    save("mvd_cases", store.getCases().filter((c) => c.id !== id));
  },

  // Face checks
  getFaceChecks: (): FaceCheck[] => load<FaceCheck[]>("mvd_face_checks", []),

  addFaceCheck: (data: Omit<FaceCheck, "id" | "checkedAt">) => {
    const checks = store.getFaceChecks();
    const check: FaceCheck = { ...data, id: genId("FC"), checkedAt: new Date().toLocaleString("ru-RU") };
    save("mvd_face_checks", [check, ...checks].slice(0, 50));
    return check;
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  inspector: "Инспектор",
  senior_inspector: "Старший инспектор",
  chief: "Начальник отдела",
  admin: "Администратор",
};

export const canViewStats = (role: UserRole) => role === "chief" || role === "admin";