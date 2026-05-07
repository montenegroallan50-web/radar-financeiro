"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const alertsData = [
  { id:0, type:'urgente', icon:'🔴', title:'Transporte estourou o orçamento',    desc:'Você gastou R$810 de R$800 orçados. O limite foi ultrapassado em R$10.',         time:'Agora',   detail:'Categoria Transporte ultrapassou o orçamento de maio. Principais gastos: Uber R$28,90 · Combustível R$180 · Estacionamentos R$95. Considere aumentar a meta para R$1.000 ou reduzir os gastos nos próximos dias.' },
  { id:1, type:'urgente', icon:'💳', title:'Gasto alto detectado',               desc:'Compra de R$287,40 no Supermercado Extra via Santander em 02/05.',                 time:'Há 2h',   detail:'Transação de R$287,40 detectada no Santander — Supermercado Extra em 02/05/2026. Esta transação representa 23% do seu orçamento mensal de Alimentação.' },
  { id:2, type:'atencao', icon:'⚠️', title:'Alimentação em 83% do orçamento',   desc:'Você gastou R$1.247 de R$1.500. Restam R$253 para o mês.',                        time:'Ontem',   detail:'Sua categoria Alimentação está em 83% da meta mensal. Se o ritmo continuar, o orçamento será esgotado em aproximadamente 5 dias.' },
  { id:3, type:'info',    icon:'📅', title:'CDB Itaú vence em 60 dias',          desc:'LCI Itaú 95% CDI no valor de R$10.800 vence em 20/07/2026.',                      time:'28/04',   detail:'Seu LCI Itaú (95% CDI) no valor de R$10.800 vence em 20/07/2026. Rentabilidade acumulada: +R$1.058,40 (9,8% a.a.).' },
  { id:4, type:'info',    icon:'📉', title:'PETR4 com rentabilidade negativa',   desc:'Ação Petrobras registrou -2,1% a.a. este mês. Posição: R$9.340.',                 time:'25/04',   detail:'PETR4 está com rentabilidade negativa de -2,1% a.a. neste mês. Valor atual: R$9.340. Variação: -R$196,14.' },
];

const historico = [
  { dot:'#d05050', text:'<b>Transporte estourou</b> o orçamento — R$810 de R$800 gastos',           time:'Hoje'  },
  { dot:'#d05050', text:'<b>Gasto alto detectado</b> — Supermercado Extra R$287,40 no Santander',   time:'Hoje'  },
  { dot:'#BA7517', text:'<b>Alimentação em 83%</b> do orçamento — R$1.247 de R$1.500',              time:'Ontem' },
  { dot:'#185FA5', text:'<b>Open Finance</b> sincronizado com sucesso — 4 bancos atualizados',      time:'02/05' },
  { dot:'#0F6E56', text:'<b>Meta de maio definida</b> — orçamento total de R$4.900',               time:'01/05' },
  { dot:'#BA7517', text:'<b>Saúde em 86%</b> do orçamento — R$515 de R$600',                      time:'29/04' },
  { dot:'#185FA5', text:'<b>CDB LCI Itaú</b> vence em 60 dias — R$10.800 disponíveis',            time:'28/04' },
  { dot:'#d05050', text:'<b>PETR4 rentabilidade negativa</b> — -2,1% a.a. no mês',               time:'25/04' },
  { dot:'#0F6E56', text:'<b>Tesouro Selic</b> rendeu +R$196 este mês — acumulado R$27.100',       time:'20/04' },
  { dot:'#185FA5', text:'<b>Open Finance Nubank</b> conectado com sucesso via BACEN',              time:'15/04' },
];

const typeStyle: Record<string, { bg: string; border: string; stripe: string; iconBg: string }> = {
  urgente: { bg:'#FEF2F2', border:'#f5c0c0', stripe:'#d05050', iconBg:'rgba(208,80,80,.15)'  },
  atencao: { bg:'#FFFBEB', border:'#f5d87a', stripe:'#BA7517', iconBg:'rgba(186,117,23,.12)' },
  info:    { bg:'#EFF6FF', border:'#bfdbfe', stripe:'#185FA5', iconBg:'rgba(24,95,165,.1)'   },
  sucesso: { bg:'#edf6f1', border:'#b5d4c8', stripe:'#0F6E56', iconBg:'rgba(15,110,86,.12)'  },
};

const configOrcamento = [
  { icon:'🔴', iconBg:'#FEF2F2', name:'Orçamento estourado',  desc:'Alerta imediato ao ultrapassar o limite',   on: true  },
  { icon:'⚠️', iconBg:'#FFFBEB', name:'Próximo do limite',    desc:'Aviso antes de atingir a meta',            on: true  },
];
const configBanco = [
  { icon:'🔄', iconBg:'#edf6f1', name:'Open Finance expirando',    desc:'Aviso 30 dias antes de renovar',         on: true  },
  { icon:'💳', iconBg:'#EFF6FF', name:'Transação acima de R$500',  desc:'Alerta para gastos grandes',             on: true  },
  { icon:'🔒', iconBg:'#F3EFFE', name:'Saldo baixo',               desc:'Aviso quando saldo ficar abaixo de R$500', on: false },
];
const configInvest = [
  { icon:'📅', iconBg:'#FAEEDA', name:'Vencimento próximo',        desc:'Aviso 60 dias antes do vencimento',       on: true  },
  { icon:'📉', iconBg:'#edf6f1', name:'Rentabilidade negativa',    desc:'Alerta se algum ativo entrar no negativo', on: true  },
];
const configCanal = [
  { icon:'📱', iconBg:'#edf6f1', name:'Push no celular',           desc:'Notificação no smartphone',               on: true  },
  { icon:'📧', iconBg:'#EFF6FF', name:'E-mail semanal',            desc:'Resumo toda segunda-feira',               on: false },
];

export default function AlertasPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState(alertsData);
  const [activeTab, setActiveTab] = useState('alertas');
  const [modalAlert, setModalAlert] = useState<any>(null);
  const [toast, setToast] = useState('');
  const [thresh, setThresh] = useState(80);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'Orçamento estourado': true, 'Próximo do limite': true,
    'Open Finance expirando': true, 'Transação acima de R$500': true, 'Saldo baixo': false,
    'Vencimento próximo': true, 'Rentabilidade negativa': true,
    'Push no celular': true, 'E-mail semanal': false,
  });

  const urgentes = alerts.filter(a => a.type === 'urgente');
  const atencao  = alerts.filter(a => a.type === 'atencao');
  const info     = alerts.filter(a => a.type === 'info' || a.type === 'sucesso');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  function dismiss(id: number) {
    setAlerts(prev => prev.filter(a => a.id !== id));
    showToast('Alerta dispensado');
  }

  function dismissAll() {
    setAlerts([]);
    showToast('Todos os alertas dispensados');
  }

  function toggleConfig(name: string) {
    setToggles(prev => {
      const next = { ...prev, [name]: !prev[name] };
      showToast(next[name] ? 'Alerta ativado' : 'Alerta desativado');
      return next;
    });
  }

  function AlertGroup({ label, items }: { label: string; items: typeof alerts }) {
    if (items.length === 0) return null;
    return (
      <div className="mb-3">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-0.5">{label}</p>
        <div className="space-y-2">
          {items.map(a => {
            const s = typeStyle[a.type] || typeStyle['info'];
            return (
              <div key={a.id} className="rounded-2xl border shadow-md overflow-hidden relative"
                style={{ background: s.bg, borderColor: s.border }}>
                {/* Stripe lateral */}
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: s.stripe }}/>
                <div className="pl-4 pr-3 pt-3 pb-2">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: s.iconBg }}>
                      {a.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-gray-800 leading-tight">{a.title}</p>
                      <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">{a.desc}</p>
                      <p className="text-[12px] text-gray-400 mt-1">{a.time}</p>
                    </div>
                    <button onClick={() => dismiss(a.id)}
                      className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[12px] text-gray-500 flex-shrink-0">
                      ✕
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    <button onClick={() => setModalAlert(a)}
                      className="px-3 py-1.5 rounded-lg text-[13px] font-bold text-white"
                      style={{ background: '#0F6E56' }}>
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

  function Toggle({ name }: { name: string }) {
    const on = toggles[name] ?? false;
    return (
      <div onClick={() => toggleConfig(name)} className="relative w-9 h-5 rounded-full cursor-pointer flex-shrink-0 transition-all"
        style={{ background: on ? '#0F6E56' : '#d1d5db' }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
          style={{ left: on ? '18px' : '2px' }}/>
      </div>
    );
  }

  function ConfigItem({ icon, iconBg, name, desc }: any) {
    return (
      <div className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100 shadow-md">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: iconBg }}>{icon}</div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-gray-800">{name}</p>
          <p className="text-[12px] text-gray-400 mt-0.5">{desc}</p>
        </div>
        <Toggle name={name}/>
      </div>
    );
  }

  const tabs = [
    { id:'alertas', label:'🔔 Alertas', badge: alerts.length },
    { id:'config',  label:'⚙️ Config.'  },
    { id:'hist',    label:'📋 Histórico' },
  ];

  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="relative flex items-center justify-between px-4 py-3 sticky top-0 z-10 overflow-hidden"
        style={{ background:'linear-gradient(160deg,#0F6E56 0%,#085041 100%)' }}>
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full" style={{ background:'rgba(255,255,255,0.05)' }}/>
        <div className="absolute right-8 top-4 w-12 h-12 rounded-full"   style={{ background:'rgba(255,255,255,0.05)' }}/>
        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ background:'rgba(255,255,255,0.15)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
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
        {alerts.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full relative z-10"
            style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
            <span className="text-[13px] font-bold text-white">{alerts.length} ativo{alerts.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* ABAS */}
      <div className="flex bg-white border-b border-gray-200 shadow-sm">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2.5 text-[12px] font-semibold whitespace-nowrap transition-all border-b-2 flex items-center justify-center gap-1"
            style={activeTab === tab.id
              ? { borderColor:'#0F6E56', color:'#0F6E56', background:'#f0faf6' }
              : { borderColor:'transparent', color:'#9ca3af', background:'#fff' }}>
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
        {activeTab === 'alertas' && (
          <div>
{alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-sm font-bold text-gray-700">Tudo em dia!</p>
                <p className="text-xs text-gray-400 mt-1">Nenhum alerta ativo no momento.</p>
              </div>
            ) : (
              <>
                <AlertGroup label="🔴 Urgente"    items={urgentes}/>
                <AlertGroup label="⚠️ Atenção"    items={atencao}/>
                <AlertGroup label="ℹ️ Informativo" items={info}/>
                <button onClick={dismissAll}
                  className="w-full text-center text-[13px] font-semibold text-gray-400 py-3">
                  Dispensar todos os alertas
                </button>
              </>
            )}
          </div>
        )}

        {/* ── CONFIGURAÇÕES ── */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            {/* Slider threshold */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-md">
              <div className="flex justify-between mb-4">
                <p className="text-[14px] font-semibold text-gray-700">Alertar ao atingir</p>
              </div>
              <div className="relative pt-9 pb-1">
                {/* Balão que segue o thumb */}
                <div
                  className="absolute top-0 flex flex-col items-center pointer-events-none z-10"
                  style={{ left: `${((thresh - 50) / 45) * 100}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="bg-[#0F6E56] text-white text-[14px] font-bold px-3 py-1 rounded-xl shadow-lg">
                    {thresh}%
                  </div>
                  <div className="w-0 h-0" style={{
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid #0F6E56'
                  }}/>
                </div>

                {/* Trilha customizada */}
                <div className="relative h-3">
                  {/* Fundo cinza */}
                  <div className="absolute inset-0 bg-gray-200 rounded-full"/>
                  {/* Preenchimento verde */}
                  <div className="absolute left-0 top-0 h-full bg-[#0F6E56] rounded-full"
                    style={{ width: `${((thresh - 50) / 45) * 100}%` }}/>
                  {/* Thumb circular */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-[3px] border-[#0F6E56] rounded-full shadow-md pointer-events-none"
                    style={{ left: `calc(${((thresh - 50) / 45) * 100}% - 10px)` }}
                  />
                  {/* Input nativo invisível por cima */}
                  <input type="range" min="50" max="95" step="5" value={thresh}
                    onChange={e => setThresh(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-3">
                {['50%','60%','70%','80%','90%','95%'].map(v => (
                  <span key={v} className="text-[11px] text-gray-400 font-medium">{v}</span>
                ))}
              </div>
            </div>

            {[
              { title:'Alertas de orçamento',     items: configOrcamento },
              { title:'Alertas bancários',         items: configBanco     },
              { title:'Alertas de investimentos',  items: configInvest    },
              { title:'Canal de notificação',      items: configCanal     },
            ].map(section => (
              <div key={section.title}>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{section.title}</p>
                <div className="space-y-2">
                  {section.items.map(item => (
                    <ConfigItem key={item.name} {...item}/>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── HISTÓRICO ── */}
        {activeTab === 'hist' && (
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Últimos 30 dias</p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
              {historico.map((h, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 ${i < historico.length-1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: h.dot }}/>
                  <p className="text-[13px] text-gray-500 flex-1 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: h.text.replace(/<b>/g,'<strong class="text-gray-800 font-semibold">').replace(/<\/b>/g,'</strong>') }}/>
                  <span className="text-[12px] text-gray-400 whitespace-nowrap flex-shrink-0">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0F6E56] animate-pulse"/>
          <span className="text-[13px] font-semibold text-[#085041]">Open Finance ativo</span>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#edf6f1] text-[#0F6E56] border border-[#b5d4c8]">BACEN</span>
        </div>
        <button className="text-[13px] font-semibold text-[#0F6E56]">↻ sync</button>
      </div>

      {/* MODAL DETALHE */}
      {modalAlert && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setModalAlert(null)}>
          <div className="bg-white w-full max-w-[430px] rounded-t-3xl p-6 shadow-2xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5"/>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: typeStyle[modalAlert.type]?.iconBg }}>
                {modalAlert.icon}
              </div>
              <h3 className="text-[17px] font-bold text-gray-800 flex-1 leading-tight">{modalAlert.title}</h3>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
              <p className="text-[14px] text-gray-600 leading-relaxed">{modalAlert.detail}</p>
            </div>
            <button onClick={() => setModalAlert(null)}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white shadow-md"
              style={{ background:'#0F6E56' }}>
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