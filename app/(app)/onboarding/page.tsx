"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const VERDE = "#0F6E56";

export default function OnboardingPage() {
  const router = useRouter();
  const [atual, setAtual] = useState(0);
  const [loading, setLoading] = useState(false);

  async function finalizarOnboarding() {
    setLoading(true);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarding_done: true }),
    });
    router.push('/dashboard');
  }

  function avancar() {
    if (atual === 4) { finalizarOnboarding(); return; }
    setAtual(prev => prev + 1);
  }

  const Dots = ({ claro }: { claro: boolean }) => (
    <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:16 }}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{
          height: 6, borderRadius: 3,
          width: i === atual ? 22 : 6,
          background: claro
            ? (i === atual ? VERDE : '#e5e7eb')
            : (i === atual ? 'white' : 'rgba(255,255,255,0.25)'),
          transition: 'all 0.3s',
        }}/>
      ))}
    </div>
  );

  const BtnPrimary = ({ claro, label }: { claro: boolean; label: string }) => (
    <button onClick={avancar} disabled={loading}
      style={{
        width:'100%', padding:'15px 0', border:'none', borderRadius:16,
        fontSize:16, fontWeight:800, cursor:'pointer',
        background: claro ? VERDE : 'white',
        color: claro ? 'white' : VERDE,
        letterSpacing: '-0.2px',
        opacity: loading ? 0.7 : 1,
      }}>
      {loading ? 'Aguarde...' : label}
    </button>
  );

  const Pular = ({ claro }: { claro: boolean }) => (
    <button onClick={finalizarOnboarding}
      style={{
        alignSelf:'flex-end', background:'none', border:'none', cursor:'pointer',
        fontSize:13, fontWeight:500,
        color: claro ? '#9ca3af' : 'rgba(255,255,255,0.5)',
        marginBottom: 16,
      }}>
      Pular
    </button>
  );

  // TELA 1
  if (atual === 0) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'linear-gradient(160deg,#0F6E56 0%,#053d2d 100%)', padding:'32px 24px 36px', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.04)', top:-60, right:-60 }}/>
      <div style={{ position:'absolute', width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.04)', bottom:30, left:-40 }}/>
      <div style={{ position:'absolute', width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.04)', top:40, left:20 }}/>

      <Pular claro={false}/>

      {/* RADAR */}
      <div style={{ position:'relative', width:140, height:140, marginBottom:28, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {[140,100,64].map((size, i) => (
          <div key={i} style={{
            position:'absolute', width:size, height:size, borderRadius:'50%',
            border: `1px solid rgba(255,255,255,${0.15 + i*0.08})`,
            background: i === 2 ? 'rgba(255,255,255,0.08)' : 'transparent',
          }}/>
        ))}
        <div style={{ position:'absolute', width:70, height:1, background:'linear-gradient(90deg,rgba(52,211,153,0.8),transparent)', transformOrigin:'left center', left:'50%', top:'50%', transform:'rotate(-35deg)' }}/>
        <div style={{ position:'absolute', width:8, height:8, borderRadius:'50%', background:'#34d399', top:22, right:28, boxShadow:'0 0 6px #34d399' }}/>
        <div style={{ position:'absolute', width:5, height:5, borderRadius:'50%', background:'rgba(52,211,153,0.6)', bottom:30, left:24 }}/>
        <div style={{ position:'absolute', width:10, height:10, borderRadius:'50%', background:'#34d399', boxShadow:'0 0 8px #34d399' }}/>
      </div>

      {/* BADGE */}
      <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.1)', border:'0.5px solid rgba(255,255,255,0.2)', borderRadius:20, padding:'5px 12px', fontSize:11, color:'rgba(255,255,255,0.8)', fontWeight:600, marginBottom:18 }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background:'#34d399' }}/>
        Open Finance · Banco Central
      </div>

      <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.5)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6, textAlign:'center' }}>Conheça o</div>
      <div style={{ fontSize:32, fontWeight:800, color:'white', lineHeight:1.15, letterSpacing:'-0.5px', textAlign:'center', marginBottom:12 }}>
        Radar<span style={{ color:'#34d399' }}>Financeiro</span>
      </div>
      <div style={{ fontSize:14, color:'rgba(255,255,255,0.6)', textAlign:'center', lineHeight:1.65, marginBottom:28, padding:'0 8px' }}>
        Sua vida financeira completa em um só lugar. Simples, seguro e conectado.
      </div>

      <div style={{ width:'100%' }}>
        <Dots claro={false}/>
        <BtnPrimary claro={false} label="Próximo →"/>
      </div>
    </div>
  );

  // TELA 2
  if (atual === 1) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f8faf9', padding:'28px 20px 24px' }}>
      <Pular claro={true}/>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:20 }}>
        <div style={{ width:64, height:64, borderRadius:20, background:'#edf6f1', border:'1px solid #b5d4c8', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div style={{ fontSize:20, fontWeight:800, color:'#1a2e26', textAlign:'center', marginBottom:6 }}>Tudo em tempo real</div>
        <div style={{ fontSize:13, color:'#6b7280', textAlign:'center', lineHeight:1.6 }}>Veja saldo, transações e investimentos de todos os seus bancos em uma tela.</div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8, flex:1, marginBottom:20 }}>
        {[
          { icon:'🏦', bg:'#edf6f1', title:'Saldo consolidado', sub:'Todos os bancos em um só lugar', color:'#0F6E56' },
          { icon:'📈', bg:'#eff6ff', title:'Investimentos reais', sub:'Rentabilidade atualizada', color:'#185FA5' },
          { icon:'🔔', bg:'#faeeda', title:'Alertas inteligentes', sub:'Nunca perca um gasto', color:'#BA7517' },
          { icon:'📄', bg:'#f3e8ff', title:'Relatório mensal em PDF', sub:'Com sugestões personalizadas', color:'#7c3aed' },
        ].map((item, i) => (
          <div key={i} style={{ background:'white', borderRadius:14, border:'0.5px solid #e5e7eb', padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:item.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#1a2e26' }}>{item.title}</div>
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <Dots claro={true}/>
      <BtnPrimary claro={true} label="Próximo →"/>
    </div>
  );

  // TELA 3
  if (atual === 2) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'white', padding:'28px 20px 24px' }}>
      <Pular claro={true}/>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:20 }}>
        <div style={{ width:64, height:64, borderRadius:20, background:'#edf6f1', border:'1px solid #b5d4c8', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
        </div>
        <div style={{ fontSize:20, fontWeight:800, color:'#1a2e26', textAlign:'center', marginBottom:6 }}>Conecte seu banco</div>
        <div style={{ fontSize:13, color:'#6b7280', textAlign:'center', lineHeight:1.6 }}>Conexão segura via Open Finance regulamentado pelo Banco Central.</div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8, flex:1, marginBottom:12 }}>
        {[
          { cor:'#820AD1', letra:'N', nome:'Nubank',     sub:'Conta e cartão' },
          { cor:'#FF7A00', letra:'I', nome:'Inter',      sub:'Conta digital' },
          { cor:'#003399', letra:'I', nome:'Itaú',       sub:'Conta corrente e poupança' },
          { cor:'#CC092F', letra:'B', nome:'Bradesco',   sub:'Conta corrente e poupança' },
          { cor:'#EC0000', letra:'S', nome:'Santander',  sub:'Conta corrente' },
        ].map((b, i) => (
          <div key={i} style={{ background:'#f9fafb', borderRadius:14, border:'0.5px solid #f3f4f6', padding:'10px 14px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:b.cor, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:15, fontWeight:800, color:'white' }}>{b.letra}</span>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'#1a2e26' }}>{b.nome}</div>
              <div style={{ fontSize:11, color:'#9ca3af' }}>{b.sub}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        ))}
      </div>

      <div style={{ background:'#edf6f1', borderRadius:12, border:'0.5px solid #b5d4c8', padding:'10px 14px', display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:'#085041' }}>100% seguro e regulamentado</div>
          <div style={{ fontSize:11, color:'#6b7280' }}>Banco Central do Brasil · LGPD</div>
        </div>
      </div>

      <Dots claro={true}/>
      <BtnPrimary claro={true} label="Conectar agora →"/>
    </div>
  );

  // TELA 4
  if (atual === 3) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#f8faf9', padding:'28px 20px 24px' }}>
      <Pular claro={true}/>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:20 }}>
        <div style={{ width:64, height:64, borderRadius:20, background:'#edf6f1', border:'1px solid #b5d4c8', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>
          </svg>
        </div>
        <div style={{ fontSize:20, fontWeight:800, color:'#1a2e26', textAlign:'center', marginBottom:6 }}>Defina seu orçamento</div>
        <div style={{ fontSize:13, color:'#6b7280', textAlign:'center', lineHeight:1.6 }}>Toque em qualquer categoria para ajustar seu limite mensal.</div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8, flex:1, marginBottom:20 }}>
        {[
          { nome:'Alimentação', val:'R$ 800', cor:VERDE,     bg:'#edf6f1', pct:65 },
          { nome:'Transporte',  val:'R$ 400', cor:'#185FA5', bg:'#eff6ff', pct:38 },
          { nome:'Saúde',       val:'R$ 300', cor:'#A32D2D', bg:'#fef2f2', pct:80 },
          { nome:'Lazer',       val:'R$ 200', cor:'#BA7517', bg:'#faeeda', pct:28 },
        ].map((cat, i) => (
          <div key={i} style={{ background:'white', borderRadius:14, border:'0.5px solid #e5e7eb', padding:'12px 14px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:cat.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cat.cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:'#1a2e26' }}>{cat.nome}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:13, fontWeight:700, color:cat.cor }}>{cat.val}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={cat.cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.5 }}>
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
            </div>
            <div style={{ height:6, borderRadius:3, background:'#f3f4f6', overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:3,
                background:`linear-gradient(90deg,${cat.cor},${cat.cor}88)`,
                width:`${cat.pct}%`,
                animation:`pulse-${i} 2.5s ease-in-out infinite`,
              }}/>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse-0{0%,100%{width:65%}50%{width:78%}}
        @keyframes pulse-1{0%,100%{width:38%}50%{width:52%}}
        @keyframes pulse-2{0%,100%{width:80%}50%{width:60%}}
        @keyframes pulse-3{0%,100%{width:28%}50%{width:42%}}
      `}</style>

      <Dots claro={true}/>
      <BtnPrimary claro={true} label="Próximo →"/>
    </div>
  );

  // TELA 5
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'linear-gradient(160deg,#0F6E56 0%,#053d2d 100%)', padding:'32px 20px 28px', alignItems:'center', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,0.04)', top:-80, right:-80 }}/>
      <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.04)', bottom:40, left:-50 }}/>

      <button onClick={finalizarOnboarding} style={{ alignSelf:'flex-end', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.45)', marginBottom:20, position:'relative', zIndex:1 }}>Pular</button>

      {/* SINO ANIMADO */}
      <div style={{ position:'relative', width:80, height:80, marginBottom:24, zIndex:1 }}>
        <div style={{ width:80, height:80, borderRadius:24, background:'rgba(255,255,255,0.12)', border:'1.5px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation:'bell-ring 3s ease-in-out infinite' }}>
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
        </div>
        <div style={{ position:'absolute', top:-6, right:-6, width:18, height:18, borderRadius:'50%', background:'#34d399', border:'2px solid #053d2d', animation:'ping 2s ease-in-out infinite', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:9, fontWeight:800, color:'#053d2d' }}>3</span>
        </div>
      </div>

      <style>{`
        @keyframes bell-ring{0%,100%{transform:rotate(0)}20%{transform:rotate(-12deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(8deg)}}
        @keyframes ping{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:0.7}}
        @keyframes slide-in{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
      `}</style>

      <div style={{ fontSize:24, fontWeight:800, color:'white', textAlign:'center', letterSpacing:'-0.4px', marginBottom:8, lineHeight:1.2, position:'relative', zIndex:1 }}>Fique sempre<br/>informado</div>
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', textAlign:'center', lineHeight:1.65, marginBottom:24, padding:'0 8px', position:'relative', zIndex:1 }}>
        Alertas inteligentes em tempo real para nunca perder um gasto ou oportunidade.
      </div>

      <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:8, marginBottom:24, position:'relative', zIndex:1 }}>
        {[
          { icon:'⚠️', bg:'rgba(239,68,68,0.2)', title:'Orçamento estourado',    sub:'Alimentação · R$ 850 de R$ 800', badge:'Agora', badgeBg:'rgba(239,68,68,0.25)', badgeColor:'#fca5a5', delay:'0.2s' },
          { icon:'⏰', bg:'rgba(251,191,36,0.2)', title:'Investimento vencendo',  sub:'CDB Nubank · vence em 15 dias',  badge:'15d',   badgeBg:'rgba(251,191,36,0.2)', badgeColor:'#fde68a', delay:'0.5s' },
          { icon:'📈', bg:'rgba(52,211,153,0.2)', title:'Saldo positivo este mês', sub:'Você economizou R$ 1.200',      badge:'Hoje',  badgeBg:'rgba(52,211,153,0.2)', badgeColor:'#6ee7b7', delay:'0.8s' },
        ].map((n, i) => (
          <div key={i} style={{ background:'rgba(255,255,255,0.1)', borderRadius:14, border:'0.5px solid rgba(255,255,255,0.15)', padding:'12px 14px', display:'flex', alignItems:'center', gap:12, animation:`slide-in 0.5s ease ${n.delay} both` }}>
            <div style={{ width:38, height:38, borderRadius:11, background:n.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{n.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'white' }}>{n.title}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:2 }}>{n.sub}</div>
            </div>
            <div style={{ padding:'3px 8px', borderRadius:20, fontSize:10, fontWeight:700, background:n.badgeBg, color:n.badgeColor, flexShrink:0 }}>{n.badge}</div>
          </div>
        ))}
      </div>

      <div style={{ width:'100%', position:'relative', zIndex:1 }}>
        <Dots claro={false}/>
        <BtnPrimary claro={false} label="🚀 Começar agora!"/>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textAlign:'center', marginTop:10 }}>
          Você pode alterar as preferências a qualquer momento
        </div>
      </div>
    </div>
  );
}
