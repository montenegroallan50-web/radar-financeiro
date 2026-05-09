"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const VERDE = "#0F6E56";

const telas = [
  {
    emoji: "👋",
    titulo: "Bem-vindo ao Radar Financeiro!",
    subtitulo: "Sua vida financeira completa em um só lugar. Simples, seguro e conectado.",
    bg: "linear-gradient(160deg,#0F6E56 0%,#085041 100%)",
    claro: false,
  },
  {
    emoji: "📊",
    titulo: "Tudo em tempo real",
    subtitulo: "Veja saldo, transações, investimentos e alertas de todos os seus bancos em uma única tela.",
    bg: "#ffffff",
    claro: true,
    items: [
      { icon:"🏦", text:"Saldo de todos os bancos" },
      { icon:"💸", text:"Transações categorizadas" },
      { icon:"📈", text:"Investimentos e rentabilidade" },
      { icon:"🔔", text:"Alertas inteligentes" },
    ],
  },
  {
    emoji: "🏦",
    titulo: "Conecte seu banco",
    subtitulo: "Use o Open Finance regulamentado pelo Banco Central para conectar seus bancos com segurança.",
    bg: "#ffffff",
    claro: true,
    cta: "conectar",
  },
  {
    emoji: "🎯",
    titulo: "Defina seu orçamento",
    subtitulo: "Estabeleça limites por categoria e o Radar te avisa quando estiver próximo do limite.",
    bg: "#ffffff",
    claro: true,
    categorias: ["🍔 Alimentação","🚗 Transporte","🏥 Saúde","🎮 Lazer","📚 Educação"],
    progresso:  [60, 40, 75, 30, 50],
  },
  {
    emoji: "🔔",
    titulo: "Fique sempre informado",
    subtitulo: "Ative notificações e receba alertas de gastos, vencimentos e oportunidades.",
    bg: "linear-gradient(160deg,#0F6E56 0%,#085041 100%)",
    claro: false,
    cta: "notificacao",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [atual, setAtual] = useState(0);
  const [loading, setLoading] = useState(false);

  const tela = telas[atual];
  const isUltima = atual === telas.length - 1;

  async function finalizarOnboarding() {
    setLoading(true);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarding_done: true }),
    });
    router.push('/dashboard');
  }

  async function avancar() {
    if (isUltima) {
      await finalizarOnboarding();
      return;
    }
    setAtual(prev => prev + 1);
  }

  return (
    <div className="flex flex-col h-full" style={{ background: tela.bg }}>

      {/* PULAR */}
      {!isUltima && (
        <div className="flex justify-end px-4 pt-4">
          <button onClick={finalizarOnboarding}
            className="text-[14px] font-medium px-3 py-1 rounded-full"
            style={{ color: tela.claro ? '#9ca3af' : 'rgba(255,255,255,0.6)' }}>
            Pular
          </button>
        </div>
      )}

      {/* CONTEÚDO */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">

        {/* EMOJI */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg"
          style={{ background: tela.claro ? '#edf6f1' : 'rgba(255,255,255,0.15)' }}>
          {tela.emoji}
        </div>

        {/* TÍTULO */}
        <h1 className="text-[24px] font-bold text-center leading-tight mb-3"
          style={{ color: tela.claro ? '#1a2e26' : 'white' }}>
          {tela.titulo}
        </h1>

        {/* SUBTÍTULO */}
        <p className="text-[15px] text-center leading-relaxed mb-8"
          style={{ color: tela.claro ? '#6b7280' : 'rgba(255,255,255,0.75)' }}>
          {tela.subtitulo}
        </p>

        {/* ITEMS (tela 2) */}
        {'items' in tela && tela.items && (
          <div className="w-full space-y-3 mb-4">
            {tela.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background:'#f9fafb', border:'0.5px solid #f3f4f6' }}>
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[15px] font-medium text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* CATEGORIAS (tela 4) */}
        {'categorias' in tela && tela.categorias && (
          <div className="w-full space-y-2 mb-4">
            {tela.categorias.map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background:'#f9fafb', border:'0.5px solid #f3f4f6' }}>
                <span className="text-[14px] font-medium text-gray-700">{cat}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width:`${tela.progresso![i]}%`, background: VERDE }}/>
                  </div>
                  <span className="text-[12px] text-gray-400">{tela.progresso![i]}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CARD BANCO (tela 3) */}
        {'cta' in tela && tela.cta === 'conectar' && (
          <div className="w-full p-4 rounded-xl mb-4 flex items-center gap-3"
            style={{ background:'#edf6f1', border:'1px solid #b5d4c8' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ background: VERDE }}>
              🔒
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#085041]">100% seguro</p>
              <p className="text-[12px] text-gray-500">Regulamentado pelo Banco Central do Brasil</p>
            </div>
          </div>
        )}

        {/* CARD NOTIFICAÇÃO (tela 5) */}
        {'cta' in tela && tela.cta === 'notificacao' && (
          <div className="w-full p-4 rounded-xl mb-4"
            style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)' }}>
            <div className="space-y-2">
              {[
                { icon:'💸', text:'Gasto acima do limite' },
                { icon:'📅', text:'Vencimento de investimento' },
                { icon:'⚠️', text:'Saldo baixo na conta' },
              ].map((n, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span>{n.icon}</span>
                  <span className="text-[13px] text-white/80">{n.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* INDICADORES */}
      <div className="flex justify-center gap-2 mb-6">
        {telas.map((_, i) => (
          <div key={i} className="rounded-full transition-all"
            style={{
              width: i === atual ? '24px' : '8px',
              height: '8px',
              background: tela.claro
                ? (i === atual ? VERDE : '#e5e7eb')
                : (i === atual ? 'white' : 'rgba(255,255,255,0.3)'),
            }}/>
        ))}
      </div>

      {/* BOTÃO */}
      <div className="px-6 pb-8">
        <button onClick={avancar} disabled={loading}
          className="w-full py-3.5 rounded-xl text-[16px] font-bold transition-all disabled:opacity-60"
          style={{
            background: tela.claro ? VERDE : 'white',
            color: tela.claro ? 'white' : VERDE,
          }}>
          {loading ? 'Aguarde...' : isUltima ? '🚀 Começar agora!' : 'Próximo →'}
        </button>
      </div>
    </div>
  );
}
