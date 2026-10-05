import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  autenticarMonitor,
  cadastrarConta,
  cadastrarMonitor,
} from '../../api/monitorApi'
import { salvarSessao } from '../../services/authStorage'
import { cursosFatecZonaLeste } from '../../data/cursosFatecZonaLeste'

const formularioInicial = {
  nome: '',
  ra: '',
  email: '',
  curso: '',
  senha: '',
}

const campoClassName =
  'w-full rounded-[9px] border border-[#d7e0d6] bg-[#fbfcfa] px-3.5 py-3 text-[13px] text-[#243d38] outline-none placeholder:text-[#a2ada5] focus:border-[#769c8d] focus:ring-4 focus:ring-[#769c8d]/15'

export default function MonitorSignupForm() {
  const navigate = useNavigate()
  const [formulario, setFormulario] = useState(formularioInicial)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  function handleChange(event) {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [event.target.name]: event.target.value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setEnviando(true)
    setErro(null)

    // A senha só vai para a criação da conta: nunca para /monitores
    // nem para o state da navegação.
    const { senha, ...dadosMonitor } = formulario

    try {
      await cadastrarConta({
        nome: dadosMonitor.nome,
        email: dadosMonitor.email,
        senha,
      })
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        setErro(
          'Este e-mail já possui conta. Entre com ela ou use outro e-mail.'
        )
      } else {
        setErro(
          'Não foi possível criar sua conta. Confira os dados e tente novamente.'
        )
      }

      console.error(requestError)
      setEnviando(false)
      return
    }

    // Entra automaticamente com a conta recém-criada (não bloqueia o fluxo se falhar).
    try {
      const resposta = await autenticarMonitor({
        email: dadosMonitor.email,
        senha,
      })

      salvarSessao({ token: resposta.token, usuario: resposta.usuario })
    } catch (requestError) {
      console.error(requestError)
    }

    try {
      const monitor = await cadastrarMonitor(dadosMonitor)

      navigate('/cadastro/termo', {
        state: { ...dadosMonitor, idMonitor: monitor?.id },
      })
    } catch (requestError) {
      setErro(
        'Sua conta foi criada, mas não foi possível concluir o cadastro. Tente novamente em instantes ou entre com seu e-mail e senha.'
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
          Nome completo
        </span>

        <input
          className={campoClassName}
          type="text"
          name="nome"
          value={formulario.nome}
          onChange={handleChange}
          required
          placeholder="Como podemos te chamar?"
        />
      </label>

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
        <span className="text-xs font-bold text-[#39544c]">
          RA
        </span>

        <input
          className={campoClassName}
          type="text"
          name="ra"
          value={formulario.ra}
          onChange={handleChange}
          required
          placeholder="Seu registro acadêmico"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-bold text-[#39544c]">
          Curso
        </span>

        <select
          className={campoClassName}
          name="curso"
          value={formulario.curso}
          onChange={handleChange}
          required
        >
          <option value="">Selecione seu curso</option>

          {cursosFatecZonaLeste.map((curso) => (
            <option key={curso} value={curso}>
              {curso}
            </option>
          ))}
        </select>
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
          minLength={6}
          autoComplete="new-password"
          placeholder="Mínimo de 6 caracteres"
        />
      </label>

      <button
        className="flex items-center justify-between rounded-[9px] border-0 bg-[#0d3524] px-4.25 py-3.75 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#315c50] disabled:cursor-wait disabled:opacity-60"
        type="submit"
        disabled={enviando}
      >
        {enviando ? 'Enviando...' : 'Continuar'}

        <span aria-hidden="true">→</span>
      </button>

      {erro && (
        <p className="m-0 text-xs text-[#a34d46]" role="alert">
          {erro}
        </p>
      )}
    </form>
  )
}