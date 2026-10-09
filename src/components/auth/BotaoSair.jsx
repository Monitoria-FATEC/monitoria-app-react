import { useNavigate } from 'react-router-dom'

import { limparSessao } from '../../services/authStorage'

// Encerra a sessão (apaga o token do navegador) e volta para o login.
export default function BotaoSair({ className = '' }) {
  const navigate = useNavigate()

  function sair() {
    limparSessao()
    navigate('/entrar', { replace: true })
  }

  return (
    <button
      type="button"
      onClick={sair}
      className={`flex gap-2 w-full rounded-lg border border-[#d5e2d2] bg-white/60 px-3 py-2 text-left text-sm font-semibold text-[#a34d46] transition hover:bg-white cursor-pointer ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out preview-icon"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
      Sair
    </button>
  )
}