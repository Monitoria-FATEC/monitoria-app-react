import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { solicitarRecuperacaoSenha } from '../../api/monitorApi'

import loginImage from '../../assets/img/cadastro/login.png'

const campoClassName =
  'w-full rounded-[9px] border border-[#d7e0d6] bg-[#fbfcfa] px-3.5 py-3 text-[13px] text-[#243d38] outline-none placeholder:text-[#a2ada5] focus:border-[#769c8d] focus:ring-4 focus:ring-[#769c8d]/15'

export default function EsqueciSenha() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  function handleChange(event) {
    setErro(null)
    setEmail(event.target.value)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setEnviando(true)
    setErro(null)

    try {
      await solicitarRecuperacaoSenha({ email })

      navigate('/esqueci-senha/verificar', { state: { email } })
    } catch (requestError) {
      if (requestError.response) {
        setErro(
          'Não foi possível enviar o código. Confira o e-mail e tente novamente.'
        )
      } else {
        setErro(
          'Não foi possível conectar ao servidor. Tente novamente em instantes.'
        )
      }

      console.error(requestError)
    } finally {
      setEnviando(false)
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
            to="/entrar"
          >
            <span aria-hidden="true">←</span>
            Voltar para o login
          </Link>

          <div className="mb-8 flex items-start justify-between gap-5">
            <div>
              <p className="mb-3 text-[11px] font-extrabold tracking-[.16em] text-[#769c8d]">
                ESQUECEU A SENHA?
              </p>

              <h1 className="m-0 font-serif text-[clamp(2rem,3.2vw,2.75rem)] font-normal leading-[1.08] tracking-[-1.2px] text-[#243d38]">
                Vamos recuperar seu acesso
              </h1>

              <p className="mt-3 max-w-107.5 text-sm leading-relaxed text-[#68766e]">
                Informe o e-mail institucional usado no cadastro. Vamos
                enviar um código de verificação para você criar uma nova
                senha.
              </p>
            </div>

            <span
              className="mt-1 hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf4ed] text-2xl text-[#315c50] sm:flex"
              aria-hidden="true"
            >
              ✦
            </span>
          </div>

          <form className="grid gap-4.25" onSubmit={handleSubmit}>
            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-[#39544c]">
                E-mail institucional
              </span>

              <input
                className={campoClassName}
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                required
                autoFocus
                autoComplete="email"
                placeholder="voce@fatec.sp.gov.br"
              />
            </label>

            <button
              className="flex items-center justify-between rounded-[9px] border-0 bg-[#0d3524] px-4.25 py-3.75 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#315c50] disabled:cursor-wait disabled:opacity-60"
              type="submit"
              disabled={enviando}
            >
              {enviando ? 'Enviando...' : 'Enviar código'}

              <span aria-hidden="true">→</span>
            </button>

            {erro && (
              <p className="m-0 text-xs text-[#a34d46]" role="alert">
                {erro}
              </p>
            )}
          </form>

          <div className="mt-8 border-t border-[#d6ded5] pt-6 text-center text-sm text-[#68766e]">
            Lembrou sua senha?{' '}
            <Link
              className="font-medium text-[#315c50] underline decoration-[#315c50]/40 underline-offset-4 hover:decoration-[#315c50]"
              to="/entrar"
            >
              Entrar
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}