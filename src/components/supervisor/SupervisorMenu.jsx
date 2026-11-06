import { NavLink } from "react-router-dom";
import { supervisorRoutes } from "../../routes/supervisorRoutes";
import BotaoSair from "../auth/BotaoSair";
import logo from '../../assets/img/logo/logo.png'

// No celular é uma gaveta aberta pelo botão do cabeçalho; do md em diante fica sempre visível.
export default function SupervisorMenu({ id, aberto, onFechar, botaoFecharRef }) {

    return(
    <>
      <div
        onClick={onFechar}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-all duration-300 motion-reduce:transition-none md:hidden ${aberto ? "visible opacity-100" : "invisible opacity-0"}`}
      />

      <aside
        // Ao abrir, a visibilidade muda na hora (sem transição) para o foco poder entrar na gaveta.
        id={id}
        aria-label="Menu do supervisor"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] shrink-0 flex-col overflow-y-auto bg-[#E9F0E5] px-4 py-8 duration-300 motion-reduce:transition-none md:visible md:sticky md:top-0 md:h-screen md:w-48 md:max-w-none md:translate-x-0 lg:w-64 lg:px-6 ${aberto ? "visible translate-x-0 transition-[translate]" : "invisible -translate-x-full transition-[translate,visibility]"}`}
      >
        <div className="flex items-center justify-between gap-2">
          <NavLink to="/" className="inline-flex min-w-0 items-center gap-3 text-[#243d38] no-underline">
            <img className="h-14 w-14 object-contain" src={logo} alt="Logo da Monitoria" />
            <span className="flex flex-col leading-tight">
              <strong className="text-lg font-semibold tracking-[-.3px]">Nome do site</strong>
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

        <ul className="mt-8 space-y-4 font-medium text-[#243d38]">
          {supervisorRoutes.map((r) => (
            <li key={r.path ?? 'inicio'}>
              <NavLink
                to={r.index ? '/supervisor' : `/supervisor/${r.path}`}
                end={r.index}
                onClick={onFechar}
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded-lg transition-all ${isActive ? 'font-bold bg-white shadow-md text-[#2E4D42]' : 'bg-none text-[#7E8B81]'}`
                }
              >
                {r.icon}
                {r.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-[#d5e2d2] pt-5">
          <BotaoSair />
        </div>
      </aside>
    </>
    )
}
