import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  autenticarMonitor,
  cadastrarConta,
  cadastrarMonitor,
} from '../../api/monitorApi'
import { salvarSessao } from '../../services/authStorage'
import { cursosFatecZonaLeste } from '../../data/cursosFatecZonaLeste'
import { classeCampo } from '../../utils/estilosFormulario'
import {
  TAMANHO_MINIMO_SENHA,
  focarPrimeiroCampoInvalido,
  normalizarEspacos,
  validarCadastro,
} from '../../utils/validacoes'
import CampoFormulario from './CampoFormulario'

const formularioInicial = {
  nome: '',
  ra: '',
  email: '',
  curso: '',
  senha: '',
}

export default function MonitorSignupForm() {
  const navigate = useNavigate()
  const formRef = useRef(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }))

    // O erro do campo some assim que a pessoa volta a editá-lo.
    setErros((errosAtuais) =>
      Object.fromEntries(
        Object.entries(errosAtuais).filter(([campo]) => campo !== name)
      )
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setErro(null)

    const errosEncontrados = validarCadastro(formulario, cursosFatecZonaLeste)

    setErros(errosEncontrados)

    if (Object.keys(errosEncontrados).length > 0) {
      focarPrimeiroCampoInvalido(formRef.current)
      return
    }

    setEnviando(true)

    const { senha, ...resto } = formulario

    const dadosMonitor = {
      ...resto,
      nome: normalizarEspacos(resto.nome),
      email: resto.email.trim(),
      ra: resto.ra.trim(),
    }

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

    // Entra automaticamente com a conta recém-criada.
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
    <form
      ref={formRef}
      className="grid gap-4.25"
      onSubmit={handleSubmit}
      noValidate
    >
      <CampoFormulario label="Nome completo" erro={erros.nome}>
        <input
          className={classeCampo(erros.nome)}
          type="text"
          name="nome"
          value={formulario.nome}
          onChange={handleChange}
          aria-invalid={Boolean(erros.nome)}
          autoComplete="name"
          placeholder="Como podemos te chamar?"
        />
      </CampoFormulario>

      <CampoFormulario label="E-mail institucional" erro={erros.email}>
        <input
          className={classeCampo(erros.email)}
          type="email"
          name="email"
          value={formulario.email}
          onChange={handleChange}
          aria-invalid={Boolean(erros.email)}
          autoComplete="email"
          placeholder="voce@fatec.sp.gov.br"
        />
      </CampoFormulario>

      <CampoFormulario label="RA" erro={erros.ra}>
        <input
          className={classeCampo(erros.ra)}
          type="text"
          name="ra"
          value={formulario.ra}
          onChange={handleChange}
          aria-invalid={Boolean(erros.ra)}
          inputMode="numeric"
          placeholder="Seu registro acadêmico"
        />
      </CampoFormulario>

      <CampoFormulario label="Curso" erro={erros.curso}>
        <select
          className={classeCampo(erros.curso)}
          name="curso"
          value={formulario.curso}
          onChange={handleChange}
          aria-invalid={Boolean(erros.curso)}
        >
          <option value="">Selecione seu curso</option>

          {cursosFatecZonaLeste.map((curso) => (
            <option key={curso} value={curso}>
              {curso}
            </option>
          ))}
        </select>
      </CampoFormulario>

      <CampoFormulario label="Senha" erro={erros.senha}>
        <input
          className={classeCampo(erros.senha)}
          type="password"
          name="senha"
          value={formulario.senha}
          onChange={handleChange}
          aria-invalid={Boolean(erros.senha)}
          autoComplete="new-password"
          placeholder={`Mínimo de ${TAMANHO_MINIMO_SENHA} caracteres`}
        />
      </CampoFormulario>

      <button
        className="flex items-center justify-between rounded-[9px] border-0 bg-[#0d3524] px-4.25 py-3.75 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#315c50] disabled:cursor-wait disabled:opacity-60"
        type="submit"
        disabled={enviando}
      >
        {enviando ? 'Enviando...' : 'Continuar'}

        <span aria-hidden="true">→</span>
      </button>

      {Object.keys(erros).length > 0 && (
        <p className="m-0 text-xs text-[#a34d46]" role="alert">
          Corrija os campos destacados em vermelho antes de continuar.
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