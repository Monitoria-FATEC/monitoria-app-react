import { Link } from 'react-router-dom'

import StatusBadge from './StatusBadge'
import MenuUsuario from '../auth/MenuUsuario'

export default function MonitorHeader({ titulo, status }) {
  return (
    <header className="flex w-full items-center justify-between bg-[#E9F0E5] p-6 shadow-2xs">
      <h1 className="mb-2.5 text-3xl font-bold text-[#2E4039]">{titulo}</h1>

      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="hidden text-sm font-medium text-[#315c50] no-underline hover:underline md:inline"
        >
          ← Página inicial
        </Link>
        <StatusBadge status={status} />
        <MenuUsuario />
      </div>
    </header>
  )
}