"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

const VERDE = "#0F6E56";
const VERDE_CLARO = "#edf6f1";
const CORES_PIZZA = ["#0F6E56","#1a9e7a","#34d399","#6ee7b7","#a7f3d0","#f59e0b","#ef4444","#8b5cf6"];

// Gera lista dos últimos 12 meses (exceto o atual se não for último dia útil)
function getMesesDisponiveis() {
  const meses = [];
  const hoje = new Date();

  function ultimoDiaUtil(ano: number, mes: number) {
    const ultimo = new Date(ano, mes + 1, 0);
    const dow = ultimo.getDay();
    if (dow === 0) ultimo.setDate(ultimo.getDate() - 2);
    else if (dow === 6) ultimo.setDate(ultimo.getDate() - 1);
    return ultimo;
  }

  for (let i = 1; i <= 12; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const ano = d.getFullYear();
    const mes = d.getMonth();
    const key = `${ano}-${String(mes + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    meses.push({ key, label, ano, mes });
  }

  // Adiciona mês atual só se hoje >= último dia útil
  const uldUtil = ultimoDiaUtil(hoje.getFullYear(), hoje.getMonth());
  if (hoje >= uldUtil) {
    const key = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    const label = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    meses.unshift({ key, label, ano: hoje.getFullYear(), mes: hoje.getMonth() });
  }

  return meses;
}

function PizzaChart({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((s, v) => s + v, 0);
  if (total === 0) return <p className="text-gray-400 text-sm text-center py-4">Sem dados de gastos</p>;
  let angle = -90;
  const slices = Object.entries(data).map(([name, value], i) => {
    const pct = value / total;
    const start = angle;
    angle += pct * 360;
    return { name, value, pct, start, end: angle, color: CORES_PIZZA[i % CORES_PIZZA.length] };
  });

  function polar(deg: number, r: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: 100 + r * Math.cos(rad), y: 100 + r * Math.sin(rad) };
  }

  function slicePath(start: number, end: number) {
    const s = polar(start, 80); const e = polar(end, 80);
    return `M100,100 L${s.x},${s.y} A80,80 0 ${end - start > 180 ? 1 : 0},1 ${e.x},${e.y} Z`;
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {slices.map((s, i) => <path key={i} d={slicePath(s.start, s.end)} fill={s.color}/>)}
        <circle cx="100" cy="100" r="45" fill="white"/>
        <text x="100" y="96" textAnchor="middle" fontSize="11" fill="#374151" fontWeight="600">Total</text>
        <text x="100" y="112" textAnchor="middle" fontSize="9" fill={VERDE} fontWeight="700">{formatCurrency(total)}</text>
      </svg>
      <div className="flex flex-col gap-1.5 flex-1">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: s.color }}/>
            <span className="text-[12px] text-gray-600 flex-1">{s.name}</span>
            <span className="text-[12px] font-bold text-gray-800">{(s.pct * 100).toFixed(0)}%</span>
            <span className="text-[11px] text-gray-400 ml-1">{formatCurrency(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: Record<string, { entradas: number; saidas: number }> }) {
  const meses = Object.keys(data).sort().slice(-6);
  const max = Math.max(...meses.flatMap(m => [data[m].entradas, data[m].saidas]), 1);
  const nomeMes = (key: string) => ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(key.split('-')[1]) - 1];
  return (
    <div className="flex items-end gap-2 h-40 mt-2">
      {meses.map(m => (
        <div key={m} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex gap-0.5 items-end" style={{ height:'120px' }}>
            <div className="flex-1 rounded-t" style={{ height:`${(data[m].entradas/max)*100}%`, background:'#34d399', minHeight:'2px' }}/>
            <div className="flex-1 rounded-t" style={{ height:`${(data[m].saidas/max)*100}%`, background:'#ef4444', minHeight:'2px' }}/>
          </div>
          <span className="text-[9px] text-gray-400">{nomeMes(m)}</span>
        </div>
      ))}
      <div className="flex flex-col gap-1 ml-2 pb-5">
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-[#34d399]"/><span className="text-[10px] text-gray-500">Entradas</span></div>
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-[#ef4444]"/><span className="text-[10px] text-gray-500">Saídas</span></div>
      </div>
    </div>
  );
}

export default function RelatorioPage() {
  const router = useRouter();
  const mesesDisponiveis = useMemo(() => getMesesDisponiveis(), []);

  const [mesSelecionado, setMesSelecionado] = useState(mesesDisponiveis[0]?.key ?? '');
  const [data,    setData]    = useState<any>(null);
  const [ia,      setIa]      = useState('');
  const [loading, setLoading] = useState(false);
  const [gerando, setGerando] = useState(false);

  async function carregarRelatorio(mesKey: string) {
    setLoading(true);
    setData(null);
    setIa('');

    const res = await fetch(`/api/report?mes=${mesKey}`);
    const json = await res.json();
    setData(json);

    const iaRes = await fetch('/api/ai-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entradas:   json.resumo?.entradas    ?? 0,
        saidas:     json.resumo?.saidas      ?? 0,
        saldo:      json.resumo?.saldo       ?? 0,
        patrimonio: json.patrimonioTotal     ?? 0,
        categorias: json.porCategoria        ?? {},
      }),
    });
    const iaJson = await iaRes.json();
    setIa(iaJson.text ?? '');
    setLoading(false);
  }

  useEffect(() => {
    if (mesSelecionado) carregarRelatorio(mesSelecionado);
  }, [mesSelecionado]);

  async function gerarPDF() {
    setGerando(true);
    try {
      window.open(`/api/report/pdf?mes=${mesSelecionado}`, '_blank');
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#E2E4EC]">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        <button onClick={() => router.push('/perfil')} className="flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke={VERDE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[14px] font-medium text-[#0F6E56]">Perfil</span>
        </button>
        <button onClick={gerarPDF} disabled={gerando || !data}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[14px] font-bold disabled:opacity-60"
          style={{ background: VERDE }}>
          {gerando ? '⏳ Gerando...' : '⬇️ Baixar PDF'}
        </button>
      </div>

      {/* SELETOR DE MÊS */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Selecionar mês</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {mesesDisponiveis.map(m => (
            <button key={m.key} onClick={() => setMesSelecionado(m.key)}
              className="px-3 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap flex-shrink-0 transition-all"
              style={mesSelecionado === m.key
                ? { background: VERDE, color: 'white' }
                : { background: '#f3f4f6', color: '#6b7280' }}>
              {m.label.charAt(0).toUpperCase() + m.label.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin"/>
            <p className="text-[14px] text-gray-500">Carregando relatório...</p>
          </div>
        )}

        {!loading && data && (
          <div className="bg-white mx-3 mt-3 rounded-xl overflow-hidden">

            {/* CAPA */}
            <div className="px-6 py-8" style={{ background:`linear-gradient(160deg,${VERDE} 0%,#085041 100%)` }}>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-white text-[20px]">📊</span>
                <span className="text-white text-[18px] font-bold">RadarFinanceiro</span>
              </div>
              <h1 className="text-white text-[22px] font-bold">Relatório Financeiro</h1>
              <p className="text-white/70 text-[13px] mt-1 capitalize">{mesesDisponiveis.find(m => m.key === mesSelecionado)?.label}</p>
              <div className="mt-4 pt-4 border-t border-white/20 space-y-0.5">
                <p className="text-white/80 text-[13px]">👤 {data.profile?.nome ?? 'Usuário'}</p>
                <p className="text-white/80 text-[13px]">📧 {data.profile?.email ?? ''}</p>
                <p className="text-white/80 text-[13px]">📅 Gerado em {new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}</p>
              </div>
            </div>

            {/* RESUMO */}
            <div className="px-6 py-5">
              <h2 className="text-[16px] font-bold text-gray-800 mb-3">💰 Resumo do Mês</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Entradas',          value: formatCurrency(data.resumo.entradas),   color:'#059669', bg:'#ecfdf5' },
                  { label:'Saídas',            value: formatCurrency(data.resumo.saidas),     color:'#dc2626', bg:'#fef2f2' },
                  { label:'Saldo',             value: formatCurrency(data.resumo.saldo),      color: data.resumo.saldo >= 0 ? '#059669' : '#dc2626', bg: data.resumo.saldo >= 0 ? '#ecfdf5' : '#fef2f2' },
                  { label:'Patrimônio Invest.', value: formatCurrency(data.patrimonioTotal),  color: VERDE, bg: VERDE_CLARO },
                ].map((c, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: c.bg }}>
                    <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">{c.label}</p>
                    <p className="text-[17px] font-bold mt-0.5" style={{ color: c.color }}>{c.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-gray-400 mt-2">{data.resumo.totalTransacoes} transações no período</p>
            </div>

            <div className="h-px bg-gray-100 mx-6"/>

            {/* PIZZA */}
            <div className="px-6 py-5">
              <h2 className="text-[16px] font-bold text-gray-800 mb-3">🍕 Gastos por Categoria</h2>
              <PizzaChart data={data.porCategoria}/>
            </div>

            <div className="h-px bg-gray-100 mx-6"/>

            {/* BARRAS */}
            {Object.keys(data.evolucao).length > 0 && (
              <>
                <div className="px-6 py-5">
                  <h2 className="text-[16px] font-bold text-gray-800 mb-1">📈 Evolução dos Últimos Meses</h2>
                  <BarChart data={data.evolucao}/>
                </div>
                <div className="h-px bg-gray-100 mx-6"/>
              </>
            )}

            {/* INVESTIMENTOS */}
            {data.investments?.length > 0 && (
              <>
                <div className="px-6 py-5">
                  <h2 className="text-[16px] font-bold text-gray-800 mb-3">📦 Carteira de Investimentos</h2>
                  <div className="space-y-2">
                    {data.investments.slice(0, 5).map((inv: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                        <div>
                          <p className="text-[13px] font-semibold text-gray-800">{inv.name ?? '—'}</p>
                          <p className="text-[11px] text-gray-400">{inv.type ?? '—'}</p>
                        </div>
                        <p className="text-[13px] font-bold" style={{ color: VERDE }}>{formatCurrency(inv.balance ?? 0)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-gray-100 mx-6"/>
              </>
            )}

            {/* TRANSAÇÕES */}
            <div className="px-6 py-5">
              <h2 className="text-[16px] font-bold text-gray-800 mb-3">🧾 Transações do Mês</h2>
              {data.transactions?.length === 0
                ? <p className="text-[13px] text-gray-400">Nenhuma transação neste mês.</p>
                : <div className="space-y-1.5">
                    {data.transactions.map((t: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-gray-700 truncate">{t.description ?? 'Sem descrição'}</p>
                          <p className="text-[10px] text-gray-400">{t.category ?? 'Outros'} · {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <p className="text-[13px] font-bold ml-3 flex-shrink-0"
                          style={{ color: t.type === 'CREDIT' ? '#059669' : '#dc2626' }}>
                          {t.type === 'CREDIT' ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                        </p>
                      </div>
                    ))}
                  </div>
              }
            </div>

            <div className="h-px bg-gray-100 mx-6"/>

            {/* SUGESTÕES */}
            <div className="px-6 py-5">
              <h2 className="text-[16px] font-bold text-gray-800 mb-3">💡 Sugestões Personalizadas</h2>
              <div className="p-4 rounded-xl" style={{ background: VERDE_CLARO, border:`0.5px solid #b5d4c8` }}>
                <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">{ia || 'Analisando seus dados...'}</p>
              </div>
            </div>

            {/* RODAPÉ */}
            <div className="px-6 py-4 text-center bg-gray-50">
              <p className="text-[11px] text-gray-400">Gerado pelo RadarFinanceiro · Dados protegidos pela LGPD</p>
              <p className="text-[11px] text-gray-400">Este relatório é confidencial e destinado exclusivamente ao titular</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
