"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

const bancos = [
  { id:'santander', name:'Santander', color:'#CC0000', status:'ativo',     expira:'11 meses' },
  { id:'nubank',    name:'Nubank',    color:'#820AD1', status:'ativo',     expira:'8 meses'  },
  { id:'inter',     name:'Inter',     color:'#FF7A00', status:'expirando', expira:'28 dias'  },
  { id:'bradesco',  name:'Bradesco',  color:'#CC092F', status:'ativo',     expira:'10 meses' },
  { id:'itau',      name:'Itaú',      color:'#003399', status:'ativo',     expira:'6 meses'  },
];

const objetivos = [
  { icon:'🎯', label:'Controlar gastos'        },
  { icon:'💰', label:'Guardar dinheiro'         },
  { icon:'📉', label:'Pagar dívidas'            },
  { icon:'📈', label:'Planejar investimentos'   },
  { icon:'📊', label:'Organizar finanças'       },
];

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div onClick={e => { e.stopPropagation(); onToggle(); }}
      className="relative w-9 h-5 rounded-full cursor-pointer flex-shrink-0 transition-all"
      style={{ background: on ? '#0F6E56' : '#d1d5db' }}>
      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
        style={{ left: on ? '18px' : '2px' }}/>
    </div>
  );
}

function MenuItem({ icon, iconBg, name, desc, right, onClick }: {
  icon: string; iconBg: string; name: string; desc?: string;
  right?: React.ReactNode; onClick?: () => void;
}) {
  return (
    <div onClick={onClick}
      className="flex items-center gap-3 px-3.5 py-3 border-b border-gray-50 last:border-0 cursor-pointer active:bg-gray-50 transition-colors">
      <div className="w-8 h-8 rounded-[9px] flex items-center justify-center text-base flex-shrink-0"
        style={{ background: iconBg }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-gray-800">{name}</p>
        {desc && <p className="text-[12px] text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">{right}</div>
    </div>
  );
}

function ModalShell({ open, onClose, title, danger, children }: {
  open: boolean; onClose: () => void; title: string; danger?: boolean; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-[430px] rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mt-2.5 mb-0"/>
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
          <h3 className="text-[17px] font-bold" style={{ color: danger ? '#d05050' : '#1a2e26' }}>{title}</h3>
          <button onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[13px] text-gray-500">✕</button>
        </div>
        <div className="px-4 pb-6 pt-1">{children}</div>
      </div>
    </div>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <label className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[16px] font-medium text-gray-800 bg-gray-50 focus:outline-none focus:border-[#0F6E56]";

function PrimaryBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="w-full py-2.5 rounded-lg text-[16px] font-bold text-white mt-3" style={{ background:'#0F6E56' }}>
      {children}
    </button>
  );
}

function GhostBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="w-full py-2.5 rounded-lg text-[15px] font-medium text-gray-500 mt-2 border border-gray-200">
      {children}
    </button>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const { user } = useApp();

  const [modal,    setModal]    = useState<string | null>(null);
  const [nome,     setNome]     = useState(user.name);
  const [email,    setEmail]    = useState(user.email);
  const [telefone, setTelefone] = useState(user.phone ?? '(11) 99999-9999');
  const [renda,    setRenda]    = useState(8500);
  const [objetivo, setObjetivo] = useState('Controlar gastos');
  const [toggles,  setToggles]  = useState({ darkMode:false, notificacoes:true, biometria:true });
  const [toast,    setToast]    = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null);
  const [tempEmoji,   setTempEmoji]   = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('avatarEmoji');
    if (saved) setAvatarEmoji(saved);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  function togglePref(key: keyof typeof toggles) {
    setToggles(prev => {
      const next = { ...prev, [key]: !prev[key] };
      showToast(next[key] ? '✓ Ativado' : '✗ Desativado');
      return next;
    });
  }

  const initials = nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 overflow-y-auto pb-14 bg-gray-50">

        {/* HEADER GRADIENTE */}
        <div className="relative overflow-hidden px-4 pt-5 pb-7"
          style={{ background:'linear-gradient(160deg,#0F6E56 0%,#085041 100%)' }}>
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full" style={{ background:'rgba(255,255,255,0.05)' }}/>
          <div className="absolute right-8 top-8 w-16 h-16 rounded-full"  style={{ background:'rgba(255,255,255,0.05)' }}/>

          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1.5 mb-4 relative z-10">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[14px] font-medium" style={{ color:'rgba(255,255,255,0.7)' }}>Dashboard</span>
          </button>

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="relative cursor-pointer flex-shrink-0" onClick={() => { setTempEmoji(avatarEmoji); setModal('avatar'); }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.3)', color: avatarEmoji ? 'inherit' : 'white', fontSize: avatarEmoji ? '30px' : undefined }}>
                {avatarEmoji ?? <span className="text-white text-2xl font-bold">{initials}</span>}
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                style={{ border:'2px solid #085041' }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M7 1.5l1.5 1.5-5.5 5.5H1.5V7L7 1.5z" stroke="#0F6E56" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[22px] font-bold text-white tracking-tight leading-tight truncate">{nome}</p>
              <p className="text-[14px] truncate" style={{ color:'rgba(255,255,255,0.6)' }}>{email}</p>
              <p className="text-[13px] mt-0.5" style={{ color:'rgba(255,255,255,0.5)' }}>Membro desde maio 2026</p>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 bg-white" style={{ borderBottom:'0.5px solid #f3f4f6' }}>
          {[
            { value:`${bancos.length}`, label:'Bancos',   green:true  },
            { value:'R$87k',            label:'Investido', green:false },
            { value:'+7,7%',            label:'Rentab.',   green:true  },
          ].map((s, i) => (
            <div key={i} className="py-3 text-center"
              style={{ borderRight: i < 2 ? '0.5px solid #f3f4f6' : 'none' }}>
              <p className="text-[18px] font-bold tracking-tight" style={{ color: s.green ? '#0F6E56' : '#1a2e26' }}>{s.value}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="px-3.5 pb-4">

          {/* MINHA CONTA */}
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-3.5 mb-1.5">Minha conta</p>
          <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden mb-2.5">
            <MenuItem icon="🧑" iconBg="#edf6f1" name="Dados pessoais"      desc="Nome, e-mail, telefone"                right={<Arrow/>} onClick={() => setModal('editPerfil')}/>
            <MenuItem icon="🔒" iconBg="#edf6f1" name="Alterar senha"       desc="Última alteração há 30 dias"           right={<Arrow/>} onClick={() => setModal('senha')}/>
            <MenuItem icon="🎯" iconBg="#edf6f1" name="Objetivo financeiro" desc={objetivo}                              right={<Arrow/>} onClick={() => setModal('objetivo')}/>
            <MenuItem icon="💰" iconBg="#edf6f1" name="Renda mensal"        desc="Usada para cálculos de orçamento"
              right={<><span className="text-[13px] font-semibold text-gray-400 mr-1">{formatCurrency(renda)}</span><Arrow/></>}
              onClick={() => setModal('renda')}/>
          </div>

          {/* OPEN FINANCE */}
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-3.5 mb-1.5">Conexões Open Finance</p>
          <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden mb-2.5">
            {bancos.map((banco, i) => (
              <div key={banco.id} className="flex items-center gap-2.5 px-3.5 py-2.5"
                style={{ borderBottom: i < bancos.length - 1 ? '0.5px solid #f9fafb' : 'none' }}>
                <div className="w-8 h-8 rounded-[7px] flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0"
                  style={{ background: banco.color }}>
                  {banco.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-gray-800">{banco.name}</p>
                </div>
                <div className="text-right flex-shrink-0 mr-1">
                  <p className="text-[12px] font-medium flex items-center gap-1 justify-end"
                    style={{ color: banco.status === 'ativo' ? '#0F6E56' : '#BA7517' }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ background: banco.status === 'ativo' ? '#0F6E56' : '#BA7517' }}/>
                    {banco.status === 'ativo' ? 'Ativo' : 'Expirando'}
                  </p>
                  <p className="text-[11px]"
                    style={{ color: banco.status === 'ativo' ? '#9ca3af' : '#BA7517', fontWeight: banco.status === 'expirando' ? 500 : 400 }}>
                    {banco.status === 'ativo' ? `Expira em ${banco.expira}` : `Renovar em ${banco.expira}`}
                  </p>
                </div>
                {banco.status === 'expirando'
                  ? <button onClick={() => showToast('✓ Renovação iniciada')}
                      className="px-2.5 py-1 rounded-lg text-white text-[12px] font-bold flex-shrink-0"
                      style={{ background:'#0F6E56' }}>Renovar</button>
                  : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 cursor-pointer"
                      onClick={() => showToast(`Gerenciar ${banco.name}`)}>
                      <circle cx="7" cy="7" r="6" stroke="#e5e7eb" strokeWidth="1"/>
                      <path d="M5 7l2 2 2-3" stroke="#0F6E56" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                }
              </div>
            ))}
            <div className="flex justify-center py-3 cursor-pointer" onClick={() => showToast('Abrindo conexão Open Finance...')}>
              <span className="text-[14px] font-semibold text-[#0F6E56]">+ Adicionar banco</span>
            </div>
          </div>

          {/* PREFERÊNCIAS */}
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-3.5 mb-1.5">Preferências</p>
          <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden mb-2.5">
            <MenuItem icon="🌙" iconBg="#EFF6FF" name="Modo escuro"         desc="Tema escuro no app"          right={<Toggle on={toggles.darkMode}     onToggle={() => togglePref('darkMode')}/>}/>
            <MenuItem icon="🔔" iconBg="#edf6f1" name="Notificações push"   desc="Alertas no celular"          right={<Toggle on={toggles.notificacoes} onToggle={() => togglePref('notificacoes')}/>}/>
            <MenuItem icon="👆" iconBg="#FAEEDA" name="Biometria / Face ID" desc="Entrar com digital ou rosto" right={<Toggle on={toggles.biometria}    onToggle={() => togglePref('biometria')}/>}/>
            <MenuItem icon="💱" iconBg="#edf6f1" name="Moeda padrão"        desc="Real brasileiro"
              right={<><span className="text-[13px] font-semibold text-gray-400 mr-1">BRL R$</span><Arrow/></>}
              onClick={() => showToast('Moeda: BRL R$')}/>
          </div>

          {/* SEGURANÇA */}
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-3.5 mb-1.5">Segurança e privacidade</p>
          <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden mb-2.5">
            <MenuItem icon="🛡️" iconBg="#edf6f1" name="Autenticação 2 fatores" desc="SMS ou app autenticador"
              right={<><span className="text-[11px] font-bold px-1.5 py-0.5 rounded-lg bg-[#edf6f1] text-[#0F6E56] mr-1">Ativo</span><Arrow/></>}
              onClick={() => showToast('Configurar autenticação 2 fatores')}/>
            <MenuItem icon="📄" iconBg="#EFF6FF" name="Política de privacidade" desc="Como seus dados são usados"    right={<Arrow/>} onClick={() => showToast('Abrindo política de privacidade...')}/>
            <MenuItem icon="📋" iconBg="#EFF6FF" name="Termos de uso"           desc="Atualizado em jan/2026"         right={<Arrow/>} onClick={() => showToast('Abrindo termos de uso...')}/>
            <MenuItem icon="📤" iconBg="#FAEEDA" name="Exportar meus dados"     desc="LGPD — receba tudo por e-mail"  right={<Arrow/>} onClick={() => showToast('Exportando seus dados...')}/>
          </div>

          {/* CONTA */}
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-3.5 mb-1.5">Conta</p>
          <button onClick={async () => { await createClient().auth.signOut(); router.push('/login'); }}
            className="w-full py-2.5 mb-2 rounded-xl flex items-center justify-center gap-1.5 text-[15px] font-semibold text-[#d05050] bg-white border border-[#f5c0c0] shadow-sm">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3M10 11l3-3.5L10 4M13 7.5H6" stroke="#d05050" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sair da conta
          </button>
          <button onClick={() => setModal('deletar')}
            className="w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[15px] font-semibold text-white shadow-sm"
            style={{ background:'#d05050' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 4h11M5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M12 4l-.8 8a1 1 0 01-1 .9H4.8a1 1 0 01-1-.9L3 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Excluir minha conta
          </button>
        </div>
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

      {/* MODAL — AVATAR */}
      <ModalShell open={modal === 'avatar'} onClose={() => setModal(null)} title="Escolher avatar">
        <div className="grid grid-cols-5 gap-3 mt-3">
          {['😊','😎','🤩','🐶','👩‍💻','🦁','🐯','🦊','🐧','🚀','🎯','💎','🌟','🔥','⚡'].map(emoji => (
            <button key={emoji} onClick={() => setTempEmoji(emoji)}
              className="aspect-square rounded-full flex items-center justify-center text-2xl transition-all"
              style={tempEmoji === emoji
                ? { background:'#edf6f1', border:'2px solid #0F6E56' }
                : { background:'#f3f4f6', border:'2px solid transparent' }}>
              {emoji}
            </button>
          ))}
        </div>
        {avatarEmoji && (
          <button onClick={() => { setAvatarEmoji(null); setTempEmoji(null); localStorage.removeItem('avatarEmoji'); setModal(null); showToast('Avatar redefinido'); }}
            className="w-full py-2 mt-3 text-[14px] font-medium text-gray-400 border border-gray-200 rounded-lg">
            Usar iniciais ({initials})
          </button>
        )}
        <PrimaryBtn onClick={() => {
          if (tempEmoji) {
            setAvatarEmoji(tempEmoji);
            localStorage.setItem('avatarEmoji', tempEmoji);
          }
          setModal(null);
          showToast('✓ Avatar atualizado!');
        }}>Salvar avatar</PrimaryBtn>
      </ModalShell>

      {/* MODAL — EDITAR PERFIL */}
      <ModalShell open={modal === 'editPerfil'} onClose={() => setModal(null)} title="Editar perfil">
        <ModalField label="Nome completo">
          <input value={nome} onChange={e => setNome(e.target.value)} className={inputCls}/>
        </ModalField>
        <ModalField label="E-mail">
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" className={inputCls}/>
        </ModalField>
        <ModalField label="Telefone">
          <input value={telefone} onChange={e => setTelefone(e.target.value)} type="tel" className={inputCls}/>
        </ModalField>
        <PrimaryBtn onClick={() => { setModal(null); showToast('✓ Perfil atualizado com sucesso!'); }}>Salvar alterações</PrimaryBtn>
        <GhostBtn onClick={() => setModal(null)}>Cancelar</GhostBtn>
      </ModalShell>

      {/* MODAL — ALTERAR SENHA */}
      <ModalShell open={modal === 'senha'} onClose={() => setModal(null)} title="Alterar senha">
        {['Senha atual', 'Nova senha', 'Confirmar nova senha'].map(label => (
          <ModalField key={label} label={label}>
            <input type="password" placeholder="••••••••" className={inputCls}/>
          </ModalField>
        ))}
        <PrimaryBtn onClick={() => { setModal(null); showToast('✓ Senha alterada com sucesso!'); }}>Alterar senha</PrimaryBtn>
        <GhostBtn onClick={() => setModal(null)}>Cancelar</GhostBtn>
      </ModalShell>

      {/* MODAL — OBJETIVO */}
      <ModalShell open={modal === 'objetivo'} onClose={() => setModal(null)} title="Objetivo financeiro">
        <div className="mt-2 space-y-2">
          {objetivos.map(o => (
            <div key={o.label} onClick={() => setObjetivo(o.label)}
              className="flex items-center gap-2.5 p-3 rounded-xl cursor-pointer transition-all"
              style={objetivo === o.label
                ? { background:'#edf6f1', border:'0.5px solid #0F6E56' }
                : { background:'#f9fafb', border:'0.5px solid #e5e7eb' }}>
              <span className="text-xl">{o.icon}</span>
              <span className="text-[15px] font-medium" style={{ color: objetivo === o.label ? '#085041' : '#374151' }}>{o.label}</span>
            </div>
          ))}
        </div>
        <PrimaryBtn onClick={() => { setModal(null); showToast('✓ Objetivo atualizado!'); }}>Salvar</PrimaryBtn>
      </ModalShell>

      {/* MODAL — RENDA */}
      <ModalShell open={modal === 'renda'} onClose={() => setModal(null)} title="Renda mensal">
        <ModalField label="Valor aproximado (R$)">
          <input type="number" value={renda} onChange={e => setRenda(Number(e.target.value))}
            inputMode="decimal" className={inputCls}/>
        </ModalField>
        <div className="mt-3 p-3 rounded-xl text-[13px] leading-relaxed"
          style={{ background:'#edf6f1', border:'0.5px solid #b5d4c8', color:'#3d5c50' }}>
          💡 Esse valor é usado para calcular percentuais do orçamento e sugerir metas. Não é compartilhado com nenhum banco.
        </div>
        <PrimaryBtn onClick={() => { setModal(null); showToast('✓ Renda atualizada!'); }}>Salvar</PrimaryBtn>
        <GhostBtn onClick={() => setModal(null)}>Cancelar</GhostBtn>
      </ModalShell>

      {/* MODAL — EXCLUIR CONTA */}
      <ModalShell open={modal === 'deletar'} onClose={() => setModal(null)} title="⚠️ Excluir conta" danger>
        <div className="mt-3 p-3 rounded-xl text-[14px] leading-relaxed"
          style={{ background:'#FEF2F2', border:'0.5px solid #f5c0c0', color:'#7a2020' }}>
          Esta ação é <strong>permanente e irreversível.</strong> Todos os seus dados, histórico e conexões Open Finance serão removidos. Suas informações bancárias nos bancos não são afetadas.
        </div>
        <ModalField label="Digite sua senha para confirmar">
          <input type="password" placeholder="••••••••" className={inputCls} style={{ borderColor:'#f5c0c0' }}/>
        </ModalField>
        <button onClick={() => { setModal(null); showToast('Solicitação enviada — verifique seu e-mail'); }}
          className="w-full py-2.5 rounded-lg text-[16px] font-bold text-white mt-3"
          style={{ background:'#d05050' }}>
          Confirmar exclusão
        </button>
        <GhostBtn onClick={() => setModal(null)}>Cancelar</GhostBtn>
      </ModalShell>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1a2e26] text-white text-[14px] font-medium px-4 py-2 rounded-full whitespace-nowrap shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
