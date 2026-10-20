import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import {
  cadastrarMonitor,
  confirmarEmail,
  reenviarCodigoEmail,
} from '../../api/monitorApi'
import {
  limparCadastroPendente,
  lerCadastroPendente,
  rotaInicialPorPerfil,
  salvarSessao,
} from '../../services/authStorage'
import { mensagemDoErro } from '../../utils/errosApi'

import loginImage from '../../assets/img/cadastro/login.png'

const TAMANHO_CODIGO = 6
const TEMPO_REENVIO_SEGUNDOS = 60

function mascararEmail(email) {
  const [usuario, dominio] = email.split('@')

  if (!dominio) return email

  const visiveis = usuario.slice(0, 2)

  return `${visiveis}${'•'.repeat(Math.max(usuario.length - 2, 1))}@${dominio}`
}

export default function VerificarEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email
  const reenviarAoEntrar = location.state?.reenviarAoEntrar

  const [digitos, setDigitos] = useState(Array(TAMANHO_CODIGO).fill(''))
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [reenviando, setReenviando] = useState(false)
  const [cooldown, setCooldown] = useState(TEMPO_REENVIO_SEGUNDOS)
  const [jaConfirmado, setJaConfirmado] = useState(false)
  const [usuarioConfirmado, setUsuarioConfirmado] = useState(null)

  const inputsRef = useRef([])
  const reenvioAutomaticoFeito = useRef(false)

  useEffect(() => {
    if (cooldown <= 0) return undefined

    const intervalo = setInterval(() => {
      setCooldown((atual) => atual - 1)
    }, 1000)

    return () => clearInterval(intervalo)
  }, [cooldown])

  // Quem veio do login (e-mail ainda não confirmado) ganha um código novo ao chegar.
  useEffect(() => {
    if (!email || !reenviarAoEntrar || reenvioAutomaticoFeito.current) return

    reenvioAutomaticoFeito.current = true

    reenviarCodigoEmail({ email }).catch((requestError) => {
      console.error(requestError)
    })
  }, [email, reenviarAoEntrar])

  if (!email) {
    return <Navigate to="/entrar" replace />
  }

  function handleChangeDigito(indice, valor) {
    const apenasNumero = valor.replace(/\D/g, '')

    setErro(null)

    setDigitos((digitosAtuais) => {
      const novosDigitos = [...digitosAtuais]
      novosDigitos[indice] = apenasNumero.slice(-1)
      return novosDigitos
    })

    if (apenasNumero && indice < TAMANHO_CODIGO - 1) {
      inputsRef.current[indice + 1]?.focus()
    }
  }

  function handleKeyDown(indice, event) {
    if (event.key === 'Backspace' && !digitos[indice] && indice > 0) {
      inputsRef.current[indice - 1]?.focus()
    }
  }

  function handlePaste(event) {
    const colado = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, TAMANHO_CODIGO)

    if (!colado) return

    event.preventDefault()
    setErro(null)
    setDigitos((digitosAtuais) =>
      Array.from(
        { length: TAMANHO_CODIGO },
        (_, indice) => colado[indice] ?? digitosAtuais[indice]
      )
    )

    inputsRef.current[Math.min(colado.length, TAMANHO_CODIGO - 1)]?.focus()
  }

  // Com o e-mail confirmado e a sessão aberta, cria o cadastro do monitor
  // com os dados guardados no formulário e segue para o termo.
  async function concluirCadastro(usuario) {
    const pendente = lerCadastroPendente(email)

    // Sem dados guardados (veio pelo login): vai direto para a área do usuário.
    if (!pendente) {
      navigate(rotaInicialPorPerfil(usuario?.role), { replace: true })
      return
    }

    try {
      const monitor = await cadastrarMonitor(pendente)

      limparCadastroPendente()

      navigate('/cadastro/termo', {
        replace: true,
        state: { ...pendente, idMonitor: monitor?.id },
      })
    } catch (requestError) {
      setErro(
        mensagemDoErro(
          requestError,
          'Seu e-mail foi confirmado, mas não foi possível concluir o cadastro. Tente novamente.'
        )
      )

      console.error(requestError)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const codigo = digitos.join('')

    if (codigo.length !== TAMANHO_CODIGO) {
      setErro('Preencha todos os dígitos do código.')
      return
    }

    setEnviando(true)
    setErro(null)

    let resposta

    try {
      resposta = await confirmarEmail({ email, codigo })
    } catch (requestError) {
      const status = requestError.response?.status

      if (status === 409) {
        setErro('Este e-mail já foi confirmado. Entre com seu e-mail e senha.')
      } else if (requestError.response) {
        setErro('Código inválido ou expirado. Confira e tente novamente.')
      } else {
        setErro(
          'Não foi possível conectar ao servidor. Tente novamente em instantes.'
        )
      }

      console.error(requestError)
      setEnviando(false)
      return
    }

    salvarSessao({ token: resposta.token, usuario: resposta.usuario })
    setJaConfirmado(true)
    setUsuarioConfirmado(resposta.usuario)

    await concluirCadastro(resposta.usuario)
    setEnviando(false)
  }

  async function handleTentarNovamente() {
    setEnviando(true)
    setErro(null)

    await concluirCadastro(usuarioConfirmado)
    setEnviando(false)
  }

  async function handleReenviar() {
    setReenviando(true)
    setErro(null)

    try {
      await reenviarCodigoEmail({ email })

      setCooldown(TEMPO_REENVIO_SEGUNDOS)
      setDigitos(Array(TAMANHO_CODIGO).fill(''))
      inputsRef.current[0]?.focus()
    } catch (requestError) {
      if (requestError.response) {
        setErro('Não foi possível reenviar o código. Tente novamente.')
      } else {
        setErro(
          'Não foi possível conectar ao servidor. Tente novamente em instantes.'
        )
      }

      console.error(requestError)
    } finally {
      setReenviando(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#243d38] lg:grid lg:grid-cols-2">
      <div className="relative hidden min-h-65 overflow-hidden lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={loginImage}
          alt="Mesa de estudos ilustrada com notebook, livros e materiais acadêmicos"
        />
      </div>

      <section className="flex min-h-screen flex-col px-6 py-8 sm:px-12 sm:py-10 lg:px-[clamp(3rem,8vw,7.5rem)] lg:py-12 xl:px-[clamp(5rem,10vw,9rem)]">
        <div className="mx-auto flex w-full max-w-140 flex-1 flex-col justify-center">
          <Link
            className="mb-10 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#68766e] no-underline transition hover:text-[#0d3524]"
            to="/cadastro"
          >
            <span aria-hidden="true">←</span>
            Voltar ao cadastro
          </Link>

          <div className="mb-8 flex items-start justify-between gap-5">
            <div>
              <p className="mb-3 text-[11px] font-extrabold tracking-[.16em] text-[#769c8d]">
                CONFIRMAÇÃO DE E-MAIL
              </p>

              <h1 className="m-0 font-serif text-[clamp(2rem,3.2vw,2.75rem)] font-normal leading-[1.08] tracking-[-1.2px] text-[#243d38]">
                {jaConfirmado ? 'E-mail confirmado!' : 'Confirme seu e-mail'}
              </h1>

              <p className="mt-3 max-w-107.5 text-sm leading-relaxed text-[#68766e]">
                {jaConfirmado ? (
                  'Falta só concluir o seu cadastro.'
                ) : (
                  <>
                    Enviamos um código de {TAMANHO_CODIGO} dígitos para{' '}
                    <strong className="text-[#243d38]">
                      {mascararEmail(email)}
                    </strong>
                    . Ele é válido por alguns minutos.
                  </>
                )}
              </p>
            </div>

            <span
              className="mt-1 hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf4ed] text-2xl text-[#315c50] sm:flex"
              aria-hidden="true"
            >
              ✦
            </span>
          </div>

          {jaConfirmado ? (
            <div className="grid gap-4.25">
              <button
                className="flex items-center justify-between rounded-[9px] border-0 bg-[#0d3524] px-4.25 py-3.75 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#315c50] disabled:cursor-wait disabled:opacity-60"
                type="button"
                onClick={handleTentarNovamente}
                disabled={enviando}
              >
                {enviando ? 'Concluindo...' : 'Tentar novamente'}

                <span aria-hidden="true">→</span>
              </button>

              {erro && (
                <p className="m-0 text-xs text-[#a34d46]" role="alert">
                  {erro}
                </p>
              )}
            </div>
          ) : (
            <>
              <form className="grid gap-4.25" onSubmit={handleSubmit}>
                <div
                  className="flex justify-between gap-2"
                  onPaste={handlePaste}
                >
                  {digitos.map((digito, indice) => (
                    <input
                      key={indice}
                      ref={(elemento) => {
                        inputsRef.current[indice] = elemento
                      }}
                      className="h-13 w-full max-w-11.5 rounded-[9px] border border-[#d7e0d6] bg-[#fbfcfa] text-center text-lg font-bold text-[#243d38] outline-none focus:border-[#769c8d] focus:ring-4 focus:ring-[#769c8d]/15"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digito}
                      onChange={(event) =>
                        handleChangeDigito(indice, event.target.value)
                      }
                      onKeyDown={(event) => handleKeyDown(indice, event)}
                      autoFocus={indice === 0}
                      aria-label={`Dígito ${indice + 1} do código`}
                    />
                  ))}
                </div>

                <button
                  className="flex items-center justify-between rounded-[9px] border-0 bg-[#0d3524] px-4.25 py-3.75 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#315c50] disabled:cursor-wait disabled:opacity-60"
                  type="submit"
                  disabled={enviando}
                >
                  {enviando ? 'Confirmando...' : 'Confirmar e-mail'}

                  <span aria-hidden="true">→</span>
                </button>

                {erro && (
                  <p className="m-0 text-xs text-[#a34d46]" role="alert">
                    {erro}
                  </p>
                )}
              </form>

              <div className="mt-6 text-center text-sm text-[#68766e]">
                {cooldown > 0 ? (
                  <span>
                    Não recebeu? Você pode pedir um novo código em {cooldown}s
                  </span>
                ) : (
                  <button
                    className="font-medium text-[#315c50] underline decoration-[#315c50]/40 underline-offset-4 hover:decoration-[#315c50] disabled:cursor-wait disabled:opacity-60"
                    type="button"
                    onClick={handleReenviar}
                    disabled={reenviando}
                  >
                    {reenviando ? 'Reenviando...' : 'Reenviar código'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}