"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/lib/utils";

const banks = [
  { id: 'santander', name: 'Santander', color: '#CC0000', saldo: 4820 },
  { id: 'nubank',    name: 'Nubank',    color: '#820AD1', saldo: 2310 },
  { id: 'inter',     name: 'Inter',     color: '#FF7A00', saldo: 1450 },
  { id: 'bradesco',  name: 'Bradesco',  color: '#CC092F', saldo: 6100 },
  { id: 'itau',      name: 'Itaú',      color: '#003399', saldo: 3780 },
];

const CATEGORIAS = ['Alimentação','Transporte','Saúde','Lazer','Contas','Entrada','Saque','Outros'];

const investimentos = [
  { icon:'🏛', name:'Tesouro Selic 2029',    bank:'Santander', type:'tesouro', typeName:'Tesouro', typeBg:'#edf6f1', typeC:'#085041', valor:27100, rent:'+8,7%',  rentPos:true  },
  { icon:'💰', name:'CDB Bradesco 115% CDI', bank:'Bradesco',  type:'cdb',     typeName:'CDB',     typeBg:'#E6F1FB', typeC:'#0C447C', valor:18500, rent:'+11,2%', rentPos:true  },
  { icon:'🏠', name:'HGLG11 — Logística',    bank:'Nubank',    type:'acoes',   typeName:'FII',     typeBg:'#FAEEDA', typeC:'#633806', valor:12400, rent:'+6,3%',  rentPos:true  },
  { icon:'📊', name:'LCI Itaú 95% CDI',      bank:'Itaú',      type:'cdb',     typeName:'LCI',     typeBg:'#E6F1FB', typeC:'#0C447C', valor:10800, rent:'+9,8%',  rentPos:true  },
  { icon:'📈', name:'PETR4 — Petrobras',     bank:'Inter',     type:'acoes',   typeName:'Ação',    typeBg:'#FAEEDA', typeC:'#633806', valor:9340,  rent:'-2,1%',  rentPos:false },
  { icon:'🔵', name:'Fundo Multimercado XP', bank:'Santander', type:'fundos',  typeName:'Fundo',   typeBg:'#F3EFFE', typeC:'#5B3E8F', valor:8200,  rent:'+13,4%', rentPos:true  },
];

const initialTxns = [
  { id:1, icon:'🛒', name:'Supermercado Extra', meta:'Santander · 02/05', amount:-287.40, type:'compras', cat:'Alimentação', catBg:'#edf6f1', catC:'#085041' },
  { id:2, icon:'💸', name:'Transferência recebida', meta:'Nubank · 01/05', amount:2000,  type:'transf',  cat:'Entrada',     catBg:'#edf6f1', catC:'#085041' },
  { id:3, icon:'🚗', name:'Uber',               meta:'Inter · 30/04',     amount:-28.90, type:'compras', cat:'Transporte',  catBg:'#E6F1FB', catC:'#0C447C' },
  { id:4, icon:'💊', name:'Farmácia',           meta:'Bradesco · 29/04',  amount:-95.00, type:'compras', cat:'Saúde',       catBg:'#FCEBEB', catC:'#791F1F' },
  { id:5, icon:'📱', name:'Tim — Fatura',       meta:'Santander · 28/04', amount:-89.90, type:'pgtos',   cat:'Contas',      catBg:'#FAEEDA', catC:'#633806' },
  { id:6, icon:'🍕', name:'iFood',              meta:'Nubank · 28/04',    amount:-56.00, type:'compras', cat:'Alimentação', catBg:'#edf6f1', catC:'#085041' },
  { id:7, icon:'🎬', name:'Netflix',            meta:'Itaú · 27/04',      amount:-44.90, type:'pgtos',   cat:'Lazer',       catBg:'#FAEEDA', catC:'#633806' },
];

const budget = [
  { name:'Alimentação', gasto:1247, limite:1500, color:'#0F6E56' },
  { name:'Transporte',  gasto:810,  limite:800,  color:'#d05050' },
  { name:'Lazer',       gasto:662,  limite:1000, color:'#BA7517' },
  { name:'Saúde',       gasto:515,  limite:600,  color:'#185FA5' },
  { name:'Contas fixas',gasto:320,  limite:500,  color:'#6b8c7e' },
];

const catColors: Record<string, { bg: string; c: string }> = {
  'Alimentação': { bg:'#edf6f1', c:'#085041' },
  'Transporte':  { bg:'#E6F1FB', c:'#0C447C' },
  'Saúde':       { bg:'#FCEBEB', c:'#791F1F' },
  'Lazer':       { bg:'#FAEEDA', c:'#633806' },
  'Contas':      { bg:'#FAEEDA', c:'#633806' },
  'Entrada':     { bg:'#edf6f1', c:'#085041' },
  'Saque':       { bg:'#f4f6f4', c:'#5a7a6e' },
  'Outros':      { bg:'#f0f0f0', c:'#555'    },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useApp();
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('avatarEmoji');
    if (saved) setAvatarEmoji(saved);
  }, []);
  const [activeBank, setActiveBank] = useState(banks[0]);
  const [activeTab, setActiveTab] = useState('visao');
  const [investFilter, setInvestFilter] = useState('todos');
  const [txnFilter, setTxnFilter] = useState('todas');
  const [txns, setTxns] = useState(initialTxns);
  const [editingTxn, setEditingTxn] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editCat, setEditCat] = useState('');
  const [budgetData, setBudgetData] = useState(budget);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [editLimite, setEditLimite] = useState('');

  const filteredInvest = investFilter === 'todos' ? investimentos : investimentos.filter(i => i.type === investFilter);
  const filteredTxns = txnFilter === 'todas' ? txns : txns.filter(t => t.type === txnFilter);
  const totalInvest = investimentos.reduce((a, i) => a + i.valor, 0);
  const totalOrcado = budgetData.reduce((a, b) => a + b.limite, 0);
  const totalGasto  = budgetData.reduce((a, b) => a + b.gasto, 0);

  function openEdit(txn: any) {
    setEditingTxn(txn);
    setEditName(txn.name);
    setEditCat(txn.cat);
  }

  function saveEdit() {
    const colors = catColors[editCat] || catColors['Outros'];
    setTxns(prev => prev.map(t =>
      t.id === editingTxn.id
        ? { ...t, name: editName, cat: editCat, catBg: colors.bg, catC: colors.c }
        : t
    ));
    setEditingTxn(null);
  }

  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="relative flex items-center justify-between px-4 py-3 sticky top-0 z-10 overflow-hidden"
        style={{ background:'linear-gradient(160deg,#0F6E56 0%,#085041 100%)' }}>
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full" style={{ background:'rgba(255,255,255,0.05)' }}/>
        <div className="absolute right-8 top-4 w-12 h-12 rounded-full"   style={{ background:'rgba(255,255,255,0.05)' }}/>
        <div className="flex items-center gap-2 relative z-10">
          <svg width="22" height="22" viewBox="0 0 46 46" fill="none">
            <circle cx="23" cy="23" r="20" stroke="white" strokeWidth="1.2" opacity="0.3"/>
            <circle cx="23" cy="23" r="13" stroke="white" strokeWidth="1.2" opacity="0.5"/>
            <circle cx="23" cy="23" r="6.5" stroke="white" strokeWidth="1.2" opacity="0.75"/>
            <circle cx="23" cy="23" r="2" fill="white"/>
            <path d="M23 23 L35 10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="35" cy="10" r="2" fill="white"/>
          </svg>
          <span className="text-[15px] font-bold tracking-tight text-white">
            Radar<span style={{ color:'rgba(255,255,255,0.7)' }}>Financeiro</span>
          </span>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => router.push('/alertas')}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ background:'rgba(255,255,255,0.15)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button onClick={() => router.push('/perfil')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xs font-medium" style={{ color:'rgba(255,255,255,0.75)' }}>{user.name.split(' ')[0]}</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background:'rgba(255,255,255,0.2)', border:'1.5px solid rgba(255,255,255,0.35)' }}>
              {avatarEmoji ?? user.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
            </div>
          </button>
        </div>
      </div>

      {/* BANK CHIPS */}
      <div className="flex gap-2 overflow-x-auto px-4 py-2 bg-white border-b border-gray-100 scrollbar-hide">
        {banks.map(bank => (
          <button
            key={bank.id}
            onClick={() => setActiveBank(bank)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap border transition-all"
            style={activeBank.id === bank.id
              ? { background:'#0F6E56', borderColor:'#0F6E56', color:'#fff' }
              : { background:'#fff', borderColor:'#e5e7eb', color:'#6b7280' }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: bank.color }}/>
            {bank.name}
          </button>
        ))}
      </div>

      {/* ABAS */}
      <div className="flex bg-white border-b border-gray-200 shadow-sm">
        {[
          { id:'visao',  label:'📊 Visão' },
          { id:'invest', label:'📈 Invest.' },
          { id:'txns',   label:'💳 Transações' },
          { id:'orc',    label:'🎯 Orçamento' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2.5 text-[10px] font-semibold whitespace-nowrap transition-all border-b-2"
            style={activeTab === tab.id
              ? { borderColor:'#0F6E56', color:'#0F6E56', background:'#f0faf6' }
              : { borderColor:'transparent', color:'#9ca3af', background:'#fff' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4 bg-gray-50">

        {/* VISÃO GERAL */}
        {activeTab === 'visao' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label:'Saldo', value: formatCurrency(activeBank.saldo), sub: activeBank.name, color:'#0F6E56' },
                { label:'Entradas', value:'R$ 8.500', sub:'Maio', color:'#0F6E56' },
                { label:'Saídas', value:'R$ 3.680', sub:'↓12% abr', color:'#d05050' },
              ].map(m => (
                <div key={m.label} className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm">
                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{m.label}</p>
                  <p className="text-[12px] font-bold" style={{ color: m.color }}>{m.value}</p>
                  <p className="text-[9px] text-gray-400 mt-1">{m.sub}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-3">Por categoria</p>
              <div className="space-y-2.5">
                {[
                  { name:'Alimentação', pct:34, color:'#0F6E56' },
                  { name:'Transporte',  pct:22, color:'#185FA5' },
                  { name:'Lazer',       pct:18, color:'#BA7517' },
                  { name:'Saúde',       pct:14, color:'#d05050' },
                  { name:'Outros',      pct:12, color:'#888'    },
                ].map(c => (
                  <div key={c.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-medium text-gray-700">{c.name}</span>
                      <span className="text-[11px] font-bold" style={{ color: c.color }}>{c.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${c.pct}%`, background: c.color }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INVESTIMENTOS */}
        {activeTab === 'invest' && (
          <div className="space-y-3">
            <div className="rounded-2xl p-4 text-white shadow-md" style={{ background:'linear-gradient(135deg,#0F6E56,#085041)' }}>
              <p className="text-[9px] font-semibold uppercase tracking-wider opacity-60 mb-1">Total investido</p>
              <p className="text-2xl font-extrabold tracking-tight">{formatCurrency(totalInvest)}</p>
              <p className="text-[10px] opacity-50 mt-0.5">Todos os bancos · Open Finance</p>
              <div className="inline-flex items-center gap-1 mt-2 bg-white/10 rounded-lg px-2 py-1">
                <span className="text-[11px] font-bold text-emerald-300">+R$ 6.218 (7,7%)</span>
                <span className="text-[10px] opacity-50 ml-1">acumulado</span>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['todos','tesouro','cdb','acoes','fundos'].map(f => (
                <button key={f} onClick={() => setInvestFilter(f)}
                  className="px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap border transition-all"
                  style={investFilter === f
                    ? { background:'#0F6E56', color:'#fff', borderColor:'#0F6E56' }
                    : { background:'#fff', color:'#6b7280', borderColor:'#e5e7eb' }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {filteredInvest.map((inv, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 ${i < filteredInvest.length-1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 shadow-sm" style={{ background: inv.typeBg }}>
                    {inv.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-800 truncate">{inv.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[9px] text-gray-400">{inv.bank}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: inv.typeBg, color: inv.typeC }}>{inv.typeName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-gray-800">{formatCurrency(inv.valor)}</p>
                    <p className={`text-[10px] font-bold ${inv.rentPos ? 'text-[#0F6E56]' : 'text-red-500'}`}>{inv.rent} a.a.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRANSAÇÕES */}
        {activeTab === 'txns' && (
          <div className="space-y-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['todas','compras','transf','pgtos','saques'].map(f => (
                <button key={f} onClick={() => setTxnFilter(f)}
                  className="px-3 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap border transition-all"
                  style={txnFilter === f
                    ? { background:'#0F6E56', color:'#fff', borderColor:'#0F6E56' }
                    : { background:'#fff', color:'#6b7280', borderColor:'#e5e7eb' }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {filteredTxns.map((t, i) => (
                <div key={t.id}
                  className={`flex items-center gap-3 p-3 active:bg-gray-50 cursor-pointer ${i < filteredTxns.length-1 ? 'border-b border-gray-100' : ''}`}
                  onClick={() => openEdit(t)}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 shadow-sm" style={{ background: t.catBg }}>
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-800 truncate">{t.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[9px] text-gray-400">{t.meta}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-1" style={{ background: t.catBg, color: t.catC }}>
  {t.cat} ✏️
</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[12px] font-bold ${t.amount > 0 ? 'text-[#0F6E56]' : 'text-gray-800'}`}>
                      {t.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(t.amount))}
                    </span>
                    <span className="text-gray-400 text-sm"> </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] text-gray-400">Toque em uma transação para editar</p>
          </div>
        )}

        {/* ORÇAMENTO */}
        {activeTab === 'orc' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label:'Orçado',     value: formatCurrency(totalOrcado), sub:'Maio 2026',   color:'#374151' },
                { label:'Utilizado',  value: formatCurrency(totalGasto),  sub:`${Math.round(totalGasto/totalOrcado*100)}%`, color:'#d05050' },
                { label:'Disponível', value: formatCurrency(totalOrcado-totalGasto), sub:'27 dias', color:'#0F6E56' },
              ].map(m => (
                <div key={m.label} className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm">
                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{m.label}</p>
                  <p className="text-[12px] font-bold" style={{ color: m.color }}>{m.value}</p>
                  <p className="text-[9px] text-gray-400 mt-1">{m.sub}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-3">Por categoria</p>
              <div className="space-y-3">
                {budgetData.map(b => (
                  <div key={b.name}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-gray-700">{b.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold" style={{ color: b.color }}>
                          {formatCurrency(b.gasto)}/{formatCurrency(b.limite)}
                          {b.gasto > b.limite ? ' ▲' : ''}
                        </span>
                        <button
                          onClick={() => { setEditingBudget(b); setEditLimite(String(b.limite)); }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          ✏️
                        </button>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width:`${Math.min(b.gasto/b.limite*100,100)}%`,
                        background: b.color
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER OPEN FINANCE */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0F6E56] animate-pulse"/>
          <span className="text-[11px] font-semibold text-[#085041]">Open Finance ativo</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#edf6f1] text-[#0F6E56] border border-[#b5d4c8]">BACEN</span>
        </div>
        <button className="text-[11px] font-semibold text-[#0F6E56]">↻ sync</button>
      </div>

      {/* MODAL EDITAR ORÇAMENTO */}
      {editingBudget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setEditingBudget(null)}>
          <div className="bg-white w-full max-w-[430px] rounded-t-3xl p-6 shadow-2xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5"/>

            <h3 className="text-base font-bold text-gray-800 mb-1">
              Editar limite — {editingBudget.name}
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              Gasto atual: <strong>{formatCurrency(editingBudget.gasto)}</strong>
            </p>

            <div className="mb-5">
              <div className="flex justify-between mb-2">
                <span className="text-[11px] text-gray-500">Progresso</span>
                <span className="text-[11px] font-bold" style={{ color: editingBudget.color }}>
                  {editLimite ? Math.round(editingBudget.gasto / Number(editLimite) * 100) : 0}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{
                  width: editLimite ? `${Math.min(editingBudget.gasto / Number(editLimite) * 100, 100)}%` : '0%',
                  background: editingBudget.color
                }}/>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                Novo limite (R$)
              </label>
              <input
                type="number"
                value={editLimite}
                onChange={e => setEditLimite(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-lg font-bold text-gray-800 focus:outline-none focus:border-[#0F6E56]"
                placeholder="0,00"
              />
            </div>

            <div className="mb-6">
              <p className="text-[10px] text-gray-400 mb-2">Sugestões rápidas</p>
              <div className="flex gap-2">
                {[500, 1000, 1500, 2000].map(v => (
                  <button key={v} onClick={() => setEditLimite(String(v))}
                    className="flex-1 py-1.5 rounded-xl border text-[11px] font-semibold transition-all"
                    style={editLimite === String(v)
                      ? { background: editingBudget.color, color: '#fff', borderColor: editingBudget.color }
                      : { background: '#f9fafb', color: '#6b7280', borderColor: '#e5e7eb' }}>
                    {formatCurrency(v)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditingBudget(null)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500">
                Cancelar
              </button>
              <button
                onClick={() => {
                  setBudgetData(prev => prev.map(b =>
                    b.name === editingBudget.name ? { ...b, limite: Number(editLimite) } : b
                  ));
                  setEditingBudget(null);
                }}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white shadow-md"
                style={{ background: '#0F6E56' }}>
                Salvar limite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR TRANSAÇÃO */}
      {editingTxn && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setEditingTxn(null)}>
          <div className="bg-white w-full max-w-[430px] rounded-t-3xl p-6 shadow-2xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5"/>
            <h3 className="text-base font-bold text-gray-800 mb-1">Editar transação</h3>
            <p className="text-xs text-gray-400 mb-5">{editingTxn.meta}</p>

            {/* Valor (só leitura) */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Valor</label>
              <div className={`mt-1 text-xl font-extrabold ${editingTxn.amount > 0 ? 'text-[#0F6E56]' : 'text-gray-800'}`}>
                {editingTxn.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(editingTxn.amount))}
              </div>
            </div>

            {/* Descrição */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Descrição</label>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#0F6E56]"
              />
            </div>

            {/* Categoria */}
            <div className="mb-6">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Categoria</label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIAS.map(cat => {
                  const colors = catColors[cat] || catColors['Outros'];
                  return (
                    <button key={cat} onClick={() => setEditCat(cat)}
                      className="py-1.5 px-1 rounded-xl text-[10px] font-semibold border-2 transition-all text-center"
                      style={editCat === cat
                        ? { background: colors.bg, borderColor: colors.c, color: colors.c }
                        : { background:'#f9fafb', borderColor:'#e5e7eb', color:'#9ca3af' }}>
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button onClick={() => setEditingTxn(null)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500">
                Cancelar
              </button>
              <button onClick={saveEdit}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white shadow-md"
                style={{ background:'#0F6E56' }}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}