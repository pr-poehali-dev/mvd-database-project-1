import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { store, type Profile, type Employee } from "@/lib/store";

interface MatchResult {
  profile: Profile;
  confidence: number;
}

export default function SectionFace({ user }: { user: Employee }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [noMatch, setNoMatch] = useState(false);
  const [history, setHistory] = useState(() => store.getFaceChecks());
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto(ev.target?.result as string);
      setResult(null);
      setNoMatch(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCheck = () => {
    if (!photo) return;
    setChecking(true);
    setResult(null);
    setNoMatch(false);

    setTimeout(() => {
      const profiles = store.getProfiles();
      if (profiles.length === 0) {
        setNoMatch(true);
        setChecking(false);
        store.addLog({ action: "Сверка по лицу", user: user.name, target: "Совпадений не найдено (база пуста)", ip: "10.0.1.x", type: "view" });
        store.addFaceCheck({ photoUrl: photo, matchName: "—", matchId: "—", confidence: 0, status: "no_match", checkedBy: user.name });
        setHistory(store.getFaceChecks());
        return;
      }

      const matchIdx = Math.floor(Math.random() * (profiles.length + 1));
      if (matchIdx >= profiles.length) {
        setNoMatch(true);
        setChecking(false);
        store.addLog({ action: "Сверка по лицу", user: user.name, target: "Совпадений не найдено", ip: "10.0.1.x", type: "view" });
        store.addFaceCheck({ photoUrl: photo, matchName: "—", matchId: "—", confidence: 0, status: "no_match", checkedBy: user.name });
      } else {
        const matched = profiles[matchIdx];
        const confidence = Math.floor(Math.random() * 20 + 78);
        setResult({ profile: matched, confidence });
        setChecking(false);
        store.addLog({ action: "Сверка по лицу", user: user.name, target: `${matched.name} (${confidence}%)`, ip: "10.0.1.x", type: "view" });
        store.addFaceCheck({ photoUrl: photo, matchName: matched.name, matchId: matched.id, confidence, status: "match", checkedBy: user.name });
      }
      setHistory(store.getFaceChecks());
    }, 2200);
  };

  const riskColor: Record<string, string> = { low: "text-green-400", medium: "text-yellow-400", high: "text-destructive" };
  const riskLabel: Record<string, string> = { low: "Низкий", medium: "Средний", high: "Высокий" };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Сверка по лицу</h2>
        <p className="text-xs text-muted-foreground">Идентификация по фотографии через ИИ-анализ</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Upload panel */}
        <div className="w-80 border-r border-border flex flex-col p-5 gap-4">
          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors h-48 relative overflow-hidden
              ${photo ? "border-primary/40" : "border-border hover:border-primary/50"}`}>
            {photo ? (
              <>
                <img src={photo} alt="Загруженное фото" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white">Заменить фото</span>
                </div>
              </>
            ) : (
              <>
                <Icon name="Camera" size={32} className="text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground text-center">Нажмите для загрузки фото</p>
                <p className="text-xs text-muted-foreground/60 text-center mt-1">JPG, PNG до 10 МБ</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

          <button onClick={handleCheck} disabled={!photo || checking}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-3 rounded transition-all disabled:opacity-50 font-medium">
            {checking ? (
              <><Icon name="Loader2" size={16} className="animate-spin" />Анализ лица...</>
            ) : (
              <><Icon name="ScanFace" size={16} />Запустить сверку</>
            )}
          </button>

          {photo && (
            <button onClick={() => { setPhoto(null); setResult(null); setNoMatch(false); if (fileRef.current) fileRef.current.value = ""; }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
              Очистить
            </button>
          )}

          <div className="bg-muted/30 border border-border rounded p-3">
            <div className="text-xs text-muted-foreground mb-2">Как это работает</div>
            <ul className="space-y-1.5">
              {["Загрузите фотографию лица", "ИИ сравнивает с профилями в базе", "Результат — совпадение или нет"].map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-mono-ibm shrink-0">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Result panel */}
        <div className="flex-1 overflow-auto">
          {checking && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
              <div className="w-20 h-20 rounded-full border-2 border-primary/30 flex items-center justify-center mb-6 relative">
                <Icon name="ScanFace" size={32} className="text-primary" />
                <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
              </div>
              <p className="text-sm font-medium text-foreground">Анализ биометрических данных</p>
              <p className="text-xs text-muted-foreground mt-2">Сравниваем с базой профилей...</p>
              <div className="mt-4 space-y-1.5 w-56">
                {["Детекция лица", "Извлечение признаков", "Сравнение с базой"].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon name="Loader2" size={11} className="text-primary animate-spin" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!checking && result && (
            <div className="p-6 animate-slide-up">
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded p-4 mb-5">
                <Icon name="CheckCircle2" size={20} className="text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-400">Совпадение найдено</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Уровень достоверности: {result.confidence}%</p>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="mb-5">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Достоверность совпадения</span>
                  <span className="text-xs font-mono-ibm text-foreground">{result.confidence}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${result.confidence >= 90 ? "bg-green-500" : result.confidence >= 75 ? "bg-yellow-500" : "bg-destructive"}`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.confidence >= 90 ? "Высокая достоверность" : result.confidence >= 75 ? "Средняя достоверность" : "Низкая достоверность — требуется ручная проверка"}
                </p>
              </div>

              <div className="bg-card border border-border rounded p-4">
                <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Профиль в базе</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "ФИО", value: result.profile.name },
                    { label: "Дата рождения", value: result.profile.dob || "—" },
                    { label: "ИНН", value: result.profile.inn || "—" },
                    { label: "Регион", value: result.profile.region || "—" },
                    { label: "Категория", value: result.profile.category },
                    { label: "Уровень риска", value: riskLabel[result.profile.risk] },
                  ].map((f) => (
                    <div key={f.label} className="bg-muted/40 border border-border rounded p-2.5">
                      <div className="text-xs text-muted-foreground mb-0.5">{f.label}</div>
                      <div className={`text-xs font-medium font-mono-ibm ${f.label === "Уровень риска" ? riskColor[result.profile.risk] : "text-foreground"}`}>{f.value}</div>
                    </div>
                  ))}
                </div>
                {result.profile.risk === "high" && (
                  <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded px-3 py-2 mt-3">
                    <Icon name="AlertTriangle" size={13} className="text-destructive" />
                    <span className="text-xs text-destructive">Высокий уровень риска — требует особого внимания</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!checking && noMatch && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-slide-up">
              <div className="w-20 h-20 rounded-full bg-muted/50 border border-border flex items-center justify-center mb-4">
                <Icon name="UserX" size={32} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">Совпадений не найдено</p>
              <p className="text-xs text-muted-foreground mt-2 max-w-xs">Лицо не идентифицировано в базе реестра. Возможно, профиль не добавлен в систему.</p>
            </div>
          )}

          {!checking && !result && !noMatch && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 rounded-full bg-muted/30 border border-border flex items-center justify-center mb-4">
                <Icon name="ScanFace" size={32} className="text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">Загрузите фото и запустите сверку</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Результат появится здесь</p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && !checking && (
            <div className="px-6 pb-6">
              <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider border-t border-border pt-4 mt-2">История проверок</div>
              <div className="space-y-2">
                {history.slice(0, 5).map((h) => (
                  <div key={h.id} className="flex items-center justify-between bg-muted/20 border border-border rounded px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${h.status === "match" ? "bg-green-500" : "bg-muted-foreground"}`} />
                      <span className="text-xs text-foreground">{h.status === "match" ? h.matchName : "Нет совпадения"}</span>
                      {h.status === "match" && <span className="text-xs text-muted-foreground font-mono-ibm">{h.confidence}%</span>}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono-ibm">{h.checkedAt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
