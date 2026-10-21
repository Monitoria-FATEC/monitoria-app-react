import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { lerSessaoValida, limparSessao } from '../../services/authStorage'

// Rótulo e cor da bolinha para cada perfil.
const PERFIS = {
  MONITOR: { rotulo: 'Monitor', cor: 'bg-[#315c50]' },
  SUPERVISOR: { rotulo: 'Supervisor', cor: 'bg-[#8a5a2b]' },
  ADMIN: { rotulo: 'Administrador', cor: 'bg-[#5b4a8a]' },
  GESTAO: { rotulo: 'Gestão', cor: 'bg-[#2b6a8a]' },
}

const PERFIL_PADRAO = { rotulo: 'Usuário', cor: 'bg-[#68766e]' }

// Bolinha com a inicial do nome. Ao clicar, abre o menu com os dados da conta,
// o atalho para a página inicial e o botão Sair.
export default function MenuUsuario() {
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)
  const raiz = useRef(null)

  const usuario = lerSessaoValida()?.usuario
  const nome = usuario?.nome?.trim() || 'Minha conta'
  const email = usuario?.email || ''
  const perfil = PERFIS[usuario?.role] ?? PERFIL_PADRAO
  const inicial = nome.charAt(0).toUpperCase()

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!aberto) return undefined

    function aoClicarFora(event) {
      if (raiz.current && !raiz.current.contains(event.target)) {
        setAberto(false)
      }
    }

    function aoPressionar(event) {
      if (event.key === 'Escape') setAberto(false)
    }

    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoPressionar)

    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoPressionar)
    }
  }, [aberto])

  function sair() {
    limparSessao()
    navigate('/entrar', { replace: true })
  }

  return (
    <div className="relative" ref={raiz}>
      <button
        type="button"
        onClick={() => setAberto((valor) => !valor)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={`Menu da conta de ${nome}`}
        className="flex cursor-pointer items-center gap-3 rounded-full border-0 bg-transparent p-0"
      >
        <span className="hidden flex-col items-end leading-tight sm:flex">
          <span className="max-w-40 truncate text-sm font-semibold text-[#243d38]">
            {nome}
          </span>
          <span className="text-xs text-[#68766e]">{perfil.rotulo}</span>
        </span>

        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${perfil.cor}`}
          aria-hidden="true"
        >
          {inicial}
        </span>
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-[#d5e2d2] bg-white p-4 shadow-lg"
        >
          <p className="m-0 truncate text-sm font-bold text-[#243d38]">{nome}</p>
          {email && (
            <p className="m-0 mt-0.5 truncate text-xs text-[#68766e]">{email}</p>
          )}

          <span className="mt-2 inline-block rounded-full bg-[#edf4ed] px-2.5 py-1 text-[11px] font-bold text-[#315c50]">
            {perfil.rotulo}
          </span>

          <Link
            to="/"
            role="menuitem"
            onClick={() => setAberto(false)}
            className="mt-4 block w-full rounded-lg border border-[#d5e2d2] bg-white px-3 py-2 text-left text-sm font-semibold text-[#243d38] no-underline transition hover:bg-[#edf4ed]"
          >
            Página inicial
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={sair}
            className="mt-2 w-full cursor-pointer rounded-lg border border-[#e9c9c5] bg-white px-3 py-2 text-left text-sm font-semibold text-[#a34d46] transition hover:bg-[#fce8e5]"
          >
            Sair da conta
          </button>
        </div>
      )}
    </div>
  )
}