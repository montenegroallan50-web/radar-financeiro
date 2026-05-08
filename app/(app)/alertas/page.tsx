"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Tipos ────────────────────────────────────────────────────────────────────
type AlertType = "saldo_baixo" | "meta_orcamento" | "vencimento_investimento" | "relatorio_mensal" | "gasto_alto";

interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  read: boolean;
  created_at: string;
}

// ── Helpers visuais ──────────────────────────────────────────────────────────
function getAlertStyle(type: AlertType) {
  switch (type) {
    case "saldo_baixo":             return { bg:"#FEF2F2", border:"#f5c0c0", stripe:"#d05050", iconBg:"rgba(208,80,80,.15)", icon:"💰", label:"urgente" };
    case "meta_orcamento":          return { bg:"#FFFBEB", border:"#f5d87a", stripe:"#BA7517", iconBg:"rgba(186,117,23,.12)", icon:"⚠️", label:"atencao" };
    case "vencimento_investimento": return { bg:"#EFF6FF", border:"#bfdbfe", stripe:"#185FA5", iconBg:"rgba(24,95,165,.1)",  icon:"📅", label:"info"    };
    case "relatorio_mensal":        return { bg:"#edf6f1", border:"#b5d4c8", stripe:"#0F6E56", iconBg:"rgba(15,110,86,.12)", icon:"📋", label:"info"    };
    case "gasto_alto":              return { bg:"#FEF2F2", border:"#f5c0c0", stripe:"#d05050", iconBg:"rgba(208,80,80,.15)", icon:"💳", label:"urgente" };
    default:                        return { bg:"#EFF6FF", border:"#bfdbfe", stripe:"#185FA5", iconBg:"rgba(24,95,165,.1)",  icon:"🔔", label:"info"    };
  }
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2)   return "Agora";
  if (mins < 60)  return `Há ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `Há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Há ${days} dia${days !== 1 ? "s" : ""}`;
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function AlertasPage() {
  const router = useRouter();
  const [alerts, setAlerts]       = useState<AlertItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("alertas");
  const [modalAlert, setModalAlert] = useState<AlertItem | null>(null);
  const [toast, setToast]         = useState("");
  const [thresh, setThresh]       = useState(80);
  const [syncStatus, setSyncStatus] = useState<'idle'|'success'|'error'>('idle');

  // ── Configurações (por enquanto local, próximo passo salva no Supabase) ───
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Orçamento estourado": true,
    "Próximo do limite": true,
    "Open Finance expirando": true,
    "Transação acima de R$500": true,
    "Saldo baixo": false,
    "Vencimento próximo": true,
    "Rentabilidade negativa": true,
    "Push no celular": true,
    "E-mail semanal": false,
  });

  // ── Busca alertas da API ─────────────────────────────────────────────────
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setSyncStatus('idle');
      // 1. Gera alertas novos baseado nos dados reais
      await fetch("/api/alerts/generate", { method: "POST" });
      // 2. Busca todos os alertas do banco
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (data.alerts) {
        setAlerts(data.alerts);
        setSyncStatus('success');
      }
    } catch (err) {
      console.error("Erro ao buscar alertas:", err);
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Busca configurações salvas ───────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/alert-settings");
      const data = await res.json();
      if (data.settings) {
        setToggles({
          "Orçamento estourado":    data.settings.orcamento_estourado,
          "Próximo do limite":      data.settings.proximo_limite,
          "Open Finance expirando": data.settings.open_finance_expirando,
          "Transação acima de R$500": data.settings.transacao_alta,
          "Saldo baixo":            data.settings.saldo_baixo,
          "Vencimento próximo":     data.settings.vencimento_proximo,
          "Rentabilidade negativa": data.settings.rentabilidade_negativa,
          "Push no celular":        data.settings.push_celular,
          "E-mail semanal":         data.settings.email_semanal,
        });
        setThresh(data.settings.threshold_percent);
      }
    } catch (err) {
      console.error("Erro ao buscar configurações:", err);
    }
  }, []);

  // ── Salva configuração no Supabase ───────────────────────────────────────────
  async function saveSettings(field: string, value: boolean | number) {
    try {
      await fetch("/api/alert-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
    } catch (err) {
      console.error("Erro ao salvar configuração:", err);
    }
  }

  useEffect(() => {
    fetchAlerts();
    fetchSettings();
  }, [fetchAlerts, fetchSettings]);

  // ── Marcar como lido ─────────────────────────────────────────────────────
  async function markRead(id: string) {
    try {
      await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
      showToast("Alerta marcado como lido");
    } catch {
      showToast("Erro ao atualizar alerta");
    }
  }

  // ── Dispensar (marcar como lido e esconder) ──────────────────────────────
  async function dismiss(id: string) {
    await markRead(id);
    setAlerts(prev => prev.filter(a => a.id !== id));
    showToast("Alerta dispensado");
  }

  async function dismissAll() {
    const unread = alerts.filter(a => !a.read);
    await Promise.all(unread.map(a => markRead(a.id)));
    setAlerts([]);
    showToast("Todos os alertas dispensados");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  // Mapa de nome do toggle → campo no banco
  const toggleFieldMap: Record<string, string> = {
    "Orçamento estourado":      "orcamento_estourado",
    "Próximo do limite":        "proximo_limite",
    "Open Finance expirando":   "open_finance_expirando",
    "Transação acima de R$500": "transacao_alta",
    "Saldo baixo":              "saldo_baixo",
    "Vencimento próximo":       "vencimento_proximo",
    "Rentabilidade negativa":   "rentabilidade_negativa",
    "Push no celular":          "push_celular",
    "E-mail semanal":           "email_semanal",
  };

  function toggleConfig(name: string) {
    setToggles(prev => {
      const next = { ...prev, [name]: !prev[name] };
      showToast(next[name] ? "Alerta ativado" : "Alerta desativado");
      const field = toggleFieldMap[name];
      if (field) saveSettings(field, next[name]);
      return next;
    });
  }

  // ── Separar por prioridade ───────────────────────────────────────────────
  const ativos    = alerts.filter(a => !a.read);
  const urgentes  = ativos.filter(a => ["saldo_baixo","gasto_alto"].includes(a.type));
  const atencao   = ativos.filter(a => a.type === "meta_orcamento");
  const info      = ativos.filter(a => ["vencimento_investimento","relatorio_mensal"].includes(a.type));
  const historico = alerts.filter(a => a.read);

  // ── Seções de configuração ───────────────────────────────────────────────
  const configSections = [
    {
      title: "Alertas de orçamento",
      items: [
        { icon:"🔴", iconBg:"#FEF2F2", name:"Orçamento estourado",  desc:"Alerta imediato ao ultrapassar o limite" },
        { icon:"⚠️", iconBg:"#FFFBEB", name:"Próximo do limite",    desc:"Aviso antes de atingir a meta"          },
      ],
    },
    {
      title: "Alertas bancários",
      items: [
        { icon:"🔄", iconBg:"#edf6f1", name:"Open Finance expirando",   desc:"Aviso 30 dias antes de renovar"          },
        { icon:"💳", iconBg:"#EFF6FF", name:"Transação acima de R$500", desc:"Alerta para gastos grandes"              },
        { icon:"🔒", iconBg:"#F3EFFE", name:"Saldo baixo",              desc:"Aviso quando saldo ficar abaixo de R$500" },
      ],
    },
    {
      title: "Alertas de investimentos",
      items: [
        { icon:"📅", iconBg:"#FAEEDA", name:"Vencimento próximo",     desc:"Aviso 60 dias antes do vencimento"        },
        { icon:"📉", iconBg:"#edf6f1", name:"Rentabilidade negativa", desc:"Alerta se algum ativo entrar no negativo"  },
      ],
    },
    {
      title: "Canal de notificação",
      items: [
        { icon:"📱", iconBg:"#edf6f1", name:"Push no celular", desc:"Notificação no smartphone"      },
        { icon:"📧", iconBg:"#EFF6FF", name:"E-mail semanal",  desc:"Resumo toda segunda-feira"      },
      ],
    },
  ];

  // ── Componentes internos ─────────────────────────────────────────────────
  function Toggle({ name }: { name: string }) {
    const on = toggles[name] ?? false;
    return (
      <div onClick={() => toggleConfig(name)}
        className="relative w-9 h-5 rounded-full cursor-pointer flex-shrink-0 transition-all"
        style={{ background: on ? "#0F6E56" : "#d1d5db" }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
          style={{ left: on ? "18px" : "2px" }}/>
      </div>
    );
  }

  function AlertGroup({ label, items }: { label: string; items: AlertItem[] }) {
    if (items.length === 0) return null;
    return (
      <div className="mb-3">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="space-y-2">
          {items.map(a => {
            const s = getAlertStyle(a.type);
            return (
              <div key={a.id} className="rounded-2xl border shadow-md overflow-hidden relative"
                style={{ background: s.bg, borderColor: s.border }}>
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: s.stripe }}/>
                <div className="pl-4 pr-3 pt-3 pb-2">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: s.iconBg }}>{s.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-gray-800 leading-tight">{a.title}</p>
                      <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">{a.description}</p>
                      <p className="text-[12px] text-gray-400 mt-1">{relativeDate(a.created_at)}</p>
                    </div>
                    <button onClick={() => dismiss(a.id)}
                      className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[12px] text-gray-500 flex-shrink-0">
                      ✕
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    <button onClick={() => setModalAlert(a)}
                      className="px-3 py-1.5 rounded-lg text-[13px] font-bold text-white"
                      style={{ background: "#0F6E56" }}>
                      Ver detalhes
                    </button>
                    <button onClick={() => dismiss(a.id)}
                      className="px-3 py-1.5 rounded-lg text-[13px] font-semibold text-gray-500 border border-gray-200 bg-white">
                      Dispensar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const tabs = [
    { id:"alertas",  label:"🔔 Alertas",   badge: ativos.length  },
    { id:"config",   label:"⚙️ Config."                          },
    { id:"hist",     label:"📋 Histórico"                        },
  ];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="relative flex items-center justify-between px-4 py-3 sticky top-0 z-10 overflow-hidden"
        style={{ background:"linear-gradient(160deg,#0F6E56 0%,#085041 100%)" }}>
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full" style={{ background:"rgba(255,255,255,0.05)" }}/>
        <div className="absolute right-8 top-4 w-12 h-12 rounded-full"   style={{ background:"rgba(255,255,255,0.05)" }}/>
        <div className="flex items-center gap-2 relative z-10">
          <button onClick={() => router.push("/dashboard")}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background:"rgba(255,255,255,0.15)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <span className="text-[15px] font-bold tracking-tight text-white">
            Radar<span style={{ color:"rgba(255,255,255,0.7)" }}>Financeiro</span>
          </span>
        </div>
        {ativos.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full relative z-10"
            style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
            <span className="text-[13px] font-bold text-white">{ativos.length} ativo{ativos.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* ABAS */}
      <div className="flex bg-white border-b border-gray-200 shadow-sm">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2.5 text-[12px] font-semibold whitespace-nowrap transition-all border-b-2 flex items-center justify-center gap-1"
            style={activeTab === tab.id
              ? { borderColor:"#0F6E56", color:"#0F6E56", background:"#f0faf6" }
              : { borderColor:"transparent", color:"#9ca3af", background:"#fff" }}>
            {tab.label}
            {tab.badge ? (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-[#E2E4EC]">

        {/* ── ALERTAS ── */}
        {activeTab === "alertas" && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin mb-3"/>
                <p className="text-sm text-gray-400">Buscando alertas...</p>
              </div>
            ) : ativos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-sm font-bold text-gray-700">Tudo em dia!</p>
                <p className="text-xs text-gray-400 mt-1">Nenhum alerta ativo no momento.</p>
              </div>
            ) : (
              <>
                <AlertGroup label="🔴 Urgente"     items={urgentes}/>
                <AlertGroup label="⚠️ Atenção"     items={atencao}/>
                <AlertGroup label="ℹ️ Informativo"  items={info}/>
                <button onClick={dismissAll}
                  className="w-full text-center text-[13px] font-semibold text-gray-400 py-3">
                  Dispensar todos os alertas
                </button>
              </>
            )}
          </div>
        )}

        {/* ── CONFIGURAÇÕES ── */}
        {activeTab === "config" && (
          <div className="space-y-4">
            {/* Slider threshold */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-md">
              <p className="text-[14px] font-semibold text-gray-700 mb-4">Alertar ao atingir</p>
              <div className="relative pt-9 pb-1">
                <div className="absolute top-0 flex flex-col items-center pointer-events-none z-10"
                  style={{ left:`${((thresh-50)/45)*100}%`, transform:"translateX(-50%)" }}>
                  <div className="bg-[#0F6E56] text-white text-[14px] font-bold px-3 py-1 rounded-xl shadow-lg">
                    {thresh}%
                  </div>
                  <div className="w-0 h-0" style={{ borderLeft:"6px solid transparent", borderRight:"6px solid transparent", borderTop:"6px solid #0F6E56" }}/>
                </div>
                <div className="relative h-3">
                  <div className="absolute inset-0 bg-gray-200 rounded-full"/>
                  <div className="absolute left-0 top-0 h-full bg-[#0F6E56] rounded-full"
                    style={{ width:`${((thresh-50)/45)*100}%` }}/>
                  <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-[3px] border-[#0F6E56] rounded-full shadow-md pointer-events-none"
                    style={{ left:`calc(${((thresh-50)/45)*100}% - 10px)` }}/>
                  <input type="range" min="50" max="95" step="5" value={thresh}
                    onChange={e => setThresh(Number(e.target.value))}
                    onMouseUp={e => saveSettings("threshold_percent", Number((e.target as HTMLInputElement).value))}
                    onTouchEnd={e => saveSettings("threshold_percent", Number((e.target as HTMLInputElement).value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                </div>
              </div>
              <div className="flex justify-between mt-3">
                {["50%","60%","70%","80%","90%","95%"].map(v => (
                  <span key={v} className="text-[11px] text-gray-400 font-medium">{v}</span>
                ))}
              </div>
            </div>

            {configSections.map(section => (
              <div key={section.title}>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{section.title}</p>
                <div className="space-y-2">
                  {section.items.map(item => (
                    <div key={item.name} className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100 shadow-md">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: item.iconBg }}>{item.icon}</div>
                      <div className="flex-1">
                        <p className="text-[14px] font-semibold text-gray-800">{item.name}</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                      <Toggle name={item.name}/>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── HISTÓRICO ── */}
        {activeTab === "hist" && (
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Alertas lidos</p>
            {historico.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-sm font-bold text-gray-700">Histórico vazio</p>
                <p className="text-xs text-gray-400 mt-1">Alertas dispensados aparecerão aqui.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                {historico.map((h, i) => {
                  const s = getAlertStyle(h.type);
                  return (
                    <div key={h.id} className={`flex items-start gap-3 p-3 ${i < historico.length-1 ? "border-b border-gray-50" : ""}`}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: s.stripe }}/>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-gray-700">{h.title}</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">{h.description}</p>
                      </div>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">{relativeDate(h.created_at)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'error' ? 'bg-red-500' : 'bg-[#0F6E56] animate-pulse'}`}/>
          <span className="text-[13px] font-semibold text-[#085041]">
            {syncStatus === 'success' ? 'Sincronizado!' : syncStatus === 'error' ? 'Erro ao sincronizar' : 'Open Finance ativo'}
          </span>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#edf6f1] text-[#0F6E56] border border-[#b5d4c8]">BACEN</span>
        </div>
        <button onClick={fetchAlerts} disabled={loading}
          className="text-[13px] font-semibold text-[#0F6E56] disabled:opacity-50">
          {loading ? '⏳ aguarde...' : '↻ sync'}
        </button>
      </div>

      {/* MODAL */}
      {modalAlert && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setModalAlert(null)}>
          <div className="bg-white w-full max-w-[430px] rounded-t-3xl p-6 shadow-2xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5"/>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: getAlertStyle(modalAlert.type).iconBg }}>
                {getAlertStyle(modalAlert.type).icon}
              </div>
              <h3 className="text-[17px] font-bold text-gray-800 flex-1 leading-tight">{modalAlert.title}</h3>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
              <p className="text-[14px] text-gray-600 leading-relaxed">{modalAlert.description}</p>
            </div>
            <button onClick={() => setModalAlert(null)}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white shadow-md"
              style={{ background:"#0F6E56" }}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1a2e26] text-white text-[14px] font-medium px-4 py-2 rounded-full whitespace-nowrap shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
