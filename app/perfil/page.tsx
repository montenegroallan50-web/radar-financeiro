'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ── TOKENS ────────────────────────────────────────────────────────────────────
const C = {
  bg1: '#ffffff', bg2: '#f4f6f4',
  bdr: '#e8ede8', bdr2: '#dae5de',
  txt1: '#1a2e26', txt2: '#6b8c7e',
  green: '#0F6E56', gDark: '#085041', gLight: '#edf6f1',
};

// ── DADOS ESTÁTICOS ───────────────────────────────────────────────────────────
const AVATARS = ['😎','🧑‍💼','👩‍💻','🧑‍🎨','🦁','🐯','🦊','🐧','🚀','💎'];

const OBJETIVOS = [
  { emoji: '🎯', label: 'Controlar gastos' },
  { emoji: '💰', label: 'Guardar dinheiro' },
  { emoji: '📉', label: 'Pagar dívidas' },
  { emoji: '📈', label: 'Planejar investimentos' },
  { emoji: '📊', label: 'Organizar finanças' },
];

const BANKS_DATA = [
  { letter: 'S', name: 'Santander', bg: '#CC0000', status: 'active',   expire: 'Expira em 11 meses' },
  { letter: 'N', name: 'Nubank',    bg: '#820AD1', status: 'active',   expire: 'Expira em 8 meses'  },
  { letter: 'I', name: 'Inter',     bg: '#FF7A00', status: 'expiring', expire: 'Renovar em 28 dias' },
  { letter: 'B', name: 'Bradesco',  bg: '#CC092F', status: 'active',   expire: 'Expira em 10 meses' },
];

// ── TIPOS ─────────────────────────────────────────────────────────────────────
type ModalId = 'avatar' | 'editPerfil' | 'senha' | 'objetivo' | 'renda' | 'delete' | null;

// ── ESTILOS REUTILIZÁVEIS ─────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  border: `.5px solid ${C.bdr2}`, borderRadius: '8px',
  fontSize: '14px', fontWeight: 500, fontFamily: "'Inter', sans-serif",
  color: C.txt1, background: C.bg2, outline: 'none',
};
const btnPrimary: React.CSSProperties = {
  width: '100%', padding: '11px', background: C.green, color: '#fff',
  border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
  fontFamily: "'Inter', sans-serif", cursor: 'pointer', marginTop: '14px',
};
const btnGhost: React.CSSProperties = {
  width: '100%', padding: '10px', background: 'transparent', color: C.txt2,
  border: `.5px solid ${C.bdr}`, borderRadius: '8px', fontSize: '13px',
  fontWeight: 500, fontFamily: "'Inter', sans-serif", cursor: 'pointer', marginTop: '8px',
};
const modalOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
};
const modalSheet: React.CSSProperties = {
  background: C.bg1, borderRadius: '16px 16px 0 0',
  width: '100%', maxWidth: '390px', maxHeight: '80%', overflowY: 'auto',
};
const modalHandle: React.CSSProperties = {
  width: '36px', height: '4px', borderRadius: '2px',
  background: C.bdr2, margin: '10px auto 0',
};
const modalHeader: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 16px 10px',
};
const modalBody: React.CSSProperties = { padding: '0 16px 20px' };
const modalTitleStyle: React.CSSProperties = { fontSize: '15px', fontWeight: 700, color: C.txt1 };
const closeBtnStyle: React.CSSProperties = {
  width: '26px', height: '26px', borderRadius: '50%', background: C.bg2,
  border: 'none', cursor: 'pointer', fontSize: '13px', color: C.txt2,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const labelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 600, color: C.txt2,
  letterSpacing: '.07em', textTransform: 'uppercase', margin: '12px 0 6px',
};
const menuItemBase: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '11px',
  padding: '12px 14px', borderBottom: `.5px solid ${C.bdr}`, cursor: 'pointer',
};
const menuIconBase: React.CSSProperties = {
  width: '32px', height: '32px', borderRadius: '9px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '16px', flexShrink: 0,
};

// ── SUB-COMPONENTES ───────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '9px', fontWeight: 700, color: C.txt2,
      letterSpacing: '.08em', textTransform: 'uppercase', margin: '14px 0 7px',
    }}>
      {children}
    </div>
  );
}

function ModalLabel({ children }: { children: React.ReactNode }) {
  return <div style={labelStyle}>{children}</div>;
}

function ModalClose({ onClose }: { onClose: () => void }) {
  return (
    <button onClick={onClose} style={closeBtnStyle}>✕</button>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer',
        position: 'relative', flexShrink: 0,
        background: on ? C.green : C.bdr2,
        transition: 'background .2s',
      }}
    >
      <div style={{
        width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
        position: 'absolute', top: '2px', transition: 'left .2s',
        left: on ? '18px' : '2px',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
      }} />
    </div>
  );
}

interface MenuItemProps {
  icon: string;
  iconBg: string;
  name: string;
  desc?: string;
  rightValue?: string;
  badge?: string;
  isLast?: boolean;
  onClick: () => void;
}
function MenuItem({ icon, iconBg, name, desc, rightValue, badge, isLast, onClick }: MenuItemProps) {
  return (
    <div
      onClick={onClick}
      style={{ ...menuItemBase, borderBottom: isLast ? 'none' : `.5px solid ${C.bdr}` }}
    >
      <div style={{ ...menuIconBase, background: iconBg }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: C.txt1 }}>{name}</div>
        {desc && <div style={{ fontSize: '10px', color: C.txt2, marginTop: '1px' }}>{desc}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {badge && (
          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '8px', background: C.gLight, color: C.green }}>
            {badge}
          </span>
        )}
        {rightValue && <span style={{ fontSize: '11px', fontWeight: 600, color: C.txt2 }}>{rightValue}</span>}
        <span style={{ fontSize: '14px', color: C.txt2 }}>›</span>
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function PerfilPage() {
  const router = useRouter();

  // estado do perfil
  const [avatar,      setAvatar]      = useState('😎');
  const [tempAvatar,  setTempAvatar]  = useState('😎');
  const [displayName, setDisplayName] = useState('João Silva');
  const [email,       setEmail]       = useState('joao.silva@email.com');
  const [phone,       setPhone]       = useState('(21) 99999-0000');
  const [objetivo,    setObjetivo]    = useState('Controlar gastos');
  const [tempObj,     setTempObj]     = useState('Controlar gastos');
  const [renda,       setRenda]       = useState(8500);
  const [tempRenda,   setTempRenda]   = useState('8500');
  const [tempName,    setTempName]    = useState('João Silva');
  const [tempEmail,   setTempEmail]   = useState('joao.silva@email.com');
  const [tempPhone,   setTempPhone]   = useState('(21) 99999-0000');

  // preferências
  const [notifications,  setNotifications]  = useState(true);
  const [biometria,      setBiometria]      = useState(true);

  // modal e toast
  const [modal, setModal] = useState<ModalId>(null);
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  };

  const openModal = (id: ModalId) => {
    if (id === 'avatar')    setTempAvatar(avatar);
    if (id === 'editPerfil') { setTempName(displayName); setTempEmail(email); setTempPhone(phone); }
    if (id === 'objetivo')  setTempObj(objetivo);
    if (id === 'renda')     setTempRenda(String(renda));
    setModal(id);
  };
  const closeModal = () => setModal(null);

  const saveAvatar = () => {
    setAvatar(tempAvatar);
    closeModal();
    showToast('✓ Avatar atualizado!');
  };
  const savePerfil = () => {
    setDisplayName(tempName);
    setEmail(tempEmail);
    setPhone(tempPhone);
    closeModal();
    showToast('✓ Perfil atualizado com sucesso!');
  };
  const saveRenda = () => {
    const val = parseFloat(tempRenda);
    if (val > 0) { setRenda(val); closeModal(); showToast('✓ Renda atualizada!'); }
  };
  const saveObjetivo = () => {
    setObjetivo(tempObj);
    closeModal();
    showToast('✓ Objetivo atualizado!');
  };
  const fmt = (v: number) => 'R$ ' + v.toLocaleString('pt-BR');

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: C.bg2, fontFamily: "'Inter', sans-serif",
      color: C.txt1, position: 'relative',
    }}>

      {/* Status bar */}
      <div style={{
        height: '36px', background: '#1a2e26', display: 'flex',
        alignItems: 'center', padding: '0 20px', flexShrink: 0, position: 'relative',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff', position: 'absolute', left: '24px' }}>9:41</span>
        <div style={{ width: '80px', height: '20px', background: '#111', borderRadius: '10px', margin: '0 auto' }} />
        <div style={{ position: 'absolute', right: '20px', display: 'flex', gap: '5px', alignItems: 'center' }}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="white">
            <rect x="0" y="4" width="2" height="6" rx="1"/>
            <rect x="3" y="2.5" width="2" height="7.5" rx="1"/>
            <rect x="6" y="1" width="2" height="9" rx="1"/>
            <rect x="9" y="0" width="2" height="10" rx="1"/>
          </svg>
          <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
            <rect x=".5" y=".5" width="18" height="9" rx="2.5" stroke="white" strokeOpacity=".35"/>
            <rect x="1.5" y="1.5" width="14" height="7" rx="1.5" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Área de scroll */}
      <div className="scrollbar-hide" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '52px' }}>

        {/* Header perfil */}
        <div style={{
          background: 'linear-gradient(160deg,#0F6E56 0%,#085041 100%)',
          padding: '20px 16px 28px', position: 'relative', overflow: 'hidden',
        }}>
          {/* círculos decorativos */}
          <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: '30px', top: '30px', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

          {/* voltar */}
          <div onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', cursor: 'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>Dashboard</span>
          </div>

          {/* avatar + info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div onClick={() => openModal('avatar')} style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '30px', cursor: 'pointer', position: 'relative', flexShrink: 0,
            }}>
              <span>{avatar}</span>
              <div style={{
                position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px',
                borderRadius: '50%', background: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center', border: '2px solid #085041',
              }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M7 1.5l1.5 1.5-5.5 5.5H1.5V7L7 1.5z" stroke="#0F6E56" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-.4px', marginBottom: '2px' }}>{displayName}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{email}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>Membro desde maio 2026</div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', background: C.bg2, borderBottom: `.5px solid ${C.bdr}` }}>
          {[
            { value: '4',     label: 'Bancos',   green: true  },
            { value: 'R$87k', label: 'Investido', green: false },
            { value: '+7,7%', label: 'Rentab.',   green: true  },
          ].map((st, i) => (
            <div key={i} style={{
              padding: '12px 8px', textAlign: 'center',
              borderRight: i < 2 ? `.5px solid ${C.bdr}` : 'none',
            }}>
              <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-.3px', color: st.green ? C.green : C.txt1 }}>{st.value}</div>
              <div style={{ fontSize: '9px', fontWeight: 600, color: C.txt2, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: '2px' }}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* Conteúdo */}
        <div style={{ padding: '12px 14px 0' }}>

          {/* ── MINHA CONTA ── */}
          <SectionTitle>Minha conta</SectionTitle>
          <div style={{ background: C.bg1, border: `.5px solid ${C.bdr}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
            <MenuItem icon="👤" iconBg={C.gLight} name="Dados pessoais"      desc="Nome, e-mail, telefone"         onClick={() => openModal('editPerfil')} />
            <MenuItem icon="🔑" iconBg={C.gLight} name="Alterar senha"        desc="Última alteração há 30 dias"   onClick={() => openModal('senha')} />
            <MenuItem icon="🎯" iconBg={C.gLight} name="Objetivo financeiro"  desc={objetivo}                      onClick={() => openModal('objetivo')} />
            <MenuItem icon="💰" iconBg={C.gLight} name="Renda mensal"         desc="Usada para cálculos de orçamento" rightValue={fmt(renda)} isLast onClick={() => openModal('renda')} />
          </div>

          {/* ── OPEN FINANCE ── */}
          <SectionTitle>Conexões Open Finance</SectionTitle>
          <div style={{ background: C.bg1, border: `.5px solid ${C.bdr}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
            {BANKS_DATA.map((bank, i) => (
              <div key={bank.name} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderBottom: i < BANKS_DATA.length - 1 ? `.5px solid ${C.bdr}` : 'none',
              }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '7px', background: bank.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>{bank.letter}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: C.txt1, flex: 1 }}>{bank.name}</div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 500, color: bank.status === 'active' ? C.green : '#BA7517' }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: bank.status === 'active' ? C.green : '#BA7517',
                      display: 'inline-block', marginRight: '3px',
                    }} />
                    {bank.status === 'active' ? 'Ativo' : 'Expirando'}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: bank.status === 'expiring' ? '#BA7517' : C.txt2,
                    fontWeight: bank.status === 'expiring' ? 500 : 400,
                  }}>{bank.expire}</div>
                </div>
                {bank.status === 'expiring' ? (
                  <button
                    onClick={() => showToast('✓ Renovação iniciada — redirecionando para o Inter...')}
                    style={{
                      marginLeft: '8px', padding: '4px 10px', background: C.green,
                      color: '#fff', border: 'none', borderRadius: '7px',
                      fontSize: '10px', fontWeight: 700, fontFamily: "'Inter', sans-serif", cursor: 'pointer',
                    }}
                  >Renovar</button>
                ) : (
                  <svg
                    onClick={() => showToast(`Gerenciar ${bank.name}`)}
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    style={{ marginLeft: '8px', cursor: 'pointer' }}
                  >
                    <circle cx="7" cy="7" r="6" stroke={C.bdr2} strokeWidth="1"/>
                    <path d="M5 7l2 2 2-3" stroke={C.green} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            ))}
            <div
              onClick={() => showToast('+ Abrindo conexão Open Finance...')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 14px', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '12px', fontWeight: 600, color: C.green }}>+ Adicionar banco</span>
            </div>
          </div>

          {/* ── PREFERÊNCIAS ── */}
          <SectionTitle>Preferências</SectionTitle>
          <div style={{ background: C.bg1, border: `.5px solid ${C.bdr}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
            {/* Notificações */}
            <div style={menuItemBase}>
              <div style={{ ...menuIconBase, background: C.gLight }}>🔔</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: C.txt1 }}>Notificações push</div>
                <div style={{ fontSize: '10px', color: C.txt2, marginTop: '1px' }}>Alertas no celular</div>
              </div>
              <Toggle on={notifications} onToggle={() => { setNotifications(v => !v); showToast((!notifications ? '✓ ' : '✕ ') + 'Notificações ' + (!notifications ? 'ativado' : 'desativado')); }} />
            </div>
            {/* Biometria */}
            <div style={menuItemBase}>
              <div style={{ ...menuIconBase, background: '#FAEEDA' }}>🔒</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: C.txt1 }}>Biometria / Face ID</div>
                <div style={{ fontSize: '10px', color: C.txt2, marginTop: '1px' }}>Entrar com digital ou rosto</div>
              </div>
              <Toggle on={biometria} onToggle={() => { setBiometria(v => !v); showToast((!biometria ? '✓ ' : '✕ ') + 'Biometria ' + (!biometria ? 'ativado' : 'desativado')); }} />
            </div>
            {/* Moeda */}
            <div style={{ ...menuItemBase, borderBottom: 'none', cursor: 'pointer' }} onClick={() => showToast('Moeda: BRL R$')}>
              <div style={{ ...menuIconBase, background: C.gLight }}>💱</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: C.txt1 }}>Moeda padrão</div>
                <div style={{ fontSize: '10px', color: C.txt2, marginTop: '1px' }}>Real brasileiro</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: C.txt2 }}>BRL R$</span>
                <span style={{ fontSize: '14px', color: C.txt2 }}>›</span>
              </div>
            </div>
          </div>

          {/* ── SEGURANÇA ── */}
          <SectionTitle>Segurança e privacidade</SectionTitle>
          <div style={{ background: C.bg1, border: `.5px solid ${C.bdr}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
            <MenuItem icon="🛡️" iconBg={C.gLight}  name="Autenticação 2 fatores" desc="SMS ou app autenticador"     badge="Ativo"  onClick={() => {}} />
            <MenuItem icon="📄" iconBg="#EFF6FF"    name="Política de privacidade" desc="Como seus dados são usados"  onClick={() => showToast('Abrindo política de privacidade...')} />
            <MenuItem icon="📋" iconBg="#EFF6FF"    name="Termos de uso"           desc="Atualizado em jan/2026"      onClick={() => showToast('Abrindo termos de uso...')} />
            <MenuItem icon="📤" iconBg="#FAEEDA"    name="Exportar meus dados"     desc="LGPD — receba tudo por e-mail" isLast onClick={() => showToast('Exportando seus dados...')} />
          </div>

          {/* ── SUPORTE ── */}
          <SectionTitle>Suporte</SectionTitle>
          <div style={{ background: C.bg1, border: `.5px solid ${C.bdr}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
            <MenuItem icon="❓" iconBg={C.gLight} name="Central de ajuda" desc="Dúvidas e tutoriais"             onClick={() => showToast('Abrindo central de ajuda...')} />
            <MenuItem icon="💬" iconBg={C.gLight} name="Falar com suporte" desc="Resposta em até 24h"  badge="Online" onClick={() => showToast('Abrindo chat de suporte...')} />
            <MenuItem icon="⭐" iconBg="#FAEEDA"  name="Avaliar o app"    desc="Sua opinião é muito importante"  onClick={() => showToast('Obrigado pelo feedback! ⭐')} />
            <MenuItem icon="ℹ️" iconBg={C.bg2}   name="Versão do app"    rightValue="v1.0.0" isLast              onClick={() => showToast('Versão 1.0.0 — build 2026.05')} />
          </div>

          {/* ── CONTA (PERIGO) ── */}
          <SectionTitle>Conta</SectionTitle>
          <button onClick={() => showToast('Saindo da conta...')} style={{
            width: '100%', padding: '11px', background: 'transparent', color: '#d05050',
            border: '.5px solid #f5c0c0', borderRadius: '10px', fontSize: '13px',
            fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: 'pointer',
            marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3M10 11l3-3.5L10 4M13 7.5H6" stroke="#d05050" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sair da conta
          </button>
          <button onClick={() => openModal('delete')} style={{
            width: '100%', padding: '11px', background: '#d05050', color: '#fff',
            border: '.5px solid #d05050', borderRadius: '10px', fontSize: '13px',
            fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: 'pointer',
            marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 4h11M5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M12 4l-.8 8a1 1 0 01-1 .9H4.8a1 1 0 01-1-.9L3 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Excluir minha conta
          </button>
          <div style={{ height: '10px' }} />
        </div>
      </div>

      {/* ── RODAPÉ OPEN FINANCE ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '390px', height: '52px', background: C.bg1,
        borderTop: `.5px solid ${C.bdr}`, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 16px', zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="animate-pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.green }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: C.gDark }}>Open Finance ativo</span>
          <span style={{
            fontSize: '9px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
            padding: '2px 6px', borderRadius: '5px', background: C.gLight, color: C.green, border: '.5px solid #b5d4c8',
          }}>BACEN</span>
        </div>
        <button onClick={() => showToast('↻ Sincronizando...')} style={{
          fontSize: '13px', fontWeight: 600, color: C.green, cursor: 'pointer',
          background: 'none', border: 'none', fontFamily: "'Inter', sans-serif",
        }}>↻ Sync</button>
      </div>

      {/* ══════════════════ MODAIS ══════════════════ */}

      {/* Modal: Avatar */}
      {modal === 'avatar' && (
        <div style={modalOverlay} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={modalSheet} className="scrollbar-hide">
            <div style={modalHandle} />
            <div style={modalHeader}>
              <span style={modalTitleStyle}>Escolher avatar</span>
              <ModalClose onClose={closeModal} />
            </div>
            <div style={modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px', margin: '8px 0 14px' }}>
                {AVATARS.map(av => (
                  <div key={av} onClick={() => setTempAvatar(av)} style={{
                    aspectRatio: '1', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '22px', cursor: 'pointer',
                    border: `2px solid ${tempAvatar === av ? C.green : 'transparent'}`,
                    background: tempAvatar === av ? C.gLight : C.bg2,
                    transition: 'all .15s',
                  }}>{av}</div>
                ))}
              </div>
              <button onClick={saveAvatar} style={btnPrimary}>Salvar avatar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar perfil */}
      {modal === 'editPerfil' && (
        <div style={modalOverlay} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={modalSheet} className="scrollbar-hide">
            <div style={modalHandle} />
            <div style={modalHeader}>
              <span style={modalTitleStyle}>Editar perfil</span>
              <ModalClose onClose={closeModal} />
            </div>
            <div style={modalBody}>
              <ModalLabel>Nome completo</ModalLabel>
              <input value={tempName}  onChange={e => setTempName(e.target.value)}  style={inputStyle} />
              <ModalLabel>E-mail</ModalLabel>
              <input value={tempEmail} onChange={e => setTempEmail(e.target.value)} type="email" style={inputStyle} />
              <ModalLabel>Telefone</ModalLabel>
              <input value={tempPhone} onChange={e => setTempPhone(e.target.value)} type="tel" style={inputStyle} />
              <button onClick={savePerfil} style={btnPrimary}>Salvar alterações</button>
              <button onClick={closeModal} style={btnGhost}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Senha */}
      {modal === 'senha' && (
        <div style={modalOverlay} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={modalSheet} className="scrollbar-hide">
            <div style={modalHandle} />
            <div style={modalHeader}>
              <span style={modalTitleStyle}>Alterar senha</span>
              <ModalClose onClose={closeModal} />
            </div>
            <div style={modalBody}>
              <ModalLabel>Senha atual</ModalLabel>
              <input type="password" placeholder="••••••••" style={inputStyle} />
              <ModalLabel>Nova senha</ModalLabel>
              <input type="password" placeholder="Mín. 8 caracteres" style={inputStyle} />
              <ModalLabel>Confirmar nova senha</ModalLabel>
              <input type="password" placeholder="••••••••" style={inputStyle} />
              <button onClick={() => { closeModal(); showToast('✓ Senha alterada com sucesso!'); }} style={btnPrimary}>Alterar senha</button>
              <button onClick={closeModal} style={btnGhost}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Objetivo */}
      {modal === 'objetivo' && (
        <div style={modalOverlay} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={modalSheet} className="scrollbar-hide">
            <div style={modalHandle} />
            <div style={modalHeader}>
              <span style={modalTitleStyle}>Objetivo financeiro</span>
              <ModalClose onClose={closeModal} />
            </div>
            <div style={modalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '4px' }}>
                {OBJETIVOS.map(obj => {
                  const sel = tempObj === obj.label;
                  return (
                    <div key={obj.label} onClick={() => setTempObj(obj.label)} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '11px', borderRadius: '9px', cursor: 'pointer',
                      border: `.5px solid ${sel ? C.green : C.bdr}`,
                      background: sel ? C.gLight : C.bg2,
                    }}>
                      <span style={{ fontSize: '20px' }}>{obj.emoji}</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: sel ? C.gDark : C.txt1 }}>{obj.label}</span>
                    </div>
                  );
                })}
              </div>
              <button onClick={saveObjetivo} style={btnPrimary}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Renda */}
      {modal === 'renda' && (
        <div style={modalOverlay} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={modalSheet} className="scrollbar-hide">
            <div style={modalHandle} />
            <div style={modalHeader}>
              <span style={modalTitleStyle}>Renda mensal</span>
              <ModalClose onClose={closeModal} />
            </div>
            <div style={modalBody}>
              <ModalLabel>Valor aproximado (R$)</ModalLabel>
              <input
                value={tempRenda} onChange={e => setTempRenda(e.target.value)}
                type="number" inputMode="decimal" style={inputStyle}
              />
              <div style={{
                background: C.gLight, border: '.5px solid #b5d4c8', borderRadius: '8px',
                padding: '9px 11px', marginTop: '10px', fontSize: '11px', color: '#3d5c50', lineHeight: 1.5,
              }}>
                💡 Esse valor é usado para calcular percentuais do orçamento e sugerir metas. Não é compartilhado com nenhum banco.
              </div>
              <button onClick={saveRenda} style={btnPrimary}>Salvar</button>
              <button onClick={closeModal} style={btnGhost}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Excluir conta */}
      {modal === 'delete' && (
        <div style={modalOverlay} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={modalSheet} className="scrollbar-hide">
            <div style={modalHandle} />
            <div style={modalHeader}>
              <span style={{ ...modalTitleStyle, color: '#d05050' }}>⚠️ Excluir conta</span>
              <ModalClose onClose={closeModal} />
            </div>
            <div style={modalBody}>
              <div style={{
                background: '#FEF2F2', border: '.5px solid #f5c0c0', borderRadius: '10px',
                padding: '12px', marginBottom: '14px', fontSize: '12px', color: '#7a2020', lineHeight: 1.6,
              }}>
                Esta ação é <strong>permanente e irreversível.</strong> Todos os seus dados, histórico e conexões Open Finance serão removidos. Suas informações bancárias nos bancos não são afetadas.
              </div>
              <ModalLabel>Digite sua senha para confirmar</ModalLabel>
              <input type="password" placeholder="••••••••" style={{ ...inputStyle, borderColor: '#f5c0c0' }} />
              <button
                onClick={() => { closeModal(); showToast('Solicitação enviada — verifique seu e-mail'); }}
                style={{ ...btnPrimary, background: '#d05050' }}
              >Confirmar exclusão</button>
              <button onClick={closeModal} style={btnGhost}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: '62px', left: '50%', transform: 'translateX(-50%)',
          background: '#1a2e26', color: '#fff', fontSize: '12px', fontWeight: 500,
          padding: '8px 16px', borderRadius: '20px', whiteSpace: 'nowrap', zIndex: 200,
        }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
