'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Chart as ChartJS,
  ArcElement, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, Filler, Tooltip,
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip);

// ── CATEGORIAS ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'alimentacao', name: 'Alimentação',  icon: '🛒', bg: '#edf6f1', color: '#085041' },
  { id: 'transporte',  name: 'Transporte',   icon: '🚗', bg: '#E6F1FB', color: '#0C447C' },
  { id: 'saude',       name: 'Saúde',        icon: '💊', bg: '#FCEBEB', color: '#791F1F' },
  { id: 'lazer',       name: 'Lazer',        icon: '🎬', bg: '#FAEEDA', color: '#633806' },
  { id: 'contas',      name: 'Contas fixas', icon: '📱', bg: '#F3EFFE', color: '#5B3E8F' },
  { id: 'investimento',name: 'Investimento', icon: '📈', bg: '#edf6f1', color: '#085041' },
  { id: 'educacao',    name: 'Educação',     icon: '📚', bg: '#E6F1FB', color: '#0C447C' },
  { id: 'outros',      name: 'Outros',       icon: '📦', bg: '#f4f6f4', color: '#5a7a6e' },
];

// ── DADOS ─────────────────────────────────────────────────────────────────────
const BANKS = [
  { id: 'santander', name: 'Santander', color: '#CC0000', saldo: 'R$ 4.820' },
  { id: 'nubank',    name: 'Nubank',    color: '#820AD1', saldo: 'R$ 2.310' },
  { id: 'inter',     name: 'Inter',     color: '#FF7A00', saldo: 'R$ 1.450' },
  { id: 'bradesco',  name: 'Bradesco',  color: '#CC092F', saldo: 'R$ 6.100' },
  { id: 'itau',      name: 'Itaú',      color: '#003399', saldo: 'R$ 3.780' },
];

const INVESTMENTS = [
  { icon: '🏛', name: 'Tesouro Selic 2029',    bank: 'Santander', type: 'tesouro', typeName: 'Tesouro', typeBg: '#edf6f1', typeC: '#085041', valor: 'R$ 27.100', rent: '+8,7%',      rentPos: true  },
  { icon: '💰', name: 'CDB Bradesco 115% CDI', bank: 'Bradesco',  type: 'cdb',     typeName: 'CDB',     typeBg: '#E6F1FB', typeC: '#0C447C', valor: 'R$ 18.500', rent: '+11,2%',     rentPos: true  },
  { icon: '🏠', name: 'HGLG11 — Logística',    bank: 'Nubank',    type: 'acoes',   typeName: 'FII',     typeBg: '#FAEEDA', typeC: '#633806', valor: 'R$ 12.400', rent: '+6,3%',      rentPos: true  },
  { icon: '📊', name: 'LCI Itaú 95% CDI',      bank: 'Itaú',      type: 'cdb',     typeName: 'LCI',     typeBg: '#E6F1FB', typeC: '#0C447C', valor: 'R$ 10.800', rent: '+9,8%',      rentPos: true  },
  { icon: '📈', name: 'PETR4 — Petrobras',     bank: 'Inter',     type: 'acoes',   typeName: 'Ação',    typeBg: '#FAEEDA', typeC: '#633806', valor: 'R$ 9.340',  rent: '-2,1%',      rentPos: false },
  { icon: '🔵', name: 'Fundo Multimercado XP', bank: 'Santander', type: 'fundos',  typeName: 'Fundo',   typeBg: '#F3EFFE', typeC: '#5B3E8F', valor: 'R$ 8.200',  rent: '+13,4%',     rentPos: true  },
  { icon: '🏛', name: 'Tesouro IPCA+ 2035',    bank: 'Nubank',    type: 'tesouro', typeName: 'Tesouro', typeBg: '#edf6f1', typeC: '#085041', valor: 'R$ 7.000',  rent: '+IPCA+6,2%', rentPos: true  },
  { icon: '🏬', name: 'XPML11 — Shoppings',    bank: 'Bradesco',  type: 'acoes',   typeName: 'FII',     typeBg: '#FAEEDA', typeC: '#633806', valor: 'R$ 6.000',  rent: '+8,1%',      rentPos: true  },
];

const INIT_TXNS = [
  { id: 0, icon: '🛒', name: 'Supermercado Extra',     meta: 'Santander · 02/05', amount: '-R$ 287,40',   type: 'compras', cat: 'alimentacao', cr: false },
  { id: 1, icon: '💸', name: 'Transferência recebida', meta: 'Nubank · 01/05',    amount: '+R$ 2.000,00', type: 'transf',  cat: 'outros',      cr: true  },
  { id: 2, icon: '🏧', name: 'Saque Santander',        meta: 'Santander · 30/04', amount: '-R$ 300,00',   type: 'saques',  cat: 'outros',      cr: false },
  { id: 3, icon: '🚗', name: 'Uber',                   meta: 'Inter · 30/04',     amount: '-R$ 28,90',    type: 'compras', cat: 'transporte',  cr: false },
  { id: 4, icon: '💊', name: 'Farmácia Ultrafarma',    meta: 'Bradesco · 29/04',  amount: '-R$ 95,00',    type: 'compras', cat: 'saude',       cr: false },
  { id: 5, icon: '📱', name: 'Tim — Fatura',           meta: 'Santander · 28/04', amount: '-R$ 89,90',    type: 'pgtos',   cat: 'contas',      cr: false },
  { id: 6, icon: '🍕', name: 'iFood',                  meta: 'Nubank · 28/04',    amount: '-R$ 56,00',    type: 'compras', cat: 'alimentacao', cr: false },
  { id: 7, icon: '🎬', name: 'Netflix',                meta: 'Itaú · 27/04',      amount: '-R$ 44,90',    type: 'pgtos',   cat: 'lazer',       cr: false },
];

const INIT_BUDGETS = [
  { id: 'alimentacao', name: 'Alimentação',  icon: '🛒', bg: '#edf6f1', color: '#085041', used: 1247, limit: 1500 },
  { id: 'transporte',  name: 'Transporte',   icon: '🚗', bg: '#E6F1FB', color: '#0C447C', used: 810,  limit: 800  },
  { id: 'lazer',       name: 'Lazer',        icon: '🎬', bg: '#FAEEDA', color: '#633806', used: 662,  limit: 1000 },
  { id: 'saude',       name: 'Saúde',        icon: '💊', bg: '#FCEBEB', color: '#791F1F', used: 515,  limit: 600  },
  { id: 'contas',      name: 'Contas fixas', icon: '📱', bg: '#F3EFFE', color: '#5B3E8F', used: 320,  limit: 500  },
];

// ── CHART DATA ─────────────────────────────────────────────────────────────────
const PIE_CAT_DATA = {
  labels: ['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Outros'],
  datasets: [{ data: [34, 22, 18, 14, 12], backgroundColor: ['#0F6E56', '#185FA5', '#BA7517', '#d05050', '#888'], borderWidth: 2, borderColor: '#ffffff' }],
};
const LINE_FLOW_DATA = {
  labels: ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
  datasets: [
    { data: [7200, 8100, 7500, 8800, 7900, 8500], borderColor: '#0F6E56', backgroundColor: 'rgba(15,110,86,0.07)', tension: 0.4, fill: true, pointRadius: 2, borderWidth: 1.8 },
    { data: [5100, 4800, 5300, 4200, 4900, 3680], borderColor: '#d05050', backgroundColor: 'rgba(208,80,80,0.05)', tension: 0.4, fill: true, pointRadius: 2, borderWidth: 1.8 },
  ],
};
const PIE_INVEST_DATA = {
  labels: ['Tesouro', 'CDB/LCI', 'Ações/FIIs', 'Fundos'],
  datasets: [{ data: [31, 28, 25, 16], backgroundColor: ['#0F6E56', '#185FA5', '#BA7517', '#7B5EA7'], borderWidth: 2, borderColor: '#ffffff' }],
};
const BAR_RENT_DATA = {
  labels: ['Tesouro', 'CDB/LCI', 'Ações', 'Fundos'],
  datasets: [{ data: [8.7, 10.5, 6.2, 13.4], backgroundColor: ['#0F6E56', '#185FA5', '#BA7517', '#7B5EA7'], borderRadius: 5 }],
};
const LINE_EVOL_DATA = {
  labels: ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
  datasets: [
    { data: [72000, 74500, 75200, 76800, 78000, 79500, 81000, 82400, 84000, 85100, 86200, 87340], borderColor: '#0F6E56', backgroundColor: 'rgba(15,110,86,0.08)', tension: 0.4, fill: true, pointRadius: 2, borderWidth: 2 },
    { data: [70000, 70000, 70000, 72000, 72000, 72000, 74000, 74000, 74000, 76000, 76000, 76000], borderColor: '#b5d4c8', backgroundColor: 'transparent', tension: 0.4, fill: false, pointRadius: 0, borderWidth: 1.5, borderDash: [4, 4] },
  ],
};

// ── CHART OPTIONS ─────────────────────────────────────────────────────────────
const TICK_FONT = { size: 9, family: 'Inter' };
const PIE_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => ` ${c.label}: ${c.parsed}%` } } },
};
const LINE_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: TICK_FONT } },
    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: TICK_FONT, callback: (v: any) => 'R$' + (v / 1000).toFixed(0) + 'k' } },
  },
};
const BAR_OPTS = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: TICK_FONT } },
    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: TICK_FONT, callback: (v: any) => v + '%' } },
  },
};

// ── STYLE TOKENS ──────────────────────────────────────────────────────────────
const C = {
  bg1: '#ffffff', bg2: '#f4f6f4', bdr: '#e8ede8',
  txt1: '#1a2e26', txt2: '#6b8c7e',
  green: '#0F6E56', red: '#d05050',
};
const s = {
  metricCard: { background: C.bg2, borderRadius: '10px', padding: '10px' } as React.CSSProperties,
  metricLbl:  { fontSize: '9px', fontWeight: 600, color: C.txt2, letterSpacing: '.05em', textTransform: 'uppercase' as const, marginBottom: '3px' } as React.CSSProperties,
  metricDelta:{ fontSize: '9px', color: C.txt2, marginTop: '2px' } as React.CSSProperties,
  chartCard:  { background: C.bg2, border: `.5px solid ${C.bdr}`, borderRadius: '10px', padding: '10px', marginBottom: '8px' } as React.CSSProperties,
  chartH3:    { fontSize: '9px', fontWeight: 600, color: C.txt2, letterSpacing: '.07em', textTransform: 'uppercase' as const, marginBottom: '8px' } as React.CSSProperties,
  legRow:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as React.CSSProperties,
  legLeft:    { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 500, color: C.txt1 } as React.CSSProperties,
  legPct:     { fontSize: '10px', fontWeight: 700, color: C.txt2 } as React.CSSProperties,
};
const metricVal = (color: string): React.CSSProperties => ({ fontSize: '14px', fontWeight: 700, letterSpacing: '-.4px', color });

// ── TIPOS ─────────────────────────────────────────────────────────────────────
type Tab = 'visao' | 'invest' | 'txns' | 'orc' | 'alertas';

const TABS: { id: Tab; label: string }[] = [
  { id: 'visao',    label: 'Visão' },
  { id: 'invest',   label: 'Invest.' },
  { id: 'txns',     label: 'Transações' },
  { id: 'orc',      label: 'Orçamento' },
  { id: 'alertas',  label: 'Alertas' },
];

const INVEST_FILTERS = ['todos','tesouro','cdb','acoes','fundos'] as const;
const INVEST_FILTER_LABELS = ['Todos','Tesouro','CDB/LCI','Ações','Fundos'];
const TXN_FILTERS  = ['todas','compras','saques','transf','pgtos'] as const;
const TXN_FILTER_LABELS = ['Todas','Compras','Saques','Transf.','Pgtos'];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab,    setActiveTab]    = useState<Tab>('visao');
  const [activeBank,   setActiveBank]   = useState({ name: 'Santander', saldo: 'R$ 4.820' });
  const [investFilter, setInvestFilter] = useState('todos');
  const [txnFilter,    setTxnFilter]    = useState('todas');

  // dados mutáveis
  const [budgets,     setBudgets]    = useState(INIT_BUDGETS);
  const [txns,        setTxns]       = useState(INIT_TXNS);

  // modais
  const [budgetModalId, setBudgetModalId] = useState<string | null>(null);
  const [txnModalId,    setTxnModalId]    = useState<number | null>(null);
  const [selectedCat,   setSelectedCat]   = useState<string | null>(null);
  const [budgetInput,   setBudgetInput]   = useState('');

  // toast
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // computed
  const filteredInvest = investFilter === 'todos' ? INVESTMENTS : INVESTMENTS.filter(i => i.type === investFilter);
  const filteredTxns   = txnFilter   === 'todas'  ? txns        : txns.filter(t => t.type === txnFilter);
  const totalOrc  = budgets.reduce((a, b) => a + b.limit, 0);
  const totalUsed = budgets.reduce((a, b) => a + b.used,  0);
  const totalDisp = totalOrc - totalUsed;

  // helpers
  const getCat = (id: string) => CATEGORIES.find(c => c.id === id) ?? CATEGORIES[7];
  const fmt = (v: number) => 'R$ ' + v.toLocaleString('pt-BR');

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2500);
  };

  const openBudgetModal = (id: string) => {
    const b = budgets.find(x => x.id === id)!;
    setBudgetInput(String(b.limit));
    setBudgetModalId(id);
  };
  const saveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!val || val <= 0) { showToast('Digite um valor válido'); return; }
    setBudgets(prev => prev.map(b => b.id === budgetModalId ? { ...b, limit: Math.round(val) } : b));
    setBudgetModalId(null);
    showToast('✓ Meta atualizada com sucesso!');
  };

  const openTxnModal = (id: number) => {
    const t = txns.find(x => x.id === id)!;
    setSelectedCat(t.cat);
    setTxnModalId(id);
  };
  const saveTxnCat = () => {
    if (!selectedCat) return;
    setTxns(prev => prev.map(t => t.id === txnModalId ? { ...t, cat: selectedCat } : t));
    const cat = getCat(selectedCat);
    setTxnModalId(null);
    showToast(`✓ Categoria alterada para ${cat.name}`);
  };

  const budgetEditing = budgets.find(b => b.id === budgetModalId);
  const txnEditing    = txns.find(t => t.id === txnModalId);

  // estilos reutilizáveis de modal
  const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' };
  const modalSheet:   React.CSSProperties = { background: C.bg1, borderRadius: '16px 16px 0 0', width: '100%', maxWidth: '390px', maxHeight: '85%', overflowY: 'auto' };
  const modalHandle:  React.CSSProperties = { width: '36px', height: '4px', borderRadius: '2px', background: '#dae5de', margin: '10px auto 0' };
  const modalHdr:     React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px' };
  const modalTitle:   React.CSSProperties = { fontSize: '15px', fontWeight: 700, color: C.txt1, letterSpacing: '-.2px' };
  const modalClose:   React.CSSProperties = { width: '26px', height: '26px', borderRadius: '50%', background: C.bg2, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: C.txt2, fontFamily: 'Inter, sans-serif' };
  const modalBody:    React.CSSProperties = { padding: '0 16px 16px' };
  const modalLbl:     React.CSSProperties = { fontSize: '10px', fontWeight: 600, color: C.txt2, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: '6px', marginTop: '12px' } as React.CSSProperties;
  const modalInfo:    React.CSSProperties = { background: '#edf6f1', border: '.5px solid #b5d4c8', borderRadius: '8px', padding: '8px 10px', fontSize: '11px', color: '#3d5c50', marginTop: '10px', lineHeight: '1.5' };
  const modalBtn:     React.CSSProperties = { width: '100%', padding: '11px', background: C.green, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, fontFamily: 'Inter, sans-serif', cursor: 'pointer', marginTop: '14px' };
  const modalBtnGhost:React.CSSProperties = { width: '100%', padding: '10px', background: 'transparent', color: C.txt2, border: `.5px solid ${C.bdr}`, borderRadius: '8px', fontSize: '13px', fontWeight: 500, fontFamily: 'Inter, sans-serif', cursor: 'pointer', marginTop: '8px' };

  const hintRow: React.CSSProperties = { fontSize: '11px', color: C.txt2, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: C.bg1, position: 'relative' }}>

      {/* ── STATUS BAR ── */}
      <div style={{ height: '36px', background: '#1a2e26', display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative', padding: '0 20px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff', position: 'absolute', left: '24px' }}>9:41</span>
        <div style={{ width: '80px', height: '20px', background: '#111', borderRadius: '10px', margin: '0 auto' }} />
        <div style={{ position: 'absolute', right: '20px', display: 'flex', gap: '5px', alignItems: 'center' }}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="white"><rect x="0" y="4" width="2" height="6" rx="1"/><rect x="3" y="2.5" width="2" height="7.5" rx="1"/><rect x="6" y="1" width="2" height="9" rx="1"/><rect x="9" y="0" width="2" height="10" rx="1"/></svg>
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M6 2C8.5 2 10.7 3.1 12 4.9L10.5 6.3C9.6 5 7.9 4.1 6 4.1S2.4 5 1.5 6.3L0 4.9C1.3 3.1 3.5 2 6 2z" fill="white"/><path d="M6 5.5C7.3 5.5 8.5 6.1 9.3 7L7.8 8.4C7.3 7.9 6.7 7.6 6 7.6s-1.3.3-1.8.8L2.7 7C3.5 6.1 4.7 5.5 6 5.5z" fill="white"/><circle cx="6" cy="9.3" r="1" fill="white"/></svg>
          <svg width="22" height="10" viewBox="0 0 22 10" fill="none"><rect x=".5" y=".5" width="18" height="9" rx="2.5" stroke="white" strokeOpacity=".35"/><rect x="1.5" y="1.5" width="14" height="7" rx="1.5" fill="white"/><path d="M19.5 3.5v3a1.5 1.5 0 000-3z" fill="white" fillOpacity=".4"/></svg>
        </div>
      </div>

      {/* ── SCROLL AREA ── */}
      <div className="dash-scroll">

        {/* APP HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 10px', background: C.bg1, position: 'sticky', top: 0, zIndex: 10, borderBottom: `.5px solid ${C.bdr}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="22" height="22" viewBox="0 0 46 46" fill="none">
              <circle cx="23" cy="23" r="20" stroke="#0F6E56" strokeWidth="1.2" opacity="0.3"/>
              <circle cx="23" cy="23" r="13" stroke="#0F6E56" strokeWidth="1.2" opacity="0.5"/>
              <circle cx="23" cy="23" r="6.5" stroke="#0F6E56" strokeWidth="1.2" opacity="0.75"/>
              <circle cx="23" cy="23" r="2" fill="#0F6E56"/>
              <path d="M23 23 L35 10" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="35" cy="10" r="2" fill="#0F6E56"/>
            </svg>
            <div style={{ fontSize: '16px', fontWeight: 700, color: C.txt1, letterSpacing: '-.4px' }}>
              Radar<span style={{ color: C.green }}>Financeiro</span>
            </div>
          </div>
          <Link href="/perfil" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: C.txt2 }}>João</div>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>😎</div>
          </Link>
        </div>

        {/* BANK CHIPS */}
        <div style={{ padding: '8px 0 0' }}>
          <div className="bank-scroll">
            {BANKS.map(bank => {
              const on = activeBank.name === bank.name;
              return (
                <div key={bank.id} onClick={() => setActiveBank({ name: bank.name, saldo: bank.saldo })} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '16px', border: `.5px solid ${on ? C.green : '#dae5de'}`, fontSize: '11px', fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', background: on ? C.green : C.bg1, color: on ? '#fff' : C.txt2, flexShrink: 0, transition: 'all .15s' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: bank.color, flexShrink: 0, display: 'inline-block' }} />
                  {bank.name}
                </div>
              );
            })}
          </div>
        </div>

        {/* FILE TABS */}
        <div style={{ padding: '4px 14px 0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', width: '100%' }}>
            {TABS.map(tab => {
              const on = activeTab === tab.id;
              return (
                <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '6px 2px 7px', fontSize: '10px', fontWeight: on ? 700 : 500, color: on ? C.green : C.txt2, cursor: 'pointer', background: on ? C.bg1 : C.bg2, border: `.5px solid ${C.bdr}`, borderBottom: on ? `.5px solid ${C.bg1}` : 'none', borderRadius: '8px 8px 0 0', marginRight: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', position: 'relative', top: '1px', zIndex: on ? 2 : 1, transition: 'all .15s', textAlign: 'center', minWidth: 0 }}>
                  {tab.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* FILE PANEL */}
        <div style={{ background: C.bg1, border: `.5px solid ${C.bdr}`, borderRadius: '0 8px 8px 8px', padding: '12px 14px', margin: '0 14px', position: 'relative', zIndex: 1 }}>

          {/* ── VISÃO GERAL ── */}
          {activeTab === 'visao' && (
            <div className="tab-animate">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginBottom: '10px' }}>
                <div style={s.metricCard}><div style={s.metricLbl}>Saldo</div><div style={metricVal(C.green)}>{activeBank.saldo}</div><div style={s.metricDelta}>{activeBank.name}</div></div>
                <div style={s.metricCard}><div style={s.metricLbl}>Entradas</div><div style={metricVal(C.green)}>R$ 8.500</div><div style={s.metricDelta}>Maio</div></div>
                <div style={s.metricCard}><div style={s.metricLbl}>Saídas</div><div style={metricVal(C.red)}>R$ 3.680</div><div style={s.metricDelta}>↓12% abr</div></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={s.chartCard}>
                  <h3 style={s.chartH3}>Por categoria</h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '90px', height: '90px', position: 'relative', flexShrink: 0 }}>
                      <Pie data={PIE_CAT_DATA} options={PIE_OPTS as any} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {[['#0F6E56','Alimentação','34%'],['#185FA5','Transporte','22%'],['#BA7517','Lazer','18%'],['#d05050','Saúde','14%'],['#888','Outros','12%']].map(([color,label,pct]) => (
                        <div key={label as string} style={s.legRow}>
                          <span style={s.legLeft}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: color as string, flexShrink: 0 }}/>{label}</span>
                          <span style={s.legPct}>{pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={s.chartCard}>
                  <h3 style={s.chartH3}>Fluxo 6 meses</h3>
                  <div style={{ height: '110px', position: 'relative' }}><Line data={LINE_FLOW_DATA as any} options={LINE_OPTS as any} /></div>
                  <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
                    {[['#0F6E56','Entradas'],['#d05050','Saídas']].map(([color,label]) => (
                      <span key={label as string} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 500, color: C.txt2 }}>
                        <span style={{ width: '12px', height: '2px', background: color as string, borderRadius: '2px', display: 'inline-block' }}/>{label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── INVESTIMENTOS ── */}
          {activeTab === 'invest' && (
            <div className="tab-animate">
              <div style={{ background: 'linear-gradient(135deg,#0F6E56,#085041)', borderRadius: '10px', padding: '14px', marginBottom: '8px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-10px', top: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,.05)' }}/>
                <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: '3px' }}>Total investido</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', letterSpacing: '-.8px', marginBottom: '2px' }}>R$ 87.340</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.5)' }}>Todos os bancos · Open Finance</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,.12)', borderRadius: '6px', padding: '3px 8px', marginTop: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#9FE1CB' }}>+R$ 6.218 (7,7%)</span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.5)' }}>acumulado</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                <div style={s.chartCard}>
                  <h3 style={s.chartH3}>Por tipo</h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '90px', height: '90px', position: 'relative', flexShrink: 0 }}>
                      <Pie data={PIE_INVEST_DATA} options={PIE_OPTS as any} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {[['#0F6E56','Tesouro','31%'],['#185FA5','CDB/LCI','28%'],['#BA7517','Ações/FIIs','25%'],['#7B5EA7','Fundos','16%']].map(([color,label,pct]) => (
                        <div key={label as string} style={s.legRow}>
                          <span style={s.legLeft}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: color as string, flexShrink: 0 }}/>{label}</span>
                          <span style={s.legPct}>{pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={s.chartCard}>
                  <h3 style={s.chartH3}>Rentabilidade a.a.</h3>
                  <div style={{ height: '110px', position: 'relative' }}><Bar data={BAR_RENT_DATA as any} options={BAR_OPTS as any} /></div>
                </div>
              </div>
              <div style={{ background: C.bg2, border: `.5px solid ${C.bdr}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderBottom: `.5px solid ${C.bdr}`, background: C.bg1 }}>
                  <h3 style={{ ...s.chartH3, marginBottom: 0 }}>Seus investimentos</h3>
                  <div className="invest-filter">
                    {INVEST_FILTERS.map((f, i) => (
                      <div key={f} onClick={() => setInvestFilter(f)} style={{ padding: '2px 8px', borderRadius: '10px', border: `.5px solid ${f === investFilter ? C.green : C.bdr}`, fontSize: '10px', fontWeight: 500, cursor: 'pointer', background: f === investFilter ? C.green : C.bg1, color: f === investFilter ? '#fff' : C.txt2, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {INVEST_FILTER_LABELS[i]}
                      </div>
                    ))}
                  </div>
                </div>
                {filteredInvest.map((inv, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 12px', borderBottom: idx < filteredInvest.length - 1 ? `.5px solid ${C.bdr}` : 'none', background: C.bg1 }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: inv.typeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{inv.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: C.txt1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inv.name}</div>
                      <div style={{ fontSize: '10px', color: C.txt2, marginTop: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{inv.bank}</span>·
                        <span style={{ fontSize: '9px', fontWeight: 600, padding: '1px 5px', borderRadius: '5px', background: inv.typeBg, color: inv.typeC }}>{inv.typeName}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: C.txt1, whiteSpace: 'nowrap' }}>{inv.valor}</div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: inv.rentPos ? C.green : C.red }}>{inv.rent} a.a.</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={s.chartCard}>
                <h3 style={s.chartH3}>Evolução 12 meses</h3>
                <div style={{ height: '120px', position: 'relative' }}><Line data={LINE_EVOL_DATA as any} options={LINE_OPTS as any} /></div>
              </div>
            </div>
          )}

          {/* ── TRANSAÇÕES ── */}
          {activeTab === 'txns' && (
            <div className="tab-animate">
              <div style={hintRow}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#0F6E56" strokeWidth="1"/><path d="M6 4v2.5L7.5 8" stroke="#0F6E56" strokeWidth="1" strokeLinecap="round"/></svg>
                Toque na categoria colorida para editar
              </div>
              <div style={{ background: C.bg2, border: `.5px solid ${C.bdr}`, borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderBottom: `.5px solid ${C.bdr}`, background: C.bg1 }}>
                  <h3 style={{ ...s.chartH3, marginBottom: 0 }}>Transações</h3>
                  <div className="txn-filters">
                    {TXN_FILTERS.map((f, i) => (
                      <div key={f} onClick={() => setTxnFilter(f)} style={{ padding: '2px 8px', borderRadius: '10px', border: `.5px solid ${f === txnFilter ? C.green : C.bdr}`, fontSize: '10px', fontWeight: 500, cursor: 'pointer', background: f === txnFilter ? C.green : C.bg1, color: f === txnFilter ? '#fff' : C.txt2, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {TXN_FILTER_LABELS[i]}
                      </div>
                    ))}
                  </div>
                </div>
                {filteredTxns.map((txn, idx) => {
                  const cat = getCat(txn.cat);
                  return (
                    <div key={txn.id} style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 12px', borderBottom: idx < filteredTxns.length - 1 ? `.5px solid ${C.bdr}` : 'none', background: C.bg1 }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{txn.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: C.txt1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{txn.name}</div>
                        <div style={{ fontSize: '10px', color: C.txt2, marginTop: '1px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          <span>{txn.meta}</span>·
                          <span
                            onClick={() => openTxnModal(txn.id)}
                            style={{ fontSize: '9px', fontWeight: 600, padding: '1px 5px', borderRadius: '5px', background: cat.bg, color: cat.color, cursor: 'pointer' }}
                          >
                            {cat.name} ✎
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: txn.cr ? C.green : C.txt1, whiteSpace: 'nowrap', letterSpacing: '-.2px' }}>{txn.amount}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ORÇAMENTO ── */}
          {activeTab === 'orc' && (
            <div className="tab-animate">
              <div style={hintRow}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#0F6E56" strokeWidth="1"/><path d="M6 4v2.5L7.5 8" stroke="#0F6E56" strokeWidth="1" strokeLinecap="round"/></svg>
                Toque no lápis para editar a meta de cada categoria
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginBottom: '10px' }}>
                <div style={s.metricCard}><div style={s.metricLbl}>Orçado</div><div style={metricVal(C.txt1)}>{fmt(totalOrc)}</div><div style={s.metricDelta}>Maio 2026</div></div>
                <div style={s.metricCard}><div style={s.metricLbl}>Utilizado</div><div style={metricVal(C.red)}>{fmt(totalUsed)}</div><div style={s.metricDelta}>{Math.round(totalUsed / totalOrc * 100)}%</div></div>
                <div style={s.metricCard}><div style={s.metricLbl}>Disponível</div><div style={metricVal(totalDisp >= 0 ? C.green : C.red)}>{totalDisp >= 0 ? fmt(totalDisp) : '-' + fmt(Math.abs(totalDisp))}</div><div style={s.metricDelta}>27 dias</div></div>
              </div>
              <div style={{ background: C.bg2, border: `.5px solid ${C.bdr}`, borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderBottom: `.5px solid ${C.bdr}`, background: C.bg1 }}>
                  <h3 style={{ ...s.chartH3, marginBottom: 0 }}>Por categoria</h3>
                  <button style={{ fontSize: '11px', fontWeight: 600, color: C.green, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'Inter, sans-serif' }}>+ Categoria</button>
                </div>
                {budgets.map((b, idx) => {
                  const pct = Math.min(Math.round(b.used / b.limit * 100), 100);
                  const over = b.used > b.limit;
                  const barColor = over ? C.red : pct >= 80 ? '#BA7517' : C.green;
                  const valColor = over ? C.red : pct >= 80 ? '#BA7517' : C.green;
                  return (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderBottom: idx < budgets.length - 1 ? `.5px solid ${C.bdr}` : 'none', background: C.bg1 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{b.icon}</div>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: C.txt1 }}>{b.name}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: valColor }}>{fmt(b.used)}</span>
                            <span style={{ fontSize: '10px', color: C.txt2 }}>/</span>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: C.txt2 }}>{fmt(b.limit)}</span>
                            {over && <span style={{ fontSize: '9px', fontWeight: 700, color: C.red, marginLeft: '2px' }}>▲</span>}
                          </div>
                        </div>
                        <div style={{ height: '5px', background: C.bdr, borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '3px', transition: 'width .4s ease' }} />
                        </div>
                      </div>
                      <div onClick={() => openBudgetModal(b.id)} style={{ width: '26px', height: '26px', borderRadius: '7px', border: `.5px solid #dae5de`, background: C.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2-7 7H2V9l7-7z" stroke="#0F6E56" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── ALERTAS ── */}
          {activeTab === 'alertas' && (
            <div className="tab-animate">
              {/* resumo */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginBottom: '10px' }}>
                <div style={s.metricCard}><div style={s.metricLbl}>Ativos</div><div style={metricVal('#d05050')}>3</div><div style={s.metricDelta}>alertas</div></div>
                <div style={s.metricCard}><div style={s.metricLbl}>Avisos</div><div style={metricVal('#BA7517')}>2</div><div style={s.metricDelta}>atenção</div></div>
                <div style={s.metricCard}><div style={s.metricLbl}>Info</div><div style={metricVal(C.green)}>1</div><div style={s.metricDelta}>dica</div></div>
              </div>

              {/* lista de alertas */}
              <div style={{ background: C.bg2, border: `.5px solid ${C.bdr}`, borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '9px 12px', borderBottom: `.5px solid ${C.bdr}`, background: C.bg1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ ...s.chartH3, marginBottom: 0 }}>Alertas recentes</h3>
                  <Link href="/alertas" style={{ fontSize: '10px', fontWeight: 600, color: C.green, textDecoration: 'none' }}>Ver todos →</Link>
                </div>

                {/* alerta crítico */}
                {[
                  {
                    icon: '🚗', severity: 'danger', title: 'Transporte acima do limite',
                    desc: 'Você gastou R$ 810 de R$ 800 — limite ultrapassado este mês.',
                    tag: 'Crítico', tagBg: '#FCEBEB', tagC: '#791F1F', dot: '#d05050', time: 'Agora',
                  },
                  {
                    icon: '🛒', severity: 'warning', title: 'Alimentação próxima do limite',
                    desc: '83% do orçamento de Alimentação utilizado — R$ 253 restantes.',
                    tag: 'Atenção', tagBg: '#FAEEDA', tagC: '#633806', dot: '#BA7517', time: '2h atrás',
                  },
                  {
                    icon: '💊', severity: 'warning', title: 'Saúde quase no limite',
                    desc: '86% do orçamento de Saúde utilizado — R$ 85 restantes.',
                    tag: 'Atenção', tagBg: '#FAEEDA', tagC: '#633806', dot: '#BA7517', time: '5h atrás',
                  },
                  {
                    icon: '💸', severity: 'danger', title: 'Gasto incomum detectado',
                    desc: 'Transferência de R$ 2.000 identificada — diferente do padrão habitual.',
                    tag: 'Crítico', tagBg: '#FCEBEB', tagC: '#791F1F', dot: '#d05050', time: 'Ontem',
                  },
                  {
                    icon: '📈', severity: 'danger', title: 'PETR4 em queda',
                    desc: 'Petrobras acumula -2,1% no período — abaixo da sua meta de rentabilidade.',
                    tag: 'Crítico', tagBg: '#FCEBEB', tagC: '#791F1F', dot: '#d05050', time: 'Ontem',
                  },
                  {
                    icon: '💡', severity: 'info', title: 'Dica: portfólio diversificado',
                    desc: 'Seu portfólio tem alta concentração em Tesouro (31%). Considere diversificar.',
                    tag: 'Dica', tagBg: '#edf6f1', tagC: '#085041', dot: C.green, time: '2 dias',
                  },
                ].map((a, idx, arr) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', borderBottom: idx < arr.length - 1 ? `.5px solid ${C.bdr}` : 'none', background: C.bg1 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.dot, flexShrink: 0, marginTop: '4px' }} />
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: a.tagBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{a.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: C.txt1 }}>{a.title}</div>
                        <span style={{ fontSize: '9px', color: C.txt2, whiteSpace: 'nowrap', marginLeft: '6px' }}>{a.time}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: C.txt2, lineHeight: '1.45', marginBottom: '5px' }}>{a.desc}</div>
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '5px', background: a.tagBg, color: a.tagC }}>{a.tag}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/alertas" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', padding: '12px 14px', background: '#edf6f1', border: '.5px solid #b5d4c8', borderRadius: '10px', textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🔔</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: C.txt1 }}>Gerenciar alertas</div>
                    <div style={{ fontSize: '10px', color: C.txt2, marginTop: '1px' }}>Configurar e dispensar notificações</div>
                  </div>
                </div>
                <span style={{ fontSize: '14px', color: C.green, fontWeight: 700 }}>→</span>
              </Link>
            </div>
          )}

        </div>{/* /file-panel */}
      </div>{/* /scroll-area */}

      {/* ── RODAPÉ ── */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '390px', height: '52px', background: C.bg1, borderTop: `.5px solid ${C.bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="animate-pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.green }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#085041' }}>Open Finance ativo</span>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '5px', background: '#edf6f1', color: C.green, border: '.5px solid #b5d4c8' }}>BACEN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: C.txt2 }}>sync agora</span>
          <button style={{ fontSize: '11px', fontWeight: 600, color: C.green, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'Inter, sans-serif' }}>↻</button>
        </div>
      </div>

      {/* ── MODAL: EDITAR ORÇAMENTO ── */}
      {budgetModalId && budgetEditing && (
        <div onClick={e => { if (e.target === e.currentTarget) setBudgetModalId(null); }} style={modalOverlay}>
          <div style={modalSheet}>
            <div style={modalHandle} />
            <div style={modalHdr}>
              <div style={modalTitle}>Editar meta — {budgetEditing.name}</div>
              <button onClick={() => setBudgetModalId(null)} style={modalClose}>✕</button>
            </div>
            <div style={modalBody}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: C.bg2, borderRadius: '10px', padding: '10px 12px', marginBottom: '4px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: budgetEditing.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{budgetEditing.icon}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: C.txt1 }}>{budgetEditing.name}</div>
                  <div style={{ fontSize: '11px', color: C.txt2 }}>Gasto até agora: {fmt(budgetEditing.used)}</div>
                </div>
              </div>
              <div style={modalLbl}>Nova meta mensal (R$)</div>
              <input
                type="number"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                inputMode="decimal"
                placeholder="0,00"
                style={{ width: '100%', padding: '10px 12px', border: `.5px solid #dae5de`, borderRadius: '8px', fontSize: '15px', fontWeight: 600, fontFamily: 'Inter, sans-serif', color: C.txt1, background: C.bg2, outline: 'none' }}
              />
              <div style={modalInfo}>
                💡 A meta define o limite de gastos para esta categoria no mês. Você receberá um alerta ao atingir 80% do valor.
              </div>
              <button onClick={saveBudget} style={modalBtn}>Salvar meta</button>
              <button onClick={() => setBudgetModalId(null)} style={modalBtnGhost}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDITAR CATEGORIA DA TRANSAÇÃO ── */}
      {txnModalId !== null && txnEditing && (
        <div onClick={e => { if (e.target === e.currentTarget) setTxnModalId(null); }} style={modalOverlay}>
          <div style={modalSheet}>
            <div style={modalHandle} />
            <div style={modalHdr}>
              <div style={modalTitle}>Editar categoria</div>
              <button onClick={() => setTxnModalId(null)} style={modalClose}>✕</button>
            </div>
            <div style={modalBody}>
              <div style={{ background: C.bg2, borderRadius: '10px', padding: '10px 12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: getCat(txnEditing.cat).bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{txnEditing.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: C.txt1 }}>{txnEditing.name}</div>
                  <div style={{ fontSize: '11px', color: C.txt2 }}>{txnEditing.meta}</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: txnEditing.cr ? C.green : C.txt1, whiteSpace: 'nowrap' }}>{txnEditing.amount}</div>
              </div>
              <div style={modalLbl}>Selecione a categoria correta</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginTop: '4px' }}>
                {CATEGORIES.map(cat => {
                  const sel = cat.id === selectedCat;
                  return (
                    <div key={cat.id} onClick={() => setSelectedCat(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 10px', borderRadius: '8px', border: `.5px solid ${sel ? C.green : C.bdr}`, cursor: 'pointer', background: sel ? '#edf6f1' : C.bg2, transition: 'all .15s' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{cat.icon}</div>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: C.txt1, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                      {sel && (
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2.5 2.5L7 1.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={modalInfo}>
                💡 Ao corrigir, o Radar Financeiro aprende e passa a categorizar automaticamente transações similares.
              </div>
              <button onClick={saveTxnCat} style={modalBtn}>Salvar categoria</button>
              <button onClick={() => setTxnModalId(null)} style={modalBtnGhost}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: '62px', left: '50%', transform: 'translateX(-50%)', background: '#1a2e26', color: '#fff', fontSize: '12px', fontWeight: 500, padding: '8px 16px', borderRadius: '20px', whiteSpace: 'nowrap', zIndex: 200, pointerEvents: 'none' }}>
          {toastMsg}
        </div>
      )}

    </div>
  );
}
