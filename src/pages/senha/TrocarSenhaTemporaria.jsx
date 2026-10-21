import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { trocarSenhaTemporaria } from '../../api/contaApi'
import {
  lerSessaoValida,
  limparSessao,
  rotaInicialPorPerfil,
  salvarSessao,
} from '../../services/authStorage'
import { mensagemDoErro } from '../../utils/errosApi'
import { validarSenha } from '../../utils/validacoes'

const inputClassName =
  'w-full rounded-[9px] border bg-[#fbfcfa] px-3.5 py-3 text-[13px] text-[#243d38] outline-none placeholder:text-[#a2ada5] focus:ring-4'

function Campo({ id, label, valor, onChange, erro, visivel, autoFocus }) {
  return (
    <label className="grid gap-1.5" htmlFor={id}>
      <span className="text-xs font-bold text-[#39544c]">{label}</span>
      <input
        id={id}
        type={visivel ? 'text' : 'password'}
        value={valor}
        onChange={onChange}
        autoFocus={autoFocus}
        autoComplete="new-password"
        aria-invalid={Boolean(erro)}
        className={`${inputClassName} ${
          erro
            ? 'border-[#a34d46] focus:border-[#a34d46] focus:ring-[#a34d46]/15'
            : 'border-[#d7e0d6] focus:border-[#769c8d] focus:ring-[#769c8d]/15'
        }`}
      />
      {erro && (
        <span className="text-[11px] text-[#a34d46]" role="alert">
          {erro}
        </span>
      )}
    </label>
  )
}

// Primeiro acesso com a senha temporária que o supervisor entregou:
// o usuário cria a própria senha antes de usar o sistema.
export default function TrocarSenhaTemporaria() {
  const navigate = useNavigate()
  const sessao = lerSessaoValida()

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [visivel, setVisivel] = useState(false)
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (!sessao?.token) {
    return <Navigate to="/entrar" replace />
  }

  // quem não tem senha temporária não precisa estar aqui
  if (!sessao.usuario?.senhaTemporaria) {
    return <Navigate to={rotaInicialPorPerfil(sessao.usuario?.role)} replace />
  }

  const primeiroNome = sessao.usuario?.nome?.trim().split(' ')[0]

  function sair() {
    limparSessao()
    navigate('/entrar', { replace: true })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErroGeral(null)

    const encontrados = {
      novaSenha: validarSenha(novaSenha),
      confirmacao: !confirmacao
        ? 'Repita a nova senha.'
        : confirmacao !== novaSenha
          ? 'As senhas não são iguais.'
          : '',
    }
    const comErro = Object.fromEntries(Object.entries(encontrados).filter(([, mensagem]) => mensagem))
    setErros(comErro)
    if (Object.keys(comErro).length > 0) return

    setEnviando(true)

    try {
      const usuarioAtualizado = await trocarSenhaTemporaria(novaSenha)

      // guarda o usuário já sem a marca de senha temporária e segue para o painel
      salvarSessao({
        token: sessao.token,
        usuario: { ...sessao.usuario, ...usuarioAtualizado, senhaTemporaria: false },
      })

      navigate(rotaInicialPorPerfil(sessao.usuario?.role), { replace: true })
    } catch (requestError) {
      console.error(requestError)
      setErroGeral(mensagemDoErro(requestError, 'Não foi possível salvar a nova senha. Tente novamente.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f6ef] px-6 py-10 text-[#243d38]">
      <div className="w-full max-w-md rounded-2xl border border-[#e1e7df] bg-white p-7 shadow-[0_18px_46px_rgba(39,70,59,.08)] sm:p-9">
        <p className="mb-3 text-[11px] font-extrabold tracking-[.16em] text-[#769c8d]">PRIMEIRO ACESSO</p>

        <h1 className="m-0 font-serif text-[clamp(1.7rem,3vw,2.2rem)] font-normal leading-[1.1] tracking-[-1px]">
          {primeiroNome ? `Bem-vindo(a), ${primeiroNome}!` : 'Bem-vindo(a)!'}
        </h1>

        <p className="mb-6 mt-3 text-sm leading-relaxed text-[#68766e]">
          Você entrou com uma senha temporária. Crie agora a sua própria senha para continuar.
        </p>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <Campo
            id="nova-senha"
            label="Nova senha"
            valor={novaSenha}
            onChange={(event) => {
              setNovaSenha(event.target.value)
              setErros((anteriores) => ({ ...anteriores, novaSenha: undefined }))
            }}
            erro={erros.novaSenha}
            visivel={visivel}
            autoFocus
          />

          <Campo
            id="confirmar-senha"
            label="Repita a nova senha"
            valor={confirmacao}
            onChange={(event) => {
              setConfirmacao(event.target.value)
              setErros((anteriores) => ({ ...anteriores, confirmacao: undefined }))
            }}
            erro={erros.confirmacao}
            visivel={visivel}
          />

          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#68766e]">
            <input type="checkbox" checked={visivel} onChange={(event) => setVisivel(event.target.checked)} />
            Mostrar senhas
          </label>

          <p className="m-0 text-[11px] text-[#88958d]">
            Use de 6 a 72 caracteres, com pelo menos uma letra e um número, sem espaços.
          </p>

          {erroGeral && (
            <p className="m-0 rounded-lg bg-[#fce8e5] p-3 text-xs text-[#a34d46]" role="alert">
              {erroGeral}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="cursor-pointer rounded-full border-0 bg-[#315c50] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#24483d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? 'Salvando...' : 'Salvar nova senha e continuar'}
          </button>
        </form>

        <button
          type="button"
          onClick={sair}
          className="mt-5 cursor-pointer border-0 bg-transparent p-0 text-xs font-medium text-[#68766e] underline underline-offset-4"
        >
          Sair e entrar depois
        </button>
      </div>
    </main>
  )
}