import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../assets/img/logo/logo.png'
import BotaoSair from './auth/BotaoSair'
import ModalSair from './auth/ModalSair'

function itemClass(ativo) {
  return `flex w-full items-center gap-2 rounded-lg p-2 text-left transition-all cursor-pointer ${
    ativo ? 'bg-white font-bold text-[#2E4D42] shadow-md' : 'text-[#7E8B81] hover:bg-white/60'
  }`
}

// Botão hambúrguer do cabeçalho. Só aparece no celular.
// controla: o id do SidebarMenu que ele abre.
export function BotaoAbrirMenu({ aberto, onAbrir, botaoRef, controla }) {
  return (
    <button
      ref={botaoRef}
      type="button"
      onClick={onAbrir}
      aria-label="Abrir menu"
      aria-expanded={aberto}
      aria-controls={controla}
      className="-ml-2 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#2E4039] transition hover:bg-white/60 md:hidden"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>
    </button>
  )
}

// Menu lateral do supervisor e do monitor. No celular é uma gaveta aberta pelo
// BotaoAbrirMenu; do md (768px) em diante fica sempre visível.
// O estado da gaveta vem do hook useMenuLateral.
//
// itens: [{ id, label, icon, ... }], e cada item é:
//   - um link de rota, se tiver `to` (e `end`, opcional) -> supervisor;
//   - um botão de aba, se tiver `onClick` e `ativo`       -> monitor.
// usuario (opcional): { nome, email }, mostrado no rodapé.
export default function SidebarMenu({ id, label, itens, aberto, onFechar, botaoFecharRef, usuario }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div
        onClick={onFechar}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-all duration-300 motion-reduce:transition-none md:hidden ${aberto ? 'visible opacity-100' : 'invisible opacity-0'}`}
      />

      {/* Ao abrir, a visibilidade muda na hora (sem transição) para o foco poder entrar na gaveta. */}
      <aside
        id={id}
        aria-label={label}
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] shrink-0 flex-col overflow-y-auto bg-[#E9F0E5] px-4 py-8 duration-300 motion-reduce:transition-none md:visible md:sticky md:top-0 md:h-screen md:w-48 md:max-w-none md:translate-x-0 lg:w-64 lg:px-6 ${aberto ? 'visible translate-x-0 transition-[translate]' : 'invisible -translate-x-full transition-[translate,visibility]'}`}
      >
        <div className="flex items-center justify-between gap-2">
          <NavLink to="/" className="inline-flex min-w-0 items-center gap-3 text-[#243d38] no-underline">
            <img className="h-14 w-14 object-contain" src={logo} alt="Logo da Monitoria" />
            <span className="flex flex-col leading-tight">
              <strong className="text-lg font-semibold tracking-[-.3px]">MonitoraFatec</strong>
              <small className="mt-1 text-[10px] tracking-[.5px]">MONITORIA ACADÊMICA</small>
            </span>
          </NavLink>

          <button
            ref={botaoFecharRef}
            type="button"
            onClick={onFechar}
            aria-label="Fechar menu"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#2E4039] transition hover:bg-white/60 md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <nav className="mt-8 font-medium text-[#243d38]">
          <ul className="space-y-4">
            {itens.map((item) => (
              <li key={item.id}>
                {item.to ? (
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onFechar}
                    className={({ isActive }) => itemClass(isActive)}
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ) : (
                  <button
                    type="button"
                    aria-current={item.ativo ? 'page' : undefined}
                    onClick={() => {
                      item.onClick()
                      onFechar()
                    }}
                    className={itemClass(item.ativo)}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto border-t border-[#d5e2d2] pt-5 text-sm">
          {usuario && (
            <div className="mb-4">
              <p className="mb-1 text-xs text-[#7E8B81]">Sessão ativa</p>
              <p className="truncate font-semibold text-[#243d38]">{usuario.nome}</p>
              <p className="truncate text-xs text-[#7E8B81]">{usuario.email}</p>
            </div>
          )}
          <BotaoSair onClick={() => setModalOpen(true)} />
        </div>
      </aside>

      <ModalSair aberto={modalOpen} onCancelar={() => setModalOpen(false)} />
    </>
  )
}