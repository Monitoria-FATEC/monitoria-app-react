import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { redefinirSenha } from '../../api/monitorApi'
import { validarSenha } from '../../utils/validacoes'

import loginImage from '../../assets/img/cadastro/login.png'

const campoClassName =
  'w-full rounded-[9px] border border-[#d7e0d6] bg-[#fbfcfa] px-3.5 py-3 text-[13px] text-[#243d38] outline-none placeholder:text-[#a2ada5] focus:border-[#769c8d] focus:ring-4 focus:ring-[#769c8d]/15'

export default function RedefinirSenha() {
  const location = useLocation()
  const navigate = useNavigate()
  const { email, codigo } = location.state ?? {}

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [concluido, setConcluido] = useState(false)

  if (!email || !codigo) {
    return <Navigate to="/esqueci-senha" replace />
  }

  const senhasDiferentes =
    confirmarSenha.length > 0 && novaSenha !== confirmarSenha

  async function handleSubmit(event) {
    event.preventDefault()

    const erroSenha = validarSenha(novaSenha)

    if (erroSenha) {
      setErro(erroSenha)
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setEnviando(true)
    setErro(null)

    try {
      await redefinirSenha({ email, codigo, novaSenha })

      setConcluido(true)
    } catch (requestError) {
      if (requestError.response) {
        setErro(
          'Não foi possível redefinir sua senha. O código pode ter expirado — peça um novo código.'
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

  if (concluido) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f6ef] px-6">
        <div className="w-full max-w-107.5 rounded-2xl border border-[#e1e7df] bg-white p-8 text-center shadow-[0_18px_46px_rgba(39,70,59,.08)]">
          <span
            className="mx-auto mb-5 flex h-15 w-15 items-center justify-center rounded-full bg-[#eaf3e9] text-3xl text-[#315c50]"
            aria-hidden="true"
          >
            ✓
          </span>

          <h1 className="m-0 mb-2 font-serif text-2xl font-normal text-[#243d38]">
            Senha redefinida com sucesso!
          </h1>

          <p className="m-0 text-sm leading-relaxed text-[#68766e]">
            Já pode entrar na sua conta usando a nova senha.
          </p>

          <button
            className="mt-6 inline-flex items-center justify-center gap-2.5 rounded-full border-0 bg-[#315c50] px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5"
            type="button"
            onClick={() => navigate('/entrar', { replace: true })}
          >
            Ir para o login
          </button>
        </div>
      </main>
    )
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
                NOVA SENHA
              </p>

              <h1 className="m-0 font-serif text-[clamp(2rem,3.2vw,2.75rem)] font-normal leading-[1.08] tracking-[-1.2px] text-[#243d38]">
                Crie uma nova senha
              </h1>

              <p className="mt-3 max-w-107.5 text-sm leading-relaxed text-[#68766e]">
                Escolha uma senha que você ainda não tenha usado neste site.
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
                Nova senha
              </span>

              <input
                className={campoClassName}
                type="password"
                name="novaSenha"
                value={novaSenha}
                onChange={(event) => {
                  setErro(null)
                  setNovaSenha(event.target.value)
                }}
                required
                autoFocus
                autoComplete="new-password"
                placeholder="Mínimo de 6 caracteres, com letras e números"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-[#39544c]">
                Confirmar nova senha
              </span>

              <input
                className={campoClassName}
                type="password"
                name="confirmarSenha"
                value={confirmarSenha}
                onChange={(event) => {
                  setErro(null)
                  setConfirmarSenha(event.target.value)
                }}
                required
                autoComplete="new-password"
                placeholder="Digite a senha novamente"
              />

              {senhasDiferentes && (
                <span className="text-[11px] text-[#a34d46]">
                  As senhas não coincidem.
                </span>
              )}
            </label>

            <button
              className="flex items-center justify-between rounded-[9px] border-0 bg-[#0d3524] px-4.25 py-3.75 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-[#315c50] disabled:cursor-wait disabled:opacity-60"
              type="submit"
              disabled={enviando}
            >
              {enviando ? 'Salvando...' : 'Redefinir senha'}

              <span aria-hidden="true">→</span>
            </button>

            {erro && (
              <p className="m-0 text-xs text-[#a34d46]" role="alert">
                {erro}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  )
}