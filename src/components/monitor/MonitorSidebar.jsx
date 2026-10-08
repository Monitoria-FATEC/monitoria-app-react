import { NavLink } from 'react-router-dom'

import logo from '../../assets/img/logo/logo.png'

export default function MonitorSidebar({ aba, onChange, nome, email }) {
  const itens = [
    { id: 'visao-geral', label: 'Visão geral' },
    { id: 'perfil', label: 'Meu perfil' },
    { id: 'conta', label: 'Conta e agência' },
  ]

  return (
    <aside className="flex w-full shrink-0 flex-col bg-[#E9F0E5] px-6 py-8 lg:sticky lg:top-0 lg:h-screen lg:w-64">
      <NavLink
        to="/monitor"
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

      <nav className="mt-8 grid gap-2 font-medium">
        {itens.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`block w-full rounded-lg p-2 text-left transition ${
              aba === item.id
                ? 'bg-white font-bold text-[#2E4D42] shadow-md'
                : 'bg-none text-[#7E8B81] hover:bg-white/60'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t border-[#d5e2d2] pt-5 text-sm lg:mt-auto">
        <p className="mb-1 text-xs text-[#7E8B81]">Sessão ativa</p>

        <p className="truncate font-semibold text-[#243d38]">
          {nome}
        </p>

        <p className="truncate text-xs text-[#7E8B81]">
          {email}
        </p>
      </div>
    </aside>
  )
}