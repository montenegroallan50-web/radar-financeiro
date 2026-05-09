"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/lib/utils";
import { Wallet, ArrowDownLeft, ArrowUpRight } from "lucide-react";


const CATEGORIAS = ['Alimentação','Transporte','Saúde','Lazer','Contas fixas','Educação','Combustível','Moradia','Outros'];

const INVEST_VISUAL: Record<string, { icon: string; typeName: string; typeBg: string; typeC: string; type: string }> = {
  tesouro:    { icon: '🏛', typeName: 'Tesouro', typeBg: '#edf6f1', typeC: '#085041', type: 'tesouro' },
  cdb_lci:    { icon: '💰', typeName: 'CDB/LCI', typeBg: '#E6F1FB', typeC: '#0C447C', type: 'cdb'     },
  acoes_fiis: { icon: '📊', typeName: 'Ação/FII', typeBg: '#FAEEDA', typeC: '#633806', type: 'acoes'  },
  fundos:     { icon: '🔵', typeName: 'Fundo',   typeBg: '#F3EFFE', typeC: '#5B3E8F', type: 'fundos'  },
};

const initialTxns = [
  { id:1, icon:'🛒', name:'Supermercado Extra',    meta:'Santander · 02/05', amount:-287.40, type:'compras', cat:'Alimentação', catBg:'#edf6f1', catC:'#085041' },
  { id:2, icon:'💸', name:'Transferência recebida',meta:'Nubank · 01/05',    amount:2000,   type:'transf',  cat:'Entrada',     catBg:'#edf6f1', catC:'#085041' },
  { id:3, icon:'🚗', name:'Uber',                  meta:'Inter · 30/04',     amount:-28.90, type:'compras', cat:'Transporte',  catBg:'#E6F1FB', catC:'#0C447C' },
  { id:4, icon:'💊', name:'Farmácia',              meta:'Bradesco · 29/04',  amount:-95.00, type:'compras', cat:'Saúde',       catBg:'#FCEBEB', catC:'#791F1F' },
  { id:5, icon:'📱', name:'Tim — Fatura',          meta:'Santander · 28/04', amount:-89.90, type:'pgtos',   cat:'Contas',      catBg:'#FAEEDA', catC:'#633806' },
  { id:6, icon:'🍕', name:'iFood',                 meta:'Nubank · 28/04',    amount:-56.00, type:'compras', cat:'Alimentação', catBg:'#edf6f1', catC:'#085041' },
  { id:7, icon:'🎬', name:'Netflix',               meta:'Itaú · 27/04',      amount:-44.90, type:'pgtos',   cat:'Lazer',       catBg:'#FAEEDA', catC:'#633806' },
];

const budget = [
  { name:'Alimentação',  gasto:0, limite:700,  color:'#0F6E56' },
  { name:'Transporte',   gasto:0, limite:400,  color:'#185FA5' },
  { name:'Saúde',        gasto:0, limite:500,  color:'#d05050' },
  { name:'Lazer',        gasto:0, limite:300,  color:'#BA7517' },
  { name:'Contas fixas', gasto:0, limite:500,  color:'#6b8c7e' },
  { name:'Educação',     gasto:0, limite:250,  color:'#5B3E8F' },
  { name:'Combustível',  gasto:0, limite:300,  color:'#7A4500' },
  { name:'Moradia',      gasto:0, limite:1500, color:'#0C447C' },
  { name:'Outros',       gasto:0, limite:300,  color:'#555'    },
];

const catColors: Record<string,{bg:string;c:string}> = {
  'Alimentação':  { bg:'#edf6f1', c:'#085041' },
  'Transporte':   { bg:'#E6F1FB', c:'#0C447C' },
  'Saúde':        { bg:'#FCEBEB', c:'#791F1F' },
  'Lazer':        { bg:'#FAEEDA', c:'#633806' },
  'Contas fixas': { bg:'#FAEEDA', c:'#633806' },
  'Educação':     { bg:'#F3EFFE', c:'#5B3E8F' },
  'Combustível':  { bg:'#FFF4E5', c:'#7A4500' },
  'Moradia':      { bg:'#E6F1FB', c:'#0C447C' },
  'Outros':       { bg:'#f0f0f0', c:'#555'    },
};

function getIcon(cat: string) {
  const map: Record<string,string> = {
    'Alimentação':'🛒',
    'Transporte':'🚗',
    'Saúde':'💊',
    'Lazer':'🎬',
    'Contas fixas':'📱',
    'Educação':'📚',
    'Combustível':'⛽',
    'Moradia':'🏠',
    'Outros':'💳'
  };
  return map[cat] ?? '💳';
}

function PluggyWidget({ show, connectToken, onSuccess, onClose, onError }: { show: boolean; connectToken: string | null; onSuccess: (id: string) => void; onClose: () => void; onError: () => void }) {
  useEffect(() => {
    if (!show || !connectToken) return;
    let instance: any = null;
    import('pluggy-connect-sdk').then((mod: any) => {
      const SDK = mod.PluggyConnect ?? mod.default ?? Object.values(mod)[0];
      instance = new SDK({
        connectToken,
        includeSandbox: true,
        onSuccess: (data: any) => onSuccess(data?.item?.id ?? data?.itemId),
        onError: (err: any) => { console.error(err); onError(); },
        onClose,
      });
      instance.init();
    });
    return () => { try { instance?.destroy?.(); } catch(e) {} };
  }, [show, connectToken]);
  return null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useApp();
  const [avatarEmoji, setAvatarEmoji] = useState<string|null>(null);
  const [connectToken, setConnectToken] = useState<string|null>(null);
  const [showWidget, setShowWidget] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle'|'success'|'error'>('idle');
  const [dashData, setDashData] = useState<any>(null);
  const [realAccounts, setRealAccounts] = useState<any[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string|null>(null);
  const [activeTab, setActiveTab] = useState('visao');
  const [investimentos, setInvestimentos] = useState<any[]>([]);
  const [investFilter, setInvestFilter] = useState('todos');
  const [txnFilter, setTxnFilter] = useState('todas');
  const [txns, setTxns] = useState(initialTxns);
  const [editingTxn, setEditingTxn] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editCat, setEditCat] = useState('');
  const [budgetData, setBudgetData] = useState(budget);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [editLimite, setEditLimite] = useState('');
  const [barsAnimated, setBarsAnimated] = useState(false);

  useEffect(() => {
    if (activeTab === 'orc') {
      setBarsAnimated(false);
      const timer = setTimeout(() => setBarsAnimated(true), 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  useEffect(() => {
    const saved = localStorage.getItem('avatarEmoji');
    if (saved) setAvatarEmoji(saved);
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        if (!data.error) setDashData(data);
      } catch(e) { console.error(e); }
    }
    async function loadAccounts() {
      try {
        const res = await fetch('/api/accounts');
        const data = await res.json();
        if (data.accounts?.length > 0) setRealAccounts(data.accounts);
      } catch(e) { console.error(e); }
    }
    async function loadBudget() {
      try {
        const now = new Date();
        const res = await fetch(`/api/budget?month=${now.getMonth()}&year=${now.getFullYear()}`);
        if (res.ok) {
          const data = await res.json();
          setBudgetData(prev => prev.map(b => ({
            ...b,
            gasto: data.spentByCategory[b.name] ?? 0,
          })));
        }
      } catch(e) { console.error('Erro ao carregar orçamento:', e); }
    }
    loadDashboard();
    loadAccounts();
    loadBudget();
    async function loadTransactions() {
      try {
        const txRes = await fetch('/api/transactions');
        const txData = await txRes.json();
        if (txData.transactions?.length > 0) {
          const mapped = txData.transactions.map((t: any, i: number) => {
            const colors = catColors[t.category] || catColors['Outros'];
            return {
              id: i+1,
              pluggyId: t.pluggy_id,
              accountId: t.account_id,
              icon: getIcon(t.category),
              name: t.description,
              meta: new Date(t.date).toLocaleDateString('pt-BR'),
              amount: t.type==='DEBIT' ? -Math.abs(t.amount) : Math.abs(t.amount),
              type: t.type==='DEBIT' ? 'compras' : 'transf',
              cat: t.category||'Outros',
              catBg: colors.bg,
              catC: colors.c,
            };
          });
          setTxns(mapped);
          setSyncStatus('success');
        }
      } catch(e) {
        console.error('Erro ao carregar transações:', e);
      }
    }
    loadTransactions();
    async function loadInvestimentos() {
      try {
        const res = await fetch('/api/investments');
        const data = await res.json();
        if (!data.error && data.investments?.length > 0) {
          setInvestimentos(data.investments.map((inv: any) => {
            const v = INVEST_VISUAL[inv.type] ?? INVEST_VISUAL.fundos;
            return {
              ...v,
              name: inv.name,
              bank: inv.issuerName ?? inv.indexer ?? '—',
              valor: inv.currentAmount,
              rent: (inv.returnPercent >= 0 ? '+' : '') + Number(inv.returnPercent).toFixed(1).replace('.', ',') + '%',
              rentPos: inv.returnPercent >= 0,
            };
          }));
        }
      } catch(e) { console.error('Erro ao carregar investimentos:', e); }
    }
    loadInvestimentos();
  }, [user.id]);

  useEffect(() => {
    async function loadBudgetGoals() {
      try {
        const res = await fetch("/api/budget-goals");
        const data = await res.json();
        if (data.goals?.length > 0) {
          setBudgetData(prev => prev.map(b => {
            const goal = data.goals.find((g: any) => g.category === b.name);
            return goal ? { ...b, limite: goal.target } : b;
          }));
        }
      } catch (e) {
        console.error("Erro ao carregar metas:", e);
      }
    }
    loadBudgetGoals();
  }, [user.id]);

  const handleSuccess = useCallback(async (itemId: string) => {
    setShowWidget(false);
    setSyncing(true);
    try {
      const res = await fetch('/api/pluggy/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error('Sync falhou');
      const [txRes, acRes] = await Promise.all([fetch('/api/transactions'), fetch('/api/accounts')]);
      const txData = await txRes.json();
      const acData = await acRes.json();
      if (acData.accounts?.length > 0) setRealAccounts(acData.accounts);
      if (txData.transactions?.length > 0) {
        const mapped = txData.transactions.map((t: any, i: number) => {
          const colors = catColors[t.category] || catColors['Outros'];
          return { id: i+1, pluggyId: t.pluggy_id, accountId: t.account_id, icon: getIcon(t.category), name: t.description, meta: new Date(t.date).toLocaleDateString('pt-BR'), amount: t.type==='DEBIT' ? -Math.abs(t.amount) : Math.abs(t.amount), type: t.type==='DEBIT' ? 'compras' : 'transf', cat: t.category||'Outros', catBg: colors.bg, catC: colors.c };
        });
        setTxns(mapped);
      }
      setSyncStatus('success');
    } catch(e) {
      console.error(e);
      setSyncStatus('error');
    } finally {
      setSyncing(false);
    }
  }, [user.id]);

  async function handleSync() {
    try {
      setSyncing(true);
      setSyncStatus('idle');
      const res = await fetch('/api/pluggy/token', { method: 'POST' });
      const data = await res.json();
      if (!data.connectToken) throw new Error('Token inválido');
      setConnectToken(data.connectToken);
      setShowWidget(true);
    } catch(e) {
      console.error(e);
      setSyncStatus('error');
    } finally {
      setSyncing(false);
    }
  }

  function openEdit(txn: any) { setEditingTxn(txn); setEditName(txn.name); setEditCat(txn.cat); }
  async function saveEdit() {
    const colors = catColors[editCat] || catColors['Outros'];
    setTxns(prev => prev.map(t => t.id === editingTxn.id ? { ...t, name: editName, cat: editCat, catBg: colors.bg, catC: colors.c } : t));
    setEditingTxn(null);
    try {
      await fetch('/api/transactions/' + editingTxn.pluggyId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: editCat, description: editName }),
      });
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (!data.error) setDashData(data);
    } catch(e) { console.error(e); }
  }

  const connectedBanks = Array.from(
    new Map(realAccounts.map(a => [a.itemId, {
      itemId: a.itemId,
      name: a.name,
      primaryColor: a.primaryColor as string | null,
      imageUrl: a.imageUrl as string | null,
    }])).values()
  );
  const bankAccountIds = selectedItemId
    ? realAccounts.filter(a => a.itemId === selectedItemId).map(a => a.id)
    : null;
  const filteredAccounts = selectedItemId
    ? realAccounts.filter(a => a.itemId === selectedItemId)
    : realAccounts;
  const totalBalance = filteredAccounts.reduce((a, b) => a + b.balance, 0);
  const bankFilteredTxns = bankAccountIds
    ? txns.filter(t => bankAccountIds.includes(t.accountId))
    : txns;
  const entradas = bankFilteredTxns.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const saidas   = bankFilteredTxns.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);

  const filteredInvest = investFilter === 'todos' ? investimentos : investimentos.filter(i => i.type === investFilter);
  const txnCategories = ['todas', ...Array.from(new Set(txns.map(t => t.cat)))];
  const filteredTxns = txnFilter === 'todas' ? bankFilteredTxns : bankFilteredTxns.filter(t => t.cat === txnFilter);
  const totalInvest = investimentos.reduce((a, i) => a + i.valor, 0);
  const totalOrcado = budgetData.reduce((a, b) => a + b.limite, 0);
  const totalGasto  = budgetData.reduce((a, b) => a + b.gasto, 0);

  return (
    <div className="flex flex-col h-full">

      <PluggyWidget
        show={showWidget}
        connectToken={connectToken}
        onSuccess={handleSuccess}
        onClose={() => setShowWidget(false)}
        onError={() => { setShowWidget(false); setSyncStatus('error'); }}
      />

      <div className="relative flex items-center justify-between px-4 py-3 sticky top-0 z-10 overflow-hidden" style={{ background:'linear-gradient(160deg,#0F6E56 0%,#085041 100%)' }}>
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full" style={{ background:'rgba(255,255,255,0.05)' }}/>
        <div className="absolute right-8 top-4 w-12 h-12 rounded-full" style={{ background:'rgba(255,255,255,0.05)' }}/>
        <div className="flex items-center gap-2 relative z-10">
          <svg width="22" height="22" viewBox="0 0 46 46" fill="none">
            <circle cx="23" cy="23" r="20" stroke="white" strokeWidth="1.2" opacity="0.3"/>
            <circle cx="23" cy="23" r="13" stroke="white" strokeWidth="1.2" opacity="0.5"/>
            <circle cx="23" cy="23" r="6.5" stroke="white" strokeWidth="1.2" opacity="0.75"/>
            <circle cx="23" cy="23" r="2" fill="white"/>
            <path d="M23 23 L35 10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="35" cy="10" r="2" fill="white"/>
          </svg>
          <span className="text-[15px] font-bold tracking-tight text-white">Radar<span style={{ color:'rgba(255,255,255,0.7)' }}>Financeiro</span></span>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <button onClick={() => router.push('/alertas')} className="w-8 h-8 flex items-center justify-center rounded-full relative" style={{ background:'rgba(255,255,255,0.15)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ animation:'bell-ring 3s ease-in-out infinite', transformOrigin:'top center' }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <div style={{ position:'absolute', top:-2, right:-2, width:8, height:8, borderRadius:'50%', background:'#34d399', border:'1.5px solid #085041', animation:'ping 2s ease-in-out infinite' }}/>
            <style>{`
              @keyframes bell-ring{0%,100%{transform:rotate(0)}20%{transform:rotate(-15deg)}40%{transform:rotate(15deg)}60%{transform:rotate(-10deg)}80%{transform:rotate(10deg)}}
              @keyframes ping{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:0.6}}
            `}</style>
          </button>
          <button onClick={() => router.push('/perfil')} className="flex items-center gap-2">
            <span className="text-[15px] font-bold" style={{ color:'#FFFFFF' }}>{user.name.split(' ')[0]}</span>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background:'rgba(255,255,255,0.2)', border:'1.5px solid rgba(255,255,255,0.35)' }}>
              {avatarEmoji ?? user.name.split(' ').map((n:string) => n[0]).join('').slice(0,2)}
            </div>
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 py-2 bg-white border-b border-gray-100 scrollbar-hide">
        {connectedBanks.length > 1 && (
          <button
            onClick={() => setSelectedItemId(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap border transition-all"
            style={selectedItemId === null ? { background:'#0F6E56', borderColor:'#0F6E56', color:'#fff' } : { background:'#fff', borderColor:'#e5e7eb', color:'#6b7280' }}>
            Todos
          </button>
        )}
        {connectedBanks.map(bank => {
          const active = selectedItemId === bank.itemId;
          return (
            <button
              key={bank.itemId}
              onClick={() => setSelectedItemId(bank.itemId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap border transition-all"
              style={active ? { background:'#0F6E56', borderColor:'#0F6E56', color:'#fff' } : { background:'#fff', borderColor:'#e5e7eb', color:'#6b7280' }}>
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: active ? 'rgba(255,255,255,0.7)' : (bank.primaryColor ?? '#9ca3af') }}
              />
              {bank.name}
            </button>
          );
        })}
        {connectedBanks.length === 0 && (
          <div className="flex items-center gap-2 py-1">
            <span className="text-[13px] text-gray-400">Nenhum banco conectado</span>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="text-[13px] font-semibold px-2.5 py-0.5 rounded-full border transition-all disabled:opacity-50"
              style={{ color:'#0F6E56', borderColor:'#0F6E56' }}>
              {syncing ? '⏳' : '+ Conectar banco'}
            </button>
          </div>
        )}
      </div>

      <div className="flex bg-white border-b border-gray-200 shadow-sm">
        {[{id:'visao',label:'📊 Visão'},{id:'invest',label:'📈 Invest.'},{id:'txns',label:'💳 Transações'},{id:'orc',label:'🎯 Orçamento'}].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex-1 py-2.5 text-[12px] font-semibold whitespace-nowrap transition-all border-b-2"
            style={activeTab === tab.id ? { borderColor:'#0F6E56', color:'#0F6E56', background:'#f0faf6' } : { borderColor:'transparent', color:'#9ca3af', background:'#fff' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-[60px] bg-[#E2E4EC]">

        {activeTab === 'visao' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {/* Saldo */}
              <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-md flex flex-col gap-1.5">
                <div style={{ background:'#0066FF18', borderRadius:10, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Wallet size={22} color="#0066FF" strokeWidth={2} />
                </div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Saldo</p>
                <p className="text-[15px] font-bold leading-tight" style={{ color:'#0F6E56' }}>{realAccounts.length > 0 ? formatCurrency(totalBalance) : '—'}</p>
                <p className="text-[11px] font-medium text-gray-400">{selectedItemId ? (connectedBanks.find(b => b.itemId === selectedItemId)?.name ?? '') : (realAccounts.length > 0 ? 'Todos' : '—')}</p>
              </div>
              {/* Entradas */}
              <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-md flex flex-col gap-1.5">
                <div style={{ background:'#00B88A18', borderRadius:10, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ArrowDownLeft size={28} color="#00B88A" strokeWidth={2} />
                </div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Entradas</p>
                <p className="text-[15px] font-bold leading-tight" style={{ color:'#00B88A' }}>{formatCurrency(entradas)}</p>
                <p className="text-[11px] font-medium text-gray-400">Maio</p>
              </div>
              {/* Saídas */}
              <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-md flex flex-col gap-1.5">
                <div style={{ background:'#FF4D6718', borderRadius:10, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ArrowUpRight size={28} color="#FF4D67" strokeWidth={2} />
                </div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Saídas</p>
                <p className="text-[15px] font-bold leading-tight" style={{ color:'#FF4D67' }}>{formatCurrency(saidas)}</p>
                <p className="text-[11px] font-medium text-gray-400">Maio</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-md">
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-3">Por categoria</p>
              <div className="space-y-2.5">
                {(dashData?.categorias?.length > 0 ? dashData.categorias.map((c: any, i: number) => ({
                name: c.name, pct: c.pct, color: ['#0F6E56','#185FA5','#BA7517','#d05050','#888'][i] || '#888'
              })) : [{name:'Alimentação',pct:34,color:'#0F6E56'},{name:'Transporte',pct:22,color:'#185FA5'},{name:'Lazer',pct:18,color:'#BA7517'},{name:'Saúde',pct:14,color:'#d05050'},{name:'Outros',pct:12,color:'#888'}]).map(c => (
                  <div key={c.name}>
                    <div className="flex justify-between mb-1"><span className="text-[14px] font-semibold text-gray-700">{c.name}</span><span className="text-[14px] font-bold" style={{ color: c.color }}>{c.pct}%</span></div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width:`${c.pct}%`, background: c.color }}/></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico de Pizza */}
            {dashData?.categorias?.length > 0 && (
              (() => {
                const { PieChart, Pie, Cell, Tooltip } = require('recharts');
                const colors = ['#0F6E56','#185FA5','#BA7517','#d05050','#7C3AED'];
                const pieData = (dashData.categorias.slice(0,5) as any[]).map((c: any, i: number) => ({
                  name: c.name, value: c.pct, color: colors[i]
                }));

                const RADIAN = Math.PI / 180;
                const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return value > 8 ? (
                    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
                      {`${value}%`}
                    </text>
                  ) : null;
                };

                return (
                  <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-md">
                    <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-3">💸 Para onde vai seu dinheiro?</p>
                    <div className="flex items-center gap-3">
                      <PieChart width={160} height={160}>
                        <Pie
                          data={pieData}
                          cx={75} cy={75}
                          outerRadius={75}
                          innerRadius={28}
                          dataKey="value"
                          labelLine={false}
                          label={renderLabel}
                          strokeWidth={2}
                          stroke="#fff"
                        >
                          {pieData.map((_: any, i: number) => (
                            <Cell key={i} fill={colors[i]}/>
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: any, n: any) => [`${v}%`, n]}
                          contentStyle={{ borderRadius: 12, fontSize: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
                        />
                      </PieChart>
                      <div className="flex-1 space-y-2">
                        {pieData.map((d: any, i: number) => (
                          <div key={d.name} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: colors[i] }}/>
                            <span className="text-[12px] text-gray-600 flex-1 truncate">{d.name}</span>
                            <span className="text-[12px] font-bold" style={{ color: colors[i] }}>{d.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {activeTab === 'invest' && (
          <div className="space-y-3">
            <div className="rounded-2xl p-4 text-white shadow-xl overflow-hidden relative"
              style={{ background:'linear-gradient(135deg, #0a3d2e 0%, #0F6E56 50%, #1a9b7a 100%)' }}>
              {/* Círculos decorativos */}
              <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full" style={{ background:'rgba(255,255,255,0.06)' }}/>
              <div className="absolute -right-2 top-8 w-20 h-20 rounded-full" style={{ background:'rgba(255,255,255,0.06)' }}/>
              <div className="absolute left-1/2 -bottom-10 w-40 h-40 rounded-full" style={{ background:'rgba(255,255,255,0.04)' }}/>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"/>
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">Total Investido</p>
                </div>
                <p className="text-[28px] font-extrabold tracking-tight leading-tight">{formatCurrency(totalInvest)}</p>
                <p className="text-[11px] opacity-50 mt-0.5">Todos os bancos · Open Finance</p>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-xl px-3 py-1.5 border border-white/10">
                    <span className="text-[13px] font-bold text-emerald-300">+R$ 6.218</span>
                    <span className="text-[11px] opacity-60">acumulado</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-xl px-3 py-1.5 border border-white/10">
                    <span className="text-[13px] font-bold text-emerald-300">7,7%</span>
                    <span className="text-[11px] opacity-60">rentab.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {(() => {
                const tiposDisponiveis = ['todos', ...Array.from(new Set(investimentos.map(i => i.type)))];
                const labelMap: Record<string,string> = {
                  'todos':'Todos', 'tesouro':'Tesouro', 'cdb':'CDB/LCI', 'acoes':'Ações/FIIs', 'fundos':'Fundos'
                };
                return tiposDisponiveis.map(f => (
                  <button key={f} onClick={() => setInvestFilter(f)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all shadow-sm"
                    style={investFilter === f
                      ? { background:'#0F6E56', color:'#fff', border:'1.5px solid #0F6E56' }
                      : { background:'#fff', color:'#6b7280', border:'1.5px solid #e5e7eb' }}>
                    {labelMap[f] ?? f}
                  </button>
                ));
              })()}
            </div>
            {/* Gráfico de rosca — distribuição por tipo */}
            {investimentos.length > 0 && (() => {
              const { PieChart, Pie, Cell, Tooltip } = require('recharts');
              const colors: Record<string,string> = {
                'tesouro':'#0F6E56', 'cdb_lci':'#185FA5', 'acoes_fiis':'#BA7517', 'fundos':'#7C3AED',
                'cdb':'#185FA5', 'acoes':'#BA7517', 'lci':'#0C447C', 'lca':'#0C447C',
                'fiis':'#d05050', 'previdencia':'#6b8c7e'
              };
              const labels: Record<string,string> = {
                'tesouro':'Tesouro Direto', 'cdb_lci':'CDB/LCI', 'acoes_fiis':'Ações/FIIs', 'fundos':'Fundos',
                'cdb':'CDB/LCI', 'acoes':'Ações/FIIs', 'lci':'LCI/LCA', 'lca':'LCI/LCA',
                'fiis':'FIIs', 'previdencia':'Previdência'
              };
              const grouped: Record<string,number> = {};
              investimentos.forEach(i => {
                grouped[i.type] = (grouped[i.type] || 0) + i.valor;
              });
              const pieData = Object.entries(grouped).map(([type, value]) => ({
                name: labels[type] ?? type, value: Math.round(value), color: colors[type] ?? '#888'
              }));

              return (
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-md">
                  <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-3">📊 Distribuição da carteira</p>
                  <div className="flex items-center gap-3">
                    <PieChart width={140} height={140}>
                      <Pie data={pieData} cx={65} cy={65} outerRadius={65} innerRadius={35}
                        dataKey="value" strokeWidth={2} stroke="#fff">
                        {pieData.map((_: any, i: number) => (
                          <Cell key={i} fill={pieData[i].color}/>
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: any, n: any) => [formatCurrency(v), n]}
                        contentStyle={{ borderRadius:12, fontSize:12, border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.12)' }}
                      />
                    </PieChart>
                    <div className="flex-1 space-y-2.5">
                      {pieData.map((d: any) => (
                        <div key={d.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }}/>
                          <span className="text-[12px] text-gray-600 flex-1">{d.name}</span>
                          <span className="text-[12px] font-bold text-gray-700">{formatCurrency(d.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
              {filteredInvest.length === 0 ? (
                <p className="text-center text-[13px] text-gray-400 py-8 px-4">Faça o sync para carregar seus investimentos</p>
              ) : filteredInvest.map((inv, i) => (
                <div key={i} className={"flex items-center gap-3 p-3 " + (i < filteredInvest.length-1 ? 'border-b border-gray-100' : '')}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 shadow-sm" style={{ background: inv.typeBg }}>{inv.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 truncate">{inv.name}</p>
                    <div className="flex items-center gap-1 mt-0.5"><span className="text-[11px] text-gray-400">{inv.bank}</span><span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: inv.typeBg, color: inv.typeC }}>{inv.typeName}</span></div>
                  </div>
                  <div className="text-right"><p className="text-[13px] font-bold text-gray-800">{formatCurrency(inv.valor)}</p><p className={"text-[12px] font-bold " + (inv.rentPos ? 'text-[#0F6E56]' : 'text-red-500')}>{inv.rent} a.a.</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'txns' && (
          <div className="space-y-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {txnCategories.map(f => (
                <button key={f} onClick={() => setTxnFilter(f)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all shadow-sm"
                  style={txnFilter === f
                    ? { background:'#0F6E56', color:'#fff', border:'1.5px solid #0F6E56' }
                    : { background:'#fff', color:'#6b7280', border:'1.5px solid #e5e7eb' }}>
                  {f === 'todas' ? '🧾 Todas' : f}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
              {filteredTxns.map((t, i) => (
                <div key={t.id} className={"flex items-center gap-3 p-3 cursor-pointer " + (i < filteredTxns.length-1 ? 'border-b border-gray-100' : '')} onClick={() => openEdit(t)}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 shadow-sm" style={{ background: t.catBg }}>{t.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 truncate">{t.name}</p>
                    <div className="flex items-center gap-1 mt-0.5"><span className="text-[11px] text-gray-400">{t.meta}</span><span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: t.catBg, color: t.catC }}>{t.cat} ✏️</span></div>
                  </div>
                  <span className={"text-[14px] font-bold " + (t.amount > 0 ? 'text-[#0F6E56]' : 'text-gray-800')}>{t.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(t.amount))}</span>
                </div>
              ))}
            </div>
            {/* Gráfico de barras por categoria */}
            {(() => {
              const { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } = require('recharts');
              const colors: Record<string,string> = {
                'Alimentação':'#0F6E56','Transporte':'#185FA5','Saúde':'#d05050',
                'Lazer':'#BA7517','Contas fixas':'#6b8c7e','Educação':'#7C3AED',
                'Combustível':'#7A4500','Moradia':'#0C447C','Outros':'#555'
              };
              const catTotals: Record<string,number> = {};
              bankFilteredTxns.filter(t => t.amount < 0).forEach(t => {
                catTotals[t.cat] = (catTotals[t.cat] || 0) + Math.abs(t.amount);
              });
              const barData = Object.entries(catTotals)
                .map(([name, value]) => ({ name, value: Math.round(value) }))
                .sort((a, b) => b.value - a.value);

              if (barData.length === 0) return null;

              return (
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-md">
                  <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-3">💳 Gastos por categoria</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false}/>
                      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                        tickFormatter={(v) => `R$${v}`}/>
                      <Tooltip
                        formatter={(v: any) => [`R$ ${Number(v).toFixed(2)}`, 'Gasto']}
                        contentStyle={{ borderRadius: 12, fontSize: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {barData.map((entry, i) => (
                          <Cell key={i} fill={colors[entry.name] || '#888'}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
            <p className="text-center text-[12px] text-gray-400">Toque em uma transação para editar</p>
          </div>
        )}

        {activeTab === 'orc' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[{label:'Orçado',value:formatCurrency(totalOrcado),sub:'Maio 2026',color:'#374151'},{label:'Utilizado',value:formatCurrency(totalGasto),sub:Math.round(totalGasto/totalOrcado*100)+'%',color:'#d05050'},{label:'Disponível',value:formatCurrency(totalOrcado-totalGasto),sub:'27 dias',color:'#0F6E56'}].map(m => (
                <div key={m.label} className="bg-white rounded-2xl p-3 border border-gray-200 shadow-md">
                  <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{m.label}</p>
                  <p className="text-[15px] font-bold leading-tight truncate" style={{ color: m.color }}>{m.value}</p>
                  <p className="text-[12px] font-medium text-gray-400 mt-1">{m.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-md">
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-4">Por categoria</p>
              <div className="space-y-4">
                {budgetData.map(b => {
                  const pct = b.limite > 0 ? Math.min((b.gasto / b.limite) * 100, 100) : 0;
                  const over = b.gasto > b.limite;
                  const icons: Record<string,string> = {
                    'Alimentação':'🛒','Transporte':'🚗','Saúde':'💊','Lazer':'🎬',
                    'Contas fixas':'📱','Educação':'📚','Combustível':'⛽','Moradia':'🏠','Outros':'💳'
                  };
                  return (
                    <div key={b.name}>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[14px]">{icons[b.name] ?? '💳'}</span>
                          <span className="text-[13px] font-semibold text-gray-700">{b.name}</span>
                          {over && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Estourou</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-bold" style={{ color: over ? '#d05050' : b.color }}>
                            {formatCurrency(b.gasto)}
                          </span>
                          <span className="text-[11px] text-gray-400">/ {formatCurrency(b.limite)}</span>
                          <button onClick={() => { setEditingBudget(b); setEditLimite(String(b.limite)); }} className="text-gray-400">✏️</button>
                        </div>
                      </div>
                      {/* Barra premium */}
                      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                          style={{
                            width: barsAnimated ? `${pct}%` : '0%',
                            background: over
                              ? 'linear-gradient(90deg, #d05050, #ff6b6b)'
                              : `linear-gradient(90deg, ${b.color}cc, ${b.color})`,
                            boxShadow: `0 0 8px ${b.color}66`,
                          }}
                        />
                        {pct > 15 && (
                          <span className="absolute left-2 top-0 h-full flex items-center text-[9px] font-bold text-white">
                            {Math.round(pct)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 max-w-[430px] mx-auto flex items-center justify-between px-4 py-2.5 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center gap-2">
          <div className={"w-1.5 h-1.5 rounded-full " + (syncStatus==='error' ? 'bg-red-500' : 'bg-[#0F6E56] animate-pulse')}/>
          <span className="text-[13px] font-semibold text-[#085041]">{syncStatus==='success' ? 'Sincronizado!' : syncStatus==='error' ? 'Erro ao sincronizar' : 'Open Finance ativo'}</span>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#edf6f1] text-[#0F6E56] border border-[#b5d4c8]">BACEN</span>
        </div>
        <button onClick={handleSync} disabled={syncing} className="text-[13px] font-semibold text-[#0F6E56] disabled:opacity-50">
          {syncing ? '⏳ aguarde...' : '↻ sync'}
        </button>
      </div>

      {editingBudget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => e.target===e.currentTarget && setEditingBudget(null)}>
          <div className="bg-white w-full max-w-[430px] rounded-t-3xl p-6 shadow-2xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5"/>
            <h3 className="text-base font-bold text-gray-800 mb-1">Editar limite — {editingBudget.name}</h3>
            <p className="text-xs text-gray-400 mb-5">Gasto atual: <strong>{formatCurrency(editingBudget.gasto)}</strong></p>
            <div className="mb-4">
              <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Novo limite (R$)</label>
              <input type="number" value={editLimite} onChange={e => setEditLimite(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-lg font-bold text-gray-800 focus:outline-none focus:border-[#0F6E56]" placeholder="0,00"/>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingBudget(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500">Cancelar</button>
              <button onClick={async () => {
                const novoLimite = Number(editLimite);
                setBudgetData(prev => prev.map(b =>
                  b.name === editingBudget.name ? {...b, limite: novoLimite} : b
                ));
                await fetch("/api/budget-goals", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ category: editingBudget.name, target: novoLimite }),
                });
                setEditingBudget(null);
              }} className="flex-1 py-3 rounded-2xl text-sm font-bold text-white shadow-md" style={{ background:'#0F6E56' }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {editingTxn && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => e.target===e.currentTarget && setEditingTxn(null)}>
          <div className="bg-white w-full max-w-[430px] rounded-t-3xl p-6 shadow-2xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5"/>
            <h3 className="text-base font-bold text-gray-800 mb-1">Editar transação</h3>
            <p className="text-xs text-gray-400 mb-5">{editingTxn.meta}</p>
            <div className="mb-4">
              <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Descrição</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#0F6E56]"/>
            </div>
            <div className="mb-6">
              <label className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Categoria</label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIAS.map(cat => {
                  const colors = catColors[cat] || catColors['Outros'];
                  return <button key={cat} onClick={() => setEditCat(cat)} className="py-1.5 px-1 rounded-xl text-[12px] font-semibold border-2 transition-all text-center" style={editCat===cat ? {background:colors.bg,borderColor:colors.c,color:colors.c} : {background:'#f9fafb',borderColor:'#e5e7eb',color:'#9ca3af'}}>{cat}</button>;
                })}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingTxn(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500">Cancelar</button>
              <button onClick={saveEdit} className="flex-1 py-3 rounded-2xl text-sm font-bold text-white shadow-md" style={{ background:'#0F6E56' }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
