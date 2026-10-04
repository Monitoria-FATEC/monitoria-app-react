import { useState } from 'react'

import { autenticarMonitor } from '../../api/monitorApi'

const formularioInicial = {
  email: '',
  senha: '',
}

const campoClassName =
  'w-full rounded-[9px] border border-[#d7e0d6] bg-[#fbfcfa] px-3.5 py-3 text-[13px] text-[#243d38] outline-none placeholder:text-[#a2ada5] focus:border-[#769c8d] focus:ring-4 focus:ring-[#769c8d]/15'

export default function LoginForm() {
  const [formulario, setFormulario] = useState(formularioInicial)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [autenticado, setAutenticado] = useState(false)

  function handleChange(event) {
    setErro(null)
    setAutenticado(false)

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [event.target.name]: event.target.value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setEnviando(true)
    setErro(null)

    try {
      await autenticarMonitor(formulario)

      setAutenticado(true)
    } catch (requestError) {
      setErro(
        'E-mail ou senha incorretos. Confira os dados e tente novamente.'
      )

      console.error(requestError)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="grid gap-4.25" onSubmit={handleSubmit}>
      <label className="grid gap-1.5">
        <span className="text-xs font-bold text-[#39544c]">
          E-mail institucional
        </span>

        <input
          className={campoClassName}
          type="email"
          name="email"
          value={formulario.email}
          onChange={handleChange}
          required
          placeholder="voce@fatec.sp.gov.br"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-bold text-[#39544c]">Senha</span>

        <input
          className={campoClassName}
          type="password"
          name="senha"
          value={formulario.senha}
          onChange={handleChange}
          required
          placeholder="Sua senha"
          minLength={6}
        />
      </label>

      <p className="m-[-2px_0_0] text-[11px] leading-relaxed text-[#88958d]">
        O login com autenticação completa ainda está em desenvolvimento —
        esta tela já está pronta para quando o backend estiver no ar.
      </p>

      <button
        className="flex items-center justify-between rounded-[9px] border-0 bg-[#0d3524] px-4.25 py-3.75 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#315c50] disabled:cursor-wait disabled:opacity-60"
        type="submit"
        disabled={enviando}
      >
        {enviando ? 'Entrando...' : 'Entrar'}

        <span aria-hidden="true">→</span>
      </button>

      {autenticado && (
        <p className="m-0 text-xs text-[#2d7650]" role="status">
          Login realizado com sucesso!
        </p>
      )}

      {erro && (
        <p className="m-0 text-xs text-[#a34d46]" role="alert">
          {erro}
        </p>
      )}
    </form>
  )
}