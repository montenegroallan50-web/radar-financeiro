'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const BANKS = [
  { id: 'santander', name: 'Santander', color: '#CC0000', initial: 'S' },
  { id: 'nubank', name: 'Nubank', color: '#820AD1', initial: 'N' },
  { id: 'inter', name: 'Inter', color: '#FF7A00', initial: 'I' },
  { id: 'bradesco', name: 'Bradesco', color: '#CC092F', initial: 'B' },
  { id: 'itau', name: 'Itaú', color: '#003399', initial: 'I' },
  { id: 'bb', name: 'Banco do Brasil', color: '#E8A000', initial: 'B' },
  { id: 'caixa', name: 'Caixa', color: '#005B8E', initial: 'C' },
  { id: 'c6', name: 'C6 Bank', color: '#333333', initial: 'C' },
];

const AVATARS = ['😊', '🧑', '👩‍💻', '⚡', '🦊'];

const STEP_LABELS = [
  'Passo 1 de 3 — Dados pessoais',
  'Passo 2 de 3 — Conectar bancos',
  'Passo 3 de 3 — Perfil',
];

const STR_COLORS = ['#d05050', '#BA7517', '#1D9E75', '#0F6E56'];

const fieldInput: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid #dae5de',
  borderRadius: '10px',
  fontSize: '14px',
  fontFamily: 'Inter, sans-serif',
  color: '#1a2e26',
  background: '#f4f6f4',
  outline: 'none',
  WebkitAppearance: 'none',
  appearance: 'none',
  display: 'block',
};

const fieldLabel: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  color: '#6b8c7e',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: '6px',
  display: 'block',
};

const btnPrimary: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  background: '#0F6E56',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: 700,
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  letterSpacing: '0.01em',
  minHeight: '44px',
  display: 'block',
  textAlign: 'center',
};

const btnOutline: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  background: 'transparent',
  border: '1px solid #dae5de',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#6b8c7e',
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
  minHeight: '44px',
  display: 'block',
  textAlign: 'center',
};

function LoginPageInner() {
  const [activeTab, setActiveTab] = useState<'entrar' | 'criar'>('entrar');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [step, setStep] = useState(1);
  const [connectedBanks, setConnectedBanks] = useState<Set<string>>(new Set());
  const [connectingBanks, setConnectingBanks] = useState<Set<string>>(new Set());
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erroMsg, setErroMsg] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [aguardandoEmail, setAguardandoEmail] = useState(false);
  const [loginErroMsg, setLoginErroMsg] = useState('');
  const [loginCarregando, setLoginCarregando] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const callbackError = searchParams.get('error') === 'confirmation_failed'
    ? 'Link de confirmação inválido ou expirado. Tente cadastrar novamente.'
    : null;

  async function handleLogin() {
    setLoginErroMsg('');
    if (!email.trim()) { setLoginErroMsg('Informe seu e-mail.'); return; }
    if (!password)     { setLoginErroMsg('Informe sua senha.'); return; }

    setLoginCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginCarregando(false);

    if (error) {
      setLoginErroMsg(
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : error.message
      );
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  async function handleCriarConta() {
    setErroMsg('');

    if (!nome.trim() || !sobrenome.trim()) {
      setErroMsg('Preencha nome e sobrenome.');
      return;
    }
    if (!email.trim()) {
      setErroMsg('Informe um e-mail válido.');
      return;
    }
    if (password.length < 8) {
      setErroMsg('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (password !== confirmarSenha) {
      setErroMsg('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: `${nome.trim()} ${sobrenome.trim()}` },
      },
    });
    setCarregando(false);

    if (error) {
      setErroMsg(error.message === 'User already registered'
        ? 'Este e-mail já está cadastrado.'
        : error.message);
      return;
    }

    // Supabase exige confirmação de e-mail → sem sessão ainda
    if (data.user && !data.session) {
      setAguardandoEmail(true);
      return;
    }

    router.push('/dashboard');
  }

  function handleConnect(bankId: string) {
    if (connectedBanks.has(bankId) || connectingBanks.has(bankId)) return;
    setConnectingBanks(prev => new Set([...prev, bankId]));
    setTimeout(() => {
      setConnectingBanks(prev => {
        const next = new Set(prev);
        next.delete(bankId);
        return next;
      });
      setConnectedBanks(prev => new Set([...prev, bankId]));
    }, 1600);
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    setPasswordStrength(score);
  }

  const strColor = passwordStrength > 0 ? STR_COLORS[Math.min(passwordStrength - 1, 3)] : '#dae5de';

  return (
    <>
      {/* ── SCREEN WRAPPER ── */}
      <div style={{
        width: '100%', maxWidth: '390px', minHeight: '100vh',
        margin: '0 auto',
        background: 'linear-gradient(160deg, #0F6E56 0%, #085041 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* STATUS BAR */}
        <div style={{
          height: '44px', background: 'transparent', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
        }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>9:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="11" viewBox="0 0 16 11" fill="white">
              <rect x="0" y="4" width="2.5" height="7" rx="1"/>
              <rect x="3.5" y="2.5" width="2.5" height="8.5" rx="1"/>
              <rect x="7" y="1" width="2.5" height="10" rx="1"/>
              <rect x="10.5" y="0" width="2.5" height="11" rx="1"/>
            </svg>
            <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
              <rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke="white" strokeOpacity="0.4"/>
              <rect x="1.5" y="1.5" width="16" height="8" rx="2" fill="white"/>
              <path d="M22 3.5v4a2 2 0 000-4z" fill="white" fillOpacity="0.45"/>
            </svg>
          </div>
        </div>

        {/* BRAND SECTION */}
        <div style={{
          padding: '32px 24px 28px', flexShrink: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Círculos decorativos */}
          <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>
          <div style={{ position: 'absolute', right: '24px', top: '24px', width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>
          <div style={{ position: 'absolute', left: '-28px', bottom: '0px', width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>

          <svg width="68" height="68" viewBox="0 0 72 72" fill="none" style={{ marginBottom: '14px', position: 'relative', zIndex: 1 }}>
            <circle cx="36" cy="36" r="32" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            <circle cx="36" cy="36" r="22" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
            <circle cx="36" cy="36" r="12" stroke="rgba(255,255,255,0.55)" strokeWidth="1"/>
            <circle cx="36" cy="36" r="3.5" fill="white"/>
            <line x1="36" y1="4" x2="36" y2="68" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
            <line x1="4" y1="36" x2="68" y2="36" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
            <line x1="13" y1="13" x2="59" y2="59" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
            <line x1="59" y1="13" x2="13" y2="59" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
            <path d="M36 36 L57 15" stroke="#9FE1CB" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="57" cy="15" r="3" fill="#9FE1CB"/>
            <circle cx="49" cy="23" r="2" fill="#9FE1CB" opacity="0.55"/>
            <circle cx="22" cy="48" r="2" fill="#9FE1CB" opacity="0.4"/>
            <circle cx="48" cy="47" r="1.5" fill="#9FE1CB" opacity="0.3"/>
          </svg>
          <div style={{
            fontFamily: 'var(--font-outfit), sans-serif',
            fontSize: '32px', fontWeight: 700, color: '#fff',
            letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '6px',
            position: 'relative', zIndex: 1,
          }}>
            Radar<span style={{ color: '#9FE1CB', fontWeight: 400 }}>Financeiro</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 400, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.02em', position: 'relative', zIndex: 1 }}>
            Visão total do seu dinheiro
          </div>
        </div>

        {/* FEATURE CHIP */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '20px', padding: '5px 12px',
          }}>
            <div style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: '#9FE1CB', flexShrink: 0, opacity: 0.8,
            }}/>
            <span style={{ fontSize: '11px', fontWeight: 400, color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap' }}>
              Multi-banco · Open Finance
            </span>
          </div>
        </div>

        {/* FORM CARD */}
        <div style={{
          background: '#fff', borderRadius: '24px 24px 0 0',
          flex: 1, padding: '28px 24px 104px',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* TABS */}
          <div style={{
            display: 'flex', background: '#f4f6f4',
            borderRadius: '12px', padding: '4px', marginBottom: '24px',
          }}>
            {(['entrar', 'criar'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setStep(1); }}
                style={{
                  flex: 1, padding: '9px', textAlign: 'center',
                  fontSize: '13px', fontWeight: 600, borderRadius: '9px',
                  cursor: 'pointer', border: 'none',
                  background: activeTab === tab ? '#0F6E56' : 'transparent',
                  color: activeTab === tab ? '#fff' : '#6b8c7e',
                  boxShadow: activeTab === tab ? '0 2px 8px rgba(15,110,86,0.25)' : 'none',
                  fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                  minHeight: '36px', display: 'block',
                }}
              >
                {tab === 'entrar' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {/* ── LOGIN FORM ── */}
          {activeTab === 'entrar' && (
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a2e26', letterSpacing: '-0.3px', marginBottom: '4px' }}>
                Bem-vindo de volta
              </div>
              <div style={{ fontSize: '13px', color: '#6b8c7e', marginBottom: callbackError ? '12px' : '24px' }}>
                Acesse seu painel financeiro
              </div>
              {callbackError && (
                <div style={{ background: '#FEF2F2', border: '0.5px solid #f5c0c0', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', fontSize: '12px', color: '#d05050', fontWeight: 500 }}>
                  {callbackError}
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={fieldLabel}>E-mail</label>
                <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" className="field-input-focus" style={fieldInput}/>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={fieldLabel}>Senha</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="field-input-focus"
                    style={{ ...fieldInput, paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      cursor: 'pointer', border: 'none', background: 'transparent',
                      padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '28px', height: '28px', minHeight: 'unset', minWidth: 'unset',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <ellipse cx="9" cy="9" rx="7" ry="4.5" stroke="#9abaa8" strokeWidth="1.3"/>
                      <circle cx="9" cy="9" r="2" fill="#9abaa8"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div onClick={() => setRememberMe(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '5px',
                    border: rememberMe ? 'none' : '1.5px solid #dae5de',
                    background: rememberMe ? '#0F6E56' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.15s',
                  }}>
                    {rememberMe && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '13px', color: '#5a7a6e', fontWeight: 500 }}>Lembrar de mim</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F6E56', cursor: 'pointer' }}>
                  Esqueci a senha
                </span>
              </div>

              {loginErroMsg && (
                <div style={{ background: '#FEF2F2', border: '0.5px solid #f5c0c0', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#d05050', fontWeight: 500 }}>
                  {loginErroMsg}
                </div>
              )}
              <button
                className="btn-primary-active"
                onClick={handleLogin}
                disabled={loginCarregando}
                style={{ ...btnPrimary, marginBottom: '14px', opacity: loginCarregando ? 0.7 : 1 }}
              >
                {loginCarregando ? 'Entrando…' : 'Entrar'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ flex: 1, height: '0.5px', background: '#dae5de' }}/>
                <span style={{ fontSize: '12px', color: '#9abaa8', whiteSpace: 'nowrap' }}>ou continue com</span>
                <div style={{ flex: 1, height: '0.5px', background: '#dae5de' }}/>
              </div>

              <button className="btn-google-hover" style={{
                width: '100%', padding: '13px', background: '#fff',
                border: '1px solid #dae5de', borderRadius: '12px',
                fontSize: '14px', fontWeight: 500, fontFamily: 'Inter, sans-serif',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '10px', color: '#3d5c50',
                marginBottom: '20px', minHeight: '44px',
              }}>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.5 33.5 30 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l6.1-6.1C34.4 5.9 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.5-8 19.5-20 0-1.3-.1-2.7-.5-4z"/>
                </svg>
                Continuar com Google
              </button>

              <div style={{ textAlign: 'center', fontSize: '13px', color: '#8aaa9a' }}>
                Não tem conta?{' '}
                <span onClick={() => setActiveTab('criar')} style={{ color: '#0F6E56', fontWeight: 600, cursor: 'pointer' }}>
                  Criar conta grátis
                </span>
              </div>
            </div>
          )}

          {/* ── CADASTRO FORM ── */}
          {activeTab === 'criar' && (
            <div>
              {/* Step dots */}
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '20px' }}>
                {[1, 2, 3].map((s) => (
                  <div key={s} style={{
                    height: '8px', borderRadius: s === step ? '4px' : '50%',
                    width: s === step ? '24px' : '8px',
                    background: s === step ? '#0F6E56' : s < step ? '#9FE1CB' : '#dae5de',
                    transition: 'all 0.2s',
                  }}/>
                ))}
              </div>
              <div style={{
                textAlign: 'center', fontSize: '10px', fontWeight: 600, color: '#8aaa9a',
                letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '16px',
              }}>
                {STEP_LABELS[step - 1]}
              </div>

              {/* STEP 1 — Dados pessoais */}
              {step === 1 && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '0' }}>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={fieldLabel}>Nome</label>
                      <input type="text" placeholder="João" value={nome} onChange={(e) => setNome(e.target.value)} className="field-input-focus" style={fieldInput}/>
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={fieldLabel}>Sobrenome</label>
                      <input type="text" placeholder="Silva" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} className="field-input-focus" style={fieldInput}/>
                    </div>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={fieldLabel}>E-mail</label>
                    <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" className="field-input-focus" style={fieldInput}/>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={fieldLabel}>Senha</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        placeholder="Mín. 8 caracteres"
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        className="field-input-focus"
                        style={{ ...fieldInput, paddingRight: '44px' }}
                      />
                      <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <ellipse cx="9" cy="9" rx="7" ry="4.5" stroke="#9abaa8" strokeWidth="1.3"/>
                          <circle cx="9" cy="9" r="2" fill="#9abaa8"/>
                        </svg>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{
                          flex: 1, height: '3px', borderRadius: '2px',
                          background: i <= passwordStrength ? strColor : '#dae5de',
                          transition: 'background 0.2s',
                        }}/>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={fieldLabel}>Confirmar senha</label>
                    <input type="password" placeholder="••••••••" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className="field-input-focus" style={fieldInput}/>
                  </div>
                  <button className="btn-primary-active" onClick={() => setStep(2)} style={{ ...btnPrimary, marginBottom: '14px' }}>
                    Continuar →
                  </button>
                  <div style={{ textAlign: 'center', fontSize: '13px', color: '#8aaa9a' }}>
                    Já tem conta?{' '}
                    <span onClick={() => setActiveTab('entrar')} style={{ color: '#0F6E56', fontWeight: 600, cursor: 'pointer' }}>Entrar</span>
                  </div>
                </div>
              )}

              {/* STEP 2 — Open Finance */}
              {step === 2 && (
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a2e26', letterSpacing: '-0.3px', marginBottom: '4px' }}>
                    Open Finance
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b8c7e', marginBottom: '16px' }}>
                    Conecte seus bancos com segurança
                  </div>
                  {BANKS.map((bank) => {
                    const isConnected = connectedBanks.has(bank.id);
                    const isConnecting = connectingBanks.has(bank.id);
                    return (
                      <div key={bank.id} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px',
                        border: `1px solid ${isConnected ? '#0F6E56' : '#dae5de'}`,
                        borderRadius: '10px', marginBottom: '8px', background: '#fff',
                        transition: 'border-color 0.2s',
                      }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: bank.color, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '12px', fontWeight: 800,
                          color: '#fff', flexShrink: 0,
                        }}>
                          {bank.initial}
                        </div>
                        <div style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#1a2e26' }}>
                          {bank.name}
                        </div>
                        <button
                          onClick={() => handleConnect(bank.id)}
                          disabled={isConnected || isConnecting}
                          style={{
                            padding: '6px 14px',
                            background: isConnected ? '#edf6f1' : isConnecting ? '#9FE1CB' : '#0F6E56',
                            color: isConnected ? '#0F6E56' : isConnecting ? '#085041' : '#fff',
                            border: 'none', borderRadius: '8px',
                            fontSize: '11px', fontWeight: 700,
                            fontFamily: 'Inter, sans-serif',
                            cursor: isConnected || isConnecting ? 'default' : 'pointer',
                            minHeight: 'unset', minWidth: 'unset',
                            display: 'inline-block',
                            transition: 'all 0.2s',
                          }}
                        >
                          {isConnected ? '✓ Conectado' : isConnecting ? '...' : 'Conectar'}
                        </button>
                      </div>
                    );
                  })}
                  <div style={{
                    background: '#edf6f1', border: '0.5px solid #b5d4c8',
                    borderRadius: '10px', padding: '10px 12px', marginBottom: '16px',
                    display: 'flex', gap: '8px', alignItems: 'flex-start',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                      <path d="M7 1L1.5 3v3C1.5 9.5 4 11.5 7 12c3-.5 5.5-2.5 5.5-6V3L7 1z" stroke="#0F6E56" strokeWidth="1"/>
                    </svg>
                    <span style={{ fontSize: '11px', color: '#3d5c50', lineHeight: 1.5 }}>
                      Autorização via app do banco. Nunca solicitamos sua senha bancária. Regulado pelo Banco Central.
                    </span>
                  </div>
                  <button
                    className="btn-primary-active"
                    onClick={() => setStep(3)}
                    disabled={connectedBanks.size === 0}
                    style={{ ...btnPrimary, marginBottom: '10px', opacity: connectedBanks.size > 0 ? 1 : 0.4 }}
                  >
                    Continuar →
                  </button>
                  <button onClick={() => setStep(1)} style={btnOutline}>← Voltar</button>
                </div>
              )}

              {/* STEP 3 — Perfil */}
              {step === 3 && aguardandoEmail && (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📧</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a2e26', marginBottom: '8px' }}>
                    Confirme seu e-mail
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b8c7e', lineHeight: 1.6, marginBottom: '20px' }}>
                    Enviamos um link de confirmação para<br/>
                    <strong style={{ color: '#1a2e26' }}>{email}</strong>.<br/>
                    Clique no link para ativar sua conta.
                  </div>
                  <button
                    onClick={() => { setAguardandoEmail(false); setActiveTab('entrar'); }}
                    style={{ ...btnPrimary }}
                  >
                    Ir para o login
                  </button>
                </div>
              )}

              {step === 3 && !aguardandoEmail && (
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a2e26', letterSpacing: '-0.3px', marginBottom: '4px' }}>
                    Quase lá!
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b8c7e', marginBottom: '16px' }}>
                    Personalize seu perfil
                  </div>
                  <div style={{ marginBottom: '12px', fontSize: '10px', fontWeight: 600, color: '#6b8c7e', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Avatar
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    {AVATARS.map((av, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedAvatar(i)}
                        style={{
                          width: '44px', height: '44px', borderRadius: '50%',
                          background: selectedAvatar === i ? '#edf6f1' : '#f4f6f4',
                          border: `2px solid ${selectedAvatar === i ? '#0F6E56' : 'transparent'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '22px', cursor: 'pointer', transition: 'all 0.15s',
                          flexShrink: 0,
                        }}
                      >
                        {av}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={fieldLabel}>Renda mensal aproximada</label>
                    <input type="text" placeholder="Ex: R$ 5.000" inputMode="numeric" className="field-input-focus" style={fieldInput}/>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={fieldLabel}>Objetivo principal</label>
                    <select className="field-input-focus" style={fieldInput}>
                      <option>Controlar gastos</option>
                      <option>Guardar dinheiro</option>
                      <option>Pagar dívidas</option>
                      <option>Planejar investimentos</option>
                      <option>Organizar finanças</option>
                    </select>
                  </div>
                  {erroMsg && (
                    <div style={{ background: '#FEF2F2', border: '0.5px solid #f5c0c0', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '12px', color: '#d05050', fontWeight: 500 }}>
                      {erroMsg}
                    </div>
                  )}
                  <button
                    className="btn-primary-active"
                    onClick={handleCriarConta}
                    disabled={carregando}
                    style={{ ...btnPrimary, marginBottom: '10px', opacity: carregando ? 0.7 : 1 }}
                  >
                    {carregando ? 'Criando conta…' : 'Criar minha conta'}
                  </button>
                  <button onClick={() => setStep(2)} style={btnOutline}>← Voltar</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM BAR */}
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: '390px', height: '52px',
          background: '#fff', borderTop: '0.5px solid #dae5de',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="animate-pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0F6E56' }}/>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#085041' }}>Open Finance ativo</span>
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '2px 6px', borderRadius: '5px',
              background: '#edf6f1', color: '#0F6E56', border: '0.5px solid #b5d4c8',
            }}>
              BACEN
            </span>
          </div>
          <span style={{ fontSize: '10px', color: '#8aaa9a' }}>Dados protegidos</span>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
