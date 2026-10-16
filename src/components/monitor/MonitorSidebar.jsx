import { NavLink } from 'react-router-dom'

import BotaoSair from '../auth/BotaoSair'
import { abasMonitor } from './abasMonitor'
import logo from '../../assets/img/logo/logo.png'

export default function MonitorSidebar({ aba, onChange, nome, email }) {
  // enquanto edita o termo, o item "Visão geral" continua destacado
  const abaDoMenu = aba === 'termo' ? 'visao-geral' : aba

  return (
    <aside className="flex w-full shrink-0 flex-col bg-[#E9F0E5] px-6 py-8 lg:sticky lg:top-0 lg:h-screen lg:w-64">
      <NavLink
        to="/"
        className="inline-flex items-center gap-3 text-[#243d38] no-underline"
      >
        <img
          className="h-14 w-14 object-contain"
          src={logo}
          alt="Logo da Monitoria"
        />

        <span className="flex flex-col leading-tight">
          <strong className="text-lg font-semibold tracking-[-.3px]">
            Nome do site
          </strong>

          <small className="mt-1 text-[10px] tracking-[.5px]">
            MONITORIA ACADÊMICA
          </small>
        </span>
      </NavLink>

      <nav className="mt-8 grid gap-4 font-medium text-[#243d38]">
        {abasMonitor.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`flex w-full items-center gap-2 rounded-lg p-2 text-left transition-all ${
              abaDoMenu === item.id
                ? 'bg-white font-bold text-[#2E4D42] shadow-md'
                : 'bg-none text-[#7E8B81] hover:bg-white/60'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t border-[#d5e2d2] pt-5 text-sm lg:mt-auto">
        <p className="mb-1 text-xs text-[#7E8B81]">Sessão ativa</p>

        <p className="truncate font-semibold text-[#243d38]">
          {nome}
        </p>

        <p className="mb-4 truncate text-xs text-[#7E8B81]">
          {email}
        </p>

        <BotaoSair />
      </div>
    </aside>
  )
}