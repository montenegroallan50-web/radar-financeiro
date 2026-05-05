'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

// ── TYPES ──────────────────────────────────────────────────────────────────────
type AlertType = 'urgente' | 'atencao' | 'info' | 'sucesso';
type TabId = 'tab-alertas' | 'tab-config' | 'tab-hist' | 'tab-dash';

interface AlertAction {
  label: string;
  primary: boolean;
}

interface AlertItem {
  id: number;
  type: AlertType;
  icon: string;
  title: string;
  desc: string;
  time: string;
  actions: AlertAction[];
  detail: string;
}

interface ConfigToggle {
  id: string;
  icon: string;
  iconBg: string;
  name: string;
  desc: string;
  on: boolean;
  extra?: React.ReactNode;
}

// ── DATA ───────────────────────────────────────────────────────────────────────
const INIT_ALERTS: AlertItem[] = [
  { id: 0, type: 'urgente', icon: '🔴', title: 'Transporte estourou o orçamento', desc: 'Você gastou R$810 de R$800 orçados. O limite foi ultrapassado em R$10.', time: 'Agora', actions: [{ label: 'Ver transações', primary: true }, { label: 'Ajustar meta', primary: false }], detail: 'Categoria Transporte ultrapassou o orçamento de maio. Principais gastos: Uber R$28,90 · Combustível R$180 · Estacionamentos R$95. Considere aumentar a meta para R$1.000 ou reduzir os gastos nos próximos dias.' },
  { id: 1, type: 'urgente', icon: '💳', title: 'Gasto alto detectado', desc: 'Compra de R$287,40 no Supermercado Extra via Santander em 02/05.', time: 'Há 2h', actions: [{ label: 'Ver detalhes', primary: true }, { label: 'Dispensar', primary: false }], detail: 'Transação de R$287,40 detectada no Santander — Supermercado Extra em 02/05/2026. Esta transação representa 23% do seu orçamento mensal de Alimentação. Categoria atual: Alimentação.' },
  { id: 2, type: 'atencao', icon: '⚠️', title: 'Alimentação em 83% do orçamento', desc: 'Você gastou R$1.247 de R$1.500. Restam R$253 para o mês.', time: 'Ontem', actions: [{ label: 'Ver gastos', primary: true }, { label: 'Dispensar', primary: false }], detail: 'Sua categoria Alimentação está em 83% da meta mensal. Se o ritmo continuar, o orçamento será esgotado em aproximadamente 5 dias. Principais gastos: iFood R$56 · Supermercado R$287 · Padaria R$89.' },
  { id: 3, type: 'info', icon: '📅', title: 'CDB Itaú vence em 60 dias', desc: 'LCI Itaú 95% CDI no valor de R$10.800 vence em 20/07/2026.', time: '28/04', actions: [{ label: 'Ver investimento', primary: true }, { label: 'Dispensar', primary: false }], detail: 'Seu LCI Itaú (95% CDI) no valor de R$10.800 vence em 20/07/2026 — 60 dias a partir de hoje. Rentabilidade acumulada: +R$1.058,40 (9,8% a.a.). Você pode resgatar ou renovar automaticamente. Considere verificar as condições atuais do mercado antes de decidir.' },
  { id: 4, type: 'info', icon: '📉', title: 'PETR4 com rentabilidade negativa', desc: 'Ação Petrobras registrou -2,1% a.a. este mês. Posição: R$9.340.', time: '25/04', actions: [{ label: 'Ver ativo', primary: true }, { label: 'Dispensar', primary: false }], detail: 'PETR4 (Petrobras) está com rentabilidade negativa de -2,1% a.a. neste mês. Valor atual da sua posição: R$9.340. Variação do mês: -R$196,14. Isso é normal em renda variável — avalie seu horizonte de investimento antes de qualquer decisão.' },
];

const HIST_ITEMS = [
  { dot: '#d05050', text: <><strong>Transporte estourou</strong> o orçamento — R$810 de R$800 gastos</>, time: 'Hoje' },
  { dot: '#d05050', text: <><strong>Gasto alto detectado</strong> — Supermercado Extra R$287,40 no Santander</>, time: 'Hoje' },
  { dot: '#BA7517', text: <><strong>Alimentação em 83%</strong> do orçamento — R$1.247 de R$1.500</>, time: 'Ontem' },
  { dot: '#185FA5', text: <><strong>Open Finance</strong> sincronizado com sucesso — 4 bancos atualizados</>, time: '02/05' },
  { dot: '#0F6E56', text: <><strong>Meta de maio definida</strong> — orçamento total de R$4.900</>, time: '01/05' },
  { dot: '#BA7517', text: <><strong>Saúde em 86%</strong> do orçamento — R$515 de R$600</>, time: '29/04' },
  { dot: '#185FA5', text: <><strong>CDB LCI Itaú</strong> vence em 60 dias — R$10.800 disponíveis</>, time: '28/04' },
  { dot: '#d05050', text: <><strong>PETR4 rentabilidade negativa</strong> — -2,1% a.a. no mês</>, time: '25/04' },
  { dot: '#0F6E56', text: <><strong>Tesouro Selic</strong> rendeu +R$196 este mês — acumulado R$27.100</>, time: '20/04' },
  { dot: '#185FA5', text: <><strong>Open Finance Nubank</strong> conectado com sucesso via BACEN</>, time: '15/04' },
];

// ── STYLE MAPS ─────────────────────────────────────────────────────────────────
const itemBg: Record<AlertType, string> = {
  urgente: '#FEF2F2',
  atencao: '#FFFBEB',
  info:    '#EFF6FF',
  sucesso: '#edf6f1',
};
const itemBorder: Record<AlertType, string> = {
  urgente: '#f5c0c0',
  atencao: '#f5d87a',
  info:    '#bfdbfe',
  sucesso: '#b5d4c8',
};
const stripeColor: Record<AlertType, string> = {
  urgente: '#d05050',
  atencao: '#BA7517',
  info:    '#185FA5',
  sucesso: '#0F6E56',
};
const iconBg: Record<AlertType, string> = {
  urgente: 'rgba(208,80,80,.15)',
  atencao: 'rgba(186,117,23,.12)',
  info:    'rgba(24,95,165,.1)',
  sucesso: 'rgba(15,110,86,.12)',
};

// ── COMPONENTS ─────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 36, height: 20, borderRadius: 10, cursor: 'pointer', position: 'relative',
        background: on ? '#0F6E56' : 'var(--color-border-secondary)',
        transition: 'background .2s', flexShrink: 0,
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 2, left: on ? 18 : 2,
        transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
      }} />
    </div>
  );
}

// ── PAGE ───────────────────────────────────────────────────────────────────────
export default function AlertasPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tab-alertas');
  const [activeBank, setActiveBank] = useState('santander');
  const [alerts, setAlerts] = useState<AlertItem[]>(INIT_ALERTS);
  const [dismissingIds, setDismissingIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [modalAlert, setModalAlert] = useState<AlertItem | null>(null);
  const [threshVal, setThreshVal] = useState(80);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    budget_overflow: true,
    budget_near: true,
    of_expiring: true,
    txn_high: true,
    low_balance: false,
    invest_due: true,
    invest_neg: true,
    push: true,
    email: false,
  });

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 2200);
  }, []);

  const dismiss = useCallback((id: number) => {
    setDismissingIds(prev => new Set(prev).add(id));
    showToast('Alerta dispensado');
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
      setDismissingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }, 250);
  }, [showToast]);

  const dismissAll = useCallback(() => {
    setAlerts([]);
    showToast('Todos os alertas dispensados');
  }, [showToast]);

  const toggleConfig = useCallback((key: string) => {
    setToggles(prev => {
      const next = { ...prev, [key]: !prev[key] };
      showToast(next[key] ? 'Alerta ativado' : 'Alerta desativado');
      return next;
    });
  }, [showToast]);

  const urgentes = alerts.filter(a => a.type === 'urgente');
  const atencao  = alerts.filter(a => a.type === 'atencao');
  const info     = alerts.filter(a => a.type === 'info' || a.type === 'sucesso');
  const total    = alerts.length;

  const banks = [
    { id: 'santander', name: 'Santander', color: '#CC0000' },
    { id: 'nubank',    name: 'Nubank',    color: '#820AD1' },
    { id: 'inter',     name: 'Inter',     color: '#FF7A00' },
    { id: 'bradesco',  name: 'Bradesco',  color: '#CC092F' },
  ];

  const groups = [
    { label: '🔴 Urgente',     items: urgentes },
    { label: '⚠️ Atenção',     items: atencao  },
    { label: 'ℹ️ Informativo', items: info     },
  ].filter(g => g.items.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--color-background-primary)', position: 'relative', overflow: 'hidden' }}>

      {/* ── SCROLL AREA ── */}
      <div className="scrollbar-hide" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 52, WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 10px', background: 'var(--color-background-primary)', position: 'sticky', top: 0, zIndex: 10, borderBottom: '.5px solid var(--color-border-tertiary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="22" height="22" viewBox="0 0 46 46" fill="none">
              <circle cx="23" cy="23" r="20" stroke="#0F6E56" strokeWidth="1.2" opacity="0.3"/>
              <circle cx="23" cy="23" r="13" stroke="#0F6E56" strokeWidth="1.2" opacity="0.5"/>
              <circle cx="23" cy="23" r="6.5" stroke="#0F6E56" strokeWidth="1.2" opacity="0.75"/>
              <circle cx="23" cy="23" r="2" fill="#0F6E56"/>
              <path d="M23 23 L35 10" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="35" cy="10" r="2" fill="#0F6E56"/>
            </svg>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-.4px' }}>
              Radar<span style={{ color: '#0F6E56' }}>Financeiro</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)' }}>João</span>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#0F6E56', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>😎</div>
          </div>
        </div>

        {/* BANK CHIPS */}
        <div className="scrollbar-hide" style={{ display: 'flex', gap: 5, overflowX: 'auto', padding: '8px 14px', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {banks.map(b => (
            <div
              key={b.id}
              onClick={() => setActiveBank(b.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                borderRadius: 16, border: `.5px solid ${activeBank === b.id ? '#0F6E56' : 'var(--color-border-secondary)'}`,
                fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
                background: activeBank === b.id ? '#0F6E56' : 'var(--color-background-primary)',
                color: activeBank === b.id ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: b.color, display: 'inline-block', flexShrink: 0 }} />
              {b.name}
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="scrollbar-hide" style={{ display: 'flex', padding: '4px 14px 0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {([
            { id: 'tab-dash',    label: '📊 Dashboard' },
            { id: 'tab-alertas', label: '🔔 Alertas',  badge: total > 0 ? total : null },
            { id: 'tab-config',  label: '⚙️ Config.' },
            { id: 'tab-hist',    label: '📋 Histórico' },
          ] as const).map(t => (
            <div
              key={t.id}
              onClick={() => setActiveTab(t.id as TabId)}
              style={{
                padding: '7px 11px 8px', fontSize: 11, fontWeight: activeTab === t.id ? 700 : 500,
                color: activeTab === t.id ? '#0F6E56' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                background: activeTab === t.id ? 'var(--color-background-primary)' : 'var(--color-background-secondary)',
                border: `.5px solid var(--color-border-tertiary)`,
                borderBottom: activeTab === t.id ? '.5px solid var(--color-background-primary)' : 'none',
                borderRadius: '8px 8px 0 0', marginRight: 2, whiteSpace: 'nowrap', flexShrink: 0,
                position: 'relative', top: 1, transition: 'all .15s', zIndex: activeTab === t.id ? 2 : 1,
              }}
            >
              {t.label}
              {'badge' in t && t.badge ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '50%', background: '#d05050', color: '#fff', fontSize: 9, fontWeight: 700, marginLeft: 4, verticalAlign: 'middle' }}>
                  {t.badge}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {/* PANEL */}
        <div style={{ background: 'var(--color-background-primary)', border: '.5px solid var(--color-border-tertiary)', borderRadius: '0 8px 8px 8px', padding: '12px 14px', margin: '0 14px', position: 'relative', zIndex: 1 }}>

          {/* ── DASHBOARD placeholder ── */}
          {activeTab === 'tab-dash' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>Dashboard completo</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 16 }}>Saldos, gráficos, investimentos e muito mais</div>
              <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#0F6E56', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                ← Ir para o Dashboard
              </Link>
            </div>
          )}

          {/* ── ALERTAS ATIVOS ── */}
          {activeTab === 'tab-alertas' && (
            <div>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
                <div style={{ background: '#FEF2F2', border: '.5px solid #f5c0c0', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.5px', color: '#d05050' }}>{urgentes.length}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 2, color: '#d05050' }}>Urgentes</div>
                </div>
                <div style={{ background: '#FFFBEB', border: '.5px solid #f5d87a', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.5px', color: '#BA7517' }}>{atencao.length}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 2, color: '#BA7517' }}>Atenção</div>
                </div>
                <div style={{ background: '#edf6f1', border: '.5px solid #b5d4c8', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.5px', color: '#0F6E56' }}>{info.length}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 2, color: '#0F6E56' }}>Informativo</div>
                </div>
              </div>

              {/* Alert groups */}
              {alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Tudo em dia!</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>Nenhum alerta ativo no momento.</div>
                </div>
              ) : (
                groups.map(g => (
                  <div key={g.label} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6, padding: '0 2px' }}>
                      {g.label}
                    </div>
                    {g.items.map(a => (
                      <div
                        key={a.id}
                        style={{
                          borderRadius: 10, padding: '11px 12px', marginBottom: 6,
                          border: `.5px solid ${itemBorder[a.type]}`,
                          background: itemBg[a.type],
                          position: 'relative', overflow: 'hidden',
                          opacity: dismissingIds.has(a.id) ? 0 : 1,
                          transform: dismissingIds.has(a.id) ? 'translateX(20px)' : 'none',
                          transition: 'all .25s ease',
                        }}
                      >
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderRadius: '2px 0 0 2px', background: stripeColor[a.type] }} />
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, paddingLeft: 6 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, background: iconBg[a.type] }}>
                            {a.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>{a.title}</div>
                            <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>{a.desc}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 4, paddingLeft: 6 }}>{a.time}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingLeft: 6 }}>
                          {a.actions.map((ac, i) => (
                            <button
                              key={i}
                              onClick={() => ac.primary ? setModalAlert(a) : dismiss(a.id)}
                              style={{
                                padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                                fontFamily: 'Inter, sans-serif', cursor: 'pointer', border: 'none',
                                transition: 'all .15s',
                                background: ac.primary ? '#0F6E56' : 'transparent',
                                color: ac.primary ? '#fff' : 'var(--color-text-secondary)',
                                ...(ac.primary ? {} : { border: '.5px solid var(--color-border-secondary)' }),
                              }}
                            >
                              {ac.label}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => dismiss(a.id)}
                          style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.06)', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ))
              )}

              {alerts.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <button onClick={dismissAll} style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', background: 'none', border: 'none', fontFamily: 'Inter, sans-serif', cursor: 'pointer', padding: 6 }}>
                    Dispensar todos os alertas
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── CONFIGURAÇÕES ── */}
          {activeTab === 'tab-config' && (
            <div>
              {/* Orçamento */}
              <ConfigSection title="Alertas de orçamento">
                <div style={{ background: 'var(--color-background-secondary)', border: '.5px solid var(--color-border-tertiary)', borderRadius: 10, padding: '11px 12px', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>Alertar ao atingir</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F6E56' }}>{threshVal}%</span>
                  </div>
                  <input
                    type="range" min={50} max={95} value={threshVal} step={5}
                    onChange={e => setThreshVal(Number(e.target.value))}
                    style={{ width: '100%', height: 4, borderRadius: 2, background: 'var(--color-border-tertiary)', WebkitAppearance: 'none', appearance: 'none', outline: 'none', cursor: 'pointer' } as React.CSSProperties}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    <span>50%</span><span>70%</span><span>80%</span><span>95%</span>
                  </div>
                </div>
                <ConfigToggleItem icon="🔴" iconBg="#FEF2F2" name="Orçamento estourado" desc="Alerta imediato ao ultrapassar o limite" on={toggles.budget_overflow} onChange={() => toggleConfig('budget_overflow')} />
                <ConfigToggleItem icon="⚠️" iconBg="#FFFBEB" name="Próximo do limite" desc="Aviso antes de atingir a meta" on={toggles.budget_near} onChange={() => toggleConfig('budget_near')} />
              </ConfigSection>

              {/* Bancários */}
              <ConfigSection title="Alertas bancários">
                <ConfigToggleItem icon="🔄" iconBg="#edf6f1" name="Open Finance expirando" desc="Aviso 30 dias antes de renovar" on={toggles.of_expiring} onChange={() => toggleConfig('of_expiring')} />
                <ConfigToggleItem
                  icon="💳" iconBg="#EFF6FF" name="Transação acima de" desc="Alerta para gastos grandes"
                  on={toggles.txn_high} onChange={() => toggleConfig('txn_high')}
                  extra={<span style={{ fontSize: 12, fontWeight: 700, color: '#0F6E56', marginRight: 6 }}>R$500</span>}
                />
                <ConfigToggleItem icon="🔒" iconBg="#F3EFFE" name="Saldo baixo" desc="Aviso quando saldo ficar abaixo de R$500" on={toggles.low_balance} onChange={() => toggleConfig('low_balance')} />
              </ConfigSection>

              {/* Investimentos */}
              <ConfigSection title="Alertas de investimentos">
                <ConfigToggleItem icon="📅" iconBg="#FAEEDA" name="Vencimento próximo" desc="Aviso 60 dias antes do vencimento" on={toggles.invest_due} onChange={() => toggleConfig('invest_due')} />
                <ConfigToggleItem icon="📉" iconBg="#edf6f1" name="Rentabilidade negativa" desc="Alerta se algum ativo entrar no negativo" on={toggles.invest_neg} onChange={() => toggleConfig('invest_neg')} />
              </ConfigSection>

              {/* Canal */}
              <ConfigSection title="Canal de notificação">
                <ConfigToggleItem icon="📱" iconBg="#edf6f1" name="Push no celular" desc="Notificação no smartphone" on={toggles.push} onChange={() => toggleConfig('push')} />
                <ConfigToggleItem icon="📧" iconBg="#EFF6FF" name="E-mail semanal" desc="Resumo toda segunda-feira" on={toggles.email} onChange={() => toggleConfig('email')} />
              </ConfigSection>
            </div>
          )}

          {/* ── HISTÓRICO ── */}
          {activeTab === 'tab-hist' && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 10 }}>Últimos 30 dias</div>
              {HIST_ITEMS.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 0', borderBottom: i < HIST_ITEMS.length - 1 ? '.5px solid var(--color-border-tertiary)' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.dot, flexShrink: 0, marginTop: 3 }} />
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.4, flex: 1 }}>{h.text}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', flexShrink: 0 }}>{h.time}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 52, background: 'var(--color-background-primary)', borderTop: '.5px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="animate-pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#0F6E56' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#085041' }}>Open Finance ativo</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 5, background: '#edf6f1', color: '#0F6E56', border: '.5px solid #b5d4c8' }}>BACEN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>sync agora</span>
          <button onClick={() => showToast('Sincronizando…')} style={{ fontSize: 13, fontWeight: 600, color: '#0F6E56', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'Inter, sans-serif' }}>↻</button>
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: 'absolute', bottom: 62, left: '50%', transform: 'translateX(-50%)', background: '#1a2e26', color: '#fff', fontSize: 12, fontWeight: 500, padding: '8px 16px', borderRadius: 20, whiteSpace: 'nowrap', zIndex: 200 }}>
          {toast}
        </div>
      )}

      {/* ── MODAL DETALHE ── */}
      {modalAlert && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setModalAlert(null); }}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end', animation: 'fadeInOverlay .15s ease' }}
        >
          <div style={{ background: 'var(--color-background-primary)', borderRadius: '16px 16px 0 0', width: '100%' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--color-border-secondary)', margin: '10px auto 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{modalAlert.title}</span>
              <button onClick={() => setModalAlert(null)} style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--color-background-secondary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--color-text-secondary)' }}>✕</button>
            </div>
            <div style={{ padding: '0 16px 20px' }}>
              <div style={{ background: 'var(--color-background-secondary)', borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 24 }}>{modalAlert.icon}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{modalAlert.detail}</div>
              </div>
              <button onClick={() => setModalAlert(null)} style={{ width: '100%', padding: 11, background: '#0F6E56', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, fontFamily: 'Inter, sans-serif', cursor: 'pointer', marginTop: 14 }}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #0F6E56; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
      `}</style>
    </div>
  );
}

// ── HELPERS ────────────────────────────────────────────────────────────────────
function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function ConfigToggleItem({ icon, iconBg, name, desc, on, onChange, extra }: { icon: string; iconBg: string; name: string; desc: string; on: boolean; onChange: () => void; extra?: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--color-background-secondary)', border: '.5px solid var(--color-border-tertiary)', borderRadius: 10, padding: '11px 12px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, background: iconBg }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{name}</div>
        <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 2 }}>{desc}</div>
      </div>
      {extra}
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}
