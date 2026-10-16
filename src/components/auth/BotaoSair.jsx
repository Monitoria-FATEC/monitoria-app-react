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
      className={`w-full rounded-lg border border-[#d5e2d2] bg-white/60 px-3 py-2 text-left text-sm font-semibold text-[#a34d46] transition hover:bg-white ${className}`}
    >
      Sair
    </button>
  )
}