import { Link } from 'react-router-dom'

import MenuUsuario from './auth/MenuUsuario'

// Cabeçalho dos painéis do supervisor e do monitor.
// botaoMenu: o BotaoAbrirMenu do SidebarMenu (só aparece no celular).
// children: itens extras antes do menu da conta (ex.: o StatusBadge do monitor).
export default function PainelHeader({ titulo, botaoMenu, children }) {
  return (
    <header className="flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-2 bg-[#E9F0E5] p-6 shadow-2xs md:gap-x-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {botaoMenu}
        <h1 className="min-w-0 break-words text-xl font-bold text-[#2E4039] md:mb-2.5 md:text-2xl">{titulo}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Link
          to="/"
          className="hidden text-sm font-medium text-[#315c50] no-underline hover:underline md:inline"
        >
          ← Página inicial
        </Link>
        {children}
        <MenuUsuario />
      </div>
    </header>
  )
}
